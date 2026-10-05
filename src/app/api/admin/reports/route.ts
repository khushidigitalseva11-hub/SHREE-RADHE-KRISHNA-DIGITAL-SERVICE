import { NextResponse } from 'next/server';
import { dbGetApplications, dbGetTickets } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'applications';
    const format = searchParams.get('format') || 'json';

    if (type === 'applications') {
      const apps = await dbGetApplications();

      if (format === 'csv') {
        const header = 'Application Number,Service,Applicant Name,Mobile,Locked Price,Status,Submitted At\n';
        const rows = apps
          .map(
            (a) =>
              `"${a.application_number}","${a.service_name}","${a.applicant_name}","${a.applicant_mobile}",${a.locked_price},"${a.status}","${a.submitted_at}"`
          )
          .join('\n');

        return new Response(header + rows, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="srk_applications_report.csv"',
          },
        });
      }

      return NextResponse.json(apps);
    }

    if (type === 'support') {
      const tickets = await dbGetTickets();
      if (format === 'csv') {
        const header = 'Ticket Number,Customer Name,Mobile,Category,Subject,Status,Created At\n';
        const rows = tickets
          .map(
            (t) =>
              `"${t.ticket_number}","${t.customer_name}","${t.customer_mobile}","${t.category}","${t.subject}","${t.status}","${t.created_at}"`
          )
          .join('\n');

        return new Response(header + rows, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="srk_support_report.csv"',
          },
        });
      }
      return NextResponse.json(tickets);
    }

    return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
