import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { normalizeLimit, normalizePage } from '../common/pagination';

export interface ProductListResult {
  items: ProductEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity) private readonly repo: Repository<ProductEntity>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(query: QueryProductsDto): Promise<ProductListResult> {
    const page = normalizePage(query.page);
    const limit = normalizeLimit(query.limit, 100, 10);
    const sortBy = query.sortBy ?? 'id';
    const order = (query.order ?? 'ASC').toUpperCase() as 'ASC' | 'DESC';

    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy(`product.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    if (query.name) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${query.name}%` });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ where: { id }, relations: ['category'] });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    if (dto.categoryId) {
      const exists = await this.categoriesService.exists(dto.categoryId);
      if (!exists) throw new BadRequestException('categoryId does not exist');
    }
    const product = this.repo.create({
      name: dto.name,
      price: dto.price,
      stock: dto.stock ?? 0,
      categoryId: dto.categoryId ?? null,
    });
    const saved = await this.repo.save(product);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      const exists = await this.categoriesService.exists(dto.categoryId);
      if (!exists) throw new BadRequestException('categoryId does not exist');
    }
    Object.assign(product, dto);
    await this.repo.save(product);
    return this.findOne(id);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return product;
  }

  async findByCategory(categoryId: number) {
    return this.repo.find({ where: { categoryId }, relations: ['category'] });
  }
}
