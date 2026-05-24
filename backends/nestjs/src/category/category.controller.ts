import { Controller, Get, Post, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CategoryRequest } from './dto/category-request.dto';
import { CategoryResponse } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: '카테고리 목록 조회', description: '등록된 모든 카테고리를 반환함.' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [CategoryResponse] })
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: '카테고리 생성', description: '새 카테고리를 생성하고 생성된 리소스를 반환함.' })
  @ApiResponse({ status: 201, description: '생성 성공', type: CategoryResponse })
  @ApiResponse({ status: 400, description: '잘못된 요청 (validation 실패)' })
  async createCategory(@Body() request: CategoryRequest) {
    return this.categoryService.create(request);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '카테고리 삭제', description: 'ID로 카테고리를 삭제함. 연관된 Task도 함께 삭제됨(cascade).' })
  @ApiParam({ name: 'id', description: '삭제할 카테고리 ID', type: Number })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '카테고리 없음' })
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.remove(Number(id));
    return;
  }
}
