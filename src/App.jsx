import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ⚠️ Torna a enganxar la clau aquí (assegura't que no hi hagi espais al final)
  const GEMINI_API_KEY = "AIzaSyAaXi8T8JMBf2epxzDBl3yj3HvolbrzA4k";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error de càmera: Revisa els permisos.");
    }
  };

  const processWithGemini = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.readyState !== 4) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    setText("Analitzant...");

    try {
      // HEM CANVIAT A v1 i gemini-1.5-flash (la combinació més estable)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Ets un expert en transcripció d'apunts. Analitza la imatge i passa el contingut a net en català." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();

      if (data.candidates && data.candidates[0].content) {
        setText(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        setText(`Google diu: ${data.error.message}`);
      } else {
        setText("No s'ha rebut text. Prova de nou.");
      }
    } catch (err) {
      setText("Error de xarxa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#4285F4' }}>📸 Escàner Apunts</h2>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '500px', borderRadius: '15px', border: '2px solid #4285F4' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={{ padding: '10px' }}>Obrir</button>
        <button onClick={processWithGemini} disabled={loading} style={{ padding: '10px', background: '#4285F4', color: 'white', border: 'none', marginLeft: '10px' }}>
          {loading ? "Analitzant..." : "Digitalitzar"}
        </button>
      </div>
      <div style={{ textAlign: 'left', background: 'white', padding: '15px', border: '1px solid #ddd' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}

export default App;