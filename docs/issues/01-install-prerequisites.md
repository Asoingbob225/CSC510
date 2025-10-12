# Install Development Prerequisites

**Labels:** `good first issue`, `hello-workflow`, `setup`

## Description
Set up the required development tools on your local machine to work on the proj2 full-stack application.

## Tasks
- [ ] Install Bun (v1.2.21 or later) following https://bun.sh/install
- [ ] Install uv following https://docs.astral.sh/uv/getting-started/installation/
- [ ] Verify Python 3.9+ is installed
- [ ] Run `bun --version` to confirm Bun installation
- [ ] Run `uv --version` to confirm uv installation
- [ ] Run `python --version` to confirm Python version

## Acceptance Criteria
- ✅ All three tools (Bun, uv, Python) are installed and versions can be verified via command line
- ✅ Screenshot of terminal showing all three version commands succeeding
- ✅ Comment on this issue with your screenshot

## Commands to Run
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Verify installations
bun --version
uv --version
python --version
```

Closes #[ISSUE_NUMBER]
