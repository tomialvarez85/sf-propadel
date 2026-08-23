# SF ProPadel

Tienda online de artículos de pádel: paletas, indumentaria, calzado, accesorios y bolsos.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/) + PostgreSQL (Supabase)
- [Supabase](https://supabase.com/) Auth + Storage (los datos del catálogo viven en Prisma, Supabase se usa solo para login de admin y almacenamiento de imágenes)
- ESLint + Prettier

## Requisitos

- Node.js 18.18 o superior
- npm
- Un proyecto de Supabase (base Postgres + Auth + Storage)

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores reales. En Vercel se configuran en **Project Settings → Environment Variables** (ver sección de deploy más abajo).

| Variable                        | Para qué se usa                                                                                                                                                                                                                                                                                                                                                                                           | Dónde conseguirla                                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Conexión de Prisma en runtime a la base Postgres de Supabase. Tiene que usar el **connection pooler en modo transacción** (puerto `6543`, `pgbouncer=true`), no la conexión directa (puerto `5432`) — en un entorno serverless como Vercel cada invocación puede abrir su propia conexión, y la directa agota rápido el límite de conexiones de Supabase.                                                 | Botón **Connect** (arriba a la derecha del dashboard) → pestaña "ORMs" → Prisma, o pestaña de conexión → modo "Transaction". Reemplazar `[YOUR-PASSWORD]` por la contraseña de la base (Database → Settings → Database password) |
| `DIRECT_URL`                    | Conexión que usa **solo** `prisma migrate dev` / `migrate deploy` para correr migraciones — nunca en runtime de la app. El pooler en modo transacción no soporta las sentencias que necesitan las migraciones, así que hace falta una conexión en modo **session** (mismo host/usuario/contraseña que `DATABASE_URL`, puerto `5432`, sin `pgbouncer`).                                                    | Mismo modal "Connect" que `DATABASE_URL`, pestaña de conexión → modo "Session"                                                                                                                                                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto, usada por el SDK de Supabase en el navegador (login de admin, subida de imágenes a Storage). Pública.                                                                                                                                                                                                                                                                                   | Supabase → Project Settings → API                                                                                                                                                                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública, usada junto con la URL de arriba.                                                                                                                                                                                                                                                                                                                                                  | Supabase → Project Settings → API                                                                                                                                                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | **No se usa actualmente** en ninguna Server Action de este repo: las subidas de imágenes se hacen desde el cliente con la sesión del admin logueado, protegidas por políticas RLS del bucket de Storage. Solo hace falta si en el futuro se agrega una operación server-side que necesite bypassear RLS — en ese caso, nunca exponerla con el prefijo `NEXT_PUBLIC_` ni usarla desde un Client Component. | Supabase → Project Settings → API                                                                                                                                                                                                |
| `RESEND_API_KEY`                | Envía el mail de aviso de pedido nuevo (`src/lib/email.ts`, `sendOrderNotificationEmail`). Ver "Emails de pedidos con Resend" más abajo para el paso a paso.                                                                                                                                                                                                                                             | resend.com → **API Keys** → **Create API Key**                                                                                                                                                                                   |
| `RESEND_FROM_EMAIL`             | Opcional. Remitente del mail de pedido. Sin configurar, usa el sandbox de Resend (`onboarding@resend.dev`) — anda para probar, pero solo entrega al mail con el que te registraste en Resend. Ver la sección de abajo antes de ir a producción.                                                                                                                                                        | —                                                                                                                                                                                                                                  |

## Emails de pedidos con Resend

`src/lib/email.ts` manda un mail a `SiteSettings.emailPedidos` (configurable en `/admin/configuracion`) cada vez que se registra un pedido — hoy la función existe y se puede probar a mano, pero **todavía no está conectada al flujo del carrito**.

### 1. Conseguir una API key gratis

1. Creá una cuenta en [resend.com](https://resend.com) (el plan free alcanza para este uso — cientos de mails/mes).
2. **API Keys** en el menú → **Create API Key** → nombre cualquiera, permisos "Sending access" → copiá la key (empieza con `re_`, solo se muestra una vez).
3. Pegala en `.env` como `RESEND_API_KEY`.

### 2. Remitente: sandbox vs dominio propio

- **Para arrancar/probar, no hace falta nada más**: Resend da un remitente de pruebas (`onboarding@resend.dev`) que funciona sin configurar dominio. La limitación real: en este modo **solo entrega al mismo email con el que te registraste en Resend** — mandarle a cualquier otra dirección falla silenciosamente o rebota. Sirve para el mail de prueba manual de este paso, no para producción real (el dueño del negocio probablemente quiere recibir en su propio mail, no en el tuyo de prueba).
- **Para producción, verificá un dominio propio**: Resend → **Domains** → **Add Domain** → cargás 2-3 registros DNS (`TXT`/`MX`/`CNAME` para SPF/DKIM) donde tengas el dominio del sitio (`sfpropadel.com.ar` o similar) → Resend valida en minutos a horas. Una vez verificado, remitente tipo `pedidos@sfpropadel.com.ar` puede mandarle a cualquier destinatario, y con SPF/DKIM configurados baja mucho el riesgo de caer en spam (mandar sin dominio verificado, o desde un dominio sin esos registros, es la causa más común de que estos avisos terminen en spam).
- Configurado el dominio, seteá `RESEND_FROM_EMAIL="SF ProPadel <pedidos@tudominio.com>"` en `.env` (y en Vercel al deployar) — sin esa variable, sigue usando el sandbox.

### 3. Probar que funciona

Con `RESEND_API_KEY` en `.env` (y `SiteSettings.emailPedidos` cargado en `/admin/configuracion`, aunque sea con tu propio mail para la prueba), correr un envío de prueba puntual — pedile a Claude que lo corra, o a mano:

```ts
import { sendOrderNotificationEmail } from "@/lib/email";

await sendOrderNotificationEmail({
  id: "test-1",
  nombreCliente: "Cliente de prueba",
  emailCliente: "cliente@example.com",
  telefonoCliente: "5491122334455",
  total: 78000,
  createdAt: new Date(),
  items: [
    { nombreProducto: "Paletero Nox Team Bag", variante: null, cantidad: 1, precioUnitario: 78000 },
  ],
});
```

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador. La app se recarga automáticamente al editar archivos.

## Scripts disponibles

| Script                 | Descripción                                                                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Levanta el servidor de desarrollo                                                                                                                                    |
| `npm run build`        | Genera el build de producción                                                                                                                                        |
| `npm run start`        | Corre el build de producción                                                                                                                                         |
| `npm run lint`         | Corre ESLint sobre el proyecto                                                                                                                                       |
| `npm run format`       | Formatea todo el proyecto con Prettier                                                                                                                               |
| `npm run format:check` | Verifica el formato sin modificar archivos                                                                                                                           |
| `postinstall`          | (Automático, no se corre a mano) `prisma generate` después de cada `npm install` — regenera el cliente de Prisma en `src/generated/prisma`, que está en `.gitignore` |

## Estructura de carpetas

```
src/
  app/
    layout.tsx        # Layout raíz (fuentes, metadata global)
    globals.css        # Estilos globales / Tailwind
    (site)/            # Route group: vista pública / cliente
      layout.tsx        # Header + footer de la tienda
      page.tsx           # Home ("/")
      productos/
        page.tsx          # Catálogo ("/productos")
    (admin)/            # Route group: panel de administración
      layout.tsx          # Layout con sidebar de admin
      admin/
        page.tsx            # Dashboard ("/admin")
        productos/
          page.tsx            # Gestión de productos ("/admin/productos")
```

Los [route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) `(site)` y `(admin)` permiten tener layouts y estilos independientes para la vista pública y el panel de administración sin que el nombre del grupo aparezca en la URL.

## Convenciones

- El formateo de código se aplica con Prettier (incluye `prettier-plugin-tailwindcss` para ordenar clases automáticamente).
- ESLint usa la configuración de Next.js (`next/core-web-vitals`, `next/typescript`) con `eslint-config-prettier` para evitar conflictos con Prettier.

## Deploy en Vercel

### 1. Configurar las variables de entorno en Vercel

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. En el proyecto → **Settings → Environment Variables**, cargá `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver tabla en la sección "Variables de entorno" más arriba) para los entornos **Production** y **Preview**. Dejá `SUPABASE_SERVICE_ROLE_KEY` sin configurar salvo que se agregue código que la necesite.
3. `DATABASE_URL` tiene que ser la connection string del **pooler en modo transacción** de Supabase (puerto `6543`, `?pgbouncer=true`), no la conexión directa. `DIRECT_URL` no hace falta en Vercel para el runtime de la app (solo la usan los comandos de migración), pero no está de más tenerla cargada igual por si algún día se automatiza `migrate deploy` desde el build.
4. Next.js pre-renderiza páginas como la home usando datos reales en build time, así que las variables tienen que existir también durante el build, no solo en runtime — Vercel las inyecta en ambos momentos por default al cargarlas en Environment Variables, no requiere configuración extra.
5. `prisma generate` corre solo: está enganchado al hook `postinstall` de `package.json`, así que se ejecuta automáticamente después de cada `npm install` que hace Vercel antes de buildear.

### 2. Correr las migraciones en producción

El repo incluye una migración inicial en `prisma/migrations/`, creada y aplicada con `prisma migrate dev --name init` corriendo contra la base real de Supabase de este proyecto — las tablas ya existen en la base. Para aplicar esa misma migración (o las que se agreguen después) contra otro entorno:

```bash
npx prisma migrate deploy
```

Lee `DATABASE_URL` y `DIRECT_URL` de `.env` (o de las variables de entorno del shell donde lo corras) — no hace falta pasarlas inline si ya están en `.env`.

- Se puede correr localmente apuntando a producción (con la `DATABASE_URL`/`DIRECT_URL` de ese entorno) antes o justo después del deploy.
- `migrate deploy` es idempotente: cada vez que se corre, solo aplica las migraciones que todavía no estén registradas en la tabla `_prisma_migrations` de la base, así que es seguro repetirlo en cada release.
- Este repo no dispara `migrate deploy` automáticamente desde el build de Vercel (no está incluido en `postinstall` ni en `build`) para evitar aplicar cambios de schema sin que alguien lo revise antes — se corre a mano cuando hay una migración nueva para aplicar. Si preferís automatizarlo, se puede agregar `npx prisma migrate deploy &&` al comienzo del script `build`, o correrlo como un paso separado en un GitHub Action antes del deploy.

### 3. Crear el primer usuario admin

El panel de `/admin` usa Supabase Auth para el login (no hay un sistema de usuarios propio). El primer admin se crea así:

1. En el dashboard de Supabase → **Authentication → Users → Add user → Create new user**, cargá email y contraseña, y tildá **Auto Confirm User** (así no depende de que llegue un mail de confirmación).
2. Entrá a `https://tu-proyecto.vercel.app/admin/login` y logueate con ese email y esa contraseña.
3. En ese primer login la app crea automáticamente la fila correspondiente en la tabla `AdminUser` de Prisma, vinculada por `supabaseUserId` — no hace falta insertarla a mano en la base. La lógica está en `getOrCreateAdminUser` (`src/lib/admin-auth.ts`), que se llama desde el middleware y desde cada Server Action del admin.
4. Por default el `AdminUser` nuevo queda con `rol: "admin"` y `nombre` igual a la parte del email antes del `@`. Si querés un nombre distinto, hoy se edita directamente en la base (todavía no hay una UI de gestión de usuarios admin).

Para sumar más admins más adelante, se repite el mismo flujo: crear el usuario en Supabase Auth y loguearse una vez en `/admin/login`.

### 4. Verificar el bucket de Storage y sus políticas RLS

Las imágenes (productos, banners, categorías, marcas, logo, etc.) se suben desde el cliente al bucket `product-images` de Supabase Storage (ver `UPLOADS_BUCKET` en `src/lib/supabase/storage.ts`). Ese bucket y sus políticas **no están versionados en este repo** — se crean a mano en el dashboard de Supabase, así que:

- **Si producción usa el mismo proyecto de Supabase que desarrollo**: no hay nada que hacer, el bucket y las políticas ya existen.
- **Si producción usa un proyecto de Supabase distinto** (recomendado para no mezclar datos de prueba con datos reales): hay que recrear el bucket a mano en el proyecto nuevo:
  1. Supabase dashboard → **Storage** → **New bucket** → nombre `product-images`, marcado como **Public bucket** (las imágenes se sirven con URL pública, sin firma).
  2. Agregar políticas RLS sobre `storage.objects` para ese bucket: lectura pública (`SELECT` para el rol `anon`/`public`) y escritura solo para admins logueados (`INSERT`/`UPDATE`/`DELETE` para el rol `authenticated`). Sin la política de escritura, el admin logueado no va a poder subir imágenes aunque el login funcione.
  3. Confirmar que `next.config.ts` (`images.remotePatterns`) sigue cubriendo el dominio del proyecto nuevo — ya cubre `**.supabase.co` como wildcard, así que no hace falta tocarlo salvo que el proyecto nuevo sirva imágenes desde otro dominio.

## Datos de prueba (seed)

`prisma/seed.ts` (`npx prisma db seed`) carga categorías, marcas, productos, banners y una fila de `SiteSettings` **de prueba** — imágenes placeholder de `placehold.co`, WhatsApp y email falsos, dirección ficticia. Sirve para tener datos con los que trabajar en desarrollo.

**No correrlo contra la base de producción.** Sobreescribiría (vía `upsert`) los datos reales de `SiteSettings`, categorías y marcas que el dueño del negocio haya cargado, y mezclaría productos de prueba con el catálogo real. La app en producción arranca con la base vacía (después de `migrate deploy`) y se carga a mano desde `/admin`.

### Imágenes placeholder de demo

`scripts/seed-placeholder-images.ts` (`npx tsx scripts/seed-placeholder-images.ts`) reemplaza el placeholder gris de `placehold.co` de los 12 productos del seed por fotos de stock genéricas (sin marca) de [Pexels](https://www.pexels.com/api/), agrupadas por categoría (paletas, indumentaria, calzado, accesorios, bolsos). Sirve para mostrarle el catálogo a un cliente con aspecto visual completo mientras se consiguen las fotos reales — **no son las fotos reales del producto y hay que reemplazarlas antes de cualquier lanzamiento público.** No pisa productos que ya tengan una foto real cargada (cualquier imagen que no sea de `placehold.co`).

Requiere una API key gratis de Pexels:
1. Entrar a https://www.pexels.com/api/ y crear una cuenta gratis (o loguearse).
2. Completar el formulario corto de "Get Started" (para qué se va a usar — alcanza con algo como "demo images for an e-commerce catalog").
3. La key se genera al instante, sin aprobación ni espera.
4. Agregarla a `.env` como `PEXELS_API_KEY="..."` (nunca commitear este archivo — ya está en `.gitignore`).

Licencia de Pexels: uso comercial libre, sin costo, atribución no obligatoria pero valorada — el script imprime el nombre del fotógrafo y el link de cada foto usada por si se quiere acreditar.
