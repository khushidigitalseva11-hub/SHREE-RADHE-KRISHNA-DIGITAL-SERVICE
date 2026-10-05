import { NextResponse } from 'next/server';
import { dbUpdateApplicationStatus } from '@/lib/db';
import { ApplicationStatus, APPLICATION_STATUSES } from '@/types/digitalSeva';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { new_status, remark, changed_by } = await req.json();

    if (!APPLICATION_STATUSES.includes(new_status as ApplicationStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${APPLICATION_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await dbUpdateApplicationStatus(
      params.id,
      new_status as ApplicationStatus,
      changed_by || 'Admin',
      remark || 'Status updated by administrator'
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
