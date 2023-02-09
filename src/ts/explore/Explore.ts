import { Panorama } from '../panorama/Panorama';
import { GetView } from '../types/panorama';
import { Point } from 'leaflet';
import { Stylized } from '../components/Stylized';
import { FpsCounter } from '../components/FpsCounter';
import { CompassBar } from '../components/CompassBar';
import { Minimap, MinimapMode } from '../components/Minimap';
import { UserWidget } from '../components/UserWidget';
import { ViewControls } from '../components/ViewControls';
import { ZoomControls } from '../components/ZoomControls';


export class Explore extends Stylized {
  protected styles = Stylized.createStyle('/public/css/components/PanoramaViewer.css');

  private ui: HTMLDivElement;

  private panorama: Panorama;
  private counter: FpsCounter;
  private compass: CompassBar;
  private zoom: ZoomControls;
  private map: Minimap;
  private arrows: ViewControls;
  private userWidget: UserWidget;

  constructor(private container: HTMLElement) {
    super();

    this.container = container;

    this.panorama = new Panorama();
    this.ui = this.createUi();

    this.container.appendChild(this.panorama.canvas);
    this.container.appendChild(this.ui);

    this.panorama.resizeViewer();

    [
      this.counter,
      this.compass,
      this.zoom,
      this.map,
      this.arrows,
      this.userWidget,
    ] = this.populateUi();


    this.initPanorama();

    this.registerEventHandlers();
    this.injectStyles();

    this.mounted();
  }

  private mounted(): void {
    this.map.mounted();
  }

  private createUi(): HTMLDivElement {
    const ui = document.createElement('div');
    ui.classList.add('panorama-ui-container');

    return ui;
  }

  private populateUi(): [FpsCounter, CompassBar, ZoomControls, Minimap, ViewControls, UserWidget] {
    const topContainer = document.createElement('div');
    topContainer.classList.add('panorama-ui-top-container');
    this.ui.appendChild(topContainer);

    const counter = new FpsCounter();
    counter.element.classList.add('panorama-ui-counter');
    topContainer.appendChild(counter.element);

    const filler = document.createElement('div');
    filler.style.width = '11rem';
    filler.style.flexShrink = '600000';
    topContainer.appendChild(filler);

    const compass = new CompassBar();
    compass.element.classList.add('panorama-ui-compass');
    topContainer.appendChild(compass.element);

    const userWidget = new UserWidget();
    userWidget.element.classList.add('panorama-ui-user-widget');
    topContainer.appendChild(userWidget.element);


    const zoom = new ZoomControls();
    zoom.element.classList.add('panorama-ui-zoom');
    this.ui.appendChild(zoom.element);

    const map = new Minimap({
      maxWidthOffsetRem: 12,
      maxHeightOffsetRem: 16.8,
      mode: MinimapMode.EXPLORATION,
    });
    map.element.classList.add('panorama-ui-map');
    this.ui.appendChild(map.element);

    const arrows = new ViewControls();
    arrows.element.classList.add('panorama-ui-arrows');
    this.ui.appendChild(arrows.element);


    return [counter, compass, zoom, map, arrows, userWidget];
  }

  private registerEventHandlers() {
    this.panorama.on('frame', this.counter.update);

    this.panorama.on('rotation', (rotation) => {
      this.compass.setHeading(rotation.phi);
      this.arrows.rotate(rotation, this.panorama.controls.fov);
    });

    this.panorama.on('zoom', (fov) => {
      this.zoom.setSliderValue(fov);
      this.arrows.rotate(this.panorama.controls.spherical, fov);
    });

    this.panorama.on('animationFinished', () => {
      const url = new URL(location.href);
      url.searchParams.set('fov', this.panorama.controls.fov.toString());
      url.searchParams.set('phi', this.panorama.controls.phi.toString());
      url.searchParams.set('theta', this.panorama.controls.theta.toString());
      window.history.replaceState('', '', url);
    });

    this.zoom.zoomIn.addEventListener('click', this.panorama.controls.zoomIn);
    this.zoom.zoomOut.addEventListener('click', this.panorama.controls.zoomOut);

    this.zoom.zoomSlider.addEventListener('input', () => {
      this.panorama.controls.fov = parseFloat(this.zoom.zoomSlider.value);
    });

    this.arrows.on('viewChange', this.changePanorama);

    this.map.on('confirmPick', this.handleMapConfirmPick);
  }

  private handleMapConfirmPick = async (point: Point) => {
    console.log('confirmPick', point);
    this.map.pickMarker.setOpacity(0);
    await this.changeClosestPanorama(point);
  };

  private async initPanorama() {
    const url = new URL(location.href);
    const uuid = url.searchParams.get('uuid');

    if (uuid !== null) {
      const fov = parseFloat(url.searchParams.get('fov') || Panorama.defaultOptions.fov.toString());
      const phi = parseFloat(url.searchParams.get('phi') || '0');
      const theta = parseFloat(url.searchParams.get('theta') || '0');

      this.panorama.overrideHeading(phi, theta, fov);
      await this.changePanorama(uuid);
    } else {
      await this.changePanoramaRandom();
    }
  }

  private changePanorama = async (uuid: string) => {
    const view = await (await fetch(`/api/v1/views/view?uuid=${uuid}`)).json() as GetView;
    this.changeViewExploration(view);
  };

  private changePanoramaRandom = async () => {
    const view = await (await fetch('/api/v1/views/random')).json() as GetView;
    this.changeViewExploration(view);
  };

  private changeClosestPanorama = async (point: Point) => {
    const url = new URL('/api/v1/views/closest', window.location.href);
    url.searchParams.set('x', point.x.toString());
    url.searchParams.set('y', point.y.toString());

    const view = await (await fetch(url.href)).json() as GetView;
    this.changeViewExploration(view);
  };

  private changeViewExploration = async (view: GetView) => {
    const url = new URL(location.href);
    url.searchParams.set('uuid', view.data.target.uuid);
    window.history.replaceState('', '', url);

    this.arrows.drawArrows(view.data);
    this.map.setPosition([view.data.target.position.x, view.data.target.position.y], this.panorama.controls.phi);
    await this.panorama.changePanorama(view);
  };
}
