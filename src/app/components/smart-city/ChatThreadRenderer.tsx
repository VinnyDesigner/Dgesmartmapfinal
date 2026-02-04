import { motion } from "motion/react";
import { User, Sparkles, Check, Award } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { FacilityIcon } from "./FacilityIcon";
import { IntentType } from "./types";
import clsx from "clsx";

type ChatMessage = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  results?: any[];
  isProcessing?: boolean;
};

interface ChatThreadRendererProps {
  chatMessages: ChatMessage[];
  intent: IntentType;
  activeCardId: number | null;
  onFocusMap: (id: number) => void;
  onSetActiveCardId: (id: number | null) => void;
  onSetSelectedFacility: (facility: any) => void;
}

export const ChatThreadRenderer = ({
  chatMessages,
  intent,
  activeCardId,
  onFocusMap,
  onSetActiveCardId,
  onSetSelectedFacility,
}: ChatThreadRendererProps) => {
  const { colors } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      {chatMessages.map((message) => (
        <div key={message.id}>
          {message.type === 'user' ? (
            // User Query Message - Right Aligned
            <div className="flex items-start gap-2 mb-4 justify-end">
              <div className="flex-1 max-w-[80%] text-right">
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>You asked</p>
                <div 
                  className="inline-block px-4 py-2.5 rounded-xl"
                  style={{ 
                    backgroundColor: `${colors.accentPrimary}15`,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: `${colors.accentLight}30`,
                  }}
                >
                  <p className="text-sm font-semibold text-left" style={{ color: colors.textPrimary }}>{message.content}</p>
                </div>
              </div>
              <div className="p-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: `${colors.accentLight}20` }}>
                <User size={12} strokeWidth={1.5} style={{ color: colors.accentLight }} />
              </div>
            </div>
          ) : message.isProcessing ? (
            // Processing Indicator
            <div className="flex items-start gap-2 mb-4">
              <Sparkles className="shrink-0 mt-0.5 animate-pulse" size={14} strokeWidth={1.5} style={{ color: colors.accentLight, fill: colors.accentLight }} />
              <p className="text-xs" style={{ color: colors.textSecondary }}>Finding the best options for you...</p>
            </div>
          ) : message.results && message.results.length > 0 ? (
            // AI Response with Results Cards
            <div className="space-y-3">
              {message.results.map((item: any, idx: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.01,
                    x: 2,
                    transition: { duration: 0.2 }
                  }}
                  onHoverStart={() => {
                    onSetActiveCardId(item.id);
                    onFocusMap(item.id);
                  }}
                  onHoverEnd={() => {
                    onSetActiveCardId(null);
                  }}
                  onClick={() => {
                    onSetActiveCardId(activeCardId === item.id ? null : item.id);
                  }}
                  className="relative w-full rounded-xl p-4 cursor-pointer transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    backgroundColor: activeCardId === item.id ? colors.bgCardHover : colors.bgSecondary,
                    borderColor: activeCardId === item.id 
                      ? colors.borderAccent
                      : item.bestMatch 
                      ? `${colors.borderAccent}60`
                      : colors.borderSecondary,
                    boxShadow: activeCardId === item.id ? `0 4px 16px ${colors.accentLight}30` : 'none',
                  }}
                >
                  {/* Best Match Badge */}
                  {item.bestMatch && (
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#215A9E] text-white text-[10px] font-bold uppercase tracking-wider">
                      Best Match
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                        intent === 'healthcare' 
                          ? "bg-[#215A9E]/15 border border-[#545860]/20" 
                          : "bg-[#7AA4C4]/15 border border-[#545860]/20"
                      )}>
                        <FacilityIcon facilityType={item.facilityType} intent={intent} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-1 leading-tight" style={{ color: colors.textPrimary }}>{item.name}</h3>
                        <div className="flex items-center gap-2 text-[11px]" style={{ color: colors.textMuted }}>
                          <span className="font-mono">{item.distance}</span>
                          <span>•</span>
                          <span>{item.availability}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xs font-bold" style={{ color: colors.accentLight }}>{item.rating}</div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="flex items-start gap-2 mb-4 text-[11px]" style={{ color: colors.textSecondary }}>
                    <Check style={{ color: colors.accentLight }} className="shrink-0 mt-0.5" size={12} strokeWidth={1.5} />
                    <p className="line-clamp-2 leading-relaxed">{item.reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetSelectedFacility(item);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#215A9E] hover:bg-[#215A9E]/80 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Award size={12} strokeWidth={1.5} />
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};