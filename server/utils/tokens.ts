import jwt from 'jsonwebtoken';

type SignableUser = { id: number; email: string; role: string };

export function signAccessToken(user: SignableUser): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: (process.env.JWT_EXPIRES_IN as string | undefined) ?? '30d' } as Parameters<typeof jwt.sign>[2]
  );
}

export function signRefreshToken(userId: number): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  return jwt.sign(
    { userId },
    refreshSecret,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as string | undefined) ?? '7d' } as Parameters<typeof jwt.sign>[2]
  );
}
