$loginBody = @{ email = "atreyash123@gmail.com"; password = "Yash@123" } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    if (-not $token) { throw "Token not found in response" }
    Write-Host "Login successful."

    $categories = @("WATER_SUPPLY", "STREET_LIGHT", "GARBAGE", "ROAD_DAMAGE", "PUBLIC_SAFETY")
    $titles = @("Broken pipe", "Flickering light", "Overflowing bin", "Pothole on main rd", "Suspicious activity")
    $descriptions = @("Water is leaking everywhere", "The light goes off every 5 mins", "Smells bad and blocking path", "Vehicle damage risk", "Area feels unsafe at night")
    $locations = @("Sector 1", "Main Street", "Downtown", "East Side", "Park Avenue")

    $createdComplaints = @()

    for ($i = 1; $i -le 10; $i++) {
        $index = Get-Random -Maximum 5
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $body = "--$boundary$LF" +
                "Content-Disposition: form-data; name=`"title`"$LF$LF" +
                "$($titles[$index]) $i$LF" +
                "--$boundary$LF" +
                "Content-Disposition: form-data; name=`"description`"$LF$LF" +
                "$($descriptions[$index])$LF" +
                "--$boundary$LF" +
                "Content-Disposition: form-data; name=`"category`"$LF$LF" +
                "$($categories[$index])$LF" +
                "--$boundary$LF" +
                "Content-Disposition: form-data; name=`"location`"$LF$LF" +
                "$($locations[$index])$LF" +
                "--$boundary--"

        $headers = @{ "Authorization" = "Bearer $token" }
        $complaint = Invoke-RestMethod -Uri "http://localhost:8080/api/complaints" -Method Post -Headers $headers -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        $createdComplaints += $complaint
    }

    $createdComplaints | Select-Object id, title, category, status | Format-Table
    Write-Host "Successfully created $($createdComplaints.Count) complaints."
} catch {
    Write-Error "Error occurred: $_"
}
