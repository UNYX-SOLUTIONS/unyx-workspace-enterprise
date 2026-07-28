#!/usr/bin/env sh
set -eu
docker compose pull
docker compose up -d --build
docker image prune -f
