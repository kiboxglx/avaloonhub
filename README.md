# Avaloon Hub

Avaloon Hub is a high-end media production management SaaS built with React, Tailwind CSS, and Framer Motion.

## Features

- **Role-Based Access Control (RBAC)**: secure login and role selection for Admin, Videomaker, and Traffic Manager.
- **Dynamic Dashboard**: Responsive layout with collapsible sidebar and smooth transitions.
- **Production Calendar**: Interactive shoot schedule with "Smart Hover" details.
- **Team Directory**: Masonry layout with real-time filtering.
- **Analytics**: Beautiful charts and KPI reports with custom styling.

## Getting Started

### Prerequisites

Ensure you have Node.js installed.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components/ui`: Reusable atomic components
- `src/layouts`: Dashboard and page layouts
- `src/pages`: Individual application screens
- `src/context`: Authentication and global state
- `src/services`: Mock API services (ready for Supabase integration)

## Technologies

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (Custom "Avaloon" Theme)
- **Animations**: Framer Motion
- **Visualization**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
