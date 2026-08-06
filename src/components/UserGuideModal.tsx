import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Building2, 
  Users, 
  Sparkles, 
  FileText, 
  CheckSquare, 
  Download, 
  X, 
  ShieldCheck
} from 'lucide-react';
import { HospitalConfig } from '../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalConfig: HospitalConfig;
  onOpenHospitalSettings?: () => void;
  onOpenAIPaste?: () => void;
}

export default function UserGuideModal({
  isOpen,
  onClose,
  hospitalConfig,
  onOpenHospitalSettings,
  onOpenAIPaste
}: UserGuideModalProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/20">
                คู่มือการใช้งานสำหรับผู้เริ่มต้น (Beginner Guide)
              </span>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                ขั้นตอนการใช้งานระบบบันทึกปริมาณรังสี & รายงานสำหรับโรงพยาบาลใหม่
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap gap-1 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 1 
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">1</span>
            <span>1. ตั้งค่าโรงพยาบาล</span>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 2 
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>2. เพิ่มทะเบียนเจ้าหน้าที่</span>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 3 
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>3. บันทึก/นำเข้าผลรังสี</span>
          </button>

          <button
            onClick={() => setActiveStep(4)}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeStep === 4 
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">4</span>
            <span>4. เซ็นชื่อ & ออกรายงาน</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm leading-relaxed">
          
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                <Building2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-850 text-base">ขั้นตอนที่ 1: ตั้งค่าโปรไฟล์และหัวหน้างานของโรงพยาบาล</h3>
                  <p className="text-xs text-slate-600">
                    เพื่อปรับแต่งแอปให้กลายเป็นระบบของโรงพยาบาลท่านโดยเฉพาะ ระบบจะนำข้อมูลนี้ไปสร้างหัวเอกสารราชการ ท้ายตาราง และหนังสือบันทึกข้อความเสนอผู้อำนวยการโดยอัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> ข้อมูลที่ต้องระบุสำหรับโรงพยาบาลใหม่:
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-5">
                    <li><strong className="text-slate-800">ชื่อโรงพยาบาล:</strong> เช่น โรงพยาบาลตัวอย่าง, โรงพยาบาลสาธิต</li>
                    <li><strong className="text-slate-800">จังหวัด / รหัสไปรษณีย์:</strong> สำหรับส่วนหัวจดหมายสารบรรณ</li>
                    <li><strong className="text-slate-800">เลขที่หนังสือราชการ:</strong> เช่น สธ 0033.101/ หรือ สธ 0221/</li>
                    <li><strong className="text-slate-800">ชื่อ-ตำแหน่ง หัวหน้างานรังสีเทคนิค:</strong> ผู้ตรวจสอบทางเทคนิค</li>
                    <li><strong className="text-slate-800">ชื่อ-ตำแหน่ง ผู้อำนวยการโรงพยาบาล:</strong> ผู้อนุมัติและสั่งการ</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">ทางลัดปฏิบัติการ</span>
                    <h5 className="font-bold text-slate-800 text-sm mt-0.5">เปิดหน้าตั้งค่าองค์กรทันที</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      คุณสามารถคลิกปุ่มด้านล่างเพื่อปรับเปลี่ยนชื่อโรงพยาบาล ลบข้อมูลตัวอย่าง และเริ่มใช้งานจริงได้ทันที
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenHospitalSettings();
                    }}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" /> ไปยังหน้าตั้งค่าโปรไฟล์โรงพยาบาล
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                <Users className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-850 text-base">ขั้นตอนที่ 2: จัดการทำเนียบบุคลากรและสถิติย้อนหลัง (Staff Registry)</h3>
                  <p className="text-xs text-slate-600">
                    เพิ่มรายชื่อเจ้าหน้าที่ผู้สัมผัสรังสีแยกตามหน่วยงานสังกัด เช่น แผนกรังสีเทคนิค, ทันตกรรม, หรือผู้ช่วยเหลือคนไข้ (งานเปล)
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" /> วิธีเพิ่มรายชื่อบุคลากรใหม่:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                    <li>ไปที่เมนู <strong className="text-slate-800">"ทะเบียนประวัติแยกแผนก"</strong> ในแถบด้านข้าง</li>
                    <li>คลิกปุ่ม <strong className="text-blue-600">+ ลงทะเบียนบุคลากรใหม่</strong></li>
                    <li>กรอกชื่อ-นามสกุล, ตำแหน่งวิชาชีพ, และเลือกแผนกสังกัด</li>
                    <li>หากมีสถิติรังสีสะสมย้อนหลัง (ปี 2563 - 2569) สามารถใส่ตัวเลขปริมาณรังสีสะสม (uSv) เพื่อให้ระบบวาดแนวโน้มกราฟอัตโนมัติได้</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                <Sparkles className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-850 text-base">ขั้นตอนที่ 3: บันทึกข้อมูลปริมาณรังสี & ระบบนำเข้าอัจฉริยะ (Smart AI Paste)</h3>
                  <p className="text-xs text-slate-600">
                    เลือกใช้วิธีบันทึกข้อมูลปริมาณรังสีสะสมประจำรอบเดือน Hp(10), Hp(0.07), Hp(3) ได้ 3 รูปแบบตามความสะดวก
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold text-slate-800">บันทึกทีละรายการ (Manual Entry)</h4>
                  <p className="text-slate-500 text-[11px]">
                    ป้อนค่ารังสี Hp(10), เลขวิเคราะห์แลป และรอบเดือนผ่านแบบฟอร์มในเมนู "รายงานและจัดการบุคลากร"
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold text-blue-900 flex items-center gap-1">
                    Smart AI Paste <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  </h4>
                  <p className="text-slate-600 text-[11px]">
                    คัดลอกตารางจาก PDF หรือ Excel ของกรมวิทยาศาสตร์การแพทย์ มาวางในช่องข้อความ AI จะแกะรายชื่อและตัวเลขลงระบบให้อัตโนมัติ
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAIPaste();
                  }}
                  className="py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition hover:opacity-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> ทดลองใช้งานระบบ Smart AI Paste
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
                <FileText className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-850 text-base">ขั้นตอนที่ 4: ลงนามลายมือชื่อออนไลน์ & ออกรายงานสารบรรณ PDF</h3>
                  <p className="text-xs text-slate-600">
                    ระบบลงนามอิเล็กทรอนิกส์พร้อมรหัสทรานเซกชัน (Verification Hash) สำหรับหัวหน้างานรังสีเทคนิคและผู้อำนวยการ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> การลงนามออนไลน์ 2 รูปแบบ:
                  </h4>
                  <ul className="space-y-2 text-slate-600">
                    <li><strong className="text-slate-800">1. วาดลายมือชื่อด้วยมือ/เมาส์ (Digital Canvas):</strong> เซ็นผ่านหน้าจอมือถือ แท็บเล็ต หรือเมาส์</li>
                    <li><strong className="text-slate-800">2. อนุมัติผ่านระบบสารบรรณ (Quick Auth):</strong> คลิกอนุมัติเร็วสำหรับผู้อำนวยการ พร้อมฝังเวลาและรหัสตรวจสอบดิจิทัล</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" /> พิมพ์รายงาน PDF บันทึกข้อความ:
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    เมื่อลงนามครบเรียบร้อย สามารถคลิกปุ่ม <strong className="text-slate-800">"เปิดและบันทึก PDF ด้วย Google PDF"</strong> เพื่อพิมพ์รายงานเสนอผู้อำนวยการแบบทางการตามมาตรฐานหนังสือราชการกระทรวงสาธารณสุข
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ระบบรองรับการปฏิบัติงานของโรงพยาบาลชุมชนและโรงพยาบาลศูนย์ทั่วประเทศ</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            รับทราบและปิดคู่มือ
          </button>
        </div>

      </div>
    </div>
  );
}
