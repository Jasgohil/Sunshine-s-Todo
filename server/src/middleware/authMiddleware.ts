import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../types';
import { LocalDb } from '../services/localDb';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_sunshine_todo';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing token.' });
  }

  const token = authHeader.split('Bearer ')[1];

  // For testing with mock UIDs in local development:
  if (token.startsWith('mock-') || token.startsWith('user-')) {
    const users = LocalDb.get('users') as Record<string, User>;
    const userRecord = users[token];
    if (userRecord) {
      req.user = userRecord;
      return next();
    }
  }

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET) as {
      uid: string;
      email: string;
      isAdmin: boolean;
    };

    const users = LocalDb.get('users') as Record<string, User>;
    const userRecord = users[decodedPayload.uid];

    if (userRecord) {
      req.user = userRecord;
    } else {
      req.user = {
        uid: decodedPayload.uid,
        displayName: decodedPayload.email.split('@')[0].charAt(0).toUpperCase() + decodedPayload.email.split('@')[0].slice(1),
        email: decodedPayload.email,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${decodedPayload.uid}`,
        isAdmin: decodedPayload.isAdmin,
      };
    }
    return next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): any => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }
  next();
};
