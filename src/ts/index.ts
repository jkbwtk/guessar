import { GameSettings } from './GameSettings.js';
import { NavBar } from './NavBar.js';


const navbar = new NavBar();

const topBar = document.getElementById('topBar');
if (topBar === null) throw new Error('Could not find top bar element');


const onMutation = (mutations: MutationRecord[]) => {
  for (const mutation of mutations) {
    if (mutation.target !== topBar) continue;
    if (mutation.attributeName !== 'class') continue;
    if (mutation.oldValue === topBar.className) continue;

    if (
      !topBar.classList.contains('disabled') &&
      mutation.oldValue?.includes('disabled')
    ) {
      navbar.onLoad();
    }
  }
};

const mutationObserver = new MutationObserver(onMutation);

mutationObserver.observe(topBar, {
  attributes: true,
  attributeFilter: ['class'],
  attributeOldValue: true,
});


const handleStartGame = async (ev: Event) => {
  if (ev.target === null) return;
  if (!(ev.target instanceof HTMLElement)) return;

  ev.target.classList.add('button-awaiting');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await GameSettings.createGame({
    allowMove: true,
    allowPan: true,
    allowZoom: true,
    roundTime: 0,
  });

  ev.target.classList.remove('button-awaiting');
};

const startGame = document.getElementById('startGame');

if (startGame !== null) {
  startGame.addEventListener('click', handleStartGame);
}
