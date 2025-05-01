/**
 * Email service utility (simulated)
 * In a production environment, this would integrate with a real email service
 * like SendGrid, Mailgun, Amazon SES, etc.
 */

/**
 * Send a password reset email
 * @param {string} email - Recipient email
 * @param {string} resetLink - Password reset link
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordResetEmail = async (email, resetLink) => {
    try {
        // In a real implementation, this would send an actual email
        console.log(`Simulating password reset email to ${email}`);
        console.log(`Reset link: ${resetLink}`);

        // Log reset link for testing purposes
        console.log('------------------------');
        console.log('PASSWORD RESET EMAIL:');
        console.log(`To: ${email}`);
        console.log(`Subject: Reset Your HealthConnect Password`);
        console.log(`Body: Click the link below to reset your password:`);
        console.log(resetLink);
        console.log(`This link will expire in 1 hour.`);
        console.log('------------------------');

        // Simulate successful sending
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
};

/**
 * Send a password change confirmation email
 * @param {string} email - Recipient email
 * @returns {Promise<boolean>} Success status
 */
export const sendPasswordChangedEmail = async (email) => {
    try {
        // In a real implementation, this would send an actual email
        console.log(`Simulating password changed confirmation email to ${email}`);

        // Log email content for testing purposes
        console.log('------------------------');
        console.log('PASSWORD CHANGED EMAIL:');
        console.log(`To: ${email}`);
        console.log(`Subject: Your HealthConnect Password Has Been Changed`);
        console.log(`Body: Your password has been successfully changed.`);
        console.log(`If you did not request this change, please contact support immediately.`);
        console.log('------------------------');

        // Simulate successful sending
        return true;
    } catch (error) {
        console.error('Error sending password changed email:', error);
        return false;
    }
}; 