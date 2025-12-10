import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';
import { MailService } from './../src/mail/mail.service';
import { SchedulerService } from './../src/scheduler/scheduler.service';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Todo App E2E Tests - Complete Coverage', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let schedulerService: SchedulerService;
  let accessTokenA: string;
  let accessTokenB: string;
  let refreshTokenA: string;
  let refreshTokenB: string;
  let userIdA: string;
  let userIdB: string;
  let todoIdA: string;
  let publicTodoIdA: string;
  let todoWithImageId: string;

  const mockMailService = {
    sendTodoReminder: jest.fn().mockResolvedValue(true),
    sendDailySummary: jest.fn().mockResolvedValue(true),
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
    schedulerService = app.get<SchedulerService>(SchedulerService);
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Authentication & Authorization', () => {
    it('/auth/register (POST) - successfully register user A with all fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'usera@example.com',
          username: 'usera',
          password: 'password123',
          name: 'User A',
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.user).toMatchObject({
        email: 'usera@example.com',
        username: 'usera',
        name: 'User A',
      });
      expect(res.body.user).toHaveProperty('id');
      userIdA = res.body.user.id;
    });

    it('/auth/register (POST) - fail with duplicate username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'another@example.com',
          username: 'usera',
          password: 'password123',
          name: 'Another User',
        })
        .expect(409);
    });

    it('/auth/register (POST) - fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'usera@example.com',
          username: 'anotherusername',
          password: 'password123',
          name: 'Another User',
        })
        .expect(409);
    });

    it('/auth/register (POST) - fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('/auth/register (POST) - fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalidemail',
          username: 'testuser',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('/auth/register (POST) - register user B', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'userb@example.com',
          username: 'userb',
          password: 'password123',
          name: 'User B',
        })
        .expect(201);

      userIdB = res.body.user.id;
    });

    it('/auth/login (POST) - successfully login user A', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'usera',
          password: 'password123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.user).toMatchObject({
        username: 'usera',
        email: 'usera@example.com',
      });
      accessTokenA = res.body.access_token;
      refreshTokenA = res.body.refresh_token;
    });

    it('/auth/login (POST) - successfully login user B', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'userb',
          password: 'password123',
        })
        .expect(201);

      accessTokenB = res.body.access_token;
      refreshTokenB = res.body.refresh_token;
    });

    it('/auth/login (POST) - fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'usera',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/login (POST) - fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });

    it('/auth/login (POST) - fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'usera',
        })
        .expect(400);
    });

    it('/auth/refresh (POST) - successfully refresh access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshTokenA,
        })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      accessTokenA = res.body.access_token;
      refreshTokenA = res.body.refresh_token;
    });

    it('/auth/refresh (POST) - fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid.token.here',
        })
        .expect(401);
    });

    it('/auth/refresh (POST) - fail without refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('2. User Story 1: Create Task (CREATE) - Title, Description, Priority, Due Date, Category', () => {
    it('/todos (GET) - should fail without authentication token', () => {
      return request(app.getHttpServer()).get('/todos').expect(401);
    });

    it('/todos (POST) - successfully create a complete todo with all fields (user A)', async () => {
      const due = new Date();
      due.setDate(due.getDate() + 2);
      const res = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Belajar NestJS E2E - Private',
          description: 'Private task by user A',
          priority: 'high',
          dueDate: due.toISOString(),
          category: 'Kuliah',
          isPublic: false,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toContain('Belajar NestJS E2E - Private');
      todoIdA = res.body.id;
    });

    it('/todos (POST) - create a public todo (user A)', async () => {
      const due = new Date();
      due.setDate(due.getDate() + 1);
      const res = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Belajar NestJS E2E - Public',
          description: 'Public task by user A',
          priority: 'medium',
          dueDate: due.toISOString(),
          category: 'Work',
          isPublic: true,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      publicTodoIdA = res.body.id;
    });

    it('/todos (POST) - should fail if title missing', () => {
      return request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ priority: 'high' })
        .expect(400);
    });

    it('/todos (GET) - search & filter & includes public from others', async () => {
      // User B should see user A's public todo when searching 'Public'
      const resB = await request(app.getHttpServer())
        .get('/todos')
        .query({ search: 'Public', priority: 'medium' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(resB.body.data)).toBe(true);
      expect(resB.body.data.some((t: any) => t.id === publicTodoIdA)).toBe(true);
      const resB2 = await request(app.getHttpServer())
        .get('/todos')
        .query({ search: 'Private' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      const foundPrivate = resB2.body.data.some((t: any) => t.id === todoIdA);
      expect(foundPrivate).toBe(false);
    });

    it('/todos/:id (GET) - user A can get private todo', () => {
      return request(app.getHttpServer())
        .get(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(todoIdA);
          expect(res.body.user).toBeDefined();
        });
    });

    it('/todos/:id (GET) - user B cannot get A\'s private todo (403)', () => {
      return request(app.getHttpServer())
        .get(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(403);
    });

    it('/todos/:id (PATCH) - user B cannot update A\'s todo (403)', () => {
      return request(app.getHttpServer())
        .patch(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .send({ title: 'Malicious Update' })
        .expect(403);
    });

    it('/todos/:id (PATCH) - user A can toggle completed', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ completed: true })
        .expect(200);

      expect(res.body.completed).toBe(true);
    });

    it('/todos/:id (DELETE) - user B cannot delete A\'s todo (403)', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(403);
    });

    it('/todos/:id (DELETE) - user A can delete their todo', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);
    });

    it('/todos/:id (GET) - deleted todo not found', () => {
      return request(app.getHttpServer())
        .get(`/todos/${todoIdA}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(404);
    });

    it('Create multiple todos to test pagination, filters and meta counts', async () => {
      const createPromises: Promise<any>[] = [];

      for (let i = 0; i < 15; i++) {
        createPromises.push(
          request(app.getHttpServer())
            .post('/todos')
            .set('Authorization', `Bearer ${accessTokenA}`)
            .send({
              title: `Paginate Task #${i}`,
              description: `desc ${i}`,
              priority: i % 2 === 0 ? 'low' : 'high',
              category: i % 3 === 0 ? 'Work' : 'Personal',
              completed: i < 10,
              isPublic: i % 5 === 0,
            })
            .expect(201)
        );
      }

      await Promise.all(createPromises);
    });


    it('/todos (GET) - pagination page=2&limit=10', async () => {
      const res = await request(app.getHttpServer())
        .get('/todos')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(15); 
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('/todos (GET) - filter by category=Work and priority=low', async () => {
      const res = await request(app.getHttpServer())
        .get('/todos')
        .query({ category: 'Work', priority: 'low', limit: 50 })
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      for (const t of res.body.data) {
        expect(t.category).toBe('Work');
        expect(t.priority).toBe('low');
      }
    });

    it('/todos (GET) - filter by completed=true', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Completed filter seed',
          description: 'for completed filter',
          priority: 'low',
          category: 'Work',
          isPublic: false,
        })
        .expect(201);

      const seedId = createRes.body.id;

      await request(app.getHttpServer())
        .patch(`/todos/${seedId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({ completed: true })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/todos')
        .query({ isCompleted: true, limit: 50 })
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(res.body.meta.completedCount).toBeGreaterThanOrEqual(1);
      for (const t of res.body.data) {
        expect(t.completed).toBe(true);
      }
    });

    it('/todos (GET) - filter by dueDate (specific day)', async () => {
      const today = new Date();
      const isoDay = today.toISOString().split('T')[0];

      await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Due Today Task',
          priority: 'medium',
          dueDate: today.toISOString(),
          category: 'Misc',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/todos')
        .query({ dueDate: isoDay, limit: 50 })
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(res.body.data.some((t: any) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.toISOString().startsWith(isoDay);
      })).toBe(true);
    });

    it('/todos (GET) - search by unique title', async () => {
      const uniqueTitle = 'UniqueSearchTitle12345';
      await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: uniqueTitle,
          description: 'just for search',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/todos')
        .query({ search: 'UniqueSearchTitle12345' })
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('UniqueSearchTitle12345');
    });

    it('/todos/:id (DELETE) - cleanup public todo of user A', () => {
      return request(app.getHttpServer())
        .delete(`/todos/${publicTodoIdA}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);
    });
  });

  describe('Upload (file) - existing tests retained', () => {
    const fixturePath = join(__dirname, 'fixtures', 'sample.png');
    let uploadedImagePath: string | null = null;

    it('/upload (POST) - should fail without token', () => {
      return request(app.getHttpServer()).post('/upload').expect(401);
    });

    it('/upload (POST) - should upload image with token', async () => {
      const res = await request(app.getHttpServer())
        .post('/upload')
        .set('Authorization', `Bearer ${accessTokenA}`)
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

  describe('3. User Story 7: View Other Users Todo Lists (READ)', () => {
    it('/users/search (GET) - search users by username', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search')
        .query({ search: 'usera' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((u: any) => u.username === 'usera')).toBe(true);
    });

    it('/users/search (GET) - search users by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search')
        .query({ search: 'User A' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((u: any) => u.name === 'User A')).toBe(true);
    });

    it('/users/search (GET) - search users by email', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search')
        .query({ search: 'usera@example.com' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((u: any) => u.email === 'usera@example.com')).toBe(true);
    });

    it('/users/search (GET) - empty search returns empty array', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search')
        .query({ search: '' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('/users/search (GET) - no results for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/search')
        .query({ search: 'nonexistentuser99999' })
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('/users/:id/todos (GET) - get public todos of user A', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Public Todo for User Service Test',
          description: 'This is public',
          priority: 'medium',
          category: 'Test',
          isPublic: true,
        })
        .expect(201);

      const publicTodoId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`/users/${userIdA}/todos`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.id).toBe(userIdA);
      expect(res.body.user.username).toBe('usera');
      expect(res.body).toHaveProperty('todos');
      expect(Array.isArray(res.body.todos)).toBe(true);
      expect(res.body.todos.some((t: any) => t.id === publicTodoId)).toBe(true);

      await request(app.getHttpServer())
        .delete(`/todos/${publicTodoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);
    });

    it('/users/:id/todos (GET) - should not return private todos', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Private Todo for User Service Test',
          description: 'This is private',
          priority: 'high',
          category: 'Test',
          isPublic: false,
        })
        .expect(201);

      const privateTodoId = createRes.body.id;

      const res = await request(app.getHttpServer())
        .get(`/users/${userIdA}/todos`)
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(200);

      expect(res.body).toHaveProperty('todos');
      expect(res.body.todos.some((t: any) => t.id === privateTodoId)).toBe(false);

      await request(app.getHttpServer())
        .delete(`/todos/${privateTodoId}`)
        .set('Authorization', `Bearer ${accessTokenA}`)
        .expect(200);
    });

    it('/users/:id/todos (GET) - should fail for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/nonexistentuserid123/todos')
        .set('Authorization', `Bearer ${accessTokenB}`)
        .expect(404);

      expect(res.body.message).toContain('User tidak ditemukan');
    });
  });

  describe('4. User Story 8: Email Reminders (Email)', () => {
    it('SchedulerService - handleDailyReminders should call mail service', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${accessTokenA}`)
        .send({
          title: 'Task Due Tomorrow',
          description: 'Should trigger reminder',
          priority: 'high',
          dueDate: tomorrow.toISOString(),
          category: 'Urgent',
          isPublic: false,
        })
        .expect(201);

      await schedulerService.handleDailyReminders();

      expect(mockMailService.sendTodoReminder).toHaveBeenCalled();
    });
  });
});
