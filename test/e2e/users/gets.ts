import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';

function getResources(module: TestingModule) {
  const redisCon = module.get<Redis>('RedisConnection');
  const service = module.get<UsersService>(UsersService);

  return { redisCon, service };
}

export async function getAll(module: TestingModule, app: INestApplication) {
  const { service } = getResources(module);

  // Arranges
  jest.spyOn(service, 'findAll').mockResolvedValue(new Array(4).fill(new User()));

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get('/users');

  // Asserts
  expect(service.findAll).toHaveBeenCalledTimes(1);
  expect(service.findAll).toHaveBeenCalledWith();
  expect(response.status).toBe(200);
  expect(response.body.length).toBe(4);
}

export async function getByNin(module: TestingModule, app: INestApplication) {
  const { service, redisCon } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';

  jest.spyOn(service, 'findOne');
  jest.spyOn(redisCon, 'get').mockImplementation(async () => {
    return JSON.stringify({ nin: 'def_12345678910', name: 'João', age: 30 });
  });

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get(`/users/${nin}`);

  // Asserts
  expect(response.status).toBe(200);
  expect(service.findOne).toHaveBeenCalledTimes(1);
  expect(service.findOne).toHaveBeenCalledWith(nin);
  expect(redisCon.get).toHaveBeenCalledTimes(1);
  expect(redisCon.get).toHaveBeenCalledWith(`users:${nin}`);
  expect(response.body.name).toMatch('João');
}

export async function getByNinNotFound(module: TestingModule, app: INestApplication) {
  const { service, redisCon } = getResources(module);

  // Arranges
  const nin = 'def_12345678910';

  jest.spyOn(service, 'findOne');
  jest.spyOn(redisCon, 'get').mockResolvedValue(null);

  // Acts
  const server = request(app.getHttpServer());
  const response = await server.get(`/users/${nin}`);

  // Asserts
  expect(service.findOne).toHaveBeenCalledTimes(1);
  expect(service.findOne).toHaveBeenCalledWith(nin);
  expect(redisCon.get).toHaveBeenCalledTimes(1);
  expect(redisCon.get).toHaveBeenCalledWith(`users:${nin}`);
  expect(response.status).toBe(404);
  expect(response.body.message).toMatch('User def_12345678910 not found');
}
