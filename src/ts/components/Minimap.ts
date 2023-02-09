import { CRS, Icon, LayerGroup, Map as LeafletMap, Marker, Point, TileLayer } from 'leaflet';
import { RasterCoords } from './RasterCoords';
import { Component } from './Component';
import { Stylized } from './Stylized';
import { LeafletFactory } from '../LeafletFactory';


export enum MinimapMode {
  GUESSING,
  EXPLORATION,
}

export interface MinimapOptions {
  createVisible: boolean,
  maxWidthOffsetRem: number,
  maxHeightOffsetRem: number,
  mode: MinimapMode,
}

export declare interface Minimap {
  on(event: 'confirmPick', listener: (markerPosition: Point) => void): this;
  on(event: 'resetPosition', listener: () => void): this;

  emit(event: 'confirmPick', markerPosition: Point): boolean;
  emit(event: 'resetPosition'): boolean;
}

export class Minimap extends Component<HTMLDivElement, MinimapOptions> {
  protected styles = [
    Stylized.createStyle('/public/css/components/Minimap.css'),
    Stylized.createStyle('/public/css/leaflet.css'),
  ];

  public element: HTMLDivElement;
  public minimapElement: HTMLDivElement;
  public resizeButton: HTMLButtonElement;
  public returnButton: HTMLButtonElement;
  public confirmButton: HTMLButtonElement;
  public minimap: LeafletMap;
  public coords: RasterCoords;
  public pickMarker: Marker;
  public positionMarker: Marker;
  private animating = false;
  private clickStart: [number, number] = [0, 0];
  private minimapSizeOffset: [number, number] = [0, 0];
  private minimapDeactivationTimeoutHandle = -1;
  private minimapBaseSize: [string, string] = ['24rem', '18rem'];
  private minimapActivatedSize: [string, string] = ['50rem', '35rem'];
  private minimapMinSize: [string, string] = this.minimapBaseSize;

  private get minimapMaxSize(): [number, number] {
    const parent = this.element.parentElement;
    if (parent === null) throw new Error('Minimap has no parent element');

    const width = parent.clientWidth;
    const height = parent.clientHeight;

    const calculatedWidth = width - this.convertRemToPx(this.options.maxWidthOffsetRem);
    const calculatedHeight = height - this.convertRemToPx(this.options.maxHeightOffsetRem);

    return [calculatedWidth, calculatedHeight];
  }


  protected defaultOptions: MinimapOptions = {
    createVisible: true,
    maxWidthOffsetRem: 3.2,
    maxHeightOffsetRem: 8,
    mode: MinimapMode.GUESSING,
  };

  constructor(options: Partial<MinimapOptions> = {}) {
    super(options);

    [this.element, this.minimapElement, this.resizeButton, this.confirmButton, this.returnButton] = this.createElement();

    this.pickMarker = LeafletFactory.pickMarker(0);
    this.positionMarker = LeafletFactory.positionMarker(0);

    [this.minimap, this.coords] = this.createMap();

    this.deactivateMinimap();

    this.registerEventHandlers();
    this.injectStyles();
  }

  public update = (): void => {
    if (this.animating) requestAnimationFrame(this.update);
    this.minimap.invalidateSize();
  };

  public mounted(): void {
    this.minimap.invalidateSize();
    this.deactivateMinimap();
    this.minimap.setView(this.coords.unprojectMap([0, 0]), 0);
  }

  private registerEventHandlers(): void {
    this.confirmButton.addEventListener('click', () => {
      this.emit('confirmPick', this.coords.projectMap(this.pickMarker.getLatLng()));
    });

    this.returnButton.addEventListener('click', () => {
      this.emit('resetPosition');
    });

    this.element.addEventListener('transitionstart', (ev) => {
      if (ev.propertyName !== 'height' && ev.propertyName !== 'width') return;

      this.animating = true;
      this.update();
    });

    this.element.addEventListener('transitionend', () => {
      this.animating = false;
    });

    this.resizeButton.addEventListener('mousedown', (ev) => {
      document.addEventListener('mousemove', this.resizeMouseMove);
      document.addEventListener('mouseup', this.resizeMouseUp);

      this.clampMinimapSize();
      this.clickStart = [ev.clientX, ev.clientY];

      this.minimapElement.setAttribute('resized', 'true');
    });

    this.element.addEventListener('mouseenter', () => {
      if (this.minimapElement.hasAttribute('resized')) return;

      clearTimeout(this.minimapDeactivationTimeoutHandle);
      this.activateMap();

      this.element.addEventListener('mouseleave', this.containerMouseLeave);
    });


    this.resizeButton.addEventListener('dragstart', (ev) => ev.preventDefault());
  }

  private containerMouseLeave = () => {
    if (this.minimapElement.hasAttribute('resized')) return;

    this.element.removeEventListener('mouseleave', this.containerMouseLeave);
    clearTimeout(this.minimapDeactivationTimeoutHandle);

    this.minimapDeactivationTimeoutHandle = setTimeout(() => {
      this.deactivateMinimap();
    }, 500) as unknown as number;
  };

  private resizeMouseMove = (ev: MouseEvent) => {
    const dX = this.minimapSizeOffset[0] + this.clickStart[0] - ev.clientX;
    const dY = this.minimapSizeOffset[1] + this.clickStart[1] - ev.clientY;

    this.setMinimapSize(dX, dY);

    this.minimap.invalidateSize();
  };

  private resizeMouseUp = (ev: MouseEvent) => {
    this.minimapSizeOffset[0] += this.clickStart[0] - ev.clientX;
    this.minimapSizeOffset[1] += this.clickStart[1] - ev.clientY;

    this.clampMinimapSize();

    this.minimapElement.removeAttribute('resized');
    this.containerMouseLeave();

    document.removeEventListener('mousemove', this.resizeMouseMove);
    document.removeEventListener('mouseup', this.resizeMouseUp);
  };

  private clampMinimapSize(): void {
    this.minimapSizeOffset[0] = Math.min(Math.max(
      this.minimapSizeOffset[0],
      this.convertRemToPx(this.minimapBaseSize[0]) - this.convertRemToPx(this.minimapActivatedSize[0]),
    ), this.minimapMaxSize[0] - this.convertRemToPx(this.minimapActivatedSize[0]));
    this.minimapSizeOffset[1] = Math.min(Math.max(
      this.minimapSizeOffset[1],
      this.convertRemToPx(this.minimapBaseSize[1]) - this.convertRemToPx(this.minimapActivatedSize[1]),
    ), this.minimapMaxSize[1] - this.convertRemToPx(this.minimapActivatedSize[1]));
  }

  private convertRemToPx(rem: string | number): number {
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize.replace(/[^\d]/g, ''));
    const remNumber = typeof rem === 'string' ? parseFloat(rem) : rem;

    return fontSize * remNumber;
  }

  private createElement(): [HTMLDivElement, HTMLDivElement, HTMLButtonElement, HTMLButtonElement, HTMLButtonElement] {
    const minimap = document.createElement('div');
    minimap.classList.add('minimap-map');


    const resizeButton = document.createElement('button');
    resizeButton.classList.add('minimap-resize-button');

    const tmp1 = document.createElement('img');
    resizeButton.appendChild(tmp1);
    tmp1.src = '/public/img/resizeArrows.svg';


    const confirmButton = document.createElement('button');
    confirmButton.classList.add('minimap-button', 'minimap-confirm');
    switch (this.options.mode) {
      case MinimapMode.GUESSING: confirmButton.innerText = 'Confirm'; break;
      case MinimapMode.EXPLORATION: confirmButton.innerText = 'Teleport'; break;
      default: confirmButton.innerText = 'Confirm';
    }

    const returnButton = document.createElement('button');
    returnButton.classList.add('minimap-button', 'minimap-return');

    const tmp2 = document.createElement('img');
    returnButton.appendChild(tmp2);
    tmp2.src = '/public/img/flag_alt.svg';


    const element = document.createElement('div');
    element.classList.add('minimap-container');
    element.appendChild(resizeButton);

    const tmp3 = document.createElement('div');
    tmp3.classList.add('minimap-scalable-container');
    element.appendChild(tmp3);
    tmp3.appendChild(minimap);

    const tmp4 = document.createElement('div');
    tmp4.classList.add('minimap-buttons');
    tmp3.appendChild(tmp4);
    tmp4.appendChild(confirmButton);

    if (this.options.mode === MinimapMode.GUESSING) {
      tmp4.appendChild(returnButton);
    }


    return [element, minimap, resizeButton, confirmButton, returnButton];
  }

  private deactivateMinimap() {
    this.element.setAttribute('active', 'false');

    this.minimapElement.style.width = this.minimapBaseSize[0];
    this.minimapElement.style.height = this.minimapBaseSize[1];

    this.minimap.invalidateSize();
  }

  private activateMap() {
    this.element.setAttribute('active', 'true');
    this.setMinimapSize(...this.minimapSizeOffset);

    this.minimap.invalidateSize();
  }

  private setMinimapSize(width: number, height: number) {
    this.minimapElement.style.width = `max(min(calc(${this.minimapActivatedSize[0]} + ${width}px), ${this.minimapMaxSize[0]}px), ${this.minimapMinSize[0]})`;
    this.minimapElement.style.height = `max(min(calc(${this.minimapActivatedSize[1]} + ${height}px), ${this.minimapMaxSize[1]}px), ${this.minimapMinSize[1]})`;
  }

  private createMap(): [LeafletMap, RasterCoords] {
    const minimap = LeafletFactory.map(this.minimapElement);

    const coords = new RasterCoords(minimap, LeafletFactory.imageSize, LeafletFactory.mapSize, 256);
    minimap.options.center = coords.unprojectMap([0, 0]);
    minimap.setView(minimap.options.center, 0);

    const baseLayer = LeafletFactory.baseLayer(coords);
    const activeLayer = LeafletFactory.activeLayer(coords);

    const vectorGroup = new LayerGroup([baseLayer, activeLayer]);
    vectorGroup.addTo(minimap);

    minimap.on('click', (ev) => {
      this.pickMarker.setOpacity(1);
      this.pickMarker.setLatLng(ev.latlng);
    });

    this.pickMarker.addTo(minimap);
    if (this.options.mode === MinimapMode.EXPLORATION) this.positionMarker.addTo(minimap);

    return [minimap, coords];
  }

  public setPosition(position: [number, number], rotation: number): void {
    this.positionMarker.setOpacity(1);
    this.positionMarker.setLatLng(this.coords.unprojectMap(position));

    this.minimap.setView(this.positionMarker.getLatLng(), this.minimap.getZoom());
  }
}
