# HR Assistant Dashboard

A modern HR management dashboard built with React, TypeScript, and Express.

## Features

- Modern UI built with Radix UI components and Tailwind CSS
- Real-time communication using WebSocket
- Secure authentication with Passport.js
- File upload capabilities
- Database management with Drizzle ORM
- Responsive design

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Radix UI
  - React Hook Form
  - Recharts

- **Backend**
  - Node.js + Express
  - TypeScript
  - Drizzle ORM
  - PostgreSQL (Neon Database)
  - WebSocket
  - Multer (File Upload)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (Neon Database)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lukexuanliu/HrAssistantDashboard.git
```

2. Install dependencies:
```bash
cd HrAssistantDashboard
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_session_secret
```

4. Set up the database:
```bash
# Run database migrations
npm run db:push
```

5. Start the development server:
```bash
# Start the backend server
npm run dev

# In a new terminal, start the frontend
npm run dev
```

## Project Structure

```
hr-assistant-dashboard/
├── client/              # Frontend React application
├── server/              # Backend Express server
├── shared/              # Shared types and utilities
├── python_server/       # Python server components
├── uploads/             # File uploads directory
├── drizzle.config.ts    # Database configuration
└── package.json         # Project dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database migrations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Radix UI for accessible components
- Drizzle ORM for type-safe database operations
- Tailwind CSS for styling
