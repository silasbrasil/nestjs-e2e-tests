import { Redis } from 'ioredis';
import * as request from 'supertest';
import { TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { INestApplication } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { UserDto } from '../../../src/users/dto/user.dto';

function getResources(module: TestingModule) {
  const service = module.get<UsersService>(UsersService);
  const redis = module.get<Redis>('RedisConnection');

  return { redis, service };
}

export async function createUserOk(module: TestingModule, app: INestApplication) {
  const { service, redis } = getResources(module);

  // Arranges
  const body = {
    nin: 'def_12345678910',
    name: 'Karl Marx',
    age: '20',
    email: 'karl@gmail.com',
    rg: '1232312',
    date_of_birth: '2021-02-25',
  };
  const key = `users:${body.nin}`;
  const createUserDto = plainToClass(UserDto, body);

  jest.spyOn(service, 'create');
  jest.spyOn(redis, 'set').mockImplementation(async () => 'OK');

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.post(`/users`).send(body);

  // Asserts
  expect(response.status).toBe(201);
  expect(service.create).toHaveBeenCalledTimes(1);
  expect(service.create).toHaveBeenCalledWith(createUserDto);
  expect(redis.set).toHaveBeenCalledTimes(1);
  expect(redis.set).toHaveBeenCalledWith(key, JSON.stringify(createUserDto));
  expect(response.body).toMatchObject({});
  expect(createUserDto.date_of_birth).toBeInstanceOf(Date);
}

export async function createUserBadRequest(module: TestingModule, app: INestApplication) {
  const { service } = getResources(module);

  // Arranges
  const body = {
    // nin: 'def_12345678910',
    name: 'Karl Marx',
    age: 20,
    // email: 'karl@gmail.com',
    // rg: '1232312',
  };

  jest.spyOn(service, 'create');

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.post(`/users`).send(body);

  // Asserts
  expect(response.status).toBe(400);
  expect(service.create).not.toHaveBeenCalled();
}
