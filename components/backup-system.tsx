"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Shield, 
  Clock,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Cloud,
  Archive,
  RotateCcw,
  Settings,
  Calendar,
  FileText,
  Zap,
  Trash2,
  Eye,
  Play,
  Pause
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface BackupRecord {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled'
  size: number
  created_at: string
  completed_at?: string
  created_by: string
  description?: string
  tables: string[]
  file_path?: string
  checksum?: string
}

interface BackupSchedule {
  id: string
  name: string
  type: 'full' | 'incremental'
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  is_active: boolean
  last_run?: string
  next_run?: string
  retention_days: number
}

interface BackupSystemProps {
  className?: string
}

export const BackupSystem: React.FC<BackupSystemProps> = ({ className }) => {
  const { user } = useAuth()
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null)

  const fetchBackups = async () => {
    try {
      // Mock backup data
      const mockBackups: BackupRecord[] = [
        {
          id: 'BACKUP-001',
          name: 'Full Backup - 2024-01-15',
          type: 'full',
          status: 'completed',
          size: 15728640, // 15MB
          created_at: '2024-01-15T02:00:00Z',
          completed_at: '2024-01-15T02:15:00Z',
          created_by: 'system',
          description: 'Automated full backup including all tables',
          tables: ['orders', 'clients', 'users', 'notifications', 'activity_logs'],
          file_path: '/backups/full_2024-01-15.sql',
          checksum: 'a1b2c3d4e5f6'
        },
        {
          id: 'BACKUP-002',
          name: 'Incremental Backup - 2024-01-16',
          type: 'incremental',
          status: 'completed',
          size: 2097152, // 2MB
          created_at: '2024-01-16T02:00:00Z',
          completed_at: '2024-01-16T02:05:00Z',
          created_by: 'system',
          description: 'Incremental backup of changes since last full backup',
          tables: ['orders', 'activity_logs'],
          file_path: '/backups/incremental_2024-01-16.sql',
          checksum: 'b2c3d4e5f6a1'
        },
        {
          id: 'BACKUP-003',
          name: 'Manual Backup - Orders Only',
          type: 'differential',
          status: 'completed',
          size: 5242880, // 5MB
          created_at: '2024-01-16T14:30:00Z',
          completed_at: '2024-01-16T14:35:00Z',
          created_by: user?.id || 'USR-001',
          description: 'Manual backup of orders table only',
          tables: ['orders'],
          file_path: '/backups/manual_orders_2024-01-16.sql',
          checksum: 'c3d4e5f6a1b2'
        }
      ]

      setBackups(mockBackups)

      // Mock backup schedules
      const mockSchedules: BackupSchedule[] = [
        {
          id: 'SCHED-001',
          name: 'Daily Full Backup',
          type: 'full',
          frequency: 'daily',
          time: '02:00',
          is_active: true,
          last_run: '2024-01-15T02:00:00Z',
          next_run: '2024-01-17T02:00:00Z',
          retention_days: 30
        },
        {
          id: 'SCHED-002',
          name: 'Weekly Incremental',
          type: 'incremental',
          frequency: 'weekly',
          time: '03:00',
          is_active: true,
          last_run: '2024-01-14T03:00:00Z',
          next_run: '2024-01-21T03:00:00Z',
          retention_days: 90
        }
      ]

      setSchedules(mockSchedules)
    } catch (error) {
      console.error('Error fetching backups:', error)
    }
  }

  const createBackup = async (type: 'full' | 'incremental' | 'differential', tables?: string[]) => {
    try {
      setIsBackingUp(true)
      setBackupProgress(0)

      const backupId = `BACKUP-${Date.now()}`
      const backupName = `${type.charAt(0).toUpperCase() + type.slice(1)} Backup - ${new Date().toLocaleDateString()}`

      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 20
        })
      }, 500)

      // Simulate backup process
      setTimeout(() => {
        const newBackup: BackupRecord = {
          id: backupId,
          name: backupName,
          type,
          status: 'completed',
          size: Math.floor(Math.random() * 20000000) + 1000000, // 1-20MB
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          created_by: user?.id || 'system',
          description: `Manual ${type} backup`,
          tables: tables || ['orders', 'clients', 'users'],
          file_path: `/backups/${type}_${Date.now()}.sql`,
          checksum: Math.random().toString(36).substring(2, 14)
        }

        setBackups(prev => [newBackup, ...prev])
        setIsBackingUp(false)
        setBackupProgress(0)
        clearInterval(progressInterval)
      }, 3000)
    } catch (error) {
      console.error('Error creating backup:', error)
      setIsBackingUp(false)
      setBackupProgress(0)
    }
  }

  const restoreBackup = async (backupId: string) => {
    try {
      setIsRestoring(true)
      setRestoreProgress(0)

      // Simulate restore progress
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 300)

      // Simulate restore process
      setTimeout(() => {
        setIsRestoring(false)
        setRestoreProgress(0)
        clearInterval(progressInterval)
        alert('Backup restored successfully!')
      }, 4000)
    } catch (error) {
      console.error('Error restoring backup:', error)
      setIsRestoring(false)
      setRestoreProgress(0)
    }
  }

  const downloadBackup = (backup: BackupRecord) => {
    // Simulate file download
    const blob = new Blob([`-- Backup: ${backup.name}\n-- Created: ${backup.created_at}\n-- Tables: ${backup.tables.join(', ')}\n-- This is a mock backup file`], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${backup.name.replace(/\s+/g, '_')}.sql`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const deleteBackup = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      setBackups(prev => prev.filter(b => b.id !== backupId))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'incremental':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'differential':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalBackupSize = () => {
    return backups.reduce((total, backup) => total + backup.size, 0)
  }

  const getCompletedBackups = () => {
    return backups.filter(backup => backup.status === 'completed').length
  }

  useEffect(() => {
    fetchBackups()
    
    // Refresh backups every 5 minutes
    const interval = setInterval(fetchBackups, 300000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Backup Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{backups.length}</div>
            <p className="text-xs text-gray-500">Backup files created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatFileSize(getTotalBackupSize())}
            </div>
            <p className="text-xs text-gray-500">Storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getCompletedBackups()}</div>
            <p className="text-xs text-gray-500">Successful backups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {schedules.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-gray-500">Automated backups</p>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Backup Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Create Backup</h4>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => createBackup('full')}
                  disabled={isBackingUp}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Full Backup
                </Button>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => createBackup('incremental')}
                  disabled={isBackingUp}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Incremental
                </Button>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => createBackup('differential', ['orders'])}
                  disabled={isBackingUp}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Orders Only
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Backup Progress</h4>
              {isBackingUp && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Creating backup...</span>
                    <span>{Math.round(backupProgress)}%</span>
                  </div>
                  <Progress value={backupProgress} className="h-2" />
                </div>
              )}
              {isRestoring && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Restoring backup...</span>
                    <span>{Math.round(restoreProgress)}%</span>
                  </div>
                  <Progress value={restoreProgress} className="h-2" />
                </div>
              )}
              {!isBackingUp && !isRestoring && (
                <p className="text-sm text-gray-500">No active operations</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fetchBackups()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Export backup list */}}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-green-600" />
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {backup.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {backup.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(backup.status)}>
                      {backup.status}
                    </Badge>
                    <Badge className={getTypeColor(backup.type)}>
                      {backup.type}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatFileSize(backup.size)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(backup.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tables</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {backup.tables.length}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Checksum</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                      {backup.checksum}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadBackup(backup)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => restoreBackup(backup.id)}
                    disabled={isRestoring || backup.status !== 'completed'}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedBackup(backup)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteBackup(backup.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Backup Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {schedule.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {schedule.frequency} {schedule.type} backup at {schedule.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {schedule.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className={getTypeColor(schedule.type)}>
                      {schedule.type}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Run</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {schedule.last_run ? new Date(schedule.last_run).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Run</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {schedule.next_run ? new Date(schedule.next_run).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Retention</label>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {schedule.retention_days} days
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Details Modal */}
      {selectedBackup && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Backup Details
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedBackup(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Backup ID</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {selectedBackup.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">File Path</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {selectedBackup.file_path}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tables Included</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedBackup.tables.map((table) => (
                    <Badge key={table} variant="secondary">
                      {table}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created By</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedBackup.created_by}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed At</label>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedBackup.completed_at ? new Date(selectedBackup.completed_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(BackupSystem)
