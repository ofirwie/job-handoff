# Job Handover System - Backend

A realistic, form-based job handover system backend built with Node.js, Express, and Supabase. This system focuses on practical workflow management rather than "magic" auto-detection features.

## Features

### Core Functionality
- **Role-based Authentication** - JWT-based auth with employee/manager/admin roles
- **Template System** - Customizable handover templates for different job roles
- **Form-based Data Entry** - Structured forms for collecting handover information
- **Task Management** - Track completion of handover tasks with file path storage
- **Approval Workflow** - Manager review and approval system
- **File Path Storage** - Store paths to SharePoint/network files, not actual files

### User Flows
1. **Employee Flow**: Load template → Fill forms → Complete tasks → Submit for review
2. **Manager Flow**: Review submissions → Approve/reject with notes → Manage team handovers
3. **Admin Flow**: Manage templates → View all handovers → System administration

## Architecture

### Backend (Node.js/Express)
- **Database**: Supabase (PostgreSQL) with 4 core tables (users, templates, handovers, handover_tasks)
- **Authentication**: JWT tokens with role-based access control
- **API**: RESTful endpoints for all operations
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, rate limiting, bcrypt password hashing

### Database Schema
```sql
users: id, email, password_hash, name, role, department, manager_id
templates: id, target_role, sections, tasks, is_active
handovers: id, employee_id, manager_id, template_id, status, form_data
handover_tasks: id, handover_id, description, is_completed, file_path, notes
```

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- Supabase account and project
- npm or yarn

### Backend Setup
1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
- Create a new Supabase project
- Run the SQL from `database/supabase-schema.sql` in your Supabase SQL editor
- Get your project URL and service role key

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase URL, keys, and JWT secret
```

5. Start development server:
```bash
npm run dev
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Change password

#### Employee Routes
- `GET /api/employee/welcome` - Load template for user's role
- `POST /api/employee/handovers/start` - Start new handover
- `GET /api/employee/handovers/:id` - Get handover details
- `PUT /api/employee/handovers/:id/step/:step` - Save form data
- `GET /api/employee/handovers/:id/tasks` - Get tasks
- `PUT /api/employee/tasks/:id/complete` - Mark task complete
- `POST /api/employee/handovers/:id/submit` - Submit for review

#### Manager Routes
- `GET /api/manager/dashboard` - Manager dashboard
- `GET /api/manager/handovers/:id` - Review handover
- `POST /api/manager/handovers/:id/approve` - Approve handover
- `POST /api/manager/handovers/:id/reject` - Reject handover
- `GET /api/manager/team` - Get team members

#### Template Management (Admin)
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

#### Handover Management
- `GET /api/handovers` - List handovers (filtered by role)
- `GET /api/handovers/:id` - Get handover details
- `GET /api/handovers/statistics` - Get statistics

## Project Philosophy

This system follows a **realistic engineering approach**:

✅ **What we built:**
- Form-based data collection
- File path storage (not file uploads)
- Template-driven workflow
- Manual task completion tracking
- Role-based access control
- Standard approval workflow

❌ **What we avoided:**
- "Magic" auto-detection features
- Complex file parsing
- AI-powered content extraction
- Overly ambitious automation
- Fantasy specifications that require massive engineering effort

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/         # Database configuration
├── middleware/     # Auth, validation, error handling
├── routes/         # API endpoint handlers
├── utils/          # Logging and utilities
├── database/       # Schema and migrations
└── server.js       # Express app entry point
```

### Key Design Decisions
1. **Supabase** for reliable data storage with proper relationships and built-in auth
2. **JWT Authentication** for stateless API access
3. **Express Validator** for robust input validation
4. **Winston Logging** for proper audit trails
5. **Role-based Authorization** middleware for security
6. **Transaction Support** for data consistency

## Production Deployment

### Environment Variables
Required for production:
- `NODE_ENV=production`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `JWT_SECRET` (strong random string)
- `CORS_ORIGIN` (your frontend URL)

### Database Setup
1. Create production Supabase project
2. Run schema: Execute `database/supabase-schema.sql`
3. Configure Row Level Security policies
4. Seed initial data if needed

### Security Checklist
- [ ] Strong JWT secret
- [ ] Supabase service key secured
- [ ] Row Level Security policies enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Supabase backups configured

## Contributing

This project prioritizes **practical functionality** over ambitious features. When contributing:

1. Focus on real business value
2. Keep complexity manageable
3. Prefer proven patterns over new experiments
4. Write tests for critical functionality
5. Document realistic limitations

## License

MIT License - see LICENSE file for details.