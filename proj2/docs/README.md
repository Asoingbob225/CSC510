# Eatsential - Software Engineering Documentation

**Project:** Eatsential - Precision Nutrition Platform  
**Team:** 4-person agile team (CSC510 Group 12)  
**Documentation Standard:** IEEE/ISO Software Engineering Standards  
**Last Updated:** October 17, 2025  

---

## 📚 Documentation Structure Overview

This documentation follows **IEEE 830** (SRS), **IEEE 829** (STP), and **V-Model** best practices for software engineering.

```
┌─────────────────────────────────────────────────────────────┐
│                    V-MODEL STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Requirements Phase          ←→         Testing Phase       │
│                                                             │
│  Business Needs      ←────────────→  Acceptance Testing     │
│  (Initiation)                        (UAT)                  │
│       ↓                                   ↑                 │
│  User Requirements   ←────────────→  System Testing         │
│  (SRS)                               (End-to-End)           │
│       ↓                                   ↑                 │
│  System Design       ←────────────→  Integration Testing    │
│  (SAD)                               (API/Module)           │
│       ↓                                   ↑                 │
│  Detailed Design     ←────────────→  Unit Testing           │
│  (SDD)                               (Function/Class)       │
│       ↓                                   ↑                 │
│           Implementation (Coding)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Documentation Phase Structure

### 📋 [0-INITIATION](./0-INITIATION/) - Project Authorization
- [Project Charter](./0-INITIATION/project-charter.md) ⭐
- [Business Case](./0-INITIATION/business-case.md)
- [Feasibility Study](./0-INITIATION/feasibility-study.md)

### 📘 [1-SPP](./1-SPP/) - Software Project Plan
- [SPP-MASTER.md](./1-SPP/SPP-MASTER.md) ⭐⭐⭐
- [Scope Management](./1-SPP/scope-management.md)
- [Schedule Management](./1-SPP/schedule-management.md)
- [Risk Management](./1-SPP/risk-management.md)
- [Quality Management](./1-SPP/quality-management.md)

### 📗 [2-SRS](./2-SRS/) - Software Requirements Specification
- [SRS-MASTER.md](./2-SRS/SRS-MASTER.md) ⭐⭐⭐
- [3.4 Use Cases](./2-SRS/3-specific-requirements/3.4-use-cases.md) ⭐
- [User Personas](./2-SRS/5-appendices/B-user-personas.md)
- [Traceability Matrix](./2-SRS/requirements-traceability-matrix.md)

### 📙 [3-DESIGN](./3-DESIGN/) - Architecture & Detailed Design
- [SAD-MASTER.md](./3-DESIGN/3.1-SAD/SAD-MASTER.md) ⭐⭐
- [SDD-MASTER.md](./3-DESIGN/3.2-SDD/SDD-MASTER.md) ⭐

### 📕 [5-STP](./5-STP/) - Software Test Plan
- [STP-MASTER.md](./5-STP/STP-MASTER.md) ⭐⭐⭐
- [System Test Cases](./5-STP/5.3-system-test-plan/system-test-cases.md) ⭐
- [Test Traceability Matrix](./5-STP/test-traceability-matrix.md) ⭐

---

## 🎯 Quick Navigation by Role

### 👔 Product Manager
1. [Project Charter](./0-INITIATION/project-charter.md)
2. [SRS Section 2](./2-SRS/2-overall-description.md)
3. [User Personas](./2-SRS/5-appendices/B-user-personas.md)

### 💻 Developer
1. [SRS Master](./2-SRS/SRS-MASTER.md)
2. [SAD Master](./3-DESIGN/3.1-SAD/SAD-MASTER.md)
3. [API Design](./3-DESIGN/3.2-SDD/api-detailed-design.md)

### 🧪 QA Engineer
1. [STP Master](./5-STP/STP-MASTER.md)
2. [Use Cases](./2-SRS/3-specific-requirements/3.4-use-cases.md)
3. [System Test Cases](./5-STP/5.3-system-test-plan/system-test-cases.md)

---

## 📊 Document Status

| Document | Status | Priority | Owner |
|----------|--------|----------|-------|
| Project Charter | 🟢 Complete | P0 | PM |
| SPP Master | 🟢 Complete | P0 | PM |
| SRS Master | 🟢 Complete | P0 | BA |
| Use Cases | 🟢 Complete | P0 | BA |
| SAD Master | 🟢 Complete | P0 | Architect |
| STP Master | 🟢 Complete | P0 | QA |

**Legend:** 🟢 Complete | 🟡 In Progress | 🔴 Not Started

---

**Repository:** [github.com/Asoingbob225/CSC510](https://github.com/Asoingbob225/CSC510)
