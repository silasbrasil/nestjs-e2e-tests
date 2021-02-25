import { Redis } from 'ioredis';
import * as request from 'supertest';
import { TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { INestApplication } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from '../../../src/users/dto/user.dto';

function getResources(module: TestingModule) {
  const service = module.get<UsersService>(UsersService);
  const redis = module.get<Redis>('RedisConnection');

  return { redis, service };
}

export async function updateUserOk(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';
  const body = {
    name: 'Silas Brasil',
    age: 29,
    email: 'silas@gmail.com',
    rg: '1111',
  };
  const storedUser = {
    name: 'Karl Marx',
    age: 20,
    email: 'karl@gmail.com',
    rg: '2222',
  };
  const userUpdated = {
    name: 'Silas Brasil',
    age: 29,
    email: 'karl@gmail.com',
    rg: '2222',
  };
  const key = `users:${nin}`;

  jest.spyOn(service, 'update');
  jest.spyOn(redis, 'get').mockImplementation(async () => JSON.stringify(storedUser));
  jest.spyOn(redis, 'set').mockImplementation(async () => 'OK');

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.put(`/users/${nin}`).send(body);

  // Asserts
  expect(response.status).toBe(200);
  expect(service.update).toHaveBeenCalledTimes(1);
  expect(service.update).toHaveBeenCalledWith(
    nin,
    plainToClass(UpdateUserDto, { name: 'Silas Brasil', age: 29 }),
  );
  expect(redis.set).toHaveBeenCalledTimes(1);
  expect(redis.set).toHaveBeenCalledWith(key, JSON.stringify(userUpdated));
  expect(response.body).toEqual(userUpdated);
}

export async function updateUserBadRequest(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';
  const body = {
    name: 'Silas Brasil',
    age: 29,
  };
  const updateUserDto = plainToClass(UpdateUserDto, body);
  const key = `users:${nin}`;

  jest.spyOn(service, 'update');
  jest.spyOn(redis, 'get').mockResolvedValue(null);

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.put(`/users/${nin}`).send(body);

  // Asserts
  expect(response.status).toBe(404);
  expect(service.update).toHaveBeenCalledTimes(1);
  expect(service.update).toHaveBeenCalledWith(nin, updateUserDto);
  expect(redis.get).toHaveBeenCalledTimes(1);
  expect(redis.get).toHaveBeenCalledWith(key);
  expect(redis.set).not.toHaveBeenCalled();
  expect(response.body.message).toMatch(`User ${nin} not found`);
}
