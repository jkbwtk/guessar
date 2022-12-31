export interface CookieOptions {
  path: string;
  domain: string;
  maxAge: number;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

export class CookieHandler {
  private cookies: Map<string, string> = new Map();

  private static defaultCookieOptions: CookieOptions = {
    path: '/',
    domain: location.hostname,
    maxAge: 0,
    secure: location.protocol === 'https:',
    sameSite: 'strict',
  };

  constructor() {
    this.parseCookies();
  }

  private parseCookies() {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      if (
        typeof cookie !== 'string' ||
        cookie.trim().length === 0 ||
        !cookie.includes('=')
      ) continue;

      const [keyRaw, valueRaw] = cookie.split('=');

      const key = decodeURIComponent(keyRaw.trim());
      const value = decodeURIComponent(valueRaw.trim());

      this.cookies.set(key, value);
    }
  }

  public get(key: string): string | null {
    return this.cookies.get(key) ?? null;
  }

  public getObject(key: string): unknown | null {
    const value = this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (err) { }

    return null;
  }

  public set(key: string, value: string, options: Partial<CookieOptions> = {}): void {
    const cookieOptions = { ...CookieHandler.defaultCookieOptions, ...options };

    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(value);
    const encodedOptions = Object.entries(cookieOptions)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('; ');

    document.cookie = `${encodedKey}=${encodedValue}; ${encodedOptions}`;
  }

  public setObject<T extends string | number | object>(key: string, value: T, options: Partial<CookieOptions> = {}): void {
    this.set(key, JSON.stringify(value), options);
  }
}
