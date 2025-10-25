# Section 4: System Models

**Document:** Software Requirements Specification  
**Section:** 4 - System Models  
**Version:** 1.0  
**Date:** October 21, 2025

---

## 4.1 Overview

This section presents various models that describe the Eatsential system from different perspectives. These models help stakeholders understand system behavior, data flow, and interactions.

## 4.2 Behavioral Models

### 4.2.1 State Diagrams

#### User Account States

```mermaid
stateDiagram-v2
    [*] --> Unregistered
    Unregistered --> PendingVerification: Register
    PendingVerification --> Active: Verify Email
    PendingVerification --> PendingVerification: Resend Email
    PendingVerification --> Expired: Timeout (24h)
    Expired --> PendingVerification: Resend Email
    Active --> Active: Login/Use System
    Active --> PasswordReset: Forgot Password
    PasswordReset --> Active: Reset Complete
    Active --> Suspended: Admin Action
    Suspended --> Active: Admin Restore
    Active --> Deleted: Delete Account
    Deleted --> [*]
```

#### Meal Recommendation States

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> RequestReceived: User Request
    RequestReceived --> ProfileLoading: Validate Request
    ProfileLoading --> DataGathering: Profile Loaded
    ProfileLoading --> Error: Profile Error
    DataGathering --> AIProcessing: Data Ready
    DataGathering --> Error: Data Error
    AIProcessing --> Validating: AI Complete
    AIProcessing --> Error: AI Error
    Validating --> Filtering: Safety Passed
    Validating --> Error: Safety Failed
    Filtering --> Ranking: Filters Applied
    Ranking --> Complete: Results Ready
    Complete --> Idle: Display Results
    Error --> Idle: Error Handled
```

### 4.2.2 Activity Diagrams

#### User Registration Flow

```mermaid
graph TD
    Start([User Visits Site]) --> SignupPage[Display Signup Page]
    SignupPage --> EnterInfo[Enter Username, Email, Password]
    EnterInfo --> Validate{Client-side Validation}
    Validate -->|Invalid| ShowError[Show Validation Error]
    ShowError --> EnterInfo
    Validate -->|Valid| Submit[Submit to Server]
    Submit --> ServerValidate{Server Validation}
    ServerValidate -->|Invalid| ReturnError[Return Error]
    ReturnError --> ShowError
    ServerValidate -->|Valid| CheckExisting{User Exists?}
    CheckExisting -->|Yes| DuplicateError[Show Duplicate Error]
    DuplicateError --> EnterInfo
    CheckExisting -->|No| CreateUser[Create User Record]
    CreateUser --> GenerateToken[Generate Verification Token]
    GenerateToken --> SendEmail[Send Verification Email]
    SendEmail --> ShowSuccess[Show Success Message]
    ShowSuccess --> End([Registration Complete])
```

#### Meal Recommendation Flow

```mermaid
graph TD
    Start([User Logged In]) --> Request[Request Recommendations]
    Request --> LoadProfile[Load User Profile]
    LoadProfile --> CheckHealth{Has Health Profile?}
    CheckHealth -->|No| PromptProfile[Prompt to Complete Profile]
    PromptProfile --> End1([End])
    CheckHealth -->|Yes| GetLocation[Get User Location]
    GetLocation --> BuildQuery[Build Query Parameters]
    BuildQuery --> CallAI[Call AI Service]
    CallAI --> ProcessAI[Process with RAG]
    ProcessAI --> GenerateRecs[Generate Recommendations]
    GenerateRecs --> ValidateSafety{Safety Check}
    ValidateSafety -->|Fail| RemoveUnsafe[Remove Unsafe Options]
    RemoveUnsafe --> ValidateSafety
    ValidateSafety -->|Pass| FilterOptions[Apply User Filters]
    FilterOptions --> RankResults[Rank by Relevance]
    RankResults --> FormatResults[Format for Display]
    FormatResults --> ReturnResults[Return to User]
    ReturnResults --> Display[Display Recommendations]
    Display --> UserAction{User Action}
    UserAction -->|Select| ShowDetails[Show Meal Details]
    UserAction -->|Refresh| Request
    UserAction -->|Done| End2([End])
```

## 4.3 Data Flow Diagrams

### 4.3.1 Context Diagram (Level 0)

```mermaid
graph TB
    subgraph External
        User[User]
        Email[Email Service]
        Restaurant[Restaurant Data]
        Nutrition[Nutrition Database]
        AI[AI Service]
    end

    subgraph System
        Eatsential[Eatsential System]
    end

    User -->|Registration/Login/Requests| Eatsential
    Eatsential -->|Recommendations/Notifications| User
    Eatsential -->|Send Emails| Email
    Email -->|Delivery Status| Eatsential
    Restaurant -->|Menu/Location Data| Eatsential
    Nutrition -->|Nutrition Facts| Eatsential
    Eatsential -->|Queries| AI
    AI -->|Responses| Eatsential
```

### 4.3.2 Level 1 DFD - System Components

```mermaid
graph TB
    subgraph "Eatsential System"
        Auth[Authentication Service]
        Profile[Profile Manager]
        Rec[Recommendation Engine]
        Data[Data Service]
        Notify[Notification Service]
    end

    User -->|Login Credentials| Auth
    Auth -->|Auth Token| User
    User -->|Profile Data| Profile
    Profile -->|Updated Profile| User
    User -->|Recommendation Request| Rec
    Profile -->|User Preferences| Rec
    Data -->|Restaurant/Meal Data| Rec
    Rec -->|Personalized Meals| User
    Rec -->|Notification Request| Notify
    Notify -->|Email/Push| User
```

### 4.3.3 Level 2 DFD - Recommendation Process

```mermaid
graph LR
    subgraph "Recommendation Engine"
        Validate[Request Validator]
        Gather[Data Gatherer]
        AIProc[AI Processor]
        Safety[Safety Validator]
        Rank[Ranking Engine]
        Format[Result Formatter]
    end

    Request[User Request] --> Validate
    Validate -->|Valid Request| Gather
    Profile[User Profile] --> Gather
    Location[Location Data] --> Gather
    Meals[Meal Database] --> Gather
    Gather -->|Compiled Data| AIProc
    AI[AI Service] <--> AIProc
    AIProc -->|Raw Recommendations| Safety
    Allergies[Allergy Rules] --> Safety
    Safety -->|Safe Options| Rank
    Preferences[User Preferences] --> Rank
    Rank -->|Ranked Results| Format
    Format --> Response[Formatted Response]
```

## 4.4 Object Models

### 4.4.1 Domain Model

```mermaid
classDiagram
    class User {
        -id: UUID
        -email: String
        -username: String
        -passwordHash: String
        -isVerified: Boolean
        +register()
        +login()
        +updateProfile()
        +deleteAccount()
    }

    class HealthProfile {
        -id: UUID
        -userId: UUID
        -allergies: List~Allergy~
        -conditions: List~Condition~
        -goals: List~Goal~
        -biometrics: Biometrics
        +addAllergy()
        +removeAllergy()
        +updateBiometrics()
        +validate()
    }

    class Allergy {
        -id: UUID
        -name: String
        -severity: Severity
        -type: AllergyType
        +isSevere(): Boolean
    }

    class Restaurant {
        -id: UUID
        -name: String
        -location: Location
        -cuisine: List~String~
        -hours: Hours
        +isOpen(): Boolean
        +getDistance(Location): Float
    }

    class Meal {
        -id: UUID
        -name: String
        -description: String
        -nutrition: Nutrition
        -ingredients: List~Ingredient~
        -price: Decimal
        +hasAllergen(Allergy): Boolean
        +meetsGoal(Goal): Boolean
    }

    class Recommendation {
        -id: UUID
        -userId: UUID
        -meals: List~Meal~
        -timestamp: DateTime
        -score: Float
        -explanation: String
        +rank()
        +filter()
    }

    User "1" --> "0..1" HealthProfile
    HealthProfile "1" --> "*" Allergy
    User "1" --> "*" Recommendation
    Recommendation "*" --> "*" Meal
    Meal "*" --> "1" Restaurant
```

### 4.4.2 Detailed Class Relationships

```mermaid
classDiagram
    class BiometricData {
        -height: Float
        -weight: Float
        -birthDate: Date
        -activityLevel: String
        +calculateBMI(): Float
        +calculateAge(): Integer
        +getCalorieNeeds(): Integer
    }

    class NutritionInfo {
        -calories: Float
        -protein: Float
        -carbs: Float
        -fat: Float
        -fiber: Float
        -sodium: Float
        -vitamins: Map
        -minerals: Map
        +getMacroBreakdown(): Map
        +meetsRequirement(Requirement): Boolean
    }

    class Location {
        -latitude: Float
        -longitude: Float
        -address: String
        -city: String
        -state: String
        -zipCode: String
        +distanceTo(Location): Float
        +isNearby(Location, radius): Boolean
    }

    class WellnessGoal {
        -type: GoalType
        -target: String
        -timeline: Duration
        -priority: Priority
        +isActive(): Boolean
        +getProgress(): Float
    }

    HealthProfile --> BiometricData
    HealthProfile --> "*" WellnessGoal
    Meal --> NutritionInfo
    Restaurant --> Location
    User --> Location : currentLocation
```

## 4.5 Sequence Diagrams

### 4.5.1 Email Verification Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant API as API Server
    participant DB as Database
    participant Email as Email Service

    U->>B: Click verification link
    B->>API: GET /auth/verify-email/{token}
    API->>DB: Find user by token

    alt Token Valid
        DB-->>API: User found
        API->>API: Check token expiry
        API->>DB: Update user.is_verified = true
        DB-->>API: Success
        API->>DB: Clear verification token
        API-->>B: 200 OK - Verified
        B-->>U: Show success page
    else Token Invalid/Expired
        DB-->>API: User not found or expired
        API-->>B: 400 Bad Request
        B-->>U: Show error with resend option
        U->>B: Click resend
        B->>API: POST /auth/resend-verification
        API->>Email: Send new verification
        Email-->>API: Sent
        API-->>B: 200 OK - Email sent
    end
```

### 4.5.2 AI Recommendation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Gateway
    participant Prof as Profile Service
    participant Rec as Recommendation Service
    participant AI as AI Engine
    participant Cache as Cache
    participant DB as Database

    U->>F: Request recommendations
    F->>API: POST /recommendations/meals
    API->>API: Validate JWT token
    API->>Cache: Check cached recommendations

    alt Cache Hit
        Cache-->>API: Cached results
        API-->>F: Return cached recommendations
    else Cache Miss
        API->>Prof: Get user profile
        Prof->>DB: Query health profile
        DB-->>Prof: Profile data
        Prof-->>API: Complete profile

        API->>Rec: Generate recommendations
        Rec->>AI: Process with context
        AI->>AI: RAG pipeline
        AI-->>Rec: AI recommendations

        Rec->>Rec: Apply safety filters
        Rec->>Rec: Rank results
        Rec->>Cache: Store results
        Rec-->>API: Final recommendations
        API-->>F: Return recommendations
    end

    F->>F: Display results
    F-->>U: Show meal options
```

## 4.6 Use Case Realization

### 4.6.1 UC-001: User Registration Realization

```mermaid
graph TB
    subgraph "Presentation Layer"
        SignupPage[Signup Page]
        FormValidation[Form Validation]
    end

    subgraph "API Layer"
        AuthRouter[Auth Router]
        Middleware[Validation Middleware]
    end

    subgraph "Business Layer"
        UserService[User Service]
        EmailService[Email Service]
        Crypto[Crypto Service]
        UserRepo[User Repository]
    end

    subgraph "Data Layer"
        Database[(Database)]
    end

    SignupPage -->|Submit| FormValidation
    FormValidation -->|Valid Data| AuthRouter
    AuthRouter --> Middleware
    Middleware -->|Validated| UserService
    UserService -->|Check Exists| UserRepo
    UserRepo --> Database
    UserService -->|Hash Password| Crypto
    UserService -->|Send Email| EmailService
    UserService -->|Response| AuthRouter
    AuthRouter -->|Success| SignupPage
```

### 4.6.2 UC-016: Allergy Management Realization

```mermaid
graph TB
    subgraph "Components"
        UI[Allergy UI Component]
        API[Profile API]
        Service[Profile Service]
        Validator[Allergy Validator]
        Store[Data Store]
    end

    subgraph "Flow"
        UI -->|Add Allergy| API
        API -->|Validate| Service
        Service -->|Check Rules| Validator
        Validator -->|Valid| Service
        Service -->|Store| Store
        Store -->|Success| Service
        Service -->|Update Cache| Service
        Service -->|Response| API
        API -->|Updated List| UI
    end
```

## 4.7 Deployment Model

### 4.7.1 Physical Architecture

```mermaid
graph TB
    subgraph "Client Tier"
        Browser[Web Browser]
        Mobile[Mobile App - Future]
    end

    subgraph "CDN"
        Static[Static Assets]
        Images[Images]
    end

    subgraph "Application Tier"
        LB[Load Balancer]
        Web1[Web Server 1]
        Web2[Web Server 2]
        API1[API Server 1]
        API2[API Server 2]
    end

    subgraph "Service Tier"
        Auth[Auth Service]
        Profile[Profile Service]
        Rec[Recommendation Service]
        Cache[Redis Cache]
    end

    subgraph "Data Tier"
        Primary[(Primary DB)]
        Replica[(Read Replica)]
        Search[Elasticsearch]
    end

    Browser --> CDN
    Browser --> LB
    Mobile -.-> LB
    CDN --> Static
    LB --> Web1
    LB --> Web2
    Web1 --> API1
    Web2 --> API2
    API1 --> Auth
    API1 --> Profile
    API1 --> Rec
    API2 --> Auth
    API2 --> Profile
    API2 --> Rec
    Auth --> Cache
    Profile --> Cache
    Rec --> Cache
    Auth --> Primary
    Profile --> Replica
    Rec --> Search
```

### 4.7.2 Development vs Production

| Aspect        | Development  | Production         |
| ------------- | ------------ | ------------------ |
| Database      | SQLite       | PostgreSQL Cluster |
| Cache         | In-memory    | Redis Cluster      |
| API Servers   | 1 instance   | Auto-scaling group |
| Load Balancer | None         | Application LB     |
| SSL           | Self-signed  | Let's Encrypt      |
| Monitoring    | Console logs | DataDog/CloudWatch |
| Backups       | None         | Automated daily    |

## 4.8 Security Model

### 4.8.1 Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    participant JWT as JWT Service

    Client->>API: POST /auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Get user by email
    DB-->>Auth: User record
    Auth->>Auth: Verify password hash

    alt Valid Credentials
        Auth->>JWT: Generate tokens
        JWT-->>Auth: Access + Refresh tokens
        Auth->>DB: Update last_login
        Auth-->>API: Tokens + User info
        API-->>Client: 200 OK with tokens
        Client->>Client: Store tokens securely
    else Invalid Credentials
        Auth-->>API: Authentication failed
        API-->>Client: 401 Unauthorized
    end

    Note over Client,API: Subsequent requests
    Client->>API: GET /api/resource + Bearer token
    API->>JWT: Validate token
    JWT-->>API: Token valid/invalid
    alt Token Valid
        API->>API: Process request
        API-->>Client: 200 OK with data
    else Token Invalid
        API-->>Client: 401 Unauthorized
    end
```

### 4.8.2 Data Access Control

```mermaid
graph TB
    subgraph "Access Layers"
        Public[Public Access]
        Auth[Authenticated Users]
        Owner[Resource Owner]
        Admin[Admin Users]
    end

    subgraph "Resources"
        RestData[Restaurant Data]
        UserProf[User Profiles]
        HealthData[Health Data]
        Recs[Recommendations]
        Audit[Audit Logs]
    end

    Public -->|Read Only| RestData
    Auth -->|Read| RestData
    Auth -->|Create| Recs
    Owner -->|Full Access| UserProf
    Owner -->|Full Access| HealthData
    Owner -->|Read| Recs
    Admin -->|Read Only| UserProf
    Admin -->|No Access| HealthData
    Admin -->|Read| Audit
```

## 4.9 Performance Model

### 4.9.1 Response Time Breakdown

```mermaid
gantt
    title API Response Time Budget (200ms target)
    dateFormat X
    axisFormat %L

    section Request Path
    Network Latency      :0, 20
    Load Balancer       :20, 5
    API Gateway         :25, 10
    Service Logic       :35, 50
    Database Query      :85, 40
    Cache Lookup        :35, 5
    AI Processing       :85, 80
    Response Format     :165, 10
    Network Return      :175, 25
```

### 4.9.2 Caching Strategy

```mermaid
graph LR
    subgraph "Cache Hierarchy"
        Browser[Browser Cache<br/>Static Assets]
        CDN[CDN Cache<br/>Images, JS, CSS]
        API[API Cache<br/>Response Cache]
        Redis[Redis Cache<br/>Session, Profile]
        DB[DB Cache<br/>Query Cache]
    end

    Request -->|1| Browser
    Browser -->|Miss| CDN
    CDN -->|Miss| API
    API -->|Miss| Redis
    Redis -->|Miss| DB

    DB -->|Data| Redis
    Redis -->|Data| API
    API -->|Data| CDN
    CDN -->|Data| Browser
    Browser -->|Response| User
```

---

**Document Status:** COMPLETE  
**Last Review:** October 21, 2025  
**Next Review:** With system implementation
