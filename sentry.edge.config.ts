// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9665cc42c7386c41c57590cec7680530@o4512067699343360.ingest.de.sentry.io/4512067716317264",

  // Muestreo de trazas. Al 1 (100%) se instrumentaba y reportaba CADA peticion:
  // en /camino son ~30 al montar, y el coste se notaba en la carga. 0.1 da
  // suficiente senal de rendimiento sin pesar en el camino critico; los
  // errores se siguen enviando todos (eso no depende de tracesSampleRate).
  tracesSampleRate: 0.1,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
