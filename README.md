# Ollama Web Manager

A modern web interface to manage your [Ollama](https://ollama.com/) instance. This tool provides a clean, intuitive dashboard for managing your locally running Ollama server.

## Features

- **Dashboard**: View real-time system resources (CPU, RAM, GPU usage), monitor hardware performance, and get an overview of your Ollama instance
- **Model Management**: Pull models from the Ollama library, delete models, and see model details
- **Model Deployment**: Configure and deploy models with custom parameters (context size, temperature, system prompts)
- **Settings**: Configure the application to your needs including Ollama server location and system monitoring server

## Prerequisites

- Node.js (v18+)
- npm or yarn
- A running Ollama instance (typically on http://localhost:11434)

## Installation and Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/ollama-web-manager.git
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
3. **UI Settings**: Dark mode, auto-refresh options, and refresh intervals

## Technologies Used

Frontend:
- React 19
- TypeScript
- Material UI
- Chart.js
- Vite

Backend (Monitoring Server):
- Node.js
- Express
- systeminformation (for hardware metrics)
- TypeScript

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgements

- [Ollama](https://ollama.com/) - For the amazing tool that makes running LLMs locally possible
- All contributors and the open-source community

---

This project is not officially affiliated with Ollama.
