# Approval System

A leave approval management system built with NestJS and MySQL, designed for WeChat Mini Programs.

## Description

This is a backend service for managing employee leave applications and approvals with multi-level approval workflows.

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Project Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd approval-system-new
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=your_database_host
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=approval_system
DB_CONNECTION_LIMIT=10

# WeChat Configuration (optional)
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

5. Set up the database:

- Create a MySQL database named `approval_system`
- Run your database migrations/schema setup

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

### Other Commands

```bash
# Standard start
npm run start

# Debug mode
npm run start:debug

# Format code
npm run format

# Lint code
npm run lint
```

## API Endpoints

### Health Check

- `GET /health` - Check application and database health

### User Management

- `GET /user/detail` - Get current user details (requires registration)
- `POST /user/register` - Register a new user
- `POST /user/update` - Update user information
- `GET /user/department-list` - Get list of departments

### Leave Applications

- `GET /leave/applications` - Get user's leave applications
- `GET /leave/pending-approvals` - Get pending approvals for current user
- `GET /leave/application-details/:id` - Get detailed application information
- `POST /leave/apply` - Submit a new leave application
- `POST /leave/approve` - Approve or reject a leave application

### Headers Required

All authenticated endpoints require:

- `x-wx-openid`: WeChat user OpenID

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Features

- Multi-level approval workflow
- Role-based access control (Employee, Department Manager, Manager)
- Leave type support (Annual, Sick, Personal, Marriage, Maternity, Funeral)
- Transaction-safe database operations
- Input validation and error handling
- Health check endpoint
- Graceful shutdown support
- Environment-based configuration

## Security Considerations

- Database credentials are stored in environment variables (never commit `.env` file)
- Input validation using class-validator
- SQL injection protection through parameterized queries
- Transaction rollback on errors
- Proper error handling and logging

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database credentials
3. Build the application: `npm run build`
4. Start with: `npm run start:prod`
5. Use a process manager like PM2 for production:

```bash
npm install -g pm2
pm2 start dist/main.js --name approval-system
```

## Project Structure

```
src/
├── common/              # Shared utilities
│   ├── filters/        # Exception filters
│   ├── guards/         # Authorization guards
│   ├── interceptors/   # Response interceptors
│   └── middleware/     # Custom middleware
├── config/             # Configuration files
│   ├── configuration.ts
│   └── env.validation.ts
├── leave/              # Leave management module
│   ├── controllers/    # API controllers
│   ├── dto/           # Data transfer objects
│   ├── services/      # Business logic
│   └── types.ts       # Type definitions
├── app.module.ts      # Root module
├── database.ts        # Database connection
└── main.ts           # Application entry point
```

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL 5.7
- **Validation**: class-validator, class-transformer
- **ORM**: mysql2 (direct connection pool)

## License

UNLICENSED
