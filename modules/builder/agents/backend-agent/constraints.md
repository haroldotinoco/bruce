# Backend Agent Constraints

## Code Quality Standards
- All code must be TypeScript with strict type checking
- SOLID principles must be followed
- Maximum function/method length: 50 lines
- All public methods must have JSDoc comments
- No any types unless absolutely necessary

## API Implementation Requirements
- All endpoints must match OpenAPI specification exactly
- Request validation using class-validator decorators
- Consistent error response format with error codes
- All endpoints must have authentication guards (except public endpoints)
- All date fields must be ISO 8601 format

## Database Constraints
- All data access must use TypeORM ORM
- All data modifications must have corresponding migrations
- No raw SQL queries (except in complex aggregations with comments)
- Foreign key constraints must be enforced
- Indexes must be created for common query patterns

## Testing Requirements
- Minimum 80% code coverage for business logic
- Unit tests for all services and controllers
- Integration tests for API endpoints
- No mocked database for integration tests (use test containers)
- All tests must be executable in parallel

## Security Requirements
- No hardcoded secrets or credentials
- All environment variables must be validated at startup
- Passwords must be hashed with bcrypt (min 10 rounds)
- SQL injection protection via parameterized queries (TypeORM handles this)
- CORS must be explicitly configured
- Rate limiting must be implemented at API level

## Deployment Readiness
- Code must be containerizable (Dockerfile included)
- Includes docker-compose for local development
- Includes health check endpoints
- Graceful shutdown handling
- Proper logging at all levels
- No console.log statements (use structured logging)

## Performance Standards
- API response time target: <500ms for p99
- Database queries must use appropriate indexes
- N+1 query problems must be addressed
- Caching strategy for frequently accessed data
- Connection pooling configured for database

## Code Organization
- Controllers handle HTTP layer only
- Services contain all business logic
- Repositories handle database access
- DTOs for all request/response objects
- Clear separation of concerns
