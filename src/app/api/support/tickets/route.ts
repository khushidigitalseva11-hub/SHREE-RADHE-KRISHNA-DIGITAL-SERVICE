import { NextResponse } from 'next/server';
import { dbGetTickets, dbCreateTicket, dbUpdateTicketStatus } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customer_id = searchParams.get('customer_id') || undefined;

    const tickets = await dbGetTickets(customer_id);
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_id, customer_name, customer_mobile, application_id, category, subject, message } = body;

    if (!customer_id || !subject || !message) {
      return NextResponse.json({ error: 'Missing required support ticket fields' }, { status: 400 });
    }

    const ticket = await dbCreateTicket({
      customer_id,
      customer_name: customer_name || 'Customer',
      customer_mobile: customer_mobile || '',
      application_id,
      category: category || 'Other',
      subject,
      message,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { ticket_id, status } = await req.json();
    if (!ticket_id || !status) {
      return NextResponse.json({ error: 'ticket_id and status are required' }, { status: 400 });
    }
    const updated = await dbUpdateTicketStatus(ticket_id, status);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
