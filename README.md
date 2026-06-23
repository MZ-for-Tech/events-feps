# FEPS Events Hub

Official Events Management and Academic Reporting Portal for the Faculty of Economics and Political Science (FEPS), Cairo University.

Made by **MZ**.

## Features
- **Event Management:** Comprehensive CRUD operations for academic events, seminars, board meetings, and conferences, with support for Active/Archived and Draft/Published states.
- **Multilingual Support:** Full English, Arabic, and French localization via `next-intl`. RTL support is automatically applied for Arabic.
- **Academic Editorial Design System:** A rigorous design system based on the Amiri serif font, featuring academic card metaphors, Feps Gold/Navy branding, and strict vertical rhythm.
- **Automated Academic Reports:** Generate highly-formatted, bidi-compliant PDF reports mimicking official university documents using `@react-pdf/renderer`.
- **Role-Based Access Control:** Secure portal access managed via NextAuth (Superadmin, Manager, Editor) governing event, user, and log management.
- **Event Surveys & Analytics:** Customizable feedback forms per event with dedicated administrative analytics dashboards.
- **FEPS Trivia Module:** An interactive quiz gamification feature with state-machine logic and dynamic, shareable scorecards generated via HTML5 Canvas.
- **Google Calendar Integration:** Automatic generation of localized `.ics` events enabling users to directly add events to their personal calendars.
- **Audit Logs:** Complete system traceability tracking all significant user actions for system accountability.
- **Social Sharing:** Universal sharing module for spreading events across social media platforms.
- **Responsive Architecture:** Fully mobile-responsive with a collapsible desktop sidebar and mobile drawer navigation.

## Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS with custom FEPS editorial design system
- **Authentication:** NextAuth.js
- **PDF Generation:** React-PDF

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup environment variables: Create a `.env` file with `NEXTAUTH_SECRET`, etc.
4. Run migrations: `npx prisma db push`
5. Start development server: `npm run dev`

## License
**Proprietary and Confidential.** Copyright (c) 2026 Faculty of Economics and Political Science, Cairo University. Unauthorized copying, modification, or distribution is strictly prohibited.
