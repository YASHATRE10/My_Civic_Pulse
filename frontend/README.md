# CivicPulse Frontend

React + Vite frontend for the CivicPulse Smart City Grievance and Feedback platform.

## Stack

- React (Vite)
- Tailwind CSS
- ShadCN-style component primitives
- Framer Motion
- Recharts
- SockJS + STOMP (realtime)
- i18next (English/Hindi)

## Folder Layout

- `src/components`: reusable UI and app components
- `src/pages`: route-level pages
- `src/services`: API and websocket clients
- `src/context`: global context providers
- `src/hooks`: custom hooks
- `src/utils`: helper utilities

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run preview` - preview production build

## Local Run

1. Start backend on port `9090`.
2. Run frontend:
	- `npm install`
	- `npm run dev`
3. Open `http://localhost:5173`

## Environment

Optional map integration key:

- `VITE_GOOGLE_MAPS_API_KEY=your_key_here`
