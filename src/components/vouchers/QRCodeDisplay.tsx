
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  foregroundColor?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  value, 
  size = 'md',
  backgroundColor = "#FFFFFF",
  foregroundColor = "#000000"
}) => {
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
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className={`${sizeClasses[size]} flex items-center justify-center`}>
          <QRCodeSVG 
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
    </div>
  );
};
