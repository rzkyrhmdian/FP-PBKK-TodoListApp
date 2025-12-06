"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  createdAt: string
  updatedAt: string
}

interface TodoFormProps {
  onSubmit: (todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>
  initialData?: Todo
  isSubmitting?: boolean
}

export function TodoForm({ onSubmit, initialData, isSubmitting }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [priority, setPriority] = useState(initialData?.priority || "medium")
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imagePath || "")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingImage(true)
        setError(null)

        // Upload image to backend
        const { imagePath } = await apiClient.uploadImage(file)
        setImagePreview(imagePath)
        setImageFile(file)
      } catch (err) {
        console.error("[v0] Image upload error:", err)
        setError(err instanceof Error ? err.message : "Failed to upload image")
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Judul todo tidak boleh kosong")
      return
    }

    try {
      setError(null)
      const todoData = {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        category: category || undefined,
        isPublic,
        imagePath: imagePreview || undefined,
        ...(initialData && { completed: initialData.completed }), // Only include completed when editing
      }
      await onSubmit(todoData as Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">)
    } catch (err) {
      console.error("[v0] Form submit error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit form")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Judul</label>
        <Input
          type="text"
          placeholder="Masukkan judul todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className="w-full border-2 border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Deskripsi</label>
        <textarea
          placeholder="Masukkan deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="w-full p-3 border-2 border-border rounded-md bg-input text-foreground resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          rows={4}
        />
      </div>

      {/* Priority and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Prioritas</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-3 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          >
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Kategori</label>
          <Input
            type="text"
            placeholder="Misal: Pekerjaan, Pribadi"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-12 text-lg border-2 border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Tanggal Jatuh Tempo</label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
          className="w-full border-2 border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Upload Gambar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isSubmitting || isUploadingImage}
          className="w-full border-2 border-border rounded-md bg-input text-foreground p-2 cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all "
        />
        {isUploadingImage && <p className="text-xs text-muted-foreground mt-2">Uploading image...</p>}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-2">
          <img
            src={
              imagePreview.startsWith("http") 
                ? imagePreview 
                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/${imagePreview.startsWith("/") ? imagePreview.slice(1) : imagePreview}`
            }
            alt="Preview"
            className="w-full h-40 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isSubmitting}
            className="text-sm text-destructive hover:text-destructive/80 disabled:opacity-50 border border-destructive/20 hover:bg-destructive/10 px-3 py-1 rounded-md transition-all"
          >
            Hapus Gambar
          </button>
        </div>
      )}

      {/* Public Checkbox */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(checked === true)}
          disabled={isSubmitting}
          className="border-2 border-gray-500 w-5 h-5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
        <label htmlFor="isPublic" className="text-sm font-semibold text-foreground cursor-pointer">
          Jadikan Public
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || isUploadingImage}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
      >
        {isSubmitting ? "Loading..." : initialData ? "Perbarui Todo" : "Tambah Todo"}
      </Button>
    </form>
  )
}
