// Contenido de las lecciones. Para añadir una clase nueva, agrega un objeto más al array.
// pairs:     [euskera, castellano, emoji] -> tarjetas visuales y elección múltiple en ambos sentidos
// sentences: [euskera, castellano]        -> ordenar fichas y escribir
// pattern:   la estructura clave, con ___ donde va la palabra que cambia
// tips:      [{t: título, b: explicación}] -> cajas de "cómo funciona"
// dialogue:  [[quién, euskera, castellano], ...] -> mini diálogo de ejemplo
// Módulos del A1 (según el currículo HEOC adaptado): las lecciones llevan `module`. Los que aún no tienen lecciones muestran las previstas.
window.MODULES = [
  { id: 1, town: "Hondarribia", eu: "Ni", es: "Yo", en: "Me", desc: "Saludar, presentarte, cómo estás, edad, gustos" },
  { id: 2, town: "Donostia", eu: "Nire mundua", es: "Mi mundo", en: "My world", desc: "Familia, ser y estar, profesiones, preguntas, dónde vives, tener" },
  { id: 3, town: "Zarautz", eu: "Etxea eta hiria", es: "Casa y ciudad", en: "Home and city", desc: "La casa, el barrio, dónde está, direcciones", planned: ["La casa y sus habitaciones", "Muebles y objetos: ba al dago?", "El barrio: tiendas y servicios", "Direcciones: nora, nondik", "Describir lugares"] },
  { id: 4, town: "Deba", eu: "Jendea", es: "La gente", en: "People", desc: "Describir personas, carácter, amigos, de quién es, números hasta 100", planned: ["Describir personas: aspecto", "Carácter y ánimo", "Amigos, pareja, vecinos", "Noren da? Posesión", "Números 20–100, teléfono, dirección"] },
  { id: 5, town: "Markina", eu: "On egin!", es: "¡Que aproveche!", en: "Enjoy your meal!", desc: "Comida, pedir en el bar, gustos, compras y precios", planned: ["Comidas y bebidas", "En el bar: pedir", "Gustos de comida", "Compras: cuánto cuesta", "Pintxo-pote y costumbres"] },
  { id: 6, town: "Gernika", eu: "Egunerokoa", es: "El día a día", en: "Everyday life", desc: "Las horas, fechas, rutina, frecuencia, planes", planned: ["Las horas", "Días, meses y fechas", "Rutina diaria", "Frecuencia: beti, askotan, inoiz ez", "Planes: bihar, asteburuan"] },
  { id: 7, town: "Bilbo", eu: "Aisia eta eguraldia", es: "Ocio y tiempo", en: "Leisure and weather", desc: "Aficiones, fin de semana, el tiempo, quedar, cómo te sientes", planned: ["Deportes y aficiones", "Fin de semana: nora zoaz?", "El tiempo: euria ari du", "Quedar: invitar y rechazar", "Cuerpo y cómo me siento"] },
  { id: 8, town: "Portugalete", eu: "Atzo", es: "Ayer", en: "Yesterday", desc: "El pasado de ser y tener, contar el fin de semana, Euskal Herria", planned: ["Pasado de izan", "Pasado de ukan", "Contar el fin de semana", "Euskal Herria: territorios y fiestas", "Repaso del A1"] }
];
window.LESSONS = [
  {
    id: "l1", module: 1, title: "Saludos y despedidas", desc: "Kaixo, egun on, agur…", emoji: "👋", scene: { emoji: "☕", title: "Kafetegian · en el café" },
    pairs: [["Kaixo", "Hola", "👋"], ["Egun on", "Buenos días", "🌅"], ["Arratsalde on", "Buenas tardes", "🌇"], ["Gabon", "Buenas noches", "🌙"], ["Agur", "Adiós", "🚪"], ["Ikusi arte", "Hasta la vista", "👀"], ["Gero arte", "Hasta luego", "⏰"], ["Eskerrik asko", "Gracias", "🙏"]],
    sentences: [["Egun on!", "¡Buenos días!"], ["Kaixo! Zer moduz?", "¡Hola! ¿Qué tal?"], ["Agur, gero arte!", "¡Adiós, hasta luego!"]],
    pattern: "___ on",
    tips: [{ t: "on = bueno", b: "Egun (día), arratsalde (tarde) y gau (noche) + on. Gabon es gau + on fusionado." }, { t: "Kaixo vale siempre", b: "Es el hola de todo el día. Agur sirve para despedirse en cualquier momento." }],
    dialogue: [["A", "Kaixo!", "¡Hola!"], ["B", "Egun on! Zer moduz?", "¡Buenos días! ¿Qué tal?"], ["A", "Ondo. Agur, gero arte!", "Bien. ¡Adiós, hasta luego!"]]
  },
  {
    id: "l2", module: 1, title: "Presentarse", desc: "Nola duzu izena? Ni … naiz", emoji: "🙋", scene: { emoji: "☕", title: "Kafetegian · en el café" },
    pairs: [["Nola duzu izena?", "¿Cómo te llamas?", "❓"], ["Zein da zure izena?", "¿Cuál es tu nombre?", "🪪"], ["Ni Ane naiz", "Yo soy Ane", "🙋‍♀️"], ["Nire izena Ane da", "Mi nombre es Ane", "✍️"], ["Pozten naiz", "Encantado/a", "🤝"], ["ni", "yo", "👤"], ["nire", "mi", "👈"], ["izena", "nombre", "🏷️"]],
    sentences: [["Ni Mikel naiz.", "Yo soy Mikel."], ["Nire izena Ane da.", "Mi nombre es Ane."], ["Nola duzu izena?", "¿Cómo te llamas?"], ["Pozten naiz!", "¡Encantado!"]],
    pattern: "Ni ___ naiz",
    tips: [{ t: "El verbo va al final", b: "Ni Ane naiz = yo Ane soy. Naiz es «soy»; da es «es»: Nire izena Ane da." }, { t: "Dos formas de preguntar", b: "Nola duzu izena? (¿cómo tienes nombre?) y Zein da zure izena? (¿cuál es tu nombre?). Las dos valen." }],
    dialogue: [["A", "Nola duzu izena?", "¿Cómo te llamas?"], ["B", "Ni Mikel naiz. Eta zu?", "Yo soy Mikel. ¿Y tú?"], ["A", "Nire izena Ane da. Pozten naiz!", "Mi nombre es Ane. ¡Encantada!"]]
  },
  {
    id: "l3", module: 1, title: "¿Qué tal?", desc: "Zer moduz? Ondo, eta zu?", emoji: "😊", scene: { emoji: "🚶", title: "Kalean · por la calle" },
    pairs: [["Zer moduz?", "¿Qué tal?", "❓"], ["Oso ondo", "Muy bien", "😄"], ["Ondo", "Bien", "🙂"], ["Hala-hola", "Así así", "😐"], ["Gaizki", "Mal", "😞"], ["Nekatuta", "Cansado/a", "🥱"], ["Eta zu?", "¿Y tú?", "👉"], ["Zer moduz zaude?", "¿Cómo estás?", "💬"]],
    sentences: [["Ondo, eskerrik asko. Eta zu?", "Bien, gracias. ¿Y tú?"], ["Oso ondo nago.", "Estoy muy bien."], ["Hala-hola, nekatuta nago.", "Así así, estoy cansado."]],
    pattern: "___ nago",
    tips: [{ t: "nago = estoy", b: "Ondo nago (estoy bien), nekatuta nago (estoy cansado). Oso delante intensifica: oso ondo = muy bien." }, { t: "Devuelve la pregunta", b: "Eta zu? (¿y tú?) cierra la respuesta: Ondo, eskerrik asko. Eta zu?" }],
    dialogue: [["A", "Zer moduz?", "¿Qué tal?"], ["B", "Oso ondo, eskerrik asko. Eta zu?", "Muy bien, gracias. ¿Y tú?"], ["A", "Hala-hola, nekatuta nago.", "Así así, estoy cansada."]]
  },
  {
    id: "l4", module: 1, title: "La edad y los números", desc: "Zenbat urte dituzu?", emoji: "🎂", scene: { emoji: "🎂", title: "Urtebetetzean · en un cumpleaños" }, countable: "🍎",
    pairs: [["Zenbat urte dituzu?", "¿Cuántos años tienes?", "🎂"], ["urte", "año(s)", "📅"], ["bat", "1", "1️⃣"], ["bi", "2", "2️⃣"], ["hiru", "3", "3️⃣"], ["lau", "4", "4️⃣"], ["bost", "5", "5️⃣"], ["sei", "6", "6️⃣"], ["zazpi", "7", "7️⃣"], ["zortzi", "8", "8️⃣"], ["bederatzi", "9", "9️⃣"], ["hamar", "10", "🔟"], ["hamaika", "11", "🔢"], ["hamabi", "12", "🔢"], ["hamabost", "15", "🔢"], ["hogei", "20", "🔢"], ["hogeita hamar", "30", "🔢"], ["berrogei", "40", "🔢"], ["berrogeita hamar", "50", "🔢"], ["hirurogei", "60", "🔢"], ["hogeita bost", "25", "🔢"], ["berrogeita bi", "42", "🔢"]],
    sentences: [["Zenbat urte dituzu?", "¿Cuántos años tienes?"], ["Hogeita hamar urte ditut.", "Tengo treinta años."], ["Hogeita zortzi urte ditut.", "Tengo veintiocho años."], ["Berrogei urte ditu.", "Tiene cuarenta años."]],
    pattern: "___ urte ditut",
    tips: [{ t: "Se cuenta de 20 en 20", b: "30 = hogeita hamar (20 y 10). 42 = berrogeita bi (40 y 2). 57 = berrogeita hamazazpi (40 y 17)." }, { t: "ditut, no dut", b: "Los años son varios, así que el verbo es plural: hogei urte ditut. Para otra persona: hogei urte ditu." }],
    dialogue: [["A", "Zenbat urte dituzu?", "¿Cuántos años tienes?"], ["B", "Hogeita hamabost urte ditut. Eta zuk?", "Tengo treinta y cinco. ¿Y tú?"], ["A", "Berrogei urte ditut.", "Tengo cuarenta."]]
  },
  {
    id: "l5", module: 1, title: "Gustos", desc: "Gustatzen zait / zaizkit", emoji: "❤️", scene: { emoji: "🍢", title: "Pintxo-potean · de pintxos" },
    pairs: [["Zer gustatzen zaizu?", "¿Qué te gusta?", "❓"], ["Musika gustatzen zait", "Me gusta la música", "🎵"], ["Liburuak gustatzen zaizkit", "Me gustan los libros", "📚"], ["Ez zait gustatzen hotza", "No me gusta el frío", "🥶"], ["Asko gustatzen zait", "Me gusta mucho", "❤️"], ["zinema", "cine", "🎬"], ["kirola", "deporte", "⚽"], ["janaria", "comida", "🍽️"], ["pintxoak", "pintxos", "🍢"], ["bidaiatzea", "viajar", "✈️"], ["sukaldatzea", "cocinar", "🍳"], ["hotza", "frío", "❄️"]],
    sentences: [["Musika gustatzen zait.", "Me gusta la música."], ["Pintxoak gustatzen zaizkit.", "Me gustan los pintxos."], ["Ez zait gustatzen hotza.", "No me gusta el frío."], ["Zinema asko gustatzen zait.", "Me gusta mucho el cine."]],
    pattern: "___ gustatzen zait",
    tips: [{ t: "zait / zaizkit", b: "Una cosa: musika gustatzen zait. Varias: liburuak gustatzen zaizkit (la -k final marca plural)." }, { t: "Negativo con ez", b: "Ez va delante del verbo auxiliar: Ez zait gustatzen hotza. Para actividades, el verbo acaba en -tzea: bidaiatzea gustatzen zait." }],
    dialogue: [["A", "Zer gustatzen zaizu?", "¿Qué te gusta?"], ["B", "Zinema asko gustatzen zait. Eta zuri?", "Me gusta mucho el cine. ¿Y a ti?"], ["A", "Pintxoak gustatzen zaizkit!", "¡Me gustan los pintxos!"]]
  },
  {
    id: "l6", module: 2, title: "Hermanos y hermanas", desc: "Anaia, neba, arreba, ahizpa", emoji: "👨‍👩‍👧‍👦", scene: { emoji: "👨‍👩‍👧‍👦", title: "Familian · en familia" },
    grid: { title: "La palabra depende de TU género, no del de tu hermano/a", cols: ["👧 Si eres chica", "👦 Si eres chico"], rows: [["hermano", "neba", "anaia"], ["hermana", "ahizpa", "arreba"], ["hermanos (mixto)", "neba-arrebak", "anai-arrebak"]] },
    pairs: [["neba", "hermano (dice una chica)", "👧➡️👦"], ["anaia", "hermano (dice un chico)", "👦➡️👦"], ["ahizpa", "hermana (dice una chica)", "👧➡️👧"], ["arreba", "hermana (dice un chico)", "👦➡️👧"], ["neba-arrebak", "hermanos (dice una chica)", "👧➡️👫"], ["anai-arrebak", "hermanos (dice un chico)", "👦➡️👫"], ["Anai-arrebarik baduzu?", "¿Tienes hermanos?", "❓"], ["Ez dut anai-arrebarik", "No tengo hermanos", "🚫"], ["bat dut", "tengo uno/una", "1️⃣"], ["bi ditut", "tengo dos", "2️⃣"], ["familia", "familia", "🏡"]],
    sentences: [["Ahizpa bat dut.", "Tengo una hermana (dice una chica)."], ["Anaia bat eta arreba bat ditut.", "Tengo un hermano y una hermana (dice un chico)."], ["Neba bi ditut.", "Tengo dos hermanos (dice una chica)."], ["Ez dut anai-arrebarik.", "No tengo hermanos."]],
    pattern: "___ bat dut",
    tips: [{ t: "Cuatro palabras para dos", b: "Una chica dice neba (hermano) y ahizpa (hermana). Un chico dice anaia (hermano) y arreba (hermana). Lo que cambia es quién habla." }, { t: "dut / ditut", b: "Uno: ahizpa bat dut. Dos o más: neba bi ditut. Para preguntar: Anai-arrebarik baduzu?" }, { t: "El plural -k", b: "neba → nebak, ahizpa → ahizpak. Mezcla: neba-arrebak (chica) / anai-arrebak (chico)." }],
    dialogue: [["A", "Anai-arrebarik baduzu?", "¿Tienes hermanos?"], ["B", "Bai, ahizpa bat eta neba bat ditut. Eta zuk?", "Sí, tengo una hermana y un hermano (habla una chica). ¿Y tú?"], ["A", "Ez, ez dut anai-arrebarik.", "No, no tengo hermanos."]]
  },
  {
    id: "l7", module: 2, title: "Pronombres y ser/estar", desc: "Ni, zu, hura… + naiz/nago", emoji: "👥", scene: { emoji: "🏫", title: "Ikasgelan · en clase" },
    grid: { title: "Pronombre + ser (izan) + estar (egon)", cols: ["izan · ser", "egon · estar"], rows: [["ni (yo)", "naiz", "nago"], ["zu (tú)", "zara", "zaude"], ["hura (él/ella)", "da", "dago"], ["gu (nosotros)", "gara", "gaude"], ["zuek (vosotros)", "zarete", "zaudete"], ["haiek (ellos)", "dira", "daude"]] },
    pairs: [["ni", "yo", "🙋"], ["zu", "tú", "👉"], ["hura", "él / ella", "👤"], ["gu", "nosotros/as", "👫"], ["zuek", "vosotros/as", "👥"], ["haiek", "ellos/as", "👨‍👩‍👧‍👦"], ["Gu lagunak gara", "Nosotros somos amigos", "🤝"], ["Haiek ikasleak dira", "Ellos son estudiantes", "🎓"], ["Zuek nekatuta zaudete", "Vosotros estáis cansados", "🥱"], ["Gu ondo gaude", "Nosotros estamos bien", "🙂"], ["Hura pozik dago", "Él/ella está contento/a", "😄"], ["pozik", "contento/a", "😄"], ["lagunak", "amigos", "🤝"], ["ikasleak", "estudiantes", "🎓"]],
    sentences: [["Gu lagunak gara.", "Nosotros somos amigos."], ["Zuek ikasleak zarete.", "Vosotros sois estudiantes."], ["Haiek ondo daude.", "Ellos están bien."], ["Hura nekatuta dago.", "Él/ella está cansado/a."]],
    pattern: "Gu ___ gara",
    tips: [{ t: "Dos verbos para ser y estar", b: "izan (naiz, zara, da, gara, zarete, dira) para lo que ERES. egon (nago, zaude, dago, gaude, zaudete, daude) para cómo ESTÁS o dónde." }, { t: "El pronombre se puede omitir", b: "El verbo ya dice quién: «Lagunak gara» = somos amigos. Se pone ni/zu/gu para dar énfasis." }],
    dialogue: [["A", "Zuek lagunak zarete?", "¿Vosotros sois amigos?"], ["B", "Bai, gu lagunak gara. Eta ikasleak gara.", "Sí, somos amigos. Y somos estudiantes."], ["A", "Nekatuta zaudete?", "¿Estáis cansados?"], ["B", "Ez, ondo gaude!", "¡No, estamos bien!"]]
  },
  {
    id: "l8", module: 2, title: "Profesiones", desc: "Zer zara? Irakaslea naiz", emoji: "💼", scene: { emoji: "☕", title: "Kafetegian · en el café" },
    pairs: [["Zer zara?", "¿Qué eres? (profesión)", "❓"], ["irakaslea", "profesor/a", "👩‍🏫"], ["ikaslea", "estudiante", "🎓"], ["medikua", "médico/a", "🩺"], ["erizaina", "enfermero/a", "💉"], ["sukaldaria", "cocinero/a", "👩‍🍳"], ["zerbitzaria", "camarero/a", "🍽️"], ["abokatua", "abogado/a", "⚖️"], ["arkitektoa", "arquitecto/a", "📐"], ["ingeniaria", "ingeniero/a", "⚙️"], ["diseinatzailea", "diseñador/a", "🎨"], ["dendaria", "dependiente/a, tendero/a", "🛍️"], ["langabea", "desempleado/a", "📭"], ["lana", "trabajo", "💼"], ["Non egiten duzu lan?", "¿Dónde trabajas?", "📍"]],
    sentences: [["Ni irakaslea naiz.", "Yo soy profesor/a."], ["Zu medikua zara.", "Tú eres médico/a."], ["Ane sukaldaria da.", "Ane es cocinera."], ["Gu ikasleak gara.", "Nosotros somos estudiantes."], ["Zer zara? Diseinatzailea naiz.", "¿Qué eres? Soy diseñador/a."]],
    pattern: "Ni ___ naiz",
    tips: [{ t: "La -a final es el artículo", b: "irakasle + a = el/la profesor/a. En la frase va siempre con -a: Irakaslea naiz. En plural, -ak: irakasleak gara." }, { t: "Sin género", b: "La misma palabra vale para hombre y mujer: medikua es médico y médica." }],
    dialogue: [["A", "Zer zara?", "¿Qué eres?"], ["B", "Ni erizaina naiz. Eta zu?", "Yo soy enfermera. ¿Y tú?"], ["A", "Ni diseinatzailea naiz.", "Yo soy diseñadora."]]
  },
  {
    id: "l9", module: 2, title: "Nor, zer, zein", desc: "¿Quién? ¿Qué? ¿Cuál?", emoji: "❓", scene: { emoji: "🖼️", title: "Museoan · en el museo" },
    grid: { title: "Zer = qué (no sé qué es) · Zein = cuál (hay varios y hay que elegir)", cols: ["zer · qué", "zein · cuál"], rows: [["Zer da hau?", "Zein da zurea?"], ["¿qué es esto?", "¿cuál es el tuyo?"], ["Zer nahi duzu?", "Zein nahi duzu?"], ["¿qué quieres?", "¿cuál quieres?"], ["Zer liburu da?", "Zein liburu da?"], ["¿qué libro es?", "¿cuál libro es? (de estos)"]] },
    pairs: [["nor", "quién", "👤"], ["zer", "qué", "📦"], ["zein", "cuál", "👉"], ["Nor da?", "¿Quién es?", "👤"], ["Zer da hau?", "¿Qué es esto?", "📦"], ["Zein da zurea?", "¿Cuál es el tuyo?", "👉"], ["hau", "esto / este", "👇"], ["hori", "eso / ese", "👉"], ["hura", "aquello / aquel", "☝️"], ["Nor zara?", "¿Quién eres?", "❓"], ["Zer da?", "¿Qué es?", "❓"], ["Hau liburua da", "Esto es un libro", "📚"], ["Hori Ane da", "Esa es Ane", "👩"], ["zurea", "el tuyo / la tuya", "🫵"], ["nirea", "el mío / la mía", "🙋"], ["Zer nahi duzu?", "¿Qué quieres?", "🤲"], ["Zein nahi duzu?", "¿Cuál quieres? (de estos)", "👉"], ["Zein liburu da zurea?", "¿Cuál libro es el tuyo?", "📚"], ["Zer liburu da?", "¿Qué libro es?", "❓"], ["Nor da irakaslea?", "¿Quién es el profesor/a?", "👩‍🏫"], ["Zein da irakaslea?", "¿Cuál es el profesor/a? (de estas personas)", "👉"]],
    sentences: [["Nor da hura?", "¿Quién es aquel/aquella?"], ["Hura nire irakaslea da.", "Aquel/aquella es mi profesor/a."], ["Zer da hau?", "¿Qué es esto?"], ["Hau nire liburua da.", "Esto es mi libro."], ["Zein da zure kafea?", "¿Cuál es tu café?"], ["Hori nirea da.", "Ese es el mío."], ["Zer nahi duzu? Kafea.", "¿Qué quieres? Café."], ["Zein nahi duzu? Hori.", "¿Cuál quieres? Ese."]],
    pattern: "Zer da ___? · Zein da ___?",
    tips: [{ t: "Nor = persona, zer = cosa", b: "Nor da? (¿quién es?) se contesta con alguien: Ane da. Zer da? (¿qué es?) se contesta con algo: liburua da." }, { t: "Zer vs zein: ¿hay dónde elegir?", b: "Zer pregunta por algo que no conoces (zer da hau? → liburua da). Zein pregunta cuál de varios que ya tienes delante (zein da zurea? → hori). Truco: si la respuesta es señalar, es zein." }, { t: "Zein también con personas", b: "Nor da irakaslea? = ¿quién es (cómo se llama) el profesor? Zein da irakaslea? = ¿cuál de estos es el profesor? Zein vale para personas y cosas: lo que marca es la elección." }],
    dialogue: [["A", "Nor da hura?", "¿Quién es aquella?"], ["B", "Hura Miren da, nire irakaslea.", "Aquella es Miren, mi profesora."], ["A", "Eta zer da hau?", "¿Y qué es esto?"], ["B", "Hau nire liburua da.", "Esto es mi libro."], ["A", "Zein da zurea, hau ala hori?", "¿Cuál es el tuyo, este o ese?"], ["B", "Hori nirea da.", "Ese es el mío."]]
  },
  {
    id: "l10", module: 2, title: "Dónde vives y de dónde eres", desc: "Non bizi zara? Nongoa zara?", emoji: "🌍", scene: { emoji: "✈️", title: "Aireportuan · en el aeropuerto" },
    grid: { title: "Nongoa zara? (¿de dónde eres?) → lugar + -koa / -ekoa / -goa", cols: ["acaba en…", "ejemplo"], rows: [["vocal → -koa", "Bilbo → Bilbokoa"], ["consonante → -ekoa", "Madril → Madrilekoa"], ["-n → -goa", "Irun → Irungoa"], ["país en vocal → -koa", "Peru → Perukoa"]] },
    pairs: [["Non bizi zara?", "¿Dónde vives?", "🏠"], ["Ni Bilbon bizi naiz", "Yo vivo en Bilbao", "🏙️"], ["Ramon Londresen bizi da", "Ramón vive en Londres", "🇬🇧"], ["Nire osaba Ekuadorren bizi da", "Mi tío vive en Ecuador", "🇪🇨"], ["Gu Perun bizi gara", "Nosotros vivimos en Perú", "🇵🇪"], ["Nongoa zara?", "¿De dónde eres?", "🌍"], ["Ni bilbokoa naiz", "Yo soy de Bilbao", "🏙️"], ["Ni madrilekoa naiz", "Yo soy de Madrid", "🏛️"], ["Ane donostiakoa da", "Ane es de Donostia", "🏖️"], ["Jon irungoa da", "Jon es de Irun", "🌉"], ["Gu argentinakoak gara", "Nosotros somos de Argentina", "🇦🇷"], ["osaba", "tío", "👨"], ["izeba", "tía", "👩"], ["bizi naiz", "vivo", "🏠"], ["bizi da", "vive", "🏠"], ["bizi gara", "vivimos", "🏠"], ["Bilbon", "en Bilbao", "📍"], ["Londresen", "en Londres", "📍"], ["Perun", "en Perú", "📍"], ["Ekuadorren", "en Ecuador", "📍"]],
    sentences: [["Non bizi zara?", "¿Dónde vives?"], ["Ni Bilbon bizi naiz.", "Yo vivo en Bilbao."], ["Ramon Londresen bizi da.", "Ramón vive en Londres."], ["Nire osaba Ekuadorren bizi da.", "Mi tío vive en Ecuador."], ["Gu Perun bizi gara.", "Nosotros vivimos en Perú."], ["Nongoa zara?", "¿De dónde eres?"], ["Ni bilbokoa naiz.", "Yo soy de Bilbao."], ["Nongoa da Ane?", "¿De dónde es Ane?"], ["Ane madrilekoa da.", "Ane es de Madrid."]],
    pattern: "Ni ___n bizi naiz",
    tips: [{ t: "Vivir en: lugar + -n", b: "bizi naiz / bizi da / bizi gara. El lugar lleva -n (en): Bilbo → Bilbon, Peru → Perun. Si acaba en consonante, -en: Londres → Londresen, Ekuador → Ekuadorren." }, { t: "Ser de: lugar + -koa", b: "Bilbo → bilbokoa. Tras consonante, -ekoa: Madril → madrilekoa. Tras -n, -goa: Irun → irungoa. Los países van igual: Argentina → argentinakoa, Peru → perukoa." }, { t: "Nongoa vs non", b: "Nongoa zara? = ¿de dónde eres? (origen). Non bizi zara? = ¿dónde vives? (lugar actual)." }],
    dialogue: [["A", "Nongoa zara?", "¿De dónde eres?"], ["B", "Ni argentinakoa naiz, baina Bilbon bizi naiz. Eta zu?", "Yo soy de Argentina, pero vivo en Bilbao. ¿Y tú?"], ["A", "Ni irungoa naiz eta Donostian bizi naiz.", "Yo soy de Irun y vivo en Donostia."]]
  },
  {
    id: "l11", module: 2, title: "Familia", desc: "Ama, aita, gurasoak, seme-alabak…", emoji: "👨‍👩‍👧‍👦", scene: { emoji: "🏡", title: "Etxean · en casa" },
    pairs: [["ama", "madre", "👩"], ["aita", "padre", "👨"], ["gurasoak", "padres", "👫"], ["alaba", "hija", "👧"], ["semea", "hijo", "👦"], ["seme-alabak", "hijos (hijos e hijas)", "👧👦"], ["amona / amama", "abuela", "👵"], ["aitona / aitite", "abuelo", "👴"], ["aiton-amonak", "abuelos", "👴👵"], ["osaba", "tío", "🧔"], ["izeba / izeko", "tía", "👩‍🦱"], ["osaba-izebak", "tíos", "🧔👩‍🦱"], ["lehengusua", "primo", "🧑"], ["lehengusina", "prima", "👩"], ["emaztea", "mujer (esposa)", "💍"], ["senarra", "marido", "💍"], ["biloba", "nieto/a", "🧒"], ["iloba", "sobrino/a", "🧒"], ["mutil-laguna", "novio", "💑"], ["neska-laguna", "novia", "💑"], ["familia", "familia", "🏡"], ["neba", "hermano (dice una chica)", "👧➡️👦"], ["anaia", "hermano (dice un chico)", "👦➡️👦"], ["ahizpa", "hermana (dice una chica)", "👧➡️👧"], ["arreba", "hermana (dice un chico)", "👦➡️👧"]],
    sentences: [["Nire ama irakaslea da.", "Mi madre es profesora."], ["Nire gurasoak Bilbon bizi dira.", "Mis padres viven en Bilbao."], ["Nik osaba bat eta izeba bi dauzkat.", "Tengo un tío y dos tías."], ["Nire amona Donostian bizi da.", "Mi abuela vive en Donostia."], ["Zenbat lehengusu dituzu?", "¿Cuántos primos tienes?"], ["Nire senarra medikua da.", "Mi marido es médico."]],
    pattern: "Nire ___ ___ da",
    tips: [{ t: "Compuestos con guion = los dos juntos", b: "seme-alabak (hijos e hijas), aiton-amonak (abuelos y abuelas), osaba-izebak (tíos y tías), neba-arrebak / anai-arrebak (hermanos)." }, { t: "Dos formas, misma palabra", b: "amona = amama (abuela), aitona = aitite (abuelo), izeba = izeko (tía). Dependen de la zona; cualquiera vale." }, { t: "Para decir «mi»", b: "nire + palabra: nire ama, nire aita, nire gurasoak. El verbo al final: Nire ama irakaslea da." }],
    dialogue: [["A", "Nolakoa da zure familia?", "¿Cómo es tu familia?"], ["B", "Nire gurasoak Bilbon bizi dira eta ahizpa bat daukat.", "Mis padres viven en Bilbao y tengo una hermana."], ["A", "Eta aiton-amonak?", "¿Y los abuelos?"], ["B", "Nire amona Donostiakoa da. Aitona ez daukat.", "Mi abuela es de Donostia. Abuelo no tengo."]]
  },
  {
    id: "l12", module: 2, title: "Tener: ukan y eduki", desc: "dut / ditut · daukat / dauzkat", emoji: "✋", scene: { emoji: "🎒", title: "Ikastolan · en la escuela" },
    grid: { title: "Dos verbos para «tener»: ukan (dut) y eduki (daukat). Singular / plural", cols: ["ukan", "eduki"], rows: [["nik dut / ditut", "nik daukat / dauzkat"], ["zuk duzu / dituzu", "zuk daukazu / dauzkazu"], ["hark du / ditu", "hark dauka / dauzka"], ["guk dugu / ditugu", "guk daukagu / dauzkagu"], ["zuek duzue / dituzue", "zuek daukazue / dauzkazue"], ["haiek dute / dituzte", "haiek daukate / dauzkate"]] },
    pairs: [["nik", "yo (con tener)", "🙋"], ["zuk", "tú (con tener)", "👉"], ["hark", "él / ella (con tener)", "👤"], ["guk", "nosotros (con tener)", "👫"], ["zuek", "vosotros (con tener)", "👥"], ["haiek", "ellos (con tener)", "👨‍👩‍👧‍👦"], ["dut", "tengo (una cosa)", "1️⃣"], ["ditut", "tengo (varias)", "🔢"], ["duzu", "tienes (una)", "1️⃣"], ["dituzu", "tienes (varias)", "🔢"], ["du", "tiene (una)", "1️⃣"], ["ditu", "tiene (varias)", "🔢"], ["dugu", "tenemos (una)", "1️⃣"], ["ditugu", "tenemos (varias)", "🔢"], ["dute", "tienen (una)", "1️⃣"], ["dituzte", "tienen (varias)", "🔢"], ["daukat", "tengo (una) · eduki", "1️⃣"], ["dauzkat", "tengo (varias) · eduki", "🔢"], ["daukazu", "tienes (una) · eduki", "1️⃣"], ["dauka", "tiene (una) · eduki", "1️⃣"], ["daukagu", "tenemos (una) · eduki", "1️⃣"], ["daukate", "tienen (una) · eduki", "1️⃣"]],
    sentences: [["Nik neba bat dut.", "Yo tengo un hermano (dice una chica)."], ["Nik neba bat daukat.", "Yo tengo un hermano (eduki)."], ["Zuk bi ahizpa dituzu.", "Tú tienes dos hermanas."], ["Hark etxe bat dauka.", "Él/ella tiene una casa."], ["Guk txakur bat dugu.", "Nosotros tenemos un perro."], ["Haiek hiru seme-alaba dituzte.", "Ellos tienen tres hijos."], ["Zuek liburu asko dauzkazue.", "Vosotros tenéis muchos libros."], ["Nik lehengusu asko dauzkat.", "Tengo muchos primos."]],
    pattern: "Nik ___ dut · Nik ___ daukat",
    tips: [{ t: "Con «tener», el sujeto lleva -k", b: "ni → nik, zu → zuk, hura → hark, gu → guk, zuek → zuek, haiek → haiek. Nik neba bat dut. (Con ser/estar, sin -k: ni naiz, ni nago.)" }, { t: "Singular / plural en el verbo", b: "Una cosa: dut, daukat. Varias: ditut, dauzkat. Lo plural es lo que se tiene, no quien tiene: nik liburuak ditut." }, { t: "ukan y eduki significan lo mismo", b: "Nik neba bat dut = Nik neba bat daukat. Las dos formas son correctas; eduki es más habitual en la calle, ukan es la forma básica." }],
    dialogue: [["A", "Zenbat lehengusu dauzkazu?", "¿Cuántos primos tienes?"], ["B", "Sei dauzkat. Eta zuk?", "Tengo seis. ¿Y tú?"], ["A", "Nik bat bakarrik daukat.", "Yo tengo uno solo."], ["B", "Eta txakurrik baduzu?", "¿Y tienes perro?"], ["A", "Bai, txakur bat dut.", "Sí, tengo un perro."]]
  },
  {
    id: "l13", module: 2, title: "Preguntas: nor, zer, zein, non, nongoa, zenbat, norengana", desc: "Las palabras para preguntar", emoji: "❓", scene: { emoji: "🚉", title: "Geltokian · en la estación" },
    grid: { title: "Cada pregunta con su respuesta", cols: ["pregunta", "ejemplo"], rows: [["nor · quién", "Nor zara? → Ni Ane naiz."], ["zer · qué", "Zer da hau? → Liburua da."], ["zein · cuál", "Zein da zurea? → Hori."], ["non · dónde", "Non bizi zara? → Bilbon."], ["nongoa · de dónde", "Nongoa zara? → Bilbokoa."], ["zenbat · cuántos", "Zenbat urte dituzu? → Hogei."], ["norengana · a casa de quién / hacia quién", "Norengana zoaz? → Amarengana."]] },
    pairs: [["nor", "quién", "👤"], ["zer", "qué", "📦"], ["zein", "cuál", "👉"], ["non", "dónde", "📍"], ["nongoa", "de dónde", "🌍"], ["zenbat", "cuántos/as", "🔢"], ["norengana", "a casa de quién / hacia quién", "🏃"], ["Norengana zoaz?", "¿A casa de quién vas?", "🏃"], ["Amarengana noa", "Voy a casa de mi madre / hacia mi madre", "👩"], ["Aitarengana noa", "Voy a casa de mi padre", "👨"], ["Lagunarengana noa", "Voy a casa de un amigo", "🤝"], ["Medikuarengana noa", "Voy al médico", "🩺"], ["noa", "voy", "🏃"], ["zoaz", "vas", "🏃"], ["Non dago?", "¿Dónde está?", "📍"], ["Nor dago etxean?", "¿Quién está en casa?", "🏡"], ["Zenbat dira?", "¿Cuántos son? / ¿Cuánto es?", "💶"]],
    sentences: [["Nor zara?", "¿Quién eres?"], ["Zer da hau?", "¿Qué es esto?"], ["Zein da zurea?", "¿Cuál es el tuyo?"], ["Non bizi zara?", "¿Dónde vives?"], ["Nongoa zara?", "¿De dónde eres?"], ["Zenbat urte dituzu?", "¿Cuántos años tienes?"], ["Norengana zoaz?", "¿A casa de quién vas?"], ["Amarengana noa.", "Voy a casa de mi madre."], ["Medikuarengana noa.", "Voy al médico."]],
    pattern: "Norengana zoaz? → ___rengana noa",
    tips: [{ t: "La pregunta va al principio", b: "Nor, zer, zein, non, nongoa, zenbat, norengana: siempre primero, y el verbo justo detrás: Non bizi zara? Zenbat urte dituzu?" }, { t: "-rengana = hacia una persona", b: "Norengana? pregunta a casa de quién o hacia quién vas. La respuesta: persona + -(r)engana: ama → amarengana, aita → aitarengana, laguna → lagunarengana, medikua → medikuarengana." }, { t: "Non vs nongoa", b: "Non = dónde (estás, vives). Nongoa = de dónde (eres). Non bizi zara? Bilbon. Nongoa zara? Bilbokoa." }],
    dialogue: [["A", "Norengana zoaz?", "¿A casa de quién vas?"], ["B", "Amarengana noa. Eta zu, non bizi zara?", "Voy a casa de mi madre. Y tú, ¿dónde vives?"], ["A", "Donostian. Zenbat urte dauzka zure amak?", "En Donostia. ¿Cuántos años tiene tu madre?"], ["B", "Hirurogei.", "Sesenta."]]
  },
  {
    id: "l14", module: 3, title: "La casa y sus habitaciones", desc: "Etxea, pisua, logela, sukaldea…", emoji: "🏠", scene: { emoji: "🏠", title: "Etxe berrian · en la casa nueva" },
    pairs: [["etxea", "casa", "🏠"], ["pisua", "piso", "🏢"], ["gela", "habitación", "🚪"], ["logela", "dormitorio", "🛏️"], ["sukaldea", "cocina", "🍳"], ["egongela", "salón", "🛋️"], ["komuna", "baño (váter)", "🚽"], ["bainugela", "cuarto de baño", "🛁"], ["balkoia", "balcón", "🌿"], ["atea", "puerta", "🚪"], ["leihoa", "ventana", "🪟"], ["korridorea", "pasillo", "➡️"], ["handia", "grande", "🐘"], ["txikia", "pequeño/a", "🐭"], ["argia", "luminoso/a", "☀️"]],
    sentences: [["Pisu batean bizi naiz.", "Vivo en un piso."], ["Etxe batean bizi naiz.", "Vivo en una casa."], ["Nire etxea txikia da.", "Mi casa es pequeña."], ["Etxeak hiru gela ditu.", "La casa tiene tres habitaciones."], ["Nire pisuak bi logela ditu.", "Mi piso tiene dos dormitorios."], ["Sukaldea handia da.", "La cocina es grande."], ["Egongela oso argia da.", "El salón es muy luminoso."], ["Balkoia dauka.", "Tiene balcón."], ["Ez du balkoirik.", "No tiene balcón."], ["Non dago komuna?", "¿Dónde está el baño?"], ["Komuna hor dago.", "El baño está ahí."]],
    pattern: "Nire etxeak ___ ditu",
    tips: [{ t: "Tener con -k en el sujeto", b: "Etxeak hiru gela ditu: la casa (etxea + -k) tiene (ditu, plural) tres habitaciones. Con una sola cosa: Pisuak balkoi bat du." }, { t: "No tener: ez du … -rik", b: "Ez du balkoirik = no tiene balcón. En negativo la cosa que no se tiene lleva -rik y el verbo va justo detrás de ez." }, { t: "Dónde está: egon", b: "Non dago komuna? Komuna hor dago. Para lugares y estados se usa egon (dago), no izan (da)." }],
    dialogue: [["A", "Non bizi zara, pisu batean?", "¿Dónde vives, en un piso?"], ["B", "Bai, pisu txiki batean bizi naiz. Bi logela ditu.", "Sí, vivo en un piso pequeño. Tiene dos dormitorios."], ["A", "Eta balkoia?", "¿Y balcón?"], ["B", "Ez, ez du balkoirik, baina egongela oso argia da.", "No, no tiene balcón, pero el salón es muy luminoso."]]
  },
  {
    id: "l15", module: 3, title: "Muebles y objetos: ba al dago?", desc: "Non dago? Gainean, azpian, ondoan…", emoji: "🛋️", scene: { emoji: "📦", title: "Etxe aldaketan · en la mudanza" },
    grid: { title: "Dónde está: cosa + -(r)en + posposición + dago", cols: ["euskera", "castellano"], rows: [["gainean", "encima"], ["azpian", "debajo"], ["ondoan", "al lado"], ["aurrean", "delante"], ["atzean", "detrás"], ["barruan", "dentro"]] },
    pairs: [["mahaia", "mesa", "🪑"], ["aulkia", "silla", "💺"], ["ohea", "cama", "🛏️"], ["armairua", "armario", "🚪"], ["sofa", "sofá", "🛋️"], ["telebista", "televisión", "📺"], ["lanpara", "lámpara", "💡"], ["hozkailua", "nevera", "🧊"], ["apalategia", "estantería", "📚"], ["ispilua", "espejo", "🪞"], ["landarea", "planta", "🪴"], ["katua", "gato", "🐈"], ["gainean", "encima", "⬆️"], ["azpian", "debajo", "⬇️"], ["ondoan", "al lado", "↔️"]],
    sentences: [["Mahaia sukaldean dago.", "La mesa está en la cocina."], ["Liburua mahaiaren gainean dago.", "El libro está encima de la mesa."], ["Katua ohearen azpian dago.", "El gato está debajo de la cama."], ["Lanpara sofaren ondoan dago.", "La lámpara está al lado del sofá."], ["Ispilua atearen atzean dago.", "El espejo está detrás de la puerta."], ["Landarea leihoaren aurrean dago.", "La planta está delante de la ventana."], ["Aulkiak sukaldean daude.", "Las sillas están en la cocina."], ["Ba al dago telebistarik?", "¿Hay televisión?"], ["Bai, badago.", "Sí, hay."], ["Ez, ez dago telebistarik.", "No, no hay televisión."], ["Non dago armairua?", "¿Dónde está el armario?"], ["Armairua logelan dago.", "El armario está en el dormitorio."]],
    pattern: "___ ___ren gainean dago",
    tips: [{ t: "De la mesa: -(r)en", b: "mahaia → mahaiaren gainean (encima de la mesa), ohea → ohearen azpian. La cosa de referencia lleva -ren (o -en tras consonante) y después la posposición." }, { t: "¿Hay…? Ba al dago …-rik?", b: "Ba al dago telebistarik? = ¿hay televisión? Se responde Bai, badago o Ez, ez dago telebistarik. En preguntas y negaciones la cosa lleva -rik." }, { t: "dago / daude", b: "Una cosa: Mahaia sukaldean dago. Varias: Aulkiak sukaldean daude. Igual que da / dira." }],
    dialogue: [["A", "Ba al dago hozkailurik?", "¿Hay nevera?"], ["B", "Bai, badago. Sukaldean dago, leihoaren ondoan.", "Sí, hay. Está en la cocina, al lado de la ventana."], ["A", "Eta telebista?", "¿Y televisión?"], ["B", "Ez, ez dago telebistarik. Liburuak bai, asko!", "No, no hay televisión. Libros sí, ¡muchos!"]]
  },
  {
    id: "l16", module: 3, title: "El barrio: tiendas y servicios", desc: "Auzoa, okindegia, farmazia, taberna…", emoji: "🏘️", scene: { emoji: "🏘️", title: "Auzoan · en el barrio" },
    pairs: [["auzoa", "barrio", "🏘️"], ["kalea", "calle", "🛣️"], ["plaza", "plaza", "⛲"], ["denda", "tienda", "🏪"], ["okindegia", "panadería", "🥖"], ["farmazia", "farmacia", "💊"], ["supermerkatua", "supermercado", "🛒"], ["taberna", "bar", "🍺"], ["jatetxea", "restaurante", "🍽️"], ["liburutegia", "biblioteca", "📚"], ["parkea", "parque", "🌳"], ["geltokia", "estación / parada", "🚉"], ["udaletxea", "ayuntamiento", "🏛️"], ["ospitalea", "hospital", "🏥"], ["gertu", "cerca", "📍"], ["urrun", "lejos", "🔭"]],
    sentences: [["Nire auzoan okindegi bat dago.", "En mi barrio hay una panadería."], ["Farmazia kalearen bukaeran dago.", "La farmacia está al final de la calle."], ["Ba al dago supermerkaturik hemen?", "¿Hay supermercado aquí?"], ["Taberna plazan dago.", "El bar está en la plaza."], ["Bi taberna daude plazan.", "Hay dos bares en la plaza."], ["Liburutegia udaletxearen ondoan dago.", "La biblioteca está al lado del ayuntamiento."], ["Parke handi bat dago etxetik gertu.", "Hay un parque grande cerca de casa."], ["Geltokia urrun dago.", "La estación está lejos."], ["Ospitalea gertu dago.", "El hospital está cerca."], ["Zer dago zure auzoan?", "¿Qué hay en tu barrio?"]],
    pattern: "Nire auzoan ___ bat dago",
    tips: [{ t: "Hay = dago / daude", b: "Okindegi bat dago = hay una panadería. Bi taberna daude = hay dos bares. No hay un verbo «haber»: es egon con lo que hay como sujeto." }, { t: "Cerca y lejos", b: "gertu (cerca) y urrun (lejos) van con dago: Geltokia urrun dago. Cerca de algo: etxetik gertu (de casa, -tik)." }, { t: "Al lado del ayuntamiento", b: "udaletxea → udaletxearen ondoan. Misma regla que con los muebles: -(r)en + posposición." }],
    dialogue: [["A", "Zer dago zure auzoan?", "¿Qué hay en tu barrio?"], ["B", "Denda asko daude: okindegia, farmazia eta supermerkatu bat.", "Hay muchas tiendas: panadería, farmacia y un supermercado."], ["A", "Eta tabernarik?", "¿Y bares?"], ["B", "Bai, taberna bat plazan, oso polita.", "Sí, un bar en la plaza, muy bonito."]]
  },
  {
    id: "l17", module: 3, title: "Direcciones: nora, nondik", desc: "Nora zoaz? Etxera noa. Ezkerrera, eskuinera", emoji: "🧭", scene: { emoji: "🗺️", title: "Kalean galduta · perdido por la calle" },
    grid: { title: "Ir y venir: joan y etorri (formas cortas)", cols: ["joan · ir", "etorri · venir"], rows: [["ni", "noa", "nator"], ["zu", "zoaz", "zatoz"], ["hura", "doa", "dator"]] },
    pairs: [["Nora zoaz?", "¿Adónde vas?", "🧭"], ["noa", "voy", "🚶"], ["zoaz", "vas", "🚶"], ["Nondik zatoz?", "¿De dónde vienes?", "↩️"], ["nator", "vengo", "🔙"], ["eskuinera", "a la derecha", "➡️"], ["ezkerrera", "a la izquierda", "⬅️"], ["zuzen", "recto", "⬆️"], ["hemen", "aquí", "📍"], ["hor", "ahí", "👉"], ["han", "allí", "🔭"], ["barkatu", "perdona", "🙏"], ["mesedez", "por favor", "🙏"]],
    sentences: [["Nora zoaz?", "¿Adónde vas?"], ["Etxera noa.", "Voy a casa."], ["Lanera noa.", "Voy al trabajo."], ["Supermerkatura noa.", "Voy al supermercado."], ["Bilbora noa.", "Voy a Bilbao."], ["Nondik zatoz?", "¿De dónde vienes?"], ["Etxetik nator.", "Vengo de casa."], ["Lanetik nator.", "Vengo del trabajo."], ["Bilbotik nator.", "Vengo de Bilbao."], ["Barkatu, non dago geltokia?", "Perdona, ¿dónde está la estación?"], ["Zuzen joan eta gero ezkerrera.", "Sigue recto y luego a la izquierda."], ["Farmazia eskuinean dago.", "La farmacia está a la derecha."], ["Han dago, urrun.", "Está allí, lejos."], ["Ez horregatik.", "De nada."]],
    pattern: "___ra noa · ___tik nator",
    tips: [{ t: "Adónde: -ra", b: "etxea → etxera, lana → lanera, Bilbo → Bilbora. Tras consonante, -era: Madril → Madrilera, Irun → Irunera." }, { t: "De dónde: -tik", b: "etxetik, lanetik, Bilbotik. Tras -n o -l es -dik: Irundik, Madrildik. Nondik zatoz? Etxetik nator." }, { t: "Ir y venir sin auxiliar", b: "joan y etorri tienen formas cortas: noa (voy), zoaz (vas), doa (va); nator (vengo), zatoz (vienes), dator (viene). Etxera noa, no «etxera joaten naiz»." }],
    dialogue: [["A", "Barkatu, non dago geltokia?", "Perdona, ¿dónde está la estación?"], ["B", "Zuzen joan, eta gero eskuinera. Bost minutu.", "Sigue recto, y luego a la derecha. Cinco minutos."], ["A", "Eskerrik asko!", "¡Muchas gracias!"], ["B", "Ez horregatik.", "De nada."]]
  },
  {
    id: "l18", module: 3, title: "Describir lugares", desc: "Nolakoa da? Handia, polita, lasaia, garestia…", emoji: "🏞️", scene: { emoji: "🏖️", title: "Herrian · en el pueblo" },
    pairs: [["Nolakoa da?", "¿Cómo es?", "❓"], ["handia", "grande", "🐘"], ["txikia", "pequeño/a", "🐭"], ["polita", "bonito/a", "🌸"], ["itsusia", "feo/a", "🪨"], ["zaharra", "viejo/a", "🏚️"], ["berria", "nuevo/a", "✨"], ["garbia", "limpio/a", "🧼"], ["zikina", "sucio/a", "🧹"], ["lasaia", "tranquilo/a", "😌"], ["zaratatsua", "ruidoso/a", "📢"], ["iluna", "oscuro/a", "🌑"], ["merkea", "barato/a", "💶"], ["garestia", "caro/a", "💎"], ["hondartza", "playa", "🏖️"], ["herria", "pueblo", "🏘️"], ["hiria", "ciudad", "🏙️"]],
    sentences: [["Nolakoa da zure etxea?", "¿Cómo es tu casa?"], ["Oso argia da.", "Es muy luminosa."], ["Nire auzoa lasaia da.", "Mi barrio es tranquilo."], ["Kalea zaratatsua da.", "La calle es ruidosa."], ["Etxea zaharra baina polita da.", "La casa es vieja pero bonita."], ["Hiria handia eta garestia da.", "La ciudad es grande y cara."], ["Herria txikia eta lasaia da.", "El pueblo es pequeño y tranquilo."], ["Taberna merkea da.", "El bar es barato."], ["Hondartza bat dago.", "Hay una playa."], ["Nahiko merkea da.", "Es bastante barato."], ["Pisuak garestiak dira.", "Los pisos son caros."]],
    pattern: "___ ___a da",
    tips: [{ t: "¿Cómo es? Nolakoa da?", b: "La respuesta es adjetivo + -a + da: Etxea handia da, Auzoa lasaia da. El adjetivo va después del nombre y lleva el artículo." }, { t: "Pero y y", b: "baina = pero, eta = y: zaharra baina polita, handia eta garestia. Solo el último adjetivo suele llevar el verbo da." }, { t: "Muy y bastante", b: "oso = muy, nahiko = bastante, delante del adjetivo: oso polita, nahiko merkea. En plural: pisuak garestiak dira." }],
    dialogue: [["A", "Nolakoa da zure herria?", "¿Cómo es tu pueblo?"], ["B", "Txikia eta lasaia. Hondartza bat dago.", "Pequeño y tranquilo. Hay una playa."], ["A", "Eta garestia da?", "¿Y es caro?"], ["B", "Ez, nahiko merkea da.", "No, es bastante barato."]]
  }
];

// Pistas de "noticing": cuando fallas, se muestra la que coincide con la forma correcta.


// Fichas de gramática. Cada una: patrón con piezas, ejemplos de las lecciones y un ejercicio de transformación.
// pieces: [{t: texto, k: tipo}] tipo = "subj" | "obj" | "verb" | "neg" | "num" | "q"
// drills: [{from, to, instr}] -> el usuario transforma `from` según `instr`; se corrige contra `to`
window.NOTES = [
  { m: /zaizkit/i, t: "zaizkit = me gustAN (varias cosas). Fíjate en la -k del plural: liburuak, pintxoak." },
  { m: /\bzait\b/i, t: "zait = me gustA (una cosa). Si fuera plural sería zaizkit." },
  { m: /\bez zait|ez zaizkit|ez dut/i, t: "El negativo ez va justo delante del verbo auxiliar: ez zait, ez dut." },
  { m: /urte ditut/i, t: "Los años son varios: ditut (los tengo), no dut." },
  { m: /urte ditu\b/i, t: "ditu = los tiene (otra persona). ditut = los tengo (yo)." },
  { m: /\bditut\b/i, t: "ditut = tengo varios/as. Con uno solo es dut: ahizpa bat dut." },
  { m: /\bbat dut\b/i, t: "dut = tengo (uno). Con dos o más cambia a ditut." },
  { m: /hogeita/i, t: "hogeita = 20 y… Del 21 al 39 todo empieza por hogeita." },
  { m: /berrogeita/i, t: "berrogeita = 40 y… (berrogei = 2 × 20)." },
  { m: /hirurogei/i, t: "hirurogei = 3 × 20 = 60. El euskera cuenta de 20 en 20." },
  { m: /\bnaiz\b/i, t: "naiz = soy. Va al final: Ni Ane naiz." },
  { m: /\bda\b/i, t: "da = es. Nire izena Ane da (mi nombre Ane es)." },
  { m: /\bnago\b/i, t: "nago = estoy. Ondo nago, nekatuta nago." },
  { m: /\bneba\b|\bahizpa\b/i, t: "neba y ahizpa son las palabras que usa una CHICA para hermano y hermana." },
  { m: /\banaia\b|\barreba\b/i, t: "anaia y arreba son las palabras que usa un CHICO para hermano y hermana." },
  { m: /-arrebak/i, t: "neba-arrebak (dice ella) / anai-arrebak (dice él) = hermanos en general." },
  { m: /\bon\b/i, t: "on = bueno. egun on, arratsalde on, gabon (gau + on)." },
  { m: /eskerrik asko/i, t: "eskerrik asko = gracias (literalmente «muchas gracias»)." },
  { m: /eta zu\??$/i, t: "Eta zu? = ¿y tú? Devuelve la pregunta para seguir la conversación." },
  { m: /\bgara\b/i, t: "gara = somos (gu). ni naiz · zu zara · hura da · gu gara · zuek zarete · haiek dira." },
  { m: /\bzarete\b/i, t: "zarete = sois (zuek). Ojo: zara es «tú eres», zarete «vosotros sois»." },
  { m: /\bdira\b/i, t: "dira = son (haiek). da es «es» (uno), dira «son» (varios)." },
  { m: /\bgaude\b/i, t: "gaude = estamos (gu). ni nago · zu zaude · hura dago · gu gaude · zuek zaudete · haiek daude." },
  { m: /\bzaudete\b/i, t: "zaudete = estáis (zuek)." },
  { m: /\bdaude\b/i, t: "daude = están (haiek). dago es «está» (uno)." },
  { m: /\bdago\b/i, t: "dago = está (hura). Para cómo está o dónde está; para lo que es, se usa da." },
  { m: /bizi (naiz|da|gara|zara|zarete|dira)/i, t: "Vivir = bizi + ser: bizi naiz, bizi da, bizi gara. El lugar lleva -n: Bilbon, Perun; tras consonante -en: Londresen." },
  { m: /\b\w+(en|n) bizi/i, t: "El lugar donde vives lleva -n (en): Bilbo → Bilbon. Si acaba en consonante, -en: Ekuador → Ekuadorren." },
  { m: /\w+ekoa\b/i, t: "-ekoa = «de» tras consonante: Madril → madrilekoa." },
  { m: /\w+goa\b/i, t: "-goa = «de» tras -n: Irun → irungoa." },
  { m: /\w+koa\b/i, t: "-koa = «de» tras vocal: Bilbo → bilbokoa. Plural: -koak (gu bilbokoak gara)." },
  { m: /^nongoa/i, t: "Nongoa? = ¿de dónde (eres)? Se responde con -koa/-ekoa/-goa. Non? es «dónde» (vives)." },
  { m: /^non bizi/i, t: "Non bizi zara? = ¿dónde vives? Se responde con lugar + -n + bizi naiz." },
  { m: /^nor /i, t: "nor = quién (personas). Para cosas se usa zer." },
  { m: /^zer da/i, t: "zer = qué (cosas). Para personas se usa nor." },
  { m: /^zein/i, t: "zein = cuál: hay varios delante y hay que elegir (Zein da zurea? → hori). Si no hay dónde elegir, es zer." },
  { m: /^zer nahi|^zer liburu/i, t: "zer = qué, en general, sin un grupo del que elegir. Para «cuál de estos» se usa zein." },
  { m: /\b(daukat|daukazu|dauka|daukagu|daukazue|daukate)\b/i, t: "eduki = tener (una cosa): nik daukat, zuk daukazu, hark dauka, guk daukagu, zuek daukazue, haiek daukate. Significa lo mismo que dut." },
  { m: /\b(dauzkat|dauzkazu|dauzka|dauzkagu|dauzkazue|dauzkate)\b/i, t: "dauzka- = tener VARIAS cosas (eduki plural): nik dauzkat, zuk dauzkazu, hark dauzka… Una sola cosa: daukat." },
  { m: /\b(duzu|du|dugu|duzue|dute)\b/i, t: "ukan = tener (una cosa): nik dut, zuk duzu, hark du, guk dugu, zuek duzue, haiek dute. Varias: ditut, dituzu, ditu, ditugu, dituzue, dituzte." },
  { m: /\b(dituzu|ditu|ditugu|dituzue|dituzte)\b/i, t: "ditu- = tener VARIAS cosas (ukan plural). Una sola: dut, duzu, du…" },
  { m: /^(nik|zuk|hark|guk|haiek)\b/i, t: "Con «tener» (ukan/eduki) el sujeto lleva -k: nik, zuk, hark, guk, zuek, haiek. Con ser/estar, sin -k: ni, zu, hura, gu." },
  { m: /rengana\b/i, t: "-(r)engana = hacia una persona / a casa de: ama → amarengana, aita → aitarengana, laguna → lagunarengana. Responde a norengana?" },
  { m: /^norengana/i, t: "Norengana? = ¿a casa de quién? / ¿hacia quién? Se responde con persona + -rengana: amarengana." },
  { m: /^non /i, t: "non = dónde (estás, vives). Para «de dónde eres» es nongoa." },
  { m: /(seme-alabak|aiton-amonak|osaba-izebak)/i, t: "Compuesto con guion = los dos juntos: seme-alabak (hijos e hijas), aiton-amonak (abuelos), osaba-izebak (tíos)." },
  { m: /(irakasle|ikasle|mediku|erizain|sukaldari|zerbitzari|abokatu|arkitekto|ingeniari|diseinatzaile|dendari)a\b/i, t: "La profesión lleva -a (artículo) en la frase: irakaslea naiz. En plural, -ak: irakasleak gara." },
  { m: /ren gainean|ren azpian|ren ondoan|ren aurrean|ren atzean|ren barruan/i, t: "La cosa de referencia lleva -(r)en y después la posposición: mahaia → mahaiaren gainean, ohea → ohearen azpian." },
  { m: /\bbadago\b/i, t: "badago = sí hay / sí está. Es ba- + dago, se escribe junto. Para negar: ez dago …-rik." },
  { m: /ez dago \w+rik/i, t: "No hay: ez dago + cosa con -rik: ez dago telebistarik. La -rik solo aparece en negaciones y preguntas." },
  { m: /ba al dago/i, t: "¿Hay…? = Ba al dago …-rik? La cosa lleva -rik en la pregunta." },
  { m: /\bdaude\b/i, t: "daude = están (varios). Para uno solo: dago. Aulkiak sukaldean daude." },
  { m: /\bditu\b.*gela|gela ditu/i, t: "Etxeak … ditu: con «tener» el sujeto lleva -k (etxea → etxeak) y el verbo es plural si son varias cosas." },
  { m: /ez du \w+rik/i, t: "No tener: ez du + cosa con -rik: ez du balkoirik." },
  { m: /\bnoa\b/i, t: "noa = voy (forma corta de joan). Adónde lleva -ra: etxera noa." },
  { m: /\bnator\b/i, t: "nator = vengo (forma corta de etorri). De dónde lleva -tik: etxetik nator." },
  { m: /\bzoaz\b/i, t: "zoaz = vas. noa (voy), zoaz (vas), doa (va)." },
  { m: /\bzatoz\b/i, t: "zatoz = vienes. nator (vengo), zatoz (vienes), dator (viene)." },
  { m: /tik nator|tik zatoz|tik dator/i, t: "De dónde: -tik tras vocal (Bilbotik); -dik tras -n o -l (Irundik, Madrildik)." },
  { m: /ra noa|ra zoaz|ra doa/i, t: "Adónde: -ra (etxera, Bilbora); tras consonante -era (Madrilera)." },
  { m: /eskuinera|ezkerrera/i, t: "eskuinera = a la derecha, ezkerrera = a la izquierda (con -ra, hacia). Está a la derecha: eskuinean dago." },
  { m: /nolakoa/i, t: "Nolakoa da? = ¿cómo es? Se responde con adjetivo + -a + da: Etxea handia da." },
  { m: /\bgarestiak dira|lasaiak dira|handiak dira|txikiak dira/i, t: "En plural el adjetivo también lleva -ak y el verbo es dira: pisuak garestiak dira." },
  { m: /\bnahiko\b/i, t: "nahiko = bastante, delante del adjetivo: nahiko merkea." },
  { m: /\bgertu\b|\burrun\b/i, t: "gertu = cerca, urrun = lejos; van con dago: Geltokia urrun dago." }
];

// Fichas de gramática. Cada una: patrón con piezas, ejemplos de las lecciones y un ejercicio de transformación.
// pieces: [{t: texto, k: tipo}] tipo = "subj" | "obj" | "verb" | "neg" | "num" | "q"
// drills: [{from, to, instr}] -> el usuario transforma `from` según `instr`; se corrige contra `to`
window.GRAMMAR = [
  {
    id: "g-naiz", title: "Ser: naiz / da", lessons: ["l2", "l6"], emoji: "🧩",
    summary: "El verbo va al FINAL. naiz = soy, da = es, zara = eres.",
    pieces: [{ t: "Ni", k: "subj" }, { t: "Ane", k: "obj" }, { t: "naiz", k: "verb" }],
    table: { cols: ["euskera", "castellano"], rows: [["ni … naiz", "yo soy"], ["zu … zara", "tú eres"], ["hura … da", "él/ella es"]] },
    examples: [["Ni Mikel naiz.", "Yo soy Mikel."], ["Nire izena Ane da.", "Mi nombre es Ane."], ["Ni neska naiz.", "Yo soy chica."]],
    drills: [{ from: "Ni Ane naiz.", to: "Zu Ane zara.", instr: "Cámbialo a «tú»" }, { from: "Ni Mikel naiz.", to: "Nire izena Mikel da.", instr: "Dilo con «nire izena … da»" }, { from: "Zu Jon zara.", to: "Ni Jon naiz.", instr: "Cámbialo a «yo»" }]
  },
  {
    id: "g-nago", title: "Estar: nago", lessons: ["l3"], emoji: "📍",
    summary: "Estados y ánimo van con nago (estoy), zaude (estás), dago (está). El adjetivo delante.",
    pieces: [{ t: "Oso", k: "q" }, { t: "ondo", k: "obj" }, { t: "nago", k: "verb" }],
    table: { cols: ["euskera", "castellano"], rows: [["… nago", "estoy"], ["… zaude", "estás"], ["… dago", "está"]] },
    examples: [["Ondo nago.", "Estoy bien."], ["Nekatuta nago.", "Estoy cansado/a."], ["Zer moduz zaude?", "¿Cómo estás?"]],
    drills: [{ from: "Ondo nago.", to: "Ondo zaude.", instr: "Cámbialo a «tú»" }, { from: "Nekatuta nago.", to: "Oso nekatuta nago.", instr: "Añade «muy»" }, { from: "Gaizki zaude.", to: "Gaizki nago.", instr: "Cámbialo a «yo»" }]
  },
  {
    id: "g-dut", title: "Tener: dut / ditut", lessons: ["l4", "l6"], emoji: "✋",
    summary: "dut = tengo UNA cosa. ditut = tengo VARIAS. El número va detrás del nombre: ahizpa bat, neba bi.",
    pieces: [{ t: "neba", k: "obj" }, { t: "bi", k: "num" }, { t: "ditut", k: "verb" }],
    table: { cols: ["singular", "plural"], rows: [["dut (tengo)", "ditut (tengo)"], ["duzu (tienes)", "dituzu (tienes)"], ["du (tiene)", "ditu (tiene)"]] },
    examples: [["Ahizpa bat dut.", "Tengo una hermana."], ["Hogei urte ditut.", "Tengo veinte años."], ["Zenbat urte dituzu?", "¿Cuántos años tienes?"]],
    drills: [{ from: "Ahizpa bat dut.", to: "Ahizpa bi ditut.", instr: "Ahora son dos" }, { from: "Neba bi ditut.", to: "Neba bat dut.", instr: "Ahora es uno" }, { from: "Hogei urte ditut.", to: "Hogei urte ditu.", instr: "Dilo de otra persona (él/ella)" }, { from: "Hamar urte ditu.", to: "Hamar urte dituzu.", instr: "Pregunta/di «tú tienes»" }]
  },
  {
    id: "g-zait", title: "Gustar: zait / zaizkit", lessons: ["l5"], emoji: "❤️",
    summary: "Como en castellano, lo que gusta es el sujeto: zait si es UNA cosa, zaizkit si son VARIAS (-k = plural).",
    pieces: [{ t: "Liburuak", k: "obj" }, { t: "gustatzen", k: "verb" }, { t: "zaizkit", k: "verb" }],
    table: { cols: ["una cosa", "varias"], rows: [["gustatzen zait", "gustatzen zaizkit"], ["(me gusta)", "(me gustan)"], ["gustatzen zaizu", "gustatzen zaizkizu"], ["(te gusta)", "(te gustan)"]] },
    examples: [["Musika gustatzen zait.", "Me gusta la música."], ["Pintxoak gustatzen zaizkit.", "Me gustan los pintxos."], ["Zer gustatzen zaizu?", "¿Qué te gusta?"]],
    drills: [{ from: "Liburua gustatzen zait.", to: "Liburuak gustatzen zaizkit.", instr: "Ponlo en plural" }, { from: "Pintxoak gustatzen zaizkit.", to: "Pintxoa gustatzen zait.", instr: "Ponlo en singular" }, { from: "Musika gustatzen zait.", to: "Musika gustatzen zaizu.", instr: "Dilo de «tú» (te gusta)" }]
  },
  {
    id: "g-ez", title: "Negación: ez", lessons: ["l5", "l6"], emoji: "🚫",
    summary: "ez va delante del verbo auxiliar, y el resto de la frase se mueve detrás.",
    pieces: [{ t: "Ez", k: "neg" }, { t: "zait", k: "verb" }, { t: "gustatzen", k: "verb" }, { t: "hotza", k: "obj" }],
    examples: [["Ez zait gustatzen hotza.", "No me gusta el frío."], ["Ez dut anai-arrebarik.", "No tengo hermanos."], ["Ez zaizkit gustatzen goizak.", "No me gustan las mañanas."]],
    drills: [{ from: "Hotza gustatzen zait.", to: "Ez zait gustatzen hotza.", instr: "Ponlo en negativo" }, { from: "Kirola gustatzen zait.", to: "Ez zait gustatzen kirola.", instr: "Ponlo en negativo" }, { from: "Ez zait gustatzen zinema.", to: "Zinema gustatzen zait.", instr: "Ponlo en afirmativo" }]
  },
  {
    id: "g-plural", title: "Plural: -k", lessons: ["l5", "l6"], emoji: "👥",
    summary: "El plural se marca con -k al final (y -ak si la palabra acaba en consonante). Hace cambiar el verbo: zait→zaizkit, dut→ditut.",
    pieces: [{ t: "liburu", k: "obj" }, { t: "-ak", k: "num" }],
    table: { cols: ["singular", "plural"], rows: [["liburua (el libro)", "liburuak (los libros)"], ["pintxoa", "pintxoak"], ["neba", "nebak"], ["ahizpa", "ahizpak"]] },
    examples: [["Liburuak gustatzen zaizkit.", "Me gustan los libros."], ["Neba-arrebak ditut.", "Tengo hermanos (dice ella)."]],
    drills: [{ from: "neba", to: "nebak", instr: "Plural" }, { from: "pintxoa", to: "pintxoak", instr: "Plural" }, { from: "ahizpak", to: "ahizpa", instr: "Singular" }]
  },
  {
    id: "g-hogei", title: "Números de 20 en 20", lessons: ["l4"], emoji: "🔢",
    summary: "El euskera cuenta en base 20: 30 = hogeita hamar (20 y 10), 42 = berrogeita bi (40 y 2). «-ta» une la veintena con el resto.",
    pieces: [{ t: "berrogei", k: "num" }, { t: "ta", k: "neg" }, { t: "bi", k: "num" }],
    table: { cols: ["veintena", "ejemplo"], rows: [["hogei (20)", "hogeita bost = 25"], ["berrogei (40)", "berrogeita hamar = 50"], ["hirurogei (60)", "hirurogeita bat = 61"], ["laurogei (80)", "laurogeita bi = 82"]] },
    examples: [["Hogeita hamar urte ditut.", "Tengo treinta años."], ["Berrogeita bi.", "Cuarenta y dos."]],
    drills: [{ from: "hogeita bi", to: "hogeita hiru", instr: "Suma uno (23)" }, { from: "hogeita hamar", to: "berrogeita hamar", instr: "Suma veinte (50)" }, { from: "berrogei", to: "hirurogei", instr: "Suma veinte (60)" }, { from: "hamabost", to: "hogeita hamabost", instr: "Suma veinte (35)" }]
  },
  {
    id: "g-galdera", title: "Preguntas: zer, nola, zenbat", lessons: ["l2", "l3", "l4", "l5"], emoji: "❓",
    summary: "La palabra interrogativa va al principio y el verbo justo detrás: Zer moduz? Nola duzu izena? Zenbat urte dituzu?",
    pieces: [{ t: "Zenbat", k: "q" }, { t: "urte", k: "obj" }, { t: "dituzu", k: "verb" }],
    table: { cols: ["palabra", "significa"], rows: [["zer", "qué"], ["nola", "cómo"], ["zenbat", "cuánto/s"], ["zein", "cuál"], ["nor", "quién"]] },
    examples: [["Zer gustatzen zaizu?", "¿Qué te gusta?"], ["Nola duzu izena?", "¿Cómo te llamas?"], ["Zenbat urte dituzu?", "¿Cuántos años tienes?"], ["Nor zara?", "¿Quién eres?"]],
    drills: [{ from: "Hogei urte ditut.", to: "Zenbat urte dituzu?", instr: "Haz la pregunta que provoca esta respuesta" }, { from: "Musika gustatzen zait.", to: "Zer gustatzen zaizu?", instr: "Haz la pregunta" }, { from: "Ni Ane naiz.", to: "Nor zara?", instr: "Haz la pregunta con «nor»" }]
  },
  {
    id: "g-izan", title: "Ser: toda la tabla (izan)", lessons: ["l7", "l8"], emoji: "👥",
    summary: "naiz, zara, da, gara, zarete, dira. El pronombre es opcional porque el verbo ya dice quién.",
    pieces: [{ t: "Gu", k: "subj" }, { t: "ikasleak", k: "obj" }, { t: "gara", k: "verb" }],
    table: { cols: ["pronombre", "izan"], rows: [["ni", "naiz"], ["zu", "zara"], ["hura", "da"], ["gu", "gara"], ["zuek", "zarete"], ["haiek", "dira"]] },
    examples: [["Gu lagunak gara.", "Somos amigos."], ["Zuek ikasleak zarete.", "Sois estudiantes."], ["Haiek irakasleak dira.", "Ellos son profesores."]],
    drills: [{ from: "Ni ikaslea naiz.", to: "Gu ikasleak gara.", es: "Somos estudiantes.", instr: "Cámbialo a «nosotros»" }, { from: "Zu medikua zara.", to: "Zuek medikuak zarete.", es: "Sois médicos.", instr: "Cámbialo a «vosotros»" }, { from: "Hura irakaslea da.", to: "Haiek irakasleak dira.", es: "Ellos son profesores.", instr: "Cámbialo a «ellos»" }, { from: "Gu lagunak gara.", to: "Ni laguna naiz.", es: "Soy amigo/a.", instr: "Cámbialo a «yo»" }]
  },
  {
    id: "g-egon", title: "Estar: toda la tabla (egon)", lessons: ["l7"], emoji: "📍",
    summary: "nago, zaude, dago, gaude, zaudete, daude. Para estados (cansado, contento) y lugares.",
    pieces: [{ t: "Haiek", k: "subj" }, { t: "pozik", k: "obj" }, { t: "daude", k: "verb" }],
    table: { cols: ["pronombre", "egon"], rows: [["ni", "nago"], ["zu", "zaude"], ["hura", "dago"], ["gu", "gaude"], ["zuek", "zaudete"], ["haiek", "daude"]] },
    examples: [["Gu ondo gaude.", "Estamos bien."], ["Zuek nekatuta zaudete.", "Estáis cansados."], ["Hura pozik dago.", "Está contento/a."]],
    drills: [{ from: "Ni ondo nago.", to: "Gu ondo gaude.", es: "Estamos bien.", instr: "Cámbialo a «nosotros»" }, { from: "Zu nekatuta zaude.", to: "Zuek nekatuta zaudete.", es: "Estáis cansados.", instr: "Cámbialo a «vosotros»" }, { from: "Hura pozik dago.", to: "Haiek pozik daude.", es: "Están contentos.", instr: "Cámbialo a «ellos»" }, { from: "Gu lagunak gara.", to: "Gu ondo gaude.", es: "Estamos bien.", instr: "Di «estamos bien» (cambia ser por estar)" }]
  },
  {
    id: "g-nor-zer", title: "Nor / zer / zein", lessons: ["l9"], emoji: "❓",
    summary: "nor pregunta por personas, zer por cosas que no conoces, zein pide elegir entre varios (personas o cosas). Todas van al principio y el verbo detrás.",
    pieces: [{ t: "Zer", k: "q" }, { t: "da", k: "verb" }, { t: "hau", k: "obj" }],
    table: { cols: ["pregunta", "respuesta"], rows: [["Nor da?", "Ane da. (persona)"], ["Zer da?", "Liburua da. (no sabía qué era)"], ["Zein da zurea?", "Hau da. (elijo entre varios)"], ["Zer nahi duzu?", "Kafea. (en general)"], ["Zein nahi duzu?", "Hori. (de los que hay)"]] },
    examples: [["Nor da hura?", "¿Quién es aquel?"], ["Zer da hau?", "¿Qué es esto?"], ["Zein da zure kafea?", "¿Cuál es tu café?"]],
    drills: [{ from: "Hura Miren da.", to: "Nor da hura?", es: "¿Quién es aquella?", instr: "Haz la pregunta (persona)" }, { from: "Hau liburua da.", to: "Zer da hau?", es: "¿Qué es esto?", instr: "Haz la pregunta (cosa)" }, { from: "Hori nirea da.", to: "Zein da zurea?", es: "¿Cuál es el tuyo?", instr: "Haz la pregunta con «zein»" }, { from: "Zer da hau?", to: "Hau nire liburua da.", es: "Esto es mi libro.", instr: "Responde: esto es mi libro" }, { from: "Zer nahi duzu?", to: "Zein nahi duzu?", es: "¿Cuál quieres?", instr: "Ahora hay varios para elegir" }, { from: "Zein liburu da?", to: "Zer liburu da?", es: "¿Qué libro es?", instr: "Ahora no hay dónde elegir (pregunta en general)" }, { from: "Nor da irakaslea?", to: "Zein da irakaslea?", es: "¿Cuál es el profesor? (de estos)", instr: "Pregunta cuál de estas personas" }]
  },
  {
    id: "g-bizi", title: "Vivir en: -n + bizi", lessons: ["l10"], emoji: "🏠",
    summary: "El lugar lleva -n (o -en tras consonante) y el verbo es bizi + izan: bizi naiz, bizi da, bizi gara.",
    pieces: [{ t: "Ni", k: "subj" }, { t: "Bilbo", k: "obj" }, { t: "-n", k: "num" }, { t: "bizi naiz", k: "verb" }],
    table: { cols: ["lugar", "en + lugar"], rows: [["Bilbo", "Bilbon"], ["Peru", "Perun"], ["Londres", "Londresen"], ["Ekuador", "Ekuadorren"], ["Donostia", "Donostian"]] },
    examples: [["Ni Bilbon bizi naiz.", "Vivo en Bilbao."], ["Ramon Londresen bizi da.", "Ramón vive en Londres."], ["Gu Perun bizi gara.", "Vivimos en Perú."]],
    drills: [{ from: "Ni Bilbon bizi naiz.", to: "Gu Bilbon bizi gara.", es: "Vivimos en Bilbao.", instr: "Cámbialo a «nosotros»" }, { from: "Ramon Londresen bizi da.", to: "Ramon Perun bizi da.", es: "Ramón vive en Perú.", instr: "Ahora vive en Perú" }, { from: "Nire osaba Ekuadorren bizi da.", to: "Nire izeba Ekuadorren bizi da.", es: "Mi tía vive en Ecuador.", instr: "Ahora es mi tía" }, { from: "Ni Donostian bizi naiz.", to: "Non bizi zara?", es: "¿Dónde vives?", instr: "Haz la pregunta" }]
  },
  {
    id: "g-nongoa", title: "De dónde: -koa / -ekoa / -goa", lessons: ["l10"], emoji: "🌍",
    summary: "Nongoa zara? se responde con el lugar + -koa (tras vocal), -ekoa (tras consonante) o -goa (tras -n). Plural: -koak.",
    pieces: [{ t: "Ni", k: "subj" }, { t: "bilbo", k: "obj" }, { t: "-koa", k: "num" }, { t: "naiz", k: "verb" }],
    table: { cols: ["lugar", "de + lugar"], rows: [["Bilbo (vocal)", "bilbokoa"], ["Madril (consonante)", "madrilekoa"], ["Irun (-n)", "irungoa"], ["Peru", "perukoa"], ["Argentina", "argentinakoa"]] },
    examples: [["Ni bilbokoa naiz.", "Soy de Bilbao."], ["Ane madrilekoa da.", "Ane es de Madrid."], ["Jon irungoa da.", "Jon es de Irun."]],
    drills: [{ from: "Ni Bilbon bizi naiz.", to: "Ni bilbokoa naiz.", es: "Soy de Bilbao.", instr: "Di que ERES de ahí (no que vives)" }, { from: "Ane Madrilen bizi da.", to: "Ane madrilekoa da.", es: "Ane es de Madrid.", instr: "Di que ES de ahí" }, { from: "Jon Irunen bizi da.", to: "Jon irungoa da.", es: "Jon es de Irun.", instr: "Di que ES de ahí (acaba en -n)" }, { from: "Ni bilbokoa naiz.", to: "Nongoa zara?", es: "¿De dónde eres?", instr: "Haz la pregunta" }, { from: "Gu Perun bizi gara.", to: "Gu perukoak gara.", es: "Somos de Perú.", instr: "Di que SOIS de ahí (plural: -koak)" }]
  },
  {
    id: "g-ukan", title: "Tener: ukan (dut) completo", lessons: ["l12", "l11"], emoji: "✋",
    summary: "nik dut, zuk duzu, hark du, guk dugu, zuek duzue, haiek dute. En plural: ditut, dituzu, ditu, ditugu, dituzue, dituzte. El sujeto lleva -k.",
    pieces: [{ t: "Nik", k: "subj" }, { t: "neba", k: "obj" }, { t: "bat", k: "num" }, { t: "dut", k: "verb" }],
    table: { cols: ["sujeto", "una cosa", "varias"], rows: [["nik", "dut", "ditut"], ["zuk", "duzu", "dituzu"], ["hark", "du", "ditu"], ["guk", "dugu", "ditugu"], ["zuek", "duzue", "dituzue"], ["haiek", "dute", "dituzte"]] },
    examples: [["Nik neba bat dut.", "Tengo un hermano."], ["Zuk bi ahizpa dituzu.", "Tienes dos hermanas."], ["Haiek hiru seme-alaba dituzte.", "Ellos tienen tres hijos."]],
    drills: [{ from: "Nik neba bat dut.", to: "Guk neba bat dugu.", es: "Tenemos un hermano.", instr: "Cámbialo a «nosotros»" }, { from: "Zuk ahizpa bat duzu.", to: "Zuk ahizpa bi dituzu.", es: "Tienes dos hermanas.", instr: "Ahora son dos" }, { from: "Hark etxe bat du.", to: "Haiek etxe bat dute.", es: "Ellos tienen una casa.", instr: "Cámbialo a «ellos»" }, { from: "Guk txakur bat dugu.", to: "Zuek txakur bat duzue.", es: "Vosotros tenéis un perro.", instr: "Cámbialo a «vosotros»" }, { from: "Nik liburu bat dut.", to: "Nik liburuak ditut.", es: "Tengo libros.", instr: "Ahora son varios (plural)" }]
  },
  {
    id: "g-eduki", title: "Tener: eduki (daukat) completo", lessons: ["l12", "l11"], emoji: "🤲",
    summary: "nik daukat, zuk daukazu, hark dauka, guk daukagu, zuek daukazue, haiek daukate. En plural: dauzkat, dauzkazu, dauzka, dauzkagu, dauzkazue, dauzkate.",
    pieces: [{ t: "Nik", k: "subj" }, { t: "lehengusu", k: "obj" }, { t: "asko", k: "num" }, { t: "dauzkat", k: "verb" }],
    table: { cols: ["sujeto", "una cosa", "varias"], rows: [["nik", "daukat", "dauzkat"], ["zuk", "daukazu", "dauzkazu"], ["hark", "dauka", "dauzka"], ["guk", "daukagu", "dauzkagu"], ["zuek", "daukazue", "dauzkazue"], ["haiek", "daukate", "dauzkate"]] },
    examples: [["Nik neba bat daukat.", "Tengo un hermano."], ["Hark etxe bat dauka.", "Tiene una casa."], ["Nik lehengusu asko dauzkat.", "Tengo muchos primos."]],
    drills: [{ from: "Nik neba bat dut.", to: "Nik neba bat daukat.", es: "Tengo un hermano.", instr: "Dilo con eduki" }, { from: "Nik neba bat daukat.", to: "Nik neba bi dauzkat.", es: "Tengo dos hermanos.", instr: "Ahora son dos" }, { from: "Hark etxe bat dauka.", to: "Guk etxe bat daukagu.", es: "Tenemos una casa.", instr: "Cámbialo a «nosotros»" }, { from: "Zuk liburu bat daukazu.", to: "Zuek liburu bat daukazue.", es: "Tenéis un libro.", instr: "Cámbialo a «vosotros»" }, { from: "Haiek txakur bat daukate.", to: "Haiek txakurrak dauzkate.", es: "Tienen perros.", instr: "Ahora son varios (plural)" }]
  },
  {
    id: "g-galderak", title: "Las 7 preguntas", lessons: ["l13", "l9", "l10"], emoji: "❓",
    summary: "nor (quién), zer (qué), zein (cuál), non (dónde), nongoa (de dónde), zenbat (cuántos), norengana (a casa de quién). Primero la pregunta, después el verbo.",
    pieces: [{ t: "Norengana", k: "q" }, { t: "zoaz", k: "verb" }],
    table: { cols: ["pregunta", "respuesta"], rows: [["Nor zara?", "Ni Ane naiz."], ["Zer da hau?", "Liburua da."], ["Zein da zurea?", "Hori."], ["Non bizi zara?", "Bilbon."], ["Nongoa zara?", "Bilbokoa."], ["Zenbat urte dituzu?", "Hogei."], ["Norengana zoaz?", "Amarengana."]] },
    examples: [["Norengana zoaz?", "¿A casa de quién vas?"], ["Amarengana noa.", "Voy a casa de mi madre."], ["Non dago zure ama?", "¿Dónde está tu madre?"]],
    drills: [{ from: "Ni Bilbon bizi naiz.", to: "Non bizi zara?", es: "¿Dónde vives?", instr: "Haz la pregunta" }, { from: "Ni bilbokoa naiz.", to: "Nongoa zara?", es: "¿De dónde eres?", instr: "Haz la pregunta" }, { from: "Amarengana noa.", to: "Norengana zoaz?", es: "¿A casa de quién vas?", instr: "Haz la pregunta" }, { from: "Norengana zoaz?", to: "Aitarengana noa.", es: "Voy a casa de mi padre.", instr: "Responde: a casa de mi padre" }, { from: "Norengana zoaz?", to: "Medikuarengana noa.", es: "Voy al médico.", instr: "Responde: al médico" }, { from: "Hogei urte ditut.", to: "Zenbat urte dituzu?", es: "¿Cuántos años tienes?", instr: "Haz la pregunta" }]
  },
  {
    id: "g-non-dago", title: "Dónde está: egon + -(r)en + posposición", lessons: ["l14", "l15", "l16"], emoji: "📍",
    summary: "Para decir dónde está algo se usa egon (dago / daude). El lugar lleva -n (sukaldean) o la cosa de referencia lleva -(r)en + gainean, azpian, ondoan… Hay = dago; no hay = ez dago …-rik.",
    pieces: [{ t: "Liburua", k: "subj" }, { t: "mahaiaren", k: "obj" }, { t: "gainean", k: "num" }, { t: "dago", k: "verb" }],
    table: { cols: ["euskera", "castellano"], rows: [["X -n dago", "X está en"], ["X Y-ren gainean dago", "X está encima de Y"], ["X Y-ren azpian dago", "X está debajo de Y"], ["Ba al dago X-rik?", "¿Hay X?"], ["Ez dago X-rik", "No hay X"]] },
    examples: [["Mahaia sukaldean dago.", "La mesa está en la cocina."], ["Katua ohearen azpian dago.", "El gato está debajo de la cama."], ["Aulkiak sukaldean daude.", "Las sillas están en la cocina."], ["Ez, ez dago telebistarik.", "No, no hay televisión."]],
    drills: [{ from: "Liburua mahaiaren gainean dago.", to: "Liburua mahaiaren azpian dago.", instr: "Ahora está debajo" }, { from: "Katua ohearen azpian dago.", to: "Katuak ohearen azpian daude.", instr: "Ahora son varios gatos" }, { from: "Non dago komuna?", to: "Komuna hor dago.", instr: "Responde: está ahí" }, { from: "Telebista egongelan dago.", to: "Ez dago telebistarik.", instr: "Niega: no hay" }, { from: "Lanpara sofaren ondoan dago.", to: "Lanpara sofaren atzean dago.", instr: "Ahora está detrás" }, { from: "Ba al dago hozkailurik?", to: "Bai, badago.", instr: "Responde que sí" }]
  },
  {
    id: "g-nora-nondik", title: "Ir y venir: -ra / -tik", lessons: ["l17"], emoji: "🧭",
    summary: "Adónde (NORA) lleva -ra; de dónde (NONDIK) lleva -tik. joan y etorri tienen formas cortas sin auxiliar: noa / nator.",
    pieces: [{ t: "Etxera", k: "obj" }, { t: "noa", k: "verb" }],
    table: { cols: ["pronombre", "joan · ir", "etorri · venir"], rows: [["ni", "noa", "nator"], ["zu", "zoaz", "zatoz"], ["hura", "doa", "dator"]] },
    examples: [["Etxera noa.", "Voy a casa."], ["Lanetik nator.", "Vengo del trabajo."], ["Nora zoaz?", "¿Adónde vas?"], ["Bilbotik nator.", "Vengo de Bilbao."]],
    drills: [{ from: "Etxera noa.", to: "Etxetik nator.", instr: "Ahora vienes de ahí" }, { from: "Bilbora noa.", to: "Bilbotik nator.", instr: "Ahora vienes de ahí" }, { from: "Nora zoaz?", to: "Nondik zatoz?", instr: "Pregunta de dónde viene" }, { from: "Lanera noa.", to: "Lanera zoaz.", instr: "Cámbialo a «tú»" }, { from: "Etxera noa.", to: "Etxera doa.", instr: "Dilo de él/ella" }, { from: "Supermerkatura noa.", to: "Supermerkatutik nator.", instr: "Ahora vienes de ahí" }]
  },
  {
    id: "g-nolakoa", title: "Cómo es: adjetivo + -a + da", lessons: ["l14", "l18"], emoji: "🏞️",
    summary: "Nolakoa da? se responde con el adjetivo después del nombre, con -a y el verbo da al final. oso / nahiko delante; baina / eta unen adjetivos.",
    pieces: [{ t: "Etxea", k: "subj" }, { t: "oso", k: "num" }, { t: "handia", k: "obj" }, { t: "da", k: "verb" }],
    table: { cols: ["euskera", "castellano"], rows: [["handia / txikia", "grande / pequeño"], ["polita / itsusia", "bonito / feo"], ["zaharra / berria", "viejo / nuevo"], ["lasaia / zaratatsua", "tranquilo / ruidoso"], ["merkea / garestia", "barato / caro"]] },
    examples: [["Nire auzoa lasaia da.", "Mi barrio es tranquilo."], ["Etxea zaharra baina polita da.", "La casa es vieja pero bonita."], ["Pisuak garestiak dira.", "Los pisos son caros."]],
    drills: [{ from: "Etxea handia da.", to: "Etxea txikia da.", instr: "Di lo contrario" }, { from: "Kalea lasaia da.", to: "Kalea zaratatsua da.", instr: "Di lo contrario" }, { from: "Etxea polita da.", to: "Etxea oso polita da.", instr: "Añade «muy»" }, { from: "Auzoa lasaia da.", to: "Auzoak lasaiak dira.", instr: "Ponlo en plural" }, { from: "Taberna garestia da.", to: "Taberna merkea da.", instr: "Di lo contrario" }, { from: "Hiria handia da.", to: "Hiria handia eta garestia da.", instr: "Añade «y cara»" }]
  }
];

// Transformaciones por frase (clave = frase en euskera normalizada). Cada una: instrucción, resultado esperado y nota.
// Las usan la ronda diaria (a veces en vez de pedir la frase tal cual), cada lección (bloque Eraldatu) y los retos.
window.TRANSFORMS = {
  "ni ane naiz": [{ i: "Cámbialo a «tú»", to: "Zu Ane zara.", es: "Tú eres Ane." }, { i: "Dilo con «nire izena … da»", to: "Nire izena Ane da.", es: "Mi nombre es Ane." }],
  "ni mikel naiz": [{ i: "Cámbialo a «tú»", to: "Zu Mikel zara.", es: "Tú eres Mikel." }, { i: "Dilo con «nire izena … da»", to: "Nire izena Mikel da.", es: "Mi nombre es Mikel." }],
  "nire izena ane da": [{ i: "Dilo con «ni … naiz»", to: "Ni Ane naiz.", es: "Yo soy Ane." }],
  "nola duzu izena?": [{ i: "Pregúntalo con «zein da»", to: "Zein da zure izena?", es: "¿Cuál es tu nombre?" }],
  "zein da zure izena?": [{ i: "Pregúntalo con «nola»", to: "Nola duzu izena?", es: "¿Cómo te llamas?" }],
  "ondo, eskerrik asko. eta zu?": [{ i: "Responde «muy bien» en vez de «bien»", to: "Oso ondo, eskerrik asko. Eta zu?", es: "Muy bien, gracias. ¿Y tú?" }],
  "oso ondo nago.": [{ i: "Quita el «muy»", to: "Ondo nago.", es: "Estoy bien." }, { i: "Cámbialo a «tú estás»", to: "Oso ondo zaude.", es: "Estás muy bien." }],
  "hala-hola, nekatuta nago.": [{ i: "Di solo «estoy cansado/a»", to: "Nekatuta nago.", es: "Estoy cansado/a." }],
  "zer moduz zaude?": [{ i: "Dilo de «yo»: estoy bien", to: "Ondo nago.", es: "Estoy bien." }],
  "nekatuta": [{ i: "Haz la frase «estoy cansado/a»", to: "Nekatuta nago.", es: "Estoy cansado/a." }],
  "zenbat urte dituzu?": [{ i: "Responde: tengo 20 años", to: "Hogei urte ditut.", es: "Tengo veinte años." }, { i: "Responde: tengo 35 años", to: "Hogeita hamabost urte ditut.", es: "Tengo treinta y cinco años." }],
  "hogeita hamar urte ditut.": [{ i: "Ahora son 31", to: "Hogeita hamaika urte ditut.", es: "Tengo treinta y un años." }, { i: "Dilo de otra persona (él/ella)", to: "Hogeita hamar urte ditu.", es: "Tiene treinta años." }],
  "hogeita zortzi urte ditut.": [{ i: "Ahora son 29", to: "Hogeita bederatzi urte ditut.", es: "Tengo veintinueve años." }, { i: "Dilo de otra persona (él/ella)", to: "Hogeita zortzi urte ditu.", es: "Tiene veintiocho años." }],
  "berrogei urte ditu.": [{ i: "Dilo de «yo»", to: "Berrogei urte ditut.", es: "Tengo cuarenta años." }, { i: "Ahora son 42", to: "Berrogeita bi urte ditu.", es: "Tiene cuarenta y dos años." }],
  "hogeita hamar": [{ i: "Suma uno (31)", to: "hogeita hamaika", es: "31" }, { i: "Suma veinte (50)", to: "berrogeita hamar", es: "50" }],
  "berrogei": [{ i: "Suma dos (42)", to: "berrogeita bi", es: "42" }, { i: "Suma veinte (60)", to: "hirurogei", es: "60" }],
  "hogei": [{ i: "Suma cinco (25)", to: "hogeita bost", es: "25" }],
  "hamabost": [{ i: "Suma veinte (35)", to: "hogeita hamabost", es: "35" }],
  "musika gustatzen zait": [{ i: "Ponlo en negativo", to: "Ez zait gustatzen musika.", es: "No me gusta la música." }, { i: "Añade «mucho»", to: "Musika asko gustatzen zait.", es: "Me gusta mucho la música." }, { i: "Dilo de «tú» (te gusta)", to: "Musika gustatzen zaizu.", es: "Te gusta la música." }],
  "musika gustatzen zait.": [{ i: "Ponlo en negativo", to: "Ez zait gustatzen musika.", es: "No me gusta la música." }, { i: "Añade «mucho»", to: "Musika asko gustatzen zait.", es: "Me gusta mucho la música." }],
  "liburuak gustatzen zaizkit": [{ i: "Ponlo en singular (un libro)", to: "Liburua gustatzen zait.", es: "Me gusta el libro." }, { i: "Ponlo en negativo", to: "Ez zaizkit gustatzen liburuak.", es: "No me gustan los libros." }],
  "pintxoak gustatzen zaizkit.": [{ i: "Ponlo en singular (un pintxo)", to: "Pintxoa gustatzen zait.", es: "Me gusta el pintxo." }, { i: "Ponlo en negativo", to: "Ez zaizkit gustatzen pintxoak.", es: "No me gustan los pintxos." }],
  "ez zait gustatzen hotza": [{ i: "Ponlo en afirmativo", to: "Hotza gustatzen zait.", es: "Me gusta el frío." }],
  "ez zait gustatzen hotza.": [{ i: "Ponlo en afirmativo", to: "Hotza gustatzen zait.", es: "Me gusta el frío." }],
  "zinema asko gustatzen zait.": [{ i: "Quita el «mucho»", to: "Zinema gustatzen zait.", es: "Me gusta el cine." }, { i: "Ponlo en negativo", to: "Ez zait gustatzen zinema.", es: "No me gusta el cine." }],
  "asko gustatzen zait": [{ i: "Haz la frase: me gusta mucho el deporte", to: "Kirola asko gustatzen zait.", es: "Me gusta mucho el deporte." }],
  "zinema": [{ i: "Haz la frase: me gusta el cine", to: "Zinema gustatzen zait.", es: "Me gusta el cine." }],
  "kirola": [{ i: "Haz la frase: me gusta el deporte", to: "Kirola gustatzen zait.", es: "Me gusta el deporte." }],
  "bidaiatzea": [{ i: "Haz la frase: me gusta viajar", to: "Bidaiatzea gustatzen zait.", es: "Me gusta viajar." }],
  "sukaldatzea": [{ i: "Haz la frase: me gusta cocinar", to: "Sukaldatzea gustatzen zait.", es: "Me gusta cocinar." }],
  "ahizpa bat dut.": [{ i: "Ahora son dos", to: "Ahizpa bi ditut.", es: "Tengo dos hermanas." }, { i: "Ponlo en negativo: no tengo hermanos", to: "Ez dut anai-arrebarik.", es: "No tengo hermanos." }],
  "neba bi ditut.": [{ i: "Ahora es uno", to: "Neba bat dut.", es: "Tengo un hermano (dice una chica)." }],
  "anaia bat eta arreba bat ditut.": [{ i: "Solo un hermano", to: "Anaia bat dut.", es: "Tengo un hermano (dice un chico)." }],
  "ez dut anai-arrebarik.": [{ i: "Ahora tengo una hermana (dicho por una chica)", to: "Ahizpa bat dut.", es: "Tengo una hermana (dice una chica)." }],
  "neba": [{ i: "Plural", to: "nebak", es: "hermanos (dice una chica)" }, { i: "Haz la frase: tengo un hermano (chica)", to: "Neba bat dut.", es: "Tengo un hermano (dice una chica)." }],
  "ahizpa": [{ i: "Plural", to: "ahizpak", es: "hermanas (dice una chica)" }, { i: "Haz la frase: tengo una hermana (chica)", to: "Ahizpa bat dut.", es: "Tengo una hermana (dice una chica)." }],
  "anaia": [{ i: "Plural", to: "anaiak", es: "hermanos (dice un chico)" }, { i: "Haz la frase: tengo un hermano (chico)", to: "Anaia bat dut.", es: "Tengo un hermano (dice un chico)." }],
  "arreba": [{ i: "Plural", to: "arrebak", es: "hermanas (dice un chico)" }, { i: "Haz la frase: tengo una hermana (chico)", to: "Arreba bat dut.", es: "Tengo una hermana (dice un chico)." }],
  "egun on": [{ i: "Ahora es por la tarde", to: "Arratsalde on", es: "Buenas tardes" }, { i: "Ahora es de noche", to: "Gabon", es: "Buenas noches" }],
  "arratsalde on": [{ i: "Ahora es por la mañana", to: "Egun on", es: "Buenos días" }],
  "gabon": [{ i: "Ahora es por la mañana", to: "Egun on", es: "Buenos días" }],
  "kaixo! zer moduz?": [{ i: "Responde: bien, gracias. ¿Y tú?", to: "Ondo, eskerrik asko. Eta zu?", es: "Bien, gracias. ¿Y tú?" }],
  "agur, gero arte!": [{ i: "Despídete con «hasta la vista»", to: "Agur, ikusi arte!", es: "¡Adiós, hasta la vista!" }],
  "gu lagunak gara.": [{ i: "Cámbialo a «vosotros»", to: "Zuek lagunak zarete.", es: "Vosotros sois amigos." }, { i: "Cámbialo a «ellos»", to: "Haiek lagunak dira.", es: "Ellos son amigos." }],
  "zuek ikasleak zarete.": [{ i: "Cámbialo a «nosotros»", to: "Gu ikasleak gara.", es: "Nosotros somos estudiantes." }, { i: "Cámbialo a «yo»", to: "Ni ikaslea naiz.", es: "Yo soy estudiante." }],
  "haiek ondo daude.": [{ i: "Cámbialo a «nosotros»", to: "Gu ondo gaude.", es: "Nosotros estamos bien." }, { i: "Cámbialo a «él/ella»", to: "Hura ondo dago.", es: "Él/ella está bien." }],
  "hura nekatuta dago.": [{ i: "Cámbialo a «ellos»", to: "Haiek nekatuta daude.", es: "Ellos están cansados." }, { i: "Cámbialo a «vosotros»", to: "Zuek nekatuta zaudete.", es: "Vosotros estáis cansados." }],
  "gu lagunak gara": [{ i: "Cámbialo a «ellos»", to: "Haiek lagunak dira.", es: "Ellos son amigos." }],
  "haiek ikasleak dira": [{ i: "Cámbialo a «nosotros»", to: "Gu ikasleak gara.", es: "Nosotros somos estudiantes." }],
  "gu ondo gaude": [{ i: "Cámbialo a «vosotros»", to: "Zuek ondo zaudete.", es: "Vosotros estáis bien." }],
  "hura pozik dago": [{ i: "Cámbialo a «ellos»", to: "Haiek pozik daude.", es: "Ellos están contentos." }],
  "ni irakaslea naiz.": [{ i: "Cámbialo a «nosotros»", to: "Gu irakasleak gara.", es: "Somos profesores." }, { i: "Ahora eres médico/a", to: "Ni medikua naiz.", es: "Soy médico/a." }],
  "zu medikua zara.": [{ i: "Cámbialo a «yo»", to: "Ni medikua naiz.", es: "Soy médico/a." }, { i: "Haz la pregunta", to: "Zer zara?", es: "¿Qué eres?" }],
  "ane sukaldaria da.": [{ i: "Cámbialo a «ellos» (Ane eta Jon)", to: "Ane eta Jon sukaldariak dira.", es: "Ane y Jon son cocineros." }],
  "gu ikasleak gara.": [{ i: "Cámbialo a «yo»", to: "Ni ikaslea naiz.", es: "Soy estudiante." }],
  "irakaslea": [{ i: "Haz la frase: soy profesor/a", to: "Ni irakaslea naiz.", es: "Soy profesor/a." }],
  "medikua": [{ i: "Haz la frase: ella es médica", to: "Hura medikua da.", es: "Ella es médica." }],
  "sukaldaria": [{ i: "Plural", to: "sukaldariak", es: "cocineros/as" }],
  "erizaina": [{ i: "Haz la frase: somos enfermeros", to: "Gu erizainak gara.", es: "Somos enfermeros/as." }],
  "nor da hura?": [{ i: "Responde: aquella es Ane", to: "Hura Ane da.", es: "Aquella es Ane." }],
  "zer da hau?": [{ i: "Responde: esto es un libro", to: "Hau liburua da.", es: "Esto es un libro." }],
  "hau nire liburua da.": [{ i: "Haz la pregunta", to: "Zer da hau?", es: "¿Qué es esto?" }, { i: "Ahora es «eso»", to: "Hori nire liburua da.", es: "Eso es mi libro." }],
  "hura nire irakaslea da.": [{ i: "Haz la pregunta", to: "Nor da hura?", es: "¿Quién es aquel/aquella?" }],
  "zein da zure kafea?": [{ i: "Responde: ese es el mío", to: "Hori nirea da.", es: "Ese es el mío." }],
  "zer nahi duzu?": [{ i: "Ahora hay varios para elegir", to: "Zein nahi duzu?", es: "¿Cuál quieres?" }, { i: "Responde: café", to: "Kafea.", es: "Café." }],
  "zein nahi duzu?": [{ i: "Ahora no hay dónde elegir", to: "Zer nahi duzu?", es: "¿Qué quieres?" }, { i: "Responde señalando: ese", to: "Hori.", es: "Ese." }],
  "zein liburu da zurea?": [{ i: "Responde: este es el mío", to: "Hau nirea da.", es: "Este es el mío." }],
  "zer liburu da?": [{ i: "Ahora hay varios libros delante", to: "Zein liburu da?", es: "¿Cuál libro es?" }],
  "nor da irakaslea?": [{ i: "Pregunta cuál de estas personas", to: "Zein da irakaslea?", es: "¿Cuál es el profesor/a?" }],
  "zein da irakaslea?": [{ i: "Pregunta quién es (su nombre)", to: "Nor da irakaslea?", es: "¿Quién es el profesor/a?" }],
  "hori nirea da.": [{ i: "Ahora es el tuyo", to: "Hori zurea da.", es: "Ese es el tuyo." }],
  "ni bilbon bizi naiz.": [{ i: "Cámbialo a «nosotros»", to: "Gu Bilbon bizi gara.", es: "Vivimos en Bilbao." }, { i: "Ahora vives en Londres", to: "Ni Londresen bizi naiz.", es: "Vivo en Londres." }, { i: "Di que ERES de Bilbao", to: "Ni bilbokoa naiz.", es: "Soy de Bilbao." }],
  "ramon londresen bizi da.": [{ i: "Ahora vive en Perú", to: "Ramon Perun bizi da.", es: "Ramón vive en Perú." }, { i: "Haz la pregunta", to: "Non bizi da Ramon?", es: "¿Dónde vive Ramón?" }],
  "nire osaba ekuadorren bizi da.": [{ i: "Ahora es mi tía", to: "Nire izeba Ekuadorren bizi da.", es: "Mi tía vive en Ecuador." }],
  "gu perun bizi gara.": [{ i: "Cámbialo a «yo»", to: "Ni Perun bizi naiz.", es: "Vivo en Perú." }, { i: "Di que SOIS de Perú", to: "Gu perukoak gara.", es: "Somos de Perú." }],
  "ni bilbokoa naiz.": [{ i: "Haz la pregunta", to: "Nongoa zara?", es: "¿De dónde eres?" }, { i: "Ahora eres de Madrid", to: "Ni madrilekoa naiz.", es: "Soy de Madrid." }, { i: "Ahora eres de Irun", to: "Ni irungoa naiz.", es: "Soy de Irun." }],
  "ane madrilekoa da.": [{ i: "Haz la pregunta", to: "Nongoa da Ane?", es: "¿De dónde es Ane?" }, { i: "Ahora vive en Madrid (no es de allí)", to: "Ane Madrilen bizi da.", es: "Ane vive en Madrid." }],
  "jon irungoa da": [{ i: "Haz la pregunta", to: "Nongoa da Jon?", es: "¿De dónde es Jon?" }],
  "gu argentinakoak gara": [{ i: "Cámbialo a «yo»", to: "Ni argentinakoa naiz.", es: "Soy de Argentina." }],
  "bilbon": [{ i: "Haz la frase: vivo en Bilbao", to: "Ni Bilbon bizi naiz.", es: "Vivo en Bilbao." }],
  "londresen": [{ i: "Haz la frase: vivimos en Londres", to: "Gu Londresen bizi gara.", es: "Vivimos en Londres." }],
  "osaba": [{ i: "Haz la frase: mi tío vive en Perú", to: "Nire osaba Perun bizi da.", es: "Mi tío vive en Perú." }, { i: "Haz la frase: tengo un tío", to: "Nik osaba bat daukat.", es: "Tengo un tío." }],
  "nire ama irakaslea da.": [{ i: "Ahora es mi padre", to: "Nire aita irakaslea da.", es: "Mi padre es profesor." }, { i: "Ahora es médica", to: "Nire ama medikua da.", es: "Mi madre es médica." }],
  "nire gurasoak bilbon bizi dira.": [{ i: "Ahora viven en Donostia", to: "Nire gurasoak Donostian bizi dira.", es: "Mis padres viven en Donostia." }, { i: "Ahora son mis abuelos", to: "Nire aiton-amonak Bilbon bizi dira.", es: "Mis abuelos viven en Bilbao." }],
  "nik osaba bat eta izeba bi dauzkat.": [{ i: "Dilo con ukan (ditut)", to: "Nik osaba bat eta izeba bi ditut.", es: "Tengo un tío y dos tías." }, { i: "Solo un tío", to: "Nik osaba bat daukat.", es: "Tengo un tío." }],
  "nire senarra medikua da.": [{ i: "Ahora es mi mujer", to: "Nire emaztea medikua da.", es: "Mi mujer es médica." }],
  "zenbat lehengusu dituzu?": [{ i: "Pregúntalo con eduki", to: "Zenbat lehengusu dauzkazu?", es: "¿Cuántos primos tienes?" }, { i: "Responde: tengo seis", to: "Sei dauzkat.", es: "Tengo seis." }],
  "gurasoak": [{ i: "Haz la frase: mis padres viven en Bilbao", to: "Nire gurasoak Bilbon bizi dira.", es: "Mis padres viven en Bilbao." }],
  "amona / amama": [{ i: "Haz la frase: mi abuela vive en Donostia", to: "Nire amona Donostian bizi da.", es: "Mi abuela vive en Donostia." }],
  "lehengusua": [{ i: "Plural", to: "lehengusuak", es: "primos" }],
  "seme-alabak": [{ i: "Haz la frase: tienen tres hijos", to: "Haiek hiru seme-alaba dituzte.", es: "Tienen tres hijos." }],
  "nik neba bat dut.": [{ i: "Dilo con eduki", to: "Nik neba bat daukat.", es: "Tengo un hermano." }, { i: "Cámbialo a «tú»", to: "Zuk neba bat duzu.", es: "Tienes un hermano." }, { i: "Ahora son dos", to: "Nik neba bi ditut.", es: "Tengo dos hermanos." }],
  "nik neba bat daukat.": [{ i: "Dilo con ukan", to: "Nik neba bat dut.", es: "Tengo un hermano." }, { i: "Ahora son dos", to: "Nik neba bi dauzkat.", es: "Tengo dos hermanos." }, { i: "Cámbialo a «nosotros»", to: "Guk neba bat daukagu.", es: "Tenemos un hermano." }],
  "zuk bi ahizpa dituzu.": [{ i: "Cámbialo a «yo»", to: "Nik bi ahizpa ditut.", es: "Tengo dos hermanas." }, { i: "Ahora es una", to: "Zuk ahizpa bat duzu.", es: "Tienes una hermana." }],
  "hark etxe bat dauka.": [{ i: "Cámbialo a «ellos»", to: "Haiek etxe bat daukate.", es: "Tienen una casa." }, { i: "Dilo con ukan", to: "Hark etxe bat du.", es: "Tiene una casa." }],
  "guk txakur bat dugu.": [{ i: "Cámbialo a «vosotros»", to: "Zuek txakur bat duzue.", es: "Tenéis un perro." }, { i: "Dilo con eduki", to: "Guk txakur bat daukagu.", es: "Tenemos un perro." }],
  "haiek hiru seme-alaba dituzte.": [{ i: "Cámbialo a «nosotros»", to: "Guk hiru seme-alaba ditugu.", es: "Tenemos tres hijos." }],
  "zuek liburu asko dauzkazue.": [{ i: "Cámbialo a «yo»", to: "Nik liburu asko dauzkat.", es: "Tengo muchos libros." }],
  "nik lehengusu asko dauzkat.": [{ i: "Dilo con ukan", to: "Nik lehengusu asko ditut.", es: "Tengo muchos primos." }, { i: "Cámbialo a «él/ella»", to: "Hark lehengusu asko dauzka.", es: "Tiene muchos primos." }],
  "norengana zoaz?": [{ i: "Responde: a casa de mi madre", to: "Amarengana noa.", es: "Voy a casa de mi madre." }, { i: "Responde: al médico", to: "Medikuarengana noa.", es: "Voy al médico." }],
  "amarengana noa.": [{ i: "Ahora a casa de mi padre", to: "Aitarengana noa.", es: "Voy a casa de mi padre." }, { i: "Haz la pregunta", to: "Norengana zoaz?", es: "¿A casa de quién vas?" }],
  "medikuarengana noa.": [{ i: "Ahora a casa de un amigo", to: "Lagunarengana noa.", es: "Voy a casa de un amigo." }],
  "non bizi zara?": [{ i: "Pregunta de dónde es (origen)", to: "Nongoa zara?", es: "¿De dónde eres?" }, { i: "Responde: en Bilbao", to: "Bilbon.", es: "En Bilbao." }],
  "nongoa zara?": [{ i: "Pregunta dónde vive", to: "Non bizi zara?", es: "¿Dónde vives?" }, { i: "Responde: de Bilbao", to: "Bilbokoa.", es: "De Bilbao." }],
  "non dago?": [{ i: "Pregunta por una persona: ¿quién está en casa?", to: "Nor dago etxean?", es: "¿Quién está en casa?" }],
  "nire etxea txikia da.": [{ i: "Di lo contrario", to: "Nire etxea handia da.", es: "Mi casa es grande." }, { i: "Ahora es el piso", to: "Nire pisua txikia da.", es: "Mi piso es pequeño." }],
  "etxeak hiru gela ditu.": [{ i: "Ahora son dos", to: "Etxeak bi gela ditu.", es: "La casa tiene dos habitaciones." }, { i: "Ahora es el piso (pisua)", to: "Pisuak hiru gela ditu.", es: "El piso tiene tres habitaciones." }],
  "balkoia dauka.": [{ i: "Ponlo en negativo", to: "Ez du balkoirik.", es: "No tiene balcón." }],
  "ez du balkoirik.": [{ i: "Ponlo en afirmativo", to: "Balkoia dauka.", es: "Tiene balcón." }],
  "non dago komuna?": [{ i: "Responde: está ahí", to: "Komuna hor dago.", es: "El baño está ahí." }, { i: "Pregunta por la cocina", to: "Non dago sukaldea?", es: "¿Dónde está la cocina?" }],
  "komuna hor dago.": [{ i: "Ahora está aquí", to: "Komuna hemen dago.", es: "El baño está aquí." }],
  "sukaldea handia da.": [{ i: "Di lo contrario", to: "Sukaldea txikia da.", es: "La cocina es pequeña." }, { i: "Añade «muy»", to: "Sukaldea oso handia da.", es: "La cocina es muy grande." }],
  "liburua mahaiaren gainean dago.": [{ i: "Ahora está debajo", to: "Liburua mahaiaren azpian dago.", es: "El libro está debajo de la mesa." }, { i: "Ahora son varios libros", to: "Liburuak mahaiaren gainean daude.", es: "Los libros están encima de la mesa." }],
  "katua ohearen azpian dago.": [{ i: "Ahora está encima", to: "Katua ohearen gainean dago.", es: "El gato está encima de la cama." }, { i: "Ahora está al lado del sofá", to: "Katua sofaren ondoan dago.", es: "El gato está al lado del sofá." }],
  "lanpara sofaren ondoan dago.": [{ i: "Ahora está detrás", to: "Lanpara sofaren atzean dago.", es: "La lámpara está detrás del sofá." }],
  "aulkiak sukaldean daude.": [{ i: "Ahora es una sola silla", to: "Aulkia sukaldean dago.", es: "La silla está en la cocina." }],
  "ba al dago telebistarik?": [{ i: "Responde que sí", to: "Bai, badago.", es: "Sí, hay." }, { i: "Responde que no", to: "Ez, ez dago telebistarik.", es: "No, no hay televisión." }, { i: "Pregunta por la nevera", to: "Ba al dago hozkailurik?", es: "¿Hay nevera?" }],
  "ez, ez dago telebistarik.": [{ i: "Ahora sí hay", to: "Bai, badago.", es: "Sí, hay." }],
  "armairua logelan dago.": [{ i: "Ahora está en el salón", to: "Armairua egongelan dago.", es: "El armario está en el salón." }],
  "nire auzoan okindegi bat dago.": [{ i: "Ahora es una farmacia", to: "Nire auzoan farmazia bat dago.", es: "En mi barrio hay una farmacia." }, { i: "Ahora son dos panaderías", to: "Nire auzoan bi okindegi daude.", es: "En mi barrio hay dos panaderías." }],
  "taberna plazan dago.": [{ i: "Ahora está en la calle", to: "Taberna kalean dago.", es: "El bar está en la calle." }, { i: "Ahora son dos bares", to: "Bi taberna daude plazan.", es: "Hay dos bares en la plaza." }],
  "geltokia urrun dago.": [{ i: "Di lo contrario", to: "Geltokia gertu dago.", es: "La estación está cerca." }],
  "ospitalea gertu dago.": [{ i: "Di lo contrario", to: "Ospitalea urrun dago.", es: "El hospital está lejos." }],
  "liburutegia udaletxearen ondoan dago.": [{ i: "Ahora está delante", to: "Liburutegia udaletxearen aurrean dago.", es: "La biblioteca está delante del ayuntamiento." }],
  "nora zoaz?": [{ i: "Responde: a casa", to: "Etxera noa.", es: "Voy a casa." }, { i: "Pregunta de dónde viene", to: "Nondik zatoz?", es: "¿De dónde vienes?" }],
  "etxera noa.": [{ i: "Ahora vienes de ahí", to: "Etxetik nator.", es: "Vengo de casa." }, { i: "Cámbialo a «tú»", to: "Etxera zoaz.", es: "Vas a casa." }, { i: "Ahora vas al trabajo", to: "Lanera noa.", es: "Voy al trabajo." }],
  "lanera noa.": [{ i: "Ahora vienes de ahí", to: "Lanetik nator.", es: "Vengo del trabajo." }],
  "bilbora noa.": [{ i: "Ahora vienes de ahí", to: "Bilbotik nator.", es: "Vengo de Bilbao." }, { i: "Dilo de él/ella", to: "Bilbora doa.", es: "Va a Bilbao." }],
  "nondik zatoz?": [{ i: "Responde: de casa", to: "Etxetik nator.", es: "Vengo de casa." }, { i: "Pregunta adónde va", to: "Nora zoaz?", es: "¿Adónde vas?" }],
  "etxetik nator.": [{ i: "Ahora vas hacia ahí", to: "Etxera noa.", es: "Voy a casa." }],
  "farmazia eskuinean dago.": [{ i: "Ahora está a la izquierda", to: "Farmazia ezkerrean dago.", es: "La farmacia está a la izquierda." }],
  "zuzen joan eta gero ezkerrera.": [{ i: "Ahora a la derecha", to: "Zuzen joan eta gero eskuinera.", es: "Sigue recto y luego a la derecha." }],
  "nolakoa da zure etxea?": [{ i: "Responde: es muy luminosa", to: "Oso argia da.", es: "Es muy luminosa." }, { i: "Pregunta por el barrio", to: "Nolakoa da zure auzoa?", es: "¿Cómo es tu barrio?" }],
  "nire auzoa lasaia da.": [{ i: "Di lo contrario", to: "Nire auzoa zaratatsua da.", es: "Mi barrio es ruidoso." }, { i: "Añade «muy»", to: "Nire auzoa oso lasaia da.", es: "Mi barrio es muy tranquilo." }],
  "etxea zaharra baina polita da.": [{ i: "Ahora es nueva pero fea", to: "Etxea berria baina itsusia da.", es: "La casa es nueva pero fea." }],
  "hiria handia eta garestia da.": [{ i: "Ahora es el pueblo: pequeño y barato", to: "Herria txikia eta merkea da.", es: "El pueblo es pequeño y barato." }],
  "taberna merkea da.": [{ i: "Di lo contrario", to: "Taberna garestia da.", es: "El bar es caro." }, { i: "Añade «bastante»", to: "Taberna nahiko merkea da.", es: "El bar es bastante barato." }],
  "pisuak garestiak dira.": [{ i: "Ponlo en singular", to: "Pisua garestia da.", es: "El piso es caro." }]
};
