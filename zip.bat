@echo off

set "ROOT=%~dp0"
set "OUTPUT=%ROOT%mkc-portfolio.zip"
set "TEMP_DIR=%ROOT%_zip_temp"

REM Clean up any previous temp folder or zip
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
if exist "%OUTPUT%" del /q "%OUTPUT%"

echo Copying files...

REM Copy client folder (exclude .next, node_modules, next-env.d.ts)
robocopy "%ROOT%client" "%TEMP_DIR%\client" /e /xd ".next" "node_modules" /xf "next-env.d.ts" >nul

REM Copy server folder (exclude node_modules)
robocopy "%ROOT%server" "%TEMP_DIR%\server" /e /xd "node_modules" >nul

echo Creating zip...

REM Zip using PowerShell
powershell -NoProfile -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%OUTPUT%' -Force"

REM Clean up temp folder
rmdir /s /q "%TEMP_DIR%"

echo.
echo Done! Created: %OUTPUT%
pause
