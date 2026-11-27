# Renders a 720p 60fps H.264 MP4 animation of 3DMapUTH's Git history using Gource + FFmpeg
$ErrorActionPreference = "Stop"
$gourceExe = Join-Path $PSScriptRoot "..\tools\gource\gource.exe"
$outMp4 = Join-Path $PSScriptRoot "..\visualizations\3dmaputh-git-history.mp4"

if (-not (Test-Path $gourceExe)) {
  Write-Error "Gource not found at $gourceExe"
  exit 1
}

New-Item -ItemType Directory -Force -Path (Split-Path $outMp4) | Out-Null

# Use cmd /c for lossless binary PPM piping from gource to ffmpeg
$cmdLine = "`"$gourceExe`" -1280x720 --seconds-per-day 0.6 --auto-skip-seconds 0.5 --multi-sampling --stop-at-end --key --highlight-users --hide mouse,progress --file-idle-time 0 --max-files 0 --background-colour 0B1120 --font-size 18 --title `"3DMapUTH - Git Commit History`" --output-ppm-stream - --output-framerate 30 | ffmpeg -y -r 30 -f image2pipe -vcodec ppm -i - -vcodec libx264 -preset fast -pix_fmt yuv420p -crf 20 `"$outMp4`""

Write-Host "Rendering Gource video to $outMp4 ..."
cmd /c $cmdLine
if ($LASTEXITCODE -eq 0 -and (Test-Path $outMp4)) {
  $sizeMb = [math]::Round((Get-Item $outMp4).Length / 1MB, 2)
  Write-Host "SUCCESS: $outMp4 ($sizeMb MB)"
} else {
  exit 1
}
