# Security Agent Constraints

## OWASP Top 10 Assessment
- All 10 OWASP categories must be evaluated
- A01: Broken Access Control — verify authorization checks
- A02: Cryptographic Failures — check encryption, hashing, TLS
- A03: Injection — SQL, command, NoSQL injection checks
- A04: Insecure Design — architecture review for security flaws
- A05: Security Misconfiguration — default configs, exposed endpoints
- A06: Vulnerable & Outdated Components — dependency vulnerability scan
- A07: Authentication Failures — password policies, session management
- A08: Software & Data Integrity Failures — data validation, integrity checks
- A09: Logging & Monitoring Failures — audit logging completeness
- A10: SSRF — URL validation for external service calls

## Code Security Review
- All authentication mechanisms must be validated
- All data validation must be explicit and server-side
- No hardcoded secrets or credentials allowed
- Sensitive data logging must be disabled
- SQL queries must be parameterized (ORM handles this)
- File uploads must be validated and scanned

## Configuration Audit
- All environment variables must be properly set
- Secrets must be in secret management (not in code)
- Database access must be restricted (not public)
- API endpoints must not expose internal details
- CORS headers must be properly configured
- HTTP security headers must be present (CSP, HSTS, etc.)

## Dependency Security
- All direct and transitive dependencies must be scanned
- Known vulnerabilities in dependencies must be flagged
- Outdated packages must be identified
- License compliance must be checked (GPL, etc.)
- Supply chain risks must be assessed

## Authentication & Authorization
- Password hashing must use bcrypt or Argon2
- JWT tokens must have appropriate expiration
- Session management must be secure
- MFA must be considered for critical operations
- OAuth/SSO implementations must follow standards

## Data Protection
- Sensitive data at rest must be encrypted
- Sensitive data in transit must use TLS
- PII must not appear in logs or error messages
- Data retention policies must be enforced
- Deletion/anonymization procedures must exist

## Vulnerability Severity Levels
- Critical: Allows unauthorized access, data breach, or complete system compromise
- High: Significant security impact, could lead to data exposure or service disruption
- Medium: Moderate security impact, requires some preconditions or user interaction
- Low: Minor security issue, limited impact

## Launch Blocking Criteria
- Any critical vulnerability automatically blocks launch
- All critical vulnerabilities must be remediated
- High vulnerabilities should have documented mitigations
- Medium and low vulnerabilities can proceed with acceptance
- Executive sign-off required if proceeding with critical issues

## Compliance Assessment
- GDPR: Data residency, consent, deletion rights
- SOC 2: Access controls, audit logging, encryption
- HIPAA: If applicable, PHI protection and access logs
- PCI DSS: If handling payment data, card data protection
- CCPA: Consumer data rights and privacy controls
