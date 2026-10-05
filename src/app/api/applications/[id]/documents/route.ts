import { NextResponse } from 'next/server';
import { dbAttachDocument, dbGetApplicationById } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { doc_name, file_name, file_path, file_size, mime_type, uploaded_by } = body;

    const app = await dbGetApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const doc = await dbAttachDocument({
      application_id: app.id,
      doc_name: doc_name || 'Document',
      file_name: file_name || 'file.pdf',
      file_path: file_path || `/uploads/${file_name}`,
      file_size: file_size || 500000,
      mime_type: mime_type || 'application/pdf',
      status: 'Uploaded',
      uploaded_by: uploaded_by || 'Customer',
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
