import { User, MapPin } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import darkLogo from "figma:asset/18062b75f340b7f6e86c9e6954ee2c84c9df4dd8.png";
import lightLogo from "figma:asset/464972123d1bf51b7378051d8a1102ed37d567ee.png";

interface TopNavigationBarProps {
  locationName?: string;
  onChangeLocation?: () => void;
}

export const TopNavigationBar = ({ locationName, onChangeLocation }: TopNavigationBarProps) => {
  const { theme, colors } = useTheme();

  return (
    <header 
      className="relative w-full transition-colors duration-300 flex-shrink-0 z-50"
      style={{
        height: '64px',
        background: theme === 'dark' 
          ? colors.bgPrimary 
          : 'linear-gradient(to right, #7AA4C4, #FFFFFF)',
        borderBottom: `1px solid ${theme === 'dark' ? colors.borderPrimary : 'rgba(255, 255, 255, 0.3)'}`,
      }}
    >
      <div className="h-full mx-auto max-w-[1200px] px-6 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img 
            src={theme === 'dark' ? darkLogo : lightLogo} 
            alt="Abu Dhabi Government" 
            className="h-9 w-auto"
          />
        </div>

        {/* Center: Location Context (Optional) */}
        {locationName && (
          <button
            onClick={onChangeLocation}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: theme === 'dark' ? `${colors.accentLight}15` : 'rgba(255, 255, 255, 0.8)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: theme === 'dark' ? `${colors.accentLight}30` : 'rgba(33, 90, 158, 0.2)',
              color: theme === 'dark' ? colors.textPrimary : '#215A9E',
            }}
            title="Click to change location"
          >
            <MapPin size={16} strokeWidth={1.5} />
            <span className="text-sm font-medium">
              {locationName}
            </span>
          </button>
        )}

        {/* Right: Utility Icons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};