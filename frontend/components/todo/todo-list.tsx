"use client"
import { TodoItem } from "./todo-item"

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

interface TodoListProps {
  todos: Todo[]
  currentUserId: string
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, currentUserId, onToggle, onEdit, onDelete }: TodoListProps) {
  // Sort by priority (high, medium, low) then by due date
  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff =
      priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]

    if (priorityDiff !== 0) return priorityDiff

    if (a.dueDate && b.dueDate) {
        const dateA = new Date(a.dueDate || 0).getTime()
        const dateB = new Date(b.dueDate || 0).getTime()
      return dateA - dateB
    }
      const createdA = new Date(a.createdAt).getTime()
      const createdB = new Date(b.createdAt).getTime()
    return createdB - createdA
  })

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          currentUserId={currentUserId}
          onToggle={() => onToggle(todo.id)}
          onEdit={() => onEdit(todo)}
          onDelete={() => onDelete(todo.id)}
        />
      ))}
    </div>
  )
}
