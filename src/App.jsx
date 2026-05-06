import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyBIDp_ei_K1dWZLblQQi7S7VkpzEe6a1ec";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" }, width: 1280, height: 720 } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error de càmera. Revisa els permisos.");
    }
  };

  const processWithGemini = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Captura d'alta qualitat
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];

    setLoading(true);
    setText("Analitzant com Gemini oficial...");

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Ets un assistent intel·ligent. Transcriu el text d'aquesta imatge. Si hi ha exercicis, resol-los si cal, o simplement passa-ho tot a net de forma estructurada. Respon en català." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content) {
        setText(data.candidates[0].content.parts[0].text);
      } else {
        // Si no hi ha resposta, mirem si hi ha un error de seguretat o de la clau
        setText("Resposta buida. Revisa si la API Key és correcta o si la imatge és massa borrosa.");
        console.log("Full response error:", data);
      }
    } catch (error) {
      setText("Error de xarxa o de servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#1a73e8' }}>✨ Escàner Tipus Gemini</h2>
      
      <div style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px', overflow: 'hidden', border: '2px solid #1a73e8' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={btnStyle}>1. Obrir Càmera</button>
        <button onClick={processWithGemini} disabled={loading} style={btnPri}>
          {loading ? "Pensant..." : "2. Analitzar amb IA"}
        </button>
      </div>

      <div style={{ textAlign: 'left', backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <strong>Resultat:</strong>
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{text}</div>
      </div>
    </div>
  );
}

const btnStyle = { padding: '12px', marginRight: '10px', borderRadius: '8px', cursor: 'pointer' };
const btnPri = { padding: '12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default App;