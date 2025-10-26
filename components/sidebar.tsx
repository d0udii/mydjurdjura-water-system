"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react"

interface User {
  id: string
  name: string
  role: string
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    router.push("/")
  }

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "chef_region", "supervisor", "operations"],
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
      roles: ["admin", "chef_region", "supervisor", "operations"],
    },
    { href: "/clients", label: "Clients", icon: Users, roles: ["admin", "supervisor"] },
    { href: "/products", label: "Products", icon: Package, roles: ["admin"] },
    { href: "/transport", label: "Transport", icon: Truck, roles: ["admin"] },
    { href: "/users", label: "Users", icon: Users, roles: ["admin"] },
    { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "chef_region", "operations"] },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin", "chef_region", "supervisor", "operations"],
    },
  ]

  const visibleItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  if (!mounted) return null

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-4 transform transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Djurdjura</h1>
            <p className="text-sm text-slate-400">Water Distribution</p>
          </div>

          <nav className="flex-1 space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="space-y-4 border-t border-slate-700 pt-4">
            <div className="text-sm">
              <p className="text-slate-400">Logged in as:</p>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role.replace("_", " ").toUpperCase()}</p>
            </div>

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
