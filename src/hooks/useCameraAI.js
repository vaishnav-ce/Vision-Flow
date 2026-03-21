import { useEffect, useRef, useState } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export function useCameraAI() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('initializing'); // initializing, active, error
  const [metrics, setMetrics] = useState({
    scale: 1,
    isDark: true,
    attention: true,
    fatigue: 0,
    eyeStrain: 'Low',
    userState: 'Adapting'
  });

  const detectorRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  // Performance and logic refs
  const canvasRef = useRef(document.createElement('canvas'));
  const sessionStartRef = useRef(Date.now());
  const focusHistoryRef = useRef([]); // track face presence over time
  const smoothFatigueRef = useRef(0);
  const smoothFocusScoreRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function initializeAI() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        detectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
        });

        // Setup camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" }
        });

        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStatus('active');
            processFrame();
          };
        }
      } catch (err) {
        console.error("Failed to initialize AI or Camera", err);
        setStatus('error');
      }
    }

    const processFrame = () => {
      if (!videoRef.current || !detectorRef.current) return;

      const v = videoRef.current;
      if (v.readyState !== 4) {
        animationRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const now = Date.now();

      // 1. Calculate Brightness (Optimized)
      let avgBrightness = 128; // Default to mid-brightness
      let isDarkEnv = false;
      try {
        const canvas = canvasRef.current;
        canvas.width = 64;
        canvas.height = 48;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(v, 0, 0, 64, 48);

        // Only sample a smaller subset for performance
        const imageData = ctx.getImageData(0, 0, 64, 48).data;
        let sum = 0;
        for (let i = 0; i < imageData.length; i += 16) { // skip pixels for speed
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          sum += Math.max(r, g, b); // simple luminance 
        }
        avgBrightness = sum / (imageData.length / 16);
        // Dark threshold 
        isDarkEnv = avgBrightness < 60; // 0-255 scale
      } catch (e) { /* ignore */ }

      // 2. Face Detection & Distance Logic
      const detections = detectorRef.current.detectForVideo(v, performance.now()).detections;

      let faceDetected = false;
      let newScale = 1;
      let targetFatigueFromDistance = 0;
      let targetFocusFromDistance = 0;

      if (detections && detections.length > 0) {
        faceDetected = true;
        const face = detections[0];
        const fw = face.boundingBox.width;

        const ratio = 150 / fw;
        newScale = Math.min(Math.max(ratio, 0.8), 1.5);

        // Snap to exactly 1 if close
        if (Math.abs(newScale - 1) < 0.15) newScale = 1;

        if (newScale < 0.9) {
          targetFatigueFromDistance = 20; // Too close fatigue penalty
          targetFocusFromDistance = 0; // Poor distance
        } else if (newScale > 1.2) {
          targetFocusFromDistance = 10; // Suboptimal distance
        } else {
          targetFocusFromDistance = 30; // Perfect distance
        }
      }

      // 3. Face Stability Logic
      focusHistoryRef.current.push(faceDetected);
      if (focusHistoryRef.current.length > 15) {
        focusHistoryRef.current.shift();
      }
      const recentFocusCount = focusHistoryRef.current.filter(Boolean).length;

      let faceInstabilityPenalty = 0;
      let targetFocusFromStability = 0;

      if (recentFocusCount > 12) {
        targetFocusFromStability = 50; // Stable
      } else if (recentFocusCount > 5) {
        targetFocusFromStability = 20; // Partially stable
        faceInstabilityPenalty = 10;
      } else {
        targetFocusFromStability = 0; // Not stable
        faceInstabilityPenalty = 15;
      }

      // 4. Compute Unified Fatigue
      const sessionDurationMinutes = (now - sessionStartRef.current) / 60000;
      let timeFatigue = sessionDurationMinutes * 2;
      let lowLightPenalty = isDarkEnv ? 10 : 0;

      let targetFatigue = timeFatigue + targetFatigueFromDistance + lowLightPenalty + faceInstabilityPenalty;
      targetFatigue = Math.max(0, Math.min(100, targetFatigue));

      // Smooth interpolation for fatigue
      smoothFatigueRef.current += (targetFatigue - smoothFatigueRef.current) * 0.05;
      const currentFatigue = smoothFatigueRef.current;

      // 5. Compute Unified Focus Score
      let targetFocusFromFatigue = 0;
      if (currentFatigue < 25) {
        targetFocusFromFatigue = 20; // Low fatigue
      } else if (currentFatigue < 50) {
        targetFocusFromFatigue = 10;
      } else {
        targetFocusFromFatigue = 0;
      }

      let targetFocusScore = targetFocusFromStability + targetFocusFromDistance + targetFocusFromFatigue;

      // Strict Consistency Rules
      if (currentFatigue > 25 && targetFocusScore >= 70) targetFocusScore = 69; // downgrade focus to Adapting if fatigue > 25
      if (newScale < 0.9 && targetFocusScore >= 70) targetFocusScore = 69; // downgrade focus to Adapting if too close
      if (!faceDetected) targetFocusScore = 0;

      targetFocusScore = Math.max(0, Math.min(100, targetFocusScore));

      // Smooth interpolation for focus score (drop faster than it rises)
      const smoothingFactor = !faceDetected ? 0.2 : 0.05;
      smoothFocusScoreRef.current += (targetFocusScore - smoothFocusScoreRef.current) * smoothingFactor;
      const currentFocusScore = smoothFocusScoreRef.current;

      // 6. Map to UI States
      let newUserState = 'Focused';
      if (currentFocusScore < 40) {
        newUserState = 'Distracted';
      } else if (currentFocusScore < 70) {
        newUserState = 'Adapting';
      }

      if (currentFatigue > 75) {
        newUserState = 'Fatigued';
      }

      let eyeStrainLabel = 'Low';
      if (currentFatigue > 70) eyeStrainLabel = 'High';
      else if (currentFatigue > 40) eyeStrainLabel = 'Medium';

      const newAttention = newUserState !== 'Distracted';

      setMetrics(prev => {
        if (
          Math.abs(prev.scale - newScale) < 0.05 &&
          prev.isDark === isDarkEnv &&
          prev.attention === newAttention &&
          Math.abs(prev.fatigue - currentFatigue) < 2 &&
          prev.eyeStrain === eyeStrainLabel &&
          prev.userState === newUserState
        ) {
          return prev;
        }

        return {
          scale: newScale,
          isDark: isDarkEnv,
          attention: newAttention,
          fatigue: currentFatigue,
          eyeStrain: eyeStrainLabel,
          userState: newUserState
        };
      });

      // limit to ~10 fps (100ms delay)
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(processFrame);
      }, 100);
    };

    initializeAI();

    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, []);

  return { videoRef, metrics, status };
}
