# 🏗️ Mail Service - Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│              recommended_candidates.html/.js                    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Candidates Table with Checkboxes                       │   │
│   │  ☑ Jean Dupont    | etudiant  | 95% | 2 établissements │   │
│   │  ☑ Marie Martin   | bachelier | 87% | 3 établissements │   │
│   │  ☐ Pierre Bernard | lycéen    | 82% | 1 établissement  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Action Buttons                                         │   │
│   │  [📊 Exporter CSV] [📧 Envoyer Email]                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Modal: Sélection Candidats (si multiple)               │  │
│   │  ☑ Jean Dupont      [2 établissements]                  │  │
│   │  ☑ Marie Martin     [3 établissements]                  │  │
│   │  ☐ Pierre Bernard   [1 établissement]                   │  │
│   │                                                           │  │
│   │  [Annuler] [Continuer vers les destinataires]           │  │
│   └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Modal: Sélection Établissements                         │  │
│   │  ☑ Université Paris 1          Score 95% Rang #1        │  │
│   │  ☑ Centre IDF Formation         Score 87% Rang #3       │  │
│   │  ☐ Université Lyon 2            Score 82% Rang #5       │  │
│   │                                                           │  │
│   │  Message complémentaire:                                 │  │
│   │  ╔═══════════════════════════════════════════════════╗  │  │
│   │  ║ Candidat très prometteur pour vos filières...   ║  │  │
│   │  ╚═══════════════════════════════════════════════════╝  │  │
│   │                                                           │  │
│   │  [Annuler] [Envoyer les emails]                         │  │
│   └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
└─────────────────────────────────────────────────────────────────┘
              HTTP POST /api/mail/recommendations/send
                           ↓↓↓↓↓


┌─────────────────────────────────────────────────────────────────┐
│                      MAIL SERVICE (Node.js)                      │
│              localhost:3010                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Route: POST /api/mail/recommendations/send         │   │
│  │                                                          │   │
│  │  1. Validate payload with Zod                          │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Service: sendRecommendationEmails()                    │   │
│  │                                                          │   │
│  │  2. Build Excel workbook                               │   │
│  │     - Candidate info (name, phone, email, type)        │   │
│  │     - Save to buffer                                   │   │
│  │                                                          │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Fetch Institution Contacts                            │   │
│  │                                                          │   │
│  │  - Query Supabase universites table                    │   │
│  │  - Query Supabase centres_formation table             │   │
│  │  - Build contact map                                  │   │
│  │                                                          │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  For Each Institution:                                 │   │
│  │                                                          │   │
│  │  3. Check for valid email                              │   │
│  │     ├─ No email → Status: SKIPPED                      │   │
│  │     └─ Has email → Continue                            │   │
│  │                                                          │   │
│  │  4. Build email content                                │   │
│  │     ├─ Subject: "Universearch - Candidat recommandé"   │   │
│  │     ├─ HTML body (professional template)              │   │
│  │     └─ Attachment (Excel file)                         │   │
│  │                                                          │   │
│  │  5. Send via Nodemailer (SMTP)                         │   │
│  │     ├─ Success → Status: SENT                          │   │
│  │     └─ Error → Status: FAILED                          │   │
│  │                                                          │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Build Response with Report                            │   │
│  │  {                                                       │   │
│  │    "success": true,                                    │   │
│  │    "summary": {                                        │   │
│  │      "requested": 2,                                   │   │
│  │      "sent": 2,                                        │   │
│  │      "failed": 0,                                      │   │
│  │      "skipped": 0                                      │   │
│  │    },                                                  │   │
│  │    "results": [...]                                    │   │
│  │  }                                                      │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ↓                                      │
└─────────────────────────────────────────────────────────────────┘
              HTTP 200 / Success Response
                           ↓↓↓↓↓


┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────────┐│
│  │  SUPABASE       │  │ SMTP SERVER  │  │ INSTITUTION INBOX   ││
│  │                 │  │              │  │                     ││
│  │ universites     │  │ (Mailtrap,   │  │ contact@univ.fr     ││
│  │ centres_format  │  │  Gmail,      │  │ info@centre.fr      ││
│  │                 │  │  SendGrid)   │  │                     ││
│  │                 │  │              │  │ Receives Excel      ││
│  │                 │  │ Sends emails │  │ attachment with     ││
│  │                 │  │ with Excel   │  │ candidate data      ││
│  │                 │  │ attachment   │  │                     ││
│  └─────────────────┘  └──────────────┘  └─────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
User                   Frontend                 Backend              Supabase        SMTP
 │                       │                         │                  │               │
 │  1. Select Candidate  │                         │                  │               │
 ├──────────────────────>│                         │                  │               │
 │                       │                         │                  │               │
 │  2. Click Email       │                         │                  │               │
 ├──────────────────────>│                         │                  │               │
 │                       │                         │                  │               │
 │  3. Show Modal        │                         │                  │               │
 │<──────────────────────┤                         │                  │               │
 │                       │                         │                  │               │
 │  4. Select Institutions & Custom Message       │                  │               │
 ├──────────────────────>│                         │                  │               │
 │                       │                         │                  │               │
 │  5. POST /send        │                         │                  │               │
 │<──────────────────────┼────────────────────────>│                  │               │
 │                       │                         │                  │               │
 │                       │  6. Build Excel        │                  │               │
 │                       │<────────────────────────┤                  │               │
 │                       │                         │                  │               │
 │                       │  7. Fetch Institutions │                  │               │
 │                       │<─────────────────────────────────────────>│               │
 │                       │                         │                  │               │
 │                       │  8. Get Emails         │                  │               │
 │                       │<─────────────────────────────────────────>│               │
 │                       │                         │                  │               │
 │                       │  9. For Each Institution:                 │               │
 │                       │     - Build Email                        │               │
 │                       │     - Send via SMTP   ├─────────────────────────────────>│
 │                       │<────────────────────────┤                  │               │
 │                       │                         │                  │               │
 │                       │  10. Collect Results   │                  │               │
 │                       │<────────────────────────┤                  │               │
 │                       │                         │                  │               │
 │  11. Response         │                         │                  │               │
 │<──────────────────────┤                         │                  │               │
 │                       │                         │                  │               │
 │  12. Show Toast       │                         │                  │               │
 │  (success/errors)     │                         │                  │               │
```

---

## Component Dependencies

```
recommended_candidates.html/js
│
├── Frontend State
│   ├── candidats[]
│   ├── candidatsSelectionnés (Set)
│   └── envoiMessageContext
│
├── Modals
│   ├── mail-selection-modal (Single candidate)
│   └── multi-send-modal (Multiple candidates)
│
└── API Functions
    ├── envoyerEmail()                    ← Main entry
    ├── afficherModalEnvoiMultiple()       ← Multi-select
    ├── ouvrirModalEnvoiMessage()          ← Institution select
    └── confirmerEnvoiMessage()            ← Send
         │
         └─> HTTP POST /api/mail/recommendations/send


Mail Service Backend
│
├── app.ts (Fastify setup)
│   ├── Supabase client
│   ├── Mailer instance
│   └── Routes registration
│
├── routes.ts
│   └── POST /api/mail/recommendations/send
│        │
│        └─> recommendation-mails.routes.ts
│             │
│             └─> Validate & Call Service
│
├── modules/recommendation-mails/
│   ├── recommendation-mails.schemas.ts (Zod validation)
│   │   ├── candidateSchema
│   │   ├── institutionSchema
│   │   └── sendRecommendationEmailSchema
│   │
│   └── recommendation-mails.service.ts (Core logic)
│       ├── buildWorkbookBuffer()        (Excel generation)
│       ├── fetchInstitutionContacts()   (Supabase query)
│       ├── buildEmailHtml()              (Template)
│       └── sendRecommendationEmails()    (Main function)
│
└── config/
    ├── supabase.ts (Client setup)
    └── mailer.ts (Nodemailer config)
```

---

## Database Schema References

### Supabase Tables Used:

#### universites
```sql
id          (uuid)
nom         (text)
email       (text)     -- Required for sending
contacts    (text)     -- Fallback if email empty
```

#### centres_formation
```sql
id          (uuid)
nom         (text)
email       (text)     -- Required for sending
contacts    (text)     -- Fallback if email empty
```

---

## Email Template Structure

```html
<div>
  <h2>Nouveau candidat recommandé</h2>
  <p>Bonjour [Institution],</p>
  <p>Universearch vous transmet le profil d'un candidat recommandé...</p>
  
  <table>
    <tr><td>Nom</td><td>[last_name]</td></tr>
    <tr><td>Prenom</td><td>[first_name]</td></tr>
    <tr><td>Telephone</td><td>[telephone]</td></tr>
    <tr><td>Type utilisateur</td><td>[user_type]</td></tr>
    <tr><td>Email</td><td>[email]</td></tr>
  </table>
  
  <p><strong>Justification:</strong> [reason]</p>
  <p><strong>Message complémentaire:</strong> [custom_message]</p>
  <p>Le fichier Excel joint reprend les informations du candidat.</p>
  
  <p>Cordialement,<br/>Équipe Universearch</p>
</div>
```

---

## Error Handling Flow

```
POST /api/mail/recommendations/send
│
├─ Invalid Schema?
│  └─> 400 Bad Request { error, details }
│
├─ Missing SMTP Config?
│  └─> 500 Error { error: "Missing SMTP configuration" }
│
├─ Supabase Error?
│  └─> 500 Error { error: "Failed to fetch universities" }
│
├─ For Each Institution:
│  ├─ No Email?
│  │  └─> Status: SKIPPED { message: "No institution email available" }
│  │
│  ├─ SMTP Error?
│  │  └─> Status: FAILED { message: "[error details]" }
│  │
│  └─ Success?
│     └─> Status: SENT { message: "Email sent successfully" }
│
└─> 200 Success { success: true, summary, results }
   └─> Frontend shows toast notifications
```

---

## File Structure Reference

```
mail-service/
├── src/
│   ├── config/
│   │   ├── mailer.ts          (Nodemailer setup)
│   │   └── supabase.ts        (Supabase client)
│   │
│   ├── modules/
│   │   └── recommendation-mails/
│   │       ├── recommendation-mails.service.ts    (Core logic)
│   │       ├── recommendation-mails.routes.ts     (API route)
│   │       └── recommendation-mails.schemas.ts    (Validation)
│   │
│   ├── app.ts                 (Fastify app)
│   ├── routes.ts              (Route registration)
│   └── server.ts              (Entry point)
│
├── .env                       (Configuration)
├── package.json               (Dependencies)
├── tsconfig.json              (TypeScript config)
│
├── MAIL_SERVICE_GUIDE.md              (Detailed guide)
├── IMPLEMENTATION_SUMMARY.md          (Summary)
├── README_QUICK_START.md              (Quick ref)
├── ARCHITECTURE.md                     (This file)
│
├── QUICK_START.ps1            (Windows start)
├── QUICK_START.sh             (Linux/Mac start)
└── test-mail-service.js       (Test script)
```

---

**Last Updated:** April 19, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
