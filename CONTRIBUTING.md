# Contributing to Ollama Web Manager

Thanks for your interest in contributing.

## Development Setup

1. Fork and clone the repository.
2. Install frontend dependencies:
```bash
npm ci
```
3. Install backend dependencies:
```bash
cd server
npm ci
cd ..
```
4. Start the app locally:
```bash
npm run dev
```

## Project Structure

- `src/`: React frontend.
- `server/src/`: Monitoring backend service.
- `.github/`: CI workflows and contribution templates.

## Quality Checks

Before opening a PR, run:

```bash
npm run lint
npm run build
cd server && npm run build
```

## Pull Requests

- Keep PRs focused on one logical change.
- Update docs when behavior or setup changes.
- Include screenshots for UI changes when helpful.
- Link related issues in the PR description.

## Code Style

- TypeScript-first changes.
- Prefer clear, small functions and readable naming.
- Avoid unrelated refactors in feature/bugfix PRs.

## Reporting Issues

Use the issue templates in GitHub to report bugs or request features.
