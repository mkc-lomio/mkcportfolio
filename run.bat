@echo off

REM Open browser after a short delay (gives servers time to start)
start "" cmd /c "timeout /t 3 /noq >nul && start http://localhost:3000"

REM Run Next.js (client folder)
start "" cmd /k "cd /d %~dp0client && npx next dev --webpack"

REM Run Express.js (server folder)
REM start "" cmd /k "cd /d %~dp0server && npm run start"