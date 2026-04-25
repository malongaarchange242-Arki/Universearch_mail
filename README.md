# Mail Service

Microservice Node.js + TypeScript pour notifier les universites et centres de formation a propos des candidats recommandes.

## Fonctions

- generation d'un fichier Excel avec les informations du candidat
- envoi d'un email a une ou plusieurs universites / centres selectionnes
- resolution des emails des etablissements via Supabase

## Endpoint principal

`POST /api/mail/recommendations/send`

Payload exemple:

```json
{
  "candidate": {
    "user_id": "uuid-user",
    "profile_id": "uuid-profile",
    "session_id": "uuid-session",
    "first_name": "Jean",
    "last_name": "Dupont",
    "full_name": "Jean Dupont",
    "email": "jean@example.com",
    "telephone": "+242000000000",
    "user_type": "bachelier",
    "reason": "Matched fields: Informatique, Data"
  },
  "institutions": [
    {
      "target_id": "uuid-universite",
      "target_name": "Universite Example",
      "target_type": "universite",
      "score": 1,
      "rank": 1,
      "confidence": 1
    }
  ],
  "custom_message": "Candidat fortement recommande."
}
```

## Variables d'environnement

Copier `.env.example` puis renseigner:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Demarrage

```bash
npm install
npm run dev
```
