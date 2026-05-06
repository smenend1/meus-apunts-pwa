import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ⚠️ POSA AQUÍ LA TEVA CLAU API DE GOOGLE AI STUDIO
  const GEMINI_API_KEY = "AIzaSyBIDp_ei_K1dWZLblQQi7S7VkpzEe6a1ec";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Error: No s'ha pogut accedir a la càmera.");
    }
  };

  const processWithGemini = async () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertim la imatge a format Base64 que és el que entén la IA
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    setLoading(true);
    setText("El cervell de Gemini està analitzant la teva foto...");

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Ets un expert en transcripció d'apunts. Mira la imatge i extreu-ne el text. Si és un esquema, manté l'estructura. Si hi ha errors ortogràfics, corregeix-los. Respon només amb el text dels apunts en català." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setText(data.candidates[0].content.parts[0].text);
      } else {
        setText("La IA no ha pogut llegir el text. Prova amb una altra foto.");
      }
    } catch (error) {
      console.error(error);
      setText("Error de connexió amb Gemini. Revisa la teva API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <h1 style={{ color: '#0070f3' }}>🚀 Apunts amb Gemini AI</h1>
      <p style={{ color: '#666' }}>Molt més potent que un escàner normal</p>
      
      <div style={{ position: 'relative', maxWidth: '500px', margin: '20px auto', borderRadius: '15px', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', backgroundColor: '#000' }} />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ marginBottom: '20px' }}>
        <button onClick={startCamera} style={btnWhite}>1. Activar Càmera</button>
        <button onClick={processWithGemini} disabled={loading} style={btnBlue}>
          {loading ? "Analitzant..." : "2. Digitalitzar amb IA"}
        </button>
      </div>

      <div style={{ textAlign: 'left', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minHeight: '200px' }}>
        <strong style={{ color: '#0070f3' }}>RESULTAT INTEL·LIGENT:</strong>
        <p style={{ whiteSpace: 'pre-wrap', marginTop: '15px', lineHeight: '1.6' }}>{text}</p>
      </div>
    </div>
  );
}

const btnWhite = { padding: '12px 20px', marginRight: '10px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold' };
const btnBlue = { padding: '12px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

export default App;