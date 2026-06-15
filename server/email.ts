/**
 * Email notification service for Sleepless app
 *
 * To activate real sending:
 *   SendGrid  →  EMAIL_PROVIDER=sendgrid   SENDGRID_API_KEY=SG.xxxx
 *   AWS SES   →  EMAIL_PROVIDER=aws-ses    AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...  AWS_REGION=af-south-1
 *
 * Without those vars the service logs emails to console (safe for development).
 */

import { ENV } from "./_core/env.js";

const ADMIN_EMAIL = "admin@sleeplessapp.co.za";
const APP_NAME = "Sleepless";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email service provider type
 */
type EmailProvider = "sendgrid" | "aws-ses" | "console";

function getEmailProvider(): EmailProvider {
  return ENV.emailProvider;
}

async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const apiKey = ENV.sendgridApiKey;

    if (!apiKey) {
      console.error("[Email] SendGrid API key not configured (SENDGRID_API_KEY)");
      return false;
    }

    const sgMail = await import("@sendgrid/mail" as any).catch(() => null);

    if (!sgMail) {
      console.error("[Email] @sendgrid/mail not installed. Run: pnpm add @sendgrid/mail");
      return false;
    }

    sgMail.default.setApiKey(apiKey);
    await sgMail.default.send({
      from: ADMIN_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log("[Email] Sent via SendGrid to:", options.to);
    return true;
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return false;
  }
}

async function sendEmailViaAWSSES(options: EmailOptions): Promise<boolean> {
  try {
    const { awsRegion, awsAccessKeyId, awsSecretAccessKey } = ENV;

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.error("[Email] AWS credentials not configured (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)");
      return false;
    }

    const awsSdk = await import("@aws-sdk/client-ses" as any).catch(() => null);

    if (!awsSdk) {
      console.error("[Email] @aws-sdk/client-ses not installed. Run: pnpm add @aws-sdk/client-ses");
      return false;
    }

    const { SESClient, SendEmailCommand } = awsSdk;
    const client = new SESClient({
      region: awsRegion,
      credentials: { accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey },
    });

    await client.send(new SendEmailCommand({
      Source: ADMIN_EMAIL,
      Destination: { ToAddresses: [options.to] },
      Message: {
        Subject: { Data: options.subject },
        Body: { Html: { Data: options.html } },
      },
    }));

    console.log("[Email] Sent via AWS SES to:", options.to);
    return true;
  } catch (error) {
    console.error("[Email] AWS SES error:", error);
    return false;
  }
}

/**
 * Send email notification
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = getEmailProvider();

  console.log("[Email] Sending email via", provider, "to:", options.to);

  switch (provider) {
    case "sendgrid":
      return await sendEmailViaSendGrid(options);
    case "aws-ses":
      return await sendEmailViaAWSSES(options);
    case "console":
    default:
      // Development mode: just log to console
      console.log("[Email] Console mode - Email details:", {
        from: ADMIN_EMAIL,
        to: options.to,
        subject: options.subject,
        htmlLength: options.html.length,
      });
      return true;
  }
}

/**
 * Send event approval notification to organizer
 */
export async function sendEventApprovalEmail(
  organizerEmail: string,
  eventTitle: string,
  eventId: number
): Promise<boolean> {
  const subject = `✅ Your Event "${eventTitle}" Has Been Approved!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Event Approved!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Great news! Your event <strong>"${eventTitle}"</strong> has been approved and is now live on ${APP_NAME}.</p>
          <p>Users can now discover and book tickets for your event. We'll notify you as bookings come in.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Monitor ticket sales in your organizer dashboard</li>
            <li>Share your event on social media to boost visibility</li>
            <li>Prepare for an amazing event experience!</li>
          </ul>
          <a href="https://sleeplessapp.co.za/events/${eventId}" class="button">View Your Event</a>
        </div>
        <div class="footer">
          <p>© 2026 ${APP_NAME}. All rights reserved.</p>
          <p>Contact us: ${ADMIN_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: organizerEmail, subject, html });
}

/**
 * Send event rejection notification to organizer
 */
export async function sendEventRejectionEmail(
  organizerEmail: string,
  eventTitle: string,
  reason: string
): Promise<boolean> {
  const subject = `❌ Update on Your Event "${eventTitle}"`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Review Update</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Thank you for submitting your event <strong>"${eventTitle}"</strong> to ${APP_NAME}.</p>
          <p>After careful review, we're unable to approve this event at this time.</p>
          <div class="reason-box">
            <strong>Reason:</strong><br>
            ${reason}
          </div>
          <p>If you have questions or would like to resubmit with modifications, please contact us at ${ADMIN_EMAIL}.</p>
          <p>We appreciate your interest in ${APP_NAME} and look forward to working with you in the future.</p>
        </div>
        <div class="footer">
          <p>© 2026 ${APP_NAME}. All rights reserved.</p>
          <p>Contact us: ${ADMIN_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: organizerEmail, subject, html });
}

/**
 * Send booking confirmation to customer
 */
export async function sendBookingConfirmationEmail(
  customerEmail: string,
  eventTitle: string,
  quantity: number,
  totalAmount: number,
  bookingId: number,
  qrCodeData?: string,
  eventDate?: string,
  eventVenue?: string
): Promise<boolean> {
  const subject = `🎫 Booking Confirmed: ${eventTitle}`;
  // Generate QR code image URL using a public QR generator (encodes the validation payload)
  const qrPayload = qrCodeData ?? `SLEEPLESS-BOOKING-${bookingId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPayload)}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed!</p>
          <div class="booking-details">
            <div class="detail-row">
              <span>Booking ID:</span>
              <strong>#${bookingId}</strong>
            </div>
            <div class="detail-row">
              <span>Event:</span>
              <strong>${eventTitle}</strong>
            </div>
            <div class="detail-row">
              <span>Tickets:</span>
              <strong>${quantity}</strong>
            </div>
            <div class="detail-row">
              <span>Total:</span>
              <strong>R${(totalAmount / 100).toFixed(2)}</strong>
            </div>
          </div>
          ${eventDate ? `<div class="detail-row"><span>Date:</span><strong>${eventDate}</strong></div>` : ""}
          ${eventVenue ? `<div class="detail-row"><span>Venue:</span><strong>${eventVenue}</strong></div>` : ""}
          <div style="text-align:center;margin:28px 0;padding:24px;background:white;border-radius:8px;">
            <p style="margin:0 0 12px 0;font-weight:bold;color:#333;">Your Entry Ticket</p>
            <img src="${qrImageUrl}" alt="QR Code Ticket" width="280" height="280" style="display:block;margin:0 auto;border:8px solid #fff;border-radius:8px;" />
            <p style="margin:12px 0 0 0;font-size:12px;color:#999;">Booking #${bookingId}</p>
          </div>
          <p><strong>Important:</strong> Present this QR code at the event entrance for scanning. Each ticket admits ${quantity} ${quantity === 1 ? "person" : "people"}. You can also access it anytime in the ${APP_NAME} app under "My Bookings".</p>
        </div>
        <div class="footer">
          <p>© 2026 ${APP_NAME}. All rights reserved.</p>
          <p>Questions? Contact us: ${ADMIN_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: customerEmail, subject, html });
}

/**
 * Send new booking notification to organizer
 */
export async function sendNewBookingNotificationEmail(
  organizerEmail: string,
  eventTitle: string,
  quantity: number,
  customerName: string
): Promise<boolean> {
  const subject = `🎫 New Booking for "${eventTitle}"`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 New Booking!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Great news! You have a new booking for <strong>${eventTitle}</strong>.</p>
          <div class="highlight">
            <p style="margin: 0; font-size: 18px;"><strong>${customerName}</strong> purchased <strong>${quantity} ticket(s)</strong></p>
          </div>
          <p>View all bookings and manage your event in the organizer dashboard.</p>
          <a href="https://sleeplessapp.co.za/organizer/bookings" class="button">View Bookings</a>
        </div>
        <div class="footer">
          <p>© 2026 ${APP_NAME}. All rights reserved.</p>
          <p>Contact us: ${ADMIN_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: organizerEmail, subject, html });
}
