import React from "react";
import { motion } from "motion/react";
import { 
  Award, AlertTriangle, CheckCircle, RotateCcw, 
  BookOpen, ShieldCheck, Mail, ChevronRight, BarChart3
} from "lucide-react";
import { MasteryReportData, ExpertiseLevel } from "../types";

interface ReportPhaseProps {
  topic: string;
  level: ExpertiseLevel;
  report: MasteryReportData;
  onReset: () => void;
}

export default function ReportPhase({ topic, level, report, onReset }: ReportPhaseProps) {
  // Define styling depending on grade
  const gradeStyles = {
    "Exceeds Expectations": {
      seal: "border-[#1A1A1A] bg-[#1A1A1A] text-white",
      laurels: "text-[#1A1A1A]",
      badge: "border border-[#1A1A1A] text-[#1A1A1A]/80 bg-[#1A1A1A]/5",
      desc: "Outstanding academic performance. You demonstrated logical rigour, deep conceptual grounding, and successfully defended your thesis against the Professor's deepest probes."
    },
    "Meets Expectations": {
      seal: "border-[#1A1A1A] bg-transparent text-[#1A1A1A]",
      laurels: "text-[#1A1A1A]/80",
      badge: "border border-[#1A1A1A]/40 text-[#1A1A1A]/80 bg-transparent",
      desc: "Sufficient and commendable defense. You grasp the core tenets and mechanisms, with only minor gaps or a brief stumble during intense cross-examination."
    },
    "Passes": {
      seal: "border-dashed border-[#1A1A1A] bg-transparent text-[#1A1A1A]/80",
      laurels: "text-[#1A1A1A]/60",
      badge: "border border-[#1A1A1A]/20 text-[#1A1A1A]/60 bg-transparent",
      desc: "Satisfactory defense. You possess basic conceptual literacy, but lack the logical rigour or depth of explanation required for distinction."
    },
    "Fails": {
      seal: "border-red-600 bg-red-50 text-red-800",
      laurels: "text-red-700",
      badge: "border border-red-200 text-red-700 bg-red-50/50",
      desc: "Inadequate defense. Severe gaps in foundational premises, logical inconsistencies, or falling blindly into traps without recovery."
    }
  }[report.grade] || {
    seal: "border-[#1A1A1A]/30 bg-transparent text-[#1A1A1A]",
    laurels: "text-[#1A1A1A]/40",
    badge: "border border-[#1A1A1A]/20 text-[#1A1A1A]/60 bg-transparent",
    desc: "Examination complete."
  };

  return (
    <div id="report-phase-container" className="max-w-4xl mx-auto py-8 px-4 space-y-8 font-serif">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <span className="font-sans text-[10px] text-[#1A1A1A]/60 tracking-[0.25em] uppercase font-bold">
          Board of Examiners Decree
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] tracking-tight mt-2 font-light italic leading-none">
          Mastery & Evaluation Report
        </h1>
        <p className="font-sans text-xs text-[#1A1A1A]/60 max-w-lg mx-auto mt-2 italic leading-relaxed">
          Official academic summary of the oral thesis defense conducted by Professor Thorne.
        </p>
      </motion.div>

      {/* CORE PERFORMANCE OVERVIEW: GRADE & LAURELS */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 rounded-none shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
      >
        {/* Laurels & Grade Seal */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#1A1A1A]/10">
          <Award className={`w-12 h-12 mb-3 ${gradeStyles.laurels}`} />
          <span className="font-sans text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-bold">
            Suggested Grade
          </span>
          <div className={`mt-3 px-5 py-3 border font-serif text-lg md:text-xl font-bold uppercase tracking-widest text-center select-none ${gradeStyles.seal}`}>
            {report.grade}
          </div>
          <span className="font-sans text-[9px] text-[#1A1A1A]/40 mt-2 block italic">
            Oral Board Consensus
          </span>
        </div>

        {/* Narrative Analysis */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="font-sans text-[9px] border border-[#1A1A1A]/20 text-[#1A1A1A] px-2 py-0.5 tracking-wider uppercase font-bold">
              Topic: {topic}
            </span>
            <span className="font-sans text-[9px] border border-[#1A1A1A]/20 text-[#1A1A1A] px-2 py-0.5 tracking-wider uppercase font-bold">
              Defense: {level} Level
            </span>
          </div>
          <h2 className="font-serif text-xl text-[#1A1A1A] font-medium tracking-tight">
            Thesis Summary & Verdict
          </h2>
          <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
            {gradeStyles.desc}
          </p>
        </div>
      </motion.div>

      {/* SUB-CONCEPT SCORECARDS (BARS) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-[#1A1A1A]/10 p-6 shadow-xs"
      >
        <div className="flex items-center space-x-2 mb-4 border-b border-[#1A1A1A]/10 pb-2">
          <BarChart3 className="w-4 h-4 text-[#1A1A1A]/60" />
          <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Tested Competencies & Scoring</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.conceptScores.map((item, index) => {
            // Editorial minimal bar coloring
            const barColor = item.score >= 85 ? "bg-[#1A1A1A]" : item.score >= 70 ? "bg-[#1A1A1A]/70" : "bg-[#8C1D1D]";
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-serif font-bold text-[#1A1A1A]">{item.concept}</span>
                  <span className="font-sans font-bold text-[#1A1A1A]/80">{item.score} / 100</span>
                </div>
                <div className="h-1 w-full bg-[#1A1A1A]/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className={`h-full ${barColor}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* STRENGTHS AND GAPS (SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conceptual Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white border border-[#1A1A1A]/10 p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center space-x-2 border-b border-[#1A1A1A]/10 pb-2 text-[#1A1A1A]">
            <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 opacity-70" />
            <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Conceptual Strengths</h3>
          </div>
          <ul className="space-y-3">
            {report.conceptualStrengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2.5">
                <span className="font-sans text-[10px] text-[#1A1A1A] bg-[#1A1A1A]/5 px-1.5 py-0.5 font-bold mt-0.5 border border-[#1A1A1A]/10">
                  +
                </span>
                <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">{strength}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Knowledge Gaps */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white border border-[#1A1A1A]/10 p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center space-x-2 border-b border-[#1A1A1A]/10 pb-2 text-red-800">
            <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 opacity-70" />
            <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Knowledge Gaps</h3>
          </div>
          <ul className="space-y-3">
            {report.knowledgeGaps.map((gap, index) => (
              <li key={index} className="flex items-start space-x-2.5">
                <span className="font-sans text-[10px] text-red-800 bg-red-50 px-1.5 py-0.5 font-bold mt-0.5 border border-red-200">
                  -
                </span>
                <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">{gap}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* DETAILED EVALUATION LETTER FROM THE PROFESSOR */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="absolute right-4 bottom-4 opacity-[0.02] pointer-events-none">
          <BookOpen className="w-48 h-48 text-[#1A1A1A]" />
        </div>

        <div className="flex items-center space-x-2 mb-4 text-[#1A1A1A]/60">
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Formal Academic Critique</span>
        </div>

        <h3 className="font-serif text-sm font-bold text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2 mb-4">
          From the Desk of Professor Thorne
        </h3>

        <div className="font-serif text-sm text-[#1A1A1A] italic space-y-4 leading-relaxed pr-6 pl-4 border-l-2 border-[#1A1A1A]/30">
          <p className="whitespace-pre-wrap">"{report.professorEvaluation}"</p>
        </div>
      </motion.div>

      {/* TRAP ASSESSMENT DECREE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 p-6 shadow-xs"
      >
        <div className="flex items-center space-x-2 mb-3 text-[#1A1A1A]">
          <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 opacity-80" />
          <h3 className="font-serif text-sm font-bold text-[#1A1A1A] tracking-tight">The Misconception Trap Assessment</h3>
        </div>
        <p className="font-sans text-xs text-[#1A1A1A]/80 leading-relaxed">
          {report.trapResponse}
        </p>
      </motion.div>

      {/* NEW EXAM RESET BUTTON */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center pt-4"
      >
        <button
          id="new-exam-btn"
          onClick={onReset}
          className="flex items-center space-x-2 bg-[#1A1A1A] text-white hover:bg-transparent hover:text-[#1A1A1A] px-8 py-4 border border-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Prepare New Thesis Defense</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
