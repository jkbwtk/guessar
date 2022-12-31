export abstract class AuthBox<T> {
  protected abstract requestUrl: string;

  private showPasswordButtons: HTMLElement[];

  constructor() {
    this.showPasswordButtons = Array
      .from(document.getElementsByClassName('auth-show-password'))
      .filter((element) => element instanceof HTMLElement) as HTMLElement[];

    for (const button of this.showPasswordButtons) {
      button.addEventListener('click', this.onShowPasswordClick);
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

  protected async makeRequest(data: T): Promise<Response> {
    const response = await fetch(this.requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  }
}
