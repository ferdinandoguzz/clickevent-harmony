
import React, { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface QRCodeUploaderProps {
  onDetect: (qrCode: string) => void;
}

const QRCodeUploader: React.FC<QRCodeUploaderProps> = ({ onDetect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Trigger the file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Clear previous errors
    setErrorMessage(null);
    
    // Show the selected image preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Process the image for QR code detection
    processQRCode(file);
  };
  
  // Process the image with goqr.me API
  const processQRCode = async (file: File) => {
    setIsLoading(true);
    
    try {
      // Create a form data object to send the image
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the image to goqr.me API
      const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if a QR code was detected
      if (data && data[0] && data[0].symbol && data[0].symbol[0]) {
        const result = data[0].symbol[0].data;
        
        if (result === null) {
          setErrorMessage('No QR code found in the image');
          toast({
            title: "No QR code detected",
            description: "Please upload an image containing a clear QR code",
            variant: "destructive"
          });
        } else {
          // Successfully detected QR code
          toast({
            title: "QR Code detected",
            description: "Successfully scanned the QR code from the image",
          });
          onDetect(result);
        }
      } else {
        setErrorMessage('No QR code found in the image');
        toast({
          title: "No QR code detected",
          description: "Please upload an image containing a clear QR code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      setErrorMessage('Error processing the image. Please try again.');
      toast({
        title: "Processing error",
        description: "Failed to process the image. Please try another image.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setUploadedImage(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Capture photo using the device camera (mobile-friendly)
  const capturePhoto = () => {
    if (fileInputRef.current) {
      // Set accept and capture attributes for mobile camera
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <Card className="overflow-hidden border-2 border-dashed border-muted">
        <CardContent className="p-6 flex flex-col items-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {/* Image preview or upload UI */}
          {uploadedImage ? (
            <div className="relative w-full">
              <img
                src={uploadedImage}
                alt="QR Code"
                className="w-full aspect-video object-contain rounded-md border border-muted"
              />
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                  <RefreshCcw className="h-10 w-10 text-white animate-spin" />
                </div>
              )}
              
              {errorMessage && (
                <div className="mt-4 text-center text-destructive text-sm">
                  {errorMessage}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-4 w-full"
              >
                Try another image
              </Button>
            </div>
          ) : (
            <div className="w-full text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Upload QR Code Image</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Take a photo or upload an image of a QR code to scan
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                <Button
                  onClick={capturePhoto}
                  variant="default"
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button
                  onClick={handleButtonClick}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground text-center mt-2">
        For best results, ensure the QR code is well-lit and clearly visible in the image.
      </p>
    </div>
  );
};

export default QRCodeUploader;
