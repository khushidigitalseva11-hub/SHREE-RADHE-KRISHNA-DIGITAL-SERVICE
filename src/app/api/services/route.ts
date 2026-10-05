import { NextResponse } from 'next/server';
import { dbGetServices, dbSaveService } from '@/lib/db';

export async function GET() {
  try {
    const services = await dbGetServices();
    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const saved = await dbSaveService(body);
    return NextResponse.json(saved);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
