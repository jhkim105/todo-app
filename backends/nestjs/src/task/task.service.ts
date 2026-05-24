import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskRequest } from './dto/task-request.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: number) {
    const tasks = await this.prisma.task.findMany({
      where: categoryId ? { categoryId: BigInt(categoryId) } : {},
      include: { category: true }, // Eager loads category - N+1 query optimized!
    });
    return tasks;
  }

  async create(data: TaskRequest) {
    if (data.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: BigInt(data.categoryId) },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category not found with id: ${data.categoryId}`);
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        completed: data.completed,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      },
      include: { category: true },
    });
    return task;
  }

  async update(id: number, data: TaskRequest) {
    const taskExists = await this.prisma.task.findUnique({
      where: { id: BigInt(id) },
    });
    if (!taskExists) {
      throw new NotFoundException(`Task not found with id: ${id}`);
    }

    if (data.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: BigInt(data.categoryId) },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category not found with id: ${data.categoryId}`);
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        description: data.description || null,
        completed: data.completed,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      },
      include: { category: true },
    });
    return updatedTask;
  }

  async remove(id: number) {
    const taskExists = await this.prisma.task.findUnique({
      where: { id: BigInt(id) },
    });
    if (!taskExists) {
      throw new NotFoundException(`Task not found with id: ${id}`);
    }

    await this.prisma.task.delete({
      where: { id: BigInt(id) },
    });
  }
}
