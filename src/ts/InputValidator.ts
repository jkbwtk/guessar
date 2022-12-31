export type ValidityStateMapping = Partial<{
  [key in keyof Omit<ValidityState, 'customError' | 'valid'>]: string;
} & {
  readonly differentValues: string,
}>;

export class InputValidator {
  public elements: HTMLInputElement[];
  private timeoutHandler: number | null = null;

  constructor(public timeout: number, public validityMapping: ValidityStateMapping, ...elements: HTMLInputElement[]) {
    this.elements = elements;

    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    for (const element of this.elements) {
      element.addEventListener('input', this.onInput);

      element.addEventListener('authEventValid', this.onValid);
      element.addEventListener('authEventInvalid', this.onInvalid);

      element.addEventListener('invalid', this.overrideOnInvalid);
    }

    this.onInput();
  }

  private unregisterEventHandlers() {
    for (const element of this.elements) {
      element.removeEventListener('input', this.onInput);

      element.removeEventListener('authEventValid', this.onValid);
      element.removeEventListener('authEventInvalid', this.onInvalid);

      element.removeEventListener('invalid', this.overrideOnInvalid);
    }
  }

  private overrideOnInvalid = (ev: Event) => {
    ev.preventDefault();
  };

  private onInput = () => {
    if (this.timeoutHandler !== null) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }


    this.timeoutHandler = setTimeout(() => {
      const haveSameValue = this.elements
        .every((element) => element.value === this.elements[0].value);

      for (const element of this.elements) {
        if (haveSameValue) {
          element.setCustomValidity('');
        } else {
          element.setCustomValidity(this.validityMapping.differentValues ?? 'Values do not match');
        }

        element.checkValidity();
        for (const [key, value] of Object.entries(this.validityMapping) as [keyof ValidityState, string][]) {
          if (element.validity[key]) {
            element.setCustomValidity(value);
          }
        }

        element.reportValidity();
        if (!element.validity.valid) element.dispatchEvent(new Event('authEventInvalid'));
        else element.dispatchEvent(new Event('authEventValid'));

        console.log('ValidityState:', element.id, element.validationMessage);
      }
    }, this.timeout);
  };

  private onInvalid = (ev: Event) => {
    const target = ev.target;

    if (target instanceof HTMLInputElement) {
      if (this.elements.every((element) => element.validity.valueMissing)) return this.onValid(ev);

      target.classList.add('auth-invalid-input');
    }
  };

  private onValid = (ev: Event) => {
    const target = ev.target;

    if (target instanceof HTMLInputElement) {
      target.classList.remove('auth-invalid-input');
    }
  };

  public forceMarkInvalid(): void {
    for (const element of this.elements) {
      if (!element.validity.valid) element.classList.add('auth-invalid-input');
    }
  }
}
