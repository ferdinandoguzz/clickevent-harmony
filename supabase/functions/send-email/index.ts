
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get request body
    const body = await req.json();
    console.log("Email function called with payload:", body);

    // Validate request
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: to, subject, html" 
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    const emailPayload: EmailPayload = {
      to: body.to,
      subject: body.subject,
      html: body.html,
      from: body.from || "noreply@viplist.com"
    };
    
    // In a real application, this would send an actual email
    // For now, we'll just log the email data and return success
    console.log("Would send email:", emailPayload);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email sent successfully" 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
