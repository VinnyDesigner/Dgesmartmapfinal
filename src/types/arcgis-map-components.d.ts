// TypeScript declarations for ArcGIS Maps SDK Web Components
declare namespace JSX {
  interface IntrinsicElements {
    'arcgis-scene': ArcGISSceneAttributes;
    'arcgis-map': ArcGISMapAttributes;
    'arcgis-zoom': ArcGISZoomAttributes;
    'arcgis-basemap-gallery': ArcGISBasemapGalleryAttributes;
    'arcgis-legend': ArcGISLegendAttributes;
    'arcgis-search': ArcGISSearchAttributes;
    'arcgis-placement': ArcGISPlacementAttributes;
  }

  interface ArcGISSceneAttributes extends React.HTMLAttributes<HTMLElement> {
    basemap?: string;
    'camera-position'?: string;
    'camera-tilt'?: string;
    'camera-heading'?: string;
    'item-id'?: string;
    ref?: React.Ref<any>;
    onArcgisViewReadyChange?: (event: CustomEvent<boolean>) => void;
  }

  interface ArcGISMapAttributes extends React.HTMLAttributes<HTMLElement> {
    basemap?: string;
    center?: string;
    zoom?: string;
    'item-id'?: string;
    ref?: React.Ref<any>;
    onArcgisViewReadyChange?: (event: CustomEvent<boolean>) => void;
  }

  interface ArcGISZoomAttributes extends React.HTMLAttributes<HTMLElement> {
    slot?: string;
    position?: string;
  }

  interface ArcGISBasemapGalleryAttributes extends React.HTMLAttributes<HTMLElement> {
    slot?: string;
    position?: string;
  }

  interface ArcGISLegendAttributes extends React.HTMLAttributes<HTMLElement> {
    slot?: string;
    position?: string;
  }

  interface ArcGISSearchAttributes extends React.HTMLAttributes<HTMLElement> {
    slot?: string;
    position?: string;
  }

  interface ArcGISPlacementAttributes extends React.HTMLAttributes<HTMLElement> {
    position?: string;
  }
}