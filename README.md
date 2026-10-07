# KPS AI Workforce — Multi-Tenant SaaS + AI Agency Platform

**Company**: Khans Professional Services  
**Tagline**: *AI Employees That Answer, Sell, Schedule & Follow Up 24/7*

---

## 1. Overview & System Architecture

**KPS AI Workforce** is an enterprise-grade multi-tenant SaaS and AI agency management platform. It allows businesses to deploy autonomous AI employees (receptionists, sales specialists, appointment coordinators) that interact via low-latency voice and web telephony, consult verified knowledge bases with zero hallucination, execute authorized tools, book appointments on Google Calendar, capture leads in a built-in CRM, and execute event-driven follow-ups.

### Core Architectural Layers:
1. **Multi-Tenant Foundation & Security**:
   - Every tenant data structure is strictly partitioned by `organization_id`.
   - Role-Based Access Control (RBAC): `platform_owner` (KPS Admin), `agency_staff`, `organization_owner` (Business Owner), and `organization_member`.
   - Supabase Row Level Security (RLS) SQL policies included in `src/server/schema.sql`.
2. **Provider Abstraction Architecture**:
   - `AIProvider`: Abstraction layer supporting Gemini (`@google/genai`) and OpenAI with deterministic fallbacks.
   - `VoiceProvider`: Telephony abstraction supporting Retell AI, Vapi, Twilio, and interactive WebRTC/WebSpeech simulators.
   - `CalendarProvider`: Google Calendar 2-way slot availability and reservation sync.
   - `PaymentProvider`: Stripe (international) and Razorpay (India) webhook event processors with idempotency verification.
3. **Controlled Backend Tool Execution**:
   - The LLM never touches the database directly. All operations are mediated through authenticated backend tools (`search_knowledge`, `check_calendar_availability`, `book_appointment`, `create_lead`, `schedule_followup`, `transfer_to_human`).
4. **Hallucination Protection**:
   - Confidence scoring thresholds (minimum 0.70). Unverified pricing, fake promotions, or unlisted slots trigger human handoff or polite clarification.

---

## 2. Main Platform Modules

1. **Marketing Website**: High-conversion B2B SaaS landing page with live interactive voice call demonstration, 10 industry blueprints, pricing, security guarantees, and FAQ.
2. **Operations Dashboard**: Answers the core executive questions: *What happened? Why does it matter? What should I do next?*
3. **Interactive Telephony Simulator**: Real-time voice call simulator with audio waveforms, speech synthesis, live transcription, real-time backend tool badges, and automated post-call summary.
4. **Visual AI Agent Builder**: Full 7-tab configuration (Identity, Voice, Personality Presets, Goals, Business Rules, Escalation, Tools) with version history (v1, v2, v3) and rollback capabilities.
5. **Leads CRM**: Pipeline and table views, scoring (Cold 0–39, Warm 40–69, Hot 70–100), intent capture, requirements, and assignees.
6. **Call Center & Transcripts**: Complete records with duration, sentiment, intent, autonomous lead score, and audio playback.
7. **Appointments & Google Calendar**: Availability queries, confirmation states, and timezone coordination.
8. **Follow-Up Automation Engine**: Event-driven SMS/Email/WhatsApp sequences with working hours suppression.
9. **Knowledge Base Manager**: Vector chunk segmentation and interactive similarity retrieval testing.
10. **Analytics & ROI Calculator**: Real-time call handling statistics, AI resolution rates, and dynamic ROI estimator based on business customer LTV.
11. **Billing & Usage Metering**: Tiered plans (Starter, Growth, Agency), quota monitoring with 80%/90%/100% capacity warnings.
12. **Agency Command Center (KPS HQ)**: Platform overview (MRR, ARR, gross margin %), client health matrix (Green/Yellow/Red), 1-click client provisioning wizard, and audit trails.
13. **10-Step Onboarding Wizard**: Guided business profile setup.
14. **Embeddable Website Widget**: Single-line snippet `<script src="..." data-agent-id="..."></script>`.

---

## 3. Environment Setup & Configuration

Copy `.env.example` to `.env`:

```bash
# Core Server Configuration
PORT=3000
APP_URL="https://your-domain.com"

# AI Provider Credentials
GEMINI_API_KEY=""
OPENAI_API_KEY=""

# Voice & Telephony Providers
RETELL_API_KEY=""
VAPI_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
ELEVENLABS_API_KEY=""

# Database & Auth (Supabase PostgreSQL)
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Payments & Subscriptions
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

### Running the App:
```bash
# Start full-stack development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```
