# PAUMiOT UI

A modern Next.js-based user interface for IoT middleware management and device control.

## 🌟 Features

- **Dashboard Overview** - Monitor connected devices, protocols, and server health
- **Device Management** - Registry, inspection, and control of IoT devices
- **Activity Logs** - Real-time log streaming with filtering and statistics
- **Settings** - Server configuration, security, and integrations
- **Glass-morphism Design** - Modern dark theme with lime and cyan accents
- **Responsive Layout** - Works seamlessly across desktop and mobile devices
- **Real-time Updates** - Connection status monitoring and live data streaming
- **API Integration** - RESTful API client for PAUMiOT middleware server

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/MinhajShafin/PAUMiOT.git
cd PAUMiOT/paum-UI
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` to set your PAUMiOT API server URL (default: `http://localhost:8081`).

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
paum-UI/
├── src/
│   ├── app/
│   │   ├── devices/page.tsx      # Device management page
│   │   ├── logs/page.tsx         # Activity logs page
│   │   ├── settings/page.tsx     # Settings page
│   │   ├── page.tsx              # Dashboard (home)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── favicon.ico           # Favicon
│   └── components/
│       ├── Sidebar.tsx           # Navigation sidebar
│       ├── MainLayout.tsx        # Main page layout
│       ├── ConnectionStatus.tsx  # Server connection indicator
│       └── providers/            # React context providers
├── .env.example                  # Environment variables template
└── package.json
```

## 🎨 Design System

- **Primary Color**: Lime (#d4ff00)
- **Secondary Color**: Cyan (#00e5ff)
- **Accent Color**: Mint (#64e2b7)
- **Background**: Deep navy-black (#071014)
- **Typography**: Inter font family
- **Theme**: Glass-morphism with backdrop blur effects
- **Styling**: Tailwind CSS 4 with custom design tokens

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Pages

### Dashboard (`/`)

- Connected devices overview
- Protocol actions panel
- Server status metrics
- Activity log stream

### Devices (`/devices`)

- Device registry with status
- Device details and controls
- Recent device activity

### Logs (`/logs`)

- Live log streaming
- Log level filtering
- Export and search functionality
- Statistics overview

### Settings (`/settings`)

- Server configuration
- Security settings
- Integration management
- Advanced YAML config

## 🔌 API Integration

The UI connects to the PAUMiOT REST API server. Configure the API endpoint in `.env.local`:

```bash
NEXT_PUBLIC_PAUMIOT_API_URL=http://localhost:8081
```

The default PAUMiOT server runs on port 8081. Ensure the middleware server is running before starting the UI.

## 🛠 Technology Stack

- **Framework**: Next.js 15.5 with App Router & Turbopack
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Custom CSS Variables
- **React**: React 19.1
- **UI Pattern**: Glass-morphism design
- **Routing**: Next.js file-based routing
- **Build Tool**: Turbopack (Next.js bundler)

## 🚧 Development Status

This UI is designed to connect with the PAUMiOT REST API server for IoT middleware management.

**Current State**: ✅ Frontend Complete | 🔄 Backend Integration In Progress
**Features**: 
- ✅ Dashboard, Devices, Logs, and Settings pages
- ✅ Glass-morphism design system
- ✅ Responsive layout
- 🔄 Real-time API integration
- 🔄 WebSocket support for live updates
- 📋 Authentication & authorization (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the PAUMiOT middleware system.
