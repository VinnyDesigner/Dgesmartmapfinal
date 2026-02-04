// TypeScript declarations for @arcgis/core modules
declare module '@arcgis/core/layers/GraphicsLayer.js' {
  export default class GraphicsLayer {
    constructor(properties?: any);
    id?: string;
    elevationInfo?: any;
    add(graphic: any): void;
    remove(graphic: any): void;
    removeAll(): void;
  }
}

declare module '@arcgis/core/Graphic.js' {
  export default class Graphic {
    constructor(properties?: any);
    geometry?: any;
    symbol?: any;
    attributes?: any;
  }
}

declare module '@arcgis/core/geometry/Point.js' {
  export default class Point {
    constructor(properties?: any);
    longitude?: number;
    latitude?: number;
    z?: number;
  }
}

declare module '@arcgis/core/symbols/SimpleMarkerSymbol.js' {
  export default class SimpleMarkerSymbol {
    constructor(properties?: any);
    color?: number[];
    size?: number;
    outline?: any;
    style?: string;
  }
}

declare module '@arcgis/core/symbols/TextSymbol.js' {
  export default class TextSymbol {
    constructor(properties?: any);
    text?: string;
    color?: number[];
    haloColor?: number[];
    haloSize?: number;
    font?: any;
    xoffset?: number;
    yoffset?: number;
  }
}

declare module '@arcgis/core/Camera.js' {
  export default class Camera {
    constructor(properties?: any);
    position?: any;
    heading?: number;
    tilt?: number;
  }
}

declare module '@arcgis/core/core/promiseUtils.js' {
  export function eachAlways<T>(promises: Promise<T>[]): Promise<any>;
  export function create<T>(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void): Promise<T>;
}
