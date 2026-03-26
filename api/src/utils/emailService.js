import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@golfcharity.app'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Email Templates
const emailTemplates = {
  welcome: (user) => ({
    subject: 'Welcome to Golf Charity Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome to Golf Charity Platform!</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Your account has been created successfully. Get started by:</p>
        <ul>
          <li>Entering your first golf score</li>
          <li>Selecting a charity to support</li>
          <li>Subscribing to participate in monthly draws</li>
        </ul>
        <p>
          <a href="${FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get Started →
          </a>
        </p>
        <p>Questions? Email us at support@golfcharity.app</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  subscriptionConfirmed: (user, charity, plan) => ({
    subject: 'Subscription Confirmed - Thank You!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Subscription Confirmed!</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Your subscription has been confirmed. Here's your receipt:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Charity:</strong> ${charity.name}</p>
          <p><strong>Plan:</strong> ${plan === 'monthly' ? 'Monthly ($9.99)' : 'Yearly ($99.99 - 20% savings!)'}</p>
          <p><strong>Status:</strong> <span style="color: #10b981;">Active</span></p>
        </div>
        <p>You're now eligible to participate in our monthly draws and compete on leaderboards!</p>
        <p>
          <a href="${FRONTEND_URL}/draws" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View This Month's Draw →
          </a>
        </p>
        <p>Thank you for supporting ${charity.name}! 🎉</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  drawResults: (user, results) => ({
    subject: `Draw Results: You ${results.isWinner ? 'WON!' : 'matched'} numbers!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Monthly Draw Results</h2>
        <p>Hi ${user.fullName || user.email},</p>
        ${results.isWinner ? `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0; font-size: 2rem;">🎉 YOU WON! 🎉</h3>
            <p style="margin: 10px 0; font-size: 1.2rem;">
              <strong>${results.matchCount} Number Matches</strong>
            </p>
            <p style="margin: 5px 0;">Prize: <strong>$${results.prizeAmount.toFixed(2)}</strong></p>
          </div>
        ` : `
          <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
            <p>You matched <strong>${results.matchCount}</strong> numbers in this month's draw!</p>
            <p>Better luck next month. Keep playing! 💪</p>
          </div>
        `}
        <p>Your matched numbers: <strong>${results.yourNumbers.join(', ')}</strong></p>
        <p>Draw numbers were: <strong>${results.drawNumbers.join(', ')}</strong></p>
        <p>
          <a href="${FRONTEND_URL}/draws" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Your Activity →
          </a>
        </p>
        <p>Next draw coming next month. Keep entering scores to increase your chances!</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  scoreWarning: (user) => ({
    subject: 'Enter a Score to Stay Eligible!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Quick Reminder</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>You haven't entered a golf score in the last 30 days. To keep your account active and eligible for draws, enter a score:</p>
        <p>
          <a href="${FRONTEND_URL}/scores" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Enter a Score →
          </a>
        </p>
        <p>The more scores you enter, the better your chances of winning!</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  passwordReset: (user, resetLink) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <p>
          <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password →
          </a>
        </p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  passwordResetConfirm: (user) => ({
    subject: '✅ Your Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Password Changed Successfully</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Your password has been successfully reset. You can now login with your new password.</p>
        <p>
          <a href="${FRONTEND_URL}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Your Account →
          </a>
        </p>
        <p>If you didn't make this change or have concerns, please contact support immediately.</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  subscriptionCanceled: (user) => ({
    subject: 'Your Subscription Has Been Canceled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Subscription Canceled</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Your subscription has been canceled. You will no longer be eligible for monthly draws and leaderboard competitions.</p>
        <p>
          <a href="${FRONTEND_URL}/subscribe" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Resubscribe →
          </a>
        </p>
        <p>We'd love to have you back! Great charities are waiting for your support.</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  paymentFailed: (user, retryDate) => ({
    subject: 'Payment Failed - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Payment Failed</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>We were unable to process your subscription payment. Your subscription status is temporarily suspended.</p>
        <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
          <p><strong>Your subscription will be automatically retried on:</strong> ${retryDate}</p>
        </div>
        <p>
          <a href="${FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Update Payment Method →
          </a>
        </p>
        <p>Questions? Contact support@golfcharity.app</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  winnerApproved: (user, prizeAmount) => ({
    subject: '🎉 Your Prize Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations! 🎉</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Your winning claim has been verified and approved!</p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0;">Your Prize Amount:</p>
          <p style="margin: 10px 0; font-size: 2rem; font-weight: bold;">$${prizeAmount}</p>
        </div>
        <p>Our team will process your payout within 3-5 business days. The funds will be transferred to your account on file.</p>
        <p>Thank you for participating in Golf Charity Platform! Keep playing to increase your chances of winning again.</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  }),

  winnerRejected: (user, reason) => ({
    subject: 'Draw Claim Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">We've Reviewed Your Claim</h2>
        <p>Hi ${user.fullName || user.email},</p>
        <p>Thank you for participating! Unfortunately, your draw claim could not be verified:</p>
        <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>Please review the requirements and try again in the next draw. Keep entering scores to stay eligible!</p>
        <p>
          <a href="${FRONTEND_URL}/draws" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Next Draw →
          </a>
        </p>
        <p>Questions? Email us at support@golfcharity.app</p>
        <p style="color: #999; font-size: 12px;">© 2024 Golf Charity Platform. All rights reserved.</p>
      </div>
    `
  })
}

// Send Email Function
export const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('demo')) {
      console.log(`[EMAIL DEMO] Template: ${templateName}, To: ${to}`)
      return { success: true, demo: true }
    }

    const template = emailTemplates[templateName]
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`)
    }

    const emailContent = template(data)

    const msg = {
      to,
      from: SENDER_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html
    }

    await sgMail.send(msg)
    console.log(`✅ Email sent: ${templateName} → ${to}`)
    return { success: true }
  } catch (error) {
    console.error(`❌ Email error (${templateName}):`, error.message)
    return { success: false, error: error.message }
  }
}

export default sendEmail
