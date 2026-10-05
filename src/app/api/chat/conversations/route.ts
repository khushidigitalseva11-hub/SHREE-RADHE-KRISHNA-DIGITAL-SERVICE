import { NextResponse } from 'next/server';
import { dbGetConversations } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customer_id = searchParams.get('customer_id') || undefined;

    const conversations = await dbGetConversations(customer_id);
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
