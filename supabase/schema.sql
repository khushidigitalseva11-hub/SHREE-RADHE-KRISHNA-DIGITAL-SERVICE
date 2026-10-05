-- ==================================================================================
-- SHREE RADHE KRISHNA DIGITAL SERVICE (શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા)
-- Complete Database Schema & Seed Data for Supabase PostgreSQL
-- ==================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Compatibility fallback for uuid_generate_v4
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT gen_random_uuid();
$$;

-- ----------------------------------------------------------------------------------
-- 1. ENUMS & TYPES
-- ----------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM (
        'Application Received',
        'Payment Pending',
        'Payment Received',
        'Document Checking',
        'Processing',
        'Correction Required',
        'Completed',
        'Rejected / Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status_enum AS ENUM (
        'Pending',
        'Uploaded',
        'Verified',
        'Rejected',
        'Re-upload Required',
        'Final Document'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'Created',
        'Pending',
        'Success',
        'Failed',
        'Refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM (
        'Open',
        'In Progress',
        'Resolved',
        'Closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------------
-- 2. CUSTOMER PROFILES
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- linked to auth.users if Supabase Auth is enabled
    full_name TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255),
    address TEXT,
    district VARCHAR(100) DEFAULT 'Vadodara',
    taluka VARCHAR(100) DEFAULT 'Shinor',
    village_city VARCHAR(100) DEFAULT 'Sadhli',
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_mobile ON customer_profiles(mobile);

-- ----------------------------------------------------------------------------------
-- 3. ADMIN USERS
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    mobile VARCHAR(15),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'operator'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------------
-- 4. SERVICES
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(20) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_gu TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    description TEXT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_code ON services(service_code);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);

-- ----------------------------------------------------------------------------------
-- 5. SERVICE FORM FIELDS (Dynamic Form Engine)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    label TEXT NOT NULL,
    label_gu TEXT NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- text, number, date, dropdown, radio, checkbox, textarea, file
    placeholder TEXT,
    help_text TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    min_length INT,
    max_length INT,
    default_value TEXT,
    options JSONB, -- Array of strings or {label, value}
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_fields_service ON service_form_fields(service_id);

-- ----------------------------------------------------------------------------------
-- 6. SERVICE REQUIRED DOCUMENTS (Checklist per service)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    doc_code VARCHAR(50) NOT NULL,
    doc_name TEXT NOT NULL,
    doc_name_gu TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------------
-- 7. APPLICATIONS
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    service_code VARCHAR(20) NOT NULL,
    service_name TEXT NOT NULL,
    locked_price NUMERIC(10, 2) NOT NULL, -- Permanent locked price at submission
    status VARCHAR(50) NOT NULL DEFAULT 'Application Received',
    applicant_name TEXT NOT NULL,
    applicant_mobile VARCHAR(15) NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    admin_remark TEXT,
    final_document_name TEXT,
    final_document_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_apps_customer ON applications(customer_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);

-- ----------------------------------------------------------------------------------
-- 8. APPLICATION STATUS HISTORY (Permanent Audit Trail)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by TEXT NOT NULL, -- Admin email or 'System'
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_app ON application_status_history(application_id);

-- ----------------------------------------------------------------------------------
-- 9. DOCUMENTS (Private Customer Uploads & Final Result)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    service_doc_id UUID REFERENCES service_documents(id) ON DELETE SET NULL,
    doc_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Private storage path
    file_size INT,
    mime_type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'Uploaded',
    rejection_reason TEXT,
    uploaded_by TEXT NOT NULL DEFAULT 'Customer', -- 'Customer' or 'Admin'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_application ON documents(application_id);

-- ----------------------------------------------------------------------------------
-- 10. PAYMENTS (Gateway Orders & Verified Transactions)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE RESTRICT,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    gateway_payment_id VARCHAR(100),
    gateway_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'UPI / Card / NetBanking',
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_app ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- ----------------------------------------------------------------------------------
-- 11. CHAT CONVERSATIONS & MESSAGES (Real-Time Customer ↔ Admin)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    subject TEXT DEFAULT 'Customer Support Chat',
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_admin_count INT DEFAULT 0,
    unread_customer_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role VARCHAR(20) NOT NULL, -- 'customer', 'admin', 'system'
    sender_name TEXT,
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id);

-- ----------------------------------------------------------------------------------
-- 12. SUPPORT TICKETS & MESSAGES
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- 'Application Issue', 'Payment Issue', 'Document Issue', 'Service Issue', 'Other'
    subject TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    priority VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role VARCHAR(20) NOT NULL, -- 'customer', 'admin'
    sender_name TEXT,
    message_text TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_num ON support_tickets(ticket_number);

-- ----------------------------------------------------------------------------------
-- 13. NOTIFICATIONS
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Customer profile ID or null for admin
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'application', 'payment', 'document', 'system'
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ----------------------------------------------------------------------------------
-- 14. OTP VERIFICATIONS (Secure Hashed OTPs)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile VARCHAR(15) NOT NULL,
    otp_hash TEXT NOT NULL,
    attempts INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verifications(mobile);

-- ----------------------------------------------------------------------------------
-- 15. AUDIT LOGS (Immutable System Activity)
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------------
-- 16. SYSTEM SETTINGS
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------------
-- 17. DIGITAL CITIZEN CONSENT RECORDS
-- ----------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    consent_text TEXT NOT NULL,
    ip_address TEXT,
    consented_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================================
-- 18. FUNCTIONS & STORED PROCEDURES
-- ==================================================================================

-- Auto Application Number Generator: SRK-[CODE]-[YY]-[SEQUENCE]
CREATE OR REPLACE FUNCTION generate_application_number(p_service_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year TEXT;
    v_count INT;
    v_app_num TEXT;
BEGIN
    v_year := to_char(NOW(), 'YY');
    SELECT COUNT(*) + 1 INTO v_count 
    FROM applications 
    WHERE service_code = p_service_code AND to_char(submitted_at, 'YY') = v_year;
    
    v_app_num := 'SRK-' || UPPER(p_service_code) || '-' || v_year || '-' || LPAD(v_count::TEXT, 6, '0');
    RETURN v_app_num;
END;
$$;

-- Create Application with Price Lock RPC
CREATE OR REPLACE FUNCTION create_customer_application(
    p_service_id UUID,
    p_customer_id UUID,
    p_applicant_name TEXT,
    p_applicant_mobile TEXT,
    p_form_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_service RECORD;
    v_app_number TEXT;
    v_new_app RECORD;
BEGIN
    -- Fetch current official service
    SELECT * INTO v_service FROM services WHERE id = p_service_id AND is_active = TRUE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found or inactive';
    END IF;

    -- Generate unique sequential number
    v_app_number := generate_application_number(v_service.service_code);

    -- Insert application with locked price
    INSERT INTO applications (
        application_number,
        customer_id,
        service_id,
        service_code,
        service_name,
        locked_price,
        status,
        applicant_name,
        applicant_mobile,
        form_data
    ) VALUES (
        v_app_number,
        p_customer_id,
        p_service_id,
        v_service.service_code,
        v_service.name,
        v_service.price,
        'Application Received',
        p_applicant_name,
        p_applicant_mobile,
        p_form_data
    ) RETURNING * INTO v_new_app;

    -- Record initial status in history
    INSERT INTO application_status_history (
        application_id,
        previous_status,
        new_status,
        changed_by,
        remark
    ) VALUES (
        v_new_app.id,
        NULL,
        'Application Received',
        'Customer',
        'Application successfully submitted online with locked price ₹' || v_service.price
    );

    -- Log to audit
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
        'Application Created',
        'applications',
        v_new_app.id::TEXT,
        jsonb_build_object('application_number', v_app_number, 'locked_price', v_service.price)
    );

    RETURN row_to_json(v_new_app)::jsonb;
END;
$$;

-- Update Application Status with History RPC
CREATE OR REPLACE FUNCTION update_application_status(
    p_application_id UUID,
    p_new_status VARCHAR,
    p_changed_by TEXT,
    p_remark TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_app RECORD;
    v_old_status VARCHAR;
BEGIN
    SELECT * INTO v_app FROM applications WHERE id = p_application_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    v_old_status := v_app.status;

    -- Update application
    UPDATE applications
    SET status = p_new_status,
        admin_remark = p_remark,
        updated_at = NOW()
    WHERE id = p_application_id
    RETURNING * INTO v_app;

    -- Record in history
    INSERT INTO application_status_history (
        application_id,
        previous_status,
        new_status,
        changed_by,
        remark
    ) VALUES (
        p_application_id,
        v_old_status,
        p_new_status,
        p_changed_by,
        p_remark
    );

    -- Add customer notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        v_app.customer_id,
        'Application Status: ' || p_new_status,
        'Your application ' || v_app.application_number || ' status is now ' || p_new_status || '. ' || COALESCE(p_remark, ''),
        'application',
        '/dashboard/applications/' || v_app.id
    );

    -- Audit log
    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (
        'Status Changed',
        'applications',
        p_application_id::TEXT,
        jsonb_build_object('from', v_old_status, 'to', p_new_status, 'by', p_changed_by, 'remark', p_remark)
    );

    RETURN row_to_json(v_app)::jsonb;
END;
$$;

-- ==================================================================================
-- 19. SEED DATA (21 Services & Business Info)
-- ==================================================================================

INSERT INTO system_settings (key, value, description) VALUES
('business_name', 'SHREE RADHE KRISHNA DIGITAL SERVICE', 'Official Business Name'),
('tagline_gu', 'તમારી ડિજિટલ સેવા, એક જ સ્થળે', 'Gujarati Tagline'),
('email', 'khushidigitalseva11@gmail.com', 'Official Contact Email'),
('address', 'Rudra Complex, Timberwa Road, Sadhli, Taluka Shinor, District Vadodara, Gujarat, India', 'Physical Center Address'),
('working_hours', 'Monday–Saturday: 9:00 AM–7:00 PM, Sunday: Closed', 'Working Hours'),
('pvc_delivery', 'All India PVC Smart Card Home Delivery Available', 'PVC Card Delivery Note'),
('default_gateway', 'Razorpay', 'Active Payment Gateway Mode')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed default admin account
INSERT INTO admin_users (email, password_hash, full_name, mobile, role)
VALUES ('khushidigitalseva11@gmail.com', crypt('Admin@SRK2026', gen_salt('bf')), 'Director - Shree Radhe Krishna Digital Service', NULL, 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed the initial 21 services
INSERT INTO services (service_code, name, name_gu, price, category, description, instructions, display_order)
VALUES
('PAN', 'New PAN Card', 'નવું PAN Card', 250.00, 'PAN Card', 'નવું PAN Card બનાવવા માટે ઓનલાઈન અરજી સહાય. 18 વર્ષથી વધુ ઉંમરના તમામ નાગરિકો માટે.', 'આધાર કાર્ડ અને પાસપોર્ટ સાઇઝનો ફોટો તેમજ સહી અપલોડ કરો.', 1),
('PANC', 'PAN Card Correction', 'PAN Card સુધારો', 250.00, 'PAN Card', 'PAN Card માં નામ, જન્મ તારીખ, પિતાનું નામ કે ફોટો/સહી સુધારા માટે સેવા.', 'હાલનું પાન કાર્ડ અને સુધારા માટે જરૂરી માન્ય પુરાવો અપલોડ કરો.', 2),
('ENIR', 'e-Nirman Card', 'ઈ-નિર્માણ કાર્ડ', 150.00, 'Government Scheme', 'ગુજરાત બાંધકામ શ્રમિક ઈ-નિર્માણ Card યોજના સહાય અને સ્માર્ટ કાર્ડ.', 'આધાર કાર્ડ, બેંક પાસબુક, રેશનકાર્ડ અને કડિયાકામ/મજૂરીનો પુરાવો જરૂરી.', 3),
('KMM', 'Kuvarbai nu Mameru', 'કુંવરબાઈનું મામેરું યોજના', 250.00, 'Government Scheme', 'દીકરીના લગ્ન પ્રસંગે સરકારી ₹12,000 ની આર્થિક સહાય અરજી.', 'લગ્ન નોંધણી પ્રમાણપત્ર, દીકરી અને પિતાનું આધાર કાર્ડ, આવકનો દાખલો.', 4),
('AYU', 'New Ayushman Card', 'નવું આયુષ્માન કાર્ડ', 150.00, 'Health', 'PMJAY આયુષ્માન કાર્ડ ₹5 થી ₹10 લાખ સુધીની સરકારી મફત હોસ્પિટલ સારવાર માટે.', 'રેશનકાર્ડ અને તમામ સભ્યોના આધાર કાર્ડ.', 5),
('AYUK', 'Ayushman Update / KYC', 'આયુષ્માન Card Update / KYC', 50.00, 'Health', 'હાલના આયુષ્માન કાર્ડમાં e-KYC, સરનામું અને સભ્ય ઉમેરવાની સેવા.', 'આયુષ્માન કાર્ડ નંબર અને આધાર કાર્ડ.', 6),
('PMK', 'PM-Kisan Assistance', 'PM કિસાન સહાય', 250.00, 'Farmer', 'પ્રધાનમંત્રી કિસાન સન્માન નિધિ યોજના વાર્ષિક ₹6,000 નવી નોંધણી.', 'જમીનની 7/12 અને 8-A નકલ, આધાર કાર્ડ, બેંક પાસબુક.', 7),
('PMKK', 'PM-Kisan KYC', 'PM કિસાન KYC', 50.00, 'Farmer', 'PM Kisan હપ્તા ચાલુ રાખવા માટે બાયોમેટ્રિક / ઓટીપી e-KYC.', 'આધાર કાર્ડ સાથે લિંક થયેલ મોબાઈલ નંબર.', 8),
('LAND', 'Land Information / PDF', 'જમીનની માહિતી / PDF', 10.00, 'Land', 'AnyRoR પોર્ટલ પરથી 7/12, 8-A, હકપત્રક 6 ની સત્તાવાર PDF નકલ ડાઉનલોડ.', 'ગામનું નામ અને સર્વે નંબર અથવા ખાતા નંબર આપવો.', 9),
('INC', 'Income Certificate', 'આવકનો દાખલો', 250.00, 'Certificate', 'મામલતદાર / તાલુકા પંચાયત દ્વારા માન્ય આવકનું 3 વર્ષનું પ્રમાણપત્ર.', 'રેશનકાર્ડ, લાઇટબિલ, તલાટી રૂબરૂ પંચનામું, આધાર કાર્ડ.', 10),
('PF', 'PF Online Services', 'PF Online Services', 250.00, 'PF', 'PF ઉપાડ, KYC, પાસબુક ચેક, નોમિની ઉમેરો અને એડવાન્સ ક્લેમ.', 'UAN નંબર, પાસવર્ડ, આધાર કાર્ડ, કેન્સલ ચેક.', 11),
('FARM', 'Farmer Registration', 'ખેડૂત નોંધણી', 150.00, 'Farmer', 'i-Khedut પોર્ટલ પર ખેતી સાધન, ટ્રેક્ટર સહાય અને પાક નુકસાન નોંધણી.', 'જમીન 7/12-8A, આધાર કાર્ડ, બેંક પાસબુક.', 12),
('MPAN', 'Minor PAN Card', 'Minor PAN Card', 250.00, 'PAN Card', '18 વર્ષથી ઓછી ઉંમરના બાળકો માટે PAN Card બનાવવાની સેવા.', 'બાળકનો આધાર કાર્ડ, માતા અથવા પિતાનું આધાર કાર્ડ અને બાળકના ફોટો.', 13),
('VOTER', 'New Voter Card', 'નવું ચૂંટણી કાર્ડ', 150.00, 'Voter', 'મતદાર યાદીમાં નવું નામ ઉમેરવા ફોર્મ-6 ઓનલાઇન અરજી.', 'પાસપોર્ટ સાઇઝ ફોટો, ઉંમરનો પુરાવો (જન્મ તારીખ દાખલો/LC) અને રહેઠાણ પુરાવો.', 14),
('VOTERC', 'Voter Card Correction', 'ચૂંટણી કાર્ડ સુધારો', 150.00, 'Voter', 'મતદાર ઓળખપત્રમાં નામ, અટક, ફોટો, સરનામું કે બૂથ સુધારો (ફોર્મ-8).', 'હાલનું મતદાર કાર્ડ અને સુધારા અંગેનો સત્તાવાર પુરાવો.', 15),
('ITR', 'Income Tax Return', 'Income Tax Return', 2500.00, 'Income Tax', 'ITR-1 / ITR-2 ઇન્કમટેક્સ રિટર્ન ફાઈલિંગ અને રિફંડ સહાય.', 'PAN Card, આધાર કાર્ડ, ફોર્મ 16, વાર્ષિક બેંક સ્ટેટમેન્ટ.', 16),
('ESHRAM', 'e-Shram Card', 'ઈ-શ્રમ કાર્ડ', 150.00, 'Government Scheme', 'અસંગઠિત ક્ષેત્રના શ્રમિકો માટે ભારત સરકારનું ઈ-શ્રમ કાર્ડ ₹2 લાખ અકસ્માત વીમો.', 'આધાર કાર્ડ, બેંક ખાતા વિગત અને આધાર લિંક મોબાઈલ નંબર.', 17),
('UDYAM', 'Udyam Registration', 'Udyam Registration', 200.00, 'Business', 'MSME ઉદ્યોગ આધાર નોંધણી પ્રમાણપત્ર અને વ્યાપાર સહાય.', 'પ્રોપ્રાઈટર આધાર કાર્ડ, પાન કાર્ડ, પેઢી/દુકાનનું નામ અને બેંક વિગત.', 18),
('NOC', 'Police Verification / NOC', 'પોલીસ વેરિફિકેશન (NOC)', 150.00, 'Police', 'નોકરી, પાસપોર્ટ કે ભાડુઆત વેરિફિકેશન માટે પોલીસ કલીયરન્સ સર્ટિફિકેટ (PCC).', 'પાસપોર્ટ સાઇઝ ફોટો, આધાર કાર્ડ, ચૂંટણી કાર્ડ, કંપની લેટર.', 19),
('ABHA', 'ABHA Card', 'ABHA Card', 150.00, 'Health', 'આયુષ્માન ભારત ડિજિટલ હેલ્થ એકાઉન્ટ (14 અંકનું હેલ્થ ID કાર્ડ).', 'આધાર કાર્ડ અને મોબાઈલ નંબર.', 20),
('PVC', 'PVC Card Printing', 'PVC Card Printing', 150.00, 'Printing', 'All India PVC Smart Card Print & High Quality Waterproof Delivery.', 'કોઈપણ કાર્ડની ઓરિજિનલ PDF ફાઈલ અને પૂરેપૂરું કુરિયર સરનામું.', 21)
ON CONFLICT (service_code) DO UPDATE SET 
    name = EXCLUDED.name,
    name_gu = EXCLUDED.name_gu,
    price = EXCLUDED.price,
    description = EXCLUDED.description;

-- ==================================================================================
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================================================
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Customer Profile Policies
DROP POLICY IF EXISTS "Customers can view own profile" ON customer_profiles;
CREATE POLICY "Customers can view own profile" ON customer_profiles
    FOR SELECT USING (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true));

DROP POLICY IF EXISTS "Customers can update own profile" ON customer_profiles;
CREATE POLICY "Customers can update own profile" ON customer_profiles
    FOR UPDATE USING (auth.uid() = user_id OR id::text = current_setting('request.jwt.claim.sub', true));

-- Public Services Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active services" ON services;
CREATE POLICY "Public can view active services" ON services
    FOR SELECT USING (is_active = TRUE);

-- Applications Policies
DROP POLICY IF EXISTS "Customers view own applications" ON applications;
CREATE POLICY "Customers view own applications" ON applications
    FOR SELECT USING (customer_id IN (SELECT id FROM customer_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Customers create own applications" ON applications;
CREATE POLICY "Customers create own applications" ON applications
    FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM customer_profiles WHERE user_id = auth.uid()));

-- Documents Policies
DROP POLICY IF EXISTS "Customers view own documents" ON documents;
CREATE POLICY "Customers view own documents" ON documents
    FOR SELECT USING (application_id IN (SELECT id FROM applications WHERE customer_id IN (SELECT id FROM customer_profiles WHERE user_id = auth.uid())));
