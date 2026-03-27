# CivicPulse Project Structure

This repository is organized as a full-stack application:

## Root

- `build.gradle` / `settings.gradle`: Spring Boot + Gradle build setup
- `src/main/java/com/civic/smartcity`: backend Java code
- `src/main/resources`: backend config and static resources
- `frontend`: React + Vite client app

## Backend (`src/main/java/com/civic/smartcity`)

- `config/`: security + websocket configuration
- `controller/`: REST controllers (`/api/auth`, `/api/grievances`, `/api/feedback`)
- `dto/`: API request/response payloads
- `model/`: JPA entities (`User`, `Grievance`, `Feedback`)
- `repository/`: Spring Data repositories
- `security/`: JWT filter and utility
- `service/`: business logic (auth, grievance lifecycle, analytics, feedback)
- `SmartcityApplication.java`: application entrypoint
- `HomeController.java`: root redirects to frontend routes

## Frontend (`frontend/src`)

- `components/`: reusable UI and feature components
  - `ui/`: ShadCN-style primitives (`button`, `card`, `input`, etc.)
  - `layout/`: app shell and protected route wrappers
  - `maps/`: Google map picker component
  - `charts/`: analytics charts with Recharts
- `context/`: app contexts (`AuthContext`)
- `hooks/`: custom hooks (`useSpeechToText`)
- `pages/`: routed pages
  - `AuthPage`
  - `DashboardPage`
  - `CitizenSubmitPage`
  - `CitizenComplaintsPage`
  - `AdminPage`
  - `OfficerPage`
  - `AnalyticsPage`
- `services/`: API and realtime websocket clients
- `utils/`: helper utilities (`cn`, i18n config)
- `App.jsx`: route declarations
- `main.jsx`: app bootstrap
- `index.css`: Tailwind and theme tokens

## Generated Folders (Safe to Delete)

These are recreated automatically when you build/run:

- `.gradle/`
- `build/`
- `frontend/node_modules/`
- `frontend/dist/`

## Run Commands

- Backend: `gradlew.bat bootRun`
- Frontend: `npm run dev --prefix frontend`
- Frontend build: `npm run build --prefix frontend`
- Backend build: `gradlew.bat build -x test`
