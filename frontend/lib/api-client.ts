const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface AuthResponse {
  access_token: string
  refresh_token: string
}

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

class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.loadTokens()
  }

  private loadTokens() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token")
      this.refreshToken = localStorage.getItem("refresh_token")
    }
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("currentUser")
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth && this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  private async handleResponse(response: Response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`)
    }

    return data
  }

  // Fetch wrapper that will attempt to refresh access token once on 401
  private async fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retry = true) {
    // Ensure headers object exists
    init.headers = init.headers || {}

    // If we have an access token, set Authorization header unless already provided
    const headers = new Headers(init.headers as HeadersInit)
    if (!headers.has('Authorization') && this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`)
    }
    init.headers = headers

    let response = await fetch(input, init)

    if (response.status === 401 && retry) {
      // Try to refresh access token
      try {
        await this.refreshAccessToken()
        // Update Authorization header with new token
        if (this.accessToken) {
          headers.set('Authorization', `Bearer ${this.accessToken}`)
          init.headers = headers
        }
        // Retry the original request once
        response = await fetch(input, init)
      } catch (err) {
        // If refresh fails, clear tokens and rethrow original unauthorized
        this.clearTokens()
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Unauthorized')
      }
    }

    return this.handleResponse(response)
  }

  // Auth endpoints
  async register(email: string, username: string, name: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, username, name, password }),
    })

    return this.handleResponse(response)
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ user: UserData; access_token: string; refresh_token: string }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ username, password }),
    })

    const data = await this.handleResponse(response)
    this.saveTokens(data.access_token, data.refresh_token)
    localStorage.setItem("currentUser", JSON.stringify(data.user))
    return data
  }

  async logout() {
    try {
      console.log("User logged out")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearTokens()
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    })

    const data = await this.handleResponse(response)
    this.saveTokens(data.access_token, data.refresh_token)
    return data.access_token
  }

  // Todo endpoints
  async createTodo(todo: Omit<Todo, "id" | "createdAt" | "updatedAt" | "userId">, imagePath?: string) {
    return this.fetchWithAuth(`${API_URL}/todos`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({
        ...todo,
        imagePath: imagePath || undefined,
      }),
    })
  }

  async getTodos(options?: {
    search?: string
    priority?: string
    category?: string
    isPublic?: boolean
    isCompleted?: boolean
    dueDate?: string
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()

    const {
      search,
      priority,
      category,
      isPublic,
      isCompleted,
      dueDate,
      page = 1,
      limit = 10,
    } = options || {}

    if (search) params.append("search", search)
    if (priority && priority !== "all") params.append("priority", priority)
    if (category && category !== "all") params.append("category", category)
    if (isPublic !== undefined) params.append("isPublic", String(isPublic))
    if (isCompleted !== undefined) params.append("isCompleted", String(isCompleted))

    if (dueDate) params.append("dueDate", dueDate)

    if (page) params.append("page", String(page))
    if (limit) params.append("limit", String(limit))

    return this.fetchWithAuth(`${API_URL}/todos?${params.toString()}`, {
      method: "GET",
      headers: this.getHeaders(true),
    })
  }


  async getTodoById(id: string) {
    return this.fetchWithAuth(`${API_URL}/todos/${id}`, {
      method: "GET",
      headers: this.getHeaders(true),
    })
  }

  async updateTodo(id: string, updates: Partial<Todo>) {
    return this.fetchWithAuth(`${API_URL}/todos/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify(updates),
    })
  }

  async deleteTodo(id: string) {
    return this.fetchWithAuth(`${API_URL}/todos/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    })
  }

  // Upload endpoint
  async uploadImage(file: File): Promise<{ imagePath: string }> {
    const formData = new FormData()
    formData.append("image", file)
    return this.fetchWithAuth(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    })
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getCurrentUser(): UserData | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("currentUser")
      return user ? JSON.parse(user) : null
    }
    return null
  }
}

export const apiClient = new ApiClient()
