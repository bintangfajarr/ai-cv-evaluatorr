# AI CV Evaluator - API Documentation

Backend API system untuk evaluasi CV kandidat dan project reports menggunakan Large Language Models (LLMs).

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`

---

## Table of Contents

- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Get Current User](#get-current-user)
  - [Get All Users](#get-all-users)
- [Evaluation](#evaluation)
  - [Upload Files](#upload-files)
  - [Trigger Evaluation](#trigger-evaluation)
  - [Get Result](#get-result)
- [Setup & Installation](#setup--installation)
- [Error Codes](#error-codes)

---

## Authentication

### Register

Membuat akun user baru.

- **Metode**: POST
- **URL**: `/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "STRING (3-50 chars)",
  "email": "STRING (valid email)",
  "password": "STRING (min 6 chars)"
}
```

- Jika registrasi berhasil, server akan mengembalikan respons:
  - **Status Code**: 201
  - **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user",
        "created_at": "2025-01-20T10:30:00Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- Jika username sudah digunakan, server akan mengembalikan respons:
  - **Status Code**: 409
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Username already exists"
  }
  ```

- Jika email sudah digunakan, server akan mengembalikan respons:
  - **Status Code**: 409
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Email already exists"
  }
  ```

- Jika validasi gagal, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Username, email, and password are required"
  }
  ```

---

### Login

Autentikasi user dan mendapatkan JWT token.

- **Metode**: POST
- **URL**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "STRING",
  "password": "STRING"
}
```

- Jika login berhasil, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- Jika kredensial salah, server akan mengembalikan respons:
  - **Status Code**: 401
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Invalid credentials"
  }
  ```

- Jika field kosong, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Username and password are required"
  }
  ```

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

---

### Get Current User

Mendapatkan informasi user yang sedang login.

- **Metode**: GET
- **URL**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

- Jika request berhasil, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
  ```

- Jika token tidak ada, server akan mengembalikan respons:
  - **Status Code**: 401
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "No token provided"
  }
  ```

- Jika token invalid, server akan mengembalikan respons:
  - **Status Code**: 401
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Invalid token"
  }
  ```

- Jika token expired, server akan mengembalikan respons:
  - **Status Code**: 401
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Token expired"
  }
  ```

---

### Get All Users

Mendapatkan daftar semua user (Admin only).

- **Metode**: GET
- **URL**: `/auth/users`
- **Headers**: `Authorization: Bearer <token>`

- Jika request berhasil, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "is_active": true,
        "created_at": "2025-01-15T08:00:00Z"
      },
      {
        "id": 2,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user",
        "is_active": true,
        "created_at": "2025-01-20T10:30:00Z"
      }
    ]
  }
  ```

- Jika user bukan admin, server akan mengembalikan respons:
  - **Status Code**: 403
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Insufficient permissions"
  }
  ```

---

## Evaluation

### Upload Files

Upload CV dan project report untuk evaluasi.

- **Metode**: POST
- **URL**: `/upload`
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body**:
  - `full_name`: STRING (required)
  - `email`: STRING (required)
  - `cv`: FILE (PDF/DOCX/TXT, max 10MB, required)
  - `project_report`: FILE (PDF/DOCX/TXT, max 10MB, required)

- Jika upload berhasil, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "success": true,
    "candidate_id": 123,
    "message": "Files uploaded successfully"
  }
  ```

- Jika format file tidak valid, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Invalid file type. Only PDF, DOCX, and TXT allowed"
  }
  ```

- Jika field kosong, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "full_name and email are required"
  }
  ```

- Jika file tidak ada, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Both cv and project_report files are required"
  }
  ```

- Jika file terlalu besar, server akan mengembalikan respons:
  - **Status Code**: 413
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "File size exceeds 10MB limit"
  }
  ```

**Supported Formats:**
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

---

### Trigger Evaluation

Memulai proses evaluasi (asynchronous).

- **Metode**: POST
- **URL**: `/evaluate`
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "candidate_id": 123
}
```

- Jika evaluasi berhasil dimulai, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "queued"
  }
  ```

- Jika candidate_id tidak ada, server akan mengembalikan respons:
  - **Status Code**: 400
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "candidate_id is required"
  }
  ```

- Jika candidate tidak ditemukan, server akan mengembalikan respons:
  - **Status Code**: 404
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Candidate not found"
  }
  ```

**Catatan:**
- Proses evaluasi berjalan di background
- Waktu proses: 2-4 menit
- Gunakan evaluation ID untuk cek status

---

### Get Result

Mendapatkan status dan hasil evaluasi.

- **Metode**: GET
- **URL**: `/result/:id`
- **Headers**: `Authorization: Bearer <token>`
- **URL Parameter**: `id` = Evaluation UUID

- Jika status queued, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "queued"
  }
  ```

- Jika status processing, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing"
  }
  ```

- Jika evaluasi selesai, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "result": {
      "cv_match_rate": 0.82,
      "cv_feedback": "Strong in backend and cloud, limited AI integration experience.",
      "cv_scores": {
        "technical_skills": 4.5,
        "experience_level": 4.0,
        "achievements": 3.5,
        "cultural_fit": 4.0
      },
      "project_score": 7.5,
      "project_feedback": "Meets prompt chaining requirements, lacks error handling robustness.",
      "project_scores": {
        "correctness": 4.0,
        "code_quality": 4.0,
        "resilience": 3.5,
        "documentation": 4.0,
        "creativity": 3.0
      },
      "overall_summary": "Good candidate fit, would benefit from deeper RAG knowledge."
    }
  }
  ```

- Jika evaluasi gagal, server akan mengembalikan respons:
  - **Status Code**: 200
  - **Response Body**:
  ```json
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "failed",
    "error": "LLM call failed after 3 attempts: Rate limit exceeded"
  }
  ```

- Jika evaluation tidak ditemukan, server akan mengembalikan respons:
  - **Status Code**: 404
  - **Response Body**:
  ```json
  {
    "success": false,
    "message": "Evaluation not found"
  }
  ```

**Score Breakdown:**

**CV Scores (1-5 scale):**
- `technical_skills` (Weight: 40%) - Backend, databases, APIs, cloud, AI/LLM
- `experience_level` (Weight: 25%) - Years and project complexity
- `achievements` (Weight: 20%) - Impact and measurable outcomes
- `cultural_fit` (Weight: 15%) - Communication and teamwork

**Project Scores (1-5 scale):**
- `correctness` (Weight: 30%) - Meets requirements
- `code_quality` (Weight: 25%) - Clean, modular, tested
- `resilience` (Weight: 20%) - Error handling and retries
- `documentation` (Weight: 15%) - README clarity
- `creativity` (Weight: 10%) - Extra features

**Polling Recommendation:**
- Poll setiap 5 detik
- Timeout setelah 10 menit
- Stop polling saat status = completed atau failed

---

## Setup & Installation

### Prerequisites

- Node.js 20.x or higher
- Docker Desktop
- OpenRouter API key
- Git

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd ai-cv-evaluator

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env dengan API key Anda

# 4. Start Docker services
docker-compose up -d

# 5. Initialize database
node scripts/createTables.js
node scripts/createUsersTable.js

# 6. Seed vector database
node scripts/seedVectorDB.js

# 7. Start API server (Terminal 1)
npm run dev

# 8. Start worker (Terminal 2)
npm run worker:dev
```

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cv_evaluator
DB_USER=postgres
DB_PASSWORD=postgres123

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenRouter
OPENROUTER_API_KEY=your_api_key_here
LLM_MODEL=mistralai/mistral-7b-instruct:free
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=2000

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

---

## Error Codes

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request berhasil |
| 201 | Created | Resource berhasil dibuat |
| 400 | Bad Request | Input tidak valid |
| 401 | Unauthorized | Token tidak ada/invalid |
| 403 | Forbidden | Tidak punya permission |
| 404 | Not Found | Resource tidak ditemukan |
| 409 | Conflict | Duplicate resource |
| 413 | Payload Too Large | File > 10MB |
| 500 | Internal Server Error | Server error |

---


```

