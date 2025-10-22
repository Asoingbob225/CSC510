# Eatsential 🥗

[![CI/CD Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/test-coverage.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/test-coverage.yml)
[![Super-Linter](https://github.com/Asoingbob225/CSC510/actions/workflows/linter.yml/badge.svg)](https://github.com/marketplace/actions/super-linter)
[![Formatters](https://github.com/Asoingbob225/CSC510/actions/workflows/format-check.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/format-check.yml)
[![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
[![Project Status: WIP](https://img.shields.io/badge/status-wip-yellow.svg)](#)

**YOUR PLATE, YOUR RULES. PRECISION NUTRITION FOR BODY AND MIND.**

Eatsential is an LLM-powered platform that connects users to hyper-personalized food options. In a world of information overload, our platform is designed to eliminate the frustration and health risks associated with finding food that truly meets an individual's unique needs. We empower users to take control of their health by providing meal recommendations, recipes, and restaurant suggestions tailored to their holistic profile—from allergies and fitness goals to mental wellness objectives.

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

### How to Complete Zenodo Registration

⚠️ **Note:** The DOI badge currently shows a placeholder (`XXXXXXX`). To obtain an actual DOI, the repository owner needs to complete the following steps:

1. **Connect GitHub to Zenodo:**
   - Visit [Zenodo](https://zenodo.org/) and log in with your GitHub account
   - Go to your Zenodo account settings and navigate to the GitHub section
   - Find the `Asoingbob225/CSC510` repository and flip the toggle to enable it

2. **Create a Release:**
   - Go to the GitHub repository's releases page
   - Click "Create a new release"
   - Tag the release appropriately (e.g., `v1.0.0`, `proj2-v1.0.0`)
   - Provide a release title and description
   - Publish the release

3. **Get Your DOI:**
   - After publishing the release, Zenodo will automatically create a DOI
   - Visit your Zenodo uploads page to find the new DOI
   - The DOI will be in the format: `10.5281/zenodo.XXXXXXX` where `XXXXXXX` is your unique identifier

4. **Update the Badge:**
   - Replace `XXXXXXX` in the DOI badge at the top of this README with your actual Zenodo DOI number
   - The badge URLs should be updated to:
     - Badge image: `https://zenodo.org/badge/DOI/10.5281/zenodo.YOUR_DOI.svg`
     - Badge link: `https://doi.org/10.5281/zenodo.YOUR_DOI`

The `.zenodo.json` file in this directory contains metadata that Zenodo will use to properly describe your project, including title, description, authors, license, and keywords.
