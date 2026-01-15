// Edge function to send confirmation email
import { Resend } from 'npm:resend@1.0.0';
import { corsHeaders } from '../_shared/cors.js';

// Initialize Resend with your API key
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      appointment_id, 
      full_name, 
      email, 
      service_type, 
      session_type, 
      preferred_date 
    } = await req.json();

    // Format service type
    const serviceMap = {
      'individual': 'Individual Counseling',
      'couples': 'Couples Therapy',
      'family': 'Family Counseling',
      'anxiety': 'Anxiety & Depression Support',
      'youth': 'Youth & Adolescent Counseling',
      'workplace': 'Workplace Stress & Burnout',
      'notsure': 'General Counseling'
    };

    // Format session type
    const sessionMap = {
      'online': 'Online (Video Call)',
      'inperson': 'In-Person Session',
      'phone': 'Phone Session'
    };

    // Format date
    const formattedDate = new Date(preferred_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Conciliokenya <appointments@conciliokenya.com>',
      to: [email],
      subject: `Appointment Confirmation - ${appointment_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0D7C8C, #4A9B7D); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .details { background: white; border-radius: 10px; padding: 20px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                .detail-row:last-child { border-bottom: none; }
                .label { font-weight: bold; color: #555; }
                .value { color: #333; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .emergency { background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Confirmed</h1>
                    <p>Conciliokenya Counseling Services</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${full_name},</h2>
                    <p>Thank you for booking an appointment with Conciliokenya. Your appointment request has been received and is being processed.</p>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="label">Appointment ID:</span>
                            <span class="value">${appointment_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Service Type:</span>
                            <span class="value">${serviceMap[service_type] || service_type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Session Type:</span>
                            <span class="value">${sessionMap[session_type] || session_type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Preferred Date:</span>
                            <span class="value">${formattedDate}</span>
                        </div>
                    </div>
                    
                    <div class="emergency">
                        <strong><i class="fas fa-exclamation-circle"></i> Important:</strong>
                        <p>This email is for confirmation only. Our team will contact you within 24 hours to finalize your appointment time.</p>
                    </div>
                    
                    <h3>What to Expect Next:</h3>
                    <ol>
                        <li>Our counselor will call you to confirm the exact time</li>
                        <li>You'll receive a calendar invitation</li>
                        <li>Reminder notifications via WhatsApp 24 hours before your session</li>
                    </ol>
                    
                    <p><strong>Need to reschedule?</strong> Reply to this email or WhatsApp us at +254 701 794 838</p>
                </div>
                
                <div class="footer">
                    <p>Conciliokenya Counseling Services<br>
                    Mental Wellness Plaza, Westlands, Nairobi<br>
                    Phone: +254 701 794 838<br>
                    Email: info@conciliokenya.com</p>
                    
                    <p><small>This email is confidential. If you received it by mistake, please delete it.</small></p>
                </div>
            </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent',
        emailId: data.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});