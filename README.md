# Systemet CMS

Et professionelt CMS til danske servicevirksomheder - et alternativ til SkvizBiz.

## 🚀 Hurtig Start

### 1. Supabase Opsætning

1. **Opret admin-bruger i Supabase Auth Dashboard:**
   - Gå til Authentication > Users i Supabase Dashboard
   - Klik "Add user" 
   - Email: `william@adely.dk`
   - Password: `wipaSAsaWo23rrd!`
   - Email Confirm: ✅ (aktiveret)

2. **Kør database migrations:**
   - Gå til SQL Editor i Supabase Dashboard
   - Kør indholdet af `supabase/migrations/20250616085854_black_salad.sql`
   - Kør indholdet af `supabase/migrations/20250616085951_small_block.sql`

3. **Opret admin-profil:**
   - Kør følgende SQL i Supabase SQL Editor:
   ```sql
   INSERT INTO users (id, email, name, role, company_id, is_active)
   VALUES (
     (SELECT id FROM auth.users WHERE email = 'william@adely.dk'),
     'william@adely.dk',
     'William Admin',
     'admin',
     '00000000-0000-0000-0000-000000000001',
     true
   );
   ```

### 2. Environment Variables

Opret `.env` fil med dine Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Test Login

1. Start applikationen: `npm run dev`
2. Gå til login-siden
3. Log ind med admin-credentials:
   - Email: `william@adely.dk`
   - Password: `wipaSAsaWo23rrd!`

## 🏗️ Systemarkitektur

### Roller og Adgang

- **Admin (william@adely.dk)**: Fuld systemadgang, kan oprette virksomhedsejere
- **Virksomhedsejer**: Kan administrere egen virksomhed, medarbejdere, kunder og opgaver
- **Medarbejder**: Mobilvenlig interface til opgaver og tidsregistrering

### Database Schema

Systemet bruger 15 tabeller med Row Level Security (RLS):

- `companies` - Virksomhedsdata
- `users` - Brugerprofiler (linket til Supabase Auth)
- `customers` + `customer_addresses` - Kundedata med flere adresser
- `tasks` + `task_assignments` - Opgaver og tildeling
- `time_entries` - Tidsregistrering
- `routes` + `route_stops` - Ruteplanlægning
- `accounting_integrations` - Regnskabsintegration
- `invoices` + `invoice_items` - Fakturering
- `system_settings` - Systemindstillinger

### Sikkerhed

- **Supabase Auth** til autentificering
- **Row Level Security (RLS)** på alle tabeller
- **Rollebaseret adgangskontrol**
- **Automatisk audit trail** med timestamps

## 🔧 Funktionaliteter

### ✅ Implementeret

- **Brugerstyring**: Admin kan oprette virksomhedsejere
- **Autentificering**: Supabase Auth integration
- **Database**: Komplet schema med RLS
- **Services**: Modulære API services
- **UI**: Responsive design med Tailwind CSS

### 🚧 Næste Fase

- **CVR Integration**: Automatisk virksomhedsdata
- **Medarbejderstyring**: Virksomhedsejere kan oprette medarbejdere
- **Kundestyring**: Med flere adresser og CVR-opslag
- **Opgavestyring**: Tildeling og gentagelse
- **Tidsregistrering**: Automatisk og manuel
- **Ruteplanlægning**: GraphHopper integration
- **Fakturering**: Dinero/e-conomic/Billy integration

## 🛠️ Teknologi Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Icons**: Lucide React
- **Build**: Vite
- **Deployment**: Netlify (klar til deployment)

## 📱 Mobiloptimering

Systemet er designet mobile-first med særlig fokus på medarbejder-interfacet:

- **Touch-venlig navigation**
- **Geolocation API** til automatisk tidsregistrering
- **Offline-ready** struktur
- **Progressive Web App** funktionalitet

## 🔐 Sikkerhedsfeatures

- **Email/password autentificering**
- **Rollebaseret adgangskontrol**
- **Data isolation** mellem virksomheder
- **Audit trail** på alle ændringer
- **GDPR-compliant** databehandling

## 📊 Rapportering

Systemet indeholder omfattende rapporteringsfunktioner:

- **Tidsregistrering** per medarbejder/opgave
- **Opgavestatus** og performance
- **Faktureringsrapporter**
- **Ruteoptimering** statistik

## 🚀 Deployment

Systemet er klar til deployment på Netlify med automatisk build fra Git repository.

---

**Udviklet af William @ Adely**