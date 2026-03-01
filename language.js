function selectLanguage(language) { // FOR CHANGING LANGUAGE WHEN PRESSING BUTTON
    userLanguage = language;
    addStorage('userLanguage', userLanguage);
    document.getElementById('selectedLanguage').textContent = userLanguage.name;
    closePopup('language-modal');

    setLanguage();
}
function setLanguage() { // ONLY FOR STARTING APP
    document.getElementById('deineBücher').textContent = getTranslation('deine_buecher');
    document.getElementById('spracheAuswaehlen').textContent = getTranslation('sprache_auswaehlen');
    document.getElementById('uebersetzung').textContent = getTranslation('uebersetzung');
    document.getElementById('cancelTaskButton').textContent = getTranslation('abbrechen');
    document.getElementById('confirmTaskButton').textContent = getTranslation('bestaetigen');
    document.getElementById('askAi').textContent = getTranslation('ask_ai');
    document.getElementById('addNote').textContent = getTranslation('add_note');
    document.getElementById('addNoteConfirm').textContent = getTranslation('add_note_confirm');
    document.getElementById('addNoteDecline').textContent = getTranslation('add_note_decline');
    document.getElementById('askAiTextField').placeholder = getTranslation('ask_ai_text_field');
    document.getElementById('notesTextField').placeholder = getTranslation('notes_text_field');
    document.getElementById('langBtnLabel').textContent = getTranslation('langBtn');
}

function getTranslation(key) {
    return translations[key] ? translations[key][userLanguage.code] : key;
}

const translations = {
    "deine_buecher": {
        "de": "Deine Bücher",
        "en": "Your Books",
        "ua": "Ваші книги",
        "fr": "Vos livres",
        "es": "Tus libros"
    },
    "sprache_auswaehlen": {
        "de": "Sprache auswählen",
        "en": "Select Language",
        "ua": "Виберіть мову",
        "fr": "Choisir la langue",
        "es": "Seleccionar idioma"
    },
    "uebersetzung": {
        "de": "Übersetzung : ",
        "en": "Translation : ",
        "ua": "Переклад : ",
        "fr": "Traduction : ",
        "es": "Traducción : "
    },
    "abbrechen": {
        "de": "Abbrechen",
        "en": "Cancel",
        "ua": "Скасувати",
        "fr": "Annuler",
        "es": "Cancelar"
    },
    "bestaetigen": {
        "de": "Bestätigen",
        "en": "Confirm",
        "ua": "Підтвердити",
        "fr": "Confirmer",
        "es": "Confirmar"
    },
    "ask_ai": {
        "de": "Frag AI",
        "en": "Ask AI",
        "ua": "Запитати AI",
        "fr": "Demander à l'IA",
        "es": "Preguntar a la IA"
    },
    "add_note": {
        "de": "Notiz hinzufügen",
        "en": "Add Note",
        "ua": "Додати нотатку",
        "fr": "Ajouter une note",
        "es": "Añadir nota"
    },
    "add_note_confirm": {
        "de": "Notiz hinzufügen",
        "en": "Add Note",
        "ua": "Додати нотатку",
        "fr": "Ajouter une note",
        "es": "Añadir nota"
    },
    "add_note_decline": {
        "de": "Notiz abbrechen",
        "en": "Cancel Note",
        "ua": "Скасувати нотатку",
        "fr": "Annuler la note",
        "es": "Cancelar nota"
    },
    "ask_ai_text_field": {
        "de": "Frag die KI",
        "en": "Ask the AI",
        "ua": "Запитати AI",
        "fr": "Demander à l'IA",
        "es": "Preguntar a la IA"
    },
    "langBtn": {
        "de": "Sprache: ",
        "en": "Language: ",
        "ua": "Мова: ",
        "fr": "Langue: ",
        "es": "Idioma: "
    },
    "delete_note_confirm": {
        "de": "Notiz wirklich löschen?",
        "en": "Really delete note?",
        "ua": "Дійсно видалити нотатку?",
        "fr": "Vraiment supprimer la note?",
        "es": "¿Realmente eliminar la nota?"
    },
    "moechtest_du": {
        "de": "Möchtest du ",
        "en": "Do you want to ",
        "ua": "Чи хочеш ти ",
        "fr": "Veux-tu ",
        "es": "¿Quieres?"
    },
    "loeschen": {
        "de": " löschen?",
        "en": " delete?",
        "ua": " видалити?",
        "fr": " supprimer?",
        "es": " eliminar?"
    },
    "notes_text_field": {
        "de": "Deine Notiz ...",
        "en": "Your Note ...",
        "ua": "Твоя нотатка ...",
        "fr": "Ta note ...",
        "es": "Tu nota ..."
    }
};