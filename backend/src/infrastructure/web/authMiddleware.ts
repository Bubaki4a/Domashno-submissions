import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../../domain/entities/User/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export interface UserJwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: UserRole };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    // Използваме "as any as UserJwtPayload", за да прескочим проверката за препокриване на типовете
    const decoded = jwt.verify(token, JWT_SECRET) as any as UserJwtPayload;
    
    req.user = { 
      id: decoded.sub, 
      email: decoded.email, 
      role: decoded.role 
    };
    
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(roles: UserRole | UserRole[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}