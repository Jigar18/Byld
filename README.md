<div align="center">
  <img src="public/landing/byldit-mark-mono.webp" alt="Byldit logo" width="88" />

  # Byldit

  Build and maintain a public developer portfolio from your GitHub account.

  [Live website](https://byldit.vercel.app) | [Report a bug](https://github.com/Jigar18/Byld/issues) | [Request a feature](https://github.com/Jigar18/Byld/issues)
</div>

## What Byldit does

Byldit turns a developer's GitHub identity and selected repositories into a public portfolio at `/{username}`. After signing in with GitHub, a user chooses which repositories to present, edits the imported project details, and adds the context that code alone cannot provide.

Each portfolio can include:

- A profile, bio, location, current role, and social links
- Selected projects with descriptions, technology icons, source links, live links, screenshots, and demo videos
- GitHub repository imports with language, topic, README, and homepage data
- A live GitHub contribution calendar with an owner-controlled visibility setting
- Work experience, education, skills, and PDF certificates
- Owner-only editing controls that stay hidden from visitors
- A public view counter and a shareable username URL

The onboarding flow uses GitHub for sign-in and repository access. After setup, portfolio owners can update their content through the site without changing code or rebuilding the application.

## How it works

1. The user signs in through the GitHub App OAuth flow.
2. The user installs the GitHub App on the repositories they want Byldit to access.
3. Byldit suggests profile details and skills from GitHub during onboarding.
4. The user imports selected repositories or creates projects manually.
5. The finished portfolio is available at `/{github-username}`.

Private repositories never appear automatically. A repository becomes public portfolio content only after its owner imports it.

## Tech stack

- Next.js 15 with the App Router
- React 19 and TypeScript
- Tailwind CSS, Base UI, Radix UI, and Framer Motion
- PostgreSQL with Prisma ORM
- GitHub Apps, OAuth, REST API, and GraphQL API
- Supabase Storage for profile images and certificate PDFs
- Cloudinary for project screenshots and demo videos
- Vercel for the production deployment

## Run it locally

### Prerequisites

Install or create the following before starting:

- Node.js 20 or newer
- pnpm
- A PostgreSQL database
- A GitHub App
- A Supabase project
- A Cloudinary account

### 1. Clone and install

```bash
git clone https://github.com/Jigar18/Byld.git
cd Byld
pnpm install
```

### 2. Configure PostgreSQL

Create a PostgreSQL database and keep both its pooled connection URL and direct connection URL. Prisma uses `DATABASE_URL` at runtime and `DIRECT_URL` for schema operations.

For a new database, apply the committed migrations after creating `.env`:

```bash
pnpm exec prisma migrate deploy
```

### 3. Configure the GitHub App

Create a GitHub App in **GitHub Settings > Developer settings > GitHub Apps**. For local development, use these values:

| Setting | Value |
| --- | --- |
| Homepage URL | `http://localhost:3000` |
| Callback URL | `http://localhost:3000/api/github/callback` |
| Setup URL | `http://localhost:3000/api/github/callback` |
| Webhook URL | A public tunnel URL ending in `/api/github/webhooks` |

Give the app read-only access to repository contents and metadata. Subscribe it to the `Installation` event so Byldit can track installation, suspension, permission, and deletion changes.

Then:

1. Generate a client secret.
2. Generate and download a private key.
3. Choose a webhook secret.
4. Copy the app ID, client ID, app slug, client secret, private key, and webhook secret into `.env`.
5. Set the install URL to `https://github.com/apps/<your-app-slug>/installations/new`.

GitHub cannot send webhooks to `localhost`. Use a tunnel while testing webhook delivery, or use a deployed preview URL and update the GitHub App URLs to match it.

### 4. Configure Supabase Storage

Create two public storage buckets in Supabase:

- `profile-picture` for JPG, PNG, and WebP profile images
- `certificates` for certificate PDFs

Use a server-side Supabase key that can upload and delete objects in both buckets. Store it only in `SUPABASE_API_KEY`. Never expose a service-role key through a `NEXT_PUBLIC_` variable.

### 5. Configure Cloudinary

Create a signed upload preset for project videos. Add the Cloudinary cloud name, API key, API secret, and video preset name to `.env`. Byldit signs uploads on the server and validates the resulting asset before saving it to a project.

### 6. Add environment variables

Create a `.env` file in the repository root:

```dotenv
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Session signing
JWT_SECRET="replace-with-a-long-random-secret"

# GitHub App
GITHUB_APP_ID="your-app-id"
NEXT_PUBLIC_GITHUB_APP_CLIENT_ID="your-client-id"
GITHUB_APP_CLIENT_SECRET="your-client-secret"
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_GITHUB_REDIRECT_URI="http://localhost:3000/api/github/callback"
NEXT_PUBLIC_GITHUB_APP_INSTALL_URL="https://github.com/apps/your-app-slug/installations/new"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_PROJECT_URL="https://your-project.supabase.co"
SUPABASE_API_KEY="your-server-side-supabase-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_VIDEO_UPLOAD_PRESET="your-signed-video-preset"
```

Generate a session secret with a cryptographically secure tool. For example:

```bash
openssl rand -base64 32
```

The private key may contain real line breaks or escaped `\n` sequences. The application accepts both formats.

### 7. Start the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the GitHub account that can install your development GitHub App.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local Next.js development server |
| `pnpm build` | Generate Prisma Client and create a production build |
| `pnpm start` | Run the production build |
| `pnpm exec tsc --noEmit` | Check TypeScript without emitting files |
| `pnpm exec prisma migrate deploy` | Apply committed database migrations |
| `pnpm exec prisma generate` | Regenerate Prisma Client |

## Project structure

```text
├── app/                       # Next.js App Router pages and server endpoints
│   ├── (onboarding)/          # Guided portfolio setup flow
│   ├── [userpage]/            # Public portfolio route for each username
│   ├── api/                   # Auth, portfolio, upload, and GitHub endpoints
│   ├── components/            # Portfolio and landing-page components
│   └── sections/              # Public portfolio sections
│
├── components/
│   └── ui/                    # Shared UI primitives
│
├── lib/                       # Database, session, GitHub, and storage logic
├── prisma/
│   ├── migrations/            # PostgreSQL migration history
│   └── schema.prisma          # Prisma models and database configuration
├── public/
│   └── landing/               # Byldit brand and landing-page assets
├── types/                     # Shared TypeScript types
├── utils/                     # File validation and upload helpers
├── middleware.ts              # Route protection and legacy redirects
├── next.config.ts             # Next.js configuration
└── vercel.json                # Vercel deployment configuration
```

## Deployment

The application is designed for Vercel, but it can run on any Node.js host that supports Next.js and can reach PostgreSQL, GitHub, Supabase, and Cloudinary.

Before deploying:

1. Add every environment variable from the local setup to the hosting provider.
2. Replace the local GitHub callback, setup, homepage, and webhook URLs with the production domain.
3. Set `NEXT_PUBLIC_GITHUB_REDIRECT_URI` to the same production callback URL.
4. Apply Prisma migrations to the production database.
5. Build with `pnpm build` and start with `pnpm start`.

This repository disables automatic Vercel Git deployments in `vercel.json`. Enable them in that file or create deployments manually if you fork the project.

## Contributing

Contributions are welcome. Keep changes focused, readable, and easy to review.

1. Fork the repository and create a branch such as `feature/project-search` or `fix/mobile-overflow`.
2. Keep unrelated changes out of the branch.
3. Follow the existing TypeScript and component patterns.
4. Run the relevant checks before opening a pull request:

   ```bash
   pnpm exec tsc --noEmit
   pnpm build
   ```

5. Explain what changed, why it changed, and any manual setup needed to review it.
6. Include screenshots for visible UI changes.

Open an issue before starting a large feature or a change that affects the database schema, authentication flow, or storage model. That keeps implementation work aligned with the project before a large diff is written.

## Security

Do not commit `.env`, private keys, access tokens, database credentials, or service-role keys. If you find a security issue, avoid posting exploit details in a public issue. Contact the repository owner privately through their GitHub profile instead.
