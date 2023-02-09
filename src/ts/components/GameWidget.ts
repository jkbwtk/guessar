import { Component } from './Component';
import { Node } from './Node';


export interface GameWidgetState {
  points: number,
  round: number,
  maxRounds: number,
  roundTime: number,
  roundStartTime: number,
}

export interface GameWidgetOptions {
  createVisible: boolean,
}

export class GameWidget extends Component<HTMLDivElement, GameWidgetOptions, GameWidgetState> {
  protected styles = Component.createStyle('/public/css/components/GameWidget.css');

  public element: HTMLDivElement;
  public pointsDisplay: HTMLSpanElement;
  public roundDisplay: HTMLSpanElement;
  public timerDisplay: HTMLSpanElement;

  public interval: number | null = null;

  protected defaultOptions: GameWidgetOptions = {
    createVisible: true,
  };

  constructor(options: Partial<GameWidgetOptions> = {}) {
    super(options);

    [
      this.element,
      this.pointsDisplay,
      this.roundDisplay,
      this.timerDisplay,
    ] = this.createElement();

    this.injectStyles();
  }

  public update = (state: GameWidgetState): void => {
    this.setPoints(state.points);
    this.setRound(state.round, state.maxRounds);
    this.setTimer(state.roundStartTime, state.roundTime);
  };

  public show(): void {
    this.element.setAttribute('visible', 'true');
  }

  public hide(): void {
    this.element.setAttribute('visible', 'false');
  }

  private createElement(): [HTMLDivElement, HTMLSpanElement, HTMLSpanElement, HTMLSpanElement] {
    const pointsDisplay = new Node('span').addClass('game-widget-text-big').innerText('?').unwrapSafe();
    const roundDisplay = new Node('span').addClass('game-widget-text-big').innerText('?/?').unwrapSafe();
    const timerDisplay = new Node('span').addClass('game-widget-text-big').innerText('?').unwrapSafe();

    const widget = new Node('div')
      .addClass('game-widget-container')
      .appendChild(new Node('span').addClass('game-widget-text-small').innerText('Points').unwrapSafe())
      .appendChild(new Node('span').addClass('game-widget-text-small').innerText('Round').unwrapSafe())
      .appendChild(new Node('span').addClass('game-widget-text-small').innerText('Time').unwrapSafe())

      .appendChild(pointsDisplay)
      .appendChild(roundDisplay)
      .appendChild(timerDisplay)
      .unwrapUnsafe();

    widget.setAttribute('visible', this.options.createVisible.toString());

    return [widget, pointsDisplay, roundDisplay, timerDisplay];
  }

  public setPoints(points: number): void {
    this.pointsDisplay.innerText = points.toFixed(0);
  }

  public setRound(round: number, max: number): void {
    this.roundDisplay.innerText = `${round}/${max}`;
  }

  public setTimer(roundStartTime: number, roundTime: number): void {
    console.log(roundStartTime, roundTime);

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.timerDisplay.classList.remove('game-widget-text-blink');
    this.checkTimer(roundStartTime, roundTime);

    this.interval = setInterval(() => {
      this.checkTimer(roundStartTime, roundTime);
    }, 500);
  }

  private checkTimer(roundStartTime: number, roundTime: number): void {
    const timeNow = Math.floor(Date.now() / 1000);

    if (roundTime === 0) {
      this.updateTimer(timeNow - roundStartTime);
    } else {
      const timeLeft = Math.max(roundStartTime + roundTime - timeNow, 0);

      this.updateTimer(timeLeft);

      if (timeLeft <= 0) this.timerDisplay.classList.add('game-widget-text-blink');
    }
  }

  private updateTimer(seconds: number): void {
    let str = '';

    if (seconds > 3600) str += `${Math.floor(seconds / 3600).toFixed(0).padStart(2, '0')}:`;
    str += `${Math.floor((seconds % 3600) / 60).toFixed(0).padStart(2, '0')}:`;
    str += `${(seconds % 60).toFixed(0).padStart(2, '0')}`;

    this.timerDisplay.innerText = str;
  }
}
