"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ImageModal from "@/components/ui/ImageModal"
import { ArrowLeft, User, Mail, Calendar, FileText } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface UserData {
  id: string
  username: string
  email: string
  name: string
}

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
  createdAt: string
  updatedAt: string
}

interface UserProfileProps {
  user: UserData
  onBack: () => void
}

export function UserProfile({ user, onBack }: UserProfileProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)


  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadUserTodos()
  }, [user.id])

  const loadUserTodos = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiClient.getUserPublicTodos(user.id)
      setTodos(data || [])
    } catch (err) {
      console.error("[v0] Error loading user todos:", err)
      setError(err instanceof Error ? err.message : "Failed to load user todos")
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-500 bg-gray-50 border-gray-200"
    }
  }

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Selesai
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        Pending
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2 hover:bg-destructive/80">
          <ArrowLeft size={16} />
          Kembali
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Profil User</h2>
      </div>

      {/* User Info Card */}
      <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="flex items-center gap-6">
          <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full border-2 border-primary/20 shadow-sm">
            <User size={40} className="text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-2xl font-bold text-foreground">{user.name}</h3>
            <p className="text-base text-muted-foreground font-medium">@{user.username}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Mail size={14} />
              {user.email}
            </div>
          </div>
        </div>
      </Card>

      {/* Todos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Todo Publik</h3>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
            {todos.length} Todo ditemukan
          </span>
        </div>

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/20 mb-4">
            <p className="text-sm text-destructive flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </p>
          </Card>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-sm">Memuat data...</p>
          </div>
        ) : todos.length === 0 ? (
          <Card className="p-12 border-dashed border-2 border-border/50 text-center bg-muted/20">
            <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">User ini belum memiliki todo publik</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <Card key={todo.id} className="overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-sm">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Title & Status */}
                      <div className="flex items-center gap-3">
                        <h4 className={`font-semibold text-lg text-foreground ${todo.completed == true ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.title}
                        </h4>
                        {getStatusBadge(todo.completed ? 1 : 0)}
                      </div>
                      
                      {/* Description */}
                      {todo.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {todo.description}
                        </p>
                      )}

                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {todo.category && (
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md border border-secondary/50">
                            {todo.category}
                          </span>
                        )}
                        
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-md border ${getPriorityColor(todo.priority)}`}>
                          {todo.priority === "high" && "Prioritas Tinggi"}
                          {todo.priority === "medium" && "Prioritas Sedang"}
                          {todo.priority === "low" && "Prioritas Rendah"}
                        </span>

                        {todo.dueDate && (
                          <span className="px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-md border border-border flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(todo.dueDate).toLocaleDateString("id-ID", {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image Section */}
                  {todo.imagePath && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${todo.imagePath}`}
                        alt={todo.title}
                        onClick={() => setSelectedImage(`${apiUrl}/${todo.imagePath}`)}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Preview"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}
