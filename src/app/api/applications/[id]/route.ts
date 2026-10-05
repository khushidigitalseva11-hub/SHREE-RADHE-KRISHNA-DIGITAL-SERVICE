import { NextResponse } from 'next/server';
import { dbGetApplicationById } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const app = await dbGetApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json(app);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
