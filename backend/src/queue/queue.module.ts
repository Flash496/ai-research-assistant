import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { ResearchProcessor } from './research.processor';
import { DatabaseModule } from '../database/database.module';
import { AgentModule } from '../agent/agent.module';
import { ResearchGateway } from '../gateway/research.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'research',
    }),
    DatabaseModule,
    AgentModule,
  ],
  providers: [QueueService, ResearchProcessor, ResearchGateway],
  exports: [QueueService],
})
export class QueueModule {}