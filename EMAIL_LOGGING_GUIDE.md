# 📊 Email Logging System

## Overview

Le mail-service enregistre maintenant automatiquement **tous les emails envoyés** dans une table Supabase `email_logs` pour audit et tracking.

---

## Database Setup

### Migration SQL
Exécute cette migration dans Supabase pour créer la table:

```sql
-- File: services/mail-service/db/migrations/001_create_email_logs_table.sql
```

**Champs enregistrés:**
- `nom`, `prenom` - Nom et prénom du candidat
- `email` - Email du candidat
- `telephone` - Téléphone du candidat
- `quartier` - Quartier du candidat
- `user_type` - Type d'utilisateur (etudiant, bachelier, etc.)
- `raison` - Raison de la recommandation
- `institution_name` - Nom de l'établissement destinataire
- `institution_id` - ID de l'établissement
- `institution_type` - Type d'établissement (universite, centre)
- `status` - Statut de l'envoi (sent, failed)
- `message_id` - ID du message Brevo
- `brevo_response` - Réponse de l'API Brevo
- `admin_email` - Email de l'admin qui a initié l'envoi
- `admin_name` - Nom de l'admin
- `created_at` - Date de création
- `updated_at` - Date de mise à jour

---

## How It Works

### 1. Mail Service enregistre après succès

**Fichier:** `services/mail-service/src/modules/recommendation-mails/recommendation-mails.service.ts`

```typescript
try {
  const mailResult = await app.mailer.sendMail(mailOptions);
  
  // Automatically logs to email_logs table
  const { error: logError } = await app.supabase
    .from('email_logs')
    .insert([
      {
        nom: payload.candidate.last_name,
        prenom: payload.candidate.first_name,
        email: payload.candidate.email,
        // ... autres champs
        status: 'sent'
      }
    ]);
} catch (error) {
  // Failed sends are NOT logged (only successes)
}
```

### 2. Frontend envoie les données avec `quartier`

**Fichier:** `Frontend/recommended_candidates.js`

```javascript
const payload = {
  candidate: {
    user_id: '...',
    first_name: 'Jean',
    last_name: 'Dupont',
    full_name: 'Jean Dupont',
    email: 'jean@example.com',
    telephone: '+33612345678',
    user_type: 'etudiant',
    reason: 'Matched fields: Informatique',
    quartier: 'Plateau' // ✅ NOUVEAU - Quartier du candidat
  },
  institutions: [
    { target_id: '...', target_name: '...', target_type: 'universite' }
  ],
  requested_by: {
    admin_email: 'admin@universearch.com',
    admin_name: 'Admin Name'
  }
};

const response = await fetch('/api/mail/recommendations/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

---

## Query Examples

### Tous les emails envoyés
```sql
SELECT 
  nom, prenom, email, telephone, quartier, 
  institution_name, raison, created_at
FROM email_logs
ORDER BY created_at DESC;
```

### Emails par établissement
```sql
SELECT 
  COUNT(*) as total,
  institution_name,
  DATE(created_at) as date
FROM email_logs
WHERE status = 'sent'
GROUP BY institution_name, DATE(created_at)
ORDER BY created_at DESC;
```

### Emails par candidat
```sql
SELECT 
  email, nom, prenom, 
  COUNT(*) as emails_sent,
  ARRAY_AGG(institution_name) as institutions
FROM email_logs
WHERE status = 'sent'
GROUP BY email, nom, prenom;
```

### Emails par quartier
```sql
SELECT 
  quartier,
  COUNT(*) as total,
  ARRAY_AGG(DISTINCT institution_name) as institutions
FROM email_logs
WHERE status = 'sent'
GROUP BY quartier
ORDER BY total DESC;
```

---

## Frontend Integration

Le frontend doit maintenant inclure le champ `quartier` dans le payload:

**Ligne dans `recommended_candidates.js`:**

```javascript
function confirmerEnvoiEmailsGlobal() {
  // ... existing code ...
  
  const payload = {
    candidate: {
      // ... existing fields ...
      quartier: candidat.quartier || null, // ✅ Ajouter ce champ
    },
    institutions: etablissementsSelectionnés,
    requested_by: {
      admin_email: currentAdminEmail,
      admin_name: currentAdminName
    }
  };
  
  // Envoyer le payload
}
```

---

## RLS Policies

Les politiques de sécurité à lignes (RLS) sont configurées:
- Les utilisateurs authentifiés peuvent **lire** les logs
- Le service role (mail-service) peut **écrire** les logs

---

## Monitoring & Auditing

Via cette table, tu peux maintenant :

✅ **Auditer les envois** - Qui a envoyé, quand, vers qui
✅ **Analyser par quartier** - Quel quartier reçoit le plus de recommandations
✅ **Tracer les candidats** - Tous les emails envoyés pour un candidat
✅ **Statistiques par établissement** - Combien de recommandations par établissement
✅ **Diagnostiquer les problèmes** - Voir les emails échoués et pourquoi

---

## Next Steps

1. ✅ Exécute la migration SQL dans Supabase
2. ✅ Redéploie le mail-service (code compilé)
3. ✅ Modifie le frontend pour envoyer le champ `quartier`
4. ✅ Teste un envoi d'email
5. ✅ Vérifies que la ligne a été enregistrée dans `email_logs`
