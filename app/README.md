# One More Chance App

A simple joke game to play with friends powered by [SvelteKit][sveltekit] and [Socket.io][socketio].

## Disclaimer

This project started as a participation in a Game Jam and continued as a personal project to have a simple game to play with friends. The project is not intended to store any personal or sensitive data. Contributions are welcome.

## Developing

Once you've cloned the project and installed dependencies with `npm install`, start the development server:

```bash
npm run dev

# or start the server open to the local network
npm run dev:host
```

> Remember to create a `.env` file with the db credentials.

### Database

The app uses [Turso][turso] as the sqlite at the edge database.

**IMPORTANT**: The database scripts load the credentials from the `.env.local` file.

## Building

To create a local production build, run:

```bash
npm run build
```

To preview the result, run:

```bash
npm run start:dev
```

> Remember to create a `.env` file with the content of `.env.example` to run the app in production mode.

To create a local build with docker and run it, run:

```bash
docker compose up --build
```

## Manual server

To run the app in a server, create a `.env` file with the content of `.env.example` and run:

```bash
npm run build
npm run start
```

> The app will be hosted on `http://localhost:3000` if the `PORT` environment variable is not set.


## Library and Services attributions

- [Docker](https://www.docker.com/) for the containerization.
- [DrizzleORM][drizzle] for the database ORM.
- [Lucide](https://lucide.dev/) for the icons.
- [Socket.io][socketio] for real-time communication.
- [SvelteKit][sveltekit] for the app framework.
- [SvelteKit-Superforms](https://superforms.rocks/) for the forms handling.
- [TailwindCSS](https://tailwindcss.com/) for the styling.
- [Turso][turso] for the database.

## License

[MIT](../LICENSE).

[drizzle]: https://drizzle.team/
[socketio]: https://socket.io/
[sveltekit]: https://kit.svelte.dev/
[turso]: https://turso.tech/
