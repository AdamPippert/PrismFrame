# Modern eDEX-UI

A modern, cross-platform terminal emulator with sci-fi interface inspired by the original eDEX-UI project. Built with Tauri, React, and TypeScript for better performance and maintainability.

## 🚀 Features

- **Modern Tech Stack**: Tauri + React + TypeScript + Rust
- **Sci-Fi Interface**: Futuristic design with customizable themes
- **Real-time Monitoring**: CPU, memory, network, and disk monitoring
- **Multiple Themes**: Switch between SysAdmin, Developer, and Tron themes
- **Hotkey System**: Efficient navigation and theme switching
- **Cross-Platform**: Windows, macOS, and Linux support
- **Extensible**: Plugin system for custom extensions

## 📁 Project Structure

```
modern-edex/
├── src/                          # React frontend source
│   ├── components/               # Reusable UI components
│   ├── contexts/                 # React contexts (theme, etc.)
│   ├── hooks/                    # Custom React hooks
│   ├── styles/                   # CSS and styling files
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── src-tauri/                    # Tauri backend (Rust)
│   ├── src/
│   │   ├── commands/            # Tauri command handlers
│   │   └── main.rs              # Main Rust application
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── specs/                       # Product Requirements Documents
│   ├── core-architecture.prd.md
│   ├── theme-system.prd.md
│   ├── terminal-system.prd.md
│   ├── system-monitoring.prd.md
│   ├── ui-framework.prd.md
│   ├── hotkey-system.prd.md
│   ├── plugin-system.prd.md
│   └── project-tasks.ots.json   # Open Task Schema tracking
├── public/                      # Static assets
│   ├── themes/                  # Theme configuration files
│   └── icons/                   # Application icons
├── docs/                        # Documentation
└── tests/                       # Test files
```

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (latest stable)
- **Tauri CLI**: `cargo install tauri-cli`

## 🚀 Getting Started

### 1. Clone and Setup

```bash
git clone <repository-url>
cd modern-edex
npm install
```

### 2. Development Mode

```bash
npm run tauri:dev
```

This will:
- Start the Vite development server
- Launch the Tauri application
- Enable hot reloading for both frontend and backend

### 3. Production Build

```bash
npm run tauri:build
```

This creates optimized binaries for your target platform.

## 🎨 Themes

### Built-in Themes

1. **Tron** (Default)
   - Classic sci-fi aesthetics
   - Glowing effects and scanlines
   - Cyan/blue color scheme

2. **SysAdmin**
   - System monitoring focus
   - Green terminal colors
   - Performance metrics dashboard

3. **Developer**
   - Code development optimized
   - Syntax highlighting themes
   - Project navigation tools

### Theme Switching

- **Hotkey**: `Ctrl+Shift+T` to cycle through themes
- **UI**: Use the theme selector in the header
- **Custom**: Place JSON files in `public/themes/`

## ⌨️ Hotkeys

| Hotkey | Action |
|--------|--------|
| `Ctrl+Shift+T` | Switch themes |
| `Ctrl+Shift+F` | Toggle fullscreen |
| `Ctrl+Tab` | Next terminal tab |
| `Ctrl+Shift+Tab` | Previous terminal tab |
| `Ctrl+Shift+N` | New terminal tab |
| `Ctrl+Shift+W` | Close current tab |

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **State Management**: Zustand for global state
- **Styling**: Styled-components with CSS-in-JS
- **Charts**: Chart.js for data visualization
- **Terminal**: xterm.js with WebGL acceleration

### Backend (Tauri + Rust)
- **System Monitoring**: `systeminformation` crate
- **Terminal PTY**: Native PTY support
- **IPC**: Type-safe communication between Rust and JavaScript
- **Security**: Sandboxed execution environment

### Communication Flow
```
User Input → React Component → Tauri Command → Rust Handler → System Call → Response → UI Update
```

## 📋 Development Workflow

### Task Management
All tasks are tracked using the Open Task Schema (OTS) in `specs/project-tasks.ots.json`. The schema provides:

- Hierarchical task organization
- Dependency management
- Priority assignment
- Progress tracking
- Agent assignment

### Priority Levels
- **P0**: Critical - Blocks all other work
- **P1**: High - Core functionality
- **P2**: Medium - Important features
- **P3**: Low - Nice-to-have features
- **P4**: Future - Not in current scope

### Current Status
- ✅ Project structure created
- ✅ Core architecture foundation laid
- 🔄 Theme system in development
- ⏳ Terminal system pending
- ⏳ System monitoring pending

## 🤝 Contributing

1. Check the `specs/project-tasks.ots.json` for available tasks
2. Pick a task based on your skills and priority level
3. Create a feature branch: `git checkout -b feature/your-task-id`
4. Implement your changes following the PRDs in `specs/`
5. Submit a pull request with detailed description

### Development Guidelines

- Follow TypeScript strict mode
- Use functional components with hooks
- Implement proper error handling
- Add unit tests for new features
- Update documentation as needed

## 📚 Documentation

- **User Guide**: `docs/user-guide.md`
- **Developer Guide**: `docs/developer-guide.md`
- **API Reference**: `docs/api-reference.md`
- **Architecture**: `docs/architecture.md`

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## 📄 License

GPL-3.0 License - see LICENSE file for details

## 🙏 Acknowledgments

- Original eDEX-UI project by [GitSquared](https://github.com/GitSquared/edex-ui)
- [Tauri](https://tauri.app/) for the modern desktop framework
- [xterm.js](https://xtermjs.org/) for terminal functionality
- [Chart.js](https://www.chartjs.org/) for data visualization

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/user/modern-edex-ui/issues)
- **Discussions**: [GitHub Discussions](https://github.com/user/modern-edex-ui/discussions)
- **Documentation**: [Wiki](https://github.com/user/modern-edex-ui/wiki)

---

**Modern eDEX-UI** - Bringing sci-fi terminals to the modern era 🚀