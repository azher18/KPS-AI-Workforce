// ============================================================================
// KPS AI Workforce - Embeddable Website Widget Modal & Code Generator
// Section 26 & 27 of Specification: Public non-sensitive identifier
// ============================================================================

import React, { useState } from 'react';
import { Bot, Copy, Check, ExternalLink, X, Sparkles } from 'lucide-react';
import type { Agent } from '../types/index.ts';

interface WidgetEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export const WidgetEmbedModal: React.FC<WidgetEmbedModalProps> = ({ isOpen, onClose, agent }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `<!-- KPS AI Workforce Autonomous Chat & Voice Widget -->
<script 
  src="https://kps-workforce.ai/widget.js" 
  data-agent-id="${agent.public_id}" 
  data-theme="dark"
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Embeddable Website Agent</h3>
            <p className="text-xs text-slate-400">Deploy {agent.name} on any customer website with 1 line of code.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">Public Embed Snippet</label>
          <div className="relative">
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
              {scriptCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
            </button>
          </div>
        </div>

        {/* Security & Token Sandbox info */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Isolated Public Identifier: <code className="text-blue-400 font-mono">{agent.public_id}</code></span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Direct database access is forbidden. All conversational interactions run through authenticated backend proxies with strict rate-limiting.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
