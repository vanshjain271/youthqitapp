/**
 * SMS Service - MVP
 * 
 * Handles OTP delivery via Twilio or MSG91
 * Service-first architecture: all SMS logic here
 */

const axios = require('axios');

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
  }

  /**
   * Generate OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    const length = parseInt(process.env.OTP_LENGTH) || 6;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Send OTP via configured provider
   * @param {string} phone - 10-digit phone number
   * @param {string} otp - OTP to send
   * @returns {Promise<Object>} { success: boolean, messageId?: string, error?: string }
   */
  async sendOTP(phone, otp) {
    const formattedPhone = this._formatPhone(phone);
    const message = `Your YouthQit verification code is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    try {
      if (this.provider === 'twilio') {
        return await this._sendViaTwilio(formattedPhone, message);
      } else if (this.provider === 'msg91') {
        return await this._sendViaMSG91(phone, otp);
      } else {
        // Development fallback - log OTP
        return this._devFallback(phone, otp);
      }
    } catch (error) {
      console.error('SMS Service Error:', error.message);
      
      // In development, don't fail the flow
      if (process.env.NODE_ENV === 'development') {
        return this._devFallback(phone, otp);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send via Twilio
   * @private
   */
  async _sendViaTwilio(phone, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: message
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        }
      }
    );

    return {
      success: true,
      messageId: response.data.sid
    };
  }

  /**
   * Send via MSG91
   * @private
   */
  async _sendViaMSG91(phone, otp) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      throw new Error('MSG91 credentials not configured');
    }

    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp',
      {
        template_id: templateId,
        mobile: `91${phone}`,
        otp: otp
      },
      {
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: response.data.type === 'success',
      messageId: response.data.request_id
    };
  }

  /**
   * Development fallback - logs OTP to console
   * @private
   */
  _devFallback(phone, otp) {
    console.log('========================================');
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    console.log('========================================');
    
    return {
      success: true,
      messageId: 'dev-mode',
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  }

  /**
   * Format phone number to E.164 for Twilio
   * @private
   */
  _formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }
}

module.exports = new SMSService();
