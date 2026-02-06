# Store Inventory Module

A comprehensive inventory management system built with Next.js, React, and TypeScript. This application manages the complete Procure-to-Pay (P2P) cycle including purchase requisitions, purchase orders, goods receipts, and stock management.

## Features

### Core Functionality
- **Purchase Requisition Management** - Create and approve purchase requests
- **Purchase Order Processing** - Generate and approve purchase orders
- **Goods Receipt Management** - Record incoming inventory
- **Stock Management** - Track inventory levels and issue stock
- **Dashboard & Analytics** - Visual overview of procurement metrics
- **Comprehensive Reporting** - Detailed registers for all transactions

### Technical Features
- Modern React 19 with TypeScript
- Responsive UI with Tailwind CSS and Radix UI components
- Real-time data visualization with Recharts
- Supabase integration for data persistence
- AI-powered chatbot assistance
- QR code generation for inventory tracking

## Tech Stack

- **Framework**: Next.js 15.5.9
- **Language**: TypeScript
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Database**: Supabase
- **Charts**: Recharts
- **AI Integration**: Vercel AI SDK with OpenAI
- **Package Manager**: pnpm

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── *-screen.tsx      # Feature screens
│   └── *.tsx             # Other components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── scripts/              # Database scripts
├── styles/               # Additional styles
└── utils/                # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inventory_Module
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Database Setup**
   Run the SQL scripts in the `scripts/` directory to set up your Supabase database tables.

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Main Workflow

1. **Create Purchase Requisition** - Submit requests for items needed
2. **PR Approval** - Review and approve purchase requisitions
3. **Create Purchase Order** - Generate orders from approved PRs
4. **PO Approval** - Approve purchase orders for procurement
5. **Create Goods Receipt** - Record received items
6. **View Stock Levels** - Monitor current inventory
7. **Issue Stock** - Distribute items from inventory
8. **Reports** - Access dashboards and detailed registers

### Key Components

- **Dashboard Screen** - Visual analytics and metrics
- **Register Screens** - Detailed transaction histories
- **Creation Screens** - Forms for creating new records
- **Approval Screens** - Workflow approval interfaces

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Database Schema

The application uses the following main tables:
- `purchase_requisitions` - PR records and items
- `purchase_orders` - PO records and items  
- `goods_receipts` - GR records and items
- `stock` - Current inventory levels

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

© **2026** Designed by **Sundram Pandey** - **Uttam Innovative Solution Pvt. Ltd.**

## Support

For support and inquiries, please contact **Uttam Innovative Solution Pvt. Ltd.**