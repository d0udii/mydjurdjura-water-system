/**
 * UI Component Visual Checklist
 * Manual verification checklist for UI components
 */

export const UI_CHECKLIST = {
  alignment: {
    title: 'Alignment & Layout',
    checks: [
      {
        page: 'Products',
        items: [
          '✓ All form fields are aligned vertically',
          '✓ Labels are aligned with inputs',
          '✓ Buttons are aligned horizontally',
          '✓ Table columns are properly aligned',
          '✓ Modals are centered on screen',
          '✓ No overlapping text or elements',
          '✓ Consistent spacing between elements'
        ]
      },
      {
        page: 'Clients',
        items: [
          '✓ Client form fields are properly aligned',
          '✓ Region and city auto-fill correctly positioned',
          '✓ Client list table is properly aligned',
          '✓ Action buttons are aligned',
          '✓ No overlapping in create/edit modals'
        ]
      },
      {
        page: 'Orders',
        items: [
          '✓ Order form fields are aligned',
          '✓ Client selection dropdown aligns properly',
          '✓ Auto-filled region/city display is aligned',
          '✓ Order table columns are aligned',
          '✓ Status badges are aligned'
        ]
      },
      {
        page: 'Transport',
        items: [
          '✓ Tariff form fields are aligned',
          '✓ City and price inputs are aligned',
          '✓ Table columns are aligned',
          '✓ Status badges are aligned'
        ]
      },
      {
        page: 'Users',
        items: [
          '✓ User form fields are aligned',
          '✓ Role and status dropdowns are aligned',
          '✓ User table columns are aligned'
        ]
      }
    ]
  },
  responsive: {
    title: 'Responsive Design',
    checks: [
      {
        breakpoint: 'Desktop (1920px)',
        items: [
          '✓ All content fits within viewport',
          '✓ No horizontal scrolling',
          '✓ Tables are fully visible',
          '✓ Modals are properly sized',
          '✓ Sidebar is visible'
        ]
      },
      {
        breakpoint: 'Tablet (1024px)',
        items: [
          '✓ Content adapts to smaller width',
          '✓ Tables scroll horizontally if needed',
          '✓ Modals resize appropriately',
          '✓ Sidebar collapses or adapts',
          '✓ No overlapping elements'
        ]
      },
      {
        breakpoint: 'Mobile (375px)',
        items: [
          '✓ Content stacks vertically',
          '✓ Forms are single column',
          '✓ Tables scroll horizontally',
          '✓ Modals are full width',
          '✓ Navigation is mobile-friendly',
          '✓ Touch targets are large enough'
        ]
      }
    ]
  },
  modals: {
    title: 'Modals & Dialogs',
    checks: [
      {
        type: 'Create Modals',
        items: [
          '✓ Create Product modal opens correctly',
          '✓ Create Client modal opens correctly',
          '✓ Create Order modal opens correctly',
          '✓ Create Transport Tariff modal opens correctly',
          '✓ All form fields are visible',
          '✓ Submit buttons are visible',
          '✓ Cancel buttons work',
          '✓ Modals close on backdrop click',
          '✓ Modals close on escape key'
        ]
      },
      {
        type: 'Edit Modals',
        items: [
          '✓ Edit Product modal opens with data',
          '✓ Edit Client modal opens with data',
          '✓ Edit Order modal opens with data',
          '✓ Edit Transport Tariff modal opens with data',
          '✓ All fields are pre-filled',
          '✓ Updates are saved correctly',
          '✓ Modals close after save'
        ]
      },
      {
        type: 'Delete Dialogs',
        items: [
          '✓ Delete confirmation dialog appears',
          '✓ Delete message is clear',
          '✓ Cancel button works',
          '✓ Confirm button deletes item',
          '✓ Dialog closes after deletion'
        ]
      }
    ]
  },
  inputs: {
    title: 'Inputs & Forms',
    checks: [
      {
        type: 'Text Inputs',
        items: [
          '✓ All text inputs are visible',
          '✓ Placeholders are displayed',
          '✓ Labels are associated with inputs',
          '✓ Inputs accept text correctly',
          '✓ Required fields are marked',
          '✓ Error messages display below inputs',
          '✓ Inputs highlight on focus'
        ]
      },
      {
        type: 'Select Dropdowns',
        items: [
          '✓ Dropdowns open when clicked',
          '✓ Options are displayed correctly',
          '✓ Selected value is shown',
          '✓ Dropdowns close after selection',
          '✓ Client dropdown auto-fills region/city',
          '✓ Region dropdown works correctly'
        ]
      },
      {
        type: 'Number Inputs',
        items: [
          '✓ Number inputs accept numeric values',
          '✓ Decimal inputs work correctly',
          '✓ Min/max validation works',
          '✓ Error messages for invalid numbers'
        ]
      },
      {
        type: 'Form Validation',
        items: [
          '✓ Required fields show errors if empty',
          '✓ Email validation works',
          '✓ Phone validation works',
          '✓ Number validation works',
          '✓ Error messages are clear',
          '✓ Forms don\'t submit with errors'
        ]
      }
    ]
  },
  tables: {
    title: 'Tables & Data Display',
    checks: [
      {
        type: 'Table Rendering',
        items: [
          '✓ All tables load correctly',
          '✓ Table headers are visible',
          '✓ Table rows are displayed',
          '✓ Data is properly formatted',
          '✓ Empty states are shown when no data',
          '✓ Loading states are shown during fetch',
          '✓ Tables are scrollable if needed'
        ]
      },
      {
        type: 'Table Actions',
        items: [
          '✓ Edit buttons are visible in each row',
          '✓ Delete buttons are visible in each row',
          '✓ Action buttons are aligned',
          '✓ Buttons trigger correct actions',
          '✓ Row clicks work (if applicable)'
        ]
      },
      {
        type: 'Table Features',
        items: [
          '✓ Tables are responsive',
          '✓ Tables scroll horizontally on mobile',
          '✓ Pagination works (if applicable)',
          '✓ Sorting works (if applicable)',
          '✓ Filtering works (if applicable)'
        ]
      }
    ]
  },
  buttons: {
    title: 'Buttons & Actions',
    checks: [
      {
        type: 'Create Buttons',
        items: [
          '✓ "Add Product" button works',
          '✓ "Add Client" button works',
          '✓ "Create New Order" button works',
          '✓ "Add Transport Tariff" button works',
          '✓ Buttons open correct modals',
          '✓ Buttons are visible and enabled'
        ]
      },
      {
        type: 'Edit Buttons',
        items: [
          '✓ Edit buttons in tables work',
          '✓ Edit modals open with correct data',
          '✓ Edit buttons are visible',
          '✓ Edit buttons are enabled'
        ]
      },
      {
        type: 'Delete Buttons',
        items: [
          '✓ Delete buttons trigger confirmation',
          '✓ Delete confirmation works',
          '✓ Items are deleted correctly',
          '✓ Delete buttons are visible',
          '✓ Delete buttons are enabled'
        ]
      },
      {
        type: 'Save Buttons',
        items: [
          '✓ Save buttons submit forms',
          '✓ Save buttons show loading state',
          '✓ Success messages appear after save',
          '✓ Forms close after successful save',
          '✓ Save buttons are disabled during save'
        ]
      },
      {
        type: 'Cancel Buttons',
        items: [
          '✓ Cancel buttons close modals',
          '✓ Cancel buttons discard changes',
          '✓ Cancel buttons are visible',
          '✓ Cancel buttons work correctly'
        ]
      },
      {
        type: 'Navigation Buttons',
        items: [
          '✓ Sidebar navigation works',
          '✓ Page links navigate correctly',
          '✓ Back buttons work',
          '✓ Navigation is responsive'
        ]
      }
    ]
  },
  visual: {
    title: 'Visual Elements',
    checks: [
      {
        type: 'Colors & Themes',
        items: [
          '✓ Dark mode works correctly',
          '✓ Light mode works correctly',
          '✓ Theme switcher works',
          '✓ Colors are consistent',
          '✓ Contrast is sufficient'
        ]
      },
      {
        type: 'Icons',
        items: [
          '✓ Icons are visible',
          '✓ Icons are properly sized',
          '✓ Icon colors match theme',
          '✓ Icons are aligned with text'
        ]
      },
      {
        type: 'Typography',
        items: [
          '✓ Fonts load correctly',
          '✓ Text sizes are appropriate',
          '✓ Text is readable',
          '✓ Headings are properly sized',
          '✓ Text wraps correctly'
        ]
      },
      {
        type: 'Spacing',
        items: [
          '✓ Consistent spacing throughout',
          '✓ Padding is appropriate',
          '✓ Margins are consistent',
          '✓ No cramped elements',
          '✓ No excessive whitespace'
        ]
      }
    ]
  }
}

export function printChecklist() {
  console.log('📋 UI Component Visual Checklist\n')
  console.log('='.repeat(70))

  Object.entries(UI_CHECKLIST).forEach(([category, data]) => {
    console.log(`\n${data.title}`)
    console.log('-'.repeat(70))
    
    if (Array.isArray(data.checks)) {
      data.checks.forEach((check: any) => {
        console.log(`\n${check.page || check.breakpoint || check.type || 'General'}:`)
        check.items.forEach((item: string) => {
          console.log(`  ${item}`)
        })
      })
    }
  })

  console.log('\n' + '='.repeat(70))
  console.log('\n✅ Complete this checklist manually or use automated tests')
}
