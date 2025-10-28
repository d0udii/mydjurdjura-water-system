"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Shield, 
  Zap,
  ArrowRight,
  ArrowDown,
  FileText,
  Mail,
  Bell,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye
} from "lucide-react"
import { useDataStore } from "@/lib/shared-data-store"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface WorkflowStep {
  id: string
  name: string
  description: string
  type: 'approval' | 'notification' | 'automation' | 'condition'
  assigned_to: string
  assigned_role: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed'
  due_date?: string
  completed_at?: string
  completed_by?: string
  metadata?: any
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  trigger: 'order_created' | 'order_updated' | 'client_assigned' | 'manual'
  steps: WorkflowStep[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WorkflowInstance {
  id: string
  template_id: string
  entity_id: string
  entity_type: 'order' | 'client' | 'user'
  status: 'running' | 'completed' | 'failed' | 'paused'
  current_step: number
  steps: WorkflowStep[]
  started_at: string
  completed_at?: string
  created_by: string
}

interface WorkflowSystemProps {
  className?: string
}

export const WorkflowSystem: React.FC<WorkflowSystemProps> = ({ className }) => {
  const { user } = useAuth()
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      
      // Mock workflow templates
      const mockWorkflows: WorkflowTemplate[] = [
        {
          id: 'WF-001',
          name: 'Order Approval Workflow',
          description: 'Automated approval process for new orders',
          trigger: 'order_created',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          steps: [
            {
              id: 'STEP-001',
              name: 'Initial Review',
              description: 'Review order details and validate information',
              type: 'approval',
              assigned_to: 'USR-002',
              assigned_role: 'supervisor',
              status: 'pending'
            },
            {
              id: 'STEP-002',
              name: 'Inventory Check',
              description: 'Verify product availability and stock levels',
              type: 'automation',
              assigned_to: 'system',
              assigned_role: 'system',
              status: 'pending'
            },
            {
              id: 'STEP-003',
              name: 'Regional Manager Approval',
              description: 'Final approval from regional manager',
              type: 'approval',
              assigned_to: 'USR-003',
              assigned_role: 'regional_manager',
              status: 'pending'
            },
            {
              id: 'STEP-004',
              name: 'Order Processing',
              description: 'Start order processing and preparation',
              type: 'automation',
              assigned_to: 'USR-004',
              assigned_role: 'operations',
              status: 'pending'
            }
          ]
        },
        {
          id: 'WF-002',
          name: 'Client Onboarding Workflow',
          description: 'Automated process for new client registration',
          trigger: 'client_assigned',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          steps: [
            {
              id: 'STEP-005',
              name: 'Client Verification',
              description: 'Verify client information and documents',
              type: 'approval',
              assigned_to: 'USR-002',
              assigned_role: 'supervisor',
              status: 'pending'
            },
            {
              id: 'STEP-006',
              name: 'Welcome Notification',
              description: 'Send welcome email and onboarding information',
              type: 'notification',
              assigned_to: 'system',
              assigned_role: 'system',
              status: 'pending'
            },
            {
              id: 'STEP-007',
              name: 'Account Setup',
              description: 'Create client account and assign permissions',
              type: 'automation',
              assigned_to: 'USR-001',
              assigned_role: 'admin',
              status: 'pending'
            }
          ]
        }
      ]

      setWorkflows(mockWorkflows)

      // Mock workflow instances
      const mockInstances: WorkflowInstance[] = [
        {
          id: 'INST-001',
          template_id: 'WF-001',
          entity_id: 'ORD-001',
          entity_type: 'order',
          status: 'running',
          current_step: 1,
          started_at: '2024-01-15T10:00:00Z',
          created_by: 'USR-001',
          steps: mockWorkflows[0].steps.map((step, index) => ({
            ...step,
            status: index === 0 ? 'in_progress' : index < 1 ? 'completed' : 'pending'
          }))
        },
        {
          id: 'INST-002',
          template_id: 'WF-001',
          entity_id: 'ORD-002',
          entity_type: 'order',
          status: 'completed',
          current_step: 4,
          started_at: '2024-01-14T09:00:00Z',
          completed_at: '2024-01-16T15:30:00Z',
          created_by: 'USR-001',
          steps: mockWorkflows[0].steps.map(step => ({
            ...step,
            status: 'completed',
            completed_at: '2024-01-16T15:30:00Z',
            completed_by: 'USR-004'
          }))
        }
      ]

      setInstances(mockInstances)
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowId: string, entityId: string, entityType: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId)
      if (!workflow) return

      const newInstance: WorkflowInstance = {
        id: `INST-${Date.now()}`,
        template_id: workflowId,
        entity_id: entityId,
        entity_type: entityType as 'order' | 'client' | 'user',
        status: 'running',
        current_step: 0,
        started_at: new Date().toISOString(),
        created_by: user?.id || 'system',
        steps: workflow.steps.map(step => ({ ...step, status: 'pending' }))
      }

      setInstances(prev => [newInstance, ...prev])
      
      // Simulate workflow execution
      setTimeout(() => {
        setInstances(prev => 
          prev.map(instance => 
            instance.id === newInstance.id 
              ? { ...instance, current_step: 1, steps: instance.steps.map((step, index) => 
                  index === 0 ? { ...step, status: 'in_progress' } : step
                )}
              : instance
          )
        )
      }, 1000)
    } catch (error) {
      console.error('Error executing workflow:', error)
    }
  }

  const completeStep = async (instanceId: string, stepId: string) => {
    try {
      setInstances(prev => 
        prev.map(instance => {
          if (instance.id === instanceId) {
            const updatedSteps = instance.steps.map(step => 
              step.id === stepId 
                ? { 
                    ...step, 
                    status: 'completed', 
                    completed_at: new Date().toISOString(),
                    completed_by: user?.id || 'system'
                  }
                : step
            )
            
            const currentStepIndex = updatedSteps.findIndex(step => step.id === stepId)
            const nextStepIndex = currentStepIndex + 1
            
            if (nextStepIndex < updatedSteps.length) {
              updatedSteps[nextStepIndex] = { ...updatedSteps[nextStepIndex], status: 'in_progress' }
            }
            
            const isCompleted = updatedSteps.every(step => step.status === 'completed')
            
            return {
              ...instance,
              steps: updatedSteps,
              current_step: isCompleted ? instance.steps.length : nextStepIndex,
              status: isCompleted ? 'completed' : 'running',
              completed_at: isCompleted ? new Date().toISOString() : undefined
            }
          }
          return instance
        })
      )
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'notification':
        return <Bell className="h-4 w-4 text-green-500" />
      case 'automation':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'condition':
        return <Settings className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'skipped':
        return <ArrowRight className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  useEffect(() => {
    fetchWorkflows()
    
    // Real-time updates every 30 seconds
    const interval = setInterval(fetchWorkflows, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-blue-600" />
            Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {workflow.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {workflow.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Trigger: {workflow.trigger.replace('_', ' ')}</span>
                  <span>Steps: {workflow.steps.length}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflow Instances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-600" />
            Active Workflow Instances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instances.map((instance) => {
              const workflow = workflows.find(w => w.id === instance.template_id)
              const currentStep = instance.steps[instance.current_step]
              
              return (
                <div key={instance.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {workflow?.name} - {instance.entity_id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Started: {new Date(instance.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(instance.status)}>
                        {instance.status}
                      </Badge>
                      {currentStep && (
                        <Button 
                          size="sm" 
                          onClick={() => completeStep(instance.id, currentStep.id)}
                          disabled={currentStep.assigned_role !== user?.role && currentStep.assigned_to !== user?.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Step
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Workflow Progress */}
                  <div className="space-y-2">
                    {instance.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getStepStatusIcon(step.status)}
                          {getStepIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {step.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {step.description}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {step.assigned_role}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-600" />
                {selectedWorkflow.name}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedWorkflow(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedWorkflow.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Workflow Steps</h4>
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      {getStepIcon(step.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {step.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {step.assigned_role}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => executeWorkflow(selectedWorkflow.id, 'ORD-TEST', 'order')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Execute Workflow
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withAuth(WorkflowSystem)
