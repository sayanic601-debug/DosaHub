import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dosahub-super-secret-key-traditional-saffron';

export interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<DecodedToken, 'iat' | 'exp'>): string {
  // Sign token with a 7 day expiration
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}

// Simple request authorization helper
export function getAuthUser(request: Request): DecodedToken | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
