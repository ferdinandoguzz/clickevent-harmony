
import React, { useState, useEffect } from 'react';
import { getVouchersByEventId, redeemVoucher, getVoucherWithAttendeeInfo } from '@/services/voucherService';
import { toast } from '@/hooks/use-toast';
import ScannerView from './ScannerView';
import VoucherDetails, { VoucherDetailsSkeleton } from './VoucherDetails';
import EmptyVoucherState from './EmptyVoucherState';

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
  const [isLoading, setIsLoading] = useState(false);
  
  const startScanner = () => {
    setIsScanning(true);
    setIsLoading(true);
    
    // In un'implementazione reale, useremmo una libreria di scansione QR code
    // Per il prototipo, simuliamo la scansione dopo un ritardo
    setTimeout(() => {
      try {
        // Ottieni un voucher casuale per questo evento
        const eventVouchers = getVouchersByEventId(eventId);
        
        if (eventVouchers.length === 0) {
          toast({
            title: "Nessun voucher trovato",
            description: "Non ci sono voucher per questo evento.",
            variant: "destructive"
          });
          setIsScanning(false);
          setIsLoading(false);
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
          setIsLoading(false);
          return;
        }
        
        setScannedVoucher(voucherWithAttendee);
        
        // Feedback di successo
        if (voucherWithAttendee.isRedeemed) {
          toast({
            title: "Voucher già riscattato",
            description: `Questo voucher è stato già riscattato il ${new Date(voucherWithAttendee.redemptionTime!).toLocaleString()}`,
            variant: "default"
          });
        } else {
          toast({
            title: "Voucher trovato",
            description: "Voucher valido trovato. Pronto per il riscatto.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Error during scanning:', error);
        toast({
          title: "Errore durante la scansione",
          description: "Si è verificato un errore durante la scansione. Riprova.",
          variant: "destructive"
        });
      } finally {
        setIsScanning(false);
        setIsLoading(false);
      }
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
  
  // Effetto per ripulire lo stato quando cambia eventId
  useEffect(() => {
    setScannedVoucher(null);
    setIsScanning(false);
    setIsRedeeming(false);
  }, [eventId]);
  
  return (
    <div className="flex flex-col items-center md:flex-row gap-8">
      <ScannerView 
        isScanning={isScanning}
        onStartScan={startScanner}
        onStopScan={stopScanner}
      />
      
      <div className="w-full md:flex-1 flex justify-center">
        {isLoading ? (
          <VoucherDetailsSkeleton />
        ) : scannedVoucher ? (
          <VoucherDetails 
            voucher={scannedVoucher}
            isRedeeming={isRedeeming}
            onRedeem={handleRedeemVoucher}
          />
        ) : (
          <EmptyVoucherState />
        )}
      </div>
    </div>
  );
};

export default VoucherScanner;
