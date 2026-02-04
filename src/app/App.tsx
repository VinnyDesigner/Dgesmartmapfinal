import { SmartCityInterface } from "@/app/components/smart-city/SmartCityInterface";
import { ThemeProvider, useTheme } from "@/app/components/smart-city/ThemeContext";

function AppContent() {
  const { colors } = useTheme();
  
  return (
    <div 
      className="w-full h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}
    >
      <SmartCityInterface />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
