
/**
 * Utility for downloading files including QR codes
 */

/**
 * Downloads a QR code as a PNG image
 * @param svgElement The SVG element to download
 * @param fileName The name for the downloaded file
 */
export const downloadQRCode = (svgElement: SVGSVGElement | null, fileName: string = 'qrcode'): void => {
  if (!svgElement) {
    console.error('SVG element is null, cannot download QR code');
    return;
  }

  // Create a canvas element to draw the SVG
  const canvas = document.createElement('canvas');
  const svgRect = svgElement.getBoundingClientRect();
  canvas.width = svgRect.width;
  canvas.height = svgRect.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Could not create canvas context');
    return;
  }
  
  // Convert SVG to XML string
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  
  // Create an image to draw to canvas
  const img = new Image();
  img.onload = () => {
    // Draw the image to the canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Could not create blob from canvas');
        return;
      }
      
      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${fileName}.png`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 100);
    }, 'image/png');
  };
  
  img.src = url;
};
