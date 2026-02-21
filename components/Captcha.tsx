
import React, { useEffect, useRef, useState } from 'react';
import { dataIds, colors } from '../config';

interface Props {
  onVerify: (isValid: boolean) => void;
  refreshKey?: number;
}

const Captcha: React.FC<Props> = ({ onVerify, refreshKey = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let text = '';
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setUserInput(''); 
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [refreshKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Noise
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Lines
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Text rendering
    ctx.textBaseline = 'middle';
    const charWidth = 24;
    const startX = (canvas.width - (captchaText.length * charWidth)) / 2 + 5;

    for (let i = 0; i < captchaText.length; i++) {
      ctx.save();
      const fontSize = 26 + Math.random() * 10;
      ctx.font = `900 ${fontSize}px "Times New Roman", serif`;
      const x = startX + i * charWidth;
      const y = (canvas.height / 2) + (Math.random() * 12 - 6);
      
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.8);
      
      const scaleX = 0.8 + Math.random() * 0.4;
      const scaleY = 0.8 + Math.random() * 0.4;
      ctx.scale(scaleX, scaleY);

      ctx.fillStyle = `rgba(0,0,0,0.1)`;
      ctx.fillText(captchaText[i], 2, 2);
      
      ctx.fillStyle = '#1d1d1f';
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }
  }, [captchaText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    onVerify(val === captchaText);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
        <div 
          className="relative cursor-pointer shrink-0 group border-2 border-[#d2d2d7] rounded-[14px] overflow-hidden shadow-sm hover:border-[#0071e3] transition-all bg-white" 
          onClick={generateCaptcha}
        >
          <canvas ref={canvasRef} width="150" height="64" className="bg-white" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="text-white font-black text-[10px] uppercase tracking-widest">New Code</span>
          </div>
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="ENTER CODE"
          className="w-full sm:flex-1 px-6 py-4 bg-white border border-[#d2d2d7] rounded-[14px] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-blue-50/50 font-black text-2xl tracking-[0.4em] uppercase shadow-sm transition-all placeholder:tracking-normal placeholder:text-slate-200"
        />
      </div>
      <p className="text-[11px] font-black text-[#86868b] mt-6 text-center sm:text-left uppercase tracking-[0.6em] opacity-80 reveal-node">
        HUMAN VERIFIED
      </p>
    </div>
  );
};

export default Captcha;
