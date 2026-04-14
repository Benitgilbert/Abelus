"use server";

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// We initialize a separate server-side supabase client here to ensure 
// we have permission to manage campaigns from the action context
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendNewsletterAction({
  subject,
  content,
  recipientEmails
}: {
  subject: string;
  content: string;
  recipientEmails: string[];
}) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing email credentials in environment variables.');
    }

    // 1. Create a campaign record
    const { data: campaign, error: campError } = await supabase
      .from('newsletter_campaigns')
      .insert([{
        subject,
        content,
        status: 'sent',
        sent_to_count: recipientEmails.length,
        sent_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (campError) throw campError;

    // 2. Send emails
    const results = await Promise.all(
      recipientEmails.map(async (email) => {
        return transporter.sendMail({
          from: process.env.EMAIL_FROM || 'Pastor Bonus <no-reply@pastor-bonus.com>',
          to: email,
          subject: subject,
          html: generateExecutiveTemplate(subject, content),
        });
      })
    );

    return { success: true, campaign };
  } catch (error: any) {
    console.error('Server Action Dispatch Error:', error);
    return { success: false, error: error.message };
  }
}

export async function subscribeAction(email: string) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing.');
    }

    // 1. Check if already subscribed to prevent spamming welcome emails
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return { success: true, message: "Already subscribed." };
    }

    // 2. Insert subscription
    const { error: insError } = await supabase
      .from('newsletter_subscriptions')
      .insert([{ email }]);

    if (insError) throw insError;

    // 3. Send Welcome Email
    const welcomeSubject = "Welcome to the Pastor Bonus Community";
    const welcomeContent = "Welcome to the circle of excellence. We've successfully registered your interest.\n\nAs a valued member, you'll be the first to hear about our newest tech arrivals, high-volume printing services, and exclusive school season specials.";

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Pastor Bonus <no-reply@pastor-bonus.com>',
      to: email,
      subject: welcomeSubject,
      html: generateExecutiveTemplate(welcomeSubject, welcomeContent),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Subscription Action Error:', error);
    return { success: false, error: error.message };
  }
}

function generateExecutiveTemplate(subject: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background-color: #0f172a; padding: 40px 20px; text-align: center; }
          .logo { height: 44px; width: 44px; background-color: #10b981; border-radius: 12px; display: inline-block; line-height: 44px; color: white; font-weight: 900; font-size: 22px; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
          .content { padding: 40px 24px; }
          .subject { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 24px; line-height: 1.2; letter-spacing: -0.02em; }
          .body-text { font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 32px; white-space: pre-wrap; }
          .cta-button { display: block; padding: 18px; background-color: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 14px; text-align: center; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2); }
          .footer { padding: 40px 24px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9; }
          .footer-text { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; font-weight: 800; }
          
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0 !important; margin: 0 !important; border: none !important; }
            .header { padding: 32px 20px !important; }
            .content { padding: 32px 20px !important; }
            .subject { font-size: 24px !important; }
            .body-text { font-size: 15px !important; }
          }
        </style>
      </head>
      <body>
        <center>
          <div class="container" style="border-radius: 24px; margin-top: 40px; margin-bottom: 40px; border: 1px solid #e2e8f0; overflow: hidden; text-align: left;">
            <div class="header">
              <div class="logo">PB</div>
              <p style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; margin: 16px 0 0 0;">Pastor Bonus Co. Ltd</p>
            </div>
            <div class="content">
              <h1 class="subject">${subject}</h1>
              <div style="height: 4px; width: 48px; background-color: #10b981; opacity: 0.3; border-radius: 99px; margin-bottom: 36px;"></div>
              <p class="body-text">${content}</p>
              <a href="https://abelus.vercel.app" class="cta-button">Visit Our Store</a>
            </div>
            <div class="footer">
              <p class="footer-text">Exclusive Updates</p>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0; font-weight: 500;">
                You are receiving this because you subscribed via our digital portal.<br>
                Sent with excellence from Pastor Bonus Oversight Platform.
              </p>
            </div>
          </div>
        </center>
      </body>
    </html>
  `;
}
