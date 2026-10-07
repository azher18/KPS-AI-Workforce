// ============================================================================
// KPS AI Workforce - Call Center & Telephony Transcripts
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Play, 
  Pause, 
  Sparkles, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  X,
  Plus
} from 'lucide-react';
import type { Call } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

interface CallsListProps {
  onSimulateCall?: () => void;
}

export const CallsList: React.FC<CallsListProps> = ({ onSimulateCall }) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await fetchJson<Call[]>('/api/calls');
      setCalls(data);
    } catch (e) {
      console.error('Failed to load calls:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const togglePlayback = (callId: string) => {
    if (playingCallId === callId) {
      setPlayingCallId(null);
    } else {
      setPlayingCallId(callId);
      // Auto stop after 5 seconds simulation
      setTimeout(() => {
        setPlayingCallId(null);
      }, 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Call Center &amp; Audio Transcripts</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <span>{calls.length} autonomous calls processed</span>
            <span>·</span>
            <span>100% recorded &amp; transcribed</span>
          </div>
        </div>

        {onSimulateCall && (
          <button
            onClick={onSimulateCall}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Simulate Inbound Call</span>
          </button>
        )}
      </div>

      {/* Calls Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4">Caller &amp; Direction</th>
                <th className="py-3 px-4">Intent &amp; Summary</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Audio</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading call logs...
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm text-slate-300">No calls recorded yet</p>
                    <p className="text-xs text-slate-500 mt-1">Use the "Simulate Inbound Call" button to test the AI receptionist.</p>
                  </td>
                </tr>
              ) : (
                calls.map(call => (
                  <tr
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{call.phone_number}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-blue-400">· {call.direction.toUpperCase()}</span>
                        <span>·</span>
                        <span>{new Date(call.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="text-slate-200 font-medium truncate">{call.intent}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{call.summary}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {formatDuration(call.duration_seconds)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">
                        · {call.outcome}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`font-bold ${call.lead_score >= 70 ? 'text-amber-400' : 'text-blue-400'}`}>
                        {call.lead_score}
                      </span>
                      <span className="text-[11px] text-slate-500"> / 100</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          togglePlayback(call.id);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition border ${
                          playingCallId === call.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Listen to call audio recording"
                      >
                        {playingCallId === call.id ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs text-slate-400 hover:text-blue-400 font-medium">
                        View
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Details & Full Transcript Drawer/Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCall(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCall.phone_number}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Duration: {formatDuration(selectedCall.duration_seconds)}</span>
                    <span>·</span>
                    <span>Sentiment: {selectedCall.sentiment}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Outcome: {selectedCall.outcome}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Autonomous Score</div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {selectedCall.lead_score} / 100
                </div>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="my-4 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Executive AI Summary</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">
                {selectedCall.summary}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
                <span>Classified Intent: <strong className="text-slate-200">{selectedCall.intent}</strong></span>
                <span>Telephony Provider: <strong className="text-slate-200">{selectedCall.provider.toUpperCase()}</strong></span>
              </div>
            </div>

            {/* Full Transcript */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Complete Call Audio Transcript
              </h4>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3 font-mono text-xs">
                {selectedCall.transcript ? (
                  selectedCall.transcript.split('\n').map((line, idx) => {
                    const isAgent = line.startsWith('Sarah') || line.startsWith('Maya') || line.startsWith('Agent');
                    return (
                      <div key={idx} className={`leading-relaxed ${isAgent ? 'text-blue-300' : 'text-slate-200'}`}>
                        {line}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 italic">No transcript recorded for this session.</div>
                )}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
