# ⚓ Númenor Freight Division (NFD)

The Númenor Freight Division operates as a premier, high-fidelity in-game logistics service for the world of BitCraft. Our mission is to eliminate the tedious hauling bottleneck that cripples large-scale projects, allowing builders and traders to focus on their craft while we handle the roads and seas.

This repository contains the source code for our client-facing web application, built to automate quoting, scheduling, and tracking.

## Table of Contents
- [Key Features](#-key-features)
- [Tech Stack & Infrastructure](#-tech-stack--infrastructure)
- [Setup and Development](#-setup-and-development)
- [Deployment & CI/CD Workflow](#-deployment--cicd-workflow)
- [Project URL](#-project-url)


## 🚀 Key Features

- **Instant Quote Calculator:** Uses a transparent, fixed formula to give clients an immediate price quote.
- **Discord Integration:** Seamless client login using Discord OAuth, allowing for personalized dashboards and automated notifications.
- **Protected Routes:** Ensures client dashboards and the staff dispatch board are only accessible to logged-in users.
- **Real-Time Tracking (Future):** Planned integration with Firestore to provide live updates on cargo status.
- **Professional CI/CD:** Automated testing and deployment on every push to the main branch.

## 🛠️ Tech Stack & Infrastructure

| Component      | Technology         | Role                                                  |
| -------------- | ------------------ | ----------------------------------------------------- |
| **Frontend**   | React              | Core component library for the application interface. |
| **Styling**    | Tailwind CSS       | Utility-first framework for rapid, responsive design. |
| **Routing**    | React Router DOM   | Handles client-side navigation (Single-Page App).     |
| **Database**   | Firebase Firestore | NoSQL cloud database for storing user and contract data.|
| **Hosting & Auth** | Firebase Hosting / Auth | Hosting the static site and managing secure Discord login.|
| **CI/CD**      | GitHub Actions     | Automates quality checks and deployment to Firebase.  |

## ⚙️ Setup and Development

### Prerequisites

- Node.js (v20+): Required for the React environment.
- Firebase CLI: Global installation required:
  ```bash
  npm install -g firebase-tools
  ```

### Local Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/emptyloot/numenor-freight-division.git
cd numenor-freight-division
npm install
```

### Running Locally

To start the development server, run:
```bash
npm start
```

### Development Standards

This project enforces strict coding standards via pre-commit checks and CI:

| Standard      | Tool          | Purpose                                                                 |
| ------------- | ------------- | ----------------------------------------------------------------------- |
| **Formatting**  | Prettier      | Ensures consistent spacing, quotes, and syntax across all files.      |
| **Code Quality**| ESLint        | Flags potential bugs, enforces JSDoc documentation, and maintains style rules. |
| **Testing**     | Jest & RTL    | Unit and integration tests must run successfully, maintaining 80% coverage minimum. |

## 🌐 Deployment & CI/CD Workflow

The project uses a stable `development` -> `staging` -> `main` branching strategy.

| Branch        | Protection                            | Automation                                                              |
| ------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| `development` | Minimal                               | Used for feature work. Merges into `staging`.                           |
| `staging`     | Requires PR + CI Checks               | Runs Lint, Unit Tests, and Build check (`staging-ci.yml`). Ensures stability. |
| `main`        | Requires PR + Code Owner Review + CI/Deploy Checks | Runs full checks and automatically deploys the stable code to Firebase Hosting. |

## Project URL

Primary Hosting URL: [https://numenor-freight-division.web.app](https://numenor-freight-division.web.app)