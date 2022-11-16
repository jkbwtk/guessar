export class InputValidator {
  public timeout: number;
  public elements: HTMLInputElement[];
  private validatorFunction: () => boolean;
  private timeoutHandler: number | null = null;

  constructor(timeout: number, validatorFunction: () => boolean, ...elements: HTMLInputElement[]) {
    this.timeout = timeout;
    this.elements = elements;
    this.validatorFunction = validatorFunction;

    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    for (const element of this.elements) {
      element.addEventListener('keyup', this.onKeyup);
    }

    this.onKeyup();
  }

  private unregisterEventHandlers() {
    for (const element of this.elements) {
      element.removeEventListener('keyup', this.onKeyup);
    }
  }

  private onKeyup = () => {
    if (this.timeoutHandler !== null) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }


    this.timeoutHandler = setTimeout(() => {
      if (this.validatorFunction()) this.setValid();
      else this.setInvalid();
    }, this.timeout);
  };

  private setInvalid() {
    for (const element of this.elements) {
      element.classList.add('login-invalid-input');
    }
  }

  private setValid() {
    for (const element of this.elements) {
      element.classList.remove('login-invalid-input');
    }
  }
}
