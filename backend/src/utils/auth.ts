import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface TokenPayload {
  userId: ObjectId;
  email: string;
  isAdmin: boolean;
  name?: string;  // Made optional with '?'
}

export const generateToken = (payload: TokenPayload): string => {
  const secret: Secret = process.env.JWT_SECRET || '';
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : '7d',
  };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
