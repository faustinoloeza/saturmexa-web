export interface Route {
  id: string;
  name: string;
  length: string;
  coordinates: [number, number][];
}

export interface RouteLine {
  key: string;
  positions: [number, number][];
  color: string;
  name: string;
}

export interface ColorMap {
  [id: string]: string;
}
