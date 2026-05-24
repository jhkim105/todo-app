import { Controller, Get, Post, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRequest } from './dto/category-request.dto';

@Controller('api/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return this.categoryService.findAll();
  }

  @Post()
  @HttpCode(201)
  async createCategory(@Body() request: CategoryRequest) {
    return this.categoryService.create(request);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteCategory(@Param('id') id: string) {
    await this.categoryService.remove(Number(id));
    return;
  }
}
