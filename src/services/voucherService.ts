
import { toast } from '@/hooks/use-toast';
import { PurchasedVoucher } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';

export const getVoucherByQrCode = async (qrCode: string): Promise<PurchasedVoucher | undefined> => {
  try {
    // Use 'from' method to access the purchased_vouchers table
    const { data, error } = await supabase
      .from('purchased_vouchers')
      .select(`
        id,
        event_id,
        attendee_id,
        package_id,
        package_name,
        purchase_date,
        price,
        is_redeemed,
        redemption_time,
        qr_code
      `)
      .eq('qr_code', qrCode)
      .single();
      
    if (error) {
      console.error('Error fetching voucher:', error);
      return undefined;
    }
    
    // Transform database data to match PurchasedVoucher interface
    return {
      id: data.id,
      eventId: data.event_id,
      attendeeId: data.attendee_id,
      packageId: data.package_id,
      packageName: data.package_name,
      purchaseDate: data.purchase_date,
      price: data.price,
      isRedeemed: data.is_redeemed,
      redemptionTime: data.redemption_time,
      qrCode: data.qr_code
    } as PurchasedVoucher;
  } catch (error) {
    console.error('Error in getVoucherByQrCode:', error);
    return undefined;
  }
};

export const getVouchersByEventId = async (eventId: string): Promise<PurchasedVoucher[]> => {
  try {
    const { data, error } = await supabase
      .from('purchased_vouchers')
      .select(`
        id,
        event_id,
        attendee_id,
        package_id,
        package_name,
        purchase_date,
        price,
        is_redeemed,
        redemption_time,
        qr_code
      `)
      .eq('event_id', eventId);
      
    if (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
    
    // Transform database data to match PurchasedVoucher interface
    return data.map(item => ({
      id: item.id,
      eventId: item.event_id,
      attendeeId: item.attendee_id,
      packageId: item.package_id,
      packageName: item.package_name,
      purchaseDate: item.purchase_date,
      price: item.price,
      isRedeemed: item.is_redeemed,
      redemptionTime: item.redemption_time,
      qrCode: item.qr_code
    })) as PurchasedVoucher[];
  } catch (error) {
    console.error('Error in getVouchersByEventId:', error);
    return [];
  }
};

export const redeemVoucher = async (voucherId: string): Promise<PurchasedVoucher> => {
  try {
    // First check if voucher exists and is not already redeemed
    const { data: existingVoucher, error: fetchError } = await supabase
      .from('purchased_vouchers')
      .select('*')
      .eq('id', voucherId)
      .single();
      
    if (fetchError) {
      throw new Error('Voucher not found');
    }
    
    if (existingVoucher.is_redeemed) {
      throw new Error(`Voucher already redeemed on ${new Date(existingVoucher.redemption_time).toLocaleString()}`);
    }
    
    // Update the voucher to mark it as redeemed
    const now = new Date().toISOString();
    const { data: updatedVoucher, error: updateError } = await supabase
      .from('purchased_vouchers')
      .update({
        is_redeemed: true,
        redemption_time: now
      })
      .eq('id', voucherId)
      .select()
      .single();
      
    if (updateError) {
      throw new Error('Failed to redeem voucher');
    }
    
    // Transform database data to match PurchasedVoucher interface
    return {
      id: updatedVoucher.id,
      eventId: updatedVoucher.event_id,
      attendeeId: updatedVoucher.attendee_id,
      packageId: updatedVoucher.package_id,
      packageName: updatedVoucher.package_name,
      purchaseDate: updatedVoucher.purchase_date,
      price: updatedVoucher.price,
      isRedeemed: updatedVoucher.is_redeemed,
      redemptionTime: updatedVoucher.redemption_time,
      qrCode: updatedVoucher.qr_code
    } as PurchasedVoucher;
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    throw error;
  }
};

export const getVoucherWithAttendeeInfo = async (voucherId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchased_vouchers')
      .select(`
        id,
        package_name,
        is_redeemed,
        redemption_time,
        attendees (
          name,
          email
        )
      `)
      .eq('id', voucherId)
      .single();
      
    if (error) {
      console.error('Error fetching voucher with attendee info:', error);
      return null;
    }
    
    return {
      id: data.id,
      packageName: data.package_name,
      isRedeemed: data.is_redeemed,
      redemptionTime: data.redemption_time,
      attendeeName: data.attendees?.name,
      attendeeEmail: data.attendees?.email
    };
  } catch (error) {
    console.error('Error in getVoucherWithAttendeeInfo:', error);
    return null;
  }
};

export const getVoucherStats = async (eventId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchased_vouchers')
      .select('id, is_redeemed')
      .eq('event_id', eventId);
      
    if (error) {
      console.error('Error fetching voucher stats:', error);
      return { total: 0, redeemed: 0, remaining: 0, redemptionRate: 0 };
    }
    
    const total = data.length;
    const redeemed = data.filter(v => v.is_redeemed).length;
    
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

// This function would be used in a real system after testing or for demo purposes
export const resetVouchers = async (eventId: string) => {
  try {
    const { error } = await supabase
      .from('purchased_vouchers')
      .update({
        is_redeemed: false,
        redemption_time: null
      })
      .eq('event_id', eventId);
      
    if (error) {
      console.error('Error resetting vouchers:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in resetVouchers:', error);
    return false;
  }
};
