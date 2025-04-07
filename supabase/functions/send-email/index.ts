import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Resend with API key from environment variables
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(resendApiKey);

interface EmailRequest {
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

serve(async (req) => {
  console.log(`Received ${req.method} request to send-email function`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Parsing request body");
    const requestData = await req.json();
    const { to, subject, name, qrCodeValue, templateType, eventName, eventDate, voucherName, voucherDescription } = requestData as EmailRequest;
    
    // Log email request parameters (omitting sensitive data)
    console.log(`Email request: templateType=${templateType}, to=${to.substring(0, 3)}...`);
    
    if (!to || !subject || !templateType) {
      console.error("Missing required fields in email request");
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, and templateType are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let htmlContent = "";

    // Generate appropriate email template based on templateType
    console.log(`Generating ${templateType} email template`);
    switch (templateType) {
      case "registration":
        htmlContent = generateRegistrationEmail(name || "Attendee", qrCodeValue || "", eventName || "");
        break;
      case "invitation":
        htmlContent = generateInvitationEmail(name || "Attendee", qrCodeValue || "", eventName || "", eventDate || "");
        break;
      case "voucher":
        htmlContent = generateVoucherEmail(name || "Attendee", qrCodeValue || "", voucherName || "", voucherDescription || "", eventName || "");
        break;
      default:
        console.error(`Invalid template type: ${templateType}`);
        return new Response(
          JSON.stringify({ error: "Invalid template type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    console.log("Sending email via Resend API");
    const data = await resend.emails.send({
      from: "Resend Sandbox <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Enhanced error logging
    console.error("Error sending email:", error);
    console.error("Error details:", error instanceof Error ? error.stack : "Unknown error structure");
    
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common Resend API errors
      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (errorMessage.includes("authentication") || errorMessage.includes("401")) {
        errorMessage = "Authentication failed. Please check your Resend API key.";
      } else if (errorMessage.includes("sandbox") || errorMessage.includes("unverified")) {
        errorMessage = "Email sending failed. If using Resend sandbox, make sure your recipient is verified or your domain is configured.";
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Email template generators
function generateRegistrationEmail(name: string, qrCodeValue: string, eventName: string): string {
  // Generate QR code as Data URI if needed
  const qrSection = qrCodeValue ? `
    <div style="text-align: center; margin: 30px 0;">
      <p style="margin-bottom: 15px;">Your event QR code:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}" alt="QR Code" style="max-width: 200px; height: auto;" />
      <p style="margin-top: 10px; font-family: monospace; font-size: 12px; color: #666; word-break: break-all;">${qrCodeValue}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Registration Confirmed!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for registering for <strong>${eventName}</strong>.</p>
        <p>Please present the QR code below at the event entrance for check-in.</p>
        
        ${qrSection}
        
        <p>We're looking forward to seeing you there!</p>
        <p>Best regards,<br>The Event Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function generateInvitationEmail(name: string, qrCodeValue: string, eventName: string, eventDate: string): string {
  const qrSection = qrCodeValue ? `
    <div style="text-align: center; margin: 30px 0;">
      <p style="margin-bottom: 15px;">Your invitation QR code:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}" alt="QR Code" style="max-width: 200px; height: auto;" />
      <p style="margin-top: 10px; font-family: monospace; font-size: 12px; color: #666; word-break: break-all;">${qrCodeValue}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .date { font-weight: bold; color: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>You're Invited!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>You are cordially invited to <strong>${eventName}</strong> on <span class="date">${eventDate}</span>.</p>
        <p>Please present the QR code below at the event entrance for check-in.</p>
        
        ${qrSection}
        
        <p>We're looking forward to seeing you there!</p>
        <p>Best regards,<br>The Event Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

function generateVoucherEmail(name: string, qrCodeValue: string, voucherName: string, voucherDescription: string, eventName: string): string {
  const qrSection = qrCodeValue ? `
    <div style="text-align: center; margin: 30px 0;">
      <p style="margin-bottom: 15px;">Your voucher QR code:</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeValue)}" alt="QR Code" style="max-width: 200px; height: auto;" />
      <p style="margin-top: 10px; font-family: monospace; font-size: 12px; color: #666; word-break: break-all;">${qrCodeValue}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Event Voucher</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .voucher-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Your Voucher is Ready!</h1>
      </div>
      <div class="content">
        <p>Hello ${name},</p>
        <p>Thank you for purchasing a voucher for <strong>${eventName}</strong>.</p>
        
        <div class="voucher-details">
          <h2>${voucherName}</h2>
          <p>${voucherDescription}</p>
        </div>
        
        <p>Please present the QR code below at the event to redeem your voucher:</p>
        
        ${qrSection}
        
        <p>Enjoy the event!</p>
        <p>Best regards,<br>The Event Team</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}
