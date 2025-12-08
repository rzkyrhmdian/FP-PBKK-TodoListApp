"use client"
import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, User, ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { UserProfile } from "./user-profile"

interface UserData {
  id: string
  username: string
  email: string
  name: string
}

interface UserSearchProps {
  onBack: () => void
}

export function UserSearch({ onBack }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setUsers([])
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const results = await apiClient.searchUsers(searchQuery)
      setUsers(results || [])
    } catch (err) {
      console.error("[v0] Error searching users:", err)
      setError(err instanceof Error ? err.message : "Failed to search users")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2 bg-transparent hover:bg-destructive/80">
          <ArrowLeft size={16} />
          Kembali
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Cari User</h2>
      </div>

      {/* Search Section */}
      <Card className="p-6 border-border/50">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">Cari user berdasarkan email, nama, atau username</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Masukkan nama atau username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Search size={18} />
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8 border-border/50 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Mencari user...</p>
        </Card>
      )}

      {/* Results */}
      {!isLoading && searchQuery && users.length === 0 && !error && (
        <Card className="p-8 border-border/50 text-center">
          <p className="text-muted-foreground">Mencari User...</p>
        </Card>
      )}

      {users.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Ditemukan {users.length} user</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card
                key={user.id}
                className="p-4 border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full flex-shrink-0">
                    <User size={20} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
