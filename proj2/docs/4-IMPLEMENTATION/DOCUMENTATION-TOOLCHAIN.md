# Eatsential Development Documentation Toolchain

## 🎯 Overview

Eatsential adopts the "Docs as Code" philosophy based on modern full-stack development best practices, building an automated documentation ecosystem that ensures documentation stays synchronized with code, reducing team collaboration and project maintenance costs.

## 📋 Documentation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Eatsential Documentation Ecosystem              │
├─────────────────────────────────────────────────────────────────┤
│  🎨 Frontend Docs    │  🔧 Backend Docs    │  📊 Project Docs   │
│                      │                     │                    │
│  • Storybook        │  • FastAPI/Sphinx   │  • MkDocs Site     │
│  • TypeDoc          │  • OpenAPI/ReDoc    │  • README          │
│  • Component Docs   │  • Python Docstring │  • Architecture    │
│                      │                     │  • User Guides     │
├─────────────────────────────────────────────────────────────────┤
│              📚 Unified Documentation Portal                     │
│                     https://docs.eatsential.dev                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Toolchain Components

### 1. In-Code Documentation Standards

#### 🔸 Frontend JavaScript/TypeScript (JSDoc)

```typescript
/**
 * Health Profile Form Component - Supports allergen and fitness goals configuration
 * 
 * @description Create and edit user dual-dimension health profiles with
 * zero-tolerance allergen safety checks and personalized nutrition goal settings
 * 
 * @component
 * @example
 * ```tsx
 * <HealthProfileForm
 *   initialData={userProfile}
 *   onSubmit={handleSubmit}
 *   loading={isLoading}
 *   mode="create"
 * />
 * ```
 * 
 * @param {HealthProfileFormProps} props - Component properties
 * @param {UserProfile} [props.initialData] - Initial data for edit mode
 * @param {Function} props.onSubmit - Form submission callback function
 * @param {boolean} [props.loading=false] - Loading state indicator
 * @param {"create"|"edit"|"view"} [props.mode="create"] - Form mode
 * 
 * @returns {JSX.Element} Health profile form component
 * 
 * @since 1.0.0
 * @author Eatsential Team
 * @see {@link https://docs.eatsential.dev/components/health-profile-form}
 */
export const HealthProfileForm: React.FC<HealthProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  mode = "create"
}) => {
  // Component implementation...
};

/**
 * Calculate nutrition matching score
 * 
 * @description Calculate personalized nutrition matching score based on 
 * user health profile and food nutrition information using ML algorithms
 * 
 * @function
 * @param {UserProfile} profile - User health profile
 * @param {FoodItem} foodItem - Food nutrition information
 * @param {NutritionPreferences} preferences - Nutrition preference settings
 * 
 * @returns {Promise<NutritionScore>} Nutrition score object
 * @returns {number} returns.score - Matching score (0-100)
 * @returns {string[]} returns.reasons - Recommendation reasons list
 * @returns {string[]} returns.warnings - Health warnings list
 * 
 * @throws {ValidationError} When user profile data is invalid
 * @throws {ApiError} When nutrition analysis service is unavailable
 * 
 * @example
 * ```typescript
 * const score = await calculateNutritionScore(
 *   userProfile,
 *   { name: "Chicken Breast", protein: 23, calories: 165 },
 *   { goal: "muscle_gain", restrictions: ["dairy"] }
 * );
 * console.log(`Matching score: ${score.score}%`);
 * ```
 * 
 * @version 1.0.0
 * @since 1.0.0
 */
export async function calculateNutritionScore(
  profile: UserProfile,
  foodItem: FoodItem,
  preferences: NutritionPreferences
): Promise<NutritionScore> {
  // Implementation logic...
}
```

#### 🔸 Backend Python (Google Style Docstrings)

```python
def create_health_profile(user_id: str, profile_data: HealthProfileCreate) -> HealthProfile:
    """Create user health profile
    
    Create a dual-dimension health profile for users with zero-tolerance 
    allergen safety mechanisms, providing precise user persona foundation 
    for subsequent AI nutrition recommendations.
    
    Args:
        user_id (str): User unique identifier, must be valid UUID format
        profile_data (HealthProfileCreate): Health profile creation data containing:
            - allergies (List[str]): Allergen list for zero-tolerance safety filtering
            - fitness_goals (List[str]): Fitness goals affecting nutrition algorithms
            - dietary_preferences (List[str]): Dietary preferences determining food choices
            - mental_wellness_goals (List[str]): Mental health goals affecting mood foods
            - medical_conditions (Optional[List[str]]): Medical conditions for special diets
    
    Returns:
        HealthProfile: Successfully created health profile object containing:
            - profile_id (str): System-generated unique profile identifier
            - user_id (str): User ID
            - created_at (datetime): Creation timestamp
            - updated_at (datetime): Last update timestamp
            - nutrition_score (float): Initial nutrition matching score
    
    Raises:
        ValidationError: When input data format is incorrect or missing required fields
        DuplicateProfileError: When user already has an existing health profile
        DatabaseError: When database operation fails
        
    Example:
        >>> profile_data = HealthProfileCreate(
        ...     allergies=["peanuts", "shellfish"],
        ...     fitness_goals=["muscle_gain"],
        ...     dietary_preferences=["vegan"],
        ...     mental_wellness_goals=["stress_reduction"]
        ... )
        >>> profile = create_health_profile("user-123", profile_data)
        >>> print(f"Profile created: {profile.profile_id}")
        Profile created: profile_user-123_1729123456
        
    Note:
        - Allergen information will be used for food safety filtering with zero tolerance
        - Created profiles can be updated via update_health_profile()
        - Profile data automatically syncs to RAG vector database for recommendation engine
        
    See Also:
        update_health_profile: Update health profile
        get_nutrition_recommendations: Get nutrition recommendations
        
    Version:
        Added in version 1.0.0
        
    Author:
        Eatsential Backend Team
    """
    # Implementation logic...

class NutritionEngine:
    """Scientific nutrition recommendation engine
    
    RAG (Retrieval-Augmented Generation) based nutrition recommendation system 
    combining user health profiles, scientific nutrition database, and LLM 
    to provide personalized nutrition advice.
    
    Attributes:
        vector_db (VectorDatabase): Vector database storing nutrition knowledge
        llm_client (LLMClient): Large language model client
        nutrition_db (NutritionDatabase): Nutrition composition database
        safety_filter (AllergenFilter): Allergen safety filter
        
    Example:
        >>> engine = NutritionEngine()
        >>> recommendations = await engine.get_recommendations(user_profile)
        >>> print(f"Found {len(recommendations)} food recommendations")
        Found 12 food recommendations
    """
    
    def __init__(self, config: NutritionEngineConfig):
        """Initialize nutrition recommendation engine
        
        Args:
            config (NutritionEngineConfig): Engine configuration parameters
        """
        pass
        
    async def get_recommendations(
        self, 
        user_profile: HealthProfile,
        context: Optional[RecommendationContext] = None
    ) -> List[NutritionRecommendation]:
        """Get personalized nutrition recommendations
        
        Args:
            user_profile: User health profile
            context: Recommendation context (time, scenario, etc.)
            
        Returns:
            List of nutrition recommendations sorted by matching score
            
        Raises:
            ProfileNotFoundError: User profile not found
            ServiceUnavailableError: RAG service unavailable
        """
        pass
```

### 2. Automated Documentation Generation

#### 🔸 Frontend Documentation (TypeDoc + Storybook)

**TypeDoc Configuration** (`typedoc.json`):
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/frontend-api",
  "theme": "default",
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeExternals": true,
  "includeVersion": true,
  "name": "Eatsential Frontend API",
  "readme": "frontend/README.md",
  "plugin": ["typedoc-plugin-markdown"],
  "gitRevision": "main",
  "customCss": "docs/assets/typedoc-custom.css",
  "navigationLinks": {
    "Storybook": "https://storybook.eatsential.dev",
    "API Docs": "https://api.eatsential.dev/docs",
    "Project Docs": "https://docs.eatsential.dev"
  }
}
```

**Storybook Configuration** (`.storybook/main.ts`):
```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

#### 🔸 Backend Documentation (FastAPI + Sphinx)

**Sphinx Configuration** (`docs/conf.py`):
```python
project = 'Eatsential Backend API'
copyright = '2025, Eatsential Team'
author = 'Eatsential Team'
release = '1.0.0'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
    'sphinx.ext.intersphinx',
    'sphinx_rtd_theme',
]

html_theme = 'sphinx_rtd_theme'
napoleon_google_style = True
autodoc_default_options = {
    'members': True,
    'member-order': 'bysource',
    'special-members': '__init__',
}
```

### 3. API Documentation Automation (FastAPI OpenAPI)

**Enhanced FastAPI Configuration**:
```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Eatsential API - Precision Nutrition Platform",
    description="AI-powered nutrition platform with dual-dimension health profiling",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Eatsential API",
        version="1.0.0",
        description="""
        # Eatsential API Documentation
        
        YOUR PLATE, YOUR RULES. PRECISION NUTRITION FOR BODY AND MIND.
        
        ## Core Features
        - **Dual-Dimension Health Profile**: Physical + mental wellness
        - **RAG-Powered Recommendations**: Scientific nutrition engine
        - **LLM Health Assistant**: Natural language nutrition consultation
        - **Zero-Tolerance Allergen Safety**: Strict food safety filtering
        """,
        routes=app.routes,
    )
    
    openapi_schema["tags"] = [
        {"name": "System Health", "description": "System monitoring and health checks"},
        {"name": "Authentication", "description": "User authentication and authorization"},
        {"name": "Health Profile", "description": "Dual-dimension health profile management"},
        {"name": "Nutrition Engine", "description": "RAG-driven nutrition recommendations"},
        {"name": "AI Concierge", "description": "LLM-powered health assistant"},
        {"name": "Restaurant Discovery", "description": "Curated healthy restaurant partners"},
        {"name": "Visual Wellness", "description": "Progress tracking and visualization"}
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

### 4. Testing Documentation Integration

#### 🔸 BDD Testing (Behavior-Driven Development)

**Gherkin Test Scenarios** (`tests/features/health_profile.feature`):
```gherkin
Feature: User Health Profile Management
  As a health-conscious user
  I want to create and manage my health profile
  So that I can receive personalized nutrition recommendations

  Scenario: Create new health profile
    Given I am an authenticated user
    When I submit a health profile with:
      | Field              | Value                    |
      | Allergies          | peanuts, shellfish       |
      | Fitness Goals      | muscle_gain, weight_loss |
      | Dietary Prefs      | vegan                    |
      | Mental Wellness    | stress_reduction         |
    Then the system should create the profile successfully
    And I should receive a profile ID
    And nutrition matching score should be initialized

  Scenario: Allergen safety check
    Given my health profile contains peanut allergy
    When I request food recommendations
    Then all recommended foods should not contain peanuts
    And the system should display "zero-tolerance allergen safety" indicator
```

#### 🔸 Frontend Component Testing

```typescript
// src/components/HealthProfileForm/HealthProfileForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HealthProfileForm } from './HealthProfileForm';

/**
 * Health Profile Form Component Test Suite
 * 
 * Validates component behavior including:
 * - Form rendering and user interaction
 * - Data validation and error handling
 * - Loading states and successful submission
 * - Allergen safety notifications
 */
describe('HealthProfileForm', () => {
  it('should render all required form fields', () => {
    render(<HealthProfileForm onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/allergies/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fitness goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dietary preferences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mental wellness/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create profile/i })).toBeInTheDocument();
  });

  it('should show allergen safety warning when allergies are entered', async () => {
    render(<HealthProfileForm onSubmit={vi.fn()} />);
    
    const allergenInput = screen.getByLabelText(/allergies/i);
    fireEvent.change(allergenInput, { target: { value: 'peanuts,shellfish' } });
    
    await waitFor(() => {
      expect(screen.getByText(/zero-tolerance allergen safety/i)).toBeInTheDocument();
    });
  });
});
```

### 5. Unified Documentation Portal (MkDocs)

**MkDocs Configuration** (`mkdocs.yml`):
```yaml
site_name: Eatsential Developer Documentation
site_description: Precision Nutrition Platform Developer Docs - YOUR PLATE, YOUR RULES
site_url: https://docs.eatsential.dev
repo_url: https://github.com/Asoingbob225/CSC510

theme:
  name: material
  palette:
    - scheme: default
      primary: green
      accent: orange
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode
    - scheme: slate
      primary: green
      accent: orange
      toggle:
        icon: material/brightness-4
        name: Switch to light mode
  features:
    - navigation.instant
    - navigation.tabs
    - navigation.sections
    - navigation.expand
    - search.highlight
    - content.code.copy

plugins:
  - search
  - mkdocstrings:
      default_handler: python
  - mermaid2

nav:
  - Home: index.md
  - Getting Started:
    - Setup: getting-started/setup.md
    - Development: getting-started/development.md
    - Deployment: getting-started/deployment.md
  - API Documentation:
    - Overview: api/overview.md
    - Authentication: api/authentication.md
    - Health Profile: api/health-profile.md
    - Nutrition Engine: api/nutrition-engine.md
    - AI Concierge: api/ai-concierge.md
    - Restaurant Discovery: api/restaurant-discovery.md
    - Visual Wellness: api/visual-wellness.md
  - Frontend Development:
    - Components: frontend/components.md
    - State Management: frontend/state-management.md
    - Styling: frontend/styling.md
  - Backend Development:
    - Structure: backend/structure.md
    - Models: backend/models.md
    - Services: backend/services.md
    - Testing: backend/testing.md
  - Contributing:
    - Code Standards: contributing/code-standards.md
    - Commit Guidelines: contributing/commit-conventions.md
```

### 6. CI/CD Documentation Automation

**GitHub Actions Workflow** (`.github/workflows/docs-generation.yml`):
```yaml
name: Documentation Generation & Deployment

on:
  push:
    branches: [main, develop]
    paths: ['proj2/**', 'docs/**']
  pull_request:
    branches: [main]

jobs:
  frontend-docs:
    name: Generate Frontend Documentation
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: proj2
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Generate TypeDoc Documentation
        run: |
          cd frontend
          bun run build:docs

      - name: Build Storybook
        run: |
          cd frontend
          bun run build-storybook --output-dir ../docs-output/storybook

      - name: Upload Frontend Docs
        uses: actions/upload-artifact@v4
        with:
          name: frontend-docs
          path: proj2/docs-output/

  backend-docs:
    name: Generate Backend Documentation
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: proj2/backend
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.9"

      - name: Install UV
        uses: astral-sh/setup-uv@v6

      - name: Install Dependencies
        run: |
          uv sync --all-groups
          uv add --group dev sphinx sphinx-rtd-theme

      - name: Generate API Documentation
        run: |
          # Start FastAPI server
          uv run uvicorn index:app --host 0.0.0.0 --port 8000 &
          sleep 5
          
          # Generate OpenAPI docs
          mkdir -p docs-output/api
          curl -o docs-output/api/openapi.json http://localhost:8000/openapi.json
          
          # Generate ReDoc static page
          uv add --group dev redoc-cli
          uv run redoc-cli build docs-output/api/openapi.json --output docs-output/api/index.html
          
          pkill -f uvicorn || true

      - name: Upload Backend Docs
        uses: actions/upload-artifact@v4
        with:
          name: backend-docs
          path: proj2/backend/docs-output/

  docs-site:
    name: Build Documentation Site
    runs-on: ubuntu-latest
    needs: [frontend-docs, backend-docs]
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5

      - name: Install MkDocs
        run: pip install mkdocs-material mkdocstrings[python] mkdocs-mermaid2-plugin

      - name: Download Documentation Artifacts
        uses: actions/download-artifact@v4
        with:
          pattern: "*-docs"
          path: docs/generated/

      - name: Build MkDocs Site
        run: mkdocs build --clean --strict

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
```

## 🔗 Documentation Portal Navigation

| Documentation Type | Access URL | Description |
|-------------------|------------|-------------|
| 🏠 Main Documentation | https://docs.eatsential.dev | MkDocs unified portal |
| 🎨 Component Library | https://docs.eatsential.dev/storybook | Interactive component docs |
| 📱 Frontend API | https://docs.eatsential.dev/frontend-api | TypeDoc generated API |
| 🔧 Backend API | https://api.eatsential.dev/docs | FastAPI Swagger UI |
| 📖 Backend Code Docs | https://docs.eatsential.dev/backend-api | Sphinx generated docs |
| 🧪 Test Coverage | https://docs.eatsential.dev/coverage | Coverage reports |

## 📊 Documentation Quality Standards

### Automated Quality Checks
- **Documentation Coverage**: All public APIs must have documentation
- **Link Validation**: Automatic internal/external link checking
- **Spell Checking**: Use cspell for spell checking
- **Update Verification**: Ensure documentation updates with code changes

### Review Process
1. **Code Review Documentation Check**: PRs must include documentation updates
2. **Monthly Documentation Review**: Check accuracy and completeness
3. **User Feedback Integration**: Collect and act on documentation feedback

---

**This documentation toolchain provides enterprise-grade documentation ecosystem for Eatsential project, ensuring development efficiency and knowledge preservation!** 📚🚀