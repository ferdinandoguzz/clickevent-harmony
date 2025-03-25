
import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className={`${sizeClasses[size]} flex items-center justify-center border-2 border-dashed border-muted p-4`}>
          <QrCode className="w-full h-full text-primary" />
          <span className="sr-only">QR Code: {value}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Scan with QR code reader</p>
      <p className="text-xs font-mono overflow-hidden text-ellipsis max-w-[80%] text-center">{value}</p>
    </div>
  );
};
