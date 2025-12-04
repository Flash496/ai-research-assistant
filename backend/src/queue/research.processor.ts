import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { AgentService } from '../agent/agent.service';
import { ResearchGateway } from '../gateway/research.gateway';

@Processor('research')
export class ResearchProcessor {
  private logger = new Logger('ResearchProcessor');

  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private gateway: ResearchGateway,
  ) {}

  @Process()
  async handleResearch(job: Job<{ taskId: string; query: string }>) {
    const { taskId, query } = job.data;

    try {
      // Update status to processing
      await this.prisma.researchTask.update({
        where: { id: taskId },
        data: { status: 'processing', startedAt: new Date() },
      });

      // Execute research with progress updates
      const result = await this.agentService.executeResearch(query, (step) => {
        job.progress(this.getProgressForStep(step));
        this.gateway.emitProgress(taskId, step);
      });

      // Save sources
      await Promise.all(
        result.searchResults.map(source =>
          this.prisma.source.create({
            data: {
              taskId,
              title: source.title,
              url: source.url,
              content: source.content,
              snippet: source.snippet,
              relevanceScore: source.score || 0,
            },
          }),
        ),
      );

      // Update task with results
      await this.prisma.researchTask.update({
        where: { id: taskId },
        data: {
          status: 'complete',
          report: result.report,
          progress: 100,
          completedAt: new Date(),
        },
      });

      this.gateway.emitComplete(taskId, result.report);
      return { taskId, status: 'complete' };
    } catch (error) {
      this.logger.error(`Research failed for ${taskId}:`, error);

      await this.prisma.researchTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date(),
        },
      });

      this.gateway.emitError(taskId, error.message);
      throw error;
    }
  }

  private getProgressForStep(step: string): number {
    const progressMap = {
      planning: 20,
      searching: 40,
      analyzing: 70,
      generating: 95,
    };
    return progressMap[step] || 0;
  }
}