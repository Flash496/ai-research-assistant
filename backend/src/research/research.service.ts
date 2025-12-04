import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { AgentService } from '../agent/agent.service';
import { QueueService } from '../queue/queue.service';
import { ResearchGateway } from '../gateway/research.gateway';

@Injectable()
export class ResearchService {
  private logger = new Logger('ResearchService');

  constructor(
    private prisma: PrismaService,
    private agentService: AgentService,
    private queueService: QueueService,
    private gateway: ResearchGateway,
  ) {}

  async startResearch(query: string) {
    try {
      // Create task in database
      const task = await this.prisma.researchTask.create({
        data: {
          query,
          status: 'pending',
          progress: 0,
        },
      });

      this.logger.log(`Research task created: ${task.id}`);

      // Queue the job
      await this.queueService.addResearchJob({
        taskId: task.id,
        query,
      });

      return this.formatResponse(task);
    } catch (error) {
      this.logger.error(`Failed to start research: ${error.message}`);
      throw error;
    }
  }

  async getResearch(id: string) {
    const task = await this.prisma.researchTask.findUnique({
      where: { id },
      include: { sources: true },
    });

    if (!task) {
      throw new NotFoundException(`Research task ${id} not found`);
    }

    return this.formatResponse(task);
  }

  async getStatus(id: string) {
    const task = await this.prisma.researchTask.findUnique({
      where: { id },
      select: {
        status: true,
        progress: true,
        error: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Research task ${id} not found`);
    }

    return {
      status: task.status,
      progress: task.progress,
      error: task.error,
    };
  }

  private formatResponse(task: any) {
    return {
      id: task.id,
      query: task.query,
      status: task.status,
      progress: task.progress || 0,
      report: task.report || null,
      error: task.error || null,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    };
  }
}