import { useState } from 'react';
import { Map, Layers } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

export type BasemapType = 'color' | 'light-grey' | 'dark-grey' | 'imagery';

interface BasemapOption {
  id: BasemapType;
  name: string;
  description: string;
  icon: string;
}

const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    id: 'color',
    name: 'Color Map',
    description: 'Standard colorful map',
    icon: '🗺️',
  },
  {
    id: 'light-grey',
    name: 'Light Grey',
    description: 'Minimal light theme',
    icon: '⚪',
  },
  {
    id: 'dark-grey',
    name: 'Dark Grey',
    description: 'Minimal dark theme',
    icon: '⚫',
  },
  {
    id: 'imagery',
    name: 'Satellite',
    description: 'Satellite imagery',
    icon: '🛰️',
  },
];

interface BasemapSwitcherProps {
  selectedBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
}

export const BasemapSwitcher = ({ selectedBasemap, onBasemapChange }: BasemapSwitcherProps) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
        style={{
          backgroundColor: isOpen ? colors.accentPrimary : colors.bgCard,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isOpen ? colors.accentPrimary : colors.borderPrimary,
          color: isOpen ? '#FFFFFF' : colors.textMuted,
        }}
        title="Change Basemap"
      >
        <Layers size={20} strokeWidth={1.5} />
      </button>

      {/* Basemap Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-3 right-0 w-64 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: colors.bgCard,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors.borderPrimary,
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3"
              style={{
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: colors.borderPrimary,
              }}
            >
              <div className="flex items-center gap-2">
                <Map size={16} style={{ color: colors.accentLight }} strokeWidth={1.5} />
                <h3 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Basemap
                </h3>
              </div>
            </div>

            {/* Options List */}
            <div className="p-2">
              {BASEMAP_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onBasemapChange(option.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    backgroundColor: selectedBasemap === option.id 
                      ? `${colors.accentLight}15` 
                      : 'transparent',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: selectedBasemap === option.id 
                      ? `${colors.accentLight}40` 
                      : 'transparent',
                  }}
                >
                  <span className="text-xl flex-shrink-0">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ 
                          color: selectedBasemap === option.id 
                            ? colors.accentLight 
                            : colors.textPrimary 
                        }}
                      >
                        {option.name}
                      </p>
                      {selectedBasemap === option.id && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors.accentLight }}
                        />
                      )}
                    </div>
                    <p 
                      className="text-xs truncate"
                      style={{ color: colors.textMuted }}
                    >
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div 
              className="px-4 py-2"
              style={{
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: colors.borderPrimary,
              }}
            >
              <p className="text-xs text-center" style={{ color: colors.textMuted }}>
                Powered by Abu Dhabi DGE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
