import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [CategoryModule, TaskModule],
})
export class AppModule {}
