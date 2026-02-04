import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapBackground } from "./MapBackground";
import { IntentSelection } from "./IntentSelection";
import { ResultsPanel } from "./ResultsPanel";
import { ContextualQuestions } from "./ContextualQuestions";
import { ManualLocationInput } from "./ManualLocationInput";
import { LocationDisplay } from "./LocationDisplay";
import { FilterPanel, FilterSettings } from "./FilterPanel";
import { ThemeToggle } from "./ThemeToggle";
import { TopNavigationBar } from "./TopNavigationBar";
import { BasemapSwitcher, BasemapType } from "./BasemapSwitcher";
import { useTheme } from "./ThemeContext";
import { ViewState, IntentType } from "./types";
import { Locate, RotateCcw, X, MapPin, SlidersHorizontal } from "lucide-react";
import darkLogo from "figma:asset/18062b75f340b7f6e86c9e6954ee2c84c9df4dd8.png";
import lightLogo from "figma:asset/464972123d1bf51b7378051d8a1102ed37d567ee.png";
import { getUserLocation, UserLocation, LocationStatus } from "./locationService";

export const SmartCityInterface = () => {
  const { theme, colors } = useTheme();
  const [viewState, setViewState] = useState<ViewState>("home");
  const [selectedIntent, setSelectedIntent] = useState<IntentType>(null);
  const [userPreferences, setUserPreferences] = useState<Record<string, string>>({});
  const [focusedMarkerId, setFocusedMarkerId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showLocationConfirmation, setShowLocationConfirmation] = useState(false);
  const [isLocationSet, setIsLocationSet] = useState(false); // Gate control
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterSettings | null>(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false); // Alert for location requirement
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state
  const [basemapType, setBasemapType] = useState<BasemapType>('color');

  // Detect user location on mount
  useEffect(() => {
    // Show location prompt immediately
    setShowLocationPrompt(true);
  }, []);

  const handleUseCurrentLocation = async () => {
    setLocationStatus('detecting');
    setShowLocationPrompt(false);
    
    const result = await getUserLocation();
    
    setLocationStatus(result.status);
    
    if (result.location) {
      // Validate coordinates before setting
      const lat = result.location.lat;
      const lon = result.location.lon;
      
      if (typeof lat === 'number' && typeof lon === 'number' &&
          !isNaN(lat) && !isNaN(lon) &&
          isFinite(lat) && isFinite(lon) &&
          lat >= -90 && lat <= 90 &&
          lon >= -180 && lon <= 180) {
        setUserLocation(result.location);
        setIsLocationSet(true); // Enable the app
        setShowLocationConfirmation(true);
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowLocationConfirmation(false);
        }, 3000);
      } else {
        console.error('Invalid coordinates received from getUserLocation:', { lat, lon });
        setLocationStatus('error');
        setShowManualInput(true);
      }
    } else if (result.status === 'denied' || result.status === 'error') {
      // Automatically prompt manual entry if GPS fails
      setShowManualInput(true);
    }
  };

  const handleManualLocationSelect = (location: { lat: number; lon: number; name: string }) => {
    // Validate coordinates before setting
    const lat = location.lat;
    const lon = location.lon;
    
    if (typeof lat === 'number' && typeof lon === 'number' &&
        !isNaN(lat) && !isNaN(lon) &&
        isFinite(lat) && isFinite(lon) &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180) {
      setUserLocation({
        lat: location.lat,
        lon: location.lon,
        timestamp: Date.now(),
        name: location.name,
        isManual: true,
      });
      setLocationStatus('success');
      setIsLocationSet(true); // Enable the app
      setShowManualInput(false);
      setShowLocationConfirmation(true);
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setShowLocationConfirmation(false);
      }, 3000);
    } else {
      console.error('Invalid coordinates provided for manual location:', { lat, lon });
    }
  };

  const handleChangeLocation = () => {
    setShowManualInput(true);
  };

  const handleIntentSelect = (intent: IntentType) => {
    // Show alert if location is not set
    if (!isLocationSet) {
      setShowLocationAlert(true);
      // Auto-hide alert after 4 seconds
      setTimeout(() => {
        setShowLocationAlert(false);
      }, 4000);
      return;
    }
    setSelectedIntent(intent);
    setViewState("questions");
  };

  const handleQuestionsSubmit = (prefs: Record<string, string>) => {
    setUserPreferences(prefs);
    setViewState("analyzing");
    // Simulate AI processing
    setTimeout(() => {
      setViewState("results");
    }, 1500);
  };

  const handleReset = () => {
    setViewState("home");
    setSelectedIntent(null);
    setUserPreferences({});
    setFocusedMarkerId(null);
  };

  const handleFocusMap = (id: number) => {
    setFocusedMarkerId(id);
  };

  const handleRefinement = (query: string, newIntent?: IntentType) => {
    // If intent changes, update it
    if (newIntent && newIntent !== selectedIntent) {
      setSelectedIntent(newIntent);
    }
    // Keep view state as results to maintain panel visibility
    setViewState("results");
  };

  const handleApplyFilters = (filters: FilterSettings) => {
    setActiveFilters(filters);
    // Simulate re-analyzing with new filters
    setViewState("analyzing");
    setTimeout(() => {
      setViewState("results");
    }, 1000);
  };

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* Sidebar Column - Desktop Only, part of layout flow */}
      {viewState === "results" && (
        <div 
          className="hidden md:block flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ 
            width: isCollapsed ? '0px' : '400px',
          }}
        >
          <ResultsPanel 
            intent={selectedIntent} 
            onFocusMap={handleFocusMap}
            onRefinement={handleRefinement}
            onApplyFilters={handleApplyFilters}
            activeFilters={activeFilters}
            onSidebarToggle={(collapsed) => {
              setIsCollapsed(collapsed);
            }}
            isCollapsed={isCollapsed}
          />
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavigationBar 
          locationName={userLocation?.name}
          onChangeLocation={handleChangeLocation}
        />

        {/* Map and Content Container */}
        <div className="flex-1 relative">
          {/* Background Map Layer - Always Interactive */}
          <div className="absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
            <MapBackground 
              viewState={viewState} 
              selectedIntent={selectedIntent} 
              focusedMarkerId={focusedMarkerId}
              userLocation={userLocation}
              isLocationSet={isLocationSet}
              basemapType={basemapType}
            />
          </div>

          {/* Location Gate Overlay - Dims map when location not set */}
          <AnimatePresence>
            {!isLocationSet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-5 backdrop-blur-sm pointer-events-none"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(10, 25, 41, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Location Gate Message - Centered */}
          <AnimatePresence>
            {!isLocationSet && !showLocationPrompt && !showManualInput && locationStatus !== 'detecting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              >
                <div 
                  className="backdrop-blur-xl rounded-2xl shadow-2xl px-8 py-8 max-w-md pointer-events-auto"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: colors.borderPrimary,
                  }}
                >
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${colors.accentLight}15`,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: `${colors.accentLight}50`,
                      }}
                    >
                      <MapPin size={32} style={{ color: colors.accentLight }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2" style={{ color: colors.textPrimary }}>
                        I need your location to find services near you.
                      </h3>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        This helps me recommend the best options based on distance and availability.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: `${colors.accentLight}20`,
                          color: colors.accentLight,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: `${colors.accentLight}50`,
                        }}
                      >
                        Use Current Location
                      </button>
                      <button
                        onClick={() => {
                          setShowManualInput(true);
                        }}
                        className="w-full px-6 py-3 rounded-xl text-sm transition-colors"
                        style={{
                          color: colors.textSecondary,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: colors.borderSecondary,
                        }}
                      >
                        Enter Location Manually
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Buttons */}
          <AnimatePresence>
            {viewState === "results" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed right-4 bottom-[35vh] z-40 flex flex-col gap-3 pointer-events-auto"
              >
                {/* Basemap Switcher */}
                <BasemapSwitcher 
                  selectedBasemap={basemapType}
                  onBasemapChange={setBasemapType}
                />
                
                <button
                  onClick={() => setFocusedMarkerId(null)}
                  className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: colors.borderPrimary,
                    color: colors.textMuted,
                  }}
                  title="Locate Me"
                >
                  <Locate size={20} />
                </button>
                <button
                  onClick={handleReset}
                  className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
                  style={{
                    backgroundColor: colors.bgCard,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: colors.borderPrimary,
                    color: colors.textMuted,
                  }}
                  title="Reset View"
                >
                  <RotateCcw size={20} />
                </button>
                {focusedMarkerId && (
                  <button
                    onClick={() => setFocusedMarkerId(null)}
                    className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg"
                    style={{
                      backgroundColor: `${colors.accentLight}20`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: colors.accentLight,
                      color: colors.accentLight,
                    }}
                    title="Clear Route"
                  >
                    <X size={20} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Interface Layer */}
          <div className="relative z-10 w-full h-full pointer-events-none">
            <div className="w-full h-full flex flex-col justify-between p-6 md:p-12">
              
              {/* Location Prompt */}
              <AnimatePresence>
                {showLocationPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                  >
                    <div 
                      className="backdrop-blur-xl rounded-2xl shadow-lg px-6 py-5 min-w-[380px]"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colors.borderPrimary,
                      }}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <MapPin size={20} style={{ color: colors.accentLight }} />
                          <p className="text-sm" style={{ color: colors.textPrimary }}>
                            Allow location access to find services near you.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleUseCurrentLocation}
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: `${colors.accentLight}20`,
                              color: colors.accentLight,
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: `${colors.accentLight}50`,
                            }}
                          >
                            Use Current Location
                          </button>
                          <button
                            onClick={() => {
                              setShowLocationPrompt(false);
                              setShowManualInput(true);
                            }}
                            className="flex-1 px-4 py-2.5 rounded-lg text-sm transition-colors"
                            style={{
                              color: colors.textSecondary,
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: colors.borderSecondary,
                            }}
                          >
                            Enter Manually
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Detecting Location Loader */}
              <AnimatePresence>
                {locationStatus === 'detecting' && !showLocationPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                  >
                    <div 
                      className="backdrop-blur-xl rounded-2xl shadow-lg px-6 py-4 min-w-[320px]"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colors.borderPrimary,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full animate-spin"
                          style={{
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            borderColor: `${colors.accentLight}30`,
                            borderTopColor: colors.accentLight,
                          }}
                        />
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          Detecting your location to find nearby services…
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Manual Location Input */}
              <AnimatePresence>
                {showManualInput && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50"
                  >
                    <ManualLocationInput 
                      onLocationSelect={handleManualLocationSelect}
                      onCancel={() => {
                        setShowManualInput(false);
                        setShowLocationPrompt(true);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location Required Alert */}
              <AnimatePresence>
                {showLocationAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                  >
                    <div 
                      className="backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-4 min-w-[360px] max-w-md"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: '#DC2626', // Red alert color
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: '#DC262615',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: '#DC2626',
                          }}
                        >
                          <MapPin size={20} style={{ color: '#DC2626' }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-1" style={{ color: colors.textPrimary }}>
                            Location Required
                          </p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            Please set your location first to find services near you.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowLocationAlert(false)}
                          className="flex-shrink-0 transition-colors"
                          style={{ color: colors.textMuted }}
                          aria-label="Close alert"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location Confirmation */}
              <AnimatePresence>
                {showLocationConfirmation && userLocation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                  >
                    <div 
                      className="backdrop-blur-xl rounded-2xl shadow-lg px-6 py-4 min-w-[320px]"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colors.borderAccent,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${colors.accentLight}20`,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: colors.accentLight,
                          }}
                        >
                          <MapPin size={12} style={{ color: colors.accentLight }} />
                        </div>
                        <p className="text-sm" style={{ color: colors.textPrimary }}>
                          Got it. I'll show options near <span className="font-semibold">{userLocation.name || 'your location'}</span>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Content Area */}
              <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full pointer-events-none">
                <AnimatePresence mode="wait">
                  {viewState === "home" && (
                    <IntentSelection key="home" onSelect={handleIntentSelect} />
                  )}
                  
                  {viewState === "questions" && (
                    <ContextualQuestions key="questions" intent={selectedIntent} onSubmit={handleQuestionsSubmit} />
                  )}
                  
                  {viewState === "analyzing" && (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="flex flex-col items-center justify-center gap-4 p-8 rounded-3xl backdrop-blur-xl pointer-events-auto"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: colors.borderPrimary,
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-full animate-spin"
                        style={{
                          borderWidth: '4px',
                          borderStyle: 'solid',
                          borderColor: `${colors.accentLight}20`,
                          borderTopColor: colors.accentLight,
                        }}
                      />
                      <p className="text-lg font-light" style={{ color: colors.textPrimary }}>
                        Analyzing optimal routes and facility status...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              {/* Filter Button - Bottom Left, offset for sidebar */}
              <AnimatePresence>
                {viewState === "results" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="fixed bottom-3 z-50 pointer-events-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      left: isCollapsed ? '20px' : '420px',
                    }}
                  >
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl transition-all"
                      style={{
                        backgroundColor: showFilters ? colors.accentPrimary : colors.bgCard,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: showFilters ? colors.accentPrimary : colors.borderPrimary,
                        color: showFilters ? '#FFFFFF' : colors.textPrimary,
                      }}
                    >
                      <SlidersHorizontal size={20} strokeWidth={1.5} />
                      <span className="font-semibold text-sm">Filters</span>
                      {activeFilters && (activeFilters.facilityTypes.length > 0 || activeFilters.distance !== 10) && (
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.accentLight }} />
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filter Panel - Bottom Left above button, offset for sidebar */}
              <AnimatePresence>
                {showFilters && viewState === "results" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      left: isCollapsed ? '20px' : '420px',
                    }}
                  >
                    <FilterPanel
                      selectedIntent={selectedIntent}
                      onApplyFilters={handleApplyFilters}
                      onClose={() => setShowFilters(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};