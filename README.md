# Future Abroad 🌏

**Your Future Starts in Taiwan.**

Future Abroad is a professional overseas education consultancy website built for **Abhishek Sharma**, based in Jharkhand, India. It helps Indian students discover higher education opportunities at Taiwanese universities.

---

## Features

- **Responsive, modern design** — dark/light mode, mobile-first layout
- **University directory** — 8 universities with search and filters (type, field, degree)
- **University detail modal** — programs, fields, and official links
- **Personalized matching tool** — filter by degree, field, university type, intake
- **Admission services section** — 6-step process
- **Transparent pricing** — Plan A (milestone) & Plan B (one-time)
- **Scholarship resources** — links to official Taiwan government portals
- **FAQ accordion** — 10 questions with accurate, honest answers
- **Free counselling form** — validated, stored in SQLite, rate-limited
- **Legal pages** — Privacy Policy, Terms & Conditions, Refund Policy templates

---

## Technology Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML5, Tailwind CSS (CDN), Vanilla JS |
| Backend   | Node.js, Express.js               |
| Database  | SQLite via sql.js (pure JS)       |
| Security  | helmet, express-rate-limit, validator |
| Email     | nodemailer (optional, configurable) |
| Fonts     | Inter (Google Fonts)              |
| Icons     | Font Awesome 6                    |

---

## Project Structure

```
future-abroad/
├── public/
│   ├── index.html          # Main website (all sections)
│   ├── css/
│   │   └── styles.css      # Custom CSS (design tokens, components)
│   ├── js/
│   │   ├── main.js         # All frontend interactions
│   │   ├── universities.js # University data (editable)
│   │   └── forms.js        # Reserved for future form utilities
│   └── pages/
│       ├── privacy.html    # Privacy Policy (template)
│       ├── terms.html      # Terms & Conditions (template)
│       └── refund.html     # Refund & Cancellation Policy (template)
├── routes/
│   └── enquiry.js          # POST /api/enquiry — validation + DB storage
├── db/
│   ├── init.js             # SQLite initialization via sql.js
│   └── future_abroad.sqlite  # Generated on first run (gitignored)
├── server.js               # Express app with security middleware
├── .env.example            # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## Quick Start

### 1. Prerequisites

- **Node.js v18+** — [nodejs.org](https://nodejs.org)
- **npm** (bundled with Node.js)

### 2. Install Dependencies

```bash
cd "future-abroad"
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` to set your configuration. At minimum:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./db/future_abroad.sqlite
```

### 4. Start the Server

```bash
node server.js
```

Or for development with auto-restart on file changes:

```bash
npm run dev
```

### 5. Open in Browser

```
http://localhost:3000
```

---

## Environment Variables

| Variable              | Default                      | Description                                   |
|-----------------------|------------------------------|-----------------------------------------------|
| `PORT`                | `3000`                       | HTTP port the server listens on               |
| `NODE_ENV`            | `development`                | `development` or `production`                 |
| `DB_PATH`             | `./db/future_abroad.sqlite`  | Path to SQLite database file                  |
| `RATE_LIMIT_MAX`      | `10`                         | Max enquiry submissions per IP per window     |
| `RATE_LIMIT_WINDOW_MS`| `900000`                     | Rate limit window in ms (default: 15 min)     |
| `SMTP_HOST`           | *(empty)*                    | SMTP server host (leave empty to disable email)|
| `SMTP_PORT`           | `587`                        | SMTP port                                     |
| `SMTP_SECURE`         | `false`                      | `true` for port 465 (SSL)                     |
| `SMTP_USER`           | *(empty)*                    | SMTP username / email                         |
| `SMTP_PASS`           | *(empty)*                    | SMTP password / app password                  |
| `ADMIN_EMAIL`         | *(empty)*                    | Owner email that receives new enquiry alerts  |
| `FROM_EMAIL`          | *(empty)*                    | From address for outgoing emails              |
| `CONTACT_EMAIL`       | *(placeholder)*              | Displayed in footer                           |
| `CONTACT_WHATSAPP`    | *(placeholder)*              | Displayed in footer                           |
| `CONTACT_CITY`        | `Jharkhand, India`           | Displayed in footer                           |

---

## API Reference

### `GET /api/health`
Returns server and database status.

```json
{ "status": "ok", "ts": "2025-10-18T10:00:00.000Z" }
```

### `POST /api/enquiry`
Submits a counselling enquiry.

**Request body (JSON):**

| Field           | Required | Validation                                    |
|-----------------|----------|-----------------------------------------------|
| `name`          | ✅       | Min 2 chars, max 120                          |
| `email`         | ✅       | Valid email format                            |
| `whatsapp`      | ✅       | Valid international phone with country code   |
| `qualification` | ✅       | Non-empty string                              |
| `degree`        | ✅       | One of: `bachelor`, `master`, `phd`           |
| `major`         | ✅       | Min 2 chars, max 150                          |
| `intake_year`   | ✅       | One of: `2025`, `2026`, `2027`, `2028`        |
| `semester`      | ✅       | One of: `spring`, `fall`                      |
| `percentage`    | ❌       | Optional, max 10 chars                        |
| `budget`        | ❌       | Optional, max 100 chars                       |
| `message`       | ❌       | Optional, max 1500 chars                      |
| `consent`       | ✅       | `true`                                        |

**Success response (200):**
```json
{
  "success": true,
  "id": 1,
  "message": "Thank you! Abhishek Sharma & Future Abroad team will contact you for your free 1-on-1 counselling session."
}
```

**Validation error (400):**
```json
{ "success": false, "errors": { "field": "Error message" } }
```

**Rate limited (429):**
```json
{ "success": false, "message": "Too many requests." }
```

---

## University Data

University information is in [`public/js/universities.js`](public/js/universities.js).

To update or add a university, edit the `UNIVERSITIES` array. Each entry contains:

```javascript
{
  id:          'nthu',         // Unique identifier
  name:        'National Tsing Hua University',
  abbr:        'NTHU',
  type:        'public',       // 'public' or 'private'
  location:    'Hsinchu',
  fields:      ['Engineering', 'Computer Science', ...],
  degrees:     ['bachelor', 'master', 'phd'],
  intakes:     ['fall', 'spring'],
  website:     'https://www.nthu.edu.tw/en/',
  programsUrl: 'https://oga.nthu.edu.tw/...',
  color:       '#7B0026',
  description: 'University description…',
  programs: [
    {
      name:     'Program name',
      degree:   'Master\'s / PhD',
      language: 'English (select programs)',
      link:     'https://official-url.edu.tw',
      note:     'Accuracy disclaimer…'
    }
  ]
}
```

---

## Email Notifications (Optional)

Email delivery is **disabled by default**. Enquiries are always stored in SQLite regardless of email configuration.

To enable email:

1. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env`
2. Set `ADMIN_EMAIL` to receive new enquiry notifications
3. Set `FROM_EMAIL` as the sender address

**Example (Gmail with App Password):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=abhishek@abroadwingsofficial.netlify.app
FROM_EMAIL=noreply@abroadwingsofficial.netlify.app
```

---

## Legal Pages

The legal page templates are in `public/pages/`. They are **templates only** and must be reviewed and updated by the business owner (and ideally a legal advisor) before the website is published.

| Page         | File                          | Action Required                      |
|--------------|-------------------------------|--------------------------------------|
| Privacy      | `public/pages/privacy.html`   | Customize data handling details      |
| Terms        | `public/pages/terms.html`     | Define service scope, liability      |
| Refund       | `public/pages/refund.html`    | Define refund conditions & timelines |

---

## Running in Production

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager such as PM2:

```bash
npm install -g pm2
pm2 start server.js --name "abroad-wings"
pm2 save
pm2 startup
```

3. Use a reverse proxy (Nginx / Caddy) to handle HTTPS:

**Nginx example:**
```nginx
server {
    listen 80;
    server_name abroadwingsofficial.netlify.app;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

4. Point your domain to the server IP and configure SSL (e.g., Certbot / Let's Encrypt).

---

## Deployment Options

| Provider     | Notes                                                          |
|--------------|----------------------------------------------------------------|
| VPS (Hetzner, DigitalOcean, Vultr) | Full control, recommended for production |
| Railway.app  | Simple Node.js deploy; SQLite file persistence via volume     |
| Render.com   | Free tier available; persistent disk for SQLite               |
| Heroku       | Ephemeral filesystem — use external DB (PostgreSQL) for production |

---

## Testing Summary

| Test                            | Result   |
|---------------------------------|----------|
| Server starts without errors    | ✅ PASS  |
| Database initializes            | ✅ PASS  |
| Health endpoint (`GET /api/health`) | ✅ PASS |
| Valid enquiry stored in SQLite  | ✅ PASS  |
| Invalid form data returns 400   | ✅ PASS (9 error fields validated) |
| Duplicate email blocked (30 min)| ✅ PASS  |
| Hero section renders correctly  | ✅ PASS  |
| University cards render (8)     | ✅ PASS  |
| Search filter works             | ✅ PASS  |
| Type/Field/Degree filters work  | ✅ PASS  |
| University modal opens/closes   | ✅ PASS  |
| Personalized matching works     | ✅ PASS  |
| FAQ accordion expands/collapses | ✅ PASS  |
| Form client-side validation     | ✅ PASS  |
| Dark/light mode toggle          | ✅ PASS (persists in localStorage) |
| Mobile hamburger menu           | ✅ PASS  |
| Active nav highlighting         | ✅ PASS  |
| Legal pages load                | ✅ PASS  |
| No JavaScript console errors    | ✅ PASS  |
| Scroll reveal animations        | ✅ PASS  |

---

## Security Features

- **Helmet.js** — sets secure HTTP headers (CSP, HSTS, etc.)
- **Rate limiting** — max 10 API requests per IP per 15 minutes
- **Parameterized queries** — no SQL injection possible
- **Input validation** — server-side using `validator.js`
- **Input sanitization** — all strings trimmed and length-limited
- **Duplicate guard** — prevents same email submission within 30 minutes
- **IP hashing** — IP stored as SHA-256 hash (privacy-conscious)
- **No passwords stored** — no authentication system in v1
- **CORS disabled** — API only accepts same-origin requests
- **No real payment processing** — enquiry CTA only

---

## Customisation Guide

### Update contact information
Edit `.env` to set your real email and WhatsApp number. Update the footer in `public/index.html` to use these values or display them directly.

### Update pricing
Search for `₹50,000` and `₹40,000` in `public/index.html` and update as needed.

### Add more universities
Append to the `UNIVERSITIES` array in `public/js/universities.js`.

### Change color scheme
Edit CSS custom properties in `public/css/styles.css` under `:root {}`.

---

## Disclaimer

Future Abroad is an independent overseas education consultancy. It does not represent or have official affiliation with any Taiwanese university or government body. All admission, scholarship, and visa decisions are made by the relevant institutions and authorities. University program information must be confirmed on official university websites before applying.

---

*Built for Future Abroad — Jharkhand, India · 2025*
