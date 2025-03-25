
import React, { useState, useRef } from 'react';
import { Camera, RefreshCcw, Check, X, Coffee, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getVouchersByEventId, redeemVoucher, getVoucherWithAttendeeInfo } from '@/services/voucherService';

interface VoucherScannerProps {
  eventId: string;
  onVoucherRedeemed?: (voucherId: string) => void;
}

interface VoucherWithAttendee {
  id: string;
  packageName: string;
  isRedeemed: boolean;
  redemptionTime: string | null;
  attendeeName: string;
  attendeeEmail: string;
}

const VoucherScanner: React.FC<VoucherScannerProps> = ({ eventId, onVoucherRedeemed }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedVoucher, setScannedVoucher] = useState<VoucherWithAttendee | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const startScanner = () => {
    setIsScanning(true);
    // In un'implementazione reale, useremmo una libreria di scansione QR code
    // Per il prototipo, simuliamo la scansione dopo un ritardo
    setTimeout(() => {
      // Ottieni un voucher casuale per questo evento
      const eventVouchers = getVouchersByEventId(eventId);
      
      if (eventVouchers.length === 0) {
        toast({
          title: "Nessun voucher trovato",
          description: "Non ci sono voucher per questo evento.",
          variant: "destructive"
        });
        setIsScanning(false);
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * eventVouchers.length);
      const voucher = eventVouchers[randomIndex];
      
      // Otteniamo le informazioni complete (voucher + partecipante)
      const voucherWithAttendee = getVoucherWithAttendeeInfo(voucher.id);
      
      if (!voucherWithAttendee) {
        toast({
          title: "Errore",
          description: "Impossibile trovare le informazioni del partecipante.",
          variant: "destructive"
        });
        setIsScanning(false);
        return;
      }
      
      setScannedVoucher(voucherWithAttendee);
      setIsScanning(false);
    }, 1500);
  };
  
  const stopScanner = () => {
    setIsScanning(false);
  };
  
  const handleRedeemVoucher = () => {
    if (!scannedVoucher) return;
    
    setIsRedeeming(true);
    
    redeemVoucher(scannedVoucher.id)
      .then((updatedVoucher) => {
        // Aggiorna il voucher scansionato con le nuove informazioni
        if (scannedVoucher) {
          setScannedVoucher({
            ...scannedVoucher,
            isRedeemed: true,
            redemptionTime: updatedVoucher.redemptionTime
          });
        }
        
        toast({
          title: "Voucher riscattato",
          description: "Il voucher è stato riscattato con successo e invalidato nel sistema."
        });
        
        if (onVoucherRedeemed) {
          onVoucherRedeemed(scannedVoucher.id);
        }
      })
      .catch((error) => {
        toast({
          title: "Errore nel riscatto del voucher",
          description: error.message,
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsRedeeming(false);
      });
  };
  
  return (
    <div className="flex flex-col items-center md:flex-row gap-8">
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
          onClick={isScanning ? stopScanner : startScanner} 
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
      
      <div className="w-full md:flex-1 flex justify-center">
        {scannedVoucher ? (
          <Card className="animate-in w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dettagli Voucher</CardTitle>
                <Badge variant={scannedVoucher.isRedeemed ? "default" : "outline"}>
                  {scannedVoucher.isRedeemed ? 'Riscattato' : 'Non Riscattato'}
                </Badge>
              </div>
              <CardDescription>{scannedVoucher.packageName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium mb-1">Partecipante</div>
                  <div className="font-medium">{scannedVoucher.attendeeName}</div>
                  <div className="text-sm text-muted-foreground">{scannedVoucher.attendeeEmail}</div>
                </div>
                
                {scannedVoucher.isRedeemed && scannedVoucher.redemptionTime && (
                  <div className="p-3 bg-muted rounded-md">
                    <div className="text-sm font-medium mb-1">Orario di Riscatto</div>
                    <div className="font-medium">
                      {new Date(scannedVoucher.redemptionTime).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleRedeemVoucher} 
                className="w-full" 
                variant={scannedVoucher.isRedeemed ? "secondary" : "default"}
                disabled={scannedVoucher.isRedeemed || isRedeeming}
              >
                {isRedeeming ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Riscatto in corso...
                  </>
                ) : scannedVoucher.isRedeemed ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Già Riscattato
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Riscatta Voucher
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {Math.random() > 0.5 ? (
                <Coffee className="h-6 w-6 text-primary" />
              ) : (
                <Pizza className="h-6 w-6 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-medium mb-1">Nessun Voucher Scansionato</h3>
            <p className="text-center text-muted-foreground mb-4">
              Scansiona un codice QR del voucher per validarlo e riscattarlo.
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Ogni voucher può essere riscattato una sola volta. Dopo il riscatto, il codice QR sarà invalidato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherScanner;
