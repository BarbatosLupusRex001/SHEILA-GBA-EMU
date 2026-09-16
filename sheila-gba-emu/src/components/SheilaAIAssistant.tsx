import React, { useState, useRef, useEffect } from 'react';
import { Game, AIMessage, EmulatorSettings } from '../types';
import { WolfIcon } from './WolfIcon';
import Markdown from 'react-markdown';
import {
  Send,
  Bot,
  Sparkles,
  Globe,
  ExternalLink,
  RotateCcw,
  User,
  Gamepad2,
} from 'lucide-react';

interface SheilaAIAssistantProps {
  activeGame: Game | null;
  settings: EmulatorSettings;
}

export const SheilaAIAssistant: React.FC<SheilaAIAssistantProps> = ({
  activeGame,
  settings,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **SHEILA AI**, your built-in GBA emulation assistant.

I can help you with:
- **Game walkthroughs, hidden secrets, and strategies**
- **Action Replay, GameShark, and CodeBreaker cheat codes**
- **Save states and cartridge battery backups**
- **Touch and physical controller button mappings**
- **Exporting the Android Studio project and GitHub Actions CI**

How can I help you today?`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/sheila-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          currentGame: activeGame
            ? {
                title: activeGame.title,
                code: activeGame.code,
                genre: activeGame.genre,
              }
            : null,
          allowOnlineSearch: settings.ai.enableOnlineSearch,
          history: messages.slice(-5),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from SHEILA AI');
      }

      const aiReply: AIMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const fallbackMsg: AIMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary connection issue. Please check your connection or try asking again. Note that all emulator features and local saves remain completely functional.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    activeGame
      ? `Find Action Replay or GameShark cheat codes for ${activeGame.title}`
      : 'What cheat code formats does this emulator support?',
    'How do save states differ from .sav battery files?',
    'Best touch layout and controller mapping advice for GBA games',
    'How do I build the Android APK with GitHub Actions CI?',
  ];

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 flex flex-col h-[calc(100vh-5.5rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1f2533] pb-4">
        <div className="flex items-center gap-3">
          <WolfIcon size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">SHEILA AI Copilot</h2>
              <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-mono">
                GEMINI 3.8 FLASH
              </span>
              {settings.ai.enableOnlineSearch && (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <Globe className="w-2.5 h-2.5" />
                  <span>SEARCH ACTIVE</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {activeGame ? (
                <span>
                  Current Context: <strong className="text-white">{activeGame.title}</strong> ({activeGame.code})
                </span>
              ) : (
                'No game currently running (General Assistance)'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-reset',
                role: 'assistant',
                content: `Chat history cleared. How can I assist you with **SHEILA GBA EMU**?`,
                timestamp: Date.now(),
              },
            ])
          }
          className="p-2 text-zinc-400 hover:text-white bg-zinc-800/80 rounded-lg text-xs"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                  <WolfIcon size={22} rounded={false} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-[#121620] border border-[#212937] text-zinc-200 rounded-bl-sm space-y-2'
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Sources & Citations if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-[#1f2533] space-y-1">
                    <span className="text-[10px] text-zinc-400 font-semibold block flex items-center gap-1">
                      <Globe className="w-3 h-3 text-indigo-400" />
                      <span>Web Sources Grounding:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-300 hover:text-indigo-200 bg-[#171c26] border border-[#252c3c] px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-800 border border-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-white">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
              <WolfIcon size={22} rounded={false} />
            </div>
            <div className="bg-[#121620] border border-[#212937] rounded-2xl px-4 py-3 text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>SHEILA AI is formulating an answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 bg-[#131720] hover:bg-zinc-800 border border-[#222938] hover:border-indigo-500/50 rounded-full text-[11px] text-zinc-300 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[#11151e] border border-[#212937] rounded-2xl p-2 shadow-lg"
      >
        <input
          type="text"
          placeholder="Ask SHEILA AI about cheats, gameplay, controllers, or Android APK build..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
