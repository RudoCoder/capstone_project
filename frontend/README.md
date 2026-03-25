# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



This is the frontend part of threat_intel


```
frontend/
│
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│
│   ├── api/
│   │   ├── axios.js          # Axios instance (JWT attached)
│   │   └── socket.js         # WebSocket connection
│
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── UploadForm.jsx
│   │   ├── AnalysisCard.jsx
│   │   ├── IOCList.jsx
│   │   ├── YaraMatches.jsx
│   │   ├── CVEList.jsx
│   │   ├── RiskIndicator.jsx
│   │   ├── TutorialCard.jsx
│   │   └── RiskChart.jsx     # Recharts visualization
│
│   ├── pages/
│   │   ├── Dashboard.jsx     # Includes chart + WebSocket updates
│   │   ├── UploadPage.jsx
│   │   ├── AnalysisPage.jsx  # Full intelligence view
│   │   └── TutorialsPage.jsx
│
│   ├── context/
│   │   └── AuthContext.jsx   # JWT auth state management
│
│   ├── routes.jsx            # Application routing
│   ├── App.jsx               # Layout (Navbar + Sidebar + Routes)
│   └── main.jsx              # Entry point (ReactDOM + Context)
│
├── package.json
├── vite.config.js            # (recommended for Vite setup)
└── README.md
```
