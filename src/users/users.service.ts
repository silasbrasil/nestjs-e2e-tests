import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { Redis } from 'ioredis';

@Injectable()
export class UsersService {
  readonly key = 'users';

  constructor(@Inject('RedisConnection') private redis: Redis) {}

  async create(createUserDto: UserDto): Promise<void> {
    const { nin } = createUserDto;
    const value = JSON.stringify(createUserDto);

    await this.redis.set(`${this.key}:${nin}`, value);
  }

  async findAll(): Promise<User[]> {
    const keys = await this.redis.keys('users:*');
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.get(key);
    }
    const arr = await pipeline.exec();

    const users = [];
    for (let i = 0; i < arr.length; i += 2) {
      const { nin, name, email } = JSON.parse(arr[i][1]);
      users.push({ nin, name, email });
    }

    return users;
  }

  async findOne(nin: string): Promise<User> {
    const value = await this.redis.get(`${this.key}:${nin}`);
    if (!value) throw new NotFoundException(`User ${nin} not found`);

    return JSON.parse(value);
  }

  async update(nin: string, updateUserDto: UpdateUserDto): Promise<User> {
    const key = `${this.key}:${nin}`;
    const value = await this.redis.get(key);
    if (!value) throw new NotFoundException(`User ${nin} not found`);

    const user = JSON.parse(value);
    for (const [key, value] of Object.entries(updateUserDto)) {
      user[key] = value;
    }

    await this.redis.set(key, JSON.stringify(user));

    return user;
  }

  async remove(id: number): Promise<User> {
    return;
  }
}
