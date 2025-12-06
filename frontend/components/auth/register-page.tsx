"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface RegisterPageProps {
  onRegister: (email: string, username: string, name: string, password: string) => Promise<void>
  onSwitchToLogin: () => void
}

export function RegisterPage({ onRegister, onSwitchToLogin }: RegisterPageProps) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !username || !name || !password || !confirmPassword) {
      alert("Semua field harus diisi")
      return
    }
    if (password !== confirmPassword) {
      alert("Password tidak cocok")
      return
    }

    setIsLoading(true)
    try {
      await onRegister(email, username, name, password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl mb-6 shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-primary-foreground">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Buat Akun TodoFlow</h1>
          <p className="text-muted-foreground">Bergabung dengan TodoFlow</p>
        </div>

        {/* Register Card */}
        <Card className="p-8 shadow-2xl border-border/50 backdrop-blur-md bg-card/95">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-10 bg-input border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Nama Lengkap</label>
              <Input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-10 bg-input border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Username</label>
              <Input
                type="text"
                placeholder="Pilih username unik"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="h-10 bg-input border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password yang kuat"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-10 bg-input border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Konfirmasi Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-10 bg-input border-border/50 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Daftar Sekarang"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Login Link */}
          <Button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="w-full h-11 bg-secondary hover:bg-secondary/80 text-foreground font-semibold transition-all disabled:opacity-50"
          >
            Sudah Punya Akun? Masuk
          </Button>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">Buat akun dengan mendaftar untuk login</p>
      </div>
    </div>
  )
}
