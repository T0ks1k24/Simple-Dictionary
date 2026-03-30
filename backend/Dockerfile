# =============================================================
# Backend Dockerfile  (Python 3.12, uv, Gunicorn)
# =============================================================
FROM python:3.12-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:/root/.local/bin:$PATH"

WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Create venv and install deps (no dev extras)
RUN uv venv .venv && \
    uv pip install --system -r pyproject.toml && \
    uv pip install --system gunicorn

# Copy app source
COPY . .

# Static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "60"]
