# 📧 Mail Service - Guide Complet

## Vue d'ensemble

Le **Mail Service** est un microservice Node.js TypeScript qui gère l'envoi de notifications par email aux universités et centres de formation avec pièces jointes Excel.

### Fonctionnalités Principales

✅ **Envoi d'emails profesionnel** avec templates HTML personnalisés
✅ **Génération automatique d'Excel** avec données du candidat (Nom, Prénom, Téléphone, Type utilisateur, Email)
✅ **Sélection flexible des destinataires** (universités et centres de formation)
✅ **Messages personnalisés** optionnels
✅ **Traçabilité complète** des envois avec rapports détaillés
✅ **Gestion des erreurs** robuste et logging complet

---

## Architecture

```
mail-service/
├── src/
│   ├── config/
│   │   ├── supabase.ts         # Client Supabase
│   │   └── mailer.ts            # Configuration Nodemailer
│   ├── modules/
│   │   └── recommendation-mails/
│   │       ├── recommendation-mails.service.ts   # Logique d'envoi
│   │       ├── recommendation-mails.routes.ts    # Endpoints API
│   │       └── recommendation-mails.schemas.ts   # Schémas Zod
│   ├── app.ts                   # Application Fastify
│   ├── routes.ts                # Routage principal
│   └── server.ts                # Point d'entrée
├── .env                         # Configuration d'environnement
├── package.json                 # Dépendances NPM
└── tsconfig.json               # Configuration TypeScript
```

---

## Installation & Démarrage

### 1. Installation des dépendances

```bash
cd d:\UNIVERSEARCH\ BACKEND\services\mail-service
npm install
```

### 2. Configuration des variables d'environnement

Éditez le fichier `.env` avec vos paramètres SMTP :

#### Option A: Développement avec Mailtrap (Recommandé)

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<votre-user-mailtrap>
SMTP_PASS=<votre-password-mailtrap>
```

[Inscrivez-vous sur Mailtrap →](https://mailtrap.io/)

#### Option B: Production avec Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=<votre-mot-de-passe-app>  # Utiliser un mot de passe d'application spécifique
```

#### Option C: Production avec SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<votre-clé-api-sendgrid>
```

### 3. Démarrage du service

**Mode Développement :**
```bash
npm run dev
```

**Mode Production :**
```bash
npm run build
npm run start
```

Le service écoute sur `http://0.0.0.0:3010` par défaut.

---

## API Endpoints

### POST `/api/mail/recommendations/send`

Envoie un email de recommandation à plusieurs universités/centres.

#### Request Body

```json
{
  "candidate": {
    "user_id": "user_123",
    "profile_id": "profile_456",
    "session_id": "session_789",
    "first_name": "Jean",
    "last_name": "Dupont",
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "telephone": "+33612345678",
    "user_type": "etudiant",
    "reason": "Matched fields: Informatique, Génie Civil"
  },
  "institutions": [
    {
      "target_id": "univ_123",
      "target_name": "Université Paris 1",
      "target_type": "universite",
      "score": 0.95,
      "rank": 1,
      "confidence": 0.92
    },
    {
      "target_id": "centre_456",
      "target_name": "Centre Formation Île-de-France",
      "target_type": "centre",
      "score": 0.87,
      "rank": 3,
      "confidence": 0.88
    }
  ],
  "custom_message": "Candidat très prometteur pour vos filières.",
  "requested_by": {
    "admin_email": "admin@universearch.com",
    "admin_name": "Administrateur Universearch"
  }
}
```

#### Response Success (200)

```json
{
  "success": true,
  "summary": {
    "requested": 2,
    "sent": 2,
    "failed": 0,
    "skipped": 0
  },
  "attachment_file_name": "candidat_jean_dupont.xlsx",
  "results": [
    {
      "target_id": "univ_123",
      "target_name": "Université Paris 1",
      "target_type": "universite",
      "email": "contact@univ-paris1.fr",
      "status": "sent",
      "message": "Email sent successfully"
    },
    {
      "target_id": "centre_456",
      "target_name": "Centre Formation Île-de-France",
      "target_type": "centre",
      "email": "info@centre-formation.fr",
      "status": "sent",
      "message": "Email sent successfully"
    }
  ]
}
```

#### Response Error (400)

```json
{
  "success": false,
  "error": "Invalid payload",
  "details": {
    "formErrors": {
      "institutions": ["Array must contain at least 1 items"]
    }
  }
}
```

#### Response Error (500)

```json
{
  "success": false,
  "error": "Failed to fetch universities: Invalid API key"
}
```

---

## Flux Utilisateur Frontend

### 1. Sélection des Candidats

L'utilisateur sélectionne les candidats recommandés via les checkboxes du tableau.

### 2. Clic sur "Envoyer Email"

Depuis la barre d'actions :
```
┌─────────────────────────────────────┐
│ ☑ Exporter CSV | Envoyer Email      │
└─────────────────────────────────────┘
```

### 3. Modal de Sélection (1 ou plusieurs candidats)

**Un candidat :** Ouverture directe de la modal de sélection des établissements.

**Plusieurs candidats :** Affichage d'une liste pour sélectionner lesquels traiter.

### 4. Sélection des Destinataires

```
┌──────────────────────────────────────┐
│ ✓ Envoyer un message                 │
│                                      │
│ Destinataires (Tout est présélectionné)
│ ☑ Université Paris 1      2 établis  │
│ ☑ Centre IDF Formation     1 établis  │
│ ☐ Université Lyon 2        0 établis  │
│                                      │
│ Message complémentaire:              │
│ [Zone de texte...]                   │
│                                      │
│ [Annuler] [Envoyer les emails]       │
└──────────────────────────────────────┘
```

### 5. Confirmationet Rapport

L'utilisateur reçoit une notification avec le résumé :
- ✅ Emails envoyés
- ⏭️ Emails ignorés (pas de contact)
- ❌ Emails échoués

Si plusieurs candidats, passage automatique au suivant.

---

## Schéma de Données Excel

Le fichier Excel généré contient :

| Champ | Description | Type |
|-------|-------------|------|
| Nom | Nom du candidat | Texte |
| Prenom | Prénom du candidat | Texte |
| Telephone | Numéro de téléphone | Texte |
| Type utilisateur | etudiant/bachelier/lyceen | Texte |
| Email | Email du candidat | Texte |

**Métadonnées ajoutées :**
- Session ID
- Raison de la recommandation

Exemple:
```
Nom       | Dupont
Prenom    | Jean
Telephone | +33612345678
Type user | etudiant
Email     | jean@example.com
Session   | session_789
Raison    | Matched: Informatique
```

---

## Variables d'Environnement

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| PORT | Port d'écoute du service | ❌ | 3010 |
| HOST | Adresse d'écoute | ❌ | 0.0.0.0 |
| LOG_LEVEL | Niveau de log (debug/info/warn/error) | ❌ | info |
| CORS_ORIGIN | Origines CORS autorisées | ❌ | * |
| SUPABASE_URL | URL Supabase | ✅ | - |
| SUPABASE_SERVICE_ROLE_KEY | Clé service Supabase | ✅ | - |
| SMTP_HOST | Serveur SMTP | ✅ | - |
| SMTP_PORT | Port SMTP | ✅ | - |
| SMTP_SECURE | TLS/SSL | ❌ | false |
| SMTP_USER | Utilisateur SMTP | ✅ | - |
| SMTP_PASS | Mot de passe SMTP | ✅ | - |
| SMTP_FROM | Adresse "From" des emails | ❌ | Universearch <no-reply@universearch.com> |
| APP_BASE_URL | URL de base de l'application | ❌ | https://universearch.com |

---

## Codes de Statut d'Envoi

| Statut | Description |
|--------|-------------|
| `sent` | Email envoyé avec succès |
| `skipped` | Email non envoyé (pas de contact valide) |
| `failed` | Erreur lors de l'envoi |

---

## Gestion des Erreurs

### Erreurs Courantes

#### 1. SMTP non configuré
```
Error: Missing SMTP configuration in environment variables
```
✅ **Solution:** Remplir les variables SMTP_HOST, SMTP_USER, SMTP_PASS

#### 2. Supabase non accessible
```
Error: Failed to fetch universities: ...
```
✅ **Solution:** Vérifier SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY

#### 3. Pas d'email dans la base de données
```
{
  "status": "skipped",
  "message": "No institution email available"
}
```
✅ **Solution:** Ajouter les emails des universités/centres dans Supabase

#### 4. Payload invalide
```
Error: Invalid payload
```
✅ **Solution:** Vérifier que `institutions` contient au moins 1 élément

---

## Tests

### Test Simple avec cURL

```bash
curl -X POST http://localhost:3010/api/mail/recommendations/send \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": {
      "user_id": "test_1",
      "first_name": "Test",
      "last_name": "User",
      "full_name": "Test User",
      "email": "test@example.com",
      "telephone": "+33612345678",
      "user_type": "etudiant"
    },
    "institutions": [{
      "target_id": "univ_1",
      "target_name": "Université Test",
      "target_type": "universite"
    }]
  }'
```

### Test Complet Frontend

1. Aller à `recommended_candidates.html`
2. Sélectionner des candidats
3. Cliquer "Envoyer Email"
4. Confirmer les destinataires
5. Vérifier les notifications

---

## Monitoring & Logs

### Logs du Service

```
[INFO] endpoint: POST /api/mail/recommendations/send status: 200 duration_ms: 1245.32
[INFO] Successfully sent 2 recommendation emails for Jean Dupont
[ERROR] Failed to send email to contact@univ.fr: Connection timeout
```

### Vérifier la Santé du Service

```bash
curl http://localhost:3010/health
```

Réponse:
```json
{
  "service": "mail-service",
  "status": "ok",
  "time": "2026-04-19T10:30:45.123Z"
}
```

---

## Limitations Actuelles & Améliorations Futures

### ✅ Implémenté
- Envoi d'emails avec pièces jointes
- Gestion Supabase des universités/centres
- Validation Zod des payloads
- Génération Excel ExcelJS
- Messages personnalisés

### 🔄 À Implémenter
- Rate limiting (anti-abuse)
- File d'attente asynchrone (BullMQ)
- Retry automatique en cas d'échec
- Webhooks de confirmation d'envoi
- Template d'email dynamiques
- Analytics et reporting

---

## Support & Troubleshooting

### Le service démarre mais les emails ne sont pas envoyés

1. **Vérifier la configuration SMTP:**
   ```bash
   # Dans la terminal npm:
   console.log(process.env.SMTP_HOST)
   ```

2. **Vérifier les emails Supabase:**
   - Aller à Supabase SQL
   - `SELECT id, nom, email FROM universites LIMIT 5;`
   - Les emails doivent être remplis

3. **Vérifier les logs:**
   ```
   npm run dev 2>&1 | grep -i "error\|failed\|smtp"
   ```

### CORS Error

Ajouter le domaine fronten dans `.env`:
```env
CORS_ORIGIN=http://localhost:3000,https://universearch.com
```

---

## Déploiement

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3010
CMD ["node", "dist/server.js"]
```

Build & Run:
```bash
docker build -t mail-service .
docker run -p 3010:3010 --env-file .env mail-service
```

### Production Checklist

- [ ] SMTP configuré avec un fournisseur de confiance
- [ ] Logs activés et monitored
- [ ] Healthcheck configuré
- [ ] CORS whitelist configuré
- [ ] Rate limiting ajouté
- [ ] Backups Supabase activés
- [ ] Monitoring d'erreurs (Sentry/LogRocket)

---

## Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Fastify Documentation](https://www.fastify.io/)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [Zod Documentation](https://zod.dev/)
