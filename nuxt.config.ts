// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
