import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeContext';

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'area' | 'landmark' | 'address';
  lat: number;
  lon: number;
  displayName: string;
}

interface ManualLocationInputProps {
  onLocationSelect: (location: { lat: number; lon: number; name: string }) => void;
  onCancel: () => void;
}

// Abu Dhabi locations with real coordinates
const ABU_DHABI_LOCATIONS: LocationSuggestion[] = [
  { id: '1', name: 'Khalifa City', type: 'area', lat: 24.4172, lon: 54.5977, displayName: 'Khalifa City' },
  { id: '2', name: 'Corniche', type: 'landmark', lat: 24.4764, lon: 54.3257, displayName: 'Corniche Beach' },
  { id: '3', name: 'Al Reem Island', type: 'area', lat: 24.4967, lon: 54.4128, displayName: 'Al Reem Island' },
  { id: '4', name: 'Yas Island', type: 'landmark', lat: 24.4883, lon: 54.6056, displayName: 'Yas Island' },
  { id: '5', name: 'Saadiyat Island', type: 'landmark', lat: 24.5380, lon: 54.4349, displayName: 'Saadiyat Island' },
  { id: '6', name: 'Al Mushrif', type: 'area', lat: 24.4300, lon: 54.4200, displayName: 'Al Mushrif' },
  { id: '7', name: 'Al Zahiyah', type: 'area', lat: 24.4926, lon: 54.3774, displayName: 'Al Zahiyah (Downtown)' },
  { id: '8', name: 'Masdar City', type: 'landmark', lat: 24.4287, lon: 54.6170, displayName: 'Masdar City' },
  { id: '9', name: 'Al Bateen', type: 'area', lat: 24.4556, lon: 54.3386, displayName: 'Al Bateen' },
  { id: '10', name: 'Shams Abu Dhabi', type: 'landmark', lat: 24.4985, lon: 54.4143, displayName: 'Shams Abu Dhabi' },
  { id: '11', name: 'Marina Mall', type: 'landmark', lat: 24.4758, lon: 54.3198, displayName: 'Marina Mall' },
  { id: '12', name: 'Abu Dhabi Mall', type: 'landmark', lat: 24.4974, lon: 54.3832, displayName: 'Abu Dhabi Mall' },
  { id: '13', name: 'Zayed Sports City', type: 'landmark', lat: 24.4407, lon: 54.4312, displayName: 'Zayed Sports City' },
  { id: '14', name: 'Al Maryah Island', type: 'area', lat: 24.5032, lon: 54.3911, displayName: 'Al Maryah Island' },
  { id: '15', name: 'Electra Street', type: 'address', lat: 24.4888, lon: 54.3671, displayName: 'Electra Street' },
];

export const ManualLocationInput = ({ onLocationSelect, onCancel }: ManualLocationInputProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions(ABU_DHABI_LOCATIONS.slice(0, 6)); // Show top suggestions when empty
      setShowSuggestions(true);
    } else {
      const filtered = ABU_DHABI_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const handleSelectLocation = (location: LocationSuggestion) => {
    onLocationSelect({
      lat: location.lat,
      lon: location.lon,
      name: location.displayName,
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landmark':
        return '🏛️';
      case 'area':
        return '🏙️';
      case 'address':
        return '📍';
      default:
        return '📍';
    }
  };

  const { colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg pointer-events-auto"
    >
      <div 
        className="backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.bgOverlay,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.borderPrimary,
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4"
          style={{
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: colors.borderPrimary,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium" style={{ color: colors.textPrimary }}>
              Enter Your Location
            </h3>
            <button
              onClick={onCancel}
              className="transition-colors"
              style={{ color: colors.textMuted }}
              aria-label="Cancel"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Search for an area, landmark, or address in Abu Dhabi
          </p>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }}>
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter area, landmark, or address"
              className="w-full pl-11 pr-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.bgInput,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colors.borderSecondary,
                color: colors.textPrimary,
              }}
            />
          </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: colors.borderPrimary,
              }}
            >
              <div className="max-h-[320px] overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectLocation(suggestion)}
                    className="w-full px-6 py-3 flex items-center gap-3 transition-colors text-left"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: colors.borderPrimary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.bgCardHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span className="text-xl">{getTypeIcon(suggestion.type)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {suggestion.displayName}
                      </div>
                      <div className="text-xs capitalize" style={{ color: colors.textSecondary }}>
                        {suggestion.type}
                      </div>
                    </div>
                    <MapPin size={16} style={{ color: colors.textMuted }} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {showSuggestions && searchQuery.trim() !== '' && suggestions.length === 0 && (
          <div 
            className="px-6 py-8 text-center"
            style={{
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: colors.borderPrimary,
            }}
          >
            <div className="text-sm mb-2" style={{ color: colors.textSecondary }}>
              No locations found
            </div>
            <div className="text-xs" style={{ color: colors.textMuted }}>
              Try searching for a different area or landmark
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};