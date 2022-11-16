import { InputValidator } from './InputValidator.js';

enum AuthBoxState {
  Login,
  Register,
}


export class AuthBox {
  private node: HTMLElement;
  private showPasswordButtons: HTMLElement[];
  private switchLoginButton: HTMLElement;
  private switchRegisterButton: HTMLElement;

  private usernameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private confirmPasswordInput: HTMLInputElement;

  private usernameValidator: InputValidator;
  private emailValidator: InputValidator;
  private passwordsValidator: InputValidator;

  constructor() {
    const node = document.getElementById('authBox');
    const switchLoginButton = document.getElementById('logSwitchLogin');
    const switchRegisterButton = document.getElementById('logSwitchRegister');

    const usernameInput = document.getElementById('logUsername');
    const emailInput = document.getElementById('logEmail');
    const passwordInput = document.getElementById('logPassword');
    const confirmPasswordInput = document.getElementById('logConfirmPassword');

    if (node === null) {
      throw new Error('AuthBox: Could not find authBox');
    }

    if (switchLoginButton === null) {
      throw new Error('AuthBox: Could not find logSwitchLogin');
    }

    if (switchRegisterButton === null) {
      throw new Error('AuthBox: Could not find logSwitchRegister');
    }

    if (!(usernameInput instanceof HTMLInputElement)) {
      throw new Error('AuthBox: Could not find logUsername');
    }

    if (!(emailInput instanceof HTMLInputElement)) {
      throw new Error('AuthBox: Could not find logEmail');
    }

    if (!(passwordInput instanceof HTMLInputElement)) {
      throw new Error('AuthBox: Could not find logPassword');
    }

    if (!(confirmPasswordInput instanceof HTMLInputElement)) {
      throw new Error('AuthBox: Could not find logConfirmPassword');
    }


    this.node = node;
    this.switchLoginButton = switchLoginButton;
    this.switchRegisterButton = switchRegisterButton;

    this.usernameInput = usernameInput;
    this.emailInput = emailInput;
    this.passwordInput = passwordInput;
    this.confirmPasswordInput = confirmPasswordInput;


    this.usernameValidator = new InputValidator(500, this.validateUsername, this.usernameInput);
    this.emailValidator = new InputValidator(500, this.validateEmail, this.emailInput);
    this.passwordsValidator = new InputValidator(500, this.validatePasswords, this.passwordInput, this.confirmPasswordInput);

    this.showPasswordButtons = Array
      .from(document.getElementsByClassName('login-show-password'))
      .filter((element) => element instanceof HTMLElement) as HTMLElement[];

    this.registerEventHandlers();
  }

  get state(): AuthBoxState {
    if (this.node.classList.contains('login-box')) return AuthBoxState.Login;
    else return AuthBoxState.Register;
  }

  private registerEventHandlers() {
    this.switchLoginButton.onclick = this.switchToLogin;
    this.switchRegisterButton.onclick = this.switchToRegister;

    for (const button of this.showPasswordButtons) {
      button.onclick = this.onShowPasswordClick;
    }
  }

  private onShowPasswordClick = () => {
    const passwordInput = document.getElementsByName('password');

    if (passwordInput[0] instanceof HTMLInputElement) {
      const type = passwordInput[0].type;

      for (const input of passwordInput) {
        if (!(input instanceof HTMLInputElement)) continue;

        switch (type) {
          case 'password': input.type = 'text'; break;
          default: input.type = 'password'; break;
        }
      }
    }
  };

  private switchState = (state: AuthBoxState) => {
    switch (state) {
      case AuthBoxState.Login:
        this.node.classList.add('login-box');
        this.node.classList.remove('register-box');
        break;
      case AuthBoxState.Register:
        this.node.classList.add('register-box');
        this.node.classList.remove('login-box');
        break;
    }
  };

  private switchToLogin = () => {
    this.switchState(AuthBoxState.Login);
  };

  private switchToRegister = () => {
    this.switchState(AuthBoxState.Register);
  };

  private validateUsername = () => {
    if (this.usernameInput.value.length === 0) return true;

    return this.usernameInput.value.match(/^[a-zA-Z0-9!@#$%^&*()\-+<>?:;"'\[\]{}`~]+$/) !== null;
  };

  private validateEmail = () => {
    if (this.emailInput.value.length === 0) return true;

    return this.emailInput.value.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) !== null;
  };

  private validatePasswords = () => {
    if (
      this.passwordInput.value.length > 0 &&
      this.confirmPasswordInput.value.length > 0 &&
      this.passwordInput.value !== this.confirmPasswordInput.value
    ) return false;

    if (this.passwordInput.value.length === 0) return true;
    if (this.state === AuthBoxState.Login) return true;

    return this.passwordInput.value.match(/^[a-zA-Z0-9!@#$%^&*()\-+<>?:;"'\[\]{}`~]+$/) !== null;
  };
}
