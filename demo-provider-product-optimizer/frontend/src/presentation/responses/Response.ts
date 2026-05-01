export type Response<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
};
