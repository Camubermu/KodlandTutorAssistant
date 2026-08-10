// Module to fetch and display student information on group pages
// Activates on: https://bo.kodland.org/groups/{id}

// Store authentication token. `var` on purpose - shared with
// early-auth-capture.js (document_start), which usually captures this
// before this file even runs. Guard against overwriting a value that
// script already found.
var authToken = (typeof authToken !== 'undefined' && authToken) ? authToken : null;

// ---------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------
// Everything the tutor sees (buttons, modals, alerts) and everything sent
// to students, parents or the WhatsApp group is written in this language.
// Spanish is the default; the tutor can pick another one - or "auto",
// which follows Kodland's own language selector - from the ⚙️ settings.
const DEFAULT_MESSAGE_LANGUAGE = 'auto';

// Languages that have a full set of message/interface translations.
const SUPPORTED_MESSAGE_LANGUAGES = ['es', 'en', 'ar', 'ru', 'fr', 'tr', 'id', 'it', 'pl', 'pt'];

const LANGUAGE_LABELS = {
  auto: 'Auto',
  es: 'Español',
  en: 'English',
  ar: 'العربية',
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

// Arabic doesn't have a simple singular/plural split: 1 and 2 have their
// own forms and take no numeral, 3-10 take the plural, and 11 and above
// go back to the singular. Counted nouns in Arabic messages go through here.
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
  return 'es';
}

function isRtlLanguage(language = getMessageLanguage()) {
  return RTL_LANGUAGES.includes(language);
}

// Tag an injected element with the message language and its text
// direction, so the RTL rules in styles.css apply for Arabic.
function applyLanguageDirection(element, language = getMessageLanguage()) {
  if (!element) return element;
  element.setAttribute('lang', language);
  element.setAttribute('dir', isRtlLanguage(language) ? 'rtl' : 'ltr');
  return element;
}

// ---------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------
// Labels, tooltips and alerts for the extension's own interface (not the
// WhatsApp message templates, which live in their own getDefaultXTemplate
// functions further down). Lookup order is: requested language -> Spanish,
// so a language missing an entry still gets something readable.
const UI_STRINGS = {
  classReminderTooltip: {
    es: 'Enviar advertencia de la clase',
    en: 'Send class reminder',
    ar: 'إرسال تذكير بالحصة',
    ru: 'Отправить напоминание об уроке',
    fr: 'Envoyer un rappel de cours',
    tr: 'Ders hatırlatması gönder',
    id: 'Kirim pengingat kelas',
    it: 'Invia promemoria della lezione',
    pl: 'Wyślij przypomnienie o lekcji',
    pt: 'Enviar lembrete de aula'
  },
  absenceTooltip: {
    es: 'Enviar aviso de falta a clase',
    en: 'Send class absence notice',
    ar: 'إرسال تنبيه بالغياب عن الحصة',
    ru: 'Отправить уведомление об отсутствии на уроке',
    fr: 'Envoyer un avis d\'absence au cours',
    tr: 'Derse devamsızlık bildirimi gönder',
    id: 'Kirim pemberitahuan ketidakhadiran kelas',
    it: 'Invia avviso di assenza alla lezione',
    pl: 'Wyślij powiadomienie o nieobecności na lekcji',
    pt: 'Enviar aviso de falta à aula'
  },
  taskReportTooltip: {
    es: 'Enviar por WhatsApp un reporte de tareas sin enviar',
    en: 'Send a WhatsApp report of unsubmitted tasks',
    ar: 'إرسال تقرير بالمهام غير المُسلَّمة عبر واتساب',
    ru: 'Отправить в WhatsApp отчёт о несданных заданиях',
    fr: 'Envoyer par WhatsApp un rapport des tâches non soumises',
    tr: 'WhatsApp üzerinden teslim edilmemiş görevler raporu gönder',
    id: 'Kirim laporan WhatsApp tugas yang belum dikumpulkan',
    it: 'Invia via WhatsApp un report delle attività non consegnate',
    pl: 'Wyślij przez WhatsApp raport niezłożonych zadań',
    pt: 'Enviar por WhatsApp um relatório de tarefas não enviadas'
  },
  recordingButtonTooltip: {
    es: 'Enviar link de la grabación de la última clase',
    en: 'Send the recording link of the last class',
    ar: 'إرسال رابط تسجيل الحصة الأخيرة',
    ru: 'Отправить ссылку на запись последнего урока',
    fr: 'Envoyer le lien de l\'enregistrement du dernier cours',
    tr: 'Son dersin kayıt bağlantısını gönder',
    id: 'Kirim tautan rekaman kelas terakhir',
    it: 'Invia il link della registrazione dell\'ultima lezione',
    pl: 'Wyślij link do nagrania ostatniej lekcji',
    pt: 'Enviar o link da gravação da última aula'
  },
  noRecordingLinkSent: {
    es: 'No se envió nada: no se indicó el link de la grabación.',
    en: 'Nothing was sent: no recording link was provided.',
    ar: 'لم يتم إرسال شيء: لم يتم تحديد رابط التسجيل.',
    ru: 'Ничего не отправлено: ссылка на запись не указана.',
    fr: 'Rien n\'a été envoyé : aucun lien d\'enregistrement n\'a été indiqué.',
    tr: 'Hiçbir şey gönderilmedi: kayıt bağlantısı belirtilmedi.',
    id: 'Tidak ada yang dikirim: tautan rekaman tidak diberikan.',
    it: 'Non è stato inviato nulla: non è stato indicato il link della registrazione.',
    pl: 'Nic nie zostało wysłane: nie podano linku do nagrania.',
    pt: 'Nada foi enviado: o link da gravação não foi informado.'
  },
  noPhoneForStudent: {
    es: 'No hay teléfono disponible para este estudiante',
    en: 'No phone number available for this student',
    ar: 'لا يوجد رقم هاتف متاح لهذا الطالب',
    ru: 'Нет доступного номера телефона для этого студента',
    fr: 'Aucun numéro de téléphone disponible pour cet élève',
    tr: 'Bu öğrenci için kullanılabilir telefon numarası yok',
    id: 'Tidak ada nomor telepon yang tersedia untuk siswa ini',
    it: 'Nessun numero di telefono disponibile per questo studente',
    pl: 'Brak dostępnego numeru telefonu dla tego ucznia',
    pt: 'Nenhum número de telefone disponível para este aluno'
  },
  noGroupId: {
    es: 'No se pudo obtener el ID del grupo',
    en: 'Could not get the group ID',
    ar: 'تعذّر الحصول على معرّف المجموعة',
    ru: 'Не удалось получить ID группы',
    fr: 'Impossible d\'obtenir l\'ID du groupe',
    tr: 'Grup kimliği alınamadı',
    id: 'Tidak dapat memperoleh ID grup',
    it: 'Impossibile ottenere l\'ID del gruppo',
    pl: 'Nie udało się uzyskać ID grupy',
    pt: 'Não foi possível obter o ID do grupo'
  },
  groupIdNotFound: {
    es: 'No se pudo encontrar el ID del grupo. Asegúrate de estar en una página de grupo.',
    en: 'Could not find group ID. Please make sure you are on a group page.',
    ar: 'تعذّر العثور على معرّف المجموعة. تأكد من أنك في صفحة مجموعة.',
    ru: 'Не удалось найти ID группы. Убедитесь, что вы находитесь на странице группы.',
    fr: 'ID du groupe introuvable. Assurez-vous d\'être sur une page de groupe.',
    tr: 'Grup kimliği bulunamadı. Bir grup sayfasında olduğunuzdan emin olun.',
    id: 'ID grup tidak ditemukan. Pastikan Anda berada di halaman grup.',
    it: 'ID del gruppo non trovato. Assicurati di essere in una pagina di gruppo.',
    pl: 'Nie znaleziono ID grupy. Upewnij się, że jesteś na stronie grupy.',
    pt: 'ID do grupo não encontrado. Certifique-se de estar em uma página de grupo.'
  },
  scheduleFetchError: {
    es: (status) => `Error al obtener el horario: ${status}`,
    en: (status) => `Error fetching the schedule: ${status}`,
    ar: (status) => `تعذّر جلب الجدول: ${status}`,
    ru: (status) => `Не удалось загрузить расписание: ${status}`,
    fr: (status) => `Erreur lors de la récupération de l'horaire : ${status}`,
    tr: (status) => `Program alınamadı: ${status}`,
    id: (status) => `Gagal mengambil jadwal: ${status}`,
    it: (status) => `Errore nel recupero dell'orario: ${status}`,
    pl: (status) => `Błąd pobierania harmonogramu: ${status}`,
    pt: (status) => `Erro ao obter o horário: ${status}`
  },
  noUpcomingLesson: {
    es: 'No se encontró una clase próxima',
    en: 'No upcoming class found',
    ar: 'لم يتم العثور على حصة قادمة',
    ru: 'Ближайший урок не найден',
    fr: 'Aucun cours à venir trouvé',
    tr: 'Yaklaşan ders bulunamadı',
    id: 'Tidak ditemukan kelas mendatang',
    it: 'Nessuna lezione imminente trovata',
    pl: 'Nie znaleziono nadchodzącej lekcji',
    pt: 'Nenhuma aula futura encontrada'
  },
  messageGenerationError: {
    es: 'Error al generar el mensaje',
    en: 'Error generating the message',
    ar: 'تعذّر إنشاء الرسالة',
    ru: 'Не удалось создать сообщение',
    fr: 'Erreur lors de la génération du message',
    tr: 'Mesaj oluşturulamadı',
    id: 'Gagal membuat pesan',
    it: 'Errore nella generazione del messaggio',
    pl: 'Błąd podczas generowania wiadomości',
    pt: 'Erro ao gerar a mensagem'
  },
  classReminderError: {
    es: 'Error al enviar la advertencia de clase',
    en: 'Error sending the class reminder',
    ar: 'تعذّر إرسال التذكير بالحصة',
    ru: 'Не удалось отправить напоминание об уроке',
    fr: 'Erreur lors de l\'envoi du rappel de cours',
    tr: 'Ders hatırlatması gönderilemedi',
    id: 'Gagal mengirim pengingat kelas',
    it: 'Errore nell\'invio del promemoria della lezione',
    pl: 'Błąd podczas wysyłania przypomnienia o lekcji',
    pt: 'Erro ao enviar o lembrete de aula'
  },
  taskInfoError: {
    es: 'No se pudo obtener la información de tareas. Revisa la consola.',
    en: 'Could not get the tasks information. Check the console.',
    ar: 'تعذّر الحصول على بيانات المهام. راجع وحدة تحكّم المتصفح.',
    ru: 'Не удалось получить данные о заданиях. Проверьте консоль браузера.',
    fr: 'Impossible d\'obtenir les informations des tâches. Vérifiez la console.',
    tr: 'Görev bilgileri alınamadı. Konsolu kontrol edin.',
    id: 'Tidak dapat memperoleh informasi tugas. Periksa konsol browser.',
    it: 'Impossibile ottenere le informazioni sulle attività. Controlla la console.',
    pl: 'Nie udało się pobrać informacji o zadaniach. Sprawdź konsolę.',
    pt: 'Não foi possível obter as informações das tarefas. Verifique o console.'
  },
  noPendingTasks: {
    es: 'Este estudiante no tiene tareas pendientes de enviar. 🎉',
    en: 'This student has no unsubmitted tasks. 🎉',
    ar: 'لا توجد لدى هذا الطالب مهام غير مُسلَّمة. 🎉',
    ru: 'У этого студента нет несданных заданий. 🎉',
    fr: 'Cet élève n\'a aucune tâche non soumise. 🎉',
    tr: 'Bu öğrencinin teslim edilmemiş görevi yok. 🎉',
    id: 'Siswa ini tidak memiliki tugas yang belum dikumpulkan. 🎉',
    it: 'Questo studente non ha attività non consegnate. 🎉',
    pl: 'Ten uczeń nie ma niezłożonych zadań. 🎉',
    pt: 'Este aluno não tem tarefas pendentes de envio. 🎉'
  },
  taskReportMessage: {
    es: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Hola ${studentName} ${waveEmoji}, soy ${tutorName}, tu tutor${courseName ? ` de ${courseName}` : ''} en Kodland.\nQuería recordarte que tienes pendientes de enviar las siguientes tareas:\n${taskListText}\nPor favor súbelas a la plataforma cuando puedas, para que no te atrases con el curso. ¡Cualquier duda, aquí estoy! ${smileEmoji}`,
    en: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `Hi ${studentName} ${waveEmoji}, this is ${tutorName}, your${courseName ? ` ${courseName}` : ''} tutor at Kodland.\nI wanted to remind you that the following tasks are still not submitted:\n${taskListText}\nPlease upload them to the platform when you can, so you don't fall behind on the course. Any questions, I'm here! ${smileEmoji}`,
    ar: ({ studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji }) =>
      `مرحباً ${studentName} ${waveEmoji}، أنا ${tutorName}، معلّمك${courseName ? ` في دورة ${courseName}` : ''} على منصة Kodland.\nأردت تذكيرك بأن لديك المهام التالية غير مُسلَّمة:\n${taskListText}\nيُرجى رفعها على المنصة متى استطعت حتى لا تتأخر عن الدورة. وإن كان لديك أي سؤال فأنا هنا! ${smileEmoji}`,
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
  scheduleLine: {
    es: ({ dayName, fullDate, time, timezoneLabel }) =>
      `que comenzará este ${dayName} ${fullDate} a las ${time} horas (hora ${timezoneLabel})`,
    en: ({ dayName, fullDate, time, timezoneLabel }) =>
      `starting this ${dayName} ${fullDate} at ${time} (${timezoneLabel} time)`,
    ar: ({ dayName, fullDate, time, timezoneLabel }) =>
      `التي تبدأ يوم ${dayName} ${fullDate} الساعة ${time} (بتوقيت ${timezoneLabel})`,
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
    es: 'que comenzará muy pronto',
    en: 'starting very soon',
    ar: 'التي ستبدأ قريباً',
    ru: 'который начнётся очень скоро',
    fr: 'qui commencera très bientôt',
    tr: 'çok yakında başlayacak',
    id: 'yang akan segera dimulai',
    it: 'che inizierà molto presto',
    pl: 'który rozpocznie się już wkrótce',
    pt: 'que começará muito em breve'
  },
  waGroupLinkMissing: {
    es: '[Aún no se detectó el link del grupo de WhatsApp - haz clic en el botón de chat de la página del curso]',
    en: '[The WhatsApp group link has not been detected yet - click the group link button at the bottom of the page]',
    ar: '[لم يتم اكتشاف رابط مجموعة واتساب بعد — انقر على زر رابط المجموعة أسفل الصفحة]',
    ru: '[Ссылка на группу WhatsApp ещё не обнаружена — нажмите кнопку ссылки группы внизу страницы]',
    fr: '[Le lien du groupe WhatsApp n\'a pas encore été détecté — cliquez sur le bouton du lien du groupe en bas de la page]',
    tr: '[WhatsApp grup bağlantısı henüz algılanmadı — sayfanın altındaki grup bağlantısı düğmesine tıklayın]',
    id: '[Tautan grup WhatsApp belum terdeteksi — klik tombol tautan grup di bagian bawah halaman]',
    it: '[Il link del gruppo WhatsApp non è ancora stato rilevato — clicca sul pulsante del link del gruppo in fondo alla pagina]',
    pl: '[Link do grupy WhatsApp nie został jeszcze wykryty — kliknij przycisk linku grupy na dole strony]',
    pt: '[O link do grupo do WhatsApp ainda não foi detectado — clique no botão de link do grupo na parte inferior da página]'
  },
  loginLinkMissing: {
    es: '[No se pudo generar el link de acceso, revisa el perfil del estudiante]',
    en: '[Could not generate the access link, check the student profile]',
    ar: '[تعذّر إنشاء رابط الدخول، راجع ملف الطالب]',
    ru: '[Не удалось создать ссылку для входа, проверьте профиль студента]',
    fr: '[Impossible de générer le lien d\'accès, vérifiez le profil de l\'élève]',
    tr: '[Giriş bağlantısı oluşturulamadı, öğrenci profilini kontrol edin]',
    id: '[Tidak dapat membuat tautan akses, periksa profil siswa]',
    it: '[Impossibile generare il link di accesso, controlla il profilo dello studente]',
    pl: '[Nie udało się wygenerować linku dostępu, sprawdź profil ucznia]',
    pt: '[Não foi possível gerar o link de acesso, verifique o perfil do aluno]'
  },

  // --- Tasks modal ---
  weeklySummaryTooltip: {
    es: 'Enviar resumen semanal', en: 'Send weekly summary', ar: 'إرسال الملخص الأسبوعي', ru: 'Отправить еженедельную сводку',
    fr: 'Envoyer le résumé hebdomadaire', tr: 'Haftalık özeti gönder', id: 'Kirim ringkasan mingguan', it: 'Invia il riepilogo settimanale',
    pl: 'Wyślij cotygodniowe podsumowanie', pt: 'Enviar resumo semanal'
  },
  refreshTooltip: {
    es: 'Actualizar', en: 'Refresh', ar: 'تحديث', ru: 'Обновить', fr: 'Actualiser', tr: 'Yenile',
    id: 'Segarkan', it: 'Aggiorna', pl: 'Odśwież', pt: 'Atualizar'
  },
  classTasksHeading: {
    es: '📚 Actividades de Clase', en: '📚 Class Tasks', ar: '📚 أنشطة الحصة', ru: '📚 Классные задания',
    fr: '📚 Activités en classe', tr: '📚 Sınıf Etkinlikleri', id: '📚 Aktivitas Kelas', it: '📚 Attività in classe',
    pl: '📚 Zadania klasowe', pt: '📚 Atividades de Classe'
  },
  homeworkTasksHeading: {
    es: '📝 Tareas', en: '📝 Homework Tasks', ar: '📝 الواجب المنزلي', ru: '📝 Домашние задания',
    fr: '📝 Devoirs', tr: '📝 Ev Ödevi', id: '📝 Tugas Rumah', it: '📝 Compiti a casa',
    pl: '📝 Zadania domowe', pt: '📝 Trabalhos de Casa'
  },
  lessonCardHeader: {
    es: (number, id) => `Lección ${number} (ID: ${id})`,
    en: (number, id) => `Lesson ${number} (ID: ${id})`,
    ar: (number, id) => `الدرس ${number} (المعرّف: ${id})`,
    ru: (number, id) => `Урок ${number} (ID: ${id})`,
    fr: (number, id) => `Leçon ${number} (ID : ${id})`,
    tr: (number, id) => `Ders ${number} (ID: ${id})`,
    id: (number, lessonId) => `Pelajaran ${number} (ID: ${lessonId})`,
    it: (number, id) => `Lezione ${number} (ID: ${id})`,
    pl: (number, id) => `Lekcja ${number} (ID: ${id})`,
    pt: (number, id) => `Aula ${number} (ID: ${id})`
  },
  noTasksDataAvailable: {
    es: 'No hay datos de tareas disponibles', en: 'No tasks data available', ar: 'لا تتوفر بيانات المهام',
    ru: 'Данные о заданиях недоступны', fr: 'Aucune donnée de tâche disponible', tr: 'Görev verisi mevcut değil',
    id: 'Data tugas tidak tersedia', it: 'Nessun dato sulle attività disponibile', pl: 'Brak dostępnych danych o zadaniach',
    pt: 'Nenhum dado de tarefa disponível'
  },
  noTasksMatchFilter: {
    es: 'No hay tareas que coincidan con este filtro', en: 'No tasks match this filter', ar: 'لا توجد مهام تطابق هذا الفلتر',
    ru: 'Нет заданий, соответствующих этому фильтру', fr: 'Aucune tâche ne correspond à ce filtre', tr: 'Bu filtreyle eşleşen görev yok',
    id: 'Tidak ada tugas yang cocok dengan filter ini', it: 'Nessuna attività corrisponde a questo filtro', pl: 'Brak zadań pasujących do tego filtra',
    pt: 'Nenhuma tarefa corresponde a este filtro'
  },
  studentWithId: {
    es: (id) => `Estudiante ${id}`, en: (id) => `Student ${id}`, ar: (id) => `طالب ${id}`, ru: (id) => `Студент ${id}`,
    fr: (id) => `Élève ${id}`, tr: (id) => `Öğrenci ${id}`, id: (studentId) => `Siswa ${studentId}`,
    it: (id) => `Studente ${id}`, pl: (id) => `Uczeń ${id}`, pt: (id) => `Aluno ${id}`
  },
  noData: {
    es: 'No hay datos', en: 'No data', ar: 'لا توجد بيانات', ru: 'Нет данных', fr: 'Aucune donnée',
    tr: 'Veri yok', id: 'Tidak ada data', it: 'Nessun dato', pl: 'Brak danych', pt: 'Sem dados'
  },
  noTasks: {
    es: 'No hay tareas', en: 'No tasks', ar: 'لا توجد مهام', ru: 'Нет заданий', fr: 'Aucune tâche',
    tr: 'Görev yok', id: 'Tidak ada tugas', it: 'Nessuna attività', pl: 'Brak zadań', pt: 'Sem tarefas'
  },
  noTasksThisFilter: {
    es: 'No hay tareas con este filtro', en: 'No tasks with this filter', ar: 'لا توجد مهام بهذا الفلتر',
    ru: 'Нет заданий с этим фильтром', fr: 'Aucune tâche avec ce filtre', tr: 'Bu filtreyle görev yok',
    id: 'Tidak ada tugas dengan filter ini', it: 'Nessuna attività con questo filtro', pl: 'Brak zadań z tym filtrem',
    pt: 'Nenhuma tarefa com este filtro'
  },
  unknownStatus: {
    es: 'Desconocido', en: 'Unknown', ar: 'غير معروف', ru: 'Неизвестно', fr: 'Inconnu', tr: 'Bilinmiyor',
    id: 'Tidak diketahui', it: 'Sconosciuto', pl: 'Nieznany', pt: 'Desconhecido'
  },
  unnamedTask: {
    es: 'Tarea sin nombre', en: 'Untitled task', ar: 'مهمة بلا عنوان', ru: 'Задание без названия',
    fr: 'Tâche sans titre', tr: 'Adsız görev', id: 'Tugas tanpa judul', it: 'Attività senza titolo',
    pl: 'Zadanie bez nazwy', pt: 'Tarefa sem título'
  },

  // --- Settings ---
  settingsTooltip: {
    es: 'Configuración de la extensión (mostrar/ocultar botones, nombre del tutor)',
    en: 'Extension settings (show/hide buttons, tutor name, language)',
    ar: 'إعدادات الإضافة (إظهار/إخفاء الأزرار، اسم المعلّم، اللغة)',
    ru: 'Настройки расширения (показать/скрыть кнопки, имя преподавателя, язык)',
    fr: 'Paramètres de l\'extension (afficher/masquer les boutons, nom du professeur, langue)',
    tr: 'Uzantı ayarları (düğmeleri göster/gizle, öğretmen adı, dil)',
    id: 'Pengaturan ekstensi (tampilkan/sembunyikan tombol, nama tutor, bahasa)',
    it: 'Impostazioni dell\'estensione (mostra/nascondi pulsanti, nome del tutor, lingua)',
    pl: 'Ustawienia rozszerzenia (pokaż/ukryj przyciski, imię nauczyciela, język)',
    pt: 'Configurações da extensão (mostrar/ocultar botões, nome do tutor, idioma)'
  },
  settingsTitle: {
    es: '⚙️ Configuración', en: '⚙️ Settings', ar: '⚙️ الإعدادات', ru: '⚙️ Настройки',
    fr: '⚙️ Paramètres', tr: '⚙️ Ayarlar', id: '⚙️ Pengaturan', it: '⚙️ Impostazioni',
    pl: '⚙️ Ustawienia', pt: '⚙️ Configurações'
  },
  settingShowExport: {
    es: '📇 Mostrar botón "Exportar contactos"',
    en: '📇 Show the "Export contacts" button',
    ar: '📇 إظهار زر "تصدير جهات الاتصال"',
    ru: '📇 Показать кнопку "Экспорт контактов"',
    fr: '📇 Afficher le bouton "Exporter les contacts"',
    tr: '📇 "Kişileri dışa aktar" düğmesini göster',
    id: '📇 Tampilkan tombol "Ekspor kontak"',
    it: '📇 Mostra il pulsante "Esporta contatti"',
    pl: '📇 Pokaż przycisk "Eksportuj kontakty"',
    pt: '📇 Mostrar botão "Exportar contatos"'
  },
  settingShowWaLink: {
    es: '💬 Mostrar botón "Link WA grupo"',
    en: '💬 Show the "WhatsApp group link" button',
    ar: '💬 إظهار زر "رابط مجموعة واتساب"',
    ru: '💬 Показать кнопку "Ссылка на группу WhatsApp"',
    fr: '💬 Afficher le bouton "Lien du groupe WhatsApp"',
    tr: '💬 "WhatsApp grup bağlantısı" düğmesini göster',
    id: '💬 Tampilkan tombol "Tautan grup WhatsApp"',
    it: '💬 Mostra il pulsante "Link gruppo WhatsApp"',
    pl: '💬 Pokaż przycisk "Link do grupy WhatsApp"',
    pt: '💬 Mostrar botão "Link do grupo do WhatsApp"'
  },
  settingShowAttendance: {
    es: '✅ Mostrar botón "Tomar asistencia"',
    en: '✅ Show the "Take attendance" button',
    ar: '✅ إظهار زر "تسجيل الحضور"',
    ru: '✅ Показать кнопку "Отметить посещаемость"',
    fr: '✅ Afficher le bouton "Prendre les présences"',
    tr: '✅ "Yoklama al" düğmesini göster',
    id: '✅ Tampilkan tombol "Ambil absensi"',
    it: '✅ Mostra il pulsante "Registra presenze"',
    pl: '✅ Pokaż przycisk "Zaznacz obecność"',
    pt: '✅ Mostrar botão "Registrar presença"'
  },
  settingShowAbsence: {
    es: '⏰ Mostrar botón "Falta a clase" (por estudiante)',
    en: '⏰ Show the "Class absence" button (per student)',
    ar: '⏰ إظهار زر "الغياب عن الحصة" (لكل طالب)',
    ru: '⏰ Показать кнопку "Отсутствие на уроке" (для каждого студента)',
    fr: '⏰ Afficher le bouton "Absence au cours" (par élève)',
    tr: '⏰ "Derse devamsızlık" düğmesini göster (öğrenci başına)',
    id: '⏰ Tampilkan tombol "Ketidakhadiran kelas" (per siswa)',
    it: '⏰ Mostra il pulsante "Assenza alla lezione" (per studente)',
    pl: '⏰ Pokaż przycisk "Nieobecność na lekcji" (dla każdego ucznia)',
    pt: '⏰ Mostrar botão "Falta à aula" (por aluno)'
  },
  settingShowTaskReport: {
    es: '📤 Mostrar botón "Reporte de tareas" (por estudiante)',
    en: '📤 Show the "Tasks report" button (per student)',
    ar: '📤 إظهار زر "تقرير المهام" (لكل طالب)',
    ru: '📤 Показать кнопку "Отчёт по заданиям" (для каждого студента)',
    fr: '📤 Afficher le bouton "Rapport des tâches" (par élève)',
    tr: '📤 "Görev raporu" düğmesini göster (öğrenci başına)',
    id: '📤 Tampilkan tombol "Laporan tugas" (per siswa)',
    it: '📤 Mostra il pulsante "Report attività" (per studente)',
    pl: '📤 Pokaż przycisk "Raport zadań" (dla każdego ucznia)',
    pt: '📤 Mostrar botão "Relatório de tarefas" (por aluno)'
  },
  settingShowRecording: {
    es: '🎥 Mostrar botón "Grabación última clase" (por estudiante)',
    en: '🎥 Show the "Last class recording" button (per student)',
    ar: '🎥 إظهار زر "تسجيل الحصة الأخيرة" (لكل طالب)',
    ru: '🎥 Показать кнопку "Запись последнего урока" (для каждого студента)',
    fr: '🎥 Afficher le bouton "Enregistrement du dernier cours" (par élève)',
    tr: '🎥 "Son ders kaydı" düğmesini göster (öğrenci başına)',
    id: '🎥 Tampilkan tombol "Rekaman kelas terakhir" (per siswa)',
    it: '🎥 Mostra il pulsante "Registrazione ultima lezione" (per studente)',
    pl: '🎥 Pokaż przycisk "Nagranie ostatniej lekcji" (dla każdego ucznia)',
    pt: '🎥 Mostrar botão "Gravação da última aula" (por aluno)'
  },
  settingShowGradingReport: {
    es: '📊 Mostrar botón "Reporte calificación" (grupo completo)',
    en: '📊 Show the "Grading report" button (whole group)',
    ar: '📊 إظهار زر "تقرير التصحيح" (للمجموعة كاملة)',
    ru: '📊 Показать кнопку "Отчёт о проверке" (для всей группы)',
    fr: '📊 Afficher le bouton "Rapport de correction" (groupe entier)',
    tr: '📊 "Notlandırma raporu" düğmesini göster (tüm grup)',
    id: '📊 Tampilkan tombol "Laporan penilaian" (seluruh grup)',
    it: '📊 Mostra il pulsante "Report correzioni" (intero gruppo)',
    pl: '📊 Pokaż przycisk "Raport oceniania" (cała grupa)',
    pt: '📊 Mostrar botão "Relatório de correção" (grupo inteiro)'
  },
  settingShowBroadcast: {
    es: '📢 Mostrar botones de aviso al grupo (clase, en clase, graduación, bienvenida, grabación)',
    en: '📢 Show the group broadcast buttons (class starting, in class, graduation, welcome, recording)',
    ar: '📢 إظهار أزرار الإشعار الجماعي (بدء الحصة، داخل الحصة، التخرج، الترحيب، التسجيل)',
    ru: '📢 Показать кнопки рассылки в группу (начало урока, идёт урок, выпускной, приветствие, запись)',
    fr: '📢 Afficher les boutons de diffusion au groupe (début du cours, en cours, remise des diplômes, bienvenue, enregistrement)',
    tr: '📢 Gruba duyuru düğmelerini göster (ders başlıyor, derste, mezuniyet, hoş geldin, kayıt)',
    id: '📢 Tampilkan tombol siaran ke grup (kelas dimulai, sedang kelas, kelulusan, sambutan, rekaman)',
    it: '📢 Mostra i pulsanti di diffusione al gruppo (inizio lezione, in lezione, diploma, benvenuto, registrazione)',
    pl: '📢 Pokaż przyciski powiadomień do grupy (start lekcji, w trakcie lekcji, zakończenie kursu, powitanie, nagranie)',
    pt: '📢 Mostrar botões de aviso ao grupo (início da aula, em aula, formatura, boas-vindas, gravação)'
  },
  settingTutorName: {
    es: 'Nombre del tutor:', en: 'Tutor name:', ar: 'اسم المعلّم:', ru: 'Имя преподавателя:',
    fr: 'Nom du professeur :', tr: 'Öğretmen adı:', id: 'Nama tutor:', it: 'Nome del tutor:',
    pl: 'Imię nauczyciela:', pt: 'Nome do tutor:'
  },
  settingLanguage: {
    es: 'Idioma de la interfaz y los mensajes:',
    en: 'Interface and message language:',
    ar: 'لغة الواجهة والرسائل:',
    ru: 'Язык интерфейса и сообщений:',
    fr: 'Langue de l\'interface et des messages :',
    tr: 'Arayüz ve mesaj dili:',
    id: 'Bahasa antarmuka dan pesan:',
    it: 'Lingua dell\'interfaccia e dei messaggi:',
    pl: 'Język interfejsu i wiadomości:',
    pt: 'Idioma da interface e das mensagens:'
  },
  settingLanguageAuto: {
    es: 'Automático (seguir el idioma de la página de Kodland)',
    en: 'Automatic (follow the Kodland page language)',
    ar: 'تلقائي (حسب لغة صفحة Kodland)',
    ru: 'Автоматически (следовать языку страницы Kodland)',
    fr: 'Automatique (suivre la langue de la page Kodland)',
    tr: 'Otomatik (Kodland sayfa dilini takip et)',
    id: 'Otomatis (mengikuti bahasa halaman Kodland)',
    it: 'Automatico (segui la lingua della pagina Kodland)',
    pl: 'Automatyczny (zgodnie z językiem strony Kodland)',
    pt: 'Automático (seguir o idioma da página Kodland)'
  },
  settingsTemplatesHelp: {
    es: 'Plantillas de mensajes: usa {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}} y (solo en bienvenida individual) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Esos textos se rellenan solos al enviar el mensaje.',
    en: 'Message templates: use {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}}, and (individual welcome message only) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. These are filled in automatically when the message is sent.',
    ar: 'قوالب الرسائل: استخدم {{studentName}} و{{tutorName}} و{{courseName}} و{{time}} و{{gradDate}} و{{gradTime}} و{{recordingLink}}، وفي رسالة الترحيب الفردية فقط {{scheduleLine}} و{{waGroupLink}} و{{wonderLoginUrl}} و{{username}} و{{password}}. تُملأ هذه القيم تلقائياً عند إرسال الرسالة.',
    ru: 'Шаблоны сообщений: используйте {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}}, а в индивидуальном приветственном сообщении также {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Эти значения подставляются автоматически при отправке сообщения.',
    fr: 'Modèles de messages : utilisez {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}}, et (message de bienvenue individuel uniquement) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Ces valeurs sont remplies automatiquement lors de l\'envoi du message.',
    tr: 'Mesaj şablonları: {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}} kullanın; bireysel hoş geldin mesajında ayrıca {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Bu değerler mesaj gönderilirken otomatik olarak doldurulur.',
    id: 'Templat pesan: gunakan {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}}, dan (khusus pesan selamat datang individu) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Nilai-nilai ini akan diisi otomatis saat pesan dikirim.',
    it: 'Modelli di messaggio: usa {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}} e (solo nel messaggio di benvenuto individuale) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Questi valori vengono compilati automaticamente all\'invio del messaggio.',
    pl: 'Szablony wiadomości: użyj {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}}, a w indywidualnej wiadomości powitalnej także {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Te wartości są uzupełniane automatycznie podczas wysyłania wiadomości.',
    pt: 'Modelos de mensagem: use {{studentName}}, {{tutorName}}, {{courseName}}, {{time}}, {{gradDate}}, {{gradTime}}, {{recordingLink}} e (somente na mensagem de boas-vindas individual) {{scheduleLine}}, {{waGroupLink}}, {{wonderLoginUrl}}, {{username}}, {{password}}. Esses valores são preenchidos automaticamente ao enviar a mensagem.'
  },
  settingWelcomeTemplate: {
    es: 'Mensaje de bienvenida (individual, por estudiante):',
    en: 'Welcome message (individual, per student):',
    ar: 'رسالة الترحيب (فردية، لكل طالب):',
    ru: 'Приветственное сообщение (индивидуальное, для каждого студента):',
    fr: 'Message de bienvenue (individuel, par élève) :',
    tr: 'Hoş geldin mesajı (bireysel, öğrenci başına):',
    id: 'Pesan selamat datang (individu, per siswa):',
    it: 'Messaggio di benvenuto (individuale, per studente):',
    pl: 'Wiadomość powitalna (indywidualna, dla każdego ucznia):',
    pt: 'Mensagem de boas-vindas (individual, por aluno):'
  },
  settingAbsenceTemplate: {
    es: 'Mensaje de falta a clase (individual, por estudiante):',
    en: 'Class absence message (individual, per student):',
    ar: 'رسالة الغياب عن الحصة (فردية، لكل طالب):',
    ru: 'Сообщение об отсутствии на уроке (индивидуальное, для каждого студента):',
    fr: 'Message d\'absence au cours (individuel, par élève) :',
    tr: 'Derse devamsızlık mesajı (bireysel, öğrenci başına):',
    id: 'Pesan ketidakhadiran kelas (individu, per siswa):',
    it: 'Messaggio di assenza alla lezione (individuale, per studente):',
    pl: 'Wiadomość o nieobecności na lekcji (indywidualna, dla każdego ucznia):',
    pt: 'Mensagem de falta à aula (individual, por aluno):'
  },
  settingClassStartingTemplate: {
    es: '📢 Aviso de clase (al grupo de WhatsApp):',
    en: '📢 Class starting notice (to the WhatsApp group):',
    ar: '📢 إشعار بدء الحصة (إلى مجموعة واتساب):',
    ru: '📢 Уведомление о начале урока (в группу WhatsApp):',
    fr: '📢 Avis de début de cours (au groupe WhatsApp) :',
    tr: '📢 Ders başlangıcı bildirimi (WhatsApp grubuna):',
    id: '📢 Pemberitahuan kelas dimulai (ke grup WhatsApp):',
    it: '📢 Avviso di inizio lezione (al gruppo WhatsApp):',
    pl: '📢 Powiadomienie o rozpoczęciu lekcji (do grupy WhatsApp):',
    pt: '📢 Aviso de início de aula (para o grupo do WhatsApp):'
  },
  settingInClassTemplate: {
    es: '▶️ Estamos en clase (al grupo de WhatsApp):',
    en: '▶️ We are in class (to the WhatsApp group):',
    ar: '▶️ نحن الآن في الحصة (إلى مجموعة واتساب):',
    ru: '▶️ Мы уже на уроке (в группу WhatsApp):',
    fr: '▶️ Nous sommes en cours (au groupe WhatsApp) :',
    tr: '▶️ Derste hazırız (WhatsApp grubuna):',
    id: '▶️ Kami sudah di kelas (ke grup WhatsApp):',
    it: '▶️ Siamo in lezione (al gruppo WhatsApp):',
    pl: '▶️ Jesteśmy na lekcji (do grupy WhatsApp):',
    pt: '▶️ Estamos em aula (para o grupo do WhatsApp):'
  },
  settingGraduationTemplate: {
    es: '🎓 Graduación (al grupo de WhatsApp):',
    en: '🎓 Graduation (to the WhatsApp group):',
    ar: '🎓 التخرج (إلى مجموعة واتساب):',
    ru: '🎓 Выпускной (в группу WhatsApp):',
    fr: '🎓 Remise des diplômes (au groupe WhatsApp) :',
    tr: '🎓 Mezuniyet (WhatsApp grubuna):',
    id: '🎓 Kelulusan (ke grup WhatsApp):',
    it: '🎓 Diploma (al gruppo WhatsApp):',
    pl: '🎓 Zakończenie kursu (do grupy WhatsApp):',
    pt: '🎓 Formatura (para o grupo do WhatsApp):'
  },
  settingGroupWelcomeTemplate: {
    es: '🎉 Bienvenida al grupo (al grupo de WhatsApp):',
    en: '🎉 Group welcome (to the WhatsApp group):',
    ar: '🎉 الترحيب بالمجموعة (إلى مجموعة واتساب):',
    ru: '🎉 Приветствие группы (в группу WhatsApp):',
    fr: '🎉 Bienvenue au groupe (au groupe WhatsApp) :',
    tr: '🎉 Gruba hoş geldin (WhatsApp grubuna):',
    id: '🎉 Sambutan grup (ke grup WhatsApp):',
    it: '🎉 Benvenuto al gruppo (al gruppo WhatsApp):',
    pl: '🎉 Powitanie grupy (do grupy WhatsApp):',
    pt: '🎉 Boas-vindas ao grupo (para o grupo do WhatsApp):'
  },
  settingFirstClassTemplate: {
    es: '🎉 Primera clase (al grupo de WhatsApp):',
    en: '🎉 First class (to the WhatsApp group):',
    ar: '🎉 الحصة الأولى (إلى مجموعة واتساب):',
    ru: '🎉 Первое занятие (в группу WhatsApp):',
    fr: '🎉 Premier cours (au groupe WhatsApp) :',
    tr: '🎉 İlk ders (WhatsApp grubuna):',
    id: '🎉 Kelas pertama (ke grup WhatsApp):',
    it: '🎉 Prima lezione (al gruppo WhatsApp):',
    pl: '🎉 Pierwsza lekcja (do grupy WhatsApp):',
    pt: '🎉 Primeira aula (para o grupo do WhatsApp):'
  },
  settingRecordingStudentTemplate: {
    es: '🎥 Grabación última clase (individual, por estudiante):',
    en: '🎥 Last class recording (individual, per student):',
    ar: '🎥 تسجيل الحصة الأخيرة (فردي، لكل طالب):',
    ru: '🎥 Запись последнего урока (индивидуально, для каждого студента):',
    fr: '🎥 Enregistrement du dernier cours (individuel, par élève) :',
    tr: '🎥 Son ders kaydı (bireysel, öğrenci başına):',
    id: '🎥 Rekaman kelas terakhir (individu, per siswa):',
    it: '🎥 Registrazione ultima lezione (individuale, per studente):',
    pl: '🎥 Nagranie ostatniej lekcji (indywidualne, dla każdego ucznia):',
    pt: '🎥 Gravação da última aula (individual, por aluno):'
  },
  settingRecordingGroupTemplate: {
    es: '🎥 Grabación última clase (al grupo de WhatsApp):',
    en: '🎥 Last class recording (to the WhatsApp group):',
    ar: '🎥 تسجيل الحصة الأخيرة (إلى مجموعة واتساب):',
    ru: '🎥 Запись последнего урока (в группу WhatsApp):',
    fr: '🎥 Enregistrement du dernier cours (au groupe WhatsApp) :',
    tr: '🎥 Son ders kaydı (WhatsApp grubuna):',
    id: '🎥 Rekaman kelas terakhir (ke grup WhatsApp):',
    it: '🎥 Registrazione ultima lezione (al gruppo WhatsApp):',
    pl: '🎥 Nagranie ostatniej lekcji (do grupy WhatsApp):',
    pt: '🎥 Gravação da última aula (para o grupo do WhatsApp):'
  },
  settingsReset: {
    es: 'Restablecer', en: 'Reset', ar: 'استعادة الافتراضي', ru: 'Восстановить по умолчанию',
    fr: 'Réinitialiser', tr: 'Varsayılana sıfırla', id: 'Kembalikan ke default', it: 'Ripristina predefinito',
    pl: 'Przywróć domyślne', pt: 'Restaurar padrão'
  },
  settingsSave: {
    es: 'Guardar', en: 'Save', ar: 'حفظ', ru: 'Сохранить', fr: 'Enregistrer', tr: 'Kaydet',
    id: 'Simpan', it: 'Salva', pl: 'Zapisz', pt: 'Salvar'
  },

  // --- Export contacts ---
  exportContactsButton: {
    es: '📇 Exportar contactos', en: '📇 Export contacts', ar: '📇 تصدير جهات الاتصال', ru: '📇 Экспорт контактов',
    fr: '📇 Exporter les contacts', tr: '📇 Kişileri dışa aktar', id: '📇 Ekspor kontak', it: '📇 Esporta contatti',
    pl: '📇 Eksportuj kontakty', pt: '📇 Exportar contatos'
  },
  exportingContacts: {
    es: '⏳ Exportando...', en: '⏳ Exporting...', ar: '⏳ جارٍ التصدير...', ru: '⏳ Экспорт...',
    fr: '⏳ Exportation...', tr: '⏳ Dışa aktarılıyor...', id: '⏳ Mengekspor...', it: '⏳ Esportazione...',
    pl: '⏳ Eksportowanie...', pt: '⏳ Exportando...'
  },
  exportContactsTooltip: {
    es: 'Descargar CSV de contactos (Nombre, Día+Hora, Teléfono)',
    en: 'Download a contacts CSV (Name, Day+Time, Phone)',
    ar: 'تنزيل ملف CSV بجهات الاتصال (الاسم، اليوم والساعة، الهاتف)',
    ru: 'Скачать CSV-файл контактов (Имя, День+Время, Телефон)',
    fr: 'Télécharger un CSV de contacts (Nom, Jour+Heure, Téléphone)',
    tr: 'Kişiler CSV dosyasını indir (Ad, Gün+Saat, Telefon)',
    id: 'Unduh CSV kontak (Nama, Hari+Waktu, Telepon)',
    it: 'Scarica CSV dei contatti (Nome, Giorno+Ora, Telefono)',
    pl: 'Pobierz plik CSV z kontaktami (Imię, Dzień+Godzina, Telefon)',
    pt: 'Baixar CSV de contatos (Nome, Dia+Hora, Telefone)'
  },
  noStudentsProcessed: {
    es: 'Todavía no hay estudiantes procesados. Espera unos segundos a que carguen los datos y vuelve a intentar.',
    en: 'No students processed yet. Wait a few seconds for the data to load and try again.',
    ar: 'لم تتم معالجة أي طلاب بعد. انتظر بضع ثوانٍ حتى تُحمَّل البيانات ثم أعد المحاولة.',
    ru: 'Пока не обработано ни одного студента. Подождите несколько секунд, пока данные загрузятся, и попробуйте снова.',
    fr: 'Aucun élève traité pour le moment. Attendez quelques secondes que les données se chargent et réessayez.',
    tr: 'Henüz işlenen öğrenci yok. Verilerin yüklenmesi için birkaç saniye bekleyip tekrar deneyin.',
    id: 'Belum ada siswa yang diproses. Tunggu beberapa detik hingga data dimuat lalu coba lagi.',
    it: 'Nessuno studente elaborato ancora. Attendi qualche secondo che i dati si carichino e riprova.',
    pl: 'Żaden uczeń nie został jeszcze przetworzony. Poczekaj kilka sekund, aż dane się załadują, i spróbuj ponownie.',
    pt: 'Nenhum aluno processado ainda. Aguarde alguns segundos até os dados carregarem e tente novamente.'
  },

  // --- WhatsApp group link (this project auto-detects it, with manual override) ---
  waGroupLinkAutoDetected: {
    es: '✅ Link WA grupo', en: '✅ WhatsApp group link', ar: '✅ رابط مجموعة واتساب',
    ru: '✅ Ссылка на группу WhatsApp', fr: '✅ Lien du groupe WhatsApp', tr: '✅ WhatsApp grup bağlantısı',
    id: '✅ Tautan grup WhatsApp', it: '✅ Link gruppo WhatsApp', pl: '✅ Link do grupy WhatsApp',
    pt: '✅ Link do grupo do WhatsApp'
  },
  waGroupLinkManual: {
    es: '✏️ Link WA grupo (manual)', en: '✏️ WhatsApp group link (manual)', ar: '✏️ رابط مجموعة واتساب (يدوي)',
    ru: '✏️ Ссылка на группу WhatsApp (вручную)', fr: '✏️ Lien du groupe WhatsApp (manuel)', tr: '✏️ WhatsApp grup bağlantısı (manuel)',
    id: '✏️ Tautan grup WhatsApp (manual)', it: '✏️ Link gruppo WhatsApp (manuale)', pl: '✏️ Link do grupy WhatsApp (ręcznie)',
    pt: '✏️ Link do grupo do WhatsApp (manual)'
  },
  waGroupLinkPaste: {
    es: '📋 Pegar link WA grupo', en: '📋 Paste WhatsApp group link', ar: '📋 الصق رابط مجموعة واتساب',
    ru: '📋 Вставить ссылку на группу WhatsApp', fr: '📋 Coller le lien du groupe WhatsApp', tr: '📋 WhatsApp grup bağlantısını yapıştır',
    id: '📋 Tempel tautan grup WhatsApp', it: '📋 Incolla link gruppo WhatsApp', pl: '📋 Wklej link do grupy WhatsApp',
    pt: '📋 Colar link do grupo do WhatsApp'
  },
  waGroupLinkTooltipDetected: {
    es: (link) => `Link detectado automáticamente: ${link}\nClic para verlo o corregirlo.`,
    en: (link) => `Automatically detected link: ${link}\nClick to view or correct it.`,
    ar: (link) => `الرابط المكتشف تلقائياً: ${link}\nانقر لعرضه أو تصحيحه.`,
    ru: (link) => `Ссылка обнаружена автоматически: ${link}\nНажмите, чтобы просмотреть или исправить.`,
    fr: (link) => `Lien détecté automatiquement : ${link}\nCliquez pour le voir ou le corriger.`,
    tr: (link) => `Otomatik algılanan bağlantı: ${link}\nGörüntülemek veya düzeltmek için tıklayın.`,
    id: (link) => `Tautan terdeteksi otomatis: ${link}\nKlik untuk melihat atau memperbaikinya.`,
    it: (link) => `Link rilevato automaticamente: ${link}\nClicca per vederlo o correggerlo.`,
    pl: (link) => `Automatycznie wykryty link: ${link}\nKliknij, aby go zobaczyć lub poprawić.`,
    pt: (link) => `Link detectado automaticamente: ${link}\nClique para vê-lo ou corrigi-lo.`
  },
  waGroupLinkTooltipManual: {
    es: (link) => `Link guardado manualmente: ${link}\nClic para verlo o corregirlo.`,
    en: (link) => `Manually saved link: ${link}\nClick to view or correct it.`,
    ar: (link) => `الرابط المحفوظ يدوياً: ${link}\nانقر لعرضه أو تصحيحه.`,
    ru: (link) => `Ссылка сохранена вручную: ${link}\nНажмите, чтобы просмотреть или исправить.`,
    fr: (link) => `Lien enregistré manuellement : ${link}\nCliquez pour le voir ou le corriger.`,
    tr: (link) => `Elle kaydedilen bağlantı: ${link}\nGörüntülemek veya düzeltmek için tıklayın.`,
    id: (link) => `Tautan disimpan manual: ${link}\nKlik untuk melihat atau memperbaikinya.`,
    it: (link) => `Link salvato manualmente: ${link}\nClicca per vederlo o correggerlo.`,
    pl: (link) => `Ręcznie zapisany link: ${link}\nKliknij, aby go zobaczyć lub poprawić.`,
    pt: (link) => `Link salvo manualmente: ${link}\nClique para vê-lo ou corrigi-lo.`
  },
  waGroupLinkTooltipNotDetected: {
    es: 'No se pudo detectar el link automáticamente todavía. Clic para pegarlo manualmente.',
    en: 'The link could not be automatically detected yet. Click to paste it manually.',
    ar: 'تعذّر اكتشاف الرابط تلقائياً حتى الآن. انقر للصقه يدوياً.',
    ru: 'Ссылку пока не удалось обнаружить автоматически. Нажмите, чтобы вставить её вручную.',
    fr: 'Le lien n\'a pas encore pu être détecté automatiquement. Cliquez pour le coller manuellement.',
    tr: 'Bağlantı henüz otomatik olarak algılanamadı. Elle yapıştırmak için tıklayın.',
    id: 'Tautan belum dapat terdeteksi secara otomatis. Klik untuk menempelkannya secara manual.',
    it: 'Il link non è ancora stato rilevato automaticamente. Clicca per incollarlo manualmente.',
    pl: 'Nie udało się jeszcze automatycznie wykryć linku. Kliknij, aby wkleić go ręcznie.',
    pt: 'O link ainda não pôde ser detectado automaticamente. Clique para colá-lo manualmente.'
  },
  waGroupLinkPrompt: {
    es: 'Pega o corrige el link del grupo de WhatsApp de este curso:',
    en: "Paste or correct this course's WhatsApp group link:",
    ar: 'الصق رابط مجموعة واتساب الخاصة بهذه الدورة أو صحّحه:',
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
    es: '✅ Tomar asistencia', en: '✅ Take attendance', ar: '✅ تسجيل الحضور', ru: '✅ Отметить посещаемость',
    fr: '✅ Prendre les présences', tr: '✅ Yoklama al', id: '✅ Ambil absensi', it: '✅ Registra presenze',
    pl: '✅ Zaznacz obecność', pt: '✅ Registrar presença'
  },
  attendanceTooltip: {
    es: 'Marca a TODOS los estudiantes como "Asistió". Luego puedes ajustar a mano los que faltaron.',
    en: 'Mark ALL students as "Attended". You can then fix the absentees by hand.',
    ar: 'وضع علامة "حاضر" لجميع الطلاب. يمكنك بعدها تعديل الغائبين يدوياً.',
    ru: 'Отметить ВСЕХ студентов как "Присутствовал". Затем вы можете вручную исправить отсутствующих.',
    fr: 'Marquer TOUS les élèves comme "Présent". Vous pourrez ensuite corriger les absents manuellement.',
    tr: 'TÜM öğrencileri "Katıldı" olarak işaretle. Daha sonra devamsızları elle düzeltebilirsin.',
    id: 'Tandai SEMUA siswa sebagai "Hadir". Anda dapat memperbaiki yang tidak hadir secara manual nanti.',
    it: 'Segna TUTTI gli studenti come "Presente". Potrai poi correggere manualmente gli assenti.',
    pl: 'Oznacz WSZYSTKICH uczniów jako "Obecny". Następnie możesz ręcznie poprawić nieobecnych.',
    pt: 'Marcar TODOS os alunos como "Presente". Depois você pode ajustar manualmente os ausentes.'
  },
  attendanceConfirm: {
    es: '¿Marcar a TODOS los estudiantes visibles como "Asistió"?\n\nDespués puedes cambiar manualmente (clic derecho sobre el número de la lección) a los que hayan faltado.',
    en: 'Mark ALL visible students as "Attended"?\n\nYou can then change the absentees manually (right-click on the lesson number).',
    ar: 'هل تريد وضع علامة "حاضر" لجميع الطلاب الظاهرين؟\n\nيمكنك بعد ذلك تغيير حالة الغائبين يدوياً (بالنقر بالزر الأيمن على رقم الدرس).',
    ru: 'Отметить ВСЕХ видимых студентов как "Присутствовал"?\n\nПосле этого вы можете вручную изменить статус отсутствующих (правый клик по номеру урока).',
    fr: 'Marquer TOUS les élèves visibles comme "Présent" ?\n\nVous pourrez ensuite modifier manuellement les absents (clic droit sur le numéro de la leçon).',
    tr: 'Görünen TÜM öğrenciler "Katıldı" olarak işaretlensin mi?\n\nDaha sonra devamsız olanları elle değiştirebilirsin (ders numarasına sağ tıklayarak).',
    id: 'Tandai SEMUA siswa yang terlihat sebagai "Hadir"?\n\nAnda kemudian dapat mengubah status yang tidak hadir secara manual (klik kanan pada nomor pelajaran).',
    it: 'Segnare TUTTI gli studenti visibili come "Presente"?\n\nPotrai poi modificare manualmente gli assenti (clic destro sul numero della lezione).',
    pl: 'Oznaczyć WSZYSTKICH widocznych uczniów jako "Obecny"?\n\nNastępnie możesz ręcznie zmienić status nieobecnych (kliknięcie prawym przyciskiem na numer lekcji).',
    pt: 'Marcar TODOS os alunos visíveis como "Presente"?\n\nDepois você pode alterar manualmente os ausentes (clique com o botão direito no número da aula).'
  },
  attendanceMarking: {
    es: '⏳ Marcando...', en: '⏳ Marking...', ar: '⏳ جارٍ التسجيل...', ru: '⏳ Отмечаем...',
    fr: '⏳ Marquage...', tr: '⏳ İşaretleniyor...', id: '⏳ Menandai...', it: '⏳ Registrazione...',
    pl: '⏳ Zaznaczanie...', pt: '⏳ Marcando...'
  },
  attendanceNoChips: {
    es: 'No se encontró ningún chip resaltado (lección actual) en la página. Revisa la consola.',
    en: 'No highlighted lesson chip (current lesson) found on the page. Check the console.',
    ar: 'لم يتم العثور على أي درس مُميَّز (الدرس الحالي) في الصفحة. راجع وحدة تحكّم المتصفح.',
    ru: 'На странице не найден выделенный урок (текущий урок). Проверьте консоль браузера.',
    fr: 'Aucune leçon en cours mise en évidence trouvée sur la page. Vérifiez la console.',
    tr: 'Sayfada vurgulanmış bir ders (mevcut ders) bulunamadı. Konsolu kontrol edin.',
    id: 'Tidak ditemukan chip pelajaran yang disorot (pelajaran saat ini) di halaman. Periksa konsol browser.',
    it: 'Nessuna lezione evidenziata (lezione attuale) trovata nella pagina. Controlla la console.',
    pl: 'Nie znaleziono podświetlonej lekcji (bieżącej lekcji) na stronie. Sprawdź konsolę.',
    pt: 'Nenhuma aula destacada (aula atual) encontrada na página. Verifique o console.'
  },
  attendanceSummary: {
    es: ({ ok, skipped, failed }) =>
      `Asistencia marcada: ${ok} ok` +
      (skipped.length > 0 ? `, ${skipped.length} omitidos (no inscritos)` : '') +
      (failed.length > 0 ? `, ${failed.length} fallaron (revisa la consola): ${failed.join(', ')}` : ''),
    en: ({ ok, skipped, failed }) =>
      `Attendance marked: ${ok} ok` +
      (skipped.length > 0 ? `, ${skipped.length} skipped (not enrolled)` : '') +
      (failed.length > 0 ? `, ${failed.length} failed (check the console): ${failed.join(', ')}` : ''),
    ar: ({ ok, skipped, failed }) =>
      `تم تسجيل الحضور: ${ok} بنجاح` +
      (skipped.length > 0 ? `، وتم تخطّي ${skipped.length} (غير مسجّلين)` : '') +
      (failed.length > 0 ? `، وفشل ${failed.length} (راجع وحدة تحكّم المتصفح): ${failed.join('، ')}` : ''),
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
  },

  // --- Grading report ---
  gradingReportButton: {
    es: '📊 Reporte calificación', en: '📊 Grading report', ar: '📊 تقرير التصحيح', ru: '📊 Отчёт о проверке',
    fr: '📊 Rapport de correction', tr: '📊 Notlandırma raporu', id: '📊 Laporan penilaian', it: '📊 Report correzioni',
    pl: '📊 Raport oceniania', pt: '📊 Relatório de correção'
  },
  gradingReportTooltip: {
    es: 'Revisar cuántas tareas le faltan calificar a cada estudiante del grupo',
    en: 'Check how many tasks are still waiting to be graded for each student in the group',
    ar: 'مراجعة عدد المهام التي لم تُصحَّح بعد لكل طالب في المجموعة',
    ru: 'Проверить, сколько заданий ещё не проверено у каждого студента группы',
    fr: 'Vérifier combien de tâches restent à corriger pour chaque élève du groupe',
    tr: 'Gruptaki her öğrenci için notlandırılmayı bekleyen görev sayısını kontrol et',
    id: 'Periksa berapa banyak tugas yang masih menunggu penilaian untuk setiap siswa di grup',
    it: 'Controlla quante attività restano da correggere per ogni studente del gruppo',
    pl: 'Sprawdź, ile zadań czeka jeszcze na ocenę u każdego ucznia w grupie',
    pt: 'Verificar quantas tarefas ainda aguardam correção para cada aluno do grupo'
  },
  gradingReportError: {
    es: 'Ocurrió un error armando el reporte. Revisa la consola.',
    en: 'Something went wrong building the report. Check the console.',
    ar: 'حدث خطأ أثناء إعداد التقرير. راجع وحدة تحكّم المتصفح.',
    ru: 'Произошла ошибка при формировании отчёта. Проверьте консоль браузера.',
    fr: 'Une erreur est survenue lors de la génération du rapport. Vérifiez la console.',
    tr: 'Rapor oluşturulurken bir hata oluştu. Konsolu kontrol edin.',
    id: 'Terjadi kesalahan saat membuat laporan. Periksa konsol browser.',
    it: 'Si è verificato un errore nella creazione del report. Controlla la console.',
    pl: 'Wystąpił błąd podczas tworzenia raportu. Sprawdź konsolę.',
    pt: 'Ocorreu um erro ao montar o relatório. Verifique o console.'
  },
  gradingNobodyPending: {
    es: '🎉 Nadie tiene tareas pendientes de calificar.',
    en: '🎉 Nobody has tasks waiting to be graded.',
    ar: '🎉 لا توجد مهام بانتظار التصحيح لدى أي طالب.',
    ru: '🎉 Ни у кого нет заданий, ожидающих проверки.',
    fr: '🎉 Personne n\'a de tâches en attente de correction.',
    tr: '🎉 Notlandırılmayı bekleyen görevi olan kimse yok.',
    id: '🎉 Tidak ada yang memiliki tugas menunggu penilaian.',
    it: '🎉 Nessuno ha attività in attesa di correzione.',
    pl: '🎉 Nikt nie ma zadań oczekujących na ocenę.',
    pt: '🎉 Ninguém tem tarefas pendentes de correção.'
  },
  gradingReportTitle: {
    es: (total) => `📊 Reporte de calificación del grupo (${total} pendientes en total)`,
    en: (total) => `📊 Group grading report (${total} pending in total)`,
    ar: (total) => `📊 تقرير تصحيح المجموعة (${arabicCount(total, ARABIC_TASK_FORMS)} معلّقة إجمالاً)`,
    ru: (total) => `📊 Отчёт о проверке группы (всего ожидает: ${total})`,
    fr: (total) => `📊 Rapport de correction du groupe (${total} en attente au total)`,
    tr: (total) => `📊 Grup notlandırma raporu (toplam ${total} bekliyor)`,
    id: (total) => `📊 Laporan penilaian grup (total ${total} tertunda)`,
    it: (total) => `📊 Report correzioni del gruppo (${total} in totale in sospeso)`,
    pl: (total) => `📊 Raport oceniania grupy (łącznie oczekuje: ${total})`,
    pt: (total) => `📊 Relatório de correção do grupo (${total} pendentes no total)`
  },
  gradingStudentRow: {
    es: (name, count) => `${name} — ${count} tarea(s) por calificar`,
    en: (name, count) => `${name} — ${count} task(s) to grade`,
    ar: (name, count) => `${name} — ${arabicCount(count, ARABIC_TASK_FORMS)} بانتظار التصحيح`,
    ru: (name, count) => `${name} — ${count} задание(й) на проверку`,
    fr: (name, count) => `${name} — ${count} tâche(s) à corriger`,
    tr: (name, count) => `${name} — notlandırılacak ${count} görev`,
    id: (name, count) => `${name} — ${count} tugas untuk dinilai`,
    it: (name, count) => `${name} — ${count} attività da correggere`,
    pl: (name, count) => `${name} — ${count} zadanie(a) do oceny`,
    pt: (name, count) => `${name} — ${count} tarefa(s) para corrigir`
  },
  gradeTaskLink: {
    es: '↗ Calificar', en: '↗ Grade', ar: '↗ تصحيح', ru: '↗ Проверить', fr: '↗ Corriger',
    tr: '↗ Notlandır', id: '↗ Nilai', it: '↗ Correggi', pl: '↗ Oceń', pt: '↗ Corrigir'
  },

  // --- Broadcast buttons (toolbar) ---
  broadcastFirstClassButton: {
    es: '🎉 Primera clase', en: '🎉 First class', ar: '🎉 الحصة الأولى', ru: '🎉 Первое занятие',
    fr: '🎉 Premier cours', tr: '🎉 İlk ders', id: '🎉 Kelas pertama', it: '🎉 Prima lezione',
    pl: '🎉 Pierwsza lekcja', pt: '🎉 Primeira aula'
  },
  broadcastFirstClassTooltip: {
    es: 'Copiar y abrir WhatsApp: bienvenida especial para la primera clase del curso',
    en: 'Copy and open WhatsApp: special welcome for the course\'s first class',
    ar: 'نسخ وفتح واتساب: ترحيب خاص بالحصة الأولى من الدورة',
    ru: 'Скопировать и открыть WhatsApp: особое приветствие для первого занятия курса',
    fr: 'Copier et ouvrir WhatsApp : bienvenue spéciale pour le premier cours',
    tr: 'Kopyala ve WhatsApp\'ı aç: kursun ilk dersi için özel karşılama',
    id: 'Salin dan buka WhatsApp: sambutan khusus untuk kelas pertama kursus',
    it: 'Copia e apri WhatsApp: benvenuto speciale per la prima lezione del corso',
    pl: 'Skopiuj i otwórz WhatsApp: specjalne powitanie na pierwszą lekcję kursu',
    pt: 'Copiar e abrir WhatsApp: boas-vindas especiais para a primeira aula do curso'
  },
  broadcastClassStartingButton: {
    es: '📢 Aviso de clase', en: '📢 Class notice', ar: '📢 إشعار الحصة', ru: '📢 Уведомление об уроке',
    fr: '📢 Avis de cours', tr: '📢 Ders bildirimi', id: '📢 Pemberitahuan kelas', it: '📢 Avviso lezione',
    pl: '📢 Powiadomienie o lekcji', pt: '📢 Aviso de aula'
  },
  broadcastClassStartingTooltip: {
    es: 'Copiar y abrir WhatsApp: aviso de que la clase va a empezar',
    en: 'Copy and open WhatsApp: notice that class is about to start',
    ar: 'نسخ وفتح واتساب: إشعار بأن الحصة على وشك البدء',
    ru: 'Скопировать и открыть WhatsApp: уведомление о скором начале урока',
    fr: 'Copier et ouvrir WhatsApp : avis que le cours va commencer',
    tr: 'Kopyala ve WhatsApp\'ı aç: dersin başlamak üzere olduğu bildirimi',
    id: 'Salin dan buka WhatsApp: pemberitahuan bahwa kelas akan segera dimulai',
    it: 'Copia e apri WhatsApp: avviso che la lezione sta per iniziare',
    pl: 'Skopiuj i otwórz WhatsApp: powiadomienie, że lekcja zaraz się zacznie',
    pt: 'Copiar e abrir WhatsApp: aviso de que a aula está prestes a começar'
  },
  broadcastInClassButton: {
    es: '▶️ Estamos en clase', en: '▶️ We are in class', ar: '▶️ نحن في الحصة', ru: '▶️ Мы на уроке',
    fr: '▶️ Nous sommes en cours', tr: '▶️ Derste', id: '▶️ Kami sedang di kelas', it: '▶️ Siamo in lezione',
    pl: '▶️ Jesteśmy na lekcji', pt: '▶️ Estamos em aula'
  },
  broadcastInClassTooltip: {
    es: 'Copiar y abrir WhatsApp: aviso de que ya empezó la clase',
    en: 'Copy and open WhatsApp: notice that class has already started',
    ar: 'نسخ وفتح واتساب: إشعار بأن الحصة قد بدأت بالفعل',
    ru: 'Скопировать и открыть WhatsApp: уведомление о том, что урок уже начался',
    fr: 'Copier et ouvrir WhatsApp : avis que le cours a déjà commencé',
    tr: 'Kopyala ve WhatsApp\'ı aç: dersin zaten başladığı bildirimi',
    id: 'Salin dan buka WhatsApp: pemberitahuan bahwa kelas sudah dimulai',
    it: 'Copia e apri WhatsApp: avviso che la lezione è già iniziata',
    pl: 'Skopiuj i otwórz WhatsApp: powiadomienie, że lekcja już się rozpoczęła',
    pt: 'Copiar e abrir WhatsApp: aviso de que a aula já começou'
  },
  broadcastGraduationButton: {
    es: '🎓 Graduación', en: '🎓 Graduation', ar: '🎓 التخرج', ru: '🎓 Выпускной',
    fr: '🎓 Remise des diplômes', tr: '🎓 Mezuniyet', id: '🎓 Kelulusan', it: '🎓 Diploma',
    pl: '🎓 Zakończenie kursu', pt: '🎓 Formatura'
  },
  broadcastGraduationTooltip: {
    es: 'Copiar y abrir WhatsApp: aviso de graduación',
    en: 'Copy and open WhatsApp: graduation notice',
    ar: 'نسخ وفتح واتساب: إشعار التخرج',
    ru: 'Скопировать и открыть WhatsApp: объявление о выпускном',
    fr: 'Copier et ouvrir WhatsApp : avis de remise des diplômes',
    tr: 'Kopyala ve WhatsApp\'ı aç: mezuniyet bildirimi',
    id: 'Salin dan buka WhatsApp: pemberitahuan kelulusan',
    it: 'Copia e apri WhatsApp: avviso di diploma',
    pl: 'Skopiuj i otwórz WhatsApp: powiadomienie o zakończeniu kursu',
    pt: 'Copiar e abrir WhatsApp: aviso de formatura'
  },
  broadcastGroupWelcomeButton: {
    es: '🎉 Bienvenida al grupo', en: '🎉 Group welcome', ar: '🎉 الترحيب بالمجموعة', ru: '🎉 Приветствие группы',
    fr: '🎉 Bienvenue au groupe', tr: '🎉 Gruba hoş geldin', id: '🎉 Sambutan grup', it: '🎉 Benvenuto al gruppo',
    pl: '🎉 Powitanie grupy', pt: '🎉 Boas-vindas ao grupo'
  },
  broadcastGroupWelcomeTooltip: {
    es: 'Copiar y abrir WhatsApp: bienvenida al grupo del curso',
    en: 'Copy and open WhatsApp: welcome to the course group',
    ar: 'نسخ وفتح واتساب: ترحيب بمجموعة الدورة',
    ru: 'Скопировать и открыть WhatsApp: приветствие группе курса',
    fr: 'Copier et ouvrir WhatsApp : bienvenue au groupe du cours',
    tr: 'Kopyala ve WhatsApp\'ı aç: kurs grubuna hoş geldin',
    id: 'Salin dan buka WhatsApp: sambutan untuk grup kursus',
    it: 'Copia e apri WhatsApp: benvenuto al gruppo del corso',
    pl: 'Skopiuj i otwórz WhatsApp: powitanie grupy kursu',
    pt: 'Copiar e abrir WhatsApp: boas-vindas ao grupo do curso'
  },
  broadcastRecordingButton: {
    es: '🎥 Grabación al grupo', en: '🎥 Recording to group', ar: '🎥 تسجيل إلى المجموعة', ru: '🎥 Запись в группу',
    fr: '🎥 Enregistrement au groupe', tr: '🎥 Gruba kayıt', id: '🎥 Rekaman ke grup', it: '🎥 Registrazione al gruppo',
    pl: '🎥 Nagranie do grupy', pt: '🎥 Gravação para o grupo'
  },
  broadcastRecordingTooltip: {
    es: 'Copiar y abrir WhatsApp: enviar el link de la grabación de la última clase al grupo',
    en: 'Copy and open WhatsApp: send the last class recording link to the group',
    ar: 'نسخ وفتح واتساب: إرسال رابط تسجيل الحصة الأخيرة إلى المجموعة',
    ru: 'Скопировать и открыть WhatsApp: отправить ссылку на запись последнего урока в группу',
    fr: 'Copier et ouvrir WhatsApp : envoyer le lien d\'enregistrement du dernier cours au groupe',
    tr: 'Kopyala ve WhatsApp\'ı aç: son ders kaydı bağlantısını gruba gönder',
    id: 'Salin dan buka WhatsApp: kirim tautan rekaman kelas terakhir ke grup',
    it: 'Copia e apri WhatsApp: invia il link della registrazione dell\'ultima lezione al gruppo',
    pl: 'Skopiuj i otwórz WhatsApp: wyślij do grupy link do nagrania ostatniej lekcji',
    pt: 'Copiar e abrir WhatsApp: enviar o link da gravação da última aula para o grupo'
  },
  broadcastGenericError: {
    es: 'Ocurrió un error armando el mensaje. Revisa la consola.',
    en: 'Something went wrong building the message. Check the console.',
    ar: 'حدث خطأ أثناء إعداد الرسالة. راجع وحدة تحكّم المتصفح.',
    ru: 'Произошла ошибка при формировании сообщения. Проверьте консоль браузера.',
    fr: 'Une erreur est survenue lors de la création du message. Vérifiez la console.',
    tr: 'Mesaj oluşturulurken bir hata oluştu. Konsolu kontrol edin.',
    id: 'Terjadi kesalahan saat membuat pesan. Periksa konsol browser.',
    it: 'Si è verificato un errore nella creazione del messaggio. Controlla la console.',
    pl: 'Wystąpił błąd podczas tworzenia wiadomości. Sprawdź konsolę.',
    pt: 'Ocorreu um erro ao montar a mensagem. Verifique o console.'
  },

  // --- Prompts ---
  promptClassTime: {
    es: 'No pude detectar la hora automáticamente. ¿A qué hora es la clase? (ej: 6:00 p.m.)',
    en: "I couldn't detect the time automatically. What time is the class? (e.g. 6:00 p.m.)",
    ar: 'تعذّر اكتشاف الوقت تلقائياً. في أي ساعة الحصة؟ (مثال: 6:00 مساءً)',
    ru: 'Не удалось определить время автоматически. Во сколько урок? (напр. 18:00)',
    fr: 'Je n\'ai pas pu détecter l\'heure automatiquement. À quelle heure est le cours ? (ex. 18h00)',
    tr: 'Saati otomatik olarak algılayamadım. Ders saat kaçta? (örn: 18:00)',
    id: 'Saya tidak dapat mendeteksi waktu secara otomatis. Jam berapa kelasnya? (mis: 18:00)',
    it: 'Non sono riuscito a rilevare l\'orario automaticamente. A che ora è la lezione? (es: 18:00)',
    pl: 'Nie udało się automatycznie wykryć godziny. O której jest lekcja? (np. 18:00)',
    pt: 'Não consegui detectar o horário automaticamente. A que horas é a aula? (ex: 18:00)'
  },
  promptRecordingLinkInstructions: {
    es: (tabUrl) => 'No pude encontrar el link de la grabación automáticamente.' +
      (tabUrl
        ? `\n\n1. Abre esta pestaña: ${tabUrl}\n2. Busca la última clase completada y haz clic en "Grabaciones de la clase".\n3. Copia el link "Enlace - S3" y pégalo aquí:`
        : '\nPégalo aquí:'),
    en: (tabUrl) => "I couldn't find the recording link automatically." +
      (tabUrl
        ? `\n\n1. Open this tab: ${tabUrl}\n2. Find the last completed class and click "Class recordings".\n3. Copy the "Link - S3" link and paste it here:`
        : '\nPaste it here:'),
    ar: (tabUrl) => 'تعذّر العثور على رابط التسجيل تلقائياً.' +
      (tabUrl
        ? `\n\n1. افتح هذه الصفحة: ${tabUrl}\n2. ابحث عن آخر حصة مكتملة وانقر على "تسجيلات الحصة".\n3. انسخ رابط "Enlace - S3" والصقه هنا:`
        : '\nالصقه هنا:'),
    ru: (tabUrl) => 'Не удалось автоматически найти ссылку на запись.' +
      (tabUrl
        ? `\n\n1. Откройте эту вкладку: ${tabUrl}\n2. Найдите последний завершённый урок и нажмите «Записи урока».\n3. Скопируйте ссылку «Enlace - S3» и вставьте её сюда:`
        : '\nВставьте её сюда:'),
    fr: (tabUrl) => "Je n'ai pas pu trouver le lien de l'enregistrement automatiquement." +
      (tabUrl
        ? `\n\n1. Ouvrez cet onglet : ${tabUrl}\n2. Trouvez le dernier cours terminé et cliquez sur « Enregistrements du cours ».\n3. Copiez le lien « Enlace - S3 » et collez-le ici :`
        : '\nCollez-le ici :'),
    tr: (tabUrl) => 'Kayıt bağlantısını otomatik olarak bulamadım.' +
      (tabUrl
        ? `\n\n1. Bu sekmeyi açın: ${tabUrl}\n2. Son tamamlanan dersi bulun ve "Ders kayıtları"na tıklayın.\n3. "Enlace - S3" bağlantısını kopyalayıp buraya yapıştırın:`
        : '\nBuraya yapıştırın:'),
    id: (tabUrl) => 'Saya tidak dapat menemukan tautan rekaman secara otomatis.' +
      (tabUrl
        ? `\n\n1. Buka tab ini: ${tabUrl}\n2. Cari kelas terakhir yang selesai dan klik "Rekaman kelas".\n3. Salin tautan "Enlace - S3" dan tempel di sini:`
        : '\nTempel di sini:'),
    it: (tabUrl) => "Non sono riuscito a trovare automaticamente il link della registrazione." +
      (tabUrl
        ? `\n\n1. Apri questa scheda: ${tabUrl}\n2. Trova l'ultima lezione completata e clicca su "Registrazioni della lezione".\n3. Copia il link "Enlace - S3" e incollalo qui:`
        : '\nIncollalo qui:'),
    pl: (tabUrl) => 'Nie udało się automatycznie znaleźć linku do nagrania.' +
      (tabUrl
        ? `\n\n1. Otwórz tę kartę: ${tabUrl}\n2. Znajdź ostatnią zakończoną lekcję i kliknij "Nagrania z lekcji".\n3. Skopiuj link "Enlace - S3" i wklej go tutaj:`
        : '\nWklej go tutaj:'),
    pt: (tabUrl) => 'Não consegui encontrar o link da gravação automaticamente.' +
      (tabUrl
        ? `\n\n1. Abra esta aba: ${tabUrl}\n2. Encontre a última aula concluída e clique em "Gravações da aula".\n3. Copie o link "Enlace - S3" e cole aqui:`
        : '\nCole aqui:')
  },
  courseNameFallback: {
    es: 'tu curso', en: 'your course', ar: 'دورتك', ru: 'твой курс', fr: 'ton cours',
    tr: 'kursun', id: 'kursusmu', it: 'il tuo corso', pl: 'twój kurs', pt: 'seu curso'
  },
  promptGraduationDate: {
    es: 'Fecha de la graduación:', en: 'Graduation date:', ar: 'تاريخ التخرج:', ru: 'Дата выпускного:',
    fr: 'Date de la remise des diplômes :', tr: 'Mezuniyet tarihi:', id: 'Tanggal kelulusan:',
    it: 'Data del diploma:', pl: 'Data zakończenia kursu:', pt: 'Data da formatura:'
  },
  promptGraduationTime: {
    es: 'Hora de la graduación (hora Colombia):', en: 'Graduation time (Colombia time):',
    ar: 'وقت التخرج (بتوقيت كولومبيا):', ru: 'Время выпускного (по колумбийскому времени):',
    fr: 'Heure de la remise des diplômes (heure de Colombie) :', tr: 'Mezuniyet saati (Kolombiya saatiyle):',
    id: 'Waktu kelulusan (waktu Kolombia):', it: 'Ora del diploma (ora della Colombia):',
    pl: 'Godzina zakończenia kursu (czas kolumbijski):', pt: 'Horário da formatura (horário da Colômbia):'
  }
};

// Look up a UI string in the current message language, falling back to
// Spanish. Entries that are functions are called with the extra
// arguments, so callers can write uiText('scheduleFetchError', 404).
function uiTextForLanguage(key, languageOverride, ...args) {
  const entry = UI_STRINGS[key];
  if (!entry) {
    console.warn(`[UI] Missing UI string: ${key}`);
    return key;
  }
  const requestedLanguage = normalizeMessageLanguage(languageOverride || getMessageLanguage());
  const language = requestedLanguage === 'auto' ? detectPageLanguage() : requestedLanguage;
  const value = entry[language] ?? entry.es ?? entry.en;
  return typeof value === 'function' ? value(...args) : value;
}

function uiText(key, ...args) {
  return uiTextForLanguage(key, getMessageLanguage(), ...args);
}

// Track processed students to avoid duplicate fetches
const processedStudents = new Set();

// Track if processing is in progress
let isProcessingStudents = false;

// Fallback interceptor installer, only used if early-auth-capture.js
// somehow didn't run (should be rare - it's a separate document_start
// content script matching the same pages).
function installAuthTokenInterceptorsFallback() {
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
}

function captureAuthToken() {
  // The fetch/XHR interceptors are normally already installed by
  // early-auth-capture.js at document_start (before this script even runs).
  // Only install them here as a fallback, in case that file somehow didn't run.
  if (!window.__kodlandAuthInterceptorsInstalled) {
    window.__kodlandAuthInterceptorsInstalled = true;
    installAuthTokenInterceptorsFallback();
  }
  
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
// Group general info (backoffice API)
// ---------------------------------------------------------------------
// GET /api/v2/student_groups/{id}/get_general_info_for_group_backoffice_page
// One call gives us, among other things: chat_link (the WhatsApp group
// invite link), group_miro_board_url, group_teacher.full_name,
// predicted_end_date and course.title. We use it mainly to auto-detect the
// WhatsApp link (so the tutor doesn't have to paste it manually), with an
// in-memory cache so we don't hit the API more than needed per group.

const GROUP_INFO_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const groupInfoCache = new Map(); // groupId -> { data, fetchedAt }
const groupInfoInFlight = new Map(); // groupId -> Promise (dedupes concurrent calls)

// Fetch (and cache) the general info blob for a group. Auto-saves chat_link
// into the same localStorage key the manual "paste link" flow reads from,
// so that flow becomes a fallback/correction tool instead of a requirement.
async function fetchGroupGeneralInfo(groupId, { force = false, _retry = false } = {}) {
  if (!groupId) return null;

  if (!force) {
    const cached = groupInfoCache.get(groupId);
    if (cached && (Date.now() - cached.fetchedAt) < GROUP_INFO_CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (groupInfoInFlight.has(groupId)) {
    return groupInfoInFlight.get(groupId);
  }

  const requestPromise = (async () => {
    try {
      const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/get_general_info_for_group_backoffice_page`;

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(apiUrl, { method: 'GET', credentials: 'include', headers });

      if (!response.ok) {
        console.warn(`[Group Info] HTTP ${response.status} fetching general info for group ${groupId}`);
        // The very first call on page load can race the auth token capture
        // (it only fills in once some other authenticated request fires).
        // Give it one retry a few seconds later before giving up.
        if (!_retry) {
          groupInfoInFlight.delete(groupId);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return fetchGroupGeneralInfo(groupId, { force: true, _retry: true });
        }
        return null;
      }

      const data = await response.json();
      groupInfoCache.set(groupId, { data, fetchedAt: Date.now() });

      if (data && data.chat_link) {
        try {
          localStorage.setItem(`kodland_wa_group_link_${groupId}`, data.chat_link);
        } catch (e) {
          // Ignore storage errors (e.g. private mode)
        }
      }

      return data;
    } catch (error) {
      console.error(`[Group Info] Error fetching general info for group ${groupId}:`, error);
      return null;
    } finally {
      groupInfoInFlight.delete(groupId);
    }
  })();

  groupInfoInFlight.set(groupId, requestPromise);
  return requestPromise;
}

// Synchronous read of whatever's cached right now, without triggering a
// fetch. Use fetchGroupGeneralInfo() first (it's cheap once cached).
function getCachedGroupGeneralInfo(groupId) {
  const cached = groupInfoCache.get(groupId);
  return cached ? cached.data : null;
}

// Small convenience getters for other data the endpoint brings along for
// free - ready to wire into templates/UI as needed.
function getGroupMiroBoardUrl(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.group_miro_board_url || null;
}

function getGroupTeacherName(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.group_teacher?.full_name || null;
}

function getGroupPredictedEndDate(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.predicted_end_date || null;
}

// ---------------------------------------------------------------------
// WhatsApp group link
// ---------------------------------------------------------------------
// Auto-detected via fetchGroupGeneralInfo() above (chat_link), which saves
// it into the same localStorage key this reads from. The tutor can still
// paste/correct it manually as a fallback if auto-detection ever fails.

// Get the cached WhatsApp group link for the current group, if any
function getGroupWhatsAppLink(groupIdOverride = null) {
  const groupId = groupIdOverride || extractGroupId();
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
    es: {
      greeting: `Hola ${studentName},`,
      intro: `Aquí está tu resumen semanal, llevamos ya ${lessonsCompleted} lecciones realizadas y tienes ${homeworkPercentage}% de actividades en casa entregadas y ${classPercentage}% de actividades en clase entregadas.`,
      allCompleted: `¡Felicidades! Has completado todas tus actividades. Sigue así, estás haciendo un excelente trabajo.`,
      lowPercentage: `Veo que hay algunas actividades pendientes. No te preocupes, puedes contar con mi apoyo para completarlas. Si deseas mi ayuda para saber cuáles son las actividades y revisarlas, no dudes en contactarme.`,
      regularPercentage: `Estás haciendo un buen progreso. Si deseas mi ayuda para saber cuáles son las actividades y revisarlas, no dudes en contactarme.`
    },
    ar: {
      greeting: `مرحباً ${studentName}،`,
      intro: `إليك ملخصك الأسبوعي: أنجزنا حتى الآن ${arabicCount(lessonsCompleted, ARABIC_LESSON_FORMS)}، وقد سلّمت ${homeworkPercentage}% من الأنشطة المنزلية و${classPercentage}% من الأنشطة الصفية.`,
      allCompleted: `تهانينا! لقد أكملت جميع أنشطتك. واصل على هذا المنوال، فأنت تقوم بعمل ممتاز.`,
      lowPercentage: `ألاحظ وجود بعض الأنشطة المعلّقة. لا تقلق، يمكنك الاعتماد على مساعدتي لإكمالها. وإن أردت أن أوضّح لك ما هي هذه الأنشطة وأن نراجعها معاً، فلا تتردد في التواصل معي.`,
      regularPercentage: `أنت تحرز تقدماً جيداً. وإن أردت أن أوضّح لك ما هي الأنشطة المتبقية وأن نراجعها معاً، فلا تتردد في التواصل معي.`
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
  
  const msg = messages[language] || messages.es;
  
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
  
  // Detect language and path for links
  const detectedLang = getMessageLanguage();
  const langUrlMap = {
    'es': 'es',
    'en': 'en',
    'ru': 'ru',
    'fr': 'fr',
    'tr': 'tr',
    'id': 'id',
    'it': 'it',
    'pl': 'pl',
    'pt': 'pt'
  };
  const langPath = langUrlMap[detectedLang] || 'es';

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
      es: 'Progreso de tareas',
      en: 'Tasks Progress',
      ar: 'تقدّم المهام',
      ru: 'Прогресс заданий',
      fr: 'Progression des tâches',
      tr: 'Görev İlerlemesi',
      id: 'Progres Tugas',
      it: 'Avanzamento compiti',
      pl: 'Postęp zadań',
      pt: 'Progresso das tarefas'
    },
    filters: {
      all: { es: 'Todas', en: 'All', ar: 'الكل', ru: 'Все', fr: 'Toutes', tr: 'Tümü', id: 'Semua', it: 'Tutte', pl: 'Wszystkie', pt: 'Todas' },
      submitted: { es: 'Por Calificar', en: 'To Grade', ar: 'بانتظار التصحيح', ru: 'На проверке', fr: 'À corriger', tr: 'Notlanacak', id: 'Perlu dinilai', it: 'Da valutare', pl: 'Do oceny', pt: 'Para avaliar' },
      checked: { es: 'Revisadas', en: 'Checked', ar: 'مُصحَّحة', ru: 'Проверено', fr: 'Corrigées', tr: 'Kontrol edildi', id: 'Sudah diperiksa', it: 'Corrette', pl: 'Sprawdzone', pt: 'Revisadas' },
      notSubmitted: { es: 'No Enviadas', en: 'Not Submitted', ar: 'غير مُسلَّمة', ru: 'Не отправлено', fr: 'Non envoyées', tr: 'Gönderilmedi', id: 'Belum dikirim', it: 'Non inviate', pl: 'Nie wysłane', pt: 'Não enviadas' },
      submittedLate: { es: 'Enviadas tarde', en: 'Submitted late', ar: 'مُسلَّمة متأخرة', ru: 'Отправлено поздно', fr: 'Envoyées en retard', tr: 'Geç gönderildi', id: 'Terlambat dikirim', it: 'Inviate in ritardo', pl: 'Wysłane po czasie', pt: 'Enviadas tarde' }
    }
  };
  const t = (group, key) => (labels[group]?.[key]?.[detectedLang]) || labels[group]?.[key]?.['es'] || key;

  // Calculate task percentages
  const percentages = calculateTaskPercentages(organizedData);
  
  // Get lessons completed count
  const lessonsCompleted = Object.values(organizedData).reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
  
  // Modal header
  const header = document.createElement('div');
  header.className = 'kodland-modal-header';
  header.innerHTML = `
    <h2>${t('title', detectedLang)} - ${studentName}</h2>
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
        lessonHeader.textContent = uiTextForLanguage('lessonCardHeader', detectedLang, lessonIndex + 1, lesson.id);
        lessonCard.appendChild(lessonHeader);

        // Class tasks section
        if (lesson.classTasks && hasClassTasks) {
          const classTasksSection = document.createElement('div');
          classTasksSection.className = 'kodland-tasks-section kodland-class-tasks';
          classTasksSection.innerHTML = `<h4>${escapeHtml(uiTextForLanguage('classTasksHeading', detectedLang))}</h4>`;

          const classTasksList = renderTasksList(lesson.classTasks, filterStatus, studentId, langPath);
          classTasksSection.appendChild(classTasksList);
          lessonCard.appendChild(classTasksSection);
        }

        // Homework tasks section
        if (lesson.homeworkTasks && hasHomeworkTasks) {
          const homeworkTasksSection = document.createElement('div');
          homeworkTasksSection.className = 'kodland-tasks-section kodland-homework-tasks';
          homeworkTasksSection.innerHTML = `<h4>${escapeHtml(uiTextForLanguage('homeworkTasksHeading', detectedLang))}</h4>`;

          const homeworkTasksList = renderTasksList(lesson.homeworkTasks, filterStatus, studentId, langPath);
          homeworkTasksSection.appendChild(homeworkTasksList);
          lessonCard.appendChild(homeworkTasksSection);
        }

        if (!lesson.classTasks && !lesson.homeworkTasks) {
          lessonCard.innerHTML += `<p class="kodland-no-tasks">${escapeHtml(uiTextForLanguage('noTasksDataAvailable', detectedLang))}</p>`;
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
      body.innerHTML = `<p class="kodland-no-tasks" style="text-align: center; padding: 40px; font-size: 16px;">${escapeHtml(uiTextForLanguage('noTasksMatchFilter', detectedLang))}</p>`;
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
          ar: {
            noStudentData: 'تعذّر الحصول على بيانات الطالب',
            noPhone: 'لم يتم العثور على رقم هاتف ولي الأمر',
            error: 'تعذّر إنشاء الملخص الأسبوعي'
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
        
        const alerts = alertMessages[detectedLang] || alertMessages.es;
        
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
          es: 'Error al generar el resumen semanal',
          en: 'Error generating weekly summary',
          ar: 'تعذّر إنشاء الملخص الأسبوعي',
          ru: 'Ошибка при создании еженедельной сводки',
          fr: 'Erreur lors de la génération du résumé hebdomadaire',
          tr: 'Haftalık özet oluşturulurken hata',
          id: 'Kesalahan saat membuat ringkasan mingguan',
          it: 'Errore durante la generazione del riepilogo settimanale',
          pl: 'Błąd podczas generowania cotygodniowego podsumowania',
          pt: 'Erro ao gerar o resumo semanal'
        };
        alert(alertMessages[detectedLang] || alertMessages.es);
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
function renderTasksList(tasksData, filterStatus = null, studentId = null, langPath = 'es') {
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
      const taskUrl = `https://learn.kodland.org/${langPath}/task/${task.task_id}/check/${studentId}`;
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

  // Reuse the general-info response already fetched for this student (e.g.
  // by processAllStudents when the group page loaded) instead of hitting
  // the same API endpoint a second time. Only fetch if we truly don't have
  // it cached anywhere yet.
  let data = studentGeneralInfoCache[studentId] || null;

  if (!data) {
    data = await fetchStudentInfo(studentId);
    if (data) studentGeneralInfoCache[studentId] = data;
  }

  if (!data) return null;

  try {
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
  } catch (error) {
    console.error(`[Group Students Info] Error extracting credentials for student ${studentId}:`, error);
  }
  
  // If credentials not found, return null to trigger fallback
  return null;
}

// Function to generate the "student didn't connect to class" message.
// Personalized with the student's name, the tutor's name (from settings),
// and the course name. Currently only Spanish text is provided; falls back
// to Spanish for any other detected page language.
function generateAbsenceMessage(language = getMessageLanguage(), { studentName, tutorName, courseName } = {}) {
  const settings = getExtensionSettings();
  const resolvedTutorName = tutorName || settings.tutorName || 'tu tutor';
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

  // Fallback: the XPath is brittle (breaks with layout changes). If it
  // didn't find anything but we already have the group's general info
  // cached (fetched on group page load), use course.title from there -
  // same "[id] Name [year]..." format, so we reuse the same regex.
  const groupId = extractGroupId();
  const cachedInfo = groupId ? getCachedGroupGeneralInfo(groupId) : null;
  const apiCourseTitle = cachedInfo?.course?.title;
  if (apiCourseTitle) {
    const match = apiCourseTitle.match(/\]\s*(.+?)\s*\[/);
    const courseName = match && match[1] ? match[1].trim() : apiCourseTitle;
    console.log('[Group Students Info] Course name from API fallback:', courseName);
    return courseName;
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
        'Portuguese': 'pt'
      };
      
      return langMap[langText] || 'es'; // Default to Spanish
    }
  } catch (error) {
    console.warn('[Group Students Info] Error detecting language:', error);
  }
  
  // Fallback: check document language
  const htmlLang = document.documentElement.lang || 'es';
  return htmlLang.substring(0, 2).toLowerCase();
}

// Function to get button tooltips based on language
function getButtonTooltips(language = getMessageLanguage()) {
  const tooltips = {
    'es': {
      openWA: 'Abrir WhatsApp',
      welcomeMessage: 'Mensaje de Bienvenida',
      modulesProgress: 'Progreso de Módulos'
    },
    'ar': {
      openWA: 'فتح واتساب',
      welcomeMessage: 'رسالة الترحيب',
      modulesProgress: 'تقدّم الوحدات'
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
  
  return tooltips[language] || tooltips['es'];
}

// Function to create welcome message with credentials
function createWelcomeMessage(studentName, credentials, courseName = '', language = getMessageLanguage()) {
  // credentials can be an object with username/password or a formatted string
  const credentialLabels = {
    es: (c) => `Usuario: ${c.username}\nContraseña: ${c.password}`,
    en: (c) => `Username: ${c.username}\nPassword: ${c.password}`,
    ar: (c) => `اسم المستخدم: ${c.username}\nكلمة المرور: ${c.password}`,
    ru: (c) => `Пользователь: ${c.username}\nПароль: ${c.password}`,
    fr: (c) => `Nom d'utilisateur : ${c.username}\nMot de passe : ${c.password}`,
    tr: (c) => `Kullanıcı adı: ${c.username}\nŞifre: ${c.password}`,
    id: (c) => `Nama pengguna: ${c.username}\nKata sandi: ${c.password}`,
    it: (c) => `Nome utente: ${c.username}\nPassword: ${c.password}`,
    pl: (c) => `Nazwa użytkownika: ${c.username}\nHasło: ${c.password}`,
    pt: (c) => `Usuário: ${c.username}\nSenha: ${c.password}`
  };
  const credsText = typeof credentials === 'object' && credentials.formatted
    ? credentials.formatted
    : (typeof credentials === 'object' && credentials.username && credentials.password
      ? (credentialLabels[language] || credentialLabels.es)(credentials)
      : credentials);
  
  // Use emojis as Unicode code points to ensure proper encoding
  // 👋 = U+1F44B, 🚀 = U+1F680
  // Convert to actual emoji characters
  const waveEmoji = String.fromCodePoint(0x1F44B); // 👋
  const rocketEmoji = String.fromCodePoint(0x1F680); // 🚀
  
  // Messages in different languages
  const messages = {
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
  
  // Map language codes to URL paths
  const langUrlMap = {
    'es': 'es',
    'en': 'en',
    'ru': 'ru',
    'fr': 'fr',
    'tr': 'tr',
    'id': 'id',
    'it': 'it',
    'pl': 'pl',
    'pt': 'pt'
  };
  
  // Get URL path for current language, default to Spanish
  const langPath = langUrlMap[language] || 'es';
  const loginUrl = `https://learn.kodland.org/${langPath}/auth`;
  
  // Get message for current language, fallback to Spanish
  const msg = messages[language] || messages['es'];
  
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
  if (!h3) return 'Estudiante';
  const clone = h3.cloneNode(true);
  const countrySpan = clone.querySelector('.kodland-country-initials');
  if (countrySpan) countrySpan.remove();
  return clone.textContent.trim() || 'Estudiante';
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

// Find the very LAST lesson (the final class, often graduation day) from
// schedule data - the latest by date. Used to suggest a default date/time
// for the graduation broadcast message.
function findLastLesson(scheduleData) {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
    return null;
  }

  const withTime = scheduleData.filter(lesson => lesson.timetable_time);
  if (withTime.length === 0) return null;

  return withTime.reduce((latest, lesson) =>
    new Date(lesson.timetable_time) > new Date(latest.timetable_time) ? lesson : latest
  );
}

// Find the most recent lesson that has ALREADY happened (as opposed to
// findLastLesson, which finds the last lesson of the whole course by date,
// even if that's still in the future). This is what "grabación de la
// última clase" actually means.
function findMostRecentPastLesson(scheduleData) {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
    return null;
  }

  const now = Date.now();
  const pastLessons = scheduleData.filter(lesson =>
    lesson.timetable_time && new Date(lesson.timetable_time).getTime() <= now
  );
  if (pastLessons.length === 0) return null;

  return pastLessons.reduce((latest, lesson) =>
    new Date(lesson.timetable_time) > new Date(latest.timetable_time) ? lesson : latest
  );
}

async function fetchLastPastLessonForGroup(groupId) {
  try {
    const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/schedule_view/`;
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await fetch(apiUrl, { method: 'GET', credentials: 'include', headers });
    if (!response.ok) return null;

    const scheduleData = await response.json();
    return findMostRecentPastLesson(scheduleData);
  } catch (error) {
    console.error(`[Schedule] Error fetching last past lesson for group ${groupId}:`, error);
    return null;
  }
}

// The recording link isn't part of the schedule_view API response - it
// lives in the "Horario" tab's UI (?tab=2 on the group page). Each
// completed lesson row has a "Grabaciones de la clase" toggle
// (.zoom-records-cell a) that expands a card showing either an
// "Enlace - S3" link or a "No hay grabaciones disponibles" message.
//
// If that tab happens to already be rendered in the page (the tutor
// visited it earlier this session and Vue kept it mounted), we can read
// it directly instead of making the tutor go find it by hand.
async function scrapeRecordingLinkFromScheduleDOM() {
  const rows = Array.from(document.querySelectorAll('.schedule-slot'));
  if (rows.length === 0) return null; // schedule tab isn't rendered right now

  // Completed lessons only, most recent first (rows are in chronological
  // order in the DOM, so reversing gives us newest-first).
  const completedRows = rows.filter(row => {
    const statusBtn = row.querySelector('.classroom-cell button');
    return statusBtn && /completado/i.test(statusBtn.textContent || '');
  }).reverse();

  for (const row of completedRows) {
    const recordsToggle = row.querySelector('.zoom-records-cell a');
    const expansionCard = row.nextElementSibling;
    if (!recordsToggle || !expansionCard) continue;

    const isCollapsed = () =>
      expansionCard.style.display === 'none' || getComputedStyle(expansionCard).display === 'none';

    if (isCollapsed()) {
      recordsToggle.click();
      for (let i = 0; i < 15 && isCollapsed(); i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // The card can become visible before Vue has actually populated its
    // contents, so poll briefly for either a real link or the "no
    // recordings" message before deciding this lesson has nothing.
    let link = null;
    let confirmedEmpty = false;
    for (let i = 0; i < 15; i++) {
      const anchor = expansionCard.querySelector('.record-list a[href]');
      if (anchor) { link = anchor.href; break; }
      if (expansionCard.querySelector('.no-records-message')) { confirmedEmpty = true; break; }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (link) return link;
    if (confirmedEmpty) continue; // this lesson has none - try the previous one
  }

  return null;
}

// Kept as a cheap secondary check in case Kodland ever starts including
// the recording link directly in the schedule_view API response.
function extractRecordingLinkFromLesson(lesson) {
  if (!lesson) return null;
  const candidates = [
    lesson.zoom_recording_url,
    lesson.recording_url,
    lesson.record_url,
    lesson.records_url,
    lesson.video_url,
    lesson.class_record_url,
    lesson.lesson_record_url,
    lesson.zoom_record_url
  ];
  const found = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
  return found ? found.trim() : null;
}

// Resolves the recording link for the group's last past lesson: first
// tries reading it straight out of the "Horario" tab's DOM (if it's
// already rendered), then a couple of long-shot API field names, and
// finally asks the tutor to paste it - with exact directions to where it
// lives - so the button still works even when auto-detection fails.
async function getLastClassRecordingLink(groupId) {
  let link = await scrapeRecordingLinkFromScheduleDOM().catch(() => null);

  const lastPastLesson = groupId ? await fetchLastPastLessonForGroup(groupId) : null;

  if (!link) {
    link = extractRecordingLinkFromLesson(lastPastLesson);
  }

  if (!link) {
    const tabUrl = groupId ? `https://bo.kodland.org/groups/${groupId}?tab=2` : null;
    const instructions = uiText('promptRecordingLinkInstructions', tabUrl);
    const pasted = prompt(instructions);
    link = pasted ? pasted.trim() : null;
  }

  return { link: link || null, lesson: lastPastLesson };
}

async function fetchLastLessonForGroup(groupId) {
  try {
    const apiUrl = `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/schedule_view/`;
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await fetch(apiUrl, { method: 'GET', credentials: 'include', headers });
    if (!response.ok) return null;

    const scheduleData = await response.json();
    return findLastLesson(scheduleData);
  } catch (error) {
    console.error(`[Schedule] Error fetching last lesson for group ${groupId}:`, error);
    return null;
  }
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
    'PL': 'Europe/Warsaw'
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
function formatDateForCountry(dateTimeString, countryCode, language = 'es') {
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
    'PL': 'pl-PL'
  };
  
  const locale = localeMap[countryCode] || (language === 'es' ? 'es-ES' : 'en-US');
  
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
    es: {
      minutes: (m) => m === 1 ? '1 minuto' : `${m} minutos`,
      hours: (h) => h === 1 ? '1 hora' : `${h} horas`,
      hoursMinutes: (h, m) => {
        if (h === 0) return m === 1 ? '1 minuto' : `${m} minutos`;
        if (m === 0) return h === 1 ? '1 hora' : `${h} horas`;
        return `${h} ${h === 1 ? 'hora' : 'horas'} y ${m} ${m === 1 ? 'minuto' : 'minutos'}`;
      }
    },
    ar: {
      minutes: (m) => arabicCount(m, ARABIC_MINUTE_FORMS),
      hours: (h) => arabicCount(h, ARABIC_HOUR_FORMS),
      hoursMinutes: (h, m, msg) => {
        if (h === 0) return msg.minutes(m);
        if (m === 0) return msg.hours(h);
        return `${msg.hours(h)} و${msg.minutes(m)}`;
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
  
  const msg = messages[language] || messages.es;
  
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
const JOIN_LINK_LABELS = {
  es: 'Por el siguiente enlace:',
  en: 'Via the following link:',
  ar: 'عبر الرابط التالي:',
  ru: 'По следующей ссылке:',
  fr: 'Via le lien suivant :',
  tr: 'Aşağıdaki bağlantı üzerinden:',
  id: 'Melalui tautan berikut:',
  it: 'Tramite il seguente link:',
  pl: 'Poprzez poniższy link:',
  pt: 'Pelo seguinte link:'
};

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
      es: `Hola ${parentName}, te recordamos que nuestra clase número ${lessonNumber} ya empezó.`,
      en: `Hello ${parentName}, we remind you that our class number ${lessonNumber} has already started.`,
      ar: `مرحباً ${parentName}، نذكّرك بأن حصتنا رقم ${lessonNumber} قد بدأت بالفعل.`,
      ru: `Привет ${parentName}, напоминаем, что наш урок номер ${lessonNumber} уже начался.`,
      fr: `Bonjour ${parentName}, nous vous rappelons que notre cours numéro ${lessonNumber} a déjà commencé.`,
      tr: `Merhaba ${parentName}, ${lessonNumber} numaralı dersimizin başladığını hatırlatıyoruz.`,
      id: `Halo ${parentName}, kami mengingatkan bahwa kelas nomor ${lessonNumber} sudah dimulai.`,
      it: `Ciao ${parentName}, ti ricordiamo che la nostra lezione numero ${lessonNumber} è già iniziata.`,
      pl: `Cześć ${parentName}, przypominamy, że nasza lekcja numer ${lessonNumber} już się rozpoczęła.`,
      pt: `Olá ${parentName}, lembramos que nossa aula número ${lessonNumber} já começou.`
    };

    let message = messages[language] || messages.es;
    if (zoomLink) {
      message += `\n\n${JOIN_LINK_LABELS[language] || JOIN_LINK_LABELS.es}\n${zoomLink}`;
    }
    return message;
  }
  
  if (isToday) {
    // Class is today - show time remaining
    const timeRemaining = calculateTimeRemaining(lessonTimeMs, nowTime);
    const timeText = formatTimeRemaining(timeRemaining, language);
    
    const messages = {
      es: `Hola ${parentName}, nos vemos en ${timeText}.`,
      en: `Hello ${parentName}, see you in ${timeText}.`,
      ar: `مرحباً ${parentName}، نراك بعد ${timeText}.`,
      ru: `Привет ${parentName}, увидимся через ${timeText}.`,
      fr: `Bonjour ${parentName}, à bientôt dans ${timeText}.`,
      tr: `Merhaba ${parentName}, ${timeText} içinde görüşürüz.`,
      id: `Halo ${parentName}, sampai jumpa dalam ${timeText}.`,
      it: `Ciao ${parentName}, ci vediamo tra ${timeText}.`,
      pl: `Cześć ${parentName}, do zobaczenia za ${timeText}.`,
      pt: `Olá ${parentName}, nos vemos em ${timeText}.`
    };

    let message = messages[language] || messages.es;
    if (zoomLink) {
      message += `\n\n${JOIN_LINK_LABELS[language] || JOIN_LINK_LABELS.es}\n${zoomLink}`;
    }
    return message;
  }
  
  // Class is tomorrow or later - general reminder
  const formattedDate = formatDateForCountry(lesson.timetable_time, countryCode, language);
  
  const messages = {
    es: {
      tomorrow: `Hola ${parentName}, te recordamos que mañana tenemos nuestra clase número ${lessonNumber + 1}. No olvides revisar tus actividades y si tienes dudas me puedes escribir.`,
      later: `Hola ${parentName}, te recordamos que el ${formattedDate} tenemos nuestra clase número ${lessonNumber + 1}. No olvides revisar tus actividades y si tienes dudas me puedes escribir.`
    },
    ar: {
      tomorrow: `مرحباً ${parentName}، نذكّرك بأن غداً موعد حصتنا رقم ${lessonNumber + 1}. لا تنسَ مراجعة أنشطتك، وإن كان لديك أي سؤال يمكنك مراسلتي.`,
      later: `مرحباً ${parentName}، نذكّرك بأن يوم ${formattedDate} موعد حصتنا رقم ${lessonNumber + 1}. لا تنسَ مراجعة أنشطتك، وإن كان لديك أي سؤال يمكنك مراسلتي.`
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
  
  const msg = messages[language] || messages.es;
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

// Format a lesson's date/time in Spanish, Colombia timezone, e.g.
// { dayName: 'viernes', fullDate: '19 de junio de 2026', time: '16:00' }
function formatLessonDateForMessage(isoDateStr) {
  try {
    const date = new Date(isoDateStr);

    const dayName = new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: 'America/Bogota' }).format(date);
    const dayNum = new Intl.DateTimeFormat('es-CO', { day: 'numeric', timeZone: 'America/Bogota' }).format(date);
    const month = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'America/Bogota' }).format(date);
    const year = new Intl.DateTimeFormat('es-CO', { year: 'numeric', timeZone: 'America/Bogota' }).format(date);
    const time = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Bogota' }).format(date);

    return {
      dayName,
      fullDate: `${dayNum} de ${month} de ${year}`,
      time
    };
  } catch (error) {
    console.warn('[formatLessonDateForMessage] Error formatting date:', error);
    return null;
  }
}

// Build the full welcome message using the tutor's exact script.
// NOTE: edit `tutorName` below if a different tutor uses this extension.
function createFullWelcomeMessage({ studentName, courseName, waGroupLink, wonderLoginUrl, username, password, lessonDateInfo }) {
  const settings = getExtensionSettings();
  const tutorName = settings.tutorName || 'TL Camilo Bermudez';
  const language = getMessageLanguage();

  const scheduleLine = lessonDateInfo
    ? uiText('scheduleLine', { dayName: lessonDateInfo.dayName, fullDate: lessonDateInfo.fullDate, time: lessonDateInfo.time, timezoneLabel: 'Colombia' })
    : uiText('scheduleLineSoon');

  const waLine = waGroupLink || uiText('waGroupLinkMissing');

  const template = getResolvedWelcomeTemplate(language, settings);

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
      const label = lessonLabelMap[String(lessonId)] || `Lección ${i + batchIndex + 1}`;
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

  // Same URL pattern used by the per-student tasks modal
  const langUrlMap = { es: 'es', en: 'en', ru: 'ru', fr: 'fr', tr: 'tr', id: 'id', it: 'it', pl: 'pl', pt: 'pt' };
  const langPath = langUrlMap[getMessageLanguage()] || 'es';

  const rowsHtml = withPending.length === 0
    ? `<p class="kodland-no-tasks">${escapeHtml(uiText('gradingNobodyPending'))}</p>`
    : withPending.map(r => {
        const tasksList = r.pendingGradingTasks
          .map(t => {
            const link = t.taskId
              ? `<a class="kodland-task-link" href="https://learn.kodland.org/${langPath}/task/${t.taskId}/check/${r.studentId}" target="_blank" rel="noopener noreferrer">${escapeHtml(uiText('gradeTaskLink'))}</a>`
              : '';
            return `<div class="kodland-task-item"><div class="kodland-task-info"><span class="kodland-task-name">${t.label}: ${t.name}</span>${link}</div></div>`;
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

// All floating action buttons (broadcast + settings + export + grading
// report + WA link + attendance) now live together in this single toolbar
// fixed to the top of the page, instead of being scattered as separate
// stacked pill buttons. Every inject*Button() function below fetches (or
// creates, if it's the first one to run) this shared wrapper and appends
// its button to it.
function getOrCreateToolbar() {
  let wrapper = document.getElementById('kodland-broadcast-buttons');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'kodland-broadcast-buttons';
    wrapper.className = 'kodland-broadcast-buttons';
    document.body.appendChild(wrapper);

    // The toolbar is `position: fixed`, so it floats ON TOP of the page
    // instead of pushing it down. With only a handful of buttons that was
    // barely noticeable, but now that it can hold up to 9 buttons (and
    // wrap into 2-3 rows on smaller screens) it was tall enough to cover
    // the first row of students on the group page. Keep body padding in
    // sync with the toolbar's real rendered height so nothing ends up
    // hidden underneath it.
    const adjustBodyPadding = () => {
      const height = wrapper.offsetHeight;
      document.body.style.paddingTop = height > 0 ? `${height + 16}px` : '';
    };
    adjustBodyPadding();
    // Re-measure whenever the toolbar's own size changes (buttons
    // shown/hidden via settings, or it wraps to more/fewer rows on resize).
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(adjustBodyPadding).observe(wrapper);
    } else {
      window.addEventListener('resize', adjustBodyPadding);
    }
  }
  return wrapper;
}

// Inject the floating "Group grading report" button
function injectGroupGradingReportButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showGroupGradingReport) return;
  if (document.getElementById('kodland-grading-report-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-grading-report-button';
  button.className = 'kodland-toolbar-btn kodland-grading-report-btn';
  button.innerHTML = escapeHtml(uiText('gradingReportButton'));
  button.setAttribute('title', uiText('gradingReportTooltip'));

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

  getOrCreateToolbar().appendChild(button);
  console.log('[Group Students Info] ✅ Botón "Reporte calificación" inyectado');
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
    loadingElement.innerHTML = '⏳ Loading...';
    container.appendChild(loadingElement);
    return;
  }
  
  // Extract parent information
  const parentName = studentData.parent_name || 
                     studentData.parent?.name || 
                     studentData.parent_name_full ||
                     'Parent';
  
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
      alert(uiText('noPhoneForStudent'));
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
        console.warn(`[Group Students Info] ⚠️ No se pudo obtener el link de acceso personalizado para ${studentId}`);
      }
      
      // Get the cached WhatsApp group link for this course
      const waGroupLink = getGroupWhatsAppLink();
      if (!waGroupLink) {
        console.warn('[Group Students Info] ⚠️ No hay link de WhatsApp del grupo guardado todavía');
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

        const message = uiText('taskReportMessage', { studentName, tutorName, courseName, taskListText, waveEmoji, smileEmoji });

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

  // Button: send the recording link of the last (already happened) class
  // straight to this student's parent via WhatsApp.
  if (getExtensionSettings().showRecordingButton) {
    const recordingButton = document.createElement('button');
    recordingButton.className = 'kodland-wa-btn kodland-recording-btn';
    recordingButton.setAttribute('title', uiText('recordingButtonTooltip'));
    recordingButton.setAttribute('aria-label', uiText('recordingButtonTooltip'));
    recordingButton.innerHTML = `🎥`;

    recordingButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (!formattedPhone) {
        alert(uiText('noPhoneForStudent'));
        return;
      }

      recordingButton.disabled = true;
      const originalHtml = recordingButton.innerHTML;
      recordingButton.innerHTML = `⏳`;

      try {
        const groupId = extractGroupId();
        const { link: recordingLink } = await getLastClassRecordingLink(groupId);

        if (!recordingLink) {
          alert(uiText('noRecordingLinkSent'));
          return;
        }

        const studentName = extractStudentName(container);
        const courseName = findCourseName() || uiText('courseNameFallback');
        const settings = getExtensionSettings();

        const message = renderTemplate(getResolvedRecordingStudentTemplate(getMessageLanguage(), settings), {
          studentName,
          courseName,
          tutorName: settings.tutorName,
          recordingLink
        });

        const encodedMessage = encodeMessageForWhatsApp(message);
        const phoneForUrl = formattedPhone.replace(/^\+/, '');
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
        console.log(`[Group Students Info] Enviando link de grabación a: ${formattedPhone}`);
        window.open(whatsappUrl, '_blank');
      } finally {
        recordingButton.disabled = false;
        recordingButton.innerHTML = originalHtml;
      }
    });

    buttonsContainer.appendChild(recordingButton);
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
const DEFAULT_WELCOME_TEMPLATE = `Hola {{studentName}} 👋
Un cordial saludo. Mi nombre es {{tutorName}} y seré tu tutor en la clase de {{courseName}}, {{scheduleLine}}. Estamos muy contentos de que formes parte de esta experiencia en Kodland. Para estar listos para nuestra primera clase, por favor sigue estos pasos:
🔹 Únete al grupo oficial de WhatsApp, donde compartiremos el enlace de la clase por Zoom y toda la información importante: 👉{{waGroupLink}}
🔹 Aquí tienes tu acceso personalizado a la plataforma Kodland:
• Enlace de acceso directo: {{wonderLoginUrl}}
Inicio de sesión: {{username}}
Contraseña: {{password}}
Estoy aquí para ayudarte en todo lo que necesites. ¡Nos vemos pronto!
Un saludo,
{{tutorName}}
Tutor de {{courseName}}`;

const DEFAULT_ABSENCE_TEMPLATE = `Hola {{studentName}} 👋, soy {{tutorName}}, tu tutor de {{courseName}} en Kodland.
Ya estamos iniciando nuestra clase de hoy y he notado que aún no te has conectado. ¿Vas a asistir a la sesión? 🕒
Si tienes algún inconveniente técnico para ingresar a la plataforma, por favor avísame de inmediato para ayudarte. Recuerda que si no logras conectarte en vivo, es muy importante que revises la grabación de la clase en tu panel de estudiante para que no te quedes atrás con el proyecto que estamos trabajando.
¡Te esperamos en la sala! 😊`;

// Broadcast messages, meant to be sent to the WHATSAPP GROUP (not to a
// single student), copied to clipboard and opened via the group chat link.

const DEFAULT_CLASS_STARTING_TEMPLATE = `¡Hola a todos! 👋
Hoy nos espera una nueva clase de {{courseName}} a las {{time}} (hora Colombia).
🚀 Nos vemos directo en la Plataforma de Kodland, como siempre. ¡Entren con toda la energía! 💻
Si alguien tiene algún detalle con su entrada, escríbanme por aquí rápido. 🔑
¡Nos vemos en un rato! 🔥
{{tutorName}}`;

const DEFAULT_IN_CLASS_TEMPLATE = `¡Hola a todos! 😊
¡Ya estoy listo en nuestra aula dentro de la Plataforma de Kodland para empezar nuestra clase de {{courseName}}! 🚀
Entren ahora mismo para que podamos comenzar. Si alguien tiene algún inconveniente con sus accesos, escríbeme por privado y lo solucionamos de inmediato. 🔑
¡Los espero con muchas ganas de crear y aprender juntos! 🎉
{{tutorName}}`;

const DEFAULT_GRADUATION_TEMPLATE = `🎉 ¡Hola, queridos padres y alumnos!
Estamos llegando al final de nuestro camino en el curso de {{courseName}} y nos preparamos para nuestra gran Lección de Graduación.
📅 Fecha: {{gradDate}}
⏰ Hora: {{gradTime}} (Hora Colombia)
✨ Invitación: Todos los padres y familiares están cordialmente invitados a celebrar el esfuerzo de los chicos.
🌟 ¿Qué haremos en la graduación?
• Resultados del curso: un resumen de los temas y objetivos alcanzados durante el curso.
• Presentación de proyectos: cada estudiante compartirá su creación final. ¡Han hecho un trabajo increíble!
• Orientación personalizada: comentarios sobre el desempeño de cada alumno y consejos para seguir aprendiendo.
🧑‍💻 Preparativos importantes para los estudiantes:
• Revisar y completar las últimas actividades pendientes en la plataforma antes de la clase.
• Preparar su fondo virtual de graduación para la videollamada: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Elegir qué proyecto van a presentar (su mejor trabajo o portafolio del curso).
⏱ Cada estudiante tendrá unos minutos para su presentación.
🕒 La clase será en el horario habitual, con este enfoque especial de celebración. La asistencia de todos es muy importante, ya que es el espacio donde los alumnos cierran su ciclo y validan lo aprendido.
Si por algún motivo de fuerza mayor no pueden asistir, por favor házmelo saber con antelación.
¡Nos vemos en clase para celebrar su talento! 💙
Equipo Kodland
Tutor: {{tutorName}}`;

const DEFAULT_GROUP_WELCOME_TEMPLATE = `👋✨ ¡Hola a todos!
Bienvenidos al curso de {{courseName}}. Estoy muy emocionado de comenzar este viaje con ustedes, donde aprenderemos y construiremos proyectos que combinan creatividad, funcionalidad y estilo.
En este espacio, la imaginación y las ganas de aprender serán nuestras herramientas principales. Exploraremos nuevos temas, experimentaremos con ideas y daremos vida a proyectos únicos que reflejen su talento.
🚀 Estoy seguro de que será el inicio de una gran experiencia, donde podrán desarrollar habilidades útiles y divertirse aprendiendo.
📩 Por favor, revisen su correo electrónico, allí encontrarán sus credenciales de acceso para iniciar sesión en la plataforma de Kodland.
💻✨ ¡Prepárense para aprender, crear y dejar su huella!
{{tutorName}}`;

const DEFAULT_FIRST_CLASS_TEMPLATE = `🎉 ¡Bienvenidos a su primera clase de {{courseName}} en Kodland! 🎉
¡Hola chicos y chicas! Estoy muy emocionado de darles la bienvenida oficial a este nuevo curso, donde aprenderemos cosas increíbles combinando creatividad, tecnología y mucho entusiasmo. 🌐✨
Hoy comienza una aventura en la que ustedes serán los protagonistas. En cada clase exploraremos nuevas herramientas y formas de expresión para dar vida a sus ideas. No se preocupen si es su primera vez en este tipo de curso, ¡vamos a aprender paso a paso y a disfrutar el proceso! 🚀
🚨 Recordatorio Importante: Nos vemos en la plataforma 🚨
Les recuerdo que para nuestra clase de HOY a las {{time}} (hora Colombia), nos conectaremos directamente a través de la plataforma de Kodland.
Esta es nuestra primera clase juntos, así que no se preocupen si tienen dudas de cómo nos manejamos en el aula virtual… ¡estamos aquí para disfrutar y crecer juntos paso a paso!
🛠️ Antes de que empiece la clase, asegúrate de esto:
✅ ¿Ya probaste entrar? Inicia sesión en la plataforma con las credenciales que recibieron por correo electrónico. Hazlo un momento antes para confirmar que todo esté en orden y no perder valiosos minutos de clase.
📖 ¿Dudas de cómo ingresar? Aquí tienes el instructivo a la mano por si necesitas refrescar los pasos: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 ¿Problemas con tus datos? Si has revisado tu bandeja de entrada y aun así no has podido ingresar con tus credenciales, escríbeme YA MISMO por privado para ayudarte a solucionarlo.
⚠️ Requisito clave: Para que todas las herramientas funcionen a la perfección, asegúrense de entrar usando el navegador Google Chrome. 🌐
✨ No olviden traer su creatividad, curiosidad y entusiasmo. ¡Estoy muy feliz de ser su profe y acompañarlos en este viaje de aprendizaje!
¡Nos vemos en un rato dentro de la plataforma! 🔥🙌
💡 ¡Vamos a construir cosas increíbles juntos! 🌐🚀
{{tutorName}}`;

const DEFAULT_RECORDING_STUDENT_TEMPLATE = `🎥 ¡Hola {{studentName}}!
Te comparto la grabación de nuestra última clase de {{courseName}}, por si quieres repasar algo o no pudiste conectarte en vivo:
🔗 {{recordingLink}}
Cualquier duda que te quede, aquí estoy para ayudarte. ¡Sigamos avanzando! 🚀
{{tutorName}}`;

const DEFAULT_RECORDING_GROUP_TEMPLATE = `🎥 ¡Hola a todos!
Les comparto la grabación de nuestra última clase de {{courseName}}, por si quieren repasar algo o alguien no pudo conectarse en vivo:
🔗 {{recordingLink}}
Cualquier duda, aquí estoy para ayudarles. ¡Sigamos aprendiendo! 🚀
{{tutorName}}`;

// Per-language default templates. Each function returns the Spanish
// constant above for 'es' (or any unrecognized language), and a fully
// translated equivalent for the other 9 supported languages - used both
// to prefill the settings textarea when the tutor picks a language for
// the first time, and by each "Reset" button in Configuración.
function getDefaultWelcomeTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_WELCOME_TEMPLATE,
    en: `Hello {{studentName}} 👋
Warm greetings! My name is {{tutorName}} and I'll be your tutor for the {{courseName}} class, {{scheduleLine}}. We're very happy to have you as part of this experience at Kodland. To be ready for our first class, please follow these steps:
🔹 Join the official WhatsApp group, where we'll share the Zoom class link and all the important information: 👉{{waGroupLink}}
🔹 Here is your personalized access to the Kodland platform:
• Direct access link: {{wonderLoginUrl}}
Username: {{username}}
Password: {{password}}
I'm here to help you with anything you need. See you soon!
Best regards,
{{tutorName}}
{{courseName}} Tutor`,
    ar: `مرحباً {{studentName}} 👋
تحية طيبة. اسمي {{tutorName}} وسأكون معلمك في حصة {{courseName}}، {{scheduleLine}}. يسعدنا كثيراً انضمامك إلى هذه التجربة في Kodland. لنكون جاهزين لحصتنا الأولى، يرجى اتباع هذه الخطوات:
🔹 انضم إلى مجموعة WhatsApp الرسمية، حيث سنشارك رابط الحصة عبر Zoom وجميع المعلومات المهمة: 👉{{waGroupLink}}
🔹 إليك بيانات دخولك الخاصة إلى منصة Kodland:
• رابط الدخول المباشر: {{wonderLoginUrl}}
اسم المستخدم: {{username}}
كلمة المرور: {{password}}
أنا هنا لمساعدتك في كل ما تحتاجه. أراك قريباً!
مع خالص التحية،
{{tutorName}}
معلم {{courseName}}`,
    ru: `Привет, {{studentName}} 👋
Сердечно приветствуем тебя! Меня зовут {{tutorName}}, и я буду вести твои занятия по курсу {{courseName}}, {{scheduleLine}}. Мы очень рады, что ты с нами в Kodland. Чтобы подготовиться к первому занятию, пожалуйста, выполни следующие шаги:
🔹 Присоединяйся к официальной группе WhatsApp — там мы будем делиться ссылкой на занятие в Zoom и другой важной информацией: 👉{{waGroupLink}}
🔹 Вот твой персональный доступ к платформе Kodland:
• Прямая ссылка для входа: {{wonderLoginUrl}}
Логин: {{username}}
Пароль: {{password}}
Обращайся, если понадобится помощь — я всегда рядом. До скорой встречи!
С наилучшими пожеланиями,
{{tutorName}}
Наставник курса {{courseName}}`,
    fr: `Bonjour {{studentName}} 👋
Un cordial bonjour. Je m'appelle {{tutorName}} et je serai ton tuteur pour le cours de {{courseName}}, {{scheduleLine}}. Nous sommes ravis que tu fasses partie de cette expérience chez Kodland. Pour être prêt pour notre premier cours, merci de suivre ces étapes :
🔹 Rejoins le groupe WhatsApp officiel, où nous partagerons le lien Zoom du cours ainsi que toutes les informations importantes : 👉{{waGroupLink}}
🔹 Voici ton accès personnalisé à la plateforme Kodland :
• Lien d'accès direct : {{wonderLoginUrl}}
Identifiant : {{username}}
Mot de passe : {{password}}
Je suis là pour t'aider avec tout ce dont tu as besoin. À très bientôt !
Bien à toi,
{{tutorName}}
Tuteur de {{courseName}}`,
    tr: `Merhaba {{studentName}} 👋
Sevgiyle selamlıyorum. Ben {{tutorName}}, {{courseName}} dersinde senin öğretmenin olacağım, {{scheduleLine}}. Kodland'daki bu deneyimin bir parçası olduğun için çok mutluyuz. İlk dersimize hazır olmak için lütfen şu adımları izle:
🔹 Zoom üzerinden ders bağlantısını ve tüm önemli bilgileri paylaşacağımız resmi WhatsApp grubuna katıl: 👉{{waGroupLink}}
🔹 İşte Kodland platformuna özel erişim bilgilerin:
• Doğrudan giriş bağlantısı: {{wonderLoginUrl}}
Kullanıcı adı: {{username}}
Şifre: {{password}}
İhtiyacın olan her konuda yardımcı olmak için buradayım. Yakında görüşürüz!
Sevgilerimle,
{{tutorName}}
{{courseName}} Öğretmeni`,
    id: `Halo {{studentName}} 👋
Salam hangat. Nama saya {{tutorName}} dan saya akan menjadi tutormu di kelas {{courseName}}, {{scheduleLine}}. Kami sangat senang kamu menjadi bagian dari pengalaman ini di Kodland. Agar siap untuk kelas pertama kita, silakan ikuti langkah-langkah berikut:
🔹 Bergabunglah dengan grup WhatsApp resmi, tempat kami akan membagikan tautan kelas Zoom dan semua informasi penting: 👉{{waGroupLink}}
🔹 Berikut akses pribadimu ke platform Kodland:
• Tautan akses langsung: {{wonderLoginUrl}}
Nama pengguna: {{username}}
Kata sandi: {{password}}
Aku di sini untuk membantumu kapan pun kamu butuh. Sampai jumpa!
Salam,
{{tutorName}}
Tutor {{courseName}}`,
    it: `Ciao {{studentName}} 👋
Un caro saluto. Mi chiamo {{tutorName}} e sarò il tuo tutor per il corso di {{courseName}}, {{scheduleLine}}. Siamo davvero felici che tu faccia parte di questa esperienza con Kodland. Per essere pronti per la nostra prima lezione, segui questi passaggi:
🔹 Unisciti al gruppo ufficiale WhatsApp, dove condivideremo il link della lezione su Zoom e tutte le informazioni importanti: 👉{{waGroupLink}}
🔹 Ecco il tuo accesso personalizzato alla piattaforma Kodland:
• Link di accesso diretto: {{wonderLoginUrl}}
Nome utente: {{username}}
Password: {{password}}
Sono qui per aiutarti con tutto ciò di cui hai bisogno. A presto!
Cordiali saluti,
{{tutorName}}
Tutor di {{courseName}}`,
    pl: `Cześć {{studentName}} 👋
Serdecznie Cię witam. Nazywam się {{tutorName}} i będę Twoim opiekunem na zajęciach {{courseName}}, {{scheduleLine}}. Bardzo się cieszymy, że jesteś częścią tego doświadczenia w Kodland. Aby przygotować się do naszej pierwszej lekcji, wykonaj proszę poniższe kroki:
🔹 Dołącz do oficjalnej grupy WhatsApp, gdzie będziemy udostępniać link do zajęć na Zoomie oraz wszystkie ważne informacje: 👉{{waGroupLink}}
🔹 Oto Twój spersonalizowany dostęp do platformy Kodland:
• Link do bezpośredniego logowania: {{wonderLoginUrl}}
Login: {{username}}
Hasło: {{password}}
Jestem tu, aby pomóc Ci we wszystkim, czego potrzebujesz. Do zobaczenia wkrótce!
Pozdrawiam,
{{tutorName}}
Opiekun zajęć {{courseName}}`,
    pt: `Olá {{studentName}} 👋
Um caloroso cumprimento. Meu nome é {{tutorName}} e serei seu tutor na aula de {{courseName}}, {{scheduleLine}}. Estamos muito felizes por você fazer parte dessa experiência na Kodland. Para estarmos prontos para nossa primeira aula, siga estes passos:
🔹 Entre no grupo oficial do WhatsApp, onde compartilharemos o link da aula pelo Zoom e todas as informações importantes: 👉{{waGroupLink}}
🔹 Aqui está seu acesso personalizado à plataforma Kodland:
• Link de acesso direto: {{wonderLoginUrl}}
Login: {{username}}
Senha: {{password}}
Estou aqui para te ajudar em tudo o que precisar. Até breve!
Um abraço,
{{tutorName}}
Tutor de {{courseName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_WELCOME_TEMPLATE;
}

function getDefaultAbsenceTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_ABSENCE_TEMPLATE,
    en: `Hello {{studentName}} 👋, this is {{tutorName}}, your {{courseName}} tutor at Kodland.
Our class is starting now and I noticed you haven't connected yet. Will you be joining the session? 🕒
If you're having any technical trouble accessing the platform, please let me know right away so I can help you. Remember, if you can't connect live, it's very important that you watch the class recording on your student dashboard so you don't fall behind on the project we're working on.
We'll be waiting for you in the room! 😊`,
    ar: `مرحباً {{studentName}} 👋، أنا {{tutorName}}، معلمك في {{courseName}} لدى Kodland.
لقد بدأنا حصتنا اليوم ولاحظت أنك لم تنضم بعد. هل ستحضر الجلسة؟ 🕒
إذا واجهت أي مشكلة تقنية في الدخول إلى المنصة، يرجى إعلامي فوراً لمساعدتك. تذكّر أنه إذا لم تتمكن من الانضمام مباشرة، فمن المهم جداً أن تشاهد تسجيل الحصة في لوحة الطالب الخاصة بك حتى لا تتأخر عن المشروع الذي نعمل عليه.
بانتظارك في الغرفة! 😊`,
    ru: `Привет, {{studentName}} 👋, это {{tutorName}}, твой наставник по курсу {{courseName}} в Kodland.
Наше занятие уже началось, а тебя пока нет на связи. Планируешь присоединиться? 🕒
Если возникли технические проблемы со входом на платформу, пожалуйста, сразу дай мне знать — я помогу. Помни: если не получится подключиться в прямом эфире, обязательно посмотри запись занятия в личном кабинете студента, чтобы не отстать от проекта, над которым мы работаем.
Ждём тебя в комнате! 😊`,
    fr: `Bonjour {{studentName}} 👋, je suis {{tutorName}}, ton tuteur de {{courseName}} chez Kodland.
Notre cours vient de commencer et j'ai remarqué que tu n'es pas encore connecté. Vas-tu assister à la session ? 🕒
Si tu rencontres un problème technique pour accéder à la plateforme, préviens-moi immédiatement pour que je puisse t'aider. N'oublie pas que si tu ne parviens pas à te connecter en direct, il est très important de regarder l'enregistrement du cours dans ton espace élève pour ne pas prendre de retard sur le projet en cours.
On t'attend dans la salle ! 😊`,
    tr: `Merhaba {{studentName}} 👋, ben {{tutorName}}, Kodland'daki {{courseName}} öğretmenin.
Bugünkü dersimiz başladı ve henüz bağlanmadığını fark ettim. Derse katılacak mısın? 🕒
Platforma giriş yaparken herhangi bir teknik sorun yaşıyorsan, lütfen hemen bana haber ver, sana yardımcı olayım. Canlı derse bağlanamazsan, üzerinde çalıştığımız projede geride kalmamak için ders kaydını öğrenci panelinden izlemen çok önemli.
Seni sınıfta bekliyoruz! 😊`,
    id: `Halo {{studentName}} 👋, saya {{tutorName}}, tutormu untuk {{courseName}} di Kodland.
Kelas kita hari ini sudah dimulai dan saya melihat kamu belum bergabung. Apakah kamu akan mengikuti sesi ini? 🕒
Jika kamu mengalami kendala teknis untuk masuk ke platform, segera beri tahu saya agar bisa membantu. Ingat, jika kamu tidak bisa bergabung secara langsung, sangat penting untuk menonton rekaman kelas di panel siswamu agar tidak tertinggal dari proyek yang sedang kita kerjakan.
Kami tunggu kamu di ruang kelas! 😊`,
    it: `Ciao {{studentName}} 👋, sono {{tutorName}}, il tuo tutor di {{courseName}} in Kodland.
La nostra lezione di oggi è già iniziata e ho notato che non ti sei ancora collegato. Parteciperai alla sessione? 🕒
Se hai qualche problema tecnico per accedere alla piattaforma, avvisami subito così posso aiutarti. Ricorda che, se non riesci a collegarti in diretta, è molto importante che tu guardi la registrazione della lezione nella tua area studente, per non rimanere indietro con il progetto su cui stiamo lavorando.
Ti aspettiamo in aula! 😊`,
    pl: `Cześć {{studentName}} 👋, tu {{tutorName}}, Twój opiekun zajęć {{courseName}} w Kodland.
Właśnie zaczynamy naszą dzisiejszą lekcję, a widzę, że jeszcze się nie połączyłeś. Czy weźmiesz udział w zajęciach? 🕒
Jeśli masz jakiś problem techniczny z dostępem do platformy, daj mi proszę znać od razu, abym mógł Ci pomóc. Pamiętaj, że jeśli nie uda Ci się połączyć na żywo, koniecznie obejrzyj nagranie lekcji w swoim panelu ucznia, aby nie zostać w tyle z projektem, nad którym pracujemy.
Czekamy na Ciebie w sali! 😊`,
    pt: `Olá {{studentName}} 👋, sou {{tutorName}}, seu tutor de {{courseName}} na Kodland.
Nossa aula de hoje já começou e notei que você ainda não se conectou. Você vai participar da sessão? 🕒
Se estiver tendo algum problema técnico para acessar a plataforma, me avise imediatamente para que eu possa ajudar. Lembre-se de que, se não conseguir se conectar ao vivo, é muito importante assistir à gravação da aula no seu painel de estudante para não ficar para trás no projeto que estamos desenvolvendo.
Esperamos você na sala! 😊`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_ABSENCE_TEMPLATE;
}

function getDefaultClassStartingTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_CLASS_STARTING_TEMPLATE,
    en: `Hi everyone! 👋
Today we have a new {{courseName}} class at {{time}} (Colombia time).
🚀 See you directly on the Kodland Platform, as always. Come in with full energy! 💻
If anyone has any trouble logging in, message me here quickly. 🔑
See you in a bit! 🔥
{{tutorName}}`,
    ar: `مرحباً بالجميع! 👋
تنتظرنا اليوم حصة جديدة من {{courseName}} في تمام الساعة {{time}} (بتوقيت كولومبيا).
🚀 نلتقي مباشرة على منصة Kodland، كالعادة. ادخلوا بكل الطاقة! 💻
إذا واجه أحدكم أي مشكلة في الدخول، فليكتب لي هنا بسرعة. 🔑
أراكم بعد قليل! 🔥
{{tutorName}}`,
    ru: `Всем привет! 👋
Сегодня нас ждёт новое занятие по {{courseName}} в {{time}} (по колумбийскому времени).
🚀 Встречаемся прямо на платформе Kodland, как обычно. Заходите с полной энергией! 💻
Если у кого-то возникнут проблемы со входом, напишите мне сюда как можно скорее. 🔑
Увидимся совсем скоро! 🔥
{{tutorName}}`,
    fr: `Bonjour à tous ! 👋
Aujourd'hui, un nouveau cours de {{courseName}} nous attend à {{time}} (heure de Colombie).
🚀 Rendez-vous directement sur la Plateforme Kodland, comme toujours. Entrez avec toute votre énergie ! 💻
Si quelqu'un a un souci pour se connecter, écrivez-moi ici rapidement. 🔑
À tout à l'heure ! 🔥
{{tutorName}}`,
    tr: `Herkese merhaba! 👋
Bugün saat {{time}}'da (Kolombiya saatiyle) yeni bir {{courseName}} dersimiz var.
🚀 Her zamanki gibi doğrudan Kodland Platformu'nda buluşuyoruz. Tüm enerjinizle gelin! 💻
Girişte sorun yaşayan olursa buradan hemen bana yazsın. 🔑
Birazdan görüşürüz! 🔥
{{tutorName}}`,
    id: `Halo semuanya! 👋
Hari ini kita akan mengikuti kelas baru {{courseName}} pukul {{time}} (waktu Kolombia).
🚀 Sampai jumpa langsung di Platform Kodland, seperti biasa. Masuklah dengan penuh semangat! 💻
Jika ada yang mengalami kendala saat masuk, segera hubungi saya di sini. 🔑
Sampai jumpa sebentar lagi! 🔥
{{tutorName}}`,
    it: `Ciao a tutti! 👋
Oggi ci aspetta una nuova lezione di {{courseName}} alle {{time}} (ora della Colombia).
🚀 Ci vediamo direttamente sulla Piattaforma Kodland, come sempre. Entrate con tutta l'energia! 💻
Se qualcuno ha problemi ad accedere, scrivetemi qui subito. 🔑
Ci vediamo tra poco! 🔥
{{tutorName}}`,
    pl: `Cześć wszystkim! 👋
Dziś czeka nas nowa lekcja {{courseName}} o {{time}} (czas kolumbijski).
🚀 Widzimy się bezpośrednio na Platformie Kodland, jak zawsze. Wchodźcie z pełną energią! 💻
Jeśli ktoś ma jakiś problem z wejściem, niech napisze do mnie tutaj jak najszybciej. 🔑
Do zobaczenia za chwilę! 🔥
{{tutorName}}`,
    pt: `Olá a todos! 👋
Hoje temos uma nova aula de {{courseName}} às {{time}} (horário da Colômbia).
🚀 Nos vemos diretamente na Plataforma Kodland, como sempre. Entrem com toda a energia! 💻
Se alguém tiver algum problema para entrar, escreva para mim aqui rapidinho. 🔑
Até já! 🔥
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_CLASS_STARTING_TEMPLATE;
}

function getDefaultInClassTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_IN_CLASS_TEMPLATE,
    en: `Hi everyone! 😊
I'm already set up in our classroom on the Kodland Platform to start our {{courseName}} class! 🚀
Come in right now so we can get started. If anyone has any trouble accessing it, message me privately and we'll fix it right away. 🔑
I can't wait to create and learn together with you! 🎉
{{tutorName}}`,
    ar: `مرحباً بالجميع! 😊
أنا جاهز الآن في صفنا داخل منصة Kodland لبدء حصة {{courseName}}! 🚀
ادخلوا الآن حتى نتمكن من البدء. إذا واجه أحدكم أي مشكلة في الدخول، فليراسلني بشكل خاص وسنحلها فوراً. 🔑
أنتظركم بشوق كبير لنبدع ونتعلم معاً! 🎉
{{tutorName}}`,
    ru: `Всем привет! 😊
Я уже на месте, в нашем классе на платформе Kodland, чтобы начать занятие по {{courseName}}! 🚀
Заходите прямо сейчас, чтобы мы могли начать. Если у кого-то возникнут проблемы с доступом, напишите мне в личные сообщения, и мы сразу всё решим. 🔑
Жду вас с нетерпением, чтобы вместе творить и учиться! 🎉
{{tutorName}}`,
    fr: `Bonjour à tous ! 😊
Je suis déjà prêt(e) dans notre salle sur la Plateforme Kodland pour commencer notre cours de {{courseName}} ! 🚀
Entrez dès maintenant pour que nous puissions commencer. Si quelqu'un rencontre un problème d'accès, écrivez-moi en privé et nous le réglerons tout de suite. 🔑
J'ai hâte de créer et d'apprendre avec vous ! 🎉
{{tutorName}}`,
    tr: `Herkese merhaba! 😊
{{courseName}} dersimize başlamak için Kodland Platformu'ndaki sınıfımızda hazırım! 🚀
Başlayabilmemiz için hemen giriş yapın. Erişimde sorun yaşayan olursa bana özelden yazsın, hemen çözelim. 🔑
Birlikte üretmek ve öğrenmek için sabırsızlanıyorum! 🎉
{{tutorName}}`,
    id: `Halo semuanya! 😊
Saya sudah siap di kelas kita di Platform Kodland untuk memulai kelas {{courseName}}! 🚀
Silakan masuk sekarang agar kita bisa mulai. Jika ada yang mengalami kendala akses, hubungi saya secara pribadi dan kita akan segera menyelesaikannya. 🔑
Saya sangat menantikan untuk berkarya dan belajar bersama kalian! 🎉
{{tutorName}}`,
    it: `Ciao a tutti! 😊
Sono già pronto/a nella nostra aula sulla Piattaforma Kodland per iniziare la nostra lezione di {{courseName}}! 🚀
Entrate subito così possiamo iniziare. Se qualcuno ha problemi di accesso, scrivetemi in privato e lo risolviamo subito. 🔑
Vi aspetto con tanta voglia di creare e imparare insieme! 🎉
{{tutorName}}`,
    pl: `Cześć wszystkim! 😊
Jestem już gotowy/a w naszej sali na Platformie Kodland, żeby zacząć naszą lekcję {{courseName}}! 🚀
Wchodźcie już teraz, abyśmy mogli zacząć. Jeśli ktoś ma problem z dostępem, niech napisze do mnie prywatnie, a od razu to rozwiążemy. 🔑
Czekam na Was z wielką chęcią, żebyśmy razem tworzyli i uczyli się! 🎉
{{tutorName}}`,
    pt: `Olá a todos! 😊
Já estou pronto(a) em nossa sala dentro da Plataforma Kodland para começar nossa aula de {{courseName}}! 🚀
Entrem agora mesmo para que possamos começar. Se alguém tiver algum problema com o acesso, escreva-me no privado que resolvemos na hora. 🔑
Estou ansioso(a) para criar e aprender juntos! 🎉
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_IN_CLASS_TEMPLATE;
}

function getDefaultGroupWelcomeTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_GROUP_WELCOME_TEMPLATE,
    en: `👋✨ Hi everyone!
Welcome to the {{courseName}} course. I'm really excited to start this journey with you, where we'll learn and build projects that combine creativity, functionality, and style.
In this space, imagination and the drive to learn will be our main tools. We'll explore new topics, experiment with ideas, and bring unique projects to life that reflect your talent.
🚀 I'm sure this will be the start of a great experience, where you'll develop useful skills and have fun while learning.
📩 Please check your email, you'll find your access credentials there to log in to the Kodland platform.
💻✨ Get ready to learn, create, and leave your mark!
{{tutorName}}`,
    ar: `👋✨ مرحبًا بالجميع!
مرحبًا بكم في دورة {{courseName}}. أنا متحمس جدًا لبدء هذه الرحلة معكم، حيث سنتعلم ونبني معًا مشاريع تجمع بين الإبداع والفعالية والأناقة.
في هذا الفضاء، سيكون الخيال والرغبة في التعلم أداتينا الرئيسيتين. سنستكشف مواضيع جديدة، ونجرّب أفكارًا مبتكرة، وننفخ الحياة في مشاريع فريدة تعكس موهبتكم.
🚀 أنا على يقين من أن هذه ستكون بداية تجربة رائعة، ستُمكّنكم من تطوير مهارات مفيدة والاستمتاع أثناء التعلم.
📩 يُرجى تفقّد بريدكم الإلكتروني، ستجدون فيه بيانات الدخول الخاصة بكم لتسجيل الدخول إلى منصة Kodland.
💻✨ استعدوا للتعلم والإبداع وترك بصمتكم!
{{tutorName}}`,
    ru: `👋✨ Всем привет!
Добро пожаловать на курс {{courseName}}. Я очень рад начать это путешествие вместе с вами — мы будем учиться и создавать проекты, сочетающие креативность, функциональность и стиль.
В этом пространстве воображение и желание учиться станут нашими главными инструментами. Мы будем изучать новые темы, экспериментировать с идеями и воплощать в жизнь уникальные проекты, отражающие ваш талант.
🚀 Я уверен, что это станет началом отличного опыта, в котором вы сможете развить полезные навыки и получить удовольствие от обучения.
📩 Пожалуйста, проверьте свою электронную почту — там вы найдёте данные для входа на платформу Kodland.
💻✨ Готовьтесь учиться, творить и оставить свой след!
{{tutorName}}`,
    fr: `👋✨ Bonjour à tous !
Bienvenue dans le cours de {{courseName}}. Je suis très heureux de commencer ce voyage avec vous, où nous apprendrons et construirons des projets qui allient créativité, fonctionnalité et style.
Dans cet espace, l'imagination et l'envie d'apprendre seront nos principaux outils. Nous explorerons de nouveaux sujets, expérimenterons des idées et donnerons vie à des projets uniques qui reflètent votre talent.
🚀 Je suis certain que ce sera le début d'une belle expérience, où vous pourrez développer des compétences utiles tout en vous amusant à apprendre.
📩 Merci de vérifier votre boîte mail, vous y trouverez vos identifiants pour vous connecter à la plateforme Kodland.
💻✨ Préparez-vous à apprendre, créer et laisser votre empreinte !
{{tutorName}}`,
    tr: `👋✨ Herkese merhaba!
{{courseName}} kursuna hoş geldiniz. Sizinle birlikte bu yolculuğa başlamaktan çok heyecanlıyım; birlikte öğrenecek ve yaratıcılığı, işlevselliği ve stili bir araya getiren projeler geliştireceğiz.
Bu alanda hayal gücü ve öğrenme isteği en önemli araçlarımız olacak. Yeni konuları keşfedecek, fikirlerle deney yapacak ve yeteneğinizi yansıtan özgün projelere hayat vereceğiz.
🚀 Bunun, faydalı beceriler geliştirip öğrenirken eğleneceğiniz harika bir deneyimin başlangıcı olacağından eminim.
📩 Lütfen e-postanızı kontrol edin, Kodland platformuna giriş yapmak için gereken bilgileri orada bulacaksınız.
💻✨ Öğrenmeye, üretmeye ve kendi izinizi bırakmaya hazır olun!
{{tutorName}}`,
    id: `👋✨ Halo semuanya!
Selamat datang di kursus {{courseName}}. Aku sangat senang memulai perjalanan ini bersama kalian, di mana kita akan belajar dan membangun proyek yang memadukan kreativitas, fungsionalitas, dan gaya.
Di ruang ini, imajinasi dan semangat belajar akan menjadi alat utama kita. Kita akan menjelajahi topik-topik baru, bereksperimen dengan ide-ide, dan menghidupkan proyek-proyek unik yang mencerminkan bakat kalian.
🚀 Aku yakin ini akan menjadi awal dari pengalaman luar biasa, di mana kalian bisa mengembangkan keterampilan yang berguna sambil bersenang-senang saat belajar.
📩 Silakan cek email kalian, di sana kalian akan menemukan kredensial akses untuk masuk ke platform Kodland.
💻✨ Bersiaplah untuk belajar, berkreasi, dan meninggalkan jejak kalian!
{{tutorName}}`,
    it: `👋✨ Ciao a tutti!
Benvenuti al corso di {{courseName}}. Sono davvero entusiasta di iniziare questo viaggio con voi, dove impareremo e costruiremo progetti che uniscono creatività, funzionalità e stile.
In questo spazio, l'immaginazione e la voglia di imparare saranno i nostri strumenti principali. Esploreremo nuovi argomenti, sperimenteremo con idee e daremo vita a progetti unici che rispecchiano il vostro talento.
🚀 Sono sicuro che sarà l'inizio di un'esperienza fantastica, in cui potrete sviluppare competenze utili e divertirvi imparando.
📩 Vi preghiamo di controllare la vostra email, lì troverete le credenziali di accesso per entrare nella piattaforma Kodland.
💻✨ Preparatevi a imparare, creare e lasciare il vostro segno!
{{tutorName}}`,
    pl: `👋✨ Cześć wszystkim!
Witajcie na kursie {{courseName}}. Bardzo się cieszę, że mogę razem z wami rozpocząć tę podróż, podczas której będziemy się uczyć i tworzyć projekty łączące kreatywność, funkcjonalność i styl.
W tej przestrzeni wyobraźnia i chęć nauki będą naszymi głównymi narzędziami. Będziemy odkrywać nowe tematy, eksperymentować z pomysłami i ożywiać unikalne projekty, które odzwierciedlają wasz talent.
🚀 Jestem pewien, że to będzie początek wspaniałego doświadczenia, w którym rozwiniecie przydatne umiejętności i będziecie się świetnie bawić podczas nauki.
📩 Sprawdźcie proszę swoją skrzynkę e-mail, znajdziecie tam dane dostępu do platformy Kodland.
💻✨ Przygotujcie się, aby się uczyć, tworzyć i zostawić swój ślad!
{{tutorName}}`,
    pt: `👋✨ Olá a todos!
Bem-vindos ao curso de {{courseName}}. Estou muito animado para começar esta jornada com vocês, onde vamos aprender e construir projetos que combinam criatividade, funcionalidade e estilo.
Neste espaço, a imaginação e a vontade de aprender serão nossas principais ferramentas. Vamos explorar novos temas, experimentar ideias e dar vida a projetos únicos que reflitam o talento de vocês.
🚀 Tenho certeza de que será o início de uma ótima experiência, na qual vocês poderão desenvolver habilidades úteis e se divertir aprendendo.
📩 Por favor, verifiquem seu e-mail, lá vocês encontrarão suas credenciais de acesso para entrar na plataforma Kodland.
💻✨ Preparem-se para aprender, criar e deixar sua marca!
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_GROUP_WELCOME_TEMPLATE;
}

function getDefaultFirstClassTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_FIRST_CLASS_TEMPLATE,
    en: `🎉 Welcome to your first {{courseName}} class at Kodland! 🎉
Hi everyone! I'm so excited to officially welcome you to this new course, where we'll learn amazing things combining creativity, technology, and lots of enthusiasm. 🌐✨
Today begins an adventure where you will be the protagonists. In every class we'll explore new tools and ways of expression to bring your ideas to life. Don't worry if this is your first time in this type of course, we're going to learn step by step and enjoy the process! 🚀
🚨 Important Reminder: See you on the platform 🚨
Just a reminder that for our class TODAY at {{time}} (Colombia time), we'll connect directly through the Kodland platform.
This is our first class together, so don't worry if you have questions about how we work in the virtual classroom… we're here to enjoy and grow together step by step!
🛠️ Before class starts, make sure of this:
✅ Have you tried logging in yet? Log in to the platform with the credentials you received by email. Do it a little beforehand to confirm everything is in order and not lose valuable class minutes.
📖 Questions about how to log in? Here's the guide handy in case you need to refresh the steps: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Trouble with your details? If you've checked your inbox and still haven't been able to log in with your credentials, message me RIGHT AWAY in private so I can help you solve it.
⚠️ Key requirement: For all the tools to work perfectly, make sure to log in using the Google Chrome browser. 🌐
✨ Don't forget to bring your creativity, curiosity, and enthusiasm. I'm so happy to be your teacher and join you on this learning journey!
See you in a bit on the platform! 🔥🙌
💡 Let's build amazing things together! 🌐🚀
{{tutorName}}`,
    ar: `🎉 مرحبًا بكم في أول حصة من {{courseName}} في Kodland! 🎉
مرحبًا يا أصدقائي! أنا سعيد جدًا بالترحيب بكم رسميًا في هذه الدورة الجديدة، حيث سنتعلم أشياء رائعة تجمع بين الإبداع والتكنولوجيا والكثير من الحماس. 🌐✨
تبدأ اليوم مغامرة ستكونون فيها أنتم أبطالها. في كل حصة سنستكشف أدوات جديدة وطرقًا للتعبير لنمنح أفكاركم حياةً حقيقية. لا داعي للقلق إذا كانت هذه أول مرة تخوضون فيها هذا النوع من الدورات، فسوف نتعلم خطوة بخطوة ونستمتع بالرحلة! 🚀
🚨 تذكير مهم: نلتقي على المنصة 🚨
أذكّركم بأن حصتنا اليوم الساعة {{time}} (بتوقيت كولومبيا) ستكون عبر الاتصال المباشر بمنصة Kodland.
هذه أول حصة لنا معًا، لذا لا تقلقوا إن كانت لديكم أسئلة حول كيفية سير العمل في الفصل الافتراضي… نحن هنا لنستمتع وننمو معًا خطوة بخطوة!
🛠️ قبل بدء الحصة، تأكدوا مما يلي:
✅ هل جربتم الدخول من قبل؟ سجّلوا الدخول إلى المنصة باستخدام البيانات التي استلمتموها عبر البريد الإلكتروني. افعلوا ذلك قبل الموعد بقليل للتأكد من أن كل شيء على ما يرام وعدم إضاعة دقائق ثمينة من الحصة.
📖 لديكم استفسار حول طريقة الدخول؟ إليكم الدليل التوضيحي في متناول يدكم في حال احتجتم لتذكّر الخطوات: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 هل تواجهون مشكلة في بياناتكم؟ إذا تحققتم من صندوق البريد الوارد ولم تتمكنوا مع ذلك من الدخول ببياناتكم، راسلوني فورًا بشكل خاص لمساعدتكم في حل المشكلة.
⚠️ شرط أساسي: لكي تعمل جميع الأدوات بشكل مثالي، تأكدوا من الدخول باستخدام متصفح Google Chrome. 🌐
✨ لا تنسوا إحضار إبداعكم وفضولكم وحماسكم. أنا سعيد جدًا بأن أكون معلمكم ومرافقكم في رحلة التعلّم هذه!
نلتقي بعد قليل على المنصة! 🔥🙌
💡 لنبنِ معًا أشياء رائعة! 🌐🚀
{{tutorName}}`,
    ru: `🎉 Добро пожаловать на ваше первое занятие по курсу {{courseName}} в Kodland! 🎉
Привет, ребята! Я очень рад официально приветствовать вас на этом новом курсе, где мы будем изучать невероятные вещи, сочетая творчество, технологии и море энтузиазма. 🌐✨
Сегодня начинается приключение, в котором главными героями будете вы. На каждом занятии мы будем осваивать новые инструменты и способы самовыражения, чтобы воплощать ваши идеи в жизнь. Не переживайте, если это ваш первый опыт в подобном курсе — мы будем учиться шаг за шагом и наслаждаться процессом! 🚀
🚨 Важное напоминание: встречаемся на платформе 🚨
Напоминаю, что на наше СЕГОДНЯШНЕЕ занятие в {{time}} (по колумбийскому времени) мы подключимся напрямую через платформу Kodland.
Это наше первое занятие вместе, так что не переживайте, если у вас есть вопросы о том, как мы работаем в виртуальном классе… мы здесь, чтобы получать удовольствие и расти вместе шаг за шагом!
🛠️ Перед началом занятия убедитесь в следующем:
✅ Вы уже пробовали войти? Войдите на платформу, используя данные, полученные по электронной почте. Сделайте это немного заранее, чтобы убедиться, что всё в порядке, и не терять драгоценные минуты занятия.
📖 Есть вопросы о том, как войти? Вот инструкция под рукой на случай, если понадобится освежить шаги в памяти: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Проблемы с вашими данными? Если вы проверили входящие письма и всё равно не смогли войти со своими данными, НЕМЕДЛЕННО напишите мне в личные сообщения, чтобы я помог вам это решить.
⚠️ Ключевое требование: чтобы все инструменты работали идеально, обязательно заходите через браузер Google Chrome. 🌐
✨ Не забудьте взять с собой творчество, любопытство и энтузиазм. Я очень рад быть вашим преподавателем и сопровождать вас в этом учебном путешествии!
Увидимся совсем скоро на платформе! 🔥🙌
💡 Давайте вместе создавать невероятные вещи! 🌐🚀
{{tutorName}}`,
    fr: `🎉 Bienvenue à votre premier cours de {{courseName}} chez Kodland ! 🎉
Salut les amis ! Je suis très heureux de vous accueillir officiellement dans ce nouveau cours, où nous apprendrons des choses incroyables en combinant créativité, technologie et beaucoup d'enthousiasme. 🌐✨
Aujourd'hui commence une aventure dont vous serez les héros. À chaque cours, nous explorerons de nouveaux outils et de nouvelles formes d'expression pour donner vie à vos idées. Ne vous inquiétez pas si c'est votre première fois dans ce type de cours, nous allons apprendre étape par étape et profiter du processus ! 🚀
🚨 Rappel important : Rendez-vous sur la plateforme 🚨
Je vous rappelle que pour notre cours d'AUJOURD'HUI à {{time}} (heure de Colombie), nous nous connecterons directement via la plateforme Kodland.
C'est notre premier cours ensemble, alors ne vous inquiétez pas si vous avez des questions sur notre fonctionnement en classe virtuelle… nous sommes là pour profiter et grandir ensemble, étape par étape !
🛠️ Avant que le cours ne commence, assurez-vous de ceci :
✅ Avez-vous déjà essayé de vous connecter ? Connectez-vous à la plateforme avec les identifiants reçus par e-mail. Faites-le un peu à l'avance pour vérifier que tout est en ordre et ne pas perdre de précieuses minutes de cours.
📖 Des doutes sur la façon de vous connecter ? Voici le guide à portée de main au cas où vous auriez besoin de vous rafraîchir la mémoire sur les étapes : https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Des problèmes avec vos identifiants ? Si vous avez vérifié votre boîte de réception et que vous n'arrivez toujours pas à vous connecter avec vos identifiants, écrivez-moi TOUT DE SUITE en privé pour que je vous aide à résoudre le problème.
⚠️ Condition essentielle : Pour que tous les outils fonctionnent parfaitement, assurez-vous de vous connecter en utilisant le navigateur Google Chrome. 🌐
✨ N'oubliez pas d'apporter votre créativité, votre curiosité et votre enthousiasme. Je suis très heureux d'être votre professeur et de vous accompagner dans ce voyage d'apprentissage !
On se voit tout à l'heure sur la plateforme ! 🔥🙌
💡 Construisons ensemble des choses incroyables ! 🌐🚀
{{tutorName}}`,
    tr: `🎉 Kodland'daki ilk {{courseName}} dersinize hoş geldiniz! 🎉
Merhaba çocuklar! Bu yeni kursa resmen hoş geldiniz demekten çok heyecanlıyım. Bu kursta yaratıcılığı, teknolojiyi ve bol miktarda coşkuyu birleştirerek inanılmaz şeyler öğreneceğiz. 🌐✨
Bugün, baş kahramanların siz olacağı bir macera başlıyor. Her derste, fikirlerinize hayat vermek için yeni araçlar ve ifade biçimleri keşfedeceğiz. Bu tür bir kursa ilk kez katılıyorsanız endişelenmeyin, adım adım öğrenip süreci keyifle yaşayacağız! 🚀
🚨 Önemli Hatırlatma: Platformda görüşürüz 🚨
Hatırlatmak isterim, BUGÜN saat {{time}}'daki (Kolombiya saatiyle) dersimiz için doğrudan Kodland platformu üzerinden bağlanacağız.
Bu birlikte yapacağımız ilk ders, bu yüzden sanal sınıfta nasıl çalıştığımız konusunda sorularınız olursa endişelenmeyin… buradayız ki adım adım birlikte eğlenelim ve gelişelim!
🛠️ Ders başlamadan önce şunlardan emin olun:
✅ Giriş yapmayı denediniz mi? E-posta ile aldığınız bilgilerle platforma giriş yapın. Her şeyin yolunda olduğundan emin olmak ve değerli ders dakikalarını kaybetmemek için bunu biraz önceden yapın.
📖 Nasıl giriş yapılacağı konusunda tereddütleriniz mi var? Adımları hatırlamanız gerekirse diye kılavuzu elinizin altında bulundurun: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Bilgilerinizle ilgili sorun mu var? Gelen kutunuzu kontrol ettiğiniz halde bilgilerinizle giriş yapamıyorsanız, sorunu çözmenize yardımcı olmam için HEMEN bana özelden yazın.
⚠️ Önemli gereklilik: Tüm araçların mükemmel çalışması için Google Chrome tarayıcısını kullanarak giriş yaptığınızdan emin olun. 🌐
✨ Yaratıcılığınızı, merakınızı ve coşkunuzu getirmeyi unutmayın. Bu öğrenme yolculuğunda öğretmeniniz olmaktan ve size eşlik etmekten çok mutluyum!
Birazdan platformda görüşürüz! 🔥🙌
💡 Hadi birlikte inanılmaz şeyler inşa edelim! 🌐🚀
{{tutorName}}`,
    id: `🎉 Selamat datang di kelas pertama {{courseName}} kalian di Kodland! 🎉
Halo teman-teman! Saya sangat senang bisa menyambut kalian secara resmi di kursus baru ini, di mana kita akan mempelajari hal-hal luar biasa dengan memadukan kreativitas, teknologi, dan banyak semangat. 🌐✨
Hari ini dimulai sebuah petualangan di mana kalianlah yang menjadi tokoh utamanya. Di setiap kelas kita akan menjelajahi alat-alat baru dan cara-cara berekspresi untuk mewujudkan ide-ide kalian. Jangan khawatir jika ini pertama kalinya kalian mengikuti kursus seperti ini, kita akan belajar selangkah demi selangkah dan menikmati prosesnya! 🚀
🚨 Pengingat Penting: Sampai jumpa di platform 🚨
Saya ingatkan bahwa untuk kelas kita HARI INI pukul {{time}} (waktu Kolombia), kita akan terhubung langsung melalui platform Kodland.
Ini adalah kelas pertama kita bersama, jadi jangan khawatir jika kalian memiliki pertanyaan tentang cara kita menjalankan kelas virtual ini… kita di sini untuk menikmati dan berkembang bersama selangkah demi selangkah!
🛠️ Sebelum kelas dimulai, pastikan hal berikut:
✅ Sudahkah kalian mencoba masuk? Masuklah ke platform dengan kredensial yang kalian terima melalui email. Lakukan sedikit lebih awal untuk memastikan semuanya berjalan lancar dan tidak kehilangan menit-menit berharga kelas.
📖 Ragu bagaimana cara masuk? Berikut panduannya agar mudah diakses jika kalian perlu mengingat kembali langkah-langkahnya: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Ada masalah dengan data kalian? Jika kalian sudah memeriksa kotak masuk dan tetap belum bisa masuk dengan kredensial kalian, SEGERA hubungi saya secara pribadi agar saya bisa membantu menyelesaikannya.
⚠️ Syarat penting: Agar semua alat berfungsi dengan sempurna, pastikan kalian masuk menggunakan peramban Google Chrome. 🌐
✨ Jangan lupa membawa kreativitas, rasa ingin tahu, dan semangat kalian. Saya sangat senang menjadi guru kalian dan mendampingi kalian dalam perjalanan belajar ini!
Sampai jumpa sebentar lagi di platform! 🔥🙌
💡 Mari kita bangun hal-hal luar biasa bersama-sama! 🌐🚀
{{tutorName}}`,
    it: `🎉 Benvenuti alla vostra prima lezione di {{courseName}} su Kodland! 🎉
Ciao ragazzi e ragazze! Sono davvero emozionato di darvi il benvenuto ufficiale in questo nuovo corso, dove impareremo cose incredibili combinando creatività, tecnologia e tanto entusiasmo. 🌐✨
Oggi inizia un'avventura in cui sarete voi i protagonisti. In ogni lezione esploreremo nuovi strumenti e modi di espressione per dare vita alle vostre idee. Non preoccupatevi se è la prima volta che partecipate a questo tipo di corso, impareremo passo dopo passo e ci godremo il processo! 🚀
🚨 Promemoria importante: Ci vediamo sulla piattaforma 🚨
Vi ricordo che per la nostra lezione di OGGI alle {{time}} (ora della Colombia), ci collegheremo direttamente tramite la piattaforma di Kodland.
Questa è la nostra prima lezione insieme, quindi non preoccupatevi se avete dubbi su come funzioniamo nell'aula virtuale… siamo qui per divertirci e crescere insieme passo dopo passo!
🛠️ Prima che inizi la lezione, assicuratevi di quanto segue:
✅ Avete già provato ad accedere? Effettuate l'accesso alla piattaforma con le credenziali ricevute via email. Fatelo un po' prima per confermare che tutto sia in ordine e non perdere preziosi minuti di lezione.
📖 Dubbi su come accedere? Ecco la guida a portata di mano nel caso in cui abbiate bisogno di rinfrescare i passaggi: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Problemi con i vostri dati? Se avete controllato la vostra casella di posta e nonostante ciò non siete riusciti ad accedere con le vostre credenziali, scrivetemi SUBITO in privato per aiutarvi a risolvere il problema.
⚠️ Requisito fondamentale: Affinché tutti gli strumenti funzionino alla perfezione, assicuratevi di accedere utilizzando il browser Google Chrome. 🌐
✨ Non dimenticate di portare la vostra creatività, curiosità ed entusiasmo. Sono davvero felice di essere il vostro insegnante e di accompagnarvi in questo viaggio di apprendimento!
Ci vediamo tra poco sulla piattaforma! 🔥🙌
💡 Costruiamo insieme cose incredibili! 🌐🚀
{{tutorName}}`,
    pl: `🎉 Witamy na pierwszych zajęciach {{courseName}} w Kodland! 🎉
Cześć wszystkim! Bardzo się cieszę, że mogę oficjalnie powitać was na tym nowym kursie, na którym nauczymy się niesamowitych rzeczy, łącząc kreatywność, technologię i mnóstwo entuzjazmu. 🌐✨
Dziś zaczyna się przygoda, w której to wy będziecie głównymi bohaterami. Na każdych zajęciach będziemy odkrywać nowe narzędzia i sposoby wyrażania siebie, aby ożywić wasze pomysły. Nie martwcie się, jeśli to wasz pierwszy raz na takim kursie, będziemy uczyć się krok po kroku i cieszyć się tym procesem! 🚀
🚨 Ważne przypomnienie: Do zobaczenia na platformie 🚨
Przypominam, że na nasze DZISIEJSZE zajęcia o {{time}} (czasu kolumbijskiego) połączymy się bezpośrednio przez platformę Kodland.
To nasze pierwsze wspólne zajęcia, więc nie martwcie się, jeśli macie wątpliwości co do tego, jak funkcjonujemy w wirtualnej klasie… jesteśmy tu, żeby wspólnie, krok po kroku, cieszyć się nauką i się rozwijać!
🛠️ Zanim zaczną się zajęcia, upewnijcie się co do tego:
✅ Czy próbowaliście już się zalogować? Zalogujcie się na platformę, używając danych otrzymanych na e-mail. Zróbcie to chwilę wcześniej, aby upewnić się, że wszystko działa, i nie tracić cennych minut zajęć.
📖 Macie wątpliwości, jak się zalogować? Oto instrukcja pod ręką, na wypadek gdybyście musieli przypomnieć sobie poszczególne kroki: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Macie problemy z danymi dostępu? Jeśli sprawdziliście już skrzynkę odbiorczą i mimo to nie udało wam się zalogować przy użyciu swoich danych, napiszcie do mnie NATYCHMIAST prywatnie, abym mógł pomóc wam to rozwiązać.
⚠️ Kluczowy wymóg: Aby wszystkie narzędzia działały bez zarzutu, upewnijcie się, że logujecie się za pomocą przeglądarki Google Chrome. 🌐
✨ Nie zapomnijcie zabrać ze sobą kreatywności, ciekawości i entuzjazmu. Bardzo się cieszę, że mogę być waszym nauczycielem i towarzyszyć wam w tej podróży edukacyjnej!
Do zobaczenia za chwilę na platformie! 🔥🙌
💡 Zbudujmy razem niesamowite rzeczy! 🌐🚀
{{tutorName}}`,
    pt: `🎉 Bem-vindos à primeira aula de {{courseName}} na Kodland! 🎉
Olá, meninos e meninas! Estou muito animado para dar as boas-vindas oficiais a este novo curso, onde aprenderemos coisas incríveis combinando criatividade, tecnologia e muito entusiasmo. 🌐✨
Hoje começa uma aventura na qual vocês serão os protagonistas. Em cada aula, exploraremos novas ferramentas e formas de expressão para dar vida às suas ideias. Não se preocupem se é a primeira vez que participam de um curso assim, vamos aprender passo a passo e aproveitar o processo! 🚀
🚨 Lembrete Importante: Nos vemos na plataforma 🚨
Lembro que, para a nossa aula de HOJE às {{time}} (horário da Colômbia), nos conectaremos diretamente pela plataforma da Kodland.
Esta é a nossa primeira aula juntos, então não se preocupem se tiverem dúvidas sobre como funcionamos na sala de aula virtual… estamos aqui para nos divertir e crescer juntos, passo a passo!
🛠️ Antes que a aula comece, certifiquem-se do seguinte:
✅ Já tentaram entrar? Façam login na plataforma com as credenciais que receberam por e-mail. Façam isso um pouco antes para confirmar que está tudo certo e não perder minutos preciosos de aula.
📖 Dúvidas sobre como entrar? Aqui está o passo a passo à mão, caso precisem relembrar as etapas: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Problemas com seus dados? Se já verificaram sua caixa de entrada e mesmo assim não conseguiram entrar com suas credenciais, escrevam-me JÁ no privado para que eu possa ajudá-los a resolver isso.
⚠️ Requisito fundamental: Para que todas as ferramentas funcionem perfeitamente, certifiquem-se de entrar usando o navegador Google Chrome. 🌐
✨ Não se esqueçam de trazer sua criatividade, curiosidade e entusiasmo. Estou muito feliz em ser seu professor e acompanhá-los nesta jornada de aprendizado!
Nos vemos daqui a pouco na plataforma! 🔥🙌
💡 Vamos construir coisas incríveis juntos! 🌐🚀
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_FIRST_CLASS_TEMPLATE;
}

function getDefaultGraduationTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_GRADUATION_TEMPLATE,
    en: `🎉 Hello, dear parents and students!
We are nearing the end of our journey in the {{courseName}} course and getting ready for our big Graduation Lesson.
📅 Date: {{gradDate}}
⏰ Time: {{gradTime}} (Colombia Time)
✨ Invitation: All parents and family members are cordially invited to celebrate the kids' hard work.
🌟 What will we do at the graduation?
• Course results: a summary of the topics and objectives achieved during the course.
• Project presentations: each student will share their final creation. They've done an amazing job!
• Personalized feedback: comments on each student's performance and tips to keep learning.
🧑‍💻 Important preparations for students:
• Review and complete any remaining pending activities on the platform before class.
• Prepare your virtual graduation background for the video call: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Choose which project you will present (your best work or course portfolio).
⏱ Each student will have a few minutes for their presentation.
🕒 Class will be at the usual time, with this special celebratory focus. Everyone's attendance is very important, as this is the moment where students close out their cycle and confirm what they've learned.
If for some unavoidable reason you can't attend, please let me know in advance.
See you in class to celebrate your talent! 💙
Kodland Team
Tutor: {{tutorName}}`,
    ar: `🎉 مرحبًا أيها الآباء والطلاب الأعزاء!
لقد شارفنا على نهاية رحلتنا في دورة {{courseName}} ونستعد الآن لحصة التخرج الكبيرة.
📅 التاريخ: {{gradDate}}
⏰ الوقت: {{gradTime}} (بتوقيت كولومبيا)
✨ الدعوة: جميع الآباء وأفراد الأسرة مدعوون بكل ترحاب للاحتفال بجهود الأطفال.
🌟 ماذا سنفعل في حفل التخرج؟
• نتائج الدورة: ملخص للمواضيع والأهداف التي تم تحقيقها خلال الدورة.
• عرض المشاريع: سيشارك كل طالب إبداعه النهائي. لقد قاموا بعمل رائع!
• توجيه شخصي: ملاحظات حول أداء كل طالب ونصائح لمواصلة التعلم.
🧑‍💻 استعدادات مهمة للطلاب:
• مراجعة وإتمام آخر الأنشطة المعلقة على المنصة قبل الحصة.
• تجهيز الخلفية الافتراضية الخاصة بالتخرج لمكالمة الفيديو: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• اختيار المشروع الذي سيتم تقديمه (أفضل عمل أو ملف أعمال الدورة).
⏱ سيحصل كل طالب على بضع دقائق لتقديم عرضه.
🕒 ستُقام الحصة في الموعد المعتاد، مع هذا التركيز الاحتفالي الخاص. حضور الجميع مهم جدًا، فهذا هو الوقت الذي يُتم فيه الطلاب دورتهم ويؤكدون ما تعلموه.
إذا تعذر عليكم الحضور لأي ظرف قاهر، يُرجى إعلامي بذلك مسبقًا.
نراكم في الحصة للاحتفال بموهبتكم! 💙
فريق Kodland
المعلّم: {{tutorName}}`,
    ru: `🎉 Здравствуйте, дорогие родители и учащиеся!
Мы подходим к концу нашего пути на курсе {{courseName}} и готовимся к нашему большому Выпускному занятию.
📅 Дата: {{gradDate}}
⏰ Время: {{gradTime}} (по колумбийскому времени)
✨ Приглашение: Все родители и члены семьи сердечно приглашаются отпраздновать усилия ребят.
🌟 Что мы будем делать на выпускном?
• Итоги курса: обзор тем и целей, достигнутых в ходе курса.
• Презентация проектов: каждый учащийся представит свою финальную работу. Они проделали невероятную работу!
• Индивидуальные рекомендации: отзывы об успехах каждого учащегося и советы для дальнейшего обучения.
🧑‍💻 Важная подготовка для учащихся:
• Проверить и выполнить оставшиеся незавершённые задания на платформе до начала занятия.
• Подготовить виртуальный фон для выпускного к видеозвонку: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Выбрать, какой проект будет представлен (лучшую работу или портфолио курса).
⏱ У каждого учащегося будет несколько минут на презентацию.
🕒 Занятие пройдёт в обычное время, но с особым праздничным акцентом. Присутствие всех очень важно, ведь это момент, когда учащиеся завершают свой цикл обучения и закрепляют полученные знания.
Если по каким-либо уважительным причинам вы не сможете присутствовать, пожалуйста, сообщите мне об этом заранее.
До встречи на занятии, чтобы отпраздновать ваш талант! 💙
Команда Kodland
Куратор: {{tutorName}}`,
    fr: `🎉 Bonjour chers parents et élèves !
Nous arrivons à la fin de notre parcours dans le cours de {{courseName}} et nous nous préparons pour notre grande Leçon de Remise des Diplômes.
📅 Date : {{gradDate}}
⏰ Heure : {{gradTime}} (heure de Colombie)
✨ Invitation : Tous les parents et membres de la famille sont cordialement invités à célébrer les efforts des enfants.
🌟 Que ferons-nous lors de la remise des diplômes ?
• Résultats du cours : un résumé des thèmes et objectifs atteints pendant le cours.
• Présentation des projets : chaque élève partagera sa création finale. Ils ont fait un travail incroyable !
• Orientation personnalisée : commentaires sur la performance de chaque élève et conseils pour continuer à apprendre.
🧑‍💻 Préparatifs importants pour les élèves :
• Revoir et terminer les dernières activités en attente sur la plateforme avant le cours.
• Préparer votre fond virtuel de remise des diplômes pour l'appel vidéo : https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Choisir quel projet vous allez présenter (votre meilleur travail ou portfolio du cours).
⏱ Chaque élève disposera de quelques minutes pour sa présentation.
🕒 Le cours aura lieu à l'horaire habituel, avec cette touche spéciale de célébration. La présence de tous est très importante, car c'est le moment où les élèves clôturent leur cycle et valident ce qu'ils ont appris.
Si, pour un cas de force majeure, vous ne pouvez pas assister, merci de me le faire savoir à l'avance.
Rendez-vous en cours pour célébrer votre talent ! 💙
Équipe Kodland
Tuteur : {{tutorName}}`,
    tr: `🎉 Sevgili anne-babalar ve öğrenciler, merhaba!
{{courseName}} kursundaki yolculuğumuzun sonuna yaklaşıyoruz ve büyük Mezuniyet Dersimize hazırlanıyoruz.
📅 Tarih: {{gradDate}}
⏰ Saat: {{gradTime}} (Kolombiya Saati)
✨ Davet: Tüm anne-babalar ve aile üyeleri, çocukların emeğini kutlamak için içtenlikle davetlidir.
🌟 Mezuniyette neler yapacağız?
• Kurs sonuçları: kurs boyunca ele alınan konuların ve ulaşılan hedeflerin özeti.
• Proje sunumları: her öğrenci son çalışmasını paylaşacak. İnanılmaz bir iş çıkardılar!
• Kişiselleştirilmiş rehberlik: her öğrencinin performansına dair yorumlar ve öğrenmeye devam etmek için öneriler.
🧑‍💻 Öğrenciler için önemli hazırlıklar:
• Dersten önce platformdaki bekleyen son etkinlikleri gözden geçirip tamamlayın.
• Görüntülü görüşme için mezuniyet sanal arka planınızı hazırlayın: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Hangi projeyi sunacağınızı seçin (en iyi çalışmanız veya kurs portföyünüz).
⏱ Her öğrencinin sunumu için birkaç dakikası olacak.
🕒 Ders her zamanki saatte, bu özel kutlama odağıyla gerçekleşecek. Herkesin katılımı çok önemlidir, çünkü bu, öğrencilerin döngülerini tamamladıkları ve öğrendiklerini pekiştirdikleri andır.
Eğer mücbir bir sebepten katılamayacaksanız, lütfen bana önceden haber verin.
Yeteneğinizi kutlamak için derste görüşürüz! 💙
Kodland Ekibi
Eğitmen: {{tutorName}}`,
    id: `🎉 Halo, orang tua dan siswa tersayang!
Kita sudah hampir mencapai akhir perjalanan kita di kursus {{courseName}} dan sedang bersiap untuk Pelajaran Kelulusan besar kita.
📅 Tanggal: {{gradDate}}
⏰ Waktu: {{gradTime}} (Waktu Kolombia)
✨ Undangan: Semua orang tua dan anggota keluarga dengan hormat diundang untuk merayakan kerja keras anak-anak.
🌟 Apa yang akan kita lakukan saat kelulusan?
• Hasil kursus: ringkasan topik dan tujuan yang telah dicapai selama kursus.
• Presentasi proyek: setiap siswa akan membagikan karya akhir mereka. Mereka telah melakukan pekerjaan yang luar biasa!
• Bimbingan personal: masukan tentang performa setiap siswa dan tips untuk terus belajar.
🧑‍💻 Persiapan penting untuk siswa:
• Meninjau dan menyelesaikan aktivitas yang masih tertunda di platform sebelum kelas.
• Menyiapkan latar belakang virtual kelulusan untuk panggilan video: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Memilih proyek mana yang akan dipresentasikan (karya terbaik atau portofolio kursus Anda).
⏱ Setiap siswa akan mendapat beberapa menit untuk presentasinya.
🕒 Kelas akan berlangsung pada jam biasa, dengan fokus perayaan khusus ini. Kehadiran semua orang sangat penting, karena ini adalah momen di mana siswa menutup siklus belajar mereka dan memvalidasi apa yang telah dipelajari.
Jika karena suatu alasan mendesak Anda tidak dapat hadir, mohon beri tahu saya sebelumnya.
Sampai jumpa di kelas untuk merayakan bakat kalian! 💙
Tim Kodland
Tutor: {{tutorName}}`,
    it: `🎉 Ciao, cari genitori e studenti!
Stiamo arrivando alla fine del nostro percorso nel corso di {{courseName}} e ci stiamo preparando per la nostra grande Lezione di Diploma.
📅 Data: {{gradDate}}
⏰ Ora: {{gradTime}} (Ora della Colombia)
✨ Invito: Tutti i genitori e i familiari sono cordialmente invitati a celebrare l'impegno dei ragazzi.
🌟 Cosa faremo alla cerimonia di diploma?
• Risultati del corso: un riepilogo degli argomenti e degli obiettivi raggiunti durante il corso.
• Presentazione dei progetti: ogni studente condividerà la propria creazione finale. Hanno svolto un lavoro incredibile!
• Orientamento personalizzato: commenti sulle prestazioni di ogni studente e consigli per continuare a imparare.
🧑‍💻 Preparativi importanti per gli studenti:
• Rivedere e completare le ultime attività in sospeso sulla piattaforma prima della lezione.
• Preparare il proprio sfondo virtuale di diploma per la videochiamata: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Scegliere quale progetto presentare (il proprio miglior lavoro o portfolio del corso).
⏱ Ogni studente avrà alcuni minuti per la propria presentazione.
🕒 La lezione si terrà nell'orario abituale, con questo speciale spirito di festa. La partecipazione di tutti è molto importante, poiché è il momento in cui gli studenti chiudono il proprio percorso e confermano quanto appreso.
Se per un motivo di forza maggiore non potete partecipare, vi prego di farmelo sapere in anticipo.
Ci vediamo in classe per celebrare il vostro talento! 💙
Team Kodland
Tutor: {{tutorName}}`,
    pl: `🎉 Cześć, drodzy rodzice i uczniowie!
Zbliżamy się do końca naszej drogi na kursie {{courseName}} i przygotowujemy się do naszej wielkiej Lekcji Ukończenia Kursu.
📅 Data: {{gradDate}}
⏰ Godzina: {{gradTime}} (czas kolumbijski)
✨ Zaproszenie: Wszyscy rodzice i członkowie rodziny są serdecznie zaproszeni, aby uczcić wysiłek dzieciaków.
🌟 Co będziemy robić podczas zakończenia kursu?
• Wyniki kursu: podsumowanie tematów i celów osiągniętych w trakcie kursu.
• Prezentacja projektów: każdy uczeń przedstawi swoje ostateczne dzieło. Wykonali niesamowitą pracę!
• Indywidualne wskazówki: uwagi na temat postępów każdego ucznia oraz porady, jak kontynuować naukę.
🧑‍💻 Ważne przygotowania dla uczniów:
• Przejrzeć i uzupełnić ostatnie zaległe zadania na platformie przed zajęciami.
• Przygotować swoje wirtualne tło na zakończenie kursu do rozmowy wideo: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Wybrać, który projekt zaprezentują (swoją najlepszą pracę lub portfolio z kursu).
⏱ Każdy uczeń będzie miał kilka minut na swoją prezentację.
🕒 Zajęcia odbędą się w zwykłych godzinach, z tym specjalnym, świątecznym akcentem. Obecność wszystkich jest bardzo ważna, ponieważ jest to moment, w którym uczniowie kończą swój cykl nauki i potwierdzają zdobytą wiedzę.
Jeśli z jakiegoś ważnego powodu nie będziecie mogli uczestniczyć, proszę dajcie mi znać z wyprzedzeniem.
Do zobaczenia na zajęciach, aby uczcić wasz talent! 💙
Zespół Kodland
Nauczyciel: {{tutorName}}`,
    pt: `🎉 Olá, queridos pais e alunos!
Estamos chegando ao final da nossa jornada no curso de {{courseName}} e nos preparando para nossa grande Aula de Formatura.
📅 Data: {{gradDate}}
⏰ Horário: {{gradTime}} (Horário da Colômbia)
✨ Convite: Todos os pais e familiares estão cordialmente convidados a celebrar o esforço dos alunos.
🌟 O que faremos na formatura?
• Resultados do curso: um resumo dos temas e objetivos alcançados durante o curso.
• Apresentação de projetos: cada aluno compartilhará sua criação final. Eles fizeram um trabalho incrível!
• Orientação personalizada: comentários sobre o desempenho de cada aluno e dicas para continuar aprendendo.
🧑‍💻 Preparativos importantes para os alunos:
• Revisar e concluir as últimas atividades pendentes na plataforma antes da aula.
• Preparar seu fundo virtual de formatura para a videochamada: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Escolher qual projeto vão apresentar (seu melhor trabalho ou portfólio do curso).
⏱ Cada aluno terá alguns minutos para sua apresentação.
🕒 A aula será no horário habitual, com este enfoque especial de celebração. A presença de todos é muito importante, já que é o momento em que os alunos encerram seu ciclo e validam o que aprenderam.
Se por algum motivo de força maior vocês não puderem comparecer, por favor me avisem com antecedência.
Nos vemos na aula para celebrar o talento de vocês! 💙
Equipe Kodland
Tutor: {{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_GRADUATION_TEMPLATE;
}

function getDefaultRecordingStudentTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_RECORDING_STUDENT_TEMPLATE,
    en: `🎥 Hi {{studentName}}!
Here's the recording of our last {{courseName}} class, in case you want to review something or couldn't join live:
🔗 {{recordingLink}}
If you have any questions, I'm here to help. Let's keep moving forward! 🚀
{{tutorName}}`,
    ar: `🎥 مرحبًا {{studentName}}!
أشارك معك تسجيل حصتنا الأخيرة في {{courseName}}، في حال أردت مراجعة شيء ما أو لم تتمكن من الحضور مباشرة:
🔗 {{recordingLink}}
إن كان لديك أي سؤال، أنا هنا لمساعدتك. لنواصل التقدم! 🚀
{{tutorName}}`,
    ru: `🎥 Привет, {{studentName}}!
Делюсь записью нашего последнего занятия по {{courseName}} — на случай, если захочешь что-то повторить или не смог(ла) подключиться в прямом эфире:
🔗 {{recordingLink}}
Если останутся вопросы, я всегда готов помочь. Продолжаем двигаться вперёд! 🚀
{{tutorName}}`,
    fr: `🎥 Salut {{studentName}} !
Je te partage l'enregistrement de notre dernier cours de {{courseName}}, au cas où tu voudrais revoir quelque chose ou si tu n'as pas pu te connecter en direct :
🔗 {{recordingLink}}
Si tu as la moindre question, je suis là pour t'aider. Continuons à avancer ! 🚀
{{tutorName}}`,
    tr: `🎥 Merhaba {{studentName}}!
{{courseName}} dersimizin kaydını seninle paylaşıyorum; bir konuyu tekrar etmek istersen ya da canlı derse katılamadıysan diye:
🔗 {{recordingLink}}
Aklında kalan herhangi bir soru olursa, sana yardımcı olmak için buradayım. İlerlemeye devam edelim! 🚀
{{tutorName}}`,
    id: `🎥 Halo {{studentName}}!
Aku bagikan rekaman kelas {{courseName}} kita yang terakhir, siapa tahu kamu ingin mengulang materi atau tidak sempat bergabung secara langsung:
🔗 {{recordingLink}}
Kalau masih ada pertanyaan, aku di sini untuk membantu. Ayo kita terus maju! 🚀
{{tutorName}}`,
    it: `🎥 Ciao {{studentName}}!
Ti condivido la registrazione della nostra ultima lezione di {{courseName}}, nel caso tu voglia rivedere qualcosa o non sia riuscito/a a collegarti in diretta:
🔗 {{recordingLink}}
Per qualsiasi dubbio, sono qui per aiutarti. Continuiamo ad andare avanti! 🚀
{{tutorName}}`,
    pl: `🎥 Cześć {{studentName}}!
Przesyłam Ci nagranie naszej ostatniej lekcji z {{courseName}}, na wypadek gdybyś chciał(a) coś powtórzyć albo nie mógł(-mogła) połączyć się na żywo:
🔗 {{recordingLink}}
Jeśli masz jakiekolwiek pytania, jestem tu, aby pomóc. Idźmy dalej! 🚀
{{tutorName}}`,
    pt: `🎥 Olá, {{studentName}}!
Estou compartilhando a gravação da nossa última aula de {{courseName}}, caso você queira revisar algo ou não tenha conseguido se conectar ao vivo:
🔗 {{recordingLink}}
Qualquer dúvida que ficar, estou aqui para te ajudar. Vamos continuar avançando! 🚀
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_RECORDING_STUDENT_TEMPLATE;
}

function getDefaultRecordingGroupTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_RECORDING_GROUP_TEMPLATE,
    en: `🎥 Hi everyone!
Here's the recording of our last {{courseName}} class, in case you want to review something or someone couldn't join live:
🔗 {{recordingLink}}
Any questions, I'm here to help. Let's keep learning! 🚀
{{tutorName}}`,
    ar: `🎥 مرحبًا بالجميع!
أشارك معكم تسجيل حصتنا الأخيرة في {{courseName}}، في حال أراد أحدكم مراجعة شيء ما أو لم يتمكن أحد من الحضور مباشرة:
🔗 {{recordingLink}}
لأي سؤال، أنا هنا لمساعدتكم. لنواصل التعلم! 🚀
{{tutorName}}`,
    ru: `🎥 Всем привет!
Делюсь записью нашего последнего занятия по {{courseName}} — на случай, если кто-то захочет что-то повторить или не смог подключиться в прямом эфире:
🔗 {{recordingLink}}
Если есть вопросы, я всегда готов помочь. Продолжаем учиться! 🚀
{{tutorName}}`,
    fr: `🎥 Bonjour à tous !
Je vous partage l'enregistrement de notre dernier cours de {{courseName}}, au cas où vous voudriez revoir quelque chose ou si quelqu'un n'a pas pu se connecter en direct :
🔗 {{recordingLink}}
Pour toute question, je suis là pour vous aider. Continuons à apprendre ! 🚀
{{tutorName}}`,
    tr: `🎥 Herkese merhaba!
{{courseName}} dersimizin kaydını sizinle paylaşıyorum; bir konuyu tekrar etmek isteyen ya da canlı derse katılamayan olursa diye:
🔗 {{recordingLink}}
Herhangi bir sorunuz olursa, size yardımcı olmak için buradayım. Öğrenmeye devam edelim! 🚀
{{tutorName}}`,
    id: `🎥 Halo semuanya!
Aku bagikan rekaman kelas {{courseName}} kita yang terakhir, siapa tahu ada yang ingin mengulang materi atau tidak sempat bergabung secara langsung:
🔗 {{recordingLink}}
Kalau ada pertanyaan, aku di sini untuk membantu. Ayo terus belajar! 🚀
{{tutorName}}`,
    it: `🎥 Ciao a tutti!
Vi condivido la registrazione della nostra ultima lezione di {{courseName}}, nel caso vogliate rivedere qualcosa o qualcuno non sia riuscito a collegarsi in diretta:
🔗 {{recordingLink}}
Per qualsiasi dubbio, sono qui per aiutarvi. Continuiamo a imparare! 🚀
{{tutorName}}`,
    pl: `🎥 Cześć wszystkim!
Przesyłam wam nagranie naszej ostatniej lekcji z {{courseName}}, na wypadek gdybyście chcieli coś powtórzyć albo ktoś nie mógł połączyć się na żywo:
🔗 {{recordingLink}}
W razie jakichkolwiek pytań, jestem tu, aby pomóc. Uczmy się dalej! 🚀
{{tutorName}}`,
    pt: `🎥 Olá a todos!
Estou compartilhando a gravação da nossa última aula de {{courseName}}, caso queiram revisar algo ou alguém não tenha conseguido se conectar ao vivo:
🔗 {{recordingLink}}
Qualquer dúvida, estou aqui para ajudar vocês. Vamos continuar aprendendo! 🚀
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_RECORDING_GROUP_TEMPLATE;
}

// Resolve the template to actually use for a given language: the tutor's
// saved customization if there is one, or the per-language default if the
// stored value is still untouched (equal to the Spanish default constant).
function resolveTemplate(storedTemplate, defaultConstant, getDefaultForLanguage, language) {
  const template = storedTemplate || defaultConstant;
  if (!template || template === defaultConstant) {
    return getDefaultForLanguage(language);
  }
  return template;
}

function getResolvedWelcomeTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.welcomeTemplate, DEFAULT_WELCOME_TEMPLATE, getDefaultWelcomeTemplate, language);
}
function getResolvedAbsenceTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.absenceTemplate, DEFAULT_ABSENCE_TEMPLATE, getDefaultAbsenceTemplate, language);
}
function getResolvedClassStartingTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.classStartingTemplate, DEFAULT_CLASS_STARTING_TEMPLATE, getDefaultClassStartingTemplate, language);
}
function getResolvedInClassTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.inClassTemplate, DEFAULT_IN_CLASS_TEMPLATE, getDefaultInClassTemplate, language);
}
function getResolvedGroupWelcomeTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.groupWelcomeTemplate, DEFAULT_GROUP_WELCOME_TEMPLATE, getDefaultGroupWelcomeTemplate, language);
}
function getResolvedFirstClassTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.firstClassTemplate, DEFAULT_FIRST_CLASS_TEMPLATE, getDefaultFirstClassTemplate, language);
}
function getResolvedGraduationTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.graduationTemplate, DEFAULT_GRADUATION_TEMPLATE, getDefaultGraduationTemplate, language);
}
function getResolvedRecordingStudentTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.recordingStudentTemplate, DEFAULT_RECORDING_STUDENT_TEMPLATE, getDefaultRecordingStudentTemplate, language);
}
function getResolvedRecordingGroupTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.recordingGroupTemplate, DEFAULT_RECORDING_GROUP_TEMPLATE, getDefaultRecordingGroupTemplate, language);
}

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
  showRecordingButton: true,
  showGroupGradingReport: true,
  showBroadcastButtons: true,
  tutorName: 'TL Camilo Bermudez',
  // Interface and message language. 'auto' follows Kodland's own language
  // selector; any code in SUPPORTED_MESSAGE_LANGUAGES pins that language.
  messageLanguage: 'auto',
  welcomeTemplate: DEFAULT_WELCOME_TEMPLATE,
  absenceTemplate: DEFAULT_ABSENCE_TEMPLATE,
  classStartingTemplate: DEFAULT_CLASS_STARTING_TEMPLATE,
  inClassTemplate: DEFAULT_IN_CLASS_TEMPLATE,
  graduationTemplate: DEFAULT_GRADUATION_TEMPLATE,
  groupWelcomeTemplate: DEFAULT_GROUP_WELCOME_TEMPLATE,
  firstClassTemplate: DEFAULT_FIRST_CLASS_TEMPLATE,
  recordingStudentTemplate: DEFAULT_RECORDING_STUDENT_TEMPLATE,
  recordingGroupTemplate: DEFAULT_RECORDING_GROUP_TEMPLATE
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
  button.className = 'kodland-toolbar-btn kodland-settings-btn';
  button.innerHTML = '⚙️';
  button.setAttribute('title', uiText('settingsTooltip'));

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSettingsModal();
  });

  getOrCreateToolbar().appendChild(button);
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
  const currentLanguage = getMessageLanguage();

  const languageOptionsHtml = Object.entries(LANGUAGE_LABELS)
    .map(([code, label]) =>
      `<option value="${code}" ${settings.messageLanguage === code ? 'selected' : ''}>${escapeHtml(label)}</option>`)
    .join('');

  const fieldStyle = 'width:100%; box-sizing:border-box; padding:8px; border-radius:6px; border:1px solid #444; background:#1e1e1e; color:#fff; margin-bottom:20px;';
  const labelStyle = 'display:block; margin-bottom:8px; font-size:13px; color:#bbb;';
  const checkboxRow = 'display:flex; align-items:center; gap:8px; margin-bottom:14px; cursor:pointer;';
  const templateLabelStyle = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;';
  const templateLabelTextStyle = 'font-size:13px; color:#bbb;';
  const resetBtnStyle = 'background:none; border:none; color:#25D366; font-size:12px; cursor:pointer; text-decoration:underline;';
  const textareaStyle = `${fieldStyle} font-family:monospace; font-size:12px;`;

  // Each entry: [settings key, textarea id, reset button id, label ui-key,
  // getDefaultXTemplate function, rows]
  const TEMPLATE_FIELDS = [
    ['welcomeTemplate', 'kodland-setting-welcome-template', 'kodland-reset-welcome', 'settingWelcomeTemplate', getDefaultWelcomeTemplate, 8],
    ['absenceTemplate', 'kodland-setting-absence-template', 'kodland-reset-absence', 'settingAbsenceTemplate', getDefaultAbsenceTemplate, 6],
    ['classStartingTemplate', 'kodland-setting-classstarting-template', 'kodland-reset-classstarting', 'settingClassStartingTemplate', getDefaultClassStartingTemplate, 6],
    ['inClassTemplate', 'kodland-setting-inclass-template', 'kodland-reset-inclass', 'settingInClassTemplate', getDefaultInClassTemplate, 6],
    ['graduationTemplate', 'kodland-setting-graduation-template', 'kodland-reset-graduation', 'settingGraduationTemplate', getDefaultGraduationTemplate, 10],
    ['groupWelcomeTemplate', 'kodland-setting-groupwelcome-template', 'kodland-reset-groupwelcome', 'settingGroupWelcomeTemplate', getDefaultGroupWelcomeTemplate, 5],
    ['firstClassTemplate', 'kodland-setting-firstclass-template', 'kodland-reset-firstclass', 'settingFirstClassTemplate', getDefaultFirstClassTemplate, 10],
    ['recordingStudentTemplate', 'kodland-setting-recording-student-template', 'kodland-reset-recording-student', 'settingRecordingStudentTemplate', getDefaultRecordingStudentTemplate, 6],
    ['recordingGroupTemplate', 'kodland-setting-recording-group-template', 'kodland-reset-recording-group', 'settingRecordingGroupTemplate', getDefaultRecordingGroupTemplate, 6]
  ];

  const templateFieldsHtml = TEMPLATE_FIELDS.map(([settingsKey, textareaId, resetId, labelKey, , rows]) => `
        <div style="${templateLabelStyle}">
          <label id="${textareaId}-label" style="${templateLabelTextStyle}">${escapeHtml(uiTextForLanguage(labelKey, currentLanguage))}</label>
          <button id="${resetId}" type="button" style="${resetBtnStyle}">${escapeHtml(uiTextForLanguage('settingsReset', currentLanguage))}</button>
        </div>
        <textarea id="${textareaId}" rows="${rows}"
          style="${textareaStyle}">${escapeHtml(settings[settingsKey])}</textarea>
  `).join('');

  const modal = document.createElement('div');
  modal.id = 'kodland-settings-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal, currentLanguage);
  modal.innerHTML = `
    <div class="kodland-modal-content" style="max-width: 560px;">
      <div class="kodland-modal-header">
        <h2>${escapeHtml(uiTextForLanguage('settingsTitle', currentLanguage))}</h2>
        <button class="kodland-modal-close">&times;</button>
      </div>
      <div class="kodland-modal-body">
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-export" ${settings.showExportContacts ? 'checked' : ''}/>
          <span id="kodland-setting-export-label">${escapeHtml(uiTextForLanguage('settingShowExport', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-walink" ${settings.showWaGroupLink ? 'checked' : ''}/>
          <span id="kodland-setting-walink-label">${escapeHtml(uiTextForLanguage('settingShowWaLink', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-attendance" ${settings.showAttendance ? 'checked' : ''}/>
          <span id="kodland-setting-attendance-label">${escapeHtml(uiTextForLanguage('settingShowAttendance', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-absence" ${settings.showAbsenceButton ? 'checked' : ''}/>
          <span id="kodland-setting-absence-label">${escapeHtml(uiTextForLanguage('settingShowAbsence', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-taskreport" ${settings.showTaskReportButton ? 'checked' : ''}/>
          <span id="kodland-setting-taskreport-label">${escapeHtml(uiTextForLanguage('settingShowTaskReport', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-recording" ${settings.showRecordingButton ? 'checked' : ''}/>
          <span id="kodland-setting-recording-label">${escapeHtml(uiTextForLanguage('settingShowRecording', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow}">
          <input type="checkbox" id="kodland-setting-gradingreport" ${settings.showGroupGradingReport ? 'checked' : ''}/>
          <span id="kodland-setting-gradingreport-label">${escapeHtml(uiTextForLanguage('settingShowGradingReport', currentLanguage))}</span>
        </label>
        <label style="${checkboxRow} margin-bottom:20px;">
          <input type="checkbox" id="kodland-setting-broadcast" ${settings.showBroadcastButtons ? 'checked' : ''}/>
          <span id="kodland-setting-broadcast-label">${escapeHtml(uiTextForLanguage('settingShowBroadcast', currentLanguage))}</span>
        </label>

        <label id="kodland-setting-language-label" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingLanguage', currentLanguage))}</label>
        <select id="kodland-setting-language" style="${fieldStyle}">${languageOptionsHtml}</select>

        <label id="kodland-setting-tutorname-label" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingTutorName', currentLanguage))}</label>
        <input type="text" id="kodland-setting-tutorname" value="${escapeHtml(settings.tutorName)}" style="${fieldStyle}"/>

        <hr style="border-color:#333; margin: 16px 0;"/>
        <p id="kodland-instructions-text" style="font-size:12px; color:#999; margin-bottom:16px;">
          ${escapeHtml(uiTextForLanguage('settingsTemplatesHelp', currentLanguage))}
        </p>

        ${templateFieldsHtml}

        <button id="kodland-settings-save" class="kodland-wa-btn" style="width:100%; justify-content:center;">${escapeHtml(uiTextForLanguage('settingsSave', currentLanguage))}</button>
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
    const selectedLanguage = normalizeMessageLanguage(languageSelect.value || currentLanguage);
    const previewLanguage = selectedLanguage === 'auto' ? detectPageLanguage() : selectedLanguage;

    modal.querySelector('.kodland-modal-header h2').textContent = uiTextForLanguage('settingsTitle', previewLanguage);
    modal.querySelector('#kodland-setting-export-label').textContent = uiTextForLanguage('settingShowExport', previewLanguage);
    modal.querySelector('#kodland-setting-walink-label').textContent = uiTextForLanguage('settingShowWaLink', previewLanguage);
    modal.querySelector('#kodland-setting-attendance-label').textContent = uiTextForLanguage('settingShowAttendance', previewLanguage);
    modal.querySelector('#kodland-setting-absence-label').textContent = uiTextForLanguage('settingShowAbsence', previewLanguage);
    modal.querySelector('#kodland-setting-taskreport-label').textContent = uiTextForLanguage('settingShowTaskReport', previewLanguage);
    modal.querySelector('#kodland-setting-recording-label').textContent = uiTextForLanguage('settingShowRecording', previewLanguage);
    modal.querySelector('#kodland-setting-gradingreport-label').textContent = uiTextForLanguage('settingShowGradingReport', previewLanguage);
    modal.querySelector('#kodland-setting-broadcast-label').textContent = uiTextForLanguage('settingShowBroadcast', previewLanguage);
    modal.querySelector('#kodland-setting-language-label').textContent = uiTextForLanguage('settingLanguage', previewLanguage);
    modal.querySelector('#kodland-setting-tutorname-label').textContent = uiTextForLanguage('settingTutorName', previewLanguage);
    modal.querySelector('#kodland-instructions-text').textContent = uiTextForLanguage('settingsTemplatesHelp', previewLanguage);
    modal.querySelector('#kodland-settings-save').textContent = uiTextForLanguage('settingsSave', previewLanguage);

    TEMPLATE_FIELDS.forEach(([, textareaId, resetId, labelKey]) => {
      modal.querySelector(`#${textareaId}-label`).textContent = uiTextForLanguage(labelKey, previewLanguage);
      modal.querySelector(`#${resetId}`).textContent = uiTextForLanguage('settingsReset', previewLanguage);
    });
  };

  languageSelect.addEventListener('change', () => {
    const selectedLanguage = normalizeMessageLanguage(languageSelect.value || currentLanguage);
    const templateLanguage = selectedLanguage === 'auto' ? detectPageLanguage() : selectedLanguage;
    // Preview each template in the newly picked language, same as clicking
    // "Reset" - the tutor can still edit before saving.
    TEMPLATE_FIELDS.forEach(([, textareaId, , , getDefaultForLanguage]) => {
      modal.querySelector(`#${textareaId}`).value = getDefaultForLanguage(templateLanguage);
    });
    syncSettingsModalText();
  });

  TEMPLATE_FIELDS.forEach(([, textareaId, resetId, , getDefaultForLanguage]) => {
    modal.querySelector(`#${resetId}`).addEventListener('click', () => {
      const resetLanguage = normalizeMessageLanguage(languageSelect.value || currentLanguage);
      const templateLanguage = resetLanguage === 'auto' ? detectPageLanguage() : resetLanguage;
      modal.querySelector(`#${textareaId}`).value = getDefaultForLanguage(templateLanguage);
    });
  });

  modal.querySelector('#kodland-settings-save').addEventListener('click', () => {
    const rawLanguage = languageSelect.value || DEFAULT_MESSAGE_LANGUAGE;

    const newSettings = {
      showExportContacts: modal.querySelector('#kodland-setting-export').checked,
      showWaGroupLink: modal.querySelector('#kodland-setting-walink').checked,
      showAttendance: modal.querySelector('#kodland-setting-attendance').checked,
      showAbsenceButton: modal.querySelector('#kodland-setting-absence').checked,
      showTaskReportButton: modal.querySelector('#kodland-setting-taskreport').checked,
      showRecordingButton: modal.querySelector('#kodland-setting-recording').checked,
      showGroupGradingReport: modal.querySelector('#kodland-setting-gradingreport').checked,
      showBroadcastButtons: modal.querySelector('#kodland-setting-broadcast').checked,
      messageLanguage: rawLanguage,
      tutorName: modal.querySelector('#kodland-setting-tutorname').value.trim() || DEFAULT_KODLAND_SETTINGS.tutorName,
      welcomeTemplate: modal.querySelector('#kodland-setting-welcome-template').value.trim() || DEFAULT_WELCOME_TEMPLATE,
      absenceTemplate: modal.querySelector('#kodland-setting-absence-template').value.trim() || DEFAULT_ABSENCE_TEMPLATE,
      classStartingTemplate: modal.querySelector('#kodland-setting-classstarting-template').value.trim() || DEFAULT_CLASS_STARTING_TEMPLATE,
      inClassTemplate: modal.querySelector('#kodland-setting-inclass-template').value.trim() || DEFAULT_IN_CLASS_TEMPLATE,
      graduationTemplate: modal.querySelector('#kodland-setting-graduation-template').value.trim() || DEFAULT_GRADUATION_TEMPLATE,
      groupWelcomeTemplate: modal.querySelector('#kodland-setting-groupwelcome-template').value.trim() || DEFAULT_GROUP_WELCOME_TEMPLATE,
      firstClassTemplate: modal.querySelector('#kodland-setting-firstclass-template').value.trim() || DEFAULT_FIRST_CLASS_TEMPLATE,
      recordingStudentTemplate: modal.querySelector('#kodland-setting-recording-student-template').value.trim() || DEFAULT_RECORDING_STUDENT_TEMPLATE,
      recordingGroupTemplate: modal.querySelector('#kodland-setting-recording-group-template').value.trim() || DEFAULT_RECORDING_GROUP_TEMPLATE
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

  let apellido = 'Kodland';
  if (lessonDateInfo) {
    const capitalizedDay = lessonDateInfo.dayName.charAt(0).toUpperCase() + lessonDateInfo.dayName.slice(1);
    const hourOnly = lessonDateInfo.time.split(':')[0];
    apellido = `${capitalizedDay}${hourOnly}horas-Kodland`;
  } else {
    console.warn('[Export Contacts] ⚠️ No se pudo obtener el horario de la primera clase, usando "Kodland" como respaldo');
  }

  // Google Contacts import format that's confirmed to work: semicolon-separated,
  // with an empty "Name Prefix" column and phone as " +NUMBER" (one leading space).
  const rows = [['Name Prefix', 'First Name', 'Last Name', 'Phone 1 - Value']];

  Object.keys(studentGeneralInfoCache).forEach(studentId => {
    const data = studentGeneralInfoCache[studentId];
    if (!data) return;

    const nombre = (data.student_full_name || data.student_first_name || `Estudiante ${studentId}`).trim();
    const phoneRaw = data.parent_phone || data.student_phone || '';
    const formattedPhone = formatPhoneForWhatsApp(phoneRaw);

    if (!formattedPhone) {
      console.warn(`[Export Contacts] Sin teléfono válido para estudiante ${studentId}, se omite`);
      return;
    }

    // formatPhoneForWhatsApp may or may not include a leading "+" depending
    // on which same-named function wins (several files define one) - strip
    // it first so we always add exactly one, never two.
    const phoneDigitsOnly = String(formattedPhone).replace(/^\+/, '');

    rows.push(['', nombre, apellido, ` +${phoneDigitsOnly}`]);
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
  link.download = `contactos_${safeCourseName}_${groupId || 'grupo'}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`[Export Contacts] ✅ CSV descargado con ${rows.length - 1} contactos`);
}

// Function to inject the floating "Export contacts" button (once per group page)
function injectExportContactsButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showExportContacts) return;
  if (document.getElementById('kodland-export-contacts-button')) return;

  const button = document.createElement('button');
  button.id = 'kodland-export-contacts-button';
  button.className = 'kodland-toolbar-btn kodland-export-contacts-btn';
  button.setAttribute('title', uiText('exportContactsTooltip'));
  button.innerHTML = escapeHtml(uiText('exportContactsButton'));

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

  getOrCreateToolbar().appendChild(button);
  console.log('[Group Students Info] ✅ Botón "Exportar contactos" inyectado');
}

// Function to inject the floating "WhatsApp group link" status button.
// Shows whether the link has been captured for this group; clicking it
// lets the tutor view or manually paste/correct the link.
function injectWhatsAppGroupLinkButton() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showWaGroupLink) return;
  if (document.getElementById('kodland-wa-group-link-button')) return;

  const groupId = extractGroupId();

  const button = document.createElement('button');
  button.id = 'kodland-wa-group-link-button';
  button.className = 'kodland-toolbar-btn kodland-wa-group-link-btn';

  const refreshLabel = () => {
    const link = getGroupWhatsAppLink(groupId);
    const cachedChatLink = groupId ? getCachedGroupGeneralInfo(groupId)?.chat_link : null;
    const isAuto = !!(link && cachedChatLink && cachedChatLink === link);

    if (link) {
      button.innerHTML = escapeHtml(isAuto ? uiText('waGroupLinkAutoDetected') : uiText('waGroupLinkManual'));
    } else {
      button.innerHTML = escapeHtml(uiText('waGroupLinkPaste'));
    }
    button.setAttribute('title', link
      ? (isAuto ? uiText('waGroupLinkTooltipDetected', link) : uiText('waGroupLinkTooltipManual', link))
      : uiText('waGroupLinkTooltipNotDetected'));
  };

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!groupId) return;

    const current = getGroupWhatsAppLink(groupId) || '';
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
  getOrCreateToolbar().appendChild(button);
  console.log('[Group Students Info] ✅ Botón de link de WhatsApp del grupo inyectado');

  // Try to auto-detect the link (and cache the rest of the group info)
  // in the background; update the button label once we know either way.
  if (groupId) {
    fetchGroupGeneralInfo(groupId).then(() => refreshLabel());
  }
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

  console.log(`[Attendance] ${students.length} estudiantes encontrados, ${highlightedChips.length} chips resaltados encontrados`);

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
    console.warn(`[Attendance] ⚠️ La cantidad de estudiantes (${sortedStudents.length}) no coincide con la cantidad de chips (${sortedChips.length}). Puede haber desalineación - revisa los resultados con cuidado.`);
  }

  const results = { ok: [], failed: [], skipped: [] };

  for (let i = 0; i < sortedStudents.length; i++) {
    const student = sortedStudents[i];

    if (!isStudentEnrolled(student.container)) {
      console.log(`[Attendance] ⏭️ ${student.name} no está inscrito, se omite`);
      results.skipped.push(student.name);
      continue;
    }

    const chip = sortedChips[i];
    if (!chip) {
      console.warn(`[Attendance] ⚠️ No hay chip emparejado para ${student.name} (fila ${i})`);
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
      console.log(`[Attendance] ✅ ${student.name} marcado`);
      results.ok.push(student.name);
    } else {
      console.warn(`[Attendance] ⚠️ No se pudo marcar a ${student.name} (no apareció el menú)`);
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
  button.className = 'kodland-toolbar-btn kodland-attendance-btn';
  button.innerHTML = escapeHtml(uiText('attendanceButton'));
  button.setAttribute('title', uiText('attendanceTooltip'));

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

  getOrCreateToolbar().appendChild(button);
  console.log('[Group Students Info] ✅ Botón "Tomar asistencia" inyectado');
}

// Function to initialize the module
// ---------------------------------------------------------------------
// Broadcast messages to the WhatsApp GROUP (class starting, in class,
// graduation, group welcome). Since a WhatsApp group link can't carry a
// pre-filled message, we copy the text to the clipboard and open the
// group chat so the tutor just has to paste and send.
// ---------------------------------------------------------------------

// Opens (or reuses) the WhatsApp tab for a group. IMPORTANT: call this
// synchronously, as the very first thing in a click handler - before any
// `await` - otherwise the delay from fetching lesson times etc. can push
// window.open() outside the click's "user gesture" window and Chrome's
// popup blocker silently swallows it (no tab, no error, looks like the
// button "just doesn't work").
function openGroupWhatsApp(groupIdOverride = null) {
  const groupId = groupIdOverride || extractGroupId();
  const cachedLink = getGroupWhatsAppLink(groupId);

  // Open the tab synchronously no matter what, so it stays inside the
  // click's "user gesture" window and Chrome doesn't block it. If we
  // already have the link, great - open straight to the group's chat.
  const waWindow = window.open(cachedLink || 'https://web.whatsapp.com/', '_blank');

  if (cachedLink || !groupId) return waWindow;

  // We didn't have the link cached yet (common right when the schedule
  // modal opens on a page other than the group page itself, or if this
  // fires before the group page's initial fetch finished). Fetch it now
  // and redirect the tab we already opened once it resolves, instead of
  // silently leaving the tutor on generic WhatsApp Web with no chat open
  // (which is also why the queued message never gets pasted anywhere).
  fetchGroupGeneralInfo(groupId).then(() => {
    const link = getGroupWhatsAppLink(groupId);
    if (link && waWindow && !waWindow.closed) {
      waWindow.location = link;
    }
  });

  return waWindow;
}

// Copies the message and queues it for the WhatsApp Web autopaste script.
// Does NOT open any window - call openGroupWhatsApp() separately (and
// first) for that.
async function queueGroupBroadcastMessage(message) {
  // Always copy to clipboard too, as a fallback in case the auto-paste
  // script can't find WhatsApp Web's compose box (Ctrl+V still works then).
  try {
    await navigator.clipboard.writeText(message);
  } catch (error) {
    console.warn('[Broadcast] No se pudo copiar al portapapeles:', error);
  }

  // Queue the message so the WhatsApp Web autopaste script picks it up
  // and drops it into the compose box automatically.
  try {
    await chrome.storage.local.set({
      kodland_pending_wa_message: { message, timestamp: Date.now() }
    });
  } catch (error) {
    console.warn('[Broadcast] No se pudo guardar el mensaje pendiente para autopegado:', error);
  }
}

async function sendClassStartingBroadcast() {
  const groupId = extractGroupId();
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const nearestLesson = groupId ? await fetchNearestLessonForGroup(groupId) : null;
  const lessonDateInfo = nearestLesson ? formatLessonDateForMessage(nearestLesson.timetable_time) : null;
  const time = lessonDateInfo ? lessonDateInfo.time : (prompt(uiText('promptClassTime')) || '');

  const message = renderTemplate(getResolvedClassStartingTemplate(language, settings), {
    courseName,
    time,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}

async function sendFirstClassBroadcast() {
  const groupId = extractGroupId();
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const nearestLesson = groupId ? await fetchNearestLessonForGroup(groupId) : null;
  const lessonDateInfo = nearestLesson ? formatLessonDateForMessage(nearestLesson.timetable_time) : null;
  const time = lessonDateInfo ? lessonDateInfo.time : (prompt(uiText('promptClassTime')) || '');

  const message = renderTemplate(getResolvedFirstClassTemplate(language, settings), {
    courseName,
    time,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}

async function sendRecordingBroadcast() {
  const groupId = extractGroupId();
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const { link: recordingLink } = await getLastClassRecordingLink(groupId);
  if (!recordingLink) {
    alert(uiText('noRecordingLinkSent'));
    return;
  }

  const message = renderTemplate(getResolvedRecordingGroupTemplate(language, settings), {
    courseName,
    tutorName: settings.tutorName,
    recordingLink
  });

  await queueGroupBroadcastMessage(message);
}

async function sendInClassBroadcast() {
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const message = renderTemplate(getResolvedInClassTemplate(language, settings), {
    courseName,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}

async function sendGraduationBroadcast() {
  const groupId = extractGroupId();
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const lastLesson = groupId ? await fetchLastLessonForGroup(groupId) : null;
  const lastLessonInfo = lastLesson ? formatLessonDateForMessage(lastLesson.timetable_time) : null;
  const suggestedDate = lastLessonInfo ? `${lastLessonInfo.dayName} ${lastLessonInfo.fullDate}` : '';
  const suggestedTime = lastLessonInfo ? lastLessonInfo.time : '';

  const gradDate = prompt(uiText('promptGraduationDate'), suggestedDate);
  if (gradDate === null) return; // cancelled
  const gradTime = prompt(uiText('promptGraduationTime'), suggestedTime);
  if (gradTime === null) return; // cancelled

  const message = renderTemplate(getResolvedGraduationTemplate(language, settings), {
    courseName,
    gradDate,
    gradTime,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}

// Pluralize a Spanish weekday name for recurring-schedule phrasing
// ("domingo" -> "domingos", "sábado" -> "sábados", the rest stay the same:
// "los lunes", "los martes", etc.)
function pluralizeSpanishDay(dayName) {
  const lower = (dayName || '').toLowerCase();
  if (lower === 'sábado' || lower === 'sabado') return 'sábados';
  if (lower === 'domingo') return 'domingos';
  return lower;
}

// Build a natural-language recurring schedule line from a lesson's ISO
// date, e.g. "Domingos a las 8:00 a.m. (hora Colombia)"
function buildScheduleLine(isoDateStr) {
  if (!isoDateStr) return null;
  try {
    const date = new Date(isoDateStr);
    const dayNameRaw = new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: 'America/Bogota' }).format(date);
    const pluralDay = pluralizeSpanishDay(dayNameRaw);
    const capitalizedDay = pluralDay.charAt(0).toUpperCase() + pluralDay.slice(1);
    const time12hRaw = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' }).format(date);
    // Spanish Intl output is "8:00 a. m." - collapse to "8:00 a.m."
    const time12h = time12hRaw.replace(/\s*([ap])\.?\s*m\.?/i, (m, ap) => ` ${ap.toLowerCase()}.m.`);
    return `${capitalizedDay} a las ${time12h} (hora Colombia)`;
  } catch (error) {
    console.warn('[buildScheduleLine] Error formatting date:', error);
    return null;
  }
}

async function sendGroupWelcomeBroadcast() {
  const courseName = findCourseName() || uiText('courseNameFallback');
  const settings = getExtensionSettings();
  const language = getMessageLanguage();

  const message = renderTemplate(getResolvedGroupWelcomeTemplate(language, settings), {
    courseName,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}

// This runs on every bo.kodland.org page load, independent of group pages.
// Start listening for the auth token immediately, so it's ready by the
// time the tutor lands on a group page.
captureAuthToken();

// ---------------------------------------------------------------------
// Schedule modal buttons ("Información de la clase" popup, shown from the
// teacher's schedule/calendar tab: bo.kodland.org/teachers/{id}?tab=2).
// Unlike the group page, this modal can appear on any bo.kodland.org page,
// so we watch for it globally instead of gating on isGroupPage().
// ---------------------------------------------------------------------

function extractScheduleModalInfo(modalCard) {
  const groupLink = modalCard.querySelector('a[href^="/groups/"]');
  const courseLink = modalCard.querySelector('a[href^="/courses/"]');

  let groupId = null;
  if (groupLink) {
    const match = groupLink.getAttribute('href').match(/\/groups\/(\d+)/);
    if (match) groupId = match[1];
  }

  let courseName = null;
  if (courseLink) {
    const fullText = courseLink.textContent.trim();
    const match = fullText.match(/\]\s*(.+?)\s*\[/);
    courseName = match ? match[1].trim() : fullText;
  }

  // The "Hora de la clase:" row contains a span like "10:00 - 11:00", but
  // relying on "the first <span> in the row" is fragile - if the label
  // itself is also wrapped in a <span> (common with Vuetify), that grabs
  // "Hora de la clase:" instead of the actual time. Strip the known label
  // text out of the row's full text instead, so it doesn't matter which
  // element holds the value.
  let time = null;
  modalCard.querySelectorAll('.v-row').forEach(row => {
    const rowText = row.textContent || '';
    if (rowText.includes('Hora de la clase')) {
      const cleaned = rowText.replace(/Hora de la clase\s*:?/i, '').trim();
      if (cleaned) time = cleaned;
    }
  });

  return { groupId, courseName, time };
}

function injectScheduleModalButtons(modalCard) {
  if (modalCard.querySelector('.kodland-schedule-modal-buttons')) return;
  if (!getExtensionSettings().showBroadcastButtons) return;

  const actionsRow = modalCard.querySelector('.v-card-actions');
  if (!actionsRow) return;

  const info = extractScheduleModalInfo(modalCard);
  if (!info.groupId) return; // nothing we can do without knowing the group

  // This modal can appear on pages other than the group page itself (see
  // watchForScheduleModal below), where the group-page init never ran - so
  // the WhatsApp link might not be auto-detected yet. Kick it off here too
  // (cheap no-op if already cached).
  fetchGroupGeneralInfo(info.groupId);

  const settings = getExtensionSettings();

  const wrapper = document.createElement('div');
  wrapper.className = 'kodland-schedule-modal-buttons';

  const language = getMessageLanguage();

  const classStartingBtn = document.createElement('button');
  classStartingBtn.className = 'kodland-wa-btn';
  classStartingBtn.innerHTML = escapeHtml(uiText('broadcastClassStartingButton'));
  classStartingBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    openGroupWhatsApp(info.groupId);

    let timeOnly = (info.time || '').split('-')[0].trim();
    if (!timeOnly) {
      // Same fallback the toolbar's "Aviso de clase" button uses: try the
      // schedule API first, then just ask the tutor directly, instead of
      // silently sending a message with a missing time.
      const nearestLesson = await fetchNearestLessonForGroup(info.groupId);
      const lessonDateInfo = nearestLesson ? formatLessonDateForMessage(nearestLesson.timetable_time) : null;
      timeOnly = lessonDateInfo
        ? lessonDateInfo.time
        : (prompt(uiText('promptClassTime')) || '');
    }

    const message = renderTemplate(getResolvedClassStartingTemplate(language, settings), {
      courseName: info.courseName || uiText('courseNameFallback'),
      time: timeOnly,
      tutorName: settings.tutorName
    });
    await queueGroupBroadcastMessage(message);
  });

  const inClassBtn = document.createElement('button');
  inClassBtn.className = 'kodland-wa-btn kodland-open-btn';
  inClassBtn.innerHTML = escapeHtml(uiText('broadcastInClassButton'));
  inClassBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    openGroupWhatsApp(info.groupId);
    const message = renderTemplate(getResolvedInClassTemplate(language, settings), {
      courseName: info.courseName || uiText('courseNameFallback'),
      tutorName: settings.tutorName
    });
    await queueGroupBroadcastMessage(message);
  });

  wrapper.appendChild(classStartingBtn);
  wrapper.appendChild(inClassBtn);

  // Put the buttons right above the "Cerrar / Completado" actions row
  actionsRow.parentElement.insertBefore(wrapper, actionsRow);
}

// ---------------------------------------------------------------------
// Shared DOM watcher
// ---------------------------------------------------------------------
// Two different features used to each run their own MutationObserver on
// the whole document.body (the schedule-modal watcher below, and the
// student-row processor further down) - both reacting to literally every
// mutation on the page, with no debounce. On a page with a lot of Vue
// re-rendering (like the student list), that's two full callback passes
// per tick, most of which find nothing new. This keeps ONE observer,
// debounced so a burst of mutations from a single re-render only triggers
// one pass, and fans out to whichever features are currently registered.
const domWatchCallbacks = new Set();
let sharedDomObserver = null;
let sharedDomDebounceId = null;

function runDomWatchCallbacks() {
  for (const callback of Array.from(domWatchCallbacks)) {
    try {
      callback();
    } catch (error) {
      console.error('[DOM Watcher] Error in a registered check:', error);
    }
  }
}

function registerDomWatcher(callback) {
  domWatchCallbacks.add(callback);

  if (!sharedDomObserver) {
    sharedDomObserver = new MutationObserver(() => {
      clearTimeout(sharedDomDebounceId);
      sharedDomDebounceId = setTimeout(runDomWatchCallbacks, 200);
    });
    sharedDomObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Run once immediately too, in case the relevant DOM is already there.
  try {
    callback();
  } catch (error) {
    console.error('[DOM Watcher] Error in initial check:', error);
  }
}

function unregisterDomWatcher(callback) {
  domWatchCallbacks.delete(callback);
  if (domWatchCallbacks.size === 0 && sharedDomObserver) {
    sharedDomObserver.disconnect();
    sharedDomObserver = null;
  }
}

function watchForScheduleModal() {
  const check = () => {
    document.querySelectorAll('.v-card-title').forEach(title => {
      if (title.textContent.includes('Información de la clase')) {
        const card = title.closest('.v-card');
        if (card) injectScheduleModalButtons(card);
      }
    });
  };

  registerDomWatcher(check); // also runs `check` once immediately
}

// This runs on every bo.kodland.org page load, independent of group pages
watchForScheduleModal();

function injectBroadcastButtons() {
  if (!isGroupPage()) return;
  if (!getExtensionSettings().showBroadcastButtons) return;
  if (document.getElementById('kodland-broadcast-class-starting')) return;

  const wrapper = getOrCreateToolbar();

  const buttonsConfig = [
    { id: 'kodland-broadcast-first-class', labelKey: 'broadcastFirstClassButton', titleKey: 'broadcastFirstClassTooltip', handler: sendFirstClassBroadcast },
    { id: 'kodland-broadcast-class-starting', labelKey: 'broadcastClassStartingButton', titleKey: 'broadcastClassStartingTooltip', handler: sendClassStartingBroadcast },
    { id: 'kodland-broadcast-in-class', labelKey: 'broadcastInClassButton', titleKey: 'broadcastInClassTooltip', handler: sendInClassBroadcast },
    { id: 'kodland-broadcast-graduation', labelKey: 'broadcastGraduationButton', titleKey: 'broadcastGraduationTooltip', handler: sendGraduationBroadcast },
    { id: 'kodland-broadcast-group-welcome', labelKey: 'broadcastGroupWelcomeButton', titleKey: 'broadcastGroupWelcomeTooltip', handler: sendGroupWelcomeBroadcast },
    { id: 'kodland-broadcast-recording', labelKey: 'broadcastRecordingButton', titleKey: 'broadcastRecordingTooltip', handler: sendRecordingBroadcast }
  ];

  buttonsConfig.forEach(cfg => {
    const button = document.createElement('button');
    button.id = cfg.id;
    button.className = 'kodland-broadcast-btn';
    button.innerHTML = escapeHtml(uiText(cfg.labelKey));
    button.setAttribute('title', uiText(cfg.titleKey));

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Open the WhatsApp tab first, synchronously, so the popup blocker
      // still counts this as a direct result of the click - the message
      // gets queued for autopaste a moment later, once it's ready.
      openGroupWhatsApp();
      button.disabled = true;
      try {
        await cfg.handler();
      } catch (error) {
        console.error(`[Broadcast] Error en ${cfg.id}:`, error);
        alert(uiText('broadcastGenericError'));
      } finally {
        button.disabled = false;
      }
    });

    wrapper.appendChild(button);
  });

  console.log('[Group Students Info] ✅ Botones de difusión al grupo inyectados');
}

function initGroupStudentsInfo() {
  // Only run on group pages
  if (!isGroupPage()) {
    console.log('[Group Students Info] Not a group page, skipping');
    return;
  }
  
  console.log('[Group Students Info] Initializing on group page');
  
  // (Auth token capture already started globally when the script loaded -
  // no need to call captureAuthToken() again here.)

  // Kick off the group general info fetch as early as possible - it's what
  // auto-detects the WhatsApp chat_link, and backs up the course name and
  // other data used further down. Buttons that need it (WA link button,
  // schedule modal) just re-read the cache once this resolves.
  const initialGroupId = extractGroupId();
  if (initialGroupId) {
    fetchGroupGeneralInfo(initialGroupId);
  }
  
  // All of the following share one toolbar (#kodland-broadcast-buttons)
  // fixed at the top of the page. Order here = left-to-right order there.
  // Each one is wrapped separately so that if one throws, it doesn't take
  // down the rest of init (which previously meant one bad button could
  // silently cancel every button after it - AND the student-row
  // processing scheduled below, since that never got to run either).
  const safeInject = (label, fn) => {
    try {
      fn();
    } catch (error) {
      console.error(`[Group Students Info] Error inyectando "${label}":`, error);
    }
  };

  // Broadcast buttons first (class starting, in class, graduation, group welcome)
  safeInject('broadcast', injectBroadcastButtons);

  // Settings button (always visible, so the tutor can re-enable hidden buttons)
  safeInject('settings', injectSettingsButton);

  // Export contacts
  safeInject('export contacts', injectExportContactsButton);

  // Group grading report
  safeInject('grading report', injectGroupGradingReportButton);

  // WhatsApp group link status/paste button
  safeInject('wa group link', injectWhatsAppGroupLinkButton);

  // Take attendance
  safeInject('attendance', injectTakeAttendanceButton);
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(processAllStudents, 1000);
    });
  } else {
    setTimeout(processAllStudents, 1000);
  }
  
  // Use the shared DOM watcher to detect when new students are added
  // dynamically (see registerDomWatcher above)
  let intervalId = null;

  const studentWatchCheck = () => {
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
  };

  registerDomWatcher(studentWatchCheck);
  
  // Also try processing periodically for the first 30 seconds, but only if there are unprocessed students
  let attempts = 0;
  const maxAttempts = 20;
  intervalId = setInterval(() => {
    if (!isGroupPage()) {
      clearInterval(intervalId);
      unregisterDomWatcher(studentWatchCheck);
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
      unregisterDomWatcher(studentWatchCheck);
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

