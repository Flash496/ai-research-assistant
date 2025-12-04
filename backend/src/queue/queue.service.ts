import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('research') private researchQueue: Queue) {}

  async addResearchJob(data: { taskId: string; query: string }) {
    await this.researchQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}