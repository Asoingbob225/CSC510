# 3.4 Use Cases

## Overview

This document defines the detailed use cases for the Eatsential AI-powered precision nutrition platform. Each use case includes main flow, alternate flows, exception flows, preconditions, postconditions, and acceptance criteria.

**Dual-Dimension Approach**: Eatsential uniquely addresses both physical health goals and mental wellness objectives through integrated use cases spanning nutrition, mood tracking, stress management, and AI-powered guidance.

## Use Case Categories

**Physical Health** (Existing):

- **Authentication & User Management**: UC-001 to UC-003
- **Health Profile Management**: UC-004 to UC-007
- **Meal Planning & Recommendations**: UC-008 to UC-012
- **Visual Wellness Journey**: UC-013 to UC-017
- **Nutritionist Integration**: UC-018 to UC-020

**Mental Wellness & AI** (NEW):

- **Mental Wellness Management**: UC-021 to UC-025
- **Health Tagging & Discovery**: UC-026 to UC-027
- **Dual-Dimension Recommendations**: UC-028 to UC-029
- **AI Health Concierge**: UC-030 to UC-032

**Total**: 32 Use Cases

---

## UC-001: User Registration

**Primary Actor**: New User  
**Goal**: Register a new account in the Eatsential platform  
**Preconditions**: User has valid email address and internet connection  
**Postconditions**: User account is created and activation email is sent

### Main Flow

1. User navigates to registration page
2. User enters email, password, and basic information
3. System validates input format and uniqueness
4. User agrees to terms of service and privacy policy
5. System creates account with "pending verification" status
6. System sends verification email to user
7. User clicks verification link in email
8. System activates account and redirects to profile setup

### Alternate Flows

**A1**: Social media registration

- 1a. User selects "Sign up with Google/Apple"
- 1b. System redirects to OAuth provider
- 1c. User authorizes access
- 1d. System creates account with verified status

### Exception Flows

**E1**: Email already exists

- 3a. System displays "Email already registered" message
- 3b. System offers "Sign In" or "Reset Password" options

**E2**: Weak password

- 3a. System displays password strength requirements
- 3b. User updates password to meet criteria

### Acceptance Criteria

- Email validation follows RFC 5322 standards
- Password must be 8+ characters with mixed case, numbers, symbols
- Account verification email sent reliably
- OAuth registration completes successfully

---

## UC-002: User Authentication

**Primary Actor**: Registered User  
**Goal**: Securely log into the Eatsential platform  
**Preconditions**: User has verified account  
**Postconditions**: User is authenticated and redirected to dashboard

### Main Flow

1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System creates secure session
5. System redirects to personalized dashboard

### Alternate Flows

**A1**: Two-factor authentication

- 3a. System prompts for 2FA code
- 3b. User enters TOTP code from authenticator app
- 3c. System validates 2FA token

**A2**: Social media login

- 2a. User selects OAuth provider
- 2b. System redirects for authentication
- 2c. Provider returns authorization token

### Exception Flows

**E1**: Invalid credentials

- 3a. System displays "Invalid email or password"
- 3b. System increments failed attempt counter
- 3c. After 5 attempts, account is temporarily locked

**E2**: Account not verified

- 3a. System displays verification required message
- 3b. System offers to resend verification email

### Acceptance Criteria

- Login attempts processed efficiently
- Failed attempts result in temporary account lockout after multiple failures
- Sessions expire after reasonable period of inactivity
- 2FA codes have appropriate validity window

---

## UC-003: Password Reset

**Primary Actor**: User  
**Goal**: Reset forgotten password securely  
**Preconditions**: User has registered email address  
**Postconditions**: User can log in with new password

### Main Flow

1. User clicks "Forgot Password" on login page
2. User enters registered email address
3. System validates email exists in database
4. System sends password reset link to email
5. User clicks reset link before expiration
6. System displays secure password reset form
7. User enters new password twice
8. System validates password strength
9. System updates password and invalidates all sessions
10. System redirects to login with success message

### Exception Flows

**E1**: Email not found

- 3a. System displays generic "Reset link sent" message (security)
- 3b. No email is actually sent

**E2**: Expired reset link

- 5a. System displays "Link expired" message
- 5b. System offers to resend reset email

### Acceptance Criteria

- Reset links have reasonable expiration time
- New password must meet security requirements
- All existing sessions invalidated upon password change
- Generic success message prevents email enumeration

---

## UC-004: Create Health Profile

**Primary Actor**: New User  
**Goal**: Set up comprehensive health and dietary profile  
**Preconditions**: User is authenticated  
**Postconditions**: Complete health profile enables personalized recommendations

### Main Flow

1. System presents health profile wizard
2. User enters basic demographics (age, gender, height, weight)
3. User selects dietary preferences (vegetarian, keto, Mediterranean, etc.)
4. User lists food allergies and intolerances
5. User specifies health goals (weight loss, muscle gain, maintenance)
6. User answers lifestyle questions (activity level, cooking frequency)
7. User uploads recent lab results (optional)
8. User sets nutritional targets (calories, macros, micronutrients)
9. System validates all inputs
10. System calculates personalized baseline recommendations
11. System saves profile and displays confirmation

### Alternate Flows

**A1**: Import from wearable device

- 7a. User connects fitness tracker or smartwatch
- 7b. System imports activity data and biometrics
- 7c. System auto-adjusts caloric requirements

**A2**: Professional nutritionist setup

- 8a. User indicates they work with registered dietitian
- 8b. System provides professional sharing codes
- 8c. Nutritionist reviews and approves profile settings

### Exception Flows

**E1**: Invalid biometric data

- 2a. System displays validation errors for unrealistic values
- 2b. User corrects entries within normal ranges

**E2**: Conflicting dietary preferences

- 4a. System detects incompatible selections (e.g., vegan + keto)
- 4b. System suggests modified approaches or professional consultation

### Acceptance Criteria

- Profile completion process is user-friendly and efficient
- All mandatory fields validated for realistic ranges
- Dietary preferences support 15+ common patterns
- Lab results support standard formats (PDF, images)
- Baseline calculations use evidence-based formulas

---

## UC-005: Update Health Metrics

**Primary Actor**: User  
**Goal**: Update weight, measurements, and health indicators  
**Preconditions**: User has existing health profile  
**Postconditions**: Updated metrics trigger recommendation recalculation

### Main Flow

1. User navigates to profile dashboard
2. User selects "Update Metrics" option
3. System displays current values and input fields
4. User enters new weight, body fat %, measurements
5. User adds optional notes about changes
6. System validates entries against previous trends
7. System updates profile and recalculates targets
8. System displays progress visualization
9. System adjusts meal recommendations based on new metrics

### Alternate Flows

**A1**: Automated sync from smart scale

- 4a. System detects connected IoT device
- 4b. System imports latest measurements automatically
- 4c. User confirms or adjusts imported values

### Exception Flows

**E1**: Extreme value changes

- 6a. System flags unusual weight changes (>5lbs/week)
- 6b. System prompts user to confirm accuracy
- 6c. System suggests consulting healthcare provider

### Acceptance Criteria

- Metric updates reflected in recommendations promptly
- Historical data preserved for trend analysis
- Integration supports 10+ popular smart scale brands
- Extreme changes trigger appropriate health warnings

---

## UC-006: Manage Dietary Restrictions

**Primary Actor**: User  
**Goal**: Add, modify, or remove dietary restrictions and allergies  
**Preconditions**: User has health profile  
**Postconditions**: All recommendations exclude restricted ingredients

### Main Flow

1. User accesses "Dietary Restrictions" in profile settings
2. System displays current restrictions and allergy list
3. User adds new restriction from comprehensive database
4. User specifies severity level (mild discomfort to life-threatening)
5. User adds custom notes about specific triggers
6. System updates recommendation algorithms
7. System re-validates all saved recipes and meal plans
8. System removes or flags incompatible recommendations
9. System displays confirmation of changes

### Alternate Flows

**A1**: Temporary restriction

- 3a. User specifies time-limited restriction (e.g., medication)
- 3b. System sets automatic expiration date
- 3c. System prompts for renewal or removal

### Exception Flows

**E1**: Conflicting restrictions

- 6a. System detects restrictions that eliminate most food options
- 6b. System suggests consulting registered dietitian
- 6c. System provides educational resources

### Acceptance Criteria

- Restriction database includes 200+ common allergens/intolerances
- Severity levels affect recommendation filtering strictness
- Changes propagate to all recommendations efficiently
- System warns when restrictions severely limit options

---

## UC-007: Export Health Data

**Primary Actor**: User  
**Goal**: Export personal health and nutrition data  
**Preconditions**: User has data in the system  
**Postconditions**: User receives comprehensive data export

### Main Flow

1. User navigates to "Data Export" in account settings
2. User selects data types to include (profile, meals, progress, etc.)
3. User chooses export format (PDF report, CSV data, JSON)
4. User specifies date range for historical data
5. System validates request and estimates processing requirements
6. System generates export package in background
7. System sends download link via email
8. User downloads export before link expiration

### Alternate Flows

**A1**: Share with healthcare provider

- 3a. User selects "Medical Summary" format
- 3b. System generates privacy-compliant health summary report
- 3c. System provides secure sharing link

### Exception Flows

**E1**: Large data export

- 6a. System identifies complex processing requirements
- 6b. System queues request and sends email notification
- 6c. System provides progress updates

### Acceptance Criteria

- Export generation completes efficiently for standard requests
- Data includes all user-generated content and system recommendations
- Medical summaries follow healthcare industry standards
- Export links expire after reasonable time for security

---

## UC-008: Get Meal Recommendations

**Primary Actor**: User  
**Goal**: Receive personalized meal suggestions based on health profile  
**Preconditions**: User has complete health profile  
**Postconditions**: User receives tailored meal options for specified timeframe

### Main Flow

1. User opens meal recommendations dashboard
2. System analyzes current nutritional targets and restrictions
3. System considers recent meal history and preferences
4. System queries recipe database with AI-powered filtering
5. System generates diverse meal options for breakfast, lunch, dinner
6. System displays recommendations with nutritional breakdown
7. User views detailed recipes and preparation instructions
8. User saves preferred meals to personal collection

### Alternate Flows

**A1**: Quick meal request

- 1a. User specifies "15-minute meals" filter
- 1b. System prioritizes simple recipes with minimal prep
- 1c. System suggests meal prep shortcuts

**A2**: Ingredient-based recommendations

- 2a. User inputs available ingredients
- 2b. System suggests recipes using on-hand items
- 2c. System calculates nutrition with user ingredients

### Exception Flows

**E1**: No suitable recommendations

- 4a. System finds fewer than 3 options meeting criteria
- 4b. System suggests relaxing dietary restrictions temporarily
- 4c. System offers to connect with nutritionist for guidance

**E2**: API service unavailable

- 4a. System displays cached recommendations
- 4b. System notifies user of limited fresh options
- 4c. System retries recommendation generation periodically

### Acceptance Criteria

- Recommendations generated within 3 seconds
- At least 5 diverse options per meal category
- Nutritional calculations accurate within 5% margin
- Recipe instructions include timing and difficulty level

---

## UC-009: Create Custom Meal Plan

**Primary Actor**: User  
**Goal**: Design personalized weekly or monthly meal plan  
**Preconditions**: User has health profile and meal preferences  
**Postconditions**: Custom meal plan saved with shopping list generation

### Main Flow

1. User selects "Create Meal Plan" from planning dashboard
2. User chooses timeframe (1 week, 2 weeks, 1 month)
3. User sets planning preferences (prep time, complexity, variety)
4. System generates initial meal plan matching user criteria
5. User reviews and modifies suggested meals
6. User adds custom recipes or favorite meals
7. System recalculates nutritional totals for entire plan
8. User saves finalized meal plan with custom name
9. System generates organized shopping list
10. System sets optional reminder notifications

### Alternate Flows

**A1**: Template-based planning

- 3a. User selects from pre-made plan templates
- 3b. System customizes template to user's restrictions
- 3c. User makes final adjustments

**A2**: Collaborative planning

- 8a. User shares plan with family members
- 8b. Family members suggest modifications
- 8c. System merges suggestions and notifies original planner

### Exception Flows

**E1**: Nutritional targets not met

- 7a. System highlights macro/micronutrient gaps
- 7b. System suggests specific meal substitutions
- 7c. User approves adjustments or accepts variance

### Acceptance Criteria

- Meal plan generation completes within 15 seconds
- Shopping list organized by grocery store sections
- Plans support dietary rotation to prevent monotony
- Nutritional targets achieved within 10% tolerance

---

## UC-010: Generate Shopping List

**Primary Actor**: User  
**Goal**: Create optimized grocery shopping list from meal plan  
**Preconditions**: User has active meal plan  
**Postconditions**: Shopping list available in mobile-friendly format

### Main Flow

1. User opens meal plan and selects "Generate Shopping List"
2. System aggregates all ingredients from planned meals
3. System consolidates duplicate items and calculates quantities
4. System organizes list by grocery store categories
5. User reviews list and checks off items already at home
6. User adds custom items not from meal plan
7. System estimates total cost based on local price data
8. User saves list and syncs to mobile device
9. System provides in-store navigation for supported retailers

### Alternate Flows

**A1**: Multi-store optimization

- 4a. User enables "best price" mode
- 4b. System suggests item allocation across stores
- 4c. System provides separate lists per store

**A2**: Subscription box integration

- 6a. User connects meal kit delivery service
- 6b. System suggests which items to order vs. buy locally
- 6c. System generates modified shopping list

### Exception Flows

**E1**: Ingredient not available locally

- 3a. System identifies specialty items not in local stores
- 3b. System suggests substitute ingredients
- 3c. System provides online ordering options

### Acceptance Criteria

- List generation completes within 5 seconds
- Quantity calculations accurate for recipe servings
- Cost estimates within 15% of actual prices
- Mobile app supports offline list access

---

## UC-011: Track Meal Consumption

**Primary Actor**: User  
**Goal**: Log actual meals consumed and track nutritional progress  
**Preconditions**: User has recommendations or meal plan  
**Postconditions**: Consumption data updates progress tracking and recommendations

### Main Flow

1. User opens meal tracking interface
2. User searches for consumed meal in recommendation history
3. User confirms meal selection and portion size
4. System calculates nutritional values for actual portion
5. User adds timing information (breakfast, lunch, dinner, snack)
6. System updates daily nutritional progress display
7. System adjusts remaining daily recommendations
8. System stores consumption data for trend analysis

### Alternate Flows

**A1**: Photo-based logging

- 2a. User takes photo of meal
- 2b. System uses AI to identify foods and estimate portions
- 2c. User confirms or adjusts AI suggestions

**A2**: Barcode scanning

- 2a. User scans packaged food barcode
- 2b. System retrieves nutritional data from database
- 2c. User enters quantity consumed

**A3**: Voice logging

- 1a. User speaks meal description to voice assistant
- 1b. System converts speech to text and searches database
- 1c. System confirms meal identification with user

### Exception Flows

**E1**: Meal not in database

- 2a. System cannot identify consumed meal
- 2b. User manually enters meal description and nutrition
- 2c. System saves custom entry for future use

**E2**: Significant deviation from plan

- 6a. System detects major nutritional variance
- 6b. System suggests compensatory adjustments
- 6c. System offers to modify remaining daily plan

### Acceptance Criteria

- Meal search returns results within 2 seconds
- Photo recognition accuracy >85% for common foods
- Barcode database includes 100,000+ products
- Voice recognition supports natural language descriptions

---

## UC-012: Rate and Review Meals

**Primary Actor**: User  
**Goal**: Provide feedback on recommended meals to improve future suggestions  
**Preconditions**: User has consumed recommended meals  
**Postconditions**: Feedback improves recommendation algorithm accuracy

### Main Flow

1. User navigates to meal history
2. User selects previously consumed meal
3. User rates meal on 5-star scale
4. User selects specific feedback categories (taste, preparation, satisfaction)
5. User adds optional written review
6. User indicates likelihood to make meal again
7. System stores feedback linked to user profile
8. System updates recommendation algorithm weights
9. System thanks user and suggests similar meals

### Alternate Flows

**A1**: Quick rating

- 3a. System prompts for rating immediately after meal logging
- 3b. User provides 1-5 star rating only
- 3c. System saves minimal feedback

**A2**: Detailed dietary response

- 4a. User reports digestive issues or allergic reactions
- 4b. System flags meal ingredients for user restrictions
- 4c. System removes similar meals from future recommendations

### Exception Flows

**E1**: Negative feedback on allergic reaction

- 4a. User reports severe allergic reaction
- 4b. System immediately flags all ingredients as allergens
- 4c. System suggests emergency medical consultation

### Acceptance Criteria

- Rating interface accessible within 2 clicks from meal history
- Feedback processing improves recommendations within 24 hours
- Allergic reaction flags prevent similar suggestions permanently
- User can modify or delete previous ratings

---

## UC-013: Start Visual Wellness Journey

**Primary Actor**: User  
**Goal**: Begin comprehensive visual tracking of nutrition and wellness progress  
**Preconditions**: User has completed health profile  
**Postconditions**: Visual journey dashboard initialized with baseline data

### Main Flow

1. User selects "Visual Wellness Journey" from main dashboard
2. System presents journey setup wizard
3. User chooses primary wellness focus (weight management, energy, performance)
4. User selects visualization preferences (charts, photos, measurements)
5. User sets milestone timeline (30 days, 90 days, 6 months)
6. System creates personalized journey dashboard
7. System establishes baseline measurements and photos
8. User takes initial progress photos (optional)
9. System generates initial progress visualization
10. System schedules periodic check-in reminders

### Alternate Flows

**A1**: Guided journey selection

- 3a. User requests system recommendations
- 3b. System analyzes health goals and suggests optimal journey type
- 3c. User approves or modifies suggested journey

**A2**: Group journey participation

- 5a. User joins family or friend group journey
- 5b. System creates shared progress tracking
- 5c. System enables milestone celebrations and encouragement

### Exception Flows

**E1**: Unclear wellness goals

- 3a. User indicates uncertainty about focus area
- 3b. System provides educational resources about wellness aspects
- 3c. System suggests starting with general health tracking

### Acceptance Criteria

- Journey setup completes within 5 minutes
- Dashboard loads with visualizations within 3 seconds
- Photo upload supports common image formats
- Baseline establishment uses evidence-based metrics

---

## UC-014: Update Visual Progress

**Primary Actor**: User  
**Goal**: Record and visualize ongoing wellness progress  
**Preconditions**: User has active Visual Wellness Journey  
**Postconditions**: Progress data updated with new visualizations generated

### Main Flow

1. User opens Visual Wellness Journey dashboard
2. System prompts for progress update based on schedule
3. User enters current measurements (weight, energy level, mood)
4. User uploads current progress photos (optional)
5. User completes brief wellness questionnaire
6. System processes new data and generates updated visualizations
7. System compares current metrics to journey goals
8. System displays progress trends and milestone achievements
9. System provides encouraging feedback and next steps
10. System updates journey timeline and projections

### Alternate Flows

**A1**: Wearable device sync

- 3a. System automatically imports data from connected devices
- 3b. User reviews and confirms imported metrics
- 3c. System supplements with manual entry for missing data

**A2**: Quick photo comparison

- 4a. User uses in-app camera with overlay guides
- 4b. System aligns new photo with previous shots
- 4c. System generates side-by-side progress comparison

### Exception Flows

**E1**: Missed update schedule

- 2a. User hasn't updated progress in >7 days
- 2b. System sends gentle reminder notifications
- 2c. System adjusts timeline projections for gaps

**E2**: Negative progress indication

- 6a. System detects regression in key metrics
- 6b. System provides supportive messaging and suggestions
- 6c. System offers to connect with support resources

### Acceptance Criteria

- Progress visualization generates within 10 seconds
- Photo alignment accuracy >90% for comparison overlay
- Trend analysis uses minimum 3 data points
- Motivational messaging adapts to progress patterns

---

## UC-015: View Progress Analytics

**Primary Actor**: User  
**Goal**: Analyze comprehensive wellness trends and patterns  
**Preconditions**: User has 2+ weeks of journey data  
**Postconditions**: User gains insights into wellness patterns and optimization opportunities

### Main Flow

1. User selects "Analytics" from Visual Wellness dashboard
2. System displays comprehensive progress overview
3. User selects specific timeframe for analysis (week, month, quarter)
4. System generates trend charts for key metrics
5. User explores correlation analysis between diet and wellness
6. System highlights significant achievements and patterns
7. User views predictive projections based on current trends
8. System suggests optimization opportunities
9. User exports analytics report for sharing

### Alternate Flows

**A1**: Comparative analysis

- 4a. User selects multiple metrics for comparison
- 4b. System overlays trends to show correlations
- 4c. System calculates statistical significance

**A2**: Goal adjustment based on insights

- 8a. User requests goal modification based on analytics
- 8b. System recalculates journey timeline
- 8c. System updates recommendations accordingly

### Exception Flows

**E1**: Insufficient data for trends

- 4a. System indicates minimum data requirements not met
- 4b. System shows available partial analysis
- 4c. System encourages consistent tracking

### Acceptance Criteria

- Analytics dashboard loads within 5 seconds
- Trend calculations use appropriate statistical methods
- Correlations require minimum statistical significance
- Export reports include visual charts and data tables

---

## UC-016: Share Journey Progress

**Primary Actor**: User  
**Goal**: Share wellness journey achievements with support network  
**Preconditions**: User has journey progress data  
**Postconditions**: Selected progress information shared via chosen channels

### Main Flow

1. User selects "Share Progress" from journey dashboard
2. User chooses what to share (milestones, photos, metrics)
3. User selects sharing destination (social media, email, app community)
4. System generates shareable content with privacy controls
5. User customizes sharing message and visibility settings
6. User previews shared content before publishing
7. System publishes content to selected channels
8. System tracks engagement and supportive responses
9. System notifies user of community support received

### Alternate Flows

**A1**: Professional sharing

- 3a. User shares with healthcare provider or nutritionist
- 3b. System generates clinical summary format
- 3c. System uses secure, privacy-compliant sharing protocols

**A2**: Achievement badge sharing

- 4a. System creates achievement graphic for milestone
- 4b. User customizes badge design and message
- 4c. System adds badge to user's profile gallery

### Exception Flows

**E1**: Privacy concerns

- 5a. User expresses uncertainty about sharing personal data
- 5b. System explains privacy controls and data usage
- 5c. User adjusts sharing settings or cancels

### Acceptance Criteria

- Sharing content generation completes within 15 seconds
- Privacy controls allow granular selection of shared data
- Professional sharing maintains medical privacy standards
- Community features encourage positive, supportive interactions

---

## UC-017: Receive Journey Insights

**Primary Actor**: User  
**Goal**: Get AI-powered insights and recommendations based on journey data  
**Preconditions**: User has 30+ days of journey data  
**Postconditions**: User receives personalized insights for journey optimization

### Main Flow

1. System analyzes accumulated journey data weekly
2. System identifies significant patterns and correlations
3. System generates personalized insight report
4. System delivers insights via dashboard notification
5. User reviews insights including data visualizations
6. User explores detailed explanations for each insight
7. System provides actionable recommendations based on insights
8. User implements suggested changes or marks insights as helpful
9. System tracks effectiveness of insight-based changes

### Alternate Flows

**A1**: Real-time insight alerts

- 1a. System detects significant pattern change
- 1b. System sends immediate notification
- 1c. User can request detailed analysis

**A2**: Insight discussion with AI assistant

- 6a. User asks questions about specific insights
- 6b. AI assistant provides explanations and context
- 6c. Assistant suggests related optimization strategies

### Exception Flows

**E1**: Contradictory data patterns

- 2a. System identifies conflicting trends
- 2b. System highlights uncertainty in insights
- 2c. System suggests additional data collection

**E2**: No significant insights available

- 2a. System determines patterns are not statistically significant
- 2b. System encourages continued tracking
- 2c. System provides general wellness education instead

### Acceptance Criteria

- Weekly insight generation completes within 2 minutes
- Insights based on statistically significant patterns only
- Recommendations include specific, actionable steps
- Users can provide feedback on insight helpfulness

---

## UC-018: Connect with Nutritionist

**Primary Actor**: User  
**Goal**: Establish professional relationship with registered dietitian  
**Preconditions**: User has health profile and may have dietary challenges  
**Postconditions**: User connected with qualified nutritionist for ongoing support

### Main Flow

1. User selects "Find Nutritionist" from profile menu
2. System displays search filters (location, specialization, availability)
3. User sets preferences for nutritionist characteristics
4. System presents list of qualified, verified professionals
5. User reviews nutritionist profiles and credentials
6. User selects preferred nutritionist and requests consultation
7. System facilitates appointment scheduling
8. Nutritionist reviews user's health profile before meeting
9. System provides secure video consultation platform
10. System enables ongoing communication and plan sharing

### Alternate Flows

**A1**: Insurance verification

- 6a. User provides insurance information
- 6b. System verifies coverage for nutrition counseling
- 6c. System displays covered and non-covered options

**A2**: Nutritionist referral from physician

- 1a. User enters referral code from healthcare provider
- 1b. System connects with specific recommended nutritionist
- 1c. System streamlines medical information sharing

### Exception Flows

**E1**: No available nutritionists

- 4a. System finds no professionals matching criteria
- 4b. System expands search radius or suggests alternatives
- 4c. System offers waitlist for preferred criteria

**E2**: Scheduling conflicts

- 7a. No mutually available appointment times
- 7b. System suggests alternative time slots
- 7c. System offers asynchronous consultation option

### Acceptance Criteria

- Nutritionist database includes 500+ verified professionals
- Video consultation platform supports screen sharing
- Insurance verification completes within 24 hours
- All professionals must maintain current credentials

---

## UC-019: Collaborative Meal Planning

**Primary Actor**: User and Nutritionist  
**Goal**: Create professional meal plan with ongoing guidance  
**Preconditions**: User connected with nutritionist  
**Postconditions**: Evidence-based meal plan with professional oversight

### Main Flow

1. Nutritionist reviews user's complete health profile and goals
2. Nutritionist analyzes current dietary patterns and restrictions
3. Nutritionist creates preliminary professional meal plan
4. System presents plan to user with nutritionist's recommendations
5. User and nutritionist discuss plan via messaging or video call
6. User provides feedback on meal preferences and feasibility
7. Nutritionist adjusts plan based on user input and clinical judgment
8. System finalizes collaborative meal plan with professional approval
9. Nutritionist sets monitoring schedule for plan effectiveness
10. System enables ongoing plan adjustments and communication

### Alternate Flows

**A1**: Medical dietary requirements

- 2a. Nutritionist considers medical conditions requiring special diets
- 2b. Nutritionist coordinates with user's healthcare team
- 2c. Plan includes medical nutrition therapy components

**A2**: Family meal planning

- 3a. User requests family-friendly meal plan
- 3b. Nutritionist creates plan accommodating multiple family members
- 3c. System generates shopping lists for family portions

### Exception Flows

**E1**: Conflicting professional recommendations

- 7a. User's physician provides contradictory dietary advice
- 7b. Nutritionist requests clarification from medical team
- 7c. System facilitates professional consultation

### Acceptance Criteria

- Professional meal plans meet evidence-based nutrition standards
- Communication platform maintains privacy and security standards
- Plan adjustments reflected in user recommendations within 1 hour
- Nutritionist can override system recommendations when clinically appropriate

---

## UC-020: Monitor Professional Progress

**Primary Actor**: Nutritionist  
**Goal**: Track client progress and adjust recommendations professionally  
**Preconditions**: Nutritionist has active client relationship  
**Postconditions**: Professional assessment completed with plan adjustments if needed

### Main Flow

1. Nutritionist accesses client dashboard with recent progress data
2. System displays client's meal adherence and outcome metrics
3. Nutritionist reviews biometric changes and reported symptoms
4. Nutritionist analyzes effectiveness of current meal plan
5. System highlights significant changes or concerning trends
6. Nutritionist documents professional assessment notes
7. Nutritionist adjusts meal plan based on clinical judgment
8. System implements nutritionist's plan modifications
9. Nutritionist schedules follow-up monitoring period
10. System sends progress summary to client with encouragement

### Alternate Flows

**A1**: Urgent health concerns

- 5a. System flags potential health risks in client data
- 5b. Nutritionist prioritizes immediate client contact
- 5c. Nutritionist coordinates with client's healthcare team

**A2**: Excellent progress celebration

- 4a. Client achieves significant milestone ahead of schedule
- 4b. Nutritionist provides positive reinforcement
- 4c. System suggests progression to advanced goals

### Exception Flows

**E1**: Client non-compliance

- 2a. System shows poor meal plan adherence
- 2b. Nutritionist investigates barriers to compliance
- 2c. Nutritionist modifies plan to improve feasibility

**E2**: Unexpected adverse effects

- 3a. Client reports negative symptoms potentially related to diet
- 3b. Nutritionist immediately reviews plan for potential causes
- 3c. Nutritionist makes emergency plan modifications

### Acceptance Criteria

- Professional dashboard updates in real-time
- Assessment notes maintain confidential professional records
- Emergency contact protocols activate within 15 minutes
- Plan modifications take effect immediately upon nutritionist approval

---

## Mental Wellness Management Use Cases

> **Note**: The following use cases (UC-021 to UC-025) represent NEW functionality for the Mental Wellness dimension of Eatsential's dual-dimension health approach.

---

## UC-021: Set Mental Wellness Goals

**Status**: ✅ **Implemented** (v0.3)

**Primary Actor**: User  
**Goal**: Define personal mental wellness objectives and track progress  
**Preconditions**: User has verified account and completed initial profile  
**Postconditions**: Mental wellness goals saved and integrated into recommendation engine

### Main Flow

1. User navigates to Mental Wellness section
2. User selects goal type (stress reduction, mood improvement, sleep quality, focus enhancement, anxiety management)
3. User rates current level (1-10 scale)
4. User sets target level (1-10 scale)
5. User assigns priority (high, medium, low)
6. User optionally adds context notes (e.g., "work stress", "insomnia")
7. System validates inputs
8. System saves mental wellness goal
9. System adjusts recommendation engine to include mental wellness scoring
10. System displays goal on mental wellness dashboard with progress tracking

### Alternate Flows

**A1**: Multiple goals

- 2a. User creates multiple mental wellness goals
- 2b. System prompts user to prioritize if more than 3 goals
- 2c. System balances competing goals in recommendations

**A2**: Goal templates

- 2a. User selects pre-defined goal template (e.g., "Reduce Work Stress")
- 2b. System pre-fills common settings
- 2c. User customizes template to personal situation

### Exception Flows

**E1**: Conflicting goals

- 8a. System detects potential goal conflicts (e.g., high-calorie comfort foods vs weight loss)
- 8b. System displays conflict warning with explanation
- 8c. User adjusts priority or accepts trade-offs

**E2**: Unrealistic targets

- 4a. User sets extreme target (e.g., current=2, target=10 in 1 week)
- 4b. System suggests more realistic timeline
- 4c. User adjusts expectations or confirms ambitious target

### Acceptance Criteria

- Goal creation completed in under 2 minutes
- At least 5 predefined goal types available
- Progress tracking visible on dashboard
- Goals integrated into meal recommendation algorithm within 1 minute
- Users can create up to 5 concurrent mental wellness goals

---

## UC-022: Log Daily Mood

**Status**: ✅ **Implemented** (v0.3)

**Primary Actor**: User  
**Goal**: Record current mood state with context for pattern analysis  
**Preconditions**: User has active account  
**Postconditions**: Mood log saved and included in analytics

### Main Flow

1. User accesses mood logging interface (app or quick widget)
2. User rates overall mood (1-10 scale with emoji visualization)
3. User selects mood tags (happy, sad, anxious, calm, energetic, tired, stressed, content)
4. User rates energy level (1-10 scale)
5. User optionally selects context (after_meal, morning, evening, workout, work, social)
6. User optionally adds brief notes
7. System timestamps log entry
8. System saves mood log
9. System updates mood calendar visualization
10. System triggers personalized insights if pattern detected

### Alternate Flows

**A1**: Quick logging

- 1a. User uses one-tap quick mood log from notification
- 1b. System logs mood with current time and minimal data
- 1c. User can expand entry later to add details

**A2**: Post-meal mood tracking

- 1a. System prompts mood log 30 minutes after meal logging
- 1b. User logs mood with automatic meal correlation
- 1c. System analyzes food-mood relationship

### Exception Flows

**E1**: Multiple logs same hour

- 8a. User tries to log mood multiple times within 1 hour
- 8b. System asks if user wants to update previous entry or create new entry
- 8c. User confirms action

**E2**: Extreme mood changes

- 2a. User logs dramatically different mood than recent pattern (e.g., 9→2 in 2 hours)
- 2b. System displays supportive message with wellness resources
- 2c. System flags for potential follow-up insights

### Acceptance Criteria

- Mood logging completed in under 30 seconds
- Calendar view shows color-coded mood history
- Users can log unlimited entries per day
- Mood trends visible in analytics within 24 hours
- System provides opt-in reminders (morning, evening, post-meal)

---

## UC-023: Track Stress Levels

**Status**: ✅ **Implemented** (v0.3)

**ID**: UC-023  
**Primary Actor**: User  
**Goal**: Log current stress level with triggers and coping strategies

**Preconditions**:

- User is authenticated
- User has mental wellness goals configured

**Postconditions**:

- Stress log saved with triggers and strategies
- Stress timeline updated
- Personalized insights generated if patterns detected

**Main Flow**:

1. User navigates to "Stress Tracking" from Mental Wellness dashboard
2. System displays stress logging interface with 1-10 visual scale
3. User selects stress level using slider (stress thermometer visualization)
4. System prompts for stress trigger selection
5. User selects applicable triggers (work, relationships, health, finance, other)
6. System displays coping strategies prompt
7. User selects strategies used (exercise, meditation, social support, breathing)
8. User adds optional contextual notes
9. System timestamps and saves stress log to database
10. System updates stress timeline chart with new data point
11. System analyzes for recurring patterns (if 7+ days of data)
12. System displays confirmation with link to stress analytics

**Alternate Flows**:

**A1**: Quick stress check-in

- 3a. User selects "Quick Log" option
- 3b. System only requires stress level (1-10)
- 3c. Skip triggers and strategies
- 3d. System saves minimal stress log

**A2**: Voice-to-text stress journaling

- 8a. User taps microphone icon
- 8b. User speaks contextual notes
- 8c. System transcribes speech to text
- 8d. User confirms or edits transcription

**Exception Flows**:

**E1**: High stress alert

- 3a. User logs stress level > 8
- 3b. System checks history for pattern (3+ consecutive high-stress days)
- 3c. System displays wellness resources (helpline, professional support)
- 3d. System suggests #StressRelief meals for upcoming meals

**E2**: Night-time extreme stress

- 9a. User logs stress level > 8 after 8 PM
- 9b. System recognizes potential sleep impact
- 9c. System offers #SleepAid meal suggestions
- 9d. System provides calming breathing exercise prompt

### Acceptance Criteria

- Stress logging completes in under 45 seconds
- Trigger categories cover 90%+ of common stressors
- System identifies recurring patterns after 7 days minimum data
- High-stress alerts activate within 5 minutes
- Stress data integrates with meal recommendations (#StressRelief filter)

---

## UC-024: Monitor Sleep Quality

**Status**: ✅ **Implemented** (v0.3)

**ID**: UC-024  
**Primary Actor**: User  
**Goal**: Track sleep duration, quality, and factors affecting rest

**Preconditions**:

- User is authenticated
- User has mental wellness profile

**Postconditions**:

- Sleep log saved with quality metrics
- Sleep-nutrition correlation analysis updated
- Evening meal recommendations adjusted if patterns detected

**Main Flow**:

1. User accesses "Sleep Tracking" (typically in morning)
2. System auto-populates previous night's date
3. User enters bedtime using time picker
4. User enters wake time using time picker
5. System auto-calculates sleep duration
6. User rates sleep quality on 1-10 scale (with emoji icons)
7. System asks about sleep interruptions (count)
8. User reports if feeling refreshed (yes/no toggle)
9. User optionally notes factors (caffeine, heavy meal, stress, exercise)
10. System saves sleep log to database
11. System updates sleep trend charts (7-day and 30-day views)
12. System correlates with previous evening meal data
13. System identifies patterns (e.g., "sleep quality drops when dinner after 8 PM")

**Alternate Flows**:

**A1**: Wearable device auto-import (future feature)

- 2a. System detects connected wearable device
- 2b. System auto-imports sleep duration and quality from device
- 2c. User confirms or adjusts imported data
- 2d. User adds subjective notes if desired

**A2**: Quick morning check-in

- 6a. User selects "Quick Log" mode
- 6b. System only requires duration + quality (skip details)
- 6c. System saves minimal sleep log

**Exception Flows**:

**E1**: Insufficient sleep pattern

- 10a. System detects sleep duration < 5 hours for 3+ consecutive nights
- 10b. System displays sleep health warning
- 10c. System recommends #SleepAid foods for evening meals
- 10d. System suggests consulting healthcare provider if pattern continues

**E2**: Poor sleep after heavy meals

- 12a. System identifies correlation: poor sleep after meals consumed after 8 PM
- 12b. System adjusts dinner recommendation timing
- 12c. System sends notification: "Try earlier, lighter dinners for better sleep"
- 12d. System prioritizes #SleepAid tagged meals for dinner

### Acceptance Criteria

- Morning log completion takes under 2 minutes
- Sleep duration automatically calculated (no manual math)
- Sleep trends visualized in intuitive charts (bar + line combo)
- Correlation with nutrition shown within 48 hours of sufficient data
- Sleep improvement tips provided after 14+ days of data

---

## UC-025: View Mental Wellness Dashboard

**Status**: ✅ **Implemented** (v0.3)

**ID**: UC-025  
**Primary Actor**: User  
**Goal**: See comprehensive overview of mental wellness metrics and trends

**Preconditions**:

- User has logged at least 3 days of mental wellness data (mood/stress/sleep)

**Postconditions**:

- User has clear understanding of mental wellness trends
- Actionable insights provided for improvement

**Main Flow**:

1. User navigates to "Mental Wellness Dashboard"
2. System calculates composite wellness score (0-100 weighted average)
3. System displays wellness score with gauge visualization
4. System shows mood calendar heatmap (last 30 days, color-coded)
5. System displays stress level timeline (line chart)
6. System presents sleep quality trends (bar chart)
7. System shows goal progress bars for each mental wellness goal
8. System highlights key insights (e.g., "Stress peaks on Mondays", "Best sleep on weekends")
9. System provides actionable recommendations
10. User can drill down into any metric for detailed view
11. User can adjust time range filter (7/30/90 days)

**Alternate Flows**:

**A1**: Compare time periods

- 11a. User selects "Compare" mode
- 11b. User chooses two time ranges (e.g., this month vs last month)
- 11c. System displays side-by-side comparison
- 11d. System highlights improvements and declines

**A2**: Export dashboard for sharing

- 10a. User taps "Export" button
- 10b. User selects export format (PDF or CSV)
- 10c. System generates report with all charts and insights
- 10d. User downloads or emails report (e.g., to therapist/coach)

**Exception Flows**:

**E1**: Insufficient data warning

- 2a. User has < 3 days of data
- 2b. System displays progress indicator: "Log 2 more days to unlock insights"
- 2c. System shows placeholder charts with sample data
- 2d. System encourages daily logging

**E2**: Declining wellness trend alert

- 8a. System detects all metrics declining over 14-day period
- 8b. System displays supportive message
- 8c. System suggests scheduling check-in with healthcare provider
- 8d. System offers wellness resources (meditation apps, support hotlines)

### Acceptance Criteria

- Dashboard loads in under 2 seconds
- Composite score updates in real-time as new data logged
- Heatmap colors intuitive (green=good mood, red=poor mood)
- Insights automatically generated from 7+ days of data
- PDF export includes all charts, insights, and date range

---

## Health Tagging & Discovery Use Cases

## UC-026: Discover Foods by Health Tags

**ID**: UC-026  
**Primary Actor**: User  
**Goal**: Find meals optimized for specific mental/physical wellness needs

**Preconditions**:

- User is authenticated
- User has dual-dimension health profile configured

**Postconditions**:

- User discovers meals aligned with wellness goals
- Meal preferences saved for future recommendations

**Main Flow**:

1. User accesses "Browse by Health Tags" feature from home screen
2. System displays tag categories (Stress Relief, Mood Boost, Sleep Aid, Focus, Recovery)
3. User selects one or more tags (e.g., #StressRelief + #SleepAid)
4. System applies search logic (AND/OR toggle, default AND)
5. System filters meal database by selected tags
6. System ranks results by effectiveness score (1-5 stars)
7. System cross-checks against user allergies (auto-filter unsafe meals)
8. System displays filtered results with nutritional breakdown
9. User views meal details (ingredients, macros, health benefits)
10. System explains why meal earned its tags (scientific basis with citations)
11. User can save meals to favorites or add to meal plan

**Alternate Flows**:

**A1**: Voice search for tags

- 2a. User taps microphone icon
- 2b. User speaks: "Show me stress-relief meals"
- 2c. System interprets query and applies #StressRelief tag
- 2d. System displays filtered results

**A2**: AI-suggested tags

- 2a. System analyzes user's latest mood/stress logs
- 2b. System proactively suggests relevant tags
- 2c. User taps suggested tag to apply filter
- 2d. System displays results

**Exception Flows**:

**E1**: No meals match all criteria

- 5a. User selects very restrictive tag combination
- 5b. System finds 0 matching meals
- 5c. System suggests loosening criteria (switch AND to OR)
- 5d. System offers to create custom meal with nutritionist

**E2**: Allergies block all results

- 7a. All matching meals contain user's allergens
- 7b. System displays "No safe meals found" message
- 7c. System recommends alternative health tags
- 7d. System suggests consulting with nutritionist for custom alternatives

### Acceptance Criteria

- Tag search returns results in under 1 second
- At least 50 meals per major tag category
- Effectiveness scores research-backed (include citation links)
- Allergy filtering 100% accurate (zero false negatives)
- Tag explanations scientifically accurate and understandable

---

## UC-027: Get Personalized Tag Recommendations

**ID**: UC-027  
**Primary Actor**: System (automated)  
**Secondary Actor**: User (receives recommendations)  
**Goal**: Proactively suggest health-tagged meals based on current wellness state

**Preconditions**:

- User has logged mood, stress, or sleep data in last 24 hours

**Postconditions**:

- User receives timely, context-aware meal suggestions
- Mental wellness needs addressed through nutrition

**Main Flow**:

1. System monitors user's latest mental wellness logs (background job)
2. System detects potential need (e.g., stress level > 7, poor sleep)
3. System retrieves user's physical goals (weight loss, muscle gain, etc.)
4. System queries meal database for meals matching relevant health tags
5. System applies dual-dimension scoring (50% mental + 50% physical)
6. System filters by user allergies and dietary preferences
7. System ranks meals by composite score
8. System generates push notification: "Your stress is high. Try these #StressRelief meals."
9. User taps notification to view recommendations
10. System displays 3-5 recommended meals with explanations
11. System explains recommendation logic ("High magnesium reduces cortisol")

**Alternate Flows**:

**A1**: User dismisses notification

- 9a. User swipes away notification
- 9b. System queues recommendation for later (in-app inbox)
- 9c. System reduces notification frequency if repeatedly dismissed

**A2**: User accepts meal suggestion

- 10a. User taps "Add to Meal Plan" button
- 10b. System adds meal to today's meal plan automatically
- 10c. System updates meal tracking
- 10d. System sends confirmation

**Exception Flows**:

**E1**: No suitable meals found

- 6a. Filters eliminate all candidate meals
- 6b. System loosens physical constraints (prioritize mental wellness)
- 6c. If still no results, suggest creating custom meal with nutritionist
- 6d. System logs recommendation gap for system improvement

**E2**: User repeatedly ignores recommendations

- 9a. System detects < 20% notification open rate over 14 days
- 9b. System reduces notification frequency
- 9c. System sends survey: "How can we improve recommendations?"
- 9d. System adjusts recommendation algorithm based on feedback

### Acceptance Criteria

- Recommendations triggered within 1 hour of logging high stress/poor sleep
- Notification frequency max 2 per day (avoid spam)
- Recommended meals match at least 3 of user's health tags
- 80%+ of users find recommendations helpful (measured by surveys)
- Explanations written at 8th grade reading level (clear and accessible)

---

## Dual-Dimension Recommendations Use Cases

## UC-028: Get Dual-Dimension Meal Recommendations

**ID**: UC-028  
**Primary Actor**: User  
**Goal**: Receive meals scored on both physical health and mental wellness dimensions

**Preconditions**:

- User has set both physical goals (weight, fitness) and mental wellness goals

**Postconditions**:

- User receives balanced meal recommendations
- Both physical and mental wellness needs addressed

**Main Flow**:

1. User requests "Smart Recommendations" from homepage
2. System retrieves physical goals (calorie target, macros, workout schedule)
3. System retrieves mental wellness goals (stress reduction, sleep quality, etc.)
4. System fetches current wellness state (latest mood, stress, sleep logs)
5. System applies dual-dimension scoring algorithm:
   - Physical score (40%): Calories, protein, carbs, fats alignment
   - Mental score (40%): Health tag effectiveness (magnesium, omega-3, tryptophan)
   - Preference bonus (20%): Taste preferences, cuisine variety
6. System ranks meals by composite score (0-100)
7. System displays top 10 recommendations with score breakdown
8. User views score details (shows physical + mental + preference sub-scores)
9. User can adjust weighting slider (e.g., prioritize mental wellness 60%, physical 40%)
10. System re-ranks results in real-time based on new weighting
11. User selects meal for full details (nutrition facts + mental wellness benefits)

**Alternate Flows**:

**A1**: Time-of-day optimization

- 5a. System detects current time (breakfast/lunch/dinner)
- 5b. Breakfast → prioritize #EnergyBoost meals
- 5c. Dinner → prioritize #SleepAid, calming meals
- 5d. System adjusts scoring weights automatically

**A2**: Budget filter

- 7a. User applies budget filter (< $15 per meal)
- 7b. System re-filters results by price
- 7c. System maintains score ranking within budget
- 7d. System displays filtered results

**Exception Flows**:

**E1**: Conflicting goals

- 5a. Physical goal (strict calorie limit) conflicts with mental goal (comfort food for stress)
- 5b. System identifies conflict
- 5c. System suggests compromise meals with explanation
- 5d. System displays conflict resolution: "This meal balances your needs: moderate calories + stress-relief nutrients"

**E2**: No high-scoring meals

- 6a. No meals score > 50 (poor match)
- 6b. System displays message: "No great matches found"
- 6c. System recommends adjusting one goal temporarily
- 6d. System offers to create custom meal with nutritionist

### Acceptance Criteria

- Recommendations load in under 3 seconds
- Score breakdown transparent (show all sub-scores)
- User can adjust weighting in real-time (no page reload)
- Top recommendation scores > 75 (high match quality)
- Explanations clearly show how meal supports BOTH dimensions

---

## UC-029: Receive Context-Aware Meal Suggestions

**ID**: UC-029  
**Primary Actor**: System (automated)  
**Secondary Actor**: User  
**Goal**: Adapt meal recommendations based on time of day, current mood, and upcoming events

**Preconditions**:

- User has active meal plan or recommendation preferences
- User has logged recent mood/stress data

**Postconditions**:

- User receives timely, relevant meal suggestions
- System learns user's context-specific preferences

**Main Flow**:

1. System monitors time of day (morning, afternoon, evening)
2. System checks user's latest mood log (within last 4 hours)
3. System checks user's calendar for upcoming events (if integrated)
4. System applies contextual rules:
   - Morning + low energy → #EnergyBoost (high-protein, complex carbs)
   - Afternoon + high stress → #StressRelief (magnesium-rich, calming)
   - Evening + poor sleep last night → #SleepAid (tryptophan, melatonin)
   - Pre-workout → #PreWorkoutFuel (light, energizing)
   - Post-workout → #PostWorkoutRecovery (protein-rich, anti-inflammatory)
5. System generates 3-5 context-specific meal options
6. System displays suggestions with context explanation
7. User reviews suggestions
8. User selects meal or requests alternatives
9. System logs user preference for future learning
10. System adjusts recommendation algorithm based on feedback

**Alternate Flows**:

**A1**: User manually triggers recommendations

- 1a. User opens app and taps "What should I eat right now?"
- 1b. System skips scheduled triggers, runs on-demand
- 1c. System applies current context rules
- 1d. System displays immediate suggestions

**A2**: Weather-based suggestions

- 4a. System integrates with weather API
- 4b. Hot day → prioritize refreshing, hydrating meals
- 4c. Cold day → prioritize warming, comfort meals
- 4d. System adjusts recommendations accordingly

**Exception Flows**:

**E1**: Context conflicts with dietary goals

- 4a. Evening #SleepAid meals conflict with strict calorie limit
- 4b. System prioritizes user's primary goal (weight loss > sleep aid)
- 4c. System suggests best compromise meal
- 4d. System explains trade-off: "This lighter meal supports sleep without exceeding calories"

**E2**: User always rejects suggestions

- 9a. System detects < 30% acceptance rate over 14 days
- 9b. System sends feedback survey
- 9c. System asks: "What types of meals do you prefer in the evening?"
- 9d. System adjusts algorithm based on explicit user preferences

### Acceptance Criteria

- Context detection 95%+ accurate (correct time-of-day rules)
- Suggestions feel relevant (user acceptance rate > 70%)
- System explains context logic clearly
- Learning algorithm improves recommendations within 30 days
- No irrelevant suggestions (e.g., no heavy meals suggested at bedtime)

---

## AI Health Concierge Use Cases

## UC-030: Chat with AI Health Concierge

**Status**: ❌ **Not Implemented** (v0.5+ planned)

**ID**: UC-030  
**Primary Actor**: User  
**Goal**: Have natural conversation about nutrition, wellness, and meal planning

**Preconditions**:

- User is authenticated
- LLM API operational

**Postconditions**:

- User receives helpful, safe nutrition guidance
- Conversation history saved for context continuity

**Main Flow**:

1. User opens "AI Concierge" chat interface
2. System loads conversation history (last 10 messages for context)
3. User types or speaks query (e.g., "What should I eat to reduce stress?")
4. System sends query to LLM with context payload:
   - User's health profile (allergies, goals, preferences)
   - Recent wellness logs (mood, stress, sleep last 7 days)
   - Conversation history (last 10 turns)
   - System instructions (safety guidelines, response format)
5. LLM generates response using RAG (retrieves nutrition science from vector DB)
6. System validates response for safety:
   - No medical diagnoses
   - No allergen recommendations
   - No harmful advice
7. System streams response to user in real-time (token-by-token)
8. User reads response
9. System offers action buttons ("Add meal to plan", "Show me recipes", "Tell me more")
10. User can ask follow-up questions (multi-turn conversation)
11. System saves conversation to history

**Alternate Flows**:

**A1**: Voice input/output

- 3a. User taps microphone icon
- 3b. User speaks query
- 3c. System transcribes speech to text
- 3d. System processes query normally
- 3e. System converts response to speech (text-to-speech)
- 3f. User hears spoken response

**A2**: Image upload for meal analysis

- 3a. User taps camera icon
- 3b. User uploads photo of meal
- 3c. System uses vision model to identify ingredients
- 3d. System estimates nutritional content
- 3e. System checks for allergens
- 3f. System provides analysis: "This meal contains approximately 650 calories..."

**Exception Flows**:

**E1**: LLM suggests medical advice

- 6a. Safety validator detects medical diagnosis or prescription
- 6b. System blocks response
- 6c. System displays: "I can't provide medical advice. Please consult a healthcare provider."
- 6d. System logs incident for review

**E2**: LLM recommends allergen

- 6a. Safety validator detects allergen in recommended meal
- 6b. System blocks unsafe recommendation
- 6c. System corrects response: "I noticed this meal contains dairy, which you're allergic to. Here are safe alternatives..."
- 6d. System logs validation catch for monitoring

**E3**: API rate limit reached

- 4a. LLM API returns rate limit error
- 4b. System falls back to pre-written FAQ responses
- 4c. System displays: "I'm experiencing high demand. Here's a quick answer..."
- 4d. System queues request for later retry

### Acceptance Criteria

- First response within 3 seconds
- Streaming response (visible token-by-token)
- Safety validation 100% effective (no allergens, no medical claims)
- Multi-turn conversations maintain context (up to 10 exchanges)
- Action buttons functional (integrate with meal planning system)

---

## UC-031: Get AI-Powered Wellness Insights

**Status**: ❌ **Not Implemented** (v0.5+ planned)

**ID**: UC-031  
**Primary Actor**: System (automated)  
**Secondary Actor**: User  
**Goal**: Proactively discover patterns and provide actionable wellness insights

**Preconditions**:

- User has 14+ days of combined data (meals, mood, stress, sleep)

**Postconditions**:

- User gains awareness of hidden wellness patterns
- Actionable steps provided for improvement

**Main Flow**:

1. System runs nightly analysis job on user data (background process)
2. System aggregates data: meals eaten, mood logs, stress levels, sleep quality
3. System uses LLM to identify patterns:
   - Recurring patterns: "Stress peaks every Monday"
   - Correlations: "Mood improves 2 hours after salmon meals"
   - Timing insights: "Sleep quality drops when dinner is after 8 PM"
4. System calculates statistical significance (p-value < 0.05 required)
5. System generates insight card with:
   - Pattern description (concise, actionable)
   - Supporting data visualization (mini-chart)
   - Actionable recommendation
   - Confidence score (0-100%)
6. System queues insight for morning notification
7. User receives notification: "New wellness insight available"
8. User taps notification to view detailed insight
9. System displays insight with full explanation and data
10. System offers "Try this" action button (e.g., "Schedule salmon meal for Monday")
11. User can accept, dismiss, or provide feedback
12. System adjusts future insights based on feedback

**Alternate Flows**:

**A1**: User manually requests analysis

- 1a. User opens "Insights" tab
- 1b. User taps "Analyze my wellness patterns"
- 1c. System runs on-demand analysis
- 1d. System displays available insights immediately

**A2**: Milestone celebrations

- 3a. System detects significant improvement (e.g., 30% stress reduction over 30 days)
- 3b. System generates celebratory insight
- 3c. System displays: "🎉 Congrats! You reduced stress by 30% this month!"
- 3d. System offers to share achievement on social (optional)

**Exception Flows**:

**E1**: Insufficient data

- 2a. User has < 14 days of data
- 2b. System cannot generate statistically significant insights
- 2c. System displays progress bar: "Log 5 more days to unlock insights"
- 2d. System shows example insights to motivate continued logging

**E2**: Insight seems incorrect (user feedback)

- 11a. User taps "Not helpful" button
- 11b. System asks: "What was wrong with this insight?"
- 11c. User provides feedback
- 11d. System deprioritizes similar patterns in future
- 11e. System logs feedback for model improvement

### Acceptance Criteria

- Insights generated only when confidence > 70%
- Patterns statistically significant (p < 0.05)
- Insights feel personalized (not generic advice)
- Max 1 insight notification per day (avoid spam)
- 60%+ of users act on insights (measured by "Try this" click rate)

---

## UC-032: Adjust Plans via Conversation

**Status**: ❌ **Not Implemented** (v0.5+ planned)

**ID**: UC-032  
**Primary Actor**: User  
**Goal**: Modify health goals or meal plans through natural language chat

**Preconditions**:

- User has existing health goals and meal plan
- AI Concierge active

**Postconditions**:

- User's health profile updated via natural conversation
- Meal recommendations adjusted to new priorities

**Main Flow**:

1. User opens AI Concierge chat
2. User types: "I want to focus more on stress reduction this week"
3. AI parses intent (goal priority adjustment)
4. AI retrieves current goals:
   - Physical: Muscle gain (priority: high)
   - Mental: Stress reduction (priority: medium)
5. AI confirms understanding: "I'll prioritize stress-relief meals and reduce focus on muscle gain. Is that correct?"
6. User confirms: "Yes"
7. AI proposes changes:
   - Physical: Muscle gain (priority: medium) ⬇️
   - Mental: Stress reduction (priority: high) ⬆️
8. AI explains impact: "Your meal recommendations will now include more magnesium-rich and calming ingredients."
9. User reviews proposed changes
10. User approves: "Sounds good"
11. System updates goal priorities in database
12. System regenerates meal recommendations with new weighting
13. AI confirms: "Done! Check your updated meal plan. You'll see more #StressRelief meals."
14. System displays link to updated meal plan

**Alternate Flows**:

**A1**: Add new goal via chat

- 2a. User: "I also want to improve my sleep"
- 2b. AI: "I'll add sleep quality as a new goal. What priority: high, medium, or low?"
- 2c. User: "High"
- 2d. AI creates new mental wellness goal
- 2e. AI updates meal recommendations
- 2f. AI confirms: "Sleep quality goal added with high priority"

**A2**: Temporarily pause goal

- 2a. User: "Pause my diet plan during vacation"
- 2b. AI: "I'll pause weight loss goal from [dates]. When does your vacation start?"
- 2c. User: "November 1-7"
- 2d. AI sets goal to inactive with resume date
- 2e. AI: "Weight loss paused Nov 1-7. I'll resume automatically on Nov 8."

**Exception Flows**:

**E1**: Changes conflict with allergies

- 8a. AI detects new goal prioritizes meals with user's allergen
- 8b. AI: "Some #StressRelief meals contain dairy (your allergen). I'll filter those out automatically."
- 8c. User acknowledges warning
- 8d. System applies changes with allergy filter

**E2**: Ambiguous request

- 2a. User: "Change my goals"
- 2b. AI: "Which goals would you like to change? Physical (muscle gain, weight loss) or Mental (stress, sleep, mood)?"
- 2c. User clarifies
- 2d. AI proceeds with clarified intent

**E3**: User changes mind

- 12a. User sees updated meal plan
- 12b. User: "Actually, never mind. Keep my old settings."
- 12c. AI: "No problem! I'll revert to your previous goal priorities."
- 12d. System rolls back changes
- 12e. AI confirms: "Your original settings are restored."

### Acceptance Criteria

- AI correctly interprets 90%+ of goal adjustment requests
- Changes applied within 5 seconds of user confirmation
- Confirmation message clear and specific (shows before/after)
- Meal recommendations reflect new priorities immediately
- User can undo changes via chat command

---

## Traceability Matrix

| Use Case | Related Functional Requirements |
| -------- | ------------------------------- |
| UC-001   | FR-001, FR-002, FR-003          |
| UC-002   | FR-004, FR-005, FR-006          |
| UC-003   | FR-007, FR-008                  |
| UC-004   | FR-009, FR-010, FR-011          |
| UC-005   | FR-012, FR-013                  |
| UC-006   | FR-014, FR-015                  |
| UC-007   | FR-016, FR-017                  |
| UC-008   | FR-018, FR-019, FR-020          |
| UC-009   | FR-021, FR-022, FR-023          |
| UC-010   | FR-024, FR-025                  |
| UC-011   | FR-026, FR-027, FR-028          |
| UC-012   | FR-029, FR-030                  |
| UC-013   | FR-061, FR-062, FR-063          |
| UC-014   | FR-064, FR-065, FR-066          |
| UC-015   | FR-067, FR-068, FR-069          |
| UC-016   | FR-070, FR-071                  |
| UC-017   | FR-072, FR-073, FR-074          |
| UC-018   | FR-056, FR-057, FR-058          |
| UC-019   | FR-059, FR-060                  |
| UC-020   | FR-055, FR-058, FR-060          |
| UC-021   | FR-076, FR-082                  |
| UC-022   | FR-077, FR-080, FR-082          |
| UC-023   | FR-078, FR-081, FR-090          |
| UC-024   | FR-079, FR-083, FR-085          |
| UC-025   | FR-082, FR-085, FR-090          |
| UC-026   | FR-086, FR-087, FR-088          |
| UC-027   | FR-088, FR-090, FR-091          |
| UC-028   | FR-089, FR-090, FR-091          |
| UC-029   | FR-090, FR-091, FR-095          |
| UC-030   | FR-092, FR-093, FR-094          |
| UC-031   | FR-095, FR-080, FR-085          |
| UC-032   | FR-094, FR-089                  |

## Document Revision History

| Version | Date       | Author           | Changes                                            |
| ------- | ---------- | ---------------- | -------------------------------------------------- |
| 1.0     | 2025-10-18 | Development Team | Initial use case specification                     |
| 2.0     | 2025-10-25 | Development Team | Added Mental Wellness use cases (UC-021 to UC-032) |
