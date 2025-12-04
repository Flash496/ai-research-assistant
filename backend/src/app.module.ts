import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { env } from './config/environment';
import { PrismaService } from './database/database.service';
import { ResearchModule } from './research/research.module';
import { AgentModule } from './agent/agent.module';
import { QueueModule } from './queue/queue.module';
import { ResearchGateway } from './gateway/research.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      redis: {
        host: new URL(env.REDIS_URL).hostname,
        port: parseInt(new URL(env.REDIS_URL).port || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'research',
    }),
    ResearchModule,
    AgentModule,
    QueueModule,
  ],
  providers: [PrismaService, ResearchGateway],
  exports: [PrismaService],
})
export class AppModule {}