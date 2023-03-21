// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          name: "description",
          content: "Trello PowerUp Library by proclaim productions",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://trello.com/power-ups/power-up.css",
        },
      ],
      script: [
        {
          src: "https://p.trellocdn.com/power-up.min.js",
          crossorigin: "anonymous",
          tagPosition: "head",
        },
      ],
    },
  },
  css: ["@/assets/scss/global.scss"],
  imports: {
    autoImport: false,
  },
  ssr: true,
  routeRules: {
    "/*": { cors: true },
  },
  devServer: {
    port: 5555,
  },
  vite: {
    server: {
      strictPort: true,
      hmr: {
        protocol: "wss",
        clientPort: 443,
        port: 5551,
        path: "/socket.io",
      },
    },
  },
});
