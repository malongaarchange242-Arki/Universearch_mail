# ========================================================================
# 📧 MAIL SERVICE - Quick Start & Test Guide (PowerShell)
# ========================================================================

Write-Host "🚀 MAIL SERVICE - Test et Démarrage Rapide" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$MAIL_SERVICE_DIR = "d:\UNIVERSEARCH BACKEND\services\mail-service"
$PROA_SERVICE_DIR = "d:\UNIVERSEARCH BACKEND\services\proa-service"

# ========================================================================
# 1. Verification des prérequis
# ========================================================================

Write-Host "[1/5] Vérification des prérequis..." -ForegroundColor Blue
Write-Host ""

# Vérifier Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green

# Vérifier npm
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm $npmVersion" -ForegroundColor Green

Write-Host ""

# ========================================================================
# 2. Installation des dépendances
# ========================================================================

Write-Host "[2/5] Installation des dépendances..." -ForegroundColor Blue

Set-Location -Path $MAIL_SERVICE_DIR

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation de npm packages..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "✅ Dépendances déjà présentes" -ForegroundColor Green
}

Write-Host ""

# ========================================================================
# 3. Vérification de la configuration
# ========================================================================

Write-Host "[3/5] Vérification de la configuration..." -ForegroundColor Blue

if (-not (Test-Path ".env")) {
    Write-Host "❌ Le fichier .env est manquant" -ForegroundColor Red
    Write-Host "   Créez .env avec les variables SMTP" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "SMTP_HOST=\S+") {
    Write-Host "⚠️  Attention: SMTP_HOST n'est pas configuré" -ForegroundColor Yellow
    Write-Host "   Les emails ne seront pas envoyés" -ForegroundColor Yellow
}

Write-Host "✅ Configuration trouvée" -ForegroundColor Green

Write-Host ""

# ========================================================================
# 4. Affichage des infos utiles
# ========================================================================

Write-Host "[4/5] Informations du service..." -ForegroundColor Blue
Write-Host ""
Write-Host "📍 Répertoire: $MAIL_SERVICE_DIR" -ForegroundColor Green
Write-Host "🔌 Écoute sur: http://localhost:3010" -ForegroundColor Green
Write-Host ""

# ========================================================================
# 5. Démarrage du service
# ========================================================================

Write-Host "[5/5] Démarrage du service..." -ForegroundColor Blue
Write-Host ""
Write-Host "🌟 Lancement: npm run dev" -ForegroundColor Green
Write-Host ""

npm run dev

# ========================================================================
# Post-Start Info
# ========================================================================

Write-Host ""
Write-Host "✅ Service démarré avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Pour tester le service:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Healthcheck:" -ForegroundColor White
Write-Host "   Invoke-WebRequest http://localhost:3010/health" -ForegroundColor Gray
Write-Host ""
Write-Host "   Frontend:" -ForegroundColor White
Write-Host "   Allez à http://localhost:3000/Frontend/recommended_candidates.html" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Pour plus d'info, consultez MAIL_SERVICE_GUIDE.md" -ForegroundColor Cyan
