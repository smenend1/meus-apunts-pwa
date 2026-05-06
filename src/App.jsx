import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ⚠️ Torna a enganxar aquí la teva clau amb molta cura (sense espais extres)
  const GEMINI_API_KEY = "LAIzaSyBIDp_ei_K1dWZLblQQi7S7VkpzEe6a1ec";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: "environment" } } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error: Revisa els permisos de la càmera al navegador.");
    }
  };

  const processWithGemini = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || video.readyState !== 4) {
      alert("La càmera no està a punt.");
      return;
    }

    // Capturem la imatge
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64Image = imageData.split(',')[1];

    setLoading(true);
    setText("Connectant amb el cervell de Google...");

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Descriu detalladament tot el text que veus en aquesta imatge d'apunts. Si hi ha exercicis, resol-los. Respon sempre en català." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }],
          // Afegim configuració per evitar que la IA es bloquegi per seguretat
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      const data = await response.json();
      
      // Si la resposta és buida, mirem si hi ha un error estructural
      if (data.candidates && data.candidates[0].content) {
        setText(data.candidates[0].content.parts[0].text);
      } else if (data.error) {
        setText(`Error de Google: ${data.error.message}`);
      } else {
        setText("Google ha rebut la foto però no ha tornat text. Prova de moure una mica el paper o millorar la llum.");
      }
    } catch (error) {
      setText("Error crític de xarxa. Estàs connectat a internet?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      <h2 style={{ color: '#4285F4' }}>🧠 Apunts Intel·ligents</h2>
      
      <div style={{ maxWidth: '500px', margin: '0 auto', borderRadius: '15px', overflow: 'hidden', border: '3px solid #4285F4' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={btnS}>1. Activar</button>
        <button onClick={processWithGemini} disabled={loading} style={btnP}>
          {loading ? "Analitzant..." : "2. Envia a Gemini"}
        </button>
      </div>

      <div style={{ textAlign: 'left', backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <small style={{ color: '#999' }}>RESULTAT:</small>
        <div style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '15px' }}>{text}</div>
      </div>
    </div>
  );
}

const btnS = { padding: '12px 15px', marginRight: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ccc' };
const btnP = { padding: '12px 20px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default App;