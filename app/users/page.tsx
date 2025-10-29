"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Crown, Shield, Zap, Lock, Edit, Trash2, UserPlus, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"
import { showEditSuccessToast, showEditErrorToast, showDeleteSuccessToast, showDeleteErrorToast } from "@/lib/toast-notifications"
import { useUsers, useUpdateUser, useDeleteUser } from "@/lib/supabase-realtime-hooks"
import { FormInput, FormSelect, FormButton, FormLayout, FormActions } from "@/components/ui/form-components"
import { FormValidator } from "@/lib/form-validation"

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'regional_manager' | 'supervisor' | 'operations'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
}

function UsersPage() {
  const { user } = useAuth()
  const { data: users = [], isLoading: loading, error } = useUsers()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'supervisor' as 'admin' | 'regional_manager' | 'supervisor' | 'operations',
    status: 'active' as 'active' | 'inactive' | 'pending'
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  
  // Admin permissions
  const isUserAdmin = user?.role === "admin"

  const validateEditForm = (): boolean => {
    const validationRules = {
      name: FormValidator.rules.required('Name'),
      email: FormValidator.rules.email('Email')
    }
    const result = FormValidator.validateForm(editForm, validationRules)
    setEditErrors(result.errors)
    return result.isValid
  }

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit)
    setEditForm({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      status: userToEdit.status
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    if (!validateEditForm()) {
      return
    }

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        updates: editForm
      })
      
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      setEditErrors({})
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Only administrators can manage users</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Enhanced Header with Admin Controls */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Crown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                {isUserAdmin && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 text-sm font-bold">
                    <Shield className="h-4 w-4 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isUserAdmin 
                  ? "Full administrative control over all users, roles, and system permissions"
                  : "Manage system users, roles, and permissions"
                }
              </p>
              {isUserAdmin && (
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Override Permissions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <Lock className="h-4 w-4" />
                    <span className="font-medium">Full System Access</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{userItem.name}</h3>
                    {userItem.role === 'admin' && (
                      <Crown className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{userItem.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Created: {new Date(userItem.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge className={userItem.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}>
                      {userItem.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={userItem.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : userItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}>
                      {userItem.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {userItem.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                      {userItem.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(userItem)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Delete User
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{userItem.name}</strong>? 
                            This action cannot be undone.
                            {isUserAdmin && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                                  <Crown className="h-4 w-4" />
                                  Admin Override Permission
                                </div>
                              </div>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          <FormLayout onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
            <FormInput
              label="Name"
              name="name"
              required
              error={editErrors.name}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Enter user name"
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              required
              error={editErrors.email}
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="Enter user email"
            />
            <FormSelect
              label="Role"
              name="role"
              value={editForm.role}
              onValueChange={(value: 'admin' | 'regional_manager' | 'supervisor' | 'operations') => setEditForm({ ...editForm, role: value })}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'regional_manager', label: 'Regional Manager' },
                { value: 'supervisor', label: 'Supervisor' },
                { value: 'operations', label: 'Operations' }
              ]}
              placeholder="Select role"
            />
            <FormSelect
              label="Status"
              name="status"
              value={editForm.status}
              onValueChange={(value: 'active' | 'inactive' | 'pending') => setEditForm({ ...editForm, status: value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' }
              ]}
              placeholder="Select status"
            />
            <FormActions>
              <FormButton 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditErrors({})
                }}
              >
                Cancel
              </FormButton>
              <FormButton 
                onClick={handleUpdateUser}
                loading={updateUser.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update User
              </FormButton>
            </FormActions>
          </FormLayout>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(UsersPage)