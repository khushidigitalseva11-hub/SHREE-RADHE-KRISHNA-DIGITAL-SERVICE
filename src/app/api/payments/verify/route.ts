import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbVerifyPayment } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { order_id, payment_id, signature } = await req.json();

    if (!order_id || !payment_id) {
      return NextResponse.json({ error: 'order_id and payment_id are required' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live secret key is present, verify HMAC-SHA256 signature
    if (keySecret && signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(order_id + '|' + payment_id)
        .digest('hex');

      if (generatedSignature !== signature) {
        return NextResponse.json(
          { success: false, message: 'Invalid payment signature. Verification failed.' },
          { status: 400 }
        );
      }
    }

    // Verify and update status to Payment Received in the database
    const payment = await dbVerifyPayment(order_id, payment_id, signature);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Application moved to Payment Received.',
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
