# Capstone Defense & Documentation Package
## Cloud-Based Predictive Maintenance System for Nigerian Oil & Gas Operations
**Sponsored Program:** 18-Month Human Capacity Development Program (HCDP)  
**Supervising Body:** Nigerian Content Development and Monitoring Board (NCDMB)

---

## 1. Executive Summary & Capstone Proposal

### 1.1 Problem Statement
Upstream and midstream oil & gas facilities operating across the Niger Delta (offshore FPSOs, land compression stations, crude export terminals) experience severe financial losses due to unplanned rotating equipment failures (e.g. centrifugal compressor bearing burnout, crude export pump cavitation). Unscheduled outages cost operators up to **$250,000 - $1,200,000 USD per day** in deferred production losses.

### 1.2 Proposed Solution & Architecture
This Capstone project delivers a defense-ready, production-grade cloud SaaS platform integrating:
- **IoT Telemetry Processing:** Real-time ingestion of vibration RMS, bearing temperature, discharge pressure, and volumetric flow rate.
- **Serverless Anomaly Detection Engine:** AWS Lambda execution of statistical 3-sigma anomaly scoring and Remaining Useful Life (RUL) estimation in operating hours.
- **Role-Based Web Dashboards:** React.js user portals customized for Super Admin governance, Maintenance Manager scheduling, Operations Manager financial reporting, and Field Technician mobile operations.
- **Financial Cost Avoidance Estimator:** Real-time calculation of avoided production losses based on prevented downtime events.
- **Regulatory Compliance & Security:** AWS KMS AES-256 data encryption at rest, TLS 1.3 in transit, and immutable NCDMB system audit trails.

---

## 2. Manager & Field Technician User Manuals

### 2.1 Maintenance Manager Guide
1. **Fleet Health Monitoring:** Log into the Maintenance Portal to view the rotating asset health matrix. Green badges indicate operational status ($>80\%$ health), yellow badges indicate early warning thresholds ($60-80\%$), and red badges signify degraded assets requiring immediate intervention.
2. **Generating Work Orders:** Click "Create Work Order", select the target asset tag (e.g. `COMP-04A`), assign priority level, and input maintenance instructions.
3. **Telemetry Simulator Evaluation:** Click "Open Telemetry Simulator" to test real-time sensor streams and verify automated work order creation when health drops below 65%.

### 2.2 Field Technician Mobile Web Guide
1. **Accessing Assigned Work:** Access the mobile-optimized portal on smartphone or tablet. The interface detects network status and enables offline caching in low-bandwidth swamp environments.
2. **Executing Repairs:** Select an assigned work order, click "Start Repair" to mark progress as `IN_PROGRESS`, perform physical bearing inspection or lube replacement, and click "Mark Complete". Completing a work order automatically restores the equipment health index to 95%.

---

## 3. Executive PowerPoint Slide Deck Outline

- **Slide 1: Title & Governance** — Capstone Project Overview, NCDMB Supervision, HCDP Sponsorship.
- **Slide 2: Industry Pain Point** — Impact of unscheduled downtime on Nigerian upstream crude production ($M USD losses).
- **Slide 3: End-to-End AWS System Architecture** — C4 diagram showing edge telemetry, API Gateway, AWS Lambda ingestion, RDS PostgreSQL, S3, SNS alerts, and React UI.
- **Slide 4: Predictive Analytics Engine & RUL Model** — Statistical 3-sigma anomaly detection and Remaining Useful Life formula.
- **Slide 5: Financial ROI & Cost Savings Estimator** — Financial loss prevention formula showing $2.78M USD total net cost avoidance.
- **Slide 6: Multi-Role SaaS Portals & Mobile PWA** — Live demonstration of Super Admin, Manager, and Field Tech views.
- **Slide 7: NCDMB Compliance & Defense Summary** — Data encryption at rest (KMS), RBAC security, audit logging, and project roadmap.

---

## 4. Evaluation Panel Q&A Defense Guide

### Q1: How does your cloud platform handle intermittent network connectivity in remote Niger Delta swamp locations?
**Answer:** The frontend application is built as a Progressive Web Application (PWA) leveraging optimistic local caching via IndexedDB/LocalStorage. Technicians can view assigned work orders and update repair statuses offline; pending updates automatically sync with the AWS API Gateway once mobile or satellite connectivity is re-established.

### Q2: How does the system ensure compliance with Nigerian Content (NCDMB) data protection and auditability guidelines?
**Answer:** All database storage on AWS RDS PostgreSQL and telemetry log archives on S3 are encrypted at rest using AWS KMS with customer-managed keys (AES-256). Furthermore, an immutable `audit_logs` table records every system login, role permission modification, and work order creation, logging user identity, IP address, and cryptographic timestamp.

### Q3: How is false positive alert fatigue prevented for plant operations managers?
**Answer:** The prediction engine implements dual-threshold validation. Sensor spikes must exceed 3-sigma statistical deviations across multiple correlated metrics (e.g. vibration RMS combined with bearing temperature spike) before raising critical work order alerts. Transient noise triggers warning flags rather than automated plant shutdown procedures.
