import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  findByVerificationToken(token: string) {
    return this.usersRepo.findOne({ where: { verificationToken: token } });
  }

  findByResetToken(token: string) {
    return this.usersRepo.findOne({ where: { resetPasswordToken: token } });
  }

  findAll() {
    return this.usersRepo.find({ order: { createdAt: 'ASC' } });
  }

  save(user: UserEntity) {
    return this.usersRepo.save(user);
  }

  async updateRole(targetId: string, currentUser: UserEntity, role: UserRole) {
    if (targetId === currentUser.id) {
      throw new ForbiddenException('Cannot change your own role');
    }
    const target = await this.usersRepo.findOne({ where: { id: targetId } });
    if (!target) throw new NotFoundException('User not found');

    if (target.role === 'admin' && role !== 'admin') {
      const adminCount = await this.usersRepo.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot demote the only admin');
      }
    }

    target.role = role;
    return this.usersRepo.save(target);
  }

  async updatePassword(user: UserEntity, currentPassword: string, newPassword: string) {
    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) throw new BadRequestException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);
  }

  async updateEmail(user: UserEntity, newEmail: string, password: string) {
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new BadRequestException('Password is incorrect');

    const existing = await this.usersRepo.findOne({ where: { email: newEmail } });
    if (existing && existing.id !== user.id) {
      throw new ConflictException('Email already in use');
    }

    user.email = newEmail;
    await this.usersRepo.save(user);
  }

  async deleteOwnAccount(user: UserEntity, password: string) {
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) throw new BadRequestException('Password is incorrect');

    if (user.role === 'admin') {
      const adminCount = await this.usersRepo.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot delete the only admin');
      }
    }

    await this.usersRepo.remove(user);
  }
}
