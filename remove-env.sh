#!/bin/bash
# Script to remove .env files from git history
rm -f client/.env.local
rm -f client/.env
rm -f client/.env.development
rm -f .env
rm -f python-server/.env
rm -f python-server/.env.local
rm -f server/.env
rm -f vnstock-api/.env
rm -f .env.docker
