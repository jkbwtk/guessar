import { Component } from '../components/Component';
import { Stylized } from '../components/Stylized';
import { Panorama } from '../panorama/Panorama';
import { GetView } from '../types/panorama';
import { CompassBar } from '../components/CompassBar';
import { Minimap, MinimapMode } from '../components/Minimap';
import { UserWidget } from '../components/UserWidget';
import { ViewControls } from '../components/ViewControls';
import { ZoomControls } from '../components/ZoomControls';
import { Point } from 'leaflet';
import { GameWidget } from '../components/GameWidget';


export interface GuessingOptions {
  allowPan: boolean;
  allowZoom: boolean;
  allowMove: boolean;
}

export class Guessing extends Component<HTMLDivElement, GuessingOptions> {
  protected styles = Stylized.createStyle('/public/css/components/PanoramaViewer.css');

  public element: HTMLDivElement;
  public ui: HTMLDivElement;

  public panorama: Panorama;
  public compass: CompassBar;
  public zoom: ZoomControls;
  public map: Minimap;
  public arrows: ViewControls;
  public userWidget: UserWidget;
  public gameWidget: GameWidget;

  protected defaultOptions: GuessingOptions = {
    allowPan: true,
    allowZoom: true,
    allowMove: true,
  };

  constructor(options: Partial<GuessingOptions> = {}) {
    super(options);

    [
      this.element,
      this.ui,
      this.panorama,
      this.compass,
      this.zoom,
      this.map,
      this.arrows,
      this.userWidget,
      this.gameWidget,
    ] = this.createElement();

    this.injectStyles();

    this.registerEventHandlers();
  }

  public mounted(): void {
    this.map.mounted();
    this.panorama.resizeViewer();
  }

  private createElement(): [HTMLDivElement, HTMLDivElement, Panorama, CompassBar, ZoomControls, Minimap, ViewControls, UserWidget, GameWidget] {
    const element = document.createElement('div');
    element.classList.add('container', 'explore-container');

    const panorama = new Panorama({
      allowPan: this.options.allowPan,
      allowZoom: this.options.allowZoom,
    });
    element.appendChild(panorama.canvas);

    const ui = document.createElement('div');
    ui.classList.add('panorama-ui-container');
    element.appendChild(ui);

    const topContainer = document.createElement('div');
    topContainer.classList.add('panorama-ui-top-container');
    ui.appendChild(topContainer);

    const gameWidget = new GameWidget();
    gameWidget.element.classList.add('panorama-ui-game-widget');
    topContainer.appendChild(gameWidget.element);

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
    ui.appendChild(zoom.element);

    const map = new Minimap({
      maxWidthOffsetRem: 12,
      maxHeightOffsetRem: 16.8,
      mode: MinimapMode.GUESSING,
    });
    map.element.classList.add('panorama-ui-map');
    ui.appendChild(map.element);

    const arrows = new ViewControls();
    arrows.element.classList.add('panorama-ui-arrows');
    ui.appendChild(arrows.element);

    return [element, ui, panorama, compass, zoom, map, arrows, userWidget, gameWidget];
  }

  private registerEventHandlers(): void {
    console.log(this.options);

    this.panorama.on('rotation', (rotation) => {
      this.compass.setHeading(rotation.phi);
      this.arrows.rotate(rotation, this.panorama.controls.fov);
    });


    this.panorama.on('zoom', (fov) => {
      this.zoom.setSliderValue(fov);
      this.arrows.rotate(this.panorama.controls.spherical, fov);
    });

    if (this.options.allowZoom) {
      this.zoom.zoomIn.addEventListener('click', () => this.panorama.controls.zoomIn());
      this.zoom.zoomOut.addEventListener('click', () => this.panorama.controls.zoomOut());

      this.zoom.zoomSlider.addEventListener('input', () => {
        this.panorama.controls.fov = parseFloat(this.zoom.zoomSlider.value);
      });
    }

    this.arrows.on('viewChange', this.changePanorama);
  }

  private async getView(uuid: string): Promise<GetView> {
    return await (await fetch(`/api/v1/views/view?uuid=${uuid}`)).json() as GetView;
  }

  public changePanorama = async (uuid: string, overrideHeading = false): Promise<void> => {
    const view = await this.getView(uuid);

    await this.changeViewExploration(view);
    if (overrideHeading) {
      this.panorama.overrideHeading(view.data.target.position.r + Math.PI, 0);
    }
  };

  public changeViewExploration = async (view: GetView): Promise<void> => {
    if (this.options.allowMove) {
      this.arrows.drawArrows(view.data);
    } else {
      this.arrows.clearArrows();
    }

    await this.panorama.changePanorama(view);
  };
}
