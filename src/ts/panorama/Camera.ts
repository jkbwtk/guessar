import { Matrix4, toDegrees, toRadians, Vector3 } from './MathUtils';


export class Camera {
  public target: Vector3;
  public up: Vector3;

  private _fov: number;
  public aspectRatio: number;
  public near: number;
  public far: number;

  public projectionMatrix: Matrix4;

  public viewMatrix: Matrix4;

  constructor(fov: number, aspectRatio: number, near: number, far: number) {
    this.target = new Vector3(1, 0, 0);
    this.up = new Vector3(0, 1, 0);

    this._fov = 0;
    this.fov = fov;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;

    this.projectionMatrix = new Matrix4();

    this.viewMatrix = new Matrix4();

    this.updateProjectionMatrix();
  }

  public updateProjectionMatrix(): void {
    this.projectionMatrix[0] = -1 / (this.aspectRatio * Math.tan(this._fov / 2));

    this.projectionMatrix[5] = 1 / Math.tan(this._fov / 2);

    this.projectionMatrix[10] = (-this.near - this.far) / (this.near - this.far);
    this.projectionMatrix[11] = (this.near * this.far) / (this.near - this.far);

    this.projectionMatrix[14] = 1;

    this.updateViewMatrix();
  }

  public updateViewMatrix(): void {
    const z = new Vector3().sub(this.target).normalize();
    const x = this.up.clone().cross(z).normalize();
    const y = z.clone().cross(x).normalize();

    const cameraMatrix = new Matrix4([
      ...x, 0,
      ...y, 0,
      ...z, 0,
      0, 0, 0, 1,
    ]);

    this.viewMatrix = this.projectionMatrix
      .clone()
      .multiply(cameraMatrix.inverse())
      .inverse();
  }

  public setTarget(x: number, y: number, z: number): this {
    this.target.set([x, y, z]);
    return this;
  }

  public setUp(x: number, y: number, z: number): this {
    this.up.set([x, y, z]);
    return this;
  }

  public setRotation(phi: number, theta: number): this {
    this.target.set([
      Math.cos(phi) * Math.cos(theta),
      Math.sin(theta),
      Math.sin(phi) * Math.cos(theta),
    ]);
    return this;
  }

  public setFov(fov: number): this {
    this._fov = fov;
    return this;
  }

  public setAspectRatio(aspectRatio: number): this {
    this.aspectRatio = aspectRatio;
    return this;
  }

  public get fov(): number {
    return toDegrees(this._fov);
  }

  public set fov(fovDegrees: number) {
    this._fov = toRadians(fovDegrees);
  }
}
