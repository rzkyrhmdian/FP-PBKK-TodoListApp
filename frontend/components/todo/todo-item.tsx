"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ImageModal from "@/components/ui/ImageModal"
import { useState } from "react"

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  imagePath?: string
  dueDate?: Date | string
  priority: string
  category?: string
  isPublic: boolean
  userId: string
  user?: {
    id: string
    username: string
  }
  createdAt: Date | string
  updatedAt: Date | string
}

interface TodoItemProps {
  todo: Todo
  currentUserId: string
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TodoItem({ todo, currentUserId, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [previewImg, setPreviewImg] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';


  const isOwnTodo = todo.userId === currentUserId
  const isPublicFromOther = !isOwnTodo && todo.isPublic

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
      case "low":
        return "bg-accent/20 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateInput: Date | string | undefined) => {
    if (!dateInput) return ""
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <>
      <Card className={`p-4 transition-all ${todo.completed ? "opacity-60" : ""}`}>
        <div className="flex gap-4">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={isOwnTodo ? onToggle : undefined}
            disabled={!isOwnTodo}
            className={`w-5 h-5 rounded mt-1 ${isOwnTodo ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
          />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold text-lg ${
                      todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {todo.title}
                  </h3>

                  {isPublicFromOther && todo.user && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                      oleh {todo.user.username}
                    </span>
                  )}
                </div>

                {todo.description && (
                  <p className={`text-sm mt-1 text-muted-foreground`}>
                    {todo.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {isOwnTodo && (
                  <>
                    <Button size="sm" variant="outline" onClick={onEdit} className="text-xs bg-transparent">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onDelete}
                      className="text-xs text-destructive hover:bg-destructive/80 bg-transparent"
                    >
                      Hapus
                    </Button>
                  </>
                )}

                {isPublicFromOther && (
                  <span className="text-xs text-muted-foreground italic">Read-only</span>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {todo.imagePath && (
              <div className="mt-4 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                      <img
                        src={`${apiUrl}/${todo.imagePath}`}
                        alt={todo.title}
                        onClick={() => setPreviewImg(`${apiUrl}/${todo.imagePath}`)}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                        loading="lazy"
                      />
                    </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                {todo.priority === "high" ? "Tinggi" : todo.priority === "medium" ? "Sedang" : "Rendah"}
              </span>

              {todo.category && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {todo.category}
                </span>
              )}

              {todo.dueDate && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  📅 {formatDate(todo.dueDate)}
                </span>
              )}

              {todo.isPublic && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  🌐 Public
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Popup */}
      <ImageModal src={previewImg} onClose={() => setPreviewImg(null)} />
    </>
  )
}
