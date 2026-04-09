import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GlassCard from '../ui/GlassCard';
import { Message, UserProfile } from '../../types';
import { getCoachResponse } from '../../services/gemini';
import { cn } from '../../lib/utils';

interface AICoachProps {
  user: UserProfile;
}

export default function AICoach({ user }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `Hey ${user.name}! I'm your Quick Focus Coach. Need an instant boost? Tell me how much time you have! ⚡` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [energy, setEnergy] = useState<'Low' | 'Normal' | 'High'>('Normal');
  const [focus, setFocus] = useState<'Low' | 'Normal' | 'High'>('Normal');
  const [time, setTime] = useState<number>(5);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const userContext = `
      User Name: ${user.name}
      Energy Level: ${energy}
      Focus Level: ${focus}
      Time Available: ${time} minutes
    `;
    
    const response = await getCoachResponse([...messages, userMessage], userContext);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
            <Sparkles size={20} className="text-neon-blue" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Focus Coach</h1>
            <p className="text-[10px] text-neon-blue font-bold uppercase tracking-widest">Instant Reset</p>
          </div>
        </div>
      </header>

      {/* Status Selectors */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/40 block mb-1">Energy</span>
          <div className="flex gap-0.5">
            {(['Low', 'Normal', 'High'] as const).map((e) => (
              <button
                key={e}
                onClick={() => setEnergy(e)}
                className={cn(
                  "flex-1 py-1 rounded-md text-[8px] font-bold transition-all",
                  energy === e ? "bg-neon-blue text-black" : "bg-white/5 text-white/40"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/40 block mb-1">Focus</span>
          <div className="flex gap-0.5">
            {(['Low', 'Normal', 'High'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFocus(f)}
                className={cn(
                  "flex-1 py-1 rounded-md text-[8px] font-bold transition-all",
                  focus === f ? "bg-neon-blue text-black" : "bg-white/5 text-white/40"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/40 block mb-1">Time (Min)</span>
          <div className="flex gap-0.5">
            {([2, 5, 10] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={cn(
                  "flex-1 py-1 rounded-md text-[8px] font-bold transition-all",
                  time === t ? "bg-neon-blue text-black" : "bg-white/5 text-white/40"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === 'user' ? "bg-white/5 border-white/10" : "bg-neon-blue/10 border-neon-blue/20"
              )}>
                {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} className="text-neon-blue" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-white/5 rounded-tr-none text-white/90" 
                  : "bg-neon-blue/5 border border-neon-blue/10 rounded-tl-none text-white/90"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Loader2 size={14} className="text-neon-blue animate-spin" />
            </div>
            <div className="bg-neon-blue/5 border border-neon-blue/10 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-neon-blue/40 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-neon-blue/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-neon-blue/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your coach..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 w-10 bg-neon-blue text-black rounded-xl flex items-center justify-center disabled:opacity-50 transition-transform active:scale-90"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
