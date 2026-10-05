import { NextResponse } from 'next/server';
import { dbGetAuditLogs } from '@/lib/db';

export async function GET() {
  try {
    const logs = await dbGetAuditLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
