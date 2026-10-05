import { NextResponse } from 'next/server';
import { dbReuploadDocument } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { new_file_name, new_file_path } = await req.json();

    if (!new_file_name) {
      return NextResponse.json({ error: 'new_file_name is required' }, { status: 400 });
    }

    const doc = await dbReuploadDocument(params.id, new_file_name, new_file_path);
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
