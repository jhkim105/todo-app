import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskRequest } from './dto/task-request.dto';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getTasks(@Query('categoryId') categoryId?: string) {
    return this.taskService.findAll(categoryId ? Number(categoryId) : undefined);
  }

  @Post()
  @HttpCode(201)
  async createTask(@Body() request: TaskRequest) {
    const task = await this.taskService.create(request);
    return task;
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() request: TaskRequest) {
    const task = await this.taskService.update(Number(id), request);
    return task;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteTask(@Param('id') id: string) {
    await this.taskService.remove(Number(id));
    return;
  }
}
