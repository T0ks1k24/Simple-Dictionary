# Lexicon

A personal vocabulary trainer for any language pair. Build your collection, then test yourself with a randomized quiz that mixes multiple-choice and spelling exercises.

## Stack

| Layer | Technology |
|---|---|
| Backend | Django 6 + Django REST Framework + SimpleJWT |
| Frontend | React 19 + vanilla CSS |
| Auth | JWT (access + refresh, auto-renewed) |
| Database | SQLite (dev) |
| Deployment | Docker Compose + Gunicorn + Nginx |

## Features

- **JWT authentication** — login, register, auto token refresh
- **Word collection** — add, edit, delete terms in any language pair
- **Live search** — filter your vocabulary in real time
- **Mastery tracking** — correct / incorrect answer counters per word
- **Quiz mode** — randomized multiple-choice and spelling exercises with hints
- **Dark / Light theme** — persisted to `localStorage`
- **Responsive** — works on desktop and mobile

## Project structure

```
Simple-Dictionary/
├── backend/               Django API
│   ├── core/              settings, urls, wsgi
│   ├── users/             custom User model, auth views
│   └── dictionary/        Word model, serializers, viewset
├── frontend/              React app
│   └── src/
│       ├── services/api.js  API client with auto token refresh
│       ├── App.js
│       └── components/
│           ├── Auth.js
│           ├── WordList.js
│           ├── WordForm.js
│           └── Game.js
├── nginx/
│   ├── nginx.conf         reverse proxy (HTTPS, gzip)
│   └── app.conf           SPA serving inside frontend container
├── docker-compose.yml     production
└── docker-compose.dev.yml development
```

## Running locally (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install uv
uv pip install -r pyproject.toml
python manage.py migrate
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000`. The API runs on `http://localhost:8000`.

## Running with Docker

### Development (hot reload)

```bash
cp .env.dev .env.dev          # already present, edit if needed
docker compose -f docker-compose.dev.yml up
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

### Production

1. **Copy and fill in the environment file:**

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-long-random-secret
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

2. **Add TLS certificates:**

```
nginx/certs/fullchain.pem
nginx/certs/privkey.pem
```

> Use [Let's Encrypt / Certbot](https://certbot.eff.org/) to get free certificates.

3. **Set your domain in `nginx/nginx.conf`:**

```nginx
server_name yourdomain.com;
```

4. **Build and start:**

```bash
docker compose up -d --build
```

The app will be available at `https://yourdomain.com`.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login/` | Obtain JWT tokens |
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/dictionary/words/` | List words (supports `?search=`) |
| POST | `/api/dictionary/words/` | Create word |
| PATCH | `/api/dictionary/words/:id/` | Update word |
| DELETE | `/api/dictionary/words/:id/` | Delete word |
| GET | `/api/dictionary/words/play/?count=N` | Random sample for quiz |

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | dev key | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | _(all)_ | Comma-separated allowed CORS origins |

## License

MIT
