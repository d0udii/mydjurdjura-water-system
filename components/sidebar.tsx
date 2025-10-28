"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { NotificationsPanel } from "./notifications-panel"
import { NotificationBell } from "./notification-bell"
import { useAuth } from "@/lib/auth"
import {
  LayoutDashboard,
  Package,
  Users,
  UserCog,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Bell,
  FileText,
  Percent,
  Target,
  ClipboardList,
  Zap,
  Workflow,
  Package2,
  Search,
  Database,
  Shield,
  Brain,
  Smartphone,
} from "lucide-react"
import { 
  AnimatedDiv, 
  FloatingElement, 
  GradientText, 
  GlowEffect,
  RevealOnScroll 
} from "@/components/animations"

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "regional_manager", "supervisor", "operations"],
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
      roles: ["admin", "regional_manager", "supervisor", "operations"],
    },
    { 
      href: "/clients", 
      label: "Clients", 
      icon: Users, 
      roles: ["admin", "supervisor", "regional_manager"] 
    },
    { 
      href: "/products", 
      label: "Products", 
      icon: Package, 
      roles: ["admin"] 
    },
    { 
      href: "/transport", 
      label: "Transport", 
      icon: Truck, 
      roles: ["admin"] 
    },
    { 
      href: "/users", 
      label: "Users", 
      icon: Users, 
      roles: ["admin"] 
    },
    { 
      href: "/supervisors", 
      label: "Supervisors", 
      icon: UserCog, 
      roles: ["admin"] 
    },
    { 
      href: "/bl-numbers", 
      label: "BL Numbers", 
      icon: FileText, 
      roles: ["admin", "operations"] 
    },
    { 
      href: "/promotions", 
      label: "Promotions", 
      icon: Percent, 
      roles: ["admin"] 
    },
    { 
      href: "/goals", 
      label: "Goals & Progress", 
      icon: Target, 
      roles: ["admin", "regional_manager"] 
    },
    { 
      href: "/pallet-tracking", 
      label: "Pallet Tracking", 
      icon: ClipboardList, 
      roles: ["admin", "operations"] 
    },
    { 
      href: "/performance", 
      label: "Performance", 
      icon: Zap, 
      roles: ["admin"] 
    },
    { 
      href: "/order-tracking", 
      label: "Order Tracking", 
      icon: Package, 
      roles: ["admin", "operations", "regional_manager"] 
    },
    { 
      href: "/workflows", 
      label: "Workflows", 
      icon: Workflow, 
      roles: ["admin", "regional_manager"] 
    },
    { 
      href: "/inventory", 
      label: "Inventory", 
      icon: Package2, 
      roles: ["admin", "operations"] 
    },
    { 
      href: "/search", 
      label: "Advanced Search", 
      icon: Search, 
      roles: ["admin", "regional_manager", "supervisor"] 
    },
    { 
      href: "/backup", 
      label: "Backup & Recovery", 
      icon: Database, 
      roles: ["admin"] 
    },
    { 
      href: "/collaboration", 
      label: "Real-time Collaboration", 
      icon: Users, 
      roles: ["admin", "regional_manager", "supervisor"] 
    },
    { 
      href: "/security", 
      label: "Security & Audit", 
      icon: Shield, 
      roles: ["admin"] 
    },
    { 
      href: "/ai-insights", 
      label: "AI Insights", 
      icon: Brain, 
      roles: ["admin", "regional_manager"] 
    },
    { 
      href: "/mobile", 
      label: "Mobile Integration", 
      icon: Smartphone, 
      roles: ["admin", "operations"] 
    },
    { 
      href: "/notifications", 
      label: "Notifications", 
      icon: Bell, 
      roles: ["admin", "regional_manager", "supervisor", "operations"] 
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin", "regional_manager", "supervisor", "operations"],
    },
  ]

  const visibleItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  if (!mounted || !user) return null

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
          <RevealOnScroll direction="down" delay={0.1}>
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <FloatingElement intensity="medium">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </FloatingElement>
                <div>
                  <GradientText gradient="blue-purple" className="text-2xl font-bold">
                    Djurdjura
                  </GradientText>
                  <p className="text-sm text-slate-400">Water Distribution</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {visibleItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <RevealOnScroll key={item.href} direction="left" delay={0.1 * index}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start hover:bg-slate-800 transition-all duration-200 transform hover:scale-105"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </RevealOnScroll>
              )
            })}
          </nav>

          <RevealOnScroll direction="up" delay={0.5}>
            <div className="space-y-4 border-t border-slate-700 pt-4">
              <div className="text-sm">
                <p className="text-slate-400">Logged in as:</p>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-slate-400">
                  {user.role.replace("_", " ").toUpperCase()}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <ThemeToggle />
                <NotificationBell userId={user.id} userRole={user.role} />
                <Button variant="destructive" size="sm" onClick={handleLogout} className="hover:bg-red-600 transition-all duration-200 transform hover:scale-105">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
