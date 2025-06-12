
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationEmailRequest {
  employeeName: string;
  employeeEmail: string;
  verificationCode: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { employeeName, employeeEmail, verificationCode, companyName }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${employeeEmail} for ${employeeName}`);

    const emailResponse = await resend.emails.send({
      from: "Certificados Laborales <onboarding@resend.dev>",
      to: [employeeEmail],
      subject: `Código de verificación - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Código de Verificación</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code { background: #22c55e; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fef3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Código de Verificación</h1>
              <h2>${companyName}</h2>
            </div>
            <div class="content">
              <p>Hola <strong>${employeeName}</strong>,</p>
              
              <p>Has solicitado generar un certificado laboral. Para verificar tu identidad, usa el siguiente código:</p>
              
              <div class="code">${verificationCode}</div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este código expira en 10 minutos</li>
                  <li>Solo úsalo si solicitaste un certificado laboral</li>
                  <li>No compartas este código con nadie</li>
                </ul>
              </div>
              
              <p>Si no solicitaste este código, puedes ignorar este email.</p>
              
              <p>Saludos,<br>
              <strong>Equipo de Recursos Humanos</strong><br>
              ${companyName}</p>
            </div>
            <div class="footer">
              <p>Este es un email automático, por favor no respondas.</p>
              <p>📞 Contáctanos: coordinador.nomina@mvitales.com | +57 3213556969</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Email enviado exitosamente' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Error al enviar el email' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
