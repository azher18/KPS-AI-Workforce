// ============================================================================
// KPS AI Workforce - 10-Step Business Onboarding Wizard
// Section 11 & Section 55 of Specification
// ============================================================================

import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  FileText, 
  Calendar, 
  Bot, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { fetchJson } from '../lib/api.js';

interface OnboardingWizardProps {
  onCompleted: (newOrg: any) => void;
  onCancel: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onCompleted, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'Real Estate',
    website: '',
    phone: '',
    location: '',
    businessHours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM',
    services: 'VIP showings, consultation appointments, buyer qualification',
    faqs: 'Q: What are your appointment policies?\nA: 24 hour advance notice requested.\n\nQ: Are consultations complimentary?\nA: Yes, all initial consultations are complimentary.',
    documents: 'Standard verified pricing and booking guidelines.',
    calendarConnected: true,
    firstAgentName: 'Sarah - AI Front-Desk Receptionist',
    agentPersonality: 'Professional'
  });

  const nextStep = () => setStep(prev => Math.min(10, prev + 1));
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchJson('/api/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.businessName,
          industry: formData.industry,
          website: formData.website,
          phone: formData.phone,
          address: formData.location,
          firstAgentName: formData.firstAgentName
        })
      });
      onCompleted(res.organization);
    } catch (e) {
      console.error('Failed to finish onboarding:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
          <span className="font-semibold text-white">
            Onboarding Wizard: Step {step} of 10
          </span>
          <span className="text-blue-400 font-mono">
            {Math.round((step / 10) * 100)}% Complete
          </span>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 1: What is your business name?</h3>
              <p className="text-xs text-slate-400">This will be the legal brand identity your autonomous AI employee represents.</p>
              <input
                type="text"
                autoFocus
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Skyline Luxury Properties"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 2: Select your industry sector</h3>
              <p className="text-xs text-slate-400">Pre-tunes the AI's vocabulary, compliance rules, and objection handling.</p>
              <select
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Real Estate">Real Estate &amp; Brokerages</option>
                <option value="Clinics & Dental">Clinics, Dental &amp; Healthcare</option>
                <option value="Salons & Spas">Salons, Aesthetics &amp; Spas</option>
                <option value="Coaching & Education">Coaching &amp; Education</option>
                <option value="Automotive">Automotive Sales &amp; Dealerships</option>
                <option value="Home Services">Home Services &amp; Contracting</option>
                <option value="Hotels & Hospitality">Hotels &amp; Hospitality</option>
                <option value="Professional Services">Legal &amp; Professional Services</option>
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 3: Company Website &amp; Web Presence</h3>
              <p className="text-xs text-slate-400">Used for knowledge base grounding and citation linking.</p>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourcompany.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 4: Location &amp; Contact Telephony</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Street Address, City, State"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Primary Business Phone (+1 ...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 5: Operating Business Hours</h3>
              <p className="text-xs text-slate-400">AI will inform callers of these operating windows.</p>
              <textarea
                rows={3}
                value={formData.businessHours}
                onChange={e => setFormData({ ...formData, businessHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 6: Core Services &amp; Value Proposition</h3>
              <p className="text-xs text-slate-400">List primary offerings for caller recommendations.</p>
              <textarea
                rows={3}
                value={formData.services}
                onChange={e => setFormData({ ...formData, services: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 7: Frequently Asked Questions</h3>
              <p className="text-xs text-slate-400">Common questions your front desk answers daily.</p>
              <textarea
                rows={4}
                value={formData.faqs}
                onChange={e => setFormData({ ...formData, faqs: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 8: Document Ingestion &amp; Policies</h3>
              <p className="text-xs text-slate-400">Verified policies the AI will consult before answering.</p>
              <textarea
                rows={3}
                value={formData.documents}
                onChange={e => setFormData({ ...formData, documents: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 9: Connect Calendar</h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Google Calendar Integration</div>
                    <div className="text-[11px] text-slate-400">Enable real-time 2-way slot reservation</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium">· Enabled</span>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Your AI Employee Is Ready!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Architecture provisioned for <strong className="text-white">{formData.businessName || 'Your Business'}</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Employee:</span>
                  <span className="font-semibold text-white">{formData.firstAgentName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-medium">· ONLINE &amp; ARMED</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Autonomous Capabilities:</span>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                    <div>✓ Answer incoming calls</div>
                    <div>✓ Qualify buyer intent</div>
                    <div>✓ Book Google Calendar</div>
                    <div>✓ Capture CRM leads</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 && step < 10 ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
          )}

          {step < 10 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !formData.businessName.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <span>{isSubmitting ? 'Finalizing Setup...' : 'Launch AI Workforce'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
