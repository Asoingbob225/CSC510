
# CSC510 Project Workspace

Welcome to the main repository for CSC510. This repo contains two major subprojects: `proj1` and `proj2`.

> **⚠️ ACTION REQUIRED**: Codecov integration requires a one-time setup. See [`CODECOV_SETUP_REQUIRED.md`](CODECOV_SETUP_REQUIRED.md) for instructions.

---

## 📁 Project Structure Overview

- **proj1/**
  - Archive files and early experiments. Not the focus of current development.

- **proj2/**
  - The core project of our team, focused on building the full-stack "Eatsential" intelligent nutrition and wellness platform.
  - Includes frontend (React + Vite), backend (Python FastAPI), and all related dependencies.
  - Features: user health profiles, AI-powered recommendations, healthy restaurant discovery, and progress visualization.
  - For detailed setup, development, and contribution instructions, see `proj2/README.md`.

---

## 🏆 Project Focus

Our main effort is dedicated to `proj2`, aiming to deliver a personalized, LLM-powered health and nutrition recommendation platform.

**Eatsential Platform Highlights:**

- Dual-dimension health goals: physical and mental well-being
- Scientific nutrition engine and health tagging system
- Real-time AI health concierge
- Curated healthy restaurants with transparent nutrition info
- Progress tracking and data visualization

For more features, installation, and development details, see [`proj2/README.md`](proj2/README.md).

---

## 🚀 Quick Start

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd CSC510/proj2
    ```
2. Install dependencies:
    ```bash
    bun install
    cd frontend && bun install && cd ..
    cd backend && uv sync && cd ..
    ```
3. Start the services:
    ```bash
    bun dev
    ```
    - Frontend: http://localhost:5173
    - Backend: http://localhost:8000
