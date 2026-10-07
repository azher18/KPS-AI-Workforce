// ============================================================================
// KPS AI Workforce - Knowledge Base & Chunk Search Engine
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  X
} from 'lucide-react';
import type { KnowledgeSource, KnowledgeDocument, KnowledgeChunk } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

export const KnowledgeManager: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Document modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'faq' as KnowledgeSource['type'],
    content: ''
  });

  // Search Tester
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<{ chunk: KnowledgeChunk; score: number }[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson('/api/knowledge');
      setSources(data.sources || []);
      setDocuments(data.documents || []);
      setChunks(data.chunks || []);
    } catch (e) {
      console.error('Failed to load knowledge:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchJson('/api/knowledge/upload', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setIsAddOpen(false);
      setForm({ name: '', type: 'faq', content: '' });
      await loadKnowledge();
    } catch (e) {
      console.error('Failed to upload knowledge:', e);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsTesting(true);
    try {
      const results = await fetchJson('/api/knowledge/test', {
        method: 'POST',
        body: JSON.stringify({ query: testQuery })
      });
      setTestResults(results);
    } catch (e) {
      console.error('Failed to test search:', e);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Knowledge Base &amp; Ground Truth</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{sources.length} Verified Sources</span>
            <span>·</span>
            <span>{chunks.length} Searchable Vector Chunks</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Hallucination Guard Active</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Knowledge Doc</span>
        </button>
      </div>

      {/* Hallucination Shield Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <h4 className="font-semibold text-white">Zero-Hallucination Policy Enforced</h4>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            The AI is strictly constrained to these verified chunks. If a caller asks about unlisted pricing, secret discounts, or unconfirmed availability, the AI will refuse to speculate and immediately trigger a human handoff.
          </p>
        </div>
      </div>

      {/* Grid: Document Sources & Interactive Similarity Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sources & Documents */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Business Knowledge Sources
          </h3>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading knowledge base...</div>
            ) : sources.length === 0 ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                No knowledge documents indexed yet.
              </div>
            ) : (
              sources.map(src => {
                const doc = documents.find(d => d.source_id === src.id);
                return (
                  <div key={src.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-semibold text-white">{src.name}</h4>
                        <span className="text-[11px] text-slate-500 uppercase">· {src.type}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium">· Indexed &amp; Ready</span>
                    </div>

                    {doc && (
                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed font-mono whitespace-pre-wrap">
                        {doc.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Interactive Chunk Search Tester */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Test Vector Retrieval
          </h3>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <p className="text-xs text-slate-400">
              Type a caller question to test how accurately chunks are retrieved:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={testQuery}
                onChange={e => setTestQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestSearch()}
                placeholder="e.g. How much is Penthouse A?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTestSearch}
                disabled={isTesting || !testQuery.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
              >
                {isTesting ? 'Searching Chunks...' : 'Run Similarity Test'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-semibold">Matched Knowledge Chunks:</div>
                {testResults.map((res, i) => (
                  <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-blue-400 font-mono">Rank #{i + 1}</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {Math.round(res.score * 100)}% Match
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      "{res.chunk.chunk_text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateDocument} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Add Knowledge Document</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Document Title / Catalog Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="2026 Services &amp; Pricing Catalog"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Knowledge Category</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="faq">FAQ &amp; Common Inquiries</option>
                <option value="service_pricing">Services &amp; Pricing Rates</option>
                <option value="policy">Booking &amp; Cancellation Policies</option>
                <option value="document">General Business Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Document Text / Knowledge Content</label>
              <textarea
                rows={8}
                required
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Paste pricing rates, FAQs, product specs, and policies here..."
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The engine will automatically segment paragraphs into searchable vector chunks.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Index Document
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
