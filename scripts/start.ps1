
# Start Backend
Write-Host "Starting Python Backend on Port 8000..." -ForegroundColor Green
# We launch a new PowerShell window that stays open (-NoExit) so you can see errors
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; uvicorn main:app --reload --port 8000" -WorkingDirectory "$PSScriptRoot"

# Start Frontend
Write-Host "Starting Next.js Frontend..." -ForegroundColor Cyan
# Launch Frontend in a separate window
Start-Process "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WorkingDirectory "$PSScriptRoot"

Write-Host "Both services started in new windows!" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:8000/docs"
Write-Host "Frontend: http://localhost:3000"
