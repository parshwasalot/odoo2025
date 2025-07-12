import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import Notification from '../models/Notification';

interface UserSocket {
  userId: string;
  socketId: string;
}

class SocketService {
  private io: Server;
  private userSockets: UserSocket[] = [];

  constructor(io: Server) {
    this.io = io;
    this.setupConnectionHandling();
  }

  private setupConnectionHandling(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('authenticate', (userId: string) => {
        this.addUserSocket(userId, socket.id);
        socket.join(userId);
      });

      socket.on('disconnect', () => {
        this.removeUserSocket(socket.id);
      });
    });
  }

  private addUserSocket(userId: string, socketId: string): void {
    this.userSockets.push({ userId, socketId });
  }

  private removeUserSocket(socketId: string): void {
    this.userSockets = this.userSockets.filter(us => us.socketId !== socketId);
  }

  private async saveNotification(notification: {
    userId: Types.ObjectId;
    type: string;
    message: string;
    data?: any;
  }): Promise<void> {
    await Notification.create(notification);
  }

  async sendNotification(userId: Types.ObjectId, type: string, message: string, data?: any): Promise<void> {
    // Save notification to database
    await this.saveNotification({
      userId,
      type,
      message,
      data,
    });

    // Send real-time notification if user is connected
    this.io.to(userId.toString()).emit('notification', {
      type,
      message,
      data,
      timestamp: new Date(),
    });
  }

  async sendSwapRequest(ownerId: Types.ObjectId, swapData: any): Promise<void> {
    await this.sendNotification(
      ownerId,
      'swap_request',
      'You have received a new swap request',
      swapData
    );
  }

  async sendSwapResponse(requesterId: Types.ObjectId, accepted: boolean, swapData: any): Promise<void> {
    await this.sendNotification(
      requesterId,
      accepted ? 'swap_accepted' : 'swap_rejected',
      accepted ? 'Your swap request was accepted' : 'Your swap request was rejected',
      swapData
    );
  }

  async sendItemModeration(uploaderId: Types.ObjectId, approved: boolean, itemData: any): Promise<void> {
    await this.sendNotification(
      uploaderId,
      approved ? 'item_approved' : 'item_rejected',
      approved ? 'Your item has been approved' : 'Your item has been rejected',
      itemData
    );
  }
}

export default SocketService;
