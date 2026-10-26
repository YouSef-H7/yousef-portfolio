<#
.SYNOPSIS
  Uploads the project to a Linux VM over SSH and runs deploy/setup-vm.sh there.

.EXAMPLE
  # First deploy with a domain (HTTPS)
  .\deploy.ps1 -VmHost 203.0.113.10 -User ubuntu -Key C:\keys\vm.key -Domain yousef.dev -Email you@example.com -Www

.EXAMPLE
  # No domain yet: HTTP on the VM's IP
  .\deploy.ps1 -VmHost 203.0.113.10 -User ubuntu -Key C:\keys\vm.key

.EXAMPLE
  # Push code changes later (content edited in /admin is never touched)
  .\deploy.ps1 -VmHost 203.0.113.10 -User ubuntu -Key C:\keys\vm.key -AppOnly
#>
param(
  [Parameter(Mandatory)] [string]$VmHost,
  [Parameter(Mandatory)] [string]$User,
  [string]$Key,
  [string]$Domain,
  [string]$Email,
  [string]$AdminPassword,
  [switch]$Www,
  [switch]$AppOnly
)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$bundle = Join-Path $env:TEMP 'portfolio-bundle.tgz'

$sshArgs = @('-o', 'StrictHostKeyChecking=accept-new')
if ($Key) { $sshArgs += @('-i', $Key) }
$target = "$User@$VmHost"

Write-Host "==> Packing project" -ForegroundColor Cyan
if (Test-Path $bundle) { Remove-Item $bundle }
tar -czf $bundle -C $root `
  --exclude=node_modules --exclude=dist --exclude=data --exclude=.env --exclude=.git `
  server client deploy Dockerfile docker-compose.yml .dockerignore .env.example package.json
if ($LASTEXITCODE -ne 0) { throw "tar failed" }

Write-Host "==> Uploading to $target" -ForegroundColor Cyan
scp @sshArgs $bundle "${target}:/tmp/portfolio-bundle.tgz"
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

$opts = @()
if ($AppOnly)        { $opts += '--app-only' }
elseif ($Domain)     { $opts += "--domain $Domain" }
else                 { $opts += "--site-url http://$VmHost" }
if ($Email)          { $opts += "--email $Email" }
if ($Www)            { $opts += '--www' }
if ($AdminPassword)  { $opts += "--admin-password '$($AdminPassword -replace "'", "'\''")'" }

$remote = "set -e; rm -rf /tmp/portfolio-bundle; mkdir -p /tmp/portfolio-bundle; " +
          "tar -xzf /tmp/portfolio-bundle.tgz -C /tmp/portfolio-bundle; " +
          "sed -i 's/\r$//' /tmp/portfolio-bundle/deploy/*.sh /tmp/portfolio-bundle/deploy/*.conf; " +
          "sudo bash /tmp/portfolio-bundle/deploy/setup-vm.sh $($opts -join ' '); " +
          "rm -rf /tmp/portfolio-bundle /tmp/portfolio-bundle.tgz"

Write-Host "==> Running setup on the VM (first run takes a few minutes: Docker + image build)" -ForegroundColor Cyan
ssh @sshArgs $target $remote
if ($LASTEXITCODE -ne 0) { throw "Remote setup failed" }

Remove-Item $bundle
Write-Host "==> Deployed." -ForegroundColor Green
