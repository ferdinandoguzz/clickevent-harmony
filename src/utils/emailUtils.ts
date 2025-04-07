
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

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

/**
 * Sends an email using the Supabase edge function
 * @returns A promise that resolves with the email sending result
 */
export const sendEmail = async (params: SendEmailParams) => {
  try {
    console.log(`Sending ${params.templateType} email to ${params.to}`);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params
    });
    
    if (error) {
      console.error('Error from edge function:', error);
      
      // Show toast error message
      toast({
        title: "Failed to send email",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      throw new Error(error.message || 'Failed to send email');
    }
    
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Determine if it's a network error
    let errorMessage = "Failed to send email. Please try again later.";
    if (error instanceof Error) {
      // Check for specific error messages that might help the user
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes('API key')) {
        errorMessage = "Email service configuration error. Please contact support.";
      } else {
        errorMessage = error.message;
      }
    }
    
    toast({
      title: "Email sending failed",
      description: errorMessage,
      variant: "destructive"
    });
    
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
  try {
    const result = await sendEmail({
      to: email,
      subject: `Registration Confirmation for ${eventName}`,
      name,
      qrCodeValue,
      templateType: "registration",
      eventName
    });
    
    toast({
      title: "Confirmation email sent",
      description: `A confirmation email has been sent to ${email}`,
    });
    
    return result;
  } catch (error) {
    console.error('Registration email failed:', error);
    // Error is already handled in sendEmail
    throw error;
  }
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
  try {
    const result = await sendEmail({
      to: email,
      subject: `Invitation to ${eventName}`,
      name,
      qrCodeValue,
      templateType: "invitation",
      eventName,
      eventDate
    });
    
    toast({
      title: "Invitation email sent",
      description: `An invitation has been sent to ${email}`,
    });
    
    return result;
  } catch (error) {
    console.error('Invitation email failed:', error);
    // Error is already handled in sendEmail
    throw error;
  }
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
  try {
    const result = await sendEmail({
      to: email,
      subject: `Your Voucher for ${eventName}`,
      name,
      qrCodeValue,
      templateType: "voucher",
      eventName,
      voucherName,
      voucherDescription
    });
    
    toast({
      title: "Voucher email sent",
      description: `A voucher email has been sent to ${email}`,
    });
    
    return result;
  } catch (error) {
    console.error('Voucher email failed:', error);
    // Error is already handled in sendEmail
    throw error;
  }
};

/**
 * Function to test the email service with a simple message
 * Useful for verifying the email service is working correctly
 */
export const testEmailService = async (email: string) => {
  try {
    const result = await sendEmail({
      to: email,
      subject: "Email Service Test",
      name: "Test User",
      templateType: "registration",
      eventName: "Test Event"
    });
    
    toast({
      title: "Test email sent",
      description: `A test email has been sent to ${email}`,
    });
    
    return result;
  } catch (error) {
    console.error('Test email failed:', error);
    // Error already handled in sendEmail
    throw error;
  }
};
