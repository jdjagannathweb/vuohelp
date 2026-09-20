$port = 3000
$root = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\Jagannath\.gemini\antigravity\scratch\vuo-csc-help" }
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Prefixes.Add("http://127.0.0.1:$port/") } catch {}
$listener.Start()
Write-Output "VUO CSC HELP HTTP Server started at http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # CORS Headers for multi-device & local network connectivity
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if ($request.HttpMethod -eq 'OPTIONS') {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath) -or $urlPath -eq '/') {
            $urlPath = "index.html"
        }

        # Handle API Upload for CSC PDF Forms
        if ($request.HttpMethod -eq 'POST' -and $urlPath -eq 'api/upload-form') {
            try {
                $enc = if ($request.ContentEncoding) { $request.ContentEncoding } else { [System.Text.Encoding]::UTF8 }
                $reader = New-Object System.IO.StreamReader($request.InputStream, $enc)
                $body = $reader.ReadToEnd()
                $json = $body | ConvertFrom-Json
                if ($json.fileName -and $json.base64Data) {
                    $formsDir = Join-Path $root "forms"
                    if (-not (Test-Path $formsDir)) { New-Item -ItemType Directory -Force -Path $formsDir | Out-Null }
                    $rawBase64 = $json.base64Data -replace '^data:[^;]+;base64,', ''
                    $fileBytes = [System.Convert]::FromBase64String($rawBase64)
                    $cleanName = [System.IO.Path]::GetFileName($json.fileName)
                    $destPath = Join-Path $formsDir $cleanName
                    [System.IO.File]::WriteAllBytes($destPath, $fileBytes)

                    $respJson = @{
                        success = $true
                        fileName = $cleanName
                        fileUrl = "forms/$cleanName"
                        size = "$([math]::Round($fileBytes.Length / 1KB)) KB"
                    } | ConvertTo-Json

                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.StatusCode = 200
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $response.StatusCode = 400
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"Missing fileName or base64Data"}')
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } catch {
                $response.StatusCode = 500
                $errMsg = $_.Exception.Message
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("{`"success`":false,`"error`":`"$errMsg`"}")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }

        # Handle API Save Welcome Notice Popup Settings & Image (Multi-computer publish)
        if ($request.HttpMethod -eq 'POST' -and ($urlPath -eq 'api/save-popup' -or $urlPath -eq 'api/save-popup-settings')) {
            try {
                $enc = if ($request.ContentEncoding) { $request.ContentEncoding } else { [System.Text.Encoding]::UTF8 }
                $reader = New-Object System.IO.StreamReader($request.InputStream, $enc)
                $body = $reader.ReadToEnd()
                $json = $body | ConvertFrom-Json
                
                $settings = if ($json.settings) { $json.settings } else { $json }
                
                # Check if base64 image data was sent
                $rawImg = if ($json.imageBase64) { $json.imageBase64 } elseif ($settings.imageUrl -and $settings.imageUrl -match '^data:image') { $settings.imageUrl } else { $null }
                
                if ($rawImg -and $rawImg -match '^data:image') {
                    $assetsDir = Join-Path $root "assets"
                    if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null }
                    
                    $cleanB64 = $rawImg -replace '^data:[^;]+;base64,', ''
                    $imgBytes = [System.Convert]::FromBase64String($cleanB64)
                    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                    $imgFileName = "welcome_notice.jpg"
                    $destImgPath = Join-Path $assetsDir $imgFileName
                    [System.IO.File]::WriteAllBytes($destImgPath, $imgBytes)
                    
                    $settings.imageUrl = "assets/" + $imgFileName + "?v=" + $ts
                }
                
                # Save settings to popup_settings.json on disk
                $settingsJson = $settings | ConvertTo-Json -Depth 5
                $settingsFile = Join-Path $root "popup_settings.json"
                [System.IO.File]::WriteAllText($settingsFile, $settingsJson, $utf8NoBom)
                
                $respData = @{
                    success = $true
                    message = "Notice Popup saved and published to server"
                    settings = $settings
                } | ConvertTo-Json -Depth 5
                
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($respData)
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $errMsg = $_.Exception.Message
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("{`"success`":false,`"error`":`"$errMsg`"}")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }

        # Handle API Get Welcome Notice Popup Settings
        if ($request.HttpMethod -eq 'GET' -and ($urlPath -eq 'api/get-popup' -or $urlPath -eq 'api/popup-settings')) {
            $settingsFile = Join-Path $root "popup_settings.json"
            if (Test-Path $settingsFile -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($settingsFile)
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":false,"error":"No popup settings found"}')
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }

        # Handle API Log VLE Activity & Repeat Visits
        if ($request.HttpMethod -eq 'POST' -and ($urlPath -eq 'api/log-vle-activity' -or $urlPath -eq 'api/vle-activity')) {
            try {
                $enc = if ($request.ContentEncoding) { $request.ContentEncoding } else { [System.Text.Encoding]::UTF8 }
                $reader = New-Object System.IO.StreamReader($request.InputStream, $enc)
                $body = $reader.ReadToEnd()
                $newAct = $body | ConvertFrom-Json
                
                $actFile = Join-Path $root "vle_activities.json"
                $activities = @()
                if (Test-Path $actFile -PathType Leaf) {
                    try {
                        $rawJson = [System.IO.File]::ReadAllText($actFile, [System.Text.Encoding]::UTF8)
                        $parsed = $rawJson | ConvertFrom-Json
                        if ($parsed -is [System.Array]) { $activities = @($parsed) }
                        elseif ($parsed) { $activities = @($parsed) }
                    } catch {}
                }
                
                # Prepend new activity
                $activities = @($newAct) + $activities
                if ($activities.Length -gt 1000) {
                    $activities = $activities[0..999]
                }
                
                if ($activities.Length -eq 1 -or $activities.Count -eq 1) {
                    $itemJson = $activities[0] | ConvertTo-Json -Depth 5
                    $outJson = "[`n  " + ($itemJson.Trim()) + "`n]"
                } else {
                    $outJson = $activities | ConvertTo-Json -Depth 5
                }
                [System.IO.File]::WriteAllText($actFile, $outJson, $utf8NoBom)
                
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $errMsg = $_.Exception.Message
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("{`"success`":false,`"error`":`"$errMsg`"}")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }

        # Handle API Get VLE Activities
        if ($request.HttpMethod -eq 'GET' -and ($urlPath -eq 'api/vle-activities' -or $urlPath -eq 'api/get-vle-activities')) {
            $actFile = Join-Path $root "vle_activities.json"
            if (Test-Path $actFile -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($actFile)
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $bytes = [System.Text.Encoding]::UTF8.GetBytes('[]')
                $response.ContentType = "application/json; charset=utf-8"
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            $response.Close()
            continue
        }
        
        $filePath = Join-Path $root $urlPath
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".htm"  { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".ico"  { "image/x-icon" }
                ".pdf"  { "application/pdf" }
                ".docx" { "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
                default { "application/octet-stream" }
            }
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    } catch {
        # continue loop
    }
}
