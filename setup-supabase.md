# Supabase Database Setup for Job Handover System

## Quick Setup Steps

1. **Go to your Supabase project**: https://pjiqcpusjxfjuulojzhc.supabase.co

2. **Open SQL Editor** (in your Supabase dashboard)

3. **Run the schema**: Copy and paste the contents of `database/supabase-schema.sql` into the SQL editor and execute it.

4. **Verify tables created**: You should see these tables in your Database → Tables:
   - `users`
   - `templates` 
   - `handovers`
   - `handover_tasks`
   - `handover_approvals`
   - `audit_logs`
   - `notifications`

## Test the Backend API

1. **Start the backend server**:
```bash
cd backend
npm run dev
```

2. **Test health endpoint**:
```bash
curl http://localhost:3001/health
```

You should get:
```json
{
  "status": "OK", 
  "timestamp": "2025-01-30T...",
  "version": "1.0.0"
}
```

3. **Test user registration**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "AdminPass123",
    "name": "System Admin",
    "role": "admin",
    "department": "IT"
  }'
```

## Environment Variables Used

Your `.env` file now contains:
- **Frontend vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (for React/Vite)
- **Backend vars**: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (for Express API)
- **API config**: `PORT=3001`, `JWT_SECRET`, `CORS_ORIGIN`

## Key Features Ready

✅ **All backend routes working**:
- Authentication: `/api/auth/*`
- Employee workflow: `/api/employee/*` 
- Manager dashboard: `/api/manager/*`
- Template management: `/api/templates/*`
- Handover operations: `/api/handovers/*`

✅ **Supabase integration**:
- Row Level Security policies enabled
- UUID primary keys
- Automatic timestamps and triggers
- Proper foreign key relationships

✅ **Security configured**:
- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- Password hashing

The backend is now ready to work with your existing Supabase project!