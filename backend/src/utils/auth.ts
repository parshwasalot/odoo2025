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
  const secret: Secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  console.log('Generating token for:', {
    userId: payload.userId,
    email: payload.email,
    name: payload.name
  });

  const options: SignOptions = {
    expiresIn: '24h', // Set a fixed expiration for now
  };

  const token = jwt.sign(payload, secret, options);
  console.log('Token generated:', token.substring(0, 20) + '...');
  return token;
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
