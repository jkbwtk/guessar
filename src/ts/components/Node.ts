export class Node<T extends keyof HTMLElementTagNameMap> {
  private element: HTMLElementTagNameMap[T];
  private failed = false;

  constructor(tagName: T) {
    this.element = document.createElement(tagName);
  }

  public map(func: (v: HTMLElementTagNameMap[T]) => void): this {
    if (this.failed) return this;

    try {
      func(this.element);
    } catch (error) {
      this.failed = true;
    }

    return this;
  }

  public addClass(...tokens: string[]): this {
    return this.map(((v) => v.classList.add(...tokens)));
  }

  public removeClass(...tokens: string[]): this {
    return this.map(((v) => v.classList.remove(...tokens)));
  }

  public setId(id: string): this {
    return this.map((v) => v.id = id);
  }

  public appendChild(node: globalThis.Node | Node<keyof HTMLElementTagNameMap>): this {
    const child = node instanceof Node ? node.unwrapUnsafe() : node;
    return this.map((v) => v.appendChild(child));
  }

  public appendChildren(...nodes: (globalThis.Node | Node<keyof HTMLElementTagNameMap>)[]): this {
    for (const node of nodes) {
      this.appendChild(node);
    }

    return this;
  }

  public innerText(text: string): this {
    return this.map((v) => v.innerText = text);
  }

  public innerHTML(html: string): this {
    return this.map((v) => v.innerHTML = html);
  }

  public setStyle<S extends keyof CSSStyleDeclaration>(style: S, value: CSSStyleDeclaration[S]): this {
    return this.map((v) => v.style[style] = value);
  }

  public unwrapUnsafe(): HTMLElementTagNameMap[T] {
    return this.element;
  }

  public unwrapSafe(): HTMLElementTagNameMap[T] {
    if (this.failed) throw new Error('Node failed to unwrap');

    return this.element;
  }

  public didFail(): boolean {
    return this.failed;
  }

  public static src = <T extends HTMLElementTagNameMap['img']>(src: string): ((v: T) => void) => {
    return ((v) => v.src = src);
  };

  public static href = <T extends HTMLElementTagNameMap['a']>(href: string): ((v: T) => void) => {
    return ((v) => v.href = href);
  };

  public toString(): string {
    return this.unwrapSafe().outerHTML;
  }
}
