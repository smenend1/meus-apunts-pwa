import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ⚠️ Enganxa la teva API KEY aquí
  const GEMINI_API_KEY = "AIzaSyAaXi8T8JMBf2epxzDBl3yj3HvolbrzA4k";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error: Revisa els permisos de la càmera.");
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
    setText("Analitzant amb la tecnologia de Gemini...");

    try {
      // Intentem amb la versió v1beta i el model gemini-1.5-flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Ets un expert en OCR. Transcriu el text d'aquesta imatge en català. Si hi ha apunts o exercicis, passa'ls a net i resol-los si cal." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        setText(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        // Si encara dona error de "model not found", provarem de posar "gemini-1.5-flash-latest"
        setText(`Error de Google: ${data.error.message}`);
      } else {
        setText("No s'ha obtingut resposta. Intenta-ho de nou.");
      }
    } catch (error) {
      setText("Error de connexió.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0070f3' }}>🚀 Apunts Intel·ligents</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px', borderRadius: '15px' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={{ padding: '12px', marginRight: '10px' }}>1. Obrir</button>
        <button onClick={processWithGemini} disabled={loading} style={{ padding: '12px', backgroundColor: '#0070f3', color: 'white', borderRadius: '8px', border: 'none' }}>
          {loading ? "Processant..." : "2. Digitalitzar amb IA"}
        </button>
      </div>
      <div style={{ textAlign: 'left', background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}

export default App;
