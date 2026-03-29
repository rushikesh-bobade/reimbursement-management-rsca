# Reimbursement Management System

A comprehensive, multi-tier expense tracking and approval system built with modern technologies.

## Platform Overview

The **Reimbursement Management System** is a standout expense tracking and approval platform featuring a powerful **State-Machine Approval Engine** that handles sequential, condition-based expense routing. Key features include:

- **State-Machine Approval Engine**: Sequential, condition-based expense routing (e.g., routing from Manager → Finance based on percentage rules or specific roles)
- **Multi-Currency Support**: Seamless handling of multiple currencies
- **Local OCR Receipt Scanning**: Tesseract.js for local receipt parsing and data extraction

## Tech Stack

### Core Framework
- **Next.js** (App Router) with **TypeScript** for type-safe development

### Database & ORM
- **PostgreSQL** for reliable data storage
- **Prisma ORM** for strict database management (No BaaS)

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **Shadcn UI** components with Stitch UI rendering

### Form Management
- **React Hook Form** for efficient form state management
- **Zod** for schema validation (shared schemas for frontend/backend consistency)

### External Integrations
- **restcountries.com** for country and region data
- **exchangerate-api.com** for real-time currency exchange rates

### Bonus Technology
- **Tesseract.js** for local OCR receipt parsing

## Project Structure

```
reimbursement-management-rsca/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── expenseController.js
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── employeeMiddleware.js
│   ├── models/
│   │   ├── Company.js
│   │   ├── Expense.js
│   │   ├── ExpenseCategory.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── expenseRoutes.js
│   └── validators/
│       ├── createUserSchema.js
│       ├── expenseSchema.js
│       ├── loginSchema.js
│       └── signupSchema.js
```

## Features

### Expense Management
- Create, track, and manage expense submissions
- Multi-currency expense support
- Receipt scanning and OCR processing
- Expense categorization

### Approval Workflow
- State-machine based approval engine
- Role-based routing (Manager, Finance, Admin approval chains)
- Conditional routing rules based on expense amounts and categories
- Approval history and audit trails

### User Management
- Multi-tier user roles (Employee, Manager, Finance, Admin)
- Company-based user organization
- Authentication and authorization

### Admin Dashboard
- Company and user management
- System configuration and monitoring
- Approval workflow management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rushikesh-bobade/reimbursement-management-rsca.git
cd reimbursement-management-rsca
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory with the following:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/reimbursement_db
JWT_SECRET=your_jwt_secret_key
RESTCOUNTRIES_API=https://restcountries.com/v3.1
EXCHANGERATE_API_KEY=your_api_key
```

4. Set up the database:
```bash
npm run db:setup
```

5. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Expenses
- `GET /api/expenses` - Retrieve expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/companies` - List all companies
- `POST /api/admin/users` - Create user

## Architecture Highlights

### State-Machine Approval Engine
The approval engine uses a state-based approach to route expenses through the approval chain:
- **Submitted** → **Manager Review** → **Finance Review** → **Approved/Rejected**
- Conditional routing based on predefined rules
- Support for parallel and sequential approval flows

### Multi-Currency Support
- Real-time exchange rate validation
- Currency conversion for reporting
- Multi-currency balance tracking

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Admin middleware for protected routes

## Contributing

Please follow the coding standards and submit pull requests to the main branch.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
