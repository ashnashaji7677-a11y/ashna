# FindIt — Modern Minimal Lost & Found Web Application

A clean, responsive, and secure Lost & Found web platform built with **React 19, Vite, Tailwind CSS v4, Lucide Icons, and Supabase**.

FindIt re-engineers how lost property is reconnected: instead of public bulletin boards with exposed phone numbers and fraudulent claims, FindIt uses a **Private Proof-of-Ownership Verification System** with manual finder review and end-to-end safe in-app messaging.

---

## 🎨 1. Design & UI Direction

Built following a SaaS aesthetic with a forest green color palette:
- **Primary Color:** Forest Green (`#238B57`)
- **Secondary Color:** Soft Green (`#E8F5EC`)
- **Background:** Off-White (`#F9FBF9`)
- **Cards & Surfaces:** Pure White (`#FFFFFF`)
- **Text:** Dark Charcoal (`#202B25`)
- **Muted Text:** Grey (`#78847D`)
- **Typography:** Inter for clean body copy, Poppins for strong headings
- **Visuals:** Rounded corners (`rounded-2xl`, `rounded-3xl`), subtle shadows (`shadow-xs`, `shadow-sm`), Lucide icons, and image lightbox zoom.

---

## 🚀 2. Core Features & Architecture

### A. Landing Page
- **Hero:** "Lost Something? Let's Find It." with supporting copy and two prominent CTAs (*Report Lost Item* & *Report Found Item*).
- **Search:** Search items by keyword, category, or location.
- **Popular Categories:** Quick-filter pills for Electronics, Wallets, Keys, Bags, IDs, Jewelry, etc.
- **Recently Reported Items:** Interactive tabbed grid displaying newly reported found discoveries and lost belongings.
- **How It Works:** 3-step breakdown (Report → Verify Ownership Evidence → Connect & Return).
- **Security Callout:** Explains manual verification, RLS privacy, and safe public handover practices.
- **Footer:** Links with interactive dialog modals for *About*, *Contact Support*, *Privacy Policy*, and *Terms*.

### B. Lost & Found Catalogs
- **Lost Items Page:** Responsive card grid showing photo, name, category, date lost, last seen location, snippet, and "View Details" button.
- **Found Items Page:** Same responsive grid for good samaritan turn-ins.
- **Multi-Filter Bar:** Keyword search, category selector, location query, date ranges, and sorting (newest/oldest).

### C. Reporting Items
- **Report Lost Item:** Title, category, description, last seen location, date, multiple photo uploads with instant previews/deletion, identifying marks, and contact preference.
- **Report Found Item:** Designed specifically for finders who might not know the exact brand or model. Accepts category + photo + location with automatic friendly naming.

### D. Ownership Verification & Evidence Review (Critical Feature)
- **Claim Submission:** Potential owners click "Claim This Item" to submit:
  - 1–4 proof photos (purchase receipts, warranty cards, photos wearing/holding the item, close-ups of stickers or scratches).
  - Detailed description of unique identifying features.
  - Secret details only the owner knows (e.g., hidden zipped compartment contents, wallpaper image, serial numbers).
- **Side-by-Side Review:** Finders open a side-by-side comparison screen to inspect the found item's photos against the claimant's proof before making a decision.
- **Statuses:** `Pending Verification`, `Under Review`, `Approved`, and `Rejected` (with mandatory rejection reason).
- **No Automated Guesswork:** Image similarity alone is never used to automatically release an item.

### E. Integrated Messaging System
- **Private One-to-One Chat:** Automatically unlocked upon claim submission.
- **Chat Interface:** Chat bubbles, image attachments, read receipts, timestamps, and conversation sidebar.
- **Quick Replies:** One-click presets ("Where is a safe public spot to meet?", "I can meet tomorrow afternoon", etc.).
- **Handover Safety Reminder:** Guides users to meet in police station lobbies, library entrances, or campus reception desks.

### F. User Dashboard
- **Overview:** Summary metrics for active lost reports, found listings, claims awaiting review, and submitted claims.
- **My Lost Reports:** Edit listings, delete reports, change status.
- **My Found Reports:** Manage found items, see claim count badges, review evidence.
- **Claims Received:** Side-by-side review interface with instant Approve / Reject buttons.
- **Claims Submitted:** Track status of all your claims in real time.
- **Messages:** Embedded conversation inbox.
- **Profile Settings:** Update name, email, and private contact details.

### G. Quick Demo Persona Switcher
For instant testing without constant re-registration:
- **Alex Turner:** Finder of the Sony WH-1000XM4 headphones and Fossil Watch.
- **Sarah Connor:** Claimant looking for her Herschel backpack and claiming the Sony headphones.
- **Marcus Vance:** Finder who found the BMW key fob.

---

## 🗄️ 3. Database Schema (Supabase / PostgreSQL)

The complete SQL migration script is located in `supabase/schema.sql`. It includes:

1. **`users` Table:**
   - `id UUID PRIMARY KEY REFERENCES auth.users(id)`
   - `full_name TEXT`, `email TEXT UNIQUE`, `avatar_url TEXT`, `phone TEXT`, `created_at TIMESTAMPTZ`

2. **`items` Table:**
   - `id UUID PRIMARY KEY`, `user_id UUID REFERENCES users(id)`
   - `item_name TEXT`, `category TEXT`, `description TEXT`, `location TEXT`, `date_reported DATE`, `item_type TEXT CHECK ('lost', 'found')`, `image_urls TEXT[]`, `status TEXT CHECK ('open', 'claimed', 'resolved', 'closed')`, `additional_details TEXT`, `contact_preference TEXT`

3. **`claims` Table:**
   - `id UUID PRIMARY KEY`, `item_id UUID REFERENCES items(id)`, `claimant_id UUID REFERENCES users(id)`, `reviewer_id UUID REFERENCES users(id)`
   - `evidence_image_urls TEXT[]`, `evidence_description TEXT`, `secret_details TEXT`, `status TEXT CHECK ('pending', 'under_review', 'approved', 'rejected')`, `rejection_reason TEXT`

4. **`conversations` & `messages` Tables:**
   - One-to-one mapping between claimant and finder with message attachments, timestamps, and read tracking.

5. **Row Level Security (RLS) & Storage Buckets:**
   - Public view for public item listings.
   - Strict privacy on `claims` and `evidence`: only the claimant and reviewer can access them.
   - Storage buckets for `items`, `evidence`, and `chat_attachments`.

---

## 🛠️ 4. Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Connecting Live Supabase (Optional)
If you wish to use a remote Supabase backend:
1. Create a project in [Supabase](https://supabase.com).
2. Execute the queries in `supabase/schema.sql` in the Supabase SQL Editor.
3. Create a `.env` file from `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the dev server (`npm run dev`).
