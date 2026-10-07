// ============================================================================
// KPS AI Workforce - SaaS Marketing Landing Page
// Khans Professional Services
// ============================================================================

import React from 'react';
import { 
  Bot, 
  Phone, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  ArrowRight, 
  Play, 
  Building2, 
  Stethoscope, 
  Scissors, 
  GraduationCap, 
  Car, 
  Wrench, 
  Hotel, 
  Briefcase 
} from 'lucide-react';

interface MarketingPageProps {
  onBuildAgent: () => void;
  onTalkToAgent: () => void;
  onOpenDashboard: () => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({
  onBuildAgent,
  onTalkToAgent,
  onOpenDashboard
}) => {
  const industries = [
    { name: 'Real Estate', icon: Building2, desc: 'Penthouse showings, buyer qualification, broker handoffs.' },
    { name: 'Clinics & Dental', icon: Stethoscope, desc: 'Patient appointments, treatment FAQs, emergency triage.' },
    { name: 'Salons & Spas', icon: Scissors, desc: 'Stylist scheduling, service pricing, cancellation fills.' },
    { name: 'Coaching & Education', icon: GraduationCap, desc: 'Enrollment consultations, course advisement, student intake.' },
    { name: 'Automotive Dealerships', icon: Car, desc: 'Test drive scheduling, service department booking, inventory checks.' },
    { name: 'Home Services', icon: Wrench, desc: 'Emergency dispatching, estimate bookings, job qualification.' },
    { name: 'Hotels & Hospitality', icon: Hotel, desc: 'Direct reservations, concierge queries, room upgrades.' },
    { name: 'Professional Services', icon: Briefcase, desc: 'Client intake, partner calendar booking, retainer qualification.' }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              K
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">KPS AI Workforce</span>
              <span className="text-[11px] text-blue-400 block -mt-1 font-mono">by Khans Professional Services</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#solutions" className="hover:text-white transition">AI Employees</a>
            <a href="#industries" className="hover:text-white transition">Industries</a>
            <a href="#how-it-works" className="hover:text-white transition">Architecture</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#security" className="hover:text-white transition">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTalkToAgent}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Talk to AI Agent</span>
            </button>
            <button
              onClick={onOpenDashboard}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              Open Platform
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Telephony &amp; CRM Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Your AI Employee That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
              Never Misses a Customer
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Answer calls, qualify leads, book appointments and follow up automatically — 24/7. Fully integrated with your phone carrier, Google Calendar, and built-in CRM.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onBuildAgent}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-600/25 transition"
            >
              <span>Build My AI Agent</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTalkToAgent}
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <Play className="w-4 h-4 text-blue-400 fill-current" />
              <span>Talk to an AI Agent (Live Voice)</span>
            </button>
          </div>

          {/* Interactive Live Voice Teaser Card */}
          <div className="pt-10 max-w-xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Phone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Live Inbound Demo Online</div>
                  <div className="text-[11px] text-slate-400">Sarah · Luxury Real Estate Receptionist</div>
                </div>
              </div>

              <button
                onClick={onTalkToAgent}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Launch Demo Call
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Employees Fleet */}
      <section id="solutions" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A Complete Fleet of Autonomous AI Employees
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Not a toy chatbot. Trained agents with authorized tools, calendar synchronization, and strict hallucination safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Receptionist</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answers incoming phone calls with sub-second latency, greets callers warmly, answers business FAQs, and routes inquiries without putting callers on hold.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Sales &amp; Qualification Agent</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asks consultative questions, extracts customer budget, location, and purchase timeline, and generates an instant 0–100 lead score.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Appointment Coordinator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Checks Google Calendar availability in real-time, confirms preferred slots, books appointments, and triggers SMS confirmation and calendar invites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Supported Industries */}
      <section id="industries" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Pre-Configured for Your Industry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each template comes out of the box with industry-specific conversational patterns, qualification fields, and compliance rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <div key={i} className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">{ind.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ind.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Transparent, Value-Driven Investment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No full-time employee overhead, no sick leave, no missed calls. Replace missed opportunities with 24/7 revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Starter</h4>
                <div className="text-3xl font-bold font-mono text-white mt-3">
                  ₹9,999 <span className="text-xs text-slate-400 font-normal">/ month ($129)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Ideal for solo practitioners and boutique salons</p>
                <ul className="space-y-2.5 text-xs text-slate-300 my-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 1 Autonomous AI Employee</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 500 Voice Minutes / mo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Google Calendar Integration</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Lead Capture &amp; CRM</li>
                </ul>
              </div>
              <button
                onClick={onBuildAgent}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Choose Starter
              </button>
            </div>

            <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3 right-6 px-3 py-0.5 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Growth</h4>
                <div className="text-3xl font-bold font-mono text-white mt-3">
                  ₹19,999 <span className="text-xs text-slate-400 font-normal">/ month ($249)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">For high-inquiry businesses &amp; brokerages</p>
                <ul className="space-y-2.5 text-xs text-slate-300 my-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 3 Autonomous AI Employees</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 1,500 Voice Minutes / mo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Smart Lead Scoring (0-100)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Event-Driven Follow-Ups</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Live Human Handoff with Summaries</li>
                </ul>
              </div>
              <button
                onClick={onBuildAgent}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Choose Growth
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white">Agency Managed</h4>
                <div className="text-3xl font-bold font-mono text-white mt-3">
                  ₹39,999 <span className="text-xs text-slate-400 font-normal">/ month ($499)</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Full white-glove setup and multi-location deployment</p>
                <ul className="space-y-2.5 text-xs text-slate-300 my-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 10 Autonomous AI Employees</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 5,000 Voice Minutes / mo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Dedicated Telephony DID Routing</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> n8n Automation Webhooks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Dedicated KPS Account Lead</li>
                </ul>
              </div>
              <button
                onClick={onBuildAgent}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Choose Agency
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Strict Guardrails */}
      <section id="security" className="py-16 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Enterprise Tenant Isolation &amp; Zero Hallucination</h3>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every business customer operates in a strictly isolated tenant space with database-level isolation. AI agents cannot invent pricing or policies outside your verified knowledge documents.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-xs text-slate-500 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} KPS AI Workforce. Khans Professional Services. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
