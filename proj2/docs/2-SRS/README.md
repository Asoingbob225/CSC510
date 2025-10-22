# SRS Document Structure

This directory contains the Software Requirements Specification (SRS) following IEEE 830-1998 standard.

## Directory Structure

```
2-SRS/
├── README.md                           # This file
├── SRS-MASTER.md                      # Master document with full SRS
├── 1-introduction.md                  # Section 1: Introduction
├── 2-overall-description.md           # Section 2: Overall Description
├── 3-specific-requirements/           # Section 3: All specific requirements
│   ├── 3.1-functional-requirements.md    # Functional requirements (FR-001 to FR-075)
│   ├── 3.2-non-functional-requirements.md # Non-functional requirements (NFR-001 to NFR-030)
│   ├── 3.3-interface-requirements.md     # Interface requirements (IR-001 to IR-029)
│   ├── 3.4-use-cases.md                  # Use cases (UC-001 to UC-023)
│   ├── 3.5-user-stories.md               # User stories (not yet created)
│   └── 3.6-data-requirements.md          # Data requirements (DR-001 to DR-022)
├── 4-system-features/                 # Section 4: System features
│   └── 4-system-features.md              # 10 major feature areas
├── 5-appendices/                      # Section 5: Supporting documents
│   └── B-user-personas.md                # 4 detailed user personas
└── requirements-traceability-matrix.md # Traceability from requirements to design/test
```

## How to Navigate

1. **Start with SRS-MASTER.md** - This contains the complete SRS with links to detailed sections
2. **For specific topics**, navigate directly to the relevant section file
3. **For requirements tracking**, see requirements-traceability-matrix.md

## Document Sections

### Section 1: Introduction

- Purpose and scope of the system
- Definitions and acronyms
- References and overview

### Section 2: Overall Description

- Product perspective and functions
- User characteristics
- Constraints and assumptions

### Section 3: Specific Requirements

This is the most detailed section, broken into subsections:

- **3.1** - What the system must do (functional)
- **3.2** - How well it must perform (non-functional)
- **3.3** - How it interfaces with users and systems
- **3.4** - Detailed user interaction scenarios
- **3.5** - Agile user stories (planned)
- **3.6** - Data structure and management

### Section 4: System Features

High-level feature descriptions organized by:

- User Management
- Health Profile Management
- AI-Powered Recommendations
- Restaurant Integration
- And more...

### Section 5: Appendices

Supporting information including:

- User personas
- Glossary (in master)
- Analysis models (planned)

## Status

| Section                          | Status         | Last Updated |
| -------------------------------- | -------------- | ------------ |
| 1. Introduction                  | ✅ Complete    | Oct 21, 2025 |
| 2. Overall Description           | ✅ Complete    | Oct 21, 2025 |
| 3.1 Functional Requirements      | ✅ Complete    | Oct 19, 2025 |
| 3.2 Non-Functional Requirements  | ✅ Complete    | Oct 19, 2025 |
| 3.3 Interface Requirements       | ✅ Complete    | Oct 21, 2025 |
| 3.4 Use Cases                    | ✅ Complete    | Oct 19, 2025 |
| 3.5 User Stories                 | ❌ Not Started | -            |
| 3.6 Data Requirements            | ✅ Complete    | Oct 21, 2025 |
| 4. System Features               | ✅ Complete    | Oct 19, 2025 |
| 5. Appendices                    | ✅ Complete    | Oct 19, 2025 |
| Requirements Traceability Matrix | ✅ Complete    | Oct 21, 2025 |
