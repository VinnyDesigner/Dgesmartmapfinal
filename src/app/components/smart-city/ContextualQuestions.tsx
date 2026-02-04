import { motion } from "motion/react";
import { useState } from "react";
import { IntentType } from "./types";
import { ArrowRight, Clock, MapPin, Building } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "./ThemeContext";

interface ContextualQuestionsProps {
  intent: IntentType;
  onSubmit: (prefs: Record<string, string>) => void;
}

const QUESTIONS = [
  {
    id: "distance",
    label: "Preferred distance?",
    icon: MapPin,
    options: ["Nearby (<2km)", "City (<10km)", "Anywhere"]
  },
  {
    id: "type",
    label: "Facility Preference?",
    icon: Building,
    options: ["Public", "Private", "No Preference"]
  }
];

export const ContextualQuestions = ({ intent, onSubmit }: ContextualQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const isComplete = QUESTIONS.every(q => answers[q.id]);

  const { colors } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-lg mx-auto pointer-events-auto"
    >
      <div 
        className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: colors.bgOverlay,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.borderPrimary,
        }}
      >
        {/* Decorative gradient - DGE brand colors */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom right, ${colors.accentLight}20, ${colors.accentPrimary}20)`,
          }}
        />
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
            Let me find the best options for you
          </h2>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Help me narrow down the search based on your needs.
          </p>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-3"
              >
                <div 
                  className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold"
                  style={{ color: colors.accentLight }}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span>{q.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className="px-4 py-2 rounded-full text-sm transition-all duration-200 font-semibold"
                      style={{
                        backgroundColor: answers[q.id] === opt ? colors.accentPrimary : colors.bgCard,
                        color: answers[q.id] === opt ? colors.textInverse : colors.textSecondary,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: answers[q.id] === opt ? colors.accentPrimary : colors.borderSecondary,
                        boxShadow: answers[q.id] === opt ? colors.shadowMd : 'none',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={() => isComplete && onSubmit(answers)}
            disabled={!isComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            style={{
              backgroundColor: isComplete ? colors.accentPrimary : `${colors.textMuted}50`,
              color: isComplete ? colors.textInverse : colors.textMuted,
              boxShadow: isComplete ? colors.shadowMd : 'none',
              cursor: isComplete ? 'pointer' : 'not-allowed',
            }}
          >
            <span>Find Best Matches</span>
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};