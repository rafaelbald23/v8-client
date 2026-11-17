# v8-client

Frontend da plataforma V8 Exclusive — Vite + React.

## Stack
- Vite 6 + React 18
- React Router v6
- ESLint (eslint:recommended + react hooks)

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```
VITE_API_URL=http://localhost:3000
```

## Rodando local

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. O proxy `/api → localhost:3000` já está configurado no `vite.config.js`.

## Branches
- `main` → produção (deploy automático Railway)
- `develop` → integração (CI lint + build)
- `feature/*` → PR para develop
