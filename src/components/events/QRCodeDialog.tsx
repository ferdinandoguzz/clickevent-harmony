
import React from 'react';
import { Mail, Download, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/vouchers/QRCodeDisplay';
import { sendInvitationEmail } from '@/utils/emailUtils';
import { toast } from '@/hooks/use-toast';

interface Attendee {
  id: string;
  name: string;
  email: string;
  qrCode: string;
  eventId?: string;
}

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee: Attendee | null;
  onSendInvitation: (attendee: Attendee) => void;
  onDownloadQR: (attendee: Attendee) => void;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  attendee,
  onSendInvitation,
  onDownloadQR
}) => {
  const handleShareQR = async () => {
    if (!attendee) return;
    
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await navigator.share({
        title: 'Attendee QR Code',
        text: `QR Code for ${attendee.name}: ${attendee.qrCode}`
      });
      
      toast({
        title: "QR Code shared",
        description: "The QR code has been shared successfully."
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast({
        title: "Sharing failed",
        description: "Could not share the QR code.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendee QR Code</DialogTitle>
          <DialogDescription>
            {attendee?.name} - {attendee?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          {attendee && (
            <QRCodeDisplay
              value={attendee.qrCode}
              size="md"
              showDownload={false}
              downloadFileName={`attendee-qr-${attendee.id}`}
              attendeeId={attendee.id}
            />
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:flex-1"
            onClick={() => attendee && onSendInvitation(attendee)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email to Attendee
          </Button>
          <Button
            className="sm:flex-1"
            onClick={() => attendee && onDownloadQR(attendee)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              className="sm:flex-1"
              onClick={handleShareQR}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share QR Code
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
