import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';

function getResources(module: TestingModule) {
  const redis = module.get<Redis>('RedisConnection');
  const service = module.get<UsersService>(UsersService);

  return { redis, service };
}

export async function getAll(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  jest.spyOn(service, 'findAll');
  jest.spyOn(redis, 'keys').mockResolvedValue(['key', 'key', 'key', 'key']);
  jest.spyOn(redis, 'exec').mockResolvedValue([
    [null, JSON.stringify(new User('def_123'))],
    [null, JSON.stringify(new User('def_345'))],
    [null, JSON.stringify(new User('def_567'))],
    [null, JSON.stringify(new User('def_789'))],
  ]);

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get('/users');

  // Asserts
  expect(service.findAll).toHaveBeenCalledTimes(1);
  expect(service.findAll).toHaveBeenCalledWith();
  expect(redis.get).toHaveBeenCalledTimes(4);
  expect(redis.keys).toHaveBeenCalledTimes(1);
  expect(redis.exec).toHaveBeenCalledTimes(1);
  expect(response.status).toBe(200);
  expect(response.body.length).toBe(4);
  console.log(response.body);
}

export async function getByNin(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';

  jest.spyOn(service, 'findOne');
  jest.spyOn(redis, 'get').mockImplementation(async () => {
    return JSON.stringify({ nin: 'def_12345678910', name: 'João', age: 30 });
  });

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get(`/users/${nin}`);

  // Asserts
  expect(response.status).toBe(200);
  expect(service.findOne).toHaveBeenCalledTimes(1);
  expect(service.findOne).toHaveBeenCalledWith(nin);
  expect(redis.get).toHaveBeenCalledTimes(1);
  expect(redis.get).toHaveBeenCalledWith(`users:${nin}`);
  expect(response.body.name).toMatch('João');
}

export async function getByNinNotFound(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';

  jest.spyOn(service, 'findOne');
  jest.spyOn(redis, 'get').mockResolvedValue(null);

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get(`/users/${nin}`);

  // Asserts
  expect(service.findOne).toHaveBeenCalledTimes(1);
  expect(service.findOne).toHaveBeenCalledWith(nin);
  expect(redis.get).toHaveBeenCalledTimes(1);
  expect(redis.get).toHaveBeenCalledWith(`users:${nin}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toMatch('User def_12345678910 not found');
}
