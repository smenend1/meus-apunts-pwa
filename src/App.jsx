import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ⚠️ Torna a posar la teva API KEY aquí
  const GEMINI_API_KEY = "AIzaSyAaXi8T8JMBf2epxzDBl3yj3HvolbrzA4k";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error de càmera: Revisa els permisos.");
    }
  };

  const processWithGemini = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || video.readyState !== 4) {
      alert("La càmera no està a punt.");
      return;
    }

    // Captura d'imatge
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    setText("Connectant amb Gemini...");

    try {
      // PROVEM AMB v1beta I EL MODEL gemini-1.5-flash (sense el -latest)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Ets un expert en transcripció. Transcriu aquests apunts a text net en català. Si hi ha fórmules o exercicis, explica'ls o resol-los." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        setText(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        // Si torna a donar error de model, intentarem un "pla B" automàtic
        setText(`Error de Google: ${data.error.message}\n(Codi: ${data.error.code})`);
      } else {
        setText("No s'ha rebut text. Prova de fer la foto més clara.");
      }
    } catch (error) {
      setText("Error de xarxa. Comprova la teva connexió.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#4285F4' }}>🚀 Escàner amb Gemini AI</h2>
      
      <div style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px', overflow: 'hidden', border: '3px solid #4285F4' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={{ padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', marginRight: '10px' }}>
          1. Activar Càmera
        </button>
        <button onClick={processWithGemini} disabled={loading} style={{ padding: '12px 20px', background: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
          {loading ? "Processant..." : "2. Analitzar amb IA"}
        </button>
      </div>

      <div style={{ textAlign: 'left', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <strong>Resultat:</strong>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{text}</p>
      </div>
    </div>
  );
}

export default App;