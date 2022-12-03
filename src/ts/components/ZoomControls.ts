import { Component } from './Component';


export interface ZoomControlsOptions {
  slider: {
    min: number,
    max: number,
    value: number,
  }
}

export class ZoomControls extends Component<HTMLDivElement, ZoomControlsOptions> {
  protected styles = Component.createStyle('/public/css/components/ZoomControls.css');

  public element: HTMLDivElement;
  public readonly zoomSlider: HTMLInputElement;
  public zoomIn: HTMLButtonElement;
  public zoomOut: HTMLButtonElement;

  protected defaultOptions: ZoomControlsOptions = {
    slider: {
      min: 5,
      max: 135,
      value: 90,
    },
  };

  constructor(options: Partial<ZoomControlsOptions> = {}) {
    super(options);

    [this.element, this.zoomSlider, this.zoomIn, this.zoomOut] = this.createElement();

    this.injectStyles();
  }

  public setSliderValue = (fov: number): void => {
    this.zoomSlider.value = fov.toString();
  };

  private createElement(): [HTMLDivElement, HTMLInputElement, HTMLButtonElement, HTMLButtonElement] {
    const zoomSlider = document.createElement('input');
    zoomSlider.classList.add('zoom-slider');
    zoomSlider.type = 'range';
    zoomSlider.min = this.options.slider.min.toString();
    zoomSlider.max = this.options.slider.max.toString();
    zoomSlider.value = this.options.slider.value.toString();


    const zoomIn = document.createElement('button');
    zoomIn.classList.add('zoom-in');

    const zoomInImage = document.createElement('img');
    zoomIn.appendChild(zoomInImage);
    zoomInImage.src = '/public/img/zoomInButton.svg';


    const zoomOut = document.createElement('button');
    zoomOut.classList.add('zoom-out');

    const zoomOutImage = document.createElement('img');
    zoomOut.appendChild(zoomOutImage);
    zoomOutImage.src = '/public/img/zoomOutButton.svg';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('zoom-buttons-container');
    buttonContainer.appendChild(zoomIn);
    buttonContainer.appendChild(zoomOut);

    const container = document.createElement('div');
    container.classList.add('zoom-container');
    container.appendChild(zoomSlider);
    container.appendChild(buttonContainer);


    return [container, zoomSlider, zoomIn, zoomOut];
  }
}
