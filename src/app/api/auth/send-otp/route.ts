import { NextResponse } from 'next/server';
import { dbGenerateOtp } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, '').slice(-10))) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const result = await dbGenerateOtp(cleanMobile);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
