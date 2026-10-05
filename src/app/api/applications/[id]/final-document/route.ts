import { NextResponse } from 'next/server';
import { dbUploadFinalDocument } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { file_name, file_url, remark } = await req.json();

    if (!file_name || !file_url) {
      return NextResponse.json({ error: 'file_name and file_url are required' }, { status: 400 });
    }

    const updatedApp = await dbUploadFinalDocument(params.id, file_name, file_url, remark);
    return NextResponse.json(updatedApp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
