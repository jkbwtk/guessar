import { CRS, Icon, LatLngBoundsExpression, LatLngExpression, Map, Marker, Polyline, TileLayer } from 'leaflet';
import { RasterCoords } from './components/RasterCoords';


export class LeafletFactory {
  public static imageSize: [number, number] = [16384, 16384];
  public static mapSize: [number, number] = [6000, 6000];

  public static pickMarker = (opacity: number): Marker => new Marker([0, 0], {
    icon: new Icon({
      iconUrl: '/public/img/mapMarker.svg',
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
    }),
    opacity,
  });

  public static targetMarker = (opacity: number): Marker => new Marker([0, 0], {
    icon: new Icon({
      iconUrl: '/public/img/flag.svg',
      iconSize: [25, 25],
      iconAnchor: [3.125, 25],
    }),
    opacity,
  });

  public static positionMarker = (opacity: number): Marker => new Marker([0, 0], {
    icon: new Icon({
      iconUrl: '/public/img/radarCentre.svg',
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
    }),
    opacity,
  });

  public static baseLayer = (coords: RasterCoords): TileLayer => new TileLayer('/public/img/tiles/satelite_hq/0/0/0.webp', {
    noWrap: true,
    bounds: coords.getMaxBounds(),
    maxNativeZoom: 0,
    minNativeZoom: 0,
    maxZoom: coords.zoomLevel(),
    tileSize: 256,
    keepBuffer: 4,
  });

  public static activeLayer = (coords: RasterCoords): TileLayer => new TileLayer('/public/img/tiles/satelite_hq/{z}/{x}/{y}.webp', {
    noWrap: true,
    bounds: coords.getMaxBounds(),
    maxNativeZoom: coords.zoomLevelReal(),
    minNativeZoom: 0,
    maxZoom: coords.zoomLevel() * 8,
    tileSize: 256,
    keepBuffer: 4,
  });

  public static map = (element: string | HTMLElement): Map => new Map(element, {
    crs: CRS.Simple,
    zoomSnap: 0.25,
    attributionControl: false,
    zoom: 0,
  });

  public static polyLine = (latlngs: LatLngExpression[] = []): Polyline => new Polyline(latlngs, {
    weight: 4,
    dashArray: [4, 12],
    color: '#c60000',
  });

  public static mapBounds = (coords: RasterCoords): LatLngBoundsExpression => {
    return coords.getMaxBounds();
  };
}
