import { Spherical, toRadians, Vector2 } from '../panorama/MathUtils';
import { View, ViewData } from '../types/panorama';
import { Component } from './Component';
import { Node } from './Node';


export interface ViewControlsOptions {
  minAngle: number;
}

declare interface ViewControls {
  on(event: 'viewChange', listener: (uuid: string) => void): this;

  emit(event: 'viewChange', uuid: string): boolean;
}

class ViewControls extends Component<HTMLDivElement, ViewControlsOptions> {
  protected styles = Component.createStyle('/public/css/components/ViewControls.css');

  public element: HTMLDivElement;
  private arrows: HTMLDivElement[];
  private angles: number[];

  protected defaultOptions: ViewControlsOptions = {
    minAngle: 20,
  };

  constructor(options: Partial<ViewControlsOptions> = {}) {
    super(options);

    [this.element] = this.createElement();

    this.arrows = [];
    this.angles = [];


    this.registerEventHandlers();
    this.injectStyles();
  }

  private registerEventHandlers(): void {
    window.addEventListener('resize', this.handleResize);
  }

  public unregisterEventHandlers(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.resizeArrows();
  };

  public rotate = (spherical: Spherical, fov: number): void => {
    const focalLength = 0.5 / Math.tan(toRadians(fov / 2)) * 50;
    const rotationX = Math.min(0, 0.5 * -spherical.theta - Math.PI / 2 + toRadians(20));

    this.element.style.transform = `perspective(${focalLength}cm) rotateX(${rotationX}rad) rotateZ(${-spherical.phi}rad)`;
  };

  public drawArrows(view: View): void {
    this.clearArrows();

    for (const neighbor of view.neighbors) {
      if (neighbor.uuid === view.target.uuid) continue;

      const arrow = this.createArrow(view.target, neighbor);
      if (arrow !== null) {
        this.element.appendChild(arrow);
        this.arrows.push(arrow);
      }
    }

    this.resizeArrows();

    const clone = this.element.cloneNode(true) as HTMLDivElement;
    clone.classList.add('view-controls-container-shadow');

    this.element.appendChild(clone);
  }

  public clearArrows(): void {
    this.angles = [];
    this.arrows = [];

    while (this.element.lastChild !== null) {
      this.element.removeChild(this.element.lastChild);
    }
  }

  private resizeArrows(): void {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    const shortSide = Math.min(width, height);
    console.log('Short side:', shortSide);

    document.documentElement.style.setProperty('--view-controls-arrow-width', `${shortSide * 0.5}px`);
    document.documentElement.style.setProperty('--view-controls-container-short', `${shortSide}px`);
  }

  private createArrow(target: ViewData, neighbor: ViewData): HTMLDivElement | null {
    const vector = new Vector2(
      target.position.x - neighbor.position.x,
      target.position.y - neighbor.position.y,
    );

    if (vector.vecLength() > 20) return null;
    const angle = vector.angle();

    for (const a of this.angles) {
      const dt = Math.abs(angle - a);

      if (dt < toRadians(20) || dt > toRadians(340)) return null;
    }

    this.angles.push(angle);

    const arrow = new Node('div')
      .addClass('view-controls-arrow')
      .setStyle('transform', `rotate(${angle + Math.PI / 2}rad)`)
      .setStyle(
        'top',
        `calc(50% - var(--view-controls-arrow-width) / 4 +
        (var(--view-controls-container-short) / 2 - var(--view-controls-arrow-width) / 4) * ${Math.sin(angle)})`,
      )
      .setStyle(
        'left',
        `calc(50% - var(--view-controls-arrow-width) / 2 +
        (var(--view-controls-container-short) / 2 - var(--view-controls-arrow-width) / 4) * ${Math.cos(angle)})`,
      )
      .unwrapUnsafe();

    arrow.addEventListener('pointerdown', () => {
      arrow.addEventListener('pointerup', () => {
        this.emit('viewChange', neighbor.uuid);
      }, { once: true });
    }, { once: true });

    return arrow;
  }

  private createElement(): [HTMLDivElement] {
    const container = new Node('div')
      .addClass('view-controls-container')
      .setStyle('scale', '1 -1')
      .unwrapUnsafe();

    return [container];
  }
}

export {
  ViewControls,
};
