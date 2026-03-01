// askGemini() ist gevibecoded
async function askGemini(systemPrompt, history, selectedModel = 'gemini-2.0-flash') {
    const apiKey = apiKEY;
    if (!apiKey) return "Fehler: Kein API-Key.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    // Wir bauen das JSON-Objekt zusammen
    const requestBody = {
        // HIER kommt die Verhaltensanweisung rein:
        "system_instruction": {
            "parts": [
                { "text": systemPrompt }
            ]
        },
        // Hier kommt der eigentliche Chat-Verlauf rein:
        "contents": history.map(item => ({
            "role": item[0],
            "parts": [{ "text": item[1] }]
        }))
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Fehler:", error);
        return `Fehler: ${error.message || "Unbekannter Fehler"}`;
    }
}

async function translateText(textToTranslate, targetLang) {

    const systemPrompt = `Du bist ein professioneller Übersetzer. 
    Übersetze den folgenden Text präzise in die Sprache: ${targetLang.name}. 
    Gib NUR die reine Übersetzung zurück. 
    Keine Einleitung ("Hier ist die Übersetzung:"), keine Anführungszeichen und keine Kommentare.`;

    const history = [
        ['user', textToTranslate]
    ];

    const translation = await askGemini(systemPrompt, history);

    return translation.trim();
}