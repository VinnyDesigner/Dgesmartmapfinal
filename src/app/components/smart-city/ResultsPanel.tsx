import { motion, AnimatePresence } from "motion/react";
import { IntentType } from "./types";
import { Sparkles, MapPin, Check, Send, Loader2, Award, ChevronLeft, ChevronRight, Bot, User } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { FacilityDetailsView } from "./FacilityDetailsView";
import { AIBorderShader } from "./AIBorderShader";
import { FilterSettings } from "./FilterPanel";
import { useTheme } from "./ThemeContext";
import { SearchSuggestions, Suggestion } from "./SearchSuggestions";
import { generateSuggestions, getSystemMessage } from "./suggestionEngine";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { FacilityIcon } from "./FacilityIcon";
import { ChatThreadRenderer } from "./ChatThreadRenderer";

interface ResultsPanelProps {
  intent: IntentType;
  onFocusMap: (id: number) => void;
  onRefinement?: (query: string, newIntent?: IntentType) => void;
  onApplyFilters?: (filters: FilterSettings) => void;
  activeFilters?: FilterSettings | null;
  onSidebarToggle?: (isCollapsed: boolean) => void;
  isCollapsed?: boolean;
}

// Chat Message Types
type ChatMessage = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  results?: any[];
  isProcessing?: boolean;
};

// Data aligned with MapBackground MARKERS
const MOCK_RESULTS: Record<string, any[]> = {
  healthcare: [
    { 
      id: 1, 
      name: "Central Hospital", 
      distance: "1.2 km", 
      tags: ["Emergency", "24/7", "Trauma Center"], 
      reason: "Best option for urgent care based on current wait times.", 
      bestMatch: true, 
      rating: "4.8/5", 
      availability: "Open Now",
      hours: "24/7 - Open all hours",
      contact: "+971 2 123 4567",
      facilityType: "diagnostic",
      specializations: ["Emergency Medicine", "Trauma Care", "Critical Care"],
      services: ["Emergency Room", "ICU", "Ambulance Service", "Diagnostic Imaging", "Lab Services"],
      whyRecommended: "Central Hospital has the shortest current wait time (12 minutes) and is equipped with a Level 1 Trauma Center, making it the best choice for urgent medical needs within your area."
    },
    { 
      id: 3, 
      name: "City Clinic", 
      distance: "3.5 km", 
      tags: ["Outpatient", "Specialist"], 
      reason: "Highly rated for general checkups.", 
      bestMatch: false, 
      rating: "4.5/5", 
      availability: "9 AM - 5 PM",
      hours: "Mon-Fri: 9 AM - 5 PM, Sat: 9 AM - 2 PM, Sun: Closed",
      contact: "+971 2 234 5678",
      facilityType: "clinic",
      specializations: ["General Practice", "Internal Medicine", "Pediatrics"],
      services: ["General Checkups", "Vaccinations", "Health Screenings", "Minor Procedures"],
      whyRecommended: "City Clinic consistently receives high ratings for patient care and has same-day appointment availability for non-emergency consultations."
    },
    { 
      id: 4, 
      name: "Burjeel Medical City", 
      distance: "2.8 km", 
      tags: ["Pharmacy", "24/7", "Prescription"], 
      reason: "Nearest pharmacy with extended hours and prescription delivery.", 
      bestMatch: false, 
      rating: "4.6/5", 
      availability: "Open Now",
      hours: "24/7 - Open all hours",
      contact: "+971 2 789 0123",
      facilityType: "pharmacy",
      specializations: ["Retail Pharmacy", "Prescription Services", "Health Products"],
      services: ["Prescription Filling", "OTC Medications", "Health Consultations", "Home Delivery", "Medical Supplies"],
      whyRecommended: "Open 24/7 with a wide selection of medications and medical supplies. Offers free home delivery for prescriptions and has licensed pharmacists available for consultations."
    },
    { 
      id: 6, 
      name: "Urgent Care", 
      distance: "5.0 km", 
      tags: ["Walk-in", "Pediatric"], 
      reason: "Good alternative with lower traffic.", 
      bestMatch: false, 
      rating: "4.2/5", 
      availability: "8 AM - 8 PM",
      hours: "Daily: 8 AM - 8 PM",
      contact: "+971 2 345 6789",
      facilityType: "clinic",
      specializations: ["Urgent Care", "Pediatrics", "Family Medicine"],
      services: ["Walk-in Consultations", "X-rays", "Lab Tests", "Minor Injuries", "Pediatric Care"],
      whyRecommended: "Currently experiencing low patient volume, resulting in minimal wait times. Excellent for non-life-threatening urgent care needs."
    },
    { 
      id: 8, 
      name: "Medical Center North", 
      distance: "6.2 km", 
      tags: ["Public", "Emergency", "24/7"], 
      reason: "Public facility with comprehensive services.", 
      bestMatch: false, 
      rating: "4.6/5", 
      availability: "Open Now",
      hours: "24/7 - Open all hours",
      contact: "+971 2 456 7890",
      facilityType: "diagnostic",
      specializations: ["Emergency Medicine", "General Surgery", "Cardiology"],
      services: ["Emergency Care", "Surgery", "Cardiology", "Pharmacy", "Radiology"],
      whyRecommended: "As a public facility, this center offers comprehensive services at subsidized rates and accepts all insurance plans."
    },
    { 
      id: 9, 
      name: "Specialty Hospital", 
      distance: "7.0 km", 
      tags: ["Private", "Specialist", "Surgery"], 
      reason: "Advanced medical procedures available.", 
      bestMatch: false, 
      rating: "4.7/5", 
      availability: "Open Now",
      hours: "24/7 - Open all hours",
      contact: "+971 2 567 8901",
      facilityType: "diagnostic",
      specializations: ["Cardiology", "Orthopedics", "Neurology", "Oncology"],
      services: ["Advanced Surgery", "Cardiac Care", "Neurosurgery", "Cancer Treatment", "Rehabilitation"],
      whyRecommended: "Leading private hospital with state-of-the-art equipment and internationally trained specialists for complex medical procedures."
    },
    { 
      id: 10, 
      name: "Community Clinic", 
      distance: "4.5 km", 
      tags: ["Public", "Walk-in"], 
      reason: "Convenient walk-in services nearby.", 
      bestMatch: false, 
      rating: "4.3/5", 
      availability: "8 AM - 6 PM",
      hours: "Mon-Sat: 8 AM - 6 PM, Sun: Closed",
      contact: "+971 2 678 9012",
      facilityType: "clinic",
      specializations: ["Family Medicine", "Preventive Care"],
      services: ["General Consultations", "Preventive Screenings", "Vaccinations", "Health Education"],
      whyRecommended: "Community-focused clinic offering affordable healthcare services with experienced family physicians."
    },
    { 
      id: 11, 
      name: "Family Health Center", 
      distance: "8.1 km", 
      tags: ["Family Care", "Pediatric"], 
      reason: "Great for families with children.", 
      bestMatch: false, 
      rating: "4.4/5", 
      availability: "9 AM - 7 PM",
      hours: "Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 4 PM",
      contact: "+971 2 789 0123",
      facilityType: "clinic",
      specializations: ["Family Medicine", "Pediatrics", "Women's Health"],
      services: ["Child Care", "Prenatal Care", "Family Planning", "Immunizations"],
      whyRecommended: "Specialized in family healthcare with dedicated pediatric and maternal health services under one roof."
    },
    { 
      id: 12, 
      name: "Express Clinic", 
      distance: "3.8 km", 
      tags: ["Walk-in", "Quick Care"], 
      reason: "Fast service with minimal wait times.", 
      bestMatch: false, 
      rating: "4.3/5", 
      availability: "7 AM - 10 PM",
      hours: "Daily: 7 AM - 10 PM",
      contact: "+971 2 890 1234",
      facilityType: "clinic",
      specializations: ["Quick Care", "Occupational Health"],
      services: ["Fast Consultations", "Lab Tests", "Prescriptions", "Work Clearances"],
      whyRecommended: "Designed for quick medical consultations with average visit time under 30 minutes. Ideal for minor ailments and prescription refills."
    },
  ],
  education: [
    { 
      id: 2, 
      name: "Tech High School", 
      distance: "2.1 km", 
      tags: ["STEM Focus", "Public"], 
      reason: "Matches your preference for science programs.", 
      bestMatch: true, 
      rating: "4.9/5", 
      availability: "Open",
      hours: "Mon-Fri: 7:30 AM - 3:30 PM",
      contact: "+971 2 111 2222",
      facilityType: "public",
      specializations: ["STEM Education", "Technology", "Engineering"],
      services: ["Advanced Science Labs", "Coding Classes", "Robotics Club", "Math Competition Teams"],
      whyRecommended: "Top-ranked STEM program with state-of-the-art laboratories and partnerships with leading tech companies for student internships."
    },
    { 
      id: 7, 
      name: "Primary School", 
      distance: "0.8 km", 
      tags: ["K-5", "Private"], 
      reason: "Closest highly-rated primary school.", 
      bestMatch: false, 
      rating: "4.6/5", 
      availability: "Open",
      hours: "Mon-Fri: 8:00 AM - 2:30 PM",
      contact: "+971 2 222 3333",
      facilityType: "nursery",
      specializations: ["Early Childhood Education", "Bilingual Learning"],
      services: ["Small Class Sizes", "After-School Programs", "Arts & Music", "Sports Activities"],
      whyRecommended: "Closest option with excellent student-teacher ratio (12:1) and comprehensive early childhood development programs."
    },
    { 
      id: 5, 
      name: "City Library", 
      distance: "1.5 km", 
      tags: ["Public", "Resource"], 
      reason: "Great study space available now.", 
      bestMatch: false, 
      rating: "4.8/5", 
      availability: "Open",
      hours: "Mon-Sat: 9 AM - 9 PM, Sun: 10 AM - 6 PM",
      contact: "+971 2 333 4444",
      facilityType: "public",
      specializations: ["Public Resources", "Digital Learning", "Community Programs"],
      services: ["Study Rooms", "Computer Lab", "Free WiFi", "Educational Workshops", "Book Lending"],
      whyRecommended: "Modern facility with extensive digital resources, quiet study areas, and free access to online learning platforms."
    },
    { 
      id: 13, 
      name: "International School", 
      distance: "3.8 km", 
      tags: ["Private", "IB Program"], 
      reason: "Top-rated international curriculum.", 
      bestMatch: false, 
      rating: "4.9/5", 
      availability: "Open",
      hours: "Mon-Fri: 8:00 AM - 3:00 PM",
      contact: "+971 2 444 5555",
      facilityType: "private",
      specializations: ["International Baccalaureate", "Multilingual Education"],
      services: ["IB Diploma Program", "Language Courses", "Exchange Programs", "Global Citizenship"],
      whyRecommended: "Prestigious IB World School with 98% university acceptance rate and graduates attending top global universities."
    },
    { 
      id: 14, 
      name: "Science Academy", 
      distance: "4.2 km", 
      tags: ["Public", "STEM"], 
      reason: "Excellent science and technology programs.", 
      bestMatch: false, 
      rating: "4.7/5", 
      availability: "Open",
      hours: "Mon-Fri: 7:30 AM - 3:30 PM",
      contact: "+971 2 555 6666",
      facilityType: "public",
      specializations: ["Science", "Technology", "Research"],
      services: ["Research Labs", "Science Olympiad", "Tech Workshops", "Mentorship Programs"],
      whyRecommended: "Award-winning science program with students regularly placing in national competitions and research symposiums."
    },
    { 
      id: 15, 
      name: "Arts School", 
      distance: "5.1 km", 
      tags: ["Public", "Arts Focus"], 
      reason: "Strong arts and creative programs.", 
      bestMatch: false, 
      rating: "4.5/5", 
      availability: "Open",
      hours: "Mon-Fri: 8:00 AM - 4:00 PM",
      contact: "+971 2 666 7777",
      facilityType: "public",
      specializations: ["Visual Arts", "Performing Arts", "Creative Writing"],
      services: ["Art Studios", "Theater Program", "Music Lessons", "Exhibition Gallery"],
      whyRecommended: "Renowned for nurturing creative talent with dedicated arts facilities and regular showcases of student work."
    },
    { 
      id: 16, 
      name: "Community College", 
      distance: "6.0 km", 
      tags: ["Public", "Higher Ed"], 
      reason: "Affordable higher education option.", 
      bestMatch: false, 
      rating: "4.4/5", 
      availability: "Open",
      hours: "Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9 AM - 5 PM",
      contact: "+971 2 777 8888",
      facilityType: "public",
      specializations: ["Associate Degrees", "Vocational Training", "Transfer Programs"],
      services: ["Career Counseling", "Job Placement", "Flexible Schedules", "Financial Aid"],
      whyRecommended: "Cost-effective pathway to higher education with guaranteed transfer agreements to top universities."
    },
    { 
      id: 17, 
      name: "Language Institute", 
      distance: "2.9 km", 
      tags: ["Languages", "Private"], 
      reason: "Specialized language education programs.", 
      bestMatch: false, 
      rating: "4.6/5", 
      availability: "Open",
      hours: "Mon-Sat: 9:00 AM - 7:00 PM",
      contact: "+971 2 888 9999",
      facilityType: "private",
      specializations: ["Language Learning", "Cultural Studies", "Translation"],
      services: ["Arabic Courses", "English Programs", "Certification Prep", "Cultural Immersion"],
      whyRecommended: "Specialized language institute with native-speaking instructors and internationally recognized certification programs."
    },
  ],
  default: [
    { id: 99, name: "City Center", distance: "2.0 km", tags: ["Public", "Open"], reason: "Central location with easy access.", bestMatch: true, rating: "4.5/5", availability: "Open Now" },
  ]
};

export const ResultsPanel = ({ intent, onFocusMap, onRefinement, onApplyFilters, activeFilters, onSidebarToggle, isCollapsed }: ResultsPanelProps) => {
  const { colors, theme } = useTheme();
  const [showNudge, setShowNudge] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [currentResults, setCurrentResults] = useState<any[]>([]);
  const [previousResults, setPreviousResults] = useState<any[]>([]);
  const [previousBestMatch, setPreviousBestMatch] = useState<any | null>(null);
  const [changesSummary, setChangesSummary] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateType, setUpdateType] = useState<'refinement' | 'expansion' | 'shift' | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null); // Details view state
  const [activeCardId, setActiveCardId] = useState<number | null>(null); // Active card tracking for visual focus
  const [placeholder, setPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Mobile-specific states
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = (intent && MOCK_RESULTS[intent]) || MOCK_RESULTS.default;
  
  // Typewriter effect for placeholder
  const placeholders = [
    "Show me public facilities only...",
    "Find closer options nearby...",
    "Show more results...",
    "Filter by emergency services...",
    "I need 24/7 facilities...",
  ];

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;
    let isDeleting = false;
    let phraseIndex = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const type = () => {
      const currentPhrase = placeholders[phraseIndex];
      let newText = "";
      
      if (!isDeleting) {
        currentIndex++;
        newText = currentPhrase.substring(0, currentIndex);
        
        if (newText === currentPhrase) {
          isDeleting = true;
          setPlaceholder(newText);
          timeoutId = setTimeout(type, pauseTime);
          return;
        }
      } else {
        currentIndex--;
        newText = currentPhrase.substring(0, currentIndex);
        
        if (newText === "") {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % placeholders.length;
          currentIndex = 0;
          setPlaceholder(newText);
          timeoutId = setTimeout(type, 500);
          return;
        }
      }
      
      setPlaceholder(newText);
      timeoutId = setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    };

    timeoutId = setTimeout(type, 500);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Initialize current results
  useEffect(() => {
    setCurrentResults(results);
  }, [results]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: intent === 'healthcare' 
          ? "Hello! I've found some healthcare facilities near you. How can I help you refine your search?" 
          : "Hello! I've found some education facilities near you. How can I help you refine your search?",
        timestamp: new Date(),
        results: displayResults,
      };
      setChatMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Generate suggestions based on search query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const newSuggestions = generateSuggestions(searchQuery, intent);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchQuery, intent]);

  // Reset state when new recommendations are generated
  useEffect(() => {
    setShowNudge(false);
    setAiResponse(null);
  }, [intent]);

  // Show assistant nudge after 2-3 seconds
  useEffect(() => {
    if (!aiResponse) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowNudge(false);
    }
  }, [aiResponse]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchStartY.current - touchCurrentY.current;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // Swipe up - expand
        setIsMobileExpanded(true);
      } else {
        // Swipe down - collapse
        setIsMobileExpanded(false);
      }
    }

    touchStartY.current = 0;
    touchCurrentY.current = 0;
  };

  const handleViewMap = (item: any) => {
    onFocusMap(item.id);
  };

  const handleCategorySwitch = async (newCategory: IntentType) => {
    if (!newCategory || newCategory === intent) return; // Already on this category or invalid

    // Store previous state
    setPreviousResults(currentResults);
    
    // Show transition feedback
    setIsUpdating(true);
    setUpdateType('shift');
    setShowNudge(false);
    
    const categoryLabel = newCategory === 'healthcare' ? 'Health & Wellness' : 'Education';
    setAiResponse(`Switching to ${categoryLabel} options near you…`);

    // Simulate brief transition
    await new Promise(resolve => setTimeout(resolve, 400));

    // Trigger parent intent change
    if (onRefinement) {
      onRefinement(`Switch to ${categoryLabel}`, newCategory);
    }

    // Get new results
    const newResults = MOCK_RESULTS[newCategory] || MOCK_RESULTS.default;
    const updatedResults = newResults.map((r, idx) => ({
      ...r,
      bestMatch: idx === 0
    }));

    setCurrentResults(updatedResults);
    
    // Complete transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const bestMatchLabel = newCategory === 'healthcare' ? 'health facility' : 'school';
    setAiResponse(`Found ${newResults.length} ${categoryLabel.toLowerCase()} options near you. Best ${bestMatchLabel}: ${updatedResults[0].name}`);
    setIsUpdating(false);

    // Auto-hide response
    setTimeout(() => {
      setAiResponse(null);
      setUpdateType(null);
    }, 6000);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: Suggestion) => {
    // Hide suggestions
    setShowSuggestions(false);
    
    // Get system message
    const systemMessage = getSystemMessage(suggestion);
    setAiResponse(systemMessage);
    
    // Submit the query with the full suggestion text
    await handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent, suggestion.text);
  };

  // Handle keyboard navigation for suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else if (searchQuery.trim()) {
          handleSearchSubmit(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const queryToUse = overrideQuery || searchQuery;
    if (!queryToUse.trim()) return;

    // Hide suggestions
    setShowSuggestions(false);

    // CORE RULE: If sidebar is collapsed, automatically reopen it
    if (isCollapsed && onSidebarToggle) {
      onSidebarToggle(false);
      // Brief delay to let sidebar slide in before showing results
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: queryToUse,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Add processing AI message
    const processingMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isProcessing: true,
    };
    setChatMessages(prev => [...prev, processingMessage]);

    // Store previous state for comparison
    const previousResultIds = currentResults.map(r => r.id);
    const currentBest = currentResults.find(r => r.bestMatch) || currentResults[0];
    setPreviousBestMatch(currentBest);

    // Show "updating" state
    setIsUpdating(true);
    setIsProcessingQuery(true);
    setShowNudge(false);
    setAiResponse("Updating based on your request…");

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    // AI response interpretation with context awareness
    const query = queryToUse.toLowerCase();
    let response = "";
    let filteredResults = [...currentResults]; // Start with current results for refinement
    let detectedUpdateType: 'refinement' | 'expansion' | 'shift' = 'refinement';
    let shouldSwitchIntent = false;

    // INTENT SHIFT - Change category (completely new cards)
    if (query.includes("school") || query.includes("education")) {
      detectedUpdateType = 'shift';
      response = "Switching to nearby schools.";
      shouldSwitchIntent = true;
      if (onRefinement) {
        onRefinement(searchQuery, "education");
      }
      filteredResults = MOCK_RESULTS.education || results;
    } else if (query.includes("hospital") || query.includes("clinic") || query.includes("healthcare")) {
      detectedUpdateType = 'shift';
      response = "Switching to nearby healthcare facilities.";
      shouldSwitchIntent = true;
      if (onRefinement) {
        onRefinement(searchQuery, "healthcare");
      }
      filteredResults = MOCK_RESULTS.healthcare || results;
    }
    // EXPANSION - Add more options (keep current + add new from original pool)
    else if (query.includes("more") || query.includes("all") || query.includes("show more") || query.includes("expand")) {
      detectedUpdateType = 'expansion';
      response = "Showing more options.";
      // Get all results from the current intent, not just what's displayed
      const allResults = results;
      // Add results that aren't currently shown
      const currentIds = currentResults.map(r => r.id);
      const newResults = allResults.filter(r => !currentIds.includes(r.id));
      filteredResults = [...currentResults, ...newResults];
    }
    // REFINEMENT - Narrow down options (remove cards that don't match)
    else if (query.includes("public") || query.includes("government")) {
      detectedUpdateType = 'refinement';
      response = "Now showing only public facilities.";
      filteredResults = currentResults.filter(r => r.tags.some((t: string) => t.toLowerCase().includes("public")));
    } else if (query.includes("private")) {
      detectedUpdateType = 'refinement';
      response = "Now showing only private facilities.";
      filteredResults = currentResults.filter(r => r.tags.some((t: string) => t.toLowerCase().includes("private")));
    } else if (query.includes("closer") || query.includes("nearest") || query.includes("close")) {
      detectedUpdateType = 'refinement';
      response = "Focusing on closer options.";
      // Sort by distance and take top 3
      const sorted = [...currentResults].sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
      filteredResults = sorted.slice(0, 3);
    } else if (query.includes("emergency") || query.includes("urgent") || query.includes("24/7")) {
      detectedUpdateType = 'refinement';
      response = "Showing only emergency-enabled facilities.";
      filteredResults = currentResults.filter(r => r.tags.some((t: string) => t.toLowerCase().includes("emergency") || t.toLowerCase().includes("24/7")));
    } else if (query.includes("far") || query.includes("farther")) {
      detectedUpdateType = 'refinement';
      response = "Showing options that are farther away.";
      // Sort by distance descending and take results beyond 5km
      const sorted = [...currentResults].sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distB - distA;
      });
      filteredResults = sorted.slice(0, 4);
    } else if (query.includes("best") || query.includes("top rated") || query.includes("highest")) {
      detectedUpdateType = 'refinement';
      response = "Showing only top-rated options.";
      // Filter by rating >= 4.6
      filteredResults = currentResults.filter(r => parseFloat(r.rating) >= 4.6);
    } else {
      detectedUpdateType = 'refinement';
      response = `Adjusting results based on "${searchQuery}".`;
      // Keep first 4 results as a fallback
      filteredResults = currentResults.slice(0, 4);
    }

    setUpdateType(detectedUpdateType);

    // Different transition delays based on update type
    const transitionDelay = detectedUpdateType === 'shift' ? 500 : detectedUpdateType === 'expansion' ? 300 : 400;
    await new Promise(resolve => setTimeout(resolve, transitionDelay));

    // Update results
    const finalResults = filteredResults.length > 0 ? filteredResults : results;
    const newResultIds = finalResults.map(r => r.id);
    
    // Calculate changes for contextual feedback
    const addedCount = newResultIds.filter(id => !previousResultIds.includes(id)).length;
    const removedCount = previousResultIds.filter(id => !newResultIds.includes(id)).length;
    const remainedCount = newResultIds.filter(id => previousResultIds.includes(id)).length;

    // Recalculate Best Match from final results
    const recalculatedBest = finalResults[0]; // First result is always best
    const newBest = { ...recalculatedBest, bestMatch: true };
    const updatedResults = finalResults.map((r, idx) => ({
      ...r,
      bestMatch: idx === 0
    }));

    setCurrentResults(updatedResults);
    setPreviousResults(currentResults);

    // Contextual feedback based on update type
    if (detectedUpdateType === 'shift') {
      response += ` Found ${finalResults.length} options.`;
    } else if (detectedUpdateType === 'expansion') {
      if (addedCount > 0) {
        response += ` Added ${addedCount} more ${addedCount === 1 ? 'option' : 'options'}.`;
      }
    } else if (detectedUpdateType === 'refinement') {
      if (removedCount > 0) {
        response += ` Removed ${removedCount} ${removedCount === 1 ? 'option' : 'options'} that didn't match.`;
      }
      if (remainedCount > 0 && remainedCount === finalResults.length) {
        response += ` All options still match your criteria.`;
      }
    }

    // Best Match continuity feedback
    if (!shouldSwitchIntent) {
      if (currentBest && newBest.id === currentBest.id) {
        response += " Your best option remains the same.";
      } else if (currentBest && newBest.id !== currentBest.id) {
        response += ` New best match: ${newBest.name}.`;
      }
    }

    // Update the processing message with actual results
    setChatMessages(prev => 
      prev.map(msg => 
        msg.isProcessing 
          ? { ...msg, content: response, isProcessing: false, results: updatedResults }
          : msg
      )
    );

    setAiResponse(response);
    setIsUpdating(false);
    setIsProcessingQuery(false);
    setSearchQuery("");

    // Auto-hide AI response after longer duration
    setTimeout(() => {
      setAiResponse(null);
      setUpdateType(null);
    }, 8000);
  };

  const displayResults = currentResults.length > 0 ? currentResults : results;
  const bestMatch = displayResults.find(r => r.bestMatch) || displayResults[0];

  return (
    <>
      {/* Desktop Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <div className="relative h-full w-full flex flex-col pointer-events-auto" style={{ paddingBottom: '80px' }}>
          <div className="relative h-full flex flex-col" style={{
            backgroundColor: colors.bgPrimary,
            borderRightWidth: '1px',
            borderRightStyle: 'solid',
            borderRightColor: colors.borderPrimary,
          }}>
            {/* WebGL Animated AI Border */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <AIBorderShader borderWidth={2} animationSpeed={10} />
            </div>
            
            {/* Fixed Header Section */}
            <div className="px-8 pt-8 pb-0">
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-1" style={{ color: colors.textPrimary }}>
                <Sparkles size={14} strokeWidth={1.5} style={{ color: colors.accentLight }} />
                Recommended for You
              </h2>
              <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
                I found these nearby based on your preferences.
              </p>

              {/* Category Switcher */}
              {!selectedFacility && (
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => handleCategorySwitch('healthcare')}
                    disabled={isUpdating}
                    className={clsx(
                      "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                    style={
                      intent === 'healthcare'
                        ? {
                            backgroundColor: `${colors.accentPrimary}20`,
                            color: colors.accentLight,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: `${colors.accentLight}80`,
                          }
                        : {
                            backgroundColor: colors.bgTertiary,
                            color: colors.textMuted,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: colors.borderPrimary,
                          }
                    }
                  >
                    Health & Wellness
                  </button>
                  <button
                    onClick={() => handleCategorySwitch('education')}
                    disabled={isUpdating}
                    className={clsx(
                      "flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                    style={
                      intent === 'education'
                        ? {
                            backgroundColor: `${colors.accentPrimary}20`,
                            color: colors.accentLight,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: `${colors.accentLight}80`,
                          }
                        : {
                            backgroundColor: colors.bgTertiary,
                            color: colors.textMuted,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: colors.borderPrimary,
                          }
                    }
                  >
                    Education
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content Area - Chat Thread Only */}
            <div className="flex-1 overflow-y-auto px-8 pr-6 pt-4" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: `${colors.borderSecondary} transparent`,
            }}>
              {/* Show Details View OR Chat Thread */}
              {selectedFacility ? (
                <FacilityDetailsView
                  facility={selectedFacility}
                  onClose={() => setSelectedFacility(null)}
                />
              ) : (
                <ChatThreadRenderer
                  chatMessages={chatMessages}
                  intent={intent}
                  activeCardId={activeCardId}
                  onFocusMap={onFocusMap}
                  onSetActiveCardId={setActiveCardId}
                  onSetSelectedFacility={setSelectedFacility}
                />
              )}
            </div>

            {/* Nudge - Fixed Above Search Bar (Outside Scrollable Area) */}
            <AnimatePresence>
              {showNudge && !selectedFacility && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-8 pb-3 relative z-50"
                >
                  <div 
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: colors.bgCard,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: colors.borderAccent,
                    }}
                  >
                    <p className="text-xs mb-2" style={{ color: colors.textPrimary }}>
                      Want more details or need help choosing?
                    </p>
                    <div className="flex gap-2">
                      <button 
                        className="text-[11px] px-3 py-1.5 rounded-md transition-all font-semibold"
                        style={{
                          backgroundColor: colors.accentPrimary,
                          color: '#FFFFFF',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.accentLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.accentPrimary)}
                      >
                        Show More
                      </button>
                      <button 
                        onClick={() => setShowNudge(false)}
                        className="text-[11px] px-3 py-1.5 rounded-md transition-all font-semibold"
                        style={{ 
                          color: colors.textMuted,
                          backgroundColor: colors.bgTertiary,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: colors.borderSecondary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.textPrimary;
                          e.currentTarget.style.borderColor = colors.borderPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.textMuted;
                          e.currentTarget.style.borderColor = colors.borderSecondary;
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response Feedback - Above Search Bar */}
            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-8 pb-2"
                >
                  <div 
                    className="flex items-start gap-2 rounded-lg px-3 py-2"
                    style={{
                      backgroundColor: `${colors.accentLight}15`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: `${colors.accentLight}40`,
                    }}
                  >
                    <Sparkles className="shrink-0 mt-0.5" style={{ color: colors.accentLight, fill: colors.accentLight }} size={14} strokeWidth={1.5} />
                    <p className="text-xs leading-relaxed" style={{ color: colors.textPrimary }}>{aiResponse}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sidebar Toggle Handle - Positioned at right edge */}
            <button
              onClick={() => {
                if (onSidebarToggle) {
                  onSidebarToggle(!isCollapsed);
                }
              }}
              className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 z-50 py-8 px-2 rounded-r-xl backdrop-blur-md shadow-lg transition-all hover:px-3 pointer-events-auto"
              style={{ 
                backgroundColor: colors.bgCard,
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: colors.borderPrimary,
                borderRightWidth: '1px',
                borderRightStyle: 'solid',
                borderRightColor: colors.borderPrimary,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: colors.borderPrimary,
              }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} style={{ color: colors.textMuted }} strokeWidth={1.5} />
              ) : (
                <ChevronLeft size={20} style={{ color: colors.textMuted }} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Assistant Search Bar - Fixed at Bottom-Left (Always Visible, No Sliding) */}
      <div
        className={clsx(
          "fixed bottom-0 pointer-events-auto",
          !isMobile && "left-0 w-[400px] z-40",
          isMobile && "left-0 right-0 w-full z-50"
        )}
      >
        <div 
          className="border-t"
          style={{
            borderColor: colors.borderPrimary,
            backgroundColor: colors.bgSecondary,
          }}
        >
          <form onSubmit={handleSearchSubmit} className="p-3">
            <div className="relative">
              {/* Autocomplete Suggestions */}
              {showSuggestions && (
                <SearchSuggestions
                  query={searchQuery}
                  selectedIntent={intent}
                  suggestions={suggestions}
                  selectedIndex={selectedSuggestionIndex}
                  onSelect={handleSuggestionSelect}
                  onHover={setSelectedSuggestionIndex}
                />
              )}

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                disabled={isProcessingQuery}
                className="w-full rounded-xl px-4 py-2.5 pr-12 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: colors.bgTertiary,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: colors.borderSecondary,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.accentLight;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentLight}20`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = colors.borderSecondary;
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onKeyDown={handleSearchKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              <button
                type="submit"
                disabled={isProcessingQuery || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{
                  backgroundColor: colors.accentPrimary,
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => !isProcessingQuery && searchQuery.trim() && (e.currentTarget.style.backgroundColor = colors.accentLight)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.accentPrimary)}
              >
                {isProcessingQuery ? (
                  <Loader2 size={16} className="animate-spin" strokeWidth={1.5} />
                ) : (
                  <Send size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Bottom Sheet - Only visible on mobile */}
      {isMobile && (
        <MobileBottomSheet
          isExpanded={isMobileExpanded}
          onToggle={() => setIsMobileExpanded(!isMobileExpanded)}
          intent={intent}
          displayResults={displayResults}
          previousResults={previousResults}
          previousBestMatch={previousBestMatch}
          isUpdating={isUpdating}
          updateType={updateType}
          selectedFacility={selectedFacility}
          activeCardId={activeCardId}
          onFocusMap={onFocusMap}
          onSetSelectedFacility={setSelectedFacility}
          onSetActiveCardId={setActiveCardId}
          onCategorySwitch={handleCategorySwitch}
          showNudge={showNudge}
          onDismissNudge={() => setShowNudge(false)}
          aiResponse={aiResponse}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </>
  );
};