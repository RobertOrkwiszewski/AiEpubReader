/*
- add api key insertion
- reader modal

Deine Daten und dein API-KEY werden nur auf deinem Gerät gespeichert und werden nicht an Dritte weitergegeben.
*/

const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Francais' },
    { code: 'es', name: 'Espanol' },
    { code: 'ua', name: 'Ukrainian' },
];

if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
lucide.createIcons();

// ========== STATES ==========

let apiKEY = getStorage('gemini_api_key') || '';

let userLanguage = getStorage('userLanguage') || languages[1]; // Default to English object
let books = getStorage('my_library') || [];

let popupState = {
    isOpen: false
};
let selectedBook = null;
let selectedCfiRange = '';
let selectedText = '';
let selectedTextTranslation = '';

let notesTextField = '';

let aiChatHistory = [];
let systemPrompt = '';

// Viewer States
let currentPDF = null;
let currentEpubRendition = null;
let currentEpubBook = null;
let readerTheme = getStorage('readerTheme') || 'dark';

// ========== STATES END ==========


// ========== POPUP FUNKTIONEN ==========

function openPopup(popupId) {
    popupState.isOpen = true;
    const popup = document.getElementById(popupId);
    popup.classList.add('open');
}
function closePopup(popupId) {
    popupState.isOpen = false;
    const popup = document.getElementById(popupId);
    popup.classList.remove('open');
}
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
}

// ========== POPUP FUNKTIONEN END ==========


// ========== BUTTON LISTENER BEGIN (for nonlist Buttons) ==========

// API KEY
const apiKeyButton = document.getElementById('addApiKeyButton');
apiKeyButton.addEventListener('click', () => {
    openPopup('apiKey-modal');
    document.getElementById('apiKeyTextField').value = apiKEY;
});
const apiKeyAdd = document.getElementById('apiKeyAdd');
apiKeyAdd.addEventListener('click', () => {
    if (document.getElementById('apiKeyTextField').value !== '') {
        apiKEY = document.getElementById('apiKeyTextField').value;
        addStorage('gemini_api_key', apiKEY);
        closePopup('apiKey-modal');

    }

});
const apiKeyDelete = document.getElementById('apiKeyDelete');
apiKeyDelete.addEventListener('click', () => {

    apiKEY = "";
    deleteStorage('gemini_api_key');
    document.getElementById('apiKeyTextField').value = "";

});
const apiKeyClose = document.getElementById('apiKeyClose');
apiKeyClose.addEventListener('click', () => {
    if (document.getElementById('apiKeyTextField').value !== '') {
        closePopup('apiKey-modal');
    }
});

const langButton = document.getElementById('langBtn');
langButton.addEventListener('click', () => {
    displayLanguages();
    openPopup('language-modal');
});
const themeButton = document.getElementById('themeBtn');
themeButton.addEventListener('click', () => {
    toggleTheme();
});

const homeBtn = document.getElementById('homeBtn');
homeBtn.addEventListener('click', () => {
    // Cleanup viewers
    if (currentEpubBook) {
        currentEpubBook.destroy();
        currentEpubBook = null;
        currentEpubRendition = null;
    }
    currentPDF = null;
    document.getElementById('viewer').innerHTML = '';

    showPage('booklist');
});

const translation = document.getElementById('translation');
translation.addEventListener('click', () => {
    closePopup('reader-modal');
});
const prevPageBtn = document.getElementById('prevPageBtn');
prevPageBtn.addEventListener('click', () => {
    if (!selectedBook) return;

    if (selectedBook.type === 'pdf') {
    } else if (selectedBook.type === 'epub') {
        if (currentEpubRendition) {
            currentEpubRendition.prev();
        }
    }
});
const nextPageBtn = document.getElementById('nextPageBtn');
nextPageBtn.addEventListener('click', () => {
    if (!selectedBook) return;

    if (selectedBook.type === 'pdf') {
    } else if (selectedBook.type === 'epub') {
        if (currentEpubRendition) {
            currentEpubRendition.next();
        }
    }
});

// ===== NOTES BUTTONS =====
const addNote = document.getElementById('addNote');
addNote.addEventListener('click', () => {
    closePopup('reader-modal');
    openPopup('addNote-modal');
    document.getElementById('noteText').textContent = selectedText;
});
const addNoteBtn = document.getElementById('addNoteBtn');
addNoteBtn.addEventListener('click', () => {
    displayNotes();
    showPage('notes');
});
const addNoteConfirm = document.getElementById('addNoteConfirm');
addNoteConfirm.addEventListener('click', () => {
    const noteText = document.getElementById('notesTextField').value;

    const note = {
        text: `${selectedText}`,
        note: noteText,
        currentPage: selectedBook.currentPage,
    };
    const idx = books.findIndex(b => b.id === selectedBook.id || b.title === selectedBook.title);
    if (books[idx]) {
        books[idx].notes.push(note);
        addStorage('my_library', books);
    }

    document.getElementById('notesTextField').value = '';

    displayNotes();
    closePopup('addNote-modal');
    showPage('notes');
});
const addNoteDecline = document.getElementById('addNoteDecline');
addNoteDecline.addEventListener('click', () => {
    closePopup('addNote-modal');
});
const notesHomeBtn = document.getElementById('notesHomeBtn');
notesHomeBtn.addEventListener('click', () => {
    showPage('reader');
});

// ===== AI BUTTONS =====
const askAi = document.getElementById('askAi');
askAi.addEventListener('click', () => {
    showPage('ai');

    document.getElementById('askAiTextField').value = `"${selectedText}", `;
    closePopup('reader-modal');

    displayAiChat()
});
const askAiBtn = document.getElementById('askAiBtn');
askAiBtn.addEventListener('click', () => {
    showPage('ai');

    displayAiChat()
});
const sendAiBtn = document.getElementById('sendAiBtn');
sendAiBtn.addEventListener('click', async () => {
    const aiTextField = document.getElementById('askAiTextField');
    const text = aiTextField.value.trim();

    if (text !== '') {
        // Korrektes Format: Ein Array mit zwei Elementen pushen
        aiChatHistory.push(['user', text]);

        displayAiChat();
        aiTextField.value = '';

        // Auf die Antwort warten
        await askGeminiInPage();
    }
});
const aiHomeBtn = document.getElementById('aiHomeBtn');
aiHomeBtn.addEventListener('click', () => {
    showPage('reader');
});

// ========== BUTTON LISTENER END (for nonlist Buttons) ==========


// ========== SELECTION LISTENER BEGIN ==========


document.addEventListener('selectionchange', () => {
    selectedText = window.getSelection().toString().trim();
});

document.addEventListener('touchend', () => {
    // Ein minimaler Timeout stellt sicher, dass das System die Auswahl finalisiert hat
    setTimeout(() => {
        if (selectedText.length > 0) {
            handleSelection(selectedText, selectedBook.currentPage);
        }

    }, 150);
});

// ========== SELECTION LISTENER END ==========


// ========== DATA LOGIC BEGIN ==========

async function deleteBook(bookId) {
    // 1. Remove from IndexedDB
    try {
        if (typeof deleteBookFile === 'function') {
            await deleteBookFile(bookId);
        }
    } catch (e) {
        console.error("Error deleting from DB:", e);
    }

    // 2. Remove from LocalStorage
    books = books.filter(b => b.id !== bookId);
    addStorage('my_library', books);

    // 3. Update UI
    displayBooks();
}
function deleteNote(index) {
    confirmTask(getTranslation('delete_note_confirm')).then(confirmed => {
        if (confirmed) {
            selectedBook.notes.splice(index, 1);
            const idx = books.findIndex(b => b.id === selectedBook.id || b.title === selectedBook.title);
            if (idx !== -1) {
                books[idx] = selectedBook;
                addStorage('my_library', books);
            }
            displayNotes();
        }
    });
}
async function handleSelection(text, cfiRange) {
    if (popupState.isOpen) return;

    openPopup('reader-modal');

    selectedText = text;
    selectedCfiRange = cfiRange;
    selectedTextTranslation = await translateText(selectedText, userLanguage);

    document.getElementById('translation').textContent = selectedTextTranslation;
}
async function askGeminiInPage() {
    // Zeige eventuell einen "Tippt gerade..." Status an
    const answer = await askGemini(systemPrompt, aiChatHistory);

    // Antwort im Format ['model', 'text'] speichern
    aiChatHistory.push(['model', answer]);

    displayAiChat();
}

// ========== DATA LOGIC END ==========

function toggleTheme() {
    readerTheme = (readerTheme === 'light') ? 'dark' : 'light';
    addStorage('readerTheme', readerTheme);
    applyTheme();
}
function applyTheme() {
    if (readerTheme === 'light') {
        document.documentElement.style.setProperty('--primary-color', 'white');
        document.documentElement.style.setProperty('--secondary-color', 'black');
    } else {
        document.documentElement.style.setProperty('--primary-color', 'black');
        document.documentElement.style.setProperty('--secondary-color', 'white');
    }


    if (!currentEpubRendition) return;

    currentEpubRendition.themes.register("dark", {
        body: {
            "background-color": "black !important",
            "color": "white !important",
            "-webkit-user-select": "text !important",
            "user-select": "text !important"
        },
        "::selection": { "background": "grey !important", "color": "white !important" },
        "::-moz-selection": { "background": "grey !important", "color": "white !important" }
    });
    currentEpubRendition.themes.register("light", {
        body: {
            "background-color": "white !important",
            "color": "black !important",
            "-webkit-user-select": "text !important",
            "user-select": "text !important"
        },
        "::selection": { "background": "grey !important", "color": "white !important" },
        "::-moz-selection": { "background": "grey !important", "color": "white !important" }
    });

    currentEpubRendition.themes.select(readerTheme);
}
async function confirmTask(confirmText) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmTaskModal');
        const textElement = document.getElementById('confirmTaskText');
        const confirmBtn = document.getElementById('confirmTaskButton');
        const cancelBtn = document.getElementById('cancelTaskButton');

        textElement.textContent = confirmText;
        openPopup('confirmTaskModal');

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            closePopup('confirmTaskModal');
        };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// ========== LIST UI DISPLAY BEGIN ==========

function displayLanguages() {
    const languageList = document.getElementById('language-list');
    languageList.innerHTML = '';
    languages.forEach(lang => {
        const li = document.createElement('text');
        li.className = 'languageText';
        li.textContent = lang.name;
        li.onclick = () => {
            selectLanguage(lang);
        };

        languageList.appendChild(li);
    });
}
function displayBooks() {
    const bookList = document.getElementById('bookList');
    if (!bookList) return;

    bookList.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.className = 'bookItem';

        const title = document.createElement('text');
        title.textContent = book.title;
        title.className = 'bookTitle';
        title.style.cursor = 'pointer';
        title.onclick = async () => { // async hinzugefügt, da DB-Zugriff asynchron ist
            selectedBook = book;
            showPage('reader');

            // Container leeren, falls vorher ein anderes Buch drin war
            document.getElementById("viewer").innerHTML = "";

            if (book.type === 'pdf') {
            } else if (book.type === 'epub') {
                try {
                    // 1. Hol das Blob aus der IndexedDB mit deiner Funktion
                    const fileBlob = await getBookFile(book.id);

                    if (!fileBlob) {
                        console.error("Datei nicht in der Datenbank gefunden.");
                        return;
                    }

                    // 2. epub.js initialisieren (akzeptiert Blobs direkt)
                    currentEpubBook = ePub(fileBlob);

                    currentEpubRendition = currentEpubBook.renderTo("viewer", {
                        width: "100%",
                        height: "100%",
                        flow: "paginated",
                        manager: "default"
                    });

                    applyTheme();

                    if (currentEpubRendition) {
                        currentEpubRendition.on("relocated", (location) => {
                            // location.start.cfi ist der String, den wir brauchen
                            const currentCfi = location.start.cfi;
                            selectedBook.currentPage = currentCfi;
                            books.forEach(book => {
                                if (book.id === selectedBook.id) {
                                    book.currentPage = currentCfi;
                                }
                            });
                            addStorage('my_library', books);
                        });


                        currentEpubRendition.on("selected", (cfiRange) => {
                            currentEpubBook.getRange(cfiRange).then((range) => {
                                const text = range.toString().trim();
                                if (text) {
                                    handleSelection(text, cfiRange);
                                }
                            });
                        });

                        document.addEventListener('selectionchange', () => {
                            selectedText = window.getSelection().toString().trim();
                        });

                        document.addEventListener('touchend', () => {
                            // Ein minimaler Timeout stellt sicher, dass das System die Auswahl finalisiert hat
                            setTimeout(() => {
                                if (selectedText.length > 0) {
                                    handleSelection(selectedText, selectedBook.currentPage);
                                }

                            }, 150);
                        });

                    };

                    // 3. Buch anzeigen
                    if (selectedBook.currentPage) {
                        currentEpubRendition.display(selectedBook.currentPage);
                    } else {
                        currentEpubRendition.display();
                    }

                } catch (error) {
                    console.error("Fehler beim Laden des Epubs:", error);
                }
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.className = 'bookDeleteButton';
        deleteButton.onclick = async (e) => {
            e.stopPropagation();
            const confirmed = await confirmTask(`${getTranslation('moechtest_du')}${book.title}${getTranslation('loeschen')}`);
            if (confirmed) {
                deleteBook(book.id);
            }
        };

        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'lucide';
        deleteIcon.setAttribute('data-lucide', 'trash-2');
        deleteButton.appendChild(deleteIcon);

        li.appendChild(title);
        li.appendChild(deleteButton);
        bookList.appendChild(li);
    });
    lucide.createIcons();
}
function displayNotes() { // clean
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    if (!selectedBook || !selectedBook.notes) return;

    selectedBook.notes.forEach((note, index) => {

        // Äußeres div mit Button rechts
        const noteNote = document.createElement('text');
        noteNote.className = 'noteNote';
        noteNote.textContent = note.note;

        // Inneres div mit Text und Note untereinander
        const noteText = document.createElement('text');
        noteText.className = "noteText";
        noteText.textContent = `"${note.text}"`;

        const noteLink = document.createElement('button');
        noteLink.className = 'noteLink';
        noteLink.onclick = () => {
            currentEpubRendition.display(note.currentPage);
            showPage('reader');
        };
        const linkIcon = document.createElement('i');
        linkIcon.className = 'lucide';
        linkIcon.setAttribute('data-lucide', 'book-open-text');
        noteLink.appendChild(linkIcon);

        // Button zum Löschen
        const button = document.createElement('button');
        button.className = 'noteDelete';
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'lucide';
        deleteIcon.setAttribute('data-lucide', 'trash-2');
        button.appendChild(deleteIcon);

        const noteButtonContainer = document.createElement('div');
        noteButtonContainer.className = 'noteButtonContainer';
        noteButtonContainer.appendChild(noteLink);
        noteButtonContainer.appendChild(button);

        // Button klickbar (Notiz löschen)
        button.onclick = (e) => {
            e.stopPropagation();
            deleteNote(index);
        };

        notesList.appendChild(noteNote);
        notesList.appendChild(noteText);
        notesList.appendChild(noteButtonContainer);
    });
    lucide.createIcons();
}
function displayAiChat() {
    const aiChatList = document.getElementById('aiChatList');
    if (!aiChatList) return;

    aiChatList.innerHTML = '';

    aiChatHistory.forEach(entry => {
        const li = document.createElement('li');
        const role = entry[0]; // 'user' oder 'model'
        const content = entry[1]; // Der Text

        if (role === 'user') {
            li.classList.add('user-message');
        } else {
            li.classList.add('model-message');
        }

        li.textContent = content;
        aiChatList.appendChild(li);
    });

    // Automatisches Scrollen nach unten
    aiChatList.scrollTop = aiChatList.scrollHeight;
}

// ========== LIST UI DISPLAY END ==========


// ========== APP START ==========

function appStart() {
    document.getElementById('selectedLanguage').textContent = userLanguage.name;

    applyTheme();
    setLanguage();
    displayBooks();
    showPage('booklist');

    if (apiKEY === '') {
        openPopup('apiKey-modal');
    }
}
document.addEventListener('DOMContentLoaded', appStart);