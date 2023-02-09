import { CRS, Icon, LayerGroup, Map as LeafletMap, Marker, Point, TileLayer } from 'leaflet';
import { RasterCoords } from './RasterCoords';
import { Component } from './Component';
import { Stylized } from './Stylized';
import { LeafletFactory } from '../LeafletFactory';


export interface SummaryMapOptions {
  createVisible: boolean,
}

export class SummaryMap extends Component<HTMLDivElement, SummaryMapOptions> {
  protected styles = [
    Stylized.createStyle('/public/css/leaflet.css'),
  ];

  public element: HTMLDivElement;
  public map: LeafletMap;
  public coords: RasterCoords;
  public pickMarker: Marker;
  public targetMarker: Marker;
  private animating = false;

  protected defaultOptions: SummaryMapOptions = {
    createVisible: true,
  };

  constructor(options: Partial<SummaryMapOptions> = {}) {
    super(options);

    [
      this.element,
    ] = this.createElement();

    this.pickMarker = LeafletFactory.pickMarker(0);
    this.targetMarker = LeafletFactory.targetMarker(0);

    [this.map, this.coords] = this.createMap();

    this.registerEventHandlers();
    this.injectStyles();
  }

  public update = (): void => {
    if (this.animating) requestAnimationFrame(this.update);
    this.map.invalidateSize();
  };

  public mounted(): void {
    this.map.invalidateSize();
    this.map.setView(this.coords.unprojectMap([0, 0]), 0, { animate: false });
  }

  private registerEventHandlers(): void {
    this.element.addEventListener('transitionstart', (ev) => {
      if (ev.propertyName !== 'height' && ev.propertyName !== 'width') return;

      this.animating = true;
      this.update();
    });

    this.element.addEventListener('transitionend', () => {
      this.animating = false;
    });
  }

  private createElement(): [HTMLDivElement] {
    const element = document.createElement('div');

    return [element];
  }

  private createMap(): [LeafletMap, RasterCoords] {
    const minimap = LeafletFactory.map(this.element);

    const coords = new RasterCoords(minimap, LeafletFactory.imageSize, LeafletFactory.mapSize, 256);
    minimap.options.center = coords.unprojectMap([0, 0]);
    minimap.setView(minimap.options.center, 0);

    const baseLayer = LeafletFactory.baseLayer(coords);
    const activeLayer = LeafletFactory.activeLayer(coords);

    const vectorGroup = new LayerGroup([baseLayer, activeLayer]);
    vectorGroup.addTo(minimap);

    minimap.addLayer(this.pickMarker);
    minimap.addLayer(this.targetMarker);

    return [minimap, coords];
  }

  public setPosition(position: [number, number], rotation: number): void {
    this.targetMarker.setOpacity(1);
    this.targetMarker.setLatLng(this.coords.unprojectMap(position));

    this.map.setView(this.targetMarker.getLatLng(), this.map.getZoom());
  }
}
