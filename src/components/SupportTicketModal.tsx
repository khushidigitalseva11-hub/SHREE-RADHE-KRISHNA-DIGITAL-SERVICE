import React, { useState } from 'react';
import { X, LifeBuoy, AlertCircle, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { CustomerProfile, DigitalApplication, SupportTicket } from '@/types/digitalSeva';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerProfile | null;
  applications: DigitalApplication[];
  onTicketCreated: (ticket: SupportTicket) => void;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  applications,
  onTicketCreated,
}) => {
  const [category, setCategory] = useState<
    'Application Issue' | 'Payment Issue' | 'Document Issue' | 'Service Issue' | 'Other'
  >('Application Issue');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: currentUser.id,
          customer_name: currentUser.full_name,
          customer_mobile: currentUser.mobile,
          application_id: selectedAppId || undefined,
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to raise support ticket');
      }

      onTicketCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Support ticket submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-blue-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">નવી સહાય ટિકિટ બનાવો</h3>
            <p className="text-xs text-blue-300">Raise Support Ticket (Customer Care)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              સમસ્યાનો પ્રકાર (Category) *
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
            >
              <option value="Application Issue">અરજી સંબંધિત સમસ્યા (Application Issue)</option>
              <option value="Payment Issue">ચુકવણી / પેમેન્ટ સમસ્યા (Payment Issue)</option>
              <option value="Document Issue">દસ્તાવેજ અપલોડ સમસ્યા (Document Issue)</option>
              <option value="Service Issue">યોજના / સેવા પૂછપરછ (Service Issue)</option>
              <option value="Other">અન્ય પ્રશ્ન (Other Query)</option>
            </select>
          </div>

          {applications.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                સંબંધિત અરજી પસંદ કરો (Link Application - Optional)
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="">-- કોઈપણ અરજી લિંક નથી કરવી --</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.application_number} - {app.service_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              વિષય (Subject / Issue Summary) *
            </label>
            <input
              type="text"
              required
              placeholder="દા.ત. પેમેન્ટ થઈ ગયું પણ સ્ટેટસ અપડેટ નથી થયું"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              વિગતવાર વર્ણન (Detailed Message) *
            </label>
            <textarea
              rows={4}
              required
              placeholder="તમારી સમસ્યા અથવા પ્રશ્નની પૂરી વિગત અહીં લખો..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ટિકિટ સબમિટ કરો (Submit Ticket)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
