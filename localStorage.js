function addStorage(key, value) {
    try {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error("Fehler beim Speichern im LocalStorage:", error);
    }
}
// Holt Daten ab und wandelt sie direkt wieder in ein JS-Objekt um
function getStorage(key) {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (error) {
        // Falls es kein JSON ist (einfacher String), gib den Rohwert zurück
        return data;
    }
}
function deleteStorage(key) {
    localStorage.removeItem(key);
}