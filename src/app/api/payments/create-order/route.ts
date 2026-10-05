import { NextResponse } from 'next/server';
import { dbCreatePaymentOrder, dbGetApplicationById, dbUpdateApplicationStatus } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { application_id, customer_id } = await req.json();

    if (!application_id || !customer_id) {
      return NextResponse.json({ error: 'application_id and customer_id are required' }, { status: 400 });
    }

    const app = await dbGetApplicationById(application_id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if application is already paid
    if (app.status === 'Payment Received' || app.status === 'Completed') {
      return NextResponse.json({ error: 'This application is already paid.' }, { status: 400 });
    }

    // If application was in 'Application Received', move it to 'Payment Pending'
    if (app.status === 'Application Received') {
      await dbUpdateApplicationStatus(
        app.id,
        'Payment Pending',
        'System',
        'Payment order initiated for locked price ₹' + app.locked_price
      );
    }

    // Create payment order record with locked price
    const payment = await dbCreatePaymentOrder(app.id, customer_id);

    return NextResponse.json({
      order_id: payment.order_id,
      amount: payment.amount,
      currency: 'INR',
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_srk_digital',
      application_number: app.application_number,
      service_name: app.service_name,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
