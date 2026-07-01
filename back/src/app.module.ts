import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { MailModule } from './mail/mail.module';
import { UserEntity } from './users/entities/user.entity';
import { ProductEntity } from './products/entities/product.entity';
import { CategoryEntity } from './categories/entities/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') ?? 'localhost',
        port: config.get<number>('DB_PORT') ?? 5432,
        username: config.get<string>('DB_USERNAME') ?? 'postgres',
        password: config.get<string>('DB_PASSWORD') ?? 'postgres',
        database: config.get<string>('DB_DATABASE') ?? 'practico_final',
        entities: [UserEntity, ProductEntity, CategoryEntity],
        synchronize: true,
      }),
    }),
    MailModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
  ],
})
export class AppModule {}
