
import React, { useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { downloadQRCode } from '@/utils/downloadUtils';
import { toast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  foregroundColor?: string;
  showDownload?: boolean;
  downloadFileName?: string;
  showShare?: boolean;
  attendeeId?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 'md',
  backgroundColor = "#FFFFFF",
  foregroundColor = "#000000",
  showDownload = false,
  downloadFileName = 'qrcode',
  showShare = false,
  attendeeId
}) => {
  const qrRef = useRef<SVGSVGElement>(null);
  
  const sizePx = {
    sm: 128,
    md: 192,
    lg: 256,
  };
  
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  // Add a data attribute to help with finding QR codes for specific attendees
  useEffect(() => {
    if (qrRef.current && attendeeId) {
      qrRef.current.setAttribute('data-attendee-id', attendeeId);
    }
  }, [attendeeId]);

  const handleDownload = () => {
    downloadQRCode(qrRef.current, downloadFileName);
    
    toast({
      title: "QR Code downloaded",
      description: "The QR code has been downloaded to your device."
    });
  };
  
  const handleShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert SVG to blob for sharing
      const svgString = new XMLSerializer().serializeToString(qrRef.current!);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const file = new File([blob], `${downloadFileName}.svg`, { type: 'image/svg+xml' });
      
      await navigator.share({
        title: 'QR Code',
        text: 'Here is your QR code',
        files: [file]
      });
      
      toast({
        title: "QR Code shared",
        description: "The QR code has been shared successfully."
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      
      // If sharing with files fails, try without files
      try {
        await navigator.share({
          title: 'QR Code',
          text: `Here is your QR code content: ${value}`
        });
        
        toast({
          title: "QR Code content shared",
          description: "The QR code content has been shared successfully."
        });
      } catch (fallbackError) {
        console.error('Error sharing QR code content:', fallbackError);
        toast({
          title: "Sharing failed",
          description: "Could not share the QR code. Please try downloading instead.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <QRCodeSVG 
            ref={qrRef}
            value={value}
            size={sizePx[size]}
            level="H" // High error correction capability
            includeMargin={true}
            bgColor={backgroundColor}
            fgColor={foregroundColor}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Scan with a QR reader</p>
      <p className="text-xs font-mono overflow-hidden text-ellipsis max-w-[80%] text-center">{value}</p>
      
      <div className="flex gap-2 mt-2">
        {showDownload && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
        
        {showShare && navigator.share && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
};
