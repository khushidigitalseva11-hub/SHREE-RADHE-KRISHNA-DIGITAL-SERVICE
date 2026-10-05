import { NextResponse } from 'next/server';
import { dbGetApplications, dbCreateApplication } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customer_id = searchParams.get('customer_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const apps = await dbGetApplications({ customer_id, status });
    return NextResponse.json(apps);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_id, service_id, applicant_name, applicant_mobile, form_data } = body;

    if (!customer_id || !service_id || !applicant_name || !applicant_mobile) {
      return NextResponse.json(
        { error: 'Missing required application fields' },
        { status: 400 }
      );
    }

    const application = await dbCreateApplication({
      customer_id,
      service_id,
      applicant_name,
      applicant_mobile,
      form_data: form_data || {},
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
