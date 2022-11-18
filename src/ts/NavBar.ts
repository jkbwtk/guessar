import { enumerate } from './utils.js';


interface NavChild {
  index: number;
  name: string;
  element: Element;
  width: number;
  get hidden(): boolean;
}

export class NavBar {
  private node: HTMLElement;
  private menu: HTMLElement;
  private burger: HTMLElement;

  private mobileMenu: HTMLElement;
  private mobileBurger: HTMLElement;

  private children: NavChild[];
  private lastDisabled: number;

  private menuTimeoutHandler: number | null = null;

  constructor() {
    const node = document.getElementById('navBar');
    const menu = document.getElementById('navMenu');
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('navMenuMobile');
    const mobileBurger = document.getElementById('navBurgerMobile');


    if (node === null) {
      throw new Error('NavBar: Could not find navBar');
    }

    if (menu === null) {
      throw new Error('NavBar: Could not find navMenu');
    }

    if (burger === null) {
      throw new Error('NavBar: Could not find navBurger');
    }

    if (mobileMenu === null) {
      throw new Error('NavBar: Could not find navMenuMobile');
    }

    if (mobileBurger === null) {
      throw new Error('NavBar: Could not find navBurgerMobile');
    }

    this.node = node;
    this.menu = menu;
    this.burger = burger;
    this.mobileMenu = mobileMenu;
    this.mobileBurger = mobileBurger;

    this.children = [];
    this.lastDisabled = -1;

    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('load', this.onLoad);
    document.addEventListener('click', this.onClick);
  }

  private unregisterEventHandlers() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('load', this.onLoad);
    document.removeEventListener('click', this.onClick);
  }

  private onLoad = () => {
    this.indexChildren();
    this.highlightActiveLink();
    this.onResize();
  };

  private onResize = () => {
    const cssMargin = parseFloat(window.getComputedStyle(this.node).marginLeft ?? '0');
    const gap = parseFloat(window.getComputedStyle(this.node).gap ?? '0');

    let margin = parseFloat(window.getComputedStyle(this.node).marginRight);
    this.hideMenu();

    while (margin < cssMargin && (this.lastDisabled > 1 || this.lastDisabled === -1)) {
      const targetIndex = this.lastDisabled !== -1 ? this.lastDisabled - 1 : this.children.length - 1;
      this.hideChild(targetIndex);

      this.lastDisabled = targetIndex;
      margin = parseFloat(window.getComputedStyle(this.node).marginRight);
    }

    while (this.lastDisabled !== -1 && this.lastDisabled < this.children.length && margin - this.children[this.lastDisabled].width - gap > cssMargin) {
      this.showChild(this.lastDisabled);
      this.lastDisabled += 1;

      margin = parseFloat(window.getComputedStyle(this.node).marginRight);
    }
  };

  private onClick = (event: MouseEvent) => {
    this.onDesktopBurgerClick(event);
    this.onMobileBurgerClick(event);
  };

  private onDesktopBurgerClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;

    if (!this.menu.classList.contains('hidden') && !this.menu.contains(event.target) && !this.burger.contains(event.target)) {
      this.hideMenu();
    }

    if (this.burger.contains(event.target)) {
      if (!this.menu.classList.contains('hidden')) {
        this.hideMenu();
      } else {
        this.showMenu();
      }
    }
  };

  private onMobileBurgerClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;

    if (this.mobileBurger.contains(event.target)) {
      this.mobileMenu.classList.toggle('nav-menu-mobile-extended');
      this.mobileBurger.classList.toggle('nav-burger-mobile-active');
    }
  };

  private indexChildren() {
    this.children = [];

    // dirty fix for mobile view
    this.node.classList.remove('top-desktop');

    for (const [child, i] of enumerate(Array.from(this.node.children))) {
      if (child.id !== 'navBurger') {
        this.children.push({
          index: i,
          name: child.textContent ?? '',
          element: child,
          width: child.getBoundingClientRect().width,
          get hidden() {
            return child.classList.contains('hidden');
          },
        });
      }
    }

    this.node.classList.add('top-desktop');
  }

  private showChild(index: number) {
    this.node.insertBefore(this.children[index].element, this.burger);
  }

  private hideChild(index: number) {
    this.menu.insertBefore(this.children[index].element, this.menu.firstChild);
  }

  private showMenu() {
    if (this.menuTimeoutHandler !== null) {
      window.clearTimeout(this.menuTimeoutHandler);
      this.menuTimeoutHandler = null;
    }

    this.menu.style.opacity = '1';
    this.menu.classList.remove('hidden');

    const burgerRect = this.burger.getBoundingClientRect();
    const menuRect = this.menu.getBoundingClientRect();

    const left = burgerRect.left - (menuRect.width - burgerRect.width) / 2;
    const top = burgerRect.top + burgerRect.height;
    this.menu.style.left = left + 'px';
    this.menu.style.top = top + 'px';
  }

  private hideMenu(): void {
    const trainsitionDuration = parseFloat(window.getComputedStyle(this.menu).transitionDuration ?? '0');

    this.menu.style.opacity = '0';

    this.menuTimeoutHandler = window.setTimeout(() => {
      this.menu.classList.add('hidden');
    }, trainsitionDuration * 1000);
  }

  private highlightActiveLink() {
    const links = document.querySelectorAll('.nav-link');
    const path = window.location.pathname;

    links.forEach((link) => {
      if ((link instanceof HTMLAnchorElement) && link.pathname === path) {
        link.classList.add('nav-link-active');
      }
    });
  }

  public dispose(): void {
    this.unregisterEventHandlers();
  }
}
