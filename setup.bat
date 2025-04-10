@echo off
setlocal enabledelayedexpansion

REM Get the directory of the script (assumed to be inside the Git repo)
set "SCRIPT_DIR=%~dp0"
set "REPO_DIR=%SCRIPT_DIR:~0,-1%"
set "BIN_DIR=%REPO_DIR%\bin"

REM Check if the bin directory exists
if not exist "%BIN_DIR%" (
    echo Error: bin directory not found in repository.
    exit /b 1
)

REM Get the current user PATH
echo Checking if bin directory is already in PATH...
for /f "tokens=2* delims= " %%A in ('reg query HKCU\Environment /v Path 2^>nul') do set "CURRENT_PATH=%%B"

REM Check if bin directory is already in PATH
echo %CURRENT_PATH% | findstr /I /C:"%BIN_DIR%" >nul && (
    echo bin directory is already in PATH.
    exit /b 0
)

REM Append bin directory to PATH
set "NEW_PATH=%CURRENT_PATH%;%BIN_DIR%"
reg add HKCU\Environment /v Path /t REG_EXPAND_SZ /d "%NEW_PATH%" /f

echo bin directory added to PATH successfully.
echo You may need to restart your session for changes to take effect.
