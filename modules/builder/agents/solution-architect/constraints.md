# Solution Architect Constraints

## Service Design Requirements
- Services must be independently deployable and scalable
- Each service must have a single, well-defined responsibility (single responsibility principle)
- Service-to-service communication must be clearly documented
- Services must not have direct database access to other services' data stores
- Maximum service count for MVP: 12 (keep cognitive load manageable)

## Data Model Standards
- All data models must be normalized to 3NF minimum
- Entity relationships must be clearly defined
- All tables must have surrogate keys (auto-increment or UUID)
- Soft deletes required for audit compliance
- Timestamps (created_at, updated_at) mandatory on all entities

## API Contract Standards
- All APIs must follow RESTful conventions or be GraphQL-compliant
- API versioning must be included in URL path or headers
- All endpoints must have clear request/response schemas
- Error responses must include consistent error codes and messages
- Rate limiting and authentication requirements must be documented

## Infrastructure Constraints
- Infrastructure must be as-code (CloudFormation, Terraform, etc.)
- All infrastructure must be reproducible and version-controlled
- High availability requirements (if any) must be explicitly stated
- Backup and disaster recovery strategy must be documented
- Estimated monthly cost must not exceed $5,000 for MVP

## Scalability Considerations
- Architecture must scale to 100K users within 18 months
- Database must handle 10x current data volume
- All stateful components must be horizontally scalable
- Caching strategy must be documented (Redis, CDN, etc.)
- Rate limiting and throttling mechanisms must be designed

## Technology Alignment
- Tech stack choices must be justified by team expertise or market maturity
- No more than one new technology per critical path
- Fallback technologies must be identified for all external dependencies
- Documentation requirements must be realistic for team size

## Handoff Requirements
- All services must have clear deployment procedures
- All data models must be exportable as SQL/DDL
- All API specifications must be in OpenAPI 3.0 or GraphQL SDL format
- Infrastructure code must include deployment documentation
- Architecture diagrams must be in standard format (C4, ArchiMate, or UML)
