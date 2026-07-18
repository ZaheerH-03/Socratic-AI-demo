import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, ShieldAlert, GraduationCap, Clock, Award, 
  HelpCircle, User, BookOpen, Skull, Flame, Sparkles
} from "lucide-react";
import { Message, ExpertiseLevel, ProfessorStatus } from "../types";

interface ExamPhaseProps {
  topic: string;
  level: ExpertiseLevel;
  messages: Message[];
  turnCount: number;
  trapSprung: boolean;
  currentStatus: ProfessorStatus;
  loading: boolean;
  onSendMessage: (text: string, isTrapCallout: boolean) => void;
  onEndSession: () => void;
}

const STATUS_DETAILS: Record<ProfessorStatus, { title: string; color: string; desc: string; icon: any }> = {
  Pensive: {
    title: "Pensive Analysis",
    color: "bg-transparent border-[#1A1A1A]/30 text-[#1A1A1A]",
    desc: "Reviewing your previous statements, searching for subtle gaps in your conceptual foundation.",
    icon: HelpCircle,
  },
  Skeptical: {
    title: "Skeptical Stance",
    color: "bg-[#1A1A1A]/5 border-[#1A1A1A]/30 text-[#1A1A1A]",
    desc: "Sensing fragility in your premises. Prepared to deliver a swift, logical counter-argument.",
    icon: ShieldAlert,
  },
  Demanding: {
    title: "Demanding Rigour",
    color: "bg-[#1A1A1A] text-white border-[#1A1A1A]",
    desc: "Unsatisfied with superficial answers. Demanding core mechanics, precise proofs, or deep justifications.",
    icon: Flame,
  },
  Impressed: {
    title: "Impressed Evaluation",
    color: "border-double border-4 border-[#1A1A1A] text-[#1A1A1A] bg-[#1A1A1A]/5",
    desc: "A rare nod of scholarly respect. Your logic has passed initial scrutiny, but the bar has been raised.",
    icon: Award,
  },
  "Trap Set": {
    title: "Logical Trap Active",
    color: "bg-[#8C1D1D]/10 text-[#8C1D1D] border-[#8C1D1D] animate-pulse",
    desc: "A deliberate fallacy, flawed premise, or scientific misconception has been subtly introduced. Tread carefully!",
    icon: Skull,
  },
  Intrigued: {
    title: "Intrigued Interest",
    color: "border-dashed border-[#1A1A1A]/60 text-[#1A1A1A] bg-[#1A1A1A]/5",
    desc: "Fascinated by your line of reasoning. Probing deeper into this specific angle to test your bounds.",
    icon: Sparkles,
  },
  Disappointed: {
    title: "Disappointed Assessment",
    color: "border-[#1A1A1A]/20 text-[#1A1A1A]/60 bg-transparent",
    desc: "Frustrated by a lack of logical rigour, generic definitions, or falling head-first into simple traps.",
    icon: User,
  },
};

export default function ExamPhase({
  topic,
  level,
  messages,
  turnCount,
  trapSprung,
  currentStatus,
  loading,
  onSendMessage,
  onEndSession,
}: ExamPhaseProps) {
  const [inputText, setInputText] = useState("");
  const [isTrapCallout, setIsTrapCallout] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    onSendMessage(inputText.trim(), isTrapCallout);
    setInputText("");
    setIsTrapCallout(false);
  };

  const wordCount = inputText.trim() === "" ? 0 : inputText.trim().split(/\s+/).length;
  const activeStatus = STATUS_DETAILS[currentStatus] || STATUS_DETAILS.Pensive;
  const StatusIcon = activeStatus.icon;

  return (
    <div id="exam-phase-container" className="grid grid-cols-1 lg:grid-cols-4 max-w-7xl mx-auto w-full min-h-[78vh] bg-[#F5F2ED] border border-[#1A1A1A]/10 overflow-hidden">
      {/* LEFT SIDEBAR: PROFESSOR'S PANEL */}
      <div className="lg:col-span-1 border-r border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between bg-[#FBF9F6] space-y-6">
        <div className="space-y-6">
          {/* Professor Portrait */}
          <div id="professor-status-card" className="text-left">
            <div className="w-20 h-20 bg-[#1A1A1A] rounded-full mb-5 flex items-center justify-center">
              <span className="text-white text-2xl font-light italic">Ω</span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A] mb-1">Prof. Alistair Thorne</h3>
            <p className="font-sans text-[10px] text-[#1A1A1A]/50 tracking-wider uppercase font-bold mb-4">
              Chair of Dialectics & Critical Reasoning
            </p>
            <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
              Uncompromising and scholarly. Known for stripping away superficial knowledge to test structural logic.
            </p>
          </div>

          {/* Current Disposition */}
          <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-2">
            <span className="font-sans text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold block">
              Current Disposition
            </span>
            <div className={`flex items-center space-x-2 px-3 py-2 border font-serif text-xs font-bold ${activeStatus.color}`}>
              <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{activeStatus.title}</span>
            </div>
            <p className="font-sans text-[11px] text-[#1A1A1A]/60 leading-relaxed pt-1">
              {activeStatus.desc}
            </p>
          </div>

          {/* Exam Parameters */}
          <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-3">
            <span className="font-sans text-[9px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold block">
              Exam Parameters
            </span>
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between items-baseline border-b border-[#1A1A1A]/5 pb-1">
                <span className="text-[#1A1A1A]/60">Topic</span>
                <span className="font-serif italic text-right pl-4 max-w-[150px] truncate">{topic}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#1A1A1A]/5 pb-1">
                <span className="text-[#1A1A1A]/60">Academic Level</span>
                <span className="font-serif italic">{level}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#1A1A1A]/60">Interrogation</span>
                <span className="font-serif italic font-semibold">Turn {turnCount} of 10</span>
              </div>
            </div>
          </div>

          {/* Status Tracker */}
          <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-2">
            <div className="flex justify-between text-xs font-sans items-center">
              <span className="text-[#1A1A1A]/60">Misconception Trap</span>
              {trapSprung ? (
                <span className="text-[10px] font-mono tracking-tight text-red-700 font-bold uppercase bg-red-50 border border-red-200/50 px-1.5 py-0.5">
                  Sprung
                </span>
              ) : (
                <span className="text-[10px] font-mono tracking-tight text-amber-700 font-bold uppercase bg-amber-50 border border-amber-200/50 px-1.5 py-0.5">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="border-t border-[#1A1A1A]/10 pt-4">
          <button
            id="withdraw-early-btn"
            onClick={onEndSession}
            className="w-full bg-transparent hover:bg-red-50 border border-[#1A1A1A]/20 hover:border-red-300 text-[#1A1A1A]/80 hover:text-red-800 py-2.5 px-4 font-sans text-[10px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer text-center"
          >
            Withdraw & Finalize Grading
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: CHAT INTERFACE */}
      <div className="lg:col-span-3 flex flex-col justify-between bg-[#F5F2ED] h-[78vh]">
        {/* Chat Header Banner */}
        <div className="border-b border-[#1A1A1A]/10 px-6 py-4 flex justify-between items-center bg-[#F5F2ED] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-4.5 h-4.5 text-[#1A1A1A]/60" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/80">
              Dialogue Transcript: <span className="italic font-serif font-normal text-xs">"{topic}"</span>
            </span>
          </div>
          <div className="flex items-center space-x-2 font-mono text-[10px] text-[#1A1A1A]/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Turn {turnCount}/10</span>
          </div>
        </div>

        {/* Message Container - Editorial Academic Stack */}
        <div id="dialogue-scroll-box" className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 bg-[#FBF9F6]">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-2xl mx-auto"
                >
                  {isAssistant ? (
                    /* Professor Thorne printed block style */
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]">
                          Professor Thorne
                        </span>
                        <div className="h-[1px] flex-1 bg-[#1A1A1A]/10"></div>
                        {msg.status && (
                          <span className="text-[9px] font-sans uppercase tracking-wider text-[#1A1A1A]/50 italic">
                            ({msg.status})
                          </span>
                        )}
                      </div>
                      <p className="text-lg md:text-xl leading-relaxed italic text-[#1A1A1A] pl-4 border-l-2 border-[#1A1A1A]/20">
                        "{msg.content}"
                      </p>
                    </div>
                  ) : (
                    /* Examinee response printed block style */
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 opacity-50">
                        <div className="h-[1px] flex-1 bg-[#1A1A1A]/20"></div>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A]">
                          Examinee Response
                        </span>
                      </div>
                      
                      {msg.isTrapCallout && (
                        <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-800 text-[9px] font-sans font-bold uppercase tracking-wider">
                          <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                          <span>Challenged Reasoning (Trap Callout)</span>
                        </div>
                      )}

                      <p className="text-base font-sans leading-relaxed text-[#1A1A1A]/85 pl-4">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Assistant formulation typing state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="flex items-center space-x-3 text-[#1A1A1A]/40">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest animate-pulse">
                  Professor Thorne is formulating dialetic inquiry
                </span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 rounded-full bg-[#1A1A1A]/40 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 rounded-full bg-[#1A1A1A]/40 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 rounded-full bg-[#1A1A1A]/40 animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Active Trap Indicator Banner */}
        <AnimatePresence>
          {isTrapCallout && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border-t border-b border-red-200/50 px-8 py-3 flex items-start space-x-3 flex-shrink-0 w-full"
            >
              <ShieldAlert className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-sans text-[10px] font-bold uppercase tracking-wider text-red-800">
                  Dialectical Fallacy Challenge Active
                </h4>
                <p className="font-sans text-xs text-red-700 mt-0.5 leading-relaxed">
                  Your response will challenge the Professor's logical consistency. Identify precisely the flawed scientific premise or logical misconception you detected in their previous statement.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area with Circular submit */}
        <div className="px-8 md:px-12 py-8 border-t border-[#1A1A1A]/10 bg-[#F5F2ED] flex-shrink-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-end gap-6">
              {/* Challenge Button / Fallacy Callout Trigger */}
              <button
                id="trap-callout-toggle-btn"
                type="button"
                onClick={() => setIsTrapCallout(!isTrapCallout)}
                className={`p-3 rounded-full border transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center ${
                  isTrapCallout 
                    ? "bg-red-100 border-red-400 text-red-800 shadow-xs" 
                    : "bg-white border-[#1A1A1A]/20 text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]"
                }`}
                title="Challenge previous message (Callout flawed scientific misconception)"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <label className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold text-[#1A1A1A]/50 mb-2 block">
                  {isTrapCallout ? "State the fallacy you detected" : "Draft your reasoning"}
                </label>
                <textarea
                  id="exam-text-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isTrapCallout 
                      ? "Identify the logical fallacy or scientific misconception precisely..." 
                      : "The underlying mechanism suggests that..."
                  }
                  disabled={loading}
                  className="w-full bg-transparent border-none p-0 text-lg md:text-xl font-sans focus:ring-0 resize-none h-20 placeholder-[#1A1A1A]/20 italic focus:outline-none text-[#1A1A1A]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>

              {/* Submit Button - Elegant circular design */}
              <button
                id="submit-turn-btn"
                type="submit"
                disabled={loading || !inputText.trim()}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-full border flex-shrink-0 flex flex-col items-center justify-center text-[10px] font-sans font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  inputText.trim() && !loading
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-transparent hover:text-[#1A1A1A]"
                    : "border-[#1A1A1A]/10 text-[#1A1A1A]/20 cursor-not-allowed bg-transparent"
                }`}
              >
                <span>Submit</span>
                <span className="text-[8px] opacity-70 mt-0.5">Thesis</span>
              </button>
            </div>

            {/* Turn Actions / Footer Stats */}
            <div className="flex justify-between items-center text-[10px] font-sans text-[#1A1A1A]/40">
              <div className="flex items-center space-x-3">
                <span>
                  Words: <strong className="font-mono text-[#1A1A1A]">{wordCount}</strong>
                </span>
                {wordCount > 0 && (
                  <span className={`font-sans text-[9px] uppercase tracking-wider font-bold ${
                    wordCount < 10 ? "text-amber-700" : "text-[#1A1A1A]/70"
                  }`}>
                    {wordCount < 10 ? "⚠️ Superficial logic" : "✓ Substantial defense"}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Press Enter to dispatch response (Shift+Enter for break)</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
