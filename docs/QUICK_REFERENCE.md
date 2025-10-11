# Hello Workflow - Quick Reference Card

## 📋 The 8 Issues at a Glance

| # | Title | Type | Time | What You'll Do |
|---|-------|------|------|----------------|
| 1 | Install Prerequisites | Setup | 15-30m | Install Bun, uv, Python |
| 2 | Frontend Dependencies | Setup | 10m | Install React/TS packages |
| 3 | Backend Dependencies | Setup | 10m | Install FastAPI packages |
| 4 | Run Dev Server | Test | 15m | Start and verify full stack |
| 5 | Add API Endpoint | Backend | 20-30m | Create greeting API |
| 6 | Add UI Component | Frontend | 30-45m | Create greeting form |
| 7 | Run Linter | Quality | 15-20m | Check code quality |
| 8 | Update Docs | Docs | 20-30m | Add Quick Start guide |

## 🎯 Completion Checklist

Copy this into your issue tracking:

```markdown
## My Hello Workflow Progress

- [ ] Issue #1: ✅ Prerequisites installed
- [ ] Issue #2: ✅ Frontend dependencies installed
- [ ] Issue #3: ✅ Backend dependencies installed
- [ ] Issue #4: ✅ Server running successfully
- [ ] Issue #5: ✅ API endpoint created
- [ ] Issue #6: ✅ UI component created
- [ ] Issue #7: ✅ Code passes linting
- [ ] Issue #8: ✅ Documentation updated
```

## 🚀 Getting Started

1. **Read your assigned issue** in full before starting
2. **Complete the tasks** in the order listed
3. **Take screenshots** for acceptance criteria
4. **Test your changes** before submitting
5. **Create a PR** with "Closes #X" in description

## 💡 Pro Tips

- ✅ **Do** ask for help if stuck for more than 15 minutes
- ✅ **Do** read error messages carefully
- ✅ **Do** test your changes multiple times
- ✅ **Do** commit frequently with clear messages
- ❌ **Don't** skip acceptance criteria
- ❌ **Don't** copy code without understanding
- ❌ **Don't** ignore linting warnings
- ❌ **Don't** forget to document issues you encounter

## 🆘 Quick Help

### Command Not Found
```bash
# Restart your terminal or source your shell config
source ~/.bashrc  # or ~/.zshrc
```

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Dependencies Won't Install
```bash
# Frontend
cd proj2/frontend
rm -rf node_modules bun.lock
bun install

# Backend
cd proj2/backend
rm -rf .venv uv.lock
uv sync
```

### Can't Connect to Backend
1. Check backend is running (terminal should show "Uvicorn running...")
2. Check backend is on port 8000: `curl http://localhost:8000/api`
3. Check Vite proxy in `frontend/vite.config.ts`

## 📝 Commit Message Guide

Good commit messages:
```
✅ feat: add greeting API endpoint
✅ fix: resolve linting errors in App.tsx
✅ docs: add Quick Start section to README
✅ chore: install frontend dependencies
```

Bad commit messages:
```
❌ fixed stuff
❌ update
❌ wip
❌ asdfasdf
```

## 🎓 What You'll Learn

**Phase 1 (Issues 1-4):** Environment Setup
- Package managers (Bun, uv)
- Dependency management
- Running development servers
- Client-server communication

**Phase 2 (Issues 5-6):** Full-Stack Development
- Backend API development (FastAPI)
- Frontend React development
- REST API integration
- State management

**Phase 3 (Issues 7-8):** Code Quality
- Linting and code style
- Documentation practices
- Git workflow

## 🏆 Success Criteria

You've successfully completed the workflow when:
- ✅ You can start the dev environment independently
- ✅ You've made changes to both frontend and backend
- ✅ Your code passes linting
- ✅ You've documented your work
- ✅ Your PR has been reviewed and merged

## 📚 Resources

- **All Issues**: `HELLO_WORKFLOW_ISSUES.md`
- **Visual Guide**: `docs/WORKFLOW_VISUAL_GUIDE.md`
- **Team Lead Guide**: `docs/TEAM_LEAD_GUIDE.md`
- **Project README**: `proj2/README.md`

## 🤝 Getting Help

1. Check the troubleshooting section in your issue
2. Review the project README
3. Ask in team chat
4. Tag your team lead if blocked

## 🎉 After Completion

Once you finish all issues:
1. Celebrate! 🎊
2. Share learnings with the team
3. Help others who are stuck
4. Ready for real feature work

---

**Remember:** Everyone was a beginner once. Ask questions, learn from mistakes, and help your teammates!

Good luck! 🚀
