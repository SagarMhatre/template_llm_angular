# AngularLlm

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9 and is intended to run entirely inside Docker so that no global Angular CLI or Node installation is required locally. A lightweight Express server (powered by `volcano-sdk`) runs alongside the Angular dev server to proxy OpenAI calls securely from the browser.

## Docker-first workflow

1. Build/start the dev container (downloads Node 22 image the first time):

   ```bash
   docker compose up
   ```

   - Angular dev server: `http://localhost:4200/`
   - Volcano-powered API proxy: `http://localhost:4300/api`

   File watching relies on polling, so it works reliably across Docker Desktop/WSL.

2. Stop the server with `Ctrl+C` in the compose terminal or run `docker compose down`.

3. Run one-off CLI commands through the container, for example:

   ```bash
   docker compose run --rm angular npx ng generate component example
   docker compose run --rm angular npm run test
   docker compose run --rm angular npm run build
   ```

   A named Docker volume is used for `node_modules`, so dependencies stay inside Docker and survive restarts without touching your host environment.

## Volcano SDK proxy

- Location: `server/index.mjs`
- Stack: Express + `volcano-sdk` (calling OpenAI via the `llmOpenAI` helper)
- Endpoint: `POST /api/prompt` with JSON `{ "apiKey": "sk-...", "prompt": "..." }`
- Response: `{ "response": "<model output>" }` or `{ "error": "<message>" }`

The Angular UI collects the OpenAI API key and prompt from the user, forwards them to `/api/prompt`, and displays whatever the Volcano agent returns. Because the proxy runs within the same container, requests from `ng serve` are routed through `proxy.conf.json`, keeping everything on `localhost:4200`.

Environment overrides:

- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `API_PORT` (default `4300`)
- `API_HOST` (default `0.0.0.0`)

## Development server

To start a local development server outside Docker, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files. (The Docker workflow above runs the same command inside the container.)

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
