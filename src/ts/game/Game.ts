import { Guessing } from './Guessing';
import { GetView } from '../types/panorama';
import { Summary } from './Summary';
import { Game as GameInfo, Round } from '../types/game';
import { Point } from 'leaflet';


export enum GameState {
  GUESSING,
  ROUND_RESULTS,
  GAME_RESULTS,
}

export class Game {
  private guessingInterface: Guessing;
  private summaryInterface: Summary;

  private gameId: string;
  private currentRound: Round | null = null;

  private completedRounds: Round[] = [];
  private state: GameState;

  constructor(private container: HTMLElement, private topBar: HTMLElement, private game: GameInfo) {
    console.log(this.game);

    this.summaryInterface = new Summary();
    this.guessingInterface = new Guessing({
      allowMove: (this.game.settings & 1) !== 0,
      allowPan: (this.game.settings & 2) !== 0,
      allowZoom: (this.game.settings & 4) !== 0,
    });

    this.state = GameState.GUESSING;

    this.gameId = Game.getGameId();

    this.registerEventHandlers();
    this.initGame();
  }

  public async initGame(): Promise<void> {
    this.completedRounds = await this.getCompletedRounds();

    if (this.game.final_score !== null) {
      this.changeState(GameState.GAME_RESULTS);
      this.summaryInterface.finishGame(this.game, this.completedRounds);
    } else {
      this.currentRound = await this.getNextRound();
      this.changeState(GameState.GUESSING);
    }
  }

  public changeState(state: GameState): void {
    this.state = state;

    switch (state) {
      case GameState.GUESSING:
        if (this.guessingInterface === null) throw new Error('Guessing interface not initialized');
        if (this.currentRound === null) throw new Error('Current round not initialized');

        if (this.summaryInterface.element.parentNode === this.container) {
          this.container.removeChild(this.summaryInterface.element);
        }

        this.guessingInterface.gameWidget.update({
          points: this.getTotalScore(),
          round: this.getRoundNumber() + 1,
          maxRounds: this.getNumberOfRounds(),
          roundTime: this.game.time_limit,
          roundStartTime: this.currentRound.created_at,
        });

        this.topBar.classList.add('disabled');
        this.container.appendChild(this.guessingInterface.element);
        this.guessingInterface.mounted();


        this.initPanorama();

        break;
      case GameState.ROUND_RESULTS:
        if (this.guessingInterface.element.parentNode === this.container) {
          this.container.removeChild(this.guessingInterface.element);
        }

        this.topBar.classList.remove('disabled');
        this.container.appendChild(this.summaryInterface.element);

        this.summaryInterface.mounted();

        break;

      case GameState.GAME_RESULTS:
        if (this.guessingInterface.element.parentNode === this.container) {
          this.container.removeChild(this.guessingInterface.element);
        }

        this.topBar.classList.remove('disabled');
        this.container.appendChild(this.summaryInterface.element);

        this.summaryInterface.mounted();

        break;
      default:
        throw new Error(`Invalid game state: ${GameState[state]}(${state}`);
    }
  }

  private initPanorama = async (): Promise<void> => {
    if (this.currentRound === null) throw new Error('No round to load');
    await this.guessingInterface.changePanorama(this.currentRound.target_uuid, true);
  };

  private registerEventHandlers(): void {
    this.guessingInterface.map.on('resetPosition', this.initPanorama);

    this.guessingInterface.map.on('confirmPick', this.handleConfirmPick);

    this.summaryInterface.on('nextRound', this.handleNextRound);
  }

  public static getGame = async (): Promise<GameInfo> => {
    const game = await (await fetch(`/api/v1/game/${Game.getGameId()}`)).json() as GameInfo;
    return game;
  };

  private getNextRound = async () => {
    const round = await (await fetch(`/api/v1/game/${this.gameId}/round`)).json() as Round;
    return round;
  };

  private getCompletedRounds = async () => {
    const rounds = await (await fetch(`/api/v1/game/${this.gameId}/rounds`)).json() as Round[];
    return rounds;
  };

  public static getGameId(): string {
    const match = location.pathname.match(/^\/game\/([\d\w]+)\/?$/);
    if (match === null || !match[1]) {
      location.href = '/game';
      return '???';
    }

    return match[1];
  }

  private handleConfirmPick = async (point: Point) => {
    if (!this.currentRound) {
      location.href = '/game';
    }

    const response = await fetch(`/api/v1/game/${this.gameId}/round`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x: point.x,
        y: point.y,
      }),
    });

    if (response.status === 200) {
      const results = await response.json();
      this.changeState(GameState.ROUND_RESULTS);

      this.completedRounds.push(results);
      this.summaryInterface.update(results);
    }
  };

  private handleNextRound = async () => {
    if (this.state === GameState.GAME_RESULTS) {
      location.href = '/game';
      return;
    }

    if (this.currentRound === null) throw new Error('No round to load');

    if (this.getNumberOfRounds() === this.getNumberOfCompletedRounds()) {
      const game = await Game.getGame();
      const rounds = await this.getCompletedRounds();
      this.changeState(GameState.GAME_RESULTS);
      this.summaryInterface.finishGame(game, rounds);
    } else {
      this.currentRound = await this.getNextRound();
      this.guessingInterface.map.pickMarker.setOpacity(0);
      this.changeState(GameState.GUESSING);
    }
  };

  private getNumberOfCompletedRounds(): number {
    return this.completedRounds.length;
  }

  private getNumberOfRounds(): number {
    return this.game.rounds;
  }

  private getRoundNumber(): number {
    if (this.currentRound === null) throw new Error('No round loaded');
    return this.currentRound.number;
  }

  private getTotalScore(): number {
    let score = 0;

    this.completedRounds
      .filter((round) => round.score !== null)
      .forEach((round) => score += round.score ?? 0);

    return score;
  }
}
