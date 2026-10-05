import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  RefreshCw,
  Mail,
  FileText,
} from 'lucide-react';
import { CustomerProfile, ChatMessage, DigitalApplication } from '@/types/digitalSeva';

interface CustomerChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CustomerProfile | null;
  applications?: DigitalApplication[];
  selectedApplication?: DigitalApplication | null;
}

export const CustomerChatDrawer: React.FC<CustomerChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  applications = [],
  selectedApplication = null,
}) => {
  const [mode, setMode] = useState<'admin' | 'ai'>('admin');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkedAppId, setLinkedAppId] = useState<string>(selectedApplication?.id || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = currentUser ? `conv-${currentUser.id}` : 'conv-guest';

  // Load chat messages on mount / open
  useEffect(() => {
    if (isOpen) {
      if (mode === 'admin') {
        fetchMessages();
      } else if (messages.length === 0) {
        // Welcome message for AI
        setMessages([
          {
            id: 'ai-welcome',
            sender_id: 'ai-bot',
            sender_role: 'model',
            sender_name: 'AI સહાયક',
            message_text: `નમસ્તે ${
              currentUser?.full_name || 'નાગરિક'
            }! હું **શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા સહાયક** છું.\n\nતમને PAN Card, આયુષ્માન કાર્ડ, PM-કિસાન, આવકનો દાખલો, Udyam કે અન્ય કોઈપણ યોજના માટે કયા દસ્તાવેજો જોઈએ તેની સંપૂર્ણ માહિતી હું આપી શકીશ. પૂછો!`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
  }, [isOpen, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/messages?conversation_id=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([
            {
              id: 'init-msg',
              sender_id: 'admin',
              sender_role: 'admin',
              sender_name: 'સંચાલક (Admin)',
              message_text: `નમસ્તે ${
                currentUser?.full_name || 'નાગરિક'
              }! શ્રી રાધે કૃષ્ણ ડિજિટલ સેવા કેન્દ્ર Sadhli માં તમારું સ્વાગત છે. તમને કઈ સેવામાં સહાય જોઈએ છે?`,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (e) {
      console.warn('Fetch chat messages error:', e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    if (mode === 'ai') {
      // AI Digital Sahayak
      const newMsg: ChatMessage = {
        id: 'usr-' + Date.now(),
        sender_id: currentUser?.id || 'guest',
        sender_role: 'customer',
        sender_name: currentUser?.full_name || 'તમે',
        message_text: userText,
        created_at: new Date().toISOString(),
      };

      const history = [...messages, newMsg];
      setMessages(history);
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.sender_role === 'customer' ? 'user' : 'model',
              content: m.message_text,
            })),
          }),
        });

        const data = await res.json();
        const aiReply: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender_id: 'ai-bot',
          sender_role: 'model',
          sender_name: 'AI સહાયક',
          message_text: data.reply || 'માફ કરશો, હાલ પ્રતિસાદ ઉપલબ્ધ નથી.',
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiReply]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender_id: 'ai-bot',
            sender_role: 'model',
            sender_name: 'System',
            message_text: 'ક્ષમા કરશો, સર્વર સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને સપોર્ટ ટિકિટ બનાવો અથવા khushidigitalseva11@gmail.com પર ઈમેલ સંપર્ક કરો.',
            created_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      // Real-time Customer ↔ Admin Chat
      const newMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        conversation_id: conversationId,
        sender_id: currentUser?.id || 'guest',
        sender_role: 'customer',
        sender_name: currentUser?.full_name || 'Customer',
        message_text: userText,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);

      try {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            sender_id: currentUser?.id || 'guest',
            sender_role: 'customer',
            sender_name: currentUser?.full_name || 'Customer',
            message_text: userText,
          }),
        });
      } catch (err) {
        console.error('Error posting chat message:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0b101c] border-l border-blue-500/30 shadow-2xl flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 bg-[#111827] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            {mode === 'ai' ? <Sparkles className="w-5 h-5 text-amber-300" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{mode === 'ai' ? 'AI ડિજિટલ સહાયક' : 'ઓપરેટર ચેટ (Live Admin)'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">
              {mode === 'ai' ? 'યોજના અને દસ્તાવેજ માર્ગદર્શન' : 'Direct Customer ↔ Admin Support'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher Banner */}
      <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'ai'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI સહાયક</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin');
              fetchMessages();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ઓપરેટર ચેટ</span>
          </button>
        </div>

        {/* Email Direct Help */}
        <a
          href="mailto:khushidigitalseva11@gmail.com"
          className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          <Mail className="w-3 h-3" />
          <span>khushidigitalseva11@gmail.com</span>
        </a>
      </div>

      {/* Application Selector (for linking chat) */}
      {applications.length > 0 && mode === 'admin' && (
        <div className="px-4 py-1.5 bg-[#090d16] border-b border-slate-800/80 flex items-center gap-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <select
            value={linkedAppId}
            onChange={(e) => setLinkedAppId(e.target.value)}
            className="w-full bg-transparent text-slate-300 text-[11px] outline-none"
          >
            <option value="">સામાન્ય પૂછપરછ (General Inquiry)</option>
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                અરજી: {app.application_number} ({app.service_name})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => {
          const isUser = m.sender_role === 'customer';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <span className="text-[10px] text-slate-400 px-1">
                {m.sender_name || (isUser ? 'તમે' : 'ઓપરેટર')}
              </span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-900/30'
                    : 'bg-[#1e293b] text-slate-200 border border-slate-700/60 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.message_text}</div>
                {m.attachment_url && (
                  <div className="mt-2 pt-2 border-t border-white/20">
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] underline flex items-center gap-1"
                    >
                      <Paperclip className="w-3 h-3" />
                      <span>{m.attachment_name || 'ફાઇલ જોવો'}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>AI સહાયક વિચારી રહ્યું છે...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#111827] border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder={
            mode === 'ai'
              ? 'યોજના કે દસ્તાવેજ વિશે અહીં પૂછો...'
              : 'ઓપરેટરને સંદેશ મોકલો...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#1e293b] border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
