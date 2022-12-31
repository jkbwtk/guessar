export enum AuthHintType {
  Error = 'auth-hint-error',
}

export interface Hint {
  type: AuthHintType;
  text: string;
}

export class AuthHint {
  private hints: Map<string, Hint>;

  private defaultHint: string;

  constructor(public element: HTMLElement) {
    this.hints = new Map();

    this.defaultHint = element.innerHTML;
  }

  public add(id: string, type: AuthHintType, text: string): void {
    this.hints.delete(id);
    this.hints.set(id, { type, text });

    this.update();
  }

  public remove(id: string): void {
    const hint = this.hints.get(id);
    if (!hint) return;

    this.hints.delete(id);
    this.element.classList.remove(hint.type);

    this.update();
  }

  private update(): void {
    if (this.hints.size === 0) {
      for (const type of Object.values(AuthHintType)) {
        this.element.classList.remove(type);
      }

      this.element.innerHTML = this.defaultHint;
      return;
    }


    const hint = Array.from(this.hints.values()).pop() as Hint;
    if (this.element.innerHTML === hint.text) return;

    this.element.innerHTML = hint.text;
    this.element.classList.remove(hint.type);

    setTimeout(() => {
      this.element.classList.add(hint.type);
    }, 0);
  }
}
