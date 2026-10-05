import { NextResponse } from 'next/server';
import { dbVerifyOtp } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { mobile, otp, name, email, address } = await req.json();
    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: 'Mobile and OTP are required' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const result = await dbVerifyOtp(cleanMobile, otp, {
      full_name: name,
      email,
      address,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
