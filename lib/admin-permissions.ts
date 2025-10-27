// Centralized admin permissions utility
// Ensures admin has full control over all elements in the application

export interface AdminPermissions {
  // User Management
  canManageUsers: boolean
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canApproveUsers: boolean
  
  // Client Management
  canManageClients: boolean
  canCreateClients: boolean
  canEditClients: boolean
  canDeleteClients: boolean
  canAssignClients: boolean
  
  // Order Management
  canManageOrders: boolean
  canCreateOrders: boolean
  canEditOrders: boolean
  canDeleteOrders: boolean
  canOverrideOrderStatus: boolean
  canViewAllOrders: boolean
  
  // Product Management
  canManageProducts: boolean
  canCreateProducts: boolean
  canEditProducts: boolean
  canDeleteProducts: boolean
  canSetProductPrices: boolean
  
  // Transport Management
  canManageTransport: boolean
  canCreateTransportTariffs: boolean
  canEditTransportTariffs: boolean
  canDeleteTransportTariffs: boolean
  canSetTransportPrices: boolean
  
  // System Configuration
  canManageSystemConfig: boolean
  canManageRegions: boolean
  canManageNotifications: boolean
  canManagePromotions: boolean
  canManageGoals: boolean
  canManageBLNumbers: boolean
  canManagePalletTracking: boolean
  
  // Reports and Analytics
  canViewAllReports: boolean
  canExportData: boolean
  canViewActivityLogs: boolean
  canViewSystemStats: boolean
  
  // Override Permissions
  canOverrideAnyPermission: boolean
  canBypassRestrictions: boolean
  canAccessAdminPanel: boolean
}

export function getAdminPermissions(userRole: string): AdminPermissions {
  const isAdmin = userRole === 'admin'
  
  return {
    // User Management - Admin has full control
    canManageUsers: isAdmin,
    canCreateUsers: isAdmin,
    canEditUsers: isAdmin,
    canDeleteUsers: isAdmin,
    canApproveUsers: isAdmin,
    
    // Client Management - Admin has full control
    canManageClients: isAdmin,
    canCreateClients: isAdmin,
    canEditClients: isAdmin,
    canDeleteClients: isAdmin,
    canAssignClients: isAdmin,
    
    // Order Management - Admin has full control
    canManageOrders: isAdmin,
    canCreateOrders: isAdmin,
    canEditOrders: isAdmin,
    canDeleteOrders: isAdmin,
    canOverrideOrderStatus: isAdmin,
    canViewAllOrders: isAdmin,
    
    // Product Management - Admin has full control
    canManageProducts: isAdmin,
    canCreateProducts: isAdmin,
    canEditProducts: isAdmin,
    canDeleteProducts: isAdmin,
    canSetProductPrices: isAdmin,
    
    // Transport Management - Admin has full control
    canManageTransport: isAdmin,
    canCreateTransportTariffs: isAdmin,
    canEditTransportTariffs: isAdmin,
    canDeleteTransportTariffs: isAdmin,
    canSetTransportPrices: isAdmin,
    
    // System Configuration - Admin has full control
    canManageSystemConfig: isAdmin,
    canManageRegions: isAdmin,
    canManageNotifications: isAdmin,
    canManagePromotions: isAdmin,
    canManageGoals: isAdmin,
    canManageBLNumbers: isAdmin,
    canManagePalletTracking: isAdmin,
    
    // Reports and Analytics - Admin has full control
    canViewAllReports: isAdmin,
    canExportData: isAdmin,
    canViewActivityLogs: isAdmin,
    canViewSystemStats: isAdmin,
    
    // Override Permissions - Admin has ultimate control
    canOverrideAnyPermission: isAdmin,
    canBypassRestrictions: isAdmin,
    canAccessAdminPanel: isAdmin,
  }
}

// Helper function to check if user is admin
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin'
}

// Helper function to check if user can override any restriction
export function canOverride(userRole: string): boolean {
  return userRole === 'admin'
}

// Helper function to get admin badge for UI
export function getAdminBadge(): string {
  return "ADMIN"
}

// Helper function to get admin color scheme
export function getAdminColors(): { primary: string; secondary: string; accent: string } {
  return {
    primary: "bg-red-600 hover:bg-red-700",
    secondary: "bg-red-100 text-red-800",
    accent: "text-red-600"
  }
}
