# Component Diagram

**Document Version**: 2.0 (Dual-Dimension Health Platform)  
**Last Updated**: October 25, 2025  
**Project**: Eatsential - Physical Health + Mental Wellness

**Version 2.0 Updates**:

- Added Mental Wellness sequence diagrams (5 new diagrams)
- Goal Tracking flow
- Mood Logging → AI Recommendation flow
- Dual-Dimension Engine scoring flow
- AI Concierge chat session flow
- Pattern Detection pipeline

---

## 1. Overview

This document provides detailed component interaction diagrams for the Eatsential platform, showing how different parts of the system communicate and collaborate.

**Current Implementation**: Physical Health MVP (Sections 2-9)  
**Planned Architecture**: Mental Wellness v2.0 (Sections 11-15)

---

## 2. System Component Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        ReactApp[React Application]
    end

    subgraph "API Layer"
        FastAPI[FastAPI Server]
        AuthMiddleware[Auth Middleware]
        Routers[API Routers]
    end

    subgraph "Business Logic Layer"
        Services[Business Services]
        Validators[Validators]
    end

    subgraph "Data Layer"
        ORM[SQLAlchemy ORM]
        Models[Data Models]
        Database[(PostgreSQL)]
    end

    subgraph "External Services"
        EmailService[Email Service]
    end

    Browser --> ReactApp
    ReactApp -->|HTTP/JSON| FastAPI
    FastAPI --> AuthMiddleware
    AuthMiddleware --> Routers
    Routers --> Services
    Services --> Validators
    Services --> ORM
    ORM --> Models
    Models --> Database
    Services --> EmailService
```

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant Auth as Auth Router
    participant Service as Auth Service
    participant DB as Database
    participant Email as Email Service

    Note over U,Email: User Registration Flow

    U->>F: Enter registration details
    F->>F: Client-side validation (Zod)
    F->>API: POST /api/auth/register
    API->>Auth: Route to auth router
    Auth->>Auth: Pydantic validation
    Auth->>Service: register_user()
    Service->>DB: Check user exists
    DB-->>Service: Not found
    Service->>DB: Create user record
    Service->>Service: Generate verification token
    Service->>Email: Send verification email
    Email-->>Service: Email sent
    Service-->>Auth: User created
    Auth-->>API: 201 Created
    API-->>F: Success response
    F-->>U: Show verification message

    Note over U,Email: Email Verification Flow

    U->>F: Click email link
    F->>API: GET /api/auth/verify-email/{token}
    API->>Auth: Route to auth router
    Auth->>Service: verify_email(token)
    Service->>DB: Find user by token
    DB-->>Service: User found
    Service->>DB: Update is_verified=True
    Service-->>Auth: Email verified
    Auth-->>API: 200 OK
    API-->>F: Success message
    F-->>U: Show login page

    Note over U,Email: Login Flow

    U->>F: Enter credentials
    F->>API: POST /api/auth/login
    API->>Auth: Route to auth router
    Auth->>Service: authenticate_user()
    Service->>DB: Find user by email
    DB-->>Service: User data
    Service->>Service: Verify password (bcrypt)
    Service->>Service: Check email verified
    Service->>Service: Generate JWT token
    Service-->>Auth: Token generated
    Auth-->>API: 200 OK + token
    API-->>F: JWT token
    F->>F: Store token
    F-->>U: Redirect to dashboard
```

---

## 4. Protected Resource Access

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as API Gateway
    participant Auth as Auth Middleware
    participant Router as Resource Router
    participant Service as Business Service
    participant DB as Database

    F->>API: GET /api/users/me<br/>Authorization: Bearer {token}
    API->>Auth: Validate JWT
    Auth->>Auth: Decode token
    Auth->>Auth: Check expiration
    Auth->>DB: Get user by ID
    DB-->>Auth: User data
    Auth->>API: User authenticated
    API->>Router: Forward request
    Router->>Service: get_current_user()
    Service->>DB: Query user data
    DB-->>Service: User record
    Service-->>Router: User data
    Router-->>API: 200 OK + data
    API-->>F: User profile
```

---

## 5. Health Profile Management

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant HP as Health Profile Router
    participant Service as Health Service
    participant DB as Database

    Note over U,DB: Create Health Profile

    U->>F: Fill health profile form
    F->>API: POST /api/health-profiles<br/>+ JWT token
    API->>HP: Route to health profile router
    HP->>Service: create_health_profile()
    Service->>DB: Create profile record
    Service->>DB: Link to user
    Service-->>HP: Profile created
    HP-->>API: 201 Created
    API-->>F: Profile data
    F-->>U: Show success message

    Note over U,DB: Update Health Profile

    U->>F: Update profile data
    F->>API: PUT /api/health-profiles/{id}<br/>+ JWT token
    API->>HP: Route with profile ID
    HP->>Service: update_health_profile()
    Service->>DB: Check ownership
    DB-->>Service: User owns profile
    Service->>DB: Update profile
    Service-->>HP: Profile updated
    HP-->>API: 200 OK
    API-->>F: Updated profile
    F-->>U: Show updated data

    Note over U,DB: Get Health Profile

    U->>F: Request profile
    F->>API: GET /api/health-profiles/me<br/>+ JWT token
    API->>HP: Route to health profile router
    HP->>Service: get_user_health_profile()
    Service->>DB: Query by user_id
    DB-->>Service: Profile data
    Service-->>HP: Profile found
    HP-->>API: 200 OK
    API-->>F: Profile data
    F-->>U: Display profile
```

---

## 6. Allergy Management

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant AR as Allergy Router
    participant Service as Allergy Service
    participant DB as Database

    Note over U,DB: Add User Allergy

    U->>F: Select allergen + severity
    F->>API: POST /api/allergies/user<br/>+ JWT token
    API->>AR: Route to allergy router
    AR->>Service: add_user_allergy()
    Service->>DB: Check allergen exists
    DB-->>Service: Allergen found
    Service->>DB: Create user_allergy record
    Service-->>AR: Allergy added
    AR-->>API: 201 Created
    API-->>F: Allergy data
    F-->>U: Show allergy list

    Note over U,DB: Get User Allergies

    U->>F: View allergies
    F->>API: GET /api/allergies/user/me<br/>+ JWT token
    API->>AR: Route to allergy router
    AR->>Service: get_user_allergies()
    Service->>DB: Query user_allergies
    DB-->>Service: Allergy list
    Service-->>AR: Allergies found
    AR-->>API: 200 OK
    API-->>F: Allergy list
    F-->>U: Display allergies

    Note over U,DB: Delete User Allergy

    U->>F: Click delete
    F->>API: DELETE /api/allergies/user/{id}<br/>+ JWT token
    API->>AR: Route with allergy ID
    AR->>Service: delete_user_allergy()
    Service->>DB: Check ownership
    DB-->>Service: User owns allergy
    Service->>DB: Delete record
    Service-->>AR: Allergy deleted
    AR-->>API: 204 No Content
    API-->>F: Success
    F-->>U: Update allergy list
```

---

## 7. Data Model Relationships

```mermaid
erDiagram
    USER ||--o| HEALTH_PROFILE : "has one"
    USER ||--o{ USER_ALLERGY : "has many"
    USER ||--o{ DIETARY_PREFERENCE : "has many"
    ALLERGEN_DATABASE ||--o{ USER_ALLERGY : "references"

    USER {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        boolean is_verified
        string verification_token
        datetime created_at
        datetime updated_at
        uuid health_profile_id FK
    }

    HEALTH_PROFILE {
        uuid id PK
        float height_cm
        float weight_kg
        enum activity_level
        list dietary_preferences
        list health_goals
        datetime created_at
        datetime updated_at
    }

    USER_ALLERGY {
        uuid id PK
        uuid user_id FK
        uuid allergen_id FK
        enum severity
        string symptoms
        datetime created_at
    }

    ALLERGEN_DATABASE {
        uuid id PK
        string name
        string category
        string description
    }

    DIETARY_PREFERENCE {
        uuid id PK
        uuid user_id FK
        enum preference_type
        enum strictness
        datetime created_at
    }
```

---

## 8. Component Dependencies

```mermaid
graph TB
    subgraph "Frontend Components"
        Pages[Pages]
        Components[UI Components]
        APIClient[API Client]
        AuthContext[Auth Context]
    end

    subgraph "Backend Components"
        Routers[API Routers]
        Services[Services]
        Models[Models]
        Schemas[Schemas]
        Core[Core Config]
    end

    Pages --> Components
    Pages --> APIClient
    Pages --> AuthContext
    APIClient --> Routers
    AuthContext --> APIClient

    Routers --> Services
    Routers --> Schemas
    Services --> Models
    Services --> Core
    Models --> Core

    style Frontend Components fill:#e3f2fd
    style Backend Components fill:#e8f5e9
```

---

## 9. Error Handling Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as API Gateway
    participant Router as Router
    participant Service as Service
    participant DB as Database

    F->>API: Request with invalid data
    API->>Router: Forward request
    Router->>Router: Pydantic validation fails
    Router-->>API: 422 Validation Error
    API-->>F: Error response
    F->>F: Display validation errors

    F->>API: Request to create duplicate
    API->>Router: Forward request
    Router->>Service: Process request
    Service->>DB: Check uniqueness
    DB-->>Service: Duplicate found
    Service-->>Router: Raise conflict error
    Router-->>API: 400 Bad Request
    API-->>F: Error message
    F->>F: Display user-friendly error

    F->>API: Unauthorized request
    API->>API: JWT validation fails
    API-->>F: 401 Unauthorized
    F->>F: Redirect to login
```

---

## 10. Mental Wellness Component Interactions (NEW - v2.0)

> **⚠️ PLANNED ARCHITECTURE - NOT YET IMPLEMENTED**  
> The following diagrams document the **planned** Mental Wellness feature flows (v2.0). Implementation timeline: 16-20 weeks. Current status: Physical Health MVP only.

---

## 11. Mental Wellness Goal Tracking Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant MW as Mental Wellness Router
    participant Service as Goal Tracking Service
    participant DB as Database

    Note over U,DB: Create Mental Wellness Goal

    U->>F: Fill goal form (mood improvement, stress reduction, sleep quality)
    F->>F: Validate goal data (Zod schema)
    F->>API: POST /api/mental-wellness/goals<br/>+ JWT token
    API->>MW: Route to mental wellness router
    MW->>MW: Pydantic validation
    MW->>Service: create_goal()
    Service->>DB: Check existing active goals
    DB-->>Service: No conflicting goals
    Service->>DB: Create mental_wellness_goal record
    Service->>Service: Initialize progress tracking
    Service-->>MW: Goal created
    MW-->>API: 201 Created + goal data
    API-->>F: Goal response
    F-->>U: Show goal in dashboard

    Note over U,DB: Update Goal Progress (Daily Check-in)

    U->>F: Log mood/stress/sleep data
    F->>API: POST /api/mood-tracking/logs<br/>+ JWT token
    API->>MW: Route to mood tracking
    MW->>Service: log_mood()
    Service->>DB: Insert mood_log record
    Service->>Service: Calculate daily progress
    Service->>DB: Update goal progress
    Service->>Service: Check if milestone reached
    alt Milestone Reached
        Service->>DB: Update goal status
        Service-->>MW: Milestone notification
        MW-->>API: 200 OK + milestone data
        API-->>F: Success + celebration message
        F-->>U: Show achievement 🎉
    else Progress Continues
        Service-->>MW: Progress updated
        MW-->>API: 200 OK
        API-->>F: Success
        F-->>U: Update progress bar
    end

    Note over U,DB: Get Goal Dashboard

    U->>F: Navigate to dashboard
    F->>API: GET /api/mental-wellness/dashboard<br/>+ JWT token
    API->>MW: Route to dashboard
    MW->>Service: get_dashboard_summary()
    Service->>DB: Get active goals
    Service->>DB: Get last 7 days logs
    Service->>Service: Calculate weekly summaries
    Service->>Service: Detect streaks
    DB-->>Service: Data aggregated
    Service-->>MW: Dashboard data
    MW-->>API: 200 OK + dashboard
    API-->>F: Dashboard response
    F-->>U: Display goals, progress, streaks, insights
```

---

## 12. Mood Logging → AI Recommendation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant ML as Mood Logging Service
    participant PD as Pattern Detection Service
    participant AIC as AI Concierge Service
    participant REC as Dual-Dimension Engine
    participant LLM as LLM Service (GPT-4)
    participant DB as Database

    Note over U,DB: User Logs Low Mood

    U->>F: Log mood (score: 4/10, context: "work stress")
    F->>API: POST /api/mood-tracking/logs<br/>+ JWT token
    API->>ML: Route to mood tracking
    ML->>DB: Insert mood_log (encrypted notes)
    ML->>PD: Trigger pattern detection

    Note over PD,DB: Pattern Detection (Async)

    PD->>DB: Get last 30 days mood/sleep/stress data
    DB-->>PD: Historical data (150 entries)
    PD->>PD: Calculate correlations<br/>- Mood-Sleep: r=0.76<br/>- Mood-Stress: r=-0.68
    PD->>PD: Detect anomaly (mood dropped 40% in 3 days)

    alt Anomaly Detected
        PD->>AIC: Generate proactive insight
        AIC->>DB: Get user context (goals, preferences, allergies)
        DB-->>AIC: Context data
        AIC->>LLM: Generate insight prompt
        LLM-->>AIC: "I noticed your mood dropped significantly..."
        AIC->>DB: Store insight in dashboard
        AIC->>F: Push notification (if enabled)
        F-->>U: "New insight available 💡"
    end

    Note over U,DB: User Requests Food Recommendations

    U->>F: Click "Get food recommendations"
    F->>API: POST /api/recommendations/dual-dimension<br/>{context: "low_mood", meal_type: "lunch"}
    API->>REC: Route to recommendation engine

    REC->>DB: Get user preferences, allergies
    REC->>DB: Get recent mood/stress/sleep data
    REC->>DB: Get food database (500 foods)

    par Physical Health Scoring
        REC->>REC: Calculate physical scores<br/>- Calories, macros, allergies
    and Mental Wellness Scoring
        REC->>REC: Calculate mental scores<br/>- #MoodBoost tags<br/>- Omega-3, Tryptophan
    end

    REC->>REC: Combine scores<br/>(physical*0.4 + mental*0.5 + pref*0.1)
    REC->>REC: Apply context boost<br/>(+15% to #MoodBoost foods)
    REC->>REC: Rank top 10 foods
    REC-->>API: Ranked recommendations + explanations
    API-->>F: Recommendation list
    F-->>U: Display foods with "Why recommended" explanations
```

---

## 13. Dual-Dimension Recommendation Engine Scoring

```mermaid
sequenceDiagram
    participant API as API Gateway
    participant REC as Recommendation Engine
    participant CTX as Context Aggregation Service
    participant PSC as Physical Scoring Engine
    participant MSC as Mental Scoring Engine
    participant TAG as Health Tagging Service
    participant DB as Database

    Note over API,DB: Request Arrives

    API->>REC: POST /api/recommendations/dual-dimension<br/>{meal_type, max_calories, user_context}
    REC->>CTX: aggregate_user_context(user_id)

    Note over CTX,DB: Context Aggregation (Parallel)

    par Physical Health Context
        CTX->>DB: Get health profile
        CTX->>DB: Get allergies
        CTX->>DB: Get dietary preferences
        CTX->>DB: Get nutrition goals
    and Mental Wellness Context
        CTX->>DB: Get active mental goals
        CTX->>DB: Get last 7 days mood logs
        CTX->>DB: Get last 7 days stress logs
        CTX->>DB: Get last 7 days sleep logs
    end

    CTX-->>REC: UserContext object
    REC->>DB: Get candidate foods (filtered by meal_type)
    DB-->>REC: 500 candidate foods

    Note over REC,DB: Parallel Scoring (500 foods)

    loop For each food
        par Physical Health Scoring
            REC->>PSC: calculate_physical_score(food, context)
            PSC->>PSC: Score: calories, macros, allergies, nutrition
            PSC-->>REC: physical_score (0-10)
        and Mental Wellness Scoring
            REC->>MSC: calculate_mental_score(food, context)
            MSC->>TAG: Get food tags
            TAG->>DB: Query food_tags
            DB-->>TAG: [#MoodBoost, #EnergyBoost]
            TAG-->>MSC: Tag list + confidence
            MSC->>MSC: Score: tags, nutrients (Omega-3, Mg, Tryptophan)
            MSC-->>REC: mental_score (0-10)
        end

        REC->>REC: total_score = (physical*0.4 + mental*0.4 + pref*0.2)

        alt High Stress Context
            REC->>REC: Boost #StressRelief foods (+15%)
        else Low Mood Context
            REC->>REC: Boost #MoodBoost foods (+15%)
        else Poor Sleep Context
            REC->>REC: Boost #SleepAid foods (+15%)
        end
    end

    REC->>REC: Sort by total_score (desc)
    REC->>REC: Take top 10
    REC->>REC: Generate explanations for each
    REC-->>API: Ranked recommendations with reasoning
    API-->>API: Return 200 OK + recommendations
```

---

## 14. AI Health Concierge Chat Session

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant AIC as AI Concierge Service
    participant CTX as Context Service
    participant LLM as LLM Service (GPT-4/Claude)
    participant SAFE as Safety Validator
    participant DB as Database

    Note over U,DB: User Starts Chat

    U->>F: Click "Chat with AI Health Coach"
    F->>API: POST /api/ai-concierge/chat<br/>{session_id: null, message: "I'm stressed"}
    API->>AIC: Route to AI concierge
    AIC->>AIC: Check rate limit (20 req/hr)
    AIC->>DB: Create ai_chat_session record
    DB-->>AIC: session_id

    Note over AIC,DB: Context Aggregation

    AIC->>CTX: aggregate_chat_context(user_id)
    CTX->>DB: Get last 30 days mood/stress/sleep
    CTX->>DB: Get active mental wellness goals
    CTX->>DB: Get recent food logs
    CTX->>DB: Get physical health profile
    CTX-->>AIC: User context summary

    Note over AIC,LLM: Prompt Engineering

    AIC->>AIC: Build system prompt<br/>- Role: Nutrition & mental wellness expert<br/>- Context: User summary<br/>- Guardrails: No medical diagnosis
    AIC->>AIC: Build user prompt<br/>- User message + context

    Note over AIC,LLM: LLM Invocation (Streaming)

    AIC->>LLM: POST /v1/chat/completions<br/>{model: "gpt-4-turbo", stream: true}

    loop Stream response
        LLM-->>AIC: SSE chunk (partial response)
        AIC-->>API: SSE chunk
        API-->>F: SSE chunk
        F-->>U: Display partial response (typewriter effect)
    end

    LLM-->>AIC: Final response + token usage

    Note over AIC,SAFE: Safety Validation

    AIC->>SAFE: validate_response(response)
    SAFE->>SAFE: Check medical advice patterns<br/>(regex + ML classifier)
    SAFE->>SAFE: Check harmful content

    alt Medical Advice Detected
        SAFE->>SAFE: Inject disclaimer<br/>"Please consult a healthcare professional."
    else Safe Content
        SAFE-->>AIC: Response validated
    end

    Note over AIC,DB: Store Interaction

    AIC->>DB: Insert chat message (user + assistant)
    AIC->>DB: Update session metadata<br/>(tokens_used, last_message_at)
    AIC->>DB: Log interaction (audit trail)
    AIC-->>API: 200 OK + response + session_id
    API-->>F: Complete response
    F-->>U: Display full response

    Note over U,DB: User Continues Chat

    U->>F: Reply: "What foods help with stress?"
    F->>API: POST /api/ai-concierge/chat<br/>{session_id, message}
    API->>AIC: Continue session
    AIC->>DB: Get chat history (last 10 messages)
    AIC->>AIC: Build prompt with history
    AIC->>LLM: POST with conversation context
    Note over LLM: LLM has context of previous messages
    LLM-->>AIC: Contextual response
    AIC->>DB: Store messages
    AIC-->>API: 200 OK
    API-->>F: Response
    F-->>U: Display response
```

---

## 15. Pattern Detection Pipeline (Background Job)

```mermaid
sequenceDiagram
    participant CRON as Cron Job (Daily 8 AM)
    participant PD as Pattern Detection Service
    participant DB as Database
    participant ML as ML Service
    participant AIC as AI Concierge Service
    participant LLM as LLM Service
    participant NOTIF as Notification Service
    participant U as User

    Note over CRON,U: Daily Pattern Analysis (Batch)

    CRON->>PD: Run pattern_detection_job()
    PD->>DB: Get all active users
    DB-->>PD: user_ids (1,000 users)

    loop For each user (batch of 100)
        PD->>DB: Get last 30 days mood/stress/sleep data
        DB-->>PD: User data (90 entries)

        alt Sufficient Data (>30 entries)
            PD->>PD: Calculate statistics<br/>- Mean, std dev, trends
            PD->>ML: Detect correlations
            ML->>ML: Run correlation analysis<br/>- Mood-Sleep: Pearson r<br/>- Mood-Stress: Pearson r<br/>- Sleep-Food: Pattern matching
            ML-->>PD: Correlations found

            alt Strong Correlation Found (r > 0.7)
                PD->>PD: Extract pattern insights<br/>"Mood improves 20% with 7+ hours sleep"
                PD->>AIC: Generate proactive insight
                AIC->>LLM: POST /v1/chat/completions<br/>{model: "gpt-4-mini", max_tokens: 200}
                LLM-->>AIC: Insight message<br/>"I noticed your mood improves significantly..."
                AIC-->>PD: Insight generated
                PD->>DB: Store insight in insights table
                PD->>NOTIF: Send push notification
                NOTIF-->>U: "New insight available 💡"
            end

            Note over PD: Anomaly Detection

            PD->>ML: Detect anomalies (sudden drops)
            ML->>ML: Z-score analysis (>2 std dev)
            alt Anomaly Detected
                ML-->>PD: Mood dropped 40% in 3 days
                PD->>AIC: Generate alert insight
                AIC->>LLM: Generate supportive message
                LLM-->>AIC: "I noticed a sudden change..."
                AIC-->>PD: Alert insight
                PD->>DB: Store insight (high priority)
                PD->>NOTIF: Send urgent notification
                NOTIF-->>U: "Check-in recommended"
            end

            Note over PD: Goal Progress Analysis

            PD->>DB: Get active mental wellness goals
            DB-->>PD: Goals list
            PD->>PD: Calculate progress vs. target
            alt Goal Progress > 80%
                PD->>DB: Update goal status (approaching)
                PD->>NOTIF: Send encouragement notification
                NOTIF-->>U: "You're close to your goal! 🎯"
            else Goal Progress < 20% (after 2 weeks)
            PD->>AIC: Generate adjustment suggestion
                AIC->>LLM: Suggest goal adjustments
                LLM-->>AIC: "Consider adjusting your goal..."
                AIC-->>PD: Suggestion generated
                PD->>DB: Store suggestion
                PD->>NOTIF: Send suggestion notification
                NOTIF-->>U: "Goal adjustment suggestion available"
            end
        else Insufficient Data
            PD->>PD: Log: Insufficient data for analysis
        end
    end

    PD->>DB: Update last_analysis_at timestamp
    PD->>DB: Log batch job completion
    PD-->>CRON: Job completed (processed 1,000 users)
```

---

## 16. Mental Wellness Data Model Relationships

```mermaid
erDiagram
    USER ||--o{ MENTAL_WELLNESS_GOAL : "has many"
    USER ||--o{ MOOD_LOG : "has many"
    USER ||--o{ STRESS_LOG : "has many"
    USER ||--o{ SLEEP_LOG : "has many"
    USER ||--o{ AI_CHAT_SESSION : "has many"

    HEALTH_TAG ||--o{ FOOD_TAG : "tagged in many foods"
    FOOD_DATABASE ||--o{ FOOD_TAG : "has many tags"

    USER {
        uuid id PK
        string email UK
        string username UK
    }

    MENTAL_WELLNESS_GOAL {
        uuid id PK
        uuid user_id FK
        enum goal_type
        decimal target_value
        string target_unit
        enum frequency
        date start_date
        date end_date
        enum status
    }

    MOOD_LOG {
        uuid id PK
        uuid user_id FK
        int mood_score
        enum mood_label
        int energy_level
        string context
        bytea encrypted_notes
        timestamp logged_at
    }

    STRESS_LOG {
        uuid id PK
        uuid user_id FK
        int stress_level
        enum stress_label
        text[] triggers
        text[] coping_strategies
        bytea encrypted_notes
        timestamp logged_at
    }

    SLEEP_LOG {
        uuid id PK
        uuid user_id FK
        date sleep_date
        time bedtime
        time wake_time
        decimal duration_hours
        int quality_score
        enum quality_label
        int interruptions
    }

    AI_CHAT_SESSION {
        uuid id PK
        uuid user_id FK
        string session_title
        bytea encrypted_context_summary
        int message_count
        int total_tokens_used
        enum llm_model
        timestamp started_at
        timestamp last_message_at
        enum status
    }

    HEALTH_TAG {
        uuid id PK
        string tag_name UK
        enum category
        text description
        text scientific_basis
        text[] key_nutrients
        decimal effectiveness_rating
    }

    FOOD_TAG {
        uuid id PK
        uuid food_id FK
        uuid tag_id FK
        decimal confidence_score
        enum source
        boolean verified
    }
```

---

## 17. Related Documents

**Design Documentation:**

- [Architecture Overview](./architecture-overview.md) - System architecture (Physical + Mental Wellness)
- [Database Design](./database-design.md) - Database schema (12 tables)
- [API Design](./api-design.md) - API specifications (50 endpoints)

**Requirements Documentation:**

- [Functional Requirements](../1-REQUIREMENTS/functional-requirements.md) - 95 FRs (75 Physical + 20 Mental)
- [Use Cases](../1-REQUIREMENTS/use-cases.md) - 32 UCs (20 Physical + 12 Mental)
- [Non-Functional Requirements](../1-REQUIREMENTS/non-functional-requirements.md) - Performance, security, privacy

**Testing & Implementation:**

- [Test Cases](../4-TESTING/test-cases.md) - 40 TCs (22 Physical + 18 Mental)
- [Implementation Status](../3-IMPLEMENTATION/implementation-status.md) - Current progress and roadmap

---

**Document Revision History:**

| Version | Date             | Author    | Changes                                                                                                                                                                                            |
| ------- | ---------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | October 2025     | Tech Team | Initial component diagrams for Physical Health MVP (9 diagrams)                                                                                                                                    |
| 2.0     | October 25, 2025 | Tech Team | Added Mental Wellness sequence diagrams (5 new diagrams): Goal Tracking, Mood→AI Recommendation, Dual-Dimension Scoring, AI Concierge Chat, Pattern Detection Pipeline. Added Mental Wellness ERD. |

---

**Document Status**: ✅ Complete (v2.0 - Dual-Dimension Health Component Interactions Documented)  
**Implementation Status**: Physical Health MVP in progress, Mental Wellness planned (16-20 weeks)  
**Next Review**: End of Mental Wellness Sprint 1 (M9)
