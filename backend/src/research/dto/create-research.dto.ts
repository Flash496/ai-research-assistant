import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateResearchDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  query: string;
}

export class ResearchResponseDto {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  report?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}