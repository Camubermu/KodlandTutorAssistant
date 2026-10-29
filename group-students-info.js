


var authToken = (typeof authToken !== 'undefined' && authToken) ? authToken : null;


const DEFAULT_MESSAGE_LANGUAGE = 'auto';


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


const RTL_LANGUAGES = ['ar'];


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


function applyLanguageDirection(element, language = getMessageLanguage()) {
  if (!element) return element;
  element.setAttribute('lang', language);
  element.setAttribute('dir', isRtlLanguage(language) ? 'rtl' : 'ltr');
  return element;
}


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
      `które rozpoczną się w ${dayName}, ${fullDate}, o ${time} (czasu ${timezoneLabel})`,
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
    pl: 'które rozpoczną się już wkrótce',
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
  settingGroqApiKey: {
    es: 'Clave de IA (Groq) para comentarios:', en: 'AI (Groq) key for comments:',
    ar: 'مفتاح الذكاء الاصطناعي (Groq) للتعليقات:', ru: 'Ключ ИИ (Groq) для комментариев:',
    fr: "Clé IA (Groq) pour les commentaires :", tr: 'Yorumlar için yapay zeka (Groq) anahtarı:',
    id: 'Kunci AI (Groq) untuk komentar:', it: 'Chiave IA (Groq) per i commenti:',
    pl: 'Klucz AI (Groq) do komentarzy:', pt: 'Chave de IA (Groq) para comentários:'
  },
  settingGroqApiKeyHelp: {
    es: 'Opcional, solo para el botón "Calificar y comentar (IA)":<br>1) Entra a <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> e inicia sesión (gratis, sin tarjeta).<br>2) Pulsa "Create API Key" y copia la clave (empieza con gsk_...).<br>3) Pégala arriba y guarda.',
    en: 'Optional, only for the "Grade and comment (AI)" button:<br>1) Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> and sign in (free, no card needed).<br>2) Click "Create API Key" and copy the key (starts with gsk_...).<br>3) Paste it above and save.',
    ar: 'اختياري، فقط لزر "تصحيح وتعليق (ذكاء اصطناعي)":<br>1) ادخل إلى <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> وسجّل الدخول (مجاني، بدون بطاقة).<br>2) اضغط "Create API Key" وانسخ المفتاح (يبدأ بـ gsk_...).<br>3) الصقه في الأعلى واحفظ.',
    ru: 'Необязательно, нужен только для кнопки «Проверить и прокомментировать (ИИ)»:<br>1) Перейдите на <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> и войдите (бесплатно, без карты).<br>2) Нажмите «Create API Key» и скопируйте ключ (начинается с gsk_...).<br>3) Вставьте его выше и сохраните.',
    fr: 'Facultatif, uniquement pour le bouton « Corriger et commenter (IA) » :<br>1) Va sur <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> et connecte-toi (gratuit, sans carte).<br>2) Clique sur « Create API Key » et copie la clé (commence par gsk_...).<br>3) Colle-la ci-dessus et enregistre.',
    tr: 'İsteğe bağlı, yalnızca "Notlandır ve yorum yap (YZ)" düğmesi için:<br>1) <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> adresine git ve giriş yap (ücretsiz, kart gerekmez).<br>2) "Create API Key"e tıkla ve anahtarı kopyala (gsk_... ile başlar).<br>3) Yukarı yapıştır ve kaydet.',
    id: 'Opsional, hanya untuk tombol "Nilai dan beri komentar (AI)":<br>1) Buka <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> dan masuk (gratis, tanpa kartu).<br>2) Klik "Create API Key" lalu salin kuncinya (diawali gsk_...).<br>3) Tempel di atas lalu simpan.',
    it: 'Facoltativo, solo per il pulsante "Correggi e commenta (IA)":<br>1) Vai su <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> e accedi (gratis, senza carta).<br>2) Clicca "Create API Key" e copia la chiave (inizia con gsk_...).<br>3) Incollala sopra e salva.',
    pl: 'Opcjonalne, tylko dla przycisku „Oceń i skomentuj (AI)”:<br>1) Wejdź na <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> i zaloguj się (bezpłatnie, bez karty).<br>2) Kliknij „Create API Key” i skopiuj klucz (zaczyna się od gsk_...).<br>3) Wklej go powyżej i zapisz.',
    pt: 'Opcional, apenas para o botão "Corrigir e comentar (IA)":<br>1) Acesse <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">console.groq.com/keys</a> e faça login (grátis, sem cartão).<br>2) Clique em "Create API Key" e copie a chave (começa com gsk_...).<br>3) Cole-a acima e salve.'
  },
  allGroupsAskTeacherId: {
    es: 'No pude detectar tu ID de tutor automáticamente. Escríbelo (es el número que aparece en la dirección de tu perfil del BO):',
    en: "Couldn't detect your tutor ID automatically. Type it in (it's the number shown in your BO profile's address):",
    ar: 'تعذّر اكتشاف رقم المعلّم تلقائيًا. اكتبه (هو الرقم الظاهر في عنوان صفحة ملفك في BO):',
    ru: 'Не удалось определить ваш ID преподавателя автоматически. Введите его (это номер в адресе вашего профиля в BO):',
    fr: "Impossible de détecter automatiquement ton ID de tuteur. Saisis-le (c'est le numéro dans l'adresse de ton profil BO) :",
    tr: 'Öğretmen ID\'niz otomatik algılanamadı. Elle yazın (BO profilinizin adresinde görünen sayı):',
    id: 'Tidak dapat mendeteksi ID tutor secara otomatis. Ketik secara manual (angka yang muncul di alamat profil BO Anda):',
    it: 'Non sono riuscito a rilevare automaticamente il tuo ID tutor. Scrivilo (è il numero nell\'indirizzo del tuo profilo BO):',
    pl: 'Nie udało się automatycznie wykryć Twojego ID nauczyciela. Wpisz je (to numer widoczny w adresie Twojego profilu BO):',
    pt: 'Não consegui detectar seu ID de tutor automaticamente. Digite-o (é o número que aparece no endereço do seu perfil no BO):'
  },
  settingCalendarTitle: {
    es: '📅 Google Calendar (opcional)', en: '📅 Google Calendar (optional)', ar: '📅 تقويم Google (اختياري)',
    ru: '📅 Google Календарь (необязательно)', fr: '📅 Google Agenda (facultatif)', tr: '📅 Google Takvim (isteğe bağlı)',
    id: '📅 Google Kalender (opsional)', it: '📅 Google Calendar (facoltativo)', pl: '📅 Kalendarz Google (opcjonalnie)',
    pt: '📅 Google Agenda (opcional)'
  },
  settingCalendarHelp: {
    es: 'Agrega tus clases a TU calendario de Google automáticamente (solo el nombre del grupo y el horario — nada de alumnos), con aviso 1 hora antes. Requiere crear un pequeño script gratis en tu cuenta de Google, una sola vez: sigue <code>calendario-google/PASOS.md</code> en el repo. Pega aquí la URL que te da el último paso.',
    en: 'Automatically adds your classes to YOUR Google calendar (just the group name and time — no student data), with a reminder 1 hour before. Requires creating a small free script in your own Google account, once: follow <code>calendario-google/PASOS.md</code> in the repo. Paste the URL from the last step here.',
    ar: 'يضيف حصصك تلقائيًا إلى تقويم Google الخاص بك (فقط اسم المجموعة والوقت، بلا بيانات طلاب)، مع تنبيه قبل ساعة. يتطلب إنشاء سكربت صغير مجاني في حسابك في Google مرة واحدة: اتبع <code>calendario-google/PASOS.md</code> في المستودع. الصق هنا الرابط من الخطوة الأخيرة.',
    ru: 'Автоматически добавляет твои занятия в ТВОЙ календарь Google (только название группы и время — без данных об учениках), с напоминанием за 1 час. Нужно один раз создать небольшой бесплатный скрипт в своём аккаунте Google: следуй <code>calendario-google/PASOS.md</code> в репозитории. Вставь сюда ссылку с последнего шага.',
    fr: "Ajoute automatiquement tes cours à TON agenda Google (juste le nom du groupe et l'horaire — aucune donnée d'élève), avec un rappel 1 heure avant. Nécessite de créer une seule fois un petit script gratuit sur ton compte Google : suis <code>calendario-google/PASOS.md</code> dans le dépôt. Colle ici l'URL de la dernière étape.",
    tr: 'Derslerini otomatik olarak KENDİ Google takvimine ekler (sadece grup adı ve saat — öğrenci verisi yok), 1 saat önceden hatırlatma ile. Google hesabınızda bir kez küçük ücretsiz bir script oluşturmanız gerekir: depodaki <code>calendario-google/PASOS.md</code> dosyasını izleyin. Son adımdaki URL\'yi buraya yapıştırın.',
    id: 'Menambahkan kelasmu secara otomatis ke kalender Google MILIKMU (hanya nama grup dan waktu — tanpa data siswa), dengan pengingat 1 jam sebelumnya. Perlu membuat skrip kecil gratis di akun Google-mu sendiri, sekali saja: ikuti <code>calendario-google/PASOS.md</code> di repo. Tempel URL dari langkah terakhir di sini.',
    it: 'Aggiunge automaticamente le tue lezioni al TUO calendario Google (solo nome del gruppo e orario — nessun dato sugli studenti), con promemoria 1 ora prima. Richiede di creare uno piccolo script gratuito nel tuo account Google, una sola volta: segui <code>calendario-google/PASOS.md</code> nel repository. Incolla qui l\'URL dell\'ultimo passaggio.',
    pl: 'Automatycznie dodaje Twoje zajęcia do TWOJEGO kalendarza Google (tylko nazwa grupy i godzina — bez danych uczniów), z przypomnieniem godzinę wcześniej. Wymaga jednorazowego utworzenia małego, darmowego skryptu na Twoim koncie Google: postępuj zgodnie z <code>calendario-google/PASOS.md</code> w repozytorium. Wklej tutaj adres URL z ostatniego kroku.',
    pt: 'Adiciona suas aulas automaticamente ao SEU calendário do Google (só o nome do grupo e o horário — nenhum dado de aluno), com aviso 1 hora antes. Requer criar um pequeno script grátis na sua própria conta do Google, uma única vez: siga <code>calendario-google/PASOS.md</code> no repositório. Cole aqui a URL do último passo.'
  },
  settingCalendarUrl: {
    es: 'URL de tu aplicación web (termina en /exec):', en: 'Your web app URL (ends in /exec):',
    ar: 'رابط تطبيق الويب الخاص بك (ينتهي بـ /exec):', ru: 'URL твоего веб-приложения (заканчивается на /exec):',
    fr: 'URL de ton application web (se termine par /exec) :', tr: 'Web uygulaması URL\'niz (/exec ile biter):',
    id: 'URL aplikasi web Anda (diakhiri /exec):', it: 'URL della tua app web (termina con /exec):',
    pl: 'Adres URL Twojej aplikacji internetowej (kończy się na /exec):', pt: 'URL do seu aplicativo da web (termina em /exec):'
  },
  settingCalendarKey: {
    es: 'Tu clave (pégala en el script):', en: 'Your key (paste it into the script):',
    ar: 'مفتاحك (الصقه في السكربت):', ru: 'Твой ключ (вставь его в скрипт):',
    fr: 'Ta clé (colle-la dans le script) :', tr: 'Anahtarınız (betiğe yapıştırın):',
    id: 'Kunci Anda (tempel ke dalam skrip):', it: 'La tua chiave (incollala nello script):',
    pl: 'Twój klucz (wklej go do skryptu):', pt: 'Sua chave (cole no script):'
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

  calificarMaxButton: {
    es: '✅ Calificar (nota máxima)', en: '✅ Grade (max score)', ar: '✅ تصحيح (أعلى درجة)',
    ru: '✅ Поставить максимум', fr: '✅ Corriger (note max)', tr: '✅ Notlandır (en yüksek puan)',
    id: '✅ Nilai (skor maks)', it: '✅ Correggi (voto massimo)', pl: '✅ Oceń (maks. punktów)',
    pt: '✅ Corrigir (nota máxima)'
  },
  calificarComentarButton: {
    es: '💬 Calificar y comentar', en: '💬 Grade and comment', ar: '💬 تصحيح وتعليق',
    ru: '💬 Проверить и прокомментировать', fr: '💬 Corriger et commenter', tr: '💬 Notlandır ve yorum yap',
    id: '💬 Nilai dan beri komentar', it: '💬 Correggi e commenta', pl: '💬 Oceń i skomentuj',
    pt: '💬 Corrigir e comentar'
  },
  calificarIaButton: {
    es: '🤖 Calificar y comentar (IA)', en: '🤖 Grade and comment (AI)', ar: '🤖 تصحيح وتعليق (ذكاء اصطناعي)',
    ru: '🤖 Проверить и прокомментировать (ИИ)', fr: '🤖 Corriger et commenter (IA)',
    tr: '🤖 Notlandır ve yorum yap (YZ)', id: '🤖 Nilai dan beri komentar (AI)',
    it: '🤖 Correggi e commenta (IA)', pl: '🤖 Oceń i skomentuj (AI)', pt: '🤖 Corrigir e comentar (IA)'
  },
  calificarConfirm: {
    es: n => `Esto va a calificar ${n} tarea(s) pendientes de este grupo en Kodland. ¿Continuar?`,
    en: n => `This will grade ${n} pending task(s) in this group on Kodland. Continue?`,
    ar: n => `سيؤدي هذا إلى تصحيح ${n} مهمة معلّقة في هذه المجموعة على Kodland. هل تريد المتابعة؟`,
    ru: n => `Будет выставлена оценка за ${n} ожидающих заданий этой группы в Kodland. Продолжить?`,
    fr: n => `Cela va corriger ${n} tâche(s) en attente de ce groupe sur Kodland. Continuer ?`,
    tr: n => `Bu, bu gruptaki ${n} bekleyen görevi Kodland'da notlandıracak. Devam edilsin mi?`,
    id: n => `Ini akan menilai ${n} tugas tertunda di grup ini pada Kodland. Lanjutkan?`,
    it: n => `Questo correggerà ${n} attività in sospeso di questo gruppo su Kodland. Continuare?`,
    pl: n => `To oceni ${n} oczekujących zadań tej grupy w Kodland. Kontynuować?`,
    pt: n => `Isso vai corrigir ${n} tarefa(s) pendente(s) deste grupo no Kodland. Continuar?`
  },
  calificarProgress: {
    es: (c, t) => `Calificando ${c}/${t}…`, en: (c, t) => `Grading ${c}/${t}…`,
    ar: (c, t) => `جارٍ التصحيح ${c}/${t}…`, ru: (c, t) => `Проверка ${c}/${t}…`,
    fr: (c, t) => `Correction ${c}/${t}…`, tr: (c, t) => `Notlandırılıyor ${c}/${t}…`,
    id: (c, t) => `Menilai ${c}/${t}…`, it: (c, t) => `Correggo ${c}/${t}…`,
    pl: (c, t) => `Ocenianie ${c}/${t}…`, pt: (c, t) => `Corrigindo ${c}/${t}…`
  },
  calificarDone: {
    es: (ok, t) => `Listo: ${ok} de ${t} tarea(s) calificada(s).`,
    en: (ok, t) => `Done: ${ok} of ${t} task(s) graded.`,
    ar: (ok, t) => `تم: ${ok} من ${t} مهمة تم تصحيحها.`,
    ru: (ok, t) => `Готово: оценено ${ok} из ${t} заданий.`,
    fr: (ok, t) => `Terminé : ${ok}/${t} tâche(s) corrigée(s).`,
    tr: (ok, t) => `Tamamlandı: ${t} görevden ${ok} tanesi notlandırıldı.`,
    id: (ok, t) => `Selesai: ${ok} dari ${t} tugas dinilai.`,
    it: (ok, t) => `Fatto: ${ok} di ${t} attività corrette.`,
    pl: (ok, t) => `Gotowe: oceniono ${ok} z ${t} zadań.`,
    pt: (ok, t) => `Pronto: ${ok} de ${t} tarefa(s) corrigida(s).`
  },
  calificarAlreadyDone: {
    es: 'ya comentada(s) antes', en: 'already commented before', ar: 'تم التعليق عليها سابقًا',
    ru: 'уже прокомментировано ранее', fr: 'déjà commentée(s) avant', tr: 'daha önce yorumlanmış',
    id: 'sudah dikomentari sebelumnya', it: 'già commentate in precedenza', pl: 'już wcześniej skomentowane',
    pt: 'já comentada(s) antes'
  },
  calificarWithErrors: {
    es: 'con error (ver consola)', en: 'with errors (see console)', ar: 'بها خطأ (راجع وحدة التحكم)',
    ru: 'с ошибкой (см. консоль)', fr: 'en erreur (voir la console)', tr: 'hatalı (konsolu kontrol et)',
    id: 'dengan error (lihat konsol)', it: 'con errore (vedi console)', pl: 'z błędem (zobacz konsolę)',
    pt: 'com erro (veja o console)'
  },
  calificarIaNotConfigured: {
    es: 'Falta configurar tu clave de IA (Groq) en Configuración antes de usar este botón.',
    en: 'Set up your AI (Groq) key in Settings before using this button.',
    ar: 'يجب إعداد مفتاح الذكاء الاصطناعي (Groq) في الإعدادات قبل استخدام هذا الزر.',
    ru: 'Перед использованием этой кнопки настройте ключ ИИ (Groq) в Настройках.',
    fr: "Configure ta clé IA (Groq) dans les Paramètres avant d'utiliser ce bouton.",
    tr: 'Bu düğmeyi kullanmadan önce Ayarlar\'da yapay zeka (Groq) anahtarını yapılandır.',
    id: 'Atur kunci AI (Groq) Anda di Pengaturan sebelum menggunakan tombol ini.',
    it: "Configura la tua chiave IA (Groq) nelle Impostazioni prima di usare questo pulsante.",
    pl: 'Skonfiguruj klucz AI (Groq) w Ustawieniach przed użyciem tego przycisku.',
    pt: 'Configure sua chave de IA (Groq) em Configurações antes de usar este botão.'
  },
  pdfReportButtonTooltip: {
    es: 'Generar reporte PDF', en: 'Generate PDF report', ar: 'إنشاء تقرير PDF', ru: 'Создать PDF-отчёт',
    fr: 'Générer le rapport PDF', tr: 'PDF raporu oluştur', id: 'Buat laporan PDF', it: 'Genera report PDF',
    pl: 'Wygeneruj raport PDF', pt: 'Gerar relatório em PDF'
  },
  pdfReportModalTitle: {
    es: (name) => `Reporte PDF · ${name}`, en: (name) => `PDF report · ${name}`,
    ar: (name) => `تقرير PDF · ${name}`, ru: (name) => `PDF-отчёт · ${name}`,
    fr: (name) => `Rapport PDF · ${name}`, tr: (name) => `PDF raporu · ${name}`,
    id: (name) => `Laporan PDF · ${name}`, it: (name) => `Report PDF · ${name}`,
    pl: (name) => `Raport PDF · ${name}`, pt: (name) => `Relatório PDF · ${name}`
  },
  pdfReportStatusLoading: {
    es: 'Consultando el curso y las lecciones realizadas…', en: 'Checking the course and completed lessons…',
    ar: 'جارٍ مراجعة الدورة والدروس المنجزة…', ru: 'Проверяем курс и пройденные уроки…',
    fr: 'Vérification du cours et des leçons terminées…', tr: 'Kurs ve tamamlanan dersler kontrol ediliyor…',
    id: 'Memeriksa kursus dan pelajaran yang telah diselesaikan…', it: 'Controllo del corso e delle lezioni completate…',
    pl: 'Sprawdzanie kursu i ukończonych lekcji…', pt: 'Consultando o curso e as aulas concluídas…'
  },
  pdfReportGeneralButton: {
    es: 'Generar reporte general', en: 'Generate general report', ar: 'إنشاء تقرير عام', ru: 'Создать общий отчёт',
    fr: 'Générer le rapport général', tr: 'Genel rapor oluştur', id: 'Buat laporan umum', it: 'Genera report generale',
    pl: 'Wygeneruj raport ogólny', pt: 'Gerar relatório geral'
  },
  pdfReportModuleLabel: {
    es: 'Módulo', en: 'Module', ar: 'الوحدة', ru: 'Модуль', fr: 'Module', tr: 'Modül',
    id: 'Modul', it: 'Modulo', pl: 'Moduł', pt: 'Módulo'
  },
  pdfReportModuleButton: {
    es: 'Generar reporte por módulo', en: 'Generate report by module', ar: 'إنشاء تقرير حسب الوحدة',
    ru: 'Создать отчёт по модулю', fr: 'Générer le rapport par module', tr: 'Modüle göre rapor oluştur',
    id: 'Buat laporan per modul', it: 'Genera report per modulo', pl: 'Wygeneruj raport dla modułu',
    pt: 'Gerar relatório por módulo'
  },
  pdfReportStatusReady: {
    es: (count) => `${count} módulo(s) disponible(s) hasta la fecha.`,
    en: (count) => `${count} module(s) available so far.`,
    ar: (count) => `الوحدات المتاحة حتى الآن: ${count}.`,
    ru: (count) => `Доступно модулей: ${count}.`,
    fr: (count) => `${count} module(s) disponible(s) à ce jour.`,
    tr: (count) => `Şu ana kadar ${count} modül mevcut.`,
    id: (count) => `${count} modul tersedia sejauh ini.`,
    it: (count) => `${count} modulo/i disponibile/i finora.`,
    pl: (count) => `Dostępnych modułów: ${count}.`,
    pt: (count) => `${count} módulo(s) disponível(is) até agora.`
  },
  pdfReportNoPhoneNote: {
    es: ' No hay teléfono de acudiente disponible; el PDF se podrá descargar sin abrir WhatsApp.',
    en: ' No parent phone number available; the PDF can still be downloaded without opening WhatsApp.',
    ar: ' لا يتوفر رقم هاتف ولي الأمر؛ يمكن تنزيل ملف PDF دون فتح واتساب.',
    ru: ' Номер телефона родителя недоступен; PDF можно скачать, не открывая WhatsApp.',
    fr: " Aucun numéro de téléphone du parent disponible ; le PDF pourra être téléchargé sans ouvrir WhatsApp.",
    tr: ' Veli telefon numarası mevcut değil; PDF, WhatsApp açılmadan da indirilebilir.',
    id: ' Nomor telepon orang tua tidak tersedia; PDF tetap bisa diunduh tanpa membuka WhatsApp.',
    it: ' Nessun numero di telefono del genitore disponibile; il PDF potrà comunque essere scaricato senza aprire WhatsApp.',
    pl: ' Brak numeru telefonu rodzica; PDF będzie można pobrać bez otwierania WhatsApp.',
    pt: ' Não há telefone do responsável disponível; o PDF poderá ser baixado sem abrir o WhatsApp.'
  },
  pdfReportLoadError: {
    es: 'No se pudieron cargar los datos del reporte.', en: "Couldn't load the report data.",
    ar: 'تعذّر تحميل بيانات التقرير.', ru: 'Не удалось загрузить данные отчёта.',
    fr: 'Impossible de charger les données du rapport.', tr: 'Rapor verileri yüklenemedi.',
    id: 'Gagal memuat data laporan.', it: 'Impossibile caricare i dati del report.',
    pl: 'Nie udało się wczytać danych raportu.', pt: 'Não foi possível carregar os dados do relatório.'
  },
  pdfReportGenerating: {
    es: 'Python está generando el PDF…', en: 'Python is generating the PDF…',
    ar: 'بايثون يقوم بإنشاء ملف PDF…', ru: 'Python создаёт PDF…',
    fr: 'Python génère le PDF…', tr: 'Python PDF oluşturuyor…',
    id: 'Python sedang membuat PDF…', it: 'Python sta generando il PDF…',
    pl: 'Python generuje PDF…', pt: 'Python está gerando o PDF…'
  },
  pdfReportScopeGeneral: {
    es: 'general', en: 'general', ar: 'عام', ru: 'общий', fr: 'général', tr: 'genel',
    id: 'umum', it: 'generale', pl: 'ogólny', pt: 'geral'
  },
  pdfReportScopeModule: {
    es: (n) => `del módulo ${n}`, en: (n) => `for module ${n}`, ar: (n) => `للوحدة ${n}`,
    ru: (n) => `по модулю ${n}`, fr: (n) => `du module ${n}`, tr: (n) => `${n}. modül için`,
    id: (n) => `untuk modul ${n}`, it: (n) => `del modulo ${n}`, pl: (n) => `dla modułu ${n}`,
    pt: (n) => `do módulo ${n}`
  },
  pdfReportTypeByModule: {
    es: 'por módulo', en: 'by module', ar: 'حسب الوحدة', ru: 'по модулю', fr: 'par module',
    tr: 'modüle göre', id: 'per modul', it: 'per modulo', pl: 'dla modułu', pt: 'por módulo'
  },
  pdfReportDoneStatus: {
    es: (scope) => `Python inició el reporte ${scope} en una ventana nueva. El PDF se abrirá al terminar.`,
    en: (scope) => `Python started the ${scope} report in a new window. The PDF will open when it's done.`,
    ar: (scope) => `بدأ بايثون إنشاء التقرير ${scope} في نافذة جديدة. سيُفتح ملف PDF عند الانتهاء.`,
    ru: (scope) => `Python начал формировать отчёт (${scope}) в новом окне. PDF откроется по завершении.`,
    fr: (scope) => `Python a lancé le rapport ${scope} dans une nouvelle fenêtre. Le PDF s'ouvrira une fois terminé.`,
    tr: (scope) => `Python, ${scope} raporu yeni bir pencerede başlattı. Bittiğinde PDF açılacak.`,
    id: (scope) => `Python memulai laporan ${scope} di jendela baru. PDF akan terbuka setelah selesai.`,
    it: (scope) => `Python ha avviato il report ${scope} in una nuova finestra. Il PDF si aprirà al termine.`,
    pl: (scope) => `Python rozpoczął tworzenie raportu ${scope} w nowym oknie. PDF otworzy się po zakończeniu.`,
    pt: (scope) => `Python iniciou o relatório ${scope} em uma nova janela. O PDF abrirá ao terminar.`
  },
  pdfReportWhatsappNote: {
    es: ' Ya abrí WhatsApp; adjunta el PDF cuando aparezca y pulsa Enviar.',
    en: ' I already opened WhatsApp; attach the PDF once it appears and hit Send.',
    ar: ' فتحتُ واتساب بالفعل؛ أرفق ملف PDF عند ظهوره واضغط إرسال.',
    ru: ' WhatsApp уже открыт; прикрепите PDF, когда он появится, и нажмите «Отправить».',
    fr: " J'ai déjà ouvert WhatsApp ; joignez le PDF dès qu'il apparaît et appuyez sur Envoyer.",
    tr: " WhatsApp'ı zaten açtım; PDF göründüğünde ekleyip Gönder'e basın.",
    id: ' Saya sudah membuka WhatsApp; lampirkan PDF setelah muncul lalu tekan Kirim.',
    it: ' Ho già aperto WhatsApp; allega il PDF non appena appare e premi Invia.',
    pl: ' WhatsApp jest już otwarty; dołącz PDF, gdy się pojawi, i naciśnij Wyślij.',
    pt: ' Já abri o WhatsApp; anexe o PDF quando aparecer e toque em Enviar.'
  },
  pdfReportBridgeError: {
    es: 'El puente Python no pudo generar el reporte.', en: "The Python bridge couldn't generate the report.",
    ar: 'تعذّر على جسر بايثون إنشاء التقرير.', ru: 'Мост Python не смог создать отчёт.',
    fr: "Le pont Python n'a pas pu générer le rapport.", tr: 'Python köprüsü raporu oluşturamadı.',
    id: 'Jembatan Python gagal membuat laporan.', it: 'Il bridge Python non è riuscito a generare il report.',
    pl: 'Mostek Python nie mógł wygenerować raportu.', pt: 'A ponte Python não conseguiu gerar o relatório.'
  },
  pdfReportGenerateError: {
    es: 'No se pudo generar el reporte con Python.', en: "Couldn't generate the report with Python.",
    ar: 'تعذّر إنشاء التقرير باستخدام بايثون.', ru: 'Не удалось создать отчёт через Python.',
    fr: "Impossible de générer le rapport avec Python.", tr: 'Python ile rapor oluşturulamadı.',
    id: 'Gagal membuat laporan dengan Python.', it: 'Impossibile generare il report con Python.',
    pl: 'Nie udało się wygenerować raportu za pomocą Pythona.', pt: 'Não foi possível gerar o relatório com Python.'
  },
  settingPdfReportTemplate: {
    es: '📄 Mensaje al compartir el reporte PDF:', en: '📄 Message when sharing the PDF report:',
    ar: '📄 الرسالة عند مشاركة تقرير PDF:', ru: '📄 Сообщение при отправке PDF-отчёта:',
    fr: '📄 Message lors du partage du rapport PDF :', tr: '📄 PDF raporu paylaşılırken gönderilecek mesaj:',
    id: '📄 Pesan saat membagikan laporan PDF:', it: '📄 Messaggio quando condividi il report PDF:',
    pl: '📄 Wiadomość przy udostępnianiu raportu PDF:', pt: '📄 Mensagem ao compartilhar o relatório PDF:'
  },


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


const processedStudents = new Set();


let isProcessingStudents = false;


function installAuthTokenInterceptorsFallback() {
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [url, options = {}] = args;
    

    if (options.headers) {
      let authHeader = null;
      

      if (options.headers instanceof Headers) {
        authHeader = options.headers.get('Authorization');
      } 

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
    

    const fetchPromise = originalFetch.apply(this, args);
    fetchPromise.then(response => {

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
  

  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (header.toLowerCase() === 'authorization' && value && value.startsWith('Bearer ')) {
      authToken = value.replace('Bearer ', '').trim();
    }
    return originalSetRequestHeader.apply(this, arguments);
  };
}

function captureAuthToken() {

  if (!window.__kodlandAuthInterceptorsInstalled) {
    window.__kodlandAuthInterceptorsInstalled = true;
    installAuthTokenInterceptorsFallback();
  }
  

  try {
    const keys = ['auth_token', 'token', 'access_token', 'bearer_token', 'jwt_token', 'api_token', 'accessToken', 'authToken'];
    for (const key of keys) {
      const storedToken = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (storedToken) {
        authToken = storedToken;
        break;
      }
    }
    

    if (!authToken) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          if (value && value.length > 50 && /^[A-Za-z0-9\-._~+/]+=*$/.test(value)) {

            authToken = value;
            break;
          }
        }
      } catch (e) {

      }
    }
  } catch (e) {
    console.warn('[Group Students Info] Could not access storage:', e);
  }
  

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
  

  try {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || script.innerHTML;

      const tokenMatch = content.match(/(?:bearer|token|auth)[\s:=]+['"]([A-Za-z0-9\-._~+/]+=*)['"]/i);
      if (tokenMatch && tokenMatch[1]) {
        authToken = tokenMatch[1];
        break;
      }
    }
  } catch (e) {
    console.warn('[Group Students Info] Could not search scripts:', e);
  }
  

  setTimeout(() => {
    if (!authToken) {
      console.warn('[Group Students Info] ⚠️ No token captured yet. Waiting for network requests...');

      setTimeout(() => {
        if (!authToken) {
          console.error('[Group Students Info] ❌ No Bearer token found. API requests may fail with 401.');
          console.log('[Group Students Info] 💡 Tip: Try refreshing the page or making an action that triggers an API call.');
        }
      }, 5000);
    }
  }, 1000);
}



const GROUP_INFO_CACHE_TTL_MS = 10 * 60 * 1000;
const groupInfoCache = new Map();
const groupInfoInFlight = new Map();


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


function getCachedGroupGeneralInfo(groupId) {
  const cached = groupInfoCache.get(groupId);
  return cached ? cached.data : null;
}


function getGroupMiroBoardUrl(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.group_miro_board_url || null;
}

function getGroupTeacherName(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.group_teacher?.full_name || null;
}

function getGroupPredictedEndDate(groupId) {
  return getCachedGroupGeneralInfo(groupId)?.predicted_end_date || null;
}




function getGroupWhatsAppLink(groupIdOverride = null) {
  const groupId = groupIdOverride || extractGroupId();
  if (!groupId) return null;
  return localStorage.getItem(`kodland_wa_group_link_${groupId}`) || null;
}


function isGroupPage() {
  const url = window.location.href;
  return /https?:\/\/bo\.kodland\.org\/groups\/\d+/.test(url);
}


function extractGroupId() {
  const url = window.location.href;
  const match = url.match(/\/groups\/(\d+)/);
  return match ? match[1] : null;
}


function extractStudentId(linkElement) {
  if (!linkElement) return null;
  
  const href = linkElement.getAttribute('href');
  if (!href) return null;
  

  const match = href.match(/\/students\/(\d+)/);
  return match ? match[1] : null;
}


function findStudentElements() {

  const studentLinks = [];
  

  const allLinks = document.querySelectorAll('a[href^="/students/"]');
  
  for (const link of allLinks) {
    const studentId = extractStudentId(link);
    if (studentId) {

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


async function fetchStudentInfo(studentId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/get_general_info_for_student_backoffice_page/`;
  
  try {
    

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {

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
      credentials: 'include',
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


async function fetchHomeworkModulesProgress(studentId, groupId) {
  const apiUrl = `https://backoffice.kodland.org/api/v2/students/${studentId}/group/${groupId}/get_progress_for_homework_modules/`;
  
  try {
    

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    

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
  

  console.warn('[getCompletedLessonsCount] ❌ Could not find completed lessons count - returning null');
  return null;
}


function extractLessonIds(modulesData, maxLessons = null) {

  const lessonIds = [];
  const seen = new Set();
  
  if (!modulesData) {
    console.warn('[extractLessonIds] No modules data provided');
    return [];
  }
  

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
    

    if (obj.hasOwnProperty('lesson_id')) addLessonId(obj.lesson_id, path);
    if (obj.hasOwnProperty('lessonId')) addLessonId(obj.lessonId, path);
    if (obj.hasOwnProperty('id') && path.includes('lesson')) addLessonId(obj.id, path);
    

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


function organizeTasksByModules(modulesData, tasksData) {
  const organized = {};
  

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

    tasksData.forEach(taskData => {

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


function calculateTaskPercentages(organizedData) {
  let totalHomework = 0;
  let submittedHomework = 0;
  let totalClass = 0;
  let submittedClass = 0;
  
  Object.values(organizedData).forEach(module => {
    module.lessons.forEach(lesson => {

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
  

  if (homeworkPercentage === 100 && classPercentage === 100) {
    message += msg.allCompleted;
  } else if (homeworkPercentage < 50 || classPercentage < 50) {
    message += msg.lowPercentage;
  } else {
    message += msg.regularPercentage;
  }
  
  return message;
}


function showTasksModal(studentId, modulesData, tasksData, onRefresh = null) {

  const existingModal = document.getElementById('kodland-tasks-modal');
  if (existingModal) {
    existingModal.remove();
  }
  

  const detectedLang = getMessageLanguage();
  const organizedData = organizeTasksByModules(modulesData, tasksData);


  const studentName = document.querySelector(`a[href="/students/${studentId}"] h3`)?.textContent?.trim() || uiText('studentWithId', studentId);


  const modal = document.createElement('div');
  modal.id = 'kodland-tasks-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal, detectedLang);


  const modalContent = document.createElement('div');
  modalContent.className = 'kodland-modal-content';
  

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


  const percentages = calculateTaskPercentages(organizedData);
  

  const lessonsCompleted = Object.values(organizedData).reduce((total, module) => {
    return total + module.lessons.length;
  }, 0);
  

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
  

  const body = document.createElement('div');
  body.className = 'kodland-modal-body';
  

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
    

    Object.values(organizedData).forEach(module => {
      module.lessons.forEach(lesson => {
        countInData(lesson.classTasks);
        countInData(lesson.homeworkTasks);
      });
    });
    
    return counts;
  }
  

  const taskCounts = countTasksByStatus(tasksData);

  filterBar.querySelector('#count-all').textContent = taskCounts.all;
  filterBar.querySelector('#count-submitted').textContent = taskCounts.TASK_SUBMITTED;
  filterBar.querySelector('#count-checked').textContent = taskCounts.TASK_CHECKED;
  filterBar.querySelector('#count-not-submitted').textContent = taskCounts.TASK_NOT_SUBMITTED;
  filterBar.querySelector('#count-submitted-late').textContent = taskCounts.TASK_SUBMITTED_LATE;
  

  function hasMatchingTasks(tasksData, filterStatus) {
    if (!filterStatus) return true;
    
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
  

  function renderContent(filterStatus = null) {
    body.innerHTML = '';
    
    Object.values(organizedData).forEach((module, moduleIndex) => {
      const lessonsContainer = document.createElement('div');
      lessonsContainer.className = 'kodland-lessons-container';
      
      module.lessons.forEach((lesson, lessonIndex) => {

        const hasClassTasks = hasMatchingTasks(lesson.classTasks, filterStatus);
        const hasHomeworkTasks = hasMatchingTasks(lesson.homeworkTasks, filterStatus);
        

        if (!hasClassTasks && !hasHomeworkTasks && filterStatus !== null) {
          return;
        }
        
        const lessonCard = document.createElement('div');
        lessonCard.className = 'kodland-lesson-card';
        
        const lessonHeader = document.createElement('div');
        lessonHeader.className = 'kodland-lesson-header';
        lessonHeader.textContent = uiTextForLanguage('lessonCardHeader', detectedLang, lessonIndex + 1, lesson.id);
        lessonCard.appendChild(lessonHeader);


        if (lesson.classTasks && hasClassTasks) {
          const classTasksSection = document.createElement('div');
          classTasksSection.className = 'kodland-tasks-section kodland-class-tasks';
          classTasksSection.innerHTML = `<h4>${escapeHtml(uiTextForLanguage('classTasksHeading', detectedLang))}</h4>`;

          const classTasksList = renderTasksList(lesson.classTasks, filterStatus, studentId);
          classTasksSection.appendChild(classTasksList);
          lessonCard.appendChild(classTasksSection);
        }


        if (lesson.homeworkTasks && hasHomeworkTasks) {
          const homeworkTasksSection = document.createElement('div');
          homeworkTasksSection.className = 'kodland-tasks-section kodland-homework-tasks';
          homeworkTasksSection.innerHTML = `<h4>${escapeHtml(uiTextForLanguage('homeworkTasksHeading', detectedLang))}</h4>`;

          const homeworkTasksList = renderTasksList(lesson.homeworkTasks, filterStatus, studentId);
          homeworkTasksSection.appendChild(homeworkTasksList);
          lessonCard.appendChild(homeworkTasksSection);
        }

        if (!lesson.classTasks && !lesson.homeworkTasks) {
          lessonCard.innerHTML += `<p class="kodland-no-tasks">${escapeHtml(uiTextForLanguage('noTasksDataAvailable', detectedLang))}</p>`;
        }
        
        lessonsContainer.appendChild(lessonCard);
      });
      

      if (lessonsContainer.children.length > 0) {
        const moduleSection = document.createElement('div');
        moduleSection.className = 'kodland-module-section';
        moduleSection.innerHTML = `<h3>${module.name}</h3>`;
        moduleSection.appendChild(lessonsContainer);
        body.appendChild(moduleSection);
      }
    });
    

    if (body.children.length === 0 && filterStatus !== null) {
      body.innerHTML = `<p class="kodland-no-tasks" style="text-align: center; padding: 40px; font-size: 16px;">${escapeHtml(uiTextForLanguage('noTasksMatchFilter', detectedLang))}</p>`;
    }
  }
  

  renderContent(null);
  
  modalContent.appendChild(header);
  modalContent.appendChild(filterBar);
  modalContent.appendChild(body);
  modal.appendChild(modalContent);
  

  document.body.appendChild(modal);
  

  const filterButtons = filterBar.querySelectorAll('.kodland-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {

      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      

      const filterValue = btn.getAttribute('data-filter');
      const filterStatus = filterValue === 'all' ? null : filterValue;
      

      renderContent(filterStatus);
    });
  });


  const weeklySummaryBtn = header.querySelector('.kodland-weekly-summary-btn');
  if (weeklySummaryBtn) {
    weeklySummaryBtn.addEventListener('click', async () => {
      try {

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
        

        const message = generateWeeklySummaryMessage(studentName, lessonsCompleted, percentages, detectedLang);
        

        const formattedPhone = formatPhoneForWhatsApp(parentPhone);
        const phoneForUrl = formattedPhone.replace(/^\+/, '');
        

        const encodedMessage = encodeMessageForWhatsApp(message);
        

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
  

  const closeBtn = modal.querySelector('.kodland-modal-close');
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });
  

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  

  const escapeHandler = (e) => {
    if (e.key === 'Escape' && document.getElementById('kodland-tasks-modal')) {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  console.log('[Group Students Info] ✅ Modal displayed');
}


function renderTasksList(tasksData, filterStatus = null, studentId = null) {
  const list = document.createElement('div');
  list.className = 'kodland-tasks-list';
  
  if (!tasksData) {
    list.innerHTML = `<p>${escapeHtml(uiText('noData'))}</p>`;
    return list;
  }


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


  filteredTasks.forEach((task) => {
    const taskItem = document.createElement('div');
    taskItem.className = 'kodland-task-item';
    taskItem.setAttribute('data-task-status', task.task_status_key || task.status_key || '');


    const taskName = task.task_title || task.title || task.name || task.task_name || uiText('unnamedTask');
    const taskStatusKey = task.task_status_key || task.status_key || '';
    const taskStatusValue = task.task_status_value || task.status_value || task.status || uiText('unknownStatus');
    

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
    

    let gradeInfo = '';
    if (task.task_max_grade && task.task_max_grade > 0) {
      const currentGrade = task.task_current_grade || 0;
      gradeInfo = ` <span class="kodland-task-grade">(${currentGrade}/${task.task_max_grade})</span>`;
    }
    

    let taskLinkHtml = '';
    if (task.task_id && studentId) {
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


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


function formatPhoneForWhatsApp(phone) {
  if (!phone) return null;
  

  let cleanPhone = phone.replace(/[^\d+]/g, '');
  

  cleanPhone = cleanPhone.replace(/^0+/, '');
  

  if (!cleanPhone.startsWith('+')) {

    cleanPhone = '+' + cleanPhone;
  }
  
  return cleanPhone;
}


function getCountryCodeFromPhone(phone) {
  if (!phone) {
    console.warn('[getCountryCodeFromPhone] No phone provided');
    return null;
  }
  

  let cleanPhone = String(phone).replace(/[^\d+]/g, '');
  console.log('[getCountryCodeFromPhone] Cleaned phone:', cleanPhone);
  

  if (!cleanPhone.startsWith('+')) {

    if (/^\d+$/.test(cleanPhone)) {
      cleanPhone = '+' + cleanPhone;
      console.log('[getCountryCodeFromPhone] Added +, new phone:', cleanPhone);
    } else {
      console.warn('[getCountryCodeFromPhone] Phone does not start with + and is not all digits:', cleanPhone);
      return null;
    }
  }
  

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


function getCountryInitialsFromPhone(phone) {
  const countryCode = getCountryCodeFromPhone(phone);
  if (!countryCode) return '';
  

  const countryInitialsMap = {
    '1': 'US',
    '7': 'RU',
    '20': 'EG',
    '27': 'ZA',
    '30': 'GR',
    '31': 'NL',
    '32': 'BE',
    '33': 'FR',
    '34': 'ES',
    '39': 'IT',
    '40': 'RO',
    '41': 'CH',
    '43': 'AT',
    '44': 'GB',
    '45': 'DK',
    '46': 'SE',
    '47': 'NO',
    '48': 'PL',
    '49': 'DE',
    '51': 'PE',
    '52': 'MX',
    '53': 'CU',
    '54': 'AR',
    '55': 'BR',
    '56': 'CL',
    '57': 'CO',
    '58': 'VE',
    '60': 'MY',
    '61': 'AU',
    '62': 'ID',
    '63': 'PH',
    '64': 'NZ',
    '65': 'SG',
    '66': 'TH',
    '81': 'JP',
    '82': 'KR',
    '84': 'VN',
    '86': 'CN',
    '90': 'TR',
    '91': 'IN',
    '92': 'PK',
    '93': 'AF',
    '94': 'LK',
    '95': 'MM',
    '98': 'IR',
    '212': 'MA',
    '213': 'DZ',
    '216': 'TN',
    '218': 'LY',
    '220': 'GM',
    '221': 'SN',
    '222': 'MR',
    '223': 'ML',
    '224': 'GN',
    '225': 'CI',
    '226': 'BF',
    '227': 'NE',
    '228': 'TG',
    '229': 'BJ',
    '230': 'MU',
    '231': 'LR',
    '232': 'SL',
    '233': 'GH',
    '234': 'NG',
    '235': 'TD',
    '236': 'CF',
    '237': 'CM',
    '238': 'CV',
    '239': 'ST',
    '240': 'GQ',
    '241': 'GA',
    '242': 'CG',
    '243': 'CD',
    '244': 'AO',
    '245': 'GW',
    '246': 'IO',
    '248': 'SC',
    '249': 'SD',
    '250': 'RW',
    '251': 'ET',
    '252': 'SO',
    '253': 'DJ',
    '254': 'KE',
    '255': 'TZ',
    '256': 'UG',
    '257': 'BI',
    '258': 'MZ',
    '260': 'ZM',
    '261': 'MG',
    '262': 'RE',
    '263': 'ZW',
    '264': 'NA',
    '265': 'MW',
    '266': 'LS',
    '267': 'BW',
    '268': 'SZ',
    '269': 'KM',
    '290': 'SH',
    '291': 'ER',
    '297': 'AW',
    '298': 'FO',
    '299': 'GL',
    '350': 'GI',
    '351': 'PT',
    '352': 'LU',
    '353': 'IE',
    '354': 'IS',
    '355': 'AL',
    '356': 'MT',
    '357': 'CY',
    '358': 'FI',
    '359': 'BG',
    '360': 'HU',
    '370': 'LT',
    '371': 'LV',
    '372': 'EE',
    '373': 'MD',
    '374': 'AM',
    '375': 'BY',
    '376': 'AD',
    '377': 'MC',
    '378': 'SM',
    '380': 'UA',
    '381': 'RS',
    '382': 'ME',
    '383': 'XK',
    '385': 'HR',
    '386': 'SI',
    '387': 'BA',
    '389': 'MK',
    '420': 'CZ',
    '421': 'SK',
    '423': 'LI',
    '500': 'FK',
    '501': 'BZ',
    '502': 'GT',
    '503': 'SV',
    '504': 'HN',
    '505': 'NI',
    '506': 'CR',
    '507': 'PA',
    '509': 'HT',
    '590': 'GP',
    '591': 'BO',
    '592': 'GY',
    '593': 'EC',
    '594': 'GF',
    '595': 'PY',
    '596': 'MQ',
    '597': 'SR',
    '598': 'UY',
    '670': 'TL',
    '672': 'AQ',
    '673': 'BN',
    '674': 'NR',
    '675': 'PG',
    '676': 'TO',
    '677': 'SB',
    '678': 'VU',
    '679': 'FJ',
    '680': 'PW',
    '681': 'WF',
    '682': 'CK',
    '683': 'NU',
    '684': 'AS',
    '685': 'WS',
    '686': 'KI',
    '687': 'NC',
    '688': 'TV',
    '689': 'PF',
    '690': 'TK',
    '691': 'FM',
    '692': 'MH',
    '850': 'KP',
    '852': 'HK',
    '853': 'MO',
    '855': 'KH',
    '856': 'LA',
    '880': 'BD',
    '886': 'TW',
    '960': 'MV',
    '961': 'LB',
    '962': 'JO',
    '963': 'SY',
    '964': 'IQ',
    '965': 'KW',
    '966': 'SA',
    '967': 'YE',
    '968': 'OM',
    '970': 'PS',
    '971': 'AE',
    '972': 'IL',
    '973': 'BH',
    '974': 'QA',
    '975': 'BT',
    '976': 'MN',
    '977': 'NP',
    '992': 'TJ',
    '993': 'TM',
    '994': 'AZ',
    '995': 'GE',
    '996': 'KG',
    '998': 'UZ'
  };
  
  console.log(`[getCountryInitialsFromPhone] Looking for country code: "${countryCode}" (type: ${typeof countryCode}, length: ${countryCode.length})`);
  

  const codeStr = String(countryCode);
  if (countryInitialsMap.hasOwnProperty(codeStr)) {
    const initials = countryInitialsMap[codeStr];
    console.log(`[getCountryInitialsFromPhone] ✅ Found exact match for "${codeStr}": ${initials}`);
    return initials;
  }
  

  if (codeStr.length === 3) {
    if (countryInitialsMap.hasOwnProperty(codeStr)) {
      const initials = countryInitialsMap[codeStr];
      console.log(`[getCountryInitialsFromPhone] ✅ Found 3-digit match for "${codeStr}": ${initials}`);
      return initials;
    }
  }
  

  if (codeStr.length >= 2) {
    const twoDigit = codeStr.substring(0, 2);
    if (countryInitialsMap.hasOwnProperty(twoDigit)) {
      const initials = countryInitialsMap[twoDigit];
      console.log(`[getCountryInitialsFromPhone] ✅ Found 2-digit match for "${twoDigit}": ${initials}`);
      return initials;
    }
  }
  

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


function getCountryFlagFromPhone(phone) {
  const countryCode = getCountryCodeFromPhone(phone);
  if (!countryCode) return '';
  

  const countryCodeMap = {
    '1': '🇺🇸',
    '7': '🇷🇺',
    '20': '🇪🇬',
    '27': '🇿🇦',
    '30': '🇬🇷',
    '31': '🇳🇱',
    '32': '🇧🇪',
    '33': '🇫🇷',
    '34': '🇪🇸',
    '39': '🇮🇹',
    '40': '🇷🇴',
    '41': '🇨🇭',
    '43': '🇦🇹',
    '44': '🇬🇧',
    '45': '🇩🇰',
    '46': '🇸🇪',
    '47': '🇳🇴',
    '48': '🇵🇱',
    '49': '🇩🇪',
    '51': '🇵🇪',
    '52': '🇲🇽',
    '53': '🇨🇺',
    '54': '🇦🇷',
    '55': '🇧🇷',
    '56': '🇨🇱',
    '57': '🇨🇴',
    '58': '🇻🇪',
    '60': '🇲🇾',
    '61': '🇦🇺',
    '62': '🇮🇩',
    '63': '🇵🇭',
    '64': '🇳🇿',
    '65': '🇸🇬',
    '66': '🇹🇭',
    '81': '🇯🇵',
    '82': '🇰🇷',
    '84': '🇻🇳',
    '86': '🇨🇳',
    '90': '🇹🇷',
    '91': '🇮🇳',
    '92': '🇵🇰',
    '93': '🇦🇫',
    '94': '🇱🇰',
    '95': '🇲🇲',
    '98': '🇮🇷',
    '212': '🇲🇦',
    '213': '🇩🇿',
    '216': '🇹🇳',
    '218': '🇱🇾',
    '220': '🇬🇲',
    '221': '🇸🇳',
    '222': '🇲🇷',
    '223': '🇲🇱',
    '224': '🇬🇳',
    '225': '🇨🇮',
    '226': '🇧🇫',
    '227': '🇳🇪',
    '228': '🇹🇬',
    '229': '🇧🇯',
    '230': '🇲🇺',
    '231': '🇱🇷',
    '232': '🇸🇱',
    '233': '🇬🇭',
    '234': '🇳🇬',
    '235': '🇹🇩',
    '236': '🇨🇫',
    '237': '🇨🇲',
    '238': '🇨🇻',
    '239': '🇸🇹',
    '240': '🇬🇶',
    '241': '🇬🇦',
    '242': '🇨🇬',
    '243': '🇨🇩',
    '244': '🇦🇴',
    '245': '🇬🇼',
    '246': '🇮🇴',
    '248': '🇸🇨',
    '249': '🇸🇩',
    '250': '🇷🇼',
    '251': '🇪🇹',
    '252': '🇸🇴',
    '253': '🇩🇯',
    '254': '🇰🇪',
    '255': '🇹🇿',
    '256': '🇺🇬',
    '257': '🇧🇮',
    '258': '🇲🇿',
    '260': '🇿🇲',
    '261': '🇲🇬',
    '262': '🇷🇪',
    '263': '🇿🇼',
    '264': '🇳🇦',
    '265': '🇲🇼',
    '266': '🇱🇸',
    '267': '🇧🇼',
    '268': '🇸🇿',
    '269': '🇰🇲',
    '290': '🇸🇭',
    '291': '🇪🇷',
    '297': '🇦🇼',
    '298': '🇫🇴',
    '299': '🇬🇱',
    '350': '🇬🇮',
    '351': '🇵🇹',
    '352': '🇱🇺',
    '353': '🇮🇪',
    '354': '🇮🇸',
    '355': '🇦🇱',
    '356': '🇲🇹',
    '357': '🇨🇾',
    '358': '🇫🇮',
    '359': '🇧🇬',
    '360': '🇭🇺',
    '370': '🇱🇹',
    '371': '🇱🇻',
    '372': '🇪🇪',
    '373': '🇲🇩',
    '374': '🇦🇲',
    '375': '🇧🇾',
    '376': '🇦🇩',
    '377': '🇲🇨',
    '378': '🇸🇲',
    '380': '🇺🇦',
    '381': '🇷🇸',
    '382': '🇲🇪',
    '383': '🇽🇰',
    '385': '🇭🇷',
    '386': '🇸🇮',
    '387': '🇧🇦',
    '389': '🇲🇰',
    '420': '🇨🇿',
    '421': '🇸🇰',
    '423': '🇱🇮',
    '500': '🇫🇰',
    '501': '🇧🇿',
    '502': '🇬🇹',
    '503': '🇸🇻',
    '504': '🇭🇳',
    '505': '🇳🇮',
    '506': '🇨🇷',
    '507': '🇵🇦',
    '509': '🇭🇹',
    '590': '🇬🇵',
    '591': '🇧🇴',
    '592': '🇬🇾',
    '593': '🇪🇨',
    '594': '🇬🇫',
    '595': '🇵🇾',
    '596': '🇲🇶',
    '597': '🇸🇷',
    '598': '🇺🇾',
    '670': '🇹🇱',
    '672': '🇦🇶',
    '673': '🇧🇳',
    '674': '🇳🇷',
    '675': '🇵🇬',
    '676': '🇹🇴',
    '677': '🇸🇧',
    '678': '🇻🇺',
    '679': '🇫🇯',
    '680': '🇵🇼',
    '681': '🇼🇫',
    '682': '🇨🇰',
    '683': '🇳🇺',
    '684': '🇦🇸',
    '685': '🇼🇸',
    '686': '🇰🇮',
    '687': '🇳🇨',
    '688': '🇹🇻',
    '689': '🇵🇫',
    '690': '🇹🇰',
    '691': '🇫🇲',
    '692': '🇲🇭',
    '850': '🇰🇵',
    '852': '🇭🇰',
    '853': '🇲🇴',
    '855': '🇰🇭',
    '856': '🇱🇦',
    '880': '🇧🇩',
    '886': '🇹🇼',
    '960': '🇲🇻',
    '961': '🇱🇧',
    '962': '🇯🇴',
    '963': '🇸🇾',
    '964': '🇮🇶',
    '965': '🇰🇼',
    '966': '🇸🇦',
    '967': '🇾🇪',
    '968': '🇴🇲',
    '970': '🇵🇸',
    '971': '🇦🇪',
    '972': '🇮🇱',
    '973': '🇧🇭',
    '974': '🇶🇦',
    '975': '🇧🇹',
    '976': '🇲🇳',
    '977': '🇳🇵',
    '992': '🇹🇯',
    '993': '🇹🇲',
    '994': '🇦🇿',
    '995': '🇬🇪',
    '996': '🇰🇬',
    '998': '🇺🇿'
  };
  
  console.log(`[getCountryFlagFromPhone] Looking for country code: "${countryCode}" (type: ${typeof countryCode}, length: ${countryCode.length})`);
  console.log(`[getCountryFlagFromPhone] Available keys in map:`, Object.keys(countryCodeMap).slice(0, 20));
  

  const codeStr = String(countryCode);
  if (countryCodeMap.hasOwnProperty(codeStr)) {
    const flag = countryCodeMap[codeStr];
    console.log(`[getCountryFlagFromPhone] ✅ Found exact match for "${codeStr}": ${flag}`);
    return flag;
  }
  

  if (codeStr.length === 3) {
    if (countryCodeMap.hasOwnProperty(codeStr)) {
      const flag = countryCodeMap[codeStr];
      console.log(`[getCountryFlagFromPhone] ✅ Found 3-digit match for "${codeStr}": ${flag}`);
      return flag;
    }
  }
  

  if (codeStr.length >= 2) {
    const twoDigit = codeStr.substring(0, 2);
    if (countryCodeMap.hasOwnProperty(twoDigit)) {
      const flag = countryCodeMap[twoDigit];
      console.log(`[getCountryFlagFromPhone] ✅ Found 2-digit match for "${twoDigit}": ${flag}`);
      return flag;
    }
  }
  

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


function encodeMessageForWhatsApp(text) {
  if (!text) return '';
  

  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  

  let encoded = encodeURIComponent(normalized);
  

  encoded = encoded.replace(/%20/g, '+');
  
  return encoded;
}


const studentCredentialsCache = {};


const studentGeneralInfoCache = {};


async function getStudentCredentials(studentId) {

  if (studentCredentialsCache[studentId]) {
    return studentCredentialsCache[studentId];
  }


  let data = studentGeneralInfoCache[studentId] || null;

  if (!data) {
    data = await fetchStudentInfo(studentId);
    if (data) studentGeneralInfoCache[studentId] = data;
  }

  if (!data) return null;

  try {

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
  

  return null;
}


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
      

      const match = fullText.match(/\]\s*(.+?)\s*\[/);
      if (match && match[1]) {
        const courseName = match[1].trim();
        console.log('[Group Students Info] Extracted course name:', courseName);
        return courseName;
      } else {

        console.warn('[Group Students Info] Could not extract course name from pattern, using full text');
        return fullText;
      }
    }
  } catch (error) {
    console.warn('[Group Students Info] Error finding course name:', error);
  }


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


function detectPageLanguage() {

  try {
    const activeLangItem = document.querySelector('.v-list-item--active .v-list-item-title');
    if (activeLangItem) {
      const langText = activeLangItem.textContent?.trim() || '';
      console.log('[Group Students Info] Detected language:', langText);
      

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
      
      return langMap[langText] || 'es';
    }
  } catch (error) {
    console.warn('[Group Students Info] Error detecting language:', error);
  }
  

  const htmlLang = document.documentElement.lang || 'es';
  return htmlLang.substring(0, 2).toLowerCase();
}


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


function createWelcomeMessage(studentName, credentials, courseName = '', language = getMessageLanguage()) {

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
  

  const waveEmoji = String.fromCodePoint(0x1F44B);
  const rocketEmoji = String.fromCodePoint(0x1F680);
  

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
  

  const langPath = langUrlMap[language] || 'es';
  const loginUrl = `https://learn.kodland.org/${langPath}/auth`;
  

  const msg = messages[language] || messages['es'];
  

  return `${msg.greeting} ${waveEmoji}

${msg.welcome}

${msg.credentials}
${credsText}

${msg.loginLink}
${loginUrl}

${msg.closing} ${rocketEmoji}`;
}


function extractStudentName(container) {
  const h3 = container?.querySelector('h3');
  if (!h3) return 'Estudiante';
  const clone = h3.cloneNode(true);
  const countrySpan = clone.querySelector('.kodland-country-initials');
  if (countrySpan) countrySpan.remove();
  return clone.textContent.trim() || 'Estudiante';
}


function findNearestLesson(scheduleData) {
  if (!scheduleData || !Array.isArray(scheduleData) || scheduleData.length === 0) {
    return null;
  }
  
  const now = new Date();
  const nowTime = now.getTime();
  

  const upcomingLessons = scheduleData
    .filter(lesson => {
      if (!lesson.timetable_time) return false;
      const lessonTime = new Date(lesson.timetable_time).getTime();

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


async function scrapeRecordingLinkFromScheduleDOM() {
  const rows = Array.from(document.querySelectorAll('.schedule-slot'));
  if (rows.length === 0) return null;


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


    let link = null;
    let confirmedEmpty = false;
    for (let i = 0; i < 15; i++) {
      const anchor = expansionCard.querySelector('.record-list a[href]');
      if (anchor) { link = anchor.href; break; }
      if (expansionCard.querySelector('.no-records-message')) { confirmedEmpty = true; break; }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (link) return link;
    if (confirmedEmpty) continue;
  }

  return null;
}


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




const KODLAND_COUNTRY_TIMEZONE_MAP = {
  'MX': 'America/Mexico_City',
  'US': 'America/New_York',
  'CR': 'America/Costa_Rica',
  'AR': 'America/Argentina/Buenos_Aires',
  'ES': 'Europe/Madrid',
  'CL': 'America/Santiago',
  'CO': 'America/Bogota',
  'PE': 'America/Lima',
  'PA': 'America/Panama',
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

const KODLAND_COUNTRY_LOCALE_MAP = {
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

const KODLAND_LANGUAGE_LOCALE_MAP = {
  es: 'es-CO',
  en: 'en-US',
  ar: 'ar-SA',
  ru: 'ru-RU',
  fr: 'fr-FR',
  tr: 'tr-TR',
  id: 'id-ID',
  it: 'it-IT',
  pl: 'pl-PL',
  pt: 'pt-PT'
};


function formatTimeForCountry(dateTimeString, countryCode) {
  if (!dateTimeString) return '';

  const date = new Date(dateTimeString);

  const timezone = KODLAND_COUNTRY_TIMEZONE_MAP[countryCode] || 'UTC';
  
  try {

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return formatter.format(date);
  } catch (e) {

    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
}


function formatDateForCountry(dateTimeString, countryCode, language = 'es') {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);

  const locale = KODLAND_COUNTRY_LOCALE_MAP[countryCode] || (language === 'es' ? 'es-ES' : 'en-US');
  
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return formatter.format(date);
  } catch (e) {

    return date.toLocaleDateString();
  }
}


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
  

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lessonDate = new Date(lessonTime.getFullYear(), lessonTime.getMonth(), lessonTime.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isToday = lessonDate.getTime() === today.getTime();
  const isTomorrow = lessonDate.getTime() === tomorrow.getTime();
  
  const lessonNumber = lesson.lesson_number || 0;
  const zoomLink = lesson.zoom_schedule_join_url || '';
  

  const fifteenMinutesAgo = nowTime - (15 * 60 * 1000);
  const hasStarted = lessonTimeMs <= nowTime && lessonTimeMs >= fifteenMinutesAgo;
  
  if (hasStarted) {

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


function formatLessonDateForMessage(isoDateStr, language = getMessageLanguage()) {
  try {
    const date = new Date(isoDateStr);

    const locale = KODLAND_LANGUAGE_LOCALE_MAP[language] || 'es-CO';
    const timeZone = 'America/Bogota';

    const dayName = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }).format(date);
    const fullDate = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(date);
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(date);

    return {
      dayName,
      fullDate,
      time
    };
  } catch (error) {
    console.warn('[formatLessonDateForMessage] Error formatting date:', error);
    return null;
  }
}


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


const studentTaskAlertsCache = {};


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

// ============================================================================
// Motor de calificación/comentarios, 100% en el navegador — puerto fiel de
// calificador/calificador_kodland.py, sin Python ni Playwright.
//
// La parte que el script original resolvía con scraping de color del DOM
// (¿qué tareas están pendientes?) ya la resuelve fetchStudentTaskAlerts() de
// arriba usando el campo task_status_key de la propia API de Kodland — así
// que este motor solo necesita agregar el paso que faltaba: ESCRIBIR la nota
// y el comentario sobre esas tareas, con el mismo authToken que ya captura
// la extensión (PUT /api/v1/grade/{progress_id}/, confirmado en el propio
// script original como el mismo endpoint que usa su modal nativo "Evalúe").
//
// Simplificaciones conscientes frente al original:
// - No valida sintaxis Python con un parser (usaba ast.parse, que no existe
//   en el navegador); si el código del alumno no corre, igual se detecta por
//   similitud/construcciones faltantes y por lo que diga la IA (modo "ia").
// - No reproduce los respaldos por UI (modal "Evalúe" / chat) si el PUT a la
//   API falla: si falla, se reporta el error y se sigue con la siguiente
//   tarea — igual que el original ante cualquier excepción, nunca frena todo
//   el proceso por un alumno problemático.
// - Cada acción se limita al grupo que el tutor tiene abierto (igual que el
//   resto de los botones de esta extensión), en vez de recorrer todos los
//   grupos activos del tutor en una sola pasada como hacía el script Python.
// ============================================================================

async function kodlandApiV2(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`https://backoffice.kodland.org/api/v2${path}`, {
    method, credentials: 'include', headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
  return { ok: response.ok, status: response.status, data };
}

async function kodlandApiV1(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`https://backoffice.kodland.org/api/v1${path}`, {
    method, credentials: 'include', headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
  return { ok: response.ok, status: response.status, data };
}

// ============================================================================
// Grupos activos del tutor logueado, vía API real (sin scraping): descubierto
// por un tutor del equipo e incorporado aquí porque resuelve algo que no
// habíamos logrado por nuestra cuenta ("¿qué grupos tiene este tutor?").
// Se usa para la sincronización con Google Calendar de abajo; también es la
// base para portar más adelante "revisar todos mis grupos" y el radar de
// retención.
// ============================================================================

function findArrayInResponse(data, preferredKeys) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  for (const key of preferredKeys) if (Array.isArray(data[key])) return data[key];
  return Object.values(data).find(Array.isArray) || [];
}

function getMyTeacherId() {
  const saved = localStorage.getItem('kodland_ext_teacher_id');
  if (saved) return saved;
  // El token del BO es un JWT: su parte central suele traer el id del usuario.
  try {
    const payload = JSON.parse(atob(authToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const id = payload.user_id || payload.userId || payload.id || payload.sub;
    if (id && /^\d+$/.test(String(id))) return String(id);
  } catch (error) {
    // no es un JWT o no trae el id
  }
  return null;
}

// Lista de grupos ACTIVOS (con próxima lección) del tutor, sin preguntarle
// nada: el ID de tutor sale del propio token. Si por algo no se puede leer
// del token, se deja sin resolver (noPrompt=true para los procesos
// automáticos, que no deben interrumpir al tutor con un prompt()).
async function fetchMyActiveGroups({ noPrompt = true } = {}) {
  const teacherId = getMyTeacherId();
  if (!teacherId) {
    if (noPrompt) return null;
    const typed = (prompt(uiText('allGroupsAskTeacherId')) || '').trim();
    if (!/^\d+$/.test(typed)) return null;
    localStorage.setItem('kodland_ext_teacher_id', typed);
    return fetchMyActiveGroups({ noPrompt: true });
  }
  const res = await kodlandApiV2(`/student_groups/?page=1&page_size=100&ordering=-id&teacher=${teacherId}`);
  if (!res.ok) {
    console.warn('[Grupos] La lista de grupos respondió', res.status);
    return null;
  }
  const groups = findArrayInResponse(res.data, ['results', 'data', 'groups']);
  if (!groups.length) {
    if (noPrompt) return [];
    // El ID detectado probablemente no era el de tutor: se pregunta una vez.
    localStorage.removeItem('kodland_ext_teacher_id');
    return fetchMyActiveGroups({ noPrompt: false });
  }
  const nextKey = Object.keys(groups[0]).find(k => /next.?lesson/i.test(k));
  const hasNext = g => !nextKey || (g[nextKey] && g[nextKey] !== '-');
  return groups.filter(hasNext).map(g => ({ id: g.id, title: g.title || g.name || `#${g.id}` }));
}

// ============================================================================
// Sincronización automática con Google Calendar. Cada tutor conecta SU PROPIA
// cuenta (un script de Google Apps Script que crea una sola vez, ver
// calendario-google/PASOS.md) — la extensión nunca ve ni pide permisos de
// Google, solo le manda el horario de sus clases a una URL que el propio
// tutor pegó en Configuración. A propósito se manda lo mínimo: solo el
// nombre del grupo y el horario de la clase, nada de alumnos ni de datos
// personales. Corre sola cada vez que el tutor abre una página de grupo (sin
// botón), como mucho una vez por hora.
// ============================================================================

const CALENDAR_SYNC_EVERY_MS = 60 * 60 * 1000;
const CALENDAR_BATCH_SIZE = 15;
const CALENDAR_DAYS_AHEAD = 30;
const CALENDAR_DEFAULT_MINUTES = 60;

async function getCalendarConfig() {
  const data = await chrome.storage.local.get(['kodland_calendar_url', 'kodland_calendar_key', 'kodland_calendar_last_sync']);
  let key = data.kodland_calendar_key;
  if (!key) {
    key = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
    await chrome.storage.local.set({ kodland_calendar_key: key });
  }
  return { url: data.kodland_calendar_url || '', key, lastSync: data.kodland_calendar_last_sync || null };
}

async function fetchGroupScheduleForCalendar(groupId) {
  const res = await kodlandApiV2(`/student_groups/${groupId}/schedule_view/`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

// Un evento por clase, con SOLO el nombre del grupo como título (sin curso,
// lección ni enlaces) — lo único que hace falta para que Calendar avise al
// tutor antes de que empiece. El id es el de Kodland (timetable_id), para que
// el script de Google no duplique eventos si se sincroniza varias veces.
async function buildCalendarClasses() {
  const groups = await fetchMyActiveGroups();
  if (!groups) return null;
  const now = Date.now();
  const from = now - 24 * 3600 * 1000;
  const to = now + CALENDAR_DAYS_AHEAD * 24 * 3600 * 1000;
  const classes = [];
  for (const group of groups) {
    const schedule = await fetchGroupScheduleForCalendar(group.id);
    schedule.forEach(lesson => {
      const start = new Date(lesson.timetable_time).getTime();
      if (Number.isNaN(start) || start < from || start > to) return;
      if (/cancel/i.test(String(lesson.timetable_status || ''))) return;
      const minutes = Number(String(lesson.course_title || '').match(/\[(\d+)\s*min\]/i)?.[1]) || CALENDAR_DEFAULT_MINUTES;
      classes.push({
        id: lesson.timetable_id,
        titulo: group.title,
        inicio: new Date(start).toISOString(),
        fin: new Date(start + minutes * 60000).toISOString()
      });
    });
  }
  return { classes, from, to };
}

let calendarSyncRunning = false;

async function syncCalendarIfDue() {
  if (calendarSyncRunning) return;
  if (!extensionContextAlive()) return;
  const config = await getCalendarConfig();
  if (!config.url) return; // el tutor aún no pegó la URL de su script
  if (!getMyTeacherId()) return; // nunca se le pidió el ID; no interrumpir con un prompt
  if (config.lastSync && Date.now() - config.lastSync < CALENDAR_SYNC_EVERY_MS) return;

  calendarSyncRunning = true;
  try {
    await waitForAuthToken();
    const built = await buildCalendarClasses();
    if (!built) return;
    const { classes, from, to } = built;
    const send = payload => new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ tipo: 'calendar-sync', url: config.url, payload }, result => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else if (!result?.ok) reject(new Error(result?.error || 'sin respuesta'));
        else resolve(result.result);
      });
    });
    const base = { clave: config.key, desde: new Date(from).toISOString(), hasta: new Date(to).toISOString() };
    const vigentes = classes.map(c => String(c.id));
    let limitado = false;
    for (let i = 0; i < classes.length && !limitado; i += CALENDAR_BATCH_SIZE) {
      const result = await send({ ...base, clases: classes.slice(i, i + CALENDAR_BATCH_SIZE), vigentes });
      limitado = limitado || !!result?.limitado;
    }
    if (!limitado) await send({ ...base, clases: [], limpiar: true, vigentes });
    await chrome.storage.local.set({ kodland_calendar_last_sync: Date.now() });
    console.log(`[Calendario] Sincronizadas ${classes.length} clases.`);
  } catch (error) {
    console.warn('[Calendario] No se pudo sincronizar:', error.message);
  } finally {
    calendarSyncRunning = false;
  }
}

function gradingLimpiarInvisibles(s) {
  if (!s) return s;
  return String(s)
    .replace(/ /g, ' ')
    .replace(/[​﻿]/g, '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

function gradingTextoPlano(v) {
  if (v === null || v === undefined) return null;
  let s = String(v);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|li)\s*>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  const textarea = document.createElement('textarea');
  textarea.innerHTML = s;
  s = textarea.value;
  s = gradingLimpiarInvisibles(s);
  s = s.trim();
  return s || null;
}

function gradingNormalizarCodigo(txt) {
  const lineas = [];
  for (const lineaRaw of (txt || '').replace(/\r/g, '').split('\n')) {
    const linea = lineaRaw.replace(/#.*/, '').replace(/\s+$/, '');
    if (linea.trim()) lineas.push(linea.trim().replace(/\s+/g, ' '));
  }
  return lineas.join('\n');
}

const GRADING_CONSTRUCTOS = [
  ['for ', 'un ciclo for'], ['while ', 'un ciclo while'],
  ['def ', 'una función (def)'], ['if ', 'condicionales (if)'],
  ['input(', 'input()'], ['int(', 'conversión con int()'],
  ['append(', 'append() para la lista'], ['import ', 'el import que pide la tarea']
];

// Aproxima difflib.SequenceMatcher.ratio() de Python (2*coincidencias/total)
// con la subsecuencia común más larga (LCS) — suficiente para el umbral de
// similitud que usa calcularNota()/comentarioLocal(), sin depender de ninguna
// librería externa.
function gradingSimilarityRatio(a, b) {
  const n = a.length, m = b.length;
  if (!n && !m) return 1;
  if (!n || !m) return 0;
  let prev = new Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const curr = new Array(m + 1).fill(0);
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= m; j++) {
      curr[j] = ca === b.charCodeAt(j - 1) ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
    }
    prev = curr;
  }
  return (2 * prev[m]) / (n + m);
}

function gradingAnalizarCodigo(codigo, solucion) {
  const det = { similitud: null, faltantes: [], esPython: false, solEsPython: false, incompleto: false };
  const cod = gradingLimpiarInvisibles(codigo || '').trim();
  const sol = gradingLimpiarInvisibles(solucion || '').trim();
  const rexPy = /\b(print|def|for|while|input|import|if)\b|=/;
  det.esPython = rexPy.test(cod);
  det.solEsPython = rexPy.test(sol);
  if (cod && sol) {
    const ncod = gradingNormalizarCodigo(cod);
    const nsol = gradingNormalizarCodigo(sol);
    det.similitud = gradingSimilarityRatio(ncod, nsol);
    for (const [aguja, nombre] of GRADING_CONSTRUCTOS) {
      if (nsol.includes(aguja) && !ncod.includes(aguja)) det.faltantes.push(nombre);
    }
    if (det.solEsPython) {
      const diminuta = ncod.length < 20;
      const muchoMenor = ncod.length < 0.25 * nsol.length;
      det.incompleto = diminuta || (muchoMenor && det.faltantes.length >= 2);
    }
  }
  return det;
}

function gradingCalcularNota(det, maximo, minimo) {
  if (maximo == null) return [null, 'no conozco la nota máxima de la tarea'];
  maximo = Math.round(maximo);
  if (minimo == null) minimo = Math.round(maximo * 0.4);
  minimo = Math.min(minimo, maximo);
  const rango = maximo - minimo;
  const nota = frac => Math.round(minimo + frac * rango);
  if (!det.solEsPython) return [maximo, 'tarea sin código evaluable → nota máxima'];
  if (!det.esPython) return [nota(0), 'no hay código en la entrega → nota mínima'];
  if (det.incompleto) return [nota(0), 'entrega incompleta → nota mínima'];
  return [maximo, 'sin problemas detectables → nota máxima'];
}

function gradingNotaDesdeFraccion(fraccion, maximo, minimo) {
  if (maximo == null || fraccion == null) return null;
  maximo = Math.round(maximo);
  if (minimo == null) minimo = Math.round(maximo * 0.4);
  minimo = Math.min(minimo, maximo);
  fraccion = Math.max(0, Math.min(1, Number(fraccion)));
  return Math.round(minimo + fraccion * (maximo - minimo));
}

const GRADING_PLANTILLAS_DEFECTO = {
  bien: [
    '¡Excelente trabajo, {nombre}! 🎉 Tu código hace justo lo que pedía la tarea. ¡Sigue así!',
    '¡Muy bien, {nombre}! 👏 Tu solución está correcta y bien escrita. ¡Felicitaciones!',
    '¡Genial, {nombre}! ✨ Resolviste la tarea tal como se esperaba. ¡Buen trabajo!'
  ],
  con_detalles: [
    '¡Buen trabajo, {nombre}! 💪 Tu tarea está aprobada. Un consejo para mejorarla: {detalle}.',
    '¡Bien hecho, {nombre}! 👍 Ya quedó calificada. Para la próxima, {detalle}.'
  ],
  sintaxis: [
    '¡Buen intento, {nombre}! 💪 Tu tarea quedó calificada, pero revisa bien tu código para que corra perfecto.',
    '¡Gracias por tu entrega, {nombre}! Quedó calificada 👍. Revisa tu código con calma, puede tener algún detalle.'
  ],
  neutro: [
    '¡Gracias por tu entrega, {nombre}! 🙌 Ya quedó calificada. Compárala con la solución de la tarea para ver otro enfoque 😊',
    '¡Buen trabajo, {nombre}! 👍 Tarea calificada. Si quieres, revisa la solución del curso para comparar ideas.'
  ],
  sin_codigo: [
    '¡Gracias por tu entrega, {nombre}! 🙌 ¡Buen trabajo, sigue así!',
    '¡Muy bien, {nombre}! 👏 Tu tarea quedó revisada y calificada. ¡Ánimo con la siguiente!'
  ],
  incompleto: [
    '¡Gracias por tu entrega, {nombre}! 🙌 Aunque no encuentro tu código completo en la respuesta. Envíalo por el chat cuando puedas y así te doy una mejor revisión. ¡Tú puedes! 💪',
    '¡Hola, {nombre}! Recibí tu entrega, pero parece que el código falta o está incompleto. Mándalo completo cuando puedas para revisarlo mejor 😊'
  ]
};

let gradingPlantillasCache = null;
async function gradingCargarPlantillas() {
  if (gradingPlantillasCache) return gradingPlantillasCache;
  try {
    const response = await fetch(chrome.runtime.getURL('calificador/plantillas_comentarios.json'));
    gradingPlantillasCache = response.ok ? await response.json() : GRADING_PLANTILLAS_DEFECTO;
  } catch (error) {
    gradingPlantillasCache = GRADING_PLANTILLAS_DEFECTO;
  }
  return gradingPlantillasCache;
}

async function gradingComentarioLocal(nombreCompleto, codigo, solucion, det) {
  const nombre = nombreCompleto && !nombreCompleto.startsWith('(') ? nombreCompleto.split(' ')[0] : '';
  let categoria, detalle = '';
  if (!(codigo || '').trim() || !det.esPython) {
    categoria = det.solEsPython ? 'incompleto' : 'sin_codigo';
  } else if (det.incompleto) {
    categoria = 'incompleto';
  } else if (det.similitud !== null && det.similitud >= 0.75) {
    categoria = 'bien';
  } else if (det.faltantes.length) {
    categoria = 'con_detalles';
    detalle = 'podrías intentar usar ' + det.faltantes.slice(0, 2).join(' y ');
  } else if (det.similitud !== null) {
    categoria = 'neutro';
  } else {
    categoria = 'sin_codigo';
  }
  const plantillas = await gradingCargarPlantillas();
  const opciones = plantillas[categoria] || GRADING_PLANTILLAS_DEFECTO[categoria];
  let texto = opciones[Math.floor(Math.random() * opciones.length)];
  texto = nombre ? texto.replace('{nombre}', nombre) : texto.replace(', {nombre}', '').replace('{nombre}', '');
  texto = texto.replace('{detalle}', detalle);
  texto = texto.replace(/\s+([!?.,])/g, '$1');
  return texto.replace(/\s{2,}/g, ' ').trim();
}

function gradingConstruirPromptIa(enunciado, solucion, codigo) {
  const system = 'Eres un profesor de programación de Kodland: cálido, motivador y cercano. ' +
    'Revisas tareas de Python de adolescentes (13-17 años) y respondes en español ' +
    'latinoamericano neutro. Devuelves SIEMPRE un único objeto JSON válido, sin texto extra.';
  const user = `ENUNCIADO DE LA TAREA:
${(enunciado || '(sin enunciado)').slice(0, 2500)}

SOLUCIÓN ESPERADA (referencia del profesor):
${(solucion || '(no hay solución de referencia)').slice(0, 2500)}

CÓDIGO ENVIADO POR EL ESTUDIANTE:
${(codigo || '(el estudiante no envió código)').slice(0, 2500)}

Evalúa el código del estudiante. Fíjate en si REALMENTE resuelve lo que pide el
ENUNCIADO (errores de lógica, condiciones mal puestas, textos equivocados), no solo
en la sintaxis. El código pudo perder el formato al copiarse, así que NO penalices la
indentación ni los espacios.

Si NO hay solución de referencia, evalúa igualmente comparando el código con el
ENUNCIADO: decide si cumple lo pedido y si no tiene errores que impidan ejecutarlo.
Si cumple y no ves errores, márcalo correcto y felicita. Si falta algo o hay errores,
señálalo con amabilidad.

Responde SOLO con este JSON:
{"correcto": true, "errores": [], "comentario": "comentario cálido de 2 a 4 frases en español; dirígete al estudiante escribiendo LITERALMENTE {nombre} donde iría su nombre (no inventes un nombre); menciona algo específico de SU código; si hay errores explícalos con amabilidad y una pista para corregir (sin dar la solución completa); incluye 1 o 2 emojis", "fraccion": 1.0}
- "correcto": true si cumple lo que pide la tarea, false si no.
- "errores": lista breve de problemas concretos (vacía si está bien).
- "fraccion": número entre 0 y 1 según qué tan correcta y completa está (1 = perfecta).`;
  return { system, user };
}

const gradingIaCache = new Map();
function gradingClaveCacheIa(taskId, codigo) {
  const normalizado = gradingNormalizarCodigo(gradingLimpiarInvisibles(codigo || ''));
  let hash = 0;
  for (let i = 0; i < normalizado.length; i++) {
    hash = (Math.imul(31, hash) + normalizado.charCodeAt(i)) | 0;
  }
  return `${taskId}:${hash}`;
}

async function gradingLlamarIa(enunciado, solucion, codigo) {
  const settings = getExtensionSettings();
  if (!settings.groqApiKey) return null;
  const { system, user } = gradingConstruirPromptIa(enunciado, solucion, codigo);
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        tipo: 'groq-chat',
        apiKey: settings.groqApiKey,
        model: settings.groqModel || 'llama-3.3-70b-versatile',
        system, user
      }, result => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve(result);
      });
    });
    if (!response?.ok || !response.content) return null;
    let datos;
    try {
      datos = JSON.parse(response.content);
    } catch (error) {
      const match = response.content.match(/\{[\s\S]*\}/);
      datos = match ? JSON.parse(match[0]) : null;
    }
    if (!datos || !datos.comentario) return null;
    const comentario = gradingTextoPlano(String(datos.comentario));
    if (!comentario) return null;
    let fraccion = null;
    try { fraccion = Math.max(0, Math.min(1, Number(datos.fraccion))); } catch (error) { fraccion = null; }
    return { comentario, fraccion, correcto: datos.correcto, errores: datos.errores };
  } catch (error) {
    console.error('[Calificador] Error llamando a la IA:', error);
    return null;
  }
}

async function gradingLedgerTiene(clave) {
  const data = await chrome.storage.local.get('kodland_calificador_ledger');
  return (data.kodland_calificador_ledger || []).includes(clave);
}
async function gradingLedgerAgregar(clave) {
  const data = await chrome.storage.local.get('kodland_calificador_ledger');
  const ledger = data.kodland_calificador_ledger || [];
  if (!ledger.includes(clave)) {
    ledger.push(clave);
    await chrome.storage.local.set({ kodland_calificador_ledger: ledger.slice(-5000) });
  }
}

async function gradingVerificarComentarioGuardado(studentId, taskId, comentario) {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const { ok, data } = await kodlandApiV2(`/students/${studentId}/get_progress_by_task/${taskId}/`);
  if (ok && data) {
    const guardado = (gradingTextoPlano(data.comment) || '').toLowerCase();
    const firma = comentario.trim().slice(0, 40).toLowerCase();
    return !!(firma && guardado.includes(firma));
  }
  return null;
}

// mode: 'max' (solo nota máxima, sin comentar) | 'plantillas' | 'ia'
async function gradeAndCommentTask(studentId, taskId, nombreCompleto, mode) {
  try {
    const progressRes = await kodlandApiV2(`/students/${studentId}/get_progress_by_task/${taskId}/`);
    if (!progressRes.ok || !progressRes.data) {
      return { ok: false, error: 'No pude obtener el progreso de la tarea.' };
    }
    const progress = progressRes.data;
    const codigoAlumno = gradingTextoPlano(progress.solution);
    const progressId = progress.progress_id || progress.id;

    const taskRes = await kodlandApiV2(`/tasks/${taskId}/`);
    const task = taskRes.ok ? taskRes.data || {} : {};
    const solucion = gradingTextoPlano(task.solution);
    const enunciado = gradingTextoPlano(task.unescaped_text_of_task || task.text_of_task);
    const maximo = task.max_grade;
    const minimo = task.min_grade;

    if (!progressId || maximo == null) {
      return { ok: false, error: 'Falta el ID de progreso o la nota máxima de la tarea.' };
    }

    if (mode === 'max') {
      const put = await kodlandApiV1(`/grade/${progressId}/`, { method: 'PUT', body: { grade: Math.round(maximo), comment: progress.comment || '' } });
      if (!put.ok) return { ok: false, error: `La API respondió ${put.status} al calificar.` };
      return { ok: true, nota: Math.round(maximo), maximo };
    }

    const det = gradingAnalizarCodigo(codigoAlumno, solucion);
    let comentario = null;
    let fraccionIa = null;
    let origen = 'plantillas';

    if (mode === 'ia') {
      const clave = gradingClaveCacheIa(taskId, codigoAlumno);
      let resultado = gradingIaCache.get(clave);
      const reciclado = !!resultado;
      if (!resultado) {
        resultado = await gradingLlamarIa(enunciado, solucion, codigoAlumno);
        if (resultado?.comentario) gradingIaCache.set(clave, resultado);
      }
      if (resultado?.comentario) {
        const nombre = nombreCompleto && !nombreCompleto.startsWith('(') ? nombreCompleto.split(' ')[0] : '';
        let com = resultado.comentario;
        com = nombre ? com.replace('{nombre}', nombre) : com.replace('{nombre}', '').replace(/^\s*[,;:¡!.\-]+\s*/, '');
        comentario = com.replace(/\s{2,}/g, ' ').trim();
        fraccionIa = resultado.fraccion;
        origen = reciclado ? 'ia (reciclado)' : 'ia';
      }
    }
    if (!comentario) comentario = await gradingComentarioLocal(nombreCompleto, codigoAlumno, solucion, det);

    let notaFinal, motivoNota;
    if (fraccionIa != null) {
      notaFinal = gradingNotaDesdeFraccion(fraccionIa, maximo, minimo);
      motivoNota = `evaluada por IA (calidad ${Math.round(fraccionIa * 100)}%)`;
    } else {
      [notaFinal, motivoNota] = gradingCalcularNota(det, maximo, minimo);
    }
    if (notaFinal == null) return { ok: false, error: 'No pude determinar la nota.' };

    const claveEnvio = `${taskId}:${studentId}`;
    if (await gradingLedgerTiene(claveEnvio)) {
      return { ok: true, omitido: true, mensaje: 'Ya se había comentado antes.' };
    }

    const put = await kodlandApiV1(`/grade/${progressId}/`, { method: 'PUT', body: { grade: Math.round(notaFinal), comment: comentario } });
    if (!put.ok) return { ok: false, error: `La API respondió ${put.status} al guardar la nota/comentario.` };

    const verificado = await gradingVerificarComentarioGuardado(studentId, taskId, comentario);
    if (verificado === false) {
      return { ok: false, error: 'El comentario no quedó guardado (verificación falló).' };
    }
    await gradingLedgerAgregar(claveEnvio);
    return { ok: true, nota: notaFinal, maximo, comentario, origen, motivoNota };
  } catch (error) {
    console.error('[Calificador] Error calificando tarea:', error);
    return { ok: false, error: error.message || String(error) };
  }
}

async function runGroupGrading(report, mode, onProgress) {
  const tasks = [];
  report.forEach(student => {
    (student.pendingGradingTasks || []).forEach(task => {
      tasks.push({ studentId: student.studentId, taskId: task.taskId, name: student.name });
    });
  });
  const results = { total: tasks.length, ok: 0, omitidos: 0, errores: [] };
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (onProgress) onProgress(i + 1, tasks.length, t.name);
    if (!t.taskId) {
      results.errores.push({ ...t, error: 'Sin ID de tarea' });
      continue;
    }
    const res = await gradeAndCommentTask(t.studentId, t.taskId, t.name, mode);
    if (res.ok) {
      if (res.omitido) results.omitidos++; else results.ok++;
    } else {
      results.errores.push({ ...t, error: res.error });
    }
    if (i < tasks.length - 1) await new Promise(resolve => setTimeout(resolve, 400));
  }
  return results;
}


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


function showGroupGradingReportModal(report) {
  const existing = document.getElementById('kodland-grading-report-modal');
  if (existing) existing.remove();

  const totalPending = report.reduce((sum, r) => sum + r.pendingGradingCount, 0);
  const withPending = report.filter(r => r.pendingGradingCount > 0);


  const rowsHtml = withPending.length === 0
    ? `<p class="kodland-no-tasks">${escapeHtml(uiText('gradingNobodyPending'))}</p>`
    : withPending.map(r => {
        const tasksList = r.pendingGradingTasks
          .map(t => {
            const link = t.taskId
              ? `<a class="kodland-task-link" href="https://learn.kodland.org/task/${t.taskId}/check/${r.studentId}" target="_blank" rel="noopener noreferrer">${escapeHtml(uiText('gradeTaskLink'))}</a>`
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
        ${totalPending > 0 ? `
        <div class="kodland-grading-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
          <button id="kodland-calificar-max-btn" class="kodland-toolbar-btn">${escapeHtml(uiText('calificarMaxButton'))}</button>
          <button id="kodland-calificar-comentar-btn" class="kodland-toolbar-btn">${escapeHtml(uiText('calificarComentarButton'))}</button>
          <button id="kodland-calificar-ia-btn" class="kodland-toolbar-btn">${escapeHtml(uiText('calificarIaButton'))}</button>
        </div>
        <p id="kodland-calificar-status" style="font-size:12px; color:#666; min-height:16px; margin-bottom:10px;"></p>
        ` : ''}
        ${rowsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.kodland-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  if (totalPending > 0) {
    const statusEl = modal.querySelector('#kodland-calificar-status');
    const buttons = [
      modal.querySelector('#kodland-calificar-max-btn'),
      modal.querySelector('#kodland-calificar-comentar-btn'),
      modal.querySelector('#kodland-calificar-ia-btn')
    ];

    const iniciarCalificacion = async mode => {
      if (mode === 'ia' && !getExtensionSettings().groqApiKey) {
        alert(uiText('calificarIaNotConfigured'));
        return;
      }
      if (!confirm(uiText('calificarConfirm', totalPending))) return;

      buttons.forEach(b => { b.disabled = true; });
      statusEl.textContent = uiText('calificarProgress', 0, totalPending);
      try {
        const results = await runGroupGrading(withPending, mode, (current, total, name) => {
          statusEl.textContent = uiText('calificarProgress', current, total) + ` (${name})`;
        });
        let summary = uiText('calificarDone', results.ok, results.total);
        if (results.omitidos) summary += ` · ${results.omitidos} ${uiText('calificarAlreadyDone')}`;
        if (results.errores.length) {
          summary += ` · ${results.errores.length} ${uiText('calificarWithErrors')}`;
          console.error('[Calificador] Tareas con error:', results.errores);
        }
        statusEl.textContent = summary;
      } catch (error) {
        console.error('[Calificador] Error general:', error);
        statusEl.textContent = error?.message || uiText('pdfReportGenerateError');
      } finally {
        buttons.forEach(b => { b.disabled = false; });
      }
    };

    modal.querySelector('#kodland-calificar-max-btn').addEventListener('click', () => iniciarCalificacion('max'));
    modal.querySelector('#kodland-calificar-comentar-btn').addEventListener('click', () => iniciarCalificacion('plantillas'));
    modal.querySelector('#kodland-calificar-ia-btn').addEventListener('click', () => iniciarCalificacion('ia'));
  }
}


function getOrCreateToolbar() {
  let wrapper = document.getElementById('kodland-broadcast-buttons');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = 'kodland-broadcast-buttons';
    wrapper.className = 'kodland-broadcast-buttons';
    document.body.appendChild(wrapper);


    const adjustBodyPadding = () => {
      const height = wrapper.offsetHeight;
      document.body.style.paddingTop = height > 0 ? `${height + 16}px` : '';
    };
    adjustBodyPadding();

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(adjustBodyPadding).observe(wrapper);
    } else {
      window.addEventListener('resize', adjustBodyPadding);
    }
  }
  return wrapper;
}


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


// --- Ported from KodlandTutorAssistant: per-student PDF report, generated by
// the Python calificador (calificador/generar_reporte.py) via the Native
// Messaging bridge (background.js -> puente_kodland.py). Course templates
// live in calificador/reportes/curso_*.json; optional per-group/per-student
// overrides in calificador/reportes/datos_<CODE>.json. ---

const groupReportProgressCache = new Map();
const REPORT_COURSE_FILES = [
  'curso_creatividad.json', 'curso_creatividad_2.json', 'curso_drawing.json',
  'curso_funtech.json', 'curso_fwd_pro.json', 'curso_graphic_design.json',
  'curso_illustration.json', 'curso_minecraft.json', 'curso_minecraft_2.json',
  'curso_python.json', 'curso_python_pro.json', 'curso_roblox.json',
  'curso_roblox_2.json', 'curso_scratch.json', 'curso_unity.json', 'curso_web.json'
];

// Palabras en español/portugués que los tutores usan para nombrar sus grupos,
// pero que no coinciden con el nombre en inglés del archivo de plantilla
// (p. ej. título real: "[1627]Dibujo[2025][8-9][60 min]..." no matchea
// curso_drawing.json porque "dibujo" != "drawing"). Se aplica DESPUÉS de
// quitar tildes, así "diseño"/"gráfico"/"ilustración" ya llegan sin acentos.
const REPORT_COURSE_WORD_SYNONYMS = {
  dibujo: 'drawing', desenho: 'drawing',
  ilustracion: 'illustration', ilustracao: 'illustration',
  diseno: 'design', grafico: 'graphic'
};

// Cursos que Kodland repite en dos niveles con el MISMO nombre (Roblox,
// Minecraft, Creatividad Digital) y que, cuando el título del grupo no dice
// "Lvl"/"Nivel" explícito, solo se distinguen por el rango de edad entre
// corchetes del nombre del grupo (p. ej. "[10-12]" ya es Nivel 2). Confirmado
// con un caso real: un grupo de Roblox "10-12" generaba el reporte del
// Nivel 1 (su primer módulo no correspondía al curso real del alumno).
const REPORT_LEVELED_COURSES = ['roblox', 'minecraft', 'creatividad'];
const REPORT_LEVEL2_MIN_AGE = 10;

async function loadReportCourse(courseTitle) {
  const stripAccents = value => value.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const normalize = value => stripAccents(String(value || '').toLowerCase())
    .replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/g, '$1 $2')
    .split(/[^a-z0-9]+/).filter(Boolean)
    .map(word => REPORT_COURSE_WORD_SYNONYMS[word] || word);
  const titleWords = new Set(normalize(courseTitle));
  const words = [...titleWords];
  const levelIndex = words.findIndex(word => word === 'lvl' || word === 'level' || word === 'nivel');
  let level = levelIndex >= 0 ? words[levelIndex + 1] : null;
  if (!level) {
    const ageMatch = String(courseTitle || '').match(/\[(\d{1,2})\s*-\s*(\d{1,2})\]/);
    if (ageMatch && Number(ageMatch[1]) >= REPORT_LEVEL2_MIN_AGE) level = '2';
  }
  const alias = titleWords.has('digital') && titleWords.has('creativity')
    ? ({ '1': 'curso_creatividad.json', '2': 'curso_creatividad_2.json' })[level]
    : null;
  const leveledCourse = level && REPORT_LEVELED_COURSES.find(word => titleWords.has(word));
  const leveledAlias = leveledCourse ? `curso_${leveledCourse}${level === '2' ? '_2' : ''}.json` : null;
  const matches = REPORT_COURSE_FILES.map(file => ({
    file,
    words: normalize(file.replace(/^curso_|\.json$/g, '').replace(/_/g, ' '))
  })).filter(item => item.words.length && item.words.every(word => titleWords.has(word)))
    .sort((left, right) => right.words.length - left.words.length);
  const file = alias || leveledAlias || matches[0]?.file;
  if (!file) throw new Error(`No encontré una plantilla para el curso «${courseTitle}».`);
  const response = await fetch(chrome.runtime.getURL(`calificador/reportes/${file}`));
  if (!response.ok) throw new Error(`No se pudo cargar la plantilla ${file}.`);
  const course = await response.json();
  course._template_file = file;
  return course;
}

async function fetchGroupReportProgress(groupId) {
  const cached = groupReportProgressCache.get(groupId);
  if (cached && Date.now() - cached.timestamp < 30000) return cached.data;

  const response = await fetch(
    `https://backoffice.kodland.org/api/v2/student_groups/${groupId}/get_students_main_data`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    }
  );
  if (!response.ok) throw new Error(`Kodland respondió ${response.status} al consultar el progreso.`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('La respuesta de progreso del grupo no tiene el formato esperado.');
  groupReportProgressCache.set(groupId, { timestamp: Date.now(), data });
  return data;
}

function reportTaskCounts(data) {
  const tasks = Array.isArray(data) ? data : data?.tasks || data?.data || [];
  return tasks.reduce((counts, task) => {
    if (!(Number(task.task_max_grade) > 0) || task.task_status_key === 'TASK_NOT_GRADED') return counts;
    counts.total += 1;
    if (task.task_status_key && task.task_status_key !== 'TASK_NOT_SUBMITTED') counts.sent += 1;
    return counts;
  }, { sent: 0, total: 0 });
}

function resolveReportGroupCode(groupInfo, groupId) {
  const candidates = [
    groupInfo?.group_code,
    groupInfo?.code,
    groupInfo?.group?.code,
    groupInfo?.student_group?.code,
    document.title,
    document.querySelector('main h1')?.textContent,
    document.querySelector('[class*="group-code"], [data-group-code]')?.textContent
  ];
  for (const value of candidates) {
    const match = String(value || '').match(/[A-Z0-9]+(?:_[A-Z0-9-]+)+/i);
    if (match) return match[0].trim();
  }
  return String(groupInfo?.id || groupId || '');
}

async function loadManualReportData(groupCode, studentName) {
  if (!groupCode || /^\d+$/.test(groupCode)) return {};
  const safeCode = groupCode.replace(/[^A-Za-z0-9_-]/g, '_');
  try {
    const response = await fetch(chrome.runtime.getURL(`calificador/reportes/datos_${safeCode}.json`));
    if (!response.ok) return {};
    const saved = await response.json();
    return Object.assign({}, saved._grupo || {}, saved[studentName] || {});
  } catch (error) {
    return {};
  }
}

function firstReportValue(source, keys) {
  if (!source || typeof source !== 'object') return '';
  for (const key of keys) {
    const value = source[key];
    if (['string', 'number'].includes(typeof value) && String(value).trim()) return String(value).trim();
  }
  for (const value of Object.values(source)) {
    if (value && typeof value === 'object') {
      const found = firstReportValue(value, keys);
      if (found) return found;
    }
  }
  return '';
}

async function loadStudentReportData(studentId, studentData, parentPhone) {
  const groupId = extractGroupId();
  if (!groupId) throw new Error('No pude identificar el grupo actual.');

  const [groupInfo, students] = await Promise.all([
    fetchGroupGeneralInfo(groupId),
    fetchGroupReportProgress(groupId)
  ]);
  const record = students.find(item => String(item.main_info?.student_id) === String(studentId));
  if (!record) throw new Error('No encontré el progreso de este alumno en el grupo.');

  const progress = Array.isArray(record.progress_info) ? record.progress_info : [];
  const progressModules = progress;
  const orderedLessons = progressModules.flatMap((module, moduleIndex) =>
    (module.lessons_data || []).map((lesson, lessonIndex) => ({
      ...lesson,
      moduleNumber: Number(module.module_number) || moduleIndex + 1,
      lessonNumber: Number(lesson.lesson_number) || lessonIndex + 1
    }))
  );
  const lastLessonId = record.main_info?.last_lesson_id;
  const lastLessonIndex = lastLessonId == null
    ? -1
    : orderedLessons.findIndex(lesson => String(lesson.lesson_id) === String(lastLessonId));
  const cutoffIndex = lastLessonIndex >= 0 ? lastLessonIndex : orderedLessons.length - 1;
  const lessonsToReport = orderedLessons.slice(0, cutoffIndex + 1);
  if (!lessonsToReport.length) throw new Error('El alumno todavía no tiene lecciones realizadas para reportar.');

  const courseTitle = groupInfo?.course?.title || findCourseName();
  if (!courseTitle) throw new Error('No pude identificar el curso de este grupo.');
  const course = await loadReportCourse(courseTitle);
  const studentName = record.main_info?.full_name || extractStudentName(document.querySelector(`a[href="/students/${studentId}"]`)?.parentElement || document);
  const groupCode = resolveReportGroupCode(groupInfo, groupId);
  const manualData = await loadManualReportData(groupCode, studentName);
  const visibleModuleNumbers = new Set(lessonsToReport.map(lesson => lesson.moduleNumber));
  const reportModules = course.modulos
    .filter(module => visibleModuleNumbers.has(Number(module.numero)))
    .sort((a, b) => Number(a.numero) - Number(b.numero));
  if (!reportModules.length) throw new Error(`La plantilla «${course.curso}» no coincide con los módulos del progreso.`);

  const tasksByLesson = new Map();
  for (let index = 0; index < lessonsToReport.length; index += 3) {
    const batch = lessonsToReport.slice(index, index + 3);
    const results = await Promise.all(batch.map(async lesson => {
      const [classTasks, homeworkTasks] = await Promise.all([
        fetchClassTasksProgress(studentId, lesson.lesson_id),
        fetchHomeworkTasksProgress(studentId, lesson.lesson_id)
      ]);
      return { lessonId: String(lesson.lesson_id), counts: reportTaskCounts([classTasks, homeworkTasks].flatMap(value => Array.isArray(value) ? value : value?.tasks || value?.data || [])) };
    }));
    results.forEach(result => tasksByLesson.set(result.lessonId, result.counts));
  }

  const apiModules = new Map(progressModules.map((module, index) => [
    Number(module.module_number) || index + 1,
    module
  ]));
  const reportModuleData = reportModules.map(module => {
    const number = Number(module.numero);
    const apiModule = apiModules.get(number) || {};
    const lessons = lessonsToReport.filter(lesson => lesson.moduleNumber === number);
    const taskCounts = lessons.reduce((total, lesson) => {
      const counts = tasksByLesson.get(String(lesson.lesson_id)) || { sent: 0, total: 0 };
      return { sent: total.sent + counts.sent, total: total.total + counts.total };
    }, { sent: 0, total: 0 });
    const moduleSessions = lessons.flatMap(lesson => {
      const states = { 2: ['present', 'Presente'], 1: ['justified', 'Justificada'], 0: ['absent', 'Ausente'] };
      const state = states[lesson.attendance_status];
      return state ? [{ label: `M${lesson.moduleNumber} L${lesson.lessonNumber}`, status: state[0], text: state[1] }] : [];
    });
    return {
      ...module,
      pct: apiModule.module_max_grade
        ? Math.round(100 * (Number(apiModule.module_current_grade) || 0) / Number(apiModule.module_max_grade))
        : 0,
      points: Number(apiModule.module_current_grade) || 0,
      maxPoints: Number(apiModule.module_max_grade) || 0,
      tasksSent: taskCounts.sent,
      tasksTotal: taskCounts.total,
      attendance: {
        attended: moduleSessions.filter(session => session.status === 'present').length,
        total: moduleSessions.length,
        sessions: moduleSessions
      }
    };
  });

  const sessions = lessonsToReport.flatMap(lesson => {
    const states = { 2: ['present', 'Presente'], 1: ['justified', 'Justificada'], 0: ['absent', 'Ausente'] };
    const state = states[lesson.attendance_status];
    return state ? [{ label: `M${lesson.moduleNumber} L${lesson.lessonNumber}`, status: state[0], text: state[1] }] : [];
  });
  const report = {
    studentName,
    teacher: groupInfo?.group_teacher?.full_name || '',
    groupCode,
    modules: reportModuleData,
    tasksSent: reportModuleData.reduce((sum, module) => sum + module.tasksSent, 0),
    tasksTotal: reportModuleData.reduce((sum, module) => sum + module.tasksTotal, 0),
    attendance: {
      attended: sessions.filter(item => item.status === 'present').length,
      total: sessions.length,
      sessions
    },
    whatsappPhone: formatPhoneForWhatsApp(manualData.telefono || parentPhone),
    data: {
      acudiente: manualData.acudiente || firstReportValue(studentData, ['parent_name', 'parent_full_name', 'representative_name', 'parent']),
      email: manualData.email || firstReportValue(studentData, ['email', 'student_email', 'parent_email', 'login']),
      telefono: manualData.telefono || firstReportValue(studentData, ['phone', 'phone_number', 'parent_phone', 'telephone']),
      pais: manualData.pais || firstReportValue(studentData, ['country', 'country_name']),
      codigo_grupo: manualData.codigo_grupo || groupCode,
      tipo_grupo: manualData.tipo_grupo || firstReportValue(groupInfo, ['group_type', 'group_type_name', 'type']),
      dia_hora: manualData.dia_hora || firstReportValue(groupInfo, ['schedule', 'lesson_time', 'group_schedule', 'day_and_time', 'lesson_day']),
      modulo_informe: manualData.modulo_informe || `M${reportModules.at(-1)?.numero || ''}`
    },
    bannerUrl: chrome.runtime.getURL('calificador/reportes/img/banner_kodland.png'),
    includeDetails: true
  };
  return { course, report };
}

// ============================================================================
// Generador del PDF "Reporte de Desarrollo", 100% en el navegador.
//
// Puerto fiel de calificador/generar_reporte.py: mismo HTML/CSS (el diseño de
// Kodland), pero sin Python ni Playwright. En vez de generar el PDF fuera de
// proceso con page.pdf(), abrimos el mismo HTML en una pestaña nueva y usamos
// la función de impresión nativa del navegador (window.print -> "Guardar como
// PDF"), que corre sobre el mismo motor que usaba Playwright por debajo. Así
// cualquier tutor lo usa con solo instalar la extensión, en Windows o Mac.
//
// Simplificación consciente respecto al original: el original medía en dos
// pasadas cuántos módulos entraban en cada hoja (para no dejar hojas a medias)
// porque Playwright corre headless y no hay forma de "dejar que fluya". Acá sí
// hay un navegador real: los módulos fluyen en una sola sección con
// page-break-inside:avoid en cada tarjeta, y es la propia vista de impresión
// la que decide los saltos de página — nunca parte una tarjeta a la mitad.
// ============================================================================

const REPORT_CSS = `
:root{
  --lima:#c8ea4f; --lima-osc:#b6db3f; --oscuro:#1b1b1b; --texto:#2b2b2b;
  --otimo:#a8d84a; --bom:#efb03e; --dev:#ef7373;
  --card:#f5f7ee; --card2:#f0f3e6; --borde:#e4e8d8;
}
*{box-sizing:border-box; margin:0; padding:0;}
body{font-family:"Segoe UI",Arial,Helvetica,sans-serif; color:var(--texto); font-size:12px;}
.pagina{width:210mm; min-height:297mm; padding:14mm 13mm 16mm; position:relative;
  page-break-after:always; background:#fff; display:flex; flex-direction:column;}
.pagina:last-child{page-break-after:auto;}
h1,h2,h3{font-weight:800;}
.mut{color:#8a9078; font-size:9px; letter-spacing:.10em; font-weight:700; text-transform:uppercase;}
.cab{background:var(--lima); border-radius:16px; padding:18px 22px; display:flex;
  justify-content:space-between; align-items:center;}
.cab .logo{font-size:30px; font-weight:800; color:var(--oscuro); letter-spacing:-.5px;}
.cab .tit{text-align:right; color:var(--oscuro);}
.cab .tit h1{font-size:20px; line-height:1.1;}
.cab .tit p{font-size:10px; font-weight:700; margin-top:3px;}
.fila{display:flex; gap:12px; margin-top:12px;}
.tarj{flex:1; border:1px solid var(--borde); border-radius:12px; padding:12px 14px; background:#fff;}
.tarj.oscuro{background:var(--oscuro); border-color:var(--oscuro);}
.tarj.oscuro .mut{color:#c8ea4f;}
.tarj.oscuro .val{color:#fff;}
.tarj .val{font-size:15px; font-weight:800; margin-top:4px;}
.stats{display:flex; gap:12px; margin-top:12px;}
.stat{flex:1; border:1px solid var(--borde); border-radius:12px; padding:14px 8px;
  text-align:center; background:var(--card);}
.stat.oscuro{background:var(--oscuro);}
.stat .num{font-size:30px; font-weight:800; color:var(--oscuro);}
.stat.oscuro .num{color:var(--lima);}
.stat .num small{font-size:15px;}
.stat .lbl{font-size:8.5px; letter-spacing:.06em; font-weight:700; text-transform:uppercase;
  color:#8a9078; margin-top:2px;}
.stat.oscuro .lbl{color:#c8ea4f;}
.seccion{display:flex; align-items:center; gap:10px; margin:20px 0 10px;}
.seccion .cuad{width:20px; height:20px; background:var(--lima); border-radius:5px;}
.seccion h2{font-size:15px; color:var(--oscuro); letter-spacing:.02em;}
.intro{background:var(--card); border-left:5px solid var(--lima); border-radius:0 10px 10px 0;
  padding:12px 16px; font-size:11.5px; line-height:1.55;}
.intro b{color:var(--oscuro);}
.banner{width:100%; display:block; border-radius:16px;}
.dbasicos{width:100%; border-collapse:collapse; border:1px solid var(--borde);
  border-radius:12px; overflow:hidden;}
.dbasicos th{background:var(--card2); color:#6a7358; font-size:9px; letter-spacing:.06em;
  text-transform:uppercase; text-align:left; padding:9px 10px; width:20%; font-weight:700;
  border-bottom:1px solid var(--borde); border-right:1px solid var(--borde);}
.dbasicos td{padding:9px 12px; font-size:11.5px; font-weight:700; color:var(--oscuro);
  width:30%; border-bottom:1px solid var(--borde); border-right:1px solid var(--borde);
  background:#fff;}
.dbasicos td:last-child, .dbasicos th:last-child{border-right:none;}
.dbasicos tr:last-child th, .dbasicos tr:last-child td{border-bottom:none;}
.dbasicos td.vacio{color:#b3b9a6; font-weight:600;}
.modo{background:var(--card); border-left:5px solid var(--lima); border-radius:0 10px 10px 0;
  padding:12px 16px 12px 20px;}
.modo ol{margin:0; padding-left:18px;}
.modo li{font-size:11.5px; line-height:1.6; margin-bottom:2px;}
.modo li b{color:var(--oscuro);}
.modo .pie-modo{margin-top:10px; padding-top:9px; border-top:1px dashed #cdd6b8;
  font-size:11px; line-height:1.5;}
.chart{margin-top:16px; border:1px solid var(--borde); border-radius:12px; padding:16px 14px 8px;}
.barras{display:flex; align-items:flex-end; gap:10px; height:210px; position:relative;
  border-bottom:1px solid #ddd;}
.col{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;}
.col .pct{font-size:11px; font-weight:800; margin-bottom:4px; color:var(--oscuro);}
.col .barra{width:70%; border-radius:6px 6px 0 0;}
.col.otimo .barra{background:var(--otimo);}
.col.bom .barra{background:var(--bom);}
.col.dev .barra{background:var(--dev);}
.ejes{display:flex; gap:10px; margin-top:6px;}
.ejes .e{flex:1; text-align:center; font-size:10px; font-weight:700; color:#6a6a6a;}
.media-linea{position:absolute; left:0; right:0; border-top:2px dashed #b9b9b9;}
.media-lbl{position:absolute; right:2px; font-size:10px; font-weight:800; color:#555;
  background:#fff; padding:0 3px;}
.leyenda{display:flex; gap:18px; justify-content:center; margin-top:12px; font-size:10px; color:#555;}
.leyenda span{display:inline-flex; align-items:center; gap:6px;}
.punto{width:10px; height:10px; border-radius:50%; display:inline-block;}
.punto.otimo{background:var(--otimo);} .punto.bom{background:var(--bom);} .punto.dev{background:var(--dev);}
.mod{border:1px solid var(--borde); border-radius:14px; padding:11px 15px; margin-bottom:8px;
  page-break-inside:avoid;}
.mod-cab{display:flex; align-items:center; gap:12px;}
.badge{width:34px; height:34px; background:var(--oscuro); color:#fff; border-radius:8px;
  display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex:none;}
.mod-cab .t{flex:1;}
.mod-cab .t .n{font-size:9px; letter-spacing:.1em; color:#9aa08c; font-weight:700;}
.mod-cab .t h3{font-size:15px; color:var(--oscuro); margin-top:1px;}
.mod-cab .p{text-align:right;}
.mod-cab .p .g{font-size:24px; font-weight:800; color:var(--oscuro);}
.mod-cab .p .g small{font-size:13px;}
.pill{display:inline-block; font-size:9px; font-weight:800; padding:3px 9px; border-radius:20px;
  letter-spacing:.03em; margin-top:2px;}
.pill.otimo{background:#e7f6c8; color:#5e7a1a;}
.pill.bom{background:#fbecc9; color:#8a5e10;}
.pill.dev{background:#fbd7d7; color:#a23434;}
.progreso{height:7px; border-radius:5px; background:#eee; margin:9px 0 9px; overflow:hidden;}
.progreso i{display:block; height:100%; border-radius:5px;}
.progreso i.otimo{background:var(--otimo);} .progreso i.bom{background:var(--bom);} .progreso i.dev{background:var(--dev);}
.mod .desc{font-size:11px; margin-bottom:8px;}
.mod-cols{display:flex; gap:18px;}
.mod-cols .izq{flex:1.3;}
.mod-cols .der{flex:1;}
.sublbl{font-size:9px; letter-spacing:.08em; font-weight:700; color:#9aa08c; text-transform:uppercase; margin-bottom:5px;}
.apr{list-style:none;}
.apr li{font-size:10.5px; padding:2px 0 2px 16px; position:relative;}
.apr li:before{content:"▸"; position:absolute; left:0; color:var(--lima-osc); font-weight:800;}
.proy{background:var(--card); border:1px solid var(--borde); border-radius:10px; padding:12px;
  font-weight:800; color:#4d6a12; font-size:12px;}
.comp{display:flex; flex-wrap:wrap; gap:10px; margin-top:12px;}
.comp .c{width:calc(50% - 5px); background:var(--card); border:1px solid var(--borde); border-radius:10px;
  padding:11px 14px; font-weight:700; font-size:11px; color:var(--oscuro);}
.comp .c b{color:var(--otimo); margin-right:6px;}
.paso{background:var(--oscuro); border-radius:14px; padding:18px 20px; margin-top:16px; color:#eee;}
.paso .k{font-size:9px; letter-spacing:.1em; color:var(--lima); font-weight:700;}
.paso h2{font-size:20px; color:var(--lima); margin:2px 0 8px;}
.paso p{font-size:11px; line-height:1.55;}
/* margin-top:auto (no position:absolute) a propósito: si el contenido de una
   página llega a ocupar más de una hoja física, el pie se queda pegado justo
   después del contenido en vez de "flotar" según la altura total de .pagina
   y aparecer solo, en una hoja casi en blanco, más adelante. */
.pie{margin-top:auto; padding-top:10mm;}
.pie .barra{background:var(--oscuro); border-radius:12px; padding:12px 18px; display:flex;
  justify-content:space-between; align-items:center; color:#fff;}
.pie .barra .l{color:var(--lima); font-weight:800; font-size:16px;}
.pie .barra .c{font-size:10px; letter-spacing:.15em; color:#cfcfcf;}
.pie-num{text-align:center; font-size:8.5px; color:#b8b8b8; margin-top:auto; padding-top:6mm;}
.mensaje{background:var(--oscuro); color:#eee; border-radius:14px; padding:16px 20px; margin-top:14px;}
.mensaje .k{font-size:9px; letter-spacing:.1em; color:var(--lima); font-weight:700;}
.mensaje p{font-size:12px; line-height:1.6; margin-top:6px;}
table.calif{width:100%; border-collapse:collapse; margin-top:6px; font-size:11px;}
table.calif th{background:var(--card); color:#8a9078; text-transform:uppercase; font-size:8.5px;
  letter-spacing:.05em; text-align:left; padding:8px 10px; border-bottom:2px solid var(--borde);}
table.calif td{padding:9px 10px; border-bottom:1px solid #eef0e6;}
table.calif td.n, table.calif th.n{text-align:center;}
table.calif tr.total td{font-weight:800; background:#fbfdf5; border-top:2px solid var(--borde);}
.mini{display:inline-block; height:7px; width:56px; border-radius:4px; background:#eee;
  overflow:hidden; vertical-align:middle; margin-right:6px;}
.mini i{display:block; height:100%;}
.mini i.otimo{background:var(--otimo);} .mini i.bom{background:var(--bom);} .mini i.dev{background:var(--dev);}
.asis-grid{display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;}
.ses{width:calc(20% - 7px); border:1px solid var(--borde); border-radius:9px; padding:8px 6px; text-align:center;}
.ses .f{font-size:9px; color:#8a9078; font-weight:700;}
.ses .e{font-size:10px; font-weight:800; margin-top:3px;}
.ses.pres{background:#eef7d8;} .ses.pres .e{color:#5e7a1a;}
.ses.aus{background:#fbe0e0;} .ses.aus .e{color:#a23434;}
.ses.just{background:#fbecc9;} .ses.just .e{color:#8a5e10;}
.firmas{display:flex; justify-content:space-around; align-items:flex-end; gap:30px; margin:22px 0 18px; padding:0 10px;}
.col-firma{flex:1; max-width:300px; text-align:center;}
.col-firma .linea{border-top:1.5px solid var(--oscuro); margin-top:30px;}
.col-firma .fnombre{font-weight:800; font-size:13px; color:var(--oscuro); margin-top:6px;}
.frol{font-size:8.5px; letter-spacing:.1em; color:#8a9078; font-weight:700; text-transform:uppercase; margin-top:3px;}
.col-sello{text-align:center;}
.sello-caja{width:108px; height:108px; margin:0 auto; border:2px dashed #c4c8b4; border-radius:50%;
  display:flex; align-items:center; justify-content:center; color:#bcc0ac; font-size:9px;
  letter-spacing:.08em; font-weight:700; text-transform:uppercase; text-align:center; line-height:1.3;}
@media print{
  * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
}
`;

const REPORT_UI = {
  es: {
    titulo: 'REPORTE DE DESARROLLO', aluno: 'ALUMNO', curso: 'CURSO', profesor: 'PROFESOR(A)',
    area: 'ÁREA DE INTERÉS', proximo: 'PRÓXIMO NIVEL RECOMENDADO',
    aprov: 'APROVECHAMIENTO PROMEDIO', proyectos: 'PROYECTOS COMPLETADOS',
    mejor: 'MEJOR MÓDULO', modulos: 'MÓDULOS CURSADOS',
    vision: 'VISIÓN GENERAL DEL DESEMPEÑO', media: 'Promedio',
    bandas: ['Óptimo (≥70%)', 'Bueno (50–69%)', 'En desarrollo (<50%)'],
    detalle: 'DETALLE POR MÓDULO', modulo: 'MÓDULO',
    aprendizajes: 'PRINCIPALES APRENDIZAJES', proyecto: 'PROYECTO DESARROLLADO',
    consideraciones: 'CONSIDERACIONES FINALES', paso: 'PRÓXIMO PASO RECOMENDADO',
    pie_lema: 'EDUCAR · INSPIRAR · TRANSFORMAR', pagina: 'Página',
    et_otimo: 'ÓPTIMO', et_bom: 'BUENO', et_dev: 'EN DESARROLLO',
    calif: 'CALIFICACIONES Y ASISTENCIA', tareas: 'TAREAS ENVIADAS', asist: 'ASISTENCIA',
    th_modulo: 'Módulo', th_tareas: 'Tareas', th_puntos: 'Puntos', th_avance: 'Avance',
    asis_titulo: 'ASISTENCIA A CLASES', est_pres: 'Presente', est_aus: 'Ausente', est_just: 'Justif.',
    msg: 'MENSAJE PARA TI', firma: 'FIRMA DEL TUTOR(A)', sello: 'SELLO KODLAND',
    datos: 'DATOS BÁSICOS DEL ESTUDIANTE',
    f_alumno: 'Nombre del estudiante', f_acu: 'Nombre del acudiente',
    f_mail: 'E-mail', f_tel: 'Teléfono', f_pais: 'País de residencia',
    f_cod: 'Código del grupo', f_tipo: 'Tipo de grupo',
    f_dia: 'Día y hora de clase', f_mod: 'Módulo del informe',
    objetivo: 'OBJETIVO DEL INFORME',
    objetivo_def: 'Presentar de forma clara el avance de {alumno} en el curso {curso}, describiendo los aprendizajes alcanzados en cada módulo, su nivel de aprovechamiento y los aspectos a reforzar.',
    modo: 'CÓMO INTERPRETAR ESTE INFORME',
    modo_items: [
      ['Aprovechamiento', 'porcentaje alcanzado en cada módulo sobre el puntaje máximo.'],
      ['Bandas de color', 'Óptimo (≥70%), Bueno (50–69%) y En desarrollo (<50%).'],
      ['Visión general', 'gráfico comparativo con todos los módulos del curso.'],
      ['Calificaciones y asistencia', 'tareas enviadas, puntos obtenidos y asistencia por módulo.'],
      ['Detalle por módulo', 'principales aprendizajes y proyecto desarrollado.'],
      ['Consideraciones finales', 'valoración del proceso y próximo paso recomendado.']
    ],
    modo_pie: 'Al final del informe se incluye una valoración del proceso formativo de {alumno}, destacando aspectos relevantes de su desempeño.',
    mensajes: {
      excelente: (nombre, mejor) => `¡Felicitaciones, ${nombre}! Tu desempeño es excelente: demuestras dominio y constancia a lo largo del curso. Destacas especialmente en «${mejor}». ¡Sigue así, vas por un camino sobresaliente!`,
      bueno: (nombre, mejor) => `¡Muy bien, ${nombre}! Tienes un desempeño sólido y parejo. Tu mejor módulo fue «${mejor}». Con un poco más de práctica en los temas que se te resistieron, llegarás al nivel más alto.`,
      regular: (nombre, mejor, peor, peorPct) => `¡Buen trabajo, ${nombre}! Vas construyendo una base firme. Brillaste en «${mejor}». Hay una buena oportunidad de mejorar reforzando «${peor}» (${peorPct}%); ¡con dedicación lo vas a lograr!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, estás dando tus primeros pasos y cada avance cuenta. Tu punto más fuerte fue «${mejor}». Te animamos a reforzar los módulos con menor avance, sobre todo «${peor}» (${peorPct}%). ¡Con práctica y apoyo vas a progresar mucho!`
    }
  },
  pt: {
    titulo: 'RELATÓRIO DE DESENVOLVIMENTO', aluno: 'ALUNO', curso: 'CURSO', profesor: 'PROFESSOR(A)',
    area: 'ÁREA DE INTERESSE', proximo: 'PRÓXIMO NÍVEL RECOMENDADO',
    aprov: 'APROVEITAMENTO MÉDIO', proyectos: 'PROJETOS CONCLUÍDOS',
    mejor: 'MELHOR MÓDULO', modulos: 'MÓDULOS CURSADOS',
    vision: 'VISÃO GERAL DO DESEMPENHO', media: 'Média',
    bandas: ['Ótimo (≥70%)', 'Bom (50–69%)', 'Em desenvolvimento (<50%)'],
    detalle: 'DETALHAMENTO POR MÓDULO', modulo: 'MÓDULO',
    aprendizajes: 'PRINCIPAIS APRENDIZADOS', proyecto: 'PROJETO DESENVOLVIDO',
    consideraciones: 'CONSIDERAÇÕES FINAIS', paso: 'PRÓXIMO PASSO RECOMENDADO',
    pie_lema: 'EDUCAR · INSPIRAR · TRANSFORMAR', pagina: 'Página',
    et_otimo: 'ÓTIMO', et_bom: 'BOM', et_dev: 'EM DESENVOLVIMENTO',
    calif: 'NOTAS E PRESENÇA', tareas: 'TAREFAS ENVIADAS', asist: 'PRESENÇA',
    th_modulo: 'Módulo', th_tareas: 'Tarefas', th_puntos: 'Pontos', th_avance: 'Progresso',
    asis_titulo: 'PRESENÇA NAS AULAS', est_pres: 'Presente', est_aus: 'Ausente', est_just: 'Justif.',
    msg: 'MENSAGEM PARA VOCÊ', firma: 'ASSINATURA DO PROFESSOR(A)', sello: 'SELO KODLAND',
    datos: 'DADOS BÁSICOS DO ESTUDANTE',
    f_alumno: 'Nome do estudante', f_acu: 'Nome do responsável',
    f_mail: 'E-mail', f_tel: 'Telefone', f_pais: 'País de residência',
    f_cod: 'Código do grupo', f_tipo: 'Tipo de grupo',
    f_dia: 'Dia e hora da aula', f_mod: 'Módulo do relatório',
    objetivo: 'OBJETIVO DO RELATÓRIO',
    objetivo_def: 'Apresentar de forma clara o avanço de {alumno} no curso {curso}, descrevendo os aprendizados alcançados em cada módulo, seu nível de aproveitamento e os aspectos a reforçar.',
    modo: 'COMO INTERPRETAR ESTE RELATÓRIO',
    modo_items: [
      ['Aproveitamento', 'porcentagem alcançada em cada módulo sobre a pontuação máxima.'],
      ['Faixas de cor', 'Ótimo (≥70%), Bom (50–69%) e Em desenvolvimento (<50%).'],
      ['Visão geral', 'gráfico comparativo com todos os módulos do curso.'],
      ['Notas e presença', 'tarefas enviadas, pontos obtidos e presença por módulo.'],
      ['Detalhamento por módulo', 'principais aprendizados e projeto desenvolvido.'],
      ['Considerações finais', 'avaliação do processo e próximo passo recomendado.']
    ],
    modo_pie: 'No fim do relatório inclui-se uma valoração do processo formativo de {alumno}, destacando aspectos relevantes do seu desempenho.',
    mensajes: {
      excelente: (nombre, mejor) => `Parabéns, ${nombre}! Seu desempenho é excelente: você demonstra domínio e constância ao longo do curso. Você se destaca especialmente em «${mejor}». Continue assim, você está em um caminho excepcional!`,
      bueno: (nombre, mejor) => `Muito bem, ${nombre}! Você tem um desempenho sólido e equilibrado. Seu melhor módulo foi «${mejor}». Com um pouco mais de prática nos temas que ofereceram mais resistência, você vai alcançar o nível mais alto.`,
      regular: (nombre, mejor, peor, peorPct) => `Bom trabalho, ${nombre}! Você está construindo uma base firme. Você brilhou em «${mejor}». Há uma boa oportunidade de melhorar reforçando «${peor}» (${peorPct}%); com dedicação você vai conseguir!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, você está dando os primeiros passos e cada avanço conta. Seu ponto mais forte foi «${mejor}». Te incentivamos a reforçar os módulos com menor avanço, especialmente «${peor}» (${peorPct}%). Com prática e apoio você vai progredir muito!`
    }
  },
  en: {
    titulo: 'DEVELOPMENT REPORT', aluno: 'STUDENT', curso: 'COURSE', profesor: 'TEACHER',
    area: 'AREA OF INTEREST', proximo: 'RECOMMENDED NEXT LEVEL',
    aprov: 'AVERAGE PERFORMANCE', proyectos: 'PROJECTS COMPLETED',
    mejor: 'BEST MODULE', modulos: 'MODULES TAKEN',
    vision: 'PERFORMANCE OVERVIEW', media: 'Average',
    bandas: ['Excellent (≥70%)', 'Good (50–69%)', 'Developing (<50%)'],
    detalle: 'MODULE DETAIL', modulo: 'MODULE',
    aprendizajes: 'KEY LEARNINGS', proyecto: 'PROJECT DEVELOPED',
    consideraciones: 'FINAL REMARKS', paso: 'RECOMMENDED NEXT STEP',
    pie_lema: 'EDUCATE · INSPIRE · TRANSFORM', pagina: 'Page',
    et_otimo: 'EXCELLENT', et_bom: 'GOOD', et_dev: 'DEVELOPING',
    calif: 'GRADES AND ATTENDANCE', tareas: 'TASKS SUBMITTED', asist: 'ATTENDANCE',
    th_modulo: 'Module', th_tareas: 'Tasks', th_puntos: 'Points', th_avance: 'Progress',
    asis_titulo: 'CLASS ATTENDANCE', est_pres: 'Present', est_aus: 'Absent', est_just: 'Justified',
    msg: 'A MESSAGE FOR YOU', firma: "TUTOR'S SIGNATURE", sello: 'KODLAND SEAL',
    datos: 'STUDENT BASIC INFORMATION',
    f_alumno: 'Student name', f_acu: 'Parent/guardian name',
    f_mail: 'Email', f_tel: 'Phone', f_pais: 'Country of residence',
    f_cod: 'Group code', f_tipo: 'Group type',
    f_dia: 'Class day and time', f_mod: 'Report module',
    objetivo: 'REPORT OBJECTIVE',
    objetivo_def: "Clearly present {alumno}'s progress in the {curso} course, describing the learning achieved in each module, their performance level, and the areas to reinforce.",
    modo: 'HOW TO READ THIS REPORT',
    modo_items: [
      ['Performance', 'percentage achieved in each module out of the maximum score.'],
      ['Color bands', 'Excellent (≥70%), Good (50–69%) and Developing (<50%).'],
      ['Overview', "comparative chart with all of the course's modules."],
      ['Grades and attendance', 'tasks submitted, points earned and attendance per module.'],
      ['Module detail', 'key learnings and the project developed.'],
      ['Final remarks', 'assessment of the process and recommended next step.']
    ],
    modo_pie: "At the end of the report there's an assessment of {alumno}'s learning process, highlighting relevant aspects of their performance.",
    mensajes: {
      excelente: (nombre, mejor) => `Congratulations, ${nombre}! Your performance is excellent — you show mastery and consistency throughout the course. You especially stand out in "${mejor}". Keep it up, you're on an outstanding path!`,
      bueno: (nombre, mejor) => `Great job, ${nombre}! You have a solid, steady performance. Your best module was "${mejor}". With a bit more practice on the topics that gave you trouble, you'll reach the highest level.`,
      regular: (nombre, mejor, peor, peorPct) => `Good work, ${nombre}! You're building a solid foundation. You shined in "${mejor}". There's a good opportunity to improve by reinforcing "${peor}" (${peorPct}%) — with dedication you'll get there!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, you're taking your first steps and every bit of progress counts. Your strongest point was "${mejor}". We encourage you to reinforce the modules with less progress, especially "${peor}" (${peorPct}%). With practice and support you'll make great progress!`
    }
  },
  ar: {
    titulo: 'تقرير التطور', aluno: 'الطالب', curso: 'الدورة', profesor: 'المعلم(ة)',
    area: 'مجال الاهتمام', proximo: 'المستوى التالي الموصى به',
    aprov: 'متوسط الأداء', proyectos: 'المشاريع المكتملة',
    mejor: 'أفضل وحدة', modulos: 'الوحدات المنجزة',
    vision: 'نظرة عامة على الأداء', media: 'المتوسط',
    bandas: ['ممتاز (≥70%)', 'جيد (50–69%)', 'قيد التطور (<50%)'],
    detalle: 'تفاصيل الوحدات', modulo: 'الوحدة',
    aprendizajes: 'أهم المكتسبات', proyecto: 'المشروع المنجز',
    consideraciones: 'ملاحظات ختامية', paso: 'الخطوة التالية الموصى بها',
    pie_lema: 'تعليم · إلهام · تحويل', pagina: 'صفحة',
    et_otimo: 'ممتاز', et_bom: 'جيد', et_dev: 'قيد التطور',
    calif: 'الدرجات والحضور', tareas: 'المهام المرسلة', asist: 'الحضور',
    th_modulo: 'الوحدة', th_tareas: 'المهام', th_puntos: 'النقاط', th_avance: 'التقدم',
    asis_titulo: 'الحضور في الحصص', est_pres: 'حاضر', est_aus: 'غائب', est_just: 'مبرر',
    msg: 'رسالة لك', firma: 'توقيع المعلم(ة)', sello: 'ختم Kodland',
    datos: 'البيانات الأساسية للطالب',
    f_alumno: 'اسم الطالب', f_acu: 'اسم ولي الأمر',
    f_mail: 'البريد الإلكتروني', f_tel: 'الهاتف', f_pais: 'بلد الإقامة',
    f_cod: 'رمز المجموعة', f_tipo: 'نوع المجموعة',
    f_dia: 'يوم ووقت الحصة', f_mod: 'وحدة التقرير',
    objetivo: 'هدف التقرير',
    objetivo_def: 'عرض تقدم {alumno} بوضوح في دورة {curso}، مع وصف ما تم تعلمه في كل وحدة، ومستوى الأداء، والجوانب التي يجب تعزيزها.',
    modo: 'كيفية قراءة هذا التقرير',
    modo_items: [
      ['الأداء', 'النسبة المئوية المحققة في كل وحدة من أصل الدرجة القصوى.'],
      ['نطاقات الألوان', 'ممتاز (≥70%)، جيد (50–69%)، وقيد التطور (<50%).'],
      ['نظرة عامة', 'رسم بياني مقارن لجميع وحدات الدورة.'],
      ['الدرجات والحضور', 'المهام المرسلة والنقاط المحصلة والحضور لكل وحدة.'],
      ['تفاصيل الوحدات', 'أهم المكتسبات والمشروع المنجز.'],
      ['ملاحظات ختامية', 'تقييم العملية والخطوة التالية الموصى بها.']
    ],
    modo_pie: 'في نهاية التقرير، يتم تضمين تقييم لمسار تعلم {alumno}، مع إبراز الجوانب المهمة في أدائه.',
    mensajes: {
      excelente: (nombre, mejor) => `تهانينا، ${nombre}! أداؤك ممتاز: تُظهر إتقانًا واستمرارية طوال الدورة. تتميز بشكل خاص في «${mejor}». استمر هكذا، أنت في طريق رائع!`,
      bueno: (nombre, mejor) => `أحسنت، ${nombre}! أداؤك قوي ومتوازن. كانت أفضل وحدة لك هي «${mejor}». بقليل من التدريب الإضافي على المواضيع الصعبة، ستصل إلى أعلى مستوى.`,
      regular: (nombre, mejor, peor, peorPct) => `عمل جيد، ${nombre}! أنت تبني أساسًا متينًا. تألقت في «${mejor}». هناك فرصة جيدة للتحسن بتعزيز «${peor}» (${peorPct}%)؛ بالتفاني ستحققه!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}، أنت تخطو خطواتك الأولى وكل تقدم مهم. نقطة قوتك كانت «${mejor}». نشجعك على تعزيز الوحدات ذات التقدم الأقل، خصوصًا «${peor}» (${peorPct}%). بالممارسة والدعم ستحقق تقدمًا كبيرًا!`
    }
  },
  ru: {
    titulo: 'ОТЧЁТ О РАЗВИТИИ', aluno: 'УЧЕНИК', curso: 'КУРС', profesor: 'ПРЕПОДАВАТЕЛЬ',
    area: 'ОБЛАСТЬ ИНТЕРЕСОВ', proximo: 'РЕКОМЕНДУЕМЫЙ СЛЕДУЮЩИЙ УРОВЕНЬ',
    aprov: 'СРЕДНЯЯ УСПЕВАЕМОСТЬ', proyectos: 'ЗАВЕРШЁННЫЕ ПРОЕКТЫ',
    mejor: 'ЛУЧШИЙ МОДУЛЬ', modulos: 'ПРОЙДЕННЫЕ МОДУЛИ',
    vision: 'ОБЩИЙ ОБЗОР УСПЕВАЕМОСТИ', media: 'Среднее',
    bandas: ['Отлично (≥70%)', 'Хорошо (50–69%)', 'В развитии (<50%)'],
    detalle: 'ДЕТАЛИЗАЦИЯ ПО МОДУЛЯМ', modulo: 'МОДУЛЬ',
    aprendizajes: 'ОСНОВНЫЕ ЗНАНИЯ', proyecto: 'РАЗРАБОТАННЫЙ ПРОЕКТ',
    consideraciones: 'ЗАКЛЮЧИТЕЛЬНЫЕ ЗАМЕЧАНИЯ', paso: 'РЕКОМЕНДУЕМЫЙ СЛЕДУЮЩИЙ ШАГ',
    pie_lema: 'ОБУЧАТЬ · ВДОХНОВЛЯТЬ · ПРЕОБРАЖАТЬ', pagina: 'Страница',
    et_otimo: 'ОТЛИЧНО', et_bom: 'ХОРОШО', et_dev: 'В РАЗВИТИИ',
    calif: 'ОЦЕНКИ И ПОСЕЩАЕМОСТЬ', tareas: 'ОТПРАВЛЕННЫЕ ЗАДАНИЯ', asist: 'ПОСЕЩАЕМОСТЬ',
    th_modulo: 'Модуль', th_tareas: 'Задания', th_puntos: 'Баллы', th_avance: 'Прогресс',
    asis_titulo: 'ПОСЕЩАЕМОСТЬ ЗАНЯТИЙ', est_pres: 'Присутствовал', est_aus: 'Отсутствовал', est_just: 'Уважительная',
    msg: 'СООБЩЕНИЕ ДЛЯ ТЕБЯ', firma: 'ПОДПИСЬ ПРЕПОДАВАТЕЛЯ', sello: 'ПЕЧАТЬ KODLAND',
    datos: 'ОСНОВНЫЕ ДАННЫЕ УЧЕНИКА',
    f_alumno: 'Имя ученика', f_acu: 'Имя родителя/опекуна',
    f_mail: 'Эл. почта', f_tel: 'Телефон', f_pais: 'Страна проживания',
    f_cod: 'Код группы', f_tipo: 'Тип группы',
    f_dia: 'День и время занятий', f_mod: 'Модуль отчёта',
    objetivo: 'ЦЕЛЬ ОТЧЁТА',
    objetivo_def: 'Ясно представить прогресс {alumno} на курсе {curso}, описав знания, полученные в каждом модуле, уровень успеваемости и аспекты, которые стоит закрепить.',
    modo: 'КАК ЧИТАТЬ ЭТОТ ОТЧЁТ',
    modo_items: [
      ['Успеваемость', 'процент, достигнутый в каждом модуле от максимального балла.'],
      ['Цветовые категории', 'Отлично (≥70%), Хорошо (50–69%) и В развитии (<50%).'],
      ['Общий обзор', 'сравнительный график по всем модулям курса.'],
      ['Оценки и посещаемость', 'отправленные задания, набранные баллы и посещаемость по модулям.'],
      ['Детализация по модулям', 'основные знания и разработанный проект.'],
      ['Заключительные замечания', 'оценка процесса и рекомендуемый следующий шаг.']
    ],
    modo_pie: 'В конце отчёта приводится оценка учебного процесса {alumno} с указанием значимых аспектов его успеваемости.',
    mensajes: {
      excelente: (nombre, mejor) => `Поздравляем, ${nombre}! Твои результаты отличные: ты показываешь мастерство и постоянство на протяжении всего курса. Особенно ты отличился в «${mejor}». Так держать, ты на выдающемся пути!`,
      bueno: (nombre, mejor) => `Отлично, ${nombre}! У тебя стабильные и ровные результаты. Твой лучший модуль — «${mejor}». Немного больше практики по темам, которые давались сложнее, и ты достигнешь высшего уровня.`,
      regular: (nombre, mejor, peor, peorPct) => `Хорошая работа, ${nombre}! Ты строишь крепкую основу. Ты блеснул в «${mejor}». Есть хорошая возможность улучшить результат, закрепив «${peor}» (${peorPct}%); с усердием у тебя получится!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, ты делаешь первые шаги, и каждый прогресс важен. Твоя сильная сторона — «${mejor}». Советуем закрепить модули с меньшим прогрессом, особенно «${peor}» (${peorPct}%). С практикой и поддержкой ты сильно продвинешься!`
    }
  },
  fr: {
    titulo: 'RAPPORT DE DÉVELOPPEMENT', aluno: 'ÉLÈVE', curso: 'COURS', profesor: 'PROFESSEUR(E)',
    area: "DOMAINE D'INTÉRÊT", proximo: 'PROCHAIN NIVEAU RECOMMANDÉ',
    aprov: 'PERFORMANCE MOYENNE', proyectos: 'PROJETS TERMINÉS',
    mejor: 'MEILLEUR MODULE', modulos: 'MODULES SUIVIS',
    vision: "VUE D'ENSEMBLE DE LA PERFORMANCE", media: 'Moyenne',
    bandas: ['Excellent (≥70%)', 'Bien (50–69%)', 'En développement (<50%)'],
    detalle: 'DÉTAIL PAR MODULE', modulo: 'MODULE',
    aprendizajes: 'PRINCIPAUX APPRENTISSAGES', proyecto: 'PROJET DÉVELOPPÉ',
    consideraciones: 'REMARQUES FINALES', paso: 'PROCHAINE ÉTAPE RECOMMANDÉE',
    pie_lema: 'ÉDUQUER · INSPIRER · TRANSFORMER', pagina: 'Page',
    et_otimo: 'EXCELLENT', et_bom: 'BIEN', et_dev: 'EN DÉVELOPPEMENT',
    calif: 'NOTES ET PRÉSENCE', tareas: 'DEVOIRS ENVOYÉS', asist: 'PRÉSENCE',
    th_modulo: 'Module', th_tareas: 'Devoirs', th_puntos: 'Points', th_avance: 'Progression',
    asis_titulo: 'PRÉSENCE AUX COURS', est_pres: 'Présent', est_aus: 'Absent', est_just: 'Justifié',
    msg: 'UN MESSAGE POUR TOI', firma: 'SIGNATURE DU PROFESSEUR(E)', sello: 'SCEAU KODLAND',
    datos: "INFORMATIONS DE BASE DE L'ÉLÈVE",
    f_alumno: "Nom de l'élève", f_acu: 'Nom du parent/tuteur',
    f_mail: 'E-mail', f_tel: 'Téléphone', f_pais: 'Pays de résidence',
    f_cod: 'Code du groupe', f_tipo: 'Type de groupe',
    f_dia: 'Jour et heure du cours', f_mod: 'Module du rapport',
    objetivo: 'OBJECTIF DU RAPPORT',
    objetivo_def: "Présenter clairement les progrès de {alumno} dans le cours {curso}, en décrivant les apprentissages réalisés dans chaque module, son niveau de performance et les aspects à renforcer.",
    modo: 'COMMENT LIRE CE RAPPORT',
    modo_items: [
      ['Performance', 'pourcentage atteint dans chaque module par rapport au score maximal.'],
      ['Catégories de couleur', 'Excellent (≥70%), Bien (50–69%) et En développement (<50%).'],
      ["Vue d'ensemble", "graphique comparatif de tous les modules du cours."],
      ['Notes et présence', 'devoirs envoyés, points obtenus et présence par module.'],
      ['Détail par module', 'principaux apprentissages et projet développé.'],
      ['Remarques finales', 'évaluation du processus et prochaine étape recommandée.']
    ],
    modo_pie: "À la fin du rapport figure une évaluation du parcours d'apprentissage de {alumno}, mettant en avant les aspects pertinents de sa performance.",
    mensajes: {
      excelente: (nombre, mejor) => `Félicitations, ${nombre} ! Ta performance est excellente : tu fais preuve de maîtrise et de constance tout au long du cours. Tu te distingues particulièrement en « ${mejor} ». Continue ainsi, tu es sur une voie exceptionnelle !`,
      bueno: (nombre, mejor) => `Très bien, ${nombre} ! Tu as une performance solide et régulière. Ton meilleur module était « ${mejor} ». Avec un peu plus de pratique sur les sujets qui t'ont posé des difficultés, tu atteindras le niveau le plus élevé.`,
      regular: (nombre, mejor, peor, peorPct) => `Bon travail, ${nombre} ! Tu construis une base solide. Tu as brillé en « ${mejor} ». Il y a une belle opportunité de progresser en renforçant « ${peor} » (${peorPct}%) ; avec de la persévérance tu vas y arriver !`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, tu fais tes premiers pas et chaque progrès compte. Ton point fort était « ${mejor} ». Nous t'encourageons à renforcer les modules avec moins de progression, surtout « ${peor} » (${peorPct}%). Avec de la pratique et du soutien, tu vas beaucoup progresser !`
    }
  },
  tr: {
    titulo: 'GELİŞİM RAPORU', aluno: 'ÖĞRENCİ', curso: 'KURS', profesor: 'ÖĞRETMEN',
    area: 'İLGİ ALANI', proximo: 'ÖNERİLEN SONRAKİ SEVİYE',
    aprov: 'ORTALAMA PERFORMANS', proyectos: 'TAMAMLANAN PROJELER',
    mejor: 'EN İYİ MODÜL', modulos: 'TAMAMLANAN MODÜLLER',
    vision: 'PERFORMANS GENEL BAKIŞI', media: 'Ortalama',
    bandas: ['Mükemmel (≥70%)', 'İyi (50–69%)', 'Gelişmekte (<50%)'],
    detalle: 'MODÜL DETAYI', modulo: 'MODÜL',
    aprendizajes: 'TEMEL ÖĞRENİMLER', proyecto: 'GELİŞTİRİLEN PROJE',
    consideraciones: 'SON DEĞERLENDİRMELER', paso: 'ÖNERİLEN SONRAKİ ADIM',
    pie_lema: 'EĞİT · İLHAM VER · DÖNÜŞTÜR', pagina: 'Sayfa',
    et_otimo: 'MÜKEMMEL', et_bom: 'İYİ', et_dev: 'GELİŞMEKTE',
    calif: 'NOTLAR VE DEVAM', tareas: 'GÖNDERİLEN ÖDEVLER', asist: 'DEVAM',
    th_modulo: 'Modül', th_tareas: 'Ödevler', th_puntos: 'Puanlar', th_avance: 'İlerleme',
    asis_titulo: 'DERS DEVAMI', est_pres: 'Mevcut', est_aus: 'Devamsız', est_just: 'Mazeretli',
    msg: 'SANA BİR MESAJ', firma: 'ÖĞRETMEN İMZASI', sello: 'KODLAND MÜHRÜ',
    datos: 'ÖĞRENCİ TEMEL BİLGİLERİ',
    f_alumno: 'Öğrenci adı', f_acu: 'Veli adı',
    f_mail: 'E-posta', f_tel: 'Telefon', f_pais: 'İkamet ülkesi',
    f_cod: 'Grup kodu', f_tipo: 'Grup türü',
    f_dia: 'Ders günü ve saati', f_mod: 'Rapor modülü',
    objetivo: 'RAPORUN AMACI',
    objetivo_def: "{curso} kursunda {alumno}'nın ilerlemesini açıkça sunmak; her modülde kazanılan öğrenimleri, performans düzeyini ve güçlendirilmesi gereken yönleri açıklamak.",
    modo: 'BU RAPOR NASIL OKUNUR',
    modo_items: [
      ['Performans', 'her modülde maksimum puana göre elde edilen yüzde.'],
      ['Renk kategorileri', 'Mükemmel (≥70%), İyi (50–69%) ve Gelişmekte (<50%).'],
      ['Genel bakış', 'kursun tüm modüllerini karşılaştıran grafik.'],
      ['Notlar ve devam', 'modül başına gönderilen ödevler, kazanılan puanlar ve devam.'],
      ['Modül detayı', 'temel öğrenimler ve geliştirilen proje.'],
      ['Son değerlendirmeler', 'sürecin değerlendirilmesi ve önerilen sonraki adım.']
    ],
    modo_pie: "Raporun sonunda, {alumno}'nın öğrenim sürecine ilişkin, performansının önemli yönlerini vurgulayan bir değerlendirme yer almaktadır.",
    mensajes: {
      excelente: (nombre, mejor) => `Tebrikler, ${nombre}! Performansın mükemmel: kurs boyunca ustalık ve istikrar gösteriyorsun. Özellikle «${mejor}» konusunda öne çıkıyorsun. Böyle devam et, olağanüstü bir yoldasın!`,
      bueno: (nombre, mejor) => `Çok iyi, ${nombre}! Sağlam ve istikrarlı bir performansın var. En iyi modülün «${mejor}» oldu. Zorlandığın konularda biraz daha pratik yaparak en üst seviyeye ulaşacaksın.`,
      regular: (nombre, mejor, peor, peorPct) => `Güzel iş, ${nombre}! Sağlam bir temel oluşturuyorsun. «${mejor}» konusunda parladın. «${peor}» (%${peorPct}) konusunu güçlendirerek gelişmek için iyi bir fırsat var; azimle başaracaksın!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, ilk adımlarını atıyorsun ve her ilerleme önemli. En güçlü yönün «${mejor}» oldu. İlerlemesi daha az olan modülleri, özellikle «${peor}» (%${peorPct}) konusunu güçlendirmeni öneririz. Pratik ve destekle çok ilerleyeceksin!`
    }
  },
  id: {
    titulo: 'LAPORAN PERKEMBANGAN', aluno: 'SISWA', curso: 'KURSUS', profesor: 'GURU',
    area: 'BIDANG MINAT', proximo: 'TINGKAT SELANJUTNYA YANG DIREKOMENDASIKAN',
    aprov: 'RATA-RATA PENCAPAIAN', proyectos: 'PROYEK SELESAI',
    mejor: 'MODUL TERBAIK', modulos: 'MODUL YANG DIIKUTI',
    vision: 'GAMBARAN UMUM KINERJA', media: 'Rata-rata',
    bandas: ['Sangat baik (≥70%)', 'Baik (50–69%)', 'Masih berkembang (<50%)'],
    detalle: 'DETAIL PER MODUL', modulo: 'MODUL',
    aprendizajes: 'PEMBELAJARAN UTAMA', proyecto: 'PROYEK YANG DIKEMBANGKAN',
    consideraciones: 'CATATAN AKHIR', paso: 'LANGKAH SELANJUTNYA YANG DIREKOMENDASIKAN',
    pie_lema: 'MENDIDIK · MENGINSPIRASI · MENGUBAH', pagina: 'Halaman',
    et_otimo: 'SANGAT BAIK', et_bom: 'BAIK', et_dev: 'MASIH BERKEMBANG',
    calif: 'NILAI DAN KEHADIRAN', tareas: 'TUGAS TERKIRIM', asist: 'KEHADIRAN',
    th_modulo: 'Modul', th_tareas: 'Tugas', th_puntos: 'Poin', th_avance: 'Kemajuan',
    asis_titulo: 'KEHADIRAN KELAS', est_pres: 'Hadir', est_aus: 'Tidak hadir', est_just: 'Izin',
    msg: 'PESAN UNTUKMU', firma: 'TANDA TANGAN GURU', sello: 'STEMPEL KODLAND',
    datos: 'DATA DASAR SISWA',
    f_alumno: 'Nama siswa', f_acu: 'Nama orang tua/wali',
    f_mail: 'Email', f_tel: 'Telepon', f_pais: 'Negara domisili',
    f_cod: 'Kode grup', f_tipo: 'Jenis grup',
    f_dia: 'Hari dan jam kelas', f_mod: 'Modul laporan',
    objetivo: 'TUJUAN LAPORAN',
    objetivo_def: 'Menyajikan dengan jelas kemajuan {alumno} dalam kursus {curso}, menjelaskan pembelajaran yang dicapai di setiap modul, tingkat pencapaiannya, dan aspek yang perlu diperkuat.',
    modo: 'CARA MEMBACA LAPORAN INI',
    modo_items: [
      ['Pencapaian', 'persentase yang dicapai di setiap modul dari skor maksimum.'],
      ['Kategori warna', 'Sangat baik (≥70%), Baik (50–69%), dan Masih berkembang (<50%).'],
      ['Gambaran umum', 'grafik perbandingan semua modul kursus.'],
      ['Nilai dan kehadiran', 'tugas terkirim, poin yang diperoleh, dan kehadiran per modul.'],
      ['Detail per modul', 'pembelajaran utama dan proyek yang dikembangkan.'],
      ['Catatan akhir', 'penilaian proses dan langkah selanjutnya yang direkomendasikan.']
    ],
    modo_pie: 'Di akhir laporan terdapat penilaian proses belajar {alumno}, menyoroti aspek-aspek penting dari kinerjanya.',
    mensajes: {
      excelente: (nombre, mejor) => `Selamat, ${nombre}! Performamu luar biasa: kamu menunjukkan penguasaan dan konsistensi sepanjang kursus. Kamu menonjol khususnya di «${mejor}». Terus semangat, kamu berada di jalur yang luar biasa!`,
      bueno: (nombre, mejor) => `Bagus sekali, ${nombre}! Performamu solid dan stabil. Modul terbaikmu adalah «${mejor}». Dengan sedikit lagi latihan pada topik yang sulit, kamu akan mencapai level tertinggi.`,
      regular: (nombre, mejor, peor, peorPct) => `Kerja bagus, ${nombre}! Kamu sedang membangun fondasi yang kuat. Kamu bersinar di «${mejor}». Ada peluang bagus untuk meningkat dengan memperkuat «${peor}» (${peorPct}%); dengan dedikasi kamu pasti berhasil!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, kamu sedang mengambil langkah pertama dan setiap kemajuan berarti. Poin terkuatmu adalah «${mejor}». Kami mendorongmu untuk memperkuat modul dengan kemajuan lebih sedikit, terutama «${peor}» (${peorPct}%). Dengan latihan dan dukungan kamu akan banyak berkembang!`
    }
  },
  it: {
    titulo: 'REPORT DI SVILUPPO', aluno: 'STUDENTE', curso: 'CORSO', profesor: 'INSEGNANTE',
    area: "AREA DI INTERESSE", proximo: 'PROSSIMO LIVELLO CONSIGLIATO',
    aprov: 'RENDIMENTO MEDIO', proyectos: 'PROGETTI COMPLETATI',
    mejor: 'MIGLIOR MODULO', modulos: 'MODULI SVOLTI',
    vision: 'PANORAMICA DEL RENDIMENTO', media: 'Media',
    bandas: ['Ottimo (≥70%)', 'Buono (50–69%)', 'In sviluppo (<50%)'],
    detalle: 'DETTAGLIO PER MODULO', modulo: 'MODULO',
    aprendizajes: 'PRINCIPALI APPRENDIMENTI', proyecto: 'PROGETTO SVILUPPATO',
    consideraciones: 'CONSIDERAZIONI FINALI', paso: 'PROSSIMO PASSO CONSIGLIATO',
    pie_lema: 'EDUCARE · ISPIRARE · TRASFORMARE', pagina: 'Pagina',
    et_otimo: 'OTTIMO', et_bom: 'BUONO', et_dev: 'IN SVILUPPO',
    calif: 'VOTI E PRESENZA', tareas: 'COMPITI INVIATI', asist: 'PRESENZA',
    th_modulo: 'Modulo', th_tareas: 'Compiti', th_puntos: 'Punti', th_avance: 'Avanzamento',
    asis_titulo: 'PRESENZA ALLE LEZIONI', est_pres: 'Presente', est_aus: 'Assente', est_just: 'Giustificata',
    msg: 'UN MESSAGGIO PER TE', firma: "FIRMA DELL'INSEGNANTE", sello: 'TIMBRO KODLAND',
    datos: 'DATI DI BASE DELLO STUDENTE',
    f_alumno: 'Nome dello studente', f_acu: 'Nome del genitore/tutore',
    f_mail: 'E-mail', f_tel: 'Telefono', f_pais: 'Paese di residenza',
    f_cod: 'Codice del gruppo', f_tipo: 'Tipo di gruppo',
    f_dia: 'Giorno e orario della lezione', f_mod: 'Modulo del report',
    objetivo: 'OBIETTIVO DEL REPORT',
    objetivo_def: "Presentare chiaramente i progressi di {alumno} nel corso {curso}, descrivendo gli apprendimenti raggiunti in ogni modulo, il suo livello di rendimento e gli aspetti da rafforzare.",
    modo: 'COME LEGGERE QUESTO REPORT',
    modo_items: [
      ['Rendimento', 'percentuale raggiunta in ogni modulo rispetto al punteggio massimo.'],
      ['Fasce di colore', 'Ottimo (≥70%), Buono (50–69%) e In sviluppo (<50%).'],
      ['Panoramica', 'grafico comparativo di tutti i moduli del corso.'],
      ['Voti e presenza', 'compiti inviati, punti ottenuti e presenza per modulo.'],
      ['Dettaglio per modulo', 'principali apprendimenti e progetto sviluppato.'],
      ['Considerazioni finali', 'valutazione del percorso e prossimo passo consigliato.']
    ],
    modo_pie: 'Alla fine del report è inclusa una valutazione del percorso formativo di {alumno}, evidenziando aspetti rilevanti del suo rendimento.',
    mensajes: {
      excelente: (nombre, mejor) => `Complimenti, ${nombre}! Il tuo rendimento è eccellente: dimostri padronanza e costanza durante tutto il corso. Ti distingui in particolare in «${mejor}». Continua così, sei su un percorso straordinario!`,
      bueno: (nombre, mejor) => `Molto bene, ${nombre}! Hai un rendimento solido e costante. Il tuo modulo migliore è stato «${mejor}». Con un po' più di pratica sugli argomenti più difficili, raggiungerai il livello più alto.`,
      regular: (nombre, mejor, peor, peorPct) => `Bel lavoro, ${nombre}! Stai costruendo una base solida. Hai brillato in «${mejor}». C'è una buona opportunità di migliorare rafforzando «${peor}» (${peorPct}%); con dedizione ce la farai!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, stai muovendo i primi passi e ogni progresso conta. Il tuo punto di forza è stato «${mejor}». Ti incoraggiamo a rafforzare i moduli con minor progresso, soprattutto «${peor}» (${peorPct}%). Con pratica e supporto farai grandi progressi!`
    }
  },
  pl: {
    titulo: 'RAPORT ROZWOJU', aluno: 'UCZEŃ', curso: 'KURS', profesor: 'NAUCZYCIEL(KA)',
    area: 'OBSZAR ZAINTERESOWAŃ', proximo: 'ZALECANY NASTĘPNY POZIOM',
    aprov: 'ŚREDNI WYNIK', proyectos: 'UKOŃCZONE PROJEKTY',
    mejor: 'NAJLEPSZY MODUŁ', modulos: 'UKOŃCZONE MODUŁY',
    vision: 'OGÓLNY PRZEGLĄD WYNIKÓW', media: 'Średnia',
    bandas: ['Świetnie (≥70%)', 'Dobrze (50–69%)', 'W trakcie rozwoju (<50%)'],
    detalle: 'SZCZEGÓŁY WEDŁUG MODUŁU', modulo: 'MODUŁ',
    aprendizajes: 'GŁÓWNE UMIEJĘTNOŚCI', proyecto: 'ZREALIZOWANY PROJEKT',
    consideraciones: 'UWAGI KOŃCOWE', paso: 'ZALECANY NASTĘPNY KROK',
    pie_lema: 'EDUKOWAĆ · INSPIROWAĆ · PRZEKSZTAŁCAĆ', pagina: 'Strona',
    et_otimo: 'ŚWIETNIE', et_bom: 'DOBRZE', et_dev: 'W TRAKCIE ROZWOJU',
    calif: 'OCENY I FREKWENCJA', tareas: 'PRZESŁANE ZADANIA', asist: 'FREKWENCJA',
    th_modulo: 'Moduł', th_tareas: 'Zadania', th_puntos: 'Punkty', th_avance: 'Postęp',
    asis_titulo: 'FREKWENCJA NA ZAJĘCIACH', est_pres: 'Obecność', est_aus: 'Nieobecność', est_just: 'Usprawiedliwiona',
    msg: 'WIADOMOŚĆ DLA CIEBIE', firma: 'PODPIS NAUCZYCIELA(KI)', sello: 'PIECZĘĆ KODLAND',
    datos: 'PODSTAWOWE DANE UCZNIA',
    f_alumno: 'Imię ucznia', f_acu: 'Imię rodzica/opiekuna',
    f_mail: 'E-mail', f_tel: 'Telefon', f_pais: 'Kraj zamieszkania',
    f_cod: 'Kod grupy', f_tipo: 'Typ grupy',
    f_dia: 'Dzień i godzina zajęć', f_mod: 'Moduł raportu',
    objetivo: 'CEL RAPORTU',
    objetivo_def: 'Jasno przedstawić postępy {alumno} na kursie {curso}, opisując umiejętności zdobyte w każdym module, poziom wyników i aspekty do wzmocnienia.',
    modo: 'JAK CZYTAĆ TEN RAPORT',
    modo_items: [
      ['Wyniki', 'procent osiągnięty w każdym module w stosunku do maksymalnej punktacji.'],
      ['Kategorie kolorów', 'Świetnie (≥70%), Dobrze (50–69%) i W trakcie rozwoju (<50%).'],
      ['Przegląd ogólny', 'wykres porównawczy wszystkich modułów kursu.'],
      ['Oceny i frekwencja', 'przesłane zadania, zdobyte punkty i frekwencja w module.'],
      ['Szczegóły według modułu', 'główne umiejętności i zrealizowany projekt.'],
      ['Uwagi końcowe', 'ocena procesu i zalecany następny krok.']
    ],
    modo_pie: 'Na końcu raportu zamieszczona jest ocena procesu nauki {alumno}, podkreślająca istotne aspekty jego/jej wyników.',
    mensajes: {
      excelente: (nombre, mejor) => `Gratulacje, ${nombre}! Twoje wyniki są znakomite: wykazujesz się biegłością i konsekwencją przez cały kurs. Szczególnie wyróżniasz się w «${mejor}». Tak trzymaj, jesteś na wspaniałej drodze!`,
      bueno: (nombre, mejor) => `Bardzo dobrze, ${nombre}! Masz solidne i wyrównane wyniki. Twoim najlepszym modułem był «${mejor}». Z odrobiną dodatkowej praktyki w trudniejszych tematach osiągniesz najwyższy poziom.`,
      regular: (nombre, mejor, peor, peorPct) => `Dobra robota, ${nombre}! Budujesz solidne podstawy. Zabłysnąłeś/zabłysnęłaś w «${mejor}». Jest dobra okazja, by się poprawić, wzmacniając «${peor}» (${peorPct}%); z zaangażowaniem na pewno ci się uda!`,
      inicial: (nombre, mejor, peor, peorPct) => `${nombre}, stawiasz pierwsze kroki i każdy postęp się liczy. Twoją najmocniejszą stroną był «${mejor}». Zachęcamy do wzmocnienia modułów z mniejszym postępem, zwłaszcza «${peor}» (${peorPct}%). Dzięki praktyce i wsparciu zrobisz duże postępy!`
    }
  }
};

function getReportUi(language) {
  return REPORT_UI[language] || REPORT_UI.es;
}

function reportBanda(pct, ui) {
  if (pct >= 70) return [ui.et_otimo, 'otimo'];
  if (pct >= 50) return [ui.et_bom, 'bom'];
  return [ui.et_dev, 'dev'];
}

function reportSustituir(texto, nombre) {
  return (texto || '').split('{alumno}').join(nombre);
}

function reportMensajeDesempeno(promedio, nombre, mods, pcts, ui) {
  const n = pcts.length;
  const idx = [];
  for (let i = 0; i < n; i++) if (pcts[i] > 0) idx.push(i);
  const cursados = idx.length ? idx : Array.from({ length: n }, (_, i) => i);
  if (!cursados.length) return '';
  const mejorI = cursados.reduce((best, i) => (pcts[i] > pcts[best] ? i : best), cursados[0]);
  const peorI = cursados.reduce((worst, i) => (pcts[i] < pcts[worst] ? i : worst), cursados[0]);
  const mejor = mods[mejorI].titulo;
  const peor = mods[peorI].titulo;
  const peorPct = pcts[peorI];
  if (promedio >= 85) return ui.mensajes.excelente(nombre, mejor);
  if (promedio >= 70) return ui.mensajes.bueno(nombre, mejor);
  if (promedio >= 50) return ui.mensajes.regular(nombre, mejor, peor, peorPct);
  return ui.mensajes.inicial(nombre, mejor, peor, peorPct);
}

function tituloCase(s) {
  return String(s || '').toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
}

let reportBannerDataUriPromise = null;
function getReportBannerDataUri() {
  if (!reportBannerDataUriPromise) {
    reportBannerDataUriPromise = (async () => {
      try {
        const response = await fetch(chrome.runtime.getURL('calificador/reportes/img/banner_kodland.png'));
        if (!response.ok) return '';
        const blob = await response.blob();
        return await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('[PDF Report] No se pudo cargar el banner:', error);
        return '';
      }
    })();
  }
  return reportBannerDataUriPromise;
}

// curso: el JSON de calificador/reportes/curso_*.json (ya filtrado a los
// módulos cursados por loadStudentReportData). alumno: {alumno, profesor,
// pct[], puntos:[[cur,max]], tareas:[[env,tot]], asistencia:{asistidas,total,
// sesiones:[{fecha,estado:'present'|'absent'|'justified'}]}, datos:{...}}.
async function buildStudentReportHtml(curso, alumno, language) {
  const ui = getReportUi(language);
  const nombre = alumno.alumno;
  const mods = curso.modulos;
  const n = Math.min(mods.length, alumno.pct.length);
  const modsSlice = mods.slice(0, n);
  const pctsSlice = alumno.pct.slice(0, n).map(p => Math.max(0, Math.min(100, Math.round(p))));

  const cursadosIdx = [];
  for (let i = 0; i < n; i++) if (pctsSlice[i] > 0) cursadosIdx.push(i);
  const cursados = cursadosIdx.length ? cursadosIdx : Array.from({ length: n }, (_, i) => i);
  const promedio = cursados.length
    ? Math.round(cursados.reduce((sum, i) => sum + pctsSlice[i], 0) / cursados.length)
    : 0;
  const mejorI = cursados.length ? cursados.reduce((best, i) => (pctsSlice[i] > pctsSlice[best] ? i : best), cursados[0]) : 0;
  const mejorPct = n ? pctsSlice[mejorI] : 0;
  const mejorMod = n ? modsSlice[mejorI].numero : 0;

  const tareas = alumno.tareas;
  const puntos = alumno.puntos;
  const asis = alumno.asistencia;
  const combinado = !!(asis || tareas);
  const tEnv = tareas ? tareas.reduce((sum, par) => sum + par[0], 0) : 0;
  const tTot = tareas ? tareas.reduce((sum, par) => sum + par[1], 0) : 0;
  const aSi = asis ? asis.asistidas : 0;
  const aTot = asis ? asis.total : 0;

  const statsHtml = combinado
    ? `<div class="stat oscuro"><div class="num">${promedio}<small>%</small></div><div class="lbl">${ui.aprov}</div></div>
       <div class="stat"><div class="num">${tEnv}<small>/${tTot}</small></div><div class="lbl">${ui.tareas}</div></div>
       <div class="stat"><div class="num">${aSi}<small>/${aTot}</small></div><div class="lbl">${ui.asist}</div></div>
       <div class="stat"><div class="num">${mejorPct}<small>%</small></div><div class="lbl">${ui.mejor} (M${mejorMod})</div></div>`
    : `<div class="stat oscuro"><div class="num">${promedio}<small>%</small></div><div class="lbl">${ui.aprov}</div></div>
       <div class="stat"><div class="num">${n}</div><div class="lbl">${ui.proyectos}</div></div>
       <div class="stat"><div class="num">${mejorPct}<small>%</small></div><div class="lbl">${ui.mejor} (M${mejorMod})</div></div>
       <div class="stat"><div class="num">${n}</div><div class="lbl">${ui.modulos}</div></div>`;

  const msg = n ? reportMensajeDesempeno(promedio, nombre, modsSlice, pctsSlice, ui) : '';
  const mensajeHtml = msg ? `<div class="mensaje"><div class="k">${ui.msg}</div><p>${escapeHtml(msg)}</p></div>` : '';

  const d = alumno.datos || {};
  const modInf = d.modulo_informe || (n && cursados.length ? `M${modsSlice[cursados[cursados.length - 1]].numero}` : '');
  const celda = v => {
    v = String(v || '').trim();
    return v ? `<td>${escapeHtml(v)}</td>` : '<td class="vacio">—</td>';
  };
  const filasDb = [
    [ui.f_alumno, nombre, ui.f_cod, d.codigo_grupo || ''],
    [ui.f_acu, d.acudiente || '', ui.f_tipo, d.tipo_grupo || ''],
    [ui.f_mail, d.email || '', ui.f_dia, d.dia_hora || ''],
    [ui.f_tel, d.telefono || '', ui.f_mod, modInf],
    [ui.f_pais, d.pais || '', ui.curso, curso.curso || '']
  ];
  const tablaDb = filasDb.map(([a, b, c, e]) => `<tr><th>${escapeHtml(a)}</th>${celda(b)}<th>${escapeHtml(c)}</th>${celda(e)}</tr>`).join('');

  const obj = reportSustituir(curso.objetivo_informe || ui.objetivo_def, nombre).split('{curso}').join(curso.curso || '');
  const items = ui.modo_items.map(([t, x]) => `<li><b>${escapeHtml(t)}</b> — ${escapeHtml(x)}</li>`).join('');
  const ban = await getReportBannerDataUri();

  const caratula = `
<div class="pagina">
  ${ban ? `<img class="banner" src="${ban}">` : ''}
  <div class="seccion"><div class="cuad"></div><h2>${ui.datos}</h2></div>
  <table class="dbasicos">${tablaDb}</table>
  <div class="seccion"><div class="cuad"></div><h2>${ui.objetivo}</h2></div>
  <div class="intro">${escapeHtml(obj)}</div>
  <div class="seccion"><div class="cuad"></div><h2>${ui.modo}</h2></div>
  <div class="modo">
    <ol>${items}</ol>
    <div class="pie-modo">${escapeHtml(reportSustituir(ui.modo_pie, nombre))}</div>
  </div>
  <div class="pie-num">Kodland · ${tituloCase(ui.titulo)} · ${ui.pagina} 1</div>
</div>`;

  let barras = '';
  const maxAlto = 175;
  modsSlice.forEach((m, i) => {
    const p = pctsSlice[i];
    const [, cls] = reportBanda(p, ui);
    barras += `<div class="col ${cls}"><div class="pct">${p}%</div><div class="barra" style="height:${Math.round(maxAlto * p / 100)}px"></div></div>`;
  });
  const ejes = modsSlice.map(m => `<div class="e">M${m.numero}</div>`).join('');
  const mediaTop = Math.round(210 - (175 * promedio / 100));
  const nombreEsc = escapeHtml(nombre);
  const visionHtml = escapeHtml(reportSustituir(curso.vision_general || '', nombre)).split(nombreEsc).join(`<b>${nombreEsc}</b>`);

  const portada = `
<div class="pagina">
  <div class="cab">
    <div class="logo">kodland</div>
    <div class="tit"><h1>${ui.titulo}</h1><p>${nombreEsc} · ${escapeHtml(curso.curso)}</p></div>
  </div>
  <div class="fila">
    <div class="tarj"><div class="mut">${ui.area}</div><div class="val">${escapeHtml(curso.area_interes || '')}</div></div>
    <div class="tarj"><div class="mut">${ui.proximo}</div><div class="val">${escapeHtml(curso.proximo_nivel || '')}</div></div>
  </div>
  <div class="stats">${statsHtml}</div>
  <div class="seccion"><div class="cuad"></div><h2>${ui.vision}</h2></div>
  <div class="intro">${visionHtml}</div>
  <div class="chart">
    <div class="barras">
      ${barras}
      <div class="media-linea" style="top:${mediaTop}px"></div>
      <div class="media-lbl" style="top:${mediaTop - 14}px">${ui.media} ${promedio}%</div>
    </div>
    <div class="ejes">${ejes}</div>
    <div class="leyenda">
      <span><i class="punto otimo"></i>${ui.bandas[0]}</span>
      <span><i class="punto bom"></i>${ui.bandas[1]}</span>
      <span><i class="punto dev"></i>${ui.bandas[2]}</span>
    </div>
  </div>
  ${mensajeHtml}
  <div class="pie-num">Kodland · ${tituloCase(ui.titulo)} · ${ui.pagina} 2</div>
</div>`;

  let califHtml = '';
  if (combinado) {
    let filas = '';
    modsSlice.forEach((m, i) => {
      const p = pctsSlice[i];
      const [, cls] = reportBanda(p, ui);
      const [te, tt] = (tareas && tareas[i]) || [0, 0];
      const [pc, px] = (puntos && puntos[i]) || [0, 0];
      filas += `<tr><td>M${m.numero} · ${escapeHtml(m.titulo)}</td><td class="n">${te}/${tt}</td><td class="n">${pc}/${px}</td><td><span class="mini"><i class="${cls}" style="width:${p}%"></i></span>${p}%</td></tr>`;
    });
    const totPc = puntos ? puntos.reduce((sum, par) => sum + par[0], 0) : 0;
    const totPx = puntos ? puntos.reduce((sum, par) => sum + par[1], 0) : 0;
    filas += `<tr class="total"><td>TOTAL</td><td class="n">${tEnv}/${tTot}</td><td class="n">${totPc}/${totPx}</td><td>${promedio}%</td></tr>`;
    const et = { present: ['pres', ui.est_pres], absent: ['aus', ui.est_aus], justified: ['just', ui.est_just] };
    let sesHtml = '';
    (asis && asis.sesiones ? asis.sesiones : []).forEach(s => {
      const [c, txt] = et[s.estado] || ['aus', s.estado];
      sesHtml += `<div class="ses ${c}"><div class="f">${escapeHtml(s.fecha)}</div><div class="e">${txt}</div></div>`;
    });
    const asisBloque = asis
      ? `<div class="seccion"><div class="cuad"></div><h2>${ui.asis_titulo}</h2></div><div class="asis-grid">${sesHtml}</div>`
      : '';
    califHtml = `
<div class="pagina">
  <div class="seccion"><div class="cuad"></div><h2>${ui.calif}</h2></div>
  <table class="calif">
    <tr><th>${ui.th_modulo}</th><th class="n">${ui.th_tareas}</th><th class="n">${ui.th_puntos}</th><th>${ui.th_avance}</th></tr>
    ${filas}
  </table>
  ${asisBloque}
  <div class="pie-num">Kodland · ${ui.pagina}</div>
</div>`;
  }

  let modsHtml = '';
  modsSlice.forEach((m, i) => {
    const p = pctsSlice[i];
    const [lbl, cls] = reportBanda(p, ui);
    const aprs = (m.aprendizajes || []).map(a => `<li>${escapeHtml(a)}</li>`).join('');
    const desc = escapeHtml(reportSustituir(m.descripcion || '', nombre));
    modsHtml += `
  <div class="mod">
    <div class="mod-cab">
      <div class="badge">${String(m.numero).padStart(2, '0')}</div>
      <div class="t"><div class="n">${ui.modulo} ${m.numero}</div><h3>${escapeHtml(m.titulo)}</h3></div>
      <div class="p"><div class="g">${p}<small>%</small></div><span class="pill ${cls}">${lbl}</span></div>
    </div>
    <div class="progreso"><i class="${cls}" style="width:${p}%"></i></div>
    <div class="desc">${desc}</div>
    <div class="mod-cols">
      <div class="izq"><div class="sublbl">${ui.aprendizajes}</div><ul class="apr">${aprs}</ul></div>
      <div class="der"><div class="sublbl">${ui.proyecto}</div><div class="proy">${escapeHtml(m.proyecto || '')}</div></div>
    </div>
  </div>`;
  });
  const paginasMod = n
    ? `<div class="pagina"><div class="seccion"><div class="cuad"></div><h2>${ui.detalle}</h2></div>${modsHtml}</div>`
    : '';

  const comp = (curso.competencias || []).map(c => `<div class="c"><b>✓</b>${escapeHtml(c)}</div>`).join('');
  const paso = curso.proximo_paso || {};
  const considHtml = escapeHtml(reportSustituir(curso.consideraciones || '', nombre)).split(nombreEsc).join(`<b>${nombreEsc}</b>`);
  const cierre = `
<div class="pagina">
  <div class="seccion"><div class="cuad"></div><h2>${ui.consideraciones}</h2></div>
  <div class="intro">${considHtml}</div>
  <div class="comp">${comp}</div>
  <div class="paso">
    <div class="k">${ui.paso}</div>
    <h2>→ ${escapeHtml(paso.titulo || '')}</h2>
    <p>${escapeHtml(reportSustituir(paso.texto || '', nombre))}</p>
  </div>
  <div class="firmas">
    <div class="col-firma">
      <div class="linea"></div>
      <div class="fnombre">${escapeHtml(alumno.profesor || '') || '&nbsp;'}</div>
      <div class="frol">${ui.firma}</div>
    </div>
    <div class="col-sello">
      <div class="sello-caja">${ui.sello}</div>
    </div>
  </div>
  <div class="pie">
    <div class="barra"><span class="l">kodland</span><span class="c">${ui.pie_lema}</span><span style="color:#fff;font-weight:700;font-size:11px">kodland.org</span></div>
  </div>
  <div class="pie-num">Kodland · ${ui.pagina}</div>
</div>`;

  const htmlDir = isRtlLanguage(language) ? 'rtl' : 'ltr';
  return `<!doctype html><html lang="${language}" dir="${htmlDir}"><head><meta charset="utf-8"><title>${escapeHtml(nombre)} · ${escapeHtml(ui.titulo)}</title><style>${REPORT_CSS}</style></head><body>${caratula}${portada}${califHtml}${paginasMod}${cierre}</body></html>`;
}

function openPrintableReportWindow(html) {
  const win = window.open('about:blank', '_blank');
  if (!win) return null;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return win;
}

function createStudentReportButton(container, studentId, studentData, parentPhone) {
  const button = document.createElement('button');
  button.className = 'kodland-wa-btn kodland-report-btn';
  button.textContent = 'PDF';
  button.title = uiText('pdfReportButtonTooltip');
  button.setAttribute('aria-label', uiText('pdfReportButtonTooltip'));
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showStudentReportModal(studentId, studentData, parentPhone);
  });
  return button;
}

function showStudentReportModal(studentId, studentData, parentPhone) {
  document.getElementById('kodland-student-report-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'kodland-student-report-modal';
  modal.className = 'kodland-modal';
  applyLanguageDirection(modal);
  modal.innerHTML = `
    <div class="kodland-modal-content kodland-report-modal-content">
      <div class="kodland-modal-header">
        <h2>${escapeHtml(uiText('pdfReportModalTitle', extractStudentName(document.querySelector(`a[href="/students/${studentId}"]`)?.parentElement || document)))}</h2>
        <button class="kodland-modal-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="kodland-modal-body">
        <p class="kodland-report-status">${escapeHtml(uiText('pdfReportStatusLoading'))}</p>
        <div class="kodland-report-controls" hidden>
          <button class="kodland-report-python-general" type="button" disabled>${escapeHtml(uiText('pdfReportGeneralButton'))}</button>
          <label class="kodland-report-module-label" for="kodland-report-module">${escapeHtml(uiText('pdfReportModuleLabel'))}</label>
          <div class="kodland-report-module-row">
            <select id="kodland-report-module" disabled></select>
            <button class="kodland-report-python-module" type="button" disabled>${escapeHtml(uiText('pdfReportModuleButton'))}</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.kodland-modal-close').addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  const escape = event => {
    if (event.key === 'Escape' && document.getElementById(modal.id)) {
      close();
      document.removeEventListener('keydown', escape);
    }
  };
  document.addEventListener('keydown', escape);

  const status = modal.querySelector('.kodland-report-status');
  const controls = modal.querySelector('.kodland-report-controls');
  const pythonGeneralButton = modal.querySelector('.kodland-report-python-general');
  const moduleSelect = modal.querySelector('#kodland-report-module');
  const pythonModuleButton = modal.querySelector('.kodland-report-python-module');

  const MODULE_OVERRIDE_TEXT = {
    es: {
      vision: (num, titulo, pct) => `En el módulo ${num}, {alumno} trabajó ${titulo}. El aprovechamiento registrado fue ${pct}%.`,
      consideraciones: num => `Durante el módulo ${num}, {alumno} trabajó los aprendizajes descritos en este informe y desarrolló el proyecto correspondiente.`,
      pasoTitulo: num => `Continuar con el módulo ${num + 1}`,
      pasoTexto: num => `Consolidar lo aprendido en el módulo ${num} y continuar con el siguiente proyecto del curso.`
    },
    pt: {
      vision: (num, titulo, pct) => `No módulo ${num}, {alumno} trabalhou ${titulo}. O aproveitamento registrado foi de ${pct}%.`,
      consideraciones: num => `Durante o módulo ${num}, {alumno} trabalhou os aprendizados descritos neste relatório e desenvolveu o projeto correspondente.`,
      pasoTitulo: num => `Continuar com o módulo ${num + 1}`,
      pasoTexto: num => `Consolidar o que foi aprendido no módulo ${num} e continuar com o próximo projeto do curso.`
    },
    en: {
      vision: (num, titulo, pct) => `In module ${num}, {alumno} worked on ${titulo}. The recorded performance was ${pct}%.`,
      consideraciones: num => `During module ${num}, {alumno} worked through the learnings described in this report and developed the corresponding project.`,
      pasoTitulo: num => `Continue with module ${num + 1}`,
      pasoTexto: num => `Consolidate what was learned in module ${num} and move on to the course's next project.`
    },
    ar: {
      vision: (num, titulo, pct) => `في الوحدة ${num}، عمل {alumno} على ${titulo}. كان الأداء المسجل ${pct}%.`,
      consideraciones: num => `خلال الوحدة ${num}، عمل {alumno} على المكتسبات الموضحة في هذا التقرير وطوّر المشروع المقابل.`,
      pasoTitulo: num => `المتابعة مع الوحدة ${num + 1}`,
      pasoTexto: num => `ترسيخ ما تم تعلمه في الوحدة ${num} والمتابعة مع المشروع التالي للدورة.`
    },
    ru: {
      vision: (num, titulo, pct) => `В модуле ${num} {alumno} работал(а) над темой «${titulo}». Зафиксированная успеваемость составила ${pct}%.`,
      consideraciones: num => `В ходе модуля ${num} {alumno} освоил(а) знания, описанные в этом отчёте, и разработал(а) соответствующий проект.`,
      pasoTitulo: num => `Продолжить модулем ${num + 1}`,
      pasoTexto: num => `Закрепить изученное в модуле ${num} и перейти к следующему проекту курса.`
    },
    fr: {
      vision: (num, titulo, pct) => `Dans le module ${num}, {alumno} a travaillé sur ${titulo}. La performance enregistrée était de ${pct}%.`,
      consideraciones: num => `Pendant le module ${num}, {alumno} a travaillé sur les apprentissages décrits dans ce rapport et a développé le projet correspondant.`,
      pasoTitulo: num => `Continuer avec le module ${num + 1}`,
      pasoTexto: num => `Consolider ce qui a été appris dans le module ${num} et poursuivre avec le prochain projet du cours.`
    },
    tr: {
      vision: (num, titulo, pct) => `${num}. modülde {alumno}, ${titulo} üzerinde çalıştı. Kaydedilen performans %${pct} oldu.`,
      consideraciones: num => `${num}. modül boyunca {alumno}, bu raporda açıklanan öğrenimler üzerinde çalıştı ve ilgili projeyi geliştirdi.`,
      pasoTitulo: num => `${num + 1}. modül ile devam et`,
      pasoTexto: num => `${num}. modülde öğrenilenleri pekiştir ve kursun bir sonraki projesine geç.`
    },
    id: {
      vision: (num, titulo, pct) => `Pada modul ${num}, {alumno} mengerjakan ${titulo}. Pencapaian yang tercatat adalah ${pct}%.`,
      consideraciones: num => `Selama modul ${num}, {alumno} mengerjakan pembelajaran yang dijelaskan dalam laporan ini dan mengembangkan proyek terkait.`,
      pasoTitulo: num => `Lanjutkan dengan modul ${num + 1}`,
      pasoTexto: num => `Memperkuat apa yang dipelajari pada modul ${num} dan melanjutkan ke proyek berikutnya dari kursus.`
    },
    it: {
      vision: (num, titulo, pct) => `Nel modulo ${num}, {alumno} ha lavorato su ${titulo}. Il rendimento registrato è stato del ${pct}%.`,
      consideraciones: num => `Durante il modulo ${num}, {alumno} ha lavorato sugli apprendimenti descritti in questo report e ha sviluppato il progetto corrispondente.`,
      pasoTitulo: num => `Continuare con il modulo ${num + 1}`,
      pasoTexto: num => `Consolidare quanto appreso nel modulo ${num} e proseguire con il prossimo progetto del corso.`
    },
    pl: {
      vision: (num, titulo, pct) => `W module ${num} {alumno} pracował(a) nad ${titulo}. Odnotowany wynik to ${pct}%.`,
      consideraciones: num => `Podczas modułu ${num} {alumno} pracował(a) nad umiejętnościami opisanymi w tym raporcie i zrealizował(a) odpowiedni projekt.`,
      pasoTitulo: num => `Kontynuować moduł ${num + 1}`,
      pasoTexto: num => `Utrwalić to, czego nauczono się w module ${num}, i przejść do kolejnego projektu kursu.`
    }
  };

  const generateReport = async selectedModule => {
    const reportData = modal.reportData;
    const phone = reportData?.report.whatsappPhone;
    const whatsappWindow = phone ? window.open('about:blank', '_blank') : null;
    [pythonGeneralButton, pythonModuleButton].forEach(button => { button.disabled = true; });
    status.textContent = uiText('pdfReportGenerating');

    try {
      const language = getMessageLanguage();
      const overrideText = MODULE_OVERRIDE_TEXT[language] || MODULE_OVERRIDE_TEXT.es;

      const statModules = selectedModule == null
        ? reportData.report.modules
        : reportData.report.modules.filter(module => Number(module.numero) === Number(selectedModule));
      const sortedStats = [...statModules].sort((a, b) => Number(a.numero) - Number(b.numero));
      const numeros = new Set(sortedStats.map(module => Number(module.numero)));
      const templateModules = reportData.course.modulos
        .filter(module => numeros.has(Number(module.numero)))
        .sort((a, b) => Number(a.numero) - Number(b.numero));

      const curso = { ...reportData.course, modulos: templateModules };
      if (selectedModule != null && templateModules.length) {
        const moduleNum = Number(selectedModule);
        const moduleTemplate = templateModules[0];
        const moduleStat = sortedStats[0];
        curso.vision_general = overrideText.vision(moduleNum, moduleTemplate.titulo, moduleStat.pct);
        curso.consideraciones = overrideText.consideraciones(moduleNum);
        curso.competencias = moduleTemplate.aprendizajes || [];
        curso.proximo_paso = { titulo: overrideText.pasoTitulo(moduleNum), texto: overrideText.pasoTexto(moduleNum) };
      }

      const alumno = {
        alumno: reportData.report.studentName,
        profesor: reportData.report.teacher,
        pct: sortedStats.map(module => module.pct),
        puntos: sortedStats.map(module => [module.points, module.maxPoints]),
        tareas: sortedStats.map(module => [module.tasksSent, module.tasksTotal]),
        asistencia: reportData.report.attendance
          ? {
              asistidas: reportData.report.attendance.attended,
              total: reportData.report.attendance.total,
              sesiones: reportData.report.attendance.sessions.map(s => ({ fecha: s.label, estado: s.status }))
            }
          : null,
        datos: reportData.report.data
      };

      const html = await buildStudentReportHtml(curso, alumno, language);
      const printWindow = openPrintableReportWindow(html);
      if (!printWindow) {
        throw new Error(uiText('pdfReportGenerateError'));
      }
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (printError) {
          console.error('[PDF Report] Error al imprimir:', printError);
        }
      }, 300);

      const scope = selectedModule == null ? uiText('pdfReportScopeGeneral') : uiText('pdfReportScopeModule', selectedModule);
      status.textContent = uiText('pdfReportDoneStatus', scope) + (phone ? uiText('pdfReportWhatsappNote') : '');
      if (whatsappWindow && !whatsappWindow.closed) {
        const settings = getExtensionSettings();
        const selected = selectedModule == null
          ? null
          : reportData.report.modules.find(module => Number(module.numero) === Number(selectedModule));
        const message = renderTemplate(getResolvedPdfReportTemplate(language, settings), {
          studentName: reportData.report.studentName,
          tutorName: settings.tutorName,
          courseName: reportData.course.curso,
          reportType: selectedModule == null ? uiText('pdfReportScopeGeneral') : uiText('pdfReportTypeByModule'),
          moduleName: selected ? ` · M${selected.numero}: ${selected.titulo}` : ''
        });
        whatsappWindow.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
      }
    } catch (error) {
      console.error('[PDF Report] Error generando el reporte:', error);
      const message = error?.message || uiText('pdfReportGenerateError');
      status.textContent = message;
      // No cerramos whatsappWindow en silencio: si se queda en about:blank el
      // tutor piensa que "no pasó nada" porque su atención está en esa
      // ventana, no en el modal de atrás. Mejor escribimos el error ahí mismo.
      if (whatsappWindow && !whatsappWindow.closed) {
        try {
          whatsappWindow.document.title = 'Error';
          whatsappWindow.document.body.style.cssText = 'font-family:sans-serif; padding:24px; color:#b91c1c; white-space:pre-wrap;';
          whatsappWindow.document.body.textContent = '❌ ' + message;
        } catch (writeError) {
          whatsappWindow.close();
        }
      }
      alert(message);
    } finally {
      [pythonGeneralButton, pythonModuleButton].forEach(button => { button.disabled = false; });
    }
  };

  pythonGeneralButton.addEventListener('click', () => generateReport(null));
  pythonModuleButton.addEventListener('click', () => generateReport(Number(moduleSelect.value)));

  loadStudentReportData(studentId, studentData, parentPhone).then(data => {
    if (!document.body.contains(modal)) return;
    modal.reportData = data;
    moduleSelect.innerHTML = data.report.modules.map(module =>
      `<option value="${Number(module.numero)}">M${Number(module.numero)} · ${escapeHtml(module.titulo)}</option>`
    ).join('');
    status.textContent = uiText('pdfReportStatusReady', data.report.modules.length) + (data.report.whatsappPhone ? '' : uiText('pdfReportNoPhoneNote'));
    controls.hidden = false;
    pythonGeneralButton.disabled = false;
    moduleSelect.disabled = false;
    pythonModuleButton.disabled = false;
  }).catch(error => {
    status.textContent = error.message || uiText('pdfReportLoadError');
  });
}


function displayStudentInfo(container, studentData, studentId) {

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
  

  const parentName = studentData.parent_name || 
                     studentData.parent?.name || 
                     studentData.parent_name_full ||
                     'Parent';
  
  const parentPhone = studentData.parent_phone || 
                      studentData.parent?.phone || 
                      studentData.parent_phone_number ||
                      studentData.parent?.phone_number ||
                      null;
  

  const studentLogin = studentData.student_login || 
                       studentData.student_user || 
                       studentData.student_username || '';
  
  const studentPassword = studentData.student_password || 
                          studentData.student_pass || '';
  

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
    return;
  }
  

  const language = getMessageLanguage();
  const tooltips = getButtonTooltips(language);
  

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

    const fallbackLink = container.querySelector('a[href^="/students/"]');
    if (fallbackLink) {
      studentH3 = fallbackLink.querySelector('h3');
    }
  }
  
  if (!studentH3) {
    console.warn('[Group Students Info] Could not find student h3 element');
    return;
  }
  

  const studentLink = studentH3.closest('a[href^="/students/"]');
  if (!studentLink) {
    console.warn('[Group Students Info] Could not find student link element');
    return;
  }
  

  const existingButtons = document.querySelector(`.kodland-student-buttons[data-student-id="${studentId}"]`);
  if (existingButtons) {
    existingButtons.remove();
  }
  

  const existingInitials = studentH3.querySelector('.kodland-country-initials');
  if (existingInitials) {
    existingInitials.remove();
  }
  

  console.log(`[Group Students Info] Getting country initials for phone: ${parentPhone}`);
  const countryCode = getCountryCodeFromPhone(parentPhone);
  console.log(`[Group Students Info] Extracted country code: ${countryCode}`);
  const countryInitials = getCountryInitialsFromPhone(parentPhone);
  console.log(`[Group Students Info] Country initials result: "${countryInitials}"`);
  
  if (countryInitials && countryInitials.trim() && countryInitials.length > 0) {

    const currentText = studentH3.textContent || studentH3.innerText || '';
    console.log(`[Group Students Info] Current h3 text: "${currentText}"`);
    

    if (currentText.includes(`[${countryInitials}]`)) {
      console.log(`[Group Students Info] Initials already in text, skipping`);
    } else {

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
      

      studentH3.insertBefore(initialsElement, studentH3.firstChild);
      
      console.log(`[Group Students Info] ✅ Added country initials "[${countryInitials}]" for phone ${parentPhone} (code: ${countryCode})`);
      console.log(`[Group Students Info] h3 textContent after initials:`, studentH3.textContent);
    }
  } else {
    console.warn(`[Group Students Info] ⚠️ No country initials found for phone ${parentPhone} (code: ${countryCode})`);
  }
  

  const buttonsContainer = document.createElement('span');
  buttonsContainer.className = 'kodland-student-buttons';

  buttonsContainer.appendChild(createStudentReportButton(container, studentId, studentData, parentPhone));

  const formattedPhone = formatPhoneForWhatsApp(parentPhone);
  

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
    

    const phoneForUrl = formattedPhone.replace(/^\+/, '');
    

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}`;
    console.log(`[Group Students Info] Opening WhatsApp for parent phone: ${formattedPhone}`);
    window.open(whatsappUrl, '_blank');
  });
  

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

      const studentName = studentData.student_first_name || extractStudentName(container);


      const courseName = findCourseName();
      console.log('[Group Students Info] Course name:', courseName);


      const wonderLoginUrl = await fetchWonderLoginLink(studentId);
      if (!wonderLoginUrl) {
        console.warn(`[Group Students Info] ⚠️ No se pudo obtener el link de acceso personalizado para ${studentId}`);
      }


      const waGroupLink = getGroupWhatsAppLink();
      if (!waGroupLink) {
        console.warn('[Group Students Info] ⚠️ No hay link de WhatsApp del grupo guardado todavía');
      }


      const groupId = extractGroupId();
      const firstLesson = groupId ? await fetchFirstLessonForGroup(groupId) : null;
      const lessonDateInfo = firstLesson
        ? formatLessonDateForMessage(firstLesson.timetable_time, getMessageLanguage())
        : null;


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
      

      const encodedMessage = encodeMessageForWhatsApp(welcomeMessage);
      

      const phoneForUrl = formattedPhone.replace(/^\+/, '');
      

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
        

        const lessonsInfo = getCompletedLessonsCount();
        const maxLessons = lessonsInfo ? lessonsInfo.completed : null;
        
        if (maxLessons !== null && maxLessons > 0) {
          console.log(`[Group Students Info] ✅ Will limit to ${maxLessons} completed lessons only`);
        } else {
          console.warn(`[Group Students Info] ⚠️ Could not determine completed lessons count (${maxLessons}), will process all found lessons`);
        }
        

        let lessonIds = extractLessonIds(progressData, maxLessons);
        

        if (maxLessons !== null && maxLessons > 0) {
          if (lessonIds.length > maxLessons) {
            lessonIds = lessonIds.slice(0, maxLessons);
          }
          lessonIds = lessonIds.slice(0, maxLessons);
          console.log(`[Group Students Info] 🔒 STRICT LIMIT APPLIED: Final count is ${lessonIds.length} lessons (max: ${maxLessons})`);
        }
        
        if (lessonIds.length > 0) {
          console.log(`[Group Students Info] ✅ Ready to process ${lessonIds.length} lessons. Fetching tasks progress asynchronously...`);
          

          const allTasksData = [];
          

          const limitedLessonIds = maxLessons !== null && maxLessons > 0 
            ? lessonIds.slice(0, maxLessons) 
            : lessonIds;
          

          const batchSize = 3;
          for (let i = 0; i < limitedLessonIds.length; i += batchSize) {
            const batch = limitedLessonIds.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(limitedLessonIds.length / batchSize);
            
            console.log(`\n[Group Students Info] 📦 Processing batch ${batchNumber}/${totalBatches} (lessons ${i + 1}-${Math.min(i + batchSize, limitedLessonIds.length)})...`);
            console.log(`[Group Students Info] Batch lesson IDs (in order):`, batch);
            

            const fetchPromises = batch.map((lessonId, batchIndex) => {

              const originalIndex = i + batchIndex;
              return Promise.all([
                fetchClassTasksProgress(studentId, lessonId),
                fetchHomeworkTasksProgress(studentId, lessonId)
              ]).then(([classTasks, homeworkTasks]) => {
                return {
                  lessonId: lessonId,
                  classTasks: classTasks,
                  homeworkTasks: homeworkTasks,
                  originalIndex: originalIndex
                };
              });
            });
            

            const batchResults = await Promise.all(fetchPromises);
            

            batchResults.sort((a, b) => a.originalIndex - b.originalIndex);
            
            console.log(`[Group Students Info] Batch results (after sorting):`, batchResults.map(r => r.lessonId));
            

            allTasksData.push(...batchResults);
            
            console.log(`[Group Students Info] ✅ Batch ${batchNumber}/${totalBatches} completed (${batchResults.length} lessons processed)`);
            

            if (i + batchSize < limitedLessonIds.length) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          

          allTasksData.sort((a, b) => (a.originalIndex || 0) - (b.originalIndex || 0));
          console.log(`[Group Students Info] ✅ Final ordered lesson IDs:`, allTasksData.map(r => r.lessonId));
          
          console.log(`[Group Students Info] ✅ Completed fetching all tasks data for ${allTasksData.length} lessons`);
          

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
      

      const nearestLesson = findNearestLesson(scheduleData);
      
      if (!nearestLesson) {
        alert(uiText('noUpcomingLesson'));
        return;
      }
      

      const countryCode = getCountryInitialsFromPhone(parentPhone);
      const language = getMessageLanguage();
      

      const message = generateClassReminderMessage(parentName, nearestLesson, countryCode, language);
      
      if (!message) {
        alert(uiText('messageGenerationError'));
        return;
      }
      

      const formattedPhone = formatPhoneForWhatsApp(parentPhone);
      const phoneForUrl = formattedPhone.replace(/^\+/, '');
      

      const encodedMessage = encodeMessageForWhatsApp(message);
      

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneForUrl}&text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (err) {
      console.error('[Group Students Info] Error sending class reminder:', err);
      alert(uiText('classReminderError'));
    }
  });
  
  buttonsContainer.appendChild(scheduleButton);
  

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
      const studentName = studentData.student_first_name || extractStudentName(container);
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

        const studentName = studentData.student_first_name || extractStudentName(container);
        const courseName = findCourseName();
        const tutorName = getExtensionSettings().tutorName;
        const waveEmoji = String.fromCodePoint(0x1F44B);
        const smileEmoji = String.fromCodePoint(0x1F60A);


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

        const studentName = studentData.student_first_name || extractStudentName(container);
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
  

  buttonsContainer.setAttribute('data-student-id', studentId);
  

  console.log('[Group Students Info] Buttons container prepared:', {
    buttonCount: buttonsContainer.children.length,
    buttons: Array.from(buttonsContainer.children).map(b => b.className)
  });
  

  if (studentLink && studentLink.parentElement) {

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


// true si el content script sigue conectado a la extensión (si la extensión
// se recargó mientras esta pestaña ya estaba abierta, leer chrome.runtime.id
// lanza "Extension context invalidated" en vez de devolver algo).
function extensionContextAlive() {
  try {
    return !!chrome.runtime?.id;
  } catch (error) {
    return false;
  }
}

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


async function processAllStudents() {
  if (!isGroupPage()) {
    return;
  }
  

  if (isProcessingStudents) {
    console.log('[Group Students Info] Already processing students, skipping duplicate call');
    return;
  }
  
  const students = findStudentElements();
  
  if (students.length === 0) {
    console.log('[Group Students Info] No students found');
    return;
  }
  

  const needsProcessing = (student) => {

    if (!processedStudents.has(student.id)) return true;
    

    const selector = `.kodland-student-buttons[data-student-id="${student.id}"]`;
    const hasButtons =
      student.container.querySelector(selector) ||
      student.container.querySelector('.kodland-student-buttons');
    
    return !hasButtons;
  };
  

  const unprocessedStudents = students.filter(needsProcessing);
  if (unprocessedStudents.length === 0) {
    console.log('[Group Students Info] All students already processed');
    return;
  }
  
  isProcessingStudents = true;
  console.log(`[Group Students Info] Starting to process ${unprocessedStudents.length} new students...`);
  

  const hasToken = await waitForAuthToken(10000);
  
  if (!hasToken) {
    console.error('[Group Students Info] ❌ Cannot proceed without auth token. Please refresh the page or wait for network activity.');
    isProcessingStudents = false;

    unprocessedStudents.forEach(student => {
      displayStudentInfo(student.container, null, student.id);
      const infoElement = student.container.querySelector('.kodland-student-buttons');
      if (infoElement) {
        infoElement.innerHTML = '<span style="color: #d32f2f;">❌ Authentication error. Please refresh the page.</span>';
      }
    });
    return;
  }
  

  unprocessedStudents.forEach(student => {
    if (!processedStudents.has(student.id)) {
      processedStudents.add(student.id);
    }
  });
  
  console.log(`[Group Students Info] 🚀 Starting parallel fetch for ${unprocessedStudents.length} students...`);
  

  unprocessedStudents.forEach((student, i) => {
    console.log(`[Group Students Info] 📝 Student ${i + 1}/${unprocessedStudents.length}: ${student.name} (ID: ${student.id})`);
  });
  

  const fetchPromises = unprocessedStudents.map(async (student) => {
    try {

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
  

  const results = await Promise.all(fetchPromises);
  
  console.log(`[Group Students Info] ✅ All ${results.length} fetches completed. Processing results...`);
  

  results.forEach((result, i) => {
    const { student, studentData, success } = result;
    

    if (studentData) {
      studentGeneralInfoCache[student.id] = studentData;
    }
    

    try {
      displayStudentInfo(student.container, studentData, student.id);
    } catch (error) {
      console.error('[Group Students Info] ❌ Error rendering buttons for student', student.id, error);
    }
    

    if (success && studentData) {
      console.log(`[Group Students Info] ✅ Completed processing for ${student.name} (${i + 1}/${results.length})`);
    } else {
      console.log(`[Group Students Info] ⚠️ No data received for ${student.name} (${i + 1}/${results.length})`);

      processedStudents.delete(student.id);
    }
  });
  
  isProcessingStudents = false;
  console.log(`[Group Students Info] Finished processing ${unprocessedStudents.length} students`);
}


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

const DEFAULT_PDF_REPORT_TEMPLATE = `Hola {{studentName}} 👋
Te comparto el reporte {{reportType}} de {{courseName}}{{moduleName}}.
Si tienes alguna duda sobre tu avance, escríbeme y con gusto lo revisamos.
{{tutorName}}`;


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
Je te souhaite la bienvenue. Je m'appelle {{tutorName}} et je serai ton tuteur pour le cours de {{courseName}}, {{scheduleLine}}. Nous sommes ravis que tu fasses partie de cette expérience chez Kodland. Pour être prêt pour notre premier cours, merci de suivre ces étapes :
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
Saya di sini untuk membantumu kapan pun kamu butuh. Sampai jumpa!
Salam,
{{tutorName}}
Tutor {{courseName}}`,
    it: `Ciao {{studentName}} 👋
Un caro saluto. Mi chiamo {{tutorName}} e sarò il tuo tutor per il corso di {{courseName}}, {{scheduleLine}}. Siamo davvero felici che tu faccia parte di questa esperienza con Kodland. Per essere pronti per la nostra prima lezione, segui questi passaggi:
🔹 Unisciti al gruppo ufficiale WhatsApp, dove condivideremo tutte le informazioni importanti: 👉{{waGroupLink}}
🔹 Ecco il tuo accesso personalizzato alla piattaforma Kodland:
• Link di accesso diretto: {{wonderLoginUrl}}
Nome utente: {{username}}
Password: {{password}}
🔹 Ecco come fare per collegarti alla nostra prima lezione:
Accedi alla piattaforma circa 5 minuti prima dell'inizio, usando nome utente e password (se non li hai, chiedimeli pure!).
Cerca il pulsante "Partecipa alla lezione" (Join Class), che diventerà visibile 15 minuti prima dell'orario di inizio.
Autorizza videocamera e microfono: essendo la prima volta, il tuo browser ti chiederà il permesso di usarli. Ricordati di accettare!
Testa il tuo equipaggiamento: prima di entrare, ti troverai in una sala d'attesa (Configuration Lobby) dove potrai controllare che audio e video funzionino bene. Quando sei pronto, clicca su "Partecipa alla riunione".
Per maggiori informazioni: https://kodland-teaching.tilda.ws/italian
Sono qui per aiutarti con tutto ciò di cui hai bisogno. A presto!
Cordiali saluti,
{{tutorName}}
Tutor di {{courseName}}`,
    pl: `Cześć {{studentName}} 👋
Witam Cię serdecznie. Nazywam się {{tutorName}} i będę Twoim tutorem na zajęciach {{courseName}}, {{scheduleLine}}. Bardzo się cieszymy, że jesteś częścią naszej przygody w Kodland. Aby przygotować się do naszej pierwszej lekcji, wykonaj proszę poniższe kroki:
🔹 Dołącz do oficjalnej grupy WhatsApp, gdzie będziemy udostępniać link do zajęć na Zoomie oraz wszystkie ważne informacje: 👉{{waGroupLink}}
🔹 Oto Twój spersonalizowany dostęp do platformy Kodland:
• Link do bezpośredniego logowania: {{wonderLoginUrl}}
Login: {{username}}
Hasło: {{password}}
Jestem tu, aby pomóc Ci we wszystkim, czego potrzebujesz. Do zobaczenia wkrótce!
Pozdrawiam,
{{tutorName}}
Tutor zajęć {{courseName}}`,
    pt: `Olá {{studentName}} 👋
Seja muito bem-vindo(a)! Meu nome é {{tutorName}} e serei seu tutor na aula de {{courseName}}, {{scheduleLine}}. Estamos muito felizes por você fazer parte dessa experiência na Kodland. Para estarmos prontos para nossa primeira aula, siga estes passos:
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
    ar: `مرحباً {{studentName}} 👋، أنا {{tutorName}}، معلمك في {{courseName}} في Kodland.
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
    pl: `Cześć {{studentName}} 👋, tu {{tutorName}}, Twój tutor zajęć {{courseName}} w Kodland.
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
🚀 See you directly on the Kodland Platform, as always. Come in with lots of energy! 💻
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
📩 Please check your email — you'll find your access credentials there to log in to the Kodland platform.
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
📩 Vi prego di controllare la vostra email, lì troverete le credenziali di accesso per entrare nella piattaforma Kodland.
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
Today begins an adventure where you will be the protagonists. In every class we'll explore new tools and ways of expression to bring your ideas to life. Don't worry if this is your first time in this type of course — we're going to learn step by step and enjoy the process! 🚀
🚨 Important Reminder: See you on the platform 🚨
Just a reminder that for our class TODAY at {{time}} (Colombia time), we'll connect directly through the Kodland platform.
This is our first class together, so don't worry if you have questions about how we work in the virtual classroom… we're here to enjoy and grow together step by step!
🛠️ Before class starts, make sure of this:
✅ Have you tried logging in yet? Log in to the platform with the credentials you received by email. Do it a little beforehand to confirm everything is in order and not lose valuable class minutes.
📖 Questions about how to log in? Here's a handy guide in case you need a refresher on the steps: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
🔑 Trouble with your details? If you've checked your inbox and still haven't been able to log in with your credentials, message me RIGHT AWAY in private so I can help you solve it.
⚠️ Key requirement: For all the tools to work perfectly, make sure to log in using the Google Chrome browser. 🌐
✨ Don't forget to bring your creativity, curiosity, and enthusiasm. I'm so happy to be your teacher and join you on this learning journey!
See you in a bit on the platform! 🔥🙌
💡 Let's build amazing things together! 🌐🚀
{{tutorName}}`,
    ar: `🎉 مرحبًا بكم في أول حصة من {{courseName}} في Kodland! 🎉
مرحبًا يا أصدقائي! أنا سعيد جدًا بالترحيب بكم رسميًا في هذه الدورة الجديدة، حيث سنتعلم أشياء رائعة تجمع بين الإبداع والتكنولوجيا والكثير من الحماس. 🌐✨
تبدأ اليوم مغامرة ستكونون أنتم أبطالها. في كل حصة سنستكشف أدوات جديدة وطرقًا للتعبير لنمنح أفكاركم حياةً حقيقية. لا داعي للقلق إذا كانت هذه أول مرة تخوضون فيها هذا النوع من الدورات، فسوف نتعلم خطوة بخطوة ونستمتع بالرحلة! 🚀
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
📖 Есть вопросы о том, как войти? Вот инструкция под рукой на случай, если понадобится освежить в памяти шаги: https://docs.google.com/document/d/1HtCjckqbetfsSX0YWzuEHYAt53BgrPbdDNZwg4G4Jno/edit?tab=t.0#heading=h.ta5cgks4cr63
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
✅ Sudahkah kalian mencoba masuk? Masuklah ke platform dengan kredensial yang kalian terima melalui email. Lakukan sedikit lebih awal untuk memastikan semuanya berjalan lancar dan tidak kehilangan waktu berharga di kelas.
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
🛠️ Prima che inizi la lezione, assicuratevi di questo:
✅ Avete già provato ad accedere? Accedete alla piattaforma con le credenziali ricevute via email. Fatelo un po' prima per confermare che tutto sia in ordine e non perdere preziosi minuti di lezione.
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
• Review and complete any pending activities on the platform before class.
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
• Выбрать, какой проект вы представите (лучшую работу или портфолио курса).
⏱ У каждого учащегося будет несколько минут на презентацию.
🕒 Занятие пройдёт в обычное время, но с особым праздничным акцентом. Присутствие всех очень важно, ведь это момент, когда учащиеся завершают свой цикл обучения и закрепляют полученные знания.
Если по каким-либо уважительным причинам вы не сможете присутствовать, пожалуйста, сообщите мне об этом заранее.
До встречи на занятии, чтобы отпраздновать ваш талант! 💙
Команда Kodland
Наставник: {{tutorName}}`,
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
Si, en cas de force majeure, vous ne pouvez pas assister, merci de me le faire savoir à l'avance.
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
Öğretmen: {{tutorName}}`,
    id: `🎉 Halo, orang tua dan siswa tersayang!
Kita sudah hampir mencapai akhir perjalanan kita di kursus {{courseName}} dan sedang bersiap untuk Pelajaran Kelulusan besar kita.
📅 Tanggal: {{gradDate}}
⏰ Waktu: {{gradTime}} (Waktu Kolombia)
✨ Undangan: Semua orang tua dan anggota keluarga dengan hangat diundang untuk merayakan kerja keras anak-anak.
🌟 Apa yang akan kita lakukan saat kelulusan?
• Hasil kursus: ringkasan topik dan tujuan yang telah dicapai selama kursus.
• Presentasi proyek: setiap siswa akan membagikan karya akhir mereka. Mereka telah melakukan pekerjaan yang luar biasa!
• Bimbingan personal: masukan tentang performa setiap siswa dan tips untuk terus belajar.
🧑‍💻 Persiapan penting untuk siswa:
• Meninjau dan menyelesaikan aktivitas yang masih tertunda di platform sebelum kelas.
• Menyiapkan latar belakang virtual kelulusan untuk panggilan video: https://drive.google.com/drive/folders/1bu8VJJdUXnG9fzqPYXvBYvEQeYq3hXTV
• Memilih proyek mana yang akan dipresentasikan (karya terbaik atau portofolio kursus kalian).
⏱ Setiap siswa akan mendapat beberapa menit untuk presentasinya.
🕒 Kelas akan berlangsung pada jam biasa, dengan fokus perayaan khusus ini. Kehadiran semua orang sangat penting, karena ini adalah momen di mana siswa menutup siklus belajar mereka dan memvalidasi apa yang telah dipelajari.
Jika karena suatu alasan mendesak kalian tidak dapat hadir, mohon beri tahu saya sebelumnya.
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
Ti mando la registrazione della nostra ultima lezione di {{courseName}}, nel caso tu voglia rivedere qualcosa o non sia riuscito/a a collegarti in diretta:
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
Vi mando la registrazione della nostra ultima lezione di {{courseName}}, nel caso vogliate rivedere qualcosa o qualcuno non sia riuscito a collegarsi in diretta:
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

function getDefaultPdfReportTemplate(language = getMessageLanguage()) {
  const templates = {
    es: DEFAULT_PDF_REPORT_TEMPLATE,
    en: `Hi {{studentName}} 👋
Here's the {{reportType}} report for {{courseName}}{{moduleName}}.
If you have any questions about your progress, message me and we'll go over it together.
{{tutorName}}`,
    ar: `مرحبًا {{studentName}} 👋
أشارك معك التقرير {{reportType}} لمادة {{courseName}}{{moduleName}}.
إذا كان لديك أي استفسار حول تقدّمك، راسلني وسنراجعه معًا.
{{tutorName}}`,
    ru: `Привет, {{studentName}} 👋
Делюсь отчётом ({{reportType}}) по курсу {{courseName}}{{moduleName}}.
Если есть вопросы о твоём прогрессе — напиши мне, с радостью всё обсудим.
{{tutorName}}`,
    fr: `Bonjour {{studentName}} 👋
Je te partage le rapport {{reportType}} du cours {{courseName}}{{moduleName}}.
Si tu as des questions sur ta progression, écris-moi et on en parle avec plaisir.
{{tutorName}}`,
    tr: `Merhaba {{studentName}} 👋
Sana {{courseName}}{{moduleName}} için {{reportType}} raporu paylaşıyorum.
İlerlemenle ilgili bir sorun olursa bana yaz, memnuniyetle gözden geçiririz.
{{tutorName}}`,
    id: `Hai {{studentName}} 👋
Berikut laporan {{reportType}} untuk {{courseName}}{{moduleName}}.
Kalau ada pertanyaan tentang perkembanganmu, kirim pesan ke saya ya, nanti kita bahas bersama.
{{tutorName}}`,
    it: `Ciao {{studentName}} 👋
Ti condivido il report {{reportType}} di {{courseName}}{{moduleName}}.
Se hai dubbi sui tuoi progressi, scrivimi e lo rivediamo insieme con piacere.
{{tutorName}}`,
    pl: `Cześć {{studentName}} 👋
Przesyłam Ci raport {{reportType}} z kursu {{courseName}}{{moduleName}}.
Jeśli masz pytania dotyczące swoich postępów, napisz do mnie, chętnie je omówimy.
{{tutorName}}`,
    pt: `Olá {{studentName}} 👋
Aqui está o relatório {{reportType}} de {{courseName}}{{moduleName}}.
Se tiver alguma dúvida sobre o seu progresso, me escreva que revisamos juntos com prazer.
{{tutorName}}`
  };
  return templates[normalizeMessageLanguage(language)] || DEFAULT_PDF_REPORT_TEMPLATE;
}


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
function getResolvedPdfReportTemplate(language = getMessageLanguage(), settings = getExtensionSettings()) {
  return resolveTemplate(settings.pdfReportTemplate, DEFAULT_PDF_REPORT_TEMPLATE, getDefaultPdfReportTemplate, language);
}


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

  messageLanguage: 'auto',
  welcomeTemplate: DEFAULT_WELCOME_TEMPLATE,
  absenceTemplate: DEFAULT_ABSENCE_TEMPLATE,
  classStartingTemplate: DEFAULT_CLASS_STARTING_TEMPLATE,
  inClassTemplate: DEFAULT_IN_CLASS_TEMPLATE,
  graduationTemplate: DEFAULT_GRADUATION_TEMPLATE,
  groupWelcomeTemplate: DEFAULT_GROUP_WELCOME_TEMPLATE,
  firstClassTemplate: DEFAULT_FIRST_CLASS_TEMPLATE,
  recordingStudentTemplate: DEFAULT_RECORDING_STUDENT_TEMPLATE,
  recordingGroupTemplate: DEFAULT_RECORDING_GROUP_TEMPLATE,
  pdfReportTemplate: DEFAULT_PDF_REPORT_TEMPLATE,
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile'
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


  const TEMPLATE_FIELDS = [
    ['welcomeTemplate', 'kodland-setting-welcome-template', 'kodland-reset-welcome', 'settingWelcomeTemplate', getDefaultWelcomeTemplate, 8],
    ['absenceTemplate', 'kodland-setting-absence-template', 'kodland-reset-absence', 'settingAbsenceTemplate', getDefaultAbsenceTemplate, 6],
    ['classStartingTemplate', 'kodland-setting-classstarting-template', 'kodland-reset-classstarting', 'settingClassStartingTemplate', getDefaultClassStartingTemplate, 6],
    ['inClassTemplate', 'kodland-setting-inclass-template', 'kodland-reset-inclass', 'settingInClassTemplate', getDefaultInClassTemplate, 6],
    ['graduationTemplate', 'kodland-setting-graduation-template', 'kodland-reset-graduation', 'settingGraduationTemplate', getDefaultGraduationTemplate, 10],
    ['groupWelcomeTemplate', 'kodland-setting-groupwelcome-template', 'kodland-reset-groupwelcome', 'settingGroupWelcomeTemplate', getDefaultGroupWelcomeTemplate, 5],
    ['firstClassTemplate', 'kodland-setting-firstclass-template', 'kodland-reset-firstclass', 'settingFirstClassTemplate', getDefaultFirstClassTemplate, 10],
    ['recordingStudentTemplate', 'kodland-setting-recording-student-template', 'kodland-reset-recording-student', 'settingRecordingStudentTemplate', getDefaultRecordingStudentTemplate, 6],
    ['recordingGroupTemplate', 'kodland-setting-recording-group-template', 'kodland-reset-recording-group', 'settingRecordingGroupTemplate', getDefaultRecordingGroupTemplate, 6],
    ['pdfReportTemplate', 'kodland-setting-pdf-report-template', 'kodland-reset-pdf-report', 'settingPdfReportTemplate', getDefaultPdfReportTemplate, 5]
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

        <label id="kodland-setting-groq-label" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingGroqApiKey', currentLanguage))}</label>
        <input type="text" id="kodland-setting-groq" value="${escapeHtml(settings.groqApiKey)}" placeholder="gsk_..." style="${fieldStyle}"/>
        <p id="kodland-setting-groq-help" style="font-size:11px; color:#888; line-height:1.6; margin:-12px 0 20px;">
          ${uiTextForLanguage('settingGroqApiKeyHelp', currentLanguage)}
        </p>

        <label id="kodland-setting-calendar-title" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingCalendarTitle', currentLanguage))}</label>
        <p id="kodland-setting-calendar-help" style="font-size:11px; color:#888; line-height:1.6; margin:0 0 10px;">
          ${uiTextForLanguage('settingCalendarHelp', currentLanguage)}
        </p>
        <label id="kodland-setting-calendar-url-label" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingCalendarUrl', currentLanguage))}</label>
        <input type="text" id="kodland-setting-calendar-url" placeholder="https://script.google.com/macros/s/.../exec" style="${fieldStyle}"/>
        <label id="kodland-setting-calendar-key-label" style="${labelStyle}">${escapeHtml(uiTextForLanguage('settingCalendarKey', currentLanguage))}</label>
        <input type="text" id="kodland-setting-calendar-key" readonly value="…" style="${fieldStyle} font-family:monospace;"/>

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

  getCalendarConfig().then(config => {
    if (!document.body.contains(modal)) return;
    modal.querySelector('#kodland-setting-calendar-url').value = config.url;
    modal.querySelector('#kodland-setting-calendar-key').value = config.key;
  });

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
    modal.querySelector('#kodland-setting-groq-label').textContent = uiTextForLanguage('settingGroqApiKey', previewLanguage);
    modal.querySelector('#kodland-setting-groq-help').innerHTML = uiTextForLanguage('settingGroqApiKeyHelp', previewLanguage);
    modal.querySelector('#kodland-setting-calendar-title').textContent = uiTextForLanguage('settingCalendarTitle', previewLanguage);
    modal.querySelector('#kodland-setting-calendar-help').innerHTML = uiTextForLanguage('settingCalendarHelp', previewLanguage);
    modal.querySelector('#kodland-setting-calendar-url-label').textContent = uiTextForLanguage('settingCalendarUrl', previewLanguage);
    modal.querySelector('#kodland-setting-calendar-key-label').textContent = uiTextForLanguage('settingCalendarKey', previewLanguage);
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
      groqApiKey: modal.querySelector('#kodland-setting-groq').value.trim(),
      groqModel: DEFAULT_KODLAND_SETTINGS.groqModel,
      welcomeTemplate: modal.querySelector('#kodland-setting-welcome-template').value.trim() || DEFAULT_WELCOME_TEMPLATE,
      absenceTemplate: modal.querySelector('#kodland-setting-absence-template').value.trim() || DEFAULT_ABSENCE_TEMPLATE,
      classStartingTemplate: modal.querySelector('#kodland-setting-classstarting-template').value.trim() || DEFAULT_CLASS_STARTING_TEMPLATE,
      inClassTemplate: modal.querySelector('#kodland-setting-inclass-template').value.trim() || DEFAULT_IN_CLASS_TEMPLATE,
      graduationTemplate: modal.querySelector('#kodland-setting-graduation-template').value.trim() || DEFAULT_GRADUATION_TEMPLATE,
      groupWelcomeTemplate: modal.querySelector('#kodland-setting-groupwelcome-template').value.trim() || DEFAULT_GROUP_WELCOME_TEMPLATE,
      firstClassTemplate: modal.querySelector('#kodland-setting-firstclass-template').value.trim() || DEFAULT_FIRST_CLASS_TEMPLATE,
      recordingStudentTemplate: modal.querySelector('#kodland-setting-recording-student-template').value.trim() || DEFAULT_RECORDING_STUDENT_TEMPLATE,
      recordingGroupTemplate: modal.querySelector('#kodland-setting-recording-group-template').value.trim() || DEFAULT_RECORDING_GROUP_TEMPLATE,
      pdfReportTemplate: modal.querySelector('#kodland-setting-pdf-report-template').value.trim() || DEFAULT_PDF_REPORT_TEMPLATE
    };
    saveExtensionSettings(newSettings);
    chrome.storage.local.set({ kodland_calendar_url: modal.querySelector('#kodland-setting-calendar-url').value.trim() });
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


async function exportContactsCSV() {
  const courseName = findCourseName() || 'Kodland';


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
    if (input === null) return;
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


  if (groupId) {
    fetchGroupGeneralInfo(groupId).then(() => refreshLabel());
  }
}




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

  if (!lastGood) return true;
  return lastGood.classList.contains('text-success') || !!lastGood.querySelector('.ri-check-line');
}


async function markAttendanceForAllStudents(statusClass) {
  const students = findStudentElements();


  const highlightedChips = Array.from(document.querySelectorAll('.v-chip.highlight'));

  console.log(`[Attendance] ${students.length} estudiantes encontrados, ${highlightedChips.length} chips resaltados encontrados`);

  if (highlightedChips.length === 0) {
    alert(uiText('attendanceNoChips'));
    return { ok: [], failed: [], skipped: [] };
  }


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


    await new Promise(r => setTimeout(r, 400));
  }

  return results;
}


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




function openGroupWhatsApp(groupIdOverride = null) {
  const groupId = groupIdOverride || extractGroupId();
  const cachedLink = getGroupWhatsAppLink(groupId);


  const waWindow = window.open(cachedLink || 'https://web.whatsapp.com/', '_blank');

  if (cachedLink || !groupId) return waWindow;


  fetchGroupGeneralInfo(groupId).then(() => {
    const link = getGroupWhatsAppLink(groupId);
    if (link && waWindow && !waWindow.closed) {
      waWindow.location = link;
    }
  });

  return waWindow;
}


async function queueGroupBroadcastMessage(message) {

  try {
    await navigator.clipboard.writeText(message);
  } catch (error) {
    console.warn('[Broadcast] No se pudo copiar al portapapeles:', error);
  }


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
  const lastLessonInfo = lastLesson ? formatLessonDateForMessage(lastLesson.timetable_time, language) : null;
  const suggestedDate = lastLessonInfo ? `${lastLessonInfo.dayName} ${lastLessonInfo.fullDate}` : '';
  const suggestedTime = lastLessonInfo ? lastLessonInfo.time : '';

  const gradDate = prompt(uiText('promptGraduationDate'), suggestedDate);
  if (gradDate === null) return;
  const gradTime = prompt(uiText('promptGraduationTime'), suggestedTime);
  if (gradTime === null) return;

  const message = renderTemplate(getResolvedGraduationTemplate(language, settings), {
    courseName,
    gradDate,
    gradTime,
    tutorName: settings.tutorName
  });

  await queueGroupBroadcastMessage(message);
}


function pluralizeSpanishDay(dayName) {
  const lower = (dayName || '').toLowerCase();
  if (lower === 'sábado' || lower === 'sabado') return 'sábados';
  if (lower === 'domingo') return 'domingos';
  return lower;
}


function buildScheduleLine(isoDateStr) {
  if (!isoDateStr) return null;
  try {
    const date = new Date(isoDateStr);
    const dayNameRaw = new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: 'America/Bogota' }).format(date);
    const pluralDay = pluralizeSpanishDay(dayNameRaw);
    const capitalizedDay = pluralDay.charAt(0).toUpperCase() + pluralDay.slice(1);
    const time12hRaw = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' }).format(date);

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


captureAuthToken();



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
  if (!info.groupId) return;


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


  actionsRow.parentElement.insertBefore(wrapper, actionsRow);
}


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

  registerDomWatcher(check);
}


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

  if (!isGroupPage()) {
    console.log('[Group Students Info] Not a group page, skipping');
    return;
  }
  
  console.log('[Group Students Info] Initializing on group page');
  



  const initialGroupId = extractGroupId();
  if (initialGroupId) {
    fetchGroupGeneralInfo(initialGroupId);
  }
  

  const safeInject = (label, fn) => {
    try {
      fn();
    } catch (error) {
      console.error(`[Group Students Info] Error inyectando "${label}":`, error);
    }
  };


  safeInject('broadcast', injectBroadcastButtons);


  safeInject('settings', injectSettingsButton);


  safeInject('export contacts', injectExportContactsButton);


  safeInject('grading report', injectGroupGradingReportButton);


  safeInject('wa group link', injectWhatsAppGroupLinkButton);


  safeInject('attendance', injectTakeAttendanceButton);


  // Sincronización con Google Calendar: automática, sin botón, con su propio
  // límite de una vez por hora (ver syncCalendarIfDue). No hace nada hasta
  // que el tutor pega la URL de su script en Configuración.
  safeInject('calendar sync', () => { syncCalendarIfDue(); });
  

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(processAllStudents, 1000);
    });
  } else {
    setTimeout(processAllStudents, 1000);
  }
  

  let intervalId = null;

  const studentWatchCheck = () => {

    if (isProcessingStudents) {
      return;
    }
    

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
  

  let attempts = 0;
  const maxAttempts = 20;
  intervalId = setInterval(() => {
    if (!isGroupPage()) {
      clearInterval(intervalId);
      unregisterDomWatcher(studentWatchCheck);
      return;
    }
    

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
    

    if ((students.length > 0 && unprocessedCount === 0) || attempts >= maxAttempts) {
      console.log('[Group Students Info] Stopping periodic check (all processed or max attempts reached)');
      clearInterval(intervalId);
      unregisterDomWatcher(studentWatchCheck);
    }
  }, 2000);
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGroupStudentsInfo);
} else {
  initGroupStudentsInfo();
}


if (typeof window !== 'undefined') {
  window.KodlandGroupStudentsInfo = {
    processAllStudents,
    fetchStudentInfo,
    findStudentElements
  };
}

