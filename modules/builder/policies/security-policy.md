# Builder Module Security Policy

## Launch Blocking Criteria

### Critical Vulnerabilities
- Any critical vulnerability automatically blocks launch
- No exceptions without executive sign-off
- Critical vulnerabilities must be remediated before deployment
- Examples: SQL injection, authentication bypass, privilege escalation

### High Vulnerabilities with Mitigation
- High vulnerabilities may proceed with documented mitigation
- Mitigation must be reviewed and approved
- Timeline for remediation must be specified (max 2 weeks)
- Risk acceptance form must be signed

### Security Score Minimum
- Minimum security score: 70/100 to launch
- Score below 70: automatic block
- Score 70-85: allowed with documented mitigations
- Score >85: approved without conditions

## OWASP Top 10 Checklist

### Mandatory Assessment
All applications must be assessed against OWASP Top 10:

1. **Broken Access Control**
   - [ ] Authorization checks on all endpoints
   - [ ] No direct object references without validation
   - [ ] Proper privilege enforcement
   - [ ] Session management secure

2. **Cryptographic Failures**
   - [ ] Data at rest encrypted (AES-256 minimum)
   - [ ] Data in transit encrypted (TLS 1.3 minimum)
   - [ ] Strong hashing for passwords (bcrypt, Argon2)
   - [ ] No sensitive data in logs

3. **Injection**
   - [ ] No SQL injection (parameterized queries)
   - [ ] No command injection (no shell execution)
   - [ ] No NoSQL injection (input validation)
   - [ ] No LDAP injection
   - [ ] No template injection

4. **Insecure Design**
   - [ ] Threat modeling performed
   - [ ] Security requirements documented
   - [ ] Security-first architecture
   - [ ] Defense in depth implemented

5. **Security Misconfiguration**
   - [ ] No default credentials
   - [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
   - [ ] No unnecessary services enabled
   - [ ] Firewall rules properly configured

6. **Vulnerable & Outdated Components**
   - [ ] Dependency scanning enabled
   - [ ] No known vulnerabilities in dependencies
   - [ ] Security patches applied within SLA
   - [ ] Component versions documented

7. **Authentication Failures**
   - [ ] Strong password policies enforced
   - [ ] Account lockout after failed attempts
   - [ ] Secure password storage (bcrypt minimum 10 rounds)
   - [ ] MFA available for sensitive operations
   - [ ] Session timeout properly configured

8. **Software & Data Integrity Failures**
   - [ ] Code integrity verification (GPG signatures)
   - [ ] Data integrity checks (checksums)
   - [ ] No unsigned deployments
   - [ ] CI/CD pipeline security

9. **Logging & Monitoring Failures**
   - [ ] Security event logging enabled
   - [ ] Audit trail immutable
   - [ ] Monitoring and alerting configured
   - [ ] Log aggregation and retention

10. **Server-Side Request Brucery (SSRF)**
    - [ ] URL validation for external requests
    - [ ] Whitelist of allowed domains
    - [ ] No access to internal services from API
    - [ ] Rate limiting on external requests

## Secrets Management

### Prohibited
- No secrets in code repositories
- No secrets in configuration files (checked in)
- No secrets in environment variables in code
- No secrets in logs or error messages
- No sharing of secrets in communication channels

### Required
- Secrets stored in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Secrets rotated quarterly (minimum)
- Access to secrets logged and audited
- Different secrets for each environment
- Rotation automated where possible

### Implementation
- Pre-commit hooks must block secrets
- Scanning tools: git-secrets, TruffleHog
- Vault access requires MFA
- Secrets encryption at rest and in transit

## Authentication Security

### Password Requirements
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- Password history: no reuse of last 5 passwords
- Password expiration: 90 days
- Account lockout: 5 failed attempts, 30-minute lockout

### JWT Security
- Algorithm: RS256 (RSA with SHA-256)
- Expiration: 1 hour for access tokens
- Refresh tokens: 30-day expiration
- Tokens must be signed and verified
- Tokens must not contain sensitive data
- Secret key rotation quarterly

### Multi-Factor Authentication
- MFA required for all admin accounts
- MFA available for all user accounts
- Methods: TOTP (Time-based One-Time Password), SMS, email
- Backup codes provided and stored securely

## API Security

### Input Validation
- All input must be validated server-side
- Whitelist validation (not blacklist)
- Data type checking
- Length and format validation
- SQL injection prevention via parameterized queries

### Rate Limiting
- API rate limiting: 1000 requests/hour per user (default)
- Critical operations: 10 requests/minute per user
- Authentication endpoints: 5 attempts/minute
- Bulk operations: 100 requests/hour
- Rate limit headers in all responses

### CORS Configuration
- Explicitly define allowed origins
- Never use wildcard (*) for sensitive operations
- Credentials: true only for trusted origins
- Preflight requests properly handled

### API Versioning
- No breaking changes without major version bump
- Deprecated endpoints: 6-month support window
- Clear deprecation warnings in documentation
- Migration guide for breaking changes

## Data Protection

### Data Classification
- Public: No restrictions
- Internal: Limited to employees
- Confidential: Limited to specific teams
- Restricted: PII, PHI, payment data

### Encryption Standards
- Data at Rest: AES-256 encryption
- Data in Transit: TLS 1.3 minimum
- Key Management: Separate keys per environment
- Key Rotation: Quarterly (automated)

### PII/PHI Handling
- Minimal collection: Only necessary data
- Explicit consent: Required before collection
- Secure storage: Encrypted separately
- Deletion: User data deleted upon request
- Audit logging: All access logged

## Vulnerability Management

### Scanning
- SAST (Static Application Security Testing): Daily
- DAST (Dynamic Application Security Testing): Weekly
- Dependency scanning: Daily
- Container scanning: On each build

### Severity Definitions
- Critical: Remote code execution, auth bypass, data breach
- High: Significant access/data exposure, service disruption
- Medium: Moderate security impact, mitigations available
- Low: Minor issue, limited impact

### Remediation SLAs
- Critical: 24 hours to patch or mitigate
- High: 1 week to patch or mitigate
- Medium: 2 weeks to patch or mitigate
- Low: 1 month to patch or address

### Patch Management
- Security patches applied within SLA
- Testing of patches: 48 hours
- Rollback procedures verified
- Production deployment: 72 hours after testing

## Incident Response

### Incident Classification
- Critical: Active exploitation, data breach, service down
- High: Confirmed vulnerability, potential exploitation
- Medium: Likely vulnerability, no confirmed exploitation
- Low: Suspicious activity, requires investigation

### Response Timeline
- Critical: Response within 1 hour, resolution within 4 hours
- High: Response within 4 hours, resolution within 24 hours
- Medium: Response within 24 hours, resolution within 72 hours
- Low: Response within 72 hours, resolution within 1 week

### Notification Requirements
- Internal: Immediate to security team and management
- External: Within 72 hours for breaches affecting users
- Regulatory: Per legal/compliance requirements

## Compliance Audit

### Regular Audits
- Quarterly internal security audits
- Annual third-party security assessment
- Penetration testing: Annually (minimum)
- Code review: Every release

### Documentation
- Security policies updated annually
- Incident logs maintained (2 years)
- Audit reports stored (5 years)
- Security training records (3 years)
