# Software Project Plan (SPP)

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Master Project Plan  
**Version:** 1.0  
**Date:** October 18, 2025

---

## Document Purpose

This Software Project Plan (SPP) provides a comprehensive management approach for the Eatsential MVP project. It integrates all subsidiary management plans and serves as the primary reference for project execution, monitoring, and control.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Scope Management](#2-scope-management)
3. [Schedule Management](#3-schedule-management)
4. [Resource Management](#4-resource-management)
5. [Risk Management](#5-risk-management)
6. [Quality Management](#6-quality-management)
7. [Communication Management](#7-communication-management)
8. [Change Management](#8-change-management)

---

## 1. Project Overview

### 1.1 Project Summary

**Project Name:** Eatsential MVP  
**Duration:** Multi-phase development approach  
**Team Size:** 4 members  
**Budget:** $500 (LLM API credits)  
**Methodology:** Agile Scrum with iterative sprints

### 1.2 Project Vision

Deliver an AI-powered precision nutrition platform that provides zero-tolerance safe food recommendations through dual-dimension health profiling (physical + mental wellness).

### 1.3 Success Criteria

- ✅ All MVP features functional (5 core modules)
- ✅ Zero allergen false positives (safety red line)
- ✅ System performance: P95 ≤ 2 seconds
- ✅ Test coverage ≥ 80%
- ✅ Complete documentation (SRS, SAD, STP)
- ✅ Successful academic presentation

### 1.4 Key Deliverables

1. **Software**: Web application with 5 core modules
2. **Documentation**: SPP, SRS, SAD, SDD, STP (IEEE compliant)
3. **Quality**: ≥80% test coverage, zero critical bugs
4. **Academic**: Final presentation, technical report

---

## 2. Scope Management

**Detailed Plan:** [📄 scope-management.md](./scope-management.md)

### 2.1 Scope Statement

**In Scope:**

- User authentication and health profile management
- RAG-based meal recommendation engine
- AI conversational assistant (LLM-powered)
- Restaurant discovery with allergen filtering
- Community review system

**Out of Scope:**

- Weekly meal planner (Release 2)
- Smart grocery lists (Release 2)
- Social features (follow/share) (Release 2)
- Native mobile apps (web PWA only)
- Multi-language support (English only)

### 2.2 Work Breakdown Structure (WBS)

```
1.0 Eatsential MVP Project
│
├── 1.1 Project Management
│   ├── 1.1.1 Project Planning
│   ├── 1.1.2 Sprint Planning (8 sprints)
│   ├── 1.1.3 Risk Management
│   └── 1.1.4 Status Reporting
│
├── 1.2 Requirements Engineering
│   ├── 1.2.1 User Research
│   ├── 1.2.2 Persona Development
│   ├── 1.2.3 Use Case Specification
│   ├── 1.2.4 SRS Documentation
│   └── 1.2.5 Requirements Review
│
├── 1.3 System Design
│   ├── 1.3.1 Architecture Design (SAD)
│   ├── 1.3.2 Database Design
│   ├── 1.3.3 API Design
│   ├── 1.3.4 UI/UX Design
│   ├── 1.3.5 AI Pipeline Design (RAG)
│   └── 1.3.6 Design Review
│
├── 1.4 Development
│   ├── 1.4.1 Frontend Development
│   │   ├── 1.4.1.1 Authentication UI
│   │   ├── 1.4.1.2 Profile Onboarding UI
│   │   ├── 1.4.1.3 Recommendation Dashboard
│   │   ├── 1.4.1.4 AI Chat Interface
│   │   └── 1.4.1.5 Restaurant Discovery UI
│   │
│   ├── 1.4.2 Backend Development
│   │   ├── 1.4.2.1 User Management API
│   │   ├── 1.4.2.2 Profile Management API
│   │   ├── 1.4.2.3 Recommendation Engine
│   │   ├── 1.4.2.4 AI Concierge Service
│   │   └── 1.4.2.5 Restaurant API
│   │
│   ├── 1.4.3 Database Implementation
│   ├── 1.4.4 RAG Pipeline Implementation
│   ├── 1.4.5 LLM Integration
│   └── 1.4.6 CI/CD Setup
│
├── 1.5 Testing & QA
│   ├── 1.5.1 Test Plan Development (STP)
│   ├── 1.5.2 Unit Testing
│   ├── 1.5.3 Integration Testing
│   ├── 1.5.4 System Testing
│   ├── 1.5.5 UAT
│   └── 1.5.6 Performance Testing
│
├── 1.6 Deployment
│   ├── 1.6.1 Production Environment Setup
│   ├── 1.6.2 Data Migration
│   ├── 1.6.3 MVP Release
│   └── 1.6.4 Post-Deployment Monitoring
│
└── 1.7 Documentation & Closure
    ├── 1.7.1 User Manual
    ├── 1.7.2 API Documentation
    ├── 1.7.3 Technical Report
    ├── 1.7.4 Final Presentation
    └── 1.7.5 Project Closure
```

### 2.3 Scope Control

- **Change Request Process**: All scope changes require PM approval
- **Change Control Board**: Weekly review of change requests
- **Impact Analysis**: Mandatory for all change requests (schedule, resources, risks)

---

## 3. Schedule Management

**Detailed Plan:** [📄 schedule-management.md](./schedule-management.md)

### 3.1 Milestone Breakdown

#### 📌 Release 1: MVP

| Milestone                    | Deliverable                        | Development Phase | Criteria                                 |
| ---------------------------- | ---------------------------------- | ----------------- | ---------------------------------------- |
| **M1: Core Accounts**        | User auth & dual-dimension profile | Phase 1           | ✅ Signup, login, profile onboarding     |
| **M2: AI Recommendations**   | RAG engine + health tagging        | Phase 2           | ✅ Scientific meal suggestions working   |
| **M3: AI Concierge**         | LLM chat interface                 | Phase 3           | ✅ Natural language Q&A functional       |
| **M4: Restaurant Discovery** | Map search + allergen filter       | Phase 4           | ✅ MVP launch - full feature integration |

**Integrated in MVP:**

- Visual Wellness Journey (progress tracking charts built progressively across M1-M4)
- Community reviews (integrated with Restaurant Discovery in M4)
- Safety & allergen filtering (cross-cutting across all milestones)

#### 🎯 Release 2: Advanced Features

| Milestone                    | Deliverable                            | Status  | Priority |
| ---------------------------- | -------------------------------------- | ------- | -------- |
| **M5: Meal Planner**         | AI-curated weekly meal plans           | Planned | High     |
| **M6: Grocery Lists**        | Smart aisle-categorized shopping lists | Planned | High     |
| **M7: Community Hub**        | Follow, share, activity feed           | Planned | Medium   |
| **M8: Personalization Loop** | Feedback-driven refinement system      | Planned | Medium   |

### 3.2 Critical Path

```
Requirements → Architecture → Database → Backend API → Frontend → Integration → Testing → Deployment
```

**Critical Activities:**

1. Use Case specification (blocks all development)
2. Database schema design (blocks backend)
3. RAG pipeline implementation (blocks recommendations)
4. LLM integration (blocks AI Concierge)
5. System testing (blocks release)

### 3.3 Schedule Buffer

- **Project buffer**: Additional time allocated for project completion
- **Sprint buffer**: Contingency time within each development iteration
- **Critical path items**: Requirements and Architecture phases require timely completion

---

## 4. Resource Management

**Detailed Plan:** [📄 resource-management.md](./resource-management.md)

### 4.1 Team Structure & Roles

**4-Person Agile Team** (flexible role allocation):

| Primary Focus               | Secondary Responsibilities                         |
| --------------------------- | -------------------------------------------------- |
| **Full-Stack Developer #1** | Frontend (React), UI/UX, Accessibility             |
| **Full-Stack Developer #2** | Backend (Python), Database, API design             |
| **AI/ML Engineer**          | LLM integration, RAG pipeline, Prompt engineering  |
| **DevOps/QA Engineer**      | CI/CD, Testing strategy, Deployment, Quality gates |

**Note:** In a small agile team, all members contribute to planning, code reviews, and testing. Roles are fluid based on sprint needs.

### 4.2 Resource Calendar

**Peak Work Periods:**

- Core Development Phase: Full team effort on feature implementation
- Testing Phase: Intensive testing and bug fixes

**Light Work Periods:**

- Planning Phase: Requirements and architecture design
- Deployment Phase: Final deployment and documentation

### 4.3 Budget Allocation

| Category                    | Budget   | Notes                 |
| --------------------------- | -------- | --------------------- |
| LLM API (OpenAI GPT-4)      | $400     | Primary cost driver   |
| Vector DB (Pinecone/Qdrant) | $0       | Free tier sufficient  |
| Hosting (Vercel)            | $0       | Free tier             |
| Database (Supabase)         | $0       | Free tier             |
| CI/CD (GitHub Actions)      | $0       | Free for public repos |
| Buffer                      | $100     | Contingency           |
| **Total**                   | **$500** |                       |

---

## 5. Risk Management

**Detailed Plan:** [📄 risk-management.md](./risk-management.md)

### 5.1 Top 10 Project Risks

| ID    | Risk                         | Prob | Impact   | Score | Mitigation Strategy                                      | Owner       |
| ----- | ---------------------------- | ---- | -------- | ----- | -------------------------------------------------------- | ----------- |
| R-001 | LLM recommends allergen food | Low  | Critical | HIGH  | Multi-layer filters, manual audit, zero-tolerance alerts | AI Engineer |
| R-002 | Third-party data unavailable | High | High     | HIGH  | Mock data, multiple sources, cached fallback             | Backend Dev |
| R-003 | Team member unavailable      | Med  | High     | MED   | Cross-training, documentation, pair programming          | Team        |
| R-004 | LLM API cost overrun         | Med  | Med      | MED   | Caching, request throttling, budget alerts               | AI Engineer |
| R-005 | Scope creep requests         | High | Med      | MED   | Strict change control, Release 2 backlog                 | Team        |
| R-006 | Technical debt buildup       | High | Med      | MED   | Code reviews, refactoring time, quality gates            | Team        |
| R-007 | RAG accuracy insufficient    | Med  | High     | MED   | Evaluation metrics, tuning sprints, fallback logic       | AI Engineer |
| R-008 | Integration delays           | Med  | High     | MED   | API contracts, mocking, parallel development             | Team        |
| R-009 | Test coverage < 80%          | Med  | Med      | MED   | TDD practice, automated coverage tracking                | QA Engineer |
| R-010 | Late requirement changes     | Med  | High     | MED   | Requirements freeze after initial phase                  | Team        |

### 5.2 Risk Response Plan

**For R-001 (Allergen Safety - HIGHEST PRIORITY):**

- **Preventive**: Multi-layer filtering (DB query filter + Application filter + LLM instruction filter)
- **Detective**: Automated tests with 100% allergen scenarios, manual spot checks
- **Corrective**: Immediate rollback capability, team incident response
- **Monitoring**: Real-time alerts if allergen detected in recommendation

**For R-002 (Data Unavailability):**

- **Preventive**: Multiple data sources, cached data, health checks
- **Corrective**: Mock data fallback, graceful degradation UI
- **Contingency**: Seed database with 500+ meals for offline mode

---

## 6. Quality Management

**Detailed Plan:** [📄 quality-management.md](./quality-management.md)

### 6.1 Quality Standards

| Aspect            | Standard     | Target         | Measurement     |
| ----------------- | ------------ | -------------- | --------------- |
| **Code Coverage** | Jest/Pytest  | ≥ 80%          | Codecov reports |
| **Code Quality**  | ESLint, Ruff | 0 errors       | CI checks       |
| **Performance**   | Web Vitals   | LCP < 2.5s     | Lighthouse      |
| **Accessibility** | WCAG 2.1     | Level AA       | axe DevTools    |
| **Security**      | OWASP Top 10 | 0 critical     | Snyk scans      |
| **Documentation** | Markdown     | 100% core docs | Manual review   |

### 6.2 Quality Gates

**Gate 1: Requirements Phase**

- [ ] SRS reviewed and approved by all stakeholders
- [ ] All use cases have acceptance criteria
- [ ] Traceability matrix established

**Gate 2: Design Phase**

- [ ] Architecture design review passed
- [ ] Database schema validated
- [ ] API contracts agreed upon

**Gate 3: Development Phase**

- [ ] All unit tests passing
- [ ] Code coverage ≥ 80%
- [ ] No critical bugs in backlog

**Gate 4: Testing Phase**

- [ ] All system tests passed
- [ ] UAT sign-off received
- [ ] Performance benchmarks met

**Gate 5: Release Phase**

- [ ] Zero critical/high severity bugs
- [ ] All documentation complete
- [ ] Deployment checklist verified

### 6.3 Review & Inspection Process

**Code Reviews:**

- All PRs require 1 approval (2 for critical modules)
- Automated checks must pass (lint, tests, coverage)
- Review turnaround time: < 24 hours

**Design Reviews:**

- Architecture review (Week 3)
- API design review (before implementation)
- Database schema review (before migration)

**Documentation Reviews:**

- Peer review for all P0 documents
- Stakeholder review for SRS, STP
- Final review before submission

---

## 7. Communication Management

**Detailed Plan:** [📄 communication-management.md](./communication-management.md)

### 7.1 Communication Practices

| Activity            | Frequency     | Medium             |
| ------------------- | ------------- | ------------------ |
| **Daily Standup**   | Daily (async) | Slack updates      |
| **Sprint Planning** | Weekly        | Team meeting       |
| **Sprint Review**   | Weekly        | Demo to instructor |
| **Sprint Retro**    | Weekly        | Team discussion    |
| **Code Review**     | Continuous    | GitHub PR reviews  |

### 7.2 Communication Tools

- **Real-time chat**: Slack or Discord
- **Video meetings**: Zoom or Google Meet
- **Project tracking**: GitHub Projects
- **Documentation**: GitHub repository (docs/)
- **Code collaboration**: GitHub pull requests

### 7.3 Decision-Making Process

**Technical Decisions:**

- Team discussion → Consensus decision
- Documented in GitHub Discussions

**Priority/Scope Decisions:**

- Team consensus based on MVP scope
- Escalate to course instructor if conflicting with academic requirements

---

## 8. Change Management

### 8.1 Change Control Process

**Step 1: Change Request Submission**

- Use GitHub Issue template "Change Request"
- Provide: description, justification, impact estimate

**Step 2: Impact Analysis**

- Assess impact on scope, schedule, resources, risks
- Evaluate technical feasibility
- Assess testing impact

**Step 3: Team Decision**

- Team consensus for minor changes (< 5% scope)
- Instructor consultation for major changes (≥ 5% scope)
- Emergency changes: retrospective review at next sprint retro

**Step 4: Implementation**

- Update affected documents (SRS, schedule, etc.)
- Communicate to all team members
- Track in change log

### 8.2 Change Request Thresholds

| Change Type                    | Decision Process                | Timeline   |
| ------------------------------ | ------------------------------- | ---------- |
| Documentation typo             | Direct commit                   | Immediate  |
| Minor bug fix                  | PR review                       | < 24 hours |
| Feature enhancement (in scope) | Team consensus                  | 2-3 days   |
| New feature (out of scope)     | Defer to Release 2              | N/A        |
| Architecture change            | Team discussion + design review | 1 week     |

---

## 9. Integration with Other Plans

This SPP integrates with:

- **SRS**: Requirements drive schedule and resource allocation
- **SAD**: Architecture decisions impact resource needs and risks
- **STP**: Testing schedule integrated into overall timeline
- **Risk Register**: Risks inform contingency planning

---

## 10. Plan Maintenance

**Review Frequency**: Weekly during sprint planning  
**Update Triggers:**

- Major milestone completion
- Significant risk materialization
- Scope change decisions
- Resource allocation changes

**Version Control**: All plan updates versioned in Git with changelog

---

## Document Control

**Version:** 1.0  
**Last Updated:** October 18, 2025

### Revision History

| Version | Date         | Changes         |
| ------- | ------------ | --------------- |
| 1.0     | Oct 18, 2025 | Initial version |

---

**END OF SPP**

**END OF SOFTWARE PROJECT PLAN**
