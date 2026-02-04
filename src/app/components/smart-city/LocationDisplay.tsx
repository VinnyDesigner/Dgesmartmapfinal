import { MapPin, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';

interface LocationDisplayProps {
  locationName: string;
  onClick: () => void;
}

export const LocationDisplay = ({ locationName, onClick }: LocationDisplayProps) => {
  const { colors } = useTheme();
  
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="px-3 md:px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg group pointer-events-auto flex items-center gap-2"
      style={{
        backgroundColor: colors.bgCard,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors.borderAccent,
      }}
      title={`Location: ${locationName}. Click to change location`}
    >
      {/* Icon with accent color background */}
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${colors.accentLight}20`,
        }}
      >
        <MapPin size={14} style={{ color: colors.accentLight }} strokeWidth={2} />
      </div>
      
      {/* Text - Hidden on mobile, shown on desktop */}
      <span className="hidden md:flex text-sm items-center gap-2" style={{ color: colors.textPrimary }}>
        <span className="font-medium">{locationName}</span>
        <Edit2 
          size={12} 
          className="transition-colors opacity-60 group-hover:opacity-100" 
          style={{ color: colors.textMuted }}
        />
      </span>
    </motion.button>
  );
};