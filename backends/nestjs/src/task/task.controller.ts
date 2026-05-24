import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { TaskRequest } from './dto/task-request.dto';
import { TaskResponse } from './dto/task-response.dto';

@ApiTags('Tasks')
@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Task 목록 조회', description: '전체 Task 목록을 반환함. `categoryId`로 필터링 가능.' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number, description: '필터링할 카테고리 ID (Optional)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: [TaskResponse] })
  async getTasks(@Query('categoryId') categoryId?: string) {
    return this.taskService.findAll(categoryId ? Number(categoryId) : undefined);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Task 생성', description: '새 Task를 생성하고 생성된 리소스를 반환함. `categoryId`가 존재하지 않으면 404 반환.' })
  @ApiResponse({ status: 201, description: '생성 성공', type: TaskResponse })
  @ApiResponse({ status: 400, description: '잘못된 요청 (validation 실패)' })
  @ApiResponse({ status: 404, description: '카테고리 없음' })
  async createTask(@Body() request: TaskRequest) {
    return this.taskService.create(request);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Task 수정', description: 'ID로 Task를 조회하여 전체 업데이트(PUT semantics)함.' })
  @ApiParam({ name: 'id', description: '수정할 Task ID', type: Number })
  @ApiResponse({ status: 200, description: '수정 성공', type: TaskResponse })
  @ApiResponse({ status: 404, description: 'Task 또는 카테고리 없음' })
  async updateTask(@Param('id') id: string, @Body() request: TaskRequest) {
    return this.taskService.update(Number(id), request);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Task 삭제', description: 'ID로 Task를 삭제함.' })
  @ApiParam({ name: 'id', description: '삭제할 Task ID', type: Number })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: 'Task 없음' })
  async deleteTask(@Param('id') id: string) {
    await this.taskService.remove(Number(id));
    return;
  }
}
