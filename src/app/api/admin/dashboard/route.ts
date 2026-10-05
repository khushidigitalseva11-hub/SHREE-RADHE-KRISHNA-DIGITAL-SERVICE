import { NextResponse } from 'next/server';
import { dbGetApplications, dbGetTickets, dbGetAuditLogs, dbGetServices } from '@/lib/db';
import { APPLICATION_STATUSES } from '@/types/digitalSeva';

export async function GET() {
  try {
    const [apps, tickets, auditLogs, services] = await Promise.all([
      dbGetApplications(),
      dbGetTickets(),
      dbGetAuditLogs(),
      dbGetServices(),
    ]);

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    APPLICATION_STATUSES.forEach((st) => {
      statusCounts[st] = 0;
    });

    let totalRevenue = 0;
    apps.forEach((app) => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      } else {
        statusCounts[app.status] = 1;
      }

      if (['Payment Received', 'Document Checking', 'Processing', 'Completed'].includes(app.status)) {
        totalRevenue += Number(app.locked_price) || 0;
      }
    });

    const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

    // Service-wise breakdown
    const serviceStats: Record<string, { name: string; count: number; revenue: number }> = {};
    apps.forEach((app) => {
      const code = app.service_code || 'OTHER';
      if (!serviceStats[code]) {
        serviceStats[code] = { name: app.service_name, count: 0, revenue: 0 };
      }
      serviceStats[code].count++;
      if (['Payment Received', 'Document Checking', 'Processing', 'Completed'].includes(app.status)) {
        serviceStats[code].revenue += Number(app.locked_price) || 0;
      }
    });

    return NextResponse.json({
      totalApplications: apps.length,
      totalRevenue,
      statusCounts,
      openTicketsCount,
      servicesCount: services.length,
      recentApplications: apps.slice(0, 10),
      recentActivity: auditLogs.slice(0, 15),
      serviceBreakdown: Object.values(serviceStats),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
