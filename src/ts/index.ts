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
