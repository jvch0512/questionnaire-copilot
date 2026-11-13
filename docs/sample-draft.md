# Questionnaire draft

14 questions: 8 ready to send, 4 to review, 2 need an owner. Date of check: 2026-11-13.

| # | Question | Answer | Conf. | Status | Source | Flags |
|---|---|---|---|---|---|---|
| Q1 | Do you enforce multi-factor authentication for all administrative access? | Yes | 0.76 | auto | Information Security Policy > Authentication | - |
| Q2 | Is customer data encrypted at rest and in transit? | Yes | 1 | auto | Information Security Policy > Encryption | - |
| Q3 | Do you perform independent penetration tests at least annually? | Yes | 0.84 | auto | Information Security Policy > Vulnerability management | - |
| Q4 | Do you run red team exercises? | No | 1 | auto | Information Security Policy > Vulnerability management | - |
| Q5 | Do you operate a 24x7 security operations center? | No | 0.58 | review | Information Security Policy > Security operations | - |
| Q6 | Do you test restoring your backups at least annually? | Yes | 0.62 | review | Business Continuity and Backup > Backups | stale-source |
| Q7 | How quickly do you notify customers of a personal data breach? | Customers are notified of a confirmed personal data breach without undue delay and no later than 48 hours after we become aware of it. | 0.62 | auto | Incident Response Plan > Notification | - |
| Q8 | ¿Dispone de un delegado de protección de datos (DPO)? | Yes | 1 | auto | Política de protección de datos > Delegado de protección de datos | - |
| Q9 | ¿Está certificada la organización según ISO 27001? | Partial | 0.8 | review | Política de protección de datos > Certificaciones | planned-not-done |
| Q10 | What is your data retention period after contract termination? | Los datos de los clientes se conservan mientras dure el contrato y se suprimen en un plazo máximo de 90 días tras su finalización. | 0.62 | auto | Política de protección de datos > Conservación | - |
| Q11 | Do you perform background checks on new employees? | Needs an owner: no reliable evidence in the policies provided. | 0.2 | manual | Information Security Policy > Authentication | low-confidence |
| Q12 | Do you hold cyber insurance? | Needs an owner: no evidence found in the policies provided. | 0 | manual | - | no-evidence |
| Q13 | Do you support single sign-on for customers? | Yes | 0.46 | review | Information Security Policy > Authentication | - |
| Q14 | Do you assess your subprocessors before engaging them? | Yes | 0.68 | auto | Política de protección de datos > Proveedores y subencargados | - |

## Needs a human

- **Q5** Do you operate a 24x7 security operations center?  Evidence found: "A 24x7 security operations center is planned for 2027 and is not yet in place."
- **Q6** Do you test restoring your backups at least annually? (stale-source) Evidence found: "Restore tests are performed once a year."
- **Q9** ¿Está certificada la organización según ISO 27001? (planned-not-done) Evidence found: "La certificación ISO 27001 está en curso y se prevé obtenerla durante 2027."
- **Q11** Do you perform background checks on new employees? (low-confidence) Evidence found: "All employees and contractors must use multi-factor authentication for e-mail, the VPN and every administrative console."
- **Q12** Do you hold cyber insurance? (no-evidence)
- **Q13** Do you support single sign-on for customers?  Evidence found: "Single sign-on through SAML is available for all customer-facing applications."

Answers are extracted from your own documents with citations. Check every answer against the current state of your controls before sending; an answer the evidence does not support is a misstatement.
