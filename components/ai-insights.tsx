"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Users,
  Package,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  Download,
  Share,
  Bookmark,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { withAuth } from "@/lib/auth"

interface AIInsight {
  id: string
  type: 'revenue' | 'efficiency' | 'customer' | 'inventory' | 'logistics' | 'risk'
  category: 'opportunity' | 'warning' | 'optimization' | 'prediction'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  confidence: number
  potential_value?: number
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  actionable: boolean
  recommendations: string[]
  data_points: any
  created_at: string
  status: 'new' | 'reviewed' | 'implemented' | 'dismissed'
}

interface AIPrediction {
  id: string
  metric: string
  current_value: number
  predicted_value: number
  confidence: number
  timeframe: string
  trend: 'increasing' | 'decreasing' | 'stable'
  factors: string[]
}

interface AIRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  description: string
  expected_impact: string
  effort_required: 'low' | 'medium' | 'high'
  implementation_steps: string[]
  success_metrics: string[]
  estimated_timeline: string
}

interface AIInsightsProps {
  className?: string
}

export const AIInsights: React.FC<AIInsightsProps> = ({ className }) => {
  const { user } = useAuth()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<AIPrediction[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fetchAIInsights = async () => {
    try {
      setLoading(true)
      
      // Mock AI insights
      const mockInsights: AIInsight[] = [
        {
          id: 'INSIGHT-001',
          type: 'revenue',
          category: 'opportunity',
          title: 'Revenue Optimization Opportunity',
          description: 'Analysis shows 23% potential revenue increase by optimizing delivery routes in the East region',
          impact: 'high',
          confidence: 87,
          potential_value: 45000,
          timeframe: 'short_term',
          actionable: true,
          recommendations: [
            'Implement dynamic route optimization',
            'Consolidate deliveries to nearby clients',
            'Adjust delivery schedules based on traffic patterns'
          ],
          data_points: {
            current_efficiency: 67,
            potential_efficiency: 90,
            affected_orders: 156,
            cost_savings: 45000
          },
          created_at: new Date().toISOString(),
          status: 'new'
        },
        {
          id: 'INSIGHT-002',
          type: 'customer',
          category: 'warning',
          title: 'Customer Satisfaction Risk',
          description: 'Client satisfaction scores declining in West region - immediate attention required',
          impact: 'high',
          confidence: 92,
          timeframe: 'immediate',
          actionable: true,
          recommendations: [
            'Investigate delivery delays in West region',
            'Contact affected clients proactively',
            'Review regional supervisor performance'
          ],
          data_points: {
            satisfaction_score: 3.2,
            previous_score: 4.1,
            affected_clients: 23,
            main_complaints: ['delivery_delay', 'communication']
          },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'reviewed'
        },
        {
          id: 'INSIGHT-003',
          type: 'inventory',
          category: 'optimization',
          title: 'Inventory Optimization',
          description: 'Stock levels for 5.5L bottles are 40% above optimal - consider reducing production',
          impact: 'medium',
          confidence: 78,
          potential_value: 12000,
          timeframe: 'medium_term',
          actionable: true,
          recommendations: [
            'Reduce 5.5L production by 15%',
            'Increase marketing for 5.5L products',
            'Consider promotional pricing'
          ],
          data_points: {
            current_stock: 2400,
            optimal_stock: 1440,
            turnover_rate: 0.8,
            storage_cost: 12000
          },
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        },
        {
          id: 'INSIGHT-004',
          type: 'logistics',
          category: 'prediction',
          title: 'Delivery Capacity Prediction',
          description: 'AI predicts 30% increase in delivery demand next month - prepare capacity expansion',
          impact: 'medium',
          confidence: 85,
          timeframe: 'short_term',
          actionable: true,
          recommendations: [
            'Hire additional delivery personnel',
            'Acquire 2 additional trucks',
            'Implement overtime scheduling'
          ],
          data_points: {
            current_capacity: 100,
            predicted_demand: 130,
            capacity_gap: 30,
            seasonal_factor: 1.3
          },
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'new'
        }
      ]

      setInsights(mockInsights)

      // Mock AI predictions
      const mockPredictions: AIPrediction[] = [
        {
          id: 'PRED-001',
          metric: 'Monthly Revenue',
          current_value: 150000,
          predicted_value: 175000,
          confidence: 89,
          timeframe: 'Next Month',
          trend: 'increasing',
          factors: ['Seasonal demand', 'New client acquisitions', 'Price optimization']
        },
        {
          id: 'PRED-002',
          metric: 'Order Volume',
          current_value: 1200,
          predicted_value: 1450,
          confidence: 82,
          timeframe: 'Next Quarter',
          trend: 'increasing',
          factors: ['Market expansion', 'Client retention', 'Product diversification']
        },
        {
          id: 'PRED-003',
          metric: 'Delivery Efficiency',
          current_value: 78,
          predicted_value: 72,
          confidence: 75,
          timeframe: 'Next Month',
          trend: 'decreasing',
          factors: ['Traffic congestion', 'Resource constraints', 'Weather patterns']
        }
      ]

      setPredictions(mockPredictions)

      // Mock AI recommendations
      const mockRecommendations: AIRecommendation[] = [
        {
          id: 'REC-001',
          priority: 'high',
          category: 'Operations',
          title: 'Implement Dynamic Pricing',
          description: 'Use AI-driven pricing to optimize revenue based on demand patterns',
          expected_impact: '15-20% revenue increase',
          effort_required: 'medium',
          implementation_steps: [
            'Analyze historical pricing data',
            'Develop pricing algorithm',
            'Test with pilot clients',
            'Roll out to all regions'
          ],
          success_metrics: ['Revenue per order', 'Client retention', 'Market share'],
          estimated_timeline: '6-8 weeks'
        },
        {
          id: 'REC-002',
          priority: 'critical',
          category: 'Customer Service',
          title: 'Automated Client Communication',
          description: 'Implement automated notifications and status updates for better client experience',
          expected_impact: '40% reduction in support tickets',
          effort_required: 'low',
          implementation_steps: [
            'Set up notification templates',
            'Integrate with order system',
            'Configure delivery tracking',
            'Train staff on new system'
          ],
          success_metrics: ['Client satisfaction', 'Support ticket volume', 'Response time'],
          estimated_timeline: '2-3 weeks'
        },
        {
          id: 'REC-003',
          priority: 'medium',
          category: 'Inventory',
          title: 'Predictive Stock Management',
          description: 'Use AI to predict stock requirements and optimize inventory levels',
          expected_impact: '25% reduction in storage costs',
          effort_required: 'high',
          implementation_steps: [
            'Collect historical demand data',
            'Develop prediction models',
            'Integrate with production planning',
            'Monitor and adjust algorithms'
          ],
          success_metrics: ['Stock turnover', 'Storage costs', 'Stockout incidents'],
          estimated_timeline: '10-12 weeks'
        }
      ]

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Error fetching AI insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'efficiency':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'customer':
        return <Users className="h-5 w-5 text-purple-500" />
      case 'inventory':
        return <Package className="h-5 w-5 text-orange-500" />
      case 'logistics':
        return <MapPin className="h-5 w-5 text-red-500" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Brain className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'opportunity':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'warning':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'optimization':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'prediction':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      case 'stable':
        return <Activity className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedCategory)

  const handleInsightAction = (insightId: string, action: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: action as any }
        : insight
    ))
  }

  useEffect(() => {
    fetchAIInsights()
    
    // Refresh insights every 5 minutes
    const interval = setInterval(fetchAIInsights, 300000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{insights.length}</div>
            <p className="text-xs text-gray-500">Active insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{predictions.length}</div>
            <p className="text-xs text-gray-500">AI predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{recommendations.length}</div>
            <p className="text-xs text-gray-500">Actionable items</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {prediction.metric}
                  </h3>
                  {getTrendIcon(prediction.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Current</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {prediction.current_value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Predicted</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {prediction.predicted_value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={prediction.confidence} className="w-16 h-2" />
                      <span className="text-xs font-semibold">{prediction.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Timeframe: {prediction.timeframe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Insights ({filteredInsights.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="revenue">Revenue</option>
                <option value="efficiency">Efficiency</option>
                <option value="customer">Customer</option>
                <option value="inventory">Inventory</option>
                <option value="logistics">Logistics</option>
                <option value="risk">Risk</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchAIInsights}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h3>
                        <Badge className={getCategoryColor(insight.category)}>
                          {insight.category}
                        </Badge>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Confidence: {insight.confidence}%</span>
                        <span>Timeframe: {insight.timeframe}</span>
                        <span>Created: {formatTimeAgo(insight.created_at)}</span>
                        {insight.potential_value && (
                          <span className="text-green-600 font-semibold">
                            Potential Value: {insight.potential_value.toLocaleString()} DA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={insight.confidence} className="w-20 h-2" />
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleInsightAction(insight.id, 'reviewed')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleInsightAction(insight.id, 'dismissed')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {insight.recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Recommendations:
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI Recommendations ({recommendations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h3>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="secondary">
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Impact: {rec.expected_impact}</span>
                      <span>Effort: {rec.effort_required}</span>
                      <span>Timeline: {rec.estimated_timeline}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Implementation Steps:
                    </div>
                    <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {rec.implementation_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-500 mt-1">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Success Metrics:
                    </div>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {rec.success_metrics.map((metric, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-500 mt-1">•</span>
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(AIInsights)
