import { IntentType } from './types';
import { Suggestion } from './SearchSuggestions';

// Intent-based suggestions
const HEALTHCARE_SUGGESTIONS: Suggestion[] = [
  { id: 'h1', text: 'Nearby hospitals', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h2', text: 'Emergency services', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h3', text: 'Urgent care clinics', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h4', text: 'Medical centers with specialists', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h5', text: 'Hospitals with trauma center', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h6', text: 'Pediatric hospitals', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h7', text: 'Walk-in clinics', type: 'intent', category: 'healthcare', icon: 'search' },
  { id: 'h8', text: 'Public hospitals', type: 'intent', category: 'healthcare', icon: 'search' },
];

const EDUCATION_SUGGESTIONS: Suggestion[] = [
  { id: 'e1', text: 'Schools near me', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e2', text: 'Universities in Abu Dhabi', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e3', text: 'International schools', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e4', text: 'Public schools', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e5', text: 'Private schools with IB program', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e6', text: 'Primary schools', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e7', text: 'High schools', type: 'intent', category: 'education', icon: 'search' },
  { id: 'e8', text: 'Technical colleges', type: 'intent', category: 'education', icon: 'search' },
];

// Refinement-based suggestions (context-aware)
const HEALTHCARE_REFINEMENTS: Suggestion[] = [
  { id: 'hr1', text: 'Open now', type: 'refinement', category: 'healthcare', icon: 'clock' },
  { id: 'hr2', text: 'Within 5 km', type: 'refinement', category: 'healthcare', icon: 'filter' },
  { id: 'hr3', text: 'Open 24/7', type: 'refinement', category: 'healthcare', icon: 'clock' },
  { id: 'hr4', text: 'Accepting new patients', type: 'refinement', category: 'healthcare', icon: 'filter' },
  { id: 'hr5', text: 'Shortest wait time', type: 'refinement', category: 'healthcare', icon: 'filter' },
  { id: 'hr6', text: 'Top rated facilities', type: 'refinement', category: 'healthcare', icon: 'filter' },
];

const EDUCATION_REFINEMENTS: Suggestion[] = [
  { id: 'er1', text: 'Open for enrollment', type: 'refinement', category: 'education', icon: 'clock' },
  { id: 'er2', text: 'Within 5 km', type: 'refinement', category: 'education', icon: 'filter' },
  { id: 'er3', text: 'Top rated schools', type: 'refinement', category: 'education', icon: 'filter' },
  { id: 'er4', text: 'Offering scholarships', type: 'refinement', category: 'education', icon: 'filter' },
  { id: 'er5', text: 'With transportation', type: 'refinement', category: 'education', icon: 'filter' },
  { id: 'er6', text: 'Bilingual programs', type: 'refinement', category: 'education', icon: 'filter' },
];

// Location-based suggestions (Abu Dhabi areas)
const LOCATION_SUGGESTIONS: Suggestion[] = [
  { id: 'l1', text: 'Khalifa City', type: 'location', icon: 'location' },
  { id: 'l2', text: 'Al Reem Island', type: 'location', icon: 'location' },
  { id: 'l3', text: 'Yas Island', type: 'location', icon: 'location' },
  { id: 'l4', text: 'Saadiyat Island', type: 'location', icon: 'location' },
  { id: 'l5', text: 'Al Zahiyah (Downtown)', type: 'location', icon: 'location' },
  { id: 'l6', text: 'Masdar City', type: 'location', icon: 'location' },
  { id: 'l7', text: 'Al Maryah Island', type: 'location', icon: 'location' },
  { id: 'l8', text: 'Corniche', type: 'location', icon: 'location' },
  { id: 'l9', text: 'Al Mushrif', type: 'location', icon: 'location' },
  { id: 'l10', text: 'Al Bateen', type: 'location', icon: 'location' },
];

/**
 * Generate context-aware suggestions based on user query and selected intent
 */
export const generateSuggestions = (
  query: string,
  selectedIntent: IntentType | null
): Suggestion[] => {
  // Don't show suggestions for very short queries
  if (query.length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  let allSuggestions: Suggestion[] = [];

  // 1. Add intent-based suggestions (prioritize based on selected category)
  if (!selectedIntent || selectedIntent === 'healthcare') {
    allSuggestions.push(...HEALTHCARE_SUGGESTIONS);
  }
  if (!selectedIntent || selectedIntent === 'education') {
    allSuggestions.push(...EDUCATION_SUGGESTIONS);
  }

  // 2. Add refinement suggestions (context-aware)
  if (selectedIntent === 'healthcare') {
    allSuggestions.push(...HEALTHCARE_REFINEMENTS);
  } else if (selectedIntent === 'education') {
    allSuggestions.push(...EDUCATION_REFINEMENTS);
  } else {
    // If no intent selected, show both
    allSuggestions.push(...HEALTHCARE_REFINEMENTS, ...EDUCATION_REFINEMENTS);
  }

  // 3. Add location suggestions
  allSuggestions.push(...LOCATION_SUGGESTIONS);

  // Filter by query match
  const filtered = allSuggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(lowerQuery)
  );

  // Sort by relevance:
  // 1. Exact match first
  // 2. Starts with query
  // 3. Contains query
  // 4. Prioritize by type (intent > refinement > location)
  const sorted = filtered.sort((a, b) => {
    const aText = a.text.toLowerCase();
    const bText = b.text.toLowerCase();
    
    // Exact match
    if (aText === lowerQuery) return -1;
    if (bText === lowerQuery) return 1;
    
    // Starts with query
    const aStarts = aText.startsWith(lowerQuery);
    const bStarts = bText.startsWith(lowerQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    // Type priority
    const typeOrder = { intent: 0, refinement: 1, location: 2 };
    const aOrder = typeOrder[a.type];
    const bOrder = typeOrder[b.type];
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Category match (if intent is selected)
    if (selectedIntent) {
      if (a.category === selectedIntent && b.category !== selectedIntent) return -1;
      if (a.category !== selectedIntent && b.category === selectedIntent) return 1;
    }
    
    return 0;
  });

  // Limit to max 6 suggestions
  return sorted.slice(0, 6);
};

/**
 * Get a system message based on the selected suggestion
 */
export const getSystemMessage = (suggestion: Suggestion): string => {
  switch (suggestion.type) {
    case 'intent':
      if (suggestion.category === 'healthcare') {
        return `Showing ${suggestion.text.toLowerCase()} in your area.`;
      } else if (suggestion.category === 'education') {
        return `Showing ${suggestion.text.toLowerCase()} nearby.`;
      }
      return `Showing results for "${suggestion.text}".`;
    
    case 'refinement':
      return `Filtering by ${suggestion.text.toLowerCase()}.`;
    
    case 'location':
      return `Searching in ${suggestion.text}.`;
    
    default:
      return `Processing your request...`;
  }
};
