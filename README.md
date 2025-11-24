# ⚓ Númenor Freight Division (NFD)

The Númenor Freight Division operates as a premier, high-fidelity in-game logistics service for the world of BitCraft. Our mission is to eliminate the tedious hauling bottleneck that cripples large-scale projects, allowing builders and traders to focus on their craft while we handle the roads and seas.

This repository contains the source code for our client-facing web application, built to automate quoting, scheduling, and tracking.

## Table of Contents

  * [Key Features](#🚀-key-features)
  * [Tech Stack & Infrastructure](#🛠️-tech-stack--infrastructure)
  * [Setup and Development](#⚙️-setup-and-development)
  * [Discord Configuration](#👾-discord-configuration)
  * [Deployment & CI/CD Workflow](#🌐-deployment--cicd-workflow)
  * [Project URL](#project-url)

## 🚀 Key Features

  * **Instant Quote Calculator:** Uses a transparent, fixed formula to give clients an immediate price quote.
  * **Discord Integration:** Seamless client login using Discord OAuth, allowing for personalized dashboards and automated notifications.
  * **Protected Routes:** Ensures client dashboards and the staff dispatch board are only accessible to logged-in users.
  * **Real-Time Tracking:** Integration with Firestore to provide live updates on cargo status.
  * **Professional CI/CD:** Automated testing and deployment to staging and production environments.

## 🛠️ Tech Stack & Infrastructure

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React | Core component library for the application interface. |
| **Styling** | Tailwind CSS | Utility-first framework for rapid, responsive design. |
| **Routing** | React Router DOM | Handles client-side navigation (Single-Page App). |
| **Database** | Firebase Firestore | NoSQL cloud database for storing user and contract data. |
| **Hosting & Auth** | Firebase Hosting / Auth | Hosting the static site and managing secure Discord login. |
| **CI/CD** | GitHub Actions | Automates quality checks and deployment to Firebase. |

## ⚙️ Setup and Development

### Prerequisites

  * Node.js (v20+): Required for the React environment.
  * Firebase CLI: Global installation required:
    ```bash
    npm install -g firebase-tools
    ```

### Local Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/emptyloot/numenor-freight-division.git
    cd numenor-freight-division
    ```
2.  **Install dependencies**
    ```bash
    #Easy setup script Root and Backend
    npm run setup

    # Or

    # 1. Install React (Root) dependencies
    npm install

    # 2. Install Functions (Backend) dependencies
    cd functions
    npm install
    cd ..
    ```
3.  **Environment Setup:**
      * Copy `.env.example` to `.env` (Root) and `.env` (Functions).
      * The project uses `demo-` keys for Firebase, so **no Google Cloud credentials are needed** for local dev.
      * You **will** need Discord credentials (see [Discord Configuration](#👾-discord-configuration)).

### Running Locally

We use Firebase Emulators to simulate the entire backend locally. Choose the mode that fits your task:

#### 🟢 Option A: Standard Dev (Recommended)

Fast startup. Runs Auth, Firestore, Functions, and Hosting. **Does not run Pub/Sub.**

```bash
npm start
```

*Use this for frontend work, quoting logic, or standard auth flow.*

#### 🤖 Option B: Discord Bot Features

Runs everything in Option A **plus the Pub/Sub emulator**.

```bash
npm run start:bot
```

*Use this ONLY if you are testing Discord messaging triggers or background bot tasks.*

### ⚠️ Troubleshooting: "Port Taken" Errors

If you run **Option B** and stop it forcefully, the Java process for Pub/Sub may become a "zombie" and hold port 8085 open. If you see a `Port 8085 is taken` error on restart:

**Mac/Linux (One-liner):**
```bash
lsof -ti :8086 | xargs kill -9
```

**Windows (Two steps):**

1.  Find the PID:
    ```bash
    netstat -ano | findstr :8086
    ```
2.  Kill it:
    ```bash
    taskkill /PID <PID_FROM_STEP_1> /F
    ```

## 👾 Discord Configuration

To log in locally, you must create your own Discord App. We do not check these keys into source control.

1.  Go to the [Discord Developer Portal](https://www.google.com/search?q=https://discord.com/developers/applications).
2.  Create a New Application (e.g., `development-bot-<YourName>`).
3.  **For Login (Standard):**
      * Go to **OAuth2**.
      * Add Redirect URI: `http://localhost:5000/api/auth/discord` (or your local callback URL).
      * Copy **Client ID** and **Client Secret** into your functions `.env`.
4.  **For Bot Messaging (Optional):**
      * Go to **Bot** -\> Reset Token.
      * Copy the **Token** into your `.env` as `DISCORD_BOT_TOKEN`.
      * Invite the bot to your private test server and grab the Channel ID.

## 🌐 Deployment & CI/CD Workflow

We follow a strict promotion strategy to ensure stability.

| Branch | Role | Automation Triggered |
| :--- | :--- | :--- |
| `feature/*` | Active Development | Local testing via Emulators. Merges to `development`. |
| `development` | Integration Branch | Merges to `staging`. |
| `staging` | Pre-Production / QA | **1. Coverage Tests:** Runs full test suite.<br>**2. Deploy:** Deploys to Staging URL for QA. |
| `main` | Production | **Deploy:** Deploys immediately to the Production URL upon merge. |

### Development Standards

| Standard | Tool | Purpose |
| :--- | :--- | :--- |
| **Formatting** | Prettier | Ensures consistent spacing, quotes, and syntax across all files. |
| **Code Quality** | ESLint | Flags potential bugs, enforces JSDoc documentation, and maintains style. |
| **Testing** | Jest & RTL | Unit tests must pass 80% coverage before merging to `staging`. |

## Project URL

Primary Hosting URL: [https://numenor-freight-division.web.app](https://numenor-freight-division.web.app)