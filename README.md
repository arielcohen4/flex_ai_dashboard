# Flex AI Dashboard

> **Open-source dashboard for serverless LLM fine-tuning and inference.**

[![Live App](https://img.shields.io/badge/Live%20App-app.getflex.ai-blue?style=flat-square)](https://app.getflex.ai)
[![Docs](https://img.shields.io/badge/Docs-docs.getflex.ai-green?style=flat-square)](https://docs.getflex.ai)
[![Website](https://img.shields.io/badge/Website-getflex.ai-purple?style=flat-square)](https://getflex.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://choosealicense.com/licenses/mit/)

Flex AI lets any developer fine-tune and serve open-source LLMs with just a few lines of code — no GPU setup, no Kubernetes, no boilerplate. This repository is the **full-stack Next.js dashboard** that powers [app.getflex.ai](https://app.getflex.ai).

![Flex AI Dashboard](public/images/shadcn-admin.png)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security Notice](#-security-notice)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Flex AI is a **serverless LLM training and inference platform** built on top of [Modal](https://modal.com) — a serverless GPU cloud that spins compute up on demand and tears it down when the job is done. You pay only for the GPU seconds your training run actually uses.

The dashboard gives you a full UI to:

- Upload and manage training datasets
- Launch fine-tuning jobs against 60+ open-source models
- Monitor live training metrics (loss, steps, spend, ETA)
- Manage checkpoints — download, convert to GGUF, or deploy to inference
- Deploy OpenAI-compatible inference endpoints (single or Multi-LoRA)
- Chat with your deployed models in the built-in Playground
- Manage billing (prepaid balance via Lemon Squeezy)
- Configure custom S3-compatible storage

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                        │
│             Next.js App Router (this repository)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
   │  Supabase   │  │ Flex REST   │  │ Lemon Squeezy│
   │  (Auth, DB, │  │    API      │  │  (Billing)   │
   │  Realtime)  │  │api.getflex.ai│  └──────────────┘
   └─────────────┘  └──────┬──────┘
                           │
                    ┌──────▼──────────────────────┐
                    │         Modal.com            │
                    │  Serverless GPU Compute      │
                    │                              │
                    │  • Spins up GPU on demand    │
                    │  • Runs fine-tuning jobs     │
                    │  • Manages inference pods    │
                    │  • Tears down when idle      │
                    └──────────────────────────────┘
```

### How the Compute Layer Works

The Flex API (`api.getflex.ai`) is a **serverless endpoint built on [Modal](https://modal.com)**. When you start a fine-tuning job from the dashboard:

1. The dashboard calls `POST /v1/fine_tunes/create_finetune` on the Flex API with your hyperparameters and dataset location.
2. The Flex API dispatches the job to a Modal function — a serverless GPU container that boots in seconds, runs your training configuration (LoRA, full fine-tune, multi-GPU via DeepSpeed/FSDP), streams metrics back in real time, and shuts down automatically when complete.
3. Checkpoints are uploaded to object storage (DigitalOcean Spaces / your own S3 bucket).
4. The dashboard polls Supabase realtime for live status updates (steps, loss, spend, ETA).

For inference endpoints, the same Modal-backed API spins up an OpenAI-compatible serving layer and returns a base URL you can drop into any OpenAI SDK call.

### Data Flow

```
Dataset Upload  ──►  S3 / DO Spaces  ──►  Modal Training Job
                                               │
                                               ▼
                                         Checkpoint Storage
                                               │
                             ┌─────────────────┴──────────────────┐
                             │                                    │
                             ▼                                    ▼
                      Deploy Endpoint                     Download / GGUF
                      (Modal Inference)              (Presigned S3 URL)
```

---

## Features

| Feature | Description |
|---|---|
| **Fine-tuning** | LoRA / full fine-tune on 60+ open-source models (Llama, Mistral, Qwen, Gemma, etc.) |
| **Multi-GPU** | Automatic DeepSpeed / FSDP config for models >8B params |
| **Live Metrics** | Real-time loss, steps, spend, and ETA during training |
| **Checkpoints** | View, download, or convert to GGUF format |
| **Inference Endpoints** | OpenAI-compatible endpoints, single or Multi-LoRA |
| **Playground** | Streaming chat UI against any deployed endpoint |
| **Dataset Management** | Upload and manage training datasets |
| **Billing** | Prepaid balance top-ups, payment history |
| **Custom Storage** | Bring your own AWS S3 / S3-compatible bucket |
| **Affiliate Tracking** | FirstPromoter integration |
| **Analytics** | PostHog event tracking |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) — App Router, Server Actions |
| **Language** | TypeScript 5 |
| **UI** | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS 3](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) |
| **State** | [TanStack React Query 5](https://tanstack.com/query) · [Redux Toolkit](https://redux-toolkit.js.org/) · [Zustand](https://zustand-demo.pmnd.rs/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Tables / Charts** | [TanStack Table](https://tanstack.com/table) · [Recharts](https://recharts.org/) |
| **Auth / Database** | [Supabase](https://supabase.com/) (Postgres, Auth, Realtime, RLS) |
| **Payments** | [Lemon Squeezy](https://www.lemonsqueezy.com/) |
| **Storage** | [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/) (S3 / DigitalOcean Spaces) |
| **AI Client** | [OpenAI SDK](https://github.com/openai/openai-node) (playground streaming) |
| **Icons** | [@tabler/icons-react](https://tabler.io/icons) · [@radix-ui/react-icons](https://www.radix-ui.com/icons) |
| **Analytics** | [PostHog](https://posthog.com/) |
| **HTTP** | [axios](https://axios-http.com/) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Lemon Squeezy](https://www.lemonsqueezy.com/) store (for billing)
- A [PostHog](https://posthog.com/) project (for analytics)
- Access to the Flex API (`api.getflex.ai`) — or your own Modal-backed backend

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/flex_ai_dashboard.git
cd flex_ai_dashboard

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local

# Fill in your env vars (see Environment Variables section below)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

The Supabase schema is in `supabase/migrations/`. Apply it to your project:

```bash
# Link to your Supabase project
supabase link --project-ref <your-project-id>

# Push migrations
supabase db push
```

Regenerate TypeScript types after schema changes:

```bash
npm run sync-types
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. **Never commit `.env.local`.**

### Supabase

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_ADMIN` | Supabase service-role (secret) key — server-side only |

### Flex API

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FLEX_API_URL` | Base URL of the Flex API (default: `https://api.getflex.ai`) |

### RunPod (job cancellation)

| Variable | Description |
|---|---|
| `RUNPOD_API_KEY` | RunPod API key used to cancel training jobs |

### Storage (DigitalOcean Spaces / S3)

| Variable | Description |
|---|---|
| `DO_SPACES_ENDPOINT` | Spaces endpoint (e.g. `https://nyc3.digitaloceanspaces.com`) |
| `DO_SPACES_REGION` | Region (e.g. `nyc3`) |
| `DO_SPACES_ACCESS_KEY_ID` | Access key ID |
| `DO_SPACES_SECRET_ACCESS_KEY` | Secret access key |

### Billing — Lemon Squeezy

| Variable | Description |
|---|---|
| `LEMON_SQUEEZY_API_KEY` | Lemon Squeezy API key |
| `LEMON_SQUEEZY_STORE_ID` | Your store ID |
| `LEMON_SQUEEZY_VARIANT_ID` | Product variant ID for balance top-ups |

### Analytics — PostHog

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host (e.g. `https://app.posthog.com`) |

### Affiliates — FirstPromoter

| Variable | Description |
|---|---|
| `FIRSTPROMOTER_API_KEY` | FirstPromoter API key for affiliate tracking |

---

## 🚨 Security Notice

> **If you forked or cloned this repo before these credentials were rotated, treat them as compromised and rotate them immediately.**

The following secrets were previously **hardcoded in source code** and have been removed in this open-source release. They must be set as environment variables:

| File | Secret | Env Var to Use |
|---|---|---|
| `src/lib/server-services/runpod.ts` | RunPod API key | `RUNPOD_API_KEY` |
| `src/lib/server-services/s3.ts` | DigitalOcean Spaces `accessKeyId` | `DO_SPACES_ACCESS_KEY_ID` |
| `src/lib/server-services/s3.ts` | DigitalOcean Spaces `secretAccessKey` | `DO_SPACES_SECRET_ACCESS_KEY` |

### Additional Security Notes

- The Supabase project ID is visible in `package.json` in the `sync-types` script. This is the project identifier (not a secret), but be aware it is public.
- The Lemon Squeezy webhook at `/api/webhook/lemonsqueezy` should be secured with signature verification.
- User AWS credentials (for custom S3 storage) are stored in `profiles` table — ensure RLS policies are tight.
- The playground uses `dangerouslyAllowBrowser: true` in the OpenAI client — this is intentional (the user's own API key is used client-side).
- `.gitignore` only ignores `.env*.local` — make sure you never commit `.env` directly.

---

## Project Structure

```
flex_ai_dashboard/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (dashboard)/            # Authenticated routes (sidebar layout)
│   │   │   ├── page.tsx            # Dashboard overview
│   │   │   ├── tasks/              # Training jobs
│   │   │   ├── models/             # Model catalog
│   │   │   ├── datasets/           # Dataset management
│   │   │   ├── endpoints/          # Inference endpoints
│   │   │   ├── playground/         # Chat playground
│   │   │   ├── billing/            # Balance & payments
│   │   │   ├── usage/              # Usage metrics
│   │   │   └── settings/           # Profile, API keys, storage, etc.
│   │   ├── api/
│   │   │   └── webhook/lemonsqueezy/   # Payment webhook handler
│   │   ├── auth/callback/          # OAuth callback
│   │   ├── sign-in/sign-up/        # Auth pages
│   │   └── onboarding/             # New user onboarding
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── admin-panel/            # Sidebar, navbar, layout shell
│   │   ├── content/                # Page-level feature components
│   │   ├── auth/                   # Auth form components
│   │   └── data-table/             # Reusable data table
│   ├── lib/
│   │   ├── actions/                # Next.js Server Actions
│   │   │   ├── tasks.ts            # Cancel training jobs
│   │   │   ├── checkpoints.ts      # Presigned S3 download URLs
│   │   │   ├── payment.ts          # Lemon Squeezy checkout
│   │   │   └── validations.ts      # AWS credential validation
│   │   ├── server-services/        # Server-side integrations
│   │   │   ├── runpod.ts           # RunPod job cancellation
│   │   │   ├── s3.ts               # S3/Spaces presigned URLs
│   │   │   ├── lemon-squeezy.ts    # Checkout creation
│   │   │   └── affiliates.ts       # FirstPromoter
│   │   ├── client-services/        # Client-side integrations
│   │   │   └── posthog.ts          # Analytics event tracking
│   │   ├── supabase/               # Supabase client factories
│   │   │   ├── browser.ts          # Client-side client
│   │   │   ├── server.ts           # Server-side client
│   │   │   └── admin.ts            # Service-role client
│   │   ├── store/                  # Redux store (endpoint state)
│   │   ├── types/supabase.ts       # Generated DB types
│   │   ├── menu-list.ts            # Sidebar navigation config
│   │   └── constant/index.ts       # App constants
│   ├── providers/                  # React context providers
│   │   ├── query-provider.tsx      # TanStack Query
│   │   ├── theme-provider.tsx      # next-themes
│   │   └── posthog-provider.tsx    # PostHog
│   └── middleware.ts               # Auth + onboarding enforcement
├── supabase/
│   ├── config.toml                 # Local Supabase config
│   └── migrations/                 # SQL schema migrations
├── public/                         # Static assets
├── .env.example                    # Environment variable template
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## API Reference

The dashboard communicates with the Flex API for all compute operations. See the full API docs at [docs.getflex.ai](https://docs.getflex.ai).

Key endpoints used by the dashboard:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/v1/fine_tunes/create_finetune` | Start a fine-tuning job (dispatched to Modal) |
| `POST` | `/v1/datasets/generate_upload_urls` | Get presigned URLs for dataset upload |
| `POST` | `/v1/datasets/create_dataset` | Register a dataset |
| `POST` | `/v1/endpoints/create_regular_endpoint` | Deploy a single-model inference endpoint |
| `POST` | `/v1/endpoints/create_multi_lora_endpoint` | Deploy a Multi-LoRA endpoint |
| `POST` | `/v1/endpoints/stop_endpoint` | Stop a running endpoint |
| `POST` | `/v1/checkpoints/convert_to_gguf` | Convert checkpoint to GGUF format |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a pull request

Please make sure your PR:
- Follows the existing code style (TypeScript, shadcn/ui, Tailwind)
- Does not commit any secrets or credentials
- Includes a description of what changed and why

---

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

---

<p align="center">
  Built with ❤️ by the <a href="https://getflex.ai">Flex AI</a> team
</p>
