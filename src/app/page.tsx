'use client';

import React, { useState, useEffect } from 'react';
import {
  DigitalService,
  DigitalApplication,
  CustomerProfile,
  STATUS_LABELS,
} from '@/types/digitalSeva';
import { INITIAL_SERVICES, BUSINESS_INFO } from '@/lib/constants';
import { PublicWebsite } from '@/components/PublicWebsite';
import { CustomerPortal } from '@/components/CustomerPortal';
import { AdminPanel } from '@/components/AdminPanel';
import { AuthModal } from '@/components/AuthModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { ServiceApplicationModal } from '@/components/ServiceApplicationModal';
import { PaymentModal } from '@/components/PaymentModal';
import { CustomerChatDrawer } from '@/components/CustomerChatDrawer';
import { SupportTicketModal } from '@/components/SupportTicketModal';
import {
  Shield,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  Globe,
  MessageCircle,
} from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'website' | 'portal' | 'admin'>('website');
  const [currentUser, setCurrentUser] = useState<CustomerProfile | null>(null);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Data states
  const [services, setServices] = useState<DigitalService[]>(INITIAL_SERVICES);
  const [applications, setApplications] = useState<DigitalApplication[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [selectedServiceToApply, setSelectedServiceToApply] = useState<DigitalService | null>(null);
  const [paymentApplication, setPaymentApplication] = useState<DigitalApplication | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Initial load
  useEffect(() => {
    // Restore session
    try {
      const storedCustomer = localStorage.getItem('srk_customer');
      if (storedCustomer) {
        setCurrentUser(JSON.parse(storedCustomer));
      }

      const storedAdmin = localStorage.getItem('srk_admin_email');
      if (storedAdmin) {
        setAdminUser(storedAdmin);
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    }

    loadServices();
    loadApplications();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setServices(data);
        }
      }
    } catch (e) {
      console.warn('Load services fallback to constants:', e);
    }
  };

  const loadApplications = async (customerId?: string) => {
    try {
      const url = customerId
        ? `/api/applications?customer_id=${customerId}`
        : '/api/applications';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApplications(data || []);
      }
    } catch (e) {
      console.warn('Load applications error:', e);
    }
  };

  // Handle Apply Service Click
  const handleApplyService = (service: DigitalService) => {
    if (!currentUser) {
      setSelectedServiceToApply(service);
      setAuthModalOpen(true);
      return;
    }
    setSelectedServiceToApply(service);
  };

  // Handle Form Submission
  const handleSubmitApplication = async (
    service: DigitalService,
    formData: Record<string, any>,
    files: File[]
  ): Promise<DigitalApplication> => {
    if (!currentUser) throw new Error('Citizen authentication required');

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: currentUser.id,
        service_id: service.id,
        applicant_name: formData.app_name || currentUser.full_name,
        applicant_mobile: formData.app_mobile || currentUser.mobile,
        form_data: formData,
      }),
    });

    if (!res.ok) throw new Error('Could not submit application');
    const created = await res.json();

    // Attach documents if any
    for (const file of files) {
      await fetch(`/api/applications/${created.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_name: file.name,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: 'Customer',
        }),
      });
    }

    setApplications((prev) => [created, ...prev]);
    showToast(`Application ${created.application_number} Created Successfully!`);
    return created;
  };

  // Admin Update Status
  const handleAdminUpdateStatus = async (
    applicationId: string,
    newStatus: string,
    remark: string
  ) => {
    const res = await fetch(`/api/applications/${applicationId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status: newStatus,
        remark,
        changed_by: adminUser || 'Admin',
      }),
    });

    if (!res.ok) throw new Error('Failed to update status on server');
    const updated = await res.json();

    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, ...updated } : app))
    );

    showToast(`Status updated to ${newStatus}`);
  };

  // Admin Save Service
  const handleAdminSaveService = async (service: Partial<DigitalService>) => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });

    if (!res.ok) throw new Error('Failed to save service');
    const saved = await res.json();

    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [...prev, saved];
    });

    showToast(`Service "${saved.name_gu}" saved successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#162035]/95 border border-blue-500/40 text-blue-200 text-xs px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner Navigation: Switch Public Web / Customer Portal / Admin Portal */}
      <header className="bg-[#0b101c] border-b border-[#1a2438] px-4 py-2 text-xs sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              onClick={() => setView('website')}
              className="text-blue-400 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:text-blue-300"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{BUSINESS_INFO.domain}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              📍 Rudra Complex, Timberwa Road, Sadhli, Vadodara • 📞 8511566026
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('website')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                view === 'website'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              વેબસાઇટ (Public)
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setView('portal');
                } else {
                  setAuthModalOpen(true);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                view === 'portal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ગ્રાહક પોર્ટલ (Customer)
            </button>

            <button
              onClick={() => {
                if (adminUser) {
                  setView('admin');
                } else {
                  setAdminModalOpen(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                view === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <div className="flex-1">
        {view === 'admin' && adminUser ? (
          <AdminPanel
            applications={applications}
            services={services}
            adminEmail={adminUser}
            onUpdateStatus={handleAdminUpdateStatus}
            onSaveService={handleAdminSaveService}
            onRefresh={async () => {
              await loadServices();
              await loadApplications();
              showToast('Data refreshed.');
            }}
            onLogout={() => {
              setAdminUser(null);
              localStorage.removeItem('srk_admin_email');
              setView('website');
              showToast('Admin logged out.');
            }}
          />
        ) : view === 'portal' ? (
          <CustomerPortal
            currentUser={currentUser}
            services={services}
            applications={applications}
            onLoginClick={() => setAuthModalOpen(true)}
            onLogoutClick={() => {
              setCurrentUser(null);
              localStorage.removeItem('srk_customer');
              setView('website');
              showToast('Logged out successfully.');
            }}
            onApplyService={handleApplyService}
            onOpenPayment={(app) => setPaymentApplication(app)}
            onOpenChat={() => setChatDrawerOpen(true)}
            onOpenSupport={() => setSupportModalOpen(true)}
            onRefresh={async () => {
              await loadApplications(currentUser?.id);
              showToast('Updated applications.');
            }}
          />
        ) : (
          <PublicWebsite
            services={services}
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenAdminModal={() => setAdminModalOpen(true)}
            onApplyService={handleApplyService}
            onOpenChat={() => setChatDrawerOpen(true)}
            onGoToPortal={() => setView('portal')}
          />
        )}
      </div>

      {/* Floating Gemini AI Sahayak Button */}
      <button
        onClick={() => setChatDrawerOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-blue-950/50 border border-blue-400/30 active:scale-95 transition-all"
        title="AI Digital Sahayak (ગુજરાતી / English)"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>AI ડિજિટલ સહાયક</span>
      </button>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918511566026?text=Hello%20Shree%20Radhe%20Krishna%20Digital%20Service,%20I%20need%20assistance."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xl shadow-emerald-950/50 border border-emerald-400/30 active:scale-95 transition-all"
        title="WhatsApp Support (8511566026)"
      >
        <MessageCircle className="w-4 h-4 fill-current" />
        <span className="hidden sm:inline">WhatsApp 8511566026</span>
      </a>

      {/* Customer Mobile OTP Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(customer) => {
          setCurrentUser(customer);
          setView('portal');
          loadApplications(customer.id);
          showToast(`Welcome ${customer.full_name}!`);

          // If user was attempting to apply to a service, open the modal
          if (selectedServiceToApply) {
            // will automatically open since selectedServiceToApply is set
          }
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onAdminLoginSuccess={(email) => {
          setAdminUser(email);
          localStorage.setItem('srk_admin_email', email);
          setView('admin');
          loadApplications();
          showToast('Admin Portal unlocked!');
        }}
      />

      {/* Multi-step Service Application Modal */}
      {selectedServiceToApply && (
        <ServiceApplicationModal
          isOpen={Boolean(selectedServiceToApply)}
          service={selectedServiceToApply}
          currentUser={currentUser}
          onClose={() => setSelectedServiceToApply(null)}
          onSubmit={handleSubmitApplication}
          onPaymentPrompt={(app) => {
            setSelectedServiceToApply(null);
            setPaymentApplication(app);
          }}
        />
      )}

      {/* Payment Checkout Modal */}
      {paymentApplication && (
        <PaymentModal
          isOpen={Boolean(paymentApplication)}
          application={paymentApplication}
          onClose={() => setPaymentApplication(null)}
          onPaymentSuccess={(appId) => {
            setPaymentApplication(null);
            showToast('Payment verified successfully!');
            loadApplications(currentUser?.id);
          }}
        />
      )}

      {/* Real-time Customer ↔ Admin Chat / AI Sahayak Drawer */}
      <CustomerChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        currentUser={currentUser}
        applications={applications}
      />

      {/* Support Ticket Modal */}
      <SupportTicketModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        currentUser={currentUser}
        applications={applications}
        onTicketCreated={(ticket) => {
          showToast(`Support Ticket ${ticket.ticket_number} Submitted!`);
        }}
      />
    </div>
  );
}
