import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Member } from '../members/member.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMemberWelcome(member: Member): Promise<void> {
    if (!member.email) return;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@t20warfitness.com'),
      to: member.email,
      subject: 'Welcome to T20 War Fitness!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Welcome to T20 War Fitness!</h2>
          <p>Dear ${member.name},</p>
          <p>Welcome to T20 War Fitness! We're excited to have you as a member.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Membership Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${member.name}</li>
              <li><strong>Age:</strong> ${member.age}</li>
              <li><strong>Phone:</strong> ${member.phone || 'Not provided'}</li>
              <li><strong>Membership Plan:</strong> ${member.membershipPlan?.name}</li>
              <li><strong>Start Date:</strong> ${new Date(member.startDate).toLocaleDateString()}</li>
              <li><strong>End Date:</strong> ${new Date(member.endDate).toLocaleDateString()}</li>
              <li><strong>Fees Paid:</strong> ₹${member.feesPaid}</li>
              <li><strong>Status:</strong> ${member.status}</li>
            </ul>
          </div>

          <p>We look forward to helping you achieve your fitness goals!</p>
          <p>Best regards,<br>T20 War Fitness Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${member.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error to prevent member creation failure
    }
  }

  async sendPlanChangeNotification(member: Member, fromPlan: string, toPlan: string): Promise<void> {
    if (!member.email) return;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM', 'noreply@t20warfitness.com'),
      to: member.email,
      subject: 'Membership Plan Updated - T20 War Fitness',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Membership Plan Updated</h2>
          <p>Dear ${member.name},</p>
          <p>Your membership plan has been successfully updated.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Plan Change Details:</h3>
            <ul>
              <li><strong>From:</strong> ${fromPlan}</li>
              <li><strong>To:</strong> ${toPlan}</li>
              <li><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <p>Thank you for being a valued member!</p>
          <p>Best regards,<br>T20 War Fitness Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Plan change notification sent to ${member.email}`);
    } catch (error) {
      console.error('Failed to send plan change notification:', error);
    }
  }
}
