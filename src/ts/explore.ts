import { PanoramaViewer } from './panorama/PanoramaViewer';

const container = document.getElementById('explore-container');
if (container === null) {
  throw new Error('Could not find container element');
}

const viewer = new PanoramaViewer(container);
