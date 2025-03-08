# Ollama Web Manager

A modern web interface to manage your [Ollama](https://ollama.com/) instance. This tool provides a clean, intuitive dashboard for managing your locally running Ollama server.

## Features

- **Dashboard**: View system resources, monitor CPU/RAM usage, and get an overview of your Ollama instance
- **Model Management**: Pull models from the Ollama library, delete models, and see model details
- **Model Deployment**: Configure and deploy models with custom parameters (context size, temperature, system prompts)
- **Settings**: Configure the application to your needs

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

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Navigate to `http://localhost:5173` to view the application.

## Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory and can be served using any static file server.

## Usage

1. Make sure your Ollama instance is running (typically on port 11434)
2. Open the Ollama Web Manager in your browser
3. The dashboard will automatically connect to your local Ollama instance
4. Use the sidebar navigation to switch between different features

## Configuration

You can configure the Ollama server URL in the Settings page if your Ollama instance is running on a different host or port.

## Technologies Used

- React 19
- TypeScript
- Material UI
- Chart.js
- Vite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgements

- [Ollama](https://ollama.com/) - For the amazing tool that makes running LLMs locally possible
- All contributors and the open-source community

---

This project is not officially affiliated with Ollama.
