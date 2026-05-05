import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      // Forcem la càmera del darrere amb "ideal" per a millor qualitat
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Error: No es pot accedir a la càmera. Revisa els permisos del navegador.");
    }
  };

  const captureAndProcess = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Captura en alta resolució per evitar que la IA "s'inventi" lletres
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setLoading(true);
    // 'cat+spa' per detectar català i castellà millor
    Tesseract.recognize(canvas.toDataURL('image/png'), 'cat+spa')
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ color: '#1a73e8' }}>📸 Lector d'Apunts HD</h2>
      
      <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginBottom: '15px' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block', backgroundColor: '#000' }} />
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={startCamera} style={btnStyle}>1. Activar Càmera</button>
        <button onClick={captureAndProcess} style={{ ...btnStyle, backgroundColor: '#1a73e8', color: 'white' }}>
          2. Llegir Text
        </button>
      </div>

      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', textAlign: 'left', minHeight: '150px', border: '1px solid #ddd' }}>
        <small style={{ color: '#666' }}>TEXT DETECTAT:</small>
        {loading ? <p style={{ color: '#1a73e8' }}>⏳ Processant amb alta precisió...</p> : <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{text}</p>}
      </div>
    </div>
  );
}

const btnStyle = { padding: '12px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };

export default App;