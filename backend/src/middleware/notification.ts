import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import SocketService from '../utils/socket';

export const notifySwapRequest = async (
  req: Request,
  ownerId: Types.ObjectId,
  swapData: any
): Promise<void> => {
  const socketService: SocketService = req.app.get('socketService');
  await socketService.sendSwapRequest(ownerId, swapData);
};

export const notifySwapResponse = async (
  req: Request,
  requesterId: Types.ObjectId,
  accepted: boolean,
  swapData: any
): Promise<void> => {
  const socketService: SocketService = req.app.get('socketService');
  await socketService.sendSwapResponse(requesterId, accepted, swapData);
};

export const notifyItemModeration = async (
  req: Request,
  uploaderId: Types.ObjectId,
  approved: boolean,
  itemData: any
): Promise<void> => {
  const socketService: SocketService = req.app.get('socketService');
  await socketService.sendItemModeration(uploaderId, approved, itemData);
};
