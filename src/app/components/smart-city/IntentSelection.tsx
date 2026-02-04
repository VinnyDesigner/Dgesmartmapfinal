import { motion } from "motion/react";
import { IntentType } from "./types";
import { Hospital, GraduationCap, ChevronRight } from "lucide-react";
import { useTheme } from "./ThemeContext";

interface IntentSelectionProps {
  onSelect: (intent: IntentType) => void;
}

const INTENTS: { id: IntentType; label: string; desc: string; icon: any; bgColor: string; iconColor: string }[] = [
  { 
    id: "healthcare", 
    label: "Healthcare & Wellness", 
    desc: "Hospitals, Clinics, Specialists", 
    icon: Hospital, 
    bgColor: "bg-[#215A9E]",
    iconColor: "text-white"
  },
  { 
    id: "education", 
    label: "Education", 
    desc: "Universities, Schools, Libraries", 
    icon: GraduationCap, 
    bgColor: "bg-[#7AA4C4]",
    iconColor: "text-white"
  }
];

export const IntentSelection = ({ onSelect }: IntentSelectionProps) => {
  const { colors } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col gap-10 w-full max-w-4xl px-4 pointer-events-auto"
    >
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-2xl" style={{ color: colors.textPrimary }}>
          What do you need today?
        </h1>
        <p className="text-lg" style={{ color: colors.accentLight }}>I'll help you find the best place.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {INTENTS.map((intent, idx) => {
          const Icon = intent.icon;
          return (
            <motion.button
              key={intent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(intent.id)}
              className="group relative flex flex-col justify-between p-8 h-48 rounded-2xl backdrop-blur-xl transition-all duration-300 text-left overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer"
              style={{
                backgroundColor: colors.bgCard,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors.borderPrimary,
              }}
            >
              {/* Hover Glow - DGE Light Blue */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                style={{
                  background: `linear-gradient(to bottom right, ${colors.accentLight}10, ${colors.accentPrimary}10)`
                }}
              />
              
              <div className="flex justify-between items-start z-10 w-full">
                <div className={`p-4 rounded-xl ${intent.bgColor} border border-white/20 group-hover:scale-110 transition-transform duration-300 ${intent.iconColor}`}>
                  <Icon size={32} strokeWidth={1.5} />
                </div>
                <ChevronRight 
                  className="group-hover:translate-x-1 transition-all" 
                  size={24} 
                  strokeWidth={1.5}
                  style={{ color: colors.textMuted }}
                />
              </div>
              
              <div className="z-10 mt-auto">
                <h3 
                  className="text-2xl font-semibold transition-colors"
                  style={{ color: colors.textPrimary }}
                >
                  {intent.label}
                </h3>
                <p className="text-base mt-1" style={{ color: colors.textSecondary }}>
                  {intent.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};