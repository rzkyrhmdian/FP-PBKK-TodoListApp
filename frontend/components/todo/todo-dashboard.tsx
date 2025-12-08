"use client"
import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Plus, List, Search } from "lucide-react"
import { UserSearch } from "../user/user-search"
import { TodoForm } from "./todo-form"
import { TodoList } from "./todo-list"
import { apiClient } from "@/lib/api-client"

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  imagePath?: string
  dueDate?: string
  priority: string
  category?: string
  isPublic: boolean
  userId: string
  user?: {
    id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

interface TodoDashboardProps {
  onLogout: () => Promise<void>
}

export function TodoDashboard({ onLogout }: TodoDashboardProps) {
  const [currentPage, setCurrentPage] = useState("list")
  const [todos, setTodos] = useState<Todo[]>([])
  const [page, setPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [completedCount, setCompletedCount] = useState<number>(0)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterVisibility, setFilterVisibility] = useState("all")
  const [filterDueDate, setFilterDueDate] = useState("")
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTodos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTodos = async (pageToLoad: number = page) => {
    try {
      setIsLoading(true)
      setError(null)

      const isCompletedFilter =
        filterStatus === "all" ? undefined : filterStatus === "completed" ? true : false

      const isPublicFilter =
        filterVisibility === "all" ? undefined : filterVisibility === "public" ? true : false

      
      const res = await apiClient.getTodos({
        search: searchQuery || undefined,
        priority: filterPriority === "all" ? undefined : filterPriority,
        category: filterCategory === "all" ? undefined : filterCategory,
        isPublic: isPublicFilter,
        isCompleted: isCompletedFilter,
        dueDate: filterDueDate || undefined,
        page: pageToLoad,
        limit: 10,
      })


      setTodos(res.data)
      setPage(res.meta?.page || pageToLoad)
      setLastPage(res.meta?.lastPage || 1)
      setTotalCount(res.meta?.total || 0)
      setCompletedCount(res.meta?.completedCount || 0)
      setPendingCount(res.meta?.pendingCount || 0)
    } catch (err) {
      console.error("Error loading todos:", err)
      setError(err instanceof Error ? err.message : "Failed to load todos")
    } finally {
      setIsLoading(false)
    }
  }

  // Get all unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(todos.filter((t) => t.category).map((t) => t.category)))
  }, [todos])

  useEffect(() => {
    setPage(1)
    loadTodos(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterPriority, filterStatus, filterCategory, filterVisibility, filterDueDate])

  const handleSubmit = async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">) => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingTodoId) {
        // Update todo
        await apiClient.updateTodo(editingTodoId, todo)
        setTodos((prev) =>
          prev.map((t) =>
            t.id === editingTodoId
              ? {
                  ...t,
                  ...todo,
                }
              : t,
          ),
        )
        setEditingTodoId(null)
      } else {
        // Create new todo
        const newTodo = await apiClient.createTodo(todo)
        setTodos((prev) => [newTodo, ...prev])
      }

      setCurrentPage("list")
    } catch (err) {
      console.error("Error submitting todo:", err)
      setError(err instanceof Error ? err.message : "Failed to submit todo")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id)
      if (todo) {
        await apiClient.updateTodo(id, { completed: !todo.completed })
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
      }
    } catch (err) {
      console.error("Error toggling todo:", err)
      setError(err instanceof Error ? err.message : "Failed to update todo")
    }
  }

  const handleDeleteTodo = async (id: string) => {
    if (confirm("Hapus todo ini?")) {
      try {
        await apiClient.deleteTodo(id)
        setTodos((prev) => prev.filter((t) => t.id !== id))
      } catch (err) {
        console.error("Error deleting todo:", err)
        setError(err instanceof Error ? err.message : "Failed to delete todo")
      }
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setCurrentPage("create")
  }

  const handleLogoutClick = async () => {
    try {
      await onLogout()
    } catch (err) {
      console.error("Error logging out:", err)
    }
  }

  const user = apiClient.getCurrentUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl">
                <span className="text-lg font-bold text-primary-foreground">✓</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">TodoFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{user?.name}</span>
              </p>
              <Button onClick={handleLogoutClick} variant="outline" size="sm" className="gap-2 bg-transparent hover:bg-destructive/80">
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 p-4 bg-destructive/10 border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline mt-2 text-destructive hover:text-destructive/80"
            >
              Tutup
            </button>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setCurrentPage("list")}
            className={`flex items-center gap-2 ${
              currentPage === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <List size={18} />
            Daftar Todo
          </Button>
          <Button
            onClick={() => {
              setEditingTodoId(null)
              setCurrentPage("create")
            }}
            className={`flex items-center gap-2 ${
              currentPage === "create"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <Plus size={18} />
            Buat Todo Baru
          </Button>

          <Button
            onClick={() => setCurrentPage("search")}
            className={`flex items-center gap-2 ${
              currentPage === "search"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <Search size={18} />
            Cari User
          </Button>
        </div>

        {/* Pages */}
        {currentPage === "list" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-6 border-border/50">
              <h2 className="text-lg font-semibold text-foreground mb-4">Filter & Cari</h2>
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cari</label>
                  <Input
                    type="text"
                    placeholder="Cari berdasarkan judul atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-2 border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Visibility Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tampilkan</label>
                    <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                      <SelectTrigger className="w-full border-2 bg-input border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Pilih Tampilan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="focus:bg-primary focus:text-white cursor-pointer">Semua Todo</SelectItem>
                        <SelectItem value="private" className="focus:bg-primary focus:text-white cursor-pointer">Todo Pribadi</SelectItem>
                        <SelectItem value="public" className="focus:bg-primary focus:text-white cursor-pointer">Todo Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Prioritas</label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-full border-2 bg-input border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Pilih Prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="focus:bg-primary focus:text-white cursor-pointer">Semua Prioritas</SelectItem>
                        <SelectItem value="high" className="focus:bg-primary focus:text-white cursor-pointer">Tinggi</SelectItem>
                        <SelectItem value="medium" className="focus:bg-primary focus:text-white cursor-pointer">Sedang</SelectItem>
                        <SelectItem value="low" className="focus:bg-primary focus:text-white cursor-pointer">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full border-2 bg-input border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="focus:bg-primary focus:text-white cursor-pointer">Semua Status</SelectItem>
                        <SelectItem value="pending" className="focus:bg-primary focus:text-white cursor-pointer">Pending</SelectItem>
                        <SelectItem value="completed" className="focus:bg-primary focus:text-white cursor-pointer">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full bg-input border-2 border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="focus:bg-primary focus:text-white cursor-pointer">Semua Kategori</SelectItem>
                        <SelectItem value="Pekerjaan" className="focus:bg-primary focus:text-white cursor-pointer">Pekerjaan</SelectItem>
                        <SelectItem value="Kuliah" className="focus:bg-primary focus:text-white cursor-pointer">Kuliah</SelectItem>
                        <SelectItem value="Pribadi" className="focus:bg-primary focus:text-white cursor-pointer">Pribadi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tenggat Waktu
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={filterDueDate}
                        onChange={(e) => setFilterDueDate(e.target.value)}
                        className="w-full border-2 border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                      />
                      {filterDueDate && (
                        <button
                          onClick={() => setFilterDueDate("")}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-destructive"
                          title="Hapus filter tanggal"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground">Total Todo</p>
                <p className="text-3xl font-bold text-foreground">{totalCount}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-3xl font-bold text-primary">{completedCount}</p>
              </Card>
              <Card className="p-6 border-border/50">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-destructive">{pendingCount}</p>
              </Card>
            </div>

            {/* Todo List */}
            {isLoading ? (
              <Card className="p-8 border-border/50 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading todos...</p>
              </Card>
            ) : todos.length === 0 ? (
              <Card className="p-8 border-border/50 text-center">
                <p className="text-muted-foreground">Tidak ada todo yang cocok</p>
              </Card>
            ) : (
              <TodoList
                todos={todos}
                currentUserId={user?.id || ""}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
              />
            )}
            {/* Pagination Controls */}
            {todos.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  onClick={() => {
                    if (page > 1) {
                      const next = page - 1
                      setPage(next)
                      loadTodos(next)
                    }
                  }}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
                <Button
                  onClick={() => {
                    if (page < lastPage) {
                      const next = page + 1
                      setPage(next)
                      loadTodos(next)
                    }
                  }}
                  disabled={page >= lastPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {currentPage === "create" && (
          <Card className="p-8 border-border/50 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingTodoId ? "Edit Todo" : "Buat Todo Baru"}
            </h2>
            <TodoForm
              onSubmit={handleSubmit}
              initialData={editingTodoId ? todos.find((t) => t.id === editingTodoId) : undefined}
              isSubmitting={isSubmitting}
            />
          </Card>
        )}
       {currentPage === "search" && <UserSearch onBack={() => setCurrentPage("list")} />}
      </main>
    </div>
  )
}
