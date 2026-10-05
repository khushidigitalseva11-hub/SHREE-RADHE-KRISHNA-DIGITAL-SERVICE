import React, { useState } from 'react';
import {
  DigitalService,
  CustomerProfile,
} from '@/types/digitalSeva';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  ArrowRight,
  ExternalLink,
  CreditCard,
  FileText,
  Star,
  Layers,
  HelpCircle,
  Award,
  ChevronRight,
  MessageCircle,
  MessageSquare,
} from 'lucide-react';

interface PublicWebsiteProps {
  services: DigitalService[];
  currentUser: CustomerProfile | null;
  onOpenAuth: () => void;
  onOpenAdminModal: () => void;
  onApplyService: (service: DigitalService) => void;
  onOpenChat: () => void;
  onGoToPortal: () => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  services,
  currentUser,
  onOpenAuth,
  onOpenAdminModal,
  onApplyService,
  onOpenChat,
  onGoToPortal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [serviceDetailModal, setServiceDetailModal] = useState<DigitalService | null>(null);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    const matchesCat = selectedCat === 'All' || s.category === selectedCat;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name_gu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.service_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>તમારી ડિજિટલ સેવા, એક જ સ્થળે • Authorized Digital Seva</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            શ્રી રાધે કૃષ્ણ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">ડિજિટલ સેવા</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            PAN Card, આયુષ્માન ભારત, PM-કિસાન, આવકનો દાખલો, ઈ-નિર્માણ, ચૂંટણી કાર્ડ અને All India PVC કાર્ડ પ્રિન્ટિંગ સહિત તમામ સરકારી સેવાઓ એક જ સ્થળેથી ઓનલાઇન સરળતાથી મેળવો.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser ? (
              <button
                onClick={onGoToPortal}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-950/60 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>ગ્રાહક ડેશબોર્ડ ખોલો (My Dashboard)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-950/60 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>મોબાઈલ OTP થી શરૂ કરો (Login / Register)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenChat}
              className="px-5 py-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span>ઓનલાઇન સહાય ચેટ (Live Chat)</span>
            </button>
          </div>

          {/* Hero Digital Center Banner Asset */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-950/80 group">
              <img
                src="/hero.jpg"
                alt="Shree Radhe Krishna Digital Service Center"
                className="w-full h-56 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <span className="font-bold bg-blue-950/90 border border-blue-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                  📍 રૂદ્ર કોમ્પ્લેક્ષ, ટિંબરવા રોડ, સાધલી, જિ. વડોદરા
                </span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/90 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md hidden sm:inline">
                  ⚡ Smart Citizen Services Kiosk
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">100% સત્તાવાર</span>
                <span className="text-[11px] text-slate-400">Govt Authorized</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">ફિક્સ અને પારદર્શક ફી</span>
                <span className="text-[11px] text-slate-400">Fixed & Locked Fee</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">સુરક્ષિત દસ્તાવેજ</span>
                <span className="text-[11px] text-slate-400">Private & Encrypted</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0f172a]/70 border border-slate-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">ઝડપી પ્રોસેસિંગ</span>
                <span className="text-[11px] text-slate-400">Fast Local Assistance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. All India PVC Delivery Banner */}
      <section className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border-y border-blue-500/20 py-3.5 px-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-200">
            <span className="font-bold text-amber-300">★ All India PVC Smart Card Delivery:</span>
            <span>Aadhaar, PAN, Voter, Ayushman અને ડ્રાઈવિંગ લાયસન્સનું વોટરપ્રૂફ પ્લાસ્ટિક સ્માર્ટ કાર્ડ તમારા ઘરે પહોંચશે.</span>
          </div>

          <button
            onClick={() => {
              const pvc = services.find((s) => s.service_code === 'PVC');
              if (pvc) onApplyService(pvc);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 shadow"
          >
            PVC કાર્ડ ઓર્ડર કરો (₹150)
          </button>
        </div>
      </section>

      {/* 3. Services Catalog Section */}
      <section id="services" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              સેવાઓ અને ફી સૂચિ (Official 21 Services)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              તમારી જરૂરિયાત મુજબ સેવા પસંદ કરો
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              તમામ સેવાઓ માટે સત્તાવાર નિયત ફી અને જરૂરી દસ્તાવેજોની સંપૂર્ણ વિગત.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="સેવા અથવા કાર્ડ શોધો..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'bg-[#0f172a] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-blue-950/30 group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                    {service.service_code}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">સત્તાવાર ફી</span>
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      ₹{service.price}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {service.name_gu}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{service.name}</p>

                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => setServiceDetailModal(service)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center transition-colors"
                >
                  દસ્તાવેજ જુઓ
                </button>

                <button
                  onClick={() => onApplyService(service)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold text-center shadow-md shadow-blue-950/40 flex items-center justify-center gap-1 transition-all"
                >
                  <span>અરજી કરો</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About Us & Local Center Section */}
      <section id="about" className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0b101c] border-y border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              અમારા વિશે (About Shree Radhe Krishna Digital Service)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              સાધલી, શિનોર અને વડોદરા જિલ્લાના નાગરિકો માટે વિશ્વસનીય ડિજિટલ સેવા
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા</strong> એ ગ્રામ્ય અને શહેરી નાગરિકોને સરકારી યોજનાઓ, આવકના દાખલા, પાન કાર્ડ, આયુષ્માન કાર્ડ, ચૂંટણી કાર્ડ અને કિસાન સહાય સરળતાથી અને વ્યાજબી દરે પહોંચાડવા માટે કટિબદ્ધ છે.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              અમારું લક્ષ્ય છે કે ગામડાના વડીલો, ખેડૂતો અને બહેનોને કોઈપણ કચેરીએ ધક્કા ખાધા વગર તમામ સેવાઓ તેમના મોબાઈલ પર કે અમારા કેન્દ્ર પરથી ઝડપથી મળી રહે.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>સોમ-શનિ સવારે 9 થી સાંજે 7</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ઓનલાઇન ટ્રેકિંગ અને SMS/વોટ્સએપ</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-blue-500/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>કેન્દ્રનું સરનામું (Center Location)</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300 bg-[#162035] p-4 rounded-xl border border-slate-700/60 leading-relaxed font-sans">
              <p className="font-bold text-white">{BUSINESS_INFO.name}</p>
              <p>{BUSINESS_INFO.address}</p>
              <p className="pt-2 text-slate-400">
                <strong>સમય:</strong> {BUSINESS_INFO.workingHours}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">ઓનલાઇન સપોર્ટ:</span>
              <button
                onClick={onOpenChat}
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>લાઈવ સહાયક ચેટ (Start Chat)</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">સત્તાવાર ઈમેલ (Email):</span>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="font-mono text-emerald-400 hover:underline font-semibold"
              >
                {BUSINESS_INFO.email}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
            ગ્રાહકોનો સંતોષ (Citizen Testimonials)
          </span>
          <h2 className="text-2xl font-bold text-white">નાગરિકોનો અમારો અનુભવ</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "મેં અહીંથી નવું પાન કાર્ડ કઢાવ્યું. માત્ર 3 દિવસમાં e-PAN મળી ગયું અને ઓરિજિનલ કાર્ડ પણ ઘેર આવી ગયું. ખૂબ સરસ સેવા છે."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <strong className="text-white block">કિરીટભાઈ પટેલ</strong>
              <span className="text-[11px] text-slate-500">સાધલી (Sadhli)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "મારા સમગ્ર પરિવારનું આયુષ્માન કાર્ડ અને PM કિસાન e-KYC બહુ જ ઝડપથી થઈ ગયું. કોઈ લાઈનમાં ઊભા રહેવું ન પડ્યું."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <strong className="text-white block">જયેશભાઈ વસાવા</strong>
              <span className="text-[11px] text-slate-500">શિનોર (Shinor)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-3">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "PVC કાર્ડ પ્રિન્ટિંગનું કામ સુપર છે. એકદમ કડક અને વોટરપ્રૂફ કાર્ડ સ્પીડ પોસ્ટથી 4 દિવસમાં મળી ગયું."
            </p>
            <div className="pt-2 border-t border-slate-800 text-xs">
              <strong className="text-white block">હિતેશભાઈ શાહ</strong>
              <span className="text-[11px] text-slate-500">વડોદરા (Vadodara)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-[#070a10] border-t border-slate-800 py-8 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-white text-sm">
                {BUSINESS_INFO.name}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400 font-mono text-[11px]">{BUSINESS_INFO.domain}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {BUSINESS_INFO.tagline_gu} • {BUSINESS_INFO.address}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenAdminModal}
              className="text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Access</span>
            </button>

            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              <span>{BUSINESS_INFO.email}</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Service Detail / Document Requirement Modal */}
      {serviceDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f172a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <button
              onClick={() => setServiceDetailModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                {serviceDetailModal.service_code} • {serviceDetailModal.category}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {serviceDetailModal.name_gu} ({serviceDetailModal.name})
              </h3>
              <p className="text-xs text-slate-300 mt-1">{serviceDetailModal.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#162035] border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">સત્તાવાર નિયત ફી:</span>
              <strong className="text-emerald-400 font-mono text-base">₹{serviceDetailModal.price}</strong>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>જરૂરી દસ્તાવેજો (Required Documents)</span>
              </h4>

              {serviceDetailModal.required_documents && serviceDetailModal.required_documents.length > 0 ? (
                <div className="space-y-1.5">
                  {serviceDetailModal.required_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-lg bg-[#162035] border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-200">{doc.doc_name_gu}</span>
                      {doc.is_mandatory && (
                        <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded">
                          ફરજિયાત
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-[#162035] p-3 rounded-lg">
                  આ સેવા માટે સામાન્ય ઓળખ પુરાવો (આધાર કાર્ડ/ચૂંટણી કાર્ડ) જરૂરી છે.
                </p>
              )}
            </div>

            <button
              onClick={() => {
                const s = serviceDetailModal;
                setServiceDetailModal(null);
                onApplyService(s);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950/50 flex items-center justify-center gap-1.5"
            >
              <span>આ સેવા માટે અરજી શરૂ કરો (Apply Now)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
