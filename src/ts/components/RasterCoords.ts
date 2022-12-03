import { CRS, LatLng, LatLngBounds, Map, Point } from 'leaflet';


export class RasterCoords {
  map: Map;
  width: number;
  height: number;
  tileSize: number;
  zoom: number;
  maxLat: number;
  scale: number;
  mapWidth: number;
  mapHeight: number;

  constructor(map: Map, [width, height]: [number, number], [mapWidth, mapHeight]: [number, number], tileSize: number, scale = 1) {
    this.map = map;
    this.width = width;
    this.height = height;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.tileSize = tileSize;
    this.scale = scale;

    this.zoom = this.zoomLevel();
    this.setMaxBounds();

    this.maxLat = this.getMaxBounds().getSouth();
  }


  public zoomLevel(): number {
    return Math.ceil(Math.log(Math.max(this.width * this.scale, this.height * this.scale) / this.tileSize) / Math.log(2));
  }

  public zoomLevelReal(): number {
    return Math.ceil(Math.log(Math.max(this.width, this.height) / this.tileSize) / Math.log(2));
  }

  public unproject(coords: [number, number] | Point): LatLng {
    return this.map.unproject(coords, this.zoom);
  }

  public project(coords: [number, number] | LatLng): Point {
    return this.map.project(coords, this.zoom);
  }

  public getMaxBounds(): LatLngBounds {
    const sWest = this.unproject([0, this.height * this.scale]);
    const nEast = this.unproject([this.width * this.scale, 0]);

    return new LatLngBounds(sWest, nEast);
  }

  public setMaxBounds(): void {
    const bounds = this.getMaxBounds();
    this.map.setMaxBounds(bounds);
  }

  public unprojectMap(coords: [number, number] | Point): LatLng {
    if (coords instanceof Point) {
      coords.y = -coords.y;

      coords.x += this.mapWidth / 2;
      coords.y += this.mapHeight / 2;

      coords.x *= this.scale;
      coords.y *= this.scale;
    } else {
      coords[1] = -coords[1];

      coords[0] += this.mapWidth / 2;
      coords[1] += this.mapHeight / 2;

      coords[0] *= this.scale * (this.width / this.mapWidth);
      coords[1] *= this.scale * (this.height / this.mapHeight);
    }

    const latLng = this.map.unproject(coords, this.zoom);

    return latLng;
  }

  public projectMap(coords: [number, number] | LatLng): Point {
    const point = this.map.project(coords, this.zoom);

    point.x /= (this.width / this.mapWidth);
    point.y /= (this.height / this.mapHeight);

    point.x -= this.mapWidth / 2;
    point.y -= this.mapHeight / 2;
    point.y = -point.y;

    point.x /= this.scale;
    point.y /= this.scale;

    return point;
  }

  public translateMap(coords: [number, number] | Point, radius: number, heading: number): LatLng[] {
    let x: number;
    let y: number;

    if (coords instanceof Point) {
      x = coords.x;
      y = coords.y;
    } else {
      x = coords[0];
      y = coords[1];
    }


    const xx = x + (radius * Math.cos(heading + (Math.PI / 2)));
    const yy = y + (radius * Math.sin(heading + (Math.PI / 2)));

    return [this.unprojectMap([x, y]), this.unprojectMap([xx, yy])];
  }

  public distanceMap(distance: number): number {
    const projectionHeight = CRS.Simple.distance(this.unprojectMap([0, -this.mapHeight / 2]), this.unprojectMap([0, this.mapHeight / 2]));

    return distance * (projectionHeight / 6000);
  }
}
