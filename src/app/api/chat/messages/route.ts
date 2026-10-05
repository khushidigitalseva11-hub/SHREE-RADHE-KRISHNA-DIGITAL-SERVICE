import { NextResponse } from 'next/server';
import { dbGetMessages, dbSendMessage } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversation_id = searchParams.get('conversation_id');

    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    const messages = await dbGetMessages(conversation_id);
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversation_id, sender_id, sender_role, sender_name, message_text, attachment_url } = body;

    if (!conversation_id || !sender_id || !message_text) {
      return NextResponse.json({ error: 'Missing required message parameters' }, { status: 400 });
    }

    const msg = await dbSendMessage(conversation_id, {
      sender_id,
      sender_role: sender_role || 'customer',
      sender_name: sender_name || 'User',
      message_text,
      attachment_url,
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
