"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
}

export function LoginPage({ onLogin, onSwitchToRegister }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setIsLoading(true)
      try {
        await onLogin(username, password)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl mb-6 shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">TodoFlow</h1>
          <p className="text-muted-foreground">Kelola tugas dengan lebih produktif</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl border-border/50 backdrop-blur-md bg-card/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Username</label>
              <Input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-input border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 bg-input border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Masuk ke Akun"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Register Link */}
          <Button
            type="button"
            onClick={onSwitchToRegister}
            disabled={isLoading}
            className="w-full h-11 bg-secondary hover:bg-secondary/80 text-foreground font-semibold transition-all disabled:opacity-50"
          >
            Buat Akun Baru
          </Button>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">Gunakan akun yang sudah terdaftar untuk login</p>
      </div>
    </div>
  )
}
