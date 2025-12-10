#set document(
  title: "TodoList Backend API Documentation",
  author: "Rizky Rahmadian",
  date: datetime(year: 2025, month: 12, day: 9),
)

#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  numbering: "1",
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#set heading(numbering: "1.1")

#align(center)[
  #text(size: 24pt, weight: "bold")[Final Project Mata Kuliah PBKK TodoList Backend & Frontend]
  
  #text(size: 20pt, weight: "bold")[API Documentation]
  
  #v(4em)

  #align(center)[
  #image("Logo ITS.png", width: 400pt)
  ]

  #v(7em)
  
  #text(size: 12pt)[Moh. Rizky Rahmadian Makkani]
  
  #text(size: 10pt)[December 10, 2025]
]

#pagebreak()

#outline(indent: auto)

#pagebreak()

= Overview

Pada Final Project ini peserta didik diminta untuk mengimplementasikan seluruh materi dalam mata kuliah Pemrograman Berbasis Kerangka Kerja dengan beberapa ketentuan yang telah dijelaskan dalam user story pada file soal Final Project.


= User Story 1: Membuat Task (CREATE)

*Sebagai user, saya ingin membuat task baru agar dapat melacak pekerjaan yang harus dilakukan.*

== Fitur

- Set judul task (wajib)
- Tambah deskripsi opsional
- Set prioritas (low, medium, high)
- Set tanggal deadline
- Kategorisasi task
- Set visibilitas (public/private)
- Lampirkan gambar
- Autentikasi (JWT Bearer token)

== Backend Implementation

=== Endpoint

`POST /todos` (Autentikasi diperlukan)

=== Request Body

```json
{
  "title": "Finish project report",
  "description": "Complete the quarterly financial report",
  "priority": "high",
  "dueDate": "2025-12-15T10:00:00.000Z",
  "category": "Work",
  "isPublic": false,
  "imagePath": "uploads/image-1234567890.jpg"
}
```

=== Request Fields

#table(
  columns: (auto, auto, auto, 1fr),
  [*Field*], [*Type*], [*Required*], [*Deskripsi*],
  [`title`], [string], [Ya], [Judul task, min 1 char],
  [`description`], [string], [Tidak], [Deskripsi detail],
  [`priority`], [enum], [Tidak], [low/medium/high (default: medium)],
  [`dueDate`], [ISO 8601], [Tidak], [Format: 2025-12-15T10:00:00.000Z],
  [`category`], [string], [Tidak], [Custom category/tag],
  [`isPublic`], [boolean], [Tidak], [Default: false],
  [`imagePath`], [string], [Tidak], [Path dari `/upload` endpoint],
)

=== Response (201 Created)

```json
{
  "id": "uuid-string",
  "title": "Finish project report",
  "completed": false,
  "priority": "high",
  "category": "Work",
  "isPublic": false,
  "userId": "user-uuid",
  "user": {
    "id": "user-uuid",
    "username": "johndoe"
  },
  "createdAt": "2025-12-09T08:30:00.000Z",
  "updatedAt": "2025-12-09T08:30:00.000Z"
}
```

=== Service Layer

```typescript
async create(createTodoDto: CreateTodoDto, userId: string) {
  const todo = await this.prisma.todo.create({
    data: {
      title: createTodoDto.title,
      description: createTodoDto.description,
      priority: createTodoDto.priority || 'medium',
      dueDate: createTodoDto.dueDate,
      category: createTodoDto.category,
      isPublic: createTodoDto.isPublic || false,
      imagePath: createTodoDto.imagePath,
      userId,
    },
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  })
  return todo
}
```

== Frontend Implementation

=== Component: TodoForm

*Flow:*
1. User klik tombol "Buat Todo Baru"
2. Form modal terbuka dengan field kosong
3. User isi title (wajib), description, priority, category, due date, isPublic
4. Optional: upload gambar via `apiClient.uploadImage(file)`
5. User submit form
6. API call: `apiClient.createTodo(todo)`
7. Sukses: refresh list

=== API Client

```typescript
async createTodo(todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">) {
  return this.fetchWithAuth(`${API_URL}/todos`, {
    method: "POST",
    body: JSON.stringify(todo),
  })
}
```

=== State Management

```typescript
const [formData, setFormData] = useState({
  title: "", description: "", priority: "medium",
  category: "", isPublic: false, imagePath: "",
})

const handleSubmit = async () => {
  try {
    await apiClient.createTodo(formData)
    toast({ title: "Todo berhasil dibuat" })
    await loadTodos()
  } catch (error) {
    toast({ title: "Error", description: error.message, variant: "destructive" })
  }
}
```

== Testing

=== E2E Test

```typescript
it('should create a todo successfully', async () => {
  const createTodoDto = {
    title: 'Create New Task',
    priority: 'high',
    category: 'Work',
  }

  const response = await request(app.getHttpServer())
    .post('/todos')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(createTodoDto)
    .expect(201)

  expect(response.body).toHaveProperty('id')
  expect(response.body.title).toBe('Create New Task')
})
```
#image("Form ToDo.png", height: 200pt)
#image("Updated List.png", height: 160pt)




= User Story 2: Melihat Tasks (READ)

*Sebagai user, saya ingin melihat semua task dengan pagination dan detail task.*

== Fitur

- List semua task dengan pagination
- Filter berdasarkan status, prioritas, kategori, due date
- Search berdasarkan judul
- Lihat informasi detail untuk task tertentu
- Lihat task sendiri dan task public dari user lain
- Tampil statistik (completed/pending count)

== Backend Implementation

=== Endpoint 1: Get All Todos

`GET /todos` (Autentikasi diperlukan)

#table(
  columns: (auto, auto, 1fr),
  [*Parameter*], [*Type*], [*Deskripsi*],
  [`search`], [string], [Cari berdasarkan title (partial match)],
  [`priority`], [enum], [low/medium/high],
  [`category`], [string], [Filter kategori],
  [`isCompleted`], [boolean], [Filter status],
  [`page`], [number], [Halaman (default: 1)],
  [`limit`], [number], [Items per halaman (default: 10)],
)

=== Response (200 OK)

```json
{
  "data": [
    {
      "id": "todo-uuid",
      "title": "Task title",
      "completed": false,
      "priority": "high",
      "category": "Work",
      "isPublic": false,
      "createdAt": "2025-12-09T08:30:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "lastPage": 3,
    "completedCount": 10,
    "pendingCount": 15
  }
}
```

=== Endpoint 2: Get Single Todo

`GET /todos/:id` (Autentikasi diperlukan)

=== Service Implementation

```typescript
async findAll(userId: string, filter: TodoFilterDto) {
  const where = {
    OR: [
      { userId },
      { userId: { not: userId }, isPublic: true },
    ],
  }

  const [todos, total, completedCount, pendingCount] = await this.prisma.$transaction([
    this.prisma.todo.findMany({
      where, skip: (filter.page - 1) * filter.limit,
      take: filter.limit, orderBy: { createdAt: 'desc' },
    }),
    this.prisma.todo.count({ where }),
    this.prisma.todo.count({ where: { ...where, completed: true } }),
    this.prisma.todo.count({ where: { ...where, completed: false } }),
  ])

  return {
    data: todos,
    meta: { total, page: filter.page, lastPage: Math.ceil(total / filter.limit),
      completedCount, pendingCount },
  }
}
```

== Frontend Implementation

=== Components

*TodoDashboard:* Muat semua item di mount, kelola filter, paginasi.

*TodoList:* Tampilkan item yang dipagination, handle posisi kosong.

*TodoItem:* Card individu dengan judul, lencana prioritas, status, dan tanggal jatuh tempo.

=== Data Loading

```typescript
const loadTodos = async (pageToLoad = 1) => {
  const response = await apiClient.getTodos({
    search: searchQuery,
    priority: filterPriority !== 'all' ? filterPriority : undefined,
    isCompleted: filterStatus !== 'all' ? filterStatus === 'completed' : undefined,
    page: pageToLoad, limit: 10,
  })
  
  setTodos(response.data)
  setCompletedCount(response.meta.completedCount)
  setPendingCount(response.meta.pendingCount)
}
```

#image("Pagination 1.png", width: 250pt) 
#image("Pagination 2.png", width: 250pt)



= User Story 3: Search & Filter Tasks

*Sebagai user, saya ingin mencari dan filter task agar dapat menemukan task dengan cepat.*

== Fitur

- Search task berdasarkan judul (partial match)
- Filter berdasarkan prioritas (low, medium, high)
- Filter berdasarkan kategori
- Filter berdasarkan status (completed/pending)
- Filter berdasarkan due date
- Filter berdasarkan visibilitas (public/private)
- Kombinasi multiple filters
- Pagination untuk hasil search

== Backend Implementation

=== Query Processing

```typescript
async findAll(userId: string, filter: TodoFilterDto) {
  let where = { OR: [{ userId }, { userId: { not: userId }, isPublic: true }] }

  if (filter.search) {
    where['AND'] = { title: { contains: filter.search, mode: 'insensitive' } }
  }
  if (filter.priority) where['AND'] = { ...where['AND'], priority: filter.priority }
  if (filter.category) where['AND'] = { ...where['AND'], category: filter.category }
  if (filter.isCompleted !== undefined) {
    where['AND'] = { ...where['AND'], completed: filter.isCompleted }
  }
  if (filter.dueDate) {
    where['AND'] = { ...where['AND'], dueDate: { gte: new Date(filter.dueDate) } }
  }

  return this.prisma.todo.findMany({
    where, skip: (filter.page - 1) * filter.limit,
    take: filter.limit, orderBy: { createdAt: 'desc' },
  })
}
```

== Frontend Implementation

=== Components

*TodoFilters:* Search input, priority/status/category dropdowns

*TodoDashboard:* Listen to filter changes, reload todos

=== Filter Flow

```typescript
const [searchQuery, setSearchQuery] = useState("")
const [filterPriority, setFilterPriority] = useState("all")
const [filterStatus, setFilterStatus] = useState("all")

// Debounced search
const handleSearch = (query) => {
  setSearchQuery(query)
}

// Reload on filter change
useEffect(() => {
  loadTodos(1)  // Reset to page 1
}, [searchQuery, filterPriority, filterStatus])
```

#image("Search.png", width: 250pt) 
#image("Search + Filter.png", width: 250pt)


= User Story 4: Mark Tasks Complete/Incomplete (UPDATE)

*Sebagai user, saya ingin menandai task sebagai complete atau incomplete untuk melacak progress.*

== Fitur

- Toggle status completion task
- Update detail task (title, description, priority, dll.)
- Ubah due date, kategori, visibilitas
- Update gambar terlampir
- Hanya owner yang bisa update task mereka

== Backend Implementation

=== Endpoint

`PATCH /todos/:id` (Autentikasi diperlukan)

=== Request Body (All Optional)

```json
{
  "title": "Updated title",
  "description": "New description",
  "completed": true,
  "priority": "medium",
  "category": "Personal",
  "isPublic": true,
  "imagePath": "uploads/new-image.jpg",
  "dueDate": "2025-12-20T10:00:00.000Z"
}
```

=== Response (200 OK)

Returns updated todo object

=== Service Implementation

```typescript
async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
  const todo = await this.prisma.todo.findUnique({ where: { id } })
  
  if (todo.userId !== userId) {
    throw new ForbiddenException('Cannot update other users todos')
  }

  return this.prisma.todo.update({
    where: { id },
    data: updateTodoDto,
    include: { user: { select: { id: true, username: true } } },
  })
}
```

== Frontend Implementation

=== Update Completion

```typescript
const toggleComplete = async (todoId: string, currentStatus: boolean) => {
  try {
    await apiClient.updateTodo(todoId, { completed: !currentStatus })
    await loadTodos()
    toast({ title: "Todo updated" })
  } catch (error) {
    toast({ title: "Error", variant: "destructive" })
  }
}
```

=== Edit Todo Form

*Flow:*
1. User klik Edit button pada todo
2. Form terbuka dengan data pre-filled
3. User memodifikasi fields yang ingin diubah
4. Submit: `apiClient.updateTodo(id, updates)`
5. Sukses: refresh list, close modal


#image("Mark.png", height: 120pt)
#image("Mark 2.png", height: 120pt)

= User Story 5: Edit atau Delete Tasks (UPDATE & DELETE)

*Sebagai user, saya ingin edit atau delete task untuk mengelola task list dengan efektif.*

== Fitur

- Edit field task apapun (partial update)
- Update beberapa field sekaligus
- Delete task secara permanen
- Authorization check (hanya owner)
- Cascade delete (hapus data terkait)
- Tidak bisa edit/delete task user lain

== Backend Implementation

=== Delete Endpoint

`DELETE /todos/:id` (Autentikasi Diperlukan)

=== Response (200 OK)

```json
{
  "message": "Todo deleted successfully",
  "id": "todo-uuid"
}
```

=== Delete Service

```typescript
async delete(id: string, userId: string) {
  const todo = await this.prisma.todo.findUnique({ where: { id } })
  
  if (todo.userId !== userId) {
    throw new ForbiddenException('Cannot delete other users todos')
  }

  return this.prisma.todo.delete({ where: { id } })
}
```

== Frontend Implementation

=== Delete Flow

```typescript
const handleDelete = async (todoId: string) => {
  const confirmed = confirm("Apakah Anda yakin ingin menghapus todo ini?")
  
  if (confirmed) {
    try {
      await apiClient.deleteTodo(todoId)
      setTodos(prev => prev.filter(t => t.id !== todoId))
      toast({ title: "Todo deleted" })
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }
}
```


#image("Edit.png", height: 150pt)
#image("Delete Notif.png", height: 100pt)
#image("Delete.png", height: 150pt)



= User Story 6: Organisasi Tasks dengan Categories

*Sebagai user, saya ingin mengorganisir task ke dalam kategori atau tag untuk organisasi yang lebih baik.*

== Fitur

- Buat custom categories (free text)
- Assign kategori saat membuat task
- Update kategori task
- Filter task berdasarkan kategori
- Search lintas kategori
- Tidak ada predefined category list (flexible tagging)

== Implementation

=== Create with Category

`POST /todos` dengan field `category`

```json
{
  "title": "Project kickoff",
  "category": "Work"
}
```

=== Update Category

`PATCH /todos/:id` dengan field `category`

```json
{
  "category": "Personal"
}
```

=== Filter by Category

`GET /todos?category=Work`

== Frontend Implementation

=== Category Input

```typescript
<input
  type="text"
  placeholder="Category (e.g., Work, Personal, Shopping)"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
/>
```

=== Category Filter

```typescript
<select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
  <option value="all">All Categories</option>
  <option value="Work">Work</option>
  <option value="Personal">Personal</option>
  {/* Dynamic from existing todos */}
</select>
```

#image("Category 1.png", height: 150pt)
#image("Category 2.png", height: 150pt)

= User Story 7: Lihat Tasks User Lain

*Sebagai user, saya ingin browse dan lihat todo list public dari user lain.*

== Fitur

- Search user berdasarkan username atau email
- Lihat profile user
- Akses task public dari user lain (read-only)
- Tidak bisa edit atau delete task user lain
- Task private tetap tersembunyi
- Authorization enforcement (403 untuk private tasks)

== Backend Implementation

=== Search Users

`GET /users?search=username` (Autentkasi Diperlukan)

```json
{
  "data": [
    {
      "id": "user-uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe"
    }
  ],
  "total": 1
}
```

=== Get User's Public Todos

`GET /users/:userId/todos` (Autentikasi Diperlukan)

Returns array of public todos only

=== Main List - Mixed Todos

`GET /todos` returns:
- User's own todos (private & public)
- Other users' public todos (read-only)

== Frontend Implementation

=== User Search Component

```typescript
const handleUserSearch = async (query: string) => {
  const results = await apiClient.searchUsers(query)
  setUsers(results)
}
```

=== View Public Todos

```typescript
const viewUserTodos = async (userId: string) => {
  const todos = await apiClient.getUserPublicTodos(userId)
  // Display in read-only mode
}
```

#image("User.png", width: 400pt)
#image("User Profile.png", width: 400pt)

= User Story 8: Email Reminders

*Sebagai user, saya ingin menerima email reminder untuk deadline yang mendekat dan ringkasan task harian.*

== Fitur

- Automated deadline reminders (1 hari sebelum due date)
- Scheduled cron job execution
- Email dikirim jam 08:00 setiap hari (timezone Asia/Jakarta)
- Hanya kirim ke user dengan pending/upcoming tasks

== Backend Implementation

=== Scheduler Service

```typescript
@Injectable()
export class SchedulerService {
  constructor(private mailService: MailService, private prisma: PrismaService) {}

  @Cron('0 8 * * *')  // Every day at 08:00
  async sendDailySummary() {
    const users = await this.prisma.user.findMany()
    
    for (const user of users) {
      const pendingTodos = await this.prisma.todo.findMany({
        where: {
          userId: user.id,
          completed: false,
          dueDate: { gte: new Date() }
        }
      })

      if (pendingTodos.length > 0) {
        await this.mailService.sendDailySummary(user, pendingTodos)
      }
    }
  }
}
```

=== Email Template

Handlebars template (`reminder.hbs`):
```
Hi {{username}},

Ini adalah pengingat bahwa tugas berikut akan segera jatuh tempo:

Judul: {{ title }}
Tenggat Waktu: {{ dueDate }}

Segera selesaikan tugas Anda!

Salam,
Tim Todo App
```

== Configuration

*Environment Variables:*

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@todoapp.com
```

== Frontend Role

Frontend tidak ada interaksi khusus untuk US8. Email dikirim otomatis oleh backend scheduler.

#image("Reminder.png", height: 140pt)