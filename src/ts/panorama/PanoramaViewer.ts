import { FpsCounter } from '../components/FpsCounter';
import { Panorama } from './Panorama';
import { GetView } from '../types/panorama';
import { Stylized } from '../components/Stylized';
import { CompassBar } from '../components/CompassBar';
import { ZoomControls } from '../components/ZoomControls';
import { Minimap } from '../components/Minimap';
import { toRadians } from './MathUtils';
import { ViewControls } from '../components/ViewControls';


export class PanoramaViewer extends Stylized {
  protected styles = Stylized.createStyle('/public/css/components/PanoramaViewer.css');

  private container: HTMLElement;
  private ui: HTMLDivElement;

  private panorama: Panorama;
  private counter: FpsCounter;
  private compass: CompassBar;
  private zoom: ZoomControls;
  private map: Minimap;
  private arrows: ViewControls;

  constructor(container: HTMLElement) {
    super();

    this.container = container;

    this.panorama = new Panorama();
    this.ui = this.createUi();

    this.container.appendChild(this.panorama.canvas);
    this.container.appendChild(this.ui);

    this.panorama.resizeViewer();

    [this.counter, this.compass, this.zoom, this.map, this.arrows] = this.populateUi();


    this.initPanorama();

    this.registerEventHandlers();
    this.injectStyles();
  }

  private createUi(): HTMLDivElement {
    const ui = document.createElement('div');
    ui.classList.add('panorama-ui-container');

    return ui;
  }

  private populateUi(): [FpsCounter, CompassBar, ZoomControls, Minimap, ViewControls] {
    const topContainer = document.createElement('div');
    topContainer.classList.add('panorama-ui-top-container');
    this.ui.appendChild(topContainer);

    const counter = new FpsCounter();
    counter.element.classList.add('panorama-ui-counter');
    topContainer.appendChild(counter.element);

    const compass = new CompassBar();
    compass.element.classList.add('panorama-ui-compass');
    topContainer.appendChild(compass.element);

    const filler = document.createElement('div');
    filler.style.width = '11rem';
    filler.style.flexShrink = '600000';
    topContainer.appendChild(filler);

    const zoom = new ZoomControls();
    zoom.element.classList.add('panorama-ui-zoom');
    this.ui.appendChild(zoom.element);

    const map = new Minimap({
      maxWidthOffsetRem: 12,
      maxHeightOffsetRem: 16.8,
    });
    map.element.classList.add('panorama-ui-map');
    this.ui.appendChild(map.element);

    const arrows = new ViewControls();
    arrows.element.classList.add('panorama-ui-arrows');
    this.ui.appendChild(arrows.element);

    return [counter, compass, zoom, map, arrows];
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

    this.zoom.zoomIn.addEventListener('click', () => this.panorama.controls.zoomIn());
    this.zoom.zoomOut.addEventListener('click', () => this.panorama.controls.zoomOut());

    this.zoom.zoomSlider.addEventListener('input', () => {
      this.panorama.controls.fov = parseFloat(this.zoom.zoomSlider.value);
    });

    this.arrows.on('viewChange', this.changePanorama);
  }

  private async initPanorama() {
    await this.changePanoramaRandom();
  }

  private changePanorama = async (uuid: string) => {
    const view = await (await fetch(`/api/v1/views/view?uuid=${uuid}`)).json() as GetView;

    this.panorama.changePanorama(view);
    this.arrows.drawArrows(view.data);
  };

  private changePanoramaRandom = async () => {
    const view = await (await fetch('/api/v1/views/random')).json() as GetView;

    this.panorama.changePanorama(view);
    this.arrows.drawArrows(view.data);
  };
}
