import { clamp, Vector2 } from '../panorama/MathUtils';
import { Component } from './Component';


export interface FpsCounterOptions {
  createVisible: boolean,
  precision: number,
  sampleSize: number,
}

export class FpsCounter extends Component<HTMLDivElement, FpsCounterOptions, number> {
  protected styles = Component.createStyle('/public/css/components/FpsCounter.css');
  public element: HTMLDivElement;

  private frametimes: number[] = [];

  protected defaultOptions: FpsCounterOptions = {
    createVisible: true,
    precision: 0,
    sampleSize: 10,
  };

  constructor(options: Partial<FpsCounterOptions> = {}) {
    super(options);

    this.element = this.createElement();

    this.injectStyles();
  }

  public update = (frametime: number): void => {
    this.frametimes.push(frametime);

    if (this.frametimes.length > this.options.sampleSize) {
      this.frametimes.shift();
    }

    let avg = 1000 / this.frametimes.reduce((acc, cur, i, arr) => acc + cur * (1 / arr.length), 0);
    avg = clamp(avg, 0, 999);

    this.element.innerText = this.textTemplate(avg);
  };

  public show(): void {
    this.element.setAttribute('visible', 'true');
  }

  public hide(): void {
    this.element.setAttribute('visible', 'false');
  }

  private textTemplate(fps: number): string {
    return `${fps.toFixed(this.options.precision)} FPS`;
  }

  private createElement(): HTMLDivElement {
    const counter = document.createElement('div');
    counter.classList.add('fps-counter');
    counter.innerText = this.textTemplate(0);

    counter.setAttribute('visible', this.options.createVisible.toString());

    return counter;
  }
}
