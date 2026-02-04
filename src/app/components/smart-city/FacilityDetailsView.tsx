import { motion } from "motion/react";
import { ArrowLeft, MapPin, Phone, Clock, Star, Award, Bookmark } from "lucide-react";
import { useTheme } from "./ThemeContext";

interface FacilityDetailsViewProps {
  facility: any;
  onClose: () => void;
}

export const FacilityDetailsView = ({ facility, onClose }: FacilityDetailsViewProps) => {
  const { colors } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      className="p-4 pt-2"
    >
      {/* Back Button */}
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-sm transition-colors mb-4"
        style={{ color: colors.textMuted }}
        onMouseEnter={(e) => e.currentTarget.style.color = colors.accentLight}
        onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
      >
        <ArrowLeft size={16} />
        Back to Recommendations
      </button>

      {/* AI Context */}
      <div 
        className="rounded-lg px-3 py-2.5 mb-4"
        style={{
          backgroundColor: `${colors.accentLight}15`,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: `${colors.accentLight}30`,
        }}
      >
        <div className="flex items-start gap-2">
          <Star className="shrink-0 mt-0.5" size={14} style={{ color: colors.accentLight, fill: colors.accentLight }} />
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
              Here's why this is a good option for you
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: colors.textSecondary }}>
              {facility.whyRecommended || facility.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Facility Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>{facility.name}</h2>
          {facility.bestMatch && (
            <span 
              className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: colors.accentLight }}
            >
              Best Match
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <MapPin size={12} style={{ color: colors.textMuted }} />
            <span className="font-mono" style={{ color: colors.accentLight }}>{facility.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="font-bold" style={{ color: colors.textPrimary }}>{facility.rating}</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            facility.availability.toLowerCase().includes('open') || facility.availability.toLowerCase().includes('24/7')
              ? 'bg-green-500/20 text-green-400'
              : ''
          }`}
          style={
            !(facility.availability.toLowerCase().includes('open') || facility.availability.toLowerCase().includes('24/7'))
              ? { backgroundColor: colors.bgTertiary, color: colors.textMuted }
              : undefined
          }
          >
            {facility.availability}
          </div>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Hours */}
        {facility.hours && (
          <div 
            className="rounded-lg p-3"
            style={{
              backgroundColor: colors.bgTertiary,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors.borderSecondary,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} style={{ color: colors.accentLight }} />
              <h3 className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>Operating Hours</h3>
            </div>
            <p className="text-xs" style={{ color: colors.textPrimary }}>{facility.hours}</p>
          </div>
        )}

        {/* Contact */}
        {facility.contact && (
          <div 
            className="rounded-lg p-3"
            style={{
              backgroundColor: colors.bgTertiary,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors.borderSecondary,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Phone size={14} style={{ color: colors.accentLight }} />
              <h3 className="text-[11px] font-semibold" style={{ color: colors.textSecondary }}>Contact</h3>
            </div>
            <p className="text-xs font-mono" style={{ color: colors.textPrimary }}>{facility.contact}</p>
          </div>
        )}
      </div>

      {/* Specializations */}
      {facility.specializations && facility.specializations.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: colors.textSecondary }}>
            <Award size={12} style={{ color: colors.accentLight }} />
            Specializations
          </h3>
          <div className="flex flex-wrap gap-2">
            {facility.specializations.map((spec: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 rounded text-[11px]"
                style={{
                  backgroundColor: `${colors.accentLight}10`,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: `${colors.accentLight}30`,
                  color: colors.accentLight,
                }}
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Services */}
      {facility.services && facility.services.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold mb-2" style={{ color: colors.textSecondary }}>Key Services Offered</h3>
          <ul className="space-y-1.5">
            {facility.services.map((service: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-[11px]" style={{ color: colors.textPrimary }}>
                <span className="mt-0.5" style={{ color: colors.accentLight }}>•</span>
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="flex gap-2 pt-3"
        style={{
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: colors.borderPrimary,
        }}
      >
        <button
          className="flex-1 py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: colors.bgTertiary,
            color: colors.textSecondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bgCardHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.bgTertiary;
          }}
        >
          <MapPin size={14} />
          Compare
        </button>
        <button
          className="flex-1 py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          style={{
            backgroundColor: colors.bgTertiary,
            color: colors.textSecondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bgCardHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.bgTertiary;
          }}
        >
          <Bookmark size={14} />
          Save
        </button>
      </div>
    </motion.div>
  );
};