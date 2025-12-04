import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})
export class ResearchGateway {
  @WebSocketServer() server: Server;
  private logger = new Logger('ResearchGateway');

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    const room = `research:${data.taskId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
  }

  emitProgress(taskId: string, step: string) {
    this.server.to(`research:${taskId}`).emit('progress', {
      step,
      message: this.getStepMessage(step),
      timestamp: new Date(),
    });
  }

  emitComplete(taskId: string, report: string) {
    this.server.to(`research:${taskId}`).emit('complete', {
      report,
      timestamp: new Date(),
    });
  }

  emitError(taskId: string, error: string) {
    this.server.to(`research:${taskId}`).emit('error', {
      error,
      timestamp: new Date(),
    });
  }

  private getStepMessage(step: string): string {
    const messages = {
      planning: 'Planning research strategy...',
      searching: 'Searching the web for relevant sources...',
      analyzing: 'Analyzing and synthesizing findings...',
      generating: 'Generating comprehensive report...',
    };
    return messages[step] || 'Processing...';
  }
}