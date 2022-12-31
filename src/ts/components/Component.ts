/* eslint-disable @typescript-eslint/no-empty-function */

import { Stylized } from './Stylized';


export abstract class Component<E = HTMLElement, O extends object = object, S = void> extends Stylized {
  protected baseOptions: Partial<O>;
  private finalOptions?: O;
  protected abstract defaultOptions: O;
  public abstract element: E;

  constructor(options: Partial<O> = {}) {
    super();
    this.baseOptions = options;
  }

  get options(): O {
    if (this.finalOptions === undefined) {
      this.finalOptions = { ...this.defaultOptions, ...this.baseOptions };
    }

    return this.finalOptions;
  }

  public update(state: S): void;
  public async update(state: S): Promise<void> { }

  public mounted(): void;
  public async mounted(): Promise<void> { }

  public unmounted(): void;
  public async unmounted(): Promise<void> { }
}

