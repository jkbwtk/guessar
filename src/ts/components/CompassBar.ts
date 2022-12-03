import { Component } from './Component';


export interface CompassBarOptions {
  createVisible: boolean,
  showOnHeadingChange: boolean,
}

export class CompassBar extends Component<HTMLDivElement, CompassBarOptions> {
  protected styles = Component.createStyle('/public/css/components/CompassBar.css');
  public element: HTMLDivElement;
  private markings: HTMLImageElement;
  private angle = 0;

  public defaultOptions: CompassBarOptions = {
    createVisible: true,
    showOnHeadingChange: true,
  };

  constructor(options: Partial<CompassBarOptions> = {}) {
    super(options);

    [this.element, this.markings] = this.createElement();
    this.registerEventListeners();

    this.injectStyles();
  }

  public setHeading(angle: number): void {
    const { width: compassWidth } = this.element.getBoundingClientRect();
    const { width: markingsWidth } = this.markings.getBoundingClientRect();

    let computedAngle = 57.29577951 * angle * (markingsWidth / 720) + (compassWidth / 2);

    computedAngle = computedAngle % (markingsWidth / 2);

    if (computedAngle > 0) {
      computedAngle -= markingsWidth / 2;
    }

    this.angle = angle;

    this.markings.style.transform = `translateX(${computedAngle}px)`;

    if (this.options.showOnHeadingChange) this.show();
  }

  public show(): void {
    this.element.setAttribute('visible', 'true');
  }

  public hide(): void {
    this.element.setAttribute('visible', 'false');
  }

  private registerEventListeners() {
    window.addEventListener('resize', () => {
      this.setHeading(this.angle);
    });

    this.markings.addEventListener('load', () => {
      this.setHeading(this.angle);
    });
  }

  private createElement(): [HTMLDivElement, HTMLImageElement] {
    const markings = document.createElement('img');
    markings.classList.add('markings');
    markings.src = '/public/img/compassMarkings.svg';

    const compass = document.createElement('div');
    compass.classList.add('compass');
    compass.appendChild(markings);

    compass.setAttribute('visible', this.options.createVisible.toString());

    return [compass, markings];
  }
}
