# Substitui a pasta ficheiros/ do repositorio pelo projecto completo e faz o commit com a TUA conta.
$ErrorActionPreference = "Continue"
$Aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$SemBOM = New-Object System.Text.UTF8Encoding $false
function Parar($t) { Write-Host "`nERRO: $t" -ForegroundColor Red; Read-Host "Enter para sair"; exit 1 }

$Repo = Read-Host "Caminho da pasta do repositorio no teu PC (onde esta a pasta .git)"
$Repo = $Repo.Trim('"')
if (-not (Test-Path (Join-Path $Repo ".git"))) { Parar "Aquela pasta nao e um repositorio Git." }
Set-Location $Repo

& git switch main; & git pull --ff-only
$ramo = "corrigir-projecto-completo"
& git switch -c $ramo
if ($LASTEXITCODE -ne 0) { Parar "Nao consegui criar o branch $ramo." }

robocopy (Join-Path $Aqui "ficheiros") (Join-Path $Repo "ficheiros") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Parar "Falhou a copia dos ficheiros." }

& git add -A ficheiros
$f = Join-Path $env:TEMP "msg-corrigir.txt"
[System.IO.File]::WriteAllText($f, "Junta as quatro partes no projecto publicado (substitui as paginas provisorias)`n", $SemBOM)
& git commit -F $f
if ($LASTEXITCODE -ne 0) { Parar "git commit falhou." }
Write-Host "`nAutor do commit:" -ForegroundColor Cyan; & git log -1 --format='  %an <%ae>'
if (& git log -1 --format=%B | Select-String "co-authored" -SimpleMatch) { Parar "Ha Co-authored-by. Nada foi enviado." }
& git push -u origin $ramo
if ($LASTEXITCODE -ne 0) { Parar "git push falhou." }
$url = (& git remote get-url origin) -replace '\.git$',''
$pr = "$url/compare/main...$($ramo)?expand=1"
Write-Host "`nAgora cria o pull request e faz Merge (Create a merge commit):`n  $pr" -ForegroundColor Green
Start-Process $pr
Read-Host "Enter para sair"
