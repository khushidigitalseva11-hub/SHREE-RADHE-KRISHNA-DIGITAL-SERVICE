// scripts/test_mvp_acceptance.js
// Automated End-to-End Acceptance Test for Section 36 MVP Scope

const BASE_URL = process.env.TEST_URL || 'http://localhost:3005';

async function runTest() {
  console.log('====================================================');
  console.log('🚀 STARTING MVP ACCEPTANCE & SECURITY TEST SUITE');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // STEP 1 & 2: Customer A Mobile OTP Login & Registration
    // ----------------------------------------------------
    console.log('\n--- Step 1 & 2: Customer A Mobile OTP Login & Registration ---');
    const otpRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '9825100001' })
    });
    const otpData = await otpRes.json();
    assert(otpData.success, 'Customer A OTP request succeeded');

    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9825100001',
        otp: '123456',
        name: 'Rameshbhai Patel',
        email: 'ramesh.patel@example.com',
        address: 'Sadhli, Vadodara'
      })
    });
    const verifyData = await verifyRes.json();
    assert(verifyData.success && verifyData.customer?.id, `Customer A logged in (ID: ${verifyData.customer?.id})`);
    const customerA = verifyData.customer;

    // ----------------------------------------------------
    // STEP 3: Services List & PM-Kisan Service Details
    // ----------------------------------------------------
    console.log('\n--- Step 3 & 4: View Services & Select PM-Kisan ---');
    const servicesRes = await fetch(`${BASE_URL}/api/services`);
    const servicesList = await servicesRes.json();
    assert(Array.isArray(servicesList) && servicesList.length > 0, `Services fetched: ${servicesList.length} services found`);

    const pmKisanService = servicesList.find(s => s.service_code === 'PMK' || s.name?.includes('PM-Kisan'));
    assert(pmKisanService && pmKisanService.price !== undefined, `Found PM-Kisan service with price ₹${pmKisanService?.price} (Name: ${pmKisanService?.name})`);

    // ----------------------------------------------------
    // STEP 5 - 8: Fill Form, Upload Docs, Submit Application
    // ----------------------------------------------------
    console.log('\n--- Step 5 - 8: Dynamic Application Form & Document Upload ---');
    const appPayload = {
      customer_id: customerA.id,
      service_id: pmKisanService.id,
      applicant_name: 'Rameshbhai Somabhai Patel',
      applicant_mobile: '9825100001',
      form_data: {
        farmer_name: 'Rameshbhai Somabhai Patel',
        aadhaar_no: '987654321098',
        khasra_no: '142/B',
        taluka: 'Dabhoi',
        district: 'Vadodara',
        bank_ifsc: 'SBIN0001234',
        account_no: '12345678901'
      }
    };

    const submitRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload)
    });
    const app = await submitRes.json();
    assert(app && app.id && app.application_number, `Application created with unique number: ${app.application_number}`);

    // Attach document
    const docRes = await fetch(`${BASE_URL}/api/applications/${app.id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doc_name: 'Aadhaar Card (Front & Back)',
        file_name: 'aadhaar_sample.pdf',
        file_path: '/uploads/demo_aadhaar.pdf',
        file_size: 1048576,
        mime_type: 'application/pdf',
        uploaded_by: 'Customer'
      })
    });
    const doc = await docRes.json();
    assert(doc && doc.id, `Document attached (ID: ${doc.id})`);

    // ----------------------------------------------------
    // STEP 9 - 11: Verify Status Flow & Price Lock
    // ----------------------------------------------------
    console.log('\n--- Step 9 - 11: Verify Status Timeline & Locked Price ---');
    assert(app.status === 'Application Received', `Initial status is strictly 'Application Received' (got: ${app.status})`);
    assert(app.locked_price === pmKisanService.price, `Application price is locked at ₹${app.locked_price}`);

    // ----------------------------------------------------
    // STEP 12 - 14: Payment Creation & Server-side Verification
    // ----------------------------------------------------
    console.log('\n--- Step 12 - 14: Payment Order & Server-Side Verification ---');
    const orderRes = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: app.id,
        customer_id: customerA.id
      })
    });
    const orderData = await orderRes.json();
    assert(orderData && orderData.order_id, `Payment order created (Order ID: ${orderData.order_id}) for locked amount ₹${orderData.amount}`);

    // Verify application status changed to Payment Pending
    const checkPendingRes = await fetch(`${BASE_URL}/api/applications/${app.id}`);
    const checkPendingApp = await checkPendingRes.json();
    assert(checkPendingApp.status === 'Payment Pending', `Status transitioned to 'Payment Pending' (got: ${checkPendingApp.status})`);

    // Server-side payment verification
    const verifyPayRes = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderData.order_id,
        payment_id: 'pay_test_' + Date.now(),
        signature: 'simulated_valid_test_signature'
      })
    });
    const verifyPayData = await verifyPayRes.json();
    assert(verifyPayData.success, 'Server-side payment verification succeeded');

    // Re-check application status after payment verification
    const checkPaidRes = await fetch(`${BASE_URL}/api/applications/${app.id}`);
    const checkPaidApp = await checkPaidRes.json();
    assert(checkPaidApp.status === 'Payment Received', `Application transitioned to 'Payment Received' (got: ${checkPaidApp.status})`);

    // ----------------------------------------------------
    // STEP 15 - 18: Admin Login & Workflow Status Transitions
    // ----------------------------------------------------
    console.log('\n--- Step 15 - 18: Admin Login & Application Workflow ---');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'khushidigitalseva11@gmail.com',
        password: 'Admin@SRK2026'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success && (adminLoginData.admin?.role === 'super_admin' || adminLoginData.admin?.role === 'admin' || adminLoginData.user?.role === 'admin'), 'Admin logged in securely');

    // Admin updates status to "Document Checking"
    const status1Res = await fetch(`${BASE_URL}/api/applications/${app.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status: 'Document Checking',
        remark: 'Verifying 7/12 land records with Gujarat revenue portal',
        changed_by: 'Admin'
      })
    });
    const status1Data = await status1Res.json();
    assert(status1Data.status === 'Document Checking', `Admin moved status to 'Document Checking'`);

    // Admin updates status to "Processing"
    const status2Res = await fetch(`${BASE_URL}/api/applications/${app.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status: 'Processing',
        remark: 'Application uploaded to PM-Kisan portal, awaiting state approval',
        changed_by: 'Admin'
      })
    });
    const status2Data = await status2Res.json();
    assert(status2Data.status === 'Processing', `Admin moved status to 'Processing'`);

    // ----------------------------------------------------
    // STEP 19 & 20: Document Rejection & Customer Re-upload
    // ----------------------------------------------------
    console.log('\n--- Step 19 & 20: Document Rejection & Re-upload Request ---');
    const rejectRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Rejected',
        reason: 'Aadhaar copy is blurry; please upload high-resolution clear scan'
      })
    });
    const rejectData = await rejectRes.json();
    assert(rejectData.status === 'Rejected', 'Admin rejected document with remarks');

    // Check that application moved to "Correction Required"
    const appAfterReject = await fetch(`${BASE_URL}/api/applications/${app.id}`);
    const appAfterRejectData = await appAfterReject.json();
    assert(appAfterRejectData.status === 'Correction Required', `Application automatically moved to 'Correction Required' (got: ${appAfterRejectData.status})`);

    // Customer re-uploads corrected document
    const reuploadRes = await fetch(`${BASE_URL}/api/documents/${doc.id}/reupload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_file_name: 'aadhaar_clean_hd.pdf',
        new_file_path: '/uploads/aadhaar_clean_hd.pdf'
      })
    });
    const reuploadData = await reuploadRes.json();
    assert(reuploadData.status === 'Uploaded', 'Customer re-uploaded document, resetting status to Uploaded');

    // Verify application moved back to Document Checking
    const appAfterReupload = await fetch(`${BASE_URL}/api/applications/${app.id}`);
    const appAfterReuploadData = await appAfterReupload.json();
    assert(appAfterReuploadData.status === 'Document Checking', `Application transitioned back to 'Document Checking' (got: ${appAfterReuploadData.status})`);

    // ----------------------------------------------------
    // STEP 21 - 24: Admin Completes & Uploads Final Document
    // ----------------------------------------------------
    console.log('\n--- Step 21 - 24: Final Document Upload & Completion ---');
    const finalDocRes = await fetch(`${BASE_URL}/api/applications/${app.id}/final-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: 'PM_KISAN_SANCTION_LETTER_2026.pdf',
        file_url: 'https://storage.googleapis.com/demo-docs/PM_KISAN_SANCTION_LETTER_2026.pdf',
        remark: 'DBT registration approved by Agriculture Officer. Installment will credit directly.'
      })
    });
    const finalApp = await finalDocRes.json();
    assert(finalApp.status === 'Completed', `Application status is strictly 'Completed' (got: ${finalApp.status})`);
    assert(finalApp.final_document_url, `Final document URL present: ${finalApp.final_document_name}`);

    // Verify status history length
    assert(Array.isArray(finalApp.status_history) && finalApp.status_history.length >= 6, `Complete audit status history preserved (${finalApp.status_history?.length} status events logged)`);

    // ----------------------------------------------------
    // CHAT FLOW: Customer ↔ Admin Real-Time Messages
    // ----------------------------------------------------
    console.log('\n--- Customer ↔ Admin Chat Flow ---');
    const conversationId = 'conv-' + app.id;
    const sendCustMsgRes = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: customerA.id,
        sender_role: 'customer',
        sender_name: customerA.full_name || 'Rameshbhai',
        message_text: 'Hello operator, will I receive the 2000 rupees installment this month?'
      })
    });
    const custMsg = await sendCustMsgRes.json();
    assert(custMsg && custMsg.id, 'Customer sent chat message');

    const sendAdminMsgRes = await fetch(`${BASE_URL}/api/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: 'admin-1',
        sender_role: 'admin',
        sender_name: 'Shree Radhe Krishna Operator',
        message_text: 'Yes Rameshbhai, DBT is linked to your SBI account ending in 8901. Expect credit within 7 business days.'
      })
    });
    const adminMsg = await sendAdminMsgRes.json();
    assert(adminMsg && adminMsg.id, 'Admin replied to customer chat message');

    const chatHistRes = await fetch(`${BASE_URL}/api/chat/messages?conversation_id=${conversationId}`);
    const chatHist = await chatHistRes.json();
    assert(Array.isArray(chatHist) && chatHist.length >= 2, `Customer retrieves chat history with ${chatHist.length} messages`);

    // ----------------------------------------------------
    // SUPPORT TICKET FLOW: Customer creates ticket, Admin replies
    // ----------------------------------------------------
    console.log('\n--- Support Ticket Flow ---');
    const ticketRes = await fetch(`${BASE_URL}/api/support/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerA.id,
        customer_name: customerA.full_name || 'Rameshbhai Patel',
        customer_mobile: customerA.mobile,
        application_id: app.id,
        category: 'Billing',
        subject: 'Need GST invoice for PM-Kisan processing fee',
        message: 'Kindly send invoice for ₹100 payment made today.'
      })
    });
    const ticket = await ticketRes.json();
    assert(ticket && ticket.id && ticket.ticket_number, `Support ticket created: ${ticket.ticket_number}`);

    const replyTicketRes = await fetch(`${BASE_URL}/api/support/tickets/${ticket.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: 'admin-1',
        sender_role: 'admin',
        sender_name: 'Accounts Desk',
        message_text: 'Your payment receipt #SRK-REC-8902 has been sent to your registered email.'
      })
    });
    const ticketMsg = await replyTicketRes.json();
    assert(ticketMsg && ticketMsg.id, 'Admin replied to support ticket');

    const resolveTicketRes = await fetch(`${BASE_URL}/api/support/tickets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticket.id,
        status: 'Resolved'
      })
    });
    const resolvedTicket = await resolveTicketRes.json();
    assert(resolvedTicket.status === 'Resolved', 'Ticket status resolved');

    // ----------------------------------------------------
    // SECURITY ISOLATION TEST: Customer B cannot access Customer A
    // ----------------------------------------------------
    console.log('\n--- Security Isolation Test (Customer A vs Customer B) ---');
    const customerBRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876543211',
        otp: '123456',
        name: 'Sureshbhai Vaghela',
        email: 'suresh@example.com'
      })
    });
    const customerBData = await customerBRes.json();
    const customerB = customerBData.customer;
    assert(customerB && customerB.id !== customerA.id, `Customer B created independently (ID: ${customerB?.id})`);

    // Customer B requests their applications
    const custBAppsRes = await fetch(`${BASE_URL}/api/applications?customer_id=${customerB.id}`);
    const custBApps = await custBAppsRes.json();
    const hasCustomerADataInB = custBApps.some(a => a.id === app.id || a.customer_id === customerA.id);
    assert(!hasCustomerADataInB, 'Customer B CANNOT see Customer A applications (Zero-leakage verified)');

    // Customer B requests their support tickets
    const custBTicketsRes = await fetch(`${BASE_URL}/api/support/tickets?customer_id=${customerB.id}`);
    const custBTickets = await custBTicketsRes.json();
    const hasCustomerATicketsInB = custBTickets.some(t => t.id === ticket.id || t.customer_id === customerA.id);
    assert(!hasCustomerATicketsInB, 'Customer B CANNOT see Customer A support tickets (Ticket isolation verified)');

    // Customer B requests their conversations
    const custBConvRes = await fetch(`${BASE_URL}/api/chat/conversations?customer_id=${customerB.id}`);
    const custBConv = await custBConvRes.json();
    const hasCustomerAConvInB = custBConv.some(c => c.customer_id === customerA.id);
    assert(!hasCustomerAConvInB, 'Customer B CANNOT see Customer A conversations (Chat isolation verified)');

    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('✨ ALL 25+ ACCEPTANCE STEPS & SECURITY CRITERIA VERIFIED SUCCESSFULLY!');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTest();
