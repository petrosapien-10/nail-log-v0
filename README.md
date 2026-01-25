# Nail Log

A modern salon management system built with Next.js, featuring employee time tracking, ticket management, salary calculations, and comprehensive reporting.

## 🚀 Live Demo

**Deployment URL**:  
👉 https://nail-log-v0-outdb7a8l-nhutlong-nguyens-projects.vercel.app

> Test credentials provided in the [Testing Guide](#testing-the-application) below.

## Features

- **Employee Check-in/Check-out**: Track working hours with precise time management
- **Ticket Management**: Record services with multiple payment methods (Cash, Card, Treatwell, Gift Card)
- **Automated Salary Calculation**:
  - Basic salary based on working hours
  - Shared bonus from ticket income
  - Daily bonus with configurable thresholds
- **Admin Dashboard**:
  - View all employees and their sessions
  - Manage salon income, expenses, and profitability
  - Date range filtering with detailed reporting
- **Employee Profiles**: Manage employee information, salary rates, and bonus configurations
- **Multi-language Support**: English and Vietnamese
- **History Logging**: Track all system activities with timestamps

## Tech Stack

- **Framework**: Next.js 15.2.8 (App Router)
- **UI Library**: Material-UI (MUI) 6.4.8
- **State Management**: Redux Toolkit with RTK Query
- **Backend**: Firebase (Authentication + Firestore)
- **Animations**: Framer Motion
- **Date Handling**: Day.js
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://gitlab.com/nord-hub/nail-log.git
   cd nail-log
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Initial Setup & Authentication Flow

The application uses a two-tier authentication system designed for salon operations:

**Step 1: Admin Login (Owner Access)**

1. Click the **"Admin"** tab in the navigation bar
2. An admin login modal will appear
3. Enter the following test credentials:
   - **Email**: `test-user@gmail.com`
   - **Password**: `test-password`
4. Click "Sign in" to access the admin dashboard

**Step 2: Set Dashboard Password**

1. Once in the admin page, navigate to the **Password** menu
2. Create a new dashboard password (e.g., "1234")
3. This password will be used by employees to access the Dashboard
4. Click "Save" to confirm

**Step 3: Access Dashboard (Employee Access)**

1. Click the **"Home"** tab in the navigation bar
2. Enter the dashboard password you just created
3. You now have access to the employee dashboard

**Why This Design?**

This two-tier system serves a practical purpose:

- **Dashboard Password**: Simple password that employees can use for daily operations (check-in, tickets, check-out)
- **Admin Access**: Secure Firebase authentication for owners to manage employees, view reports, and control settings
- **Security & Convenience**: Employees only need to know one simple password, while sensitive operations require full admin authentication
- **Operational Flexibility**: The dashboard works independently - employees can continue working even if the admin is not logged in

### Testing Features

**Dashboard (Employee View)**:

- Check-in employees from the employee list
- Add tickets with multiple payment methods
- Edit check-in/check-out times
- Mark tickets as bonus tickets
- Check-out employees and view salary calculations

**Admin Panel**:

- **Profiles**: Add, edit, or delete employees with custom salary rates and bonus configurations
- **Sessions**: View all employee sessions with date range filtering
- **Reports**: Analyze salon income, expenses, and profitability
- **History**: Track all system activities with detailed logs

### Key Test Scenarios

**Employee Management**:

- Navigate to Admin → Profiles
- Add a new employee with salary and bonus rates
- Edit employee information
- Upload/remove employee avatars

**Session Management**:

- Check in an employee on Dashboard
- Add multiple tickets with different payment methods
- Mark tickets as bonus tickets
- Edit check-in/check-out times
- Check out employee and verify salary calculations

**Financial Reporting**:

- Select different date ranges
- View salon income breakdown by payment method
- Check shared bonus and daily bonus calculations
- Add expenses and track net profit

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard and employee management
│   ├── dashboard/       # Main employee dashboard
│   ├── api/            # API routes
│   ├── components/     # Shared components
│   ├── hooks/          # Custom hooks and context
│   └── store/          # Redux store and RTK Query
├── locales/            # i18n translations
├── theme/              # MUI theme configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## Deployment

The application is deployed on [Vercel](https://vercel.com). Vercel automatically builds and deploys the application when changes are pushed to the main branch.

To deploy your own instance:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## License

Private project - All rights reserved.
