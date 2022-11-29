export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const toRadians = (degrees: number): number => degrees * Math.PI / 180;
export const toDegrees = (radians: number): number => radians * 180 / Math.PI;


export interface Vector {
  vecLength(): number;
  clone(): Vector;
  add(vector: Vector): this;
  sub(vector: Vector): this;
  normalize(): this;
}

export class Spherical {
  private array: Float32Array;

  constructor(radius?: number, phi?: number, theta?: number) {
    this.array = new Float32Array(3);

    this[0] = radius ?? 1.0;
    this[1] = phi ?? 0;
    this[2] = theta ?? 0;
  }

  public get [0](): number {
    return this.array[0];
  }

  public set [0](value: number) {
    this.array[0] = value;
  }

  public get [1](): number {
    return this.array[1];
  }

  public set [1](value: number) {
    this.array[1] = value;
  }

  public get [2](): number {
    return this.array[2];
  }

  public set [2](value: number) {
    this.array[2] = clamp(value, -Math.PI / 2 + 0.000001, Math.PI / 2 - 0.000001);
  }

  public get radius(): number {
    return this[0];
  }

  public set radius(radius: number) {
    this[0] = radius;
  }

  public get phi(): number {
    return this[1];
  }

  public set phi(phi: number) {
    this[1] = phi;
  }

  public get theta(): number {
    return this[2];
  }

  public set theta(theta: number) {
    this[2] = theta;
  }
}

export class Vector2 extends Float32Array implements Vector {
  constructor(x?: number, y?: number) {
    super(2);

    this.x = x ?? 0;
    this.y = y ?? 0;
  }

  public get x(): number {
    return this[0];
  }

  public set x(value: number) {
    this[0] = value;
  }

  public get y(): number {
    return this[1];
  }

  public set y(value: number) {
    this[1] = value;
  }

  public vecLength(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public add(vector: Vector2): this {
    this.x += vector.x;
    this.y += vector.y;

    return this;
  }

  public sub(vector: Vector2): this {
    this.x -= vector.x;
    this.y -= vector.y;

    return this;
  }

  public normalize(): this {
    const size = this.vecLength();

    this.x /= size;
    this.y /= size;

    return this;
  }
}

export class Vector3 extends Float32Array implements Vector {
  constructor(x?: number, y?: number, z?: number) {
    super(3);

    this[0] = x ?? 0;
    this[1] = y ?? 0;
    this[2] = z ?? 0;
  }

  public get x(): number {
    return this[0];
  }

  public set x(value: number) {
    this[0] = value;
  }

  public get y(): number {
    return this[1];
  }

  public set y(value: number) {
    this[1] = value;
  }

  public get z(): number {
    return this[2];
  }

  public set z(value: number) {
    this[2] = value;
  }

  public vecLength(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public add(vector: Vector3): this {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;

    return this;
  }

  public sub(vector: Vector3): this {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;

    return this;
  }

  public cross(vector: Vector3): this {
    const tmp = this.clone();

    this.x = tmp.y * vector.z - tmp.z * vector.y;
    this.y = tmp.z * vector.x - tmp.x * vector.z;
    this.z = tmp.x * vector.y - tmp.y * vector.x;

    return this;
  }

  public normalize(): this {
    const size = this.vecLength();

    this.x /= size;
    this.y /= size;
    this.z /= size;

    return this;
  }
}

export class Matrix4 extends Float32Array {
  constructor(matrix?: Matrix4 | Float32Array | number[]) {
    super(16);

    if (matrix !== undefined) {
      if (matrix.length !== 16) throw new Error('Iterable must be 16 elements long');

      matrix.forEach((v, i) => this[i] = v);
    }
  }

  public clone(): Matrix4 {
    return new Matrix4(this);
  }

  public multiply(matrix: Float32Array): this {
    const tmp = this.clone();
    const size = Math.sqrt(this.length);
    let sum = 0;

    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        sum = 0;

        for (let k = 0; k < size; k += 1) {
          sum += tmp[k * size + i] * matrix[j * size + k];
        }

        this[j * size + i] = sum;
      }
    }

    return this;
  }

  public inverse(): this {
    const a11 = this[0];
    const a12 = this[1];
    const a13 = this[2];
    const a14 = this[3];
    const a21 = this[4];
    const a22 = this[5];
    const a23 = this[6];
    const a24 = this[7];
    const a31 = this[8];
    const a32 = this[9];
    const a33 = this[10];
    const a34 = this[11];
    const a41 = this[12];
    const a42 = this[13];
    const a43 = this[14];
    const a44 = this[15];

    const t1 = a11 * a22;
    const t2 = a33 * a44;
    const t3 = a11 * a23;
    const t4 = a34 * a42;
    const t5 = a11 * a24;
    const t6 = a32 * a43;
    const t7 = a12 * a21;
    const t8 = a34 * a43;
    const t9 = a12 * a23;
    const t10 = a31 * a44;
    const t11 = a12 * a24;
    const t12 = a33 * a41;
    const t13 = a13 * a21;
    const t14 = a32 * a44;
    const t15 = a13 * a22;
    const t16 = a34 * a41;
    const t17 = a13 * a24;
    const t18 = a31 * a42;
    const t19 = a14 * a21;
    const t20 = a33 * a42;
    const t21 = a14 * a22;
    const t22 = a31 * a43;
    const t23 = a14 * a23;
    const t24 = a32 * a41;


    const det = t1 * t2 + t3 * t4 + t5 * t6 +
    t7 * t8 + t9 * t10 * t11 * t12 +
    t13 * t14 + t15 * t16 + t17 * t18 +
    t19 * t20 + t21 * t22 + t23 * t24 -
    t1 * t8 - t3 * t14 - t5 * t20 -
    t7 * t2 - t9 * t16 - t11 * t22 -
    t13 * t4 - t15 * t10 - t17 * t24 -
    t19 * t6 - t21 * t12 - t23 * t18;

    const d = 1 / det;

    this[0] = d * (a22 * t2 + a23 * t4 + a24 * t6 - a22 * t8 - a23 * t14 - a24 * t20);
    this[1] = d * (a12 * t8 + a13 * t14 + a14 * t20 - a12 * t2 - a13 * t4 - a14 * t6);
    this[2] = d * (t9 * a44 + t17 * a42 + t21 * a43 - t11 * a43 - t15 * a44 - t23 * a42);
    this[3] = d * (t11 * a33 + t15 * a34 + t23 * a32 - t9 * a34 - t17 * a32 - t21 * a33);
    this[4] = d * (a21 * t8 + a23 * t10 + a24 * t12 - a21 * t2 - a23 * t16 - a24 * t22);
    this[5] = d * (a11 * t2 + a13 * t16 + a14 * t22 - a11 * t8 - a13 * t10 - a14 * t12);
    this[6] = d * (t5 * a43 + t13 * a44 + t23 * a41 - t3 * a44 - t17 * a41 - t19 * a43);
    this[7] = d * (t3 * a34 + t17 * a31 + t19 * a33 - t5 * a33 - t13 * a34 - t23 * a31);
    this[8] = d * (a21 * t14 + a22 * t16 + a24 * t18 - a21 * t4 - a22 * t10 - a24 * t24);
    this[9] = d * (a11 * t4 + a12 * t10 + a14 * t24 - a11 * t14 - a12 * t16 - a14 * t18);
    this[10] = d * (t1 * a44 + t11 * a41 + t19 * a42 - t5 * a42 - t7 * a44 - t21 * a41);
    this[11] = d * (t5 * a32 + t7 * a34 + t21 * a31 - t1 * a34 - t11 * a31 - t19 * a32);
    this[12] = d * (a21 * t20 + a22 * t22 + a23 * t24 - a21 * t6 - a22 * t12 - a23 * t18);
    this[13] = d * (a11 * t6 + a12 * t12 + a14 * t18 - a11 * t20 - a12 * t22 - a13 * t24);
    this[14] = d * (t3 * a42 + t7 * a43 + t21 * a41 - t1 * a43 - t9 * a41 - t13 * a42);
    this[15] = d * (t1 * a33 + t9 * a31 + t19 * a32 - t3 * a32 - t7 * a33 - t15 * a31);

    return this;
  }
}
