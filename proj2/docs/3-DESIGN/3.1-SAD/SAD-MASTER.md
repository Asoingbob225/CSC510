# Software Architecture Document (SAD)

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Master Architecture Document (IEEE 1471/ISO 42010)  
**Version:** 1.0  
**Date:** October 19, 2025  
**Architect:** Technical Lead

---

## Document Information

**Related Documents:**

- [SRS Master](../../2-SRS/SRS-MASTER.md)
- [Project Charter](../../0-INITIATION/project-charter.md)
- [Risk Management](../../1-SPP/risk-management.md)
- [SDD Master](../3.2-SDD/SDD-MASTER.md)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architectural Representation](#2-architectural-representation)
3. [Architectural Goals and Constraints](#3-architectural-goals-and-constraints)
4. [System Overview](#4-system-overview)
5. [Architectural Views](#5-architectural-views)
6. [System Architecture](#6-system-architecture)
7. [Data Architecture](#7-data-architecture)
8. [Security Architecture](#8-security-architecture)
9. [AI/ML Architecture](#9-aiml-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Performance & Scalability](#11-performance--scalability)
12. [Architectural Decisions](#12-architectural-decisions)

---

## 1. Introduction

### 1.1 Purpose

This Software Architecture Document provides a comprehensive architectural overview of the Eatsential platform, using multiple architectural views to depict different aspects of the system. It serves as a communication medium between the software architect and other project team members regarding architecturally significant decisions.

### 1.2 Scope

This document describes the architecture of Eatsential MVP (Version 1.0), an AI-powered precision nutrition platform that provides personalized meal recommendations based on individual health profiles, dietary restrictions, and wellness goals.

### 1.3 Definitions and Acronyms

| Term      | Definition                                          |
| --------- | --------------------------------------------------- |
| **RAG**   | Retrieval-Augmented Generation                      |
| **LLM**   | Large Language Model                                |
| **API**   | Application Programming Interface                   |
| **ML**    | Machine Learning                                    |
| **HIPAA** | Health Insurance Portability and Accountability Act |
| **PII**   | Personally Identifiable Information                 |
| **CDN**   | Content Delivery Network                            |
| **WAF**   | Web Application Firewall                            |

---

## 2. Architectural Representation

### 2.1 Architecture Framework

We follow the **C4 Model** for visualizing software architecture:

- **Level 1:** System Context
- **Level 2:** Container Diagram
- **Level 3:** Component Diagram
- **Level 4:** Code/Class Diagrams (in SDD)

### 2.2 Architectural Patterns

**Primary Patterns:**

- **Microservices Architecture** - For scalability and independent deployment
- **Event-Driven Architecture** - For real-time updates and decoupling
- **RAG Pattern** - For AI-powered recommendations
- **API Gateway Pattern** - For unified API management
- **CQRS** - For read/write optimization

---

## 3. Architectural Goals and Constraints

### 3.1 Business Goals

1. **Safety First:** Zero-tolerance for allergen misidentification
2. **Personalization:** Unique recommendations per user
3. **Real-time:** <200ms response time for recommendations
4. **Scalability:** Support 1M+ active users
5. **Reliability:** 99.9% uptime SLA

### 3.2 Technical Constraints

1. **Regulatory:** HIPAA compliance for health data
2. **Security:** End-to-end encryption required
3. **Performance:** Sub-second response times
4. **Budget:** $1M development budget
5. **Timeline:** 8-week MVP delivery

### 3.3 Quality Attributes

| Attribute           | Priority | Target Metric        |
| ------------------- | -------- | -------------------- |
| **Security**        | Critical | Zero breaches        |
| **Performance**     | High     | <200ms p95           |
| **Scalability**     | High     | 10K concurrent users |
| **Reliability**     | High     | 99.9% uptime         |
| **Maintainability** | Medium   | <4hr fix time        |
| **Usability**       | High     | <5min onboarding     |

---

## 4. System Overview

### 4.1 System Context Diagram (C4 Level 1)

```mermaid
graph TB
    subgraph "Eatsential Ecosystem"
        User[User<br/>Health-conscious individuals]
        Admin[Admin<br/>System administrators]
        Restaurant[Restaurant Partners<br/>Verified establishments]

        System[Eatsential Platform<br/>AI-powered nutrition system]

        Email[Email Service<br/>SendGrid]
        Payment[Payment Service<br/>Stripe]
        Maps[Maps Service<br/>Google Maps]
        AI[AI Service<br/>OpenAI/Claude]
        Auth[Auth Service<br/>Auth0]
        Storage[Cloud Storage<br/>AWS S3]
        Nutrition[Nutrition DB<br/>USDA Database]
    end

    User -->|Uses| System
    Admin -->|Manages| System
    Restaurant -->|Provides data| System

    System -->|Sends notifications| Email
    System -->|Processes payments| Payment
    System -->|Gets locations| Maps
    System -->|LLM queries| AI
    System -->|Authentication| Auth
    System -->|Stores files| Storage
    System -->|Validates nutrition| Nutrition
```

### 4.2 High-Level Architecture

**Frontend Layer:**

- React SPA with TypeScript
- Progressive Web App (PWA)
- Responsive design

**Backend Layer:**

- FastAPI (Python) microservices
- GraphQL Federation
- Event streaming (Kafka)

**Data Layer:**

- PostgreSQL (primary)
- Redis (caching)
- Elasticsearch (search)
- S3 (file storage)

**AI/ML Layer:**

- RAG pipeline
- LLM integration
- Custom ML models

---

## 5. Architectural Views

### 5.1 Logical View

```mermaid
classDiagram
    class User {
        +id: UUID
        +email: string
        +profile: HealthProfile
        +preferences: Preferences
        +authenticate()
        +updateProfile()
    }

    class HealthProfile {
        +allergies: List~Allergy~
        +conditions: List~Condition~
        +goals: List~Goal~
        +metrics: BiometricData
        +validate()
        +calculateNeeds()
    }

    class Recommendation {
        +id: UUID
        +user: User
        +meals: List~Meal~
        +confidence: float
        +reasoning: string
        +generate()
        +personalize()
    }

    class Meal {
        +id: UUID
        +name: string
        +nutrition: NutritionData
        +ingredients: List~Ingredient~
        +allergens: List~Allergen~
        +restaurant: Restaurant
        +validate()
    }

    class AIEngine {
        +model: LLMModel
        +rag: RAGPipeline
        +recommend()
        +validate()
        +explain()
    }

    User "1" --> "1" HealthProfile
    User "1" --> "*" Recommendation
    Recommendation "1" --> "*" Meal
    AIEngine ..> Recommendation : generates
```

### 5.2 Process View

```mermaid
sequenceDiagram
    participant U as User
    participant API as API Gateway
    participant Auth as Auth Service
    participant Prof as Profile Service
    participant AI as AI Engine
    participant Val as Validation Service
    participant DB as Database

    U->>API: Request recommendations
    API->>Auth: Validate token
    Auth-->>API: Token valid

    API->>Prof: Get user profile
    Prof->>DB: Query profile
    DB-->>Prof: Profile data
    Prof-->>API: Complete profile

    API->>AI: Generate recommendations
    AI->>AI: RAG processing
    AI->>Val: Validate safety
    Val-->>AI: Safety confirmed
    AI-->>API: Recommendations

    API-->>U: Personalized meals
```

### 5.3 Development View

```
eatsential/
├── frontend/                 # React TypeScript SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route-based pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API clients
│   │   ├── stores/         # State management
│   │   └── utils/          # Helper functions
│   └── public/             # Static assets
│
├── backend/                 # FastAPI microservices
│   ├── api-gateway/        # Kong/FastAPI gateway
│   ├── auth-service/       # Authentication
│   ├── profile-service/    # User profiles
│   ├── recommendation-service/ # AI recommendations
│   ├── restaurant-service/ # Restaurant data
│   ├── notification-service/ # Email/Push
│   └── shared/            # Common libraries
│
├── ai/                     # AI/ML components
│   ├── rag-pipeline/      # RAG implementation
│   ├── models/            # Custom ML models
│   ├── validators/        # Safety validators
│   └── training/          # Model training
│
├── infrastructure/         # IaC and deployment
│   ├── terraform/         # Infrastructure as Code
│   ├── kubernetes/        # K8s manifests
│   ├── docker/           # Dockerfiles
│   └── scripts/          # Deployment scripts
│
└── docs/                  # Documentation
```

---

## 6. System Architecture

### 6.1 Container Diagram (C4 Level 2)

```mermaid
graph TB
    subgraph "Frontend"
        WebApp[Web Application<br/>React SPA]
        MobileApp[Mobile App<br/>React Native]
    end

    subgraph "API Layer"
        Gateway[API Gateway<br/>Kong]
        GraphQL[GraphQL Server<br/>Apollo Federation]
    end

    subgraph "Microservices"
        AuthSvc[Auth Service<br/>FastAPI + Auth0]
        ProfileSvc[Profile Service<br/>FastAPI]
        RecSvc[Recommendation Service<br/>FastAPI + AI]
        RestSvc[Restaurant Service<br/>FastAPI]
        NotifSvc[Notification Service<br/>FastAPI]
    end

    subgraph "AI/ML Layer"
        RAG[RAG Engine<br/>LangChain]
        LLM[LLM Service<br/>OpenAI/Claude]
        MLModels[ML Models<br/>TensorFlow]
        Validator[Safety Validator<br/>Rule Engine]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Primary DB)]
        Redis[(Redis<br/>Cache)]
        Elastic[(Elasticsearch<br/>Search)]
        S3[(S3<br/>File Storage)]
        Kafka[Kafka<br/>Event Stream]
    end

    WebApp --> Gateway
    MobileApp --> Gateway
    Gateway --> GraphQL
    GraphQL --> AuthSvc
    GraphQL --> ProfileSvc
    GraphQL --> RecSvc
    GraphQL --> RestSvc

    RecSvc --> RAG
    RAG --> LLM
    RAG --> MLModels
    RecSvc --> Validator

    AuthSvc --> Postgres
    ProfileSvc --> Postgres
    RestSvc --> Postgres
    RecSvc --> Redis
    RestSvc --> Elastic

    NotifSvc --> Kafka
    RecSvc --> Kafka
```

### 6.2 Component Diagram - Recommendation Service (C4 Level 3)

```mermaid
graph TB
    subgraph "Recommendation Service"
        API[REST API<br/>FastAPI]
        Controller[Recommendation Controller]
        Engine[AI Engine]

        subgraph "Core Components"
            ProfileMgr[Profile Manager]
            MealMatcher[Meal Matcher]
            SafetyCheck[Safety Checker]
            Personalizer[Personalizer]
            Explainer[Explanation Generator]
        end

        subgraph "AI Components"
            RAGProc[RAG Processor]
            LLMClient[LLM Client]
            MLPredictor[ML Predictor]
            PromptMgr[Prompt Manager]
        end

        subgraph "Data Access"
            ProfileRepo[Profile Repository]
            MealRepo[Meal Repository]
            CacheRepo[Cache Repository]
        end
    end

    API --> Controller
    Controller --> Engine
    Engine --> ProfileMgr
    Engine --> MealMatcher
    Engine --> SafetyCheck
    Engine --> Personalizer
    Engine --> Explainer

    MealMatcher --> RAGProc
    Personalizer --> MLPredictor
    Explainer --> LLMClient
    RAGProc --> PromptMgr

    ProfileMgr --> ProfileRepo
    MealMatcher --> MealRepo
    Engine --> CacheRepo
```

---

## 7. Data Architecture

### 7.1 Data Model Overview

```mermaid
erDiagram
    USER ||--o{ HEALTH_PROFILE : has
    USER ||--o{ PREFERENCE : has
    USER ||--o{ RECOMMENDATION : receives

    HEALTH_PROFILE ||--o{ ALLERGY : contains
    HEALTH_PROFILE ||--o{ HEALTH_CONDITION : contains
    HEALTH_PROFILE ||--o{ WELLNESS_GOAL : contains
    HEALTH_PROFILE ||--o{ BIOMETRIC_DATA : tracks

    RECOMMENDATION ||--o{ RECOMMENDED_MEAL : includes
    RECOMMENDED_MEAL }o--|| MEAL : references

    MEAL ||--o{ MEAL_INGREDIENT : contains
    MEAL_INGREDIENT }o--|| INGREDIENT : uses
    INGREDIENT ||--o{ ALLERGEN : may_contain

    MEAL }o--|| RESTAURANT : served_by
    RESTAURANT ||--o{ RESTAURANT_HOURS : has
    RESTAURANT ||--o{ CUISINE_TYPE : offers

    USER {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
        timestamp updated_at
        boolean is_active
        string role
    }

    HEALTH_PROFILE {
        uuid id PK
        uuid user_id FK
        json medical_conditions
        date birth_date
        string gender
        float height_cm
        float weight_kg
        string activity_level
        json dietary_restrictions
    }

    MEAL {
        uuid id PK
        string name
        text description
        json nutrition_facts
        float calories
        float protein_g
        float carbs_g
        float fat_g
        string[] tags
        boolean is_verified
    }
```

### 7.2 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Data Sources"
        UserInput[User Input]
        RestAPI[Restaurant APIs]
        NutrDB[Nutrition Database]
        IoT[Wearable Devices]
    end

    subgraph "Ingestion Layer"
        APIGateway[API Gateway]
        ETL[ETL Pipeline]
        Stream[Stream Processor]
    end

    subgraph "Processing Layer"
        Validate[Validation Service]
        Transform[Transformation Service]
        Enrich[Enrichment Service]
    end

    subgraph "Storage Layer"
        subgraph "Hot Data"
            Cache[Redis Cache]
            Primary[PostgreSQL]
        end

        subgraph "Warm Data"
            Search[Elasticsearch]
            Analytics[ClickHouse]
        end

        subgraph "Cold Data"
            Archive[S3 Archive]
        end
    end

    subgraph "Serving Layer"
        QueryAPI[Query API]
        MLServing[ML Serving]
        ReportEngine[Report Engine]
    end

    UserInput --> APIGateway
    RestAPI --> ETL
    NutrDB --> ETL
    IoT --> Stream

    APIGateway --> Validate
    ETL --> Transform
    Stream --> Enrich

    Validate --> Primary
    Transform --> Primary
    Enrich --> Cache

    Primary --> Search
    Primary --> Analytics
    Analytics --> Archive

    Cache --> QueryAPI
    Primary --> QueryAPI
    Search --> MLServing
    Analytics --> ReportEngine
```

### 7.3 Data Governance

**Data Classification:**

- **Critical:** Health data, allergen info (encrypted, audited)
- **Sensitive:** PII, payment info (encrypted, restricted)
- **Internal:** Analytics, logs (pseudonymized)
- **Public:** Restaurant info, general nutrition

**Data Retention:**

- Active user data: Indefinite
- Inactive user data: 7 years
- Logs: 90 days
- Analytics: 2 years

---

## 8. Security Architecture

### 8.1 Security Layers

```mermaid
graph TB
    subgraph "Edge Security"
        CDN[CloudFlare CDN]
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
    end

    subgraph "Network Security"
        VPC[VPC Network]
        SG[Security Groups]
        NACLs[Network ACLs]
        VPN[VPN Gateway]
    end

    subgraph "Application Security"
        AuthN[Authentication<br/>OAuth2/JWT]
        AuthZ[Authorization<br/>RBAC]
        Encryption[Encryption<br/>TLS 1.3]
        InputVal[Input Validation]
    end

    subgraph "Data Security"
        EncRest[Encryption at Rest<br/>AES-256]
        EncTransit[Encryption in Transit<br/>TLS]
        KeyMgmt[Key Management<br/>AWS KMS]
        Backup[Encrypted Backups]
    end

    subgraph "Monitoring"
        SIEM[SIEM System]
        IDS[Intrusion Detection]
        Audit[Audit Logging]
        Compliance[Compliance Scanning]
    end

    Internet --> CDN
    CDN --> WAF
    WAF --> DDoS
    DDoS --> VPC

    VPC --> SG
    SG --> NACLs

    App[Application] --> AuthN
    AuthN --> AuthZ
    AuthZ --> Encryption
    Encryption --> InputVal

    InputVal --> EncTransit
    EncTransit --> EncRest
    EncRest --> KeyMgmt

    All --> SIEM
    SIEM --> IDS
    IDS --> Audit
    Audit --> Compliance
```

### 8.2 Authentication & Authorization

**Authentication Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Gateway
    participant AuthService
    participant Database

    User->>Frontend: Login request
    Frontend->>Gateway: POST /auth/login
    Gateway->>AuthService: Validate credentials
    AuthService->>Database: Check user
    Database-->>AuthService: User data
    AuthService->>AuthService: Generate JWT
    AuthService-->>Gateway: JWT + Refresh token
    Gateway-->>Frontend: Auth tokens
    Frontend->>Frontend: Store tokens
    Frontend-->>User: Login success
```

**Authorization Model:**

- **RBAC** with fine-grained permissions
- **Resource-based** access control
- **Attribute-based** policies for complex rules

### 8.3 Threat Model

| Threat            | Impact   | Mitigation                            |
| ----------------- | -------- | ------------------------------------- |
| **SQL Injection** | High     | Parameterized queries, ORMs           |
| **XSS**           | Medium   | Content Security Policy, sanitization |
| **CSRF**          | Medium   | CSRF tokens, SameSite cookies         |
| **Data Breach**   | Critical | Encryption, access controls           |
| **DDoS**          | High     | CloudFlare, rate limiting             |
| **API Abuse**     | Medium   | Rate limiting, API keys               |

---

## 9. AI/ML Architecture

### 9.1 RAG Pipeline Architecture

```mermaid
graph LR
    subgraph "Document Processing"
        Docs[Restaurant Menus<br/>Nutrition Data]
        Chunk[Chunking Service]
        Embed[Embedding Service]
        VectorDB[(Vector Database<br/>Pinecone)]
    end

    subgraph "Query Processing"
        Query[User Query]
        QEmbed[Query Embedding]
        Retrieve[Retriever]
        Rerank[Reranker]
    end

    subgraph "Generation"
        Context[Context Builder]
        Prompt[Prompt Template]
        LLM[LLM Service]
        Validate[Response Validator]
    end

    subgraph "Output"
        Format[Formatter]
        Safety[Safety Check]
        Response[Final Response]
    end

    Docs --> Chunk
    Chunk --> Embed
    Embed --> VectorDB

    Query --> QEmbed
    QEmbed --> Retrieve
    Retrieve --> VectorDB
    VectorDB --> Rerank

    Rerank --> Context
    Context --> Prompt
    Prompt --> LLM
    LLM --> Validate

    Validate --> Format
    Format --> Safety
    Safety --> Response
```

### 9.2 ML Model Architecture

```mermaid
graph TB
    subgraph "Feature Engineering"
        UserFeatures[User Features<br/>Demographics, Health]
        MealFeatures[Meal Features<br/>Nutrition, Ingredients]
        ContextFeatures[Context Features<br/>Time, Location]

        FeatureStore[(Feature Store<br/>Feast)]
    end

    subgraph "Model Training"
        DataPipeline[Data Pipeline]
        Training[Training Service<br/>Kubeflow]
        Evaluation[Model Evaluation]
        Registry[Model Registry<br/>MLflow]
    end

    subgraph "Model Serving"
        Predictor[Prediction Service<br/>TensorFlow Serving]
        Cache[Prediction Cache]
        Monitor[Model Monitor]
        ABTest[A/B Testing]
    end

    UserFeatures --> FeatureStore
    MealFeatures --> FeatureStore
    ContextFeatures --> FeatureStore

    FeatureStore --> DataPipeline
    DataPipeline --> Training
    Training --> Evaluation
    Evaluation --> Registry

    Registry --> Predictor
    Predictor --> Cache
    Predictor --> Monitor
    Monitor --> ABTest
```

### 9.3 AI Safety Architecture

**Multi-Layer Safety System:**

1. **Input Validation**
   - Allergen keyword detection
   - Medical condition filtering
   - Age-appropriate recommendations

2. **RAG Safety**
   - Source verification
   - Fact-checking layer
   - Confidence thresholds

3. **Output Validation**
   - Rule-based checks
   - Human-in-the-loop for critical cases
   - Explanation generation

---

## 10. Deployment Architecture

### 10.1 Infrastructure Overview

```mermaid
graph TB
    subgraph "AWS Cloud"
        subgraph "Region: us-east-1"
            subgraph "VPC"
                subgraph "Public Subnet"
                    ALB[Application Load Balancer]
                    NAT[NAT Gateway]
                end

                subgraph "Private Subnet 1"
                    subgraph "EKS Cluster"
                        Frontend[Frontend Pods]
                        Backend[Backend Pods]
                        Workers[Worker Pods]
                    end
                end

                subgraph "Private Subnet 2"
                    subgraph "Data Tier"
                        RDS[(RDS PostgreSQL<br/>Multi-AZ)]
                        ElastiCache[(ElastiCache<br/>Redis)]
                        ES[(Elasticsearch<br/>Cluster)]
                    end
                end
            end
        end

        subgraph "Global Services"
            CloudFront[CloudFront CDN]
            Route53[Route53 DNS]
            S3[(S3 Buckets)]
            Secrets[Secrets Manager]
        end
    end

    Internet --> CloudFront
    CloudFront --> ALB
    ALB --> Frontend
    Frontend --> Backend
    Backend --> RDS
    Backend --> ElastiCache
    Backend --> ES
    Workers --> S3
```

### 10.2 Kubernetes Architecture

```yaml
# Namespace Structure
namespaces:
  - eatsential-prod
  - eatsential-staging
  - eatsential-dev

# Key Deployments
deployments:
  frontend:
    replicas: 3
    resources:
      requests:
        cpu: 500m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 1Gi

  backend-services:
    - name: auth-service
      replicas: 2
      autoscaling: true

    - name: profile-service
      replicas: 3
      autoscaling: true

    - name: recommendation-service
      replicas: 5
      autoscaling: true
      gpu: true # For ML inference

    - name: restaurant-service
      replicas: 3
      autoscaling: true

# Ingress Configuration
ingress:
  class: nginx
  tls: true
  cert-manager: letsencrypt

# Service Mesh
serviceMesh:
  provider: istio
  features:
    - mTLS
    - traffic-management
    - observability
```

### 10.3 CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        Dev[Developer]
        LocalTest[Local Tests]
    end

    subgraph "CI Pipeline"
        GitHub[GitHub]
        Actions[GitHub Actions]

        subgraph "Build Stage"
            Lint[Linting]
            UnitTest[Unit Tests]
            Build[Docker Build]
            Scan[Security Scan]
        end

        subgraph "Test Stage"
            IntTest[Integration Tests]
            E2ETest[E2E Tests]
            PerfTest[Performance Tests]
        end
    end

    subgraph "CD Pipeline"
        subgraph "Staging"
            StageHelm[Helm Deploy]
            StageTest[Smoke Tests]
            StageApprove[Manual Approval]
        end

        subgraph "Production"
            ProdHelm[Helm Deploy]
            ProdCanary[Canary Deploy]
            ProdMonitor[Monitoring]
            ProdRollback[Auto Rollback]
        end
    end

    Dev --> LocalTest
    LocalTest --> GitHub
    GitHub --> Actions

    Actions --> Lint
    Lint --> UnitTest
    UnitTest --> Build
    Build --> Scan

    Scan --> IntTest
    IntTest --> E2ETest
    E2ETest --> PerfTest

    PerfTest --> StageHelm
    StageHelm --> StageTest
    StageTest --> StageApprove

    StageApprove --> ProdHelm
    ProdHelm --> ProdCanary
    ProdCanary --> ProdMonitor
    ProdMonitor -.-> ProdRollback
```

---

## 11. Performance & Scalability

### 11.1 Performance Targets

| Metric                        | Target     | Current Design Capability |
| ----------------------------- | ---------- | ------------------------- |
| **API Response Time**         | <200ms p95 | 150ms (with caching)      |
| **Recommendation Generation** | <1s        | 800ms (with RAG)          |
| **Concurrent Users**          | 10,000     | 15,000                    |
| **Requests/Second**           | 5,000      | 7,500                     |
| **Database Queries**          | <50ms      | 30ms (with indexing)      |
| **Cache Hit Rate**            | >80%       | 85% (Redis)               |

### 11.2 Scalability Strategy

**Horizontal Scaling:**

- Kubernetes HPA for automatic pod scaling
- Database read replicas
- Elasticsearch cluster expansion
- CDN for static assets

**Vertical Scaling:**

- GPU nodes for ML inference
- High-memory nodes for caching
- Optimized instance types

**Data Partitioning:**

- User data sharded by user_id
- Time-series data partitioned by date
- Geographic sharding for restaurants

### 11.3 Caching Strategy

```mermaid
graph TB
    subgraph "Multi-Layer Cache"
        CDN[CDN Cache<br/>Static assets]
        AppCache[Application Cache<br/>Redis]
        DBCache[Database Cache<br/>Query cache]

        subgraph "Cache Types"
            UserCache[User Profiles<br/>TTL: 1hr]
            MealCache[Meal Data<br/>TTL: 24hr]
            RecCache[Recommendations<br/>TTL: 15min]
            SearchCache[Search Results<br/>TTL: 5min]
        end
    end

    Request --> CDN
    CDN --> AppCache
    AppCache --> UserCache
    AppCache --> MealCache
    AppCache --> RecCache
    AppCache --> SearchCache
    AppCache --> DBCache
    DBCache --> Database[(Database)]
```

---

## 12. Architectural Decisions

### 12.1 Key Design Decisions (ADRs)

#### ADR-001: Microservices Architecture

**Status:** Accepted  
**Context:** Need for independent scaling and deployment  
**Decision:** Adopt microservices with API Gateway  
**Consequences:** Higher complexity, better scalability

#### ADR-002: RAG for Recommendations

**Status:** Accepted  
**Context:** Need accurate, explainable AI recommendations  
**Decision:** Implement RAG pipeline with vector database  
**Consequences:** Better accuracy, higher infrastructure cost

#### ADR-003: Event-Driven Communication

**Status:** Accepted  
**Context:** Need for real-time updates and decoupling  
**Decision:** Use Kafka for event streaming  
**Consequences:** Eventual consistency, better scalability

#### ADR-004: PostgreSQL as Primary Database

**Status:** Accepted  
**Context:** Need for ACID compliance and complex queries  
**Decision:** PostgreSQL with read replicas  
**Consequences:** Strong consistency, vertical scaling limits

### 12.2 Technology Stack Summary

| Layer              | Technology           | Justification                 |
| ------------------ | -------------------- | ----------------------------- |
| **Frontend**       | React + TypeScript   | Type safety, ecosystem        |
| **Mobile**         | React Native         | Code reuse, performance       |
| **API**            | FastAPI              | Performance, async support    |
| **Gateway**        | Kong                 | Features, extensibility       |
| **Database**       | PostgreSQL           | ACID, JSON support            |
| **Cache**          | Redis                | Performance, features         |
| **Search**         | Elasticsearch        | Full-text search, analytics   |
| **ML**             | TensorFlow + PyTorch | Flexibility, ecosystem        |
| **LLM**            | OpenAI/Claude        | Capability, reliability       |
| **Infrastructure** | AWS + Kubernetes     | Scalability, managed services |

### 12.3 Future Considerations

**Phase 2 Enhancements:**

- GraphQL federation for better API flexibility
- Service mesh (Istio) for advanced traffic management
- Multi-region deployment for global scale
- Edge computing for reduced latency
- Blockchain for health data integrity

---

## Appendices

### Appendix A: Component Interfaces

```python
# Example: Recommendation Service Interface
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class RecommendationRequest(BaseModel):
    user_id: str
    meal_type: str  # breakfast, lunch, dinner, snack
    preferences: Optional[dict] = {}
    location: Optional[dict] = {}
    time_constraint: Optional[int] = None  # minutes

class RecommendationResponse(BaseModel):
    recommendations: List[MealRecommendation]
    generated_at: datetime
    confidence_score: float
    explanation: str

class RecommendationService:
    async def get_recommendations(
        self,
        request: RecommendationRequest
    ) -> RecommendationResponse:
        """Generate personalized meal recommendations"""
        pass

    async def validate_safety(
        self,
        user_id: str,
        meal_id: str
    ) -> SafetyValidation:
        """Validate meal safety for user"""
        pass
```

### Appendix B: Database Schema Excerpts

```sql
-- Core user health profile table
CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Medical information (encrypted)
    allergies JSONB NOT NULL DEFAULT '[]',
    medical_conditions JSONB NOT NULL DEFAULT '[]',
    medications JSONB NOT NULL DEFAULT '[]',

    -- Biometric data
    birth_date DATE,
    biological_sex VARCHAR(10),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    activity_level VARCHAR(20),

    -- Preferences and goals
    dietary_preferences JSONB NOT NULL DEFAULT '{}',
    wellness_goals JSONB NOT NULL DEFAULT '[]',

    -- Constraints
    CONSTRAINT valid_height CHECK (height_cm > 0 AND height_cm < 300),
    CONSTRAINT valid_weight CHECK (weight_kg > 0 AND weight_kg < 500)
);

-- Indexes for performance
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_health_profiles_allergies ON health_profiles USING GIN(allergies);
```

### Appendix C: Monitoring & Observability

**Key Metrics:**

- Request rate and latency (Prometheus)
- Error rates and types (Sentry)
- Resource utilization (DataDog)
- Business metrics (Custom dashboards)

**Distributed Tracing:**

- Jaeger for request tracing
- Correlation IDs across services
- Performance bottleneck identification

**Logging Strategy:**

- Structured JSON logs
- Centralized in ELK stack
- Log levels: ERROR, WARN, INFO, DEBUG
- PII redaction in logs

---

**Document Status:** APPROVED  
**Last Technical Review:** October 19, 2025  
**Next Review:** End of MVP Phase 1
