/*
- nicht zusammenhängend mit den anderen files
*/

async function saveData() {

    let books = getStorage('my_library') || [];
    let bookFiles = [];

    // Lade alle EPUB/PDF-Dateien (Blobs) aus der IndexedDB (db.js)
    for (let book of books) {
        if (typeof getBookFile === 'function') {
            let fileBlob = await getBookFile(book.id);
            if (fileBlob) {
                // Ein FileBlob kann nicht direkt in JSON gespeichert werden. 
                // Wir wandeln ihn deshalb in einen Base64-String um!
                let base64Data = await blobToBase64(fileBlob);
                bookFiles.push({
                    id: book.id,
                    fileData: base64Data
                });
            }
        }
    }

    let data = {
        books: books,
        bookFiles: bookFiles // Hier sind nun die eigentlichen Buch-Dateien
    };

    if (books.length > 0 && bookFiles.length > 0) {
        let json = JSON.stringify(data, null, 2); // Schön formatiert mit 2 Leerzeichen

        try {
            // Direkter lokaler Download (ignoriert showSaveFilePicker)
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dataSaveAiEpubReader.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("Erfolgreich als Download gespeichert!");
            alert("Die Datei wurde als 'dataSave.json' in deinen Downloads-Ordner heruntergeladen.");
        } catch (error) {
            console.error("Fehler beim Herunterladen:", error);
            alert("Fehler beim Erstellen des Downloads:\n" + (error.message || "Unbekannter Fehler."));
        }
    } else {
        alert("Es gibt keine Bücher zum Speichern!");
    }
}

// Hilfsfunktion: Wandelt FileBlobs zu Base64-Text um
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Gibt Base64 zurück
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Hilfsfunktion: Wandelt Base64 zurück in FileBlob
function base64ToBlob(base64) {
    return new Promise((resolve, reject) => {
        try {
            // Schneidet das "data:application/epub+zip;base64," ab, falls es existiert
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/octet-stream' });
            resolve(blob);
        } catch (error) {
            reject(error);
        }
    });
}