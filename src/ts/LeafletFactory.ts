import { CRS, Icon, LatLngBoundsExpression, LatLngExpression, LayerGroup, Map, Marker, Polyline, TileLayer } from 'leaflet';
import { RasterCoords } from './components/RasterCoords';


export class LeafletFactory {
  public static vectorImageSize: [number, number] = [16384, 16384];
  public static satelliteImageSize: [number, number] = [6000, 6000];
  public static mapSize: [number, number] = [6000, 6000];
  public static tileSize = 256;

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

  private static baseLayer = (coords: RasterCoords, url: string): TileLayer => new TileLayer(url, {
    noWrap: true,
    bounds: coords.getMaxBounds(),
    maxNativeZoom: 0,
    minNativeZoom: 0,
    maxZoom: coords.zoomLevel(),
    tileSize: LeafletFactory.tileSize,
    keepBuffer: 4,
  });

  private static activeLayer = (coords: RasterCoords, url: string): TileLayer => new TileLayer(url, {
    noWrap: true,
    bounds: coords.getMaxBounds(),
    maxNativeZoom: coords.zoomLevelReal(),
    minNativeZoom: 0,
    maxZoom: coords.zoomLevel() * 8,
    tileSize: LeafletFactory.tileSize,
    keepBuffer: 4,
  });

  public static satelliteBaseLayer = (coords: RasterCoords): TileLayer => LeafletFactory.baseLayer(coords, '/public/img/tiles/satellite/0/0/0.webp');

  public static satelliteActiveLayer = (coords: RasterCoords): TileLayer => LeafletFactory.activeLayer(coords, '/public/img/tiles/satellite/{z}/{x}/{y}.webp');

  public static vectorBaseLayer = (coords: RasterCoords): TileLayer => LeafletFactory.baseLayer(coords, '/public/img/tiles/vector/0/0/0.webp');

  public static vectorActiveLayer = (coords: RasterCoords): TileLayer => LeafletFactory.activeLayer(coords, '/public/img/tiles/vector/{z}/{x}/{y}.webp');

  public static map = (element: string | HTMLElement): Map => new Map(element, {
    crs: CRS.Simple,
    zoomSnap: 0.25,
    attributionControl: false,
    zoom: 0,
  });

  private static advancedMap = (element: string | HTMLElement, imageSize: [number, number]): [Map, RasterCoords] => {
    const map = LeafletFactory.map(element);

    const coords = new RasterCoords(
      map,
      imageSize,
      LeafletFactory.mapSize,
      LeafletFactory.tileSize,
    );

    map.options.center = coords.unprojectMap([0, 0]);
    map.setView(map.options.center, 0);

    return [map, coords];
  };

  public static satelliteMap = (element: string | HTMLElement): [Map, RasterCoords] => {
    const [map, coords] = LeafletFactory.advancedMap(element, LeafletFactory.satelliteImageSize);

    const baseLayer = LeafletFactory.satelliteBaseLayer(coords);
    const activeLayer = LeafletFactory.satelliteActiveLayer(coords);

    const vectorGroup = new LayerGroup([baseLayer, activeLayer]);
    vectorGroup.addTo(map);

    map.getContainer().style.background = '#3a4e4e';

    return [map, coords];
  };

  public static vectorMap = (element: string | HTMLElement): [Map, RasterCoords] => {
    const [map, coords] = LeafletFactory.advancedMap(element, LeafletFactory.vectorImageSize);

    const baseLayer = LeafletFactory.vectorBaseLayer(coords);
    const activeLayer = LeafletFactory.vectorActiveLayer(coords);

    const vectorGroup = new LayerGroup([baseLayer, activeLayer]);
    vectorGroup.addTo(map);

    map.getContainer().style.background = '#6e88aa';

    return [map, coords];
  };

  public static polyLine = (latlngs: LatLngExpression[] = []): Polyline => new Polyline(latlngs, {
    weight: 4,
    dashArray: [4, 12],
    color: '#c60000',
  });

  public static mapBounds = (coords: RasterCoords): LatLngBoundsExpression => {
    return coords.getMaxBounds();
  };
}
