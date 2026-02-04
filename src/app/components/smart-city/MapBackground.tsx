import { useRef, useState, useEffect } from 'react';
import { ViewState, IntentType } from './types';
import clsx from 'clsx';
import { UserLocation } from './locationService';
import { useTheme } from './ThemeContext';
import { BasemapType } from './BasemapSwitcher';
import L from 'leaflet';
import * as esri from 'esri-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapBackgroundProps {
  viewState: ViewState;
  selectedIntent: IntentType;
  focusedMarkerId: number | null;
  userLocation?: UserLocation | null;
  isLocationSet?: boolean;
  basemapType?: BasemapType;
}

// Abu Dhabi Center Coordinates
const ABU_DHABI_LON = 54.3773;
const ABU_DHABI_LAT = 24.4539;

// Facility locations in Abu Dhabi with specific facility types
// Expanded for demo purposes to showcase all facility-specific icons
const FACILITIES = [
  // Healthcare - Diagnostic Centers
  { id: 1, lon: 54.3700, lat: 24.4600, type: 'healthcare', facilityType: 'diagnostic', name: 'Sheikh Khalifa Medical City' },
  { id: 3, lon: 54.3950, lat: 24.4750, type: 'healthcare', facilityType: 'diagnostic', name: 'Advanced Diagnostic Center' },
  { id: 8, lon: 54.3550, lat: 24.4350, type: 'healthcare', facilityType: 'diagnostic', name: 'Al Noor Diagnostic Center' },
  { id: 15, lon: 54.4100, lat: 24.4200, type: 'healthcare', facilityType: 'diagnostic', name: 'Medical Imaging Center' },
  
  // Healthcare - Clinics
  { id: 4, lon: 54.3800, lat: 24.4700, type: 'healthcare', facilityType: 'clinic', name: 'Cleveland Clinic Abu Dhabi' },
  { id: 9, lon: 54.3900, lat: 24.4600, type: 'healthcare', facilityType: 'clinic', name: 'NMC Royal Hospital' },
  { id: 12, lon: 54.3650, lat: 24.4450, type: 'healthcare', facilityType: 'clinic', name: 'Family Health Clinic' },
  { id: 16, lon: 54.4050, lat: 24.4650, type: 'healthcare', facilityType: 'clinic', name: 'City Medical Clinic' },
  { id: 19, lon: 54.3450, lat: 24.4550, type: 'healthcare', facilityType: 'clinic', name: 'Express Care Clinic' },
  
  // Healthcare - Pharmacies
  { id: 5, lon: 54.3600, lat: 24.4500, type: 'healthcare', facilityType: 'pharmacy', name: 'Burjeel Medical City' },
  { id: 10, lon: 54.4200, lat: 24.4300, type: 'healthcare', facilityType: 'pharmacy', name: 'Life Pharmacy' },
  { id: 13, lon: 54.3750, lat: 24.4400, type: 'healthcare', facilityType: 'pharmacy', name: 'Al Manara Pharmacy' },
  { id: 17, lon: 54.3850, lat: 24.4800, type: 'healthcare', facilityType: 'pharmacy', name: 'Aster Pharmacy' },
  
  // Education - Public Schools
  { id: 2, lon: 54.4000, lat: 24.4400, type: 'education', facilityType: 'public', name: 'Tech High School' },
  { id: 6, lon: 54.5000, lat: 24.4000, type: 'education', facilityType: 'public', name: 'City Library' },
  { id: 11, lon: 54.3500, lat: 24.4650, type: 'education', facilityType: 'public', name: 'Science Academy' },
  { id: 18, lon: 54.4150, lat: 24.4500, type: 'education', facilityType: 'public', name: 'Al Ain Public School' },
  { id: 21, lon: 54.3350, lat: 24.4400, type: 'education', facilityType: 'public', name: 'Abu Dhabi School' },
  
  // Education - Private Schools
  { id: 7, lon: 54.3850, lat: 24.4250, type: 'education', facilityType: 'private', name: 'International School' },
  { id: 14, lon: 54.3600, lat: 24.4750, type: 'education', facilityType: 'private', name: 'Emirates Private School' },
  { id: 20, lon: 54.4300, lat: 24.4450, type: 'education', facilityType: 'private', name: 'British International School' },
  { id: 23, lon: 54.3450, lat: 24.4250, type: 'education', facilityType: 'private', name: 'GEMS Academy' },
  
  // Education - Nurseries
  { id: 22, lon: 54.3500, lat: 24.4800, type: 'education', facilityType: 'nursery', name: 'Primary School' },
  { id: 24, lon: 54.3950, lat: 24.4350, type: 'education', facilityType: 'nursery', name: 'Little Stars Nursery' },
  { id: 25, lon: 54.3700, lat: 24.4300, type: 'education', facilityType: 'nursery', name: 'Kids Garden Nursery' },
  { id: 26, lon: 54.4100, lat: 24.4550, type: 'education', facilityType: 'nursery', name: 'Happy Kids Early Learning' },
  
  // Education - Learning Centers (ABC)
  { id: 27, lon: 54.3800, lat: 24.4550, type: 'education', facilityType: 'learning-center', name: 'ABC Learning Center' },
  { id: 28, lon: 54.3650, lat: 24.4200, type: 'education', facilityType: 'learning-center', name: 'Smart Kids Academy' },
  { id: 29, lon: 54.4250, lat: 24.4600, type: 'education', facilityType: 'learning-center', name: 'Bright Minds Center' },
  { id: 30, lon: 54.3550, lat: 24.4700, type: 'education', facilityType: 'learning-center', name: 'Future Scholars Learning Hub' },
  { id: 31, lon: 54.4050, lat: 24.4350, type: 'education', facilityType: 'learning-center', name: 'Young Learners Institute' },
];

// Helper function to validate coordinates
const isValidCoordinate = (lat: any, lon: any): boolean => {
  return typeof lat === 'number' && 
         typeof lon === 'number' &&
         !isNaN(lat) && 
         !isNaN(lon) &&
         isFinite(lat) && 
         isFinite(lon) &&
         lat >= -90 && 
         lat <= 90 &&
         lon >= -180 && 
         lon <= 180;
};

// Helper function to get basemap service URL based on type (for esri-leaflet)
const getBasemapServiceUrl = (type: BasemapType = 'color'): string => {
  const basemapUrls: Record<BasemapType, string> = {
    'color': 'https://arcgis.sdi.abudhabi.ae/agshost/rest/services/Basemap/DGE_Color_Basemap_WM/MapServer',
    'light-grey': 'https://arcgis.sdi.abudhabi.ae/agshost/rest/services/Basemap/DGE_LightGrey_Basemap_WM/MapServer',
    'dark-grey': 'https://arcgis.sdi.abudhabi.ae/agshost/rest/services/Basemap/DGE_DarkGrey_Basemap_WM/MapServer',
    'imagery': 'https://arcgis.sdi.abudhabi.ae/agsimage/rest/services/Sat/IMG_SAT_50CM_WM/MapServer',
  };
  return basemapUrls[type];
};

export const MapBackground = ({ 
  viewState, 
  selectedIntent, 
  focusedMarkerId,
  userLocation,
  isLocationSet,
  basemapType
}: MapBackgroundProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const basemapLayerRef = useRef<L.TileLayer | null>(null);
  const osmLayerRef = useRef<L.TileLayer | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { theme } = useTheme();

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('Initializing map...');

    // Create map instance with standard Web Mercator (EPSG3857)
    const map = L.map(mapContainerRef.current, {
      center: [ABU_DHABI_LAT, ABU_DHABI_LON],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Add OpenStreetMap as initial fallback layer (will be replaced by basemap switcher effect)
    osmLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    console.log('✅ Map initialized with OSM fallback');

    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update basemap when basemapType changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    console.log(`Switching basemap to: ${basemapType || 'color'}`);

    // Remove old basemap layer if it exists
    if (basemapLayerRef.current) {
      map.removeLayer(basemapLayerRef.current);
      basemapLayerRef.current = null;
    }

    // Try using esri-leaflet's tiledMapLayer first (better for ArcGIS services)
    let layerLoaded = false;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Use esri-leaflet's tiledMapLayer for proper ArcGIS MapServer support
      const esriLayer = esri.tiledMapLayer({
        url: getBasemapServiceUrl(basemapType || 'color'),
        maxZoom: 19,
        attribution: '© Abu Dhabi DGE'
      }) as any;

      // Set a timeout to fallback to OSM if DGE tiles don't load within 3 seconds
      timeoutId = setTimeout(() => {
        if (!layerLoaded) {
          console.warn(`⚠️ ${basemapType || 'color'} basemap timeout, showing OSM fallback`);
          // Add OSM fallback if not already added
          if (osmLayerRef.current && !map.hasLayer(osmLayerRef.current)) {
            osmLayerRef.current.addTo(map);
          }
        }
      }, 3000);

      esriLayer.on('load', () => {
        console.log(`✅ ${basemapType || 'color'} basemap loaded successfully`);
        layerLoaded = true;
        if (timeoutId) clearTimeout(timeoutId);
        // Remove OSM fallback if it exists
        if (osmLayerRef.current && map.hasLayer(osmLayerRef.current)) {
          map.removeLayer(osmLayerRef.current);
        }
      });

      esriLayer.on('tileerror', () => {
        if (!layerLoaded) {
          console.warn(`⚠️ ${basemapType || 'color'} basemap failed to load, showing OSM fallback`);
          if (timeoutId) clearTimeout(timeoutId);
          // Add OSM fallback if not already added
          if (osmLayerRef.current && !map.hasLayer(osmLayerRef.current)) {
            osmLayerRef.current.addTo(map);
          }
        }
      });

      esriLayer.addTo(map);
      basemapLayerRef.current = esriLayer;

      // Mark as loaded after a short delay if no errors
      setTimeout(() => {
        if (!layerLoaded) {
          layerLoaded = true;
          if (timeoutId) clearTimeout(timeoutId);
          console.log(`✅ ${basemapType || 'color'} basemap assumed loaded (no errors)`);
          // Remove OSM fallback if it exists
          if (osmLayerRef.current && map.hasLayer(osmLayerRef.current)) {
            map.removeLayer(osmLayerRef.current);
          }
        }
      }, 1500);

    } catch (error) {
      console.error(`Error loading ${basemapType || 'color'} basemap:`, error);
      if (timeoutId) clearTimeout(timeoutId);
      // Fallback to OSM
      if (osmLayerRef.current && !map.hasLayer(osmLayerRef.current)) {
        osmLayerRef.current.addTo(map);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mapReady, basemapType]);

  // Create custom marker icons
  const createMarkerIcon = (type: string, facilityType: string, isFocused: boolean) => {
    const isHealthcare = type === 'healthcare';
    
    // Vibrant colors for each facility type - High contrast for visibility
    const facilityColors: Record<string, { bg: string, focused: string }> = {
      // Healthcare facilities - Vibrant blues and greens
      'diagnostic': { 
        bg: '#215A9E',      // DGE Primary Tech Blue
        focused: '#5A8FD6'  // Bright blue
      },
      'clinic': { 
        bg: '#2ECC71',      // Vibrant emerald green
        focused: '#58D68D'  // Bright green
      },
      'pharmacy': { 
        bg: '#E91E63',      // Vibrant pink/magenta
        focused: '#F06292'  // Bright pink
      },
      // Education facilities - Vibrant warm colors
      'public': { 
        bg: '#FF9800',      // Vibrant orange
        focused: '#FFB74D'  // Bright orange
      },
      'private': { 
        bg: '#9C27B0',      // Vibrant purple
        focused: '#BA68C8'  // Bright purple
      },
      'nursery': { 
        bg: '#F44336',      // Vibrant red/coral
        focused: '#EF5350'  // Bright red
      },
      'learning-center': { 
        bg: '#00BCD4',      // Vibrant cyan
        focused: '#4DD0E1'  // Bright cyan
      },
    };
    
    // Get color for this facility type, fallback to default if not found
    const colorScheme = facilityColors[facilityType] || {
      bg: isHealthcare ? '#215A9E' : '#7AA4C4',
      focused: isHealthcare ? '#5A8FD6' : '#A5C8E0'
    };
    
    const backgroundColor = isFocused ? colorScheme.focused : colorScheme.bg;
    
    const size = isFocused ? 48 : 42;
    const iconSize = isFocused ? 24 : 20;
    const strokeWidth = 1.5;
    
    // Healthcare facility specific icons
    const diagnosticIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m27.57 116.07v123.87h154.89l36.05-85.99c1.05-2.5 3.65-3.99 6.34-3.62 2.69.36 4.8 2.49 5.15 5.18l19.77 154.44 28.95-69.05c.93-2.23 3.11-3.68 5.53-3.68h40.37v12h-36.38l-36.05 85.99c-.94 2.25-3.14 3.68-5.53 3.68-.27 0-.54-.02-.81-.06-2.69-.36-4.8-2.49-5.14-5.18l-19.78-154.44-28.94 69.05c-.94 2.23-3.12 3.68-5.54 3.68h-158.88v121.15h331.04c12.18-23.8 36.94-40.13 65.46-40.13 6.59 0 12.98.88 19.06 2.52v-25.59h-108.83c-5.15 0-9.33-4.18-9.33-9.33v-184.49zm263.7 309.48-26.09-40.46h-59.66l-26.08 40.46zm172.84-43.87-50.69 57.49c-1.14 1.29-2.78 2.03-4.5 2.03-.04 0-.09 0-.13 0-1.77-.04-3.43-.86-4.54-2.24l-20.4-25.34c-2.08-2.58-1.67-6.36.91-8.44 2.58-2.07 6.36-1.67 8.44.92l15.93 19.79 45.98-52.15c2.19-2.48 5.99-2.72 8.47-.53 2.49 2.19 2.72 5.98.53 8.47zm-40.04-36.72c33.91 0 61.5 27.59 61.5 61.5s-27.59 61.5-61.5 61.5c-33.92 0-61.5-27.59-61.5-61.5s27.58-61.5 61.5-61.5z"/>
      </svg>
    `;
    
    const clinicIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M472.196,39.468c-52.654-52.625-138.301-52.625-190.955,0L169.915,150.794l126.394,126.394c26.014-21.663,58.995-35.227,95.412-35.227c20.888,0,40.765,4.339,58.851,12.087l21.624-23.624C524.835,177.784,524.835,92.123,472.196,39.468z"/>
        <path d="M275.27,298.577L148.7,172.008L39.742,281.073c-52.639,52.639-52.639,138.301,0,190.955c52.653,52.622,139.3,53.626,191.955,0.999l22.088-22.194c-7.748-18.086-12.087-37.963-12.087-58.851C241.699,356.5,254.599,324.291,275.27,298.577z"/>
        <path d="M271.703,391.983c0,61.144,45.893,111.045,105.015,118.504V273.478C317.596,280.937,271.703,330.836,271.703,391.983z"/>
        <path d="M406.722,273.478v237.009c59.122-7.459,105.015-57.36,105.015-118.505S465.845,280.937,406.722,273.478z"/>
      </svg>
    `;
    
    const pharmacyIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m12 1c-.6015 0-1.204.18081-1.7204.5423l-7.99999 5.6c-.80197.56139-1.27961 1.47876-1.27961 2.4577v10.4c0 1.6568 1.34315 3 3 3h4c.55228 0 1-.4477 1-1v-4c0-1.1046.89543-2 2-2h2c1.1046 0 2 .8954 2 2v4c0 .5523.4477 1 1 1h4c1.6569 0 3-1.3432 3-3v-10.4c0-.97894-.4776-1.89631-1.2796-2.4577l-8-5.6c-.5164-.36149-1.1189-.5423-1.7204-.5423zm.5 5c.2761 0 .5.22386.5.5v1.5h1.5c.2761 0 .5.22386.5.5v1c0 .27614-.2239.5-.5.5h-1.5v1.5c0 .2761-.2239.5-.5.5h-1c-.2761 0-.5-.2239-.5-.5v-1.5h-1.5c-.27614 0-.5-.22386-.5-.5v-1c0-.27614.22386-.5.5-.5h1.5v-1.5c0-.27614.2239-.5.5-.5z"/>
      </svg>
    `;
    
    // Education facility specific icons
    const publicSchoolIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 192 192" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m0 160h40v32h-40z"/>
        <path d="m152 160h40v32h-40z"/>
        <path d="m141 81.753-37-29.6v-20.153h28a4 4 0 0 0 4-4v-24a4 4 0 0 0 -4-4h-40a4 4 0 0 0 -4 4v48.155l-37 29.6a8 8 0 0 0 -3 6.245v104h32v-23.548c0-8.615 6.621-16.029 15.227-16.434a16 16 0 0 1 16.773 15.982v24h32v-104a8 8 0 0 0 -3-6.247zm-45 38.247a16 16 0 1 1 16-16 16 16 0 0 1 -16 16z"/>
        <path d="m184 112h-32v40h40v-32a8 8 0 0 0 -8-8z"/>
        <path d="m0 120v32h40v-40h-32a8 8 0 0 0 -8 8z"/>
      </svg>
    `;
    
    const privateSchoolIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m75.1402588 10h-50.2805176v6.0795898h-14.8597412v73.9204102h32.4678345v-23.7133789h15.0643311v23.7133789h32.4678344v-73.9204102h-14.8597412zm-41.5610352 69.331665h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm24.1439209 20.2851563h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm23.7619019 41.0501709h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-33.3303223v13.045166h-15.06427v-13.045166z"/>
      </svg>
    `;
    
    const nurseryIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m75.1402588 10h-50.2805176v6.0795898h-14.8597412v73.9204102h32.4678345v-23.7133789h15.0643311v23.7133789h32.4678344v-73.9204102h-14.8597412zm-41.5610352 69.331665h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm24.1439209 20.2851563h-15.06427v-13.045044h15.06427zm0-20.2851563h-15.06427v-13.045166h15.06427zm23.7619019 41.0501709h-15.06427v-13.0450439h15.06427zm0-20.7650146h-15.06427v-13.045044h15.06427zm0-33.3303223v13.045166h-15.06427v-13.045166z"/>
      </svg>
    `;
    
    // ABC Learning Center icon for education
    const learningCenterIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="m165.976 241h161c22.091 0 40-17.909 40-40v-161c0-22.091-17.909-40-40-40h-161c-22.091 0-40 17.909-40 40v161c0 22.091 17.909 40 40 40zm19.111-65.839 45.06-118.31c.043-.114.088-.228.134-.341 2.733-6.681 9.164-11.003 16.383-11.01h.018c7.212 0 13.643 4.307 16.387 10.978.056.136.11.273.162.411l44.65 118.315c2.925 7.751-.987 16.405-8.737 19.33-1.744.658-3.534.97-5.294.97-6.062 0-11.77-3.701-14.036-9.708l-7.458-19.762h-51.691l-7.543 19.804c-2.949 7.742-11.615 11.627-19.356 8.679-7.742-2.948-11.627-11.614-8.679-19.356z"/>
        <path d="m246.629 97.863-14.538 38.172h28.943z"/>
        <path d="m124.822 401.757s-23.569.018-25.945.027v34.653c9.635-.038 21.187-.08 25.945-.08 9.54 0 17.3-7.761 17.3-17.3s-7.76-17.3-17.3-17.3z"/>
        <path d="m201 271h-161c-22.091 0-40 17.909-40 40v161c0 22.091 17.909 40 40 40h161c22.091 0 40-17.909 40-40v-161c0-22.091-17.909-40-40-40zm-76.178 195.357c-8.713 0-40.558.141-40.878.143-.022 0-.044 0-.066 0-3.966 0-7.771-1.571-10.583-4.37-2.828-2.815-4.417-6.641-4.417-10.63v-120c0-8.284 6.716-15 15-15h34.857c23.496 0 42.612 19.116 42.612 42.612 0 8.528-2.528 16.472-6.859 23.141 10.745 8.678 17.635 21.948 17.635 36.804 0 26.082-21.219 47.3-47.301 47.3z"/>
        <path d="m131.347 359.112c0-6.955-5.658-12.612-12.612-12.612h-19.858v25.257s17.251-.033 19.857-.033c6.955 0 12.613-5.658 12.613-12.612z"/>
        <path d="m472 271h-161c-22.091 0-40 17.909-40 40v161c0 22.091 17.909 40 40 40h161c22.091 0 40-17.909 40-40v-161c0-22.091-17.909-40-40-40zm-20.107 173.201c-1.975 2.355-4.124 4.571-6.386 6.586-11.541 10.28-26.378 15.713-42.907 15.713-41.355 0-75-33.645-75-75s33.645-75 75-75c15.027 0 29.531 4.432 41.944 12.817 6.865 4.638 8.67 13.962 4.033 20.827-4.638 6.864-13.962 8.67-20.827 4.033-7.434-5.022-16.13-7.677-25.15-7.677-24.813 0-45 20.187-45 45s20.187 45 45 45c9.185 0 16.908-2.73 22.953-8.115 1.181-1.052 2.309-2.216 3.354-3.462 5.324-6.348 14.784-7.178 21.132-1.854 6.347 5.323 7.177 14.784 1.854 21.132z"/>
      </svg>
    `;
    
    // GraduationCap icon for education (default)
    const graduationCapIcon = `
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
        <path d="M22 10v6"/>
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
      </svg>
    `;
    
    // Select the appropriate icon based on facility type
    let iconSvg = graduationCapIcon;
    if (isHealthcare) {
      if (facilityType === 'diagnostic') {
        iconSvg = diagnosticIcon;
      } else if (facilityType === 'clinic') {
        iconSvg = clinicIcon;
      } else if (facilityType === 'pharmacy') {
        iconSvg = pharmacyIcon;
      }
    } else if (type === 'education') {
      if (facilityType === 'public') {
        iconSvg = publicSchoolIcon;
      } else if (facilityType === 'private') {
        iconSvg = privateSchoolIcon;
      } else if (facilityType === 'nursery') {
        iconSvg = nurseryIcon;
      } else if (facilityType === 'learning-center') {
        iconSvg = learningCenterIcon;
      }
    }
    
    // Optional subtle glow for focused state
    const shadowStyle = isFocused 
      ? `0 4px 16px ${backgroundColor}80, 0 0 0 4px ${backgroundColor}30` 
      : `0 3px 10px rgba(0, 0, 0, 0.3)`;
    
    return L.divIcon({
      className: 'semantic-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${backgroundColor};
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: ${shadowStyle};
          transform: scale(${isFocused ? 1.15 : 1});
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        ">
          ${iconSvg}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const createUserMarkerIcon = () => {
    return L.divIcon({
      className: 'user-marker',
      html: `
        <div style="
          width: 18px;
          height: 18px;
          background-color: #00ffff;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 12px rgba(0,255,255,0.6);
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  // Update markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add facility markers
    FACILITIES.forEach(facility => {
      // Skip if intent is selected and doesn't match
      if (selectedIntent && facility.type !== selectedIntent) return;

      const isFocused = focusedMarkerId === facility.id;
      const icon = createMarkerIcon(facility.type, facility.facilityType, isFocused);
      
      const marker = L.marker([facility.lat, facility.lon], { icon })
        .addTo(map);

      // Add tooltip for focused marker
      if (isFocused) {
        marker.bindTooltip(facility.name, {
          permanent: true,
          direction: 'top',
          className: 'custom-tooltip',
          offset: [0, -12]
        }).openTooltip();
      }

      markersRef.current.set(facility.id, marker);
    });

    // Add user location marker - validate coordinates
    if (userLocation && isLocationSet && 
        !isNaN(userLocation.lat) && !isNaN(userLocation.lon) &&
        typeof userLocation.lat === 'number' && typeof userLocation.lon === 'number') {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = createUserMarkerIcon();
      const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
        .addTo(map);
      
      userMarkerRef.current = userMarker;
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [mapReady, selectedIntent, focusedMarkerId, userLocation, isLocationSet, theme]);

  // Update camera position
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    
    // Ensure map is properly initialized
    if (!map.getCenter()) {
      console.warn('Map not fully initialized yet, skipping flyTo');
      return;
    }
    
    // Always start with safe defaults
    let targetLat: number = ABU_DHABI_LAT;
    let targetLon: number = ABU_DHABI_LON;
    let targetZoom: number = 11;

    if (viewState === 'home') {
      // Use Abu Dhabi center for home view
      targetLat = ABU_DHABI_LAT;
      targetLon = ABU_DHABI_LON;
      targetZoom = 11;
    } else if (focusedMarkerId !== null) {
      // Focus on specific facility
      const facility = FACILITIES.find(f => f.id === focusedMarkerId);
      if (facility) {
        // Explicitly convert to numbers to prevent any type issues
        const facLat = Number(facility.lat);
        const facLon = Number(facility.lon);
        
        if (isValidCoordinate(facLat, facLon)) {
          targetLat = facLat;
          targetLon = facLon;
          targetZoom = 15;
        } else {
          console.warn('Invalid facility coordinates:', facility);
        }
      }
    } else if (viewState === 'results' && userLocation && isLocationSet) {
      // Results view - center on user location if valid
      const userLat = Number(userLocation.lat);
      const userLon = Number(userLocation.lon);
      
      if (isValidCoordinate(userLat, userLon)) {
        targetLat = userLat;
        targetLon = userLon;
        targetZoom = 13;
      } else {
        console.warn('Invalid user location in results view:', userLocation);
      }
    } else if (userLocation && isLocationSet) {
      // User location set but not in results view
      const userLat = Number(userLocation.lat);
      const userLon = Number(userLocation.lon);
      
      if (isValidCoordinate(userLat, userLon)) {
        targetLat = userLat;
        targetLon = userLon;
        targetZoom = 12;
      } else {
        console.warn('Invalid user location:', userLocation);
      }
    }

    // Final safety check before flying
    if (!isValidCoordinate(targetLat, targetLon)) {
      console.error('ABORTING: Invalid target coordinates after all logic', { targetLat, targetLon });
      return;
    }
      
    // Attempt to fly to the target with additional validation
    try {
      // Ensure map is still valid
      if (!map || !map.getCenter) {
        console.warn('Map instance is invalid, skipping flyTo');
        return;
      }

      // Ensure we have clean numbers - use parseFloat for extra safety
      const cleanLat = parseFloat(String(targetLat));
      const cleanLon = parseFloat(String(targetLon));
      const cleanZoom = parseInt(String(targetZoom), 10);
      
      // Log for debugging
      console.log('Attempting flyTo with:', { cleanLat, cleanLon, cleanZoom, targetLat, targetLon });
      
      // Verify the cleaned values are valid
      if (!isValidCoordinate(cleanLat, cleanLon)) {
        console.error('Cleaned coordinates are invalid:', { cleanLat, cleanLon, targetLat, targetLon });
        return;
      }
      
      // Double-check the values are finite numbers before passing to Leaflet
      if (!Number.isFinite(cleanLat) || !Number.isFinite(cleanLon)) {
        console.error('Coordinates are not finite:', { cleanLat, cleanLon });
        return;
      }
      
      // Triple check - ensure zoom is valid
      if (!Number.isFinite(cleanZoom) || cleanZoom < 1 || cleanZoom > 20) {
        console.error('Invalid zoom level:', cleanZoom);
        return;
      }
      
      // Create coordinate array explicitly
      const coords: [number, number] = [cleanLat, cleanLon];
      
      // Final validation of the array
      if (!Array.isArray(coords) || coords.length !== 2 || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
        console.error('Coordinate array is invalid:', coords);
        return;
      }
      
      // Use setView instead of flyTo - more reliable
      map.setView(coords, cleanZoom);
      
      console.log('Successfully set view to:', coords, cleanZoom);
    } catch (error) {
      console.error('Error during map setView:', error, { targetLat, targetLon });
      // Last resort: try with default Abu Dhabi coordinates
      try {
        console.log('Attempting fallback to Abu Dhabi center');
        map.setView([ABU_DHABI_LAT, ABU_DHABI_LON], 11);
      } catch (fallbackError) {
        console.error('Fallback setView also failed:', fallbackError);
      }
    }
  }, [viewState, focusedMarkerId, userLocation, isLocationSet, mapReady]);

  // Handle processing state
  useEffect(() => {
    setIsProcessing(viewState === 'analyzing');
  }, [viewState]);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#e2e8f0' }}>
      {/* Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full absolute top-0 left-0"
        style={{ zIndex: 1 }}
      />

      {/* Visual Feedback During Analysis */}
      <div 
        className={clsx(
          'absolute inset-0 pointer-events-none transition-all duration-500',
          isProcessing ? 'backdrop-blur-[2px] bg-black/40' : 'backdrop-blur-0 bg-transparent'
        )}
        style={{ zIndex: 10 }}
      />
      
      {/* Overlay Grid Effect */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(33,90,158,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(33,90,158,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" 
        style={{ 
          opacity: theme === 'dark' ? 0.3 : 0.15,
          zIndex: 20 
        }}
      />
      
      {/* Vignette Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle at center, transparent 0%, rgba(15,23,42,0.6) 100%)'
            : 'radial-gradient(circle at center, transparent 0%, rgba(226,232,240,0.4) 100%)',
          zIndex: 20
        }}
      />

      {/* Loading State */}
      {!mapReady && (
        <div 
          className="absolute inset-0 flex items-center justify-center" 
          style={{ 
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            zIndex: 30 
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ 
              borderColor: '#215A9E',
              borderTopColor: 'transparent' 
            }} />
            <p className="text-lg font-semibold mb-2" style={{ color: '#215A9E' }}>
              Loading Map
            </p>
            <p className="text-sm" style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
              Initializing Abu Dhabi Smart City Map...
            </p>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        .leaflet-container {
          background: ${theme === 'dark' ? '#0f172a' : '#e2e8f0'};
          font-family: 'Noto Kufi Arabic', sans-serif;
        }

        .leaflet-control-zoom {
          margin-top: 80px !important;
          margin-left: 16px !important;
          border: none !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
        }

        .leaflet-control-zoom a {
          background-color: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'} !important;
          color: #215A9E !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(33, 90, 158, 0.4)' : 'rgba(33, 90, 158, 0.2)'} !important;
          backdrop-filter: blur(12px);
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          font-weight: bold !important;
          transition: all 0.2s ease !important;
        }

        .leaflet-control-zoom a:first-child {
          border-top-left-radius: 8px !important;
          border-top-right-radius: 8px !important;
        }

        .leaflet-control-zoom a:last-child {
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }

        .leaflet-control-zoom a:hover {
          background-color: ${theme === 'dark' ? 'rgba(33, 90, 158, 0.3)' : 'rgba(122, 164, 196, 0.15)'} !important;
          border-color: #7AA4C4 !important;
          color: #7AA4C4 !important;
          transform: translateY(-1px);
        }

        .leaflet-control-attribution {
          display: none !important;
        }

        .semantic-marker {
          background: transparent;
          border: none;
        }

        .user-marker {
          background: transparent;
          border: none;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        .custom-tooltip {
          background-color: ${theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'} !important;
          color: ${theme === 'dark' ? 'white' : 'black'} !important;
          border: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} !important;
          border-radius: 6px !important;
          padding: 6px 10px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
          font-family: 'Noto Kufi Arabic', sans-serif !important;
        }

        .custom-tooltip:before {
          border-top-color: ${theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'} !important;
        }

        .leaflet-tile-pane {
          filter: ${theme === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'brightness(1) contrast(1)'};
        }
      `}</style>
    </div>
  );
};