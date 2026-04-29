# HR Management System — Frontend

A modern HR Leave Management System built with **Next.js 15** and **React**, designed to streamline employee leave requests and HR administration.

> 🔗 Backend API: [hr-management-api](https://github.com/rojarasheed/hr-management-api)  
> 🚀 Live Demo: https://hr-management-frontend-opal.vercel.app/

---

## Features

- 🔐 **Authentication** — JWT-based login with role-based access (Admin / Employee)
- 📊 **Dashboard** — Stats overview with approved leaves chart by department
- 👥 **Employees** — Full CRUD with search and department filter
- 🏢 **Departments** — Manage departments with employee count
- 📝 **Leave Requests** — Apply, approve, reject with status tracking
- 📋 **Leave Types** — Configure leave types with days allowed per year
- 📄 **PDF Export** — Download leave reports as PDF (admin only)
- 🎨 **Responsive UI** — Clean dashboard interface with Tailwind CSS

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | React framework with App Router |
| React 19 | UI components |
| Tailwind CSS | Styling |
| Axios | API communication |
| React Hook Form | Form handling |
| Recharts | Dashboard charts |
| date-fns | Date formatting |
| js-cookie | Cookie management |

---

## Getting Started

### Prerequisites
- Node.js v18+
- Backend API running ([setup guide](https://github.com/rojarasheed/hr-management-api))

### Installation

```bash
# Clone the repository
git clone https://github.com/rojarasheed/hr-management-frontend.git
cd hr-management-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@hr.com | password |
| Employee | ahmed@hr.com | password |
| Employee | sara@hr.com | password |
| Employee | john@hr.com | password |

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_API_URL=your-backend-url`
4. Deploy

---

## Related

- 🔗 [Backend API (Laravel)](https://github.com/rojarasheed/hr-management-api)

---

## Author

**Roja Rasheed**  
Senior Full Stack Developer — UAE  
[GitHub](https://github.com/rojarasheed)
