// Kodland → Google Calendar
// Recibe las clases que manda la extensión "Kodland Tutor Assistant" y las
// crea o actualiza en tu calendario principal, con aviso 1 hora antes.
// A propósito el evento trae SOLO el nombre del grupo como título (nada de
// alumnos, curso ni enlaces) — es lo mínimo que hace falta para que Calendar
// te avise antes de que empiece la clase, incluso si no tienes el BO abierto.
// Cada clase se identifica por su id de Kodland, así que no se duplican; si
// una clase futura desaparece del BO (cancelada o movida), se borra.

// Pega aquí la clave que te muestra la extensión en ⚙️ Configuración.
const CLAVE = 'PEGA_AQUI_LA_CLAVE';

const AVISO_MINUTOS = 60;
// Morado ("Uva" en Google Calendar), para distinguir tus clases de Kodland.
const COLOR = CalendarApp.EventColor.MAUVE;
// Pausa tras cada evento creado, cambiado o borrado, para no chocar con el límite de Google.
const PAUSA_MS = 1000;

// Si algo falla, se responde el error en texto para que la extensión lo muestre
// (si no, Google devuelve una página de error que no dice nada útil).
function doPost(e) {
  try {
    return sincronizar(JSON.parse(e.postData.contents));
  } catch (error) {
    return responder({ ok: false, error: String(error && error.message || error) });
  }
}

function sincronizar(datos) {
  if (datos.clave !== CLAVE) return responder({ ok: false, error: 'Clave incorrecta' });

  const calendario = CalendarApp.getDefaultCalendar();
  const desde = new Date(datos.desde);
  const hasta = new Date(datos.hasta);

  const existentes = {};
  calendario.getEvents(desde, hasta).forEach(evento => {
    const id = evento.getTag('kodlandId');
    if (id) existentes[id] = evento;
  });

  let creadas = 0, actualizadas = 0, borradas = 0, limitado = false;
  const recibidas = {};
  (datos.vigentes || []).forEach(id => { recibidas[String(id)] = true; });
  datos.clases.forEach(clase => { recibidas[String(clase.id)] = true; });

  try {
    for (const clase of datos.clases) {
      const id = String(clase.id);
      const inicio = new Date(clase.inicio);
      const fin = new Date(clase.fin);
      const evento = existentes[id];
      if (evento) {
        if (actualizarEvento(evento, clase, inicio, fin)) {
          actualizadas++;
          Utilities.sleep(PAUSA_MS);
        }
      } else {
        const nuevo = calendario.createEvent(clase.titulo, inicio, fin);
        nuevo.setTag('kodlandId', id);
        nuevo.setColor(COLOR);
        nuevo.removeAllReminders();
        nuevo.addPopupReminder(AVISO_MINUTOS);
        creadas++;
        Utilities.sleep(PAUSA_MS);
      }
    }

    // La extensión manda las clases por partes y al final una petición "limpiar"
    // con todas las vigentes: las clases futuras que ya no están en el BO se borran.
    if (datos.limpiar) {
      const ahora = new Date();
      for (const id of Object.keys(existentes)) {
        if (!recibidas[id] && existentes[id].getStartTime() > ahora) {
          existentes[id].deleteEvent();
          borradas++;
          Utilities.sleep(PAUSA_MS);
        }
      }
    }
  } catch (error) {
    // Google limita cuántos eventos se crean o cambian seguidos. Lo hecho queda
    // hecho; la extensión vuelve a intentar lo que falte en la próxima sincronización.
    if (!/too many|demasiad/i.test(String(error))) throw error;
    limitado = true;
  }

  return responder({ ok: true, creadas, actualizadas, borradas, limitado });
}

// Cambia solo lo que sea distinto (cada cambio cuenta para el límite de Google).
// Devuelve true si tocó algo.
function actualizarEvento(evento, clase, inicio, fin) {
  let cambiado = false;
  if (evento.getStartTime().getTime() !== inicio.getTime() || evento.getEndTime().getTime() !== fin.getTime()) {
    evento.setTime(inicio, fin);
    cambiado = true;
  }
  if (evento.getTitle() !== clase.titulo) { evento.setTitle(clase.titulo); cambiado = true; }
  if (evento.getColor() !== COLOR) { evento.setColor(COLOR); cambiado = true; }
  const avisos = evento.getPopupReminders();
  if (avisos.length !== 1 || avisos[0] !== AVISO_MINUTOS) {
    evento.removeAllReminders();
    evento.addPopupReminder(AVISO_MINUTOS);
    cambiado = true;
  }
  return cambiado;
}

function doGet() {
  return responder({ ok: true, mensaje: 'Kodland → Google Calendar funcionando' });
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
