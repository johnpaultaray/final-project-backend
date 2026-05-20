# Angular 21 Boilerplate

A production-ready Angular 21 boilerplate with a complete authentication system, role-based access control, and a mock backend for development.

Built with **Angular 21.2.10**, **Bootstrap 5.3.3**, and **LESS**.

## Features

- **Authentication & Account Management**
  - User registration with email verification
  - Login / Logout
  - JWT token management (refresh & revoke)
  - Forgot password / Reset password flow
  - Persistent sessions via local storage

- **Role-Based Access Control**
  - Two roles: `User` and `Admin`
  - Auth guard protects routes from unauthorized access
  - Admin-only routes enforce role restrictions

- **User Profile Management**
  - View and update account details
  - Change email and password

- **Admin Panel**
  - List, create, edit, and delete user accounts
  - Role assignment

- **Development Tools**
  - Fake backend interceptor for offline development (no real API required)
  - JWT interceptor (auto-attaches token to requests)
  - Error interceptor (global HTTP error handling)
  - Alert/notification system for user feedback

- **Modern Angular Architecture**
  - Standalone components with optional NgModules for lazy-loaded feature modules
  - Reactive Forms for form handling
  - HTTP interceptors for cross-cutting concerns
  - Lazy-loaded routes for `Account`, `Profile`, and `Admin` modules

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.19.1 or later)
- npm (included with Node.js)
- Angular CLI (optional, install globally: `npm install -g @angular/cli`)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/johnpaultaray/angular-21-boilerplate.git

# Navigate into the project
cd angular-21-boilerplate

# Install dependencies
npm install

# Start the development server
npm start
```

Navigate to `http://localhost:4200`. The app runs with a fake backend by default, so no external API is needed.

## Available Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm start`       | Start development server (`ng serve`)          |
| `npm run build`   | Build for production (`ng build`)              |
| `npm run watch`   | Build in watch mode (development configuration)|
| `npm test`        | Run unit tests via Karma (`ng test`)           |

## Project Structure

```
src/
├── app/
│   ├── _components/        # Shared components (AlertComponent)
│   ├── _helpers/           # Guards, interceptors, initializer, validators, fake backend
│   │   ├── auth.guard.ts
│   │   ├── app.initializer.ts
│   │   ├── jwt.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   ├── fake-backend.ts
│   │   └── must-match.validator.ts
│   ├── _models/            # Data models & enums (Account, Alert, Role)
│   ├── _services/          # API services (AccountService, AlertService)
│   ├── account/            # Account module (login, register, verify, password reset)
│   ├── admin/              # Admin module (user management CRUD)
│   ├── home/               # Home page
│   ├── profile/            # Profile module
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.config.ts
│   └── app.module.ts       # (Legacy NgModule wrapper, standalone is primary entry)
├── environments/           # Environment configuration
├── index.html
├── main.ts                 # App bootstrap (standalone)
├── styles.less             # Global styles
```

### Key Architecture Decisions

- **Standalone-first**: The app bootstraps via `bootstrapApplication` in `main.ts` with `appConfig` providers.
- **Hybrid module support**: Feature modules (`AccountModule`, `AdminModule`, `ProfileModule`) are lazy-loaded via the traditional NgModule approach for organizational clarity.
- **Fake backend**: In development mode (`environment.production = false`), the `FakeBackendInterceptor` intercepts all HTTP requests and simulates API responses. The first registered user automatically becomes an Admin.
- **Two entry points**: `app.module.ts` is available but the primary bootstrap is standalone via `main.ts` → `AppComponent`.

## Routes

| Path              | Component / Module       | Auth Required | Role Required |
| ----------------- | ------------------------ | :-----------: | :-----------: |
| `/`               | HomeComponent            | Yes           | —             |
| `/account/login`  | AccountModule (lazy)     | No            | —             |
| `/account/register`| AccountModule (lazy)    | No            | —             |
| `/profile`        | ProfileModule (lazy)     | Yes           | —             |
| `/admin`          | AdminModule (lazy)       | Yes           | Admin         |

## Tech Stack

| Technology       | Version       |
| ---------------- | ------------- |
| Angular          | 21.2.10       |
| Angular CLI      | 21.2.10       |
| TypeScript       | ~5.9.2        |
| Bootstrap        | 5.3.3         |
| RxJS             | 7.8.2         |
| Zone.js          | 0.15.0        |
| Less             | (via Angular) |

## Testing

Run unit tests with Karma and Jasmine:

```bash
npm test
```

Test files are placed alongside their components by convention.

## Building for Production

```bash
npm run build
```

The production build is output to `dist/angular-21-boilerplate/`. It includes:

- AOT compilation
- Output hashing for cache busting
- Budget warnings at 500 kB (initial) / 2 kB (per component style)
- Source maps disabled for production
- The fake backend is **excluded** in production builds

## Environment Configuration

| File                            | Usage         |
| ------------------------------- | ------------- |
| `src/environments/environment.ts`        | Development   |
| `src/environments/environment.prod.ts`   | Production    |

The `production` flag controls whether the fake backend interceptor is registered. Set it to `true` for production deployments with a real API.
