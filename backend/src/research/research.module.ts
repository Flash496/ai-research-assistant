import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { DatabaseModule } from '../database/database.module';
import { AgentModule } from '../agent/agent.module';
import { QueueModule } from '../queue/queue.module';
import { ResearchGateway } from '../gateway/research.gateway';

@Module({
  imports: [DatabaseModule, AgentModule, QueueModule],
  controllers: [ResearchController],
  providers: [ResearchService, ResearchGateway],
  exports: [ResearchGateway],
})
export class ResearchModule {}