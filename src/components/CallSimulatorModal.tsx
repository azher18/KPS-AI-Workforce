// ============================================================================
// KPS AI Workforce - Inbound Voice Call Simulator Modal
// Simulates live telephony call with WebSpeech audio, real-time tool calling,
// transcript generation, lead scoring, and automated CRM persistence.
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Send, Volume2, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import type { Agent, Call } from '../types/index.ts';
import { fetchJson } from '../lib/api.js';

interface CallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onCallCompleted?: (call: Call) => void;
}

interface MessageTurn {
  speaker: 'agent' | 'customer';
  text: string;
  time: string;
  toolCall?: { name: string; params: any };
  toolResult?: any;
}

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({
  isOpen,
  onClose,
  agent,
  onCallCompleted
}) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'completed'>('idle');
  const [callerName, setCallerName] = useState('Harrison Sterling');
  const [callerPhone, setCallerPhone] = useState('+1 (212) 555-8912');
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<MessageTurn[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedCallRecord, setCompletedCallRecord] = useState<any>(null);

  const timerRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && callState === 'idle') {
      startRinging();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiSpeaking]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = agent.personality === 'Friendly' ? 1.1 : 1.0;
    
    // Attempt to pick a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('English')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startRinging = () => {
    setCallState('ringing');
    setDuration(0);
    setMessages([]);
    setCompletedCallRecord(null);

    // Simulate phone answering after 1.8 seconds
    setTimeout(async () => {
      try {
        const startRes = await fetchJson(`/api/agents/${agent.id}/call/start`, {
          method: 'POST',
          body: JSON.stringify({ callerPhone, callerName })
        });

        setCallState('connected');
        
        // Start call duration timer
        timerRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);

        // Agent initial greeting
        const greetingText = startRes.initialGreeting || agent.greeting;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([{ speaker: 'agent', text: greetingText, time: now }]);
        speakText(greetingText);
      } catch (e) {
        console.error('Call connection failed:', e);
        setCallState('connected');
      }
    }, 1600);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    setInputText('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MessageTurn = { speaker: 'customer', text, time: now };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsProcessing(true);

    try {
      const historyPayload = updatedMessages.map(m => ({ speaker: m.speaker, message: m.text }));
      const response = await fetchJson(`/api/agents/${agent.id}/call/message`, {
        method: 'POST',
        body: JSON.stringify({
          customerMessage: text,
          conversationHistory: historyPayload,
          callerPhone,
          callerName
        })
      });

      const agentTurn: MessageTurn = {
        speaker: 'agent',
        text: response.agentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: response.toolCall,
        toolResult: response.toolResult
      };

      setMessages(prev => [...prev, agentTurn]);
      speakText(response.agentMessage);
    } catch (err: any) {
      console.error('Message failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHangUp = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsAiSpeaking(false);

    setIsProcessing(true);
    const fullTranscript = messages.map(m => `${m.speaker === 'agent' ? agent.name : callerName}: ${m.text}`).join('\n');

    try {
      const result = await fetchJson(`/api/agents/${agent.id}/call/end`, {
        method: 'POST',
        body: JSON.stringify({
          fullTranscript,
          durationSeconds: Math.max(duration, 15),
          callerPhone,
          callerName
        })
      });

      setCompletedCallRecord(result);
      setCallState('completed');
      if (onCallCompleted && result.callRecord) {
        onCallCompleted(result.callRecord);
      }
    } catch (e) {
      console.error('Failed to end call:', e);
      setCallState('completed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header / Caller Identification */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Inbound Telephony Simulator</h3>
                <span className="text-xs text-blue-400 font-medium">· Direct DID Route</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Agent: {agent.name}</span>
                <span>·</span>
                <span>Voice: {agent.voice_provider.toUpperCase()} ({agent.voice_id})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callState === 'connected' && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatSeconds(duration)}</span>
              </div>
            )}
            <button
              onClick={() => {
                handleHangUp();
                onClose();
              }}
              className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>

        {/* Ringing State */}
        {callState === 'ringing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-900/50">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400 animate-bounce">
                <Phone className="w-8 h-8" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/40 animate-ping"></div>
            </div>
            <h4 className="text-lg font-medium text-white mb-1">Incoming Call...</h4>
            <p className="text-sm text-slate-400 mb-2">{callerPhone} · {callerName}</p>
            <p className="text-xs text-slate-500">Connecting SIP trunk to {agent.name}...</p>
          </div>
        )}

        {/* Connected Call Screen */}
        {callState === 'connected' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/80">
            {/* Live Audio Status Bar */}
            <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className={`w-4 h-4 ${isAiSpeaking ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs text-slate-300">
                  {isAiSpeaking ? `${agent.name} is speaking...` : 'Listening to caller...'}
                </span>
              </div>

              {/* Waveform graphic */}
              <div className="flex items-center gap-1 h-4">
                {[0.4, 0.8, 0.5, 0.9, 0.6, 1.0, 0.4, 0.7].map((height, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${isAiSpeaking ? 'bg-blue-400' : 'bg-slate-700'}`}
                    style={{ height: isAiSpeaking ? `${height * 16}px` : '4px' }}
                  />
                ))}
              </div>
            </div>

            {/* Live Transcript Stream */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.speaker === 'agent' ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
                    <span className="font-medium text-slate-300">
                      {m.speaker === 'agent' ? agent.name : callerName}
                    </span>
                    <span>·</span>
                    <span>{m.time}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.speaker === 'agent'
                        ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Tool Call Visualizer */}
                  {m.toolCall && (
                    <div className="mt-2 text-xs font-mono bg-slate-950/80 border border-blue-500/30 text-blue-300 rounded-lg p-2.5 max-w-[85%] flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Backend Tool Executed: {m.toolCall.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Params: {JSON.stringify(m.toolCall.params)}
                      </div>
                      {m.toolResult && (
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Action succeeded &amp; updated database</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  <span>AI reasoning &amp; knowledge retrieval...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts Helper */}
            <div className="px-6 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-500 shrink-0">Try asking:</span>
              <button
                onClick={() => handleSendMessage('Is Penthouse A still available and what is the listed price?')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition shrink-0"
              >
                Inquire listing price
              </button>
              <button
                onClick={() => handleSendMessage('Can I book a private viewing for tomorrow at 2:00 PM?')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition shrink-0"
              >
                Book private showing
              </button>
              <button
                onClick={() => handleSendMessage('I would like to speak to the managing broker directly.')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition shrink-0"
              >
                Request human transfer
              </button>
            </div>

            {/* Caller Input & Controls */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Speak or type caller response..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isProcessing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>

              <button
                onClick={handleHangUp}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Completed Call Summary Screen */}
        {callState === 'completed' && completedCallRecord && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">Call Completed &amp; Processed</h4>
                  <p className="text-xs text-slate-400">
                    Duration: {formatSeconds(completedCallRecord.callRecord?.duration_seconds || duration)} · Sentiment: {completedCallRecord.summary?.sentiment}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Autonomous Lead Score</div>
                <div className="text-2xl font-bold text-blue-400 font-mono">
                  {completedCallRecord.summary?.leadScore || 85} / 100
                </div>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Call Summary</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {completedCallRecord.summary?.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Classified Intent:</span>
                  <span className="text-slate-200 font-medium">{completedCallRecord.summary?.intent}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Call Outcome:</span>
                  <span className="text-emerald-400 font-medium">{completedCallRecord.summary?.outcome}</span>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Recommended Business Action
              </div>
              <p className="text-sm text-slate-200">
                {completedCallRecord.summary?.recommendedAction}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={startRinging}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
              >
                Simulate Another Call
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
              >
                <span>View in CRM &amp; Calls</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
