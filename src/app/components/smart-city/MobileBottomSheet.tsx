import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, Award } from "lucide-react";
import clsx from "clsx";
import { IntentType } from "./types";
import { useTheme } from "./ThemeContext";
import { FacilityDetailsView } from "./FacilityDetailsView";
import { FacilityIcon } from "./FacilityIcon";

interface MobileBottomSheetProps {
  isExpanded: boolean;
  onToggle: () => void;
  intent: IntentType;
  displayResults: any[];
  previousResults: any[];
  previousBestMatch: any | null;
  isUpdating: boolean;
  updateType: 'refinement' | 'expansion' | 'shift' | null;
  selectedFacility: any | null;
  activeCardId: number | null;
  onFocusMap: (id: number) => void;
  onSetSelectedFacility: (facility: any | null) => void;
  onSetActiveCardId: (id: number | null) => void;
  onCategorySwitch: (newCategory: IntentType) => void;
  showNudge: boolean;
  onDismissNudge: () => void;
  aiResponse: string | null;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export const MobileBottomSheet = ({
  isExpanded,
  onToggle,
  intent,
  displayResults,
  previousResults,
  previousBestMatch,
  isUpdating,
  updateType,
  selectedFacility,
  activeCardId,
  onFocusMap,
  onSetSelectedFacility,
  onSetActiveCardId,
  onCategorySwitch,
  showNudge,
  onDismissNudge,
  aiResponse,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: MobileBottomSheetProps) => {
  const { colors } = useTheme();

  return (
    <motion.div
      initial={false}
      animate={{
        height: isExpanded ? "65vh" : "70px",
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto"
      style={{
        backgroundColor: colors.bgPrimary,
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
        boxShadow: `0 -4px 20px ${colors.shadowLg}`,
        marginBottom: "68px", // Space for search bar
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Handle Bar */}
      <div 
        className="flex justify-center py-3 cursor-pointer"
        onClick={onToggle}
      >
        <div
          className="w-12 h-1.5 rounded-full"
          style={{ backgroundColor: colors.borderSecondary }}
        />
      </div>

      {/* Collapsed State - Minimal Info */}
      {!isExpanded && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={18} strokeWidth={1.5} style={{ color: colors.accentLight }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  {displayResults.length} Options Available
                </p>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Tap to view recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded State - Full Content */}
      {isExpanded && (
        <div className="flex flex-col h-[calc(65vh-60px)] px-6">
          {/* Header */}
          <div className="pb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: colors.textPrimary }}>
              <Sparkles size={14} strokeWidth={1.5} style={{ color: colors.accentLight }} />
              Recommended for You
            </h2>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              I found these nearby based on your preferences.
            </p>
          </div>

          {/* Show Details View OR Cards List */}
          {selectedFacility ? (
            <FacilityDetailsView
              facility={selectedFacility}
              onClose={() => onSetSelectedFacility(null)}
            />
          ) : (
            <>
              {/* Category Switcher */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => onCategorySwitch('healthcare')}
                  disabled={isUpdating}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                  style={
                    intent === 'healthcare'
                      ? {
                          backgroundColor: `${colors.accentPrimary}20`,
                          color: colors.accentLight,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: `${colors.accentLight}80`,
                        }
                      : {
                          backgroundColor: colors.bgTertiary,
                          color: colors.textMuted,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: colors.borderPrimary,
                        }
                  }
                >
                  Health & Wellness
                </button>
                <button
                  onClick={() => onCategorySwitch('education')}
                  disabled={isUpdating}
                  className={clsx(
                    "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                    isUpdating && "opacity-50 cursor-not-allowed"
                  )}
                  style={
                    intent === 'education'
                      ? {
                          backgroundColor: `${colors.accentPrimary}20`,
                          color: colors.accentLight,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: `${colors.accentLight}80`,
                        }
                      : {
                          backgroundColor: colors.bgTertiary,
                          color: colors.textMuted,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: colors.borderPrimary,
                        }
                  }
                >
                  Education
                </button>
              </div>

              {/* Scrollable Results */}
              <div className="flex-1 overflow-y-auto -mx-2 px-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `${colors.borderSecondary} transparent`,
              }}>
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {displayResults.map((item, idx) => {
                      const wasInPrevious = previousResults.some(r => r.id === item.id);
                      const isNew = !wasInPrevious;
                      
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={
                            updateType === 'shift' 
                              ? { opacity: 0, scale: 0.95, y: 20 }
                              : updateType === 'expansion'
                              ? { opacity: 0, y: 20, scale: 0.95 }
                              : { opacity: 0, scale: 0.95, y: 10 }
                          }
                          animate={{ 
                            opacity: isUpdating ? 0.5 : 1, 
                            scale: 1, 
                            y: 0
                          }}
                          exit={
                            updateType === 'shift'
                              ? { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.35 } }
                              : updateType === 'refinement'
                              ? { opacity: 0, scale: 0.9, height: 0, marginBottom: -12, transition: { duration: 0.35 } }
                              : { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.35 } }
                          }
                          transition={{ 
                            delay: isUpdating ? 0 : (updateType === 'expansion' && isNew ? 0.15 + idx * 0.08 : idx * 0.08),
                            duration: 0.4,
                            ease: [0.4, 0.0, 0.2, 1],
                            layout: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
                          }}
                          onClick={() => {
                            onSetActiveCardId(activeCardId === item.id ? null : item.id);
                            onFocusMap(item.id);
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
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.3 }}
                              className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[#215A9E] text-white text-[10px] font-bold uppercase tracking-wider"
                            >
                              {previousBestMatch && item.id === previousBestMatch.id ? "Still Best Match" : "Best Match"}
                            </motion.div>
                          )}

                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              {/* Category Icon */}
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
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Nudge */}
              <AnimatePresence>
                {showNudge && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3"
                  >
                    <div 
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: `${colors.accentLight}10`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: `${colors.accentLight}30`,
                      }}
                    >
                      <p className="text-xs mb-2" style={{ color: colors.textPrimary }}>
                        Want more details or need help choosing?
                      </p>
                      <div className="flex gap-2">
                        <button 
                          className="text-[11px] px-3 py-1.5 rounded-md transition-colors font-semibold"
                          style={{
                            backgroundColor: colors.accentPrimary,
                            color: '#FFFFFF',
                          }}
                        >
                          Show More
                        </button>
                        <button 
                          onClick={onDismissNudge}
                          className="text-[11px] px-2 transition-colors"
                          style={{ color: colors.textMuted }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="pt-2"
                  >
                    <div className="flex items-start gap-2 bg-[#7AA4C4]/10 border border-[#7AA4C4]/30 rounded-lg px-3 py-2">
                      <Sparkles className="text-[#7AA4C4] fill-[#7AA4C4] shrink-0 mt-0.5" size={14} strokeWidth={1.5} />
                      <p className="text-xs text-white leading-relaxed">{aiResponse}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};