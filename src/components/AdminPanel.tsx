import React, { useState, useEffect } from 'react';
import {
  DigitalService,
  DigitalApplication,
  ApplicationStatus,
  APPLICATION_STATUSES,
  DynamicFormField,
  ChatConversation,
  ChatMessage,
  SupportTicket,
  SupportTicketMessage,
  ApplicationDocument,
} from '@/types/digitalSeva';
import { StatusBadge } from './StatusBadge';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  FileCheck,
  Settings,
  Shield,
  LifeBuoy,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  History,
  Check,
  X,
  FileUp,
  Send,
  Eye,
  Paperclip,
  Clock,
  Award,
} from 'lucide-react';

interface AdminPanelProps {
  applications: DigitalApplication[];
  services: DigitalService[];
  adminEmail: string;
  onUpdateStatus: (applicationId: string, newStatus: string, remark: string) => Promise<void>;
  onSaveService: (service: Partial<DigitalService>) => Promise<void>;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  applications,
  services,
  adminEmail,
  onUpdateStatus,
  onSaveService,
  onRefresh,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'applications'
    | 'services'
    | 'form_builder'
    | 'documents'
    | 'payments'
    | 'chats'
    | 'support'
    | 'reports'
    | 'audit_logs'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<DigitalApplication | null>(null);

  // Status Change State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('Processing');
  const [statusRemark, setStatusRemark] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Final Document Upload Modal
  const [finalDocModalOpen, setFinalDocModalOpen] = useState(false);
  const [finalDocName, setFinalDocName] = useState('Certificate.pdf');
  const [finalDocUrl, setFinalDocUrl] = useState('/downloads/final_doc.pdf');
  const [finalDocRemark, setFinalDocRemark] = useState('Final document processed and ready for download.');
  const [uploadingFinalDoc, setUploadingFinalDoc] = useState(false);

  // Application Detail Modal
  const [appDetailModalOpen, setAppDetailModalOpen] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  // Edit / Add Service State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<DigitalService>>({});

  // Dynamic Form Field Builder State
  const [selectedServiceForForm, setSelectedServiceForForm] = useState<DigitalService | null>(
    services[0] || null
  );

  // Live Chat State
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [sendingTicketReply, setSendingTicketReply] = useState(false);

  // Initial load for chats and support tickets
  useEffect(() => {
    fetchChats();
    fetchSupportTickets();
  }, [activeTab]);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data || []);
        if (data && data.length > 0 && !activeConversation) {
          setActiveConversation(data[0]);
          loadChatMessages(data[0].id);
        }
      }
    } catch (e) {
      console.warn('Fetch conversations error:', e);
    }
  };

  const loadChatMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversation_id=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data || []);
      }
    } catch (e) {
      console.warn('Fetch messages error:', e);
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data || []);
        if (data && data.length > 0 && !activeTicket) {
          setActiveTicket(data[0]);
        }
      }
    } catch (e) {
      console.warn('Fetch tickets error:', e);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeConversation) return;

    setSendingReply(true);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          sender_id: 'admin',
          sender_role: 'admin',
          sender_name: 'Director (Admin)',
          message_text: adminReplyText.trim(),
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChatMessages((prev) => [...prev, newMsg]);
        setAdminReplyText('');
        fetchChats();
      }
    } catch (e) {
      alert('Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicket) return;

    setSendingTicketReply(true);
    try {
      const res = await fetch(`/api/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: 'admin',
          sender_role: 'admin',
          sender_name: 'Director (Admin)',
          message_text: ticketReplyText.trim(),
        }),
      });

      if (res.ok) {
        setTicketReplyText('');
        fetchSupportTickets();
      }
    } catch (e) {
      alert('Error sending ticket reply');
    } finally {
      setSendingTicketReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => {
    try {
      await fetch('/api/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, status }),
      });
      fetchSupportTickets();
    } catch (e) {
      alert('Error updating ticket status');
    }
  };

  // Review Document (Verify or Reject / Re-upload Required)
  const handleReviewDocument = async (docId: string, status: 'Verified' | 'Rejected' | 'Re-upload Required') => {
    const reason = status !== 'Verified' ? prompt('Enter rejection / re-upload reason for the citizen:') : '';
    if (status !== 'Verified' && !reason) return;

    try {
      const res = await fetch(`/api/documents/${docId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        await onRefresh();
        alert(`Document marked as ${status}`);
      }
    } catch (e) {
      alert('Error reviewing document');
    }
  };

  // Final Document Upload & Complete
  const handleUploadFinalDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUploadingFinalDoc(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/final-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: finalDocName,
          file_url: finalDocUrl,
          remark: finalDocRemark,
        }),
      });

      if (!res.ok) throw new Error('Failed to upload final document');
      await onRefresh();
      setFinalDocModalOpen(false);
      alert('Final document uploaded. Application marked as Completed!');
    } catch (err: any) {
      alert(err.message || 'Error uploading final document');
    } finally {
      setUploadingFinalDoc(false);
    }
  };

  // Compute metrics
  const totalRevenue = applications.reduce((acc, app) => {
    if (['Payment Received', 'Document Checking', 'Processing', 'Completed'].includes(app.status)) {
      return acc + (Number(app.locked_price) || 0);
    }
    return acc;
  }, 0);

  const statusCounts = APPLICATION_STATUSES.reduce((acc, st) => {
    acc[st] = applications.filter((a) => a.status === st).length;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_mobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenStatusModal = (app: DigitalApplication) => {
    setSelectedApp(app);
    setTargetStatus(app.status);
    setStatusRemark(app.admin_remark || '');
    setStatusModalOpen(true);
  };

  const handleExecuteStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdatingStatus(true);
    try {
      await onUpdateStatus(selectedApp.id, targetStatus, statusRemark);
      setStatusModalOpen(false);
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveService(editingService);
      setServiceModalOpen(false);
      setEditingService({});
    } catch (err: any) {
      alert(`Error saving service: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-[#0b101c] border-b border-emerald-500/20 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">
                  શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા • ADMIN CONTROL PANEL
                </h1>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  MVP VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{adminEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRefresh()}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subnav Menu Tabs */}
      <nav className="bg-[#0f172a] border-b border-slate-800 px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'applications'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'chats'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Chats ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'support'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Support Requests ({supportTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'services'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Services & Pricing ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('form_builder')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'form_builder'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Dynamic Form Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'documents'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Document Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Reports & Exports</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'audit_logs'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
        </div>
      </nav>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                  કુલ વસૂલાત (Total Verified Revenue)
                </span>
                <div className="text-3xl font-extrabold font-mono text-white mt-1">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Total Applications: <strong className="text-white">{applications.length}</strong> • Services Catalog: <strong className="text-white">{services.length}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/reports?type=applications&format=csv"
                  download
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report (CSV)</span>
                </a>
              </div>
            </div>

            {/* 8 Strict Status KPI Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                8 સ્ટેટસ પાઇપલાઇન (Application Status Pipeline)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {APPLICATION_STATUSES.map((status) => (
                  <div
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setActiveTab('applications');
                    }}
                    className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] space-y-1"
                  >
                    <StatusBadge status={status} size="sm" showGujarati={false} />
                    <div className="text-2xl font-bold font-mono text-white mt-1">
                      {statusCounts[status] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">તાજેતરની નવી અરજીઓ (Recent Applications)</h3>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  બધી જુઓ
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#162035] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Application No</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3">Locked Fee</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                          {app.application_number}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">{app.service_name}</td>
                        <td className="py-2.5 px-3">{app.applicant_name} ({app.applicant_mobile})</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                          ₹{app.locked_price}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={app.status} size="sm" showGujarati={false} />
                        </td>
                        <td className="py-2.5 px-3 space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setAppDetailModalOpen(true);
                            }}
                            className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-[11px] border border-blue-500/30"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30"
                          >
                            Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLICATIONS PIPELINE & MANAGEMENT */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white">અરજી વ્યવસ્થાપન (Application Pipeline)</h2>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search Number, Name, Mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#162035] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="All">All Statuses ({applications.length})</option>
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st} ({statusCounts[st] || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#162035] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Application Number</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Locked Fee</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {app.application_number}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{app.service_name}</td>
                        <td className="py-3 px-4">
                          <div>{app.applicant_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{app.applicant_mobile}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          ₹{app.locked_price}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400 font-mono">
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setAppDetailModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold text-xs border border-blue-500/30"
                          >
                            Details & Docs
                          </button>

                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setFinalDocModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-sm"
                            title="Upload Final Document"
                          >
                            Final Doc
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CUSTOMER CHATS */}
        {activeTab === 'chats' && (
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3 h-[600px]">
            {/* Conversation List */}
            <div className="border-r border-slate-800 flex flex-col h-full bg-[#0b101c]">
              <div className="p-3.5 border-b border-slate-800 font-bold text-xs text-white">
                Customer Conversations ({conversations.length})
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      loadChatMessages(conv.id);
                    }}
                    className={`p-3.5 cursor-pointer text-xs transition-colors ${
                      activeConversation?.id === conv.id
                        ? 'bg-blue-600/20 text-white border-l-4 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-white">{conv.customer_name || 'Customer'}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {conv.application_number && (
                      <span className="text-[10px] font-mono text-blue-400 block mb-1">
                        App: {conv.application_number}
                      </span>
                    )}
                    <p className="text-[11px] truncate text-slate-300">{conv.last_message}</p>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <p className="p-6 text-center text-xs text-slate-500">No active customer chats</p>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className="col-span-2 flex flex-col h-full bg-[#090d16]">
              {activeConversation ? (
                <>
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs bg-[#111827]">
                    <div>
                      <strong className="text-white block text-sm">{activeConversation.customer_name}</strong>
                      <span className="text-slate-400 text-[11px]">
                        Mobile: {activeConversation.customer_mobile || 'N/A'} • {activeConversation.application_number || 'General Chat'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => {
                      const isAdmin = msg.sender_role === 'admin';
                      return (
                        <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-slate-500 px-1 mb-0.5">
                            {msg.sender_name || (isAdmin ? 'Admin' : 'Customer')}
                          </span>
                          <div
                            className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.message_text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleSendAdminReply} className="p-3 border-t border-slate-800 flex gap-2 bg-[#111827]">
                    <input
                      type="text"
                      placeholder="Type reply to customer..."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !adminReplyText.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  Select a customer conversation to chat
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SUPPORT REQUESTS */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">ગ્રાહક સપોર્ટ વિનંતીઓ (Support Tickets)</h2>

            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-3 h-[600px]">
              {/* Ticket List */}
              <div className="border-r border-slate-800 flex flex-col h-full bg-[#0b101c]">
                <div className="p-3.5 border-b border-slate-800 font-bold text-xs text-white">
                  Tickets List ({supportTickets.length})
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                  {supportTickets.map((tkt) => (
                    <div
                      key={tkt.id}
                      onClick={() => setActiveTicket(tkt)}
                      className={`p-3.5 cursor-pointer text-xs transition-colors ${
                        activeTicket?.id === tkt.id
                          ? 'bg-blue-600/20 text-white border-l-4 border-blue-500'
                          : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono font-bold text-blue-400">{tkt.ticket_number}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tkt.status === 'Open'
                              ? 'bg-rose-500/20 text-rose-400'
                              : tkt.status === 'Resolved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tkt.status}
                        </span>
                      </div>
                      <p className="font-semibold text-white truncate">{tkt.subject}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {tkt.customer_name} ({tkt.category})
                      </p>
                    </div>
                  ))}
                  {supportTickets.length === 0 && (
                    <p className="p-6 text-center text-xs text-slate-500">No support tickets</p>
                  )}
                </div>
              </div>

              {/* Ticket Thread */}
              <div className="col-span-2 flex flex-col h-full bg-[#090d16]">
                {activeTicket ? (
                  <>
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs bg-[#111827]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{activeTicket.ticket_number}</span>
                          <span className="text-white font-bold">{activeTicket.subject}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          Citizen: {activeTicket.customer_name} ({activeTicket.customer_mobile}) • Category: {activeTicket.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={activeTicket.status}
                          onChange={(e: any) => handleUpdateTicketStatus(activeTicket.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs outline-none"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {activeTicket.messages?.map((msg) => {
                        const isAdmin = msg.sender_role === 'admin';
                        return (
                          <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-slate-500 px-1 mb-0.5">
                              {msg.sender_name || (isAdmin ? 'Admin' : 'Customer')}
                            </span>
                            <div
                              className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                                isAdmin
                                  ? 'bg-emerald-600 text-white rounded-br-none'
                                  : 'bg-slate-800 text-slate-200 rounded-bl-none'
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.message_text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendTicketReply} className="p-3 border-t border-slate-800 flex gap-2 bg-[#111827]">
                      <input
                        type="text"
                        placeholder="Type official reply to resolve citizen inquiry..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sendingTicketReply || !ticketReplyText.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Select a support ticket to review and reply
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES & PRICE MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">સેવા સૂચિ અને કિંમત સંચાલન (Services & Pricing)</h2>
                <p className="text-xs text-slate-400">
                  Admin can add, edit, change official price, and toggle active status.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingService({
                    name: '',
                    name_gu: '',
                    service_code: '',
                    price: 150,
                    category: 'Government Scheme',
                    description: '',
                    active: true,
                  });
                  setServiceModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                        {service.service_code}
                      </span>
                      <span className="font-mono text-base font-bold text-emerald-400">
                        ₹{service.price}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{service.name_gu}</h4>
                    <p className="text-xs text-slate-400">{service.name}</p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        service.active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {service.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>

                    <button
                      onClick={() => {
                        setEditingService(service);
                        setServiceModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Price & Info</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DYNAMIC FORM BUILDER */}
        {activeTab === 'form_builder' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">ડાયનેમિક ફોર્મ બિલ્ડર (Dynamic Form Builder)</h2>
              <p className="text-xs text-slate-400">
                Configure dynamic application form fields for each government service without altering code.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-300">સેવા પસંદ કરો (Select Service):</label>
              <select
                value={selectedServiceForForm?.id || ''}
                onChange={(e) => {
                  const s = services.find((srv) => srv.id === e.target.value);
                  if (s) setSelectedServiceForForm(s);
                }}
                className="bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name_gu} ({srv.service_code}) - ₹{srv.price}
                  </option>
                ))}
              </select>
            </div>

            {selectedServiceForForm && (
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">
                    Fields for: {selectedServiceForForm.name_gu}
                  </h3>
                  <button
                    onClick={() => {
                      const newField: DynamicFormField = {
                        id: 'fld-' + Date.now(),
                        field_name: 'new_field_' + Math.floor(Math.random() * 100),
                        label: 'New Field',
                        label_gu: 'નવી વિગત',
                        field_type: 'text',
                        is_required: true,
                        display_order: (selectedServiceForForm.form_fields?.length || 0) + 1,
                      };
                      const updatedFields = [...(selectedServiceForForm.form_fields || []), newField];
                      onSaveService({ ...selectedServiceForForm, form_fields: updatedFields });
                      setSelectedServiceForForm({ ...selectedServiceForForm, form_fields: updatedFields });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Form Field</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(selectedServiceForForm.form_fields || []).map((field) => (
                    <div
                      key={field.id}
                      className="p-4 rounded-xl bg-[#162035] border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{field.label_gu}</span>
                          <span className="text-slate-400">({field.label})</span>
                          <span className="font-mono text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">
                            {field.field_type}
                          </span>
                          {field.is_required && (
                            <span className="text-[10px] text-rose-400 font-bold">Required</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">Field Key: {field.field_name}</p>
                      </div>

                      <button
                        onClick={() => {
                          const updated = (selectedServiceForForm.form_fields || []).filter((f) => f.id !== field.id);
                          onSaveService({ ...selectedServiceForForm, form_fields: updated });
                          setSelectedServiceForForm({ ...selectedServiceForForm, form_fields: updated });
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="Delete Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOCUMENT MANAGER */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">દસ્તાવેજ વ્યવસ્થાપન (Document Review & Verification)</h2>
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 space-y-3">
              {applications.flatMap((a) => a.documents || []).length > 0 ? (
                applications
                  .flatMap((a) =>
                    (a.documents || []).map((d) => ({ ...d, app_no: a.application_number }))
                  )
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-[#162035] border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400">{doc.app_no}</span>
                          <span className="font-semibold text-white">{doc.doc_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{doc.file_name}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            doc.status === 'Verified'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : doc.status === 'Re-upload Required' || doc.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {doc.status}
                        </span>

                        <button
                          onClick={() => handleReviewDocument(doc.id, 'Verified')}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReviewDocument(doc.id, 'Re-upload Required')}
                          className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30"
                        >
                          Reject / Re-upload
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">હાલ કોઈ દસ્તાવેજ ઉપલબ્ધ નથી.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">ચુકવણી વ્યવહારો (Payment Orders & Verification)</h2>
            <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#162035] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Application</th>
                      <th className="py-2.5 px-3">Applicant</th>
                      <th className="py-2.5 px-3">Locked Fee</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                          {app.application_number}
                        </td>
                        <td className="py-2.5 px-3">{app.applicant_name} ({app.applicant_mobile})</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          ₹{app.locked_price}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={app.status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS & EXPORTS */}
        {activeTab === 'reports' && (
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white">અહેવાલ અને નિકાસ (Reports & CSV Exports)</h2>
            <p className="text-xs text-slate-400">
              Export comprehensive reports for accounting, auditing, and tax filing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#162035] border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold text-white">Applications Master Report</h4>
                <p className="text-[11px] text-slate-400">
                  Complete list of all applications, locked fees, applicant data, and current statuses.
                </p>
                <a
                  href="/api/admin/reports?type=applications&format=csv"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Applications CSV</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#162035] border border-slate-700/80 space-y-2">
                <h4 className="text-xs font-bold text-white">Support Tickets Report</h4>
                <p className="text-[11px] text-slate-400">
                  Citizen grievance tickets, categories, and resolution logs.
                </p>
                <a
                  href="/api/admin/reports?type=support&format=csv"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tickets CSV</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white">ઓડિટ લોગ (Immutable Audit Trail)</h2>
            <p className="text-xs text-slate-400">
              Security log of all administrative actions, status changes, and logins.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {applications.flatMap((a) => a.status_history || []).map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-[#162035] border border-slate-800 text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-white">{h.changed_by}:</span>{' '}
                    <span className="text-slate-300">{h.remark}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Status Update Modal */}
      {statusModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              અરજી સ્ટેટસ અપડેટ (Change Application Status)
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              {selectedApp.application_number} • {selectedApp.applicant_name}
            </p>

            <form onSubmit={handleExecuteStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  નવું સ્ટેટસ પસંદ કરો (Select from strict 8 statuses) *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-[#162035] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                >
                  {APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ઓપરેટર નોંધ / રીમાર્ક (Admin Remark for History) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  placeholder="દા.ત. સરકારી પોર્ટલ પર ફોર્મ સબમિટ થયું છે, એકનોલેજમેન્ટ નંબર જનરેટ થયો."
                  className="w-full bg-[#162035] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingStatus ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>સ્ટેટસ સેવ કરો (Save Status & Notify Customer)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Final Document Modal */}
      {finalDocModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setFinalDocModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              અંતિમ પરિણામ અપલોડ (Upload Final Certificate / Smart Card)
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              {selectedApp.application_number} • {selectedApp.service_name}
            </p>

            <form onSubmit={handleUploadFinalDocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  દસ્તાવેજ ફાઇલ નામ (File Name) *
                </label>
                <input
                  type="text"
                  required
                  value={finalDocName}
                  onChange={(e) => setFinalDocName(e.target.value)}
                  placeholder="e.g. PM_Kisan_Registration_Receipt.pdf"
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ફાઇલ ડાઉનલોડ પાથ / URL *
                </label>
                <input
                  type="text"
                  required
                  value={finalDocUrl}
                  onChange={(e) => setFinalDocUrl(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  સમાપ્તિ નોંધ (Completion Remark for Citizen)
                </label>
                <textarea
                  rows={2}
                  value={finalDocRemark}
                  onChange={(e) => setFinalDocRemark(e.target.value)}
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingFinalDoc}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingFinalDoc ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Upload & Mark as Completed</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Application Detail & Docs Review Modal */}
      {appDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setAppDetailModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-sm font-bold text-blue-400">
                  {selectedApp.application_number}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedApp.service_name}</h3>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {/* Applicant & Form Data */}
            <div className="grid grid-cols-2 gap-3 bg-[#162035] p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block">Applicant Name:</span>
                <strong className="text-white">{selectedApp.applicant_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Mobile:</span>
                <strong className="text-white font-mono">{selectedApp.applicant_mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Locked Fee:</span>
                <strong className="text-emerald-400 font-mono text-sm">₹{selectedApp.locked_price}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Submitted At:</span>
                <strong className="text-white font-mono">{new Date(selectedApp.submitted_at).toLocaleString()}</strong>
              </div>
            </div>

            {/* Dynamic Form Data Submitted */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
                અરજદારે ભરેલી વિગત (Submitted Dynamic Form Data)
              </h4>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-blue-200 overflow-x-auto">
                {JSON.stringify(selectedApp.form_data, null, 2)}
              </pre>
            </div>

            {/* Uploaded Documents List */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
                અપલોડ થયેલ દસ્તાવેજો (Uploaded Documents Review)
              </h4>
              <div className="space-y-2">
                {(selectedApp.documents || []).length > 0 ? (
                  selectedApp.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-[#162035] border border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block">{doc.doc_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{doc.file_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                          {doc.status}
                        </span>
                        <button
                          onClick={() => handleReviewDocument(doc.id, 'Verified')}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewDocument(doc.id, 'Re-upload Required')}
                          className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 bg-[#162035] p-3 rounded-xl">No documents attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setServiceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">
              {editingService.id ? 'સેવા વિગત સુધારો (Edit Service)' : 'નવી સેવા ઉમેરો (Add Service)'}
            </h3>

            <form onSubmit={handleSaveServiceSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={editingService.service_code || ''}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, service_code: e.target.value.toUpperCase() }))
                    }
                    placeholder="PAN, AYU, VOTER"
                    className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Official Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingService.price || ''}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Gujarati Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name_gu || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, name_gu: e.target.value }))
                  }
                  placeholder="દા.ત. નવું PAN Card"
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">English Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="New PAN Card"
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-white outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active_service_check"
                  checked={editingService.active ?? true}
                  onChange={(e) =>
                    setEditingService((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <label htmlFor="active_service_check" className="text-slate-300 cursor-pointer">
                  સક્રિય સેવા (Active for citizens)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md mt-2"
              >
                સેવ કરો (Save Service)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
