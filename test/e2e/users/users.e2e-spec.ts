import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../../../src/users/users.module';
import { getAll, getByNin, getByNinNotFound } from './gets';
import { createUserOk, createUserBadRequest } from './posts';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import * as Redis from 'ioredis';
import { updateUserBadRequest, updateUserOk } from './puts';

jest.mock('ioredis');
const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('UsersController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let mockRedis: Redis.Redis;

  beforeEach(async () => {
    MockRedis.prototype.pipeline.mockReturnThis();
    mockRedis = new MockRedis();

    module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider('RedisConnection')
      .useValue(mockRedis)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('Should be instantiated', () => {
    const controller = module.get<UsersController>(UsersController);
    const service = module.get<UsersService>(UsersService);
    const redis = module.get<Redis.Redis>('RedisConnection');

    const pipeline = mockRedis.pipeline();

    expect(pipeline).toBeDefined();
    expect(pipeline.get).toBeDefined();
    expect(pipeline.set).toBeDefined();

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(redis).toBeDefined();
  });

  it('(GET) /users - Should return a list of users', () => getAll(module, app));
  it('(GET) /users/:nin - Should return a user', () => getByNin(module, app));
  it('(GET) /users/:nin - Should return 404 not found', () => getByNinNotFound(module, app));

  it('(POST) /users - Should create a user', () => createUserOk(module, app));
  it('(POST) /users - Should return bad request', () => createUserBadRequest(module, app));

  it('(PUT) /users:nin - Should update an user', () => updateUserOk(module, app));
  it('(PUT) /users:nin - Should return bad request', () => updateUserBadRequest(module, app));
});
