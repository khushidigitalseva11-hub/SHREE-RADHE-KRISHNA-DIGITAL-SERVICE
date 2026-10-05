import { NextResponse } from 'next/server';
import { dbReviewDocument } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status, reason } = await req.json();

    if (!['Verified', 'Rejected', 'Re-upload Required'].includes(status)) {
      return NextResponse.json({ error: 'Invalid document review status' }, { status: 400 });
    }

    const doc = await dbReviewDocument(params.id, status, reason);
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
