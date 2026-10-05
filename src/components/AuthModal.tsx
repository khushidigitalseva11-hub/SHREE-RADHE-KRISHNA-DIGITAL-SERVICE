import React, { useState, useEffect } from 'react';
import { X, Smartphone, KeyRound, User, MapPin, Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CustomerProfile } from '@/types/digitalSeva';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: CustomerProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  // Timer cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setError('કૃપા કરીને સાચો 10 આંકડાનો મોબાઈલ નંબર દાખલ કરો.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp');
      setCooldown(60);
      setSuccessMsg(`મોબાઈલ નંબર ${cleanMobile} પર OTP મોકલાઈ ગયો છે.`);
      if (data.mockOtp) {
        setMockOtpHint(data.mockOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.length < 4) {
      setError('કૃપા કરીને માન્ય OTP દાખલ કરો.');
      return;
    }

    setLoading(true);
    try {
      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanMobile,
          otp,
          name: fullName || undefined,
          address: address || undefined,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP');
      }

      // Store local session
      localStorage.setItem('srk_customer', JSON.stringify(data.customer));
      onLoginSuccess(data.customer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0f172a] border border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">નાગરિક લોગિન / નોંધણી</h2>
          <p className="text-xs text-blue-300 mt-1">શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા (OTP Auth)</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                મોબાઈલ નંબર (10-Digit Mobile Number) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-slate-400 font-mono">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="8511566026"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#1e293b] border border-slate-700 focus:border-blue-500 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                નોંધ: આ નંબર પર OTP અને અરજી અપડેટ મોકલવામાં આવશે.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                પૂરું નામ (તમારું નામ - Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="દા.ત. રમેશભાઈ પટેલ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>OTP મેળવો (Send OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  OTP દાખલ કરો (Enter 6-Digit OTP) *
                </label>
                <button
                  type="button"
                  onClick={() => setStep('mobile')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  નંબર બદલો
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#1e293b] border border-blue-500/50 focus:border-blue-400 rounded-xl pl-10 pr-4 py-2.5 text-base tracking-widest text-center text-white placeholder-slate-500 outline-none font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Demo Helper */}
            {mockOtpHint && (
              <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-300 flex items-center justify-between">
                <span>ટેસ્ટ OTP: <strong className="font-mono text-white">{mockOtpHint}</strong> (અથવા 123456)</span>
                <button
                  type="button"
                  onClick={() => setOtp(mockOtpHint)}
                  className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                >
                  ઓટો-ભરો
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>OTP ની માન્યતા: 5 મિનિટ</span>
              {cooldown > 0 ? (
                <span className="text-slate-500">ફરીથી મોકલો ({cooldown}s)</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-blue-400 hover:underline font-medium"
                >
                  ફરી OTP મોકલો (Resend)
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>ચકાસો અને લોગિન કરો (Verify & Login)</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            સહાય માટે સંપર્ક: <span className="text-white font-semibold">8511566026</span> (સોમ-શનિ 9-7)
          </p>
        </div>
      </div>
    </div>
  );
};
