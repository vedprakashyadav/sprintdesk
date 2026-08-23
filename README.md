# SprintDesk — Frontend Engineer Assignment
 
SprintDesk is a sprint management dashboard developed as part of a Frontend Engineer assignment. The application brings together user authentication with protected routes, an interactive drag-and-drop Kanban board, task creation, editing, commenting, and deletion, sprint analytics with data visualization, simulated real-time notifications, light and dark theme support, and persistent client-side state.
 
---
 
## Prerequisites
 
Before running the application, ensure that Node.js 18+ (LTS version recommended) and npm 9+ are installed on your system. You can confirm the installed versions with the following commands:
 
```bash
node -v
npm -v
```
 
---
 
## Getting Started
 
### Step 1: Navigate to the Project
 
```bash
cd sprintdesk
```
 
### Step 2: Install Dependencies
 
```bash
npm install
```
 
### Step 3: Configure Environment Variables
 
Create a local `.env` file from the provided `.env.example`. On Windows PowerShell, run:
 
```powershell
Copy-Item .env.example .env
```
 
On Linux or macOS, run:
 
```bash
cp .env.example .env
```
 
The provided environment configuration uses public sandbox endpoints, so no private API keys are required.
 
### Step 4: Start the Development Server
 
```bash
npm run dev
```
 
Then open the application at `http://localhost:5173`.
 
---
 
## Demo Login Credentials
 
The application uses DummyJSON for authentication. Sign in using the username `emilys` and the password `emilyspass`.
 
---
 
## Features
 
### Authentication
 
Users can log in with the provided demo credentials, and their session persists across page refreshes. The application enforces protected routes for authenticated users, handles public-only routes appropriately, and supports a straightforward logout flow.
 
### Kanban Board
 
Available at `/board`, the Kanban board allows users to drag and drop tasks between columns and reorder tasks within the same column. Users can create new tasks, view and edit task details, add comments, and delete tasks as needed, with all board changes persisted locally.
 
### Sprint Analytics
 
Available at `/analytics`, this section presents sprint velocity, task status distribution, priority breakdown, and completion trends. Analytics update dynamically based on the current state of the board.
 
### Notifications
 
The notification system uses periodic polling to simulate real-time activity. It displays an unread notification count, allows notifications to be opened in a drawer, and supports marking individual notifications or all notifications as read. Toast notifications appear for new activity, and polling pauses automatically when the browser tab is hidden.
 
### Theme
 
The application supports both light and dark themes, with the selected theme persisted across page reloads.
 
---
 
## Tech Stack
 
The application is built with React 18 and TypeScript, using Vite as the build tool. State and server-state management are handled through TanStack Query v5 and Zustand, while styling is implemented with Tailwind CSS. Routing is managed with React Router, and drag-and-drop interactions are powered by `@dnd-kit/core` and `@dnd-kit/sortable`. Data visualization is handled by Recharts, and HTTP requests are made using Axios. The test suite is built with Vitest and React Testing Library.
 
---
 
## Project Structure
 
The project follows a feature-based structure to maintain separation of concerns, reusability, and scalability:
 
```text
src/
├── api/                  # Data-source abstraction
├── app/                  # Application shell and router configuration
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Header, sidebar and application layout
│   └── feedback/         # Toast notification components
├── data/                 # Mock data
├── features/
│   ├── auth/             # Authentication
│   ├── board/             # Kanban board and task management
│   ├── analytics/         # Analytics and chart components
│   └── notifications/     # Notification polling and UI
├── hooks/                # Shared custom hooks
├── lib/                  # HTTP clients and utilities
├── pages/                # Route-level pages
├── routes/               # Route guards
├── store/                # Global client-side state
├── types/                # Type definitions
└── tests/                # Test setup and utilities
```
 
Additional architecture documentation can be found in `ARCHITECTURE.md` and `API.md`.
 
---
 
## Data Sources & API Integration
 
The application draws on separate data sources depending on the requirement.
 
DummyJSON (`https://dummyjson.com`) is used for authentication, covering login, token refresh, retrieval of current user information, and handling of unauthorized requests.
 
JSONPlaceholder (`https://jsonplaceholder.typicode.com`) is used to simulate notification activity through periodic polling, which pauses automatically when the browser tab is hidden.
 
Local mock data, accessed through `src/api/mockDataSource.ts`, simulates network latency and handles local data for users, sprints, tasks, and comments.
 
---
 
## NPM Commands
 
| Command               | Description                        |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start the Vite development server   |
| `npm run build`        | Build the production bundle         |
| `npm run preview`      | Preview the production build        |
| `npm run test`         | Run the unit test suite             |
| `npm run test:watch`   | Run tests in watch mode             |
| `npm run lint`         | Run ESLint                          |
 
---
 
## Testing
 
Unit tests are implemented using Vitest and React Testing Library. Run the full test suite with:
 
```bash
npm run test
```
 
The main areas covered by the test suite include board state management, task reordering and movement, task creation and deletion, authentication HTTP client behavior, token refresh handling, and toast notification behavior.
 
---
 
## Performance & Security
 
The application implements route-level code splitting using `React.lazy()` and `Suspense`, along with memoized analytics calculations via `useMemo`. Access tokens are maintained in memory rather than persistent storage, and environment variables are excluded from version control. Notification polling pauses when the browser tab is hidden, and the codebase follows a feature-based architecture built around reusable UI components to reduce duplication and support long-term maintainability.
 
---
 
## Known Trade-offs & Future Improvements
 
The current implementation focuses on meeting the assignment requirements while keeping the codebase maintainable. Planned or potential future improvements include undo/redo support for Kanban board changes, date-range filtering for analytics, automated accessibility testing using `axe-core`, Storybook component documentation, integration with a production backend, and WebSocket-based real-time notifications.
 
---
 
## Assignment Notes
 
The application demonstrates practical frontend development skills across component-based React development, state and server-state management, API integration, drag-and-drop interactions, data visualization, authentication and route protection, performance optimization, unit testing, and maintainable frontend architecture.