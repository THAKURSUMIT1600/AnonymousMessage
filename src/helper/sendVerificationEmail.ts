import { resend } from '@/lib/resend';
import VerificationEmail from '../../emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Verification Code',
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    if (error) {
      return { success: false, message: 'Unable to Send Mail' };
    }
    return { success: true, message: 'Verification Email Send Successfully' };
  } catch (error) {
    console.error('Error Sending Message', error);
    return { success: false, message: 'Failed to Send Verification Email' };
  }
}
