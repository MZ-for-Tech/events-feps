# FEPS Events Hub

Official Events Management and Academic Reporting Portal for the Faculty of Economics and Political Science (FEPS), Cairo University.

## Features
- **Event Management:** Comprehensive CRUD operations for academic events, seminars, board meetings, and conferences.
- **Multilingual Support:** Full English, Arabic, and French localization via `next-intl`.
- **Automated Academic Reports:** Generate highly-formatted, bidi-compliant PDF reports mimicking official university documents using `@react-pdf/renderer`.
- **Role-Based Access Control:** Secure portal access managed via NextAuth (Superadmin, Manager, Editor).
- **Responsive Architecture:** Fully mobile-responsive with a collapsible desktop sidebar and mobile drawer navigation.
- **PWA Ready:** Installable as a Progressive Web App on mobile and desktop devices.

## Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS v4 with custom FEPS editorial design system
- **Authentication:** NextAuth.js
- **PDF Generation:** React-PDF

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup environment variables: Create a `.env` file with `DATABASE_URL`, `NEXTAUTH_SECRET`, etc.
4. Run migrations: `npx prisma db push`
5. Start development server: `npm run dev`

## License
**Proprietary and Confidential.** Copyright (c) 2026 Faculty of Economics and Political Science, Cairo University. Unauthorized copying, modification, or distribution is strictly prohibited.
