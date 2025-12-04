import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { SearchTool } from './tools/search.tool';

@Module({
  providers: [AgentService, SearchTool],
  exports: [AgentService],
})
export class AgentModule {}