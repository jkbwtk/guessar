import { Explore } from './explore/Explore';

const container = document.getElementById('explore-container');
if (container === null) {
  throw new Error('Could not find container element');
}

const viewer = new Explore(container);
