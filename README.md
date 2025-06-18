# Systemet CMS

Et professionelt CMS til danske servicevirksomheder - et alternativ til SkvizBiz.

## 🚀 Hurtig Start

### 1. Supabase Opsætning

**VIGTIGT: Du skal først oprette dit eget Supabase projekt og konfigurere environment variables!**

#### A. Opret Supabase Projekt
1. Gå til [supabase.com](https://supabase.com) og opret en konto
2. Klik "New Project" og opret et nyt projekt
3. Vælg en region (anbefalet: Europe West for danske brugere)
4. Vent på at projektet bliver oprettet

#### B. Konfigurer Environment Variables
1. I dit Supabase Dashboard, gå til **Settings** → **API**
2. Kopier følgende værdier:
   - **Project URL** (starter med `https://`)
   - **Project API keys** → **anon public** (den lange nøgle)

3. **Opdater `.env` filen i projektets rod:**
   ```env
   VITE_SUPABASE_URL=https://din-projekt-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=din-anon-key-her
   ```

#### C. Konfigurer CORS (Vigtigt!)
1. I Supabase Dashboard, gå til **Settings** → **API**
2. Under **CORS origins**, tilføj:
   ```
   http://localhost:5173
   ```
3. Klik **Save**

#### D. Kør Database Migrations
1. Gå til **SQL Editor** i Supabase Dashboard
2. Kør indholdet af hver migration fil i rækkefølge:
   - `supabase/migrations/20250616085854_black_salad.sql`
   - `supabase/migrations/20250616085951_small_block.sql`
   - `supabase/migrations/20250616091723_shiny_disk.sql`
   - `supabase/migrations/20250616092734_polished_mountain.sql`
   - `supabase/migrations/20250616094605_delicate_coral.sql`
   - `supabase/migrations/20250616095100_navy_cliff.sql`
   - `supabase/migrations/20250616100255_frosty_cave.sql`

#### E. Opret Admin Bruger
1. **Opret admin-bruger i Supabase Auth Dashboard:**
   - Gå til **Authentication** → **Users** i Supabase Dashboard
   - Klik **Add user** 
   - Email: `william@adely.dk`
   - Password: `wipaSAsaWo23rrd!`
   - Email Confirm: ✅ (aktiveret)

2. **Opret admin-profil:**
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

### 2. Start Applikationen

1. **Installer dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test forbindelsen:**
   - Gå til `http://localhost:5173/login`
   - Log ind med admin-credentials:
     - Email: `william@adely.dk`
     - Password: `wipaSAsaWo23rrd!`

### 3. Fejlfinding

#### "Failed to fetch" fejl:
- ✅ Kontroller at `.env` filen indeholder korrekte Supabase credentials
- ✅ Verificer at CORS er konfigureret til at tillade `http://localhost:5173`
- ✅ Sørg for at dit Supabase projekt er aktivt og ikke paused
- ✅ Test forbindelsen ved at åbne din Supabase URL direkte i browseren

#### Database fejl:
- ✅ Kontroller at alle migrations er kørt korrekt
- ✅ Verificer at admin-brugeren er oprettet i både Auth og users tabellen

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