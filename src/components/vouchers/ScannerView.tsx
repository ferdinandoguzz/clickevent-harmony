
import React, { useRef } from 'react';
import { Camera, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScannerViewProps {
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
}

const ScannerView: React.FC<ScannerViewProps> = ({ 
  isScanning, 
  onStartScan, 
  onStopScan 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <div className="w-full md:w-auto">
      <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted mb-4">
        {isScanning ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-primary -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-primary translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-primary -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-primary translate-x-1 translate-y-1"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-4">
            <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              {isScanning ? 'Scansione del codice QR del voucher in corso...' : 'Scanner QR code apparirà qui'}
            </p>
          </div>
        )}
      </div>
      
      <Button 
        onClick={isScanning ? onStopScan : onStartScan} 
        className="w-full max-w-md"
      >
        {isScanning ? (
          <>
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            Annulla Scansione
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Inizia Scansione
          </>
        )}
      </Button>
    </div>
  );
};

export default ScannerView;
