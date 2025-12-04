import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto, ResearchResponseDto } from './dto/create-research.dto';

@Controller('api/research')
export class ResearchController {
  private logger = new Logger('ResearchController');

  constructor(private researchService: ResearchService) {}

  @Post('start')
  async startResearch(
    @Body() createResearchDto: CreateResearchDto,
  ): Promise<ResearchResponseDto> {
    this.logger.log(`Starting research: ${createResearchDto.query}`);
    return this.researchService.startResearch(createResearchDto.query);
  }

  @Get(':id')
  async getResearch(@Param('id') id: string): Promise<ResearchResponseDto> {
    return this.researchService.getResearch(id);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string): Promise<{ status: string; progress: number }> {
    return this.researchService.getStatus(id);
  }
}