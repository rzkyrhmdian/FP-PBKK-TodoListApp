"use client"

import { useEffect, useState } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { RegisterPage } from "@/components/auth/register-page"
import { TodoDashboard } from "@/components/todo/todo-dashboard"
import { apiClient } from "@/lib/api-client"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "dashboard">("login")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("currentUser")
    if (user && apiClient.isAuthenticated()) {
      setIsLoggedIn(true)
      setCurrentPage("dashboard")
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      await apiClient.login(username, password)
      setIsLoggedIn(true)
      setCurrentPage("dashboard")
    } catch (error) {
      console.error("[v0] Login failed:", error)
      alert(error instanceof Error ? error.message : "Login gagal. Silakan coba lagi.")
    }
  }

  const handleRegister = async (email: string, username: string, name: string, password: string) => {
    try {
      await apiClient.register(email, username, name, password)
      alert("Registrasi berhasil! Silakan login.")
      setCurrentPage("login")
    } catch (error) {
      console.error("[v0] Register failed:", error)
      alert(error instanceof Error ? error.message : "Registrasi gagal. Silakan coba lagi.")
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
    setIsLoggedIn(false)
    setCurrentPage("login")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <>
        {currentPage === "login" && (
          <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setCurrentPage("register")} />
        )}
        {currentPage === "register" && (
          <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setCurrentPage("login")} />
        )}
      </>
    )
  }

  return <TodoDashboard onLogout={handleLogout} />
}
