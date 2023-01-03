import { getUser, logout } from '../AuthUtils';
import { Component } from './Component';
import { Node } from './Node';


export interface UserWidgetOptions {
  hydrateElement?: HTMLDivElement;
}

export class UserWidget extends Component<HTMLDivElement, UserWidgetOptions> {
  protected styles = Component.createStyle('/public/css/components/UserWidget.css');
  public element: HTMLDivElement;
  private avatar: HTMLImageElement;
  private username: HTMLSpanElement;
  private dropdown: HTMLDivElement;

  public defaultOptions: UserWidgetOptions = {};

  constructor(options: Partial<UserWidgetOptions> = {}) {
    super(options);

    [this.element, this.avatar, this.username, this.dropdown] = this.isHydrated() ? this.hydrate() : this.render();

    if (!this.isHydrated()) this.update();
    this.registerEventHandlers();
    this.injectStyles();
  }

  private registerEventHandlers(): void {
    this.element.addEventListener('click', this.toggleDropdown);
  }

  private toggleDropdown = () => {
    this.dropdown.classList.toggle('user-widget-dropdown-active');

    if (this.dropdown.classList.contains('user-widget-dropdown-active')) {
      this.dropdown.classList.remove('user-widget-dropdown-inactive');
    } else {
      this.dropdown.classList.add('user-widget-dropdown-inactive');
    }
  };

  private isHydrated(): this is { options: { hydrateElement: HTMLDivElement } } {
    return this.options.hydrateElement instanceof HTMLDivElement;
  }

  private hydrate(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement, HTMLDivElement] {
    if (!this.isHydrated()) return this.render();

    const widget = this.options.hydrateElement;
    const avatar = widget.querySelector('.user-widget-avatar');
    const username = widget.querySelector('.user-widget-username');

    const [dropdown] = this.createElement();
    widget.appendChild(dropdown);


    if (!(avatar instanceof HTMLImageElement)) throw new Error('UserWidget: Could not find avatar');
    if (!(username instanceof HTMLSpanElement)) throw new Error('UserWidget: Could not find username');

    return [widget, avatar, username, dropdown];
  }

  private render(): [HTMLDivElement, HTMLImageElement, HTMLSpanElement, HTMLDivElement] {
    const [dropdown] = this.createElement();

    const avatar = new Node('img')
      .addClass('user-widget-avatar')
      .unwrapUnsafe();

    const username = new Node('span')
      .addClass('user-widget-username')
      .unwrapUnsafe();

    const widget = new Node('div')
      .addClass('user-widget')
      .setId('userWidget')
      .appendChild(avatar)
      .appendChild(username)
      .appendChild(dropdown)
      .unwrapUnsafe();

    return [widget, avatar, username, dropdown];
  }

  private linkGenerator(link: string, text: string): Node<'a'> {
    const a = new Node('a')
      .addClass('nav-link')
      .map(Node.href(link))
      .innerText(text);

    return a;
  }

  private createElement(): [HTMLDivElement] {
    const links = [
      this.linkGenerator('/settings', 'Settings'),
    ];

    const logoutLink = new Node('a')
      .addClass('nav-link')
      .innerText('Logout')
      .unwrapUnsafe();

    const dropdown = new Node('div')
      .addClass('user-widget-dropdown')
      .appendChildren(...links)
      .appendChild(logoutLink)
      .unwrapUnsafe();

    logoutLink.addEventListener('click', logout);

    return [dropdown];
  }

  public update(): void {
    const user = getUser();
    const defaultAvatar = '/public/img/defaultAvatar.svg';

    if (user) {
      const discriminator = user.discriminator.toString().padStart(4, '0');

      this.avatar.src = typeof user.avatar === 'number' ? `/api/v1/avatar/${user.avatar}` : defaultAvatar;
      this.username.innerText = `${user.username}#${discriminator}`;
    } else {
      this.avatar.src = defaultAvatar;
      this.username.innerText = 'Session Expired';
      this.element.style.opacity = '0';
    }
  }
}
