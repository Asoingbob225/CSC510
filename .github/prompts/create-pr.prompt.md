---
description: Create a pull request from the current branch, ensuring all related documentation is updated first.
mode: agent
model: Gemini 2.5 Pro (copilot)
---

Goal: Create a pull request from the current branch, ensuring all related
documentation is updated first.

Instructions:

1.  Analyze Progress: Review the recent commits (git log) and the list of open
    GitHub issues (gh issue list) to determine which tasks have been completed n
    the current branch.

2.  Update Documentation:

    - Open the sprint planning document located at
      proj2/docs/AGENT-PLAN/08-SPRINT-TASKS.md.
    - Based on your analysis, update the status of all completed tasks (e.g.,
      from 📝 To Do to ✅ Complete).
    - Recalculate and update the summary sections, including Sprint Summary,
      Sprint Progress, and Task Assignment, to accurately reflect these
      changes.

3.  Commit Changes:

    - Stage the modified documentation file.
    - Commit the changes with a clear, conventional commit message (e.g., docs:
      update sprint tasks to reflect current progress).

4.  Create Pull Request:
    - Create a new pull request to merge the current branch into the main
      branch.
    - The PR should close issues.
    - Use the last feature commit message as the PR title.
    - Use the following template for the PR body, filling in the description
      with a summary of the changes:

```
Closes: # (issue number)

### Description of Changes

### Checklist

- [ ] My code follows the style guidelines of this project.
- [ ] I have performed a self-review of my own code.
- [ ] I have made corresponding changes to the documentation.
- [ ] I have added tests that prove my feature works.
- [ ] New and existing unit tests pass locally with my changes.
```
