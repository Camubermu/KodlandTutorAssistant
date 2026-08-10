// Module to fetch and display student information on group pages
// Activates on: https://bo.kodland.org/groups/{id}

// ---------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------
// Everything the tutor sees (buttons, modals, alerts) and everything sent
// to students/parents over WhatsApp is written in this language. Arabic is
// the default; the tutor can pick another one - or "auto", which restores
// the old behaviour of following Kodland's own language selector - from
// the ⚙️ settings modal.
const DEFAULT_MESSAGE_LANGUAGE = 'auto';

// Languages that have a full set of message translations in this file.
const SUPPORTED_MESSAGE_LANGUAGES = ['ar', 'es', 'en', 'ru', 'fr', 'tr', 'id', 'it', 'pl', 'pt'];

const LANGUAGE_LABELS = {
  auto: 'Auto',
  ar: 'العربية',
  es: 'Español',
  en: 'English',
  ru: 'Русский',
  fr: 'Français',
  tr: 'Türkçe',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  pl: 'Polski',
  pt: 'Português'
};

// Languages written right-to-left, used to flip the injected UI.
const RTL_LANGUAGES = ['ar'];

function normalizeMessageLanguage(language) {
  if (!language) return DEFAULT_MESSAGE_LANGUAGE;
  const normalized = String(language).trim().toLowerCase();
  if (!normalized || normalized === 'auto') return 'auto';
  const base = normalized.split('-')[0];
  return SUPPORTED_MESSAGE_LANGUAGES.includes(base) ? base : DEFAULT_MESSAGE_LANGUAGE;
}

// The language for all UI labels and generated messages.
function getMessageLanguage() {
  try {
    const configured = normalizeMessageLanguage(getExtensionSettings().messageLanguage);
    if (configured === 'auto') return detectPageLanguage();
    if (configured && SUPPORTED_MESSAGE_LANGUAGES.includes(configured)) return configured;
  } catch (error) {
    console.warn('[Language] Could not read language setting, using default:', error);
  }
  return DEFAULT_MESSAGE_LANGUAGE;
}

function isRtlLanguage(language = getMessageLanguage()) {
  return RTL_LANGUAGES.includes(language);
}

// Tag an injected element with the message language and its text
// direction, so the RTL rules in styles.css apply and Arabic text mixed
// with Latin names/links/numbers is ordered correctly by the browser.
function applyLanguageDirection(element, language = getMessageLanguage()) {
  if (!element) return element;
  element.setAttribute('lang', language);
  element.setAttribute('dir', isRtlLanguage(language) ? 'rtl' : 'ltr');
  return element;
}

// ---------------------------------------------------------------------
// Arabic noun counting
// ---------------------------------------------------------------------
// Arabic doesn't have a simple singular/plural split: 1 and 2 have their
// own forms and take no numeral, 3-10 take the plural, and 11 and above
// go back to the singular. Getting this wrong is very visible to a native
// reader ("8 درساً" instead of "8 دروس"), so counted nouns go through here.
function arabicCount(count, forms) {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

const ARABIC_LESSON_FORMS = { one: 'درساً واحداً', two: 'درسين', few: 'دروس', many: 'درساً' };
const ARABIC_TASK_FORMS = { one: 'مهمة واحدة', two: 'مهمتين', few: 'مهام', many: 'مهمة' };
const ARABIC_MINUTE_FORMS = { one: 'دقيقة واحدة', two: 'دقيقتين', few: 'دقائق', many: 'دقيقة' };
const ARABIC_HOUR_FORMS = { one: 'ساعة واحدة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' };

// ---------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------
// Labels, tooltips and alerts for the extension's own interface. Lookup
// order is: requested language -> English -> Arabic, so a language with no
// entry still gets something readable. `es` entries preserve the original
// Spanish wording this extension shipped with.
const UI_STRINGS = {
  // --- Tasks modal ---
  weeklySummaryTooltip: {
    ar: 'إرسال الملخص الأسبوعي',
    en: 'Send weekly summary',
    es: 'Enviar resumen semanal',
    ru: 'Отправить еженедельную сводку',
    fr: 'Envoyer le résumé hebdomadaire',
    tr: 'Haftalık özeti gönder',
    id: 'Kirim ringkasan mingguan',
    it: 'Invia il riepilogo settimanale',
    pl: 'Wyślij cotygodniowe podsumowanie',
    pt: 'Enviar resumo semanal'
  },
  refreshTooltip: {
    ar: 'تحديث',
    en: 'Refresh',
    es: 'Actualizar',
    ru: 'Обновить',
    fr: 'Actualiser',
    tr: 'Yenile',
    id: 'Segarkan',
    it: 'Aggiorna',
    pl: 'Odśwież',
    pt: 'Atualizar'
  },
  classTasksHeading: {
    ar: '📚 أنشطة الحصة',
    en: '📚 Class Tasks',
    es: '📚 Actividades de Clase',
    ru: '📚 Классные задания',
    fr: '📚 Activités en classe',
    tr: '📚 Sınıf Etkinlikleri',
    id: '📚 Aktivitas Kelas',
    it: '📚 Attività in classe',
    pl: '📚 Zadania klasowe',
    pt: '📚 Atividades de Classe'
  },
  homeworkTasksHeading: {
    ar: '📝 الواجب المنزلي',
    en: '📝 Homework Tasks',
    es: '📝 Tareas',
    ru: '📝 Домашние задания',
    fr: '📝 Devoirs',
    tr: '📝 Ev Ödevi',
    id: '📝 Tugas Rumah',
    it: '📝 Compiti a casa',
    pl: '📝 Zadania domowe',
    pt: '📝 Trabalhos de Casa'
  },
  lessonCardHeader: {
    ar: (number, id) => `الدرس ${number} (المعرّف: ${id})`,
    en: (number, id) => `Lesson ${number} (ID: ${id})`,
    es: (number, id) => `Lección ${number} (ID: ${id})`,
    ru: (number, id) => `Урок ${number} (ID: ${id})`,
    fr: (number, id) => `Leçon ${number} (ID : ${id})`,
    tr: (number, id) => `Ders ${number} (ID: ${id})`,
    id: (number, lessonId) => `Pelajaran ${number} (ID: ${lessonId})`,
    it: (number, id) => `Lezione ${number} (ID: ${id})`,
    pl: (number, id) => `Lekcja ${number} (ID: ${id})`,
    pt: (number, id) => `Aula ${number} (ID: ${id})`
  },
  lessonNumberLabel: {
    ar: (number) => `الدرس ${number}`,
    en: (number) => `Lesson ${number}`,
    es: (number) => `Lección ${number}`,
    ru: (number) => `Урок ${number}`,
    fr: (number) => `Leçon ${number}`,
    tr: (number) => `Ders ${number}`,
    id: (number) => `Pelajaran ${number}`,
    it: (number) => `Lezione ${number}`,
    pl: (number) => `Lekcja ${number}`,
    pt: (number) => `Aula ${number}`
  },
  noTasksMatchFilter: {
    ar: 'لا توجد مهام تطابق هذا الفلتر',
    en: 'No tasks match this filter',
    es: 'No hay tareas que coincidan con este filtro',
    ru: 'Нет заданий, соответствующих этому фильтру',
    fr: 'Aucune tâche ne correspond à ce filtre',
    tr: 'Bu filtreyle eşleşen görev yok',
    id: 'Tidak ada tugas yang cocok dengan filter ini',
    it: 'Nessuna attività corrisponde a questo filtro',
    pl: 'Brak zadań pasujących do tego filtra',
    pt: 'Nenhuma tarefa corresponde a este filtro'
  },
  noTasksThisFilter: {
    ar: 'لا توجد مهام بهذا الفلتر',
    en: 'No tasks with this filter',
    es: 'No hay tareas con este filtro',
    ru: 'Нет заданий с этим фильтром',
    fr: 'Aucune tâche avec ce filtre',
    tr: 'Bu filtreyle görev yok',
    id: 'Tidak ada tugas dengan filter ini',
    it: 'Nessuna attività con questo filtro',
    pl: 'Brak zadań z tym filtrem',
    pt: 'Nenhuma tarefa com este filtro'
  },
  noTasksDataAvailable: {
    ar: 'لا تتوفر بيانات المهام',
    en: 'No tasks data available',
    es: 'No hay datos de tareas disponibles',
    ru: 'Данные о заданиях недоступны',
    fr: 'Aucune donnée de tâche disponible',
    tr: 'Görev verisi mevcut değil',
    id: 'Data tugas tidak tersedia',
    it: 'Nessun dato sulle attività disponibile',
    pl: 'Brak dostępnych danych o zadaniach',
    pt: 'Nenhum dado de tarefa disponível'
  },
  noData: {
    ar: 'لا توجد بيانات',
    en: 'No data',
    es: 'No hay datos',
    ru: 'Нет данных',
    fr: 'Aucune donnée',
    tr: 'Veri yok',
    id: 'Tidak ada data',
    it: 'Nessun dato',
    pl: 'Brak danych',
    pt: 'Sem dados'
  },
  noTasks: {
    ar: 'لا توجد مهام',
    en: 'No tasks',
    es: 'No hay tareas',
    ru: 'Нет заданий',
    fr: 'Aucune tâche',
    tr: 'Görev yok',
    id: 'Tidak ada tugas',
    it: 'Nessuna attività',
    pl: 'Brak zadań',
    pt: 'Sem tarefas'
  },
  unnamedTask: {
    ar: 'مهمة بلا عنوان',
    en: 'Untitled task',
    es: 'Tarea sin nombre',
    ru: 'Задание без названия',
    fr: 'Tâche sans titre',
    tr: 'Adsız görev',
    id: 'Tugas tanpa judul',
    it: 'Attività senza titolo',
    pl: 'Zadanie bez nazwy',
    pt: 'Tarefa sem título'
  },
  unknownStatus: {
    ar: 'غير معروف',
    en: 'Unknown',
    es: 'Desconocido',
    ru: 'Неизвестно',
    fr: 'Inconnu',
    tr: 'Bilinmiyor',
    id: 'Tidak diketahui',
    it: 'Sconosciuto',
    pl: 'Nieznany',
    pt: 'Desconhecido'
  },
  studentFallback: {
    ar: 'طالب',
    en: 'Student',
    es: 'Estudiante',
    ru: 'Студент',
    fr: 'Élève',
    tr: 'Öğrenci',
    id: 'Siswa',
    it: 'Studente',
    pl: 'Uczeń',
    pt: 'Aluno'
  },
  // Used as the greeting name when the parent's name is missing, so it ends
  // up inside WhatsApp messages.
  parentFallback: {
    ar: 'وليّ الأمر',
    en: 'Parent',
    es: 'Padre/Madre',
    ru: 'Родитель',
    fr: 'Parent',
    tr: 'Veli',
    id: 'Orang tua',
    it: 'Genitore',
    pl: 'Rodzic',
    pt: 'Responsável'
  },
  loading: {
    ar: '⏳ جارٍ التحميل...',
    en: '⏳ Loading...',
    es: '⏳ Cargando...',
    ru: '⏳ Загрузка...',
    fr: '⏳ Chargement...',
    tr: '⏳ Yükleniyor...',
    id: '⏳ Memuat...',
    it: '⏳ Caricamento...',
    pl: '⏳ Ładowanie...',
    pt: '⏳ Carregando...'
  },
  // Shown when the tutor hasn't filled in their name yet. It has to read as
  // an obvious "fill this in" marker rather than as part of the sentence -
  // "my name is your tutor" would go out to a student unnoticed.
  tutorNamePlaceholder: {
    ar: '[اكتب اسمك في ⚙️ الإعدادات]',
    en: '[Set your name in ⚙️ Settings]',
    es: '[Escribe tu nombre en ⚙️ Configuración]',
    ru: '[Укажите своё имя в ⚙️ Настройках]',
    fr: '[Indiquez votre nom dans ⚙️ Paramètres]',
    tr: '[Adınızı ⚙️ Ayarlar bölümünden girin]',
    id: '[Atur nama Anda di ⚙️ Pengaturan]',
    it: '[Imposta il tuo nome in ⚙️ Impostazioni]',
    pl: '[Ustaw swoje imię w ⚙️ Ustawieniach]',
    pt: '[Defina seu nome em ⚙️ Configurações]'
  },
  studentWithId: {
    ar: (id) => `طالب ${id}`,
    en: (id) => `Student ${id}`,
    es: (id) => `Estudiante ${id}`,
    ru: (id) => `Студент ${id}`,
    fr: (id) => `Élève ${id}`,
    tr: (id) => `Öğrenci ${id}`,
    id: (studentId) => `Siswa ${studentId}`,
    it: (id) => `Studente ${id}`,
    pl: (id) => `Uczeń ${id}`,
    pt: (id) => `Aluno ${id}`
  },

  // --- Group grading report ---
  gradingReportButton: {
    ar: '📊 تقرير التصحيح',
    en: '📊 Grading report',
    es: '📊 Reporte calificación',
    ru: '📊 Отчёт о проверке',
    fr: '📊 Rapport de correction',
    tr: '📊 Notlandırma raporu',
    id: '📊 Laporan penilaian',
    it: '📊 Report correzioni',
    pl: '📊 Raport oceniania',
    pt: '📊 Relatório de correção'
  },
  gradingReportTooltip: {
    ar: 'مراجعة عدد المهام التي لم تُصحَّح بعد لكل طالب في المجموعة',
    en: 'Check how many tasks are still waiting to be graded for each student in the group',
    es: 'Revisar cuántas tareas le faltan calificar a cada estudiante del grupo',
    ru: 'Проверить, сколько заданий ещё не проверено у каждого студента группы',
    fr: 'Vérifier combien de tâches restent à corriger pour chaque élève du groupe',
    tr: 'Gruptaki her öğrenci için notlandırılmayı bekleyen görev sayısını kontrol et',
    id: 'Periksa berapa banyak tugas yang masih menunggu penilaian untuk setiap siswa di grup',
    it: 'Controlla quante attività restano da correggere per ogni studente del gruppo',
    pl: 'Sprawdź, ile zadań czeka jeszcze na ocenę u każdego ucznia w grupie',
    pt: 'Verificar quantas tarefas ainda aguardam correção para cada aluno do grupo'
  },
  gradingReportTitle: {
    ar: (total) => `📊 تقرير تصحيح المجموعة (${arabicCount(total, ARABIC_TASK_FORMS)} معلّقة إجمالاً)`,
    en: (total) => `📊 Group grading report (${total} pending in total)`,
    es: (total) => `📊 Reporte de calificación del grupo (${total} pendientes en total)`,
    ru: (total) => `📊 Отчёт о проверке группы (всего ожидает: ${total})`,
    fr: (total) => `📊 Rapport de correction du groupe (${total} en attente au total)`,
    tr: (total) => `📊 Grup notlandırma raporu (toplam ${total} bekliyor)`,
    id: (total) => `📊 Laporan penilaian grup (total ${total} tertunda)`,
    it: (total) => `📊 Report correzioni del gruppo (${total} in totale in sospeso)`,
    pl: (total) => `📊 Raport oceniania grupy (łącznie oczekuje: ${total})`,
    pt: (total) => `📊 Relatório de correção do grupo (${total} pendentes no total)`
  },
  gradingNobodyPending: {
    ar: '🎉 لا توجد مهام بانتظار التصحيح لدى أي طالب.',
    en: '🎉 Nobody has tasks waiting to be graded.',
    es: '🎉 Nadie tiene tareas pendientes de calificar.',
    ru: '🎉 Ни у кого нет заданий, ожидающих проверки.',
    fr: '🎉 Personne n\'a de tâches en attente de correction.',
    tr: '🎉 Notlandırılmayı bekleyen görevi olan kimse yok.',
    id: '🎉 Tidak ada yang memiliki tugas menunggu penilaian.',
    it: '🎉 Nessuno ha attività in attesa di correzione.',
    pl: '🎉 Nikt nie ma zadań oczekujących na ocenę.',
    pt: '🎉 Ninguém tem tarefas pendentes de correção.'
  },
  gradeTaskLink: {
    ar: '↗ تصحيح',
    en: '↗ Grade',
    es: '↗ Calificar',
    ru: '↗ Проверить',
    fr: '↗ Corriger',
    tr: '↗ Notlandır',
    id: '↗ Nilai',
    it: '↗ Correggi',
    pl: '↗ Oceń',
    pt: '↗ Corrigir'
  },
  gradingStudentRow: {
    ar: (name, count) => `${name} — ${arabicCount(count, ARABIC_TASK_FORMS)} بانتظار التصحيح`,
    en: (name, count) => `${name} — ${count} task(s) to grade`,
    es: (name, count) => `${name} — ${count} tarea(s) por calificar`,
    ru: (name, count) => `${name} — ${count} задание(й) на проверку`,
    fr: (name, count) => `${name} — ${count} tâche(s) à corriger`,
    tr: (name, count) => `${name} — notlandırılacak ${count} görev`,
    id: (name, count) => `${name} — ${count} tugas untuk dinilai`,
    it: (name, count) => `${name} — ${count} attività da correggere`,
    pl: (name, count) => `${name} — ${count} zadanie(a) do oceny`,
    pt: (name, count) => `${name} — ${count} tarefa(s) para corrigir`
  },
  gradingReportError: {
    ar: 'حدث خطأ أثناء إعداد التقرير. راجع وحدة تحكّم المتصفح.',
    en: 'Something went wrong building the report. Check the console.',
    es: 'Ocurrió un error armando el reporte. Revisa la consola.',
    ru: 'Произошла ошибка при формировании отчёта. Проверьте консоль браузера.',
    fr: 'Une erreur est survenue lors de la génération du rapport. Vérifiez la console.',
    tr: 'Rapor oluşturulurken bir hata oluştu. Konsolu kontrol edin.',
    id: 'Terjadi kesalahan saat membuat laporan. Periksa konsol browser.',
    it: 'Si è verificato un errore nella creazione del report. Controlla la console.',
    pl: 'Wystąpił błąd podczas tworzenia raportu. Sprawdź konsolę.',
    pt: 'Ocorreu um erro ao montar o relatório. Verifique o console.'
  },

  // --- Per-student buttons ---
  classReminderTooltip: {
    ar: 'إرسال تذكير بالحصة',
    en: 'Send class reminder',
    es: 'Enviar advertencia de la clase',
    ru: 'Отправить напоминание об уроке',
    fr: 'Envoyer un rappel de cours',
    tr: 'Ders hatırlatması gönder',
    id: 'Kirim pengingat kelas',
    it: 'Invia promemoria della lezione',
    pl: 'Wyślij przypomnienie o lekcji',
    pt: 'Enviar lembrete de aula'
  },
  absenceTooltip: {
    ar: 'إرسال تنبيه بالغياب عن الحصة',
    en: 'Send class absence notice',
    es: 'Enviar aviso de falta a clase',
    ru: 'Отправить уведомление об отсутствии на уроке',
    fr: 'Envoyer un avis d\'absence au cours',
    tr: 'Derse devamsızlık bildirimi gönder',
    id: 'Kirim pemberitahuan ketidakhadiran kelas',
    it: 'Invia avviso di assenza alla lezione',
    pl: 'Wyślij powiadomienie o nieobecności na lekcji',
    pt: 'Enviar aviso de falta à aula'
  },
  taskReportTooltip: {
    ar: 'إرسال تقرير بالمهام غير المُسلَّمة عبر واتساب',
    en: 'Send a WhatsApp report of unsubmitted tasks',
    es: 'Enviar por WhatsApp un reporte de tareas sin enviar',
    ru: 'Отправить в WhatsApp отчёт о несданных заданиях',
    fr: 'Envoyer par WhatsApp un rapport des tâches non soumises',
    tr: 'WhatsApp üzerinden teslim edilmemiş görevler raporu gönder',
    id: 'Kirim laporan WhatsApp tugas yang belum dikumpulkan',
    it: 'Invia via WhatsApp un report delle attività non consegnate',
    pl: 'Wyślij przez WhatsApp raport niezłożonych zadań',
    pt: 'Enviar por WhatsApp um relatório de tarefas não enviadas'
  },
  noPhoneForStudent: {
    ar: 'لا يوجد رقم هاتف متاح لهذا الطالب',
    en: 'No phone number available for this student',
    es: 'No hay teléfono disponible para este estudiante',
    ru: 'Нет доступного номера телефона для этого студента',
    fr: 'Aucun numéro de téléphone disponible pour cet élève',
    tr: 'Bu öğrenci için kullanılabilir telefon numarası yok',
    id: 'Tidak ada nomor telepon yang tersedia untuk siswa ini',
    it: 'Nessun numero di telefono disponibile per questo studente',
    pl: 'Brak dostępnego numeru telefonu dla tego ucznia',
    pt: 'Nenhum número de telefone disponível para este aluno'
  },
  noPhoneAvailable: {
    ar: 'لا يوجد رقم هاتف متاح',
    en: 'No phone number available',
    es: 'No hay teléfono disponible',
    ru: 'Нет доступного номера телефона',
    fr: 'Aucun numéro de téléphone disponible',
    tr: 'Kullanılabilir telefon numarası yok',
    id: 'Tidak ada nomor telepon yang tersedia',
    it: 'Nessun numero di telefono disponibile',
    pl: 'Brak dostępnego numeru telefonu',
    pt: 'Nenhum telefone disponível'
  },
  noGroupId: {
    ar: 'تعذّر الحصول على معرّف المجموعة',
    en: 'Could not get the group ID',
    es: 'No se pudo obtener el ID del grupo',
    ru: 'Не удалось получить ID группы',
    fr: 'Impossible d\'obtenir l\'ID du groupe',
    tr: 'Grup kimliği alınamadı',
    id: 'Tidak dapat memperoleh ID grup',
    it: 'Impossibile ottenere l\'ID del gruppo',
    pl: 'Nie udało się uzyskać ID grupy',
    pt: 'Não foi possível obter o ID do grupo'
  },
  groupIdNotFound: {
    ar: 'تعذّر العثور على معرّف المجموعة. تأكد من أنك في صفحة مجموعة.',
    en: 'Could not find group ID. Please make sure you are on a group page.',
    es: 'No se pudo encontrar el ID del grupo. Asegúrate de estar en una página de grupo.',
    ru: 'Не удалось найти ID группы. Убедитесь, что вы находитесь на странице группы.',
    fr: 'ID du groupe introuvable. Assurez-vous d\'être sur une page de groupe.',
    tr: 'Grup kimliği bulunamadı. Bir grup sayfasında olduğunuzdan emin olun.',
    id: 'ID grup tidak ditemukan. Pastikan Anda berada di halaman grup.',
    it: 'ID del gruppo non trovato. Assicurati di essere in una pagina di gruppo.',
    pl: 'Nie znaleziono ID grupy. Upewnij się, że jesteś na stronie grupy.',
    pt: 'ID do grupo não encontrado. Certifique-se de estar em uma página de grupo.'
  },
  scheduleFetchError: {
    ar: (status) => `تعذّر جلب الجدول: ${status}`,
    en: (status) => `Error fetching the schedule: ${status}`,
    es: (status) => `Error al obtener el horario: ${status}`,
    ru: (status) => `Не удалось загрузить расписание: ${status}`,
    fr: (status) => `Erreur lors de la récupération de l'horaire : ${status}`,
    tr: (status) => `Program alınamadı: ${status}`,
    id: (status) => `Gagal mengambil jadwal: ${status}`,
    it: (status) => `Errore nel recupero dell'orario: ${status}`,
    pl: (status) => `Błąd pobierania harmonogramu: ${status}`,
    pt: (status) => `Erro ao obter o horário: ${status}`
  },
  noUpcomingLesson: {
    ar: 'لم يتم العثور على حصة قادمة',
    en: 'No upcoming class found',
    es: 'No se encontró una clase próxima',
    ru: 'Ближайший урок не найден',
    fr: 'Aucun cours à venir trouvé',
    tr: 'Yaklaşan ders bulunamadı',
    id: 'Tidak ditemukan kelas mendatang',
    it: 'Nessuna lezione imminente trovata',
    pl: 'Nie znaleziono nadchodzącej lekcji',
    pt: 'Nenhuma aula futura encontrada'
  },
  messageGenerationError: {
    ar: 'تعذّر إنشاء الرسالة',
    en: 'Error generating the message',
    es: 'Error al generar el mensaje',
    ru: 'Не удалось создать сообщение',
    fr: 'Erreur lors de la génération du message',
    tr: 'Mesaj oluşturulamadı',
    id: 'Gagal membuat pesan',
    it: 'Errore nella generazione del messaggio',
    pl: 'Błąd podczas generowania wiadomości',
    pt: 'Erro ao gerar a mensagem'
  },
  classReminderError: {
    ar: 'تعذّر إرسال التذكير بالحصة',
    en: 'Error sending the class reminder',
    es: 'Error al enviar la advertencia de clase',
    ru: 'Не удалось отправить напоминание об уроке',
    fr: 'Erreur lors de l\'envoi du rappel de cours',
    tr: 'Ders hatırlatması gönderilemedi',
    id: 'Gagal mengirim pengingat kelas',
    it: 'Errore nell\'invio del promemoria della lezione',
    pl: 'Błąd podczas wysyłania przypomnienia o lekcji',
    pt: 'Erro ao enviar o lembrete de aula'
  },
  taskInfoError: {
    ar: 'تعذّر الحصول على بيانات المهام. راجع وحدة تحكّم المتصفح.',
    en: 'Could not get the tasks information. Check the console.',
    es: 'No se pudo obtener la información de tareas. Revisa la consola.',
    ru: 'Не удалось получить данные о заданиях. Проверьте консоль браузера.',
    fr: 'Impossible d\'obtenir les informations des tâches. Vérifiez la console.',
    tr: 'Görev bilgileri alınamadı. Konsolu kontrol edin.',
    id: 'Tidak dapat memperoleh informasi tugas. Periksa konsol browser.',
    it: 'Impossibile ottenere le informazioni sulle attività. Controlla la console.',
    pl: 'Nie udało się pobrać informacji o zadaniach. Sprawdź konsolę.',
    pt: 'Não foi possível obter as informações das tarefas. Verifique o console.'
  },
  noPendingTasks: {
    ar: 'لا توجد لدى هذا الطالب مهام غير مُسلَّمة. 🎉',
    en: 'This student has no unsubmitted tasks. 🎉',
    es: 'Este estudiante no tiene tareas pendientes de enviar. 🎉',
    ru: 'У этого студента нет несданных заданий. 🎉',
    fr: 'Cet élève n\'a aucune tâche non soumise. 🎉',
    tr: 'Bu öğrencinin teslim edilmemiş görevi yok. 🎉',
    id: 'Siswa ini tidak memiliki tugas yang belum dikumpulkan. 🎉',
    it: 'Questo studente non ha attività non consegnate. 🎉',
    pl: 'Ten uczeń nie ma niezłożonych zadań. 🎉',
    pt: 'Este aluno não tem tarefas pendentes de envio. 🎉'
  },
  taskReportMessage: {
    ar: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `مرحباً ${studentName} ${waveEmoji}، أنا ${tutorName}، معلّمك${courseName ? ` في دورة ${courseName}` : ''} على منصة Kodland.\nأردت تذكيرك بأن لديك المهام التالية غير مُسلَّمة:\n${taskListText}\nيُرجى رفعها على المنصة متى استطعت حتى لا تتأخر عن الدورة. وإن كان لديك أي سؤال فأنا هنا! ${smileEmoji}`,
    en: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Hi ${studentName} ${waveEmoji}, this is ${tutorName}, your${courseName ? ` ${courseName}` : ''} tutor at Kodland.\nI wanted to remind you that the following tasks are still not submitted:\n${taskListText}\nPlease upload them to the platform when you can, so you don't fall behind on the course. Any questions, I'm here! ${smileEmoji}`,
    es: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Hola ${studentName} ${waveEmoji}, soy ${tutorName}, tu tutor${courseName ? ` de ${courseName}` : ''} en Kodland.\nQuería recordarte que tienes pendientes de enviar las siguientes tareas:\n${taskListText}\nPor favor súbelas a la plataforma cuando puedas, para que no te atrases con el curso. ¡Cualquier duda, aquí estoy! ${smileEmoji}`,
    ru: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Привет ${studentName} ${waveEmoji}, я ${tutorName}, твой преподаватель${courseName ? ` курса ${courseName}` : ''} на Kodland.\nХочу напомнить, что у тебя есть следующие несданные задания:\n${taskListText}\nПожалуйста, загрузи их на платформу, как только сможешь, чтобы не отставать от курса. Если у тебя есть вопросы, я всегда на связи! ${smileEmoji}`,
    fr: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Bonjour ${studentName} ${waveEmoji}, c'est ${tutorName}, ton professeur${courseName ? ` de ${courseName}` : ''} sur Kodland.\nJe voulais te rappeler que les tâches suivantes ne sont pas encore soumises :\n${taskListText}\nMerci de les envoyer sur la plateforme dès que possible, pour ne pas prendre de retard dans le cours. N'hésite pas à me contacter pour toute question ! ${smileEmoji}`,
    tr: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Merhaba ${studentName} ${waveEmoji}, ben ${tutorName}, Kodland'daki${courseName ? ` ${courseName} dersinin` : ''} öğretmeniyim.\nAşağıdaki görevlerin henüz teslim edilmediğini hatırlatmak istedim:\n${taskListText}\nDersten geri kalmamak için lütfen mümkün olan en kısa sürede platforma yükle. Herhangi bir sorun varsa buradayım! ${smileEmoji}`,
    id: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Halo ${studentName} ${waveEmoji}, saya ${tutorName}, tutor${courseName ? ` kursus ${courseName}` : ''} Anda di Kodland.\nSaya ingin mengingatkan bahwa tugas-tugas berikut belum dikumpulkan:\n${taskListText}\nSilakan unggah ke platform saat Anda bisa, agar tidak tertinggal dari kursus. Jika ada pertanyaan, saya di sini! ${smileEmoji}`,
    it: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Ciao ${studentName} ${waveEmoji}, sono ${tutorName}, il tuo tutor${courseName ? ` del corso ${courseName}` : ''} su Kodland.\nVolevo ricordarti che le seguenti attività non sono ancora state consegnate:\n${taskListText}\nPer favore caricale sulla piattaforma appena puoi, per non rimanere indietro con il corso. Per qualsiasi domanda, sono qui! ${smileEmoji}`,
    pl: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Cześć ${studentName} ${waveEmoji}, jestem ${tutorName}, twoim nauczycielem${courseName ? ` kursu ${courseName}` : ''} na Kodland.\nChciałem przypomnieć, że poniższe zadania nie zostały jeszcze przesłane:\n${taskListText}\nProszę, prześlij je na platformę, gdy tylko będziesz mógł, aby nie zostać w tyle z kursem. Jeśli masz pytania, jestem tutaj! ${smileEmoji}`,
    pt: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Olá ${studentName} ${waveEmoji}, eu sou ${tutorName}, seu tutor${courseName ? ` do curso ${courseName}` : ''} na Kodland.\nQueria lembrar que você tem as seguintes tarefas ainda não enviadas:\n${taskListText}\nPor favor, envie-as para a plataforma assim que possível, para não ficar atrasado no curso. Qualquer dúvida, estou aqui! ${smileEmoji}`
  },

  // --- Welcome message placeholders ---
  scheduleLine: {
    ar: ({ dayName, fullDate, time, timezoneLabel }) =>
      `التي تبدأ يوم ${dayName} ${fullDate} الساعة ${time} (بتوقيت ${timezoneLabel})`,
    en: ({ dayName, fullDate, time, timezoneLabel }) =>
      `starting this ${dayName} ${fullDate} at ${time} (${timezoneLabel} time)`,
    es: ({ dayName, fullDate, time, timezoneLabel }) =>
      `que comenzará este ${dayName} ${fullDate} a las ${time} horas (hora ${timezoneLabel})`,
    ru: ({ dayName, fullDate, time, timezoneLabel }) =>
      `который начнётся в ${dayName}, ${fullDate}, в ${time} (по времени ${timezoneLabel})`,
    fr: ({ dayName, fullDate, time, timezoneLabel }) =>
      `qui commencera ce ${dayName} ${fullDate} à ${time} (heure de ${timezoneLabel})`,
    tr: ({ dayName, fullDate, time, timezoneLabel }) =>
      `${dayName} günü ${fullDate} tarihinde saat ${time}'de başlayacak (${timezoneLabel} saatiyle)`,
    id: ({ dayName, fullDate, time, timezoneLabel }) =>
      `yang akan dimulai pada ${dayName} ${fullDate} pukul ${time} (waktu ${timezoneLabel})`,
    it: ({ dayName, fullDate, time, timezoneLabel }) =>
      `che inizierà ${dayName} ${fullDate} alle ${time} (ora di ${timezoneLabel})`,
    pl: ({ dayName, fullDate, time, timezoneLabel }) =>
      `który rozpocznie się w ${dayName}, ${fullDate}, o ${time} (czasu ${timezoneLabel})`,
    pt: ({ dayName, fullDate, time, timezoneLabel }) =>
      `que começará nesta ${dayName}, ${fullDate}, às ${time} (horário de ${timezoneLabel})`
  },
  scheduleLineSoon: {
    ar: 'التي ستبدأ قريباً',
    en: 'starting very soon',
    es: 'que comenzará muy pronto',
    ru: 'который начнётся очень скоро',
    fr: 'qui commencera très bientôt',
    tr: 'çok yakında başlayacak',
    id: 'yang akan segera dimulai',
    it: 'che inizierà molto presto',
    pl: 'który rozpocznie się już wkrótce',
    pt: 'que começará muito em breve'
  },
  waGroupLinkMissing: {
    ar: '[لم يتم حفظ رابط مجموعة واتساب بعد — انقر على زر رابط المجموعة أسفل الصفحة]',
    en: '[The WhatsApp group link has not been saved yet - click the group link button at the bottom of the page]',
    es: '[Aún no se detectó el link del grupo de WhatsApp - haz clic en el botón de chat de la página del curso]',
    ru: '[Ссылка на группу WhatsApp ещё не сохранена — нажмите кнопку ссылки группы внизу страницы]',
    fr: '[Le lien du groupe WhatsApp n\'a pas encore été enregistré — cliquez sur le bouton du lien du groupe en bas de la page]',
    tr: '[WhatsApp grup bağlantısı henüz kaydedilmedi — sayfanın altındaki grup bağlantısı düğmesine tıklayın]',
    id: '[Tautan grup WhatsApp belum disimpan — klik tombol tautan grup di bagian bawah halaman]',
    it: '[Il link del gruppo WhatsApp non è ancora stato salvato — clicca sul pulsante del link del gruppo in fondo alla pagina]',
    pl: '[Link do grupy WhatsApp nie został jeszcze zapisany — kliknij przycisk linku grupy na dole strony]',
    pt: '[O link do grupo do WhatsApp ainda não foi salvo — clique no botão de link do grupo na parte inferior da página]'
  },
  loginLinkMissing: {
    ar: '[تعذّر إنشاء رابط الدخول، راجع ملف الطالب]',
    en: '[Could not generate the access link, check the student profile]',
    es: '[No se pudo generar el link de acceso, revisa el perfil del estudiante]',
    ru: '[Не удалось создать ссылку для входа, проверьте профиль студента]',
    fr: '[Impossible de générer le lien d\'accès, vérifiez le profil de l\'élève]',
    tr: '[Giriş bağlantısı oluşturulamadı, öğrenci profilini kontrol edin]',
    id: '[Tidak dapat membuat tautan akses, periksa profil siswa]',
    it: '[Impossibile generare il link di accesso, controlla il profilo dello studente]',
    pl: '[Nie udało się wygenerować linku dostępu, sprawdź profil ucznia]',
    pt: '[Não foi possível gerar o link de acesso, verifique o perfil do aluno]'
  },

  // --- Settings ---
  settingsTooltip: {
    ar: 'إعدادات الإضافة (إظهار/إخفاء الأزرار، اسم المعلّم، اللغة)',
    en: 'Extension settings (show/hide buttons, tutor name, language)',
    es: 'Configuración de la extensión (mostrar/ocultar botones, nombre del tutor)',
    ru: 'Настройки расширения (показать/скрыть кнопки, имя преподавателя, язык)',
    fr: 'Paramètres de l\'extension (afficher/masquer les boutons, nom du professeur, langue)',
    tr: 'Uzantı ayarları (düğmeleri göster/gizle, öğretmen adı, dil)',
    id: 'Pengaturan ekstensi (tampilkan/sembunyikan tombol, nama tutor, bahasa)',
    it: 'Impostazioni dell\'estensione (mostra/nascondi pulsanti, nome del tutor, lingua)',
    pl: 'Ustawienia rozszerzenia (pokaż/ukryj przyciski, imię nauczyciela, język)',
    pt: 'Configurações da extensão (mostrar/ocultar botões, nome do tutor, idioma)'
  },
  settingsTitle: {
    ar: '⚙️ الإعدادات',
    en: '⚙️ Settings',
    es: '⚙️ Configuración',
    ru: '⚙️ Настройки',
    fr: '⚙️ Paramètres',
    tr: '⚙️ Ayarlar',
    id: '⚙️ Pengaturan',
    it: '⚙️ Impostazioni',
    pl: '⚙️ Ustawienia',
    pt: '⚙️ Configurações'
  },
  settingShowExport: {
    ar: '📇 إظهار زر "تصدير جهات الاتصال"',
    en: '📇 Show the "Export contacts" button',
    es: '📇 Mostrar botón "Exportar contactos"',
    ru: '📇 Показать кнопку "Экспорт контактов"',
    fr: '📇 Afficher le bouton "Exporter les contacts"',
    tr: '📇 "Kişileri dışa aktar" düğmesini göster',
    id: '📇 Tampilkan tombol "Ekspor kontak"',
    it: '📇 Mostra il pulsante "Esporta contatti"',
    pl: '📇 Pokaż przycisk "Eksportuj kontakty"',
    pt: '📇 Mostrar botão "Exportar contatos"'
  },
  settingShowWaLink: {
    ar: '💬 إظهار زر "رابط مجموعة واتساب"',
    en: '💬 Show the "WhatsApp group link" button',
    es: '💬 Mostrar botón "Link WA grupo"',
    ru: '💬 Показать кнопку "Ссылка на группу WhatsApp"',
    fr: '💬 Afficher le bouton "Lien du groupe WhatsApp"',
    tr: '💬 "WhatsApp grup bağlantısı" düğmesini göster',
    id: '💬 Tampilkan tombol "Tautan grup WhatsApp"',
    it: '💬 Mostra il pulsante "Link gruppo WhatsApp"',
    pl: '💬 Pokaż przycisk "Link do grupy WhatsApp"',
    pt: '💬 Mostrar botão "Link do grupo do WhatsApp"'
  },
  settingShowAttendance: {
    ar: '✅ إظهار زر "تسجيل الحضور"',
    en: '✅ Show the "Take attendance" button',
    es: '✅ Mostrar botón "Tomar asistencia"',
    ru: '✅ Показать кнопку "Отметить посещаемость"',
    fr: '✅ Afficher le bouton "Prendre les présences"',
    tr: '✅ "Yoklama al" düğmesini göster',
    id: '✅ Tampilkan tombol "Ambil absensi"',
    it: '✅ Mostra il pulsante "Registra presenze"',
    pl: '✅ Pokaż przycisk "Zaznacz obecność"',
    pt: '✅ Mostrar botão "Registrar presença"'
  },
  settingShowAbsence: {
    ar: '⏰ إظهار زر "الغياب عن الحصة" (لكل طالب)',
    en: '⏰ Show the "Class absence" button (per student)',
    es: '⏰ Mostrar botón "Falta a clase" (por estudiante)',
    ru: '⏰ Показать кнопку "Отсутствие на уроке" (для каждого студента)',
    fr: '⏰ Afficher le bouton "Absence au cours" (par élève)',
    tr: '⏰ "Derse devamsızlık" düğmesini göster (öğrenci başına)',
    id: '⏰ Tampilkan tombol "Ketidakhadiran kelas" (per siswa)',
    it: '⏰ Mostra il pulsante "Assenza alla lezione" (per studente)',
    pl: '⏰ Pokaż przycisk "Nieobecność na lekcji" (dla każdego ucznia)',
    pt: '⏰ Mostrar botão "Falta à aula" (por aluno)'
  },
  settingShowTaskReport: {
    ar: '📤 إظهار زر "تقرير المهام" (لكل طالب)',
    en: '📤 Show the "Tasks report" button (per student)',
    es: '📤 Mostrar botón "Reporte de tareas" (por estudiante)',
    ru: '📤 Показать кнопку "Отчёт по заданиям" (для каждого студента)',
    fr: '📤 Afficher le bouton "Rapport des tâches" (par élève)',
    tr: '📤 "Görev raporu" düğmesini göster (öğrenci başına)',
    id: '📤 Tampilkan tombol "Laporan tugas" (per siswa)',
    it: '📤 Mostra il pulsante "Report attività" (per studente)',
    pl: '📤 Pokaż przycisk "Raport zadań" (dla każdego ucznia)',
    pt: '📤 Mostrar botão "Relatório de tarefas" (por aluno)'
  },
  settingShowGradingReport: {
    ar: '📊 إظهار زر "تقرير التصحيح" (للمجموعة كاملة)',
    en: '📊 Show the "Grading report" button (whole group)',
    es: '📊 Mostrar botón "Reporte calificación" (grupo completo)',
    ru: '📊 Показать кнопку "Отчёт о проверке" (для всей группы)',
    fr: '📊 Afficher le bouton "Rapport de correction" (groupe entier)',
    tr: '📊 "Notlandırma raporu" düğmesini göster (tüm grup)',
    id: '📊 Tampilkan tombol "Laporan penilaian" (seluruh grup)',
    it: '📊 Mostra il pulsante "Report correzioni" (intero gruppo)',
    pl: '📊 Pokaż przycisk "Raport oceniania" (cała grupa)',
    pt: '📊 Mostrar botão "Relatório de correção" (grupo inteiro)'
  },
  settingTutorName: {
    ar: 'اسم المعلّم:',
    en: 'Tutor name:',
    es: 'Nombre del tutor:',
    ru: 'Имя преподавателя:',
    fr: 'Nom du professeur :',
    tr: 'Öğretmen adı:',
    id: 'Nama tutor:',
    it: 'Nome del tutor:',
    pl: 'Imię nauczyciela:',
    pt: 'Nome do tutor:'
  },
  settingLanguage: {
    ar: 'لغة الواجهة والرسائل:',
    en: 'Interface and message language:',
    es: 'Idioma de la interfaz y los mensajes:',
    ru: 'Язык интерфейса и сообщений:',
    fr: 'Langue de l\'interface et des messages :',
    tr: 'Arayüz ve mesaj dili:',
    id: 'Bahasa antarmuka dan pesan:',
    it: 'Lingua dell\'interfaccia e dei messaggi:',
    pl: 'Język interfejsu i wiadomości:',
    pt: 'Idioma da interface e das mensagens:'
  },
  settingLanguageAuto: {
    ar: 'تلقائي (حسب لغة صفحة Kodland)',
    en: 'Automatic (follow the Kodland page language)',
    es: 'Automático (seguir el idioma de la página de Kodland)',
    ru: 'Автоматически (следовать языку страницы Kodland)',
    fr: 'Automatique (suivre la langue de la page Kodland)',
    tr: 'Otomatik (Kodland sayfa dilini takip et)',
    id: 'Otomatis (mengikuti bahasa halaman Kodland)',
    it: 'Automatico (segui la lingua della pagina Kodland)',
    pl: 'Automatyczny (zgodnie z językiem strony Kodland)',
    pt: 'Automático (seguir o idioma da página Kodland)'
  },
  settingTimezone: {
    ar: 'المنطقة الزمنية للحصص (صيغة IANA، مثل Africa/Cairo):',
    en: 'Class timezone (IANA format, e.g. Africa/Cairo):',
    es: 'Zona horaria de la clase (formato IANA, p. ej. America/Mexico_City):',
    ru: 'Часовой пояс занятий (формат IANA, напр. Europe/Moscow):',
    fr: 'Fuseau horaire des cours (format IANA, ex. Europe/Paris) :',
    tr: 'Ders saat dilimi (IANA biçimi, örn. Europe/Istanbul):',
    id: 'Zona waktu kelas (format IANA, mis. Asia/Jakarta):',
    it: 'Fuso orario delle lezioni (formato IANA, es. Europe/Rome):',
    pl: 'Strefa czasowa zajęć (format IANA, np. Europe/Warsaw):',
    pt: 'Fuso horário das aulas (formato IANA, ex. America/Sao_Paulo):'
  },
  settingTimezoneLabel: {
    ar: 'اسم المنطقة الزمنية كما يظهر في الرسائر:',
    en: 'Timezone name as it appears in messages:',
    es: 'Nombre de la zona horaria como aparece en los mensajes:',
    ru: 'Название часового пояса, как оно отображается в сообщениях:',
    fr: 'Nom du fuseau horaire tel qu\'il apparaît dans les messages :',
    tr: 'Mesajlarda görünen saat dilimi adı:',
    id: 'Nama zona waktu seperti yang muncul di pesan:',
    it: 'Nome del fuso orario come appare nei messaggi:',
    pl: 'Nazwa strefy czasowej wyświetlana w wiadomościach:',
    pt: 'Nome do fuso horário como aparece nas mensagens:'
  },
  settingsTemplatesHelp: {
    ar: 'قوالب الرسائل: استخدم {{studentName}} و{{tutorName}} و{{courseName}}، وفي رسالة الترحيب فقط {{scheduleLine}} و{{waGroupLink}} و{{wonderLoginUrl}} و{{username}} و{{password}}. تُملأ هذه القيم تلقائياً عند إرسال الرسالة.',
    en: 'Message templates: use {{studentName}}, {{tutorName}}, {{courseName}}, and (welcome message only) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. These are filled in automatically when the message is sent.',
    es: 'Plantillas de mensajes: usa {{studentName}}, {{tutorName}}, {{courseName}} y (solo en bienvenida) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Esos textos se rellenan solos al enviar el mensaje.',
    ru: 'Шаблоны сообщений: используйте {{studentName}}, {{tutorName}}, {{courseName}}, а в приветственном сообщении также {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Эти значения подставляются автоматически при отправке сообщения.',
    fr: 'Modèles de messages : utilisez {{studentName}}, {{tutorName}}, {{courseName}}, et (message de bienvenue uniquement) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Ces valeurs sont remplies automatiquement lors de l\'envoi du message.',
    tr: 'Mesaj şablonları: {{studentName}}, {{tutorName}}, {{courseName}} kullanın; hoş geldin mesajında ayrıca {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Bu değerler mesaj gönderilirken otomatik olarak doldurulur.',
    id: 'Templat pesan: gunakan {{studentName}}, {{tutorName}}, {{courseName}}, dan (khusus pesan selamat datang) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Nilai-nilai ini akan diisi otomatis saat pesan dikirim.',
    it: 'Modelli di messaggio: usa {{studentName}}, {{tutorName}}, {{courseName}} e (solo nel messaggio di benvenuto) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Questi valori vengono compilati automaticamente all\'invio del messaggio.',
    pl: 'Szablony wiadomości: użyj {{studentName}}, {{tutorName}}, {{courseName}}, a w wiadomości powitalnej także {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Te wartości są uzupełniane automatycznie podczas wysyłania wiadomości.',
    pt: 'Modelos de mensagem: use {{studentName}}, {{tutorName}}, {{courseName}} e (somente na mensagem de boas-vindas) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Esses valores são preenchidos automaticamente ao enviar a mensagem.'
  },
  settingWelcomeTemplate: {
    ar: 'رسالة الترحيب:',
    en: 'Welcome message:',
    es: 'Mensaje de bienvenida:',
    ru: 'Приветственное сообщение:',
    fr: 'Message de bienvenue :',
    tr: 'Hoş geldin mesajı:',
    id: 'Pesan selamat datang:',
    it: 'Messaggio di benvenuto:',
    pl: 'Wiadomość powitalna:',
    pt: 'Mensagem de boas-vindas:'
  },
  settingAbsenceTemplate: {
    ar: 'رسالة الغياب عن الحصة:',
    en: 'Class absence message:',
    es: 'Mensaje de falta a clase:',
    ru: 'Сообщение об отсутствии на уроке:',
    fr: 'Message d\'absence au cours :',
    tr: 'Derse devamsızlık mesajı:',
    id: 'Pesan ketidakhadiran kelas:',
    it: 'Messaggio di assenza alla lezione:',
    pl: 'Wiadomość o nieobecności na lekcji:',
    pt: 'Mensagem de falta à aula:'
  },
  settingsReset: {
    ar: 'استعادة الافتراضي',
    en: 'Reset',
    es: 'Restablecer',
    ru: 'Восстановить по умолчанию',
    fr: 'Réinitialiser',
    tr: 'Varsayılana sıfırla',
    id: 'Kembalikan ke default',
    it: 'Ripristina predefinito',
    pl: 'Przywróć domyślne',
    pt: 'Restaurar padrão'
  },
  settingsSave: {
    ar: 'حفظ',
    en: 'Save',
    es: 'Guardar',
    ru: 'Сохранить',
    fr: 'Enregistrer',
    tr: 'Kaydet',
    id: 'Simpan',
    it: 'Salva',
    pl: 'Zapisz',
    pt: 'Salvar'
  },
  settingsSaved: {
    ar: 'تم حفظ الإعدادات. أعد تحميل الصفحة لتطبيقها.',
    en: 'Settings saved. Reload the page to apply them.',
    es: 'Configuración guardada. Recarga la página para que se aplique.',
    ru: 'Настройки сохранены. Перезагрузите страницу, чтобы применить их.',
    fr: 'Paramètres enregistrés. Rechargez la page pour les appliquer.',
    tr: 'Ayarlar kaydedildi. Uygulamak için sayfayı yeniden yükleyin.',
    id: 'Pengaturan disimpan. Muat ulang halaman untuk menerapkannya.',
    it: 'Impostazioni salvate. Ricarica la pagina per applicarle.',
    pl: 'Ustawienia zapisane. Odśwież stronę, aby je zastosować.',
    pt: 'Configurações salvas. Recarregue a página para aplicá-las.'
  },

  // --- Export contacts ---
  exportContactsButton: {
    ar: '📇 تصدير جهات الاتصال',
    en: '📇 Export contacts',
    es: '📇 Exportar contactos',
    ru: '📇 Экспорт контактов',
    fr: '📇 Exporter les contacts',
    tr: '📇 Kişileri dışa aktar',
    id: '📇 Ekspor kontak',
    it: '📇 Esporta contatti',
    pl: '📇 Eksportuj kontakty',
    pt: '📇 Exportar contatos'
  },
  exportContactsTooltip: {
    ar: 'تنزيل ملف CSV بجهات الاتصال (الاسم، اليوم والساعة، الهاتف)',
    en: 'Download a contacts CSV (Name, Day+Time, Phone)',
    es: 'Descargar CSV de contactos (Nombre, Día+Hora, Teléfono)',
    ru: 'Скачать CSV-файл контактов (Имя, День+Время, Телефон)',
    fr: 'Télécharger un CSV de contacts (Nom, Jour+Heure, Téléphone)',
    tr: 'Kişiler CSV dosyasını indir (Ad, Gün+Saat, Telefon)',
    id: 'Unduh CSV kontak (Nama, Hari+Waktu, Telepon)',
    it: 'Scarica CSV dei contatti (Nome, Giorno+Ora, Telefono)',
    pl: 'Pobierz plik CSV z kontaktami (Imię, Dzień+Godzina, Telefon)',
    pt: 'Baixar CSV de contatos (Nome, Dia+Hora, Telefone)'
  },
  exportingContacts: {
    ar: '⏳ جارٍ التصدير...',
    en: '⏳ Exporting...',
    es: '⏳ Exportando...',
    ru: '⏳ Экспорт...',
    fr: '⏳ Exportation...',
    tr: '⏳ Dışa aktarılıyor...',
    id: '⏳ Mengekspor...',
    it: '⏳ Esportazione...',
    pl: '⏳ Eksportowanie...',
    pt: '⏳ Exportando...'
  },
  noStudentsProcessed: {
    ar: 'لم تتم معالجة أي طلاب بعد. انتظر بضع ثوانٍ حتى تُحمَّل البيانات ثم أعد المحاولة.',
    en: 'No students processed yet. Wait a few seconds for the data to load and try again.',
    es: 'Todavía no hay estudiantes procesados. Espera unos segundos a que carguen los datos y vuelve a intentar.',
    ru: 'Пока не обработано ни одного студента. Подождите несколько секунд, пока данные загрузятся, и попробуйте снова.',
    fr: 'Aucun élève traité pour le moment. Attendez quelques secondes que les données se chargent et réessayez.',
    tr: 'Henüz işlenen öğrenci yok. Verilerin yüklenmesi için birkaç saniye bekleyip tekrar deneyin.',
    id: 'Belum ada siswa yang diproses. Tunggu beberapa detik hingga data dimuat lalu coba lagi.',
    it: 'Nessuno studente elaborato ancora. Attendi qualche secondo che i dati si carichino e riprova.',
    pl: 'Żaden uczeń nie został jeszcze przetworzony. Poczekaj kilka sekund, aż dane się załadują, i spróbuj ponownie.',
    pt: 'Nenhum aluno processado ainda. Aguarde alguns segundos até os dados carregarem e tente novamente.'
  },

  // --- WhatsApp group link ---
  waGroupLinkSaved: {
    ar: '✅ رابط مجموعة واتساب',
    en: '✅ WhatsApp group link',
    es: '✅ Link WA grupo',
    ru: '✅ Ссылка на группу WhatsApp',
    fr: '✅ Lien du groupe WhatsApp',
    tr: '✅ WhatsApp grup bağlantısı',
    id: '✅ Tautan grup WhatsApp',
    it: '✅ Link gruppo WhatsApp',
    pl: '✅ Link do grupy WhatsApp',
    pt: '✅ Link do grupo do WhatsApp'
  },
  waGroupLinkPaste: {
    ar: '📋 الصق رابط مجموعة واتساب',
    en: '📋 Paste WhatsApp group link',
    es: '📋 Pegar link WA grupo',
    ru: '📋 Вставить ссылку на группу WhatsApp',
    fr: '📋 Coller le lien du groupe WhatsApp',
    tr: '📋 WhatsApp grup bağlantısını yapıştır',
    id: '📋 Tempel tautan grup WhatsApp',
    it: '📋 Incolla link gruppo WhatsApp',
    pl: '📋 Wklej link do grupy WhatsApp',
    pt: '📋 Colar link do grupo do WhatsApp'
  },
  waGroupLinkSavedTooltip: {
    ar: (link) => `الرابط المحفوظ: ${link}\nانقر لتغييره`,
    en: (link) => `Saved link: ${link}\nClick to change it`,
    es: (link) => `Link guardado: ${link}\nClic para cambiarlo`,
    ru: (link) => `Сохранённая ссылка: ${link}\nНажмите, чтобы изменить`,
    fr: (link) => `Lien enregistré : ${link}\nCliquez pour le modifier`,
    tr: (link) => `Kaydedilen bağlantı: ${link}\nDeğiştirmek için tıklayın`,
    id: (link) => `Tautan tersimpan: ${link}\nKlik untuk mengubahnya`,
    it: (link) => `Link salvato: ${link}\nClicca per modificarlo`,
    pl: (link) => `Zapisany link: ${link}\nKliknij, aby go zmienić`,
    pt: (link) => `Link salvo: ${link}\nClique para alterá-lo`
  },
  waGroupLinkPasteTooltip: {
    ar: 'انقر للصق رابط مجموعة واتساب الخاصة بهذه الدورة.',
    en: "Click to paste this course's WhatsApp group link.",
    es: 'Clic para pegar el link del grupo de WhatsApp de este curso.',
    ru: 'Нажмите, чтобы вставить ссылку на группу WhatsApp этого курса.',
    fr: 'Cliquez pour coller le lien du groupe WhatsApp de ce cours.',
    tr: 'Bu kursun WhatsApp grup bağlantısını yapıştırmak için tıklayın.',
    id: 'Klik untuk menempelkan tautan grup WhatsApp kursus ini.',
    it: 'Clicca per incollare il link del gruppo WhatsApp di questo corso.',
    pl: 'Kliknij, aby wkleić link do grupy WhatsApp tego kursu.',
    pt: 'Clique para colar o link do grupo do WhatsApp deste curso.'
  },
  waGroupLinkPrompt: {
    ar: 'الصق رابط مجموعة واتساب الخاصة بهذه الدورة أو صحّحه:',
    en: "Paste or correct this course's WhatsApp group link:",
    es: 'Pega o corrige el link del grupo de WhatsApp de este curso:',
    ru: 'Вставьте или исправьте ссылку на группу WhatsApp этого курса:',
    fr: 'Collez ou corrigez le lien du groupe WhatsApp de ce cours :',
    tr: 'Bu kursun WhatsApp grup bağlantısını yapıştırın veya düzeltin:',
    id: 'Tempel atau perbaiki tautan grup WhatsApp kursus ini:',
    it: 'Incolla o correggi il link del gruppo WhatsApp di questo corso:',
    pl: 'Wklej lub popraw link do grupy WhatsApp tego kursu:',
    pt: 'Cole ou corrija o link do grupo do WhatsApp deste curso:'
  },

  // --- Attendance ---
  attendanceButton: {
    ar: '✅ تسجيل الحضور',
    en: '✅ Take attendance',
    es: '✅ Tomar asistencia',
    ru: '✅ Отметить посещаемость',
    fr: '✅ Prendre les présences',
    tr: '✅ Yoklama al',
    id: '✅ Ambil absensi',
    it: '✅ Registra presenze',
    pl: '✅ Zaznacz obecność',
    pt: '✅ Registrar presença'
  },
  attendanceTooltip: {
    ar: 'وضع علامة "حاضر" لجميع الطلاب. يمكنك بعدها تعديل الغائبين يدوياً.',
    en: 'Mark ALL students as "Attended". You can then fix the absentees by hand.',
    es: 'Marca a TODOS los estudiantes como "Asistió". Luego puedes ajustar a mano los que faltaron.',
    ru: 'Отметить ВСЕХ студентов как "Присутствовал". Затем вы можете вручную исправить отсутствующих.',
    fr: 'Marquer TOUS les élèves comme "Présent". Vous pourrez ensuite corriger les absents manuellement.',
    tr: 'TÜM öğrencileri "Katıldı" olarak işaretle. Daha sonra devamsızları elle düzeltebilirsin.',
    id: 'Tandai SEMUA siswa sebagai "Hadir". Anda dapat memperbaiki yang tidak hadir secara manual nanti.',
    it: 'Segna TUTTI gli studenti come "Presente". Potrai poi correggere manualmente gli assenti.',
    pl: 'Oznacz WSZYSTKICH uczniów jako "Obecny". Następnie możesz ręcznie poprawić nieobecnych.',
    pt: 'Marcar TODOS os alunos como "Presente". Depois você pode ajustar manualmente os ausentes.'
  },
  attendanceConfirm: {
    ar: 'هل تريد وضع علامة "حاضر" لجميع الطلاب الظاهرين؟\n\nيمكنك بعد ذلك تغيير حالة الغائبين يدوياً (بالنقر بالزر الأيمن على رقم الدرس).',
    en: 'Mark ALL visible students as "Attended"?\n\nYou can then change the absentees manually (right-click on the lesson number).',
    es: '¿Marcar a TODOS los estudiantes visibles como "Asistió"?\n\nDespués puedes cambiar manualmente (clic derecho sobre el número de la lección) a los que hayan faltado.',
    ru: 'Отметить ВСЕХ видимых студентов как "Присутствовал"?\n\nПосле этого вы можете вручную изменить статус отсутствующих (правый клик по номеру урока).',
    fr: 'Marquer TOUS les élèves visibles comme "Présent" ?\n\nVous pourrez ensuite modifier manuellement les absents (clic droit sur le numéro de la leçon).',
    tr: 'Görünen TÜM öğrenciler "Katıldı" olarak işaretlensin mi?\n\nDaha sonra devamsız olanları elle değiştirebilirsin (ders numarasına sağ tıklayarak).',
    id: 'Tandai SEMUA siswa yang terlihat sebagai "Hadir"?\n\nAnda kemudian dapat mengubah status yang tidak hadir secara manual (klik kanan pada nomor pelajaran).',
    it: 'Segnare TUTTI gli studenti visibili come "Presente"?\n\nPotrai poi modificare manualmente gli assenti (clic destro sul numero della lezione).',
    pl: 'Oznaczyć WSZYSTKICH widocznych uczniów jako "Obecny"?\n\nNastępnie możesz ręcznie zmienić status nieobecnych (kliknięcie prawym przyciskiem na numer lekcji).',
    pt: 'Marcar TODOS os alunos visíveis como "Presente"?\n\nDepois você pode alterar manualmente os ausentes (clique com o botão direito no número da aula).'
  },
  attendanceMarking: {
    ar: '⏳ جارٍ التسجيل...',
    en: '⏳ Marking...',
    es: '⏳ Marcando...',
    ru: '⏳ Отмечаем...',
    fr: '⏳ Marquage...',
    tr: '⏳ İşaretleniyor...',
    id: '⏳ Menandai...',
    it: '⏳ Registrazione...',
    pl: '⏳ Zaznaczanie...',
    pt: '⏳ Marcando...'
  },
  attendanceNoChips: {
    ar: 'لم يتم العثور على أي درس مُميَّز (الدرس الحالي) في الصفحة. راجع وحدة تحكّم المتصفح.',
    en: 'No highlighted lesson chip (current lesson) found on the page. Check the console.',
    es: 'No se encontró ningún chip resaltado (lección actual) en la página. Revisa la consola.',
    ru: 'На странице не найден выделенный урок (текущий урок). Проверьте консоль браузера.',
    fr: 'Aucune leçon en cours mise en évidence trouvée sur la page. Vérifiez la console.',
    tr: 'Sayfada vurgulanmış bir ders (mevcut ders) bulunamadı. Konsolu kontrol edin.',
    id: 'Tidak ditemukan chip pelajaran yang disorot (pelajaran saat ini) di halaman. Periksa konsol browser.',
    it: 'Nessuna lezione evidenziata (lezione attuale) trovata nella pagina. Controlla la console.',
    pl: 'Nie znaleziono podświetlonej lekcji (bieżącej lekcji) na stronie. Sprawdź konsolę.',
    pt: 'Nenhuma aula destacada (aula atual) encontrada na página. Verifique o console.'
  },
  attendanceSummary: {
    ar: ({ ok, skipped, failed }) =>
      `تم تسجيل الحضور: ${ok} بنجاح` +
      (skipped.length > 0 ? `، وتم تخطّي ${skipped.length} (غير مسجّلين)` : '') +
      (failed.length > 0 ? `، وفشل ${failed.length} (راجع وحدة تحكّم المتصفح): ${failed.join('، ')}` : ''),
    en: ({ ok, skipped, failed }) =>
      `Attendance marked: ${ok} ok` +
      (skipped.length > 0 ? `, ${skipped.length} skipped (not enrolled)` : '') +
      (failed.length > 0 ? `, ${failed.length} failed (check the console): ${failed.join(', ')}` : ''),
    es: ({ ok, skipped, failed }) =>
      `Asistencia marcada: ${ok} ok` +
      (skipped.length > 0 ? `, ${skipped.length} omitidos (no inscritos)` : '') +
      (failed.length > 0 ? `, ${failed.length} fallaron (revisa la consola): ${failed.join(', ')}` : ''),
    ru: ({ ok, skipped, failed }) =>
      `Посещаемость отмечена: ${ok} успешно` +
      (skipped.length > 0 ? `, пропущено ${skipped.length} (не записаны)` : '') +
      (failed.length > 0 ? `, не удалось ${failed.length} (проверьте консоль): ${failed.join(', ')}` : ''),
    fr: ({ ok, skipped, failed }) =>
      `Présences enregistrées : ${ok} réussies` +
      (skipped.length > 0 ? `, ${skipped.length} ignorées (non inscrits)` : '') +
      (failed.length > 0 ? `, ${failed.length} échouées (vérifiez la console) : ${failed.join(', ')}` : ''),
    tr: ({ ok, skipped, failed }) =>
      `Yoklama işaretlendi: ${ok} başarılı` +
      (skipped.length > 0 ? `, ${skipped.length} atlandı (kayıtlı değil)` : '') +
      (failed.length > 0 ? `, ${failed.length} başarısız (konsolu kontrol edin): ${failed.join(', ')}` : ''),
    id: ({ ok, skipped, failed }) =>
      `Absensi ditandai: ${ok} berhasil` +
      (skipped.length > 0 ? `, ${skipped.length} dilewati (tidak terdaftar)` : '') +
      (failed.length > 0 ? `, ${failed.length} gagal (periksa konsol): ${failed.join(', ')}` : ''),
    it: ({ ok, skipped, failed }) =>
      `Presenze registrate: ${ok} riuscite` +
      (skipped.length > 0 ? `, ${skipped.length} saltate (non iscritti)` : '') +
      (failed.length > 0 ? `, ${failed.length} fallite (controlla la console): ${failed.join(', ')}` : ''),
    pl: ({ ok, skipped, failed }) =>
      `Obecność zaznaczona: ${ok} pomyślnie` +
      (skipped.length > 0 ? `, pominięto ${skipped.length} (niezapisani)` : '') +
      (failed.length > 0 ? `, nie powiodło się ${failed.length} (sprawdź konsolę): ${failed.join(', ')}` : ''),
    pt: ({ ok, skipped, failed }) =>
      `Presença marcada: ${ok} com sucesso` +
      (skipped.length > 0 ? `, ${skipped.length} ignorados (não inscritos)` : '') +
      (failed.length > 0 ? `, ${failed.length} falharam (verifique o console): ${failed.join(', ')}` : '')
  }
};

// Look up a UI string in the current message language, falling back to
// English and then Arabic. Entries that are functions are called with the
// extra arguments, so callers can write uiText('studentWithId', 42).
function uiTextForLanguage(key, languageOverride, ...args) {
  const entry = UI_STRINGS[key];
  if (!entry) {
    console.warn(`[UI] Missing UI string: ${key}`);
    return key;
  }

  const requestedLanguage = normalizeMessageLanguage(languageOverride || getMessageLanguage());
  const language = requestedLanguage === 'auto' ? detectPageLanguage() : requestedLanguage;
  const value = entry[language] ?? entry.es ?? entry.en ?? entry.ar;
  return typeof value === 'function' ? value(...args) : value;
}

function uiText(key, ...args) {
  return uiTextForLanguage(key, getMessageLanguage(), ...args);
}

function refreshInjectedUiLanguage() {
  const currentLanguage = getMessageLanguage();

  const settingsButton = document.getElementById('kodland-settings-button');
  if (settingsButton) {
    settingsButton.setAttribute('title', uiTextForLanguage('settingsTooltip', currentLanguage));
    settingsButton.setAttribute('aria-label', uiTextForLanguage('settingsTooltip', currentLanguage));
  }

  document.querySelectorAll('[data-kodland-ui-key]').forEach((node) => {
    const key = node.getAttribute('data-kodland-ui-key');
    if (!key) return;

    const label = uiTextForLanguage(key, currentLanguage);
    if (node.tagName === 'BUTTON' && !node.querySelector('svg') && node.textContent.trim() !== '') {
      node.textContent = label;
    }
    node.setAttribute('title', label);
    node.setAttribute('aria-label', label);
  });
}

// Store authentication token
let authToken = null;

// Track processed students to avoid duplicate fetches
const processedStudents = new Set();

// Track if processing is in progress
let isProcessingStudents = false;

// Function to capture Bearer token from network requests
function captureAuthToken() {
  // Intercept fetch requests (keep intercepting to catch tokens from any request)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    
    // Check if Authorization header exists
    if (options.headers) {
      let authHeader = null;
      
      // Handle Headers object
      if (options.headers instanceof Headers) {
        authHeader = options.headers.get('Authorization');
      } 
      // Handle plain object
      else if (typeof options.headers === 'object') {
        authHeader = options.headers['Authorization'] || options.headers.Authorization;
      }
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.replace('Bearer ', '').trim();
        if (newToken && newToken !== authToken) {
          authToken = newToken;
        }
      }
    }
    
    // Also check response headers for token hints (some APIs return tokens)
    const fetchPromise = originalFetch.apply(this, args);
    fetchPromise.then(response => {
      // Check if response contains auth info
      const authHeader = response.headers.get('Authorization') || response.headers.get('X-Auth-Token');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.replace('Bearer ', '').trim();
        if (newToken && newToken !== authToken) {
          authToken = newToken;
        }
      }
    }).catch(() => {});
    
    return fetchPromise;
  };
  
  // Intercept XMLHttpRequest
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
      authToken = value.replace('Bearer ', '').trim();
    }
    return originalSetRequestHeader.apply(this, arguments);
  };
  
  // Try to get token from localStorage/sessionStorage
  try {
    const keys = ['auth_token', 'token', 'access_token', 'bearer_token', 'jwt_token', 'api_token', 'accessToken', 'authToken'];
    for (const key of keys) {
      const storedToken = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (storedToken) {
        authToken = storedToken;
        break;
      }
    }
    
    // Also try to get all localStorage/sessionStorage keys and search for token-like values
    if (!authToken) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          if (value && value.length > 50 && /^[A-Za-z0-9\-._~+/]+=*$/.test(value)) {
            // Looks like a JWT or token
            authToken = value;
            break;
          }
        }
      } catch (e) {
        // Ignore
      }
    }
  } catch (e) {
    console.warn('[Group Students Info] Could not access storage:', e);
  }
  
  // Try to get token from cookies
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      const cookieName = name.toLowerCase();
      if ((cookieName.includes('token') || cookieName.includes('auth') || cookieName.includes('access')) && value && value.length > 20) {
        authToken = decodeURIComponent(value);
        break;
      }
    }
  } catch (e) {
    console.warn('[Group Students Info] Could not access cookies:', e);
  }
  
  // Try to extract token from page scripts (some apps embed tokens)
  try {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || script.innerHTML;
      // Look for common token patterns
      const tokenMatch = content.match(/(?:bearer|token|auth)[\s:=]+['"]([A-Za-z0-9\-._~+/]+=*)['"]/i);
      if (tokenMatch && tokenMatch[1]) {
        authToken = tokenMatch[1];
        break;
      }
    }
  } catch (e) {
    console.warn('[Group Students Info] Could not search scripts:', e);
  }
  
  // Monitor network requests for a short time to capture token
  setTimeout(() => {
    if (!authToken) {
      console.warn('[Group Students Info] ⚠️ No token captured yet. Waiting for network requests...');
      // Try one more time after a delay
      setTimeout(() => {
        if (!authToken) {
          console.error('[Group Students Info] ❌ No Bearer token found. API requests may fail with 401.');
          console.log('[Group Students Info] 💡 Tip: Try refreshing the page or making an action that triggers an API call.');
        }
      }, 5000);
    }
  }, 1000);
}

// ---------------------------------------------------------------------
// WhatsApp group link (manual only - no auto-detection)
// ---------------------------------------------------------------------
// The tutor pastes the group's WhatsApp invite link once per course; we just
// store and read it back, without trying to intercept or detect anything.

// Get the cached WhatsApp group link for the current group, if any
function getGroupWhatsAppLink() {
  const groupId = extractGroupId();
  if (!groupId) return null;
  return localStorage.getItem(`kodland_wa_group_link_${groupId}`) || null;
}

// Function to check if we're on a group page
function isGroupPage() {
  const url = window.location.href;
  return /https?:\/\/bo\.kodland\.org\/groups\/\d+/.test(url);
}

// Function to extract group ID from URL
function extractGroupId() {
  const url = window.location.href;
  const match = url.match(/\/groups\/(\d+)/);
  return match ? match[1] : null;
}

// Function to extract student ID from a link element
function extractStudentId(linkElement) {
  if (!linkElement) return null;
  
  const href = linkElement.getAttribute('href');
  if (!href) return null;
  
  // Extract ID from /students/{id}
  const match = href.match(/\/students\/(\d+)/);
  return match ? match[1] : null;
}

// Function to find all student elements in the column
function findStudentElements() {
  // Look for elements with the structure: <a href="/students/{id}">
  // These are inside <div class="d-flex flex-column actions">
  const studentLinks = [];
  
  // Strategy 1: Find all links that match the pattern
  const allLinks = document.querySelectorAll('a[href^="/students/"]');
  
  for (const link of allLinks) {
    const studentId = extractStudentId(link);
    if (studentId) {
      // Find the parent container with class "actions"
      const container = link.closest('.d-flex.flex-column.actions') || 
                       link.closest('[class*="actions"]') ||
                       link.parentElement;
      
      if (container) {
        studentLinks.push({
          id: studentId,
          link: link,
          container: container,
          name: link.querySelector('h3')?.textContent?.trim() || 'Unknown',
          email: link.parentElement?.querySelector('.student-info__subtitle')?.textContent?.trim() || ''
        });
      }
    }
  }
  
  console.log(`[Group Students Info] Found ${studentLinks.length} students`);
  return studentLinks;
}

// Function to fetch student information from API
async function fetchStudentInfo(studentId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/get_general_info_for_student_backoffice_page/`;
  
  try {
    
    // Prepare headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Add Bearer token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      // Try to capture token one more time by waiting a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.error(`[Group Students Info] ❌ No Bearer token available for student ${studentId}`);
        return null;
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: headers
    });
    
    if (!response.ok) {
      console.error(`[Group Students Info] HTTP error! status: ${response.status} for student ${studentId}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Group Students Info] Response is not JSON for student ${studentId}`);
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`[Group Students Info] Error fetching student ${studentId}:`, error);
    return null;
  }
}

// Function to fetch homework modules progress for a student
async function fetchHomeworkModulesProgress(studentId, groupId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/group/${groupId}/get_progress_for_homework_modules/`;
  
  try {
    
    // Prepare headers
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Add Bearer token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.error(`[Group Students Info] ❌ No Bearer token available for progress`);
        return null;
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });
    
    if (!response.ok) {
      console.error(`[Group Students Info] HTTP error! status: ${response.status} for homework modules progress`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Group Students Info] Response is not JSON for homework modules progress`);
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`[Group Students Info] Error fetching homework modules progress:`, error);
    return null;
  }
}

// Function to get completed lessons count from the page
function getCompletedLessonsCount() {
  const xpath = '//*[@id="app"]/div/div/div/div/div[2]/main/div/div[1]/div[1]/div[2]/div[2]/div[2]/div/div/div[6]/div/div/span/span';
  
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    const element = result.singleNodeValue;
    if (element) {
      const text = element.textContent?.trim() || element.innerText?.trim() || '';
      console.log(`[getCompletedLessonsCount] ✅ Found element with text: "${text}"`);
      
      // Extract format like "7/14" where 7 is completed and 14 is total
      const match = text.match(/(\d+)\/(\d+)/);
      if (match) {
        const completed = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        console.log(`[getCompletedLessonsCount] ✅ Successfully extracted: ${completed} completed out of ${total} total`);
        return { completed, total };
      } else {
        console.warn(`[getCompletedLessonsCount] ⚠️ Text found but doesn't match format "X/Y": "${text}"`);
      }
    } else {
      console.warn(`[getCompletedLessonsCount] ⚠️ Element not found with XPath`);
    }
  } catch (error) {
    console.error('[getCompletedLessonsCount] ❌ Error finding element:', error);
  }
  
  // Fallback: return null if not found
  console.warn('[getCompletedLessonsCount] ❌ Could not find completed lessons count - returning null');
  return null;
}

// Function to extract lesson IDs from modules progress data
function extractLessonIds(modulesData, maxLessons = null) {
  // Preserve discovery order (as returned by the API) while deduping
  const lessonIds = [];
  const seen = new Set();
  
  if (!modulesData) {
    console.warn('[extractLessonIds] No modules data provided');
    return [];
  }
  
  // Try to find lesson IDs in different possible structures
  function addLessonId(id, path) {
    if (id === undefined || id === null) return;
    const key = String(id);
    if (!seen.has(key)) {
      seen.add(key);
      lessonIds.push(id);
      console.log(`[extractLessonIds] Found lesson id: ${id} at path: ${path}`);
    }
  }
  
  function extractFromObject(obj, path = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if this object has a lesson_id or id field
    if (obj.hasOwnProperty('lesson_id')) addLessonId(obj.lesson_id, path);
    if (obj.hasOwnProperty('lessonId')) addLessonId(obj.lessonId, path);
    if (obj.hasOwnProperty('id') && path.includes('lesson')) addLessonId(obj.id, path);
    
    // Recursively search in nested objects and arrays
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          extractFromObject(item, `${newPath}[${index}]`);
        });
      } else if (value && typeof value === 'object') {
        extractFromObject(value, newPath);
      }
    }
  }
  
  extractFromObject(modulesData);
  
  let lessonIdsArray = lessonIds;
  console.log(`[extractLessonIds] Found ${lessonIdsArray.length} total lesson IDs before limiting (order preserved)`);
  
  // Limit to completed lessons if maxLessons is specified
  if (maxLessons !== null && maxLessons > 0) {
    if (lessonIdsArray.length > maxLessons) {
      const originalLength = lessonIdsArray.length;
      lessonIdsArray = lessonIdsArray.slice(0, maxLessons);
      console.log(`[extractLessonIds] ✅ Limited to ${maxLessons} completed lessons (out of ${originalLength} total found)`);
    } else {
      console.log(`[extractLessonIds] Found ${lessonIdsArray.length} lessons (less than or equal to ${maxLessons} completed)`);
    }
  } else {
    console.warn(`[extractLessonIds] ⚠️ No maxLessons limit specified, will process all ${lessonIdsArray.length} found lessons`);
  }
  
  console.log(`[extractLessonIds] Final extracted ${lessonIdsArray.length} lesson IDs:`, lessonIdsArray);
  return lessonIdsArray;
}

// Function to fetch class tasks progress for a lesson
async function fetchClassTasksProgress(studentId, lessonId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/lesson/${lessonId}/get_progress_for_class_tasks/`;
  
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });
    
    if (!response.ok) {
      console.error(`[Group Students Info] HTTP error! status: ${response.status} for class tasks (lesson ${lessonId})`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Group Students Info] Response is not JSON for class tasks (lesson ${lessonId})`);
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`[Group Students Info] Error fetching class tasks progress for lesson ${lessonId}:`, error);
    return null;
  }
}

// Function to fetch homework tasks progress for a lesson
async function fetchHomeworkTasksProgress(studentId, lessonId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/lesson/${lessonId}/get_progress_for_homework_tasks/`;
  
  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });
    
    if (!response.ok) {
      console.error(`[Group Students Info] HTTP error! status: ${response.status} for homework tasks (lesson ${lessonId})`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[Group Students Info] Response is not JSON for homework tasks (lesson ${lessonId})`);
      return null;
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`[Group Students Info] Error fetching homework tasks progress for lesson ${lessonId}:`, error);
    return null;
  }
}

// Function to organize tasks data by modules and lessons
function organizeTasksByModules(modulesData, tasksData) {
  const organized = {};
  
  // First, try to organize by modules from modulesData
  if (Array.isArray(modulesData)) {
    modulesData.forEach((module, moduleIndex) => {
      const moduleName = module.name || module.title || module.module_name || `Module ${moduleIndex + 1}`;
      const moduleId = module.id || module.module_id || moduleIndex;
      
      if (!organized[moduleId]) {
        organized[moduleId] = {
          id: moduleId,
          name: moduleName,
          lessons: []
        };
      }
      
      // Extract lessons from module
      if (module.lessons && Array.isArray(module.lessons)) {
        module.lessons.forEach((lesson, lessonIndex) => {
          const lessonId = lesson.id || lesson.lesson_id || tasksData[lessonIndex]?.lessonId;
          if (lessonId) {
            const taskData = tasksData.find(t => t.lessonId == lessonId);
            organized[moduleId].lessons.push({
              id: lessonId,
              name: lesson.name || lesson.title || `Lesson ${lessonIndex + 1}`,
              classTasks: taskData?.classTasks || null,
              homeworkTasks: taskData?.homeworkTasks || null
            });
          }
        });
      }
    });
  } else if (typeof modulesData === 'object' && modulesData !== null) {
    // If modulesData is an object, try to extract modules
    const modulesArray = modulesData.modules || modulesData.data || [modulesData];
    modulesArray.forEach((module, moduleIndex) => {
      const moduleName = module.name || module.title || module.module_name || `Module ${moduleIndex + 1}`;
      const moduleId = module.id || module.module_id || moduleIndex;
      
      if (!organized[moduleId]) {
        organized[moduleId] = {
          id: moduleId,
          name: moduleName,
          lessons: []
        };
      }
    });
  }
  
  // If no modules found, organize by lessons directly
  if (Object.keys(organized).length === 0) {
    organized['default'] = {
      id: 'default',
      name: 'All Lessons',
      lessons: tasksData.map((taskData, index) => ({
        id: taskData.lessonId,
        name: `Lesson ${index + 1}`,
        classTasks: taskData.classTasks,
        homeworkTasks: taskData.homeworkTasks
      }))
    };
  } else {
    // Map tasks to lessons in modules
    tasksData.forEach(taskData => {
      // Try to find which module this lesson belongs to
      let found = false;
      for (const moduleId in organized) {
        const module = organized[moduleId];
        const existingLesson = module.lessons.find(l => l.id == taskData.lessonId);
        if (existingLesson) {
          existingLesson.classTasks = taskData.classTasks;
          existingLesson.homeworkTasks = taskData.homeworkTasks;
          found = true;
          break;
        }
      }
      
      // If not found in any module, add to first module or create default
      if (!found) {
        const firstModuleId = Object.keys(organized)[0];
        organized[firstModuleId].lessons.push({
          id: taskData.lessonId,
          name: `Lesson ${taskData.lessonId}`,
          classTasks: taskData.classTasks,
          homeworkTasks: taskData.homeworkTasks
        });
      }
    });
  }
  
  return organized;
}

// Function to calculate task percentages
function calculateTaskPercentages(organizedData) {
  let totalHomework = 0;
  let submittedHomework = 0;
  let totalClass = 0;
  let submittedClass = 0;
  
  Object.values(organizedData).forEach(module => {
    module.lessons.forEach(lesson => {
      // Count homework tasks
      if (lesson.homeworkTasks) {
        let homeworkTasks = [];
        if (Array.isArray(lesson.homeworkTasks)) {
          homeworkTasks = lesson.homeworkTasks;
        } else if (typeof lesson.homeworkTasks === 'object' && lesson.homeworkTasks !== null) {
          homeworkTasks = lesson.homeworkTasks.tasks || lesson.homeworkTasks.data || [lesson.homeworkTasks];
        }
        
        homeworkTasks.forEach(task => {
          const statusKey = task.task_status_key || task.status_key || '';
          totalHomework++;
          if (statusKey === 'TASK_SUBMITTED' || statusKey === 'TASK_CHECKED' || statusKey === 'TASK_SUBMITTED_LATE') {
            submittedHomework++;
          }
        });
      }
      
      // Count class tasks
      if (lesson.classTasks) {
        let classTasks = [];
        if (Array.isArray(lesson.classTasks)) {
          classTasks = lesson.classTasks;
        } else if (typeof lesson.classTasks === 'object' && lesson.classTasks !== null) {
          classTasks = lesson.classTasks.tasks || lesson.classTasks.data || [lesson.classTasks];
        }
        
        classTasks.forEach(task => {
          const statusKey = task.task_status_key || task.status_key || '';
          totalClass++;
          if (statusKey === 'TASK_SUBMITTED' || statusKey === 'TASK_CHECKED' || statusKey === 'TASK_SUBMITTED_LATE') {
            submittedClass++;
          }
        });
      }
    });
  });
  
  const homeworkPercentage = totalHomework > 0 ? Math.round((submittedHomework / totalHomework) * 100) : 100;
  const classPercentage = totalClass > 0 ? Math.round((submittedClass / totalClass) * 100) : 100;
  
  return {
    homeworkPercentage,
    classPercentage,
    totalHomework,
    submittedHomework,
    totalClass,
    submittedClass
  };
}

// Function to generate weekly summary message
function generateWeeklySummaryMessage(studentName, lessonsCompleted, percentages, language = getMessageLanguage()) {
  const { homeworkPercentage, classPercentage } = percentages;
  
  const messages = {
    ar: {
      greeting: `مرحباً ${studentName}،`,
      intro: `إليك ملخصك الأسبوعي: أنجزنا حتى الآن ${arabicCount(lessonsCompleted, ARABIC_LESSON_FORMS)}، وقد سلّمت ${homeworkPercentage}% من الأنشطة المنزلية و${classPercentage}% من الأنشطة الصفية.`,
      allCompleted: `تهانينا! لقد أكملت جميع أنشطتك. واصل على هذا المنوال، فأنت تقوم بعمل ممتاز.`,
      lowPercentage: `ألاحظ وجود بعض الأنشطة المعلّقة. لا تقلق، يمكنك الاعتماد على مساعدتي لإكمالها. وإن أردت أن أوضّح لك ما هي هذه الأنشطة وأن نراجعها معاً، فلا تتردد في التواصل معي.`,
      regularPercentage: `أنت تحرز تقدماً جيداً. وإن أردت أن أوضّح لك ما هي الأنشطة المتبقية وأن نراجعها معاً، فلا تتردد في التواصل معي.`
    },
    es: {
      greeting: `Hola ${studentName},`,
      intro: `Aquí está tu resumen semanal, llevamos ya ${lessonsCompleted} lecciones realizadas y tienes ${homeworkPercentage}% de actividades en casa entregadas y ${classPercentage}% de actividades en clase entregadas.`,
      allCompleted: `¡Felicidades! Has completado todas tus actividades. Sigue así, estás haciendo un excelente trabajo.`,
      lowPercentage: `Veo que hay algunas actividades pendientes. No te preocupes, puedes contar con mi apoyo para completarlas. Si deseas mi ayuda para saber cuáles son las actividades y revisarlas, no dudes en contactarme.`,
      regularPercentage: `Estás haciendo un buen progreso. Si deseas mi ayuda para saber cuáles son las actividades y revisarlas, no dudes en contactarme.`
    },
    en: {
      greeting: `Hello ${studentName},`,
      intro: `Here is your weekly summary, we have completed ${lessonsCompleted} lessons and you have ${homeworkPercentage}% of homework activities submitted and ${classPercentage}% of class activities submitted.`,
      allCompleted: `Congratulations! You have completed all your activities. Keep it up, you're doing an excellent job.`,
      lowPercentage: `I see there are some pending activities. Don't worry, you can count on my support to complete them. If you need help knowing which activities they are and reviewing them, don't hesitate to contact me.`,
      regularPercentage: `You're making good progress. If you need help knowing which activities they are and reviewing them, don't hesitate to contact me.`
    },
    ru: {
      greeting: `Привет ${studentName},`,
      intro: `Вот твоя еженедельная сводка, мы уже выполнили ${lessonsCompleted} уроков, и у тебя ${homeworkPercentage}% домашних заданий сдано и ${classPercentage}% классных заданий сдано.`,
      allCompleted: `Поздравляю! Ты выполнил все свои задания. Продолжай в том же духе, ты отлично справляешься.`,
      lowPercentage: `Я вижу, что есть некоторые невыполненные задания. Не волнуйся, ты можешь рассчитывать на мою поддержку для их выполнения. Если тебе нужна помощь, чтобы узнать, какие это задания, и проверить их, не стесняйся связаться со мной.`,
      regularPercentage: `Ты делаешь хороший прогресс. Если тебе нужна помощь, чтобы узнать, какие это задания, и проверить их, не стесняйся связаться со мной.`
    },
    fr: {
      greeting: `Bonjour ${studentName},`,
      intro: `Voici ton résumé hebdomadaire, nous avons déjà complété ${lessonsCompleted} leçons et tu as ${homeworkPercentage}% d'activités à la maison soumises et ${classPercentage}% d'activités en classe soumises.`,
      allCompleted: `Félicitations ! Tu as complété toutes tes activités. Continue comme ça, tu fais un excellent travail.`,
      lowPercentage: `Je vois qu'il y a quelques activités en attente. Ne t'inquiète pas, tu peux compter sur mon soutien pour les compléter. Si tu souhaites mon aide pour savoir quelles sont les activités et les réviser, n'hésite pas à me contacter.`,
      regularPercentage: `Tu fais de bons progrès. Si tu souhaites mon aide pour savoir quelles sont les activités et les réviser, n'hésite pas à me contacter.`
    },
    tr: {
      greeting: `Merhaba ${studentName},`,
      intro: `İşte haftalık özetin, ${lessonsCompleted} ders tamamladık ve ev ödevlerinin %${homeworkPercentage}'i ve sınıf aktivitelerinin %${classPercentage}'i teslim edildi.`,
      allCompleted: `Tebrikler! Tüm aktivitelerini tamamladın. Böyle devam et, harika bir iş çıkarıyorsun.`,
      lowPercentage: `Bazı bekleyen aktiviteler olduğunu görüyorum. Endişelenme, bunları tamamlamak için desteğime güvenebilirsin. Hangi aktiviteler olduğunu öğrenmek ve bunları gözden geçirmek için yardımıma ihtiyacın olursa, benimle iletişime geçmekten çekinme.`,
      regularPercentage: `İyi bir ilerleme kaydediyorsun. Hangi aktiviteler olduğunu öğrenmek ve bunları gözden geçirmek için yardımıma ihtiyacın olursa, benimle iletişime geçmekten çekinme.`
    },
    id: {
      greeting: `Halo ${studentName},`,
      intro: `Berikut ringkasan mingguan Anda, kami telah menyelesaikan ${lessonsCompleted} pelajaran dan Anda memiliki ${homeworkPercentage}% aktivitas rumah yang dikirim dan ${classPercentage}% aktivitas kelas yang dikirim.`,
      allCompleted: `Selamat! Anda telah menyelesaikan semua aktivitas Anda. Teruskan, Anda melakukan pekerjaan yang sangat baik.`,
      lowPercentage: `Saya melihat ada beberapa aktivitas yang tertunda. Jangan khawatir, Anda dapat mengandalkan dukungan saya untuk menyelesaikannya. Jika Anda ingin bantuan saya untuk mengetahui aktivitas mana dan meninjau mereka, jangan ragu untuk menghubungi saya.`,
      regularPercentage: `Anda membuat kemajuan yang baik. Jika Anda ingin bantuan saya untuk mengetahui aktivitas mana dan meninjau mereka, jangan ragu untuk menghubungi saya.`
    },
    it: {
      greeting: `Ciao ${studentName},`,
      intro: `Ecco il tuo riepilogo settimanale, abbiamo già completato ${lessonsCompleted} lezioni e hai ${homeworkPercentage}% di attività a casa consegnate e ${classPercentage}% di attività in classe consegnate.`,
      allCompleted: `Congratulazioni! Hai completato tutte le tue attività. Continua così, stai facendo un ottimo lavoro.`,
      lowPercentage: `Vedo che ci sono alcune attività in sospeso. Non preoccuparti, puoi contare sul mio supporto per completarle. Se desideri il mio aiuto per sapere quali sono le attività e rivederle, non esitare a contattarmi.`,
      regularPercentage: `Stai facendo buoni progressi. Se desideri il mio aiuto per sapere quali sono le attività e rivederle, non esitare a contattarmi.`
    },
    pl: {
      greeting: `Cześć ${studentName},`,
      intro: `Oto twoje cotygodniowe podsumowanie, ukończyliśmy już ${lessonsCompleted} lekcji i masz ${homeworkPercentage}% zadań domowych przesłanych i ${classPercentage}% zadań klasowych przesłanych.`,
      allCompleted: `Gratulacje! Ukończyłeś wszystkie swoje zadania. Tak trzymaj, robisz świetną robotę.`,
      lowPercentage: `Widzę, że są jeszcze niektóre zadania do wykonania. Nie martw się, możesz liczyć na moje wsparcie w ich ukończeniu. Jeśli chcesz mojej pomocy, aby dowiedzieć się, jakie to zadania i je przejrzeć, nie wahaj się ze mną skontaktować.`,
      regularPercentage: `Robisz dobre postępy. Jeśli chcesz mojej pomocy, aby dowiedzieć się, jakie to zadania i je przejrzeć, nie wahaj się ze mną skontaktować.`
    },
    pt: {
      greeting: `Olá ${studentName},`,
      intro: `Aqui está o seu resumo semanal, já completamos ${lessonsCompleted} lições e você tem ${homeworkPercentage}% de atividades em casa entregues e ${classPercentage}% de atividades em classe entregues.`,
      allCompleted: `Parabéns! Você completou todas as suas atividades. Continue assim, está fazendo um excelente trabalho.`,
      lowPercentage: `Vejo que há algumas atividades pendentes. Não se preocupe, você pode contar com meu apoio para completá-las. Se desejar minha ajuda para saber quais são as atividades e revisá-las, não hesite em entrar em contato comigo.`,
      regularPercentage: `Você está fazendo um bom progresso. Se desejar minha ajuda para saber quais são as atividades e revisá-las, não hesite em entrar em contato comigo.`
    }
  };
  
  const msg = messages[language] || messages.ar;

  let message = `${msg.greeting}\n\n${msg.intro}\n\n`;
  
  // Determine message based on percentages
  if (homeworkPercentage === 100 && classPercentage === 100) {
    message += msg.allCompleted;
  } else if (homeworkPercentage < 50 || classPercentage < 50) {
    message += msg.lowPercentage;
  } else {
    message += msg.regularPercentage;
  }
  
  return message;
}

// Function to create and show tasks modal
function showTasksModal(studentId, modulesData, tasksData, onRefresh = null) {
  // Remove existing modal if any
  const existingModal = document.getElementById('kodland-tasks-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Message language for labels
  const detectedLang = getMessageLanguage();

  // Organize data by modules
  const organizedData = organizeTasksByModules(modulesData, tasksData);

  // Get student name
  const studentName = document.querySelector(`a[href="/students/${studentId}"] h3`)?.textContent?.trim() || uiText('studentWithId', studentId);

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'kodland-tasks-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal, detectedLang);

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'kodland-modal-content';
  
  // Localized labels
  const labels = {
    title: {
      ar: 'تقدّم المهام',
      es: 'Progreso de tareas',
      en: 'Tasks Progress',
      ru: 'Прогресс заданий',
      fr: 'Progression des tâches',
      tr: 'Görev İlerlemesi',
      id: 'Progres Tugas',
      it: 'Avanzamento compiti',
      pl: 'Postęp zadań',
      pt: 'Progresso das tarefas'
    },
    filters: {
      all: { ar: 'الكل', es: 'Todas', en: 'All', ru: 'Все', fr: 'Toutes', tr: 'Tümü', id: 'Semua', it: 'Tutte', pl: 'Wszystkie', pt: 'Todas' },
      submitted: { ar: 'بانتظار التصحيح', es: 'Por Calificar', en: 'To Grade', ru: 'На проверке', fr: 'À corriger', tr: 'Notlanacak', id: 'Perlu dinilai', it: 'Da valutare', pl: 'Do oceny', pt: 'Para avaliar' },
      checked: { ar: 'مُصحَّحة', es: 'Revisadas', en: 'Checked', ru: 'Проверено', fr: 'Corrigées', tr: 'Kontrol edildi', id: 'Sudah diperiksa', it: 'Corrette', pl: 'Sprawdzone', pt: 'Revisadas' },
      notSubmitted: { ar: 'غير مُسلَّمة', es: 'No Enviadas', en: 'Not Submitted', ru: 'Не отправлено', fr: 'Non envoyées', tr: 'Gönderilmedi', id: 'Belum dikirim', it: 'Non inviate', pl: 'Nie wysłane', pt: 'Não enviadas' },
      submittedLate: { ar: 'مُسلَّمة متأخرة', es: 'Enviadas tarde', en: 'Submitted late', ru: 'Отправлено поздно', fr: 'Envoyées en retard', tr: 'Geç gönderildi', id: 'Terlambat dikirim', it: 'Inviate in ritardo', pl: 'Wysłane po czasie', pt: 'Enviadas tarde' }
    }
  };
  const t = (group, key) => (labels[group]?.[key]?.[detectedLang]) || labels[group]?.[key]?.['ar'] || key;

  // Calculate task percentages
  const percentages = calculateTaskPercentages(organizedData);
  
  // Get lessons completed count
  const lessonsCompleted = Object.values(organizedData).reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
  
  // Modal header
  const header = document.createElement('div');
  header.className = 'kodland-modal-header';
  const modalTitle = labels.title[detectedLang] || labels.title.ar;
  header.innerHTML = `
    <h2>${escapeHtml(modalTitle)} - ${escapeHtml(studentName)}</h2>
    <div class="kodland-header-actions">
      <button class="kodland-weekly-summary-btn" title="${escapeHtml(uiText('weeklySummaryTooltip'))}">📊</button>
      <button class="kodland-refresh-btn" title="${escapeHtml(uiText('refreshTooltip'))}" ${onRefresh ? '' : 'disabled'}>⟳</button>
      <button class="kodland-modal-close">&times;</button>
    </div>
  `;
  
  // Create filter bar
  const filterBar = document.createElement('div');
  filterBar.className = 'kodland-filter-bar';
  filterBar.innerHTML = `
    <button class="kodland-filter-btn active" data-filter="all">
      <span>${t('filters', 'all')}</span>
      <span class="kodland-filter-count" id="count-all">0</span>
    </button>
    <button class="kodland-filter-btn" data-filter="TASK_SUBMITTED">
      <span>${t('filters', 'submitted')}</span>
      <span class="kodland-filter-count" id="count-submitted">0</span>
    </button>
    <button class="kodland-filter-btn" data-filter="TASK_CHECKED">
      <span>${t('filters', 'checked')}</span>
      <span class="kodland-filter-count" id="count-checked">0</span>
    </button>
    <button class="kodland-filter-btn" data-filter="TASK_NOT_SUBMITTED">
      <span>${t('filters', 'notSubmitted')}</span>
      <span class="kodland-filter-count" id="count-not-submitted">0</span>
    </button>
    <button class="kodland-filter-btn" data-filter="TASK_SUBMITTED_LATE">
      <span>${t('filters', 'submittedLate')}</span>
      <span class="kodland-filter-count" id="count-submitted-late">0</span>
    </button>
  `;
  
  // Modal body
  const body = document.createElement('div');
  body.className = 'kodland-modal-body';
  
  // Helper function to count tasks by status
  function countTasksByStatus(tasksData) {
    const counts = {
      all: 0,
      TASK_SUBMITTED: 0,
      TASK_CHECKED: 0,
      TASK_NOT_SUBMITTED: 0,
      TASK_SUBMITTED_LATE: 0
    };
    
    function countInData(data) {
      if (!data) return;
      
      let tasks = [];
      if (Array.isArray(data)) {
        tasks = data;
      } else if (typeof data === 'object' && data !== null) {
        tasks = data.tasks || data.data || [data];
      }
      
      tasks.forEach(task => {
        counts.all++;
        const statusKey = task.task_status_key || task.status_key || '';
        if (statusKey === 'TASK_SUBMITTED') counts.TASK_SUBMITTED++;
        else if (statusKey === 'TASK_CHECKED') counts.TASK_CHECKED++;
        else if (statusKey === 'TASK_NOT_SUBMITTED') counts.TASK_NOT_SUBMITTED++;
        else if (statusKey === 'TASK_SUBMITTED_LATE') counts.TASK_SUBMITTED_LATE++;
      });
    }
    
    // Count in all lessons
    Object.values(organizedData).forEach(module => {
      module.lessons.forEach(lesson => {
        countInData(lesson.classTasks);
        countInData(lesson.homeworkTasks);
      });
    });
    
    return counts;
  }
  
  // Count tasks and update filter counts
  const taskCounts = countTasksByStatus(tasksData);
  // Note: counts live inside filterBar, so query within filterBar to avoid null
  filterBar.querySelector('#count-all').textContent = taskCounts.all;
  filterBar.querySelector('#count-submitted').textContent = taskCounts.TASK_SUBMITTED;
  filterBar.querySelector('#count-checked').textContent = taskCounts.TASK_CHECKED;
  filterBar.querySelector('#count-not-submitted').textContent = taskCounts.TASK_NOT_SUBMITTED;
  filterBar.querySelector('#count-submitted-late').textContent = taskCounts.TASK_SUBMITTED_LATE;
  
  // Helper function to check if tasks match filter
  function hasMatchingTasks(tasksData, filterStatus) {
    if (!filterStatus) return true; // Show all if no filter
    
    if (!tasksData) return false;
    
    let tasks = [];
    if (Array.isArray(tasksData)) {
      tasks = tasksData;
    } else if (typeof tasksData === 'object' && tasksData !== null) {
      tasks = tasksData.tasks || tasksData.data || [tasksData];
    }
    
    return tasks.some(task => {
      const statusKey = task.task_status_key || task.status_key || '';
      return statusKey === filterStatus;
    });
  }
  
  // Function to render content with filter
  function renderContent(filterStatus = null) {
    body.innerHTML = ''; // Clear body
    
    Object.values(organizedData).forEach((module, moduleIndex) => {
      const lessonsContainer = document.createElement('div');
      lessonsContainer.className = 'kodland-lessons-container';
      
      module.lessons.forEach((lesson, lessonIndex) => {
        // Check if this lesson has matching tasks
        const hasClassTasks = hasMatchingTasks(lesson.classTasks, filterStatus);
        const hasHomeworkTasks = hasMatchingTasks(lesson.homeworkTasks, filterStatus);
        
        // Skip lesson if no matching tasks
        if (!hasClassTasks && !hasHomeworkTasks && filterStatus !== null) {
          return;
        }
        
        const lessonCard = document.createElement('div');
        lessonCard.className = 'kodland-lesson-card';
        
        const lessonHeader = document.createElement('div');
        lessonHeader.className = 'kodland-lesson-header';
        lessonHeader.textContent = uiText('lessonCardHeader', lessonIndex + 1, lesson.id);
        lessonCard.appendChild(lessonHeader);
        
        // Class tasks section
        if (lesson.classTasks && hasClassTasks) {
          const classTasksSection = document.createElement('div');
          classTasksSection.className = 'kodland-tasks-section kodland-class-tasks';
          classTasksSection.innerHTML = `<h4>${escapeHtml(uiText('classTasksHeading'))}</h4>`;
          
          const classTasksList = renderTasksList(lesson.classTasks, filterStatus, studentId);
          classTasksSection.appendChild(classTasksList);
          lessonCard.appendChild(classTasksSection);
        }
        
        // Homework tasks section
        if (lesson.homeworkTasks && hasHomeworkTasks) {
          const homeworkTasksSection = document.createElement('div');
          homeworkTasksSection.className = 'kodland-tasks-section kodland-homework-tasks';
          homeworkTasksSection.innerHTML = `<h4>${escapeHtml(uiText('homeworkTasksHeading'))}</h4>`;
          
          const homeworkTasksList = renderTasksList(lesson.homeworkTasks, filterStatus, studentId);
          homeworkTasksSection.appendChild(homeworkTasksList);
          lessonCard.appendChild(homeworkTasksSection);
        }
        
        if (!lesson.classTasks && !lesson.homeworkTasks) {
          lessonCard.innerHTML += `<p class="kodland-no-tasks">${escapeHtml(uiText('noTasksDataAvailable'))}</p>`;
        }
        
        lessonsContainer.appendChild(lessonCard);
      });
      
      // Only add module section if it has visible lessons
      if (lessonsContainer.children.length > 0) {
        const moduleSection = document.createElement('div');
        moduleSection.className = 'kodland-module-section';
        moduleSection.innerHTML = `<h3>${module.name}</h3>`;
        moduleSection.appendChild(lessonsContainer);
        body.appendChild(moduleSection);
      }
    });
    
    // Show message if no tasks match filter
    if (body.children.length === 0 && filterStatus !== null) {
      body.innerHTML = `<p class="kodland-no-tasks" style="text-align: center; padding: 40px; font-size: 16px;">${escapeHtml(uiText('noTasksMatchFilter'))}</p>`;
    }
  }
  
  // Initial render with no filter
  renderContent(null);
  
  modalContent.appendChild(header);
  modalContent.appendChild(filterBar);
  modalContent.appendChild(body);
  modal.appendChild(modalContent);
  
  // Add to document
  document.body.appendChild(modal);
  
  // Filter button handlers
  const filterButtons = filterBar.querySelectorAll('.kodland-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Get filter value
      const filterValue = btn.getAttribute('data-filter');
      const filterStatus = filterValue === 'all' ? null : filterValue;
      
      // Re-render content with filter
      renderContent(filterStatus);
    });
  });

  // Weekly summary button handler
  const weeklySummaryBtn = header.querySelector('.kodland-weekly-summary-btn');
  if (weeklySummaryBtn) {
    weeklySummaryBtn.addEventListener('click', async () => {
      try {
        // Alert messages by language
        const alertMessages = {
          ar: {
            noStudentData: 'تعذّر الحصول على بيانات الطالب',
            noPhone: 'لم يتم العثور على رقم هاتف وليّ الأمر',
            error: 'تعذّر إنشاء الملخص الأسبوعي'
          },
          es: {
            noStudentData: 'No se pudo obtener la información del estudiante',
            noPhone: 'No se encontró el teléfono del padre',
            error: 'Error al generar el resumen semanal'
          },
          en: {
            noStudentData: 'Could not get student information',
            noPhone: 'Parent phone number not found',
            error: 'Error generating weekly summary'
          },
          ru: {
            noStudentData: 'Не удалось получить информацию об ученике',
            noPhone: 'Телефон родителя не найден',
            error: 'Ошибка при создании еженедельной сводки'
          },
          fr: {
            noStudentData: 'Impossible d\'obtenir les informations de l\'étudiant',
            noPhone: 'Numéro de téléphone du parent introuvable',
            error: 'Erreur lors de la génération du résumé hebdomadaire'
          },
          tr: {
            noStudentData: 'Öğrenci bilgileri alınamadı',
            noPhone: 'Ebeveyn telefon numarası bulunamadı',
            error: 'Haftalık özet oluşturulurken hata'
          },
          id: {
            noStudentData: 'Tidak dapat mendapatkan informasi siswa',
            noPhone: 'Nomor telepon orang tua tidak ditemukan',
            error: 'Kesalahan saat membuat ringkasan mingguan'
          },
          it: {
            noStudentData: 'Impossibile ottenere le informazioni dello studente',
            noPhone: 'Numero di telefono del genitore non trovato',
            error: 'Errore durante la generazione del riepilogo settimanale'
          },
          pl: {
            noStudentData: 'Nie można uzyskać informacji o uczniu',
            noPhone: 'Nie znaleziono numeru telefonu rodzica',
            error: 'Błąd podczas generowania cotygodniowego podsumowania'
          },
          pt: {
            noStudentData: 'Não foi possível obter as informações do estudante',
            noPhone: 'Número de telefone do pai não encontrado',
            error: 'Erro ao gerar o resumo semanal'
          }
        };
        
        const alerts = alertMessages[detectedLang] || alertMessages.ar;
        
        // Fetch student data to get parent phone
        const studentData = await fetchStudentInfo(studentId);
        if (!studentData) {
          alert(alerts.noStudentData);
          return;
        }
        
        const parentPhone = studentData.parent_phone || 
                           studentData.parent?.phone || 
                           studentData.parent_phone_number ||
                           studentData.parent?.phone_number ||
                           null;
        
        if (!parentPhone) {
          alert(alerts.noPhone);
          return;
        }
        
        // Generate message
        const message = generateWeeklySummaryMessage(studentName, lessonsCompleted, percentages, detectedLang);
        
        // Format phone for WhatsApp
        const formattedPhone = formatPhoneForWhatsApp(parentPhone);
        const phoneForUrl = formattedPhone.replace(/^\+/, '');
        
        // Encode message for WhatsApp URL
        const encodedMessage = encodeMessageForWhatsApp(message);
        
        // Open WhatsApp
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        
        console.log('[Group Students Info] Weekly summary sent to parent:', parentPhone);
      } catch (err) {
        console.error('[Group Students Info] Error sending weekly summary:', err);
        const alertMessages = {
          ar: 'تعذّر إنشاء الملخص الأسبوعي',
          es: 'Error al generar el resumen semanal',
          en: 'Error generating weekly summary',
          ru: 'Ошибка при создании еженедельной сводки',
          fr: 'Erreur lors de la génération du résumé hebdomadaire',
          tr: 'Haftalık özet oluşturulurken hata',
          id: 'Kesalahan saat membuat ringkasan mingguan',
          it: 'Errore durante la generazione del riepilogo settimanale',
          pl: 'Błąd podczas generowania cotygodniowego podsumowania',
          pt: 'Erro ao gerar o resumo semanal'
        };
        alert(alertMessages[detectedLang] || alertMessages.ar);
      }
    });
  }
  
  // Refresh button handler
  const refreshBtn = header.querySelector('.kodland-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      if (!onRefresh) return;
      refreshBtn.disabled = true;
      refreshBtn.classList.add('loading');
      try {
        await onRefresh();
      } catch (err) {
        console.error('[Group Students Info] Error refreshing modal data:', err);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('loading');
      }
    });
  }
  
  // Close button handler
  const closeBtn = modal.querySelector('.kodland-modal-close');
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape' && document.getElementById('kodland-tasks-modal')) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  console.log('[Group Students Info] ✅ Modal displayed');
}

// Function to render tasks list
function renderTasksList(tasksData, filterStatus = null, studentId = null) {
  const list = document.createElement('div');
  list.className = 'kodland-tasks-list';

  if (!tasksData) {
    list.innerHTML = `<p>${escapeHtml(uiText('noData'))}</p>`;
    return list;
  }
  
  // Extract tasks array
  let tasks = [];
  if (Array.isArray(tasksData)) {
    tasks = tasksData;
  } else if (typeof tasksData === 'object' && tasksData !== null) {
    tasks = tasksData.tasks || tasksData.data || [tasksData];
  }
  
  if (tasks.length === 0) {
    list.innerHTML = `<p>${escapeHtml(uiText('noTasks'))}</p>`;
    return list;
  }
  
  // Filter tasks based on status
  let filteredTasks = tasks;
  if (filterStatus) {
    filteredTasks = tasks.filter(task => {
      const statusKey = task.task_status_key || task.status_key || '';
      return statusKey === filterStatus;
    });
  }
  
  if (filteredTasks.length === 0) {
    list.innerHTML = `<p class="kodland-no-tasks">${escapeHtml(uiText('noTasksThisFilter'))}</p>`;
    return list;
  }
  
  // Render filtered tasks
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement('div');
    taskItem.className = 'kodland-task-item';
    taskItem.setAttribute('data-task-status', task.task_status_key || task.status_key || '');
    
    // Use task_title as primary source, fallback to other fields
    const taskName = task.task_title || task.title || task.name || task.task_name || uiText('unnamedTask');
    const taskStatusKey = task.task_status_key || task.status_key || '';
    const taskStatusValue = task.task_status_value || task.status_value || task.status || uiText('unknownStatus');
    
    // Determine status class based on task_status_key
    let statusClass = 'pending';
    let statusIcon = '○';
    
    if (taskStatusKey === 'TASK_CHECKED') {
      statusClass = 'completed';
      statusIcon = '✓';
    } else if (taskStatusKey === 'TASK_SUBMITTED') {
      statusClass = 'submitted';
      statusIcon = '📤';
    } else if (taskStatusKey === 'TASK_NOT_SUBMITTED') {
      statusClass = 'not-submitted';
      statusIcon = '⏸';
    } else if (taskStatusKey === 'TASK_SUBMITTED_LATE') {
      statusClass = 'submitted-late';
      statusIcon = '⏰';
    } else if (taskStatusKey === 'TASK_NOT_GRADED') {
      statusClass = 'not-graded';
      statusIcon = 'ℹ';
    }
    
    // Show grade if available
    let gradeInfo = '';
    if (task.task_max_grade && task.task_max_grade > 0) {
      const currentGrade = task.task_current_grade || 0;
      gradeInfo = ` <span class="kodland-task-grade">(${currentGrade}/${task.task_max_grade})</span>`;
    }
    
    // Build task link if task_id and studentId are available
    let taskLinkHtml = '';
    if (task.task_id && studentId) {
      // No locale segment: learn.kodland.org serves task pages at
      // /task/{taskId}/check/{studentId} directly.
      const taskUrl = `https://learn.kodland.org/task/${task.task_id}/check/${studentId}`;
      taskLinkHtml = `<a class="kodland-task-link" href="${taskUrl}" target="_blank" rel="noopener noreferrer">↗</a>`;
    }

    taskItem.innerHTML = `
      <div class="kodland-task-info">
        <span class="kodland-task-name">${escapeHtml(taskName)}${gradeInfo}</span>
        <span class="kodland-task-status ${statusClass}">
          ${statusIcon} ${escapeHtml(taskStatusValue)}
        </span>
        ${taskLinkHtml}
      </div>
    `;
    
    list.appendChild(taskItem);
  });
  
  return list;
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Function to format phone number for WhatsApp
function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Remove leading zeros
  cleanPhone = cleanPhone.replace(/^0+/, '');
  
  // Ensure it starts with country code
  if (!cleanPhone.startsWith('+')) {
    // If it doesn't start with +, assume it needs country code
    // You might need to adjust this based on your country
    cleanPhone = '+' + cleanPhone;
  }
  
  return cleanPhone;
}

// Function to get country code from phone number
function getCountryCodeFromPhone(phone) {
  if (!phone) {
    console.warn('[getCountryCodeFromPhone] No phone provided');
    return null;
  }
  
  // Remove all non-digit characters except +
  let cleanPhone = String(phone).replace(/[^\d+]/g, '');
  console.log('[getCountryCodeFromPhone] Cleaned phone:', cleanPhone);
  
  // If it doesn't start with +, try to add it
  if (!cleanPhone.startsWith('+')) {
    // If it's all digits, assume it needs +
    if (/^\d+$/.test(cleanPhone)) {
      cleanPhone = '+' + cleanPhone;
      console.log('[getCountryCodeFromPhone] Added +, new phone:', cleanPhone);
    } else {
      console.warn('[getCountryCodeFromPhone] Phone does not start with + and is not all digits:', cleanPhone);
      return null;
    }
  }
  
  // Extract country code (1-3 digits after +)
  // Try 3 digits first (for codes like 212, 213, etc.), then 2, then 1
  let match = cleanPhone.match(/^\+(\d{3})/);
  if (match) {
    const code = match[1];
    console.log('[getCountryCodeFromPhone] Found 3-digit code:', code);
    return code;
  }
  
  match = cleanPhone.match(/^\+(\d{2})/);
  if (match) {
    const code = match[1];
    console.log('[getCountryCodeFromPhone] Found 2-digit code:', code);
    return code;
  }
  
  match = cleanPhone.match(/^\+(\d{1})/);
  if (match) {
    const code = match[1];
    console.log('[getCountryCodeFromPhone] Found 1-digit code:', code);
    return code;
  }
  
  console.warn('[getCountryCodeFromPhone] Could not extract country code from:', cleanPhone);
  return null;
}

// Function to get country initials from country code
function getCountryInitialsFromPhone(phone) {
  const countryCode = getCountryCodeFromPhone(phone);
  if (!countryCode) return '';
  
  // Map of country codes to country initials
  const countryInitialsMap = {
    '1': 'US', // USA/Canada
    '7': 'RU', // Russia/Kazakhstan
    '20': 'EG', // Egypt
    '27': 'ZA', // South Africa
    '30': 'GR', // Greece
    '31': 'NL', // Netherlands
    '32': 'BE', // Belgium
    '33': 'FR', // France
    '34': 'ES', // Spain
    '39': 'IT', // Italy
    '40': 'RO', // Romania
    '41': 'CH', // Switzerland
    '43': 'AT', // Austria
    '44': 'GB', // UK
    '45': 'DK', // Denmark
    '46': 'SE', // Sweden
    '47': 'NO', // Norway
    '48': 'PL', // Poland
    '49': 'DE', // Germany
    '51': 'PE', // Peru
    '52': 'MX', // Mexico
    '53': 'CU', // Cuba
    '54': 'AR', // Argentina
    '55': 'BR', // Brazil
    '56': 'CL', // Chile
    '57': 'CO', // Colombia
    '58': 'VE', // Venezuela
    '60': 'MY', // Malaysia
    '61': 'AU', // Australia
    '62': 'ID', // Indonesia
    '63': 'PH', // Philippines
    '64': 'NZ', // New Zealand
    '65': 'SG', // Singapore
    '66': 'TH', // Thailand
    '81': 'JP', // Japan
    '82': 'KR', // South Korea
    '84': 'VN', // Vietnam
    '86': 'CN', // China
    '90': 'TR', // Turkey
    '91': 'IN', // India
    '92': 'PK', // Pakistan
    '93': 'AF', // Afghanistan
    '94': 'LK', // Sri Lanka
    '95': 'MM', // Myanmar
    '98': 'IR', // Iran
    '212': 'MA', // Morocco
    '213': 'DZ', // Algeria
    '216': 'TN', // Tunisia
    '218': 'LY', // Libya
    '220': 'GM', // Gambia
    '221': 'SN', // Senegal
    '222': 'MR', // Mauritania
    '223': 'ML', // Mali
    '224': 'GN', // Guinea
    '225': 'CI', // Ivory Coast
    '226': 'BF', // Burkina Faso
    '227': 'NE', // Niger
    '228': 'TG', // Togo
    '229': 'BJ', // Benin
    '230': 'MU', // Mauritius
    '231': 'LR', // Liberia
    '232': 'SL', // Sierra Leone
    '233': 'GH', // Ghana
    '234': 'NG', // Nigeria
    '235': 'TD', // Chad
    '236': 'CF', // Central African Republic
    '237': 'CM', // Cameroon
    '238': 'CV', // Cape Verde
    '239': 'ST', // São Tomé and Príncipe
    '240': 'GQ', // Equatorial Guinea
    '241': 'GA', // Gabon
    '242': 'CG', // Republic of the Congo
    '243': 'CD', // DR Congo
    '244': 'AO', // Angola
    '245': 'GW', // Guinea-Bissau
    '246': 'IO', // British Indian Ocean Territory
    '248': 'SC', // Seychelles
    '249': 'SD', // Sudan
    '250': 'RW', // Rwanda
    '251': 'ET', // Ethiopia
    '252': 'SO', // Somalia
    '253': 'DJ', // Djibouti
    '254': 'KE', // Kenya
    '255': 'TZ', // Tanzania
    '256': 'UG', // Uganda
    '257': 'BI', // Burundi
    '258': 'MZ', // Mozambique
    '260': 'ZM', // Zambia
    '261': 'MG', // Madagascar
    '262': 'RE', // Réunion
    '263': 'ZW', // Zimbabwe
    '264': 'NA', // Namibia
    '265': 'MW', // Malawi
    '266': 'LS', // Lesotho
    '267': 'BW', // Botswana
    '268': 'SZ', // Eswatini
    '269': 'KM', // Comoros
    '290': 'SH', // Saint Helena
    '291': 'ER', // Eritrea
    '297': 'AW', // Aruba
    '298': 'FO', // Faroe Islands
    '299': 'GL', // Greenland
    '350': 'GI', // Gibraltar
    '351': 'PT', // Portugal
    '352': 'LU', // Luxembourg
    '353': 'IE', // Ireland
    '354': 'IS', // Iceland
    '355': 'AL', // Albania
    '356': 'MT', // Malta
    '357': 'CY', // Cyprus
    '358': 'FI', // Finland
    '359': 'BG', // Bulgaria
    '360': 'HU', // Hungary
    '370': 'LT', // Lithuania
    '371': 'LV', // Latvia
    '372': 'EE', // Estonia
    '373': 'MD', // Moldova
    '374': 'AM', // Armenia
    '375': 'BY', // Belarus
    '376': 'AD', // Andorra
    '377': 'MC', // Monaco
    '378': 'SM', // San Marino
    '380': 'UA', // Ukraine
    '381': 'RS', // Serbia
    '382': 'ME', // Montenegro
    '383': 'XK', // Kosovo
    '385': 'HR', // Croatia
    '386': 'SI', // Slovenia
    '387': 'BA', // Bosnia and Herzegovina
    '389': 'MK', // North Macedonia
    '420': 'CZ', // Czech Republic
    '421': 'SK', // Slovakia
    '423': 'LI', // Liechtenstein
    '500': 'FK', // Falkland Islands
    '501': 'BZ', // Belize
    '502': 'GT', // Guatemala
    '503': 'SV', // El Salvador
    '504': 'HN', // Honduras
    '505': 'NI', // Nicaragua
    '506': 'CR', // Costa Rica
    '507': 'PA', // Panama
    '509': 'HT', // Haiti
    '590': 'GP', // Guadeloupe
    '591': 'BO', // Bolivia
    '592': 'GY', // Guyana
    '593': 'EC', // Ecuador
    '594': 'GF', // French Guiana
    '595': 'PY', // Paraguay
    '596': 'MQ', // Martinique
    '597': 'SR', // Suriname
    '598': 'UY', // Uruguay
    '670': 'TL', // East Timor
    '672': 'AQ', // Antarctica
    '673': 'BN', // Brunei
    '674': 'NR', // Nauru
    '675': 'PG', // Papua New Guinea
    '676': 'TO', // Tonga
    '677': 'SB', // Solomon Islands
    '678': 'VU', // Vanuatu
    '679': 'FJ', // Fiji
    '680': 'PW', // Palau
    '681': 'WF', // Wallis and Futuna
    '682': 'CK', // Cook Islands
    '683': 'NU', // Niue
    '684': 'AS', // American Samoa
    '685': 'WS', // Samoa
    '686': 'KI', // Kiribati
    '687': 'NC', // New Caledonia
    '688': 'TV', // Tuvalu
    '689': 'PF', // French Polynesia
    '690': 'TK', // Tokelau
    '691': 'FM', // Micronesia
    '692': 'MH', // Marshall Islands
    '850': 'KP', // North Korea
    '852': 'HK', // Hong Kong
    '853': 'MO', // Macau
    '855': 'KH', // Cambodia
    '856': 'LA', // Laos
    '880': 'BD', // Bangladesh
    '886': 'TW', // Taiwan
    '960': 'MV', // Maldives
    '961': 'LB', // Lebanon
    '962': 'JO', // Jordan
    '963': 'SY', // Syria
    '964': 'IQ', // Iraq
    '965': 'KW', // Kuwait
    '966': 'SA', // Saudi Arabia
    '967': 'YE', // Yemen
    '968': 'OM', // Oman
    '970': 'PS', // Palestine
    '971': 'AE', // UAE
    '972': 'IL', // Israel
    '973': 'BH', // Bahrain
    '974': 'QA', // Qatar
    '975': 'BT', // Bhutan
    '976': 'MN', // Mongolia
    '977': 'NP', // Nepal
    '992': 'TJ', // Tajikistan
    '993': 'TM', // Turkmenistan
    '994': 'AZ', // Azerbaijan
    '995': 'GE', // Georgia
    '996': 'KG', // Kyrgyzstan
    '998': 'UZ'  // Uzbekistan
  };
  
  console.log(`[getCountryInitialsFromPhone] Looking for country code: "${countryCode}" (type: ${typeof countryCode}, length: ${countryCode.length})`);
  
  // Try exact match first (string key)
  const codeStr = String(countryCode);
  if (countryInitialsMap.hasOwnProperty(codeStr)) {
    const initials = countryInitialsMap[codeStr];
    console.log(`[getCountryInitialsFromPhone] ✅ Found exact match for "${codeStr}": ${initials}`);
    return initials;
  }
  
  // Try 3-digit match first
  if (codeStr.length === 3) {
    if (countryInitialsMap.hasOwnProperty(codeStr)) {
      const initials = countryInitialsMap[codeStr];
      console.log(`[getCountryInitialsFromPhone] ✅ Found 3-digit match for "${codeStr}": ${initials}`);
      return initials;
    }
  }
  
  // Try 2-digit match
  if (codeStr.length >= 2) {
    const twoDigit = codeStr.substring(0, 2);
    if (countryInitialsMap.hasOwnProperty(twoDigit)) {
      const initials = countryInitialsMap[twoDigit];
      console.log(`[getCountryInitialsFromPhone] ✅ Found 2-digit match for "${twoDigit}": ${initials}`);
      return initials;
    }
  }
  
  // Try 1-digit match
  if (codeStr.length >= 1) {
    const oneDigit = codeStr.substring(0, 1);
    if (countryInitialsMap.hasOwnProperty(oneDigit)) {
      const initials = countryInitialsMap[oneDigit];
      console.log(`[getCountryInitialsFromPhone] ✅ Found 1-digit match for "${oneDigit}": ${initials}`);
      return initials;
    }
  }
  
  console.warn(`[getCountryInitialsFromPhone] ❌ No initials found for country code: "${codeStr}"`);
  return '';
}

// Function to get country flag emoji from country code (kept for reference but not used)
function getCountryFlagFromPhone(phone) {
  const countryCode = getCountryCodeFromPhone(phone);
  if (!countryCode) return '';
  
  // Map of country codes to flag emojis
  // Using Unicode Regional Indicator Symbols for flags
  const countryCodeMap = {
    '1': '🇺🇸', // USA/Canada
    '7': '🇷🇺', // Russia/Kazakhstan
    '20': '🇪🇬', // Egypt
    '27': '🇿🇦', // South Africa
    '30': '🇬🇷', // Greece
    '31': '🇳🇱', // Netherlands
    '32': '🇧🇪', // Belgium
    '33': '🇫🇷', // France
    '34': '🇪🇸', // Spain
    '39': '🇮🇹', // Italy
    '40': '🇷🇴', // Romania
    '41': '🇨🇭', // Switzerland
    '43': '🇦🇹', // Austria
    '44': '🇬🇧', // UK
    '45': '🇩🇰', // Denmark
    '46': '🇸🇪', // Sweden
    '47': '🇳🇴', // Norway
    '48': '🇵🇱', // Poland
    '49': '🇩🇪', // Germany
    '51': '🇵🇪', // Peru
    '52': '🇲🇽', // Mexico
    '53': '🇨🇺', // Cuba
    '54': '🇦🇷', // Argentina
    '55': '🇧🇷', // Brazil
    '56': '🇨🇱', // Chile
    '57': '🇨🇴', // Colombia
    '58': '🇻🇪', // Venezuela
    '60': '🇲🇾', // Malaysia
    '61': '🇦🇺', // Australia
    '62': '🇮🇩', // Indonesia
    '63': '🇵🇭', // Philippines
    '64': '🇳🇿', // New Zealand
    '65': '🇸🇬', // Singapore
    '66': '🇹🇭', // Thailand
    '81': '🇯🇵', // Japan
    '82': '🇰🇷', // South Korea
    '84': '🇻🇳', // Vietnam
    '86': '🇨🇳', // China
    '90': '🇹🇷', // Turkey
    '91': '🇮🇳', // India
    '92': '🇵🇰', // Pakistan
    '93': '🇦🇫', // Afghanistan
    '94': '🇱🇰', // Sri Lanka
    '95': '🇲🇲', // Myanmar
    '98': '🇮🇷', // Iran
    '212': '🇲🇦', // Morocco
    '213': '🇩🇿', // Algeria
    '216': '🇹🇳', // Tunisia
    '218': '🇱🇾', // Libya
    '220': '🇬🇲', // Gambia
    '221': '🇸🇳', // Senegal
    '222': '🇲🇷', // Mauritania
    '223': '🇲🇱', // Mali
    '224': '🇬🇳', // Guinea
    '225': '🇨🇮', // Ivory Coast
    '226': '🇧🇫', // Burkina Faso
    '227': '🇳🇪', // Niger
    '228': '🇹🇬', // Togo
    '229': '🇧🇯', // Benin
    '230': '🇲🇺', // Mauritius
    '231': '🇱🇷', // Liberia
    '232': '🇸🇱', // Sierra Leone
    '233': '🇬🇭', // Ghana
    '234': '🇳🇬', // Nigeria
    '235': '🇹🇩', // Chad
    '236': '🇨🇫', // Central African Republic
    '237': '🇨🇲', // Cameroon
    '238': '🇨🇻', // Cape Verde
    '239': '🇸🇹', // São Tomé and Príncipe
    '240': '🇬🇶', // Equatorial Guinea
    '241': '🇬🇦', // Gabon
    '242': '🇨🇬', // Republic of the Congo
    '243': '🇨🇩', // DR Congo
    '244': '🇦🇴', // Angola
    '245': '🇬🇼', // Guinea-Bissau
    '246': '🇮🇴', // British Indian Ocean Territory
    '248': '🇸🇨', // Seychelles
    '249': '🇸🇩', // Sudan
    '250': '🇷🇼', // Rwanda
    '251': '🇪🇹', // Ethiopia
    '252': '🇸🇴', // Somalia
    '253': '🇩🇯', // Djibouti
    '254': '🇰🇪', // Kenya
    '255': '🇹🇿', // Tanzania
    '256': '🇺🇬', // Uganda
    '257': '🇧🇮', // Burundi
    '258': '🇲🇿', // Mozambique
    '260': '🇿🇲', // Zambia
    '261': '🇲🇬', // Madagascar
    '262': '🇷🇪', // Réunion
    '263': '🇿🇼', // Zimbabwe
    '264': '🇳🇦', // Namibia
    '265': '🇲🇼', // Malawi
    '266': '🇱🇸', // Lesotho
    '267': '🇧🇼', // Botswana
    '268': '🇸🇿', // Eswatini
    '269': '🇰🇲', // Comoros
    '290': '🇸🇭', // Saint Helena
    '291': '🇪🇷', // Eritrea
    '297': '🇦🇼', // Aruba
    '298': '🇫🇴', // Faroe Islands
    '299': '🇬🇱', // Greenland
    '350': '🇬🇮', // Gibraltar
    '351': '🇵🇹', // Portugal
    '352': '🇱🇺', // Luxembourg
    '353': '🇮🇪', // Ireland
    '354': '🇮🇸', // Iceland
    '355': '🇦🇱', // Albania
    '356': '🇲🇹', // Malta
    '357': '🇨🇾', // Cyprus
    '358': '🇫🇮', // Finland
    '359': '🇧🇬', // Bulgaria
    '360': '🇭🇺', // Hungary
    '370': '🇱🇹', // Lithuania
    '371': '🇱🇻', // Latvia
    '372': '🇪🇪', // Estonia
    '373': '🇲🇩', // Moldova
    '374': '🇦🇲', // Armenia
    '375': '🇧🇾', // Belarus
    '376': '🇦🇩', // Andorra
    '377': '🇲🇨', // Monaco
    '378': '🇸🇲', // San Marino
    '380': '🇺🇦', // Ukraine
    '381': '🇷🇸', // Serbia
    '382': '🇲🇪', // Montenegro
    '383': '🇽🇰', // Kosovo
    '385': '🇭🇷', // Croatia
    '386': '🇸🇮', // Slovenia
    '387': '🇧🇦', // Bosnia and Herzegovina
    '389': '🇲🇰', // North Macedonia
    '420': '🇨🇿', // Czech Republic
    '421': '🇸🇰', // Slovakia
    '423': '🇱🇮', // Liechtenstein
    '500': '🇫🇰', // Falkland Islands
    '501': '🇧🇿', // Belize
    '502': '🇬🇹', // Guatemala
    '503': '🇸🇻', // El Salvador
    '504': '🇭🇳', // Honduras
    '505': '🇳🇮', // Nicaragua
    '506': '🇨🇷', // Costa Rica
    '507': '🇵🇦', // Panama
    '509': '🇭🇹', // Haiti
    '590': '🇬🇵', // Guadeloupe
    '591': '🇧🇴', // Bolivia
    '592': '🇬🇾', // Guyana
    '593': '🇪🇨', // Ecuador
    '594': '🇬🇫', // French Guiana
    '595': '🇵🇾', // Paraguay
    '596': '🇲🇶', // Martinique
    '597': '🇸🇷', // Suriname
    '598': '🇺🇾', // Uruguay
    '670': '🇹🇱', // East Timor
    '672': '🇦🇶', // Antarctica
    '673': '🇧🇳', // Brunei
    '674': '🇳🇷', // Nauru
    '675': '🇵🇬', // Papua New Guinea
    '676': '🇹🇴', // Tonga
    '677': '🇸🇧', // Solomon Islands
    '678': '🇻🇺', // Vanuatu
    '679': '🇫🇯', // Fiji
    '680': '🇵🇼', // Palau
    '681': '🇼🇫', // Wallis and Futuna
    '682': '🇨🇰', // Cook Islands
    '683': '🇳🇺', // Niue
    '684': '🇦🇸', // American Samoa
    '685': '🇼🇸', // Samoa
    '686': '🇰🇮', // Kiribati
    '687': '🇳🇨', // New Caledonia
    '688': '🇹🇻', // Tuvalu
    '689': '🇵🇫', // French Polynesia
    '690': '🇹🇰', // Tokelau
    '691': '🇫🇲', // Micronesia
    '692': '🇲🇭', // Marshall Islands
    '850': '🇰🇵', // North Korea
    '852': '🇭🇰', // Hong Kong
    '853': '🇲🇴', // Macau
    '855': '🇰🇭', // Cambodia
    '856': '🇱🇦', // Laos
    '880': '🇧🇩', // Bangladesh
    '886': '🇹🇼', // Taiwan
    '960': '🇲🇻', // Maldives
    '961': '🇱🇧', // Lebanon
    '962': '🇯🇴', // Jordan
    '963': '🇸🇾', // Syria
    '964': '🇮🇶', // Iraq
    '965': '🇰🇼', // Kuwait
    '966': '🇸🇦', // Saudi Arabia
    '967': '🇾🇪', // Yemen
    '968': '🇴🇲', // Oman
    '970': '🇵🇸', // Palestine
    '971': '🇦🇪', // UAE
    '972': '🇮🇱', // Israel
    '973': '🇧🇭', // Bahrain
    '974': '🇶🇦', // Qatar
    '975': '🇧🇹', // Bhutan
    '976': '🇲🇳', // Mongolia
    '977': '🇳🇵', // Nepal
    '992': '🇹🇯', // Tajikistan
    '993': '🇹🇲', // Turkmenistan
    '994': '🇦🇿', // Azerbaijan
    '995': '🇬🇪', // Georgia
    '996': '🇰🇬', // Kyrgyzstan
    '998': '🇺🇿'  // Uzbekistan
  };
  
  console.log(`[getCountryFlagFromPhone] Looking for country code: "${countryCode}" (type: ${typeof countryCode}, length: ${countryCode.length})`);
  console.log(`[getCountryFlagFromPhone] Available keys in map:`, Object.keys(countryCodeMap).slice(0, 20));
  
  // Try exact match first (string key)
  const codeStr = String(countryCode);
  if (countryCodeMap.hasOwnProperty(codeStr)) {
    const flag = countryCodeMap[codeStr];
    console.log(`[getCountryFlagFromPhone] ✅ Found exact match for "${codeStr}": ${flag}`);
    return flag;
  }
  
  // Try 3-digit match first (for codes like 212, 213, 593, etc.)
  if (codeStr.length === 3) {
    if (countryCodeMap.hasOwnProperty(codeStr)) {
      const flag = countryCodeMap[codeStr];
      console.log(`[getCountryFlagFromPhone] ✅ Found 3-digit match for "${codeStr}": ${flag}`);
      return flag;
    }
  }
  
  // Try 2-digit match for codes like 20, 27, 59, etc.
  if (codeStr.length >= 2) {
    const twoDigit = codeStr.substring(0, 2);
    if (countryCodeMap.hasOwnProperty(twoDigit)) {
      const flag = countryCodeMap[twoDigit];
      console.log(`[getCountryFlagFromPhone] ✅ Found 2-digit match for "${twoDigit}": ${flag}`);
      return flag;
    }
  }
  
  // Try 1-digit match for codes like 1, 7
  if (codeStr.length >= 1) {
    const oneDigit = codeStr.substring(0, 1);
    if (countryCodeMap.hasOwnProperty(oneDigit)) {
      const flag = countryCodeMap[oneDigit];
      console.log(`[getCountryFlagFromPhone] ✅ Found 1-digit match for "${oneDigit}": ${flag}`);
      return flag;
    }
  }
  
  console.warn(`[getCountryFlagFromPhone] ❌ No flag found for country code: "${codeStr}"`);
  console.warn(`[getCountryFlagFromPhone] Tried: "${codeStr}", "${codeStr.length >= 2 ? codeStr.substring(0, 2) : ''}", "${codeStr.length >= 1 ? codeStr.substring(0, 1) : ''}"`);
  return '';
}

// Function to encode message for WhatsApp URL
function encodeMessageForWhatsApp(text) {
  if (!text) return '';
  
  // Normalize line breaks
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // encodeURIComponent properly handles UTF-8 encoding, including emojis
  // It converts Unicode characters to percent-encoded UTF-8 bytes
  let encoded = encodeURIComponent(normalized);
  
  // Replace spaces with + for URL encoding (WhatsApp format)
  encoded = encoded.replace(/%20/g, '+');
  
  return encoded;
}

// Store student credentials by ID
const studentCredentialsCache = {};

// Cache of full student general-info responses, keyed by studentId.
// Populated as students are processed on the group page; used later
// to export contacts to CSV without re-fetching everything.
const studentGeneralInfoCache = {};

// Function to get student credentials (username/password)
async function getStudentCredentials(studentId) {
  // Check cache first
  if (studentCredentialsCache[studentId]) {
    return studentCredentialsCache[studentId];
  }
  
  // Try to fetch credentials from API
  try {
    const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/get_general_info_for_student_backoffice_page/`;
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Try to extract credentials from response
      // Look for student_login and student_password specifically (as mentioned by user)
      const username = data.student_login || 
                      data.student_user || 
                      data.student_username || 
                      data.username || 
                      data.login || 
                      data.user_name || 
                      data.user_login || '';
      
      const password = data.student_password || 
                      data.student_pass || 
                      data.password || 
                      data.user_password || 
                      data.pass || '';
      
      console.log(`[Group Students Info] Extracted credentials for student ${studentId}:`, {
        username: username ? `${username.substring(0, 3)}...` : 'NOT FOUND',
        password: password ? '***' : 'NOT FOUND',
        availableFields: Object.keys(data).filter(k => k.toLowerCase().includes('login') || k.toLowerCase().includes('password') || k.toLowerCase().includes('user') || k.toLowerCase().includes('pass'))
      });
      
      if (username && password) {
        const credentials = {
          username: username,
          password: password,
          formatted: `Usuario: ${username}\nContraseña: ${password}`
        };
        studentCredentialsCache[studentId] = credentials;
        console.log(`[Group Students Info] ✅ Credentials found and cached for student ${studentId}`);
        return credentials;
      } else {
        console.warn(`[Group Students Info] ⚠️ Missing credentials for student ${studentId}:`, {
          hasUsername: !!username,
          hasPassword: !!password,
          dataKeys: Object.keys(data)
        });
      }
      
      // Try other possible structures
      if (data.credentials) {
        const creds = typeof data.credentials === 'string' 
          ? { formatted: data.credentials, username: '', password: '' }
          : { formatted: data.credentials, ...data.credentials };
        studentCredentialsCache[studentId] = creds;
        return creds;
      }
      
      if (data.login_info) {
        const loginInfo = data.login_info;
        const username = loginInfo.student_user || loginInfo.username || loginInfo.login || '';
        const password = loginInfo.student_password || loginInfo.password || loginInfo.pass || '';
        const creds = {
          username: username,
          password: password,
          formatted: `Usuario: ${username}\nContraseña: ${password}`
        };
        studentCredentialsCache[studentId] = creds;
        return creds;
      }
    }
  } catch (error) {
    console.error(`[Group Students Info] Error fetching credentials for student ${studentId}:`, error);
  }
  
  // If credentials not found, return null to trigger fallback
  return null;
}

// Function to generate the "student didn't connect to class" message.
// Personalized with the student's name, the tutor's name (from settings),
// and the course name. The wording itself comes from the editable template
// in settings (Arabic by default), so `language` only affects the fallback
// tutor name.
function getDefaultAbsenceTemplate(language = getMessageLanguage()) {
  const resolvedLanguage = normalizeMessageLanguage(language);
  const templates = {
    ar: `مرحباً {{studentName}} 👋، أنا {{tutorName}}، معلّمك في دورة {{courseName}} على منصة Kodland.
لقد بدأنا حصة اليوم ولاحظت أنك لم تنضم إلينا بعد. هل ستحضر الحصة؟ 🕒
إذا واجهت أي مشكلة تقنية في الدخول إلى المنصة، فأخبرني فوراً لأساعدك. وتذكّر أنك إن لم تتمكّن من الحضور المباشر، فمن المهم جداً أن تشاهد تسجيل الحصة من لوحة الطالب حتى لا تتأخر عن المشروع الذي نعمل عليه.
بانتظارك في القاعة! 😊`,
    es: `Hola {{studentName}} 👋, soy {{tutorName}}, tu profesor/a del curso {{courseName}} en Kodland.
Hoy comenzamos la clase y noté que aún no te uniste a nosotros. ¿Vendrás a la clase? 🕒
Si tienes algún problema técnico para entrar a la plataforma, avísame de inmediato y te ayudaré. Y recuerda que si no puedes asistir en vivo, es muy importante que veas la grabación de la clase desde el panel del estudiante para no atrasarte en el proyecto.
¡Te esperamos en la clase! 😊`,
    en: `Hello {{studentName}} 👋, I am {{tutorName}}, your tutor for the {{courseName}} course on Kodland.
We started class today and I noticed you have not joined us yet. Will you be attending? 🕒
If you have any technical issues accessing the platform, let me know right away and I will help you. Also remember that if you cannot attend live, it is very important to watch the class recording from the student panel so you do not fall behind on the project.
We look forward to seeing you in class! 😊`,
    ru: `Привет {{studentName}} 👋, я {{tutorName}}, твой преподаватель курса {{courseName}} на Kodland.
Сегодня начался урок, и я заметил, что ты ещё не присоединился к нам. Ты придёшь на занятие? 🕒
Если у тебя возникнут технические проблемы с доступом к платформе, сразу напиши мне, и я помогу. Также помни, что если ты не сможешь присутствовать в прямом эфире, важно посмотреть запись урока в панели ученика, чтобы не отставать от проекта.
Ждём тебя на занятии! 😊`,
    fr: `Bonjour {{studentName}} 👋, je suis {{tutorName}}, ton professeur du cours {{courseName}} sur Kodland.
Le cours a commencé aujourd'hui et j'ai remarqué que tu n'as pas encore rejoint la classe. Vas-tu venir ? 🕒
Si tu rencontres un problème technique pour accéder à la plateforme, informe-moi tout de suite et je t'aiderai. Et rappelle-toi que si tu ne peux pas participer en direct, il est très important de regarder l'enregistrement du cours depuis le tableau de bord de l'élève pour ne pas être en retard sur le projet.
Nous t'attendons en classe ! 😊`,
    tr: `Merhaba {{studentName}} 👋, ben {{tutorName}}, Kodland'daki {{courseName}} dersinin öğretmeniyim.
Bugün dersimiz başladı ve senin henüz katılmadığını fark ettim. Derse katılacak mısın? 🕒
Platforma erişmede teknik bir sorun yaşarsan hemen bana haber ver, sana yardım ederim. Ayrıca canlı derse gelemiyorsan, projede geride kalmamak için öğrenci panelinden ders kaydını izlemek çok önemlidir.
Seni derste bekliyoruz! 😊`,
    id: `Halo {{studentName}} 👋, saya {{tutorName}}, tutor Anda untuk kursus {{courseName}} di Kodland.
Kelas hari ini sudah dimulai dan saya melihat Anda belum bergabung. Apakah Anda akan hadir? 🕒
Jika Anda mengalami masalah teknis untuk mengakses platform, segera beri tahu saya agar saya dapat membantu. Dan ingat, jika Anda tidak bisa hadir secara langsung, sangat penting untuk menonton rekaman kelas dari panel siswa agar tidak tertinggal dalam proyek.
Kami menantikan Anda di kelas! 😊`,
    it: `Ciao {{studentName}} 👋, sono {{tutorName}}, il tuo tutor del corso {{courseName}} su Kodland.
La lezione di oggi è iniziata e ho notato che non ti sei ancora unito a noi. Verrai a lezione? 🕒
Se hai problemi tecnici per accedere alla piattaforma, avvisami subito e ti aiuterò. E ricorda che se non puoi partecipare dal vivo, è molto importante guardare la registrazione della lezione dal pannello studente per non rimanere indietro con il progetto.
Ti aspettiamo in classe! 😊`,
    pl: `Cześć {{studentName}} 👋, jestem {{tutorName}}, twoim nauczycielem kursu {{courseName}} na Kodland.
Dziś rozpoczęła się lekcja i zauważyłem, że jeszcze do nas nie dołączyłeś. Czy przyjdziesz na zajęcia? 🕒
Jeśli masz jakieś problemy techniczne z dostępem do platformy, napisz do mnie od razu, a pomogę. Pamiętaj też, że jeśli nie możesz uczestniczyć na żywo, bardzo ważne jest, aby obejrzeć nagranie z lekcji z panelu ucznia, aby nie zostać w tyle w projekcie.
Czekamy na Ciebie na zajęciach! 😊`,
    pt: `Olá {{studentName}} 👋, eu sou {{tutorName}}, seu tutor do curso {{courseName}} na Kodland.
A aula começou hoje e percebi que você ainda não entrou na sala. Você vai participar? 🕒
Se você tiver qualquer problema técnico para acessar a plataforma, me avise imediatamente e eu ajudarei. E lembre-se de que, se não puder participar ao vivo, é muito importante assistir à gravação da aula no painel do aluno para não ficar para trás no projeto.
Te esperamos na aula! 😊`
  };

  return templates[resolvedLanguage] || templates.ar;
}

function getDefaultWelcomeTemplate(language = getMessageLanguage()) {
  const resolvedLanguage = normalizeMessageLanguage(language);
  const templates = {
    ar: `مرحباً {{studentName}} 👋
تحية طيبة. اسمي {{tutorName}} وسأكون معلّمك في دورة {{courseName}}، {{scheduleLine}}. يسعدنا انضمامك إلى هذه التجربة في Kodland. ولنكون جاهزين لحصتنا الأولى، يُرجى اتّباع الخطوات التالية:
🔹 انضم إلى مجموعة واتساب الرسمية، حيث سنشارك رابط الحصة على Zoom وكل المعلومات المهمة: 👈{{waGroupLink}}
🔹 وهذا رابط دخولك الخاص إلى منصة Kodland:
• رابط الدخول المباشر: {{wonderLoginUrl}}
اسم المستخدم: {{username}}
كلمة المرور: {{password}}
أنا هنا لمساعدتك في كل ما تحتاجه. نراك قريباً!
مع خالص التحية،
{{tutorName}}
معلّم دورة {{courseName}}`,
    es: `¡Hola {{studentName}} 👋!
Saludos. Soy {{tutorName}} y seré tu tutor/a en el curso {{courseName}}, {{scheduleLine}}. Nos alegra que te unas a esta experiencia en Kodland. Para estar listos para nuestra primera clase, por favor sigue estos pasos:
🔹 Únete al grupo oficial de WhatsApp, donde compartiremos el enlace de la clase en Zoom y toda la información importante: 👈{{waGroupLink}}
🔹 Y este es tu enlace directo de acceso a la plataforma de Kodland:
• Enlace directo: {{wonderLoginUrl}}
Usuario: {{username}}
Contraseña: {{password}}
Estoy aquí para ayudarte en todo lo que necesites. ¡Te vemos pronto!
Con cariño,
{{tutorName}}
Tutor/a del curso {{courseName}}`,
    en: `Hello {{studentName}} 👋
Greetings. My name is {{tutorName}} and I will be your tutor for the {{courseName}} course, {{scheduleLine}}. We are glad you joined this experience at Kodland. To get ready for our first class, please follow these steps:
🔹 Join the official WhatsApp group, where we will share the class link on Zoom and all important information: 👈{{waGroupLink}}
🔹 And this is your direct access link to the Kodland platform:
• Direct login link: {{wonderLoginUrl}}
Username: {{username}}
Password: {{password}}
I am here to help you with anything you need. See you soon!
Sincerely,
{{tutorName}}
Tutor for the {{courseName}} course`,
    ru: `Привет {{studentName}} 👋
Здравствуйте. Меня зовут {{tutorName}}, и я буду твоим преподавателем курса {{courseName}}, {{scheduleLine}}. Мы рады, что ты присоединился к этому опыту в Kodland. Чтобы подготовиться к нашему первому уроку, пожалуйста, выполни следующие шаги:
🔹 Присоединяйся к официальной группе WhatsApp, где мы будем делиться ссылкой на занятия в Zoom и всей важной информацией: 👈{{waGroupLink}}
🔹 А это твоя прямая ссылка для входа на платформу Kodland:
• Прямая ссылка для входа: {{wonderLoginUrl}}
Имя пользователя: {{username}}
Пароль: {{password}}
Я здесь, чтобы помочь тебе во всём, что тебе понадобится. До скорой встречи!
С уважением,
{{tutorName}}
Преподаватель курса {{courseName}}`,
    fr: `Bonjour {{studentName}} 👋
Salutations. Je m'appelle {{tutorName}} et je serai ton professeur pour le cours {{courseName}}, {{scheduleLine}}. Nous sommes heureux que tu rejoignes cette expérience chez Kodland. Pour nous préparer à notre première leçon, merci de suivre ces étapes :
🔹 Rejoins le groupe officiel WhatsApp, où nous partagerons le lien du cours sur Zoom et toutes les informations importantes : 👈{{waGroupLink}}
🔹 Et voici ton lien d'accès direct à la plateforme Kodland :
• Lien d'accès direct : {{wonderLoginUrl}}
Nom d'utilisateur : {{username}}
Mot de passe : {{password}}
Je suis là pour t'aider dans tout ce dont tu as besoin. À bientôt !
Cordialement,
{{tutorName}}
Professeur du cours {{courseName}}`,
    tr: `Merhaba {{studentName}} 👋
Selamlar. Ben {{tutorName}} ve {{courseName}} dersinin öğretmeni olacağım, {{scheduleLine}}. Kodland deneyimine katıldığın için mutluyuz. İlk dersimize hazırlanmak için lütfen şu adımları takip et:
🔹 Resmî WhatsApp grubuna katıl; burada dersin Zoom bağlantısını ve tüm önemli bilgileri paylaşacağız: 👈{{waGroupLink}}
🔹 Ve bu da Kodland platformuna doğrudan giriş bağlantın:
• Doğrudan giriş bağlantısı: {{wonderLoginUrl}}
Kullanıcı adı: {{username}}
Şifre: {{password}}
İhtiyacın olan her konuda sana yardımcı olmak için buradayım. Yakında görüşürüz!
Saygılarımla,
{{tutorName}}
{{courseName}} dersi öğretmeni`,
    id: `Halo {{studentName}} 👋
Salam hangat. Nama saya {{tutorName}} dan saya akan menjadi tutor Anda untuk kursus {{courseName}}, {{scheduleLine}}. Kami senang Anda bergabung dengan pengalaman ini di Kodland. Agar siap untuk kelas pertama kami, silakan ikuti langkah-langkah berikut:
🔹 Bergabunglah ke grup WhatsApp resmi, tempat kami akan membagikan tautan kelas di Zoom dan semua informasi penting: 👈{{waGroupLink}}
🔹 Dan ini adalah tautan akses langsung Anda ke platform Kodland:
• Tautan masuk langsung: {{wonderLoginUrl}}
Nama pengguna: {{username}}
Kata sandi: {{password}}
Saya di sini untuk membantu Anda dalam segala hal yang Anda butuhkan. Sampai jumpa segera!
Salam hangat,
{{tutorName}}
Tutor kursus {{courseName}}`,
    it: `Ciao {{studentName}} 👋
Saluti. Mi chiamo {{tutorName}} e sarò il tuo tutor del corso {{courseName}}, {{scheduleLine}}. Siamo felici che tu abbia deciso di unirti a questa esperienza su Kodland. Per prepararci alla nostra prima lezione, ti invitiamo a seguire questi passaggi:
🔹 Unisciti al gruppo ufficiale di WhatsApp, dove condivideremo il link della lezione su Zoom e tutte le informazioni importanti: 👈{{waGroupLink}}
🔹 E questo è il tuo link di accesso diretto alla piattaforma Kodland:
• Link di accesso diretto: {{wonderLoginUrl}}
Nome utente: {{username}}
Password: {{password}}
Sono qui per aiutarti in tutto ciò di cui hai bisogno. A presto!
Cordiali saluti,
{{tutorName}}
Tutor del corso {{courseName}}`,
    pl: `Cześć {{studentName}} 👋
Pozdrawiamy. Nazywam się {{tutorName}} i będę twoim nauczycielem kursu {{courseName}}, {{scheduleLine}}. Cieszymy się, że dołączasz do tej przygody w Kodland. Aby przygotować się do naszej pierwszej lekcji, wykonaj następujące kroki:
🔹 Dołącz do oficjalnej grupy WhatsApp, gdzie będziemy udostępniać link do zajęć na Zoom i wszystkie ważne informacje: 👈{{waGroupLink}}
🔹 A to jest twój bezpośredni link do platformy Kodland:
• Link do logowania: {{wonderLoginUrl}}
Nazwa użytkownika: {{username}}
Hasło: {{password}}
Jestem tutaj, aby pomóc Ci we wszystkim, czego potrzebujesz. Do zobaczenia wkrótce!
Z poważaniem,
{{tutorName}}
Nauczyciel kursu {{courseName}}`,
    pt: `Olá {{studentName}} 👋
Saudações. Meu nome é {{tutorName}} e serei seu tutor do curso {{courseName}}, {{scheduleLine}}. Ficamos felizes que você tenha se juntado a esta experiência na Kodland. Para nos prepararmos para nossa primeira aula, siga os passos abaixo:
🔹 Entre no grupo oficial do WhatsApp, onde compartilharemos o link da aula no Zoom e todas as informações importantes: 👈{{waGroupLink}}
🔹 E este é o seu link direto de acesso à plataforma Kodland:
• Link de acesso direto: {{wonderLoginUrl}}
Nome de usuário: {{username}}
Senha: {{password}}
Estou aqui para te ajudar com tudo o que você precisar. Até logo!
Atenciosamente,
{{tutorName}}
Tutor do curso {{courseName}}`
  };

  return templates[resolvedLanguage] || templates.ar;
}

function getResolvedWelcomeTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  const template = settings.welcomeTemplate || DEFAULT_WELCOME_TEMPLATE;
  const defaultTemplate = getDefaultWelcomeTemplate(language);
  const defaultArabic = DEFAULT_WELCOME_TEMPLATE;
  if (!template || template === DEFAULT_WELCOME_TEMPLATE || template === defaultArabic) {
    return defaultTemplate;
  }
  return template;
}

function getResolvedAbsenceTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  const template = settings.absenceTemplate || DEFAULT_ABSENCE_TEMPLATE;
  const defaultTemplate = getDefaultAbsenceTemplate(language);
  const defaultArabic = DEFAULT_ABSENCE_TEMPLATE;
  if (!template || template === DEFAULT_ABSENCE_TEMPLATE || template === defaultArabic) {
    return defaultTemplate;
  }
  return template;
}

function generateAbsenceMessage(language = getMessageLanguage(), { studentName, tutorName, courseName } = {}) {
  const settings = getExtensionSettings();
  const resolvedTutorName = tutorName || settings.tutorName || uiText('tutorNamePlaceholder');
  const template = getResolvedAbsenceTemplate(language, settings);

  return renderTemplate(template, {
    studentName: studentName || '',
    tutorName: resolvedTutorName,
    courseName: courseName || ''
  });
}

// Function to find course name using XPath
function findCourseName() {
  const xpath = '//*[@id="app"]/div/div/div/div/div[2]/main/div/div[1]/div[1]/div[2]/div[2]/div[2]/div/div/div[1]/div/div/span/a';
  
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    const element = result.singleNodeValue;
    if (element) {
      const fullText = element.textContent?.trim() || element.innerText?.trim() || '';
      console.log('[Group Students Info] Full course text found:', fullText);
      
      // Extract course name between ID and next bracketed field
      // Format examples: "[1210] Roblox Game Developer [2024]..." (with spaces)
      //                or "[1354]Creatividad digital. Nivel 1[None]..." (no spaces)
      // We want just: "Roblox Game Developer" / "Creatividad digital. Nivel 1"
      const match = fullText.match(/\]\s*(.+?)\s*\[/);
      if (match && match[1]) {
        const courseName = match[1].trim();
        console.log('[Group Students Info] Extracted course name:', courseName);
        return courseName;
      } else {
        // Fallback: if pattern doesn't match, return the full text
        console.warn('[Group Students Info] Could not extract course name from pattern, using full text');
        return fullText;
      }
    }
  } catch (error) {
    console.warn('[Group Students Info] Error finding course name:', error);
  }
  
  return '';
}

// Function to detect page language
function detectPageLanguage() {
  // Look for the active language item in the language selector
  try {
    const activeLangItem = document.querySelector('.v-list-item--active .v-list-item-title');
    if (activeLangItem) {
      const langText = activeLangItem.textContent?.trim() || '';
      console.log('[Group Students Info] Detected language:', langText);
      
      // Map language names to codes
      const langMap = {
        'Русский': 'ru',
        'English': 'en',
        'French': 'fr',
        'Turkish': 'tr',
        'Español': 'es',
        'Indonesian': 'id',
        'Italian': 'it',
        'Polish': 'pl',
        'Portuguese': 'pt',
        'Arabic': 'ar',
        'العربية': 'ar'
      };

      return normalizeMessageLanguage(langMap[langText] || document.documentElement.lang || DEFAULT_MESSAGE_LANGUAGE);
    }
  } catch (error) {
    console.warn('[Group Students Info] Error detecting language:', error);
  }

  // Fallback: check document language
  const htmlLang = document.documentElement.lang || DEFAULT_MESSAGE_LANGUAGE;
  return normalizeMessageLanguage(htmlLang);
}

// Function to get button tooltips based on language
function getButtonTooltips(language = getMessageLanguage()) {
  const tooltips = {
    'ar': {
      openWA: 'فتح واتساب',
      welcomeMessage: 'رسالة الترحيب',
      modulesProgress: 'تقدّم الوحدات'
    },
    'es': {
      openWA: 'Abrir WhatsApp',
      welcomeMessage: 'Mensaje de Bienvenida',
      modulesProgress: 'Progreso de Módulos'
    },
    'en': {
      openWA: 'Open WhatsApp',
      welcomeMessage: 'Welcome Message',
      modulesProgress: 'Modules Progress'
    },
    'ru': {
      openWA: 'Открыть WhatsApp',
      welcomeMessage: 'Приветственное сообщение',
      modulesProgress: 'Прогресс модулей'
    },
    'fr': {
      openWA: 'Ouvrir WhatsApp',
      welcomeMessage: 'Message de bienvenue',
      modulesProgress: 'Progrès des modules'
    },
    'tr': {
      openWA: 'WhatsApp\'ı Aç',
      welcomeMessage: 'Hoş Geldin Mesajı',
      modulesProgress: 'Modül İlerlemesi'
    },
    'id': {
      openWA: 'Buka WhatsApp',
      welcomeMessage: 'Pesan Selamat Datang',
      modulesProgress: 'Kemajuan Modul'
    },
    'it': {
      openWA: 'Apri WhatsApp',
      welcomeMessage: 'Messaggio di benvenuto',
      modulesProgress: 'Progresso Moduli'
    },
    'pl': {
      openWA: 'Otwórz WhatsApp',
      welcomeMessage: 'Wiadomość powitalna',
      modulesProgress: 'Postęp modułów'
    },
    'pt': {
      openWA: 'Abrir WhatsApp',
      welcomeMessage: 'Mensagem de Boas-vindas',
      modulesProgress: 'Progresso dos Módulos'
    }
  };
  
  return tooltips[language] || tooltips['ar'];
}

// Function to create welcome message with credentials
function createWelcomeMessage(studentName, credentials, courseName = '', language = getMessageLanguage()) {
  // credentials can be an object with username/password or a formatted string
  const credentialLabels = {
    ar: (c) => `اسم المستخدم: ${c.username}\nكلمة المرور: ${c.password}`,
    es: (c) => `Usuario: ${c.username}\nContraseña: ${c.password}`,
    en: (c) => `Username: ${c.username}\nPassword: ${c.password}`,
    ru: (c) => `Пользователь: ${c.username}\nПароль: ${c.password}`
  };
  const credsText = typeof credentials === 'object' && credentials.formatted
    ? credentials.formatted
    : (typeof credentials === 'object' && credentials.username && credentials.password
      ? (credentialLabels[language] || credentialLabels.ar)(credentials)
      : credentials);
  
  // Use emojis as Unicode code points to ensure proper encoding
  // 👋 = U+1F44B, 🚀 = U+1F680
  // Convert to actual emoji characters
  const waveEmoji = String.fromCodePoint(0x1F44B); // 👋
  const rocketEmoji = String.fromCodePoint(0x1F680); // 🚀
  
  // Messages in different languages
  const messages = {
    'ar': {
      greeting: 'مرحباً!',
      welcome: courseName
        ? `أهلاً بك يا ${studentName} في دورة ${courseName} على منصة Kodland!`
        : `أهلاً بك يا ${studentName} في دورتك على منصة Kodland!`,
      credentials: 'إليك بيانات الدخول الخاصة بك:',
      loginLink: 'أدخل بياناتك عبر الرابط التالي:',
      closing: 'نتمنى لك تجربة تعلّم ممتعة معنا!'
    },
    'es': {
      greeting: '¡Hola!',
      welcome: courseName 
        ? `Bienvenido/a al curso ${courseName} de Kodland, ${studentName}!`
        : `Bienvenido/a al curso de Kodland, ${studentName}!`,
      credentials: 'Aquí están tus credenciales de acceso:',
      loginLink: 'Ingresa tus credenciales en:',
      closing: '¡Esperamos que disfrutes aprendiendo con nosotros!'
    },
    'en': {
      greeting: 'Hello!',
      welcome: courseName
        ? `Welcome to the ${courseName} course at Kodland, ${studentName}!`
        : `Welcome to Kodland course, ${studentName}!`,
      credentials: 'Here are your login credentials:',
      loginLink: 'Enter your credentials at:',
      closing: 'We hope you enjoy learning with us!'
    },
    'ru': {
      greeting: 'Привет!',
      welcome: courseName
        ? `Добро пожаловать на курс ${courseName} в Kodland, ${studentName}!`
        : `Добро пожаловать на курс Kodland, ${studentName}!`,
      credentials: 'Вот ваши учетные данные для входа:',
      loginLink: 'Введите свои учетные данные на:',
      closing: 'Надеемся, вам понравится учиться с нами!'
    },
    'fr': {
      greeting: 'Bonjour!',
      welcome: courseName
        ? `Bienvenue au cours ${courseName} de Kodland, ${studentName}!`
        : `Bienvenue au cours de Kodland, ${studentName}!`,
      credentials: 'Voici vos identifiants de connexion:',
      loginLink: 'Entrez vos identifiants sur:',
      closing: 'Nous espérons que vous apprécierez d\'apprendre avec nous!'
    },
    'tr': {
      greeting: 'Merhaba!',
      welcome: courseName
        ? `Kodland'taki ${courseName} kursuna hoş geldiniz, ${studentName}!`
        : `Kodland kursuna hoş geldiniz, ${studentName}!`,
      credentials: 'İşte giriş bilgileriniz:',
      loginLink: 'Bilgilerinizi şu adrese girin:',
      closing: 'Bizimle öğrenmekten keyif almanızı umuyoruz!'
    },
    'id': {
      greeting: 'Halo!',
      welcome: courseName
        ? `Selamat datang di kursus ${courseName} di Kodland, ${studentName}!`
        : `Selamat datang di kursus Kodland, ${studentName}!`,
      credentials: 'Berikut kredensial login Anda:',
      loginLink: 'Masukkan kredensial Anda di:',
      closing: 'Kami harap Anda menikmati belajar bersama kami!'
    },
    'it': {
      greeting: 'Ciao!',
      welcome: courseName
        ? `Benvenuto/a al corso ${courseName} di Kodland, ${studentName}!`
        : `Benvenuto/a al corso di Kodland, ${studentName}!`,
      credentials: 'Ecco le tue credenziali di accesso:',
      loginLink: 'Inserisci le tue credenziali su:',
      closing: 'Speriamo che ti piaccia imparare con noi!'
    },
    'pl': {
      greeting: 'Cześć!',
      welcome: courseName
        ? `Witamy na kursie ${courseName} w Kodland, ${studentName}!`
        : `Witamy na kursie Kodland, ${studentName}!`,
      credentials: 'Oto twoje dane logowania:',
      loginLink: 'Wprowadź swoje dane logowania na:',
      closing: 'Mamy nadzieję, że spodoba Ci się nauka z nami!'
    },
    'pt': {
      greeting: 'Olá!',
      welcome: courseName
        ? `Bem-vindo/a ao curso ${courseName} da Kodland, ${studentName}!`
        : `Bem-vindo/a ao curso da Kodland, ${studentName}!`,
      credentials: 'Aqui estão suas credenciais de acesso:',
      loginLink: 'Digite suas credenciais em:',
      closing: 'Esperamos que você goste de aprender conosco!'
    }
  };
  
  // No locale segment - learn.kodland.org serves these paths directly.
  const loginUrl = 'https://learn.kodland.org/auth';

  // Get message for current language, fallback to Arabic
  const msg = messages[language] || messages['ar'];
  
  // Return plain text with emojis (will be encoded by encodeMessageForWhatsApp)
  return `${msg.greeting} ${waveEmoji}

${msg.welcome}

${msg.credentials}
${credsText}

${msg.loginLink}
${loginUrl}

${msg.closing} ${rocketEmoji}`;
}

// Extract just the student's name from their container, stripping the
// "[XX]" country-code badge that's prepended inside the same <h3>.
function extractStudentName(container) {
  const h3 = container?.querySelector('h3');
  if (!h3) return uiText('studentFallback');
  const clone = h3.cloneNode(true);
  const countrySpan = clone.querySelector('.kodland-country-initials');
  if (countrySpan) countrySpan.remove();
  return clone.textContent.trim() || uiText('studentFallback');
}

// Function to find the nearest lesson from schedule data
function findNearestLesson(scheduleData) {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
    return null;
  }
  
  const now = new Date();
  const nowTime = now.getTime();
  
  // Filter lessons that are today or in the future, and sort by time
  const upcomingLessons = scheduleData
    .filter(lesson => {
      if (!lesson.timetable_time) return false;
      const lessonTime = new Date(lesson.timetable_time).getTime();
      // Include lessons from 15 minutes ago (in case class just started)
      const fifteenMinutesAgo = nowTime - (15 * 60 * 1000);
      return lessonTime >= fifteenMinutesAgo;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timetable_time).getTime();
      const timeB = new Date(b.timetable_time).getTime();
      return timeA - timeB;
    });
  
  if (upcomingLessons.length === 0) {
    return null;
  }
  
  return upcomingLessons[0];
}

// Find the very first lesson (M1L1) from schedule data - the earliest by date,
// regardless of whether it's already past. Used for the welcome message,
// which should reference the course's actual start date, not "whatever
// lesson is coming up next".
function findFirstLesson(scheduleData) {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
    return null;
  }

  const withTime = scheduleData.filter(lesson => lesson.timetable_time);
  if (withTime.length === 0) return null;

  return withTime.reduce((earliest, lesson) =>
    new Date(lesson.timetable_time) < new Date(earliest.timetable_time) ? lesson : earliest
  );
}

// Fetch the first lesson (M1L1) for a group - reuses the same schedule_view
// endpoint as fetchNearestLessonForGroup, but picks the earliest lesson
// instead of the next upcoming one.
async function fetchFirstLessonForGroup(groupId) {
  try {
    const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/schedule_view/`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });

    if (!response.ok) {
      console.error(`[Schedule] HTTP error ${response.status} fetching schedule for group ${groupId}`);
      return null;
    }

    const scheduleData = await response.json();
    return findFirstLesson(scheduleData);
  } catch (error) {
    console.error(`[Schedule] Error fetching first lesson for group ${groupId}:`, error);
    return null;
  }
}



// Function to format time according to country timezone
function formatTimeForCountry(dateTimeString, countryCode) {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  
  // Map country codes to timezones (simplified - using major cities)
  const timezoneMap = {
    'MX': 'America/Mexico_City',
    'US': 'America/New_York',
    'CR': 'America/Costa_Rica',
    'AR': 'America/Argentina/Buenos_Aires',
    'ES': 'Europe/Madrid',
    'CL': 'America/Santiago',
    'CO': 'America/Bogota',
    'PE': 'America/Lima',
    'PA': 'America/Panama',
    'PE': 'America/Lima',
    'EC': 'America/Guayaquil',
    'BO': 'America/La_Paz',
    'PY': 'America/Asuncion',
    'UY': 'America/Montevideo',
    'VE': 'America/Caracas',
    'GT': 'America/Guatemala',
    'HN': 'America/Tegucigalpa',
    'NI': 'America/Managua',
    'SV': 'America/El_Salvador',
    'DO': 'America/Santo_Domingo',
    'CU': 'America/Havana',
    'PR': 'America/Puerto_Rico',
    'BR': 'America/Sao_Paulo',
    'PT': 'Europe/Lisbon',
    'RU': 'Europe/Moscow',
    'FR': 'Europe/Paris',
    'TR': 'Europe/Istanbul',
    'ID': 'Asia/Jakarta',
    'IT': 'Europe/Rome',
    'PL': 'Europe/Warsaw',
    // Arabic-speaking countries
    'EG': 'Africa/Cairo',
    'SA': 'Asia/Riyadh',
    'AE': 'Asia/Dubai',
    'KW': 'Asia/Kuwait',
    'QA': 'Asia/Qatar',
    'BH': 'Asia/Bahrain',
    'OM': 'Asia/Muscat',
    'JO': 'Asia/Amman',
    'LB': 'Asia/Beirut',
    'IQ': 'Asia/Baghdad',
    'SY': 'Asia/Damascus',
    'YE': 'Asia/Aden',
    'PS': 'Asia/Hebron',
    'SD': 'Africa/Khartoum',
    'LY': 'Africa/Tripoli',
    'TN': 'Africa/Tunis',
    'DZ': 'Africa/Algiers',
    'MA': 'Africa/Casablanca'
  };

  const timezone = timezoneMap[countryCode] || 'UTC';
  
  try {
    // Format time in 12-hour format with AM/PM
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (e) {
    // Fallback to UTC if timezone not supported
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}

// Function to format date according to country
function formatDateForCountry(dateTimeString, countryCode, language = getMessageLanguage()) {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  
  // Map country codes to locales
  const localeMap = {
    'MX': 'es-MX',
    'US': 'en-US',
    'CR': 'es-CR',
    'AR': 'es-AR',
    'ES': 'es-ES',
    'CL': 'es-CL',
    'CO': 'es-CO',
    'PE': 'es-PE',
    'PA': 'es-PA',
    'EC': 'es-EC',
    'BO': 'es-BO',
    'PY': 'es-PY',
    'UY': 'es-UY',
    'VE': 'es-VE',
    'GT': 'es-GT',
    'HN': 'es-HN',
    'NI': 'es-NI',
    'SV': 'es-SV',
    'DO': 'es-DO',
    'CU': 'es-CU',
    'PR': 'es-PR',
    'BR': 'pt-BR',
    'PT': 'pt-PT',
    'RU': 'ru-RU',
    'FR': 'fr-FR',
    'TR': 'tr-TR',
    'ID': 'id-ID',
    'IT': 'it-IT',
    'PL': 'pl-PL',
    // Arabic-speaking countries. "-u-nu-latn" keeps Western digits (2026)
    // instead of Arabic-Indic ones (٢٠٢٦), which read better in WhatsApp.
    'EG': 'ar-EG-u-nu-latn',
    'SA': 'ar-SA-u-nu-latn',
    'AE': 'ar-AE-u-nu-latn',
    'KW': 'ar-KW-u-nu-latn',
    'QA': 'ar-QA-u-nu-latn',
    'BH': 'ar-BH-u-nu-latn',
    'OM': 'ar-OM-u-nu-latn',
    'JO': 'ar-JO-u-nu-latn',
    'LB': 'ar-LB-u-nu-latn',
    'IQ': 'ar-IQ-u-nu-latn',
    'SY': 'ar-SY-u-nu-latn',
    'YE': 'ar-YE-u-nu-latn',
    'PS': 'ar-PS-u-nu-latn',
    'SD': 'ar-SD-u-nu-latn',
    'LY': 'ar-LY-u-nu-latn',
    'TN': 'ar-TN-u-nu-latn',
    'DZ': 'ar-DZ-u-nu-latn',
    'MA': 'ar-MA-u-nu-latn'
  };

  // The message language decides the locale; the parent's country only
  // picks a regional variant of that same language (e.g. es-CO for a
  // Colombian number while writing in Spanish, ar-EG for an Egyptian one
  // while writing in Arabic).
  const languageLocaleMap = {
    ar: 'ar-u-nu-latn',
    es: 'es-ES',
    en: 'en-US',
    ru: 'ru-RU',
    fr: 'fr-FR',
    tr: 'tr-TR',
    id: 'id-ID',
    it: 'it-IT',
    pl: 'pl-PL',
    pt: 'pt-PT'
  };
  const countryLocale = localeMap[countryCode];
  const locale = (countryLocale && countryLocale.startsWith(`${language}-`))
    ? countryLocale
    : (languageLocaleMap[language] || 'en-US');
  
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return formatter.format(date);
  } catch (e) {
    // Fallback
    return date.toLocaleDateString();
  }
}

// Function to calculate time remaining until class
function calculateTimeRemaining(lessonTimeMs, nowTime) {
  const diffMs = lessonTimeMs - nowTime;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  return {
    minutes: diffMinutes,
    hours: diffHours,
    days: diffDays,
    totalMinutes: diffMinutes
  };
}

// Function to format time remaining text
function formatTimeRemaining(timeRemaining, language = getMessageLanguage()) {
  const { minutes, hours } = timeRemaining;

  const messages = {
    ar: {
      minutes: (m) => arabicCount(m, ARABIC_MINUTE_FORMS),
      hours: (h) => arabicCount(h, ARABIC_HOUR_FORMS),
      hoursMinutes: (h, m, msg) => {
        if (h === 0) return msg.minutes(m);
        if (m === 0) return msg.hours(h);
        return `${msg.hours(h)} و${msg.minutes(m)}`;
      }
    },
    es: {
      minutes: (m) => m === 1 ? '1 minuto' : `${m} minutos`,
      hours: (h) => h === 1 ? '1 hora' : `${h} horas`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minuto' : `${m} minutos`;
        if (m === 0) return h === 1 ? '1 hora' : `${h} horas`;
        return `${h} ${h === 1 ? 'hora' : 'horas'} y ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
      }
    },
    en: {
      minutes: (m) => m === 1 ? '1 minute' : `${m} minutes`,
      hours: (h) => h === 1 ? '1 hour' : `${h} hours`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minute' : `${m} minutes`;
        if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
        return `${h} ${h === 1 ? 'hour' : 'hours'} and ${m} ${m === 1 ? 'minute' : 'minutes'}`;
      }
    },
    ru: {
      minutes: (m) => {
        if (m === 1) return '1 минуту';
        if (m < 5) return `${m} минуты`;
        return `${m} минут`;
      },
      hours: (h) => {
        if (h === 1) return '1 час';
        if (h < 5) return `${h} часа`;
        return `${h} часов`;
      },
      hoursMinutes: (h, m, msg) => {
        if (h === 0) return msg.minutes(m);
        if (m === 0) return msg.hours(h);
        return `${msg.hours(h)} и ${msg.minutes(m)}`;
      }
    },
    fr: {
      minutes: (m) => m === 1 ? '1 minute' : `${m} minutes`,
      hours: (h) => h === 1 ? '1 heure' : `${h} heures`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minute' : `${m} minutes`;
        if (m === 0) return h === 1 ? '1 heure' : `${h} heures`;
        return `${h} ${h === 1 ? 'heure' : 'heures'} et ${m} ${m === 1 ? 'minute' : 'minutes'}`;
      }
    },
    tr: {
      minutes: (m) => `${m} dakika`,
      hours: (h) => `${h} saat`,
      hoursMinutes: (h, m) => {
        if (h === 0) return `${m} dakika`;
        if (m === 0) return `${h} saat`;
        return `${h} saat ${m} dakika`;
      }
    },
    id: {
      minutes: (m) => `${m} menit`,
      hours: (h) => `${h} jam`,
      hoursMinutes: (h, m) => {
        if (h === 0) return `${m} menit`;
        if (m === 0) return `${h} jam`;
        return `${h} jam ${m} menit`;
      }
    },
    it: {
      minutes: (m) => m === 1 ? '1 minuto' : `${m} minuti`,
      hours: (h) => h === 1 ? '1 ora' : `${h} ore`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minuto' : `${m} minuti`;
        if (m === 0) return h === 1 ? '1 ora' : `${h} ore`;
        return `${h} ${h === 1 ? 'ora' : 'ore'} e ${m} ${m === 1 ? 'minuto' : 'minuti'}`;
      }
    },
    pl: {
      minutes: (m) => {
        if (m === 1) return '1 minutę';
        if (m < 5) return `${m} minuty`;
        return `${m} minut`;
      },
      hours: (h) => {
        if (h === 1) return '1 godzinę';
        if (h < 5) return `${h} godziny`;
        return `${h} godzin`;
      },
      hoursMinutes: (h, m, msg) => {
        if (h === 0) return msg.minutes(m);
        if (m === 0) return msg.hours(h);
        return `${msg.hours(h)} i ${msg.minutes(m)}`;
      }
    },
    pt: {
      minutes: (m) => m === 1 ? '1 minuto' : `${m} minutos`,
      hours: (h) => h === 1 ? '1 hora' : `${h} horas`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minuto' : `${m} minutos`;
        if (m === 0) return h === 1 ? '1 hora' : `${h} horas`;
        return `${h} ${h === 1 ? 'hora' : 'horas'} e ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
      }
    }
  };
  
  const msg = messages[language] || messages.ar;

  if (hours === 0) {
    return msg.minutes(minutes);
  } else if (minutes < 30) {
    return msg.hours(hours);
  } else {
    const remainingMinutes = minutes % 60;
    return msg.hoursMinutes(hours, remainingMinutes, msg);
  }
}

// Function to generate class reminder message
function generateClassReminderMessage(parentName, lesson, countryCode, language = getMessageLanguage()) {
  if (!lesson) {
    return null;
  }
  
  const lessonTime = new Date(lesson.timetable_time);
  const now = new Date();
  const nowTime = now.getTime();
  const lessonTimeMs = lessonTime.getTime();
  
  // Check if class is today, tomorrow, or later
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lessonDate = new Date(lessonTime.getFullYear(), lessonTime.getMonth(), lessonTime.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = lessonDate.getTime() === today.getTime();
  const isTomorrow = lessonDate.getTime() === tomorrow.getTime();
  
  const lessonNumber = lesson.lesson_number || 0;
  const zoomLink = lesson.zoom_schedule_join_url || '';
  
  // Class has started if lesson time is now or in the past (within last 15 minutes)
  const fifteenMinutesAgo = nowTime - (15 * 60 * 1000);
  const hasStarted = lessonTimeMs <= nowTime && lessonTimeMs >= fifteenMinutesAgo;
  
  if (hasStarted) {
    // Class just started
    const messages = {
      ar: `مرحباً ${parentName}، نذكّرك بأن حصتنا رقم ${lessonNumber} قد بدأت بالفعل.`,
      es: `Hola ${parentName}, te recordamos que nuestra clase número ${lessonNumber} ya empezó.`,
      en: `Hello ${parentName}, we remind you that our class number ${lessonNumber} has already started.`,
      ru: `Привет ${parentName}, напоминаем, что наш урок номер ${lessonNumber} уже начался.`,
      fr: `Bonjour ${parentName}, nous vous rappelons que notre cours numéro ${lessonNumber} a déjà commencé.`,
      tr: `Merhaba ${parentName}, ${lessonNumber} numaralı dersimizin başladığını hatırlatıyoruz.`,
      id: `Halo ${parentName}, kami mengingatkan bahwa kelas nomor ${lessonNumber} sudah dimulai.`,
      it: `Ciao ${parentName}, ti ricordiamo che la nostra lezione numero ${lessonNumber} è già iniziata.`,
      pl: `Cześć ${parentName}, przypominamy, że nasza lekcja numer ${lessonNumber} już się rozpoczęła.`,
      pt: `Olá ${parentName}, lembramos que nossa aula número ${lessonNumber} já começou.`
    };
    
    let message = messages[language] || messages.ar;
    if (zoomLink) {
      const joinLabels = {
        ar: 'انضم عبر الرابط التالي:',
        es: 'Únete por el siguiente enlace:',
        en: 'Join via the following link:'
      };
      message += `\n\n${joinLabels[language] || joinLabels.en}\n${zoomLink}`;
    }
    return message;
  }
  
  if (isToday) {
    // Class is today - show time remaining
    const timeRemaining = calculateTimeRemaining(lessonTimeMs, nowTime);
    const timeText = formatTimeRemaining(timeRemaining, language);
    
    const messages = {
      ar: `مرحباً ${parentName}، نراك بعد ${timeText}.`,
      es: `Hola ${parentName}, nos vemos en ${timeText}.`,
      en: `Hello ${parentName}, see you in ${timeText}.`,
      ru: `Привет ${parentName}, увидимся через ${timeText}.`,
      fr: `Bonjour ${parentName}, à bientôt dans ${timeText}.`,
      tr: `Merhaba ${parentName}, ${timeText} içinde görüşürüz.`,
      id: `Halo ${parentName}, sampai jumpa dalam ${timeText}.`,
      it: `Ciao ${parentName}, ci vediamo tra ${timeText}.`,
      pl: `Cześć ${parentName}, do zobaczenia za ${timeText}.`,
      pt: `Olá ${parentName}, nos vemos em ${timeText}.`
    };
    
    let message = messages[language] || messages.ar;
    if (zoomLink) {
      const viaLabels = {
        ar: 'عبر الرابط التالي:',
        es: 'Por el siguiente enlace:',
        en: 'Via the following link:'
      };
      message += `\n\n${viaLabels[language] || viaLabels.en}\n${zoomLink}`;
    }
    return message;
  }
  
  // Class is tomorrow or later - general reminder
  const formattedDate = formatDateForCountry(lesson.timetable_time, countryCode, language);
  
  const messages = {
    ar: {
      tomorrow: `مرحباً ${parentName}، نذكّرك بأن حصتنا رقم ${lessonNumber + 1} ستكون غداً. لا تنسَ مراجعة أنشطتك، وإن كان لديك أي استفسار فيمكنك مراسلتي.`,
      later: `مرحباً ${parentName}، نذكّرك بأن حصتنا رقم ${lessonNumber + 1} ستكون يوم ${formattedDate}. لا تنسَ مراجعة أنشطتك، وإن كان لديك أي استفسار فيمكنك مراسلتي.`
    },
    es: {
      tomorrow: `Hola ${parentName}, te recordamos que mañana tenemos nuestra clase número ${lessonNumber + 1}. No olvides revisar tus actividades y si tienes dudas me puedes escribir.`,
      later: `Hola ${parentName}, te recordamos que el ${formattedDate} tenemos nuestra clase número ${lessonNumber + 1}. No olvides revisar tus actividades y si tienes dudas me puedes escribir.`
    },
    en: {
      tomorrow: `Hello ${parentName}, we remind you that tomorrow we have our class number ${lessonNumber + 1}. Don't forget to review your activities and if you have questions you can write to me.`,
      later: `Hello ${parentName}, we remind you that on ${formattedDate} we have our class number ${lessonNumber + 1}. Don't forget to review your activities and if you have questions you can write to me.`
    },
    ru: {
      tomorrow: `Привет ${parentName}, напоминаем, что завтра у нас урок номер ${lessonNumber + 1}. Не забудьте проверить свои задания, и если у вас есть вопросы, вы можете написать мне.`,
      later: `Привет ${parentName}, напоминаем, что ${formattedDate} у нас урок номер ${lessonNumber + 1}. Не забудьте проверить свои задания, и если у вас есть вопросы, вы можете написать мне.`
    },
    fr: {
      tomorrow: `Bonjour ${parentName}, nous vous rappelons que demain nous avons notre cours numéro ${lessonNumber + 1}. N'oubliez pas de réviser vos activités et si vous avez des questions, vous pouvez m'écrire.`,
      later: `Bonjour ${parentName}, nous vous rappelons que le ${formattedDate} nous avons notre cours numéro ${lessonNumber + 1}. N'oubliez pas de réviser vos activités et si vous avez des questions, vous pouvez m'écrire.`
    },
    tr: {
      tomorrow: `Merhaba ${parentName}, yarın ${lessonNumber + 1} numaralı dersimiz olduğunu hatırlatıyoruz. Aktivitelerinizi gözden geçirmeyi unutmayın ve sorularınız varsa bana yazabilirsiniz.`,
      later: `Merhaba ${parentName}, ${formattedDate} tarihinde ${lessonNumber + 1} numaralı dersimiz olduğunu hatırlatıyoruz. Aktivitelerinizi gözden geçirmeyi unutmayın ve sorularınız varsa bana yazabilirsiniz.`
    },
    id: {
      tomorrow: `Halo ${parentName}, kami mengingatkan bahwa besok kami memiliki kelas nomor ${lessonNumber + 1}. Jangan lupa untuk meninjau aktivitas Anda dan jika Anda memiliki pertanyaan, Anda dapat menulis kepada saya.`,
      later: `Halo ${parentName}, kami mengingatkan bahwa pada ${formattedDate} kami memiliki kelas nomor ${lessonNumber + 1}. Jangan lupa untuk meninjau aktivitas Anda dan jika Anda memiliki pertanyaan, Anda dapat menulis kepada saya.`
    },
    it: {
      tomorrow: `Ciao ${parentName}, ti ricordiamo che domani abbiamo la nostra lezione numero ${lessonNumber + 1}. Non dimenticare di rivedere le tue attività e se hai domande puoi scrivermi.`,
      later: `Ciao ${parentName}, ti ricordiamo che il ${formattedDate} abbiamo la nostra lezione numero ${lessonNumber + 1}. Non dimenticare di rivedere le tue attività e se hai domande puoi scrivermi.`
    },
    pl: {
      tomorrow: `Cześć ${parentName}, przypominamy, że jutro mamy naszą lekcję numer ${lessonNumber + 1}. Nie zapomnij przejrzeć swoich aktywności i jeśli masz pytania, możesz do mnie napisać.`,
      later: `Cześć ${parentName}, przypominamy, że ${formattedDate} mamy naszą lekcję numer ${lessonNumber + 1}. Nie zapomnij przejrzeć swoich aktywności i jeśli masz pytania, możesz do mnie napisać.`
    },
    pt: {
      tomorrow: `Olá ${parentName}, lembramos que amanhã temos nossa aula número ${lessonNumber + 1}. Não se esqueça de revisar suas atividades e se tiver dúvidas, pode me escrever.`,
      later: `Olá ${parentName}, lembramos que em ${formattedDate} temos nossa aula número ${lessonNumber + 1}. Não se esqueça de revisar suas atividades e se tiver dúvidas, pode me escrever.`
    }
  };
  
  const msg = messages[language] || messages.ar;
  return isTomorrow ? msg.tomorrow : msg.later;
}

// Function to fetch the personalized "wonder login" direct-access link for a student
async function fetchWonderLoginLink(studentId) {
  const apiUrl = `https://backoffice.kodland.org/api/v1/wonderlogin/generate/?student_id=${studentId}`;

  try {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });

    if (!response.ok) {
      console.error(`[WonderLogin] HTTP error ${response.status} for student ${studentId}`);
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error(`[WonderLogin] Error fetching link for student ${studentId}:`, error);
    return null;
  }
}

// Function to fetch the nearest/current lesson for a group (used for the
// welcome message's class day/time, and reusable wherever schedule info is needed)
async function fetchNearestLessonForGroup(groupId) {
  try {
    const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/schedule_view/`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: headers
    });

    if (!response.ok) {
      console.error(`[Schedule] HTTP error ${response.status} fetching schedule for group ${groupId}`);
      return null;
    }

    const scheduleData = await response.json();
    return findNearestLesson(scheduleData);
  } catch (error) {
    console.error(`[Schedule] Error fetching nearest lesson for group ${groupId}:`, error);
    return null;
  }
}

// Format a lesson's date/time in the message language and the timezone set
// in settings, e.g. for Arabic:
// { dayName: 'الجمعة', fullDate: '19 يونيو 2026', time: '16:00' }
function formatLessonDateForMessage(isoDateStr) {
  try {
    const date = new Date(isoDateStr);
    const language = getMessageLanguage();
    const timeZone = getExtensionSettings().timezone || DEFAULT_KODLAND_SETTINGS.timezone;

    // "-u-nu-latn" keeps Western digits in Arabic, which read better in
    // WhatsApp than Arabic-Indic ones.
    const dateLocaleMap = {
      ar: 'ar-u-nu-latn',
      es: 'es-CO',
      en: 'en-GB',
      ru: 'ru-RU',
      fr: 'fr-FR',
      tr: 'tr-TR',
      id: 'id-ID',
      it: 'it-IT',
      pl: 'pl-PL',
      pt: 'pt-PT'
    };
    const locale = dateLocaleMap[language] || 'en-GB';

    const part = (options) => new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);

    const dayName = part({ weekday: 'long' });
    const dayNum = part({ day: 'numeric' });
    const month = part({ month: 'long' });
    const year = part({ year: 'numeric' });
    const time = part({ hour: '2-digit', minute: '2-digit', hour12: false });

    // Spanish spells the date out with connectors; Arabic and the rest
    // just juxtapose the parts.
    const fullDate = language === 'es'
      ? `${dayNum} de ${month} de ${year}`
      : `${dayNum} ${month} ${year}`;

    return { dayName, fullDate, time };
  } catch (error) {
    console.warn('[formatLessonDateForMessage] Error formatting date:', error);
    return null;
  }
}

// Build the full welcome message from the editable template in settings.
// The tutor name, timezone and template text all come from ⚙️ Settings.
function createFullWelcomeMessage({ studentName, courseName, waGroupLink, wonderLoginUrl, username, password, lessonDateInfo }) {
  const settings = getExtensionSettings();
  const tutorName = settings.tutorName || uiText('tutorNamePlaceholder');
  const timezoneLabel = settings.timezoneLabel || DEFAULT_KODLAND_SETTINGS.timezoneLabel;

  const scheduleLine = lessonDateInfo
    ? uiText('scheduleLine', { ...lessonDateInfo, timezoneLabel })
    : uiText('scheduleLineSoon');

  const waLine = waGroupLink || uiText('waGroupLinkMissing');

  const template = getResolvedWelcomeTemplate(getMessageLanguage(), settings);

  return renderTemplate(template, {
    studentName,
    tutorName,
    courseName,
    scheduleLine,
    waGroupLink: waLine,
    wonderLoginUrl,
    username,
    password
  });
}

// Build a map of lessonId -> "M{module}L{lesson}" label (matching the visual
// numbering used on the group page), by walking the modules/lessons
// structure returned by fetchHomeworkModulesProgress.
function buildLessonLabelMap(modulesData) {
  const labelMap = {};

  let modulesArray = [];
  if (Array.isArray(modulesData)) {
    modulesArray = modulesData;
  } else if (modulesData && typeof modulesData === 'object') {
    modulesArray = modulesData.modules || modulesData.data || [];
  }

  modulesArray.forEach((module, moduleIndex) => {
    const lessons = Array.isArray(module.lessons) ? module.lessons : [];
    lessons.forEach((lesson, lessonIndex) => {
      const lessonId = lesson.id || lesson.lesson_id;
      if (lessonId !== undefined && lessonId !== null) {
        labelMap[String(lessonId)] = `M${moduleIndex + 1}L${lessonIndex + 1}`;
      }
    });
  });

  return labelMap;
}

// ---------------------------------------------------------------------
// Task alerts: pending grading (tutor) / not submitted (student)
// ---------------------------------------------------------------------
const studentTaskAlertsCache = {};

// Fetch every lesson's class + homework tasks for a student and compute:
// - pendingGradingCount: tasks the student already submitted but the tutor
//   hasn't graded/checked yet (TASK_SUBMITTED / TASK_SUBMITTED_LATE / TASK_NOT_GRADED)
// - notSubmittedTasks: names of tasks the student hasn't submitted at all (TASK_NOT_SUBMITTED)
// Reuses the same fetching pipeline as the tasks modal, just without building any UI.
async function fetchStudentTaskAlerts(studentId) {
  const groupId = extractGroupId();
  if (!groupId) return null;

  const progressData = await fetchHomeworkModulesProgress(studentId, groupId);
  if (!progressData) return null;

  const lessonsInfo = getCompletedLessonsCount();
  const maxLessons = lessonsInfo ? lessonsInfo.completed : null;

  let lessonIds = extractLessonIds(progressData, maxLessons);
  if (maxLessons !== null && maxLessons > 0 && lessonIds.length > maxLessons) {
    lessonIds = lessonIds.slice(0, maxLessons);
  }

  const lessonLabelMap = buildLessonLabelMap(progressData);

  let pendingGradingCount = 0;
  const pendingGradingTasks = [];
  const notSubmittedTasks = [];

  const extractTasksArray = (taskGroup) => {
    if (!taskGroup) return [];
    if (Array.isArray(taskGroup)) return taskGroup;
    if (typeof taskGroup === 'object') return taskGroup.tasks || taskGroup.data || [taskGroup];
    return [];
  };

  const batchSize = 3;
  for (let i = 0; i < lessonIds.length; i += batchSize) {
    const batch = lessonIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(batch.map(async (lessonId, batchIndex) => {
      const [classTasks, homeworkTasks] = await Promise.all([
        fetchClassTasksProgress(studentId, lessonId),
        fetchHomeworkTasksProgress(studentId, lessonId)
      ]);
      const label = lessonLabelMap[String(lessonId)] || uiText('lessonNumberLabel', i + batchIndex + 1);
      return { classTasks, homeworkTasks, label };
    }));

    batchResults.forEach(({ classTasks, homeworkTasks, label }) => {
      [...extractTasksArray(classTasks), ...extractTasksArray(homeworkTasks)].forEach(task => {
        const statusKey = task.task_status_key || task.status_key || '';
        const taskName = task.task_title || task.title || task.name || task.task_name || 'Tarea sin nombre';
        const taskId = task.task_id || task.id || null;

        // "Teoría" tasks are auto-graded by the platform (quizzes/reading
        // checks), so they never need a tutor to review them manually.
        // Heuristic 1: name contains "teoría"/"teoria".
        // Heuristic 2: tasks with no max grade defined are typically
        // auto-scored (the per-student modal only shows a grade badge
        // when task_max_grade > 0), so they're not tutor-gradable either.
        const isTheoryTask = /teor/i.test(taskName) || !(task.task_max_grade > 0);

        if (statusKey === 'TASK_SUBMITTED' || statusKey === 'TASK_SUBMITTED_LATE' || statusKey === 'TASK_NOT_GRADED') {
          if (!isTheoryTask) {
            pendingGradingCount++;
            pendingGradingTasks.push({ name: taskName, label, taskId });
          }
        } else if (statusKey === 'TASK_NOT_SUBMITTED') {
          if (!isTheoryTask) {
            notSubmittedTasks.push({ name: taskName, label });
          }
        }
      });
    });

    if (i + batchSize < lessonIds.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  const result = { pendingGradingCount, pendingGradingTasks, notSubmittedTasks };
  studentTaskAlertsCache[studentId] = result;
  return result;
}

// Fetch the grading report for EVERY student currently loaded in the group
// (sequentially, with a short pause between students to avoid hammering the
// API). Returns a list sorted by pendingGradingCount, descending.
async function fetchGroupGradingReport(onProgress = null) {
  const students = findStudentElements();
  const report = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const cleanName = extractStudentName(student.container);
    if (onProgress) onProgress(i + 1, students.length, cleanName);

    try {
      const alerts = await fetchStudentTaskAlerts(student.id);
      if (alerts) {
        report.push({
          name: cleanName,
          studentId: student.id,
          pendingGradingCount: alerts.pendingGradingCount,
          pendingGradingTasks: alerts.pendingGradingTasks
        });
      }
    } catch (error) {
      console.error(`[Group Grading Report] Error checking ${cleanName}:`, error);
    }

    if (i < students.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  report.sort((a, b) => b.pendingGradingCount - a.pendingGradingCount);
  return report;
}

// Show the group grading report in a modal (reusing the existing modal styles)
function showGroupGradingReportModal(report) {
  const existing = document.getElementById('kodland-grading-report-modal');
  if (existing) existing.remove();

  const totalPending = report.reduce((sum, r) => sum + r.pendingGradingCount, 0);
  const withPending = report.filter(r => r.pendingGradingCount > 0);

  // Same URL pattern used by the per-student tasks modal (no locale segment)
  const rowsHtml = withPending.length === 0
    ? `<p class="kodland-no-tasks">${escapeHtml(uiText('gradingNobodyPending'))}</p>`
    : withPending.map(r => {
        const tasksList = r.pendingGradingTasks
          .map(t => {
            const link = t.taskId
              ? `<a class="kodland-task-link" href="https://learn.kodland.org/task/${t.taskId}/check/${r.studentId}" target="_blank" rel="noopener noreferrer">${escapeHtml(uiText('gradeTaskLink'))}</a>`
              : '';
            return `<div class="kodland-task-item"><div class="kodland-task-info"><span class="kodland-task-name">${escapeHtml(t.label)}: ${escapeHtml(t.name)}</span>${link}</div></div>`;
          })
          .join('');
        return `
          <div class="kodland-lesson-card">
            <div class="kodland-lesson-header">${escapeHtml(uiText('gradingStudentRow', r.name, r.pendingGradingCount))}</div>
            <div class="kodland-tasks-list">${tasksList}</div>
          </div>
        `;
      }).join('');

  const modal = document.createElement('div');
  modal.id = 'kodland-grading-report-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal);
  modal.innerHTML = `
    <div class="kodland-modal-content">
      <div class="kodland-modal-header">
        <h2>${escapeHtml(uiText('gradingReportTitle', totalPending))}</h2>
        <button class="kodland-modal-close">&times;</button>
      </div>
      <div class="kodland-modal-body">
        ${rowsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.kodland-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// Inject the floating "Group grading report" button
function injectGroupGradingReportButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showGroupGradingReport) return;
  if (document.getElementById('kodland-grading-report-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-grading-report-button';
  button.className = 'kodland-export-contacts-btn kodland-grading-report-btn';
  button.innerHTML = escapeHtml(uiText('gradingReportButton'));
  button.setAttribute('title', uiText('gradingReportTooltip'));
  applyLanguageDirection(button);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    button.disabled = true;
    const originalHtml = button.innerHTML;

    try {
      const report = await fetchGroupGradingReport((current, total, name) => {
        button.innerHTML = `⏳ ${current}/${total}...`;
      });
      showGroupGradingReportModal(report);
    } catch (error) {
      console.error('[Group Grading Report] Error:', error);
      alert(uiText('gradingReportError'));
    } finally {
      button.disabled = false;
      button.innerHTML = originalHtml;
    }
  });

  document.body.appendChild(button);
  console.log('[Group Students Info] ✅ "Grading report" button injected');
}

// Function to display student info with buttons
function displayStudentInfo(container, studentData, studentId) {
  // Remove existing info element if any
  const existingInfo = container.querySelector('.kodland-student-buttons');
  if (existingInfo) {
    existingInfo.remove();
  }
  
  if (!studentData) {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'kodland-student-buttons';
    loadingElement.style.cssText = 'margin-top: 8px; padding: 8px; color: #999; font-size: 11px;';
    loadingElement.innerHTML = escapeHtml(uiText('loading'));
    container.appendChild(loadingElement);
    return;
  }
  
  // Extract parent information
  const parentName = studentData.parent_name ||
                     studentData.parent?.name ||
                     studentData.parent_name_full ||
                     uiText('parentFallback');
  
  const parentPhone = studentData.parent_phone || 
                      studentData.parent?.phone || 
                      studentData.parent_phone_number ||
                      studentData.parent?.phone_number ||
                      null;
  
  // Extract credentials from studentData if available (to avoid another API call)
  const studentLogin = studentData.student_login || 
                       studentData.student_user || 
                       studentData.student_username || '';
  
  const studentPassword = studentData.student_password || 
                          studentData.student_pass || '';
  
  // Cache credentials if found
  if (studentLogin && studentPassword) {
    const credentials = {
      username: studentLogin,
      password: studentPassword,
      formatted: `Usuario: ${studentLogin}\nContraseña: ${studentPassword}`
    };
    studentCredentialsCache[studentId] = credentials;
    console.log(`[Group Students Info] ✅ Credentials cached from studentData for student ${studentId}`);
  }
  
  console.log(`[Group Students Info] Parent info for student ${studentId}:`, {
    parentName,
    parentPhone,
    hasCredentials: !!(studentLogin && studentPassword)
  });
  
  if (!parentPhone) {
    return; // Don't show buttons if no phone
  }
  
  // Get language for tooltips
  const language = getMessageLanguage();
  const tooltips = getButtonTooltips(language);
  
  // Find the student name h3 element using XPath (inside the <a> tag)
  const xpath = './/a[contains(@href, "/students/")]/h3';
  let studentH3 = null;
  
  try {
    const result = document.evaluate(
      xpath,
      container,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    studentH3 = result.singleNodeValue;
  } catch (error) {
    console.warn('[Group Students Info] Error finding h3 with XPath, trying alternative:', error);
    // Fallback: find h3 inside student link
    const fallbackLink = container.querySelector('a[href^="/students/"]');
    if (fallbackLink) {
      studentH3 = fallbackLink.querySelector('h3');
    }
  }
  
  if (!studentH3) {
    console.warn('[Group Students Info] Could not find student h3 element');
    return;
  }
  
  // Get the parent <a> element
  const studentLink = studentH3.closest('a[href^="/students/"]');
  if (!studentLink) {
    console.warn('[Group Students Info] Could not find student link element');
    return;
  }
  
  // Check if buttons already exist (search outside the link as well)
  const existingButtons = document.querySelector(`.kodland-student-buttons[data-student-id="${studentId}"]`);
  if (existingButtons) {
    existingButtons.remove();
  }
  
  // Check if country initials already exist inside h3
  const existingInitials = studentH3.querySelector('.kodland-country-initials');
  if (existingInitials) {
    existingInitials.remove();
  }
  
  // Get country initials from phone number
  console.log(`[Group Students Info] Getting country initials for phone: ${parentPhone}`);
  const countryCode = getCountryCodeFromPhone(parentPhone);
  console.log(`[Group Students Info] Extracted country code: ${countryCode}`);
  const countryInitials = getCountryInitialsFromPhone(parentPhone);
  console.log(`[Group Students Info] Country initials result: "${countryInitials}"`);
  
  if (countryInitials && countryInitials.trim() && countryInitials.length > 0) {
    // Get current text content of h3
    const currentText = studentH3.textContent || studentH3.innerText || '';
    console.log(`[Group Students Info] Current h3 text: "${currentText}"`);
    
    // Check if initials are already in the text
    if (currentText.includes(`[${countryInitials}]`)) {
      console.log(`[Group Students Info] Initials already in text, skipping`);
    } else {
      // Create initials element
      const initialsElement = document.createElement('span');
      initialsElement.className = 'kodland-country-initials';
      initialsElement.textContent = `[${countryInitials}]`;
      initialsElement.style.cssText = `
        margin-right: 6px;
        font-size: 12px;
        font-weight: 600;
        vertical-align: middle;
        display: inline-block;
        color: #666;
        letter-spacing: 0.5px;
      `;
      initialsElement.setAttribute('title', `Country code: ${countryCode}`);
      
      // Insert initials at the beginning of h3 (before the student name)
      studentH3.insertBefore(initialsElement, studentH3.firstChild);
      
      console.log(`[Group Students Info] ✅ Added country initials "[${countryInitials}]" for phone ${parentPhone} (code: ${countryCode})`);
      console.log(`[Group Students Info] h3 textContent after initials:`, studentH3.textContent);
    }
  } else {
    console.warn(`[Group Students Info] ⚠️ No country initials found for phone ${parentPhone} (code: ${countryCode})`);
  }
  
  // Create buttons container (outside the <a> tag)
  const buttonsContainer = document.createElement('span');
  buttonsContainer.className = 'kodland-student-buttons';
  applyLanguageDirection(buttonsContainer, language);
  
  // No need for container click handler since buttons are outside the link
  // Each button has its own handler with preventDefault and stopPropagation
  
  const formattedPhone = formatPhoneForWhatsApp(parentPhone);
  
  // Button 1: Open WA (icon only)
  const openWAButton = document.createElement('button');
  openWAButton.className = 'kodland-wa-btn kodland-open-btn';
  openWAButton.setAttribute('title', tooltips.openWA);
  openWAButton.setAttribute('aria-label', tooltips.openWA);
  openWAButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"></path>
    </svg>
  `;
  openWAButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('[Group Students Info] Open WA button clicked!', { formattedPhone, studentId });
    
    if (!formattedPhone) {
      console.error('[Group Students Info] No formatted phone available');
      alert(uiText('noPhoneAvailable'));
      return;
    }
    
    // Remove + sign for URL
    const phoneForUrl = formattedPhone.replace(/^\+/, '');
    
    // Use api.whatsapp.com for direct WhatsApp link (opens chat without message)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}`;
    console.log(`[Group Students Info] Opening WhatsApp for parent phone: ${formattedPhone}`);
    window.open(whatsappUrl, '_blank');
  });
  
  // Button 2: Welcome Message (icon only)
  const sendCredentialButton = document.createElement('button');
  sendCredentialButton.className = 'kodland-wa-btn kodland-send-btn';
  sendCredentialButton.setAttribute('title', tooltips.welcomeMessage);
  sendCredentialButton.setAttribute('aria-label', tooltips.welcomeMessage);
  sendCredentialButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
    </svg>
  `;
  sendCredentialButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('[Group Students Info] Welcome Message button clicked!', { studentId });
    
    sendCredentialButton.disabled = true;
    sendCredentialButton.style.opacity = '0.5';
    sendCredentialButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    const credentials = await getStudentCredentials(studentId);
    if (credentials) {
      // Get student name from container (without the "[XX]" country badge)
      const studentName = extractStudentName(container);
      
      // Get course name
      const courseName = findCourseName();
      console.log('[Group Students Info] Course name:', courseName);
      
      // Get the personalized direct-access link (wonder login)
      const wonderLoginUrl = await fetchWonderLoginLink(studentId);
      if (!wonderLoginUrl) {
        console.warn(`[Group Students Info] ⚠️ Could not get the personalized access link for ${studentId}`);
      }
      
      // Get the cached WhatsApp group link for this course
      const waGroupLink = getGroupWhatsAppLink();
      if (!waGroupLink) {
        console.warn('[Group Students Info] ⚠️ No WhatsApp group link saved yet');
      }
      
      // Get the FIRST lesson (M1L1) to fill in the course's start day/time
      // (not just whichever lesson happens to be coming up next)
      const groupId = extractGroupId();
      const firstLesson = groupId ? await fetchFirstLessonForGroup(groupId) : null;
      const lessonDateInfo = firstLesson ? formatLessonDateForMessage(firstLesson.timetable_time) : null;
      
      // Build the full welcome message
      const welcomeMessage = createFullWelcomeMessage({
        studentName,
        courseName,
        waGroupLink,
        wonderLoginUrl: wonderLoginUrl || uiText('loginLinkMissing'),
        username: credentials.username || '',
        password: credentials.password || '',
        lessonDateInfo
      });
      console.log('[Group Students Info] Welcome message (plain text):', welcomeMessage);
      
      // Encode message for WhatsApp URL
      const encodedMessage = encodeMessageForWhatsApp(welcomeMessage);
      
      // Remove + sign for URL
      const phoneForUrl = formattedPhone.replace(/^\+/, '');
      
      // Use api.whatsapp.com for WhatsApp link with message
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
      
      console.log(`[Group Students Info] Sending welcome message to parent phone: ${formattedPhone}`);
      window.open(whatsappUrl, '_blank');
      
      sendCredentialButton.disabled = false;
      sendCredentialButton.style.opacity = '1';
      sendCredentialButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      `;
    } else {
      // Fallback: open student page in new tab to copy credentials manually
      window.open(`https://bo.kodland.org/students/${studentId}`, '_blank');
      sendCredentialButton.disabled = false;
      sendCredentialButton.style.opacity = '1';
      sendCredentialButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      `;
    }
  });
  
  buttonsContainer.appendChild(openWAButton);
  buttonsContainer.appendChild(sendCredentialButton);
  
  // Button 3: Modules Progress (icon only)
  const modulesProgressButton = document.createElement('button');
  modulesProgressButton.className = 'kodland-wa-btn kodland-progress-btn';
  modulesProgressButton.setAttribute('title', tooltips.modulesProgress);
  modulesProgressButton.setAttribute('aria-label', tooltips.modulesProgress);
  modulesProgressButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
    </svg>
  `;
  modulesProgressButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    console.log('[Group Students Info] Modules Progress button clicked!', { studentId });
    
    modulesProgressButton.disabled = true;
    modulesProgressButton.style.opacity = '0.5';
    modulesProgressButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    const loadAndShow = async () => {
      // Get group ID from URL
      const groupId = extractGroupId();
      if (!groupId) {
        console.error('[Group Students Info] Could not extract group ID from URL');
        alert(uiText('groupIdNotFound'));
        return;
      }
      
      console.log(`[Group Students Info] Fetching modules progress for student ${studentId} in group ${groupId}`);
      
      const progressData = await fetchHomeworkModulesProgress(studentId, groupId);
      
      if (progressData) {
        console.log(`[Group Students Info] ✅ Modules progress data loaded. Extracting lesson IDs...`);
        
        // Get completed lessons count from the page
        const lessonsInfo = getCompletedLessonsCount();
        const maxLessons = lessonsInfo ? lessonsInfo.completed : null;
        
        if (maxLessons !== null && maxLessons > 0) {
          console.log(`[Group Students Info] ✅ Will limit to ${maxLessons} completed lessons only`);
        } else {
          console.warn(`[Group Students Info] ⚠️ Could not determine completed lessons count (${maxLessons}), will process all found lessons`);
        }
        
        // Extract lesson IDs from the modules data, limiting to completed lessons
        let lessonIds = extractLessonIds(progressData, maxLessons);
        
        // CRITICAL: Force limit to completed lessons BEFORE processing
        if (maxLessons !== null && maxLessons > 0) {
          if (lessonIds.length > maxLessons) {
            lessonIds = lessonIds.slice(0, maxLessons);
          }
          lessonIds = lessonIds.slice(0, maxLessons);
          console.log(`[Group Students Info] 🔒 STRICT LIMIT APPLIED: Final count is ${lessonIds.length} lessons (max: ${maxLessons})`);
        }
        
        if (lessonIds.length > 0) {
          console.log(`[Group Students Info] ✅ Ready to process ${lessonIds.length} lessons. Fetching tasks progress asynchronously...`);
          
          // Store all tasks data organized by lesson
          const allTasksData = [];
          
          // Fetch tasks progress for each lesson
          const limitedLessonIds = maxLessons !== null && maxLessons > 0 
            ? lessonIds.slice(0, maxLessons) 
            : lessonIds;
          
          // Process lessons in batches of 3 (6 fetches total: 3 class + 3 homework)
          const batchSize = 3;
          for (let i = 0; i < limitedLessonIds.length; i += batchSize) {
            const batch = limitedLessonIds.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(limitedLessonIds.length / batchSize);
            
            console.log(`\n[Group Students Info] 📦 Processing batch ${batchNumber}/${totalBatches} (lessons ${i + 1}-${Math.min(i + batchSize, limitedLessonIds.length)})...`);
            console.log(`[Group Students Info] Batch lesson IDs (in order):`, batch);
            
            // Create all fetch promises for this batch (6 fetches: 3 class + 3 homework)
            // Use map with index to ensure order is preserved
            const fetchPromises = batch.map((lessonId, batchIndex) => {
              // Store original index in batch to maintain order
              const originalIndex = i + batchIndex;
              return Promise.all([
                fetchClassTasksProgress(studentId, lessonId),
                fetchHomeworkTasksProgress(studentId, lessonId)
              ]).then(([classTasks, homeworkTasks]) => {
                return {
                  lessonId: lessonId,
                  classTasks: classTasks,
                  homeworkTasks: homeworkTasks,
                  originalIndex: originalIndex // Store original position
                };
              });
            });
            
            // Wait for all fetches in this batch to complete (all 6 fetches run in parallel)
            const batchResults = await Promise.all(fetchPromises);
            
            // Sort results by originalIndex to ensure correct order (in case promises resolved out of order)
            batchResults.sort((a, b) => a.originalIndex - b.originalIndex);
            
            console.log(`[Group Students Info] Batch results (after sorting):`, batchResults.map(r => r.lessonId));
            
            // Add results to allTasksData, maintaining order
            allTasksData.push(...batchResults);
            
            console.log(`[Group Students Info] ✅ Batch ${batchNumber}/${totalBatches} completed (${batchResults.length} lessons processed)`);
            
            // Small delay between batches to avoid overwhelming the server
            if (i + batchSize < limitedLessonIds.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
          // Final sort by originalIndex to ensure all lessons are in correct order
          allTasksData.sort((a, b) => (a.originalIndex || 0) - (b.originalIndex || 0));
          console.log(`[Group Students Info] ✅ Final ordered lesson IDs:`, allTasksData.map(r => r.lessonId));
          
          console.log(`[Group Students Info] ✅ Completed fetching all tasks data for ${allTasksData.length} lessons`);
          
          // Show modal with all data organized by modules and lessons, pass refresh callback
          showTasksModal(studentId, progressData, allTasksData, loadAndShow);
        } else {
          console.warn(`[Group Students Info] ⚠️ No lesson IDs found in modules data`);
        }
      } else {
        console.warn(`[Group Students Info] ⚠️ Could not fetch modules progress data`);
      }
    };
    
    await loadAndShow();
    
    modulesProgressButton.disabled = false;
    modulesProgressButton.style.opacity = '1';
    modulesProgressButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
      </svg>
    `;
  });
  
  buttonsContainer.appendChild(modulesProgressButton);
  
  // Button 4: Class Reminder (icon only)
  const scheduleButton = document.createElement('button');
  scheduleButton.className = 'kodland-wa-btn kodland-schedule-btn';
  scheduleButton.setAttribute('data-kodland-ui-key', 'classReminderTooltip');
  scheduleButton.setAttribute('title', uiText('classReminderTooltip'));
  scheduleButton.setAttribute('aria-label', uiText('classReminderTooltip'));
  scheduleButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5zm2 4h10v-2H7v2zm0 4h7v-2H7v2z" fill="currentColor"/>
    </svg>
  `;
  scheduleButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    try {
      const groupId = extractGroupId();
      if (!groupId) {
        console.error('[Group Students Info] Could not extract group ID from URL');
        alert(uiText('noGroupId'));
        return;
      }
      
      const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/schedule_view/`;
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: headers
      });
      
      if (!response.ok) {
        console.error(`[Group Students Info] HTTP error! status: ${response.status}`);
        alert(uiText('scheduleFetchError', response.status));
        return;
      }
      
      const scheduleData = await response.json();
      
      // Find nearest lesson
      const nearestLesson = findNearestLesson(scheduleData);
      
      if (!nearestLesson) {
        alert(uiText('noUpcomingLesson'));
        return;
      }

      // Get country code from parent phone
      const countryCode = getCountryInitialsFromPhone(parentPhone);
      const language = getMessageLanguage();

      // Generate message
      const message = generateClassReminderMessage(parentName, nearestLesson, countryCode, language);

      if (!message) {
        alert(uiText('messageGenerationError'));
        return;
      }
      
      // Format phone for WhatsApp
      const formattedPhone = formatPhoneForWhatsApp(parentPhone);
      const phoneForUrl = formattedPhone.replace(/^\+/, '');
      
      // Encode message for WhatsApp URL
      const encodedMessage = encodeMessageForWhatsApp(message);
      
      // Open WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (err) {
      console.error('[Group Students Info] Error sending class reminder:', err);
      alert(uiText('classReminderError'));
    }
  });
  
  buttonsContainer.appendChild(scheduleButton);
  
  // Button 5: Absence notice (student hasn't connected to the live class)
  // Only created if the tutor hasn't hidden it in settings.
  if (getExtensionSettings().showAbsenceButton) {
    const absenceButton = document.createElement('button');
    absenceButton.className = 'kodland-wa-btn kodland-absence-btn';
    absenceButton.setAttribute('data-kodland-ui-key', 'absenceTooltip');
    absenceButton.setAttribute('title', uiText('absenceTooltip'));
    absenceButton.setAttribute('aria-label', uiText('absenceTooltip'));
    absenceButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
      </svg>
    `;
    absenceButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('[Group Students Info] Absence button clicked!', { studentId });
      
      if (!formattedPhone) {
        console.error('[Group Students Info] No formatted phone available');
        alert(uiText('noPhoneForStudent'));
        return;
      }

      const language = getMessageLanguage();
      const studentName = extractStudentName(container);
      const courseName = findCourseName();
      const tutorName = getExtensionSettings().tutorName;
      const message = generateAbsenceMessage(language, { studentName, tutorName, courseName });
      const encodedMessage = encodeMessageForWhatsApp(message);
      
      const phoneForUrl = formattedPhone.replace(/^\+/, '');
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
      console.log(`[Group Students Info] Sending absence notice to phone: ${formattedPhone}`);
      window.open(whatsappUrl, '_blank');
    });
    
    buttonsContainer.appendChild(absenceButton);
  }
  
  // hasn't submitted yet). Reuses the cached check if available, otherwise
  // fetches on the spot.
  if (getExtensionSettings().showTaskReportButton) {
    const taskReportButton = document.createElement('button');
    taskReportButton.className = 'kodland-wa-btn kodland-task-report-btn';
    taskReportButton.setAttribute('data-kodland-ui-key', 'taskReportTooltip');
    taskReportButton.setAttribute('title', uiText('taskReportTooltip'));
    taskReportButton.innerHTML = `📤`;

    taskReportButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!formattedPhone) {
        alert(uiText('noPhoneForStudent'));
        return;
      }

      taskReportButton.disabled = true;
      const originalHtml = taskReportButton.innerHTML;
      taskReportButton.innerHTML = `⏳`;

      try {
        let alerts = studentTaskAlertsCache[studentId];
        if (!alerts) {
          alerts = await fetchStudentTaskAlerts(studentId);
        }

        if (!alerts) {
          alert(uiText('taskInfoError'));
          return;
        }

        if (alerts.notSubmittedTasks.length === 0) {
          alert(uiText('noPendingTasks'));
          return;
        }

        const studentName = extractStudentName(container);
        const courseName = findCourseName();
        const tutorName = getExtensionSettings().tutorName;
        const waveEmoji = String.fromCodePoint(0x1F44B);
        const smileEmoji = String.fromCodePoint(0x1F60A);

        // Group missing tasks by lesson (M{module}L{lesson}) instead of
        // repeating the lesson label on every line
        const groupedByLesson = {};
        alerts.notSubmittedTasks.forEach(task => {
          if (!groupedByLesson[task.label]) groupedByLesson[task.label] = [];
          groupedByLesson[task.label].push(task.name);
        });

        const taskListText = Object.entries(groupedByLesson)
          .map(([label, names]) => `${label}:\n` + names.map(name => `• ${name}`).join('\n'))
          .join('\n\n');

        const message = uiText('taskReportMessage', {
          studentName,
          tutorName,
          courseName,
          taskListText,
          waveEmoji,
          smileEmoji
        });

        const encodedMessage = encodeMessageForWhatsApp(message);
        const phoneForUrl = formattedPhone.replace(/^\+/, '');
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      } finally {
        taskReportButton.disabled = false;
        taskReportButton.innerHTML = originalHtml;
      }
    });

    buttonsContainer.appendChild(taskReportButton);
  }
  
  // Add data attribute to identify which student these buttons belong to
  buttonsContainer.setAttribute('data-student-id', studentId);
  
  // Verify buttons are in container
  console.log('[Group Students Info] Buttons container prepared:', {
    buttonCount: buttonsContainer.children.length,
    buttons: Array.from(buttonsContainer.children).map(b => b.className)
  });
  
  // Insert buttons OUTSIDE the <a> tag, after the <a> element
  // This prevents clicking buttons from opening the student profile
  if (studentLink && studentLink.parentElement) {
    // Insert buttons after the <a> element
    if (studentLink.nextSibling) {
      studentLink.parentElement.insertBefore(buttonsContainer, studentLink.nextSibling);
    } else {
      studentLink.parentElement.appendChild(buttonsContainer);
    }
    
    console.log('[Group Students Info] ✅ Buttons inserted OUTSIDE student link:', {
      studentName: studentH3.textContent?.trim(),
      buttonsContainer: buttonsContainer,
      parentElement: studentLink.parentElement,
      isInDOM: document.body.contains(buttonsContainer),
      buttonsInDOM: Array.from(buttonsContainer.children).map(b => ({
        className: b.className,
        inDOM: document.body.contains(b)
      }))
    });
  } else {
    // Fallback: try to insert after h3's parent (the <a>)
    const linkParent = studentH3.parentElement?.parentElement;
    if (linkParent) {
      linkParent.insertBefore(buttonsContainer, studentH3.parentElement?.nextSibling || null);
      if (!linkParent.contains(buttonsContainer)) {
        linkParent.appendChild(buttonsContainer);
      }
    } else {
      console.warn('[Group Students Info] Could not find parent to insert buttons outside link');
    }
  }
  
  console.log(`[Group Students Info] Created buttons for student ${studentId} (Parent: ${parentName}, Phone: ${parentPhone})`);
}

// Function to wait for auth token to be captured
async function waitForAuthToken(maxWaitTime = 10000) {
  const startTime = Date.now();
  
  while (!authToken && (Date.now() - startTime) < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (authToken) {
    console.log('[Group Students Info] ✅ Auth token available');
    return true;
  } else {
    console.warn('[Group Students Info] ⚠️ Auth token not captured after waiting');
    return false;
  }
}

// Function to process all students
async function processAllStudents() {
  if (!isGroupPage()) {
    return;
  }
  
  // Prevent multiple simultaneous executions
  if (isProcessingStudents) {
    console.log('[Group Students Info] Already processing students, skipping duplicate call');
    return;
  }
  
  const students = findStudentElements();
  
  if (students.length === 0) {
    console.log('[Group Students Info] No students found');
    return;
  }
  
  // Helper: decide if a student still needs processing
  const needsProcessing = (student) => {
    // If never processed, we need to process
    if (!processedStudents.has(student.id)) return true;
    
    // If processed before, verify the buttons still exist (Vue re-renders can remove them)
    const selector = `.kodland-student-buttons[data-student-id="${student.id}"]`;
    const hasButtons =
      student.container.querySelector(selector) ||
      student.container.querySelector('.kodland-student-buttons');
    
    return !hasButtons;
  };
  
  // Check if all students are already processed or missing buttons
  const unprocessedStudents = students.filter(needsProcessing);
  if (unprocessedStudents.length === 0) {
    console.log('[Group Students Info] All students already processed');
    return;
  }
  
  isProcessingStudents = true;
  console.log(`[Group Students Info] Starting to process ${unprocessedStudents.length} new students...`);
  
  // Wait for auth token before processing
  const hasToken = await waitForAuthToken(10000);
  
  if (!hasToken) {
    console.error('[Group Students Info] ❌ Cannot proceed without auth token. Please refresh the page or wait for network activity.');
    isProcessingStudents = false;
    // Show error message in UI only for unprocessed students
    unprocessedStudents.forEach(student => {
      displayStudentInfo(student.container, null, student.id);
      const infoElement = student.container.querySelector('.kodland-student-buttons');
      if (infoElement) {
        infoElement.innerHTML = '<span style="color: #d32f2f;">❌ Authentication error. Please refresh the page.</span>';
      }
    });
    return;
  }
  
  // Mark all unprocessed students as processing
  unprocessedStudents.forEach(student => {
    if (!processedStudents.has(student.id)) {
      processedStudents.add(student.id);
    }
  });
  
  console.log(`[Group Students Info] 🚀 Starting parallel fetch for ${unprocessedStudents.length} students...`);
  
  // Log student info before processing
  unprocessedStudents.forEach((student, i) => {
    console.log(`[Group Students Info] 📝 Student ${i + 1}/${unprocessedStudents.length}: ${student.name} (ID: ${student.id})`);
  });
  
  // Create all fetch promises to execute in parallel
  const fetchPromises = unprocessedStudents.map(async (student) => {
    try {
      // Fetch student info asynchronously
      const studentData = await fetchStudentInfo(student.id);
      
      return {
        student: student,
        studentData: studentData,
        success: !!studentData
      };
    } catch (error) {
      console.error(`[Group Students Info] ❌ Error fetching data for student ${student.id}:`, error);
      return {
        student: student,
        studentData: null,
        success: false
      };
    }
  });
  
  // Wait for all fetches to complete in parallel
  const results = await Promise.all(fetchPromises);
  
  console.log(`[Group Students Info] ✅ All ${results.length} fetches completed. Processing results...`);
  
  // Process results and display in UI
  results.forEach((result, i) => {
    const { student, studentData, success } = result;
    
    // Cache full student data for later use (e.g. contacts CSV export)
    if (studentData) {
      studentGeneralInfoCache[student.id] = studentData;
    }
    
    // Display info in UI with guard to avoid breaking when Vue proxies misbehave
    try {
      displayStudentInfo(student.container, studentData, student.id);
    } catch (error) {
      console.error('[Group Students Info] ❌ Error rendering buttons for student', student.id, error);
    }
    
    // Log summary after processing
    if (success && studentData) {
      console.log(`[Group Students Info] ✅ Completed processing for ${student.name} (${i + 1}/${results.length})`);
    } else {
      console.log(`[Group Students Info] ⚠️ No data received for ${student.name} (${i + 1}/${results.length})`);
      // Remove from processed set if failed, so it can be retried
      processedStudents.delete(student.id);
    }
  });
  
  isProcessingStudents = false;
  console.log(`[Group Students Info] Finished processing ${unprocessedStudents.length} students`);
}

// ---------------------------------------------------------------------
// Extension settings (persisted in localStorage, per browser profile)
// ---------------------------------------------------------------------
// Default message templates, in Arabic. The tutor can rewrite them (in any
// language) from the ⚙️ settings modal; "Reset" restores these.
const DEFAULT_WELCOME_TEMPLATE = `مرحباً {{studentName}} 👋
تحية طيبة. اسمي {{tutorName}} وسأكون معلّمك في دورة {{courseName}}، {{scheduleLine}}. يسعدنا انضمامك إلى هذه التجربة في Kodland. ولنكون جاهزين لحصتنا الأولى، يُرجى اتّباع الخطوات التالية:
🔹 انضم إلى مجموعة واتساب الرسمية، حيث سنشارك رابط الحصة على Zoom وكل المعلومات المهمة: 👈{{waGroupLink}}
🔹 وهذا رابط دخولك الخاص إلى منصة Kodland:
• رابط الدخول المباشر: {{wonderLoginUrl}}
اسم المستخدم: {{username}}
كلمة المرور: {{password}}
أنا هنا لمساعدتك في كل ما تحتاجه. نراك قريباً!
مع خالص التحية،
{{tutorName}}
معلّم دورة {{courseName}}`;

const DEFAULT_ABSENCE_TEMPLATE = `مرحباً {{studentName}} 👋، أنا {{tutorName}}، معلّمك في دورة {{courseName}} على منصة Kodland.
لقد بدأنا حصة اليوم ولاحظت أنك لم تنضم إلينا بعد. هل ستحضر الحصة؟ 🕒
إذا واجهت أي مشكلة تقنية في الدخول إلى المنصة، فأخبرني فوراً لأساعدك. وتذكّر أنك إن لم تتمكّن من الحضور المباشر، فمن المهم جداً أن تشاهد تسجيل الحصة من لوحة الطالب حتى لا تتأخر عن المشروع الذي نعمل عليه.
بانتظارك في القاعة! 😊`;

// Fill in a template string, replacing {{placeholder}} tokens with values
// from `vars`. Unknown placeholders are left as-is (so a typo doesn't
// silently delete text).
function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = vars[key];
    return (value !== undefined && value !== null) ? value : match;
  });
}

const DEFAULT_KODLAND_SETTINGS = {
  showExportContacts: true,
  showWaGroupLink: true,
  showAttendance: true,
  showAbsenceButton: true,
  showTaskReportButton: true,
  showGroupGradingReport: true,
  tutorName: '',
  // Interface and message language. 'auto' follows Kodland's own language
  // selector; any code in SUPPORTED_MESSAGE_LANGUAGES pins that language.
  messageLanguage: 'auto',
  // Timezone the class times in the welcome message are expressed in, and
  // the name used for it in the message text.
  timezone: 'Africa/Cairo',
  timezoneLabel: 'القاهرة',
  welcomeTemplate: DEFAULT_WELCOME_TEMPLATE,
  absenceTemplate: DEFAULT_ABSENCE_TEMPLATE
};

function getExtensionSettings() {
  try {
    const raw = localStorage.getItem('kodland_ext_settings');
    if (!raw) return { ...DEFAULT_KODLAND_SETTINGS };
    return { ...DEFAULT_KODLAND_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    console.warn('[Settings] Error reading settings, using defaults:', error);
    return { ...DEFAULT_KODLAND_SETTINGS };
  }
}

function saveExtensionSettings(settings) {
  localStorage.setItem('kodland_ext_settings', JSON.stringify(settings));
}

// Inject the floating "⚙️ Settings" button (always visible, so the tutor
// can always get back in and re-enable anything they hid)
function injectSettingsButton() {
  if (!isGroupPage()) return;
  if (document.getElementById('kodland-settings-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-settings-button';
  button.className = 'kodland-export-contacts-btn kodland-settings-btn';
  button.innerHTML = '⚙️';
  button.setAttribute('data-kodland-ui-key', 'settingsTooltip');
  button.setAttribute('title', uiText('settingsTooltip'));

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSettingsModal();
  });

  document.body.appendChild(button);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function openSettingsModal() {
  if (document.getElementById('kodland-settings-modal')) return;
  const settings = getExtensionSettings();

  // Language options for the picker, labelled in their own language.
  const languageOptions = Object.entries(LANGUAGE_LABELS).map(([code, label]) => [code, label]);
  const languageOptionsHtml = languageOptions
    .map(([code, label]) =>
      `<option value="${code}" ${settings.messageLanguage === code ? 'selected' : ''}>${escapeHtml(label)}</option>`)
    .join('');

  const fieldStyle = 'width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #444; background:#1e1e1e; color:#fff; margin-bottom:20px;';
  const labelStyle = 'display:block; margin-bottom:8px; font-size:13px; color:#bbb;';
  const checkboxRow = 'display:flex; align-items:center; gap:8px; margin-bottom:14px; cursor:pointer;';

  const modal = document.createElement('div');
  modal.id = 'kodland-settings-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal);
  modal.innerHTML = `
    <div class="kodland-modal-content" style="max-width: 560px;">
      <div class="kodland-modal-header">
        <h2>${escapeHtml(uiText('settingsTitle'))}</h2>
        <button class="kodland-modal-close">&times;</button>
      </div>
      <div class="kodland-modal-body">
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-export" ${settings.showExportContacts ? 'checked' : ''}/>
          <span id="kodland-setting-export-label">${escapeHtml(uiText('settingShowExport'))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-walink" ${settings.showWaGroupLink ? 'checked' : ''}/>
          <span id="kodland-setting-walink-label">${escapeHtml(uiText('settingShowWaLink'))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-attendance" ${settings.showAttendance ? 'checked' : ''}/>
          <span id="kodland-setting-attendance-label">${escapeHtml(uiText('settingShowAttendance'))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-absence" ${settings.showAbsenceButton ? 'checked' : ''}/>
          <span id="kodland-setting-absence-label">${escapeHtml(uiText('settingShowAbsence'))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-taskreport" ${settings.showTaskReportButton ? 'checked' : ''}/>
          <span id="kodland-setting-taskreport-label">${escapeHtml(uiText('settingShowTaskReport'))}</span>
        </label>
        <label style="${checkboxRow} margin-bottom:20px;">
          <input type="checkbox" id="kodland-setting-gradingreport" ${settings.showGroupGradingReport ? 'checked' : ''}/>
          <span id="kodland-setting-gradingreport-label">${escapeHtml(uiText('settingShowGradingReport'))}</span>
        </label>

        <label id="kodland-setting-language-label" style="${labelStyle}">${escapeHtml(uiText('settingLanguage'))}</label>
        <select id="kodland-setting-language" style="${fieldStyle}">${languageOptionsHtml}</select>

        <label id="kodland-setting-tutorname-label" style="${labelStyle}">${escapeHtml(uiText('settingTutorName'))}</label>
        <input type="text" id="kodland-setting-tutorname" value="${escapeHtml(settings.tutorName)}" style="${fieldStyle}"/>

        <label id="kodland-setting-timezone-label" style="${labelStyle}">${escapeHtml(uiText('settingTimezone'))}</label>
        <input type="text" id="kodland-setting-timezone" value="${escapeHtml(settings.timezone)}" style="${fieldStyle}"/>

        <label id="kodland-setting-timezone-name-label" style="${labelStyle}">${escapeHtml(uiText('settingTimezoneLabel'))}</label>
        <input type="text" id="kodland-setting-timezone-name" value="${escapeHtml(settings.timezoneLabel)}" style="${fieldStyle}"/>

        <hr style="border-color:#333; margin: 16px 0;"/>
        <p id="kodland-instructions-text" style="font-size:12px; color:#999; margin-bottom:16px;">
          ${escapeHtml(uiText('settingsTemplatesHelp'))}
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label id="kodland-setting-welcome-template-label" style="font-size:13px; color:#bbb;">${escapeHtml(uiText('settingWelcomeTemplate'))}</label>
          <button id="kodland-reset-welcome" type="button" style="background:none; border:none; color:#25D366; font-size:12px; cursor:pointer; text-decoration:underline;">${escapeHtml(uiText('settingsReset'))}</button>
        </div>
        <textarea id="kodland-setting-welcome-template" rows="8"
          style="${fieldStyle} font-family:monospace; font-size:12px;">${escapeHtml(settings.welcomeTemplate)}</textarea>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <label id="kodland-setting-absence-template-label" style="font-size:13px; color:#bbb;">${escapeHtml(uiText('settingAbsenceTemplate'))}</label>
          <button id="kodland-reset-absence" type="button" style="background:none; border:none; color:#25D366; font-size:12px; cursor:pointer; text-decoration:underline;">${escapeHtml(uiText('settingsReset'))}</button>
        </div>
        <textarea id="kodland-setting-absence-template" rows="6"
          style="${fieldStyle} font-family:monospace; font-size:12px;">${escapeHtml(settings.absenceTemplate)}</textarea>

        <button id="kodland-settings-save" class="kodland-wa-btn" style="width:100%; justify-content:center;">${escapeHtml(uiText('settingsSave'))}</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.kodland-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const languageSelect = modal.querySelector('#kodland-setting-language');

  const syncSettingsModalText = () => {
    const selectedLanguage = normalizeMessageLanguage(languageSelect.value || getMessageLanguage());
    const previewLanguage = selectedLanguage === 'auto' ? detectPageLanguage() : selectedLanguage;

    modal.querySelector('.kodland-modal-header h2').textContent = uiTextForLanguage('settingsTitle', previewLanguage);
    modal.querySelectorAll('[data-ui-key]').forEach((node) => {
      const key = node.getAttribute('data-ui-key');
      if (!key) return;
      node.textContent = uiTextForLanguage(key, previewLanguage);
    });

    modal.querySelector('#kodland-setting-language-label').textContent = uiTextForLanguage('settingLanguage', previewLanguage);
    modal.querySelector('#kodland-setting-tutorname-label').textContent = uiTextForLanguage('settingTutorName', previewLanguage);
    modal.querySelector('#kodland-setting-timezone-label').textContent = uiTextForLanguage('settingTimezone', previewLanguage);
    modal.querySelector('#kodland-setting-timezone-name-label').textContent = uiTextForLanguage('settingTimezoneLabel', previewLanguage);
    modal.querySelector('#kodland-setting-welcome-template-label').textContent = uiTextForLanguage('settingWelcomeTemplate', previewLanguage);
    modal.querySelector('#kodland-setting-absence-template-label').textContent = uiTextForLanguage('settingAbsenceTemplate', previewLanguage);
    modal.querySelector('#kodland-reset-welcome').textContent = uiTextForLanguage('settingsReset', previewLanguage);
    modal.querySelector('#kodland-reset-absence').textContent = uiTextForLanguage('settingsReset', previewLanguage);
    modal.querySelector('#kodland-settings-save').textContent = uiTextForLanguage('settingsSave', previewLanguage);
    modal.querySelector('#kodland-instructions-text').textContent = uiTextForLanguage('settingsTemplatesHelp', previewLanguage);
  };

  modal.querySelector('#kodland-reset-welcome').addEventListener('click', () => {
    const resetLanguage = normalizeMessageLanguage(modal.querySelector('#kodland-setting-language').value || getMessageLanguage());
    const templateLanguage = resetLanguage === 'auto' ? detectPageLanguage() : resetLanguage;
    modal.querySelector('#kodland-setting-welcome-template').value = getDefaultWelcomeTemplate(templateLanguage);
  });
  modal.querySelector('#kodland-reset-absence').addEventListener('click', () => {
    const resetLanguage = normalizeMessageLanguage(modal.querySelector('#kodland-setting-language').value || getMessageLanguage());
    const templateLanguage = resetLanguage === 'auto' ? detectPageLanguage() : resetLanguage;
    modal.querySelector('#kodland-setting-absence-template').value = getDefaultAbsenceTemplate(templateLanguage);
  });

  languageSelect.addEventListener('change', () => {
    const selectedLanguage = normalizeMessageLanguage(languageSelect.value || getMessageLanguage());
    const templateLanguage = selectedLanguage === 'auto' ? detectPageLanguage() : selectedLanguage;
    modal.querySelector('#kodland-setting-welcome-template').value = getDefaultWelcomeTemplate(templateLanguage);
    modal.querySelector('#kodland-setting-absence-template').value = getDefaultAbsenceTemplate(templateLanguage);
    syncSettingsModalText();
  });

  const addDataUiKey = (element, key) => {
    element.setAttribute('data-ui-key', key);
    return element;
  };

  addDataUiKey(modal.querySelector('#kodland-setting-export-label'), 'settingShowExport');
  addDataUiKey(modal.querySelector('#kodland-setting-walink-label'), 'settingShowWaLink');
  addDataUiKey(modal.querySelector('#kodland-setting-attendance-label'), 'settingShowAttendance');
  addDataUiKey(modal.querySelector('#kodland-setting-absence-label'), 'settingShowAbsence');
  addDataUiKey(modal.querySelector('#kodland-setting-taskreport-label'), 'settingShowTaskReport');
  addDataUiKey(modal.querySelector('#kodland-setting-gradingreport-label'), 'settingShowGradingReport');

  syncSettingsModalText();

  modal.querySelector('#kodland-settings-save').addEventListener('click', () => {
    const rawLanguage = languageSelect.value || DEFAULT_MESSAGE_LANGUAGE;

    const newSettings = {
      showExportContacts: modal.querySelector('#kodland-setting-export').checked,
      showWaGroupLink: modal.querySelector('#kodland-setting-walink').checked,
      showAttendance: modal.querySelector('#kodland-setting-attendance').checked,
      showAbsenceButton: modal.querySelector('#kodland-setting-absence').checked,
      showTaskReportButton: modal.querySelector('#kodland-setting-taskreport').checked,
      showGroupGradingReport: modal.querySelector('#kodland-setting-gradingreport').checked,
      messageLanguage: rawLanguage,
      tutorName: modal.querySelector('#kodland-setting-tutorname').value.trim(),
      timezone: modal.querySelector('#kodland-setting-timezone').value.trim() || DEFAULT_KODLAND_SETTINGS.timezone,
      timezoneLabel: modal.querySelector('#kodland-setting-timezone-name').value.trim() || DEFAULT_KODLAND_SETTINGS.timezoneLabel,
      welcomeTemplate: modal.querySelector('#kodland-setting-welcome-template').value,
      absenceTemplate: modal.querySelector('#kodland-setting-absence-template').value
    };
    saveExtensionSettings(newSettings);
    modal.remove();
    setTimeout(() => {
      try {
        window.location.reload();
      } catch (error) {
        window.location.href = window.location.href;
      }
    }, 150);
  });
}

// Function to build and download a CSV with contacts, ready to import into
// phone/Google contacts: First Name / Last Name (= course + " Kodland") / Phone.
async function exportContactsCSV() {
  const courseName = findCourseName() || 'Kodland';

  // Build "Last Name" as {Día}{Hora}horas-Kodland (e.g. "Martes10horas-Kodland"),
  // based on the course's first lesson (M1L1) day/time.
  const groupId = extractGroupId();
  const firstLesson = groupId ? await fetchFirstLessonForGroup(groupId) : null;
  const lessonDateInfo = firstLesson ? formatLessonDateForMessage(firstLesson.timetable_time) : null;

  let lastName = 'Kodland';
  if (lessonDateInfo) {
    const capitalizedDay = lessonDateInfo.dayName.charAt(0).toUpperCase() + lessonDateInfo.dayName.slice(1);
    const hourOnly = lessonDateInfo.time.split(':')[0];
    lastName = `${capitalizedDay}${hourOnly}-Kodland`;
  } else {
    console.warn('[Export Contacts] ⚠️ Could not read the first lesson schedule, falling back to "Kodland"');
  }

  // Google Contacts import format that's confirmed to work: semicolon-separated,
  // with an empty "Name Prefix" column and phone as " +NUMBER" (one leading space).
  const rows = [['Name Prefix', 'First Name', 'Last Name', 'Phone 1 - Value']];

  Object.keys(studentGeneralInfoCache).forEach(studentId => {
    const data = studentGeneralInfoCache[studentId];
    if (!data) return;

    const firstName = (data.student_full_name || data.student_first_name || uiText('studentWithId', studentId)).trim();
    const phoneRaw = data.parent_phone || data.student_phone || '';
    const formattedPhone = formatPhoneForWhatsApp(phoneRaw);

    if (!formattedPhone) {
      console.warn(`[Export Contacts] No valid phone for student ${studentId}, skipping`);
      return;
    }

    // formatPhoneForWhatsApp may or may not include a leading "+" depending
    // on which same-named function wins (several files define one) - strip
    // it first so we always add exactly one, never two.
    const phoneDigitsOnly = String(formattedPhone).replace(/^\+/, '');

    rows.push(['', firstName, lastName, ` +${phoneDigitsOnly}`]);
  });

  if (rows.length <= 1) {
    alert(uiText('noStudentsProcessed'));
    return;
  }

  const csvContent = rows
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');

  // Add BOM so Excel/Sheets open accents correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeCourseName = courseName.replace(/[^a-z0-9]+/gi, '_');

  const link = document.createElement('a');
  link.href = url;
  link.download = `contacts_${safeCourseName}_${groupId || 'group'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`[Export Contacts] ✅ CSV downloaded with ${rows.length - 1} contacts`);
}

// Function to inject the floating "Export contacts" button (once per group page)
function injectExportContactsButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showExportContacts) return;
  if (document.getElementById('kodland-export-contacts-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-export-contacts-button';
  button.className = 'kodland-export-contacts-btn';
  button.setAttribute('data-kodland-ui-key', 'exportContactsButton');
  button.setAttribute('title', uiText('exportContactsTooltip'));
  button.innerHTML = escapeHtml(uiText('exportContactsButton'));
  applyLanguageDirection(button);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.disabled = true;
    const originalLabel = button.innerHTML;
    button.innerHTML = escapeHtml(uiText('exportingContacts'));
    try {
      await exportContactsCSV();
    } finally {
      button.disabled = false;
      button.innerHTML = originalLabel;
    }
  });

  document.body.appendChild(button);
  console.log('[Group Students Info] ✅ "Export contacts" button injected');
}

// Function to inject the floating "WhatsApp group link" status button.
// Shows whether the link has been captured for this group; clicking it
// lets the tutor view or manually paste/correct the link.
function injectWhatsAppGroupLinkButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showWaGroupLink) return;
  if (document.getElementById('kodland-wa-group-link-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-wa-group-link-button';
  button.className = 'kodland-export-contacts-btn kodland-wa-group-link-btn';

  applyLanguageDirection(button);

  const refreshLabel = () => {
    const link = getGroupWhatsAppLink();
    button.innerHTML = escapeHtml(link ? uiText('waGroupLinkSaved') : uiText('waGroupLinkPaste'));
    button.setAttribute('title', link
      ? uiText('waGroupLinkSavedTooltip', link)
      : uiText('waGroupLinkPasteTooltip'));
  };

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const groupId = extractGroupId();
    if (!groupId) return;

    const current = getGroupWhatsAppLink() || '';
    const input = prompt(uiText('waGroupLinkPrompt'), current);
    if (input === null) return; // cancelled
    if (input.trim() === '') {
      localStorage.removeItem(`kodland_wa_group_link_${groupId}`);
    } else {
      localStorage.setItem(`kodland_wa_group_link_${groupId}`, input.trim());
    }
    refreshLabel();
  });

  refreshLabel();
  document.body.appendChild(button);
  console.log('[Group Students Info] ✅ WhatsApp group link button injected');
}

// ---------------------------------------------------------------------
// Attendance automation
// ---------------------------------------------------------------------
// Right-clicking the lesson chip (e.g. "L33") opens a floating menu with
// 3 buttons: .btn-green ("Asistió"), .btn-red ("Ausente sin justificar"),
// .btn-yellow ("Ausente justificada"). We simulate that interaction for
// every student to bulk-mark attendance.

// Find a student's lesson chip by exact lesson ID (e.g. class "lesson-25373"),
// rather than relying on the "highlight" class (which may just reflect a
// hover/interaction state rather than "today's lesson"). We still use the
// row-scoped climbing technique: climb ancestors until we find the level
// with exactly one matching chip (that's the student's own row).
function findCurrentLessonChipForStudent(studentContainer, lessonId) {
  if (!lessonId) return null;
  const selector = `.v-chip.lesson-${lessonId}`;
  let el = studentContainer;
  let lastGood = null;
  for (let i = 0; i < 8 && el; i++) {
    const chips = el.querySelectorAll(selector);
    if (chips.length === 1) {
      lastGood = chips[0];
    } else if (chips.length > 1) {
      break;
    }
    el = el.parentElement;
  }
  return lastGood;
}

// Simulate a right-click (contextmenu event) on an element, which is what
// the site listens for to open its floating attendance menu.
// Simulate a normal left-click on an element (mousedown + mouseup + click),
// which is what actually opens the attendance menu on the lesson chip.
function simulateLeftClick(el) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  ['mousedown', 'mouseup', 'click'].forEach(type => {
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
      clientX: x,
      clientY: y
    });
    el.dispatchEvent(evt);
  });
}

function simulateRightClick(el) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const evt = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    button: 2,
    clientX: x,
    clientY: y
  });
  el.dispatchEvent(evt);
}

// Wait briefly for the ".custom-tooltip" menu to appear, then click the
// button matching the requested status class ('btn-green' | 'btn-red' | 'btn-yellow').
function clickAttendanceOption(statusClass, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const start = Date.now();
    function check() {
      const tooltip = document.querySelector('.custom-tooltip');
      if (tooltip) {
        const btn = tooltip.querySelector(`.${statusClass}`);
        if (btn) {
          btn.click();
          resolve(true);
          return;
        }
      }
      if (Date.now() - start > timeoutMs) {
        resolve(false);
        return;
      }
      requestAnimationFrame(check);
    }
    check();
  });
}

// Detect whether a student is "Inscrito" (enrolled) using the same
// row-scoped-search technique as the lesson chip finder: climb ancestors
// until we find the level with exactly one ".v-chip.status" element.
function isStudentEnrolled(studentContainer) {
  let el = studentContainer;
  let lastGood = null;
  for (let i = 0; i < 8 && el; i++) {
    const chips = el.querySelectorAll('.v-chip.status');
    if (chips.length === 1) {
      lastGood = chips[0];
    } else if (chips.length > 1) {
      break;
    }
    el = el.parentElement;
  }
  // If we couldn't find the status chip at all, default to true so we
  // never silently skip everyone due to a selector mismatch.
  if (!lastGood) return true;
  return lastGood.classList.contains('text-success') || !!lastGood.querySelector('.ri-check-line');
}

// Mark attendance for every currently-loaded, ENROLLED student on the page.
// statusClass: 'btn-green' (Asistió) | 'btn-red' (Ausente sin justificar) | 'btn-yellow' (Ausente justificada)
async function markAttendanceForAllStudents(statusClass) {
  const students = findStudentElements();

  // Get every currently-highlighted lesson chip on the page (one per
  // student row, all in the same "current lesson" column).
  const highlightedChips = Array.from(document.querySelectorAll('.v-chip.highlight'));

  console.log(`[Attendance] ${students.length} students found, ${highlightedChips.length} highlighted chips found`);

  if (highlightedChips.length === 0) {
    alert(uiText('attendanceNoChips'));
    return { ok: [], failed: [], skipped: [] };
  }

  // The student name column and the lesson chips can live in separate DOM
  // branches that only line up visually (not through shared ancestry), so
  // instead of climbing the DOM tree we pair them by vertical position:
  // top-to-bottom order should match row-to-row.
  const getY = (el) => el.getBoundingClientRect().top + window.scrollY;

  const sortedStudents = [...students].sort((a, b) => getY(a.container) - getY(b.container));
  const sortedChips = [...highlightedChips].sort((a, b) => getY(a) - getY(b));

  if (sortedStudents.length !== sortedChips.length) {
    console.warn(`[Attendance] ⚠️ Student count (${sortedStudents.length}) doesn't match chip count (${sortedChips.length}). Rows may be misaligned - check the results carefully.`);
  }

  const results = { ok: [], failed: [], skipped: [] };

  for (let i = 0; i < sortedStudents.length; i++) {
    const student = sortedStudents[i];

    if (!isStudentEnrolled(student.container)) {
      console.log(`[Attendance] ⏭️ ${student.name} is not enrolled, skipping`);
      results.skipped.push(student.name);
      continue;
    }

    const chip = sortedChips[i];
    if (!chip) {
      console.warn(`[Attendance] ⚠️ No chip paired with ${student.name} (row ${i})`);
      results.failed.push(student.name);
      continue;
    }

    // Right-click directly on the chip element itself. Events only bubble
    // UP the DOM (child -> ancestors), so if the site's real click handler
    // lives on the chip (likely, since it's the actual interactive
    // "v-chip--link" element), dispatching on a parent wrapper would never
    // reach it - we have to target the chip itself.
    // Right-click directly on the chip element itself. Events only bubble
    // UP the DOM (child -> ancestors), so if the site's real handler lives
    // on the chip (likely, since it's the actual interactive
    // "v-chip--link" element), dispatching on a parent wrapper would never
    // reach it - we have to target the chip itself.
    const rightClickTarget = chip;

    simulateRightClick(rightClickTarget);
    const clicked = await clickAttendanceOption(statusClass);

    if (clicked) {
      console.log(`[Attendance] ✅ ${student.name} marked`);
      results.ok.push(student.name);
    } else {
      console.warn(`[Attendance] ⚠️ Could not mark ${student.name} (menu did not appear)`);
      results.failed.push(student.name);
    }

    // Small delay between students so we don't overwhelm the page
    await new Promise(r => setTimeout(r, 400));
  }

  return results;
}

// Function to inject the floating "Take attendance" button
function injectTakeAttendanceButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showAttendance) return;
  if (document.getElementById('kodland-attendance-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-attendance-button';
  button.className = 'kodland-export-contacts-btn kodland-attendance-btn';
  button.innerHTML = escapeHtml(uiText('attendanceButton'));
  button.setAttribute('title', uiText('attendanceTooltip'));
  applyLanguageDirection(button);

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm(uiText('attendanceConfirm'));
    if (!confirmed) return;

    button.disabled = true;
    button.innerHTML = escapeHtml(uiText('attendanceMarking'));

    const results = await markAttendanceForAllStudents('btn-green');

    button.disabled = false;
    button.innerHTML = escapeHtml(uiText('attendanceButton'));

    const summary = uiText('attendanceSummary', {
      ok: results.ok.length,
      skipped: results.skipped,
      failed: results.failed
    });
    console.log(`[Attendance] ${summary}`);
    alert(summary);
  });

  document.body.appendChild(button);
  console.log('[Group Students Info] ✅ "Take attendance" button injected');
}

// Function to initialize the module
function initGroupStudentsInfo() {
  // Only run on group pages
  if (!isGroupPage()) {
    console.log('[Group Students Info] Not a group page, skipping');
    return;
  }
  
  console.log('[Group Students Info] Initializing on group page');
  
  // Capture authentication token
  captureAuthToken();
  
  // Inject the floating "Export contacts" button
  injectExportContactsButton();
  
  // Inject the floating "WhatsApp group link" status button
  injectWhatsAppGroupLinkButton();
  
  // Inject the floating "Take attendance" button
  injectTakeAttendanceButton();
  
  // Inject the floating "Group grading report" button
  injectGroupGradingReportButton();
  
  // Inject the floating "Settings" button (always visible)
  injectSettingsButton();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(processAllStudents, 1000);
    });
  } else {
    setTimeout(processAllStudents, 1000);
  }
  
  // Use MutationObserver to detect when new students are added dynamically
  let observer = null;
  let intervalId = null;
  
  observer = new MutationObserver(function(mutations) {
    // Only process if not already processing
    if (isProcessingStudents) {
      return;
    }
    
    // Check if new student elements were added or if buttons disappeared
    const currentStudents = findStudentElements();
    const unprocessedCount = currentStudents.filter(student => {
      const selector = `.kodland-student-buttons[data-student-id="${student.id}"]`;
      const hasButtons =
        student.container.querySelector(selector) ||
        student.container.querySelector('.kodland-student-buttons');
      return !processedStudents.has(student.id) || !hasButtons;
    }).length;
    
    if (unprocessedCount > 0) {
      console.log(`[Group Students Info] New students detected (${unprocessedCount}), processing...`);
      setTimeout(() => {
        if (!isProcessingStudents) {
          processAllStudents();
        }
      }, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also try processing periodically for the first 30 seconds, but only if there are unprocessed students
  let attempts = 0;
  const maxAttempts = 20;
  intervalId = setInterval(() => {
    if (!isGroupPage()) {
      clearInterval(intervalId);
      if (observer) observer.disconnect();
      return;
    }
    
    // Don't process if already processing
    if (isProcessingStudents) {
      return;
    }
    
    attempts++;
    
    const students = findStudentElements();
    const unprocessedCount = students.filter(student => {
      const selector = `.kodland-student-buttons[data-student-id="${student.id}"]`;
      const hasButtons =
        student.container.querySelector(selector) ||
        student.container.querySelector('.kodland-student-buttons');
      return !processedStudents.has(student.id) || !hasButtons;
    }).length;
    
    if (unprocessedCount > 0) {
      console.log(`[Group Students Info] Checking for unprocessed students (${unprocessedCount} found)...`);
      processAllStudents();
    }
    
    // Stop interval only once we've actually found students and processed
    // them all - NOT simply because the current check returned 0 (which
    // can happen while the page is still rendering). Keep retrying until
    // maxAttempts if nothing has been found yet.
    if ((students.length > 0 && unprocessedCount === 0) || attempts >= maxAttempts) {
      console.log('[Group Students Info] Stopping periodic check (all processed or max attempts reached)');
      clearInterval(intervalId);
      if (observer) observer.disconnect();
    }
  }, 2000);
}

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGroupStudentsInfo);
} else {
  initGroupStudentsInfo();
}

// Export functions for external use
if (typeof window !== 'undefined') {
  window.KodlandGroupStudentsInfo = {
    processAllStudents,
    fetchStudentInfo,
    findStudentElements
  };
}

