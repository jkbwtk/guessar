import { AuthBox } from './AuthBox';
import { AuthHint, AuthHintType } from './AuthHint';
import { InputValidator, ValidityStateMapping } from './InputValidator';
import { ApiError, RegisterRequest } from './types/auth';


export class RegisterBox extends AuthBox<RegisterRequest> {
  protected requestUrl = '/api/v1/auth/register';

  private form: HTMLFormElement;
  private submitButton: HTMLButtonElement;
  private hint: HTMLParagraphElement;

  private emailInput: HTMLInputElement;
  private usernameInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private passwordConfirmInput: HTMLInputElement;

  private usernameMapping: ValidityStateMapping;
  private emailMapping: ValidityStateMapping;
  private passwordMapping: ValidityStateMapping;

  private emailValidator: InputValidator;
  private usernameValidator: InputValidator;
  private passwordValidator: InputValidator;

  private authHint: AuthHint;

  constructor() {
    super();

    this.form = document.getElementById('authForm') as HTMLFormElement;
    this.submitButton = document.getElementById('authSubmit') as HTMLButtonElement;
    this.hint = document.getElementById('authHint') as HTMLParagraphElement;

    this.emailInput = document.getElementById('authEmail') as HTMLInputElement;
    this.usernameInput = document.getElementById('authUsername') as HTMLInputElement;
    this.passwordInput = document.getElementById('authPassword') as HTMLInputElement;
    this.passwordConfirmInput = document.getElementById('authConfirmPassword') as HTMLInputElement;

    this.usernameMapping = {
      patternMismatch: 'Username should only contain keyboard characters',
      valueMissing: 'Username is required',
      tooShort: `Username should be at least ${this.usernameInput.ariaValueMin ?? 3} characters long`,
      tooLong: `Username should be at most ${this.usernameInput.ariaValueMax ?? 32} characters long`,
    };

    this.emailMapping = {
      typeMismatch: 'Email is invalid',
      valueMissing: 'Email is required',
    };

    this.passwordMapping = {
      patternMismatch: 'Password should only contain keyboard characters',
      valueMissing: 'Password is required',
      tooShort: `Password should be at least ${this.passwordInput.ariaValueMin ?? 8} characters long`,
      tooLong: `Password should be at most ${this.passwordInput.ariaValueMax ?? 64} characters long`,
      differentValues: 'Passwords do not match',
    };

    this.emailValidator = new InputValidator(500, this.emailMapping, this.emailInput);
    this.usernameValidator = new InputValidator(500, this.usernameMapping, this.usernameInput);
    this.passwordValidator = new InputValidator(500, this.passwordMapping, this.passwordInput, this.passwordConfirmInput);

    this.authHint = new AuthHint(this.hint);

    this.registerEventListeners();
  }

  private registerEventListeners() {
    this.submitButton.addEventListener('click', this.onLoginClick);

    this.emailInput.addEventListener('authEventValid', this.onValid);
    this.emailInput.addEventListener('authEventInvalid', this.onInvalid);

    this.usernameInput.addEventListener('authEventValid', this.onValid);
    this.usernameInput.addEventListener('authEventInvalid', this.onInvalid);

    this.passwordInput.addEventListener('authEventValid', this.onValid);
    this.passwordInput.addEventListener('authEventInvalid', this.onInvalid);

    this.passwordConfirmInput.addEventListener('authEventValid', this.onValid);
    this.passwordConfirmInput.addEventListener('authEventInvalid', this.onInvalid);
  }

  private onLoginClick = async (event: MouseEvent) => {
    event.preventDefault();
    if (!this.isValid()) {
      this.emailValidator.forceMarkInvalid();
      this.usernameValidator.forceMarkInvalid();
      this.passwordValidator.forceMarkInvalid();
      return;
    }

    this.authHint.remove('api');
    this.submitButton.classList.add('auth-submit-button-awaiting');

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    try {
      const response = await this.makeRequest({
        email: this.emailInput.value,
        username: this.usernameInput.value,
        password: this.passwordInput.value,
      });

      if (response.ok) location.href = '/';
      else throw response;
    } catch (err) {
      if (err instanceof Response && err.headers.get('Content-Type') === 'application/json') {
        const data = await err.json() as ApiError;

        this.authHint.add('api', AuthHintType.Error, `Error: ${data.message}`);
      } else {
        this.authHint.add('api', AuthHintType.Error, 'Error: Something went wrong');
      }
    }

    this.submitButton.classList.remove('auth-submit-button-awaiting');
  };

  private isValid() {
    return this.form.checkValidity();
  }

  private onValid = (ev: Event) => {
    const target = ev.target as HTMLInputElement;
    if (target instanceof HTMLInputElement) {
      this.authHint.remove(target.id);
    }

    if (!this.isValid()) return;
    this.submitButton.classList.remove('auth-submit-button-disabled');
  };

  private onInvalid = (ev: Event) => {
    this.submitButton.classList.add('auth-submit-button-disabled');

    const target = ev.target as HTMLInputElement;
    if (target instanceof HTMLInputElement) {
      if (!target.validity.valueMissing) {
        this.authHint.add(target.id, AuthHintType.Error, target.validationMessage);
      }
    }
  };
}
