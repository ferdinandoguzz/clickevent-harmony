
import { toast } from '@/hooks/use-toast';
import { PurchasedVoucher } from '@/types/event';
import { mockPurchasedVouchers, mockAttendees } from '@/data/mockData';

// Simuliamo un DB in memoria con persistenza in localStorage
let voucherDatabase = (() => {
  try {
    const savedVouchers = localStorage.getItem('vouchers');
    return savedVouchers ? JSON.parse(savedVouchers) : [...mockPurchasedVouchers];
  } catch (error) {
    console.error('Error loading vouchers from localStorage:', error);
    return [...mockPurchasedVouchers];
  }
})();

// Funzione helper per salvare i voucher in localStorage
const persistVouchers = () => {
  try {
    localStorage.setItem('vouchers', JSON.stringify(voucherDatabase));
    return true;
  } catch (error) {
    console.error('Error saving vouchers to localStorage:', error);
    return false;
  }
};

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
      try {
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
        
        // Persistenza in localStorage
        const saved = persistVouchers();
        if (!saved) {
          console.warn('Could not save vouchers to localStorage, but operation will continue');
        }
        
        // Log per debugging
        console.log('Voucher riscattato e salvato:', updatedVoucher);
        
        resolve(updatedVoucher);
      } catch (error) {
        console.error('Errore durante il riscatto del voucher:', error);
        reject(new Error('Si è verificato un errore durante il riscatto del voucher'));
      }
    }, 800); // Simula il ritardo della rete
  });
};

export const getVoucherWithAttendeeInfo = (voucherId: string) => {
  try {
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
  } catch (error) {
    console.error('Error retrieving voucher with attendee info:', error);
    return null;
  }
};

// Nuova funzione per ottenere statistiche sui voucher
export const getVoucherStats = (eventId: string) => {
  try {
    const eventVouchers = voucherDatabase.filter(v => v.eventId === eventId);
    const total = eventVouchers.length;
    const redeemed = eventVouchers.filter(v => v.isRedeemed).length;
    
    return {
      total,
      redeemed,
      remaining: total - redeemed,
      redemptionRate: total > 0 ? (redeemed / total) * 100 : 0
    };
  } catch (error) {
    console.error('Error calculating voucher stats:', error);
    return { total: 0, redeemed: 0, remaining: 0, redemptionRate: 0 };
  }
};

// Funzione per reimpostare i voucher (utile per demo)
export const resetVouchers = () => {
  voucherDatabase = [...mockPurchasedVouchers];
  persistVouchers();
  return true;
};
