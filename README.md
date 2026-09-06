# Ollama Web Manager

[![CI](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/ci.yml)
[![Dependency Review](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/dependency-review.yml)
[![CodeQL](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/codeql.yml/badge.svg)](https://github.com/rennerdo30/ollama-web-manager/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern web interface to manage your [Ollama](https://ollama.com/) instance. This tool provides a clean, intuitive dashboard for managing your locally running Ollama server.

## Features

- **Dashboard**: View real-time system resources (CPU, RAM, GPU, VRAM), monitor hardware performance, and get an overview of your Ollama instance
- **Model Management**: Pull models, inspect model details (Modelfile, parameters), and bulk delete models
- **Model Creation**: Create custom model variants with specific system prompts and parameters, with a live Modelfile preview
- **Advanced Chat**: Interact with models using a clean interface with active model switching and Markdown support
- **Model Deployment**: Configure and deploy models with custom parameters (context size, temperature) with real-time state tracking
- **Settings**: Configure server connections and UI preferences
- **Light, dark and system themes**: The theme follows your operating system by default and can be pinned to light or dark; the chosen theme is applied before the first paint, so there is no flash on reload
- **Keyboard and screen-reader friendly**: Visible focus rings, a skip-to-content link, labelled controls, and animations that respect `prefers-reduced-motion`

## Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm
- A running Ollama instance (typically on http://localhost:11434)

## Installation and Setup

1. Clone this repository:
```bash
git clone https://github.com/rennerdo30/ollama-web-manager.git
cd ollama-web-manager
```

2. Install dependencies for both the frontend and monitoring server:
```bash
# Install frontend dependencies
npm install

# Install monitoring server dependencies
cd server
npm install
cd ..
```

3. Start the development server (runs both frontend and monitoring backend):
```bash
npm run dev
```

4. Navigate to `http://localhost:5173` to view the application.

> **Note**: The monitoring server provides real-time system information (CPU, memory, GPU). Without it, the dashboard will show "Monitoring server offline" for system metrics.

## Build for Production

To create a production build:

```bash
# Build the frontend
npm run build

# Build the monitoring server
cd server
npm run build
cd ..
```

The frontend built files will be in the `dist` directory and can be served using any static file server.

To run the production version:

```bash
# Start the monitoring server
cd server
npm start
cd ..

# Serve the frontend files (example using a simple HTTP server)
cd dist
npx serve
```

> **Note**: For a production deployment, you may want to use tools like PM2 to manage the monitoring server process.

## Docker Deployment (Recommended)

You can easily deploy the entire stack using Docker Compose.

1.  Make sure you have Docker and Docker Compose installed.
2.  Run the following command:
    ```bash
    docker-compose up -d --build
    ```
3.  Access the application at `http://localhost:8080`.

**Note on Ollama Connection**:
Since the application runs inside a container, `localhost` refers to the container itself. To connect to your Ollama instance running on the host machine:
-   **Mac/Windows**: Use `http://host.docker.internal:11434` as the Ollama URL in Settings.
-   **Linux**: Use `http://172.17.0.1:11434` (or your host IP).

**Note on System Stats**:
The "System Health" stats (CPU, RAM) displayed in the dashboard will reflect the *Docker container's* resources, not the host machine's entire system stats. This is a known limitation of running in a container without privileged access.

## Usage

1. Make sure your Ollama instance is running (typically on port 11434)
2. Start the monitoring server for real system metrics:
   ```bash
   cd server
   npm run dev
   ```
3. Open the Ollama Web Manager in your browser
4. The dashboard will automatically connect to your local Ollama instance
5. The system metrics (CPU, memory, GPU) will be displayed with real data from your system
6. Use the sidebar navigation to switch between different features

## Configuration

In the Settings page, you can configure:

1. **Ollama Server URL**: If your Ollama instance is running on a different host or port (default: http://localhost:11434)
2. **System Monitoring Server URL**: If your monitoring server is running on a different host or port (default: http://localhost:3001)
3. **Appearance**: Light, dark, or follow the operating system
4. **Dashboard**: Auto-refresh on/off and the refresh interval in seconds

All of these are stored in the browser's `localStorage`, so they are per browser and
per machine. There is no server-side configuration and no environment variables to set.

## Technologies Used

Frontend:
- React 19
- TypeScript
- Material UI v9 (with Emotion)
- Chart.js via react-chartjs-2
- react-router-dom
- Vite

Backend (Monitoring Server):
- Node.js
- Express
- systeminformation (for hardware metrics)
- TypeScript

## Project Structure

```
src/
  api/          Axios/fetch wrappers around the Ollama HTTP API
  components/   Reusable UI: layout, model cards, dialogs, loading/empty/error states
  constants/    App defaults, localStorage keys and other named constants
  context/      Theme preference context
  hooks/        Small shared hooks
  pages/        One component per route
  theme/        Design tokens and the Material UI theme factory
  utils/        Locale-aware number, byte and date formatting
server/         Express monitoring service that reports CPU, memory and GPU usage
```

Styling goes through the Material UI theme in `src/theme`. Add new colours, radii,
spacing or motion values as tokens in `src/theme/tokens.ts` rather than inline literals.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and PR expectations.

## Project Governance

- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](SECURITY.md)
- Pull Request template: [`.github/pull_request_template.md`](.github/pull_request_template.md)
- Issue templates: [`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE)

## License

MIT

## Acknowledgements

- [Ollama](https://ollama.com/) - For the amazing tool that makes running LLMs locally possible
- All contributors and the open-source community

---

This project is not officially affiliated with Ollama.
