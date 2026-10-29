# Conectar tus clases de Kodland con Google Calendar

Se hace una sola vez y tarda unos 5 minutos. Usa tu propia cuenta de Google y es gratis.
Una vez conectado, la extensión agrega tus clases a tu calendario **sola, sin que tengas
que pulsar nada** — cada vez que abras una página de grupo en el BO (como mucho una vez
por hora). Cada clase trae aviso 1 hora antes, así te enteras aunque no tengas el BO abierto.

Lo único que viaja a tu calendario es el **nombre del grupo** y el horario de la clase —
nada de alumnos ni datos personales.

## 1. Crear el script

1. Entra en https://script.google.com con tu cuenta de Google y pulsa **Nuevo proyecto**.
2. Arriba a la izquierda, cambia el nombre "Proyecto sin título" por **Kodland Calendario**.
3. Borra todo lo que hay en el editor y pega el contenido de [`Codigo.gs`](Codigo.gs) (está en esta misma carpeta).
4. En el BO: botón ⚙️ Configuración → sección **Google Calendar**. Copia la **clave** que aparece ahí.
5. En el script, cambia `PEGA_AQUI_LA_CLAVE` por esa clave (deja las comillas).
6. Pulsa 💾 **Guardar**.

## 2. Publicarlo como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙️ junto a "Seleccionar tipo", elige **Aplicación web**.
3. Rellena:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Pulsa **Implementar**. Google te pedirá permiso para usar tu calendario: **Autorizar acceso** → elige tu cuenta.
   Si sale "Google no ha verificado esta aplicación", pulsa **Configuración avanzada → Ir a Kodland Calendario**
   (es tu propio script, solo lo usas tú).
5. Copia la **URL de la aplicación web** (termina en `/exec`).

## 3. Pegarla en la extensión

1. En el BO → ⚙️ Configuración → **Google Calendar**, pega la URL.
2. Pulsa **Guardar**.

Listo. No hace falta volver a tocar nada — la próxima vez que abras un grupo en el BO,
la extensión sincroniza tus clases de los próximos 30 días. Las que cambian de hora se
mueven, las que desaparecen del BO se borran del calendario.

## Notas

- "Cualquier usuario" significa que la URL acepta peticiones, pero sin la clave no hace
  nada. No compartas la URL ni la clave con nadie.
- Si cambias el código del script, hay que volver a **Implementar → Gestionar
  implementaciones → editar (lápiz) → Versión: nueva**.
