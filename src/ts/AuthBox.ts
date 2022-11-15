enum AuthBoxState {
  Login,
  Register,
}


export class AuthBox {
  private node: HTMLElement;
  private showPasswordButtons: HTMLElement[];
  private switchLoginButton: HTMLElement;
  private switchRegisterButton: HTMLElement;

  constructor() {
    const node = document.getElementById('authBox');
    const switchLoginButton = document.getElementById('logSwitchLogin');
    const switchRegisterButton = document.getElementById('logSwitchRegister');

    if (node === null) {
      throw new Error('AuthBox: Could not find authBox');
    }

    if (switchLoginButton === null) {
      throw new Error('AuthBox: Could not find logSwitchLogin');
    }

    if (switchRegisterButton === null) {
      throw new Error('AuthBox: Could not find logSwitchRegister');
    }


    this.node = node;
    this.switchLoginButton = switchLoginButton;
    this.switchRegisterButton = switchRegisterButton;

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
}
