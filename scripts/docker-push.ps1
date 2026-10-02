# ==============================================================================
# CareerSignal Docker Build & Push Script
# Docker Hub Username: pavitrapandey
# ==============================================================================
param (
    [string]$Username = "pavitrapandey",
    [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " CareerSignal Docker Build & Push" -ForegroundColor Cyan
Write-Host " Docker Hub Account: $Username" -ForegroundColor Cyan
Write-Host " Image Tag:          $Tag" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Verify Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "`n[!] Docker Desktop is not running. Launching Docker Desktop..." -ForegroundColor Yellow
    $dockerExe = "C:\Users\HP\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    if (Test-Path $dockerExe) {
        Start-Process $dockerExe
        Write-Host "Waiting 20 seconds for Docker daemon to initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
    } else {
        Write-Error "Please start Docker Desktop and run this script again."
    }
}

# 2. Build Backend Image (Staged to avoid OneDrive ReparsePoint lock)
Write-Host "`n[1/4] Building Backend Image ($Username/careersignal-backend:$Tag)..." -ForegroundColor Green
$tempBackend = Join-Path $env:TEMP "careersignal-backend-build"
if (Test-Path $tempBackend) { Remove-Item -Recurse -Force $tempBackend }
New-Item -ItemType Directory -Path $tempBackend | Out-Null
Copy-Item -Path backend\* -Destination $tempBackend -Recurse -Exclude node_modules

docker build -t "${Username}/careersignal-backend:${Tag}" $tempBackend
Remove-Item -Recurse -Force $tempBackend
Write-Host "Backend build complete!" -ForegroundColor Green

# 3. Build Frontend Image (Staged to avoid OneDrive ReparsePoint lock)
Write-Host "`n[2/4] Building Frontend Image ($Username/careersignal-frontend:$Tag)..." -ForegroundColor Green
$tempFrontend = Join-Path $env:TEMP "careersignal-frontend-build"
if (Test-Path $tempFrontend) { Remove-Item -Recurse -Force $tempFrontend }
New-Item -ItemType Directory -Path $tempFrontend | Out-Null
Copy-Item -Path frontend\* -Destination $tempFrontend -Recurse -Exclude node_modules,dist

docker build -t "${Username}/careersignal-frontend:${Tag}" --build-arg VITE_API_URL=http://localhost:4000 $tempFrontend
Remove-Item -Recurse -Force $tempFrontend
Write-Host "Frontend build complete!" -ForegroundColor Green

# 4. Push Backend Image
Write-Host "`n[3/4] Pushing ${Username}/careersignal-backend:${Tag} to Docker Hub..." -ForegroundColor Cyan
docker push "${Username}/careersignal-backend:${Tag}"

# 5. Push Frontend Image
Write-Host "`n[4/4] Pushing ${Username}/careersignal-frontend:${Tag} to Docker Hub..." -ForegroundColor Cyan
docker push "${Username}/careersignal-frontend:${Tag}"

Write-Host "`n=================================================" -ForegroundColor Green
Write-Host " SUCCESS! Docker images pushed to Docker Hub:" -ForegroundColor Green
Write-Host " 1. https://hub.docker.com/r/${Username}/careersignal-backend" -ForegroundColor Yellow
Write-Host " 2. https://hub.docker.com/r/${Username}/careersignal-frontend" -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Green
