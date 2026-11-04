# PowerShell script to export CAD models for 3DMapUTH
$cadgenCmd = if (Get-Command "cadgen" -ErrorAction SilentlyContinue) {
    "cadgen"
} elseif (Test-Path "$HOME\.local\bin\cadgen.cmd") {
    "$HOME\.local\bin\cadgen.cmd"
} else {
    Write-Error "cadgen CLI not found! Please run the text-to-cad installer."
    exit 1
}

Write-Host "Running CAD Export via: $cadgenCmd" -ForegroundColor Cyan
& $cadgenCmd +0.8.4 run cad_models/exports.py

