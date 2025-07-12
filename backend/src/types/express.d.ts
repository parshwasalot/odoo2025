import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: Types.ObjectId;
        email: string;
        isAdmin: boolean;
        name: string; // Add name property
      };
    }
  }
}

export {};
