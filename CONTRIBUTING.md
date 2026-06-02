# Contributing Guide for Clash Strategic Stats API 🤝

Thank you for your interest in contributing to this project! Your help is highly valuable for expanding and improving the Clash Royale API. Please follow these guidelines to make your contribution as smooth as possible.

## 🚀 Getting Started

1.  **Fork the Repository**: Create a copy of the repository in your GitHub account.
2.  **Clone Your Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/stats.git
    cd stats
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Create a New Branch**: Always work on a separate branch for your changes.
    ```bash
    git checkout -b feature/your-feature-name
    # or fix/your-bug-fix
    ```
5.  **Make Your Changes**: Implement features, fix bugs, or add data.
6.  **Verify Your Changes**: Ensure your modifications pass all checks:
    ```bash
    npm test
    npm run lint
    npm run typecheck
    ```

## 📝 Semantic Commits

To maintain a clear and organized commit history, we use [Semantic Commits](https://www.conventionalcommits.org/en/v1.0.0/). This helps us to automatically generate the `CHANGELOG.md` and quickly understand the purpose of each change.

The general format is: `<type>(optional scope): <description>`

**Common Types:**

*   `feat`: A new feature (e.g., adding evolution data).
*   `fix`: A bug fix (e.g., correcting elixir cost).
*   `docs`: Documentation only changes.
*   `test`: Adding missing tests or correcting existing tests.
*   `build`: Changes that affect the build system or external dependencies.
*   `chore`: Other changes that don't modify source code or test files.

**Project Scopes:**

*   `data`: Changes in `data/cards.json` or data structures.
*   `scripts`: Changes in the `scripts/` directory.
*   `hero`: Specific changes related to Hero cards.
*   `evolution`: Specific changes related to Card Evolutions.
*   `validation`: Changes related to schema validation or AJV.

**Examples:**

*   `feat(evolution): add Princess evolution stats`
*   `fix(data): correct Elixir Golem HP values`
*   `test(validation): add tests for new card schema fields`
*   `build(scripts): enhance card update automation`

## ✍️ Code Style

*   **TypeScript**: We use TypeScript for all logic. Ensure proper typing.
*   **JSON structure**: Data in `data/cards.json` must follow the defined schema in `src/schema.ts`.
*   **Simplicity and Readability**: Write clear, concise, and easy-to-understand code.
*   **Accuracy**: Verify the correctness of all data added or modified against official Clash Royale stats.

## 🐛 Bug Reports and Suggestions

If you find a bug or have an idea for a new feature, please open an [Issue](https://github.com/ClashStrategic/stats/issues) in the repository. Describe the problem or suggestion with as much detail as possible.

## ⬆️ Submitting Pull Requests (PRs)

1.  Ensure your branch is up-to-date with the `develop` branch of the original repository.
    ```bash
    git pull origin develop
    ```
2.  Commit your changes using [semantic commits](#-semantic-commits).
3.  Push your branch to your fork.
    ```bash
    git push origin feature/your-feature-name
    ```
4.  Open a Pull Request from your branch in your fork to the `develop` branch of the original repository.
5.  Clearly describe the changes made and why they are necessary.

Thank you again for your contribution!
