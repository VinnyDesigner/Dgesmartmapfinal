import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, Clock } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { IntentType } from './types';

export interface Suggestion {
  id: string;
  text: string;
  type: 'intent' | 'refinement' | 'location';
  category?: IntentType;
  icon?: 'search' | 'filter' | 'location' | 'clock';
}

interface SearchSuggestionsProps {
  query: string;
  selectedIntent: IntentType | null;
  suggestions: Suggestion[];
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
}

export const SearchSuggestions = ({
  query,
  suggestions,
  selectedIndex,
  onSelect,
  onHover,
}: SearchSuggestionsProps) => {
  const { colors } = useTheme();

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'filter':
        return <Filter size={14} />;
      case 'location':
        return <MapPin size={14} />;
      case 'clock':
        return <Clock size={14} />;
      case 'search':
      default:
        return <Search size={14} />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} style={{ 
              color: colors.accentLight,
              fontWeight: 600 
            }}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'intent':
        return 'Search';
      case 'refinement':
        return 'Filter';
      case 'location':
        return 'Location';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{
            backgroundColor: colors.bgOverlay,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.borderPrimary,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div 
            className="px-3 py-2 text-xs font-medium"
            style={{
              color: colors.textMuted,
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: colors.borderPrimary,
              backgroundColor: `${colors.accentLight}08`,
            }}
          >
            Suggestions
          </div>

          {/* Suggestions List */}
          <div className="max-h-[240px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => onSelect(suggestion)}
                onMouseEnter={() => onHover(index)}
                className="w-full px-3 py-2.5 flex items-center gap-3 transition-all text-left"
                style={{
                  backgroundColor: selectedIndex === index 
                    ? `${colors.accentLight}15` 
                    : 'transparent',
                  borderLeftWidth: '2px',
                  borderLeftStyle: 'solid',
                  borderLeftColor: selectedIndex === index 
                    ? colors.accentLight 
                    : 'transparent',
                }}
              >
                {/* Icon */}
                <div 
                  className="flex-shrink-0 transition-colors"
                  style={{ 
                    color: selectedIndex === index 
                      ? colors.accentLight 
                      : colors.textMuted 
                  }}
                >
                  {getIcon(suggestion.icon)}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-sm font-medium truncate"
                    style={{ 
                      color: selectedIndex === index 
                        ? colors.textPrimary 
                        : colors.textSecondary 
                    }}
                  >
                    {highlightMatch(suggestion.text, query)}
                  </div>
                </div>

                {/* Type Badge */}
                <div 
                  className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: selectedIndex === index 
                      ? `${colors.accentLight}20` 
                      : `${colors.textMuted}10`,
                    color: selectedIndex === index 
                      ? colors.accentLight 
                      : colors.textMuted,
                  }}
                >
                  {getTypeLabel(suggestion.type)}
                </div>
              </button>
            ))}
          </div>

          {/* Footer Hint */}
          <div 
            className="px-3 py-2 text-xs flex items-center gap-2"
            style={{
              color: colors.textMuted,
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: colors.borderPrimary,
              backgroundColor: `${colors.bgTertiary}50`,
            }}
          >
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{
                backgroundColor: `${colors.textMuted}15`,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: `${colors.textMuted}20`,
              }}>↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{
                backgroundColor: `${colors.textMuted}15`,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: `${colors.textMuted}20`,
              }}>↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="mx-1">•</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{
                backgroundColor: `${colors.textMuted}15`,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: `${colors.textMuted}20`,
              }}>Enter</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};