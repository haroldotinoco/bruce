# Builder Module Build Policy

## Technology Stack Standards

### Backend Stack
- Framework: NestJS (Node.js)
- Language: TypeScript (strict mode)
- Runtime: Node.js 18+ LTS
- Package Manager: npm or yarn
- ORM: TypeORM with TypeScript support
- Testing: Jest with >80% coverage requirement

### Frontend Stack
- Framework: React 18+ with Next.js
- Language: TypeScript
- Package Manager: npm or yarn
- Styling: Tailwind CSS with design tokens
- State Management: Context API + Zustand
- Testing: React Testing Library with >70% coverage

### Database Stack
- Primary: PostgreSQL 13+
- Alternative: MongoDB (if documented justification)
- Migrations: Version-controlled schema migrations required
- Backups: Automated daily backups

### Cloud Infrastructure
- Cloud Provider: AWS (primary) or GCP/Azure (with justification)
- Container Runtime: Docker for all services
- Orchestration: Kubernetes or ECS Fargate
- Infrastructure as Code: Terraform or CloudFormation required

## Code Quality Gates

### Test Coverage Requirements
- Backend: Minimum 80% coverage of business logic
- Frontend: Minimum 70% coverage of components and logic
- Critical paths: 100% coverage requirement
- Integration tests: Mandatory for API endpoints

### Code Quality Standards
- All code must pass linter (ESLint for JavaScript/TypeScript)
- Code formatting: Prettier with shared config
- TypeScript compilation: No errors, strict mode enabled
- Circular dependencies: Zero tolerance
- Code complexity: Max cyclomatic complexity of 15 per function

### Static Analysis
- SonarQube or equivalent scanning required
- Security scanning: OWASP dependency check
- No hardcoded secrets (pre-commit hooks enforce this)
- No console.log statements in production code

## API Documentation Requirements

### OpenAPI/Swagger Specification
- All REST APIs must have OpenAPI 3.0 specification
- Specification must be kept in sync with implementation
- All endpoints must include request/response examples
- Error codes must be documented with status codes

### Request/Response Contracts
- All API contracts must be defined in bdd-spec before implementation
- Breaking changes require versioning (v1, v2, etc.)
- Backward compatibility required for 2 major versions
- Deprecation timeline minimum 3 months

## Branching Strategy

### Branch Naming
- Feature branches: `feature/TICKET-123-description`
- Bug fix branches: `bugfix/TICKET-456-description`
- Release branches: `release/v1.2.3`
- Hotfix branches: `hotfix/v1.2.4-description`

### Commit Standards
- Commits must reference ticket IDs
- Commit messages must be descriptive (50 chars title, detailed body)
- Squash commits before merging to main
- All commits must be GPG-signed

### Pull Request Requirements
- All PRs require code review by 2 engineers minimum
- CI/CD pipeline must pass (tests, linting, security scan)
- All PR conversations must be resolved
- Merge only after approval and successful pipeline

## Deployment Standards

### Build Artifacts
- Docker images must be tagged with version and commit SHA
- Images must be scanned for vulnerabilities before push
- All artifacts must be stored in private registries
- Build artifacts must be immutable once deployed

### Release Process
- Release versions follow semantic versioning (MAJOR.MINOR.PATCH)
- Release candidates must be tested on staging for 48 hours
- Zero-downtime deployment required for frontend
- Blue-green or canary deployments for backend services

### Rollback Procedures
- Rollback capability required within 30 minutes
- Automated rollback for critical errors
- Database migration rollbacks must be tested
- Rollback procedures documented in runbooks

## Monitoring and Alerting

### Required Monitoring
- Application health checks (3-minute intervals)
- Error rate monitoring (alerting >0.5%)
- API response time P99 monitoring (target <500ms)
- Database query performance monitoring
- Resource utilization (CPU, memory, disk)

### Alerting Thresholds
- Critical: Error rate >2%, Response time >2s, Downtime
- High: Error rate >1%, Response time >1s, Resource usage >80%
- Medium: Slow queries >1s, Deployment failures

### Logging Standards
- Structured logging (JSON format)
- All logs must include request tracing ID
- Sensitive data must be masked in logs
- Log retention: 30 days for operational, 1 year for audit logs

## Security Standards

### Secrets Management
- No secrets in code or configuration files
- Secrets stored in secure vault (AWS Secrets Manager, etc.)
- Secrets rotated minimum quarterly
- Access to secrets audited and logged

### Dependency Management
- All dependencies must be pinned to specific versions
- Security scanning of dependencies: weekly
- Critical vulnerabilities patched within 48 hours
- High vulnerabilities patched within 2 weeks
- Quarterly dependency updates scheduled

### Authentication & Authorization
- All APIs require authentication (except public endpoints)
- JWT tokens with 1-hour expiration for API access
- RBAC (Role-Based Access Control) for all features
- Audit logging for all security-relevant actions

## Documentation Standards

### Code Documentation
- All public functions must have JSDoc comments
- Complex algorithms must include explanation comments
- API endpoints must document parameters and responses
- Architecture decisions documented in ADRs (Architecture Decision Records)

### Runbooks
- Deployment runbook required
- Incident response procedures documented
- Scaling procedures documented
- Backup/restore procedures documented
- Regular runbook reviews (quarterly)

## Compliance Requirements

### GDPR (if applicable)
- Data residency compliance
- Consent management implementation
- User data deletion procedures
- Privacy policy updated and documented

### SOC 2 Type II (if applicable)
- Access controls implemented
- Audit logging comprehensive
- Incident response plan documented
- Security training for team members

### HIPAA (if handling PHI)
- Encryption for data at rest and in transit
- Unique user ID for all access
- Audit logs for all PHI access
- Business Associate Agreements in place
