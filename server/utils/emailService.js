const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// Send email helper
const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Lost & Found - VIT" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Email Templates
const templates = {
    itemResolved: (userName, itemTitle, itemType) => ({
        subject: `🎉 Success! Your ${itemType} item "${itemTitle}" has been resolved`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Item Resolved!</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        Great news! Your ${itemType} item "<strong>${itemTitle}</strong>" has been successfully resolved.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 0; color: #059669; font-weight: 600;">✅ The item has been marked as reunited with its owner.</p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        Thank you for using Lost & Found at VIT Chennai. Together, we're making our campus a better place!
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        Lost & Found - VIT Chennai Campus
                    </p>
                </div>
            </div>
        `
    }),

    newChatMessage: (userName, senderName, itemTitle, messagePreview) => ({
        subject: `💬 New message about "${itemTitle}"`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">💬 New Message</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        <strong>${senderName}</strong> sent you a message about "<strong>${itemTitle}</strong>":
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <p style="margin: 0; color: #374151; font-style: italic;">"${messagePreview}"</p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        Log in to respond and continue the conversation.
                    </p>
                </div>
            </div>
        `
    }),

    pointsEarned: (userName, points, action) => ({
        subject: `🏆 You earned ${points} points!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🏆 +${points} Points!</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        Congratulations! You earned <strong>${points} points</strong> for ${action}.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; font-size: 48px;">🎉</p>
                        <p style="margin: 10px 0 0 0; color: #374151; font-weight: 600;">Keep up the great work!</p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        Check the leaderboard to see your ranking among other helpful campus members.
                    </p>
                </div>
            </div>
        `
    }),

    claimSubmitted: (ownerName, claimantName, itemTitle, itemType) => ({
        subject: `🔔 New Claim Request for "${itemTitle}"`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🔔 New Claim Request</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${ownerName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        <strong>${claimantName}</strong> has submitted a claim for your ${itemType} item "<strong>${itemTitle}</strong>".
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #ec4899;">
                        <p style="margin: 0; color: #374151;">Please review their claim details and verification answers in the app.</p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        You can approve or reject the claim, or start a chat with the claimant for more details.
                    </p>
                </div>
            </div>
        `
    }),

    watchlistAlert: (userName, itemTitle, keyword) => ({
        subject: `🎯 We found a match for "${keyword}"!`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Match Found!</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        Good news! A new Found Item was just reported that matches your alert for "<strong>${keyword}</strong>".
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 0; color: #374151; font-weight: 600;">Item: ${itemTitle}</p>
                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Log in to view details and claim it if it's yours.</p>
                    </div>
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${process.env.FRONTEND_URL || '#'}/items/${itemTitle}" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 10px;">View Item</a>
                        <a href="${process.env.FRONTEND_URL || '#'}/profile?tab=alerts" style="background-color: #e5e7eb; color: #374151; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Manage My Alerts</a>
                    </div>
                </div>
            </div>
        `
    }),

    adminRemoval: (userName, itemTitle, itemType) => ({
        subject: `📋 Notice: Your ${itemType} report "${itemTitle}" has been removed`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">📋 Report Removed</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px;">
                    <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
                    <p style="font-size: 16px; color: #374151;">
                        We're writing to inform you that your ${itemType} item report "<strong>${itemTitle}</strong>" has been removed by an administrator.
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #374151; font-weight: 600;">📌 Reason for Removal:</p>
                        <p style="margin: 10px 0 0 0; color: #6b7280;">
                            The report was reviewed and removed as it may have been a duplicate entry, already resolved offline, or contained incomplete/inaccurate information.
                        </p>
                    </div>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>Note:</strong> Any points earned from this report have been adjusted accordingly.
                        </p>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                        If you believe this was done in error or have any questions, please contact the website administration.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                        Thank you for your understanding and continued participation in our Lost & Found community!
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        Lost & Found - VIT Chennai Campus
                    </p>
                </div>
            </div>
        `
    })
};

// Export functions
module.exports = {
    sendEmail,
    sendItemResolvedEmail: async (userEmail, userName, itemTitle, itemType) => {
        const template = templates.itemResolved(userName, itemTitle, itemType);
        return sendEmail(userEmail, template.subject, template.html);
    },
    sendNewMessageEmail: async (userEmail, userName, senderName, itemTitle, messagePreview) => {
        const template = templates.newChatMessage(userName, senderName, itemTitle, messagePreview);
        return sendEmail(userEmail, template.subject, template.html);
    },
    sendPointsEmail: async (userEmail, userName, points, action) => {
        const template = templates.pointsEarned(userName, points, action);
        return sendEmail(userEmail, template.subject, template.html);
    },
    sendClaimSubmittedEmail: async (ownerEmail, ownerName, claimantName, itemTitle, itemType) => {
        const template = templates.claimSubmitted(ownerName, claimantName, itemTitle, itemType);
        return sendEmail(ownerEmail, template.subject, template.html);
    },
    sendWatchlistAlertEmail: async (userEmail, userName, itemTitle, keyword) => {
        const template = templates.watchlistAlert(userName, itemTitle, keyword);
        return sendEmail(userEmail, template.subject, template.html);
    },
    sendAdminRemovalEmail: async (userEmail, userName, itemTitle, itemType) => {
        const template = templates.adminRemoval(userName, itemTitle, itemType);
        return sendEmail(userEmail, template.subject, template.html);
    }
};
