import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error: No s'ha pogut accedir a la càmera");
    }
  };

  const captureAndProcess = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setLoading(true);
    Tesseract.recognize(canvas.toDataURL('image/png'), 'cat+spa')
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0070f3' }}>📸 Apunts a Digital</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px', borderRadius: '10px', backgroundColor: '#000' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={{ margin: '20px' }}>
        <button onClick={startCamera} style={btnStyle}>1. Obrir Càmera</button>
        <button onClick={captureAndProcess} style={{ ...btnStyle, backgroundColor: '#0070f3', color: 'white' }}>
          2. Digitalitzar
        </button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '15px', textAlign: 'left', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <strong>Text detectat:</strong>
        {loading ? <p>⏳ Llegint apunts...</p> : <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>}
      </div>
    </div>
  );
}

const btnStyle = { padding: '10px 20px', margin: '5px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc' };

export default App;