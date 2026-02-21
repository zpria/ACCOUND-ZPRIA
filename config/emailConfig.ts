/**
 * Centralized Email Configuration
 * Store all email service configurations in one place for easy management
 */

export const emailConfig = {
  // EmailJS configuration
  emailJS: {
    serviceId: {
      otp: 'service_6dasibh',
      welcome: 'service_d0xcjoj',
    },
    publicKey: 'snLhsAMRJ_FFWBzZf',
    privateKey: 'kD5BU_NNa3tEjq-rJtlgQ',
    templateId: {
      otp: 'template_ituj83r',
      welcome: 'template_m53qmps',
    },
  },

  // API endpoint for sending emails
  apiEndpoint: 'https://api.emailjs.com/api/v1.0/email/send',

  // Site URL for email templates
  siteUrl: 'https://account.zpria.vercel.app',
  
  // Default email settings
  defaults: {
    fromName: 'ZPRIA',
    fromEmail: 'noreply@zpria.com',
    replyTo: 'support@zpria.com',
  },
  
  // Email content defaults
  content: {
    physicalAddress: 'ZPRIA, Dhaka, Bangladesh',
    unsubscribeUrl: 'https://account.zpria.vercel.app/privacy',
  },
};