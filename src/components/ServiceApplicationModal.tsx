import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react';
import { DigitalService, CustomerProfile, DigitalApplication } from '@/types/digitalSeva';
import { DynamicFormRenderer } from './DynamicFormRenderer';

interface ServiceApplicationModalProps {
  isOpen: boolean;
  service: DigitalService | null;
  currentUser: CustomerProfile | null;
  onClose: () => void;
  onSubmit: (service: DigitalService, formData: Record<string, any>, files: File[]) => Promise<DigitalApplication>;
  onPaymentPrompt: (application: DigitalApplication) => void;
}

export const ServiceApplicationModal: React.FC<ServiceApplicationModalProps> = ({
  isOpen,
  service,
  currentUser,
  onClose,
  onSubmit,
  onPaymentPrompt,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<{ [docCode: string]: File }>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !service) return null;

  // Initialize form data with customer details
  const initialFormData = {
    app_name: currentUser?.full_name || '',
    app_mobile: currentUser?.mobile || '',
    app_address: currentUser?.address || '',
    ...formData,
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (docCode: string, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(`File "${file.name}" exceeds 5 MB limit.`);
      return;
    }
    setError(null);
    setFiles((prev) => ({ ...prev, [docCode]: file }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      // Validate basic applicant info
      if (!initialFormData.app_name || !initialFormData.app_mobile) {
        setError('અરજદારનું પૂરું નામ અને મોબાઈલ નંબર ફરજિયાત છે.');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
  };

  const handleSubmitApplication = async () => {
    if (!consentChecked) {
      setError('કૃપા કરીને સરકારી પોર્ટલ પર ઓનલાઇન અરજી પ્રોસેસ કરવા માટે સંમતિ આપો.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const fileList = Object.values(files);
      const createdApp = await onSubmit(service, initialFormData, fileList);
      onClose();
      onPaymentPrompt(createdApp);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-blue-500/30 rounded-2xl shadow-2xl text-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#172554] to-[#1e1b4b] border-b border-blue-900/60 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-bold bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-500/30">
              {service.category} • CODE: {service.service_code}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1">
              {service.name_gu} <span className="text-sm font-normal text-blue-200">({service.name})</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">સત્તાવાર ફી (Locked Price)</span>
              <span className="text-base sm:text-lg font-mono font-bold text-emerald-400">
                ₹{service.price}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#0b101c] px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-medium">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[11px] border-current">
              1
            </span>
            <span>માહિતી (Info)</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[11px] border-current">
              2
            </span>
            <span>અરજી ફોર્મ (Form)</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[11px] border-current">
              3
            </span>
            <span>દસ્તાવેજ (Docs)</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-800" />
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-blue-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center border text-[11px] border-current">
              4
            </span>
            <span>સંમતિ (Submit)</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: SERVICE OVERVIEW & INSTRUCTIONS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 space-y-2">
                <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wide">સેવા વિગત</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{service.description}</p>
              </div>

              {service.instructions && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    અગત્યની સૂચનાઓ (Important Instructions)
                  </h4>
                  <p className="text-xs text-amber-200/90 leading-relaxed">{service.instructions}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#162035] border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    સત્તાવાર ફી (Price Lock Guarantee):
                  </span>
                  <strong className="text-emerald-400 font-mono text-sm">₹{service.price}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  નોંધ: એકવાર અરજી સબમિટ થયા પછી ફીમાં કોઈ વધારાનો ફેરફાર થશે નહીં.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC APPLICATION FORM */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    અરજદારનું પૂરું નામ (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={initialFormData.app_name}
                    onChange={(e) => handleFieldChange('app_name', e.target.value)}
                    placeholder="આધાર કાર્ડ મુજબ નામ"
                    className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    મોબાઈલ નંબર (Mobile Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={initialFormData.app_mobile}
                    onChange={(e) => handleFieldChange('app_mobile', e.target.value.replace(/\D/g, ''))}
                    placeholder="10 આંકડાનો નંબર"
                    className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Service-Specific Dynamic Form Fields */}
              {service.form_fields && service.form_fields.length > 0 ? (
                <DynamicFormRenderer
                  fields={service.form_fields}
                  formData={formData}
                  onChange={handleFieldChange}
                />
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      રહેઠાણનું પૂરું સરનામું (Address)
                    </label>
                    <textarea
                      rows={2}
                      value={initialFormData.app_address}
                      onChange={(e) => handleFieldChange('app_address', e.target.value)}
                      placeholder="ગામ, તાલુકો, જિલ્લો અને પિનકોડ"
                      className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      વિશેષ નોંધ / વિગત (Optional Notes)
                    </label>
                    <input
                      type="text"
                      value={formData.additional_notes || ''}
                      onChange={(e) => handleFieldChange('additional_notes', e.target.value)}
                      placeholder="કોઈ વધારાની વિગત હોય તો જણાવો"
                      className="w-full bg-[#162035] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: REQUIRED DOCUMENTS UPLOAD */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 text-xs text-blue-300 flex items-center justify-between">
                <span>માન્યા દસ્તાવેજ: PDF, JPG, PNG (મહત્તમ 5 MB પ્રતિ ફાઈલ)</span>
                <span className="font-mono text-[11px] text-blue-400">Secure Storage</span>
              </div>

              <div className="space-y-3">
                {service.required_documents && service.required_documents.length > 0 ? (
                  service.required_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-[#162035] border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-semibold text-white">
                            {doc.doc_name_gu}
                          </span>
                          {doc.is_mandatory && (
                            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                              ફરજિયાત
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{doc.doc_name}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {files[doc.doc_code] ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                            <FileCheck className="w-4 h-4" />
                            <span className="truncate max-w-[140px]">
                              {files[doc.doc_code].name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = { ...files };
                                delete newFiles[doc.doc_code];
                                setFiles(newFiles);
                              }}
                              className="text-rose-400 hover:text-rose-300 ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors">
                            <UploadCloud className="w-4 h-4" />
                            <span>ફાઈલ પસંદ કરો</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(doc.doc_code, e.target.files?.[0] || null)
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-[#162035] border border-slate-700/60 text-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
                    <p className="text-xs text-slate-300">
                      આ સેવા માટે હાલ કોઈપણ સામાન્ય પુરાવો (આધાર કાર્ડ/ચૂંટણી કાર્ડ) અપલોડ કરી શકો છો.
                    </p>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                      <span>દસ્તાવેજ અપલોડ કરો</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload('GENERAL_DOC', e.target.files?.[0] || null)
                        }
                      />
                    </label>
                    {files['GENERAL_DOC'] && (
                      <p className="text-xs text-emerald-400">
                        પસંદ કરેલ: {files['GENERAL_DOC'].name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: DIGITAL CITIZEN CONSENT & SUMMARY */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#162035] border border-slate-700/70 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  અરજી સારાંશ (Application Summary)
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-2 text-slate-300 border-t border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-500 block">સેવા:</span>
                    <strong>{service.name_gu}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">અરજદાર:</span>
                    <strong>{initialFormData.app_name}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">મોબાઈલ:</span>
                    <strong>{initialFormData.app_mobile}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">કુલ લોક ફી:</span>
                    <strong className="text-emerald-400 font-mono text-sm">₹{service.price}</strong>
                  </div>
                </div>
              </div>

              {/* Assisted Service Legal Consent */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-blue-600 shrink-0"
                  />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    હું પ્રમાણિત કરું છું કે આપેલ તમામ વિગતો અને દસ્તાવેજો સાચા છે. હું <strong>શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા</strong> ના ઓપરેટરને સત્તાવાર સરકારી પોર્ટલ પર મારા વતી અરજી સબમિટ અને પ્રોસેસ કરવા માટે સંમતિ આપું છું.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#0b101c] p-4 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>પાછળ (Back)</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5"
            >
              <span>આગળ વધો (Next)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={submitting || !consentChecked}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting ? (
                <span>અરજી બની રહી છે...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>અરજી સબમિટ કરો (Submit Application)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
