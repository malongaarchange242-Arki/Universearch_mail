# 📧 Mail Service - Quick Start Guide

## 🚀 Start the Service in 3 Steps

### Step 1: Install Dependencies
```bash
cd d:\UNIVERSEARCH\ BACKEND\services\mail-service
npm install
```

### Step 2: Configure SMTP (Optional for Testing)
Edit `.env` - Already configured with Mailtrap (change credentials if needed)

### Step 3: Start the Service
```bash
npm run dev
```

Service will run on **http://localhost:3010**

---

## 📱 Use from Frontend

### In `recommended_candidates.html`:

1. **Select candidates** using checkboxes in the table
2. **Click "Envoyer Email"** button in the actions bar
3. **Select institutions** you want to notify (all pre-checked)
4. **Add optional message** if needed
5. **Click "Envoyer les emails"** to send

The system will:
- ✅ Generate Excel file with candidate info
- ✅ Send emails to all selected institutions
- ✅ Show results with notifications
- ✅ Auto-continue if multiple candidates

---

## 🧪 Test the API

### Test Health:
```bash
curl http://localhost:3010/health
```

### Test Email Sending:
```bash
node test-mail-service.js
```

### Manual Test with cURL:
```bash
curl -X POST http://localhost:3010/api/mail/recommendations/send \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": {
      "user_id": "test1",
      "first_name": "Test",
      "last_name": "User",
      "full_name": "Test User",
      "email": "test@example.com",
      "user_type": "etudiant"
    },
    "institutions": [{
      "target_id": "univ1",
      "target_name": "Test University",
      "target_type": "universite"
    }]
  }'
```

---

## ⚙️ Configuration

### Default Ports:
- **Mail Service:** 3010
- **PROA API:** 8000
- **Frontend:** 3000

### SMTP Options:

**Development (Mailtrap):**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
```

**Production (Gmail):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password  # Generate in Gmail settings
```

**Production (SendGrid):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

---

## 📋 What Gets Sent

### Email Contains:
- Candidate name, phone, email
- Type (student/bachelor/highschooler)
- Matching fields (why recommended)
- Your optional custom message
- Professional HTML template

### Attachment:
- Excel file: `candidat_firstname_lastname.xlsx`
- Contains all candidate information

---

## 🎯 Features

✅ **Single & Bulk Sending** - Send to 1 or many candidates
✅ **Institution Selection** - Choose which universities/centers to notify
✅ **Excel Generation** - Automatic candidate file creation
✅ **Custom Messages** - Add personalized text to emails
✅ **Error Handling** - Detailed feedback on failures
✅ **Progress Tracking** - Know status of each send
✅ **Logging** - Complete audit trail

---

## 📚 Full Documentation

For complete details, see:
- `MAIL_SERVICE_GUIDE.md` - Technical documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built
- Test file: `test-mail-service.js` - Run tests

---

## 🔧 Troubleshooting

**Service won't start?**
```bash
npm install  # Make sure deps are installed
npm run dev  # Check error messages
```

**Can't send emails?**
- Check SMTP_HOST in .env
- Verify username/password
- Ensure institutions have emails in Supabase

**CORS errors?**
- Update CORS_ORIGIN in .env

**Emails not showing in institutions?**
- Add email addresses to database
- Check Supabase universites and centres_formation tables

---

## 🚢 Production Ready

This implementation is **production-ready** with:
- ✅ TypeScript type safety
- ✅ Zod validation
- ✅ Error handling
- ✅ Structured logging
- ✅ CORS support
- ✅ Database integration
- ✅ Template emails
- ✅ Excel attachments

---

**Status:** ✅ Ready to Deploy  
**Version:** 1.0.0  
**Last Updated:** April 19, 2026
