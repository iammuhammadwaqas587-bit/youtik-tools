import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
  onShowToast: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onShowToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      onShowToast('Please fill out all fields before submitting.');
      return;
    }
    setIsSent(true);
    onShowToast('Your message has been received! We will respond within 24-48 hours.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 sm:py-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900 hover:underline cursor-pointer">
          Home
        </button>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Contact Us</span>
      </nav>

      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
          <MessageSquare className="h-3.5 w-3.5 text-slate-700" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact the YouTikTools Team
        </h1>
        <p className="text-slate-600">
          Have feedback, need technical support, or have questions about copyright and legal inquiries? We are here to help.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <Mail className="h-5 w-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-sm">Direct Email</h3>
            <p className="text-xs text-slate-500">
              For general inquiries, feature suggestions, or business questions:
            </p>
            <p className="font-mono text-xs text-slate-800 pt-1">support@youtiktools.com</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Copyright & DMCA</h3>
            <p className="text-xs text-slate-500">
              For content removal or rights claims under DMCA guidelines:
            </p>
            <p className="font-mono text-xs text-slate-800 pt-1">copyright@youtiktools.com</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <strong>Response Time:</strong> Our technical team typically replies to verified inquiries within 24 to 48 business hours.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs">
            {isSent ? (
              <div className="text-center py-10 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you for reaching out. We have logged your request and our team will get back to you at <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs outline-none font-medium"
                  >
                    <option value="General Feedback">General Feedback & Ideas</option>
                    <option value="Technical Bug Report">Technical Bug or Error Report</option>
                    <option value="Copyright or DMCA Request">Copyright / DMCA Takedown Request</option>
                    <option value="Business Partnership">Business Partnership & Sponsorship</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or feedback in detail..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs outline-none resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
