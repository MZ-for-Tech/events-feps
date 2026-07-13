# FEPS Events Hub

Official Events Management and Academic Reporting Portal for the Faculty of Economics and Political Science (FEPS), Cairo University.

Made by **MZ**.

---

## 🚀 Key Features

* **Event Management:** Comprehensive CRUD operations for academic events, seminars, board meetings, and conferences, with support for Active/Archived and Draft/Published states.
* **Event Registration & Attendance Verification:**
  - Secure registration requiring a **Credit Hour Code (7 digits)** or a **National ID (14 digits)**.
  - Controls to open/close registration periods manually prior to event archiving.
  - Survey enforcement: only verified attendees can submit feedback evaluations.
* **SMTP Email Broadcast (Nodemailer & Gmail):**
  - Instant admin option to broadcast feedback invitations to all registered attendees.
  - Automatic, secure delivery of personalized verification codes to attendees' emails via Gmail SMTP.
* **Excel Spreadsheet Exporting:**
  - Fast, styled Excel exports (`.xlsx`) of attendee lists directly from the admin registration tab.
* **Multilingual Support:** Full English, Arabic, and French localization via `next-intl`. RTL support is automatically applied for Arabic.
* **Academic Editorial Design System:** A rigorous design system based on the Amiri serif font, featuring academic card metaphors, Feps Gold/Navy branding, and strict vertical rhythm.
* **Automated Academic Reports:** Generate highly-formatted, bidi-compliant PDF reports mimicking official university documents using `@react-pdf/renderer` with dynamic registration stats.
* **Custom Confirm & Alert Modals:** Fully custom, centered popup dialogues with backdrop-blur overlays, completely replacing default browser alerts for a premium UX.
* **Role-Based Access Control:** Secure portal access managed via NextAuth (Superadmin, Manager, Editor) governing event, user, and log management.
* **Event Surveys & Analytics:** Customizable feedback forms per event with dedicated administrative analytics dashboards.
* **FEPS Trivia Module:** An interactive quiz gamification feature with state-machine logic and dynamic, shareable scorecards generated via HTML5 Canvas.
* **Google Calendar Integration:** Automatic generation of localized `.ics` events enabling users to directly add events to their personal calendars.
* **Audit Logs:** Complete system traceability tracking all significant user actions for system accountability.
* **Social Sharing:** Universal sharing module for spreading events across social media platforms.
* **Responsive Architecture:** Fully mobile-responsive with a collapsible desktop sidebar and mobile drawer navigation.

---

## 🛠️ Tech Stack
- **Framework:** Next.js App Router (Turbopack)
- **Database:** PostgreSQL (Production) / SQLite (Local) with Prisma ORM
- **Email Transporter:** Nodemailer with Gmail SMTP (Secure App Passwords)
- **Spreadsheet Generation:** SheetJS (`xlsx`)
- **Styling:** Vanilla CSS & Tailwind CSS with custom FEPS editorial design system
- **Authentication:** NextAuth.js
- **PDF Generation:** React-PDF

---

## ⚙️ Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables in a `.env` file:
   ```env
   # NextAuth
   AUTH_SECRET="your_secret"
   AUTH_URL="http://localhost:3000"

   # Database
   DATABASE_URL="postgresql://..."

   # Gmail SMTP for Nodemailer
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-google-app-password-16-chars"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

---

## 📄 License
**Proprietary and Confidential.** Copyright (c) 2026 Faculty of Economics and Political Science, Cairo University. Unauthorized copying, modification, or distribution is strictly prohibited.
