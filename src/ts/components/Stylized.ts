import { EventEmitter } from 'events';


export abstract class Stylized extends EventEmitter {
  protected abstract styles: HTMLLinkElement[] | HTMLLinkElement;

  protected static createStyle(url: string, integrity?: string, crossorigin?: string): HTMLLinkElement {
    const element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = url;

    if (typeof integrity === 'string') {
      element.integrity = integrity;
    }

    if (typeof crossorigin === 'string') {
      element.crossOrigin = crossorigin;
    }

    return element;
  }

  protected injectStyles(): void {
    if (Array.isArray(this.styles)) {
      for (const style of this.styles) {
        this.injectStyle(style);
      }
    } else {
      this.injectStyle(this.styles);
    }
  }

  private injectStyle(style: HTMLLinkElement) {
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  }

  protected removeStyles(): void {
    if (Array.isArray(this.styles)) {
      for (const style of this.styles) {
        this.removeStyle(style);
      }
    } else {
      this.removeStyle(this.styles);
    }
  }

  private removeStyle(style: HTMLLinkElement) {
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  }
}
