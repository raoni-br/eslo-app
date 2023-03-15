#!/bin/sh
echo "[1/3] Check DB migrations"
npm run status-db

echo "[2/3] Reset demo DB"
npm run reset-db

# echo "[2/3] Deploy DB migrations"
# npm run deploy-db:prod

echo "[3/3] Starting Backend Server"
npm run serve:prod
