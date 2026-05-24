import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategoryRequest } from './dto/category-request.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany();
    return categories;
  }

  async create(data: CategoryRequest) {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
    return category;
  }

  async remove(id: number) {
    await this.prisma.category.delete({
      where: { id: BigInt(id) },
    });
  }
}
