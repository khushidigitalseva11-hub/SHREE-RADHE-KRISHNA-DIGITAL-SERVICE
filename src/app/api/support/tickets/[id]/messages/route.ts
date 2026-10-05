import { NextResponse } from 'next/server';
import { dbAddTicketMessage } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sender_id, sender_role, sender_name, message_text } = await req.json();

    if (!sender_id || !message_text) {
      return NextResponse.json({ error: 'sender_id and message_text are required' }, { status: 400 });
    }

    const msg = await dbAddTicketMessage(params.id, {
      sender_id,
      sender_role: sender_role || 'customer',
      sender_name: sender_name || 'User',
      message_text,
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
