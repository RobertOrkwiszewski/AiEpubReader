
// parser.js - Revised
// Ersetzt text extraction durch blob storage

const fileInput = document.getElementById('file-upload');

if (fileInput) {
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let fileType = 'unknown';
        if (file.type === "application/pdf") {
            fileType = 'pdf';
        } else if (file.name.endsWith(".epub")) {
            fileType = 'epub';
        }

        if (fileType === 'unknown') {
            alert("Nur PDF (.pdf) und EPUB (.epub) Dateien werden unterstützt.");
            return;
        }

        const bookId = Date.now().toString(); // Eindeutige ID (Timestamp)

        try {
            // 1. Speichern in IndexedDB
            await saveBookFile(bookId, file);

            // 2. Metadaten erstellen
            const newBook = {
                id: bookId,
                title: file.name.replace(/\.[^/.]+$/, ""), // Extension entfernen
                type: fileType,
                notes: [],
                currentPage: null // Kann auch String sein bei EPUB
            };

            // 3. In localStorage Library speichern
            let library = getStorage('my_library') || [];
            library.push(newBook);
            addStorage('my_library', library);

            // 4. UI update
            if (typeof books !== 'undefined') {
                books = library; // Update global state
            }
            if (typeof displayBooks === 'function') {
                displayBooks();
            } else {
                location.reload();
            }

        } catch (error) {
            console.error("Fehler beim Speichern:", error);
            alert("Fehler beim Speichern des Buches. Bitte versuche es erneut.");
        }
    };
}