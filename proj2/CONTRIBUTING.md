# Contributing to Eatsential

We're excited you're interested in contributing! This guide outlines how to report issues, suggest features, and submit code changes. Collaboration is key to our success, and we encourage open discussion throughout the process.

## 🛠️ Development Setup

First, you need to set up the project on your local machine. Please follow the complete **[Installation Guide](INSTALL.md)** to get your environment ready.

---

## 🐞 Reporting Bugs and Suggesting Features

The best way to contribute is by using GitHub Issues.

### Before You Create an Issue

1.  **Search existing issues:** Please check if an issue for your bug or feature request already exists.
2.  **Gather information:** If you're reporting a bug, include steps to reproduce it, what you expected to happen, and what actually happened. Screenshots are very helpful!

### Creating a New Issue

- For **bug reports**, use the "Bug Report" template and provide as much detail as possible.
- For **feature requests**, use the "Feature Request" template and clearly describe the proposed enhancement and why it would be valuable.

---

## 💬 Communication and Discussion

**We encourage you to discuss changes before you start working!**

- **For major changes:** If you plan to add a significant new feature or make a major change, please **open an issue first**. This allows us to discuss the approach, ensure it aligns with the project's goals, and prevent you from spending time on work that might not be merged.
- **Use Draft Pull Requests:** Feel free to open a "Draft" Pull Request early in the process. This is a great way to get feedback on your direction and code before it's finalized.

---

## 🚀 Pull Request Process

Ready to contribute code? Follow these steps to submit a Pull Request (PR).

1.  **Fork the repository:** Create your own copy of the project.

2.  **Create a new branch from `MAIN`:** All branches must be created from an up-to-date `MAIN` branch. We have a strict naming convention to ensure clarity and traceability.

    **Branch Naming Convention:**
    `type/iss<issue-number>-short-description`

    - **`type`**: Must be one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
    - **`issue-number`**: The number of the GitHub issue you are addressing.
    - **`short-description`**: A few words describing the change.

    **Examples:**
    ```bash
    # Good:
    git checkout -b feat/iss24-user-profile-avatars
    git checkout -b fix/iss31-login-form-bug
    
    # Bad (missing type or issue number):
    git checkout -b user-profile-avatars
    git checkout -b fix-login-form
    ```
3.  **Make your changes:** Write your code and add any necessary tests. Ensure your code follows the project's style guidelines.

4.  **Commit your changes:** We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This is mandatory.

    **Commit Message Format:**
    `<type>: <description>`

    - **`type`**: Must be one of the types listed in the branching section.
    - **`description`**: A concise, imperative-mood summary of the change.

    **Examples:**
    ```bash
    # Good:
    git commit -m "feat: Add user profile avatars"
    git commit -m "docs: Update contributing guidelines with new branch convention"
    
    # Bad (unclear type or description):
    git commit -m "updated code"
    git commit -m "stuff"
    ```
5.  **Push to your branch:**
    ```bash
    git push origin <branch-name>
    ```
   

6.  **Open a Pull Request:** Go to the original repository on GitHub and open a PR.
    - Provide a clear title and a detailed description of your changes.
    - **Crucially, link the PR to the relevant issue using `Closes #<issue-number>` in the description.**

### Pull Request Guidelines

- **Keep it focused:** Each PR should address a single issue or feature.
- **Ensure tests pass:** All new code should have corresponding tests, and the existing test suite must pass.
- **Testing requirements:**
  - **Frontend:** For each new or updated component, please create a corresponding `test.tsx` file.
  - **Backend:** For backend code, add your test files into the `tests` directory.
- **Request a review:** Once your PR is open, request a review from one of the project maintainers.