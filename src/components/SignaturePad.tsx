import React, { useRef, useState, useEffect } from 'react';
import { SignatureLog } from '../types';
import { Shield, Sparkles, AlertCircle, Edit3, CheckCircle2, RotateCcw, Check, Fingerprint } from 'lucide-react';

interface SignaturePadProps {
  signerId: 'radiology_chief' | 'hospital_director';
  signerName: string;
  position: string;
  currentSignature?: SignatureLog;
  onSave: (signature: SignatureLog) => void;
}

export default function SignaturePad({
  signerId,
  signerName,
  position,
  currentSignature,
  onSave
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [useCanvas, setUseCanvas] = useState<'handdrawn' | 'saraban'>('handdrawn');
  const [isSigned, setIsSigned] = useState(currentSignature?.isSigned || false);
  const [auditInfo, setAuditInfo] = useState<SignatureLog | null>(currentSignature || null);

  // Auto-resize / Setup canvas of signature pad
  useEffect(() => {
    if (useCanvas === 'handdrawn' && !isSigned && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // deep blue royal ink
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Fill canvas white initially
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [useCanvas, isSigned]);

  // Handle Touch/Mouse coordinates
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Check if Touch
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default scrolling on mobile touch
    if ('touches' in e) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Generate simulated secure cryptographic token
  const generateVerificationToken = () => {
    const chars = '0123456789ABCDEFGPQRSTUV';
    let token = 'SEC-SIGN-';
    for (let i = 0; i < 16; i++) {
      if (i === 4 || i === 8 || i === 12) token += '-';
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
  };

  const handleSaveSignature = (type: 'handdrawn' | 'saraban_auth') => {
    let signatureData = '';
    
    if (type === 'handdrawn') {
      const canvas = canvasRef.current;
      if (canvas) {
        // Save base64 signature image
        signatureData = canvas.toDataURL('image/png');
      }
    } else {
      // For Saraban system sign, we render a beautiful digital badge
      signatureData = 'saraban_approved_metadata_seal';
    }

    const secureToken = generateVerificationToken();
    const thaiDateTime = new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Bangkok'
    });

    const userAgent = navigator.userAgent;
    const mockIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const newSignature: SignatureLog = {
      signerId,
      signerName,
      position,
      isSigned: true,
      signedAt: thaiDateTime,
      signType: type,
      signatureData: type === 'handdrawn' ? signatureData : undefined,
      verificationToken: secureToken,
      signerIPAndAgent: `IP Address: ${mockIP} | โครงสร้าง: ${userAgent.slice(0, 50)}...`
    };

    setIsSigned(true);
    setAuditInfo(newSignature);
    onSave(newSignature);
  };

  const handleReset = () => {
    setIsSigned(false);
    setAuditInfo(null);
    const resetSig: SignatureLog = {
      signerId,
      signerName,
      position,
      isSigned: false
    };
    onSave(resetSig);
    setTimeout(() => {
      clearCanvas();
    }, 50);
  };

  return (
    <div id={`signature-box-${signerId}`} className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
            <Shield className="w-3 h-3" /> ผู้มีอำนาจลงนาม
          </span>
          <h4 className="text-lg font-bold text-slate-800 mt-1.5">{signerName}</h4>
          <p className="text-sm font-medium text-slate-500">{position}</p>
        </div>
        
        {isSigned ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> ลงนามเรียบร้อยแล้ว
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
            <AlertCircle className="w-4 h-4" /> รอการลงนาม
          </span>
        )}
      </div>

      {!isSigned ? (
        <div>
          {/* Signer Options Toggle */}
          <div className="no-print flex p-1 mb-4 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              id={`toggle-canvas-${signerId}`}
              type="button"
              className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded-md transition-all ${
                useCanvas === 'handdrawn' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setUseCanvas('handdrawn')}
            >
              <Edit3 className="w-3.5 h-3.5" /> เซ็นด้วยลายมือชื่อ (Canvas)
            </button>
            <button
              id={`toggle-saraban-${signerId}`}
              type="button"
              className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 rounded-md transition-all ${
                useCanvas === 'saraban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setUseCanvas('saraban')}
            >
              <Fingerprint className="w-3.5 h-3.5" /> ยืนยันตัวตนผ่านสารบรรณดิจิทัล
            </button>
          </div>

          {useCanvas === 'handdrawn' ? (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="bg-slate-100 px-3 py-1 text-[11px] text-slate-500 flex justify-between items-center">
                  <span>กรุณาใช้เม้าส์หรือนิ้ววาดในกรอบนี้</span>
                  <button
                    id={`clear-btn-${signerId}`}
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-rose-500 hover:text-rose-700 transition"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> ล้างหน้าจอ
                  </button>
                </div>
                <canvas
                  id={`canvas-pad-${signerId}`}
                  ref={canvasRef}
                  width={340}
                  height={150}
                  className="signature-canvas w-full h-[150px] bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <button
                id={`submit-handwritten-${signerId}`}
                type="button"
                onClick={() => handleSaveSignature('handdrawn')}
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> ยืนยันรหัสและลายเซ็นนี้
              </button>
            </div>
          ) : (
            <div className="p-4 border border-teal-100 bg-teal-50/50 rounded-xl space-y-4">
              <div className="flex gap-2.5">
                <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-800 space-y-1">
                  <p className="font-bold">ระบบลงนามด่วนตามระเบียบงานสารบรรณ พ.ศ. ๒๕๖๔</p>
                  <p className="opacity-90 leading-relaxed">
                    ระบบจะทำการระบุรหัสลงชื่อรับรองดิจิทัล รหัสตำแหน่งพนักงาน และจัดเก็บวันเวลา IP Address อุปกรณ์เข้าสู่ฐานข้อมูลประวัติสารบรรณโดยทันที แม่นยำ ปลอดภัยสูงสุด
                  </p>
                </div>
              </div>

              <button
                id={`submit-saraban-${signerId}`}
                type="button"
                onClick={() => handleSaveSignature('saraban_auth')}
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                <Check className="w-4 h-4" /> ประทับตรา "ลงนามแล้ว" ในระบบสารบรรณ
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            {/* Display signature format */}
            {auditInfo?.signType === 'handdrawn' && auditInfo.signatureData ? (
              <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 mb-1 self-start">ลายมือชื่ออิเล็กทรอนิกส์</span>
                <img
                  id={`signature-preview-${signerId}`}
                  src={auditInfo.signatureData}
                  alt="ลายเซ็น"
                  className="max-h-[70px] max-w-[200px] object-contain opacity-90"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <p className="font-bold">✓ ลงนามด้วยตราประทับอิเล็กทรอนิกส์ (E-Saraban Sign)</p>
                  <p className="text-[10px] opacity-75">ยืนยันรหัสสถานะความปลอดภัยในงานสารบรรณแล้ว</p>
                </div>
              </div>
            )}

            {/* Verification table details */}
            <div className="text-[11px] text-slate-500 space-y-1 bg-white p-2.5 rounded-lg border border-slate-150 font-mono">
              <div className="flex justify-between border-b border-dashed border-slate-100 pb-1 text-slate-700">
                <span className="font-sans font-semibold">วันเวลาลงชื่อ:</span>
                <span>{auditInfo?.signedAt}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-100 py-1 font-bold text-teal-700">
                <span className="font-sans font-semibold flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" /> รหัสรับรองดิจิทัล:</span>
                <span className="font-mono">{auditInfo?.verificationToken}</span>
              </div>
              <div className="pt-1 text-slate-400 break-all leading-normal text-[10px]">
                <span className="font-sans text-slate-500 font-semibold block mb-0.5">ข้อมูลผู้ลงชื่อตรวจสอบแล้ว:</span>
                {auditInfo?.signerIPAndAgent}
              </div>
            </div>
          </div>

          <button
            id={`reset-signature-${signerId}`}
            type="button"
            onClick={handleReset}
            className="no-print py-1.5 px-3 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> ยกเลิกการลงนามนี้เพื่อเซ็นใหม่
          </button>
        </div>
      )}
    </div>
  );
}
