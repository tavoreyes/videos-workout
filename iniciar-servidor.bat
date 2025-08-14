@echo off
cd /d %~dp0
REM Sincroniza cambios del repositorio remoto
git pull origin main

REM Compara fechas de modificación y conserva el CSV más reciente
for %%F in (app/videos.csv app/seguimiento.csv) do (
    REM Obtiene fecha local
    for %%A in (%%F) do set "localDate=%%~tA"
    REM Obtiene archivo remoto temporal
    git show origin/main:%%F > %%F.remote
    for %%B in (%%F.remote) do set "remoteDate=%%~tB"
    REM Compara fechas (formato: yyyy-mm-dd hh:mm)
    if "%localDate%" GEQ "%remoteDate%" (
        del %%F.remote
    ) else (
        move /Y %%F.remote %%F
    )
)

REM Activa entorno virtual y ejecuta servidor
call .\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000