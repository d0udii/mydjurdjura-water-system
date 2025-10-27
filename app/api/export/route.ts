import { NextRequest, NextResponse } from 'next/server'

// Mock data for export functionality
const mockOrders = [
  {
    id: "ORD-001",
    client_name: "Biskra Water Distributor",
    client_address: "123 Main Street, Biskra",
    status: "pending",
    total_price: 125000,
    product_5_5L_pallets: 11,
    product_1_5L_pallets: 11,
    truck_type: "factory",
    delivery_date: "2024-01-15",
    created_at: "2024-01-10T10:00:00Z",
    bl_number: "BL2024001"
  },
  {
    id: "ORD-002",
    client_name: "Ouled Djellal Store",
    client_address: "456 Market Square, Ouled Djellal",
    status: "in_progress",
    total_price: 89000,
    product_5_5L_pallets: 8,
    product_1_5L_pallets: 6,
    truck_type: "client_own",
    delivery_date: "2024-01-20",
    created_at: "2024-01-12T14:30:00Z",
    bl_number: "BL2024002"
  }
]

const mockClients = [
  {
    id: "CLI-001",
    name: "Biskra Water Distributor",
    phone: "+213 33 123 456",
    address: "123 Main Street, Biskra",
    rc_number: "001234567RC",
    status: "active",
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "CLI-002",
    name: "Ouled Djellal Store",
    phone: "+213 33 789 012",
    address: "456 Market Square, Ouled Djellal",
    rc_number: "002345678RC",
    status: "active",
    created_at: "2024-01-02T00:00:00Z"
  }
]

const mockPromotions = [
  {
    id: "PROMO-001",
    name: "Summer Discount Biskra",
    type: "percentage",
    value: 10,
    target_type: "city",
    target_id: "Biskra",
    start_date: "2024-06-01",
    end_date: "2024-08-31",
    status: "active"
  }
]

const mockGoals = [
  {
    id: "GOAL-001",
    title: "Monthly Sales Target",
    target_type: "supervisor",
    target_id: "USR-003",
    metric_type: "orders_count",
    target_value: 100,
    current_value: 45,
    progress_percentage: 45,
    status: "active",
    start_date: "2024-01-01",
    end_date: "2024-01-31"
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'orders', 'clients', 'promotions', 'goals'
    const format = searchParams.get('format') // 'pdf', 'excel'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    if (!type || !format) {
      return NextResponse.json(
        { error: 'Type and format are required' },
        { status: 400 }
      )
    }

    let data: any[] = []
    let filename = ''
    let title = ''

    switch (type) {
      case 'orders':
        data = mockOrders
        filename = `orders_export_${new Date().toISOString().split('T')[0]}`
        title = 'Orders Export Report'
        break
      case 'clients':
        data = mockClients
        filename = `clients_export_${new Date().toISOString().split('T')[0]}`
        title = 'Clients Export Report'
        break
      case 'promotions':
        data = mockPromotions
        filename = `promotions_export_${new Date().toISOString().split('T')[0]}`
        title = 'Promotions Export Report'
        break
      case 'goals':
        data = mockGoals
        filename = `goals_export_${new Date().toISOString().split('T')[0]}`
        title = 'Goals Export Report'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    // Filter by date range if provided
    if (dateFrom && dateTo) {
      data = data.filter(item => {
        const itemDate = new Date(item.created_at || item.start_date)
        return itemDate >= new Date(dateFrom) && itemDate <= new Date(dateTo)
      })
    }

    if (format === 'pdf') {
      // Generate PDF content
      const pdfContent = generatePDFContent(data, title, type)
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      })
    } else if (format === 'excel') {
      // Generate Excel content
      const excelContent = generateExcelContent(data, title, type)
      return new NextResponse(excelContent, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "excel"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error generating export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generatePDFContent(data: any[], title: string, type: string): Buffer {
  // This is a simplified PDF generation
  // In a real application, you would use a library like jsPDF or Puppeteer
  
  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
72 720 Td
(${title}) Tj
0 -20 Td
(Generated on: ${new Date().toLocaleString()}) Tj
0 -20 Td
(Total Records: ${data.length}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000525 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
612
%%EOF
  `
  
  return Buffer.from(pdfContent, 'utf-8')
}

function generateExcelContent(data: any[], title: string, type: string): Buffer {
  // This is a simplified Excel generation
  // In a real application, you would use a library like xlsx or exceljs
  
  const csvContent = generateCSVContent(data, type)
  
  // Convert CSV to Excel format (simplified)
  const excelContent = `
<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${title}</Title>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="12" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Sheet1">
  <Table>
   ${generateExcelRows(data, type)}
  </Table>
 </Worksheet>
</Workbook>
  `
  
  return Buffer.from(excelContent, 'utf-8')
}

function generateCSVContent(data: any[], type: string): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ]
  
  return csvRows.join('\n')
}

function generateExcelRows(data: any[], type: string): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const headerRow = `<Row>
    ${headers.map(header => `<Cell ss:StyleID="Header"><Data ss:Type="String">${header}</Data></Cell>`).join('')}
  </Row>`
  
  const dataRows = data.map(row => `<Row>
    ${headers.map(header => `<Cell><Data ss:Type="String">${row[header] || ''}</Data></Cell>`).join('')}
  </Row>`).join('')
  
  return headerRow + dataRows
}
