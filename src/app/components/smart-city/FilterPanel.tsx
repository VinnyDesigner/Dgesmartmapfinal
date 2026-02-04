import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Navigation, X } from 'lucide-react';
import { IntentType } from './types';
import { useTheme } from './ThemeContext';

interface FilterPanelProps {
  selectedIntent: IntentType;
  onApplyFilters: (filters: FilterSettings) => void;
  onClose: () => void;
}

export interface FilterSettings {
  facilityTypes: string[];
  distance: number; // in km
}

// Facility type options based on intent
const FACILITY_OPTIONS: Record<string, string[]> = {
  healthcare: ['Clinic', 'Diagnostic Center', 'Center', 'Hospital', 'Pharmacy'],
  education: ['Primary School', 'High School', 'University', 'Training Center', 'Library'],
};

const DISTANCE_OPTIONS = [
  { label: 'Within 2 km', value: 2 },
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 20 km', value: 20 },
  { label: 'Any distance', value: 100 },
];

export const FilterPanel = ({ selectedIntent, onApplyFilters, onClose }: FilterPanelProps) => {
  const { colors } = useTheme();
  const facilityOptions = selectedIntent ? FACILITY_OPTIONS[selectedIntent] || [] : [];
  
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number>(10);

  const handleToggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      facilityTypes: selectedFacilities,
      distance: selectedDistance,
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedFacilities([]);
    setSelectedDistance(10);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-2xl shadow-2xl overflow-hidden w-[380px] pointer-events-auto"
      style={{
        backgroundColor: colors.bgCard,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors.borderPrimary,
        boxShadow: colors.shadowLg,
      }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: `linear-gradient(to right, ${colors.accentPrimary}, ${colors.accentLight})`,
        }}
      >
        <h3 className="text-white font-semibold text-lg">Filters</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {/* Facility Type Section */}
        {facilityOptions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${colors.accentPrimary}10` }}
              >
                <Building2 size={16} strokeWidth={1.5} style={{ color: colors.accentPrimary }} />
              </div>
              <h4 className="font-semibold" style={{ color: colors.textPrimary }}>Facility Type</h4>
              {selectedFacilities.length > 0 && (
                <span 
                  className="ml-auto text-sm rounded-full w-6 h-6 flex items-center justify-center font-semibold"
                  style={{ 
                    backgroundColor: colors.accentPrimary,
                    color: colors.textInverse 
                  }}
                >
                  {selectedFacilities.length}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              {facilityOptions.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgCardHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedFacilities.includes(facility)}
                      onChange={() => handleToggleFacility(facility)}
                      className="peer sr-only"
                    />
                    <div 
                      className="w-5 h-5 border-2 rounded transition-all flex items-center justify-center"
                      style={{
                        borderColor: selectedFacilities.includes(facility) ? colors.accentPrimary : colors.borderSecondary,
                        backgroundColor: selectedFacilities.includes(facility) ? colors.accentPrimary : 'transparent',
                      }}
                    >
                      {selectedFacilities.includes(facility) && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path
                            d="M1 5L4.5 8.5L11 1.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="transition-colors" style={{ color: colors.textSecondary }}>
                    {facility}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Distance Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${colors.accentPrimary}10` }}
            >
              <Navigation size={16} strokeWidth={1.5} style={{ color: colors.accentPrimary }} />
            </div>
            <h4 className="font-semibold" style={{ color: colors.textPrimary }}>Distance</h4>
          </div>
          
          <div className="space-y-2">
            {DISTANCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group"
                style={{
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgCardHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="distance"
                    checked={selectedDistance === option.value}
                    onChange={() => setSelectedDistance(option.value)}
                    className="peer sr-only"
                  />
                  <div 
                    className="w-5 h-5 border-2 rounded-full transition-all flex items-center justify-center"
                    style={{
                      borderColor: selectedDistance === option.value ? colors.accentPrimary : colors.borderSecondary,
                    }}
                  >
                    {selectedDistance === option.value && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: colors.accentPrimary }}
                      />
                    )}
                  </div>
                </div>
                <span className="transition-colors" style={{ color: colors.textSecondary }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div 
        className="px-6 py-4 flex gap-3"
        style={{
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: colors.borderPrimary,
          backgroundColor: colors.bgSecondary,
        }}
      >
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            color: colors.textSecondary,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.borderSecondary,
            backgroundColor: colors.bgCard,
          }}
        >
          Clear All
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
          style={{
            backgroundColor: colors.accentPrimary,
            color: colors.textInverse,
          }}
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
};
