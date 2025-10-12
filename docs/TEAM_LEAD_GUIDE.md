# Guide for Team Leads: Creating Hello Workflow Issues

This guide helps team leads create and assign the Hello Workflow issues to ensure every teammate can successfully run the full development workflow.

## Overview

The Hello Workflow consists of 8 carefully designed tasks that progressively introduce teammates to:
- Development environment setup
- Running the full-stack application
- Making code changes to both frontend and backend
- Following code quality standards
- Documentation practices

## Quick Start

### Option 1: Using the GitHub CLI Script (Recommended)

1. Install and authenticate GitHub CLI:
   ```bash
   # Install (choose your platform)
   brew install gh                    # macOS
   # See https://cli.github.com for other platforms
   
   # Authenticate
   gh auth login
   ```

2. Run the creation script:
   ```bash
   cd CSC510
   ./create-issues.sh
   ```

3. The script will create all 8 issues automatically with appropriate labels

### Option 2: Manual Creation

1. Navigate to the repository issues page: https://github.com/Asoingbob225/CSC510/issues

2. Click "New Issue"

3. For each issue (01-08), copy the content from `docs/issues/XX-*.md`:
   - Use the title from the markdown (first heading)
   - Copy the entire file content as the issue body
   - Add labels: `hello-workflow`, `good first issue`, and any specific labels mentioned

4. After creating all issues, note down the issue numbers

5. Edit each issue to update `Closes #[ISSUE_NUMBER]` with the actual issue number

## Assignment Strategy

### Recommended Assignment Approach

**For a team of 4-5 members:**
- Each member gets 1-2 issues
- Pair setup issues (1-3) with feature issues (5-6) for each person
- Example assignments:
  - Member A: Issues #1, #5 (Prerequisites + Backend)
  - Member B: Issues #2, #6 (Frontend Setup + Frontend Feature)
  - Member C: Issues #3, #7 (Backend Setup + Linting)
  - Member D: Issue #4, #8 (Testing + Documentation)

**For a larger team (6-8 members):**
- Assign one issue per person
- Follow the sequential order for dependencies:
  1. First wave: Issues #1 (can be done by multiple people)
  2. Second wave: Issues #2, #3 (parallel)
  3. Third wave: Issue #4 (requires 2-3 completed)
  4. Fourth wave: Issues #5, #6 (parallel)
  5. Final wave: Issues #7, #8

### Assignment Considerations

- **New developers**: Assign setup issues (#1-4) first
- **Backend developers**: Prioritize issue #5
- **Frontend developers**: Prioritize issue #6
- **Technical writers**: Great fit for issue #8
- **Quality-focused**: Issue #7 is perfect

## Tracking Progress

Create a tracking issue or project board with checkboxes:

```markdown
# Hello Workflow Progress

## Team Progress
- [ ] Issue #1: Prerequisites - @member1
- [ ] Issue #2: Frontend Setup - @member2
- [ ] Issue #3: Backend Setup - @member3
- [ ] Issue #4: Run Server - @member4
- [ ] Issue #5: Add API - @member5
- [ ] Issue #6: Add Component - @member6
- [ ] Issue #7: Linting - @member7
- [ ] Issue #8: Documentation - @member8

## Completion Status
- Setup Phase (Issues 1-4): 0/4
- Development Phase (Issues 5-6): 0/2
- Quality Phase (Issues 7-8): 0/2

Target completion: [Date]
```

## Review Guidelines

### For Setup Issues (#1-4)

**What to check:**
- [ ] Screenshots show successful installation/execution
- [ ] Version numbers are visible and correct
- [ ] No error messages in the output
- [ ] Commands are documented in comments

**Example good submission:**
- Clear screenshots of each command output
- Brief description of any issues encountered and how they were resolved
- Confirmation that next steps work

### For Development Issues (#5-6)

**What to check:**
- [ ] Code follows existing patterns and style
- [ ] New functionality works as described
- [ ] No breaking changes to existing features
- [ ] Code is properly formatted
- [ ] Git commit messages are clear

**Example good submission:**
- Clean, readable code
- Tests the new feature thoroughly
- Screenshots showing the feature working
- Good commit message: "feat: add greeting API endpoint"

### For Quality Issues (#7-8)

**What to check:**
- [ ] All linting errors are addressed
- [ ] Documentation is accurate and clear
- [ ] Changes are well-organized
- [ ] Examples are tested and work

## Common Issues and Solutions

### Issue #1: Installation Problems

**Problem:** Bun/uv fails to install
**Solution:** Provide platform-specific installation commands, check system requirements

**Problem:** Permission denied errors
**Solution:** Use sudo for system-wide installs or local installs for user directory

### Issue #4: Server Won't Start

**Problem:** Port already in use
**Solution:** `lsof -i :5173` and `lsof -i :8000` to find and kill processes

**Problem:** Dependencies not installed
**Solution:** Verify issues #2 and #3 are completed first

### Issue #6: API Connection Fails

**Problem:** CORS errors
**Solution:** Verify Vite proxy configuration in `vite.config.ts`

**Problem:** 404 errors
**Solution:** Check API endpoint path matches exactly

## Post-Completion

After all issues are completed:

1. **Team Retrospective**
   - What went well?
   - What was challenging?
   - How can we improve the workflow?

2. **Update Documentation**
   - Add discovered tips to the README
   - Update troubleshooting sections
   - Document any platform-specific issues

3. **Next Steps**
   - Assign real feature work
   - Consider advanced workflow issues
   - Pair programming opportunities

## Additional Resources

- **Main README**: `proj2/README.md` - Detailed setup instructions
- **Issue Templates**: `docs/issues/` - Individual issue templates
- **Summary Document**: `HELLO_WORKFLOW_ISSUES.md` - All issues in one place
- **GitHub Docs**: https://docs.github.com/en/issues

## Questions or Issues?

If you encounter problems with the workflow:
1. Check the troubleshooting section in each issue
2. Review the main proj2 README
3. Ask in team chat
4. Update this guide with your solution

## Success Metrics

A successful Hello Workflow completion means:
- ✅ All team members can run the dev environment
- ✅ Everyone has made at least one code change
- ✅ Team understands the git workflow (branch, commit, PR)
- ✅ Code quality standards are clear
- ✅ Documentation is up to date

Good luck! 🚀
