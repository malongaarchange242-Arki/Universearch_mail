#!/usr/bin/env bash

# ========================================================================
# 📧 MAIL SERVICE - QUICK START & TEST GUIDE
# ========================================================================

echo "🚀 MAIL SERVICE - Test et Démarrage Rapide"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

MAIL_SERVICE_DIR="d:\UNIVERSEARCH BACKEND\services\mail-service"
PROA_SERVICE_DIR="d:\UNIVERSEARCH BACKEND\services\proa-service"

# ========================================================================
# 1. Vérification des prérequis
# ========================================================================

echo -e "${BLUE}[1/5]${NC} Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js ${$(node --version)}${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

echo ""

# ========================================================================
# 2. Installation des dépendances
# ========================================================================

echo -e "${BLUE}[2/5]${NC} Installation des dépendances..."

cd "$MAIL_SERVICE_DIR"

if [ ! -d "node_modules" ]; then
    echo "📦 Installation de npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erreur lors de l'installation${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances déjà présentes${NC}"
fi

echo ""

# ========================================================================
# 3. Vérification de la configuration
# ========================================================================

echo -e "${BLUE}[3/5]${NC} Vérification de la configuration..."

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Le fichier .env est manquant${NC}"
    echo "   Créez .env avec les variables SMTP"
    exit 1
fi

if grep -q "SMTP_HOST=" .env && [ -z "$(grep '^SMTP_HOST=' .env | cut -d'=' -f2)" ]; then
    echo -e "${YELLOW}⚠️  Attention: SMTP_HOST n'est pas configuré${NC}"
    echo "   Les emails ne seront pas envoyés"
fi

echo -e "${GREEN}✅ Configuration trouvée${NC}"

echo ""

# ========================================================================
# 4. Démarrage du service
# ========================================================================

echo -e "${BLUE}[4/5]${NC} Démarrage du service..."

echo "🌟 Lancement: npm run dev"
echo ""

npm run dev

# ========================================================================
# 5. Tests (si le service est accessible)
# ========================================================================

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${BLUE}[5/5]${NC} Service démarré avec succès!"
    echo ""
    echo "🧪 Pour tester le service:"
    echo ""
    echo "   Commande curl:"
    echo "   curl -X POST http://localhost:3010/api/mail/recommendations/send \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{...payload...}'"
    echo ""
    echo "   Healthcheck:"
    echo "   curl http://localhost:3010/health"
    echo ""
fi
