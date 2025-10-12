# Hello Workflow Issues

This directory contains individual issue templates for the "Hello Workflow" onboarding process.

## Purpose

These issues are designed to ensure every teammate can:
- Set up their development environment
- Run the full-stack application
- Make code changes to both frontend and backend
- Follow code quality standards
- Document their work

## How to Use

1. Create a new GitHub Issue for each file in this directory
2. Copy the content from each `.md` file
3. Assign each issue to a different teammate
4. Update `[ISSUE_NUMBER]` with the actual issue number after creation

## Issues List

| # | Issue | Type | Difficulty | Est. Time |
|---|-------|------|------------|-----------|
| 1 | [Install Prerequisites](./01-install-prerequisites.md) | Setup | Easy | 15-30 min |
| 2 | [Setup Frontend Dependencies](./02-setup-frontend-dependencies.md) | Setup | Easy | 10 min |
| 3 | [Setup Backend Dependencies](./03-setup-backend-dependencies.md) | Setup | Easy | 10 min |
| 4 | [Run Dev Server](./04-run-dev-server.md) | Testing | Easy | 15 min |
| 5 | [Add API Endpoint](./05-add-api-endpoint.md) | Backend | Medium | 20-30 min |
| 6 | [Add Frontend Component](./06-add-frontend-component.md) | Frontend | Medium | 30-45 min |
| 7 | [Run Frontend Linter](./07-run-frontend-linter.md) | Quality | Easy | 15-20 min |
| 8 | [Update Documentation](./08-update-documentation.md) | Docs | Easy | 20-30 min |

## Workflow Order

The issues are designed to be completed in sequence:

```
1. Prerequisites (Setup) 
   ↓
2-3. Dependencies (Setup - can be parallel)
   ↓
4. Run Server (Verify setup works)
   ↓
5. Add API Endpoint (Backend development)
   ↓
6. Add Frontend Component (Frontend development)
   ↓
7. Run Linter (Code quality)
   ↓
8. Update Documentation (Knowledge sharing)
```

## Assignment Strategy

- **Assign different issues to different teammates** to ensure everyone goes through the workflow
- Consider pairing for issues #5-6 (backend + frontend) if team members have different skill levels
- Issues #1-4 are great for onboarding new developers
- Issues #5-8 help developers practice the full development workflow

## Success Criteria

A teammate has successfully completed the workflow when they:
- ✅ Can start the development environment independently
- ✅ Have made a code change to both frontend and backend
- ✅ Understand the linting and code quality process
- ✅ Can document their work

## After Completion

Once all issues are completed:
1. Review all PRs as a team
2. Discuss any challenges faced during the workflow
3. Update this documentation based on feedback
4. Consider adding more advanced workflow issues for continued learning

## Support

If teammates encounter issues:
1. Check the troubleshooting sections in each issue
2. Review the main [proj2 README](../../proj2/README.md)
3. Ask for help in the team chat
4. Update the issue with your solution to help future teammates
