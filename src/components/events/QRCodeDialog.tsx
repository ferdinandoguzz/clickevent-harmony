
import React from 'react';
import { Mail, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/vouchers/QRCodeDisplay';

interface Attendee {
  id: string;
  name: string;
  email: string;
  qrCode: string;
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
            <QRCodeDisplay value={attendee.qrCode} size="md" />
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
