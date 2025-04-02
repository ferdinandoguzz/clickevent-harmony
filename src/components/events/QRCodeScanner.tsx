
import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, QrCodeIcon, RefreshCcw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [scanningStatus, setScanningStatus] = useState<string>('');
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [detectionBox, setDetectionBox] = useState<{visible: boolean, coordinates: any}>({
    visible: false,
    coordinates: null
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  useEffect(() => {
    setIsSecureContext(window.isSecureContext);
    
    return () => {
      stopScanner();
    };
  }, []);
  
  const startScanner = async () => {
    try {
      setIsScanning(true);
      setPermissionError(null);
      setScanningStatus('Starting camera...');
      setLastScannedCode(null);
      setDetectionBox({visible: false, coordinates: null});
      
      if (!isSecureContext) {
        setPermissionError(
          'Camera access requires a secure connection (HTTPS). Your connection appears to be insecure, which may prevent camera access.'
        );
        console.warn("Non-secure context detected: QR scanning may not work");
      }
      
      console.log("Requesting camera access...");
      
      const constraints = {
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // Specifically request a better camera resolution and framerate for QR scanning
          frameRate: { ideal: 30 }
        }
      };
      
      console.log("Camera constraints:", JSON.stringify(constraints));
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        console.log("Setting up video element...");
        
        // Make sure autofocus is enabled for better scanning
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          const capabilities = tracks[0].getCapabilities();
          console.log("Camera capabilities:", JSON.stringify(capabilities));
          
          // Using type assertion to handle focusMode which might not be in standard TypeScript types
          type ExtendedCapabilities = MediaTrackCapabilities & {
            focusMode?: string[];
          };
          
          const extendedCapabilities = capabilities as ExtendedCapabilities;
          
          // Try to set focus mode to continuous-picture if available
          if (extendedCapabilities.focusMode && extendedCapabilities.focusMode.includes('continuous-picture')) {
            try {
              await tracks[0].applyConstraints({ 
                advanced: [{ focusMode: "continuous-picture" } as any]
              });
              console.log("Applied continuous focus mode");
            } catch (e) {
              console.warn("Could not set focus mode:", e);
            }
          }
        }
        
        await videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          throw new Error("Could not play video stream");
        });
        
        setScanningStatus('Looking for QR codes...');
        console.log("Camera started successfully");
        
        // Wait for video to be ready before starting the scanning
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, dimensions:", 
            videoRef.current?.videoWidth, 
            videoRef.current?.videoHeight
          );
          
          // Start scanning frames for QR codes - use shorter interval for more frequent scans
          scanIntervalRef.current = window.setInterval(() => {
            if (!isProcessingFrame) {
              scanQRCode();
            }
          }, 150); // Scan more frequently (150ms instead of 200ms)
        };
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('permission')) {
        setPermissionError('Camera permission was denied. Please enable camera access in your browser settings and try again.');
      } else if (errorMessage.includes('NotFoundError')) {
        setPermissionError('No camera found on your device.');
      } else if (errorMessage.includes('NotAllowedError')) {
        setPermissionError('Camera access was blocked. Please check your browser permissions and allow camera access.');
      } else if (errorMessage.includes('NotReadableError')) {
        setPermissionError('The camera is already in use by another application. Please close other applications using the camera.');
      } else if (errorMessage.includes('OverconstrainedError')) {
        setPermissionError('The requested camera does not exist or is not available.');
      } else if (errorMessage.includes('AbortError')) {
        setPermissionError('Camera access was aborted. Please try again.');
      } else {
        setPermissionError(`Could not access the camera: ${errorMessage}`);
      }
      
      toast({
        title: "Camera access error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };
  
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true }); // Optimize for frequent reads
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    setIsProcessingFrame(true);
    
    try {
      // Set canvas dimensions to match video
      if (video.videoWidth && video.videoHeight) {
        // Only update canvas dimensions if they've changed
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          console.log("Canvas dimensions updated to match video:", canvas.width, "x", canvas.height);
        }
        
        // Clear previous drawings
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data for processing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to find QR codes in the image
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth", // Try both normal and inverted
        });
        
        if (code && code.data) {
          console.log("Found QR code:", code.data);
          
          // Draw QR code detection box
          drawDetectionBox(context, code.location);
          
          // Verify it's a valid QR code with content
          if (code.data.trim().length > 0) {
            // Avoid multiple detections of the same code in a short time
            if (lastScannedCode !== code.data) {
              console.log("New QR Code detected:", code.data);
              
              setLastScannedCode(code.data);
              setScanningStatus('QR code detected!');
              
              // Stop scanning after successful detection
              stopScanner();
              
              // Notify parent component
              onScan(code.data);
              
              toast({
                title: "QR Code detected",
                description: "Successfully scanned a QR code.",
              });
            } else {
              // Even for same code, update the detection box
              setDetectionBox({
                visible: true,
                coordinates: code.location
              });
            }
          } else {
            setScanningStatus('Invalid QR code detected. Please try again.');
          }
        } else {
          // Clear the detection box if no code found
          setDetectionBox({visible: false, coordinates: null});
          // No QR code found in this frame
          setScanningStatus('Scanning for QR code...');
        }
      } else {
        console.warn("Video dimensions not available yet");
      }
    } catch (error) {
      console.error('Error processing video frame:', error);
      setScanningStatus('Error processing video. Please try again.');
    } finally {
      setIsProcessingFrame(false);
    }
  };

  // Function to draw detection box
  const drawDetectionBox = (context: CanvasRenderingContext2D, location: any) => {
    // Save current detection box for rendering
    setDetectionBox({
      visible: true,
      coordinates: location
    });
    
    // Draw directly on the canvas for immediate visual feedback
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineWidth = 6;
    context.strokeStyle = "#00FF00";
    context.stroke();
    
    // Add markers at the corners for better visibility
    const cornerSize = 10;
    context.fillStyle = "#FF3B58";
    context.fillRect(location.topLeftCorner.x - cornerSize/2, location.topLeftCorner.y - cornerSize/2, cornerSize, cornerSize);
    context.fillRect(location.topRightCorner.x - cornerSize/2, location.topRightCorner.y - cornerSize/2, cornerSize, cornerSize);
    context.fillRect(location.bottomLeftCorner.x - cornerSize/2, location.bottomLeftCorner.y - cornerSize/2, cornerSize, cornerSize);
    context.fillRect(location.bottomRightCorner.x - cornerSize/2, location.bottomRightCorner.y - cornerSize/2, cornerSize, cornerSize);
  };
  
  const stopScanner = () => {
    // Clear the scanning interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    setIsScanning(false);
    setIsProcessingFrame(false);
    setScanningStatus('');
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted mb-4">
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline 
              muted
              autoPlay
            />
            <canvas 
              ref={canvasRef} 
              className="absolute top-0 left-0 w-full h-full"
              style={{ opacity: 0.2 }}
            />
            <div className="absolute inset-0 pointer-events-none border-4 border-primary/50 rounded-lg"></div>
            {scanningStatus && (
              <div className="absolute bottom-4 left-0 right-0 text-center bg-black/50 text-white py-1 text-sm">
                {scanningStatus}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
            {permissionError ? (
              <CameraOff className="h-12 w-12 text-destructive mb-2" />
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            )}
            <p className="text-center text-sm text-muted-foreground">
              {isScanning ? 'Scanning QR code...' : 'QR code scanner will appear here'}
            </p>
          </div>
        )}
      </div>
      
      {!isSecureContext && !permissionError && (
        <Alert variant="warning" className="mb-4 max-w-md">
          <AlertTitle>Insecure Connection</AlertTitle>
          <AlertDescription>
            Camera access requires a secure connection (HTTPS). Your connection is not secure, which may prevent camera access.
          </AlertDescription>
        </Alert>
      )}
      
      {permissionError && (
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>{permissionError}</AlertDescription>
        </Alert>
      )}
      
      <div className="max-w-md space-y-2 w-full">
        <Button 
          onClick={isScanning ? stopScanner : startScanner} 
          className="w-full"
          variant={isScanning ? "secondary" : "default"}
        >
          {isScanning ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Stop Scanning
            </>
          ) : (
            <>
              <QrCodeIcon className="mr-2 h-4 w-4" />
              Start Scanning
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Hold the QR code steady in view. For best results, ensure good lighting and avoid glare on the QR code.
        </p>
      </div>
    </div>
  );
};

export default QRScanner;
