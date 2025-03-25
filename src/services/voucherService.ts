
import { toast } from '@/hooks/use-toast';
import { PurchasedVoucher } from '@/types/event';
import { mockPurchasedVouchers, mockAttendees } from '@/data/mockData';

// Simuliamo un DB in memoria
let voucherDatabase = [...mockPurchasedVouchers];

export const getVoucherByQrCode = (qrCode: string): PurchasedVoucher | undefined => {
  return voucherDatabase.find(v => v.qrCode === qrCode);
};

export const getVouchersByEventId = (eventId: string): PurchasedVoucher[] => {
  return voucherDatabase.filter(v => v.eventId === eventId);
};

export const redeemVoucher = (voucherId: string): Promise<PurchasedVoucher> => {
  return new Promise((resolve, reject) => {
    // Simuliamo un ritardo della rete
    setTimeout(() => {
      const voucherIndex = voucherDatabase.findIndex(v => v.id === voucherId);
      
      if (voucherIndex === -1) {
        reject(new Error('Voucher non trovato'));
        return;
      }
      
      const voucher = voucherDatabase[voucherIndex];
      
      if (voucher.isRedeemed) {
        reject(new Error(`Il voucher è già stato riscattato il ${new Date(voucher.redemptionTime!).toLocaleString()}`));
        return;
      }
      
      // Aggiorna il voucher nel nostro DB simulato
      const updatedVoucher = {
        ...voucher,
        isRedeemed: true,
        redemptionTime: new Date().toISOString()
      };
      
      voucherDatabase[voucherIndex] = updatedVoucher;
      
      // Simuliamo la persistenza con un log in console
      console.log('Voucher riscattato e salvato nel database:', updatedVoucher);
      
      resolve(updatedVoucher);
    }, 800); // Simula il ritardo della rete
  });
};

export const getVoucherWithAttendeeInfo = (voucherId: string) => {
  const voucher = voucherDatabase.find(v => v.id === voucherId);
  if (!voucher) return null;
  
  const attendee = mockAttendees.find(a => a.id === voucher.attendeeId);
  if (!attendee) return null;
  
  return {
    id: voucher.id,
    packageName: voucher.packageName,
    isRedeemed: voucher.isRedeemed,
    redemptionTime: voucher.redemptionTime,
    attendeeName: attendee.name,
    attendeeEmail: attendee.email
  };
};
