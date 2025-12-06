import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';
import { MailService } from './../src/mail/mail.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('AppController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let todoId: string;     

  const mockMailService = {
    sendTodoReminder: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mockMailService)    
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
  });

  afterAll(async () => {
    if (prisma) {
        await prisma.todo.deleteMany();
        await prisma.user.deleteMany();
    }
    
    if (app) {
        await app.close(); 
    }
  });


  describe('Auth', () => {
    it('/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);
    });

    it('/auth/login (POST) - should login and return JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          username: 'testuser', 
          password: 'password123',
        })
        .expect(201);

        expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });

    it('/auth/login (POST) - should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401); 
    });
  });

  describe('Todos', () => {
    it('/todos (GET) - should fail without token', () => {
      return request(app.getHttpServer())
        .get('/todos')
        .expect(401);
    });

    it('/todos (POST) - should create a todo', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`) 
        .send({
          title: 'Belajar NestJS E2E',
          description: 'Mengerjakan Final Project',
          priority: 'high',
          dueDate: new Date().toISOString(),
          category: 'Kuliah',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toEqual('Belajar NestJS E2E');
      todoId = response.body.id;
    });

    it('/todos (POST) - should fail if title is missing', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          priority: 'high',
        })
        .expect(400); 
    });

    it('/todos (GET) - should get list of todos with filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos?search=NestJS&priority=high')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('NestJS');
    });

    it('/todos/:id (GET) - should get a single todo', () => {
      return request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(todoId);
        });
    });

    it('/todos/:id (PATCH) - should update todo status', () => {
      return request(app.getHttpServer())
        .patch(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          completed: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.completed).toBe(true);
        });
    });

    it('/todos/:id (DELETE) - should delete todo', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('/todos/:id (GET) - should not find deleted todo', () => {
      return request(app.getHttpServer())
        .get(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404); 
    });
  });

  describe('Upload', () => {
    const fixturePath = join(__dirname, 'fixtures', 'sample.png');
    let uploadedImagePath: string | null = null;

    it('/upload (POST) - should fail without token', () => {
      return request(app.getHttpServer())
        .post('/upload')
        .expect(401);
    });

    it('/upload (POST) - should upload image with token', async () => {
      const res = await request(app.getHttpServer())
        .post('/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('image', fixturePath)
        .expect(201);

      expect(res.body).toHaveProperty('imagePath');
      expect(typeof res.body.imagePath).toBe('string');
      uploadedImagePath = res.body.imagePath;
      const diskPath = join(process.cwd(), uploadedImagePath || '');
      expect(existsSync(diskPath)).toBe(true);
    });

    afterAll(() => {
      if (uploadedImagePath) {
        const diskPath = join(process.cwd(), uploadedImagePath);
        if (existsSync(diskPath)) {
          try {
            unlinkSync(diskPath);
          } catch (err) {
          }
        }
      }
    });
  });
});