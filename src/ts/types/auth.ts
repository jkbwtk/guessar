export enum UserFlags {
  USER = 0, // always a user
  MODERATOR = 1,
  ADMIN = 2,
  BANNED = 4,
  DELETED = 8,
  DEVELOPER = 16,
}

export interface User {
  username: string,
  discriminator: number,
  avatar: number | null,
  flags: number,
  created_at: number,
}

export interface UserVerbose extends User {
  id: number,
  email: string,
}

export interface LoginRequest {
  email: string,
  password: string,
}

export interface LoginResponse {
  status: number,
  message: string,
  user: User,
}

export interface RegisterRequest {
  email: string,
  username: string,
  password: string,
}

export type RegisterResponse = LoginResponse;

export interface ApiSuccess {
  status: number,
  message: string,
}

export interface ApiError {
  status: number,
  message: string,
  errorCode: number,
}

export interface GetUser {
  user: UserVerbose,
}
