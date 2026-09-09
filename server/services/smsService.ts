import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken || accountSid.includes('your_twilio') || authToken.includes('your_twilio')) {
    throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not configured');
  }
  return twilio(accountSid, authToken);
};

export const sendSMS = async (to: string, body: string) => {
  try {
    const client = getTwilioClient();
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      throw new Error('TWILIO_PHONE_NUMBER is not set');
    }

    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log('SMS sent: %s', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending SMS: ', error);
    throw error;
  }
};
