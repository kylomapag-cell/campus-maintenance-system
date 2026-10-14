# ROUND 1 SHOWCASE & DEFENSE PREPARATION GUIDE
## Campus Maintenance System – Camarines Sur Polytechnic Colleges
**Team G10**: Nicole A. Delloson, Kyla N. Lomapag, Mary Danielle O. Panit, Jesel Mae C. Gorobao

---

### Part 1 – Project Introduction (Presenters: All Members)
- **System Name**: Campus Maintenance System
- **Problem Being Addressed**:
  - Faculty (Dr. Maria Santos) must walk all the way to the Physical Plant Office to fill out physical paper forms that easily get lost, with no real-time status updates, and the office is closed after 5:00 PM.
  - Students (Mark Ramirez) lack an official mobile reporting channel to report damaged fixtures (broken chairs, leaking washbasins, hazardous ramp railings) and cannot attach visual photo evidence.
- **Target Users**: CSPC Students, Academic Faculty, Physical Plant Maintenance Technicians, and Facility Operations Administrators.
- **Main Purpose**: Provide a centralized, mobile-responsive web platform to submit repair requests with photos, route tickets to technicians, track live resolution status, enforce occupant safety in private areas, and maintain persistent historical records.

---

### Part 2 – Requirements & Architecture (Presenter: Nicole Delloson / Mary Panit)
- **Primary Stakeholders**: Students, Faculty, Staff.
- **Secondary Stakeholders**: Maintenance Technicians (PPO), Facility Operations Managers.
- **Peripheral Stakeholders**: Campus Safety Officers (evaluating hazard risks), University Finance Officers.
- **Major Functional Requirements (FN-1 to FN-10)**:
  - `FN-1` & `FN-2`: Web-based submission with building, floor, and room selector.
  - `FN-3`: Damage photo upload via Multer with live preview.
  - `FN-4`: Automatic submission timestamp and log history.
  - `FN-5`: Centralized technician dispatch by Admin.
  - `FN-6`: Dedicated Technician Workspace for assigned tickets.
  - `FN-7` & `FN-9`: Status progression (In Progress &rarr; Completed) with mandatory resolution notes.
  - `FN-8`: User tracking dashboard with search and status filters.
  - `FN-10`: Persistent SQLite database storage.
- **Inclusive Requirements**:
  - `IR1`: Digital accessibility (WCAG 2.1 AA keyboard navigation, contrast, skip link).
  - `IR2`: Accessibility Barriers automatically marked **High Priority**.
  - `IR3`: Private Area occupant safety (displays assigned technician name and official CSPC ID `CSPC-TECH-101` before room entry).
  - `IR4`: Non-discriminatory data collection (no gender or title fields required).

---

### Part 3 – System Demonstration (Major End-to-End Workflow)
1. **Submit Request**:
   - Log in as Student `mark.ramirez@my.cspc.edu.ph` (`StudentPass123!`).
   - Click **Submit Request**. Select Category: *Accessibility Barrier*.
   - Notice the automatic banner and priority escalation to **High Priority** (IR2).
   - Select Building: *Science Building*, Floor: *Ground Floor*, Room: *Main Front Entrance Ramp*.
   - Attach photo and submit. Ticket `CMS-2026-XXXX` is generated.
2. **Assign / Claim Ticket**:
   - Log in as Technician `tech.cruz@cspc.edu.ph` (`TechPass123!`).
   - Open **Technician Workspace**. Notice the new ticket in the **Unassigned Pool**.
   - Click **Claim Ticket**. The ticket moves to "My Assigned Tasks" and status switches to *In Progress*.
3. **Execute & Complete Work Order**:
   - Click **Update Status**. Set status to *Completed*.
   - Enter resolution notes: *"Re-welded loose bracket and replaced anchor screws on entrance ramp."*
   - Submit update. Completion timestamp and notes are logged to the audit trail.
4. **Requester Verification**:
   - Switch back to student account. View ticket to see *Completed* badge and technician's resolution remarks.

---

### Part 4 – Access Control & Unauthorized Access Attempt
- **Demonstration Steps**:
  1. Log in as a regular student (`mark.ramirez@my.cspc.edu.ph`).
  2. Manually type the administrator URL into the browser: `http://localhost:3000/admin/dashboard` or `http://localhost:3000/admin/users`.
  3. **Result**: The `requireRole(['admin'])` middleware immediately halts the request, redirects the user back to their authorized dashboard, and displays a prominent security alert:
     > *"Access Denied. Your account role (student) is not authorized to view that administrative page."*
  4. Manually type `http://localhost:3000/staff/dashboard`.
  5. **Result**: Intercepted by `requireRole(['staff', 'admin'])` and redirected with access denied warning.
  6. Log out. Attempt to visit `http://localhost:3000/dashboard` directly without a session.
  7. **Result**: Intercepted by `requireAuth` and redirected to `/login` with prompt *"Please log in to access this page."*

---

### Part 5 – Individual Defense Questions & Answers

#### Nicole A. Delloson (Backend / Routes / Business Logic)
- **What feature did you develop?**  
  *I implemented the Express route architecture, request dispatching logic, and the controller layer (`requestController.js`, `staffController.js`, and `adminController.js`), as well as the Multer multipart photo upload handling.*
- **Why was it implemented that way?**  
  *Using MVC separation ensures business logic is completely isolated from presentation templates and database drivers, making the application scalable, testable, and maintainable.*
- **Which routes handle your contributions?**  
  *`POST /requests/new`, `GET /requests/:id`, `POST /staff/requests/:id/status`, and `POST /admin/requests/:id/assign`.*
- **What problems were encountered and how were they solved?**  
  *Handling file upload failures when a user submitted empty or invalid photos. I implemented custom Multer diskStorage with mime-type filters and ensured photos are stored with unique timestamped filenames to prevent collisions.*

#### Kyla N. Lomapag (Frontend / Pages / Forms / UI)
- **What feature did you develop?**  
  *I designed and developed the responsive EJS view templates, Bootstrap 5 UI, the client-side JavaScript utilities (`main.js`), and inclusive accessibility features under WCAG 2.1 AA.*
- **Why was it implemented that way?**  
  *Students and faculty frequently report facility issues from smartphones. The mobile-first layout with instant client-side photo previews, dynamic room datalists, and accessible focus rings ensures any user can file a report under 60 seconds.*
- **Where are your UI components located?**  
  *In `views/requester/`, `views/staff/`, `views/admin/`, `public/css/style.css`, and `public/js/main.js`.*
- **How did you satisfy Inclusive Requirement IR3?**  
  *When a ticket is flagged as a private area (e.g. comfort rooms), I designed a specialized Safety Badge card in `request-details.ejs` that prominently displays the assigned technician's photo badge, full name, and official CSPC ID number (`CSPC-TECH-101`) to protect occupant privacy before room entry.*

#### Mary Danielle O. Panit (Database / Authentication / Testing)
- **What feature did you develop?**  
  *I implemented the database schema using SQLite (`better-sqlite3`), bcryptjs password hashing, session management, role-based access control middleware (`authMiddleware.js`), and the automated test suite (`tests/test-system.js`).*
- **Where is the data stored?**  
  *In `campus_maintenance.db` with relational tables: `users`, `maintenance_requests`, and `request_logs`. Foreign keys and WAL (Write-Ahead Logging) are enabled for transaction integrity.*
- **How does authentication and access control work?**  
  *User passwords are salted and hashed with bcrypt (10 rounds). When logged in, user data is serialized to an HTTP-only express session. The `requireRole()` middleware inspects `req.session.user.role` before executing protected route handlers.*
- **How are automated tests executed?**  
  *Run `npm test`, which validates database connections, password security, duplicate prevention, IR2 high-priority auto-escalation, and status audit transitions.*

---

### Part 6 – Evidence-Based Counterpart Critique Framework
When evaluating your paired team's implementation, structure your critique using the **ORE-I-R formula**:
1. **Observation**: State the exact feature or behavior observed during testing.
2. **Evidence**: Reference specific page routes, inputs entered, or error logs.
3. **Impact**: Explain how this affects students, faculty, or system security.
4. **Recommendation**: Provide a constructive, technical solution.

*Example Critique*:
> **Observation**: Non-admin users were able to access the admin user management table by typing `/admin/users` directly.  
> **Evidence**: Logged in with student account `student@cspc.edu.ph` and navigated to `http://localhost:3000/admin/users`. The page loaded with user records.  
> **Impact**: Violates Section 6 (Access Control), allowing regular students to view other accounts and escalate privileges.  
> **Recommendation**: Wrap admin routes with a `requireRole(['admin'])` middleware that checks `req.session.user.role` and redirects unauthorized users with an HTTP 403 or flash warning.
