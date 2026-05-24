import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponse } from '../../category/dto/category-response.dto';

export class TaskResponse {
  @ApiProperty({ description: 'Task ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Task 제목', example: 'Submit Report' })
  title: string;

  @ApiPropertyOptional({ description: 'Task 상세 설명', example: 'Quarterly financial report' })
  description?: string;

  @ApiProperty({ description: '완료 여부', example: false })
  completed: boolean;

  @ApiPropertyOptional({ description: '마감일 (ISO-8601)', example: '2026-05-31T23:59:59+09:00' })
  dueDate?: string;

  @ApiProperty({ description: '우선순위', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH' })
  priority: string;

  @ApiPropertyOptional({ description: '연결된 카테고리', type: () => CategoryResponse })
  category?: CategoryResponse;
}
