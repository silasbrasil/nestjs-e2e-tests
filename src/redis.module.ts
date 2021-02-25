import { Module } from '@nestjs/common';
import * as Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'RedisConnection',
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
          password: '1234',
        });
      },
    },
  ],
  exports: ['RedisConnection'],
})
export class RedisModule {}
