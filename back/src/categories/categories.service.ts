import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(CategoryEntity) private readonly repo: Repository<CategoryEntity>) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(name: string) {
    const existing = await this.repo.findOne({ where: { name } });
    if (existing) throw new ConflictException('Category name already exists');
    return this.repo.save(this.repo.create({ name }));
  }

  async update(id: number, name: string) {
    const category = await this.findOne(id);
    const existing = await this.repo.findOne({ where: { name } });
    if (existing && existing.id !== id) throw new ConflictException('Category name already exists');
    category.name = name;
    return this.repo.save(category);
  }

  async remove(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.repo.remove(category);
    return category;
  }

  exists(id: number) {
    return this.repo.exist({ where: { id } });
  }
}
