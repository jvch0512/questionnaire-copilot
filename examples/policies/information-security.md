---
title: Information Security Policy
reviewed: 2026-06-15
---
# Authentication

All employees and contractors must use multi-factor authentication for e-mail, the VPN and every administrative console. MFA is enforced by the identity provider and exceptions are not permitted. Single sign-on through SAML is available for all customer-facing applications.

# Encryption

Customer data is encrypted at rest with AES-256 and in transit with TLS 1.2 or higher. Encryption keys are managed in a cloud key management service with automatic yearly rotation. Laptops use full disk encryption.

# Vulnerability management

Critical vulnerabilities are patched within 14 days and high ones within 30 days. External penetration tests are performed once a year by an independent firm and the findings are tracked to closure. We do not currently run red team exercises.

# Security operations

Logs from production systems are collected in a central SIEM and retained for 12 months. A 24x7 security operations center is planned for 2027 and is not yet in place. Alerts are reviewed during business hours today.

# People

All staff complete security awareness training when they join and every year after that, with quarterly phishing simulations.
