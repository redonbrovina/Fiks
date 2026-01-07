# Booking Service Verification Script
$baseUrl = "http://localhost:3003/api/bookings"

Write-Host "1. Testing Health Check..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3003/health" -Method Get
    Write-Host "   Success: $($health | ConvertTo-Json -Depth 1)" -ForegroundColor Green
} catch {
    Write-Host "   Failed to connect to health endpoint" -ForegroundColor Red
}

Write-Host "`n2. Creating a new Booking..." -ForegroundColor Cyan
$bookingData = @{
    kerkesa_punes_id = 1
    cmimi = 50.00
    koha_fillimit = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    koha_mbarimit = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}
try {
    $newBooking = Invoke-RestMethod -Uri $baseUrl -Method Post -Body ($bookingData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "   Created Booking ID: $($newBooking.termini_id)" -ForegroundColor Green
    $bookingId = $newBooking.termini_id
} catch {
    Write-Host "   Failed to create booking: $_" -ForegroundColor Red
    exit
}

if ($bookingId) {
    Write-Host "`n3. Getting All Bookings..." -ForegroundColor Cyan
    $allBookings = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "   Count: $($allBookings.Count)" -ForegroundColor Green

    Write-Host "`n4. Getting Booking by ID ($bookingId)..." -ForegroundColor Cyan
    $oneBooking = Invoke-RestMethod -Uri "$baseUrl/$bookingId" -Method Get
    Write-Host "   Retrieved price: $($oneBooking.cmimi)" -ForegroundColor Green

    Write-Host "`n5. Deleting Booking..." -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/$bookingId" -Method Delete
        Write-Host "   Successfully deleted." -ForegroundColor Green
    } catch {
        Write-Host "   Failed to delete." -ForegroundColor Red
    }
}
