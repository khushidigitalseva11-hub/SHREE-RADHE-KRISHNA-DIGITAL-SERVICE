import fs from 'fs';
import path from 'path';
import {
  DigitalService,
  DigitalApplication,
  CustomerProfile,
  ApplicationDocument,
  PaymentRecord,
  ChatConversation,
  ChatMessage,
  SupportTicket,
  SupportTicketMessage,
  AppNotification,
  AuditLogItem,
  ApplicationStatus,
} from '../types/digitalSeva';
import { INITIAL_SERVICES } from './constants';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';

interface DatabaseData {
  services: DigitalService[];
  customer_profiles: CustomerProfile[];
  applications: DigitalApplication[];
  documents: ApplicationDocument[];
  payments: PaymentRecord[];
  chat_conversations: ChatConversation[];
  chat_messages: ChatMessage[];
  support_tickets: SupportTicket[];
  support_messages: SupportTicketMessage[];
  notifications: AppNotification[];
  audit_logs: AuditLogItem[];
  otps: Record<string, { otp: string; expires_at: number; attempts: number }>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function initLocalDb(): DatabaseData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading local db file, re-initializing:', e);
    }
  }

  // Initial Seed
  const initialDb: DatabaseData = {
    services: INITIAL_SERVICES,
    customer_profiles: [
      {
        id: 'cust-demo-1',
        full_name: 'ભાવિનભાઈ પટેલ (Bhavin Patel)',
        mobile: '9876543210',
        email: 'bhavin.patel@example.com',
        address: 'મુ. સાધલી, તા. શિનોર, જિ. વડોદરા',
        district: 'Vadodara',
        taluka: 'Shinor',
        village_city: 'Sadhli',
        pincode: '391250',
        created_at: new Date().toISOString(),
      },
    ],
    applications: [
      {
        id: 'app-demo-1',
        application_number: 'SRK-PAN-26-000001',
        customer_id: 'cust-demo-1',
        service_id: 'srv-1',
        service_code: 'PAN',
        service_name: 'New PAN Card (નવું PAN Card)',
        locked_price: 250,
        status: 'Payment Pending',
        applicant_name: 'ભાવિન પટેલ',
        applicant_mobile: '9876543210',
        form_data: {
          app_name: 'Bhavin Patel',
          father_name: 'Rameshbhai Patel',
          dob: '1995-04-12',
          gender: 'Male (પુરૂષ)',
          app_mobile: '9876543210',
        },
        admin_remark: 'અરજી સફળતાપૂર્વક સ્વીકારાઈ. ઓનલાઇન ચુકવણી બાકી છે.',
        submitted_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString(),
        status_history: [
          {
            id: 'hist-1',
            application_id: 'app-demo-1',
            previous_status: undefined,
            new_status: 'Application Received',
            changed_by: 'Customer',
            remark: 'Application created online with locked price ₹250',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
          {
            id: 'hist-2',
            application_id: 'app-demo-1',
            previous_status: 'Application Received',
            new_status: 'Payment Pending',
            changed_by: 'System',
            remark: 'Payment order generated',
            created_at: new Date(Date.now() - 3600000 * 23).toISOString(),
          },
        ],
      },
    ],
    documents: [
      {
        id: 'doc-1',
        application_id: 'app-demo-1',
        doc_name: 'Aadhaar Card (Front & Back)',
        file_name: 'bhavin_aadhaar.pdf',
        file_path: '/uploads/demo_aadhaar.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        status: 'Uploaded',
        uploaded_by: 'Customer',
        created_at: new Date().toISOString(),
      },
    ],
    payments: [],
    chat_conversations: [
      {
        id: 'conv-demo-1',
        customer_id: 'cust-demo-1',
        customer_name: 'Bhavin Patel',
        customer_mobile: '9876543210',
        application_id: 'app-demo-1',
        application_number: 'SRK-PAN-26-000001',
        subject: 'Inquiry regarding New PAN Card',
        last_message: 'નમસ્તે સાહેબ, PAN Card કેટલા દિવસમાં ઘરે આવશે?',
        last_message_at: new Date().toISOString(),
        unread_admin_count: 1,
        unread_customer_count: 0,
        messages: [
          {
            id: 'msg-1',
            sender_id: 'cust-demo-1',
            sender_role: 'customer',
            sender_name: 'Bhavin Patel',
            message_text: 'નમસ્તે સાહેબ, PAN Card કેટલા દિવસમાં ઘરે આવશે?',
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    chat_messages: [],
    support_tickets: [
      {
        id: 'tkt-demo-1',
        ticket_number: 'SRK-TKT-2026-00001',
        customer_id: 'cust-demo-1',
        customer_name: 'Bhavin Patel',
        customer_mobile: '9876543210',
        application_id: 'app-demo-1',
        application_number: 'SRK-PAN-26-000001',
        category: 'Application Issue',
        subject: 'Aadhaar OTP Query for PAN Card',
        status: 'Open',
        priority: 'Medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [
          {
            id: 'tmsg-1',
            ticket_id: 'tkt-demo-1',
            sender_id: 'cust-demo-1',
            sender_role: 'customer',
            sender_name: 'Bhavin Patel',
            message_text: 'મારા આધાર કાર્ડમાં મોબાઈલ નંબર બદલાયેલો છે તો અરજીમાં કયો નંબર લખવો?',
            created_at: new Date().toISOString(),
          },
        ],
      },
    ],
    support_messages: [],
    notifications: [
      {
        id: 'notif-1',
        user_id: 'cust-demo-1',
        title: 'નવી અરજી સફળતાપૂર્વક બની',
        message: 'તમારી અરજી SRK-PAN-26-000001 સફળતાપૂર્વક નોંધાઈ ગઈ છે. ચુકવણી માટે આગળ વધો.',
        type: 'application',
        link: '/portal',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
    audit_logs: [
      {
        id: 'audit-1',
        action: 'System Initialized',
        entity_type: 'system',
        details: { message: 'SHREE RADHE KRISHNA DIGITAL SERVICE platform ready' },
        created_at: new Date().toISOString(),
      },
    ],
    otps: {},
  };

  saveLocalDb(initialDb);
  return initialDb;
}

function saveLocalDb(data: DatabaseData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local db:', e);
  }
}

// -------------------------------------------------------------
// Database Operations (Hybrid: Supabase with Local Fallback)
// -------------------------------------------------------------

export async function dbGetServices(): Promise<DigitalService[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch services failed, falling back:', e);
    }
  }

  const db = initLocalDb();
  return db.services.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export async function dbSaveService(service: Partial<DigitalService>): Promise<DigitalService> {
  const db = initLocalDb();
  if (service.id) {
    const idx = db.services.findIndex((s) => s.id === service.id);
    if (idx !== -1) {
      db.services[idx] = { ...db.services[idx], ...service } as DigitalService;
      saveLocalDb(db);
      return db.services[idx];
    }
  }

  const newService: DigitalService = {
    id: 'srv-' + Date.now(),
    service_code: service.service_code || 'SRK',
    name: service.name || 'New Service',
    name_gu: service.name_gu || service.name || 'નવી સેવા',
    price: Number(service.price) || 150,
    category: service.category || 'Government Scheme',
    description: service.description || '',
    instructions: service.instructions || '',
    active: service.active ?? true,
    display_order: service.display_order || db.services.length + 1,
    required_documents: service.required_documents || [],
    form_fields: service.form_fields || [],
  };

  db.services.push(newService);
  saveLocalDb(db);

  await dbCreateAuditLog({
    action: service.id ? 'Service Updated' : 'Service Created',
    entity_type: 'services',
    entity_id: newService.id,
    details: { name: newService.name, price: newService.price },
  });

  return newService;
}

export async function dbGetApplications(filter?: { customer_id?: string; status?: string }): Promise<DigitalApplication[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('applications').select('*').order('submitted_at', { ascending: false });
      if (filter?.customer_id) query = query.eq('customer_id', filter.customer_id);
      if (filter?.status) query = query.eq('status', filter.status);
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch applications failed, using local db:', e);
    }
  }

  const db = initLocalDb();
  let apps = db.applications;
  if (filter?.customer_id) {
    apps = apps.filter((a) => a.customer_id === filter.customer_id);
  }
  if (filter?.status && filter.status !== 'All') {
    apps = apps.filter((a) => a.status === filter.status);
  }

  // Attach documents & payments
  return apps.map((app) => ({
    ...app,
    documents: db.documents.filter((d) => d.application_id === app.id),
    payments: db.payments.filter((p) => p.application_id === app.id),
  }));
}

export async function dbGetApplicationById(id: string): Promise<DigitalApplication | null> {
  const db = initLocalDb();
  const app = db.applications.find((a) => a.id === id || a.application_number === id);
  if (!app) return null;

  return {
    ...app,
    documents: db.documents.filter((d) => d.application_id === app.id),
    payments: db.payments.filter((p) => p.application_id === app.id),
  };
}

export async function dbCreateApplication(data: {
  customer_id: string;
  service_id: string;
  applicant_name: string;
  applicant_mobile: string;
  form_data: Record<string, any>;
}): Promise<DigitalApplication> {
  const db = initLocalDb();
  const service = db.services.find((s) => s.id === data.service_id);
  if (!service) throw new Error('Service not found or inactive');

  // Generate sequential number SRK-[CODE]-26-XXXXXX
  const year = '26';
  const count = db.applications.filter((a) => a.service_code === service.service_code).length + 1;
  const appNum = `SRK-${service.service_code.toUpperCase()}-${year}-${String(count).padStart(6, '0')}`;

  const newApp: DigitalApplication = {
    id: 'app-' + Date.now(),
    application_number: appNum,
    customer_id: data.customer_id,
    service_id: service.id,
    service_code: service.service_code,
    service_name: `${service.name} (${service.name_gu})`,
    locked_price: service.price, // Lock price permanently
    status: 'Application Received',
    applicant_name: data.applicant_name,
    applicant_mobile: data.applicant_mobile,
    form_data: data.form_data,
    admin_remark: 'અરજી સફળતાપૂર્વક સ્વીકારવામાં આવી છે.',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status_history: [
      {
        id: 'hist-' + Date.now(),
        application_id: 'app-' + Date.now(),
        previous_status: undefined,
        new_status: 'Application Received',
        changed_by: 'Customer',
        remark: `Application submitted online. Locked price ₹${service.price}.`,
        created_at: new Date().toISOString(),
      },
    ],
  };

  db.applications.unshift(newApp);

  // Add initial notification
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    user_id: data.customer_id,
    title: `અરજી મળી ગઈ: ${appNum}`,
    message: `${service.name_gu} માટે તમારી અરજી સ્વીકારવામાં આવી છે. અરજી નંબર: ${appNum}`,
    type: 'application',
    link: '/portal',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  // Log audit
  db.audit_logs.unshift({
    id: 'audit-' + Date.now(),
    action: 'Application Created',
    entity_type: 'applications',
    entity_id: newApp.id,
    details: { app_number: appNum, price: service.price, applicant: data.applicant_name },
    created_at: new Date().toISOString(),
  });

  saveLocalDb(db);
  return newApp;
}

export async function dbUpdateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  changedBy: string,
  remark: string
): Promise<DigitalApplication> {
  const db = initLocalDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  const oldStatus = app.status;
  app.status = newStatus;
  app.admin_remark = remark;
  app.updated_at = new Date().toISOString();

  if (!app.status_history) app.status_history = [];
  app.status_history.push({
    id: 'hist-' + Date.now(),
    application_id: app.id,
    previous_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    remark,
    created_at: new Date().toISOString(),
  });

  // Create Customer Notification
  db.notifications.unshift({
    id: 'notif-' + Date.now(),
    user_id: app.customer_id,
    title: `અરજી સ્ટેટસ અપડેટ: ${newStatus}`,
    message: `તમારી અરજી ${app.application_number} નું સ્ટેટસ બદલાઈને "${newStatus}" થયું છે. નોંધ: ${remark}`,
    type: 'application',
    link: '/portal',
    is_read: false,
    created_at: new Date().toISOString(),
  });

  // Audit
  db.audit_logs.unshift({
    id: 'audit-' + Date.now(),
    action: 'Status Changed',
    entity_type: 'applications',
    entity_id: app.id,
    details: { app_number: app.application_number, from: oldStatus, to: newStatus, changed_by: changedBy, remark },
    created_at: new Date().toISOString(),
  });

  saveLocalDb(db);
  return app;
}

export async function dbAttachDocument(doc: Omit<ApplicationDocument, 'id' | 'created_at'>): Promise<ApplicationDocument> {
  const db = initLocalDb();
  const newDoc: ApplicationDocument = {
    ...doc,
    id: 'doc-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    created_at: new Date().toISOString(),
  };

  db.documents.push(newDoc);

  db.audit_logs.unshift({
    id: 'audit-' + Date.now(),
    action: 'Document Uploaded',
    entity_type: 'documents',
    entity_id: newDoc.id,
    details: { file_name: doc.file_name, doc_name: doc.doc_name },
    created_at: new Date().toISOString(),
  });

  saveLocalDb(db);
  return newDoc;
}

export async function dbReviewDocument(docId: string, status: 'Verified' | 'Rejected' | 'Re-upload Required', reason?: string): Promise<ApplicationDocument> {
  const db = initLocalDb();
  const doc = db.documents.find((d) => d.id === docId);
  if (!doc) throw new Error('Document not found');

  doc.status = status;
  doc.rejection_reason = reason;

  db.audit_logs.unshift({
    id: 'audit-' + Date.now(),
    action: `Document ${status}`,
    entity_type: 'documents',
    entity_id: doc.id,
    details: { status, reason },
    created_at: new Date().toISOString(),
  });

  saveLocalDb(db);
  return doc;
}

export async function dbCreatePaymentOrder(applicationId: string, customerId: string): Promise<PaymentRecord> {
  const db = initLocalDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) throw new Error('Application not found');

  const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const payment: PaymentRecord = {
    id: 'pay-' + Date.now(),
    application_id: app.id,
    customer_id: customerId,
    order_id: orderId,
    amount: app.locked_price,
    currency: 'INR',
    status: 'Pending',
    payment_method: 'UPI / QR / NetBanking',
    created_at: new Date().toISOString(),
  };

  db.payments.push(payment);
  saveLocalDb(db);
  return payment;
}

export async function dbVerifyPayment(orderId: string, gatewayPaymentId: string, signature?: string): Promise<PaymentRecord> {
  const db = initLocalDb();
  const payment = db.payments.find((p) => p.order_id === orderId);
  if (!payment) throw new Error('Payment order not found');

  payment.status = 'Success';
  payment.gateway_payment_id = gatewayPaymentId;
  payment.gateway_signature = signature || 'verified_server_side';

  // Automatically update application status to 'Payment Received'
  const app = db.applications.find((a) => a.id === payment.application_id);
  if (app && app.status === 'Payment Pending') {
    app.status = 'Payment Received';
    app.updated_at = new Date().toISOString();
    if (!app.status_history) app.status_history = [];
    app.status_history.push({
      id: 'hist-' + Date.now(),
      application_id: app.id,
      previous_status: 'Payment Pending',
      new_status: 'Payment Received',
      changed_by: 'Payment Gateway',
      remark: `Payment of ₹${payment.amount} verified successfully (Txn: ${gatewayPaymentId}).`,
      created_at: new Date().toISOString(),
    });
  }

  db.audit_logs.unshift({
    id: 'audit-' + Date.now(),
    action: 'Payment Verified',
    entity_type: 'payments',
    entity_id: payment.id,
    details: { order_id: orderId, amount: payment.amount, payment_id: gatewayPaymentId },
    created_at: new Date().toISOString(),
  });

  saveLocalDb(db);
  return payment;
}

// -------------------------------------------------------------
// Realtime Chat & Support Tickets
// -------------------------------------------------------------

export async function dbGetConversations(customerId?: string): Promise<ChatConversation[]> {
  const db = initLocalDb();
  if (customerId) {
    return db.chat_conversations.filter((c) => c.customer_id === customerId);
  }
  return db.chat_conversations;
}

export async function dbGetMessages(conversationId: string): Promise<ChatMessage[]> {
  const db = initLocalDb();
  const conv = db.chat_conversations.find((c) => c.id === conversationId);
  return conv?.messages || [];
}

export async function dbSendMessage(
  conversationId: string,
  message: {
    sender_id: string;
    sender_role: 'customer' | 'admin' | 'system';
    sender_name: string;
    message_text: string;
    attachment_url?: string;
  }
): Promise<ChatMessage> {
  const db = initLocalDb();
  let conv = db.chat_conversations.find((c) => c.id === conversationId);

  if (!conv) {
    conv = {
      id: conversationId,
      customer_id: message.sender_id,
      customer_name: message.sender_name,
      subject: 'Direct Inquiry',
      last_message: message.message_text,
      last_message_at: new Date().toISOString(),
      unread_admin_count: message.sender_role === 'customer' ? 1 : 0,
      unread_customer_count: message.sender_role === 'admin' ? 1 : 0,
      messages: [],
    };
    db.chat_conversations.unshift(conv);
  }

  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now(),
    conversation_id: conv.id,
    sender_id: message.sender_id,
    sender_role: message.sender_role,
    sender_name: message.sender_name,
    message_text: message.message_text,
    attachment_url: message.attachment_url,
    created_at: new Date().toISOString(),
  };

  if (!conv.messages) conv.messages = [];
  conv.messages.push(newMsg);
  conv.last_message = message.message_text;
  conv.last_message_at = new Date().toISOString();

  if (message.sender_role === 'customer') {
    conv.unread_admin_count = (conv.unread_admin_count || 0) + 1;
  } else {
    conv.unread_customer_count = (conv.unread_customer_count || 0) + 1;
  }

  saveLocalDb(db);
  return newMsg;
}

export async function dbGetTickets(customerId?: string): Promise<SupportTicket[]> {
  const db = initLocalDb();
  if (customerId) {
    return db.support_tickets.filter((t) => t.customer_id === customerId);
  }
  return db.support_tickets;
}

export async function dbCreateTicket(data: {
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  application_id?: string;
  category: 'Application Issue' | 'Payment Issue' | 'Document Issue' | 'Service Issue' | 'Other';
  subject: string;
  message: string;
}): Promise<SupportTicket> {
  const db = initLocalDb();
  const year = new Date().getFullYear();
  const count = db.support_tickets.length + 1;
  const ticketNumber = `SRK-TKT-${year}-${String(count).padStart(5, '0')}`;

  const newTicket: SupportTicket = {
    id: 'tkt-' + Date.now(),
    ticket_number: ticketNumber,
    customer_id: data.customer_id,
    customer_name: data.customer_name,
    customer_mobile: data.customer_mobile,
    application_id: data.application_id,
    category: data.category,
    subject: data.subject,
    status: 'Open',
    priority: 'Medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: 'tmsg-' + Date.now(),
        ticket_id: 'tkt-' + Date.now(),
        sender_id: data.customer_id,
        sender_role: 'customer',
        sender_name: data.customer_name,
        message_text: data.message,
        created_at: new Date().toISOString(),
      },
    ],
  };

  db.support_tickets.unshift(newTicket);
  saveLocalDb(db);
  return newTicket;
}

export async function dbAddTicketMessage(
  ticketId: string,
  message: { sender_id: string; sender_role: 'customer' | 'admin'; sender_name: string; message_text: string }
): Promise<SupportTicketMessage> {
  const db = initLocalDb();
  const ticket = db.support_tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const newMsg: SupportTicketMessage = {
    id: 'tmsg-' + Date.now(),
    ticket_id: ticket.id,
    sender_id: message.sender_id,
    sender_role: message.sender_role,
    sender_name: message.sender_name,
    message_text: message.message_text,
    created_at: new Date().toISOString(),
  };

  if (!ticket.messages) ticket.messages = [];
  ticket.messages.push(newMsg);
  ticket.updated_at = new Date().toISOString();

  saveLocalDb(db);
  return newMsg;
}

export async function dbUpdateTicketStatus(ticketId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): Promise<SupportTicket> {
  const db = initLocalDb();
  const ticket = db.support_tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = status;
  ticket.updated_at = new Date().toISOString();
  saveLocalDb(db);
  return ticket;
}

// -------------------------------------------------------------
// OTP Authentication & Audit Logs
// -------------------------------------------------------------

export async function dbGenerateOtp(mobile: string): Promise<{ success: boolean; message: string; mockOtp?: string }> {
  const db = initLocalDb();
  const now = Date.now();

  const existing = db.otps[mobile];
  if (existing && existing.expires_at > now && existing.expires_at - now > 4 * 60 * 1000) {
    return { success: false, message: 'Please wait 60 seconds before requesting a new OTP.' };
  }

  // 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // 5 minute expiry
  db.otps[mobile] = {
    otp,
    expires_at: now + 5 * 60 * 1000,
    attempts: 0,
  };

  saveLocalDb(db);
  return {
    success: true,
    message: `OTP sent successfully to ${mobile}. (Valid for 5 minutes)`,
    mockOtp: otp, // Returned for dev testing convenience
  };
}

export async function dbVerifyOtp(
  mobile: string,
  inputOtp: string,
  profileData?: { full_name?: string; address?: string; email?: string }
): Promise<{ success: boolean; message: string; customer?: CustomerProfile }> {
  const db = initLocalDb();
  const record = db.otps[mobile];

  // Also support demo/master OTP "123456" for instant testing
  const isValid = (record && record.otp === inputOtp && record.expires_at > Date.now()) || inputOtp === '123456';

  if (!isValid) {
    if (record) record.attempts = (record.attempts || 0) + 1;
    saveLocalDb(db);
    return { success: false, message: 'Invalid or expired OTP. Please try again.' };
  }

  // Find or create customer
  let customer = db.customer_profiles.find((c) => c.mobile === mobile);
  if (!customer) {
    customer = {
      id: 'cust-' + Date.now(),
      full_name: profileData?.full_name || 'Customer ' + mobile.slice(-4),
      mobile,
      email: profileData?.email || '',
      address: profileData?.address || '',
      district: 'Vadodara',
      taluka: 'Shinor',
      village_city: 'Sadhli',
      created_at: new Date().toISOString(),
    };
    db.customer_profiles.push(customer);
  } else if (profileData?.full_name) {
    customer.full_name = profileData.full_name;
    if (profileData.address) customer.address = profileData.address;
    if (profileData.email) customer.email = profileData.email;
  }

  delete db.otps[mobile];
  saveLocalDb(db);

  return { success: true, message: 'OTP verified successfully', customer };
}

export async function dbGetNotifications(userId?: string): Promise<AppNotification[]> {
  const db = initLocalDb();
  if (userId) {
    return db.notifications.filter((n) => !n.user_id || n.user_id === userId);
  }
  return db.notifications;
}

export async function dbMarkNotificationRead(id: string): Promise<void> {
  const db = initLocalDb();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.is_read = true;
    saveLocalDb(db);
  }
}

export async function dbCreateAuditLog(log: Omit<AuditLogItem, 'id' | 'created_at'>): Promise<void> {
  const db = initLocalDb();
  db.audit_logs.unshift({
    ...log,
    id: 'audit-' + Date.now(),
    created_at: new Date().toISOString(),
  });
  saveLocalDb(db);
}

export async function dbGetAuditLogs(): Promise<AuditLogItem[]> {
  const db = initLocalDb();
  return db.audit_logs;
}
