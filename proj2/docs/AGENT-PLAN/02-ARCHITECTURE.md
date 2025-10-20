# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users (Web/Mobile)                    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    Frontend (React SPA)                      │
│                  Hosted on CloudFront/S3                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                   API Gateway (FastAPI)                      │
│                        /api/v1/*                             │
└──────┬──────────┬──────────┬──────────┬────────────────────┘
       │          │          │          │
┌──────┴────┐ ┌──┴────┐ ┌──┴────┐ ┌──┴────┐
│   Auth    │ │ User  │ │Health │ │  AI   │
│  Service  │ │Service│ │Service│ │Service│
└─────┬─────┘ └───┬───┘ └───┬───┘ └───┬───┘
      │           │         │         │
      └───────────┴─────────┴─────────┘
                  │
         ┌────────┴────────┐
         │   PostgreSQL    │
         │   (Primary DB)  │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │     Redis       │
         │   (Cache)       │
         └─────────────────┘
```

## Service Breakdown

### Frontend Service

- **Technology**: React + TypeScript + Vite
- **Hosting**: AWS S3 + CloudFront
- **Responsibilities**:
  - User interface
  - Form validation
  - API communication
  - State management

### API Gateway

- **Technology**: FastAPI
- **Hosting**: AWS ECS Fargate
- **Responsibilities**:
  - Request routing
  - Authentication
  - Rate limiting
  - Request validation

### Auth Service

- **Endpoints**: `/api/v1/auth/*`
- **Responsibilities**:
  - User registration/login
  - JWT token management
  - Password hashing
  - Email verification

### User Service

- **Endpoints**: `/api/v1/users/*`
- **Responsibilities**:
  - Profile management
  - User preferences
  - Account settings

### Health Service

- **Endpoints**: `/api/v1/health/*`
- **Responsibilities**:
  - Health profile CRUD
  - Allergen validation
  - Medical data management
  - Audit logging

### AI Service

- **Endpoints**: `/api/v1/recommendations/*`
- **Technology**: LangChain + GPT-4
- **Responsibilities**:
  - Meal recommendations
  - Restaurant matching
  - Nutritional analysis

## Data Flow

### User Registration Flow

```
1. User fills form → Frontend validates
2. Frontend → POST /api/v1/auth/register
3. Auth Service → Validate uniqueness
4. Auth Service → Hash password
5. Auth Service → Save to DB
6. Auth Service → Send verification email
7. Auth Service → Return success
8. Frontend → Show verification pending
```

### Health Profile Creation

```
1. User enters allergies → Frontend validates
2. Frontend → POST /api/v1/users/{id}/health-profile
3. Health Service → Validate allergens
4. Health Service → Check severity
5. Health Service → Save to DB with audit log
6. Health Service → Invalidate cache
7. Health Service → Return profile
8. Frontend → Show success with warnings
```

### AI Recommendation Flow

```
1. User requests recommendations
2. Frontend → GET /api/v1/recommendations
3. AI Service → Fetch user health profile
4. AI Service → Query restaurant data
5. AI Service → Process through RAG
6. AI Service → Filter by allergies
7. AI Service → Rank by preferences
8. AI Service → Return recommendations
9. Frontend → Display with safety badges
```

## Security Architecture

### Authentication Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Client  │─────▶│   API    │─────▶│   Auth   │
│          │◀─────│ Gateway  │◀─────│ Service  │
└──────────┘      └──────────┘      └──────────┘
     │                  │                  │
     │   JWT Token      │    Validate      │
     └──────────────────┴──────────────────┘
```

### Security Layers

1. **Network**: VPC, Security Groups
2. **Application**: JWT, CORS, Rate Limiting
3. **Data**: Encryption at rest/transit
4. **Audit**: All health data changes logged

## Database Schema

### Core Tables

```
users
├── health_profiles (1:1)
├── user_allergies (1:N)
├── dietary_restrictions (1:N)
└── meal_preferences (1:N)

restaurants
├── restaurant_menus (1:N)
├── menu_items (1:N)
└── item_ingredients (1:N)

recommendations
├── user_id (FK)
├── restaurant_id (FK)
└── safety_score
```

### Caching Strategy

- **User Profiles**: Cache for 5 minutes
- **Restaurant Data**: Cache for 1 hour
- **Recommendations**: Cache for 15 minutes
- **Invalidation**: On any profile update

## Deployment Architecture

### Production Environment

```
AWS Region (us-east-1)
├── VPC
│   ├── Public Subnets
│   │   ├── ALB
│   │   └── NAT Gateway
│   └── Private Subnets
│       ├── ECS Fargate Services
│       ├── RDS PostgreSQL
│       └── ElastiCache Redis
├── S3 + CloudFront (Frontend)
└── Route 53 (DNS)
```

### Scaling Strategy

- **Frontend**: CloudFront edge caching
- **API**: ECS auto-scaling (2-10 tasks)
- **Database**: RDS read replicas
- **Cache**: Redis cluster mode

## Monitoring & Observability

### Metrics

- **CloudWatch**: System metrics
- **X-Ray**: Distributed tracing
- **Custom Metrics**:
  - API response times
  - Allergen check failures
  - Recommendation accuracy

### Alerts

- **Critical**: Allergen validation failures
- **High**: API errors > 1%
- **Medium**: Response time > 2s
- **Low**: Cache hit rate < 80%

## Disaster Recovery

### Backup Strategy

- **Database**: Daily snapshots, 30-day retention
- **Code**: Git with tagged releases
- **Configs**: AWS Secrets Manager

### RTO/RPO Targets

- **RTO**: 2 hours (system recovery)
- **RPO**: 1 hour (data loss tolerance)

---

**Key Decisions**:

1. Microservices for scalability
2. PostgreSQL for ACID compliance
3. Redis for performance
4. RAG for accurate AI recommendations
5. AWS for managed infrastructure
