import { Game, Settings } from './types/game';


export class GameSettings {
  private roundZoomInput: HTMLInputElement;
  private roundPanInput: HTMLInputElement;
  private roundMoveInput: HTMLInputElement;

  private roundTimeInput: HTMLInputElement;
  private roundTimeLabel: HTMLLabelElement;

  private startButton: HTMLButtonElement;

  constructor() {
    this.roundZoomInput = document.getElementById('roundZoomInput') as HTMLInputElement;
    this.roundPanInput = document.getElementById('roundPanInput') as HTMLInputElement;
    this.roundMoveInput = document.getElementById('roundMoveInput') as HTMLInputElement;

    this.roundTimeInput = document.getElementById('roundTimeInput') as HTMLInputElement;
    this.roundTimeLabel = document.getElementById('roundTimeLabel') as HTMLLabelElement;

    if (this.roundTimeInput === null || this.roundTimeLabel === null) {
      throw new Error('roundTimeInput or roundTimeLabel not found');
    }

    if (this.roundZoomInput === null) throw new Error('roundZoomInput not found');
    if (this.roundPanInput === null) throw new Error('roundPanInput not found');
    if (this.roundMoveInput === null) throw new Error('roundMovesInput not found');

    this.roundTimeInput.addEventListener('input', () => {
      this.roundTimeLabel.innerText = this.roundTimeInput.value;
    });


    this.startButton = document.getElementById('startButton') as HTMLButtonElement;

    if (!this.startButton) {
      throw new Error('startButton not found');
    }

    this.startButton.addEventListener('click', this.startGame);
  }

  private startGame = async () => {
    this.startButton.classList.add('button-awaiting');

    const settings: Settings = {
      allowZoom: this.roundZoomInput.checked,
      allowPan: this.roundPanInput.checked,
      allowMove: this.roundMoveInput.checked,
      roundTime: parseInt(this.roundTimeInput.value, 10),
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await GameSettings.createGame(settings);

    this.startButton.classList.remove('button-awaiting');
  };

  public static async createGame(settings: Settings): Promise<void> {
    try {
      const game = await (await fetch('/api/v1/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })).json() as Game;

      window.location.href = `/game/${game.uniqid}`;
    } catch (err) { }
  }
}
