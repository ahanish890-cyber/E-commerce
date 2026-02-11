import React, { useRef, useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Product } from '../types';

declare global {
  interface Window {
    tf: any;
    poseDetection: any;
  }
}

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ product, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [productImage, setProductImage] = useState<HTMLImageElement | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const animationFrameRef = useRef<number>();

  // Load TensorFlow in background (non-blocking)
  useEffect(() => {
    const loadAI = async () => {
      try {
        if (!window.tf) {
          const tfScript = document.createElement('script');
          tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
          document.head.appendChild(tfScript);
          await new Promise(resolve => { tfScript.onload = resolve; });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!window.poseDetection) {
          const poseScript = document.createElement('script');
          poseScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.0/dist/pose-detection.min.js';
          document.head.appendChild(poseScript);
          await new Promise(resolve => { poseScript.onload = resolve; });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (window.tf && window.poseDetection) {
          const poseDetector = await window.poseDetection.createDetector(
            window.poseDetection.SupportedModels.MoveNet,
            { modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
          );
          setDetector(poseDetector);
          console.log('✅ AI Pose Detection Active');
        }
      } catch (err) {
        console.warn('AI model failed, using static mode:', err);
      }
    };

    loadAI();
  }, []);

  // Load product image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setProductImage(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => setProductImage(img2);
      img2.onerror = () => setError('Failed to load product image');
      img2.src = product.image;
    };
    img.src = product.image;
  }, [product.image]);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        setError('Camera access denied. Please allow camera access.');
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Rendering loop
  useEffect(() => {
    if (!cameraReady || !videoRef.current || !canvasRef.current || !productImage) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Draw mirrored video
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        let rendered = false;

        // Try AI pose detection if available
        if (detector) {
          try {
            const poses = await detector.estimatePoses(video);
            if (poses?.[0]?.keypoints) {
              const keypoints = poses[0].keypoints;
              const leftShoulder = keypoints.find((kp: any) => kp.name === 'left_shoulder');
              const rightShoulder = keypoints.find((kp: any) => kp.name === 'right_shoulder');

              if (leftShoulder?.score > 0.3 && rightShoulder?.score > 0.3) {
                const leftX = canvas.width - leftShoulder.x;
                const rightX = canvas.width - rightShoulder.x;
                const shoulderWidth = Math.abs(leftX - rightX);
                const shirtWidth = shoulderWidth * 1.45;
                const shirtHeight = (shirtWidth / productImage.width) * productImage.height;
                const centerX = (leftX + rightX) / 2;
                const centerY = (leftShoulder.y + rightShoulder.y) / 2;
                const shirtX = centerX - shirtWidth / 2;
                const shirtY = centerY - 60;
                const angle = Math.atan2(rightShoulder.y - leftShoulder.y, rightX - leftX);

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.translate(-centerX, -centerY);
                ctx.globalAlpha = 0.95;
                ctx.filter = 'drop-shadow(0px 8px 12px rgba(0,0,0,0.3))';
                ctx.drawImage(productImage, shirtX, shirtY, shirtWidth, shirtHeight);
                ctx.restore();
                rendered = true;
              }
            }
          } catch (err) {
            console.error('Pose error:', err);
          }
        }

        // Fallback: static overlay
        if (!rendered) {
          const scale = 0.6;
          const width = canvas.width * scale;
          const height = (width / productImage.width) * productImage.height;
          const x = (canvas.width - width) / 2;
          const y = canvas.height * 0.2;
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.filter = 'drop-shadow(0px 8px 12px rgba(0,0,0,0.3))';
          ctx.drawImage(productImage, x, y, width, height);
          ctx.restore();
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cameraReady, productImage, detector]);

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Setup Required</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button 
            onClick={onClose}
            className="bg-[#febd69] text-black px-8 py-3 rounded-full font-bold hover:bg-[#f3a847]"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="w-full h-full object-contain" />

      {!cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#febd69] mx-auto mb-4"></div>
            <p className="text-xl font-bold">Starting Camera...</p>
          </div>
        </div>
      )}

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 bg-black/50 hover:bg-black p-4 rounded-full text-white backdrop-blur-xl border border-white/20 z-50"
      >
        <X size={24} />
      </button>

      {cameraReady && (
        <div className="absolute top-8 left-8 bg-red-600 px-4 py-2 rounded text-white text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {detector ? 'LIVE TRACKING' : 'LIVE VIEW'}
        </div>
      )}
    </div>
  );
};
