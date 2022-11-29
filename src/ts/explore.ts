import { Panorama } from './panorama/Panorama';
import { GetRandomCoordinates } from './types/panorama';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const panorama = new Panorama(canvas);
panorama.resizeViewer();

panorama.changePanorama({
  data: {
    target: {
      uuid: '768bac1a-e70d-4e92-8824-334b340cb42d',
      position: {
        x: 0,
        y: 0,
        z: 0,
        r: 0,
      },
    },
  },
} as GetRandomCoordinates);
