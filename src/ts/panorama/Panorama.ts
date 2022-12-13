import { GetView, VerboseCoordinates } from '../types/panorama';
import { EventEmitter } from 'events';
import { Camera } from './Camera';
import { Spherical } from './MathUtils';
import { PanoramaControls, PanoramaControlsUpdate } from './PanoramaControls';
import vertexShaderSource from './Vertex.glsl';
import fragmentShaderSource from './Fragment.glsl';
import { ImageLoader } from './ImageLoader';


export interface PanoramaOptions {
  fov: number;
  panoramaDirLevel: number;
  fade: boolean;
}

declare interface Panorama {
  on(event: 'viewReady', listener: () => void): this;
  on(event: 'viewChange', listener: (view: VerboseCoordinates) => void): this;
  on(event: 'rotation', listener: (rotation: Spherical) => void): this;
  on(event: 'zoom', listener: (fov: number) => void): this;
  on(event: 'animationFinished', listener: () => void): this;
  on(event: 'frame', listener: (frametime: number) => void): this;

  emit(event: 'viewReady'): boolean;
  emit(event: 'viewChange', view: VerboseCoordinates): boolean;
  emit(event: 'rotation', rotation: Spherical): boolean;
  emit(event: 'zoom', fov: number): boolean;
  emit(event: 'animationFinished'): boolean;
  emit(event: 'frame', frametime: number): boolean;
}

class Panorama extends EventEmitter {
  public static defaultOptions = {
    fov: 90,
    panoramaDirLevel: 3,
    fade: true,
  };

  private options: PanoramaOptions;

  public canvas: HTMLCanvasElement;
  private ctx: WebGL2RenderingContext;

  private camera: Camera;
  public controls: PanoramaControls;

  private program: WebGLProgram;
  private viewLocation: WebGLUniformLocation;

  private vertexArray: WebGLVertexArrayObject;

  private imageLoader: ImageLoader;

  private frametime = 0;
  private lastTimestamp = 0;
  private firstLoad = true;

  constructor(options?: Partial<PanoramaOptions>) {
    super();

    this.options = Object.assign(Panorama.defaultOptions, options);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('panorama-canvas');
    const ctx = this.canvas.getContext('webgl2');
    if (ctx === null) throw new Error('WebGL2 not supported');
    this.ctx = ctx;

    this.camera = new Camera(this.options.fov, this.aspectRatio, 1, 2000);
    this.controls = new PanoramaControls(this.camera, this.canvas);


    const vertexShader = this.createShader(this.ctx.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.ctx.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = this.createProgram(vertexShader, fragmentShader);

    const viewLocation = this.ctx.getUniformLocation(this.program, 'uViewDirectionProjectionInverse');
    if (viewLocation === null) throw Error('Error getting viewDirectionProjectionInverse location');
    this.viewLocation = viewLocation;

    const vertexArray = this.ctx.createVertexArray();
    if (vertexArray === null) throw Error('Error creating vertex array');
    this.vertexArray = vertexArray;

    this.ctx.bindVertexArray(this.vertexArray);

    const positionBuffer = this.ctx.createBuffer();
    if (positionBuffer === null) throw Error('Error creating position buffer');
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, positionBuffer);

    this.setGeometry();

    const location = this.ctx.getAttribLocation(this.program, 'aPosition');
    this.ctx.enableVertexAttribArray(location);
    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, positionBuffer);
    this.ctx.vertexAttribPointer(location, 2, this.ctx.FLOAT, false, 0, 0);

    this.imageLoader = new ImageLoader();

    this.ctx.useProgram(this.program);


    this.update(0);
    this.registerEventListeners();
  }

  private registerEventListeners() {
    window.addEventListener('resize', this.resizeViewer);
  }

  public unregisterEventListeners(): void {
    window.removeEventListener('resize', this.resizeViewer);
  }

  private get aspectRatio(): number {
    return this.canvas.width / this.canvas.height;
  }

  public resizeViewer = (): void => {
    this.canvas.width = 0;
    this.canvas.height = 0;

    if (this.canvas.parentElement === null) throw Error('Canvas has no parent element');
    const { width, height } = this.canvas.parentElement.getBoundingClientRect();

    this.canvas.width = width;
    this.canvas.height = height;

    this.camera.aspectRatio = this.aspectRatio;
    this.camera.updateProjectionMatrix();

    this.controls.resizeController();
    this.redraw(0);
  };

  public update = (timestamp: number): void => {
    this.frametime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.camera.updateViewMatrix();

    const updates = this.processControls(timestamp);
    if (updates.size > 0) {
      this.emit('frame', this.frametime);
      this.redraw(timestamp);
    }

    requestAnimationFrame(this.update);
  };

  private processControls(timestamp: number): Set<PanoramaControlsUpdate> {
    const updates = this.controls.update(this.frametime);

    if (updates.has(PanoramaControlsUpdate.ROTATION)) {
      this.emit('rotation', this.controls.spherical);
    }

    if (updates.has(PanoramaControlsUpdate.ZOOM)) {
      this.emit('zoom', this.camera.fov);
    }

    if (updates.has(PanoramaControlsUpdate.FINISHED)) {
      console.log('Animation finished');

      const url = new URL(location.href);
      url.searchParams.set('fov', this.controls.fov.toString());
      url.searchParams.set('phi', this.controls.phi.toString());
      url.searchParams.set('theta', this.controls.theta.toString());
      window.history.replaceState('', '', url);

      this.emit('animationFinished');
    }

    return updates;
  }

  private redraw(timestamp: number): void {
    this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.ctx.uniformMatrix4fv(
      this.viewLocation, false,
      this.camera.viewMatrix);

    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 6);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.ctx.createShader(type);
    if (shader === null) throw Error('Shader compilation failed');

    this.ctx.shaderSource(shader, source);
    this.ctx.compileShader(shader);
    const success = this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(this.ctx.getShaderInfoLog(shader));
    this.ctx.deleteShader(shader);
    throw Error('Shader compilation failed');
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.ctx.createProgram();
    if (program === null) throw Error('Program init failed');


    this.ctx.attachShader(program, vertexShader);
    this.ctx.attachShader(program, fragmentShader);
    this.ctx.linkProgram(program);
    const success = this.ctx.getProgramParameter(program, this.ctx.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(this.ctx.getProgramInfoLog(program));
    this.ctx.deleteProgram(program);
    throw Error('Program init failed');
  }

  private setGeometry() {
    const positions = new Float32Array(
      [
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]);
    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, positions, this.ctx.STATIC_DRAW);
  }

  private async loadTexture(url: string): Promise<void> {
    const faceInfos = [
      {
        target: this.ctx.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: this.getPanoramaPath(url, 3),
      },
      {
        target: this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: this.getPanoramaPath(url, 5),
      },
      {
        target: this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: this.getPanoramaPath(url, 1),
      },
      {
        target: this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: this.getPanoramaPath(url, 0),
      },
      {
        target: this.ctx.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: this.getPanoramaPath(url, 2),
      },
      {
        target: this.ctx.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: this.getPanoramaPath(url, 4),
      },
    ];

    const images = await Promise.allSettled(faceInfos.map(({ url }) => this.imageLoader.load(url)));
    const faces = images.map((image, index) => ({
      target: faceInfos[index].target,
      image: image.status === 'fulfilled' ? image.value : new ImageData(1024, 1024),
    }));


    const texture = this.ctx.createTexture();
    if (texture === null) throw Error('Error creating texture');

    this.ctx.bindTexture(this.ctx.TEXTURE_CUBE_MAP, texture);

    for (const { target, image } of faces) {
      const level = 0;
      const internalFormat = this.ctx.RGBA;
      const srcFormat = this.ctx.RGBA;
      const srcType = this.ctx.UNSIGNED_BYTE;

      this.ctx.texImage2D(target, level, internalFormat, srcFormat, srcType, image);
      // this.ctx.generateMipmap(this.ctx.TEXTURE_CUBE_MAP);

      this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
      this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
      this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
      // this.ctx.texParameteri(this.ctx.TEXTURE_CUBE_MAP, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);
    }
  }

  private getPanoramaPath(uuid: string, index: number): string {
    let p = '/public/img/panoramas';

    for (let i = 0; i < this.options.panoramaDirLevel; i += 1) {
      p = [p, uuid[i]].join('/');
    }

    return [p, `${uuid}_${index}.webp`].join('/');
  }

  public async changePanorama(panorama: GetView): Promise<void> {
    const target = panorama.data.target;
    if (this.options.fade) this.blur();

    if (this.firstLoad) this.controls.setPhi(target.position.r);
    this.firstLoad = false;

    await this.loadTexture(panorama.data.target.uuid);

    this.redraw(0);
    if (this.options.fade) this.unblur();

    this.emit('viewReady');
  }

  private blur(): void {
    this.canvas.classList.add('panorama-canvas-blur');
  }

  private unblur(): void {
    this.canvas.classList.remove('panorama-canvas-blur');
  }
}

export {
  Panorama,
};
