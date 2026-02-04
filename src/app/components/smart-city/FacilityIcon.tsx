import { Hospital, GraduationCap } from "lucide-react";
import { IntentType } from "./types";

interface FacilityIconProps {
  facilityType?: string;
  intent: IntentType;
  size?: number;
  strokeWidth?: number;
}

export const FacilityIcon = ({ 
  facilityType, 
  intent, 
  size = 14, 
  strokeWidth = 1.5 
}: FacilityIconProps) => {
  const iconColor = "#7AA4C4";

  if (intent === 'healthcare') {
    switch (facilityType) {
      case 'diagnostic':
        // Diagnostic Center - Medical chart with checkmark
        return (
          <svg width={size} height={size} viewBox="0 0 512 512" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="m27.57 116.07v123.87h154.89l36.05-85.99c1.05-2.5 3.65-3.99 6.34-3.62 2.69.36 4.8 2.49 5.15 5.18l19.77 154.44 28.95-69.05c.93-2.23 3.11-3.68 5.53-3.68h40.37v12h-36.38l-36.05 85.99c-.94 2.25-3.14 3.68-5.53 3.68-.27 0-.54-.02-.81-.06-2.69-.36-4.8-2.49-5.14-5.18l-19.78-154.44-28.94 69.05c-.94 2.23-3.12 3.68-5.54 3.68h-158.88v121.15h331.04c12.18-23.8 36.94-40.13 65.46-40.13 6.59 0 12.98.88 19.06 2.52v-25.59h-108.83c-5.15 0-9.33-4.18-9.33-9.33v-184.49zm263.7 309.48-26.09-40.46h-59.66l-26.08 40.46zm172.84-43.87-50.69 57.49c-1.14 1.29-2.78 2.03-4.5 2.03-.04 0-.09 0-.13 0-1.77-.04-3.43-.86-4.54-2.24l-20.4-25.34c-2.08-2.58-1.67-6.36.91-8.44 2.58-2.07 6.36-1.67 8.44.92l15.93 19.79 45.98-52.15c2.19-2.48 5.99-2.72 8.47-.53 2.49 2.19 2.72 5.98.53 8.47zm-40.04-36.72c33.91 0 61.5 27.59 61.5 61.5s-27.59 61.5-61.5 61.5c-33.92 0-61.5-27.59-61.5-61.5s27.58-61.5 61.5-61.5z"/>
          </svg>
        );
      case 'clinic':
        // Clinic - Pill Icon
        return (
          <svg width={size} height={size} viewBox="0 0 512 512" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="M472.196,39.468c-52.654-52.625-138.301-52.625-190.955,0L169.915,150.794l126.394,126.394c26.014-21.663,58.995-35.227,95.412-35.227c20.888,0,40.765,4.339,58.851,12.087l21.624-23.624C524.835,177.784,524.835,92.123,472.196,39.468z"/>
            <path d="M275.27,298.577L148.7,172.008L39.742,281.073c-52.639,52.639-52.639,138.301,0,190.955c52.653,52.622,139.3,53.626,191.955,0.999l22.088-22.194c-7.748-18.086-12.087-37.963-12.087-58.851C241.699,356.5,254.599,324.291,275.27,298.577z"/>
            <path d="M271.703,391.983c0,61.144,45.893,111.045,105.015,118.504V273.478C317.596,280.937,271.703,330.836,271.703,391.983z"/>
            <path d="M406.722,273.478v237.009c59.122-7.459,105.015-57.36,105.015-118.505S465.845,280.937,406.722,273.478z"/>
          </svg>
        );
      case 'pharmacy':
        // Pharmacy - Home with medical cross (pill/prescription variation)
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="m12 1c-.6015 0-1.204.18081-1.7204.5423l-7.99999 5.6c-.80197.56139-1.27961 1.47876-1.27961 2.4577v10.4c0 1.6568 1.34315 3 3 3h4c.55228 0 1-.4477 1-1v-4c0-1.1046.89543-2 2-2h2c1.1046 0 2 .8954 2 2v4c0 .5523.4477 1 1 1h4c1.6569 0 3-1.3432 3-3v-10.4c0-.97894-.4776-1.89631-1.2796-2.4577l-8-5.6c-.5164-.36149-1.1189-.5423-1.7204-.5423zm.5 5c.2761 0 .5.22386.5.5v1.5h1.5c.2761 0 .5.22386.5.5v1c0 .27614-.2239.5-.5.5h-1.5v1.5c0 .2761-.2239.5-.5.5h-1c-.2761 0-.5-.2239-.5-.5v-1.5h-1.5c-.27614 0-.5-.22386-.5-.5v-1c0-.27614.22386-.5.5-.5h1.5v-1.5c0-.27614.2239-.5.5-.5z"/>
          </svg>
        );
      default:
        // Default healthcare icon (Hospital)
        return <Hospital size={size} className="text-[#7AA4C4]" strokeWidth={strokeWidth} />;
    }
  } else if (intent === 'education') {
    switch (facilityType) {
      case 'public':
        // Public School
        return (
          <svg width={size} height={size} viewBox="0 0 192 192" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="m0 160h40v32h-40z"/>
            <path d="m152 160h40v32h-40z"/>
            <path d="m141 81.753-37-29.6v-20.153h28a4 4 0 0 0 4-4v-24a4 4 0 0 0 -4-4h-40a4 4 0 0 0 -4 4v48.155l-37 29.6a8 8 0 0 0 -3 6.245v104h32v-23.548c0-8.615 6.621-16.029 15.227-16.434a16 16 0 0 1 16.773 15.982v24h32v-104a8 8 0 0 0 -3-6.247zm-45 38.247a16 16 0 1 1 16-16 16 16 0 0 1 -16 16z"/>
            <path d="m184 112h-32v40h40v-32a8 8 0 0 0 -8-8z"/>
            <path d="m0 120v32h40v-40h-32a8 8 0 0 0 -8 8z"/>
          </svg>
        );
      case 'private':
        // Private School
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="m75.1402588 10h-50.2805176v6.0795898h-14.8597412v73.9204102h32.4678345v-23.7133789h15.0643311v23.7133789h32.4678344v-73.9204102h-14.8597412zm-41.5610352 69.331665h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm24.1439209 20.2851563h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm23.7619019 41.0501709h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-33.3303223v13.045166h-15.06427v-13.045166z"/>
          </svg>
        );
      case 'nursery':
        // Nursery/Early Childhood
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill={iconColor} xmlns="http://www.w3.org/2000/svg">
            <path d="m75.1402588 10h-50.2805176v6.0795898h-14.8597412v73.9204102h32.4678345v-23.7133789h15.0643311v23.7133789h32.4678344v-73.9204102h-14.8597412zm-41.5610352 69.331665h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm24.1439209 20.2851563h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm23.7619019 41.0501709h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-33.3303223v13.045166h-15.06427v-13.045166z"/>
          </svg>
        );
      default:
        // Default education icon (Graduation Cap)
        return <GraduationCap size={size} className="text-[#7AA4C4]" strokeWidth={strokeWidth} />;
    }
  } else {
    // Default education icon for any other intent
    return <GraduationCap size={size} className="text-[#7AA4C4]" strokeWidth={strokeWidth} />;
  }
};