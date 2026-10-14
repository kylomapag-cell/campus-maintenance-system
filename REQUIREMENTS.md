# SYSTEM REQUIREMENTS DOCUMENT (SRD)
## Campus Maintenance System
**Camarines Sur Polytechnic Colleges (CSPC)**  
*College of Computer Studies*  
*Midterm Project – Round 1: Node.js and Express Web Application*

---

### Project & Team Information
| Attribute | Detail |
| :--- | :--- |
| **System Name** | Campus Maintenance System |
| **Institution** | Camarines Sur Polytechnic Colleges (CSPC) |
| **College** | College of Computer Studies |
| **Course** | BS Information Technology |
| **Date** | September 15, 2026 |
| **Team Members** | **Nicole A. Delloson** (Backend / Routes / Business Logic)<br>**Kyla N. Lomapag** (Frontend / Pages / Forms / UI)<br>**Mary Danielle O. Panit** (Database / Authentication / Testing) |

---

## I. Purpose and Scope
The purpose of the **Campus Maintenance System** is to provide a centralized digital platform for students, faculty, and staff to submit, track, and manage physical facility repair requests across university premises. 

### In-Scope:
- Web-based maintenance request submissions with location pickers (Building, Floor, Room).
- Direct digital photo uploads of damages using mobile phones or computers.
- Role-based authentication and access control (Students, Faculty, Maintenance Technicians, Administrators).
- Automated team dispatch and technician claiming workflow.
- Real-time status tracking (Pending &rarr; In Progress &rarr; Completed &rarr; Cancelled).
- Safety and privacy verification for private campus areas (occupant notification of technician name and official CSPC ID).
- Dedicated inclusive handling for Physical Accessibility Barriers (automatic High-Priority flag).
- Resolution remarks and completion sign-offs by certified maintenance personnel.
- Persistent historical data storage and operational analytics reporting.

### Out-of-Scope:
- Capital construction projects or major architectural renovations.
- Private off-campus facilities or student boarding houses.
- Financial procurement and budget disbursement for purchasing new university assets.

---

## II. Stakeholder List

```
+--------------------------------------------------------------+
|                        PERIPHERAL                            |
|  - Campus Safety & Health Officers (Hazard Risk Assessment)  |
|  - University Finance Officers (Department Budget Tracking)  |
|  +--------------------------------------------------------+  |
|  |                      SECONDARY                         |  |
|  |  - Campus Maintenance Technicians (Execute Work Orders)|  |
|  |  - Facility Operations Managers & IT System Admins     |  |
|  |  +--------------------------------------------------+  |  |
|  |  |                    PRIMARY                       |  |  |
|  |  |  - Students (Report classroom/canteen issues)   |  |  |
|  |  |  - Faculty & Staff (Report office & lab issues)  |  |  |
|  |  +--------------------------------------------------+  |  |
|  +--------------------------------------------------------+  |
+--------------------------------------------------------------+
```

1. **Primary Users:**
   - **Students, Faculty, and Staff**: Individuals who encounter physical problems in classrooms, computer laboratories, comfort rooms, walkways, or common campus areas and submit repair requests.
2. **Secondary Users:**
   - **Campus Maintenance Technicians**: Physical Plant Office (PPO) personnel who claim work orders, conduct physical inspections, execute repairs, and record resolution notes.
   - **Facility Operations Managers & IT Administrators**: Supervisors who oversee campus work order queues, assign specialized personnel, review turnaround times, and manage system access.
3. **Peripheral / External Stakeholders:**
   - **Campus Safety Officers**: Personnel evaluating campus hazard liabilities, physical accessibility compliance, and accident risks.
   - **University Finance Officers**: Administrators monitoring departmental maintenance efficiency and resource consumption.

---

## III. Summary of Interview & Observation Findings

> *Disclaimer: Interview responses were modeled to reflect real-world faculty and student requirements for academic exercises.*

### Guide Interview 1: Faculty Member
- **Interviewee Name / Role**: Dr. Maria Santos, Full-Time Assistant Professor (College of Computer Studies)
- **Date / Time / Location**: Sept 22, 2026 / 2:30 PM / Faculty Center, Room 302
- **Opening Context**: *"Walk me through a typical task when you encounter a facility issue in your classroom or office."*
  - **Answer**: *"When a projector or air conditioner in my room breaks, I have to walk down to the Physical Plant Office, fill out a paper request form, and wait for staff to receive it."*
- **Pain Points**: Paper forms get lost easily; zero real-time status updates; requires physically leaving the classroom during office hours; office is closed after 5:00 PM.
- **Workarounds**: Texting the head maintenance person directly on their personal mobile number or putting a sticky note on broken equipment.
- **Accessibility Obstacles**: PPO office is on the ground floor far from upper-floor classrooms; no way to report issues after 5:00 PM.
- **Direct Quote**: *"I never know if anyone is actually working on the issue until someone randomly shows up two days later."*

### Guide Interview 2: Student
- **Interviewee Name / Role**: Mark Ramirez, 3rd Year Student (BSIT 3E)
- **Date / Time / Location**: Sept 23, 2026 / 10:15 AM / Student Center / Canteen Area
- **Opening Context**: *"Walk me through a typical task when you notice something broken on campus."*
  - **Answer**: *"If a desk is broken or a bathroom sink is leaking, I usually mention it to our class representative or ignore it because I don't know where to submit an official complaint."*
- **Pain Points**: Unclear reporting channels for students; lack of mobile-friendly forms; no visual way to upload photos showing exact damage.
- **Workarounds**: Posting complaints on unofficial student social media groups or writing on physical feedback boards.
- **Accessibility Obstacles**: Students with mobility impairments cannot easily navigate administrative offices to file physical paper slips.
- **Direct Quote**: *"If I could just take a photo of the broken chair and attach the room number on my phone, it would save everyone time."*

---

## IV. Functional Requirements

| ID | Functional Requirement Statement |
| :--- | :--- |
| **FN - 1** | The system shall allow students, faculty, and staff to submit a maintenance request. |
| **FN - 2** | The system shall allow users to enter the description and location (building, floor, room) of the problem. |
| **FN - 3** | The system shall allow the user to take a photo of the reported problem and upload it. |
| **FN - 4** | The system shall record the date and time when a request is submitted. |
| **FN - 5** | The system shall assign a submitted request to the prospective maintenance team/staff. |
| **FN - 6** | The system shall allow the maintenance team to view their assigned requests. |
| **FN - 7** | The system shall allow the maintenance team to update the status of user requests. |
| **FN - 8** | The system allows users to view the current status of their submitted requests. |
| **FN - 9** | The system allows maintenance staff to mark a request as completed with resolution notes. |
| **FN - 10** | The system keeps and saves persistent records of submitted and completed maintenance requests. |

---

## V. Non-Functional Requirements

| ID | Category | Non-Functional Requirement |
| :--- | :--- | :--- |
| **NFR - 1** | **Performance** | The maintenance request page shall load within 3 seconds on campus with standard network conditions. |
| **NFR - 2** | **Usability** | A first-time user shall be able to submit a maintenance request without needing technical assistance. |
| **NFR - 3** | **Accessibility** | The system shall have clear labels, high-contrast indicators, and keyboard accessibility under WCAG 2.1 AA. |
| **NFR - 4** | **Security & Privacy** | The system shall protect user and maintenance records via authenticated sessions and role-based authorization. |
| **NFR - 5** | **Reliability** | The system must persist maintenance tickets in a relational database without data loss upon server restart. |
| **NFR - 6** | **Scalability** | The system shall handle multiple concurrent users and work orders without degradation. |
| **NFR - 7** | **Maintainability** | The system architecture must follow clear MVC separation (Models, Views, Controllers, Routes, Middleware). |

---

## VI. Use Cases

### Use Case 1: Submit a Maintenance Request
- **Actor**: Student, Faculty, or Staff
- **Precondition**: User is registered and logged into the system.
- **Main Flow**:
  1. User navigates to the "Submit Request" page.
  2. System displays the maintenance request form with building dropdowns and categories.
  3. User enters the title, category, building, floor, room, and detailed problem description.
  4. User attaches a photo of the physical damage (optional but recommended).
  5. User marks whether the issue is located in a private room (for IR3 safety protocol).
  6. User clicks "Submit Request".
  7. System validates all required fields, saves the record, and timestamps submission.
  8. System redirects the user to the ticket details page with confirmation message.
- **Exception**:
  - If required fields are missing, system retains entered inputs, highlights missing fields, and displays actionable error messages.
- **Postcondition**:
  - The maintenance request is stored in the database and visible in the Physical Plant dispatch queue.

### Use Case 2: Update Maintenance Request
- **Actor**: Campus Maintenance Staff / Technician
- **Precondition**: A maintenance request has been assigned to or claimed by the technician.
- **Main Flow**:
  1. Maintenance technician logs into the system.
  2. System displays the Technician Workspace with assigned work orders.
  3. Technician selects the maintenance ticket.
  4. System displays the complete ticket details, location, photo, and audit history.
  5. Technician updates the status (e.g., from *Pending* to *In Progress* or *Completed*).
  6. If marking *Completed*, technician enters required resolution remarks.
  7. System saves updated status, completion timestamp, and appends to the audit trail log.
  8. System makes updated status and notes immediately available to the requester and admin.
- **Exception**:
  - If status is marked Completed without resolution notes, system prevents update and prompts for details.
- **Postcondition**:
  - Request record contains updated status and resolution evidence.

### Use Case 3: Check Request Status
- **Actor**: Student, Faculty, or Staff Requester
- **Precondition**: User has previously submitted one or more maintenance requests.
- **Main Flow**:
  1. User logs into the system.
  2. User opens "My Requests" or views their personal dashboard.
  3. System retrieves and displays user's submitted requests with status badges.
  4. User filters by status or searches by keyword.
  5. User selects a ticket to view full details, assigned technician name, CSPC ID, and audit trail.
- **Exception**:
  - If user has no submitted requests, system displays a friendly empty state prompting them to submit one.
- **Postcondition**:
  - User is fully informed on the real-time progress of their repair ticket.

---

## VII. Inclusive Requirements Section

| ID | Category / Lens | Requirement Statement | Justification / Context |
| :--- | :--- | :--- | :--- |
| **IR1** | **Accessibility Needs (Digital)** | The web interface shall support full keyboard navigation (`Tab`, `Enter`), semantic HTML, high color contrast, and screen-reader accessibility under WCAG 2.1 AA standards. | Enables users with visual or motor impairments to navigate, submit, and inspect repair requests independently. |
| **IR2** | **Accessibility Needs (Physical)** | The system shall include an dedicated **"Accessibility Barrier"** category (damaged ramps, broken handrails, elevator outages) that automatically marks the ticket as **High Priority**. | Prevents students and personnel with physical disabilities from being blocked from accessing campus facilities and classrooms. |
| **IR3** | **Gender-Disaggregated User Roles (Safety & Privacy)** | For requests in private areas (comfort rooms, single-occupant faculty offices), the system shall verify and display the assigned personnel's full name, official CSPC Staff ID, and specialization prior to room entry. | Mitigates safety and privacy concerns for campus occupants who may be alone in isolated facilities. |
| **IR4** | **Auditing Data Fields (Non-Discriminatory Data)** | The request and registration forms collect only essential data (room location, CSPC email, preferred name) without requesting gender or honorific titles. | Respects personal identity and complies with data minimization principles. |

---

## VIII. AI Verification Log

| ID | AI Suggested Requirement | Verification Status | Justification / Proof from Field Findings |
| :--- | :--- | :--- | :--- |
| **AI-1** | *"The system shall allow users to take and upload photos of physical damage using their phones."* | **VERIFIED** | **Mark Ramirez (Student):** *"If I could just take a photo of the broken chair and attach the room number on my phone, it would save everyone time."* |
| **AI-2** | *"The system shall send automatic status updates whenever a ticket is pending, in progress, or finished."* | **VERIFIED** | **Dr. Maria Santos (Faculty):** Solves her main complaint that paper slips get lost: *"I never know if anyone is actually working on the issue until someone randomly shows up two days later."* |
| **AI-3** | *"The system shall provide dropdown lists for campus buildings, floors, and rooms."* | **VERIFIED** | **Field Observation:** Prevents users from typing ambiguous locations, ensuring maintenance staff locate damaged fixtures rapidly. |
| **AI-4** | *"The system shall require students to scan their fingerprint or face before submitting a request."* | **REJECTED** | Too complicated and intrusive. Creates barriers during urgent situations and collects unnecessary biometric data when institutional login suffices. |
| **AI-5** | *"The system shall track maintenance staff's live GPS location on a campus map all day."* | **REJECTED** | Unnecessary invasion of worker privacy. The campus is walkable, and clear ticket status progression provides all needed accountability. |
| **AI-6** | *"The system shall let users scan QR code stickers on classroom doors to fill in room details automatically."* | **UNVERIFIED** | Useful future improvement, but CSPC classrooms do not yet have standardized system QR codes posted on doorframes. |

---

## IX. System Architecture & Entity-Relationship Schema

```
+-------------------------------------------------------------+
|                            USERS                            |
+-------------------------------------------------------------+
| id             : INTEGER PRIMARY KEY AUTOINCREMENT          |
| name           : TEXT NOT NULL                              |
| email          : TEXT UNIQUE NOT NULL                       |
| password       : TEXT NOT NULL (bcrypt hashed)              |
| role           : TEXT CHECK (student, faculty, staff, admin)|
| department     : TEXT                                       |
| staff_id       : TEXT (e.g., CSPC-TECH-101)                 |
| specialization : TEXT                                       |
| created_at     : DATETIME DEFAULT CURRENT_TIMESTAMP         |
+-------------------------------------------------------------+
                              | 1
                              |
                              | has many
                              v N
+-------------------------------------------------------------+
|                    MAINTENANCE_REQUESTS                     |
+-------------------------------------------------------------+
| id               : INTEGER PRIMARY KEY AUTOINCREMENT        |
| ticket_number    : TEXT UNIQUE NOT NULL                     |
| user_id          : INTEGER NOT NULL (FK -> users.id)        |
| title            : TEXT NOT NULL                            |
| category         : TEXT NOT NULL                            |
| building         : TEXT NOT NULL                            |
| floor            : TEXT NOT NULL                            |
| room             : TEXT NOT NULL                            |
| is_private_area  : INTEGER DEFAULT 0                        |
| description      : TEXT NOT NULL                            |
| photo_url        : TEXT                                     |
| priority         : TEXT NOT NULL (Low, Normal, High, Urgent)|
| status           : TEXT NOT NULL (Pending, In Progress, ...) |
| assigned_to      : INTEGER (FK -> users.id)                 |
| resolution_notes : TEXT                                     |
| assigned_at      : DATETIME                                 |
| completed_at     : DATETIME                                 |
| created_at       : DATETIME DEFAULT CURRENT_TIMESTAMP       |
| updated_at       : DATETIME DEFAULT CURRENT_TIMESTAMP       |
+-------------------------------------------------------------+
                              | 1
                              |
                              | has many
                              v N
+-------------------------------------------------------------+
|                        REQUEST_LOGS                         |
+-------------------------------------------------------------+
| id         : INTEGER PRIMARY KEY AUTOINCREMENT              |
| request_id : INTEGER NOT NULL (FK -> maintenance_requests.id|
| user_id    : INTEGER (FK -> users.id)                       |
| action     : TEXT NOT NULL                                  |
| details    : TEXT                                           |
| created_at : DATETIME DEFAULT CURRENT_TIMESTAMP             |
+-------------------------------------------------------------+
```
