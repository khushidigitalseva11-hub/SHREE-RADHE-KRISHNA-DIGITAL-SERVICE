import React, { useState } from 'react';
import {
  DigitalService,
  DigitalApplication,
  CustomerProfile,
  ApplicationDocument,
  SupportTicket,
  AppNotification,
} from '@/types/digitalSeva';
import { StatusBadge } from './StatusBadge';
import {
  LayoutDashboard,
  User,
  FileText,
  PlusCircle,
  MessageSquare,
  FileCheck2,
  CreditCard,
  Bell,
  LifeBuoy,
  LogOut,
  ArrowRight,
  ExternalLink,
  Download,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  Calendar,
} from 'lucide-react';

interface CustomerPortalProps {
  currentUser: CustomerProfile | null;
  services: DigitalService[];
  applications: DigitalApplication[];
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onApplyService: (service: DigitalService) => void;
  onOpenPayment: (app: DigitalApplication) => void;
  onOpenChat: () => void;
  onOpenSupport: () => void;
  onRefresh: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentUser,
  services,
  applications,
  onLoginClick,
  onLogoutClick,
  onApplyService,
  onOpenPayment,
  onOpenChat,
  onOpenSupport,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'applications'
    | 'services'
    | 'documents'
    | 'payments'
    | 'support'
    | 'profile'
  >('dashboard');

  const [selectedAppDetail, setSelectedAppDetail] = useState<DigitalApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute Dashboard Metrics
  const activeApps = applications.filter(
    (a) => a.status !== 'Completed' && a.status !== 'Rejected / Cancelled'
  );
  const pendingPayments = applications.filter((a) => a.status === 'Payment Pending');
  const processingApps = applications.filter((a) => a.status === 'Processing');
  const completedApps = applications.filter((a) => a.status === 'Completed');

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Unique categories for services
  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name_gu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-[#0f172a] border border-blue-500/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            ગ્રાહક પોર્ટલ એક્સેસ કરો (Customer Portal)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            તમારી તમામ સરકારી અરજીઓ ટ્રેક કરવા, ઓનલાઈન ચુકવણી કરવા અને દસ્તાવેજો ડાઉનલોડ કરવા માટે મોબાઈલ નંબર દ્વારા લોગિન કરો.
          </p>
          <button
            onClick={onLoginClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-950/60 transition-all flex items-center gap-2 mx-auto"
          >
            <span>મોબાઈલ નંબર + OTP થી લોગિન કરો</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Welcome Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-blue-500/30 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
            નાગરિક ડેશબોર્ડ (Citizen Dashboard)
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            નમસ્તે, {currentUser.full_name}
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>📱 +91 {currentUser.mobile}</span>
            <span>•</span>
            <span>📍 {currentUser.address || 'સાધલી, શિનોર, વડોદરા'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ચેટ સહાય (Chat)</span>
          </button>

          <button
            onClick={onOpenSupport}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>સહાય ટિકિટ</span>
          </button>

          <button
            onClick={onLogoutClick}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Navigation + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Nav Menu */}
        <div className="lg:col-span-1 space-y-1 bg-[#0b101c] p-3 rounded-2xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>ડેશબોર્ડ (Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" />
              <span>મારી અરજીઓ (Applications)</span>
            </div>
            {applications.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-300">
                {applications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'services'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>નવી સેવા અરજી (New Service)</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>મારા દસ્તાવેજો (My Documents)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>ચુકવણી (Payments)</span>
            </div>
            {pendingPayments.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold animate-pulse">
                {pendingPayments.length} બાકી
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>મારી પ્રોફાઇલ (My Profile)</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Status Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-blue-500/20 shadow-md">
                  <span className="text-[11px] text-slate-400 block">ચાલુ અરજીઓ</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold font-mono text-white">
                      {activeApps.length}
                    </span>
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-[10px] text-blue-400 font-medium">Active Applications</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/20 shadow-md">
                  <span className="text-[11px] text-slate-400 block">ચુકવણી બાકી</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold font-mono text-amber-400">
                      {pendingPayments.length}
                    </span>
                    <CreditCard className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">Pending Payments</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-cyan-500/20 shadow-md">
                  <span className="text-[11px] text-slate-400 block">પ્રોસેસિંગમાં</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold font-mono text-cyan-400">
                      {processingApps.length}
                    </span>
                    <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                  <span className="text-[10px] text-cyan-400 font-medium">Under Processing</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f172a] border border-emerald-500/20 shadow-md">
                  <span className="text-[11px] text-slate-400 block">પૂર્ણ થયેલ</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {completedApps.length}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Completed</span>
                </div>
              </div>

              {/* Pending Payment Alert Banner */}
              {pendingPayments.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-200">
                        તમારી {pendingPayments.length} અરજી માટે ચુકવણી બાકી છે!
                      </h4>
                      <p className="text-[11px] text-amber-300/80">
                        અરજી: {pendingPayments[0].application_number} ({pendingPayments[0].service_name}) - ફી: ₹{pendingPayments[0].locked_price}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenPayment(pendingPayments[0])}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-950/50 shrink-0"
                  >
                    હમણાં ચુકવો (Pay Now ₹{pendingPayments[0].locked_price})
                  </button>
                </div>
              )}

              {/* Recent Applications Section */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>તાજેતરની અરજીઓ (Recent Applications)</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-xs text-blue-400 hover:underline font-semibold"
                  >
                    બધી જુઓ ({applications.length})
                  </button>
                </div>

                {applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-[#162035] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">
                              {app.application_number}
                            </span>
                            <StatusBadge status={app.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-300 font-medium">{app.service_name}</p>
                          <span className="text-[11px] text-slate-500 font-mono">
                            તારીખ: {new Date(app.submitted_at).toLocaleDateString()} • લૉક ફી: ₹{app.locked_price}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {app.status === 'Payment Pending' && (
                            <button
                              onClick={() => onOpenPayment(app)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm"
                            >
                              Pay ₹{app.locked_price}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedAppDetail(app)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>વિગત</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <p className="text-xs">તમે હજી કોઈ સેવા માટે અરજી કરેલ નથી.</p>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      નવી સેવા અરજી શરૂ કરો
                    </button>
                  </div>
                )}
              </div>

              {/* Service Quick Links Grid */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>લોકપ્રિય સેવાઓ (Apply Instantly)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {services.slice(0, 6).map((service) => (
                    <div
                      key={service.id}
                      onClick={() => onApplyService(service)}
                      className="p-3.5 rounded-xl bg-[#162035] border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all hover:scale-[1.01] space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                          {service.service_code}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          ₹{service.price}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{service.name_gu}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY APPLICATIONS WITH FILTER AND DETAIL */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white">મારી તમામ અરજીઓ (Applications)</h3>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="અરજી નંબર શોધો..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#162035] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#162035] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="All">બધા સ્ટેટસ (All Status)</option>
                    <option value="Application Received">Application Received</option>
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Payment Received">Payment Received</option>
                    <option value="Document Checking">Document Checking</option>
                    <option value="Processing">Processing</option>
                    <option value="Correction Required">Correction Required</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected / Cancelled">Rejected</option>
                  </select>
                </div>
              </div>

              {filteredApps.length > 0 ? (
                <div className="space-y-3">
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">
                            {app.application_number}
                          </span>
                          <StatusBadge status={app.status} />
                        </div>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          ₹{app.locked_price} (Locked)
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        <strong>સેવા:</strong> {app.service_name} • <strong>અરજદાર:</strong> {app.applicant_name} ({app.applicant_mobile})
                      </div>

                      {app.admin_remark && (
                        <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/30 text-xs text-blue-200">
                          <strong>ઓપરેટર નોંધ:</strong> {app.admin_remark}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                        <span>સબમિટ તારીખ: {new Date(app.submitted_at).toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          {app.status === 'Payment Pending' && (
                            <button
                              onClick={() => onOpenPayment(app)}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                            >
                              Pay ₹{app.locked_price}
                            </button>
                          )}

                          {app.status === 'Completed' && (
                            <button
                              onClick={() => alert(`ડાઉનલોડિંગ અંતિમ પ્રમાણપત્ર/કાર્ડ: ${app.application_number}`)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>પ્રમાણપત્ર ડાઉનલોડ</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedAppDetail(app)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            વિગત જુઓ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-500 bg-[#0f172a] rounded-2xl border border-slate-800">
                  કોઈ મેળ ખાતી અરજી મળી નથી.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES CATALOG WITH CATEGORIES & APPLY BUTTON */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white">સરકારી સેવા સૂચિ (Service Catalog)</h3>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                          {service.service_code}
                        </span>
                        <span className="text-base font-bold font-mono text-emerald-400">
                          ₹{service.price}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{service.name_gu}</h4>
                      <p className="text-xs text-slate-400">{service.name}</p>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onApplyService(service)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-950/40 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>અરજી કરો (Apply Now)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MY DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">મારા દસ્તાવેજો (My Documents)</h3>
              <p className="text-xs text-slate-400">
                અહીં તમારી વિવિધ અરજીઓમાં અપલોડ થયેલ તમામ દસ્તાવેજોની ચકાસણી સ્થિતિ જોઈ શકો છો.
              </p>

              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
                {applications.flatMap((a) => a.documents || []).length > 0 ? (
                  applications
                    .flatMap((a) => a.documents || [])
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-[#162035] border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileCheck2 className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="font-semibold text-white">{doc.doc_name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{doc.file_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : doc.status === 'Rejected' || doc.status === 'Re-upload Required'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    હજી સુધી કોઈ દસ્તાવેજ અપલોડ થયેલ નથી.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">ચુકવણી અને રસીદ (Payments)</h3>

              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{app.application_number}</span>
                        <StatusBadge status={app.status} size="sm" />
                      </div>
                      <p className="text-slate-300 mt-1">{app.service_name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ₹{app.locked_price}
                      </span>
                      {app.status === 'Payment Pending' ? (
                        <button
                          onClick={() => onOpenPayment(app)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                        >
                          હમણાં ચુકવો (Pay)
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          ચુકવણી પૂર્ણ (Verified)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">ગ્રાહક પ્રોફાઇલ વિગત</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">પૂરું નામ</label>
                  <p className="text-white font-semibold bg-[#162035] p-3 rounded-xl">
                    {currentUser.full_name}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">નોંધાયેલ મોબાઈલ નંબર</label>
                  <p className="text-white font-semibold bg-[#162035] p-3 rounded-xl font-mono">
                    +91 {currentUser.mobile}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">સરનામું</label>
                  <p className="text-white bg-[#162035] p-3 rounded-xl">
                    {currentUser.address || 'સાધલી, શિનોર, વડોદરા'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">ખાતું બન્યાની તારીખ</label>
                  <p className="text-white bg-[#162035] p-3 rounded-xl font-mono">
                    {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Detail View Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-blue-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[80vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedAppDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-sm font-bold text-blue-400">
                  {selectedAppDetail.application_number}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedAppDetail.service_name}
                </h3>
              </div>
              <StatusBadge status={selectedAppDetail.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#162035] p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block">અરજદાર:</span>
                <strong className="text-white">{selectedAppDetail.applicant_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">મોબાઈલ:</span>
                <strong className="text-white font-mono">{selectedAppDetail.applicant_mobile}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">લૉક થયેલ સત્તાવાર ફી:</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  ₹{selectedAppDetail.locked_price}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">તારીખ:</span>
                <strong className="text-white font-mono">
                  {new Date(selectedAppDetail.submitted_at).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Status History Audit Trail */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
                અરજી પ્રગતિ ઇતિહાસ (Status History Trail)
              </h4>
              <div className="space-y-2">
                {selectedAppDetail.status_history?.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-[#162035] border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <StatusBadge status={h.new_status} size="sm" />
                      <p className="text-[11px] text-slate-400 mt-1">{h.remark}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
