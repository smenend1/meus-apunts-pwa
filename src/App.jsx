import React, { useState, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
    setText("Provant de connectar amb el cervell de la IA...");

    // Llista de models per provar en ordre de modernitat
    const modelsToTry = [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro-vision"
    ];

    let success = false;
    let lastError = "";

    for (const model of modelsToTry) {
      if (success) break;
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Ets un expert en apunts. Transcriu el text d'aquesta imatge en català, neteja errors i resol exercicis si n'hi ha." },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
              ]
            }]
          })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
          setText(data.candidates[0].content.parts[0].text);
          success = true;
        } else if (data.error) {
          lastError = data.error.message;
          console.log(`Model ${model} ha fallat:`, lastError);
        }
      } catch (err) {
        lastError = "Error de xarxa";
      }
    }

    if (!success) {
      setText(`❌ No hem pogut connectar. Google diu: ${lastError}\n\nConsell: Revisa que la teva API KEY sigui correcta.`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1a73e8' }}>🚀 Escàner Intel·ligent</h2>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '500px', borderRadius: '15px', border: '3px solid #1a73e8' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={btnS}>1. Activar Càmera</button>
        <button onClick={processWithGemini} disabled={loading} style={btnP}>
          {loading ? "Provant models..." : "2. Digitalitzar"}
        </button>
      </div>
      <div style={{ textAlign: 'left', background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
      </div>
    </div>
  );
}

const btnS = { padding: '12px', marginRight: '10px', borderRadius: '8px', cursor: 'pointer' };
const btnP = { padding: '12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' };

export default App;