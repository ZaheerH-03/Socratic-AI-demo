import React, { useState } from "react";
import { Message, ExpertiseLevel, ProfessorStatus, MasteryReportData } from "./types";
import SetupPhase from "./components/SetupPhase";
import ExamPhase from "./components/ExamPhase";
import ReportPhase from "./components/ReportPhase";
import { GraduationCap, Award, RotateCcw } from "lucide-react";

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'grill' | 'report'>('setup');
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<ExpertiseLevel>("Intermediate");
  const [messages, setMessages] = useState<Message[]>([]);
  const [turnCount, setTurnCount] = useState(0);
  const [trapSprung, setTrapSprung] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProfessorStatus>('Pensive');
  const [loading, setLoading] = useState(false);
  const [masteryReport, setMasteryReport] = useState<MasteryReportData | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Helper to get formatted timestamp
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Setup Phase: Initiate Exam
  const handleStartExam = async (selectedTopic: string, selectedLevel: ExpertiseLevel) => {
    setLoading(true);
    setErrorText(null);
    setTopic(selectedTopic);
    setLevel(selectedLevel);
    setTurnCount(1);
    setTrapSprung(false);
    setCurrentStatus('Pensive');

    const welcomePromptText = `Candidate has entered the oral examination room for the topic: "${selectedTopic}". Their declared expertise is "${selectedLevel}". Address them in-character as Professor Socratic AI, welcome them with academic gravity, and immediately open with your first challenging Socratic question suited to their level. Do not give direct explanations.`;

    const initialMessage: Message = {
      id: "system-init",
      role: "user",
      content: welcomePromptText,
      timestamp: getFormattedTime()
    };

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          level: selectedLevel,
          messages: [initialMessage],
          turnCount: 1,
          trapSprung: false
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to initialize professor.");
      }

      const data = await response.json();

      const welcomeMessage: Message = {
        id: `prof-init`,
        role: "assistant",
        content: data.professorMessage,
        status: data.professorStatus,
        timestamp: getFormattedTime()
      };

      setMessages([welcomeMessage]);
      setCurrentStatus(data.professorStatus);
      if (data.trapActive) {
        setTrapSprung(true);
      }
      setPhase('grill');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Exam Phase: Send Student Answer & Get Counter-Probe
  const handleSendMessage = async (text: string, isTrapCallout: boolean) => {
    if (loading) return;

    setLoading(true);
    setErrorText(null);

    // Create and add student message to chat log
    const studentMessage: Message = {
      id: `student-${Date.now()}`,
      role: "user",
      content: text,
      isTrapCallout: isTrapCallout,
      timestamp: getFormattedTime()
    };

    const nextTurnCount = turnCount + 1;
    setTurnCount(nextTurnCount);

    const updatedMessages = [...messages, studentMessage];
    setMessages(updatedMessages);

    try {
      // Call Socratic Chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          level,
          messages: updatedMessages,
          turnCount: nextTurnCount,
          trapSprung
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to receive professor counter-probe.");
      }

      const data = await response.json();

      const profResponse: Message = {
        id: `prof-${Date.now()}`,
        role: "assistant",
        content: data.professorMessage,
        status: data.professorStatus,
        timestamp: getFormattedTime()
      };

      setMessages(prev => [...prev, profResponse]);
      setCurrentStatus(data.professorStatus);

      if (data.trapActive) {
        setTrapSprung(true);
      }

      // Check if turnCount has reached maximum (10 turns)
      if (nextTurnCount >= 10) {
        // Automatically compile report after completing the 10th turn
        await handleEndSession([...updatedMessages, profResponse]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An error occurred with the Professor. Please resubmit your defense.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Compile Board Grading and Transition to Report
  const handleEndSession = async (finalMessages?: Message[]) => {
    setLoading(true);
    setErrorText(null);
    setPhase('grill'); // ensure we show compile states if any

    const messagesToEvaluate = finalMessages || messages;

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          level,
          messages: messagesToEvaluate.filter(m => m.id !== "system-init")
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to compile Board Evaluation.");
      }

      const reportData = await response.json();
      setMasteryReport(reportData);
      setPhase('report');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to compile your final evaluation. Please try requesting grade again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhase('setup');
    setTopic("");
    setMessages([]);
    setTurnCount(0);
    setTrapSprung(false);
    setMasteryReport(null);
    setErrorText(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-serif flex flex-col selection:bg-[#1A1A1A]/10 selection:text-[#1A1A1A]">
      {/* GLOBAL HEADER BAR - Editorial Aesthetic */}
      <header className="w-full border-b border-[#1A1A1A]/10 px-6 md:px-10 py-5 flex flex-col md:flex-row justify-between items-start md:items-end bg-[#F5F2ED] gap-4 md:gap-0 flex-shrink-0">
        <div className="cursor-pointer" onClick={handleReset}>
          <h1 className="text-[10px] tracking-[0.2em] uppercase font-sans font-bold text-[#1A1A1A]/60 mb-1">
            Academic Interrogation System
          </h1>
          <p className="text-3xl md:text-4xl font-light italic leading-none text-[#1A1A1A]">
            Socratic AI
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-right">
          {phase === 'grill' && (
            <div className="flex items-center space-x-2 mr-2 font-sans text-xs uppercase tracking-wider text-[#1A1A1A]/70">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>Session Live</span>
            </div>
          )}
          {phase === 'report' && (
            <button
              id="reset-top-btn"
              onClick={handleReset}
              className="flex items-center space-x-1.5 border border-[#1A1A1A] bg-transparent text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] px-3 py-1 text-xs font-sans uppercase tracking-widest transition-all duration-200 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>New Exam</span>
            </button>
          )}
          <span className="text-[10px] uppercase tracking-widest font-sans border border-[#1A1A1A] px-2.5 py-1">
            Session ID: {topic ? `${topic.substring(0, 3).toUpperCase()}-SOCRATIC` : "882-SOCRATIC"}
          </span>
        </div>
      </header>

      {/* ERROR BANNER */}
      {errorText && (
        <div className="bg-[#FFF0F0] border-b border-[#E5C3C3] text-[#8C1D1D] px-6 py-2.5 text-xs font-sans text-center">
          <div className="max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <span>⚠️ {errorText}</span>
            <button
              onClick={() => setErrorText(null)}
              className="underline font-bold hover:text-red-950 ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col justify-center overflow-hidden">
        {phase === 'setup' && (
          <SetupPhase onStartExam={handleStartExam} loading={loading} />
        )}

        {phase === 'grill' && (
          <ExamPhase
            topic={topic}
            level={level}
            messages={messages.filter(m => m.id !== "system-init")}
            turnCount={turnCount}
            trapSprung={trapSprung}
            currentStatus={currentStatus}
            loading={loading}
            onSendMessage={handleSendMessage}
            onEndSession={() => handleEndSession()}
          />
        )}

        {phase === 'report' && masteryReport && (
          <ReportPhase
            topic={topic}
            level={level}
            report={masteryReport}
            onReset={handleReset}
          />
        )}
      </main>

      {/* BOTTOM DECORATIVE FOOTER */}
      <footer className="h-12 border-t border-[#1A1A1A]/10 bg-[#1A1A1A] text-white/40 flex items-center px-6 md:px-10 justify-between font-sans text-[9px] uppercase tracking-[0.3em] flex-shrink-0">
        <span className="hidden sm:inline">Logos & Technê Educational Suite</span>
        <span>Oxford Standards • AI-2026-V5</span>
        <span>No direct answers allowed</span>
      </footer>
    </div>
  );
}
