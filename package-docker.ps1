$ErrorActionPreference = 'Stop'

$Env:http_proxy="http://127.0.0.1:7890";$Env:https_proxy="http://127.0.0.1:7890"

$Utf8Encoding = New-Object System.Text.UTF8Encoding($false)
[Console]::InputEncoding = $Utf8Encoding
[Console]::OutputEncoding = $Utf8Encoding
$OutputEncoding = $Utf8Encoding
chcp 65001 > $null

$RootDir = (Get-Location).Path
$OutputFile = if ($args.Count -gt 0) { $args[0] } else { Join-Path $RootDir 'light-deployment.tar' }
$OutputFile = [System.IO.Path]::GetFullPath($OutputFile)
$OutputDir = Split-Path -Parent $OutputFile
$StageDir = Join-Path ([System.IO.Path]::GetTempPath()) ("light-package-" + [guid]::NewGuid().ToString('N'))
$ImagesFile = Join-Path $StageDir 'images.tar'

function Stop-WithError([string] $Message) {
  Write-Error $Message
  exit 1
}

try {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Stop-WithError '未找到 docker 命令，请先启动 Docker Desktop。'
  }
  if (-not (Get-Command tar -ErrorAction SilentlyContinue)) {
    Stop-WithError '未找到 tar 命令，请使用 Windows 10/11 自带 tar 或安装 bsdtar。'
  }
  if (-not (Test-Path (Join-Path $RootDir 'docker-compose.yml'))) {
    Stop-WithError '请在项目根目录执行此脚本。'
  }
  foreach ($Directory in @('service-java/light/public', 'service-java/data')) {
    if (-not (Test-Path (Join-Path $RootDir $Directory))) {
      Stop-WithError "缺少目录：$Directory"
    }
  }

  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  New-Item -ItemType Directory -Path $StageDir -Force | Out-Null
  if (Test-Path $OutputFile) {
    Remove-Item $OutputFile -Force
  }

  Push-Location $RootDir
  Write-Host '正在构建全部 Docker 镜像...'
  docker compose version *> $null
  if ($LASTEXITCODE -eq 0) {
    docker compose build
  } elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    docker-compose build
  } else {
    Stop-WithError 'Docker Compose 不可用。'
  }

  Write-Host '正在导出 Docker 镜像...'
  docker save --output $ImagesFile light-backend:latest light-web:latest light-cms:latest
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $ImagesFile)) {
    Stop-WithError 'Docker 镜像导出失败。'
  }

  Write-Host '正在打包镜像和运行数据...'
  tar -cf $OutputFile `
    -C $StageDir images.tar `
    -C $RootDir service-java/light/public service-java/data docker-compose.yml
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $OutputFile)) {
    Stop-WithError '部署包打包失败。'
  }

  Write-Host "打包完成：$OutputFile"
  Write-Host '恢复镜像：tar -xf light-deployment.tar images.tar; docker load -i images.tar'
} finally {
  Pop-Location -ErrorAction SilentlyContinue
  if (Test-Path $StageDir) {
    Remove-Item $StageDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}
