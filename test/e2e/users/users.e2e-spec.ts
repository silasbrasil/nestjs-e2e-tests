import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../../../src/users/users.module';
import { getAll, getByNin, getByNinNotFound } from './gets';
import { createUserOk, createUserBadRequest } from './posts';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { Redis } from 'ioredis';
import { updateUserBadRequest, updateUserOk } from './puts';

describe('UsersController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider('RedisConnection')
      .useValue({
        set: jest.fn(),
        get: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
        zrevrange: jest.fn(),
        pipeline: jest.fn(),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('Should be instantiated', () => {
    const controller = module.get<UsersController>(UsersController);
    const service = module.get<UsersService>(UsersService);
    const redis = module.get<Redis>('RedisConnection');

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(redis).toBeDefined();
  });

  it('(GET) /users - Should return a list of users', () => getAll(module, app));
  it('(GET) /users/:nin - Should return a user', () => getByNin(module, app));
  it('(GET) /users/:nin - Should return 404 not found', () => getByNinNotFound(module, app));

  it('/users (POST) - Should create a user', () => createUserOk(module, app));
  it('/users (POST) - Should return bad request', () => createUserBadRequest(module, app));

  it('/users (PUT) - Should update an user', () => updateUserOk(module, app));
  it('/users (PUT) - Should return bad request', () => updateUserBadRequest(module, app));
});
