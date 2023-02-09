import { LatLngBounds, Marker, Polyline, TileLayer } from 'leaflet';
import { Node } from '../components/Node';
import { Stylized } from '../components/Stylized';
import { SummaryMap } from '../components/SummaryMap';
import { LeafletFactory } from '../LeafletFactory';
import { Vector2 } from '../panorama/MathUtils';
import { Game, Round } from '../types/game';


export declare interface Summary {
  on(event: 'nextRound', listener: () => void): this;

  emit(event: 'nextRound'): boolean;
}

export class Summary extends Stylized {
  protected styles = Stylized.createStyle('/public/css/components/RoundSummary.css');

  public element: HTMLDivElement;

  public map: SummaryMap;
  public roundCounter: HTMLSpanElement;
  public pointsDisplay: HTMLSpanElement;
  public distanceTextLeft: HTMLSpanElement;
  public distanceTextRight: HTMLSpanElement;
  public distanceDisplay: HTMLSpanElement;
  public button: HTMLButtonElement;
  public pointsBar: HTMLDivElement;

  public polyLine: Polyline;

  constructor() {
    super();
    this.map = new SummaryMap();
    this.map.element.classList.add('round-summary-map');

    this.polyLine = LeafletFactory.polyLine();

    this.map.map.addLayer(this.polyLine);

    this.roundCounter = new Node('span')
      .addClass('round-summary-round-counter')
      .innerText('Round ?')
      .unwrapUnsafe();

    this.pointsDisplay = new Node('span')
      .innerText('? Points')
      .addClass('round-summary-info-points')
      .unwrapUnsafe();

    this.pointsBar = new Node('div')
      .addClass('round-summary-info-bar-fill')
      .unwrapUnsafe();

    this.distanceTextLeft = new Node('span').innerText('Your guess was ').unwrapUnsafe();
    this.distanceTextRight = new Node('span').innerText(' off.').unwrapUnsafe();

    this.distanceDisplay = new Node('span')
      .innerText('? meters')
      .addClass('round-summary-info-distance-accent')
      .unwrapUnsafe();

    this.button = new Node('button')
      .innerText('Continue')
      .addClass('button-big')
      .addClass('round-summary-button')
      .unwrapUnsafe();

    const topInfoContainer = new Node('div')
      .addClass('round-summary-sub-container')
      .addClass('round-summary-top-info-container')
      .appendChild(this.roundCounter)
      .appendChild(new Node('span').innerText('Summary').unwrapUnsafe())
      .unwrapUnsafe();

    const bottomInfoContainer = new Node('div')
      .addClass('round-summary-sub-container')
      .appendChild(this.pointsDisplay)
      .appendChild(new Node('div')
        .addClass('round-summary-info-bar')
        .appendChild(this.pointsBar)
        .unwrapUnsafe())
      .appendChild(new Node('div')
        .addClass('round-summary-info-distance')
        .appendChild(this.distanceTextLeft)
        .appendChild(this.distanceDisplay)
        .appendChild(this.distanceTextRight)
        .unwrapUnsafe())
      .appendChild(this.button)
      .unwrapUnsafe();

    const imageContainer = new Node('img')
      .addClass('round-summary-info-image')
      .map(Node.src('/public/img/background05_lq.webp'))
      .unwrapUnsafe();

    this.element = new Node('div')
      .addClass('round-summary-container')
      .appendChild(this.map.element)
      .appendChild(topInfoContainer)
      .appendChild(imageContainer)
      .appendChild(bottomInfoContainer)
      .unwrapUnsafe();

    this.registerEventHandlers();
    this.injectStyles();
  }

  private registerEventHandlers(): void {
    this.button.addEventListener('click', () => {
      this.emit('nextRound');
    });
  }

  public update(summary: Round): void {
    if (summary.score === null) throw new Error('Score is null');
    if (summary.guess_coordinates === null) throw new Error('Guess coordinates is null');

    this.roundNumber = summary.number;
    this.points = summary.score;
    this.distance = new Vector2(
      summary.guess_coordinates.x - summary.target_coordinates.x,
      summary.guess_coordinates.y - summary.target_coordinates.y,
    ).vecLength();

    this.updateMap(summary);
  }

  public set roundNumber(roundNumber: number) {
    this.roundCounter.innerText = `Round ${roundNumber + 1}`;
  }

  public set points(points: number) {
    this.pointsDisplay.innerText = `${points.toFixed(0)} Points`;
    this.pointsBar.style.width = `${points / 1000 * 100}%`;
  }

  public set distance(distance: number) {
    this.distanceDisplay.innerText = `${distance.toFixed(0)} meters`;
  }

  public updateMap(summary: Round): void {
    if (summary.guess_coordinates === null) throw new Error('Guess coordinates is null');

    const targetCoords = this.map.coords.unprojectMap([
      summary.target_coordinates.x,
      summary.target_coordinates.y,
    ]);

    const guessCoords = this.map.coords.unprojectMap([
      summary.guess_coordinates.x,
      summary.guess_coordinates.y,
    ]);

    this.map.pickMarker.setLatLng(guessCoords);
    this.map.pickMarker.setOpacity(1);

    this.map.targetMarker.setLatLng(targetCoords);
    this.map.targetMarker.setOpacity(1);

    this.map.targetMarker.setZIndexOffset(1000);

    this.polyLine.setLatLngs([targetCoords, guessCoords]);

    this.map.map.setView(this.map.coords.unprojectMap([0, 0]), 0, { animate: false });
    this.map.map.fitBounds(new LatLngBounds(targetCoords, guessCoords), {
      animate: true,
      padding: [50, 50],
      maxZoom: 6,
    });
  }

  public finishGame(game: Game, rounds: Round[]): void {
    if (game.final_score === null) throw new Error('Final score is null');
    if (game.final_time === null) throw new Error('Final time is null');

    this.roundCounter.innerText = 'Game';

    this.points = game.final_score;

    this.pointsBar.style.width = `${game.final_score / (1000 * game.rounds) * 100}%`;

    this.distanceTextLeft.innerText = 'You finished in ';
    this.distanceDisplay.innerText = this.convertToFancyTime(game.final_time);
    this.distanceTextRight.innerText = '';

    this.button.innerText = 'New Game';

    this.map.map.eachLayer((layer) => {
      if (layer instanceof TileLayer) return;
      if (layer instanceof Marker) layer.setOpacity(0);
      if (layer instanceof Polyline) layer.setLatLngs([]);
    });

    for (const round of rounds) {
      if (round.guess_coordinates === null) continue;

      const target = this.map.coords.unprojectMap([
        round.target_coordinates.x,
        round.target_coordinates.y,
      ]);

      const guess = this.map.coords.unprojectMap([
        round.guess_coordinates.x,
        round.guess_coordinates.y,
      ]);

      const guessMarker = LeafletFactory.pickMarker(1);
      guessMarker.setLatLng(guess);
      guessMarker.addTo(this.map.map);

      const targetMarker = LeafletFactory.targetMarker(1);
      targetMarker.setLatLng(target);
      targetMarker.addTo(this.map.map);

      const polyLine = LeafletFactory.polyLine([target, guess]);
      polyLine.addTo(this.map.map);
    }

    this.map.map.fitBounds(LeafletFactory.mapBounds(this.map.coords), {
      animate: true,
      padding: [0, 0],
    });
  }

  private convertToFancyTime(time: number): string {
    let str = '';


    if (time > 60) {
      if (time > 3600) {
        str += `${Math.floor(time / 3600).toFixed(0).padStart(2, '0')}:`;
      }

      str += `${Math.floor((time % 3600) / 60).toFixed(0).padStart(2, '0')}:`;
      str += `${(time % 60).toFixed(0).padStart(2, '0')}`;
    } else {
      str += `${time.toFixed(0)} seconds`;
    }

    return str;
  }

  public mounted(): void {
    this.map.mounted();
  }
}
