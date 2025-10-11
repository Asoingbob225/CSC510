# Hello Workflow - Visual Guide

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    HELLO WORKFLOW                           │
│         Ensuring Every Teammate Can Run the Project         │
└─────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────┐
        │  Phase 1: Environment Setup          │
        └──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    ┌───────┐                      ┌───────┐
    │ #1    │                      │ #2-3  │
    │ Prereq│                      │ Deps  │
    └───────┘                      └───────┘
    Install                        Install
    - Bun                          - Frontend deps
    - uv                           - Backend deps
    - Python                       
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Phase 2: Verification               │
        └──────────────────────────────────────┘
                        │
                        ▼
                    ┌───────┐
                    │  #4   │
                    │ Test  │
                    └───────┘
                    Run server
                    Verify it works
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Phase 3: Development                │
        └──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    ┌───────┐                      ┌───────┐
    │  #5   │                      │  #6   │
    │Backend│                      │Fronted│
    └───────┘                      └───────┘
    Add API                        Add UI
    endpoint                       component
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  Phase 4: Quality & Docs             │
        └──────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    ┌───────┐                      ┌───────┐
    │  #7   │                      │  #8   │
    │ Lint  │                      │ Docs  │
    └───────┘                      └───────┘
    Check code                     Update
    quality                        README
                        │
                        ▼
        ┌──────────────────────────────────────┐
        │  ✅ WORKFLOW COMPLETE!               │
        │  Teammate is now ready to contribute  │
        └──────────────────────────────────────┘
```

## Issue Dependency Chart

```
Issue #1: Prerequisites
    │
    ├─→ Issue #2: Frontend Dependencies ──┐
    │                                      │
    └─→ Issue #3: Backend Dependencies ───┼─→ Issue #4: Run Server
                                          │          │
                                          │          ├─→ Issue #5: API Endpoint
                                          │          │         │
                                          │          └─→ Issue #6: UI Component
                                          │                    │
                                          │                    └─→ Issue #7: Linting
                                          │                              │
                                          └──────────────────────────────┴─→ Issue #8: Docs
```

## Parallel Execution Strategy

For teams with multiple members working simultaneously:

```
┌──────────────────────────────────────────────────────────────┐
│  Week 1: Setup (Parallel)                                    │
├──────────────────────────────────────────────────────────────┤
│  Monday:                                                      │
│    • All members: Issue #1 (Prerequisites)                   │
│  Tuesday-Wednesday:                                           │
│    • Member A: Issue #2 (Frontend)                           │
│    • Member B: Issue #3 (Backend)                            │
│  Thursday:                                                    │
│    • All members: Issue #4 (Verification)                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Week 2: Development (Parallel)                              │
├──────────────────────────────────────────────────────────────┤
│  Monday-Wednesday:                                            │
│    • Member A: Issue #5 (Backend feature)                    │
│    • Member B: Issue #6 (Frontend feature)                   │
│  Thursday:                                                    │
│    • Member A: Issue #7 (Linting)                            │
│    • Member B: Issue #8 (Documentation)                      │
│  Friday:                                                      │
│    • Code review and merge all PRs                           │
└──────────────────────────────────────────────────────────────┘
```

## Skills Learned by Phase

```
┌────────────────────┬──────────────────────────────────────────┐
│  Phase             │  Skills Acquired                         │
├────────────────────┼──────────────────────────────────────────┤
│  1. Setup          │  • Package manager usage                │
│  (Issues #1-3)     │  • Dependency management                │
│                    │  • Command line proficiency             │
├────────────────────┼──────────────────────────────────────────┤
│  2. Verification   │  • Running development servers          │
│  (Issue #4)        │  • Client-server architecture           │
│                    │  • Debugging connection issues          │
├────────────────────┼──────────────────────────────────────────┤
│  3. Development    │  • Backend API development (FastAPI)    │
│  (Issues #5-6)     │  • Frontend React development           │
│                    │  • Full-stack integration               │
├────────────────────┼──────────────────────────────────────────┤
│  4. Quality        │  • Code linting and quality             │
│  (Issues #7-8)     │  • Documentation practices              │
│                    │  • Knowledge sharing                    │
└────────────────────┴──────────────────────────────────────────┘
```

## Time Estimates

```
Issue #1: Prerequisites              ⏱️  15-30 min
Issue #2: Frontend Dependencies      ⏱️  10 min
Issue #3: Backend Dependencies       ⏱️  10 min
Issue #4: Run Dev Server            ⏱️  15 min
Issue #5: Add API Endpoint          ⏱️  20-30 min
Issue #6: Add Frontend Component    ⏱️  30-45 min
Issue #7: Run Linter               ⏱️  15-20 min
Issue #8: Update Documentation     ⏱️  20-30 min
─────────────────────────────────────────────────
Total (Serial):                     ⏱️  2h 15m - 3h 30m
Total (With Parallelization):       ⏱️  1h 30m - 2h 30m
```

## Success Metrics

Track team progress with these metrics:

```
┌─────────────────────────────────────────────┐
│  Team Readiness Score                       │
├─────────────────────────────────────────────┤
│  ☐ Can install prerequisites (Issue #1)    │
│  ☐ Can install dependencies (Issues #2-3)  │
│  ☐ Can run the application (Issue #4)      │
│  ☐ Can add backend features (Issue #5)     │
│  ☐ Can add frontend features (Issue #6)    │
│  ☐ Understands code quality (Issue #7)     │
│  ☐ Can document work (Issue #8)            │
│                                             │
│  Score: 0/7 → Target: 7/7                  │
└─────────────────────────────────────────────┘
```

## Anti-Patterns to Avoid

```
❌ DON'T: Skip setup issues and jump to development
✅ DO: Complete issues in sequence for dependencies

❌ DON'T: Copy code without understanding it
✅ DO: Read code, understand patterns, then implement

❌ DON'T: Ignore linting errors
✅ DO: Fix all linting issues or document why they're safe to ignore

❌ DON'T: Submit PR without testing
✅ DO: Test locally, verify acceptance criteria met

❌ DON'T: Leave documentation for later
✅ DO: Document as you go, update README with learnings
```

## Resources

- **Issue Templates**: [`docs/issues/`](./docs/issues/)
- **Team Lead Guide**: [`docs/TEAM_LEAD_GUIDE.md`](./docs/TEAM_LEAD_GUIDE.md)
- **Full Issue List**: [`HELLO_WORKFLOW_ISSUES.md`](./HELLO_WORKFLOW_ISSUES.md)
- **Creation Script**: [`create-issues.sh`](./create-issues.sh)
- **Project README**: [`proj2/README.md`](./proj2/README.md)

## Questions?

1. Check the issue template for troubleshooting tips
2. Review the proj2 README for detailed setup instructions
3. Ask in team chat
4. Update documentation with your solution to help future teammates

---

**Happy Coding! 🚀**
