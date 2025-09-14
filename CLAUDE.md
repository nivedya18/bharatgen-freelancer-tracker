# BharatGen Freelancer Task Management System

## Project Overview

The **BharatGen Freelancer Task Management System** is a comprehensive React-based web application designed to manage freelance language services projects. It provides task tracking, payment management, analytics, and professional invoicing capabilities specifically tailored for language experts and linguists.

## Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.3.3
- **Styling**: Tailwind CSS 3.4.4
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Form Management**: React Hook Form 7.62.0 + Zod 4.1.3 validation
- **Charts**: Recharts 3.1.2
- **PDF Generation**: jsPDF 3.0.2 + jspdf-autotable 5.0.2
- **Excel Export**: xlsx 0.18.5
- **Icons**: Lucide React 0.542.0
- **Date Handling**: date-fns 4.1.0

## Application Architecture

### Database Schema (Supabase)

#### 1. `master` Table (Main Tasks)
```sql
- id: string (primary key)
- task_group: string | null
- task_description: string
- model: string ('Text LLM', 'TTS', 'ASR', 'Others')
- language: string (16 Indian languages supported)
- freelancer_name: string
- freelancer_id: string | null
- freelancer_type: 'Linguist' | 'Language Expert'
- pay_rate_per_day: number
- total_time_taken: number
- start_date: string
- completion_date: string
- created_at: string
- updated_at: string
```

#### 2. `freelancers` Table
```sql
- id: string (primary key)
- name: string
- freelancer_type: 'Linguist' | 'Language Expert' | null
- language: string[] | null (supports multiple languages)
- created_at: string
- updated_at: string
```

#### 3. `rate_card` Table
```sql
- id: string (primary key)
- freelancer_type: 'Linguist' | 'Language Expert'
- group_type: 'Group A' | 'Group B'
- rate: number
- created_at: string
- updated_at: string
```

## Core Features

### 1. Task Management
- **Task Creation**: Intelligent form with auto-population and validation
- **Task Editing**: In-line editing with modal interface
- **Task Filtering**: Multi-criteria filtering (date range, freelancer, language, model, type, search)
- **Task Analytics**: Visual expenditure tracking by language and model

### 2. Freelancer Management
- **Freelancer Profiles**: Add, edit, and manage freelancer information
- **Language Assignment**: Associate freelancers with specific languages
- **Type Classification**: Linguist vs Language Expert categorization
- **Rate Card Integration**: Automatic rate application based on freelancer type and group

### 3. Financial Management
- **Rate Card System**: 4-tier rate structure (Linguist/Expert × Group A/B)
- **Payment Calculation**: Automatic calculation based on `pay_rate_per_day × total_time_taken`
- **Invoice Generation**: Professional PDF invoices with company branding
- **Export Capabilities**: Excel exports with summary statistics

### 4. Analytics Dashboard
- **Expenditure Charts**: Bar and pie charts for language-wise and model-wise spending
- **Data Visualization**: Interactive charts with hover details and Indian currency formatting
- **Summary Statistics**: Total tasks, payments, days, unique freelancers, and languages

## Application Structure

### Main Components

#### App.tsx
- Main application component with tab-based navigation
- Three primary tabs: Form, Dashboard, Invoice
- Central state management for filters and active tab

#### TaskForm.tsx (src/components/TaskForm.tsx)
- Complex form with intelligent field auto-population
- Real-time validation using Zod schema
- Auto-completion date calculation based on start date and time taken
- Rate card integration for automatic pricing
- Freelancer management integration

#### TaskTable.tsx (src/components/TaskTable.tsx)
- Sortable and paginated data table
- In-line editing capabilities
- Excel export functionality
- Task deletion with confirmation

#### InvoiceGenerator.tsx (src/components/InvoiceGenerator.tsx)
- Professional PDF invoice generation
- Date range filtering for billing periods
- Task aggregation by freelancer
- Company branding integration

### Supporting Components

#### Filter Components
- **FilterPanel.tsx**: Multi-criteria filtering interface
- **MultiSelectCombobox.tsx**: Advanced multi-select dropdown
- **Combobox.tsx**: Single-select dropdown with search

#### Chart Components
- **ExpenditureChart.tsx**: Configurable bar and pie charts with Indian currency formatting

#### Modal Components
- **AddFreelancerModal.tsx**: New freelancer creation
- **EditFreelancerModal.tsx**: Freelancer profile editing
- **EditTaskModal.tsx**: Task editing interface
- **ManageFreelancersModal.tsx**: Bulk freelancer management
- **RateCardModal.tsx**: Rate card configuration

### Hooks

#### useFreelancerTasks.ts (src/hooks/useFreelancerTasks.ts)
- Task CRUD operations
- Advanced filtering with Supabase queries
- Real-time data fetching and caching
- Unique value extraction for filters

#### useFreelancers.ts (src/hooks/useFreelancers.ts)
- Freelancer management operations
- Duplicate prevention logic
- Sorted freelancer lists

#### useRateCard.ts (src/hooks/useRateCard.ts)
- Rate card management
- 4-tier rate structure handling
- Upsert operations for rate updates

### Utilities

#### excelExport.ts (src/utils/excelExport.ts)
- Advanced Excel generation with formatting
- Summary sheet with statistics
- Indian date and currency formatting
- Column width optimization

#### invoicePdf.ts (src/utils/invoicePdf.ts)
- Professional PDF invoice creation
- Company branding integration
- Detailed task breakdowns
- Bank details and payment terms

### Type Definitions

#### src/types/index.ts
- **TaskFormData**: Form validation interface
- **FilterState**: Filter criteria structure
- **ChartData**: Chart visualization data
- **InvoiceData**: Invoice generation data structure

#### src/schemas/taskSchema.ts
- Comprehensive Zod validation schema
- Auto-completion date validation
- Required field validation with custom error messages

## Supported Languages
The application supports 16 Indian languages:
- Assamese, Bengali, English, Gujarati, Hindi, Kannada
- Maithili, Malayalam, Marathi, Nepali, Odia, Punjabi
- Sanskrit, Sindhi, Tamil, Telugu

## Supported Models
- Text LLM
- TTS (Text-to-Speech)
- ASR (Automatic Speech Recognition)
- Others

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

Required environment variables in `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migrations

Located in `supabase/migrations/`:
- `20250904182543_remote_schema.sql`: Initial schema setup
- `20250904182830_rename_freelancer_tasks_to_master.sql`: Table rename
- `20250904183413_add_foreign_key_master_freelancers.sql`: Relationship setup
- `20250904183739_improve_freelancer_trigger.sql`: Trigger improvements

## Key Business Logic

### Payment Calculation
```typescript
const totalPayment = pay_rate_per_day * total_time_taken;
```

### Auto-completion Date
```typescript
const completionDate = addDays(new Date(startDate), Math.ceil(totalTimeTaken));
```

### Rate Card Structure
- 4 tiers: Linguist Group A/B, Language Expert Group A/B
- Automatic rate application based on freelancer type
- Configurable through admin interface

## Security Notes
- No authentication layer implemented (direct access model)
- Supabase RLS ready for future security implementation
- Environment-based configuration for sensitive data

## User Workflows

### Adding a Task
1. Navigate to "Add Task" tab
2. Fill form with task details
3. Select freelancer (auto-populates type and languages)
4. System auto-calculates completion date and payment
5. Submit with validation

### Generating Invoice
1. Navigate to "Invoice" tab
2. Select freelancer and date range
3. Review task list and totals
4. Generate professional PDF invoice

### Viewing Analytics
1. Navigate to "Dashboard" tab
2. Apply filters as needed
3. View expenditure charts by language and model
4. Export data to Excel for further analysis

## Future Enhancement Opportunities
- User authentication and role-based access
- Email integration for invoice delivery
- Advanced reporting and analytics
- Mobile app companion
- API for third-party integrations
- Automated payment tracking
- Multi-currency support
- Advanced project management features