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

-   For **bug reports**, use the "Bug Report" template and provide as much detail as possible.
-   For **feature requests**, use the "Feature Request" template and clearly describe the proposed enhancement and why it would be valuable.

---

## 💬 Communication and Discussion

**We encourage you to discuss changes before you start working!**

-   **For major changes:** If you plan to add a significant new feature or make a major change, please **open an issue first**. This allows us to discuss the approach, ensure it aligns with the project's goals, and prevent you from spending time on work that might not be merged.
-   **Ask for help:** If you get stuck or have questions, don't hesitate to comment on the relevant issue or Pull Request. We are here to help you succeed.
-   **Use Draft Pull Requests:** Feel free to open a "Draft" Pull Request early in the process. This is a great way to get feedback on your direction and code before it's finalized.

---

## 🚀 Pull Request Process

Ready to contribute code? Follow these steps to submit a Pull Request (PR).

1.  **Fork the repository:** Create your own copy of the project.

2.  **Create a new branch:** Name your branch descriptively.
    ```bash
    # Good branch names: feature/user-profile-avatars or fix/login-form-bug
    git checkout -b <branch-name>
    ```

3.  **Make your changes:** Write your code and add any necessary tests. Ensure your code follows the project's style guidelines.

4.  **Commit your changes:** Use clear and concise commit messages. A good commit message explains *what* changed and *why*.
    ```bash
    git commit -m "feat: Add user profile avatars"
    ```

5.  **Push to your branch:**
    ```bash
    git push origin <branch-name>
    ```

6.  **Open a Pull Request:** Go to the original repository on GitHub and open a PR.
    -   Provide a clear title and a detailed description of your changes.
    -   Link the PR to the relevant issue (e.g., "Closes #23").

### Pull Request Guidelines

-   **Keep it focused:** Each PR should address a single issue or feature. Don't mix bug fixes and new features in the same PR.
-   **Ensure tests pass:** All new code should have corresponding tests, and the existing test suite must pass.
-   **Request a review:** Once your PR is open, request a review from one of the project maintainers. Be open to feedback and be prepared to make changes.