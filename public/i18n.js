// Idioma de apoyo de la interfaz: "es" (castellano) o "en" (inglés). El euskera es siempre la lengua meta.
// T(texto) devuelve la traducción al inglés cuando LANG === "en"; si no existe, devuelve el castellano.
// El castellano es la clave del diccionario, así el código y el contenido (lessons.js) siguen escribiéndose en es.
window.LANGS = ["es", "en", "fr"];
window.LANG = (() => { try { const l = localStorage.getItem("euskara.lang"); return window.LANGS.includes(l) ? l : null; } catch (e) { return null; } })();
// Carga bajo demanda el diccionario de contenido del idioma (inglés o francés); el castellano no necesita ninguno.
window._langLoaded = { es: true };
window.loadLang = (l) => new Promise((ok, ko) => {
  if (!window.LANGS.includes(l) || window._langLoaded[l]) return ok();
  const s = document.createElement("script"); s.src = l === "en" ? "i18n-content.js" : "i18n-fr.js";
  s.onload = () => { window._langLoaded[l] = true; ok(); }; s.onerror = () => ko(new Error("No se pudo cargar el idioma")); document.head.appendChild(s);
});
window.setLang = (l) => { window.LANG = window.LANGS.includes(l) ? l : "es"; try { localStorage.setItem("euskara.lang", window.LANG); } catch (e) {} document.documentElement.lang = window.LANG; };
const dictOf = () => window.LANG === "en" ? [window.EN, window.ENX] : window.LANG === "fr" ? [window.FR, window.FRX] : null;
window.T = (s) => { const d = dictOf(); if (!d || s == null) return s; const k = String(s); const v = d[0] && d[0][k]; if (v !== undefined) return v; if (d[1]) { for (const [re, f] of d[1]) { const m = k.match(re); if (m) return f(m); } } return k; };
// L2(es, en, fr?): para textos construidos dinámicamente. Sin tercer argumento, el francés sale del diccionario FR (clave = es) o cae al castellano.
window.L2 = (es, en, fr) => window.LANG === "en" ? en : window.LANG === "fr" ? (fr !== undefined ? fr : (window.FR && window.FR[es] !== undefined ? window.FR[es] : es)) : es;

// ---------- interfaz ----------
window.EN = {
  // general
  "Práctica de euskera": "Basque practice",
  "Escuchar": "Listen", "despacio": "slowly", "Audio no disponible": "Audio unavailable", "Error de red.": "Network error.",
  "Hola": "Hi", "Firmes": "Solid", "Perfil": "Profile", "Volver": "Back", "Salir": "Quit", "Siguiente": "Next", "Comprobar": "Check", "Continuar": "Continue",
  "Entendido": "Got it", "Guardar": "Save", "Empezar": "Start", "Saltar": "Skip", "Otra vez": "Again", "Terminar": "Finish", "Kargatzen…": "Kargatzen…",
  "Hoy": "Today", "Lecciones": "Lessons", "Grupo": "Group", "Datos": "Stats",
  // idioma
  "Castellano": "Spanish", "Inglés": "English", "Francés": "French", "Idioma de apoyo": "Support language", "Las traducciones y explicaciones, ¿en qué idioma?": "Translations and explanations in which language?",
  // login
  "Entra o crea tu cuenta con tu correo": "Sign in or create your account with your email",
  "Te mandamos un código de 6 cifras al correo. Sin contraseñas: la sesión se queda abierta en este dispositivo.": "We'll email you a 6-digit code. No passwords: you stay signed in on this device.",
  "tu@correo.com": "you@email.com", "Enviar código": "Send code", "Al entrar aceptas la": "By signing in you accept the", "política de privacidad": "privacy policy",
  "Tu código": "Your code", "Hemos enviado un código de 6 cifras a": "We've sent a 6-digit code to", "Mira también la carpeta de spam.": "Check your spam folder too.",
  "Modo pruebas": "Test mode", "(el envío de correo no está configurado): tu código es": "(email sending isn't configured): your code is",
  "Tu nombre, como quieres que te vean los demás": "Your name, as you want others to see it", "Nombre": "Name", "Entrar": "Sign in",
  "Otro correo": "Another email", "Reenviar código": "Resend code", "código reenviado": "code resent", "Dinos cómo te llamas (al menos 2 letras).": "Tell us your name (at least 2 letters).",
  // perfil
  "Mi perfil": "My profile", "sobre ti": "about you",
  "Con esto la app crea frases sobre ti (tu edad, tus hermanos…). Lo que dices de ti mismo se recuerda mucho mejor que lo de Ane y Mikel.": "With this the app builds sentences about you (your age, your siblings…). What you say about yourself sticks far better than facts about Ane and Mikel.",
  "Tu nombre, como lo ven los demás": "Your name, as others see it", "¿Chica o chico?": "Girl or boy?", "chica · neba / ahizpa": "girl · neba / ahizpa", "chico · anaia / arreba": "boy · anaia / arreba",
  "¿Cuántos años tienes?": "How old are you?", "Edad": "Age", "¿Dónde vives? (ciudad, en su forma habitual)": "Where do you live? (city, as usually written)",
  "¿De dónde eres? (ciudad o país)": "Where are you from? (city or country)", "Hermanos": "Siblings", "Hermanas": "Sisters", "Hermanos (varones)": "Brothers",
  "Avisos en el móvil": "Phone notifications", "Normal": "Normal", "Lento": "Slow",
  "En cualquier altavoz, mantén pulsado para oírlo despacio aunque esté en normal.": "On any speaker button, press and hold to hear it slowly even in normal mode.",
  "🔇 El audio no está disponible ahora mismo; los dictados se omiten.": "🔇 Audio is unavailable right now; dictations are skipped.",
  "Sesión de": "Signed in as", "Salir de la cuenta": "Sign out", "Borrar mi cuenta": "Delete my account",
  "Se borran tu cuenta, tu progreso, tus retos y tus avisos. No se puede deshacer. Escribe tu correo para confirmar.": "Your account, progress, challenges and notifications are deleted. This cannot be undone. Type your email to confirm.",
  "Borrar para siempre": "Delete forever", "Política de privacidad": "Privacy policy", "Escribe tu correo.": "Type your email.",
  "¿Borrar tu cuenta y todo tu progreso? No se puede deshacer.": "Delete your account and all your progress? This cannot be undone.", "No se pudo borrar.": "Couldn't delete.",
  // etapas
  "nueva": "new", "firme": "solid", "en estudio": "learning", "toca repasar hoy": "due today", "la verás mañana": "you'll see it tomorrow",
  "firmes": "solid", "por ver": "not yet seen",
  // push
  "Los avisos no están activados en el servidor.": "Notifications aren't enabled on the server.",
  "En iPhone, los avisos solo funcionan con la app añadida a la pantalla de inicio (Compartir → Añadir a pantalla de inicio). Ábrela desde ahí y vuelve aquí.": "On iPhone, notifications only work once the app is added to the Home Screen (Share → Add to Home Screen). Open it from there and come back here.",
  "Este navegador no admite avisos.": "This browser doesn't support notifications.",
  "Un aviso al día si tienes frases para repasar y no has practicado, y otro cuando alguien te reta.": "One reminder a day if you have phrases due and haven't practised, and one when someone challenges you.",
  "A las": "At", "Activar avisos": "Enable notifications", "Los avisos están bloqueados para esta web en los ajustes del móvil.": "Notifications are blocked for this site in your phone settings.",
  "Sin permiso para avisos": "No permission for notifications", "Avisos activados": "Notifications enabled", "No se pudo activar: ": "Couldn't enable: ",
  "✅ Avisos activados": "✅ Notifications on", "Probar": "Test", "Recordatorio diario a las": "Daily reminder at", "Retos y tareas de Taldea": "Taldea challenges and tasks",
  "Desactivar en este dispositivo": "Turn off on this device", "Guardado": "Saved", "Enviado, mira la notificación": "Sent, check the notification", "No se envió": "Not sent", "Avisos desactivados": "Notifications off",
  // bienvenida
  "Bienvenido/a": "Welcome", "Esta app es para practicar entre clase y clase lo que vais viendo: saludos, presentarse, números, gustos… Cinco minutos al día bastan.": "This app is for practising between classes what you're learning: greetings, introducing yourself, numbers, likes… Five minutes a day is enough.",
  "Semilla, brote, árbol": "Seed, sprout, tree",
  "Cada frase empieza como semilla. Cuando la estudias es un brote y vuelve a salir al día siguiente, a los 3, a los 7… Si la recuerdas cada vez, se hace árbol: firme. Si la fallas, vuelve mañana.": "Every phrase starts as a seed. Once you study it, it's a sprout and comes back the next day, then after 3 days, 7… If you remember it each time, it becomes a tree: solid. If you miss it, it comes back tomorrow.",
  "Escribe, no elijas": "Type, don't pick", "Casi siempre te pediré escribir la frase. Hay pista y opciones, pero cuentan menos. Escribir es lo que hace que se quede.": "Most of the time I'll ask you to type the phrase. There's a hint and options, but they count less. Typing is what makes it stick.",
  // gaur
  "tienes una ronda a medias": "you have a round in progress",
  "rondas": "rounds", "empezar una ronda nueva": "start a new round", "descartar la ronda a medias": "discard the unfinished round", "Continuar donde lo dejaste": "Pick up where you left off", "No se pudo guardar el progreso": "Could not save progress", "Sin conexión: esta respuesta no se ha guardado": "Offline: this answer was not saved",
  "ranking de la semana": "weekly ranking",
  "Cómo funciona": "How it works",
  "<p>Busca a alguien por su nombre y añádelo. Con tu círculo puedes lanzar retos, proponer tareas en persona y ver su racha y progreso en el ranking.</p><p>No hace falta que te acepten: es una lista tuya, como los contactos.</p>": "<p>Search someone by name and add them. With your circle you can send duels, propose in-person tasks and see their streak and progress in the ranking.</p><p>No approval needed: it is your own list, like contacts.</p>",
  "<p>Eliges a alguien y respondes 6 frases de las que ya conoces. La otra persona recibe las mismas 6 y gana quien acierte más.</p><p>El resultado aparece en Historia cuando los dos habéis terminado.</p>": "<p>Pick someone and answer 6 phrases you already know. They get the same 6, and whoever gets more right wins.</p><p>The result shows up in Historia once you have both finished.</p>",
  "<p>Proponle a alguien de tu círculo algo para hacer en euskera fuera de la app: pedir un café, presentaros, contar qué hicisteis ayer.</p><p>Cuando lo hagáis, cada uno marca que está hecho.</p>": "<p>Propose something to do in Basque outside the app to someone in your circle: order a coffee, introduce yourselves, tell what you did yesterday.</p><p>Once done, each of you marks it as done.</p>",
  "<p>Si marcas <b>disponible</b>, gente que no conoces puede retarte, y tú puedes pedir un reto al azar entre quienes también están disponibles.</p><p>Si os caéis bien, podéis añadiros al círculo desde Historia.</p>": "<p>If you tick <b>available</b>, people you do not know can challenge you, and you can request a random duel among those who are also available.</p><p>If you get along, you can add each other to your circle from Historia.</p>",
  "<p>XP de los últimos 7 días. Cada frase acertada en una ronda da 10 XP.</p><p>Cuenta todo el mundo que haya hecho al menos una ronda; si no apareces, es que aún no has practicado esta semana.</p>": "<p>XP over the last 7 days. Each correct phrase in a round gives 10 XP.</p><p>Everyone who has done at least one round counts; if you are missing, you have not practised yet this week.</p>",
  "<p>Retos y tareas pendientes y terminados, con quién y cómo quedaron.</p>": "<p>Pending and finished duels and tasks, with whom and how they ended.</p>",
  "<p><b>Hazi</b> (semilla): frases que aún no has estudiado.</p><p><b>Ikasten</b> (brote): en estudio, vuelven a salir en tus rondas.</p><p><b>Sendo</b> (firme): las has recordado varias veces con días de por medio. Si fallas una, baja a brote y vuelve mañana.</p>": "<p><b>Hazi</b> (seed): phrases you have not studied yet.</p><p><b>Ikasten</b> (sprout): being learnt, they keep coming back in your rounds.</p><p><b>Sendo</b> (solid): recalled several times with days in between. Miss one and it drops back to sprout and returns tomorrow.</p>",
  "<p>XP que ganaste cada día de los últimos siete. La racha cuenta los días seguidos con al menos una ronda.</p>": "<p>XP earned each of the last seven days. The streak counts consecutive days with at least one round.</p>",
  "<p>Tu posición esta semana entre quienes han practicado, tus días de práctica frente a la media, y el porcentaje de tus frases que ya está firme.</p>": "<p>Your position this week among those who practised, your practice days against the average, and the share of your phrases that is already solid.</p>",
  "<p>Por cada lección empezada, qué parte de sus frases tienes ya firmes.</p>": "<p>For each lesson you have started, how much of it is already solid.</p>",
  "<p>Las frases que más veces has fallado. Con tres o más, el botón <b>Zailenak</b> te las pone solas en una ronda, sin tocar el calendario.</p>": "<p>The phrases you have missed most often. With three or more, the <b>Zailenak</b> button puts them alone in a round, without touching the schedule.</p>",
  "<p><b>Gaurko txanda</b>: lo que toca repasar hoy más unas pocas frases nuevas. Una al día basta.</p><p><b>Txanda librea</b>: 10 frases al azar de las que ya conoces, sin tocar el calendario.</p><p><b>Zailenak</b>: solo las que has fallado dos veces o más.</p>": "<p><b>Gaurko txanda</b>: what is due today plus a few new phrases. One a day is enough.</p><p><b>Txanda librea</b>: 10 random phrases you already know, without touching the schedule.</p><p><b>Zailenak</b>: only the ones you have missed twice or more.</p>", "empieza por la primera lección": "start with the first lesson", "para repasar": "to review", "lo de hoy está hecho": "today is done",
  "continuar": "continue", "Kaixo! Así funciona:": "Kaixo! Here's how it works:",
  "1 · Abres una lección: lees, escuchas y miras la estructura.": "1 · Open a lesson: read, listen and look at the structure.",
  "2 · Pulsas <b>Ikasi</b>: te presento unas pocas frases, eliges su significado y las copias. Sin examen el primer día.": "2 · Tap <b>Ikasi</b>: I show you a few phrases, you pick their meaning and copy them. No test on day one.",
  "3 · Al día siguiente, aquí en <b>Gaur</b>, te las pido de memoria. Lo que aciertas se aleja en el calendario; lo que fallas vuelve mañana.": "3 · The next day, here in <b>Gaur</b>, I ask for them from memory. What you get right moves further out in the calendar; what you miss comes back tomorrow.",
  "Empezar por la lección 1": "Start with lesson 1", "Empezar la ronda de hoy": "Start today's round", "frases que toca repasar hoy": "phrases due today", " y ": " and ", "nuevas de": "new from",
  "Ronda libre · 10 frases": "Free round · 10 phrases", "Lo de hoy está hecho": "Today is done", "; la siguiente ": "; the next one ", ". La ronda libre repasa 10 frases al azar sin tocar el calendario.": ". The free round reviews 10 random phrases without touching the calendar.",
  "Siguiente lección · aprender nuevas": "Next lesson · learn new ones", "ronda libre": "free round", "tu huerto": "your garden", "Sendoak · firmes": "Sendoak · solid", "Ikasten · estudio": "Ikasten · learning", "Haziak · por ver": "Haziak · to see",
  "hoy has repasado": "today you've reviewed", "frases": "phrases", "¿Cómo funciona?": "How does it work?", "Cómo funciona": "How it works",
  "<b>Ronda de hoy.</b> La app decide qué frases toca repasar (las que estás a punto de olvidar) y añade unas pocas nuevas. Una al día basta.": "<b>Today's round.</b> The app decides which phrases are due (the ones you're about to forget) and adds a few new ones. One a day is enough.",
  "<b>Escribes antes de elegir.</b> Pista y opciones están ahí, pero cuentan menos.": "<b>You type before you pick.</b> Hint and options are there, but they count less.",
  "<b>🌱 → 🌿 → 🌳.</b> Una frase nueva es semilla; al estudiarla, brote; cuando la has recordado varias veces con días entre medias, árbol (firme). Si la fallas, baja a brote y la repasas mañana.": "<b>🌱 → 🌿 → 🌳.</b> A new phrase is a seed; once studied, a sprout; once you've recalled it several times with days in between, a tree (solid). Miss it and it drops back to sprout for tomorrow.",
  "<b>Ronda libre.</b> 10 frases al azar de las que ya conoces, sin tocar el calendario. Para cuando quieres más.": "<b>Free round.</b> 10 random phrases you already know, without touching the calendar. For when you want more.",
  "<b>Zailenak.</b> Solo las que has fallado dos veces o más.": "<b>Zailenak.</b> Only the ones you've missed twice or more.",
  // ejercicios
  "otra vez esta": "this one again", "nuevo": "new", "Léelo en voz alta. Ahora te preguntaré qué significa y luego la copiarás.": "Read it out loud. Next I'll ask what it means, then you'll copy it.",
  "¿Qué significa? Elige": "What does it mean? Pick", "Cópiala mirando el modelo": "Copy it while looking at the model", "Escríbela igual…": "Type it exactly…",
  "Escribirla una vez fija la forma. Mañana te la pediré sin modelo.": "Typing it once fixes the form. Tomorrow I'll ask for it without the model.",
  "escucha y escribe": "listen and type", "Toca para repetir · mantén pulsado para oírlo despacio 🐢": "Tap to repeat · press and hold to hear it slowly 🐢", "Lo que has oído, en euskera…": "What you heard, in Basque…",
  "💡 Pista": "💡 Hint", "🔘 Opciones": "🔘 Options", "¿cuántos hay? Escríbelo en euskera": "how many? Type it in Basque", "Número en euskera…": "Number in Basque…",
  "Transforma la frase": "Transform the sentence", "La frase transformada…": "The transformed sentence…", "¿qué significa?": "what does it mean?", "En castellano…": "In English…",
  "escríbelo en euskera": "type it in Basque", "En euskera…": "In Basque…",
  "comprobar": "check", "pista": "hint", "opciones": "options", "elegir": "pick", "escuchar": "listen", "(fuera del campo, o con Alt)": "(outside the field, or with Alt)",
  "Casi exacto: escribiste": "Almost exact: you typed", "desde": "from", "copia la forma correcta": "copy the correct form",
  "Ronda terminada": "Round finished", "Asmatuak · aciertos": "Asmatuak · correct", "a dónde va cada una": "where each one goes", "mañana otra vez (fallada)": "tomorrow again (missed)", "¡firme!": "solid!",
  "vuelven mañana": "coming back tomorrow", "Sin fallos. Lo de hoy se aleja en el calendario.": "No misses. Today's phrases move further out in the calendar.",
  // lecciones
  "lee, escucha, luego practica": "read, listen, then practise", "Sin empezar": "Not started", "Completa: todo firme": "Complete: all solid", "para repasar hoy": "due today", "Al día": "Up to date",
  "Gramatika · estructuras": "Gramatika · structures", "fichas: ser, estar, tener, gustar, negación, plural, números, preguntas": "cards: to be, to have, to like, negation, plural, numbers, questions",
  "qué es la barra": "what the bar means", "<b>Firmes</b>: recordadas varias veces con días entre medias": "<b>Solid</b>: recalled several times with days in between",
  "<b>En estudio</b>: ya vistas, aún volviendo a menudo": "<b>Learning</b>: already seen, still coming back often", "<b>Por ver</b>: todavía no te han salido": "<b>To see</b>: not shown to you yet",
  "las reglas detrás de las frases": "the rules behind the phrases", "Se desbloquea con sus lecciones": "Unlocks with its lessons",
  "Cada ficha: la regla, las piezas en color, ejemplos de tus lecciones y ejercicios de transformación.": "Each card: the rule, the colour-coded pieces, examples from your lessons and transformation drills.",
  "sujeto": "subject", "nombre / adjetivo": "noun / adjective", "verbo": "verb", "negación / unión": "negation / linker", "número / plural": "number / plural", "interrogativo": "question word",
  "Gramática": "Grammar", "cómo se arma": "how it's built", "Ejemplos de": "Examples from",
  "Escribe la frase transformada según la instrucción. Aquí se practica la regla, no la memoria: no afecta al calendario.": "Type the transformed sentence following the instruction. This practises the rule, not memory: it doesn't affect the calendar.",
  "Bikain! Has completado las": "Bikain! You've completed all", "transformaciones.": "transformations.", "Escribe la frase transformada…": "Type the transformed sentence…",
  "Lección": "Lesson", "Estructura clave": "Key structure", "Vocabulario y frases · toca para escuchar": "Vocabulary and phrases · tap to listen", "Vocabulario y frases": "Vocabulary and phrases",
  "fallos": "misses", "aún no vista": "not seen yet", "Cada tarjeta muestra su etapa (🌱 🌿 🌳) y cuándo la verás de nuevo.": "Each card shows its stage (🌱 🌿 🌳) and when you'll see it again.",
  "transformaciones con las frases de esta lección": "transformations with this lesson's phrases", "diálogo": "dialogue", "escuchar entero": "play all", "Aprender nuevas": "Learn new ones", "Practicar esta lección": "Practise this lesson",
  // taldea
  "retos y tareas con tu gente": "challenges and tasks with your people", "tu círculo": "your circle",
  "Añade a tus compañeros de clase o amigos por su nombre. Solo tu círculo puede retarte y compararse contigo.": "Add your classmates or friends by name. Only your circle can challenge you and compare with you.",
  "Buscar por nombre…": "Search by name…", "Todavía no has añadido a nadie.": "You haven't added anyone yet.", "te ha añadido": "added you", "quitar": "remove", "añadir": "add", "añadido": "added",
  "Nadie con ese nombre. Pídele que se registre y te diga cómo se ha puesto.": "Nobody with that name. Ask them to sign up and tell you the name they chose.",
  "reto de 6 frases": "6-phrase challenge", "Los dos respondéis las mismas 6 frases escribiendo. Gana quien acierte más a la primera.": "You both type the same 6 phrases. Whoever gets more right first time wins.",
  "Retar · escribir 6 frases": "Challenge · type 6 phrases", "Retar · transformar 6": "Challenge · transform 6", "tareas en persona": "in-person tasks",
  "Haz la tarea con la otra persona (en el café, por mensaje…), escribe aquí lo que te dijo en euskera y ella confirma si está bien.": "Do the task with the other person (at the café, by message…), type here what they said in Basque and they confirm whether it's right.",
  "Las tareas en persona se desbloquean al introducir las lecciones de presentarse, qué tal, edad…": "In-person tasks unlock once you've started the lessons on introducing yourself, how are you, age…",
  "Lo que respondió, en euskera": "What they answered, in Basque", "Enviar": "Send", "Escribe la respuesta primero": "Type the answer first", "enviado": "sent", "retos y tareas": "challenges and tasks",
  "(tú)": "(you)", "Berdinketa · empate": "Berdinketa · draw", "irabazle · gana": "irabazle · wins", "te reta:": "challenges you:", "6 transformaciones": "6 transformations", "6 frases escribiendo": "6 phrases, typed",
  "Ya ha hecho": "They already scored", "Jugar": "Play", "Tu resultado:": "Your score:", "Esperando a": "Waiting for", "✅ Confirmado por": "✅ Confirmed by", "✏️ Corrección de": "✏️ Correction by",
  "¿Es lo que dijiste? Si no, escribe la forma correcta.": "Is that what you said? If not, type the correct form.", "Corrección (opcional)": "Correction (optional)", "Correcto": "Correct", "Corregir": "Correct it",
  "Esperando confirmación de": "Waiting for confirmation from", "Reto terminado": "Challenge finished", "Resultado enviado. Mira el marcador en Taldea.": "Result sent. See the score in Taldea.",
  "Reto enviado. Cuando conteste, veréis el marcador en Taldea.": "Challenge sent. When they answer, you'll both see the score in Taldea.", "ir a Taldea": "go to Taldea",
  "Pregúntale a {X} cómo se llama en euskera y escribe su respuesta (Ni … naiz)": "Ask {X} their name in Basque and write their answer (Ni … naiz)",
  "Pregúntale a {X} qué tal está (Zer moduz?) y escribe lo que te conteste": "Ask {X} how they are (Zer moduz?) and write what they answer",
  "Pregúntale a {X} cuántos años tiene y escribe la respuesta con el número en euskera": "Ask {X} how old they are and write the answer with the number in Basque",
  "Pregúntale a {X} si tiene hermanos (Anai-arrebarik baduzu?) y escribe su respuesta": "Ask {X} if they have siblings (Anai-arrebarik baduzu?) and write their answer",
  "Pregúntale a {X} qué le gusta (Zer gustatzen zaizu?) y escribe su respuesta": "Ask {X} what they like (Zer gustatzen zaizu?) and write their answer",
  "Despídete de {X} en euskera de dos formas distintas y escríbelas": "Say goodbye to {X} in Basque in two different ways and write them down",
  // datuak
  "lo que de verdad se queda": "what really sticks", "No se pudieron cargar los datos.": "Couldn't load the data.", "Ikasten · en estudio": "Ikasten · learning", "Egunak · seguidos": "Egunak · streak", "Lehenengoan · a la primera": "Lehenengoan · first time",
  "Firme = la has acertado tantas veces que no hace falta repasarla hasta dentro de una semana o más.": "Solid = you've got it right so many times it doesn't need reviewing for a week or more.",
  "frases programadas para más adelante.": "phrases scheduled for later.", "Ranking de la semana · entre todo el mundo": "This week's ranking · everyone",
  "personas que han practicado esta semana": "people who practised this week", "en total": "in total", "Practica una ronda y entras en el ranking de la semana": "Do one round and you join this week's ranking", "personas activas": "active people",
  "Último día de la semana.": "Last day of the week.", "Quedan": "There are", "días de semana.": "days left in the week.", "Cada frase acertada son 10 XP. ★ = gente de tu círculo.": "Each correct phrase is 10 XP. ★ = people in your circle.",
  "XP por día": "XP per day", "tú y tu círculo": "you and your circle", "Sendo = firmes · Ikast = en estudio · Astea = XP de la semana · Guzt = XP total · 🔥 = racha · % = aciertos a la primera.": "Sendo = solid · Ikast = learning · Astea = this week's XP · Guzt = total XP · 🔥 = streak · % = right first time.",
  " Añade gente en Taldea para compararte.": " Add people in Taldea to compare.", "XP semana": "Week XP", "XP total": "Total XP", "En estudio": "Learning",
  // feedback
  "¡Muy bien!": "Very good!", "¡Estupendo!": "Great!", "¡De primera!": "First-rate!", "¡Excelente!": "Excellent!", "¡Campeón/a!": "Champion!", "¡Maravilloso!": "Wonderful!", "¡Eso es!": "That's it!", "¡Aúpa!": "Aupa!", "¡Lo has hecho muy bien!": "You did really well!", "¡Tremendo!": "Tremendous!",
  "Bien, con ayuda": "Good, with help", "¡Lo has conseguido!": "You got it!", "La próxima, sin ayuda": "Next time, without help",
  "¡Casi!": "Almost!", "Tranqui, a la próxima": "No worries, next time", "¡No pasa nada!": "It's fine!", "¡Inténtalo otra vez!": "Try again!", "¡Por poco!": "So close!", "¡Sigue adelante!": "Keep going!",
  // personales
  "hermanos (como lo digo yo)": "siblings (the way I say it)", "No tengo hermanos": "I have no siblings", "Yo soy chica": "I am a girl", "Yo soy chico": "I am a boy",
};
// Patrones con números u otras partes variables.
window.ENX = [
  [/^la verás en (\d+) días$/, m => `you'll see it in ${m[1]} days`],
  [/^(\d+) para repasar hoy$/, m => `${m[1]} due today`],
  [/^Tengo (\d+) años$/, m => `I am ${m[1]} years old`],
];

// Premium / suscripción
Object.assign(window.EN, {
  "Sin suscripción": "No subscription",
  "Premium hasta el": "Premium until",
  "no se renueva": "won't renew",
  "Premium · se renueva el": "Premium · renews on",
  "cada mes": "every month",
  "cada N meses": "every N months",
  "mes": "month",
  "Mejor precio": "Best value",
  "todo el camino": "the whole road",
  "El módulo 1 es gratis. Con Premium abres los 16 módulos (A1 y A2): 84 lecciones, 66 fichas de gramática, audio nativo y repaso espaciado sin límite.": "Module 1 is free. Premium opens all 16 modules (A1 and A2): 84 lessons, 66 grammar cards, native audio and unlimited spaced review.",
  "La suscripción se gestiona desde tu cuenta en la web.": "Your subscription is managed from your account on the website.",
  "Renovación automática; cancela cuando quieras desde tu perfil. IVA incluido. Pago seguro con Stripe.": "Renews automatically; cancel any time from your profile. VAT included. Secure payment with Stripe.",
  "Los pagos se activarán muy pronto. Si tienes un código, úsalo aquí abajo.": "Payments will be enabled very soon. If you have a code, use it below.",
  "¿Tienes un código?": "Got a code?",
  "Canjear": "Redeem",
  "Gestionar suscripción": "Manage subscription",
  "Pago recibido; se activará en unos segundos.": "Payment received; it will activate in a few seconds.",
  "Ver planes y códigos": "Plans and codes",
  "¿Has estudiado euskera antes?": "Have you studied Basque before?",
  "Nunca · empiezo desde cero (Baiona)": "Never · I start from scratch (Baiona)",
  "Algo: sé saludar, presentarme, los números (empiezo en Hondarribia)": "A bit: greetings, introducing myself, numbers (I start in Hondarribia)",
  "Tengo el A1 · empiezo el A2 (Durango)": "I have A1 · I start A2 (Durango)",
  "Tu primer módulo (TOWN) es gratis. Con Premium abres los 16 módulos (A1 y A2): 84 lecciones, 66 fichas de gramática, audio nativo y repaso espaciado sin límite.": "Your first module (TOWN) is free. Premium opens all 16 modules (A1 and A2): 84 lessons, 66 grammar cards, native audio and unlimited spaced review.",
  "Hazte Premium": "Go Premium",
  "Tu círculo, los retos con amigos y el ranking semanal son parte de Premium.": "Your circle, challenges with friends and the weekly ranking are part of Premium.",
  "o usa un código": "or use a code"
});
