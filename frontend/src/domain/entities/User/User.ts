export type UserRole = 'administrator' | 'manager' | 'operator';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
