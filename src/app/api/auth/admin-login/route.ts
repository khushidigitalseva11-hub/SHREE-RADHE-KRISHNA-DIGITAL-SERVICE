import { NextResponse } from 'next/server';
import { dbCreateAuditLog } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Default admin credential checks
    const isAdmin =
      (email === 'khushidigitalseva11@gmail.com' && (password === 'Admin@SRK2026' || password === 'admin123' || password === '8511566026')) ||
      (email === 'admin@srkdigital.online' && password === 'admin123');

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Invalid Admin Email or Password.' },
        { status: 401 }
      );
    }

    await dbCreateAuditLog({
      action: 'Admin Login',
      entity_type: 'admin',
      user_email: email,
      details: { email, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin access granted.',
      admin: {
        email,
        name: 'Director - Shree Radhe Krishna Digital Service',
        role: 'super_admin',
        center: 'Sadhli, Vadodara',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
