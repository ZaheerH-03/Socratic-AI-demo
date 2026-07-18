import React, { useState } from "react";
import { motion } from "motion/react";
import { GraduationCap, BookOpen, ChevronRight, HelpCircle, Sparkles } from "lucide-react";
import { ExpertiseLevel } from "../types";

interface SetupPhaseProps {
  onStartExam: (topic: string, level: ExpertiseLevel) => void;
  loading: boolean;
}

const TOPIC_PRESETS = [
  {
    title: "Quantum Copenhagen Interpretation",
    description: "The orthodox quantum view. Wavefunction collapse, observer effect, and Heisenberg's uncertainty principle.",
    icon: Sparkles,
  },
  {
    title: "The Roman Republic's Demise",
    description: "The transition to Empire. Caesar's crossing of the Rubicon, the Gracchi reforms, and institutional decay.",
    icon: BookOpen,
  },
  {
    title: "Keynesian vs. Austrian Economics",
    description: "Business cycles, monetary policy, government intervention, and Friedrich Hayek's price mechanism.",
    icon: GraduationCap,
  },
  {
    title: "Existentialism and Absurdism",
    description: "Jean-Paul Sartre's radical freedom, Albert Camus's struggle against the void, and Friedrich Nietzsche's will to power.",
    icon: HelpCircle,
  },
];

export default function SetupPhase({ onStartExam, loading }: SetupPhaseProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [level, setLevel] = useState<ExpertiseLevel>("Intermediate");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = selectedPreset !== null ? TOPIC_PRESETS[selectedPreset].title : customTopic.trim();
    if (!topic) return;
    onStartExam(topic, level);
  };

  const currentTopicValue = selectedPreset !== null ? TOPIC_PRESETS[selectedPreset].title : customTopic;

  return (
    <div id="setup-phase-container" className="max-w-4xl mx-auto py-8 px-4 font-serif">
      {/* Editorial Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <span className="font-sans text-[10px] text-[#1A1A1A]/60 tracking-[0.25em] uppercase font-bold">
          Examination Board Portal
        </span>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] tracking-tight mt-3 mb-4 font-light italic leading-none">
          Intellectual Dialectic
        </h1>
        <p className="font-sans text-sm text-[#1A1A1A]/70 max-w-2xl mx-auto leading-relaxed">
          Welcome, Candidate. You stand before the threshold of a rigorous oral examination. Our AI Professor will 
          never offer direct answers, instead guiding you through a targeted, relentless sequence of Socratic questioning 
          to discover the precise boundaries of your understanding.
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 rounded-none shadow-xs"
      >
        <form onSubmit={handleStart} className="space-y-8">
          {/* STEP 1: SELECT TOPIC */}
          <div>
            <div className="flex items-center space-x-3 mb-6 border-b border-[#1A1A1A]/10 pb-2">
              <span className="font-mono text-xs border border-[#1A1A1A] text-[#1A1A1A] px-2 py-0.5 font-bold">
                01
              </span>
              <h2 className="font-serif text-lg text-[#1A1A1A] font-medium tracking-tight">
                Choose or Define Your Thesis Topic
              </h2>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {TOPIC_PRESETS.map((preset, index) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === index;
                return (
                  <button
                    id={`preset-${index}`}
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(index);
                      setCustomTopic("");
                    }}
                    className={`text-left p-5 rounded-none border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                        : "bg-[#FBF9F6] border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-[#F5F2ED]"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${isSelected ? "bg-white/10 text-white" : "bg-[#1A1A1A]/5 text-[#1A1A1A]/70"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`font-serif text-sm font-semibold ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>
                          {preset.title}
                        </h3>
                        <p className={`font-sans text-xs mt-1 leading-relaxed ${isSelected ? "text-white/70" : "text-[#1A1A1A]/60"}`}>
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Topic Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="font-mono text-[10px] text-[#1A1A1A]/40 tracking-wider">OR</span>
              </div>
              <input
                id="custom-topic-input"
                type="text"
                placeholder="Declare any specific custom topic (e.g., Photosynthesis, The French Revolution, Epistemology...)"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  setSelectedPreset(null);
                }}
                className="w-full pl-12 pr-4 py-3 bg-[#FBF9F6] border border-[#1A1A1A]/10 rounded-none focus:outline-none focus:border-[#1A1A1A] text-[#1A1A1A] font-serif placeholder-[#1A1A1A]/30 text-sm"
              />
            </div>
          </div>

          {/* STEP 2: SELECT EXPERTISE */}
          <div>
            <div className="flex items-center space-x-3 mb-6 border-b border-[#1A1A1A]/10 pb-2">
              <span className="font-mono text-xs border border-[#1A1A1A] text-[#1A1A1A] px-2 py-0.5 font-bold">
                02
              </span>
              <h2 className="font-serif text-lg text-[#1A1A1A] font-medium tracking-tight">
                Set Academic Level of Examination
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["Beginner", "Intermediate", "Expert"] as ExpertiseLevel[]).map((lvl) => {
                const isSelected = level === lvl;
                const details = {
                  Beginner: {
                    title: "Undergraduate Colloquium",
                    desc: "Focuses on fundamental definitions, core concepts, and basic relations. Socratic probes are supportive and educational."
                  },
                  Intermediate: {
                    title: "Graduate Thesis Review",
                    desc: "Requires rigorous conceptual modeling, causal mechanisms, and logical coherence. Prepared to catch logical traps."
                  },
                  Expert: {
                    title: "PhD Defense Board",
                    desc: "No quarter given. Relentless questioning of edge cases, assumptions, formal proofs, and epistemic boundaries."
                  }
                }[lvl];

                return (
                  <button
                    id={`level-btn-${lvl.toLowerCase()}`}
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`text-left p-5 rounded-none border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
                        : "bg-[#FBF9F6] border-[#1A1A1A]/10 text-[#1A1A1A] hover:border-[#1A1A1A]/40 hover:bg-[#F5F2ED]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[10px] font-bold tracking-wider uppercase ${isSelected ? "text-white" : "text-[#1A1A1A]/60"}`}>
                          {lvl}
                        </span>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <h3 className={`font-serif text-sm font-semibold mt-2 ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>
                        {details.title}
                      </h3>
                      <p className={`font-sans text-xs mt-1 leading-relaxed ${isSelected ? "text-white/70" : "text-[#1A1A1A]/60"}`}>
                        {details.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* START BUTTON */}
          <div className="pt-6 border-t border-[#1A1A1A]/10 flex justify-end">
            <button
              id="start-exam-submit"
              type="submit"
              disabled={loading || !currentTopicValue.trim()}
              className={`flex items-center space-x-2 px-8 py-3.5 rounded-none font-sans text-xs font-bold uppercase tracking-widest shadow-xs transition-all duration-300 cursor-pointer ${
                currentTopicValue.trim() && !loading
                  ? "bg-[#1A1A1A] text-white hover:bg-transparent hover:text-[#1A1A1A] border border-[#1A1A1A]"
                  : "bg-[#1A1A1A]/10 text-[#1A1A1A]/30 border border-transparent cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />
                  <span>Preparing Defense...</span>
                </>
              ) : (
                <>
                  <span>Begin Oral Examination</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
