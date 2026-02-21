# IEEE-Docs-Evaluator

An AI-powered, web-based platform for the centralized submission and automated evaluation of software engineering documents — specifically **SRS**, **SDD**, **STD**, and **SPMP** — built for students and teachers at Cebu Institute of Technology - University.

---

## 📌 Overview

IEEE Docs Evaluator consolidates four separate AI-driven document evaluator systems into a single integrated application. It eliminates redundant workflows (e.g., separate logins per system) and provides a unified environment for document submission, AI-powered analysis, and teacher feedback — all in one place.

---

## ✨ Features

- **Google OAuth 2.0** — Secure role-based login for teachers and students
- **Google Drive Integration** — Class folder creation and document storage
- **Google Sheets Integration** — Automated recording of submissions, AI results, and teacher feedback
- **AI-Powered Evaluation** — Document analysis using Gemini, OpenAI GPT, or OpenRouter models
- **Role-Based Access** — Separate dashboards and permissions for teachers and students
- **Centralized Submission Portal** — Submit and track SRS, SDD, STD, and SPMP documents in one place

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Spring Boot (Java) |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0 + JWT |
| Storage | Google Drive API |
| Spreadsheet | Google Sheets API |
| AI Providers | Gemini API, OpenAI API, OpenRouter API |
| PDF Parsing | Apache PDFBox |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
IEEE-Docs-Evaluator/
├── Frontend/          # React.js + Vite application
└── Backend/
    └── docs-evaluator/ # Spring Boot application
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+) and npm
- Java 17+
- Maven
- A Google Cloud project with the following APIs enabled:
  - Google OAuth 2.0
  - Google Drive API
  - Google Sheets API
- API keys for at least one AI provider (Gemini, OpenAI, or OpenRouter)
- A Supabase project (PostgreSQL)

---

### Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

### Backend Setup

```bash
cd Backend/docs-evaluator
mvn spring-boot:run
```

---

## 👥 User Roles

### Teacher
- Upload a class list (CSV/XLSX) to register students
- Create and manage Google Drive folders per document type
- View all student submissions and their AI evaluation results
- Provide manual scores and written feedback

### Student
- Submit documents (SRS, SDD, STD, SPMP) via Google Drive link
- Trigger AI evaluation on submitted documents
- View AI evaluation results (scores, strengths, weaknesses, feedback)
- View teacher scores and feedback

---


## 👨‍💻 Proponents

Groups 2, 3, 6, and 11 — IT411 Capstone and Research 2 (G01 + G02)
College of Computer Studies, Cebu Institute of Technology - University
AY 2025–2026, 2nd Semester

| Name |
|---|
| Bustamante, William |
| Cantiller, Christian Jayson |
| Diva, Justin Andry |
| Dy, Jivonz |
| Flores, E.J. Boy |
| Fuentes, Japeth Luke |
| Gabiana, Nicolo Francis |
| Go, Felix Christian |
| Lada, Nathan Xander |
| Laborada, John Joseph |
| Lapure, Jessie Noel |
| Lawas, Jose Raphael |
| Mendoza, Jenelyn |
| Oswa, Yusuf |
| Pepito, John Patrick |
| Perales, Clint |
| Saniel, Mitchel Gabrielle |
| Verano, Joel |
| Ygot, Dante |

**Adviser:** Sir Ralph P. Laviste

---

## 📄 License

This project is developed as an academic requirement for IT411 at Cebu Institute of Technology - University. All rights reserved by the respective proponents.