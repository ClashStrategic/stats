# Contributing Guide for Clash Strategic Stats API 🤝

Thank you for your interest in contributing to this project! Your help is highly valuable for expanding and improving the Clash Royale API. Please follow these guidelines to make your contribution as smooth as possible.

## 🚀 Getting Started

1.  **Fork the Repository**: Create a copy of the repository in your GitHub account.
2.  **Clone Your Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/stats.git
    cd stats
    ```
3.  **Create a New Branch**: Always work on a separate branch for your changes.
    ```bash
    git checkout -b feature/your-feature-name
    # or fix/your-bug-fix
    ```
4.  **Make Your Changes**: Implement features, fix bugs, or add data.
5.  **Test Your Changes**: Ensure your modifications do not introduce new issues and that everything works as expected.

## 📝 Semantic Commits

To maintain a clear and organized commit history, we use [Semantic Commits](https://www.conventionalcommits.org/en/v1.0.0/). This helps us to automatically generate the `CHANGELOG.md` and quickly understand the purpose of each change.

The general format is: `<type>(optional scope): <description>`

**Common Types:**

*   `feat`: A new feature.
*   `fix`: A bug fix.
*   `docs`: Documentation only changes.
*   `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
*   `refactor`: A code change that neither fixes a bug nor adds a feature.
*   `perf`: A code change that improves performance.
*   `test`: Adding missing tests or correcting existing tests.
*   `build`: Changes that affect the build system or external dependencies (examples: gulp, broccoli, npm).
*   `ci`: Changes to our CI configuration files and scripts (examples: Travis, Circle, BrowserStack, SauceLabs).
*   `chore`: Other changes that don't modify source code or test files.
*   `revert`: Reverts a previous commit.

**Examples:**

*   `feat: add endpoint for tower data`
*   `fix(cards): correct card elixir retrieval bug`
*   `docs: update contribution section`
*   `refactor(data): optimize card data structure`

## ✍️ Code Style

*   **Simplicity and Readability**: Write clear, concise, and easy-to-understand code.
*   **Descriptive Names**: Use meaningful and consistent naming conventions for data fields and file names.
*   **Consistency**: Ensure data formats (e.g., JSON structure, field types) are consistent across all data files.
*   **Accuracy**: Verify the correctness of all data added or modified.

## 🐛 Bug Reports and Suggestions

If you find a bug or have an idea for a new feature, please open an [Issue](https://github.com/ClashStrategic/stats/issues) in the repository. Describe the problem or suggestion with as much detail as possible.

## ⬆️ Submitting Pull Requests (PRs)

1.  Ensure your branch is up-to-date with the `main` branch of the original repository.
    ```bash
    git pull origin main
    ```
2.  Commit your changes using [semantic commits](#-semantic-commits).
    ```bash
    git add .
    git commit -m "feat: add new feature X"
    ```
3.  Push your branch to your fork.
    ```bash
    git push origin feature/your-feature-name
    ```
4.  Open a Pull Request from your branch in your fork to the `main` branch of the original repository.
5.  Clearly describe the changes made and why they are necessary.

Thank you again for your contribution!
