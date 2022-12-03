import { clamp, Spherical, Vector2 } from './MathUtils';
import { Camera as PerspectiveCamera } from './Camera';

export enum PanoramaControlsUpdate {
  ROTATION,
  ZOOM,
  FINISHED,
}

export interface PanoramaControlsOptions {
  fov: {
    min: number,
    max: number,
    step: number,

    smooth: boolean,
    damping: number,
  }
}

export class PanoramaControls {
  public spherical: Spherical;
  public camera: PerspectiveCamera;
  public controller: HTMLElement;

  public viewUpdated: boolean;
  private clickStart: Vector2;
  private clickEnd: Vector2;
  private mousePosition: Vector2;
  private momentum: Vector2;
  private clicked: boolean;
  private lastClicked: boolean;

  private targetFov: number;

  private controllerWidth: number;
  private controllerHeight: number;


  private lastUpdates: Set<PanoramaControlsUpdate>;

  public options: PanoramaControlsOptions = {
    fov: {
      min: 5,
      max: 135,
      step: 25,

      smooth: true,
      damping: 5,
    },
  };

  constructor(camera: PerspectiveCamera, controller: HTMLElement, options: Partial<PanoramaControlsOptions> = {}) {
    this.camera = camera;
    this.controller = controller;

    this.options = Object.assign(this.options, options);

    this.spherical = new Spherical();
    this.clickStart = new Vector2();
    this.clickEnd = new Vector2();
    this.mousePosition = new Vector2();
    this.momentum = new Vector2();

    this.targetFov = this.camera.fov;
    this.viewUpdated = false;
    this.clicked = false;
    this.lastClicked = false;

    this.lastUpdates = new Set();

    // if (this.controller.parentElement === null) throw new Error('Controller parent element is null');
    const controllerRect = this.controller.getBoundingClientRect();
    this.controllerWidth = controllerRect.width;
    this.controllerHeight = controllerRect.height;


    this.registerEventHandlers();
  }

  public setTheta(theta: number): void {
    this.theta = theta;
  }

  public setPhi(phi: number): void {
    this.phi = phi;
  }

  public set phi(phi: number) {
    this.viewUpdated = true;
    this.spherical.phi = phi % (Math.PI * 2);
  }

  public get phi(): number {
    return this.spherical.phi;
  }

  public set theta(theta: number) {
    this.viewUpdated = true;
    this.spherical.theta = clamp(theta, -Math.PI / 2, Math.PI / 2);
  }

  public get theta(): number {
    return this.spherical.theta;
  }

  public setFov(fov: number): void {
    this.fov = fov;
  }

  public set fov(fov: number) {
    this.targetFov = clamp(fov, this.options.fov.min, this.options.fov.max);
  }

  public get fov(): number {
    return this.targetFov;
  }

  public resizeController(): void {
    const controllerRect = this.controller.getBoundingClientRect();
    this.controllerWidth = controllerRect.width;
    this.controllerHeight = controllerRect.height;
  }

  public update(frametime: number): Set<PanoramaControlsUpdate> {
    const frametimeFactor = clamp(frametime / 10, 0.1, 10);
    const updates: Set<PanoramaControlsUpdate> = new Set();

    if (!this.clicked && this.momentum.vecLength() > 0.1) {
      this.momentum.x *= 1 - (0.08 * frametimeFactor);
      this.momentum.y *= 1 - (0.08 * frametimeFactor);

      const position = new Vector2(this.controllerWidth / 2, this.controllerHeight / 2);
      const delta = new Vector2(this.momentum.x, this.momentum.y);

      this.moveCamera(position, delta);
    } else if (this.momentum.vecLength() > 0.1) {
      this.momentum.x *= (0.3 / frametimeFactor);
      this.momentum.y *= (0.3 / frametimeFactor);
    }


    if (this.options.fov.smooth) {
      const fovAbs = Math.abs(this.camera.fov - this.targetFov);

      if (fovAbs >= 1) {
        if (this.camera.fov > this.targetFov) {
          this.camera.fov = clamp(this.camera.fov - fovAbs / this.options.fov.damping * frametimeFactor, this.options.fov.min, this.options.fov.max);
        } else {
          this.camera.fov = clamp(this.camera.fov + fovAbs / this.options.fov.damping * frametimeFactor, this.options.fov.min, this.options.fov.max);
        }

        this.camera.updateProjectionMatrix();
        updates.add(PanoramaControlsUpdate.ZOOM);
      }
    } else if (this.camera.fov != this.targetFov) {
      this.camera.fov = this.targetFov;

      this.camera.updateProjectionMatrix();
      updates.add(PanoramaControlsUpdate.ZOOM);
    }

    if (this.viewUpdated) {
      this.camera.setRotation(this.spherical.phi, this.spherical.theta);
      this.camera.updateViewMatrix();

      this.viewUpdated = false;

      updates.add(PanoramaControlsUpdate.ROTATION);
    }

    if (!this.clicked && updates.size === 0 && this.lastUpdates.size > 0 && !this.lastUpdates.has(PanoramaControlsUpdate.FINISHED)) {
      updates.add(PanoramaControlsUpdate.FINISHED);
    } else if (this.lastClicked && !this.clicked && updates.size === 0 && this.clickEnd.clone().sub(this.clickStart).vecLength() !== 0) {
      updates.add(PanoramaControlsUpdate.FINISHED);
    }

    this.lastClicked = this.clicked;
    this.lastUpdates = updates;
    return updates;
  }

  private registerEventHandlers() {
    this.controller.addEventListener('pointerdown', this.hadleMouseDown);
    this.controller.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  private hadleMouseDown = (event: PointerEvent) => {
    this.clickStart.x = event.x;
    this.clickStart.y = event.y;

    this.mousePosition.x = event.x;
    this.mousePosition.y = event.y;


    this.clicked = true;

    this.controller.setPointerCapture(event.pointerId);
    this.controller.addEventListener('pointerup', this.hadleMouseUp);
    this.controller.addEventListener('pointermove', this.handleMouseMove);
  };

  private hadleMouseUp = (event: PointerEvent) => {
    this.clickEnd.x = event.x;
    this.clickEnd.y = event.y;


    this.clicked = false;

    this.controller.releasePointerCapture(event.pointerId);
    this.controller.removeEventListener('pointerup', this.hadleMouseUp);
    this.controller.removeEventListener('pointermove', this.handleMouseMove);
  };

  private handleMouseMove = (event: PointerEvent) => {
    const position = new Vector2(event.x, event.y);

    const delta = this.mousePosition.clone().sub(position);

    this.momentum.add(delta);

    this.mousePosition.x = event.x;
    this.mousePosition.y = event.y;

    this.moveCamera(position, delta);
  };

  private handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
    } else if (event.deltaY > 0) {
      this.zoomOut();
    }
  };

  public zoomIn(): void {
    this.targetFov -= this.options.fov.step;
    this.targetFov = clamp(this.targetFov, this.options.fov.min, this.options.fov.max);
  }

  public zoomOut(): void {
    this.targetFov += this.options.fov.step;
    this.targetFov = clamp(this.targetFov, this.options.fov.min, this.options.fov.max);
  }

  private moveCamera(position: Vector2, delta: Vector2) {
    const width = this.controllerWidth;
    const height = this.controllerHeight;

    const hFov = this.camera.fov * 0.01745329252;
    const vFov = 2 * Math.atan(Math.tan(hFov / 2) * height / width);


    const hCorrection = ((1 - (hFov / Math.PI)) / 2) + (hFov / Math.PI) * (position.x / width);
    let hMult = 2 * Math.sqrt(2 * 0.5 * hCorrection - (hCorrection * hCorrection));

    const vCorrection = ((1 - (vFov / Math.PI)) / 2) + (vFov / Math.PI) * (position.y / height);
    let vMult = 2 * Math.sqrt(2 * 0.5 * vCorrection - (vCorrection * vCorrection));

    if (isNaN(hMult)) {
      hMult = 0;
    }

    if (isNaN(vMult)) {
      vMult = 0;
    }

    const sensitivity = 2;

    this.theta -= (vFov / height) * delta.y * vMult * sensitivity;
    this.phi -= (hFov / width) * delta.x * hMult * sensitivity;
  }
}
