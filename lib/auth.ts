// Re-export authentication functions from auth.tsx
export { useAuth, withAuth, AuthProvider } from './auth'

// Utility functions for authentication
import { db, type User } from "./db"

export interface AuthSession {
  user: User
  token: string
}

// Simple JWT-like token generation
export function generateToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64")
}

export function validateToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [userId] = decoded.split(":")
    return userId
  } catch {
    return null
  }
}

export function login(email: string, password: string): AuthSession | null {
  const user = db.users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return null
  }

  if (!user.approved && user.role !== "admin") {
    return null // User not approved yet
  }

  const token = generateToken(user.id)
  return { user, token }
}

export function getUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id)
}

export function createUser(userData: Omit<User, "id" | "createdAt">): User {
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  db.users.push(newUser)
  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = db.users.find((u) => u.id === id)
  if (!user) return null

  Object.assign(user, updates)
  return user
}

export function getAllUsers(): User[] {
  return db.users
}

export function getUsersByRole(role: User["role"]): User[] {
  return db.users.filter((u) => u.role === role)
}

export function getSupervisorsByChefRegion(chefRegionId: string): User[] {
  return db.users.filter((u) => u.role === "supervisor" && u.chefRegionId === chefRegionId)
}

export { useAuth, withAuth, AuthProvider } from './auth'
