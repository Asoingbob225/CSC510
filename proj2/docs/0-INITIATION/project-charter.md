# Project Charter

**Project Name:** Eatsential - Precision Nutrition Platform  
**Project Code:** EATS-MVP-2025  
**Document Version:** 1.0  
**Date:** October 17, 2025

---

## 1. Executive Summary

Eatsential is an AI-powered precision nutrition platform designed to solve the critical problem of finding food that truly meets individual health needs. With rising food allergies, diverse fitness goals, and growing mental health awareness, consumers face daily challenges in making safe and optimal dietary decisions.

This project will deliver an MVP (Minimum Viable Product) within 8 weeks, featuring dual-dimension health profiling, AI-powered meal recommendations with zero-tolerance allergen filtering, conversational AI support, and curated restaurant discovery.

---

## 2. Project Purpose & Business Justification

### 2.1 Problem Statement

- **Health Risk**: Allergy sufferers face life-threatening situations due to inadequate food information
- **Decision Fatigue**: Conflicting nutritional advice creates daily stress for health-conscious consumers
- **Personalization Gap**: Existing solutions fail to address both physical and mental wellness simultaneously
- **Information Opacity**: Restaurant nutritional data is unreliable or incomplete

### 2.2 Business Opportunity

- **Target Market**: 50M+ Americans with food allergies, 100M+ fitness enthusiasts, growing wellness market
- **Competitive Advantage**: First platform combining RAG-based AI, mental wellness tagging, and zero-tolerance safety
- **Revenue Potential**: Freemium model, premium subscriptions, restaurant partnerships

### 2.3 Strategic Alignment

- **Course Objectives**: Demonstrates complete SDLC with modern tech stack
- Demonstrates practical application of LLM technology in safety-critical domain
- Addresses real-world social impact (food safety, public health)

---

## 3. Project Objectives & Success Criteria

### 3.1 SMART Objectives

| Objective              | Measurement                  | Target              | Timeline           |
| ---------------------- | ---------------------------- | ------------------- | ------------------ |
| **Launch MVP**         | Functional release           | 100% core features  | Week 8 (Oct 31)    |
| **User Registration**  | Active accounts              | 1,000+ users        | Post-launch Week 2 |
| **Safety Compliance**  | Allergen false positive rate | 0% (Zero tolerance) | Ongoing            |
| **System Performance** | P95 response time            | ≤ 2 seconds         | Pre-launch         |
| **Code Quality**       | Test coverage                | ≥ 80%               | Pre-launch         |
| **User Satisfaction**  | Recommendation approval rate | ≥ 80%               | Post-launch Week 4 |

### 3.2 Success Criteria by Dimension

#### Technical Success

- ✅ All MVP features functional and tested
- ✅ Zero critical bugs in production
- ✅ System uptime ≥ 99.5%
- ✅ RAG pipeline operational with ≥85% retrieval accuracy

#### User Success

- ✅ User onboarding completion rate ≥ 70%
- ✅ Average session duration ≥ 5 minutes
- ✅ Zero allergen-related incidents
- ✅ 7-day retention rate ≥ 30%

#### Academic Success

- ✅ Complete documentation (SRS, SAD, STP)
- ✅ Adherence to software engineering standards (IEEE 830, 829)
- ✅ Demonstrated V-Model traceability
- ✅ Successful final presentation and demo

---

## 4. Project Scope

### 4.1 In Scope (MVP - Release 1)

#### Core Features

1. **User Account System**
   - Secure registration and authentication
   - OAuth integration (Google/Apple)
   - Profile management

2. **Dual-Dimension Health Profile**
   - Allergy and intolerance tracking (life-threatening flagging)
   - Dietary restrictions (vegan, keto, halal, kosher, etc.)
   - Physical health goals (muscle gain, weight loss, maintenance)
   - Mental wellness objectives (stress relief, sleep, mood, focus)
   - Lifestyle preferences (budget, cooking capability, taste)

3. **Scientific Nutrition Engine**
   - RAG-based recommendation system
   - Multi-objective scoring algorithm
   - Health tagging framework (#PostWorkoutRecovery, #StressRelief, #SleepAid)
   - Hard constraint filtering (allergens, restrictions)
   - Explainable recommendations ("Why this meal?")

4. **AI Health Concierge**
   - Conversational chat interface
   - Context memory (conversation history)
   - Tool calling (nutrition queries, restaurant search)
   - Safety instruction compliance
   - Prompt injection prevention

5. **Restaurant Discovery**
   - Map-based browsing
   - Filter by distance, health tags, budget
   - Allergen-friendly restaurant verification
   - Community reviews and ratings
   - Menu item nutritional display

6. **Visual Wellness Journey**
   - Progress tracking with charts and timelines
   - Weight changes visualization
   - Calorie intake tracking
   - Mood fluctuation monitoring
   - Personalized wellness dashboard

### 4.2 Out of Scope (Future Releases)

❌ Dynamic weekly meal planner (Release 2)  
❌ Smart grocery list generation (Release 2)  
❌ Social community features (follow, share, feed) (Release 2)  
❌ Wearable device integration (Fitbit, Apple Health)  
❌ Native mobile apps (iOS/Android) - MVP is web PWA only  
❌ Multi-language support (English only for MVP)  
❌ E-commerce / food ordering  
❌ Medical-grade diagnostic advice

### 4.3 Scope Boundaries

**Geographic**: United States only (nutritional database, restaurants)  
**Platform**: Web application (desktop and mobile responsive)  
**Data Sources**: USDA FoodData Central, partner restaurants only  
**User Segments**: General consumers (not medical professionals)

---

## 5. Project Deliverables

### 5.1 Software Deliverables

- ✅ Web application (frontend + backend)
- ✅ Database with seed data (≥500 meals, ≥50 restaurants)
- ✅ RAG pipeline (vector database + retrieval logic)
- ✅ LLM integration (AI Concierge)
- ✅ CI/CD pipeline (automated testing and deployment)

### 5.2 Documentation Deliverables

- ✅ Software Project Plan (SPP)
- ✅ Software Requirements Specification (SRS) - IEEE 830
- ✅ Software Architecture Document (SAD)
- ✅ Software Design Document (SDD)
- ✅ Software Test Plan (STP) - IEEE 829
- ✅ User Manual
- ✅ API Documentation (OpenAPI 3.0)

### 5.3 Academic Deliverables

- ✅ Project presentation (final demo)
- ✅ Technical report
- ✅ Source code repository (GitHub)
- ✅ Test coverage report (≥80%)

---

## 6. Project Stakeholders

### 6.1 Team Structure (4-person agile team)

| Role                         | Responsibilities                                       |
| ---------------------------- | ------------------------------------------------------ |
| **Full-Stack Developer** × 2 | Frontend (React), Backend (Python), RAG implementation |
| **AI/ML Engineer** × 1       | LLM integration, prompt engineering, vector database   |
| **DevOps/QA Engineer** × 1   | CI/CD, testing strategy, deployment                    |

**Note:** In an agile small team, roles are fluid - all members contribute to planning, design, and quality assurance.

### 6.2 External Stakeholders

| Stakeholder                    | Interest                                | Influence | Engagement Strategy                      |
| ------------------------------ | --------------------------------------- | --------- | ---------------------------------------- |
| **End Users (Allergy)**        | Safe food recommendations               | High      | User testing, feedback loops             |
| **End Users (Fitness)**        | Accurate nutrition tracking             | High      | Beta testing, surveys                    |
| **Nutritionists & Dietitians** | Client management tools                 | Medium    | Professional partnerships, B2B features  |
| **Restaurant Partners**        | Platform visibility                     | Medium    | Partnership agreements, transparent data |
| **Data Providers**             | API usage, attribution                  | Low       | License agreements                       |
| **Course Instructor (CSC510)** | Academic standards, learning objectives | High      | Regular demos, documentation reviews     |

---

## 7. High-Level Requirements

### 7.1 Functional Requirements (Summary)

- **FR-001 to FR-015**: User account and dual-dimension profile management
- **FR-016 to FR-030**: Scientific nutrition engine with RAG and health tagging
- **FR-031 to FR-045**: AI Health Concierge with conversational memory
- **FR-046 to FR-060**: Restaurant discovery with community reviews
- **FR-061 to FR-075**: Visual wellness journey tracking (charts, timelines, mood)

_(Detailed requirements in SRS document)_

### 7.2 Non-Functional Requirements (Summary)

- **Performance**: P95 response time ≤ 2 seconds
- **Reliability**: System uptime ≥ 99.5%, allergen filter 100% accurate
- **Security**: HTTPS, encrypted data at rest, GDPR/CCPA compliance
- **Usability**: Onboarding completion ≤ 3 minutes, accessibility (WCAG 2.1 Level AA)
- **Scalability**: Support 10,000 concurrent users

_(Detailed NFRs in SRS document)_

---

## 8. Assumptions

1. ✅ Team has access to LLM API (OpenAI/Anthropic) with sufficient credits
2. ✅ USDA FoodData Central API remains freely available
3. ✅ At least 10 restaurant partners willing to provide menu data
4. ✅ Team members have required technical skills (React, Python, RAG)
5. ✅ Users have reliable internet access and modern browsers
6. ✅ No major technology disruptions (API outages, framework deprecations)
7. ✅ Development environment and CI/CD tools available

---

## 9. Constraints

### 9.1 Time Constraints

- **Fixed deadline**: 8 weeks (October 17 - December 12, 2025)
- **Academic calendar**: No buffer for semester breaks
- **Sprint length**: 1-week sprints (no flexibility)

### 9.2 Resource Constraints

- **Team size**: 4 members (fixed)
- **Budget**: $500 for LLM API credits (strict limit)
- **Infrastructure**: Free tier cloud services only (Vercel, Supabase)

### 9.3 Technical Constraints

- **No proprietary databases**: Open-source stack only
- **LLM token limits**: Must implement caching and optimization
- **Data quality**: Dependent on third-party nutritional accuracy

### 9.4 Regulatory Constraints

- **FDA compliance**: Cannot make medical claims or diagnose conditions
- **Privacy laws**: GDPR (if EU users), CCPA (California)
- **Liability**: Must include disclaimer for allergen information accuracy

---

## 10. High-Level Risks

| Risk ID | Description                             | Probability | Impact   | Mitigation                          |
| ------- | --------------------------------------- | ----------- | -------- | ----------------------------------- |
| R-001   | LLM recommends allergen-containing food | Low         | Critical | Multi-layer filtering, manual audit |
| R-002   | Third-party data unavailable/incomplete | High        | High     | Mock data, multiple sources         |
| R-003   | Team member unavailable (sick/drop)     | Medium      | High     | Knowledge sharing, documentation    |
| R-004   | LLM API cost overrun                    | Medium      | Medium   | Caching, request optimization       |
| R-005   | Scope creep from stakeholders           | High        | Medium   | Strict change control process       |
| R-006   | Technical debt accumulating             | High        | Medium   | Code reviews, refactoring sprints   |

_(Detailed risk register in SPP Risk Management Plan)_

---

## 11. High-Level Schedule

### 11.1 Major Milestones

| Milestone                     | Date            | Deliverable                     | Success Criteria        |
| ----------------------------- | --------------- | ------------------------------- | ----------------------- |
| **M1: Project Kickoff**       | Oct 17          | Project Charter, Team formation | Charter approved        |
| **M2: Requirements Complete** | Oct 24 (Week 2) | SRS v1.0, Use Cases             | Stakeholder sign-off    |
| **M3: Architecture Design**   | Oct 31 (Week 3) | SAD v1.0, Tech stack finalized  | Design review passed    |
| **M4: Core Features Demo**    | Nov 14 (Week 5) | Auth, Profile, Recommendations  | Functional demo         |
| **M5: AI Integration**        | Nov 21 (Week 6) | AI Concierge, Restaurant module | End-to-end flow         |
| **M6: Testing Complete**      | Nov 28 (Week 7) | All tests passed, ≥80% coverage | QA sign-off             |
| **M7: MVP Release**           | Dec 5 (Week 8)  | Production deployment           | Acceptance criteria met |
| **M8: Final Presentation**    | Dec 12 (Week 9) | Academic deliverables           | Course requirements met |

### 11.2 Phase Overview

```
Week 1-2: Planning & Requirements
Week 2-3: Architecture & Design
Week 3-6: Development (3 sprints)
Week 6-7: Testing & QA
Week 7-8: Deployment & Documentation
Week 8-9: Presentation Preparation
```

---

## 12. Budget Estimate

| Category           | Item                       | Estimated Cost | Notes              |
| ------------------ | -------------------------- | -------------- | ------------------ |
| **Development**    | Labor (4 members × 200hrs) | $0 (Academic)  | Student project    |
| **Infrastructure** | Hosting (Vercel/Netlify)   | $0             | Free tier          |
| **Database**       | Supabase/PostgreSQL        | $0             | Free tier          |
| **LLM API**        | OpenAI/Anthropic credits   | $300-500       | Main cost          |
| **Data**           | USDA FoodData              | $0             | Public API         |
| **Tools**          | GitHub, CI/CD              | $0             | Free for education |
| **Design**         | Figma, Draw.io             | $0             | Free tier          |
| **Total**          |                            | **~$500**      |                    |

---

## 13. Project Organization

### 13.1 Agile Team Structure

**Team Composition:** 4 members working collaboratively

- **Shared Ownership:** All team members participate in planning, design, development, and testing
- **Pair Programming:** Complex features (RAG, LLM) developed collaboratively
- **Knowledge Sharing:** Daily standups, code reviews, documentation

**Decision-Making Process:**

- **Technical Decisions:** Team consensus after discussion
- **Priority Decisions:** Based on MVP scope and academic requirements
- **Escalation:** Course instructor for scope/timeline conflicts

### 13.2 Communication Plan

- **Daily Standups**: Async updates via Slack
- **Weekly Sprint Review**: Demo progress to instructor
- **Weekly Sprint Planning**: Plan next sprint collaboratively
- **Bi-weekly Stakeholder Update**: 30 min, status report

### 13.3 Tools & Collaboration

- **Code**: GitHub (main repository)
- **Project Management**: GitHub Projects
- **Communication**: Slack, Discord
- **Documentation**: Markdown in repository
- **Design**: Figma (UI), Draw.io (diagrams)

---

## 14. Document Control

**Version:** 1.0  
**Status:** Active  
**Next Review:** Week 4 (November 7, 2025)

### Revision History

| Version | Date         | Changes         |
| ------- | ------------ | --------------- |
| 1.0     | Oct 17, 2025 | Initial version |

---

**END OF PROJECT CHARTER**
