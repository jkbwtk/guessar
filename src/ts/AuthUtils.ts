import { CookieHandler } from './CookieHandler';
import { User, UserFlags, UserVerbose } from './types/auth';

const logoutUrl = '/api/v1/auth/logout';
const userUrl = '/api/v1/auth/user';


export const removeVerboseUserData = (): void => {
  sessionStorage.removeItem('USER');
};

export const logout = async (): Promise<void> => {
  removeVerboseUserData();

  try {
    const resp = await fetch(logoutUrl, { method: 'POST' });
    if (!resp.ok) throw new Error('Logout failed');
  } catch (err) { }

  location.href = '/';
};

export const validateUser = (user: unknown): user is User => {
  return (
    user !== null && typeof user === 'object' &&
    'username' in user && typeof user.username === 'string' &&
    'discriminator' in user && typeof user.discriminator === 'number' &&
    'avatar' in user && (typeof user.avatar === 'number' || user.avatar === null) &&
    'flags' in user && typeof user.flags === 'number' &&
    'created_at' in user && typeof user.created_at === 'number'
  );
};

export const validateVerboseUser = (user: unknown): user is UserVerbose => {
  return (
    user !== null && typeof user === 'object' &&
    'id' in user && typeof user.id === 'number' &&
    'email' in user && typeof user.email === 'string' &&
    validateUser(user)
  );
};

export const getUser = (): User | null => {
  const cookieHandler = new CookieHandler();

  const user = cookieHandler.getObject('GUSER');
  if (!user || !validateUser(user)) return null;

  return user;
};

export const getVerboseUser = (): UserVerbose | null => {
  const rawUser = sessionStorage.getItem('USER');
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    if (!validateVerboseUser(user)) throw new Error('Invalid user');

    return user;
  } catch (err) {
    removeVerboseUserData();
    return null;
  }
};

export const setVerboseUser = (user: UserVerbose): void => {
  sessionStorage.setItem('USER', JSON.stringify(user));
};

export const getVerboseUserFlags = (): Set<UserFlags> => {
  const user = getUser();
  if (!user) return new Set();

  const flags: Set<UserFlags> = new Set();
  for (const flag of Object.values(UserFlags) as UserFlags[]) {
    if (user.flags & flag) flags.add(flag);
  }

  return flags;
};

export const fetchVerboseUser = async (): Promise<UserVerbose | null> => {
  try {
    const resp = await fetch(userUrl);
    if (!resp.ok) throw new Error('Failed to fetch user');

    const user = await resp.json();
    if (!validateVerboseUser(user)) throw new Error('Invalid user');

    setVerboseUser(user);
    return user;
  } catch (err) {
    removeVerboseUserData();
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  return getUser() !== null;
};
