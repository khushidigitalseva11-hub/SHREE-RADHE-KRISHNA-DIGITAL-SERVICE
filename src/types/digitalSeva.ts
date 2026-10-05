// Types for SHREE RADHE KRISHNA DIGITAL SERVICE

export type ApplicationStatus =
  | 'Application Received'
  | 'Payment Pending'
  | 'Payment Received'
  | 'Document Checking'
  | 'Processing'
  | 'Correction Required'
  | 'Completed'
  | 'Rejected / Cancelled';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Application Received',
  'Payment Pending',
  'Payment Received',
  'Document Checking',
  'Processing',
  'Correction Required',
  'Completed',
  'Rejected / Cancelled',
];

export const STATUS_LABELS: Record<
  ApplicationStatus,
  { en: string; gu: string; color: string; bg: string; border: string }
> = {
  'Application Received': {
    en: 'Application Received',
    gu: 'અરજી મળી ગઈ છે',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  'Payment Pending': {
    en: 'Payment Pending',
    gu: 'ચુકવણી બાકી છે',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  'Payment Received': {
    en: 'Payment Received',
    gu: 'ચુકવણી સ્વીકારાઈ',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  'Document Checking': {
    en: 'Document Checking',
    gu: 'દસ્તાવેજ ચકાસણી ચાલુ છે',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  'Processing': {
    en: 'Processing',
    gu: 'સરકારી પોર્ટલ પર પ્રોસેસિંગ',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  'Correction Required': {
    en: 'Correction Required',
    gu: 'સુધારો / ફરીથી અપલોડ જરૂરી',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  'Completed': {
    en: 'Completed',
    gu: 'સફળતાપૂર્વક પૂર્ણ થયેલ',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
  },
  'Rejected / Cancelled': {
    en: 'Rejected / Cancelled',
    gu: 'અરજી રદ / અસ્વીકાર',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
};

export type DocumentStatus =
  | 'Pending'
  | 'Uploaded'
  | 'Verified'
  | 'Rejected'
  | 'Re-upload Required'
  | 'Final Document';

export interface DigitalService {
  id: string;
  service_code: string;
  name: string;
  name_gu: string;
  price: number;
  category: string;
  description: string;
  instructions?: string;
  active: boolean;
  display_order: number;
  required_documents?: ServiceDocumentChecklist[];
  form_fields?: DynamicFormField[];
}

export interface ServiceDocumentChecklist {
  id: string;
  service_id?: string;
  doc_code: string;
  doc_name: string;
  doc_name_gu: string;
  is_mandatory: boolean;
  description?: string;
}

export type DynamicFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'file';

export interface DynamicFormField {
  id: string;
  service_id?: string;
  field_name: string;
  label: string;
  label_gu: string;
  field_type: DynamicFieldType;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  min_length?: number;
  max_length?: number;
  default_value?: string;
  options?: string[]; // for dropdown, radio, checkbox
  display_order: number;
}

export interface CustomerProfile {
  id: string;
  user_id?: string;
  full_name: string;
  mobile: string;
  email?: string;
  address?: string;
  district?: string;
  taluka?: string;
  village_city?: string;
  pincode?: string;
  created_at?: string;
}

export interface DigitalApplication {
  id: string;
  application_number: string;
  customer_id: string;
  service_id: string;
  service_code: string;
  service_name: string;
  locked_price: number;
  status: ApplicationStatus;
  applicant_name: string;
  applicant_mobile: string;
  form_data: Record<string, any>;
  admin_remark?: string;
  final_document_name?: string;
  final_document_url?: string;
  submitted_at: string;
  updated_at: string;
  documents?: ApplicationDocument[];
  status_history?: ApplicationStatusHistoryItem[];
  payments?: PaymentRecord[];
}

export interface ApplicationStatusHistoryItem {
  id: string;
  application_id: string;
  previous_status?: string;
  new_status: string;
  changed_by: string;
  remark?: string;
  created_at: string;
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  service_doc_id?: string;
  doc_name: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: DocumentStatus;
  rejection_reason?: string;
  uploaded_by: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  application_id: string;
  customer_id: string;
  order_id: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  payment_method: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id?: string;
  sender_id: string;
  sender_role: 'customer' | 'admin' | 'system' | 'model';
  sender_name?: string;
  message_text: string;
  attachment_url?: string;
  attachment_name?: string;
  is_read?: boolean;
  created_at: string;
  timestamp?: number;
  modelUsed?: string;
  roleTitle?: string;
}

export interface ChatConversation {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_mobile?: string;
  application_id?: string;
  application_number?: string;
  subject: string;
  last_message?: string;
  last_message_at: string;
  unread_admin_count: number;
  unread_customer_count: number;
  messages?: ChatMessage[];
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name?: string;
  customer_mobile?: string;
  application_id?: string;
  application_number?: string;
  category: 'Application Issue' | 'Payment Issue' | 'Document Issue' | 'Service Issue' | 'Other';
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  created_at: string;
  updated_at: string;
  messages?: SupportTicketMessage[];
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'customer' | 'admin';
  sender_name?: string;
  message_text: string;
  attachment_url?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'application' | 'payment' | 'document' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}
