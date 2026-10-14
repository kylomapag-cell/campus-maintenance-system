# CSPC Campus Maintenance System
**Midterm Project – Round 1: Node.js and Express Web Application**  
*Camarines Sur Polytechnic Colleges (CSPC) – College of Computer Studies*

---

## 📋 1. Project Description
The **Campus Maintenance System** is a centralized digital web application designed for students, faculty, and administrative staff across Camarines Sur Polytechnic Colleges (CSPC). The system replaces slow, prone-to-loss physical paper request forms and informal communication with a structured, transparent, and mobile-friendly platform.

Users can submit repair requests with damage photographs, track real-time ticket progress, and verify assigned maintenance staff credentials. Facilities Operations Managers and Physical Plant technicians can dispatch personnel, claim work orders, update repair statuses, record technical resolution notes, and inspect campus maintenance efficiency analytics.

---

## 👥 2. Team Members & Responsibilities
| Member Name | Student Email | Suggested Primary Responsibility | Key Contributions |
| :--- | :--- | :--- | :--- |
| **Nicole A. Delloson** | `nicole.delloson@my.cspc.edu.ph` | Backend / Routes / Business Logic | Express server routing, controllers (`requestController`, `staffController`, `adminController`), Multer file uploads, and status workflows. |
| **Jesel Mae C. Gorobao** | `jeselmae.gorobao@my.cspc.edu.ph` | System Testing / Quality Assurance | Automated test suite development, test cases, defect verification, and rubric compliance auditing. |
| **Kyla N. Lomapag** | `kyla.lomapag@my.cspc.edu.ph` | Frontend / Pages / Forms / UI | EJS templates, Bootstrap 5 responsive UI, client-side photo previews, location dropdowns, accessibility styling (WCAG 2.1 AA), and status badges. |
| **Mary Danielle O. Panit** | `marydanielle.panit@my.cspc.edu.ph` | Database / Authentication / Security | SQLite database schema & migrations, bcrypt password security, session access control middleware, seed datasets, and user models. |

---

## 🏫 3. Assigned System
- **System**: Campus Maintenance System
- **Context**: Camarines Sur Polytechnic Colleges (CSPC), Nabua, Camarines Sur
- **Target Users**: CSPC Students, Academic Faculty, Physical Plant Technicians, and Facility Operations Administrators.

---

## ✨ 4. Key Features

### Requester Portal (Students & Faculty)
- **Digital Ticket Submission (FN-1, FN-2)**: Report broken fixtures, projectors, water leaks, or furniture with detailed descriptions.
- **Location Selector (AI-3 / FN-2)**: Dropdown lists for campus buildings (Faculty Center, Science Bldg, Engineering Bldg, Student Center, Library, Gym, Admin Bldg) with floor and room selectors.
- **Visual Photo Evidence (FN-3 / AI-1)**: Upload damage photographs directly from mobile devices or computers with instant client-side preview.
- **Automated Submission Timestamps (FN-4)**: Every request records exact submission timestamps and status progression in an audit trail.
- **Ticket Tracking & Search (FN-8)**: Filter personal tickets by status (Pending, In Progress, Completed) and search by keywords or ticket IDs.
- **Physical Accessibility Barrier Auto-Escalation (IR2)**: Selecting *Accessibility Barrier* automatically escalates the ticket to **High Priority**.
- **Occupant Safety & Verification Protocol (IR3)**: For tickets filed in private areas (comfort rooms, isolated offices), the system prominently verifies and displays the assigned technician's full name, official CSPC Staff ID (`CSPC-TECH-101`), and specialty prior to room entry.

### Maintenance Staff Portal (Technicians)
- **Technician Workspace (FN-6)**: View all active work orders assigned to the logged-in technician.
- **Unassigned Ticket Claiming**: Claim tickets from the open campus queue with automatic transition to *In Progress*.
- **Status Updates & Resolution Notes (FN-7, FN-9)**: Update repair statuses with compulsory resolution remarks and recorded completion timestamps.

### Command Center (Facility Operations & IT Admin)
- **Centralized Dispatch (FN-5)**: Dispatch and reassign maintenance personnel according to trade specialization.
- **Role-Based Access Control (RBAC)**: Manage campus users and assign roles (`student`, `faculty`, `staff`, `admin`) with protection against self-demotion.
- **Analytics & Facility Reports**: High-level KPIs including total requests, completion rates, average turnaround hours, and incident distributions across campus buildings.

---

## 🛠️ 5. Technologies Used
- **Runtime**: Node.js (v18.0+)
- **Server Framework**: Express.js (v5.x)
- **Template Engine**: EJS (Embedded JavaScript)
- **Database**: SQLite via `better-sqlite3` (zero-configuration, persistent relational storage)
- **Authentication**: `express-session` with secure cookies & `bcryptjs` password hashing
- **File Uploads**: `multer` with file-type validation and size restrictions (5MB limit)
- **Frontend / Styling**: Bootstrap 5.3, Bootstrap Icons, Google Font 'Inter', custom accessible CSS (WCAG 2.1 AA)
- **Version Control**: Git & GitHub with conventional commit format

---

## 📂 6. Project Structure
```
campus-system/
├── config/
│   ├── db.js                 # SQLite database initialization, schema, & auto-seeding
│   └── seed.js               # Standalone database reset and re-seed utility
├── controllers/
│   ├── authController.js     # User registration, authentication, profile
│   ├── requestController.js  # Requester ticket submissions, details, tracking
│   ├── staffController.js    # Technician claiming, status progression, notes
│   └── adminController.js    # Admin dispatch, user RBAC, facility analytics
├── middleware/
│   ├── authMiddleware.js     # Session guard & role authorization (RBAC)
│   └── uploadMiddleware.js   # Multer image upload & file validation
├── models/
│   ├── userModel.js          # User queries, registration, credentials
│   └── requestModel.js       # Ticket CRUD, filtering, logs, analytics
├── public/
│   ├── css/
│   │   └── style.css         # Accessible styling, status badges, timelines
│   ├── js/
│   │   └── main.js           # Live image preview, room suggestions, demo autofill
│   ├── images/samples/       # Pre-built SVG sample defect photos
│   └── uploads/              # Storage directory for user-uploaded photos
├── routes/
│   ├── authRoutes.js         # /login, /register, /logout, /profile
│   ├── requesterRoutes.js    # /dashboard, /requests/new, /requests, /requests/:id
│   ├── staffRoutes.js        # /staff/dashboard, /staff/requests/:id/*
│   └── adminRoutes.js        # /admin/dashboard, /admin/requests, /admin/users, /admin/reports
├── views/
│   ├── partials/             # header.ejs, footer.ejs, alerts.ejs
│   ├── auth/                 # login.ejs, register.ejs
│   ├── requester/            # dashboard.ejs, new-request.ejs, my-requests.ejs, request-details.ejs
│   ├── staff/                # dashboard.ejs (technician workspace)
│   ├── admin/                # dashboard.ejs, requests.ejs, users.ejs, reports.ejs
│   ├── profile.ejs           # User profile & password management
│   ├── 404.ejs               # Not found error page
│   └── 500.ejs               # Server error page
├── tests/
│   └── test-system.js        # Automated integration and access control tests
├── .env.example              # Environment variables template (no secrets)
├── .gitignore                # Git ignore configuration
├── app.js                    # Express application entry point
├── package.json              # Project dependencies and npm scripts
├── REQUIREMENTS.md           # Verbatim System Requirements Document
├── LICENSE                   # MIT License
└── README.md                 # Complete project documentation
```

---

## ⚙️ 7. Installation & Setup Instructions

### Prerequisites
- Node.js installed (v18.0 or newer recommended)
- Git installed

### 1. Clone or Open the Project Directory
```bash
cd campus-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the provided `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Contents of `.env`:
```ini
PORT=3000
NODE_ENV=development
SESSION_SECRET=cspc_campus_maintenance_secure_session_key_2026
DB_PATH=campus_maintenance.db
```

### 4. Database Initialization & Seeding
The SQLite database automatically initializes its schema and seeds demo accounts on first run. If you ever want to perform a clean database reset and re-seed:
```bash
npm run seed
```

---

## 🚀 8. How to Run the Application

### Start the Server:
```bash
npm start
```

Open your web browser and navigate to:
```
http://localhost:3000
```

### Run Automated System Tests:
```bash
npm test
```

---

## 🔑 9. Test Accounts (Pre-Seeded)
The system is pre-populated with realistic campus accounts representing every role:

| Role | Name | Institutional Email | Password | Details / Specialty |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Engr. Armando Gomez | `admin@cspc.edu.ph` | `AdminPass123!` | Facility Operations Manager |
| **Technician (Staff)** | Juan Dela Cruz | `tech.cruz@cspc.edu.ph` | `TechPass123!` | ID: `CSPC-TECH-101` (Electrical & AV) |
| **Technician (Staff)** | Ricardo Santos | `tech.santos@cspc.edu.ph` | `TechPass123!` | ID: `CSPC-TECH-102` (Plumbing & Civil) |
| **Faculty Member** | Dr. Maria Santos | `maria.santos@cspc.edu.ph` | `FacultyPass123!` | Assistant Professor (CCS, Rm 302) |
| **Student** | Mark Ramirez | `mark.ramirez@my.cspc.edu.ph` | `StudentPass123!` | 3rd Year BSIT 3E |
| **Student** | Kyla Lomapag | `kyla.lomapag@my.cspc.edu.ph` | `StudentPass123!` | 3rd Year BSIT 3E |

> 💡 *Note: The login page includes convenient **one-click demo login buttons** to easily switch between roles during evaluation and showcase defense!*

---

## 🛡️ 10. Security & Access Control
- **Session Management**: Authenticated HTTP-only cookies prevent client-side script access.
- **Password Protection**: All passwords are encrypted with `bcrypt` (10 salt rounds).
- **URL Bypass Prevention**: Direct attempts by regular students or faculty to visit `/admin/*` or `/staff/*` are intercepted by `requireRole` middleware and redirected with security warning alerts.
- **Input Validation**: Required fields, email formats, text length limits, and file MIME types are strictly enforced before storage.
- **Secrets Protection**: All database keys and session secrets are stored in `.env` and omitted from Git via `.gitignore`.

---

## ⚠️ 11. Known Limitations
1. **SMS / Push Notifications**: Real-time notifications are currently delivered within the web application dashboard and audit history rather than cellular SMS.
2. **Door QR Code Scanning**: While room location pickers are dynamic, physical door QR codes have not yet been posted campus-wide by administration (marked UNVERIFIED in Requirements Log AI-6).
3. **Offline Sync**: Requires an active campus WiFi or internet connection to upload photos and fetch updates.

---

## 🤖 12. AI Assistance Disclosure
In compliance with Section 20 of the Midterm Project Guidelines:
- **Tool Used**: Antigravity / Gemini AI Coding Assistant.
- **Scope of Use**: Assisting in structuring MVC architectural scaffolding, drafting initial requirements based on interview findings (verified in the AI Verification Log in `REQUIREMENTS.md`), and generating SVG placeholder illustrations for demo seed records.
- **Team Verification**: Every route handler, database model, validation check, and view was thoroughly audited, tested, and verified by team members Nicole Delloson, Kyla Lomapag, and Mary Danielle Panit.

---

## 📜 13. License
This project is open-source under the [MIT License](LICENSE).
