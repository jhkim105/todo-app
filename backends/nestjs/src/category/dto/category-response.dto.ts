import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponse {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '카테고리 이름', example: 'Work' })
  name: string;

  @ApiProperty({ description: '카테고리 색상 Hex 코드', example: '#FF5733' })
  color: string;
}
