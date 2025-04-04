
import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string;
  subject: string;
  name?: string;
  qrCodeValue?: string;
  templateType: "registration" | "invitation" | "voucher";
  eventName?: string;
  eventDate?: string;
  voucherName?: string;
  voucherDescription?: string;
}

export const sendEmail = async (params: SendEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params
    });
    
    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message || 'Failed to send email');
    }
    
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Sends a registration confirmation email with QR code
 */
export const sendRegistrationEmail = async (
  email: string, 
  name: string, 
  qrCodeValue: string,
  eventName: string
) => {
  return sendEmail({
    to: email,
    subject: `Registration Confirmation for ${eventName}`,
    name,
    qrCodeValue,
    templateType: "registration",
    eventName
  });
};

/**
 * Sends an invitation email with QR code
 */
export const sendInvitationEmail = async (
  email: string,
  name: string,
  qrCodeValue: string,
  eventName: string,
  eventDate: string
) => {
  return sendEmail({
    to: email,
    subject: `Invitation to ${eventName}`,
    name,
    qrCodeValue,
    templateType: "invitation",
    eventName,
    eventDate
  });
};

/**
 * Sends a voucher email with QR code
 */
export const sendVoucherEmail = async (
  email: string,
  name: string,
  qrCodeValue: string,
  voucherName: string,
  voucherDescription: string,
  eventName: string
) => {
  return sendEmail({
    to: email,
    subject: `Your Voucher for ${eventName}`,
    name,
    qrCodeValue,
    templateType: "voucher",
    eventName,
    voucherName,
    voucherDescription
  });
};
