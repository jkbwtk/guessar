import { GameSettings } from './GameSettings';
import { Game } from './game/Game';


const isInGame = () => {
  const url = window.location.pathname;
  return url.match(/^\/game\/[\d\w]+\/?$/) !== null;
};

const container = document.getElementById('container');
if (container === null) {
  throw new Error('Could not find container element');
}

const topBar = document.getElementById('topBar');
if (topBar === null) {
  throw new Error('Could not find top bar element');
}

const gameStartContainer = document.getElementById('gameStartContainer');


if (isInGame()) {
  topBar.classList.add('disabled');
  gameStartContainer?.classList.add('disabled');

  container.classList.add('explore-container');

  Game.getGame()
    .then((gameInfo) => {
      const game = new Game(container, topBar, gameInfo);
    })
    .catch((err) => {
      location.href = '/game';
    });
} else {
  topBar.classList.remove('disabled');
  gameStartContainer?.classList.remove('disabled');

  container.classList.remove('explore-container');
  const gameSettings = new GameSettings();
}
