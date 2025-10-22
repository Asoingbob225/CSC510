# User Acceptance Test (UAT) Scenarios

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** UAT Scenarios Based on User Personas  
**Version:** 1.0  
**Date:** October 21, 2025  
**Author:** QA Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [UAT Approach](#2-uat-approach)
3. [Persona 1: Sarah Chen - The Concerned Parent](#3-persona-1-sarah-chen)
4. [Persona 2: Marcus Johnson - The Health-Conscious Retiree](#4-persona-2-marcus-johnson)
5. [Persona 3: Emily Rodriguez - The Busy Professional Athlete](#5-persona-3-emily-rodriguez)
6. [Persona 4: David Kim - The Budget-Conscious Student](#6-persona-4-david-kim)
7. [Cross-Persona Scenarios](#7-cross-persona-scenarios)
8. [UAT Success Criteria](#8-uat-success-criteria)

---

## 1. Introduction

### 1.1 Purpose

This document contains User Acceptance Test scenarios based on our four primary user personas. These scenarios validate that Eatsential meets real user needs and provides value in actual usage contexts.

### 1.2 UAT Objectives

- Validate system usability for target users
- Ensure features solve real user problems
- Confirm workflow efficiency
- Verify user satisfaction
- Identify any gaps in functionality

### 1.3 Scenario Format

Each scenario includes:

- Persona context
- User goal
- Detailed workflow
- Expected outcomes
- Acceptance criteria
- Success metrics

## 2. UAT Approach

### 2.1 Testing Method

- **Participants:** 5-10 users matching each persona
- **Duration:** 2-hour sessions per participant
- **Environment:** Production-like system with real data
- **Facilitation:** Guided scenarios with observation
- **Feedback:** Surveys, interviews, and task completion metrics

### 2.2 Success Measurement

| Metric               | Target                 |
| -------------------- | ---------------------- |
| Task Completion Rate | >90%                   |
| User Satisfaction    | >4.0/5.0               |
| Time to Complete     | Within expected ranges |
| Error Rate           | <5%                    |
| Feature Adoption     | >80%                   |

---

## 3. Persona 1: Sarah Chen - The Concerned Parent

### Background

Sarah is a 34-year-old marketing manager with two children. Her family has multiple dietary restrictions: daughter with severe nut allergies, son with lactose intolerance, and husband with gluten sensitivity.

### UAT-S1: Family-Safe Meal Planning

**Goal:** Plan a week of meals that are safe for all family members

**Scenario Steps:**

1. **Initial Setup (10 minutes)**
   - Sarah creates her account
   - Sets up family profiles for all 4 members
   - Adds allergies: peanuts (severe), tree nuts (severe), lactose, gluten
   - Sets preferences: organic when possible, kid-friendly

2. **Weekly Planning (20 minutes)**
   - Opens meal planning calendar
   - Requests breakfast, lunch, and dinner recommendations
   - Reviews each recommendation for safety
   - Swaps meals that kids might not like
   - Finalizes 7-day meal plan

3. **Shopping Preparation (10 minutes)**
   - Generates consolidated shopping list
   - Reviews for any missed allergens
   - Exports list to phone
   - Adds personal items

**Expected Outcomes:**

- Zero allergen violations in recommendations
- All meals marked as "Safe for entire family"
- Shopping list organized by store sections
- Clear substitution suggestions provided

**Acceptance Criteria:**

- [ ] All allergens completely filtered out
- [ ] Meal variety maintained despite restrictions
- [ ] Nutritional balance achieved for all family members
- [ ] Process completed in under 40 minutes
- [ ] Sarah feels confident in meal safety

**Success Metrics:**

- Time saved: 2+ hours vs. manual planning
- Confidence score: 5/5 for allergen safety
- Likelihood to recommend: 9-10/10

---

### UAT-S2: Emergency Meal Search

**Goal:** Quickly find a safe restaurant for unexpected dinner out

**Scenario Steps:**

1. **Urgent Search (2 minutes)**
   - Opens app while driving (passenger)
   - Activates "Quick Safe Search"
   - Current location detected

2. **Filter Results (1 minute)**
   - Views restaurants within 5 miles
   - Filters for "Family Allergen Safe"
   - Sorts by rating

3. **Restaurant Selection (2 minutes)**
   - Reviews top 3 options
   - Checks specific menu items
   - Sees clear allergen warnings
   - Selects Italian restaurant

4. **Order Preparation (3 minutes)**
   - Views safe menu items for each family member
   - Screenshots orders for reference
   - Gets directions

**Expected Outcomes:**

- Found 5+ safe restaurants
- Clear allergen indicators on all items
- Confidence in ordering

**Acceptance Criteria:**

- [ ] Search completed in under 5 minutes
- [ ] All suggested items are allergen-free
- [ ] Restaurant allergen policies visible
- [ ] Can save favorites for future

---

## 4. Persona 2: Marcus Johnson - The Health-Conscious Retiree

### Background

Marcus is a 68-year-old retired teacher managing Type 2 diabetes and hypertension. He's motivated to improve his health through diet but needs guidance on appropriate choices.

### UAT-M1: Diabetes-Friendly Daily Management

**Goal:** Manage daily meals to control blood sugar levels

**Scenario Steps:**

1. **Morning Routine (5 minutes)**
   - Checks morning blood sugar: 145 mg/dL
   - Requests breakfast recommendation
   - Selects low-glycemic option
   - Logs meal for tracking

2. **Lunch Planning (5 minutes)**
   - Reviews morning glucose response
   - Requests lunch with <45g carbs
   - Chooses high-fiber option
   - Sets reminder for post-meal check

3. **Dinner Decision (5 minutes)**
   - Inputs afternoon reading: 128 mg/dL
   - Gets dinner recommendations
   - Reviews carb distribution for the day
   - Selects balanced meal

4. **Daily Review (5 minutes)**
   - Views daily nutrition summary
   - Checks carb/protein/fat ratios
   - Reviews glucose trend
   - Plans tomorrow's meals

**Expected Outcomes:**

- Blood sugar remains in target range
- Carbohydrates evenly distributed
- High satisfaction with meal variety

**Acceptance Criteria:**

- [ ] All meals under 60g carbs
- [ ] Fiber content >8g per meal
- [ ] Sodium under 600mg per meal
- [ ] Clear nutritional information
- [ ] Easy logging process

**Success Metrics:**

- Glucose stability improvement
- Medication reduction potential
- Confidence in food choices: 4.5/5

---

### UAT-M2: Doctor Visit Preparation

**Goal:** Generate health reports for quarterly doctor visit

**Scenario Steps:**

1. **Report Generation (10 minutes)**
   - Navigates to Health Reports
   - Selects 90-day summary
   - Reviews nutritional averages
   - Exports PDF report

2. **Trend Analysis (5 minutes)**
   - Views glucose correlation with meals
   - Identifies problematic foods
   - Notes improvement areas

3. **Goal Adjustment (5 minutes)**
   - Reviews current goals with data
   - Adjusts carb targets
   - Sets new weight goal
   - Schedules follow-up reminder

**Expected Outcomes:**

- Comprehensive report generated
- Clear trends identified
- Actionable insights provided

**Acceptance Criteria:**

- [ ] Report includes all relevant metrics
- [ ] Exportable in standard formats
- [ ] Doctor finds report useful
- [ ] Trends clearly visualized
- [ ] Progress toward goals shown

---

## 5. Persona 3: Emily Rodriguez - The Busy Professional Athlete

### Background

Emily is a 28-year-old software engineer training for marathons. She needs high-performance nutrition but has limited time for meal prep.

### UAT-E1: Performance Nutrition Optimization

**Goal:** Optimize nutrition for marathon training while maintaining busy work schedule

**Scenario Steps:**

1. **Training Day Setup (5 minutes)**
   - Logs morning 10-mile run
   - System calculates increased calorie needs
   - Requests high-protein breakfast
   - Selects quick prep option

2. **Workday Meals (10 minutes)**
   - Pre-orders lunch delivery for office
   - Schedules post-work snack
   - Plans post-run dinner
   - Sets hydration reminders

3. **Recovery Planning (5 minutes)**
   - Reviews macro ratios
   - Adjusts for tomorrow's rest day
   - Orders meal prep for weekend
   - Tracks supplement timing

**Expected Outcomes:**

- Meets 3,200 calorie target
- Achieves 55/25/20 carb/protein/fat ratio
- All meals fit busy schedule

**Acceptance Criteria:**

- [ ] Calorie targets achieved
- [ ] Macro ratios optimized
- [ ] Meal timing supports training
- [ ] Quick prep/order options
- [ ] Recovery nutrition included

**Success Metrics:**

- Training performance improvement
- Energy levels maintained
- Time saved: 5+ hours/week

---

### UAT-E2: Competition Week Planning

**Goal:** Plan nutrition for marathon week

**Scenario Steps:**

1. **Carb Loading Phase (10 minutes)**
   - Sets competition date
   - Activates "Race Week" mode
   - Reviews carb-loading plan
   - Adjusts for preferences

2. **Daily Execution (5 minutes/day)**
   - Follows increasing carb schedule
   - Tracks glycogen storage
   - Maintains hydration plan
   - Avoids new foods

3. **Race Day Prep (10 minutes)**
   - Finalizes race morning meal
   - Plans pre-race snacks
   - Sets fueling reminders
   - Downloads offline access

**Expected Outcomes:**

- Optimal glycogen storage
- No digestive issues
- Peak performance nutrition

**Acceptance Criteria:**

- [ ] Progressive carb loading achieved
- [ ] Familiar foods prioritized
- [ ] Timing recommendations clear
- [ ] Portable fuel options included
- [ ] Confidence high for race day

---

## 6. Persona 4: David Kim - The Budget-Conscious Student

### Background

David is a 22-year-old college student with limited budget ($200/month for food) trying to eat healthy while managing mild lactose intolerance.

### UAT-D1: Budget Meal Planning

**Goal:** Plan nutritious meals within strict budget constraints

**Scenario Steps:**

1. **Budget Setup (5 minutes)**
   - Sets monthly budget: $200
   - Indicates cooking limitations (dorm kitchen)
   - Adds lactose intolerance
   - Preferences: Asian cuisine, spicy food

2. **Weekly Planning (15 minutes)**
   - Requests budget meal plan
   - Reviews cost per meal (<$3)
   - Swaps expensive items
   - Finds student discounts

3. **Shopping Strategy (10 minutes)**
   - Generates shopping list
   - Identifies bulk buy opportunities
   - Locates cheapest stores
   - Plans meal prep session

**Expected Outcomes:**

- Weekly cost under $50
- Nutritionally complete meals
- Minimal food waste

**Acceptance Criteria:**

- [ ] All meals under budget
- [ ] Nutrition not compromised
- [ ] Lactose-free options
- [ ] Simple preparation
- [ ] Satisfying portions

**Success Metrics:**

- Money saved: $50+/month
- Nutrition score: B+ or higher
- Satisfaction: 4/5

---

### UAT-D2: Quick Healthy Options

**Goal:** Find quick, healthy meals between classes

**Scenario Steps:**

1. **Time Crunch (2 minutes)**
   - Has 30 minutes between classes
   - Requests "Quick Campus Eats"
   - Filters by walking distance
   - Selects under $7

2. **Smart Selection (3 minutes)**
   - Views nutrition for options
   - Avoids lactose items
   - Picks high-protein choice
   - Saves as favorite

3. **Track Spending (2 minutes)**
   - Logs meal cost
   - Views weekly spending
   - Adjusts dinner plans
   - Stays within budget

**Expected Outcomes:**

- Found healthy option quickly
- Maintained budget
- Met nutritional needs

**Acceptance Criteria:**

- [ ] Search under 3 minutes
- [ ] Options within budget
- [ ] Lactose-free clearly marked
- [ ] Nutrition goals tracked
- [ ] Running budget visible

---

## 7. Cross-Persona Scenarios

### UAT-X1: Community Features

**Goal:** All personas interact with community features

**Test Cases:**

1. Sarah shares allergy-friendly recipes
2. Marcus joins diabetes support group
3. Emily posts training meal plans
4. David finds budget meal hacks

**Success Criteria:**

- [ ] Easy content sharing
- [ ] Privacy controls work
- [ ] Relevant content discovered
- [ ] Positive interactions
- [ ] Value added for each persona

### UAT-X2: Emergency Scenarios

**Goal:** System handles unexpected situations

**Test Cases:**

1. Sarah: Child has allergic reaction - needs hospital info
2. Marcus: Blood sugar spike - needs immediate food options
3. Emily: Race canceled - needs to adjust carb loading
4. David: Unexpected expense - needs cheaper meal alternatives

**Success Criteria:**

- [ ] Quick access to emergency info
- [ ] Appropriate recommendations
- [ ] Stress-free experience
- [ ] Helpful guidance provided

---

## 8. UAT Success Criteria

### Overall Acceptance Metrics

| Persona | Task Success Rate | Satisfaction | Would Recommend |
| ------- | ----------------- | ------------ | --------------- |
| Sarah   | >95%              | 4.5/5        | Yes             |
| Marcus  | >90%              | 4.5/5        | Yes             |
| Emily   | >90%              | 4.0/5        | Yes             |
| David   | >85%              | 4.0/5        | Yes             |

### Critical Success Factors

1. **Safety** - Zero allergen exposure incidents
2. **Usability** - All tasks completed without help
3. **Value** - Clear benefit demonstrated
4. **Trust** - Users confident in recommendations
5. **Efficiency** - Time savings documented

### Go/No-Go Decision Criteria

**Go Decision if:**

- All critical scenarios pass
- No safety issues identified
- Average satisfaction >4.0
- 80%+ would recommend
- Major workflows intuitive

**No-Go if:**

- Any safety failures
- Critical features unusable
- Satisfaction <3.5
- Major usability issues
- Performance problems

### Post-UAT Actions

1. **Immediate Fixes**
   - Safety-critical issues
   - Workflow blockers
   - Data accuracy problems

2. **Short-term Improvements**
   - UI/UX enhancements
   - Performance optimization
   - Feature refinements

3. **Future Enhancements**
   - Feature requests
   - Persona-specific needs
   - Community suggestions

---

**Document Status:** COMPLETE  
**Last Review:** October 21, 2025  
**Next Review:** Before UAT Execution

**Sign-off:**

- Product Owner: ******\_\_\_****** Date: **\_\_\_\_**
- QA Lead: ******\_\_\_****** Date: **\_\_\_\_**
- UX Lead: ******\_\_\_****** Date: **\_\_\_\_**
