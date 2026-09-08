import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local agent tooling and backups are not product source.
    ".agents/**",
    ".claude/**",
    "skills-lock.json",
    "*.bak",
  ]),
  // A23 de la auditoría del 7-8 de septiembre de 2026: 7 de los 12 errores de
  // eslint del repo no eran errores del producto, sino scripts de Node
  // (semillas, smokes, utilidades de depuración) analizados con las reglas de
  // Next y del navegador: `require` marcado como prohibido en un .cjs, o la
  // variable `module` en un .mjs. Son ficheros que se ejecutan con `node`, no
  // se empaquetan y nunca llegan al cliente.
  //
  // Esto importa más de lo que parece: mientras el lint tenga errores
  // permanentes por ruido, nadie puede ponerlo como puerta en CI, y entonces
  // tampoco avisa de los errores de verdad. Limpiar el ruido es lo que permite
  // que el resto sirva para algo.
  {
    files: ["scripts/**/*.cjs", "scripts/**/*.mjs", "scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@next/next/no-assign-module-variable": "off",
    },
  },
  // Los 5 errores restantes son todos react-hooks/set-state-in-effect, y los 5
  // son el mismo patrón obligado por el renderizado en servidor: leer algo que
  // solo existe en el navegador (localStorage del consentimiento, la fecha
  // local de la cuenta atrás de la waitlist, si el componente ya hidrató) y
  // guardarlo en estado después de montar. Hacerlo durante el render daría
  // desajuste servidor/cliente, que es un fallo peor y visible.
  //
  // No se puede silenciar caso por caso: los comentarios de desactivación por
  // línea para esta regla se registran como "directiva sin usar" y el error
  // sigue saliendo igual — en PhilosophyExamWorkspace.tsx ya había seis
  // intentos previos, todos inertes. La regla la emite el compilador de React
  // por otra vía y no pasa por el filtro de directivas.
  // (Y ojo: escribir ese comentario al principio de una línea aquí hace que
  // ESLint lo tome por una directiva de verdad y falle. Por eso va descrito.)
  //
  // Así que baja a aviso en vez de error. Sigue viéndose en cada `npm run
  // lint`, pero deja de ser el motivo por el que el lint nunca puede ser una
  // puerta en CI. Si aparece un caso de verdad (una cascada de renders real),
  // se ve igual en la lista de avisos. Revertir esto es cambiar una palabra.
  {
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
