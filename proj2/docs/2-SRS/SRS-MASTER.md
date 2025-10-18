# Software Requirements Specification (SRS)

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Master Requirements Specification (IEEE 830)  
**Version:** 1.0  
**Date:** October 17, 2025

---

## Document Information

**Related Documents:**

- [Project Charter](../0-INITIATION/project-charter.md)
- [SPP Master](../1-SPP/SPP-MASTER.md)
- [SAD Master](../3-DESIGN/3.1-SAD/SAD-MASTER.md)
- [STP Master](../5-STP/STP-MASTER.md)

---

## Table of Contents

### 1. Introduction

- [1.1 Purpose](#11-purpose)
- [1.2 Scope](#12-scope)
- [1.3 Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
- [1.4 References](#14-references)
- [1.5 Overview](#15-overview)

### 2. Overall Description

- [2.1 Product Perspective](#21-product-perspective)
- [2.2 Product Functions](#22-product-functions)
- [2.3 User Characteristics](#23-user-characteristics)
- [2.4 Constraints](#24-constraints)
- [2.5 Assumptions and Dependencies](#25-assumptions-and-dependencies)

### 3. Specific Requirements

- [📄 3.1 Functional Requirements](./3-specific-requirements/3.1-functional-requirements.md) ⭐
- [📄 3.2 Non-Functional Requirements](./3-specific-requirements/3.2-non-functional-requirements.md) ⭐
- [📄 3.3 Interface Requirements](./3-specific-requirements/3.3-interface-requirements.md)
- [📄 3.4 Use Cases](./3-specific-requirements/3.4-use-cases.md) ⭐⭐⭐
- [📄 3.5 User Stories](./3-specific-requirements/3.5-user-stories.md)
- [📄 3.6 Data Requirements](./3-specific-requirements/3.6-data-requirements.md)

### 4. System Models

- [📄 4.1 Use Case Diagrams](./4-system-models.md)
- [📄 4.2 Data Flow Diagrams](./4-system-models.md)
- [📄 4.3 State Diagrams](./4-system-models.md)

### 5. Appendices

- [📄 Appendix A: Glossary](./5-appendices/A-glossary.md)
- [📄 Appendix B: User Personas](./5-appendices/B-user-personas.md) ⭐
- [📄 Appendix C: Assumptions & Dependencies](./5-appendices/C-assumptions-dependencies.md)

### 6. Traceability

- [📄 Requirements Traceability Matrix](./requirements-traceability-matrix.md) ⭐

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the functional and non-functional requirements for the Eatsential MVP platform.

**Intended Audience:**

- **Development Team**: What to build and acceptance criteria
- **Testing**: Test plan creation and validation
- **Architecture**: System design decisions
- **Academic Review**: Adherence to software engineering standards

This document follows **IEEE Standard 830-1998** for Software Requirements Specifications.

### 1.2 Scope

**Product Name:** Eatsential - Precision Nutrition Platform  
**Product Version:** 1.0 (MVP)  
**Release Date:** December 5, 2025 (Week 8)

#### 1.2.1 Product Objectives

Eatsential aims to solve the critical problem of finding food that truly meets individual health needs in an era of information overload. The platform provides:

1. **Zero-Tolerance Safety**: Allergy sufferers can confidently find safe food without risk
2. **Personalized Guidance**: Dual-dimension profiling (physical + mental wellness) for precise recommendations
3. **AI-Powered Assistance**: Conversational interface for real-time nutritional support
4. **Transparent Information**: Verified nutritional data from trusted sources

#### 1.2.2 Benefits

**For Allergy Sufferers:**

- Eliminate life-threatening food selection errors
- Reduce meal planning time from 30 minutes to < 5 minutes
- Increase dining out confidence and social participation

**For Fitness Enthusiasts:**

- Achieve nutrition goals with precise macro tracking
- Optimize training with timing-specific meal recommendations
- Eliminate manual food logging burden

**For Mental Health Conscious:**

- Discover evidence-based mood-food connections
- Receive stress-relief and sleep-optimization meal suggestions
- Improve emotional well-being through nutrition

**For All Users:**

- Save time on meal decisions (estimated 2-3 hours/week)
- Discover new healthy restaurants and recipes
- Make informed dietary choices with explanations

#### 1.2.3 Scope of MVP (Release 1)

**In Scope:**

- User authentication and dual-dimension health profile management
- Scientific nutrition engine with RAG and health-tagging system
- AI Health Concierge (LLM-powered conversational assistant)
- Curated healthy restaurant discovery with allergen filtering
- Community review system
- **Visual wellness journey** (charts, timelines, mood tracking)

**Out of Scope (Release 2):**

- Dynamic meal planner (AI-curated weekly meal plans)
- Smart grocery list generation (aisle-categorized shopping lists)
- Community & social hub (follow, share, activity feed)
- Advanced personalization loop (feedback system refinement)
- Wearable device integration (Future)
- Native mobile applications (Future)
- Professional tools for nutritionists/dietitians (Future)

### 1.3 Definitions, Acronyms, and Abbreviations

**See:** [Appendix A: Glossary](./5-appendices/A-glossary.md) for complete list.

**Key Terms:**

| Term                       | Definition                                                                       |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Allergen**               | A substance that causes an allergic reaction (e.g., peanuts, shellfish)          |
| **Dual-Dimension Profile** | User health profile covering both physical and mental wellness objectives        |
| **Health Tag**             | Categorical label for meal properties (e.g., #HighProtein, #StressRelief)        |
| **Hard Constraint**        | Non-negotiable filter (allergens, religious restrictions)                        |
| **Soft Preference**        | Flexible user preference (cuisine type, spice level)                             |
| **RAG**                    | Retrieval-Augmented Generation (AI technique combining retrieval and generation) |
| **Zero-Tolerance**         | Absolute requirement for allergen filtering (0% false positive rate)             |

**Acronyms:**

| Acronym   | Full Form                           |
| --------- | ----------------------------------- |
| **AI**    | Artificial Intelligence             |
| **API**   | Application Programming Interface   |
| **LLM**   | Large Language Model                |
| **MVP**   | Minimum Viable Product              |
| **NFR**   | Non-Functional Requirement          |
| **RAG**   | Retrieval-Augmented Generation      |
| **SRS**   | Software Requirements Specification |
| **UAT**   | User Acceptance Testing             |
| **UI/UX** | User Interface / User Experience    |

### 1.4 References

**Standards:**

- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- IEEE 829-2008: Standard for Software Test Documentation
- ISO/IEC 25010: Systems and software quality models

**External Documents:**

- [Project Charter](../0-INITIATION/project-charter.md)
- [Software Project Plan](../1-SPP/SPP-MASTER.md)
- [Software Architecture Document](../3-DESIGN/3.1-SAD/SAD-MASTER.md)
- [Software Test Plan](../5-STP/STP-MASTER.md)

**External Resources:**

- USDA FoodData Central API Documentation
- OpenAI GPT-4 API Documentation
- WCAG 2.1 Accessibility Guidelines
- GDPR Compliance Requirements

### 1.5 Overview

This SRS is organized into six main sections:

- **Section 1 (Introduction)**: Purpose, scope, and document overview
- **Section 2 (Overall Description)**: Product context, functions, users, constraints
- **Section 3 (Specific Requirements)**: Detailed functional and non-functional requirements
- **Section 4 (System Models)**: Visual models (use case diagrams, data flows, state machines)
- **Section 5 (Appendices)**: Supporting information (glossary, personas, assumptions)
- **Section 6 (Traceability)**: Requirements-to-design-to-test mapping

Each requirement is uniquely identified (e.g., FR-001, NFR-005) and includes:

- Description
- Priority (P0/P1/P2)
- Acceptance criteria
- Dependencies
- Traceability to design and tests

---

## 2. Overall Description

### 2.1 Product Perspective

#### 2.1.1 System Context

Eatsential is a **new, independent web-based platform** that integrates with external services:

```
┌─────────────────────────────────────────────────────┐
│                  EATSENTIAL PLATFORM                │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Frontend   │  │   Backend    │  │  Database  │ │
│  │  (React)    │◄─┤  (Python)    │◄─┤ (Postgres) │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└──────────┬──────────────┬──────────────┬───────────┘
           │              │              │
  ┌────────▼────┐  ┌──────▼─────┐  ┌────▼────────┐
  │  External   │  │    LLM     │  │  Nutrition  │
  │    APIs     │  │  Service   │  │  Database   │
  │  (OAuth,    │  │ (OpenAI)   │  │   (USDA)    │
  │   Maps)     │  │            │  │             │
  └─────────────┘  └────────────┘  └─────────────┘
```

**External System Interfaces:**

1. **USDA FoodData Central API**: Nutritional data source
2. **OpenAI GPT-4 API**: LLM for AI Concierge
3. **OAuth Providers**: Google/Apple authentication
4. **Map Services**: Google Maps API for restaurant location
5. **Vector Database**: Pinecone/Qdrant for RAG retrieval

#### 2.1.2 Product Position

**Category:** Health & Wellness Technology  
**Deployment:** Cloud-based web application (PWA)  
**Access:** Public internet, desktop and mobile browsers

**Competitive Differentiation:**

- Only platform with dual-dimension wellness profiling (physical + mental health)
- **Visual wellness journey** with beautiful progress tracking charts and timelines
- Zero-tolerance allergen safety (life-critical reliability)
- Explainable AI recommendations with scientific reasoning
- Proprietary health-tagging system (#PostWorkoutRecovery, #StressRelief, #SleepAid)
- Curated healthy restaurant partnerships (quality-vetted, not just listing aggregation)

#### 2.1.3 User Personas

**See:** [📄 Appendix B: User Personas](./5-appendices/B-user-personas.md) for detailed persona analysis.

**Primary User Segments:**

**Persona 1: Sarah - The Safety-First Parent**

- **Age:** 32, working mother of a child with severe peanut allergy
- **Technical Comfort:** Medium (uses food apps, health trackers)
- **Needs:** Zero-tolerance allergen filtering, **visual tracking** of safe meals over time
- **Pain Point:** "I need 100% certainty every meal is safe - one mistake is life-threatening"
- **Key Use Case:** Track child's safe meal history with **charts**, discover allergen-free restaurants

**Persona 2: Marcus - The Performance Optimizer**

- **Age:** 28, CrossFit enthusiast and software engineer
- **Technical Comfort:** High (power user, loves data visualization)
- **Needs:** Macro-optimized meals, **progress visualization** of fitness metrics
- **Pain Point:** "I waste hours calculating macros manually"
- **Key Use Case:** Hit protein targets, **track weight/calorie trends with timeline graphs**, discover post-workout meals

**Persona 3: Emily - The Mental Wellness Seeker**

- **Age:** 24, graduate student managing anxiety
- **Technical Comfort:** Medium-High (active on wellness apps)
- **Needs:** Stress-relief foods (#StressRelief, #SleepAid), **mood tracking visualization**
- **Pain Point:** "Food affects my mood but I don't know what to eat when stressed"
- **Key Use Case:** Improve sleep through nutrition, **visualize mood fluctuations** correlating with diet

**Secondary User Segment (Future B2B):**

**Persona 4: Dr. Priya - The Professional Nutritionist**

- **Age:** 38, registered dietitian managing 20+ clients
- **Technical Comfort:** Medium (uses professional nutrition software)
- **Needs:** Client progress dashboard, evidence-based recommendations, **visual reports for clients**
- **Pain Point:** "I need efficient tools to track multiple client compliance and demonstrate progress"
- **Key Use Case:** Monitor client meal adherence, share personalized plans, present progress with data

### 2.2 Product Functions

**High-Level Feature Summary** (Detailed in Section 3):

1. **User Management** (FR-001 to FR-015)
   - Secure account creation and authentication
   - Dual-dimension health profile onboarding (physical + mental wellness)
   - Profile editing with safety confirmations

2. **Scientific Nutrition Engine** (FR-016 to FR-030)
   - RAG-based meal recommendations with vast nutritional database
   - Proprietary health-tagging system (#PostWorkoutRecovery, #StressRelief, #SleepAid)
   - Multi-objective scoring (nutrition, taste, budget, goals)
   - Hard constraint filtering (allergens, restrictions)
   - Explainable recommendations with scientific reasoning

3. **AI Health Concierge** (FR-031 to FR-045)
   - LLM-powered natural language conversation interface
   - Context-aware responses with conversational memory
   - Tool calling (nutrition queries, restaurant search)
   - Real-time personalized nutritional advice
   - Safety instruction compliance (no unsafe recommendations)

4. **Curated Healthy Restaurants** (FR-046 to FR-060)
   - Exclusive partnerships with quality-vetted restaurants
   - Geographic search with map visualization
   - Allergen-friendly restaurant filtering
   - Transparent nutritional menu information display
   - Community reviews and ratings

5. **Visual Wellness Journey** (FR-061 to FR-075)
   - Progress tracking with beautiful charts and timelines
   - Weight changes visualization
   - Calorie intake monitoring
   - Mood fluctuation tracking (mental wellness dimension)
   - Personalized wellness dashboard showing growth

6. **Safety & Compliance** (Cross-cutting)
   - Zero-tolerance allergen filtering across all features
   - Data privacy and encryption
   - Audit logging for safety-critical operations

### 2.3 User Characteristics

**Primary User Personas** (Detailed in [Appendix B](./5-appendices/B-user-personas.md)):

#### Persona 1: Allergy Safety Guardian (P0 Priority)

- **Profile**: Individuals with life-threatening food allergies
- **Technical Skill**: Medium (comfortable with apps)
- **Primary Need**: Absolute certainty of allergen-free food
- **Key Requirement**: Zero false positives in allergen filtering
- **Example**: Sarah, 29, teacher with severe peanut allergy

#### Persona 2: Fitness Optimizer (P0 Priority)

- **Profile**: Athletes and bodybuilders tracking macros
- **Technical Skill**: High (tech-savvy, uses multiple apps)
- **Primary Need**: Precise nutritional data for goal achievement
- **Key Requirement**: Accurate macro counts, timing-specific recommendations
- **Example**: Marcus, 26, software engineer aiming for muscle gain

#### Persona 3: Mental Wellness Seeker (P1 Priority)

- **Profile**: Professionals seeking stress management through nutrition
- **Technical Skill**: Medium-High (early wellness tech adopter)
- **Primary Need**: Evidence-based mood-food recommendations
- **Key Requirement**: Scientific explanations for mental health benefits
- **Example**: Emily, 34, marketing director with anxiety and sleep issues

#### Persona 4: Lifestyle Diet Adherent (P1 Priority)

- **Profile**: Individuals following ethical/philosophical diets
- **Technical Skill**: Medium
- **Primary Need**: Multi-constraint compliance (e.g., vegan + no alliums)
- **Key Requirement**: Comprehensive ingredient transparency
- **Example**: Priya, 31, yoga instructor following vegan + Ayurvedic principles

**User Demographics:**

- **Age Range**: 25-45 (primary), 18-65 (secondary)
- **Geography**: United States (MVP), global expansion planned
- **Education**: College-educated, health-conscious
- **Income**: Middle to upper-middle class (can afford premium subscriptions)
- **Tech Proficiency**: Comfortable with modern web applications

### 2.4 Constraints

#### 2.4.1 Regulatory Constraints

- **FDA Compliance**: Cannot make medical claims or diagnose conditions
- **HIPAA**: Not applicable (not collecting protected health information)
- **GDPR**: Must comply if EU users access platform
- **CCPA**: Must comply for California users
- **Allergen Liability**: Prominent disclaimers required

#### 2.4.2 Technical Constraints

- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Network**: Requires stable internet connection (no offline mode in MVP)
- **LLM Rate Limits**: OpenAI API rate limits (60 requests/minute)
- **Data Sources**: Dependent on USDA API availability and accuracy
- **Budget**: $500 total budget limits LLM usage

#### 2.4.3 Time Constraints

- **Fixed Deadline**: 8 weeks from October 17 to December 5, 2025
- **No Extensions**: Academic calendar is non-negotiable
- **Sprint Lock**: 1-week sprint cycles (8 sprints total)

#### 2.4.4 Resource Constraints

- **Team Size**: 4 members (cannot increase)
- **Infrastructure**: Free tier hosting only (Vercel, Supabase)
- **External Services**: Free/developer tiers only

#### 2.4.5 Design Constraints

- **Architecture**: For MVP, microservices are not required due to resource constraints; a monolithic backend is acceptable provided it supports horizontal scaling (e.g., stateless API, ability to run multiple instances). The system should be designed to allow future transition to microservices for independent scaling as per NFR-003.
- **Database**: PostgreSQL (no NoSQL in MVP)
- **Frontend**: React (already chosen, no alternatives)
- **Backend**: Python (already chosen, no alternatives)

### 2.5 Assumptions and Dependencies

#### 2.5.1 Assumptions

1. **User Behavior**
   - Users will spend 2-3 minutes completing profile onboarding
   - Users will provide accurate allergy and health information
   - Users understand platform is not medical advice

2. **Data Availability**
   - USDA FoodData Central API remains free and accessible
   - At least 10 restaurants willing to provide menu data
   - Nutritional data accuracy within ±10% acceptable

3. **Technical Environment**
   - Users have modern browsers with JavaScript enabled
   - Users have reliable internet (3G minimum)
   - LLM API (OpenAI) remains stable and affordable

4. **Team Capability**
   - All team members proficient in chosen tech stack
   - Team can dedicate 20-30 hours/week to project
   - No major team member unavailability (illness, drop-out)

#### 2.5.2 Dependencies

**Critical Dependencies:**

1. **OpenAI GPT-4 API**: Core AI Concierge functionality depends on this
2. **USDA FoodData Central**: Primary nutritional data source
3. **Vector Database Service**: Required for RAG implementation
4. **OAuth Providers**: Required for user authentication

**Important Dependencies:** 5. **Map API**: Required for restaurant discovery 6. **Hosting Platform**: Vercel/Netlify for deployment 7. **Database Service**: Supabase for PostgreSQL hosting

**Mitigation Plans:**

- **If OpenAI unavailable**: Fallback to Anthropic Claude or open-source LLM
- **If USDA API down**: Use cached data, show "offline mode" warning
- **If OAuth fails**: Fallback to email/password authentication
- **If hosting issues**: Deploy to alternative platform (Render, Railway)

---

## 3. Specific Requirements

### 3.1 Functional Requirements

**See:** [📄 3.1-functional-requirements.md](./3-specific-requirements/3.1-functional-requirements.md)

**Summary:** 75 functional requirements organized into 6 modules:

- FR-001 to FR-015: User Management & Dual-Dimension Profile
- FR-016 to FR-030: Scientific Nutrition Engine (RAG + Health Tagging)
- FR-031 to FR-045: AI Health Concierge (LLM Conversation)
- FR-046 to FR-060: Curated Healthy Restaurants
- FR-061 to FR-075: Visual Wellness Journey (Progress Tracking)

### 3.2 Non-Functional Requirements

**See:** [📄 3.2-non-functional-requirements.md](./3-specific-requirements/3.2-non-functional-requirements.md)

**Summary:** 30 non-functional requirements covering:

- NFR-001 to NFR-008: Performance
- NFR-009 to NFR-015: Reliability & Availability
- NFR-016 to NFR-023: Security & Privacy
- NFR-024 to NFR-030: AI-Specific Requirements

### 3.3 Interface Requirements

**See:** [📄 3.3-interface-requirements.md](./3-specific-requirements/3.3-interface-requirements.md)

### 3.4 Use Cases ⭐⭐⭐

**See:** [📄 3.4-use-cases.md](./3-specific-requirements/3.4-use-cases.md)

**Summary:** 20 detailed use cases covering all user interactions:

- UC-001 to UC-005: User onboarding
- UC-006 to UC-010: Meal recommendations
- UC-011 to UC-015: AI conversations
- UC-016 to UC-020: Restaurant discovery

### 3.5 User Stories

**See:** [📄 3.5-user-stories.md](./3-specific-requirements/3.5-user-stories.md)

### 3.6 Data Requirements

**See:** [📄 3.6-data-requirements.md](./3-specific-requirements/3.6-data-requirements.md)

---

## 4. System Models

**See:** [📄 4-system-models.md](./4-system-models.md)

Includes:

- Use case diagrams for all major features
- Data flow diagrams for recommendation engine
- State diagrams for user profile lifecycle

---

## 5. Appendices

### Appendix A: Glossary

**See:** [📄 5-appendices/A-glossary.md](./5-appendices/A-glossary.md)

### Appendix B: User Personas ⭐

**See:** [📄 5-appendices/B-user-personas.md](./5-appendices/B-user-personas.md)

Four detailed personas with scenarios, pain points, and success metrics.

### Appendix C: Assumptions & Dependencies

**See:** [📄 5-appendices/C-assumptions-dependencies.md](./5-appendices/C-assumptions-dependencies.md)

---

## 6. Requirements Traceability

**See:** [📄 requirements-traceability-matrix.md](./requirements-traceability-matrix.md)

Complete mapping:

- Business Objectives → Functional Requirements
- Functional Requirements → Use Cases
- Use Cases → Design Components
- Design Components → Test Cases

---

## Document Revision History

| Version | Date         | Changes         |
| ------- | ------------ | --------------- |
| 1.0     | Oct 17, 2025 | Initial version |

---

**END OF SRS MASTER DOCUMENT**

**Next:** Review detailed requirements in subsections linked above.
