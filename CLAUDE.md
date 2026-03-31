# CLAUDE.md

This file provides context and conventions for AI assistants (Claude Code and similar tools) working in this repository.

## Repository Overview

**Name:** family
**Status:** Early-stage / greenfield project
**Branch model:** Feature branches off `master`

The repository currently contains only a `README.md` placeholder. No source code, dependencies, tests, or CI configuration have been added yet.

## Current Structure

```
family/
├── README.md      # Project title placeholder
└── CLAUDE.md      # This file
```

## Development Branch

Active development should occur on dedicated feature branches. The current working branch is `claude/add-claude-documentation-ITRKr`. Push all changes with:

```bash
git push -u origin <branch-name>
```

Never push directly to `master` without explicit permission.

## Git Conventions

- Write clear, imperative commit messages (e.g., `Add user authentication`, not `added auth stuff`)
- One logical change per commit
- Always stage specific files rather than `git add -A` to avoid accidentally committing secrets or build artifacts
- Do not use `--no-verify` to skip hooks unless explicitly instructed

## Code Conventions (to be established)

Since the project has no source code yet, conventions will be defined as the tech stack is chosen. When adding the first code:

1. **Language/framework:** Document the choice in README.md and update this file
2. **Linting:** Add a linter config (`.eslintrc`, `.flake8`, `rustfmt.toml`, etc.) before writing substantive code
3. **Formatting:** Add a formatter config and run it consistently
4. **Dependency management:** Commit lock files (`package-lock.json`, `poetry.lock`, `Cargo.lock`, etc.)
5. **Environment variables:** Never commit secrets; use `.env.example` to document required env vars

## Testing

No test suite exists yet. When adding tests:

- Place tests adjacent to source files or in a `tests/` directory (document the choice here)
- Aim for tests to be runnable with a single command (e.g., `npm test`, `pytest`, `cargo test`)
- CI should run tests automatically on every push

## CI/CD

No CI configuration exists yet. When adding CI (GitHub Actions recommended):

- Workflows live in `.github/workflows/`
- At minimum, run linting and tests on every PR

## Security

- Never commit `.env` files, credentials, API keys, or private keys
- Add a `.gitignore` before any real development to exclude secrets and build artifacts
- Validate all user input at system boundaries

## For AI Assistants

- This repo is in a pre-development state — propose a tech stack and structure before writing code if none has been decided
- Prefer editing existing files over creating new ones
- Do not add speculative abstractions, unused utilities, or future-proofing code
- Keep changes minimal and focused on what was explicitly requested
- Always read a file before editing it
- Do not push to `master` directly; use feature branches
