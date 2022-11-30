export abstract class Stylized {
  protected abstract style: HTMLLinkElement;

  protected static createStyle(url: string): HTMLLinkElement {
    const element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = url;

    return element;
  }

  protected injectStyle(): void {
    if (!document.head.contains(this.style)) {
      document.head.appendChild(this.style);
    }
  }

  protected removeStyle(): void {
    if (document.head.contains(this.style)) {
      document.head.removeChild(this.style);
    }
  }
}
