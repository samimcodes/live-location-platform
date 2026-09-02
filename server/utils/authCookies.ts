import { CookieOptions, Response } from 'express';

function parseDurationMs(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) return fallback;
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return n * (multipliers[unit] ?? fallback);
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions(),
    maxAge: parseDurationMs(process.env.JWT_EXPIRES_IN, 30 * 24 * 60 * 60 * 1000),
  });
  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions(),
    maxAge: parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000),
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('accessToken', baseCookieOptions());
  res.clearCookie('refreshToken', baseCookieOptions());
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}
