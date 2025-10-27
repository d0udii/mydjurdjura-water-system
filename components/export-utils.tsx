"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, FileSpreadsheet, Calendar, Filter, Loader2 } from "lucide-react"

interface ExportData {
  type: 'orders' | 'clients' | 'promotions' | 'goals' | 'bl-numbers' | 'pallet-tracking'
  title: string
  description: string
}

interface ExportDialogProps {
  data: ExportData
  children?: React.ReactNode
}

const exportTypes: ExportData[] = [
  {
    type: 'orders',
    title: 'Orders Export',
    description: 'Export all orders with details, status, and delivery information'
  },
  {
    type: 'clients',
    title: 'Clients Export',
    description: 'Export client information including contact details and RC numbers'
  },
  {
    type: 'promotions',
    title: 'Promotions Export',
    description: 'Export promotional campaigns and discount information'
  },
  {
    type: 'goals',
    title: 'Goals Export',
    description: 'Export goals and progress tracking data'
  },
  {
    type: 'bl-numbers',
    title: 'BL Numbers Export',
    description: 'Export Bill of Lading numbers and tracking information'
  },
  {
    type: 'pallet-tracking',
    title: 'Pallet Tracking Export',
    description: 'Export pallet and intercalaire tracking records'
  }
]

export function ExportDialog({ data, children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const params = new URLSearchParams({
        type: data.type,
        format: format
      })
      
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      
      const response = await fetch(`/api/export?${params}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.type}_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setIsOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const resetForm = () => {
    setFormat('pdf')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {data.title}
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {data.description}
          </p>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div>
            <Label htmlFor="format" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Format <span className="text-red-500">*</span>
            </Label>
            <Select value={format} onValueChange={(value: 'pdf' | 'excel') => setFormat(value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Filter (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  From Date
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  To Date
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to export all records
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-6"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ExportButton({ 
  type, 
  variant = "outline", 
  size = "sm",
  className = "",
  children
}: {
  type: 'orders' | 'clients' | 'promotions' | 'goals' | 'bl-numbers' | 'pallet-tracking'
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}) {
  const exportData = exportTypes.find(et => et.type === type)
  
  if (!exportData) {
    console.error(`Export type ${type} not found`)
    return null
  }

  return (
    <ExportDialog data={exportData}>
      {children || (
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      )}
    </ExportDialog>
  )
}

export function BulkExportDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [isExporting, setIsExporting] = useState(false)

  const handleBulkExport = async () => {
    if (selectedTypes.length === 0) {
      alert('Please select at least one export type')
      return
    }

    setIsExporting(true)
    
    try {
      for (const type of selectedTypes) {
        const params = new URLSearchParams({
          type: type,
          format: format
        })
        
        const response = await fetch(`/api/export?${params}`)
        
        if (!response.ok) {
          throw new Error(`Export failed for ${type}`)
        }
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setIsOpen(false)
      setSelectedTypes([])
    } catch (error) {
      console.error('Bulk export error:', error)
      alert('Bulk export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
          <Download className="h-4 w-4 mr-2" />
          Bulk Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Bulk Export
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Export multiple data types at once
          </p>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
              Select Export Types
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {exportTypes.map((exportData) => (
                <label key={exportData.type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(exportData.type)}
                    onChange={() => toggleType(exportData.type)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {exportData.title}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="format" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Format <span className="text-red-500">*</span>
            </Label>
            <Select value={format} onValueChange={(value: 'pdf' | 'excel') => setFormat(value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-6"
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkExport}
              className="px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isExporting || selectedTypes.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All ({selectedTypes.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
