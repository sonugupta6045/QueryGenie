# QueryGenie 🧞‍♂️

**AI-Powered Natural Language to SQL Query Engine**

QueryGenie is a secure, reusable microservice that translates natural language questions into validated, read-only SQL queries. It executes them against a connected PostgreSQL database and returns results as structured data, auto-generated charts, and plain-English explanations.

## 🚀 Features

- **Natural Language to SQL:** Ask questions in plain English and let Google Gemini AI generate the SQL for you.
- **Dynamic Schema Discovery:** Connect any PostgreSQL database. QueryGenie automatically introspects your schema—no hardcoding required.
- **Strict SQL Safety Validator:** Defense-in-depth security. QueryGenie uses static analysis to block DML/DDL (INSERT/UPDATE/DELETE/DROP) and executes queries using read-only database roles.
- **Multi-Tenant Architecture:** Securely register multiple independent data sources. Each connection is isolated with encrypted credentials.
- **Auto-Charting & Insights:** Results are automatically converted into the most appropriate chart types (Bar, Line, Pie) alongside plain-English summaries.
- **Secure by Default:** Credentials are encrypted using AES-256-GCM. API access is secured via JWT and rate-limiting.

## 🛠️ Technology Stack

- **Backend:** Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, PostgreSQL, Flyway, MapStruct, Lombok, Redis
- **Frontend:** React 18 + TypeScript, Vite, Redux Toolkit, React Query, Material UI, TailwindCSS, Recharts
- **AI/LLM:** Google Gemini API
- **Caching & Rate Limiting:** Redis (Upstash)

## 📦 Getting Started (Local Development)

### Prerequisites
- Java 17
- Node.js 18+
- Docker (optional, for running local DB/Redis)

### 1. Environment Variables Setup
Create a `.env` file in the root directory (make sure it's added to `.gitignore`). Ensure you have the following configured:

```env
# Database Credentials
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=postgres
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_URL=jdbc:postgresql://your_db_host:5432/postgres

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_SSL=true

# Security & AI Secrets
JWT_SECRET=your_long_random_string_for_jwt
ENCRYPTION_KEY=your_base64_encoded_32_byte_aes_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Running the Backend
The backend is a Spring Boot application.
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Running the Frontend
The frontend is built with React and Vite.
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:8080`.

## 🚢 Deployment

QueryGenie is containerized and ready for production deployment.

- **Backend:** Configured with a multi-stage `Dockerfile` and ready for deployment on platforms like Render, Railway, or AWS.
- **Frontend:** Optimized for deployment on Vercel or Netlify. Ensure `VITE_API_URL` is set to your deployed backend URL.

## 🔒 Security Architecture

- **No Hardcoded Secrets:** `application.yml` dynamically pulls from secure environment variables. Codebase is clean of sensitive data.
- **Role-Based Access Control:** Separate roles for Super Admins, Data Source Admins, and Analysts.
- **Audit Logging:** Every query generated and executed is fully logged for auditability.

## 📄 License

This project is licensed under the MIT License.
