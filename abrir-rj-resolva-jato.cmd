@echo off
cd /d "%~dp0"
npm run build
start "RJ Resolva Jato" node server.mjs
start http://localhost:5173
