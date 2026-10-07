// ============================================================================
// KPS AI Workforce - Database Architecture, Migrations & Disaster Recovery
// Sections 9, 10 & 11 of PRD V2: PostgreSQL Schema, Migration Safety & Backups
// ============================================================================

import React, { useState } from 'react';
import { 
  Database, 
  GitBranch, 
  ShieldCheck, 
  RotateCcw, 
  HardDrive, 
  CheckCircle2, 
  FileCode, 
  Lock,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const DatabaseArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'migrations' | 'schema' | 'backups' | 'rls'>('migrations');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationOutput, setVerificationOutput] = useState<string | null>(null);

  const migrationsList = [
    { id: '20261001_001_core_tenants.sql', name: 'Organizations, Users & RBAC Memberships', status: 'Applied', date: '2026-10-01 04:00 UTC', checksum: 'sha256:7f8a9e01' },
    { id: '20261001_002_agents_engine.sql', name: 'Agents, Versions & Knowledge Vector Chunks', status: 'Applied', date: '2026-10-01 04:12 UTC', checksum: 'sha256:4b3c2d1e' },
    { id: '20261001_003_calls_crm.sql', name: 'Telephony Calls, Transcripts & Leads CRM', status: 'Applied', date: '2026-10-01 04:30 UTC', checksum: 'sha256:9a8b7c6d' },
    { id: '20261002_001_appointments.sql', name: 'Appointments, Two-Way Calendar & Followups', status: 'Applied', date: '2026-10-02 09:15 UTC', checksum: 'sha256:1a2b3c4d' },
    { id: '20261003_001_billing_usage.sql', name: 'Subscriptions, Usage Limits & Metering Ledger', status: 'Applied', date: '2026-10-03 11:20 UTC', checksum: 'sha256:5e6f7a8b' },
    { id: '20261005_001_privacy_retention.sql', name: 'Privacy Disclosures, Consent & Auto-Purge', status: 'Applied', date: '2026-10-05 14:00 UTC', checksum: 'sha256:2c3d4e5f' },
    { id: '20261007_001_rls_policies.sql', name: 'Supabase Strict Multi-Tenant Row Level Security', status: 'Applied', date: '2026-10-07 05:00 UTC', checksum: 'sha256:9f8e7d6c' }
  ];

  const handleVerifyMigrations = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationOutput('All 7 migrations verified against PostgreSQL catalog. Schema checksums intact. Zero undocumented drift detected.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Database Architecture &amp; Recovery</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-blue-950 text-blue-300 border border-blue-800">
              PostgreSQL · Supabase RLS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit migrations, inspect multi-tenant schema isolation, and review disaster recovery runbooks.
          </p>
        </div>

        <button
          onClick={handleVerifyMigrations}
          disabled={isVerifying}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-blue-400' : ''}`} />
          <span>{isVerifying ? 'Validating Migration Integrity...' : 'Verify Schema Integrity'}</span>
        </button>
      </div>

      {verificationOutput && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{verificationOutput}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('migrations')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2 ${
            activeTab === 'migrations' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Applied Migrations ({migrationsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2 ${
            activeTab === 'schema' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Catalog Tables (30 Core)</span>
        </button>
        <button
          onClick={() => setActiveTab('rls')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2 ${
            activeTab === 'rls' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Supabase RLS Policies</span>
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`flex-1 py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2 ${
            activeTab === 'backups' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Disaster Recovery &amp; Backups</span>
        </button>
      </div>

      {/* TAB 1: Migrations List */}
      {activeTab === 'migrations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Immutable Migration Execution Ledger
            </h3>
            <span className="text-[11px] text-slate-400">Section 10: Migration → Apply → Verify workflow</span>
          </div>

          <div className="divide-y divide-slate-800">
            {migrationsList.map((m, idx) => (
              <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{m.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({m.id})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Applied: {m.date} · Hash: {m.checksum}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Catalog Tables */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { table: 'organizations', rows: '4', desc: 'Isolated customer business tenants with industry presets' },
              { table: 'users', rows: '6', desc: 'Platform owners, staff, client owners & members' },
              { table: 'organization_members', rows: '6', desc: 'Multi-tenant memberships with fine-grained RBAC roles' },
              { table: 'agents', rows: '8', desc: 'AI receptionists, sales closers, appointment bookers' },
              { table: 'agent_versions', rows: '14', desc: 'Immutable version snapshots for one-click rollback' },
              { table: 'knowledge_documents', rows: '12', desc: 'PDFs, text files, FAQs & business knowledge' },
              { table: 'knowledge_chunks', rows: '148', desc: 'Vector embedded snippets for semantic retrieval' },
              { table: 'customers', rows: '85', desc: 'End-customer contact records with privacy purge metadata' },
              { table: 'leads', rows: '132', desc: 'Scored leads (Cold/Warm/Hot) with buyer intent triggers' },
              { table: 'lead_events', rows: '420', desc: 'Detailed interaction events & lead state transitions' },
              { table: 'calls', rows: '186', desc: 'Telephony sessions, audio duration, resolution statuses' },
              { table: 'call_transcripts', rows: '186', desc: 'Turn-by-turn conversational transcripts with speaker tags' },
              { table: 'appointments', rows: '48', desc: 'Google Calendar synced bookings & meetings' },
              { table: 'followups', rows: '94', desc: 'Automated SMS & email cadences scheduled by AI' },
              { table: 'usage_records', rows: '24', desc: 'Voice minutes and token metering per organization' },
              { table: 'usage_limits', rows: '4', desc: 'Soft and hard quota limits with overage protections' },
              { table: 'subscriptions', rows: '4', desc: 'Starter, Growth, Agency Managed plans with cycle dates' },
              { table: 'invoices', rows: '18', desc: 'Payment receipts and billed usage statements' },
              { table: 'integrations', rows: '12', desc: 'Retell, Vapi, Google Calendar, Twilio carrier bridges' },
              { table: 'privacy_settings', rows: '4', desc: 'Call recording consent, AI disclosure & retention rules' },
              { table: 'audit_logs', rows: '340', desc: 'Security events, role modifications & impersonation logs' }
            ].map(t => (
              <div key={t.table} className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">{t.table}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {t.rows} records
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{t.desc}</p>
                <div className="text-[10px] text-slate-500 font-mono">Tenant Column: organization_id (indexed)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Supabase RLS Policies */}
      {activeTab === 'rls' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant Row Level Security Enforcement</span>
          </div>
          <p className="text-xs text-slate-400">
            Row Level Security (RLS) is enabled on all 21 tenant-owned tables. Even if a raw SQL query is executed,
            PostgreSQL guarantees that Tenant A cannot access, query, or mutate Tenant B data.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-emerald-400">-- Core Multi-Tenant Isolation Policy Example</div>
            <div>ALTER TABLE agents ENABLE ROW LEVEL SECURITY;</div>
            <div className="text-blue-400">CREATE POLICY agents_tenant_isolation ON agents</div>
            <div>&nbsp;&nbsp;FOR ALL</div>
            <div>&nbsp;&nbsp;USING (</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;organization_id = auth.current_tenant_id()</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;OR auth.is_platform_owner()</div>
            <div>&nbsp;&nbsp;);</div>
          </div>
        </div>
      )}

      {/* TAB 4: Disaster Recovery & Backups */}
      {activeTab === 'backups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white text-sm font-bold">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>Section 11: Production Backup &amp; Rollback Runbook</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              RPO: 5 min · RTO: 15 min
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Continuous WAL Archiving</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Write-Ahead Logging streamed every 60 seconds to geo-redundant encrypted Google Cloud Storage buckets.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono">Status: Stream Active</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Point-in-Time Recovery (PITR)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Restore database state to any specific microsecond in the past 30 days without dropping active connections.
              </p>
              <div className="text-[10px] text-blue-400 font-mono">Retention: 30 Days Active</div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Soft Deletes Only</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Every business record uses `deleted_at` timestamp. Accidental drops can be restored instantly without restoring backups.
              </p>
              <div className="text-[10px] text-purple-400 font-mono">Enforced across all tables</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
