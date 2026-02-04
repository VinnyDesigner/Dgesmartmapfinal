import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.borderSecondary,
        boxShadow: colors.shadowMd,
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'light' ? 1 : 0,
            rotate: theme === 'light' ? 0 : 180,
            opacity: theme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sun size={20} strokeWidth={1.5} style={{ color: colors.accentPrimary }} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : -180,
            opacity: theme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Moon size={20} strokeWidth={1.5} style={{ color: colors.accentLight }} />
        </motion.div>
      </div>
    </motion.button>
  );
};
