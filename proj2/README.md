# Eatsential 🥗

[![CI/CD Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/test-coverage.yml)
[![Super-Linter](https://github.com/Asoingbob225/CSC510/actions/workflows/linter.yml/badge.svg)](https://github.com/marketplace/actions/super-linter)
[![Formatters](https://github.com/Asoingbob225/CSC510/actions/workflows/format-check.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/format-check.yml)
[![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17504564.svg)](https://doi.org/10.5281/zenodo.17504564)
[![Project Status: WIP](https://img.shields.io/badge/status-wip-yellow.svg)](#)

**YOUR PLATE, YOUR RULES. PRECISION NUTRITION FOR BODY AND MIND.**

Eatsential is an LLM-powered platform that connects users to hyper-personalized food options. In a world of information overload, our platform is designed to eliminate the frustration and health risks associated with finding food that truly meets an individual's unique needs. We empower users to take control of their health by providing meal recommendations, recipes, and restaurant suggestions tailored to their holistic profile—from allergies and fitness goals to mental wellness objectives.

---

## 🎬 Demo Video

Watch our 2-5 minute demo to see Eatsential in action:

<!-- Video hosted in GitHub Releases -->
<div align="center">
  <a href="https://github.com/Asoingbob225/CSC510/releases/download/v1.0.0/csc510_proj2_demo.mov">
    <img src="https://img.shields.io/badge/▶️_Watch_Demo-Download_Video-FF0000?style=for-the-badge&logo=github&logoColor=white" alt="Download Demo Video" />
  </a>
  <br><br>
  <a href="https://github.com/Asoingbob225/CSC510/releases">
    <img src="https://img.shields.io/badge/🎥_Project_Demo-2--5_minutes-blue?style=for-the-badge" alt="Demo Video - 2-5 minutes" />
  </a>
</div>

> **📥 Video Location:** The demo video is available in our [GitHub Releases](https://github.com/Asoingbob225/CSC510/releases)  
> **📁 Filename:** `csc510_proj2_demo.mov`

---

## ✨ Core Features

- **Dual-Dimension Health Profile:** We offer support for both physical goals (muscle gain, weight loss) and mental well-being objectives (stress reduction, improved focus).
- **Scientific Nutrition Engine:** Our recommendation system is built on a large nutritional database and a proprietary health-tagging system (e.g., `#PostWorkoutRecovery`, `#StressRelief`) to ensure every suggestion is a perfect nutritional match.
- **AI Health Concierge:** A conversational AI, powered by a cutting-edge LLM, provides users with real-time, human-like support for questions, plan adjustments, or meal insights.
- **Curated Healthy Restaurants:** We partner exclusively with vetted restaurants that use high-quality ingredients and provide transparent nutritional information.
- **Visual Wellness Journey:** Users can track their progress—from calorie intake and weight changes to mood fluctuations—through intuitive charts and timelines.

## 🚀 Quick Start Guide

This guide will get the project running on your local machine.

1. Prerequisites
   Ensure you have the following installed:

- Bun (v1.2.21+)
- uv
- Python (3.9+)

2. Setup
   Clone the repository and install all dependencies for the root, frontend, and backend with these commands:

```Bash
# Clone the project and navigate into it
git clone <repository-url>
cd CSC510/proj2

# Install root, frontend, and backend dependencies
bun install
cd frontend && bun install && cd ..
cd backend && uv sync && cd ..
```

3. Run the Application
   Start both the frontend and backend servers simultaneously with a single command from the root directory (proj2/):

```Bash
bun dev
```

The application will now be running:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Backend API Docs: http://localhost:8000/docs

## 🚀 Project Status & Roadmap

This project is currently a **work in progress**. Our development is planned in two main releases:

- **October: The Intelligent MVP**
  - Launch core user accounts and the Dual-Dimension Health Profile
  - Deploy the V1 Scientific Nutrition Engine for AI-powered recommendations
  - Implement the interactive AI Health Concierge and Restaurant Discovery module.
- **November: The Integrated Life Planner**
  - Introduce a Dynamic Meal Planner and Smart Grocery Lists.
  - Launch a Community & Social Hub for users to connect and share their journey.
  - Close the Personalization Loop with an advanced feedback system to refine AI recommendations.

## 🤖 CI/CD Pipeline

This project uses GitHub Actions for CI/CD:

- **test-coverage.yml:** Runs all tests and reports coverage for frontend and backend.
- **linter.yml:** Lints frontend and backend code for style and quality.
- **format-check.yml:** Checks code formatting for Python (Ruff) and frontend (Prettier).

Workflow files are in `.github/workflows/`. CI status badges are at the top.

## 🤝 Contributing

We welcome contributions to Eatsential! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) to learn how you can get involved.

All contributors are expected to adhere to our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 👥 Authors

This project is brought to you by Group 12.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

## 📚 Citation and DOI

This project is registered with Zenodo for academic citation and archival purposes. If you use this project in your research or work, please cite it using the DOI badge above.

## Need help?

Feel free to open an issue to discuss with us.