import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  Trash2, 
  RefreshCw, 
  Download, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  Shield,
  Briefcase
} from 'lucide-react';
import { HospitalConfig, ReportSettings } from '../types';

interface HospitalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalConfig: HospitalConfig;
  onSaveHospitalConfig: (config: HospitalConfig) => void;
  reportSettings?: ReportSettings;
  onSaveReportSettings?: (settings: ReportSettings) => void;
  onResetToBlank: (hospitalName: string, province: string) => void;
  onResetToDemo?: () => void;
  onImportBackup?: (importedData: any) => void;
}

export default function HospitalSettingsModal({
  isOpen,
  onClose,
  hospitalConfig,
  onSaveHospitalConfig,
  reportSettings,
  onSaveReportSettings,
  onResetToBlank,
  onResetToDemo,
  onImportBackup
}: HospitalSettingsModalProps) {
  const [config, setConfig] = useState<HospitalConfig>(hospitalConfig);
  const [settings, setSettings] = useState<ReportSettings>(reportSettings || {
    documentId: 'สธ ๐๖๐๕/๒๕๖๙',
    documentDate: '1 เมษายน 2569',
    subject: 'รายงานผลการประเมินการได้รับปริมาณรังสีสะสมของผู้ปฏิบัติงาน',
    attention: 'ผู้อำนวยการโรงพยาบาล',
    reportNo: '2569WS126-101364',
    monthRangeText: 'ธันวาคม 2568 ถึง กุมภาพันธ์ 2569'
  });
  const [showBlankPrompt, setShowBlankPrompt] = useState(false);
  const [newHospName, setNewHospName] = useState('');
  const [newProvince, setNewProvince] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setConfig(hospitalConfig);
      if (reportSettings) {
        setSettings(reportSettings);
      }
    }
  }, [isOpen, hospitalConfig, reportSettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save Hospital Config
    onSaveHospitalConfig(config);

    // Synchronize attention and document ID in ReportSettings
    if (onSaveReportSettings) {
      const updatedSettings: ReportSettings = {
        ...settings,
        documentId: config.documentIdPrefix || settings.documentId,
        attention: `ผู้อำนวยการ${config.hospitalName || "โรงพยาบาล"}`
      };
      onSaveReportSettings(updatedSettings);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleCreateBlankHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลแห่งใหม่');
      return;
    }
    onResetToBlank(newHospName.trim(), newProvince.trim());
    setShowBlankPrompt(false);
    alert(`สร้างระบบสำหรับ "${newHospName}" เสร็จสิ้น! ขณะนี้เป็นฐานข้อมูลว่างเปล่าพร้อมลงทะเบียนบุคลากรใหม่`);
    onClose();
  };

  const handleExportBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      hospitalConfig: config,
      reportSettings: settings,
      staffMembers: localStorage.getItem('radiation_app_staff_members') ? JSON.parse(localStorage.getItem('radiation_app_staff_members')!) : [],
      doseRecords: localStorage.getItem('radiation_app_dose_records') ? JSON.parse(localStorage.getItem('radiation_app_dose_records')!) : [],
      signatures: localStorage.getItem('radiation_app_signatures') ? JSON.parse(localStorage.getItem('radiation_app_signatures')!) : {}
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hospital_backup_${config.hospitalName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.hospitalConfig) {
            onImportBackup(parsed);
            alert("นำเข้าสำรองข้อมูลโรงพยาบาลสำเร็จแล้ว!");
            onClose();
          } else {
            alert("รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง");
          }
        } catch (err) {
          alert("ไม่สามารถอ่านไฟล์ JSON ดังกล่าวได้");
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/20">
                Admin Center
              </span>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                ตั้งค่าโปรไฟล์โรงพยาบาล & ผู้ดูแลระบบ (Hospital Settings)
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Saved Notification */}
          {savedSuccess && (
            <div className="bg-emerald-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-fadeIn">
              <CheckCircle className="w-5 h-5" />
              <span>บันทึกการตั้งค่าโปรไฟล์โรงพยาบาลเรียบร้อยแล้ว!</span>
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" /> ข้อมูลทั่วไปของโรงพยาบาล
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อโรงพยาบาล</label>
                <input
                  type="text"
                  value={config.hospitalName}
                  onChange={(e) => setConfig({ ...config, hospitalName: e.target.value })}
                  placeholder="เช่น โรงพยาบาลตัวอย่าง, โรงพยาบาลสาธิต"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">กลุ่มงาน / แผนกสังกัด</label>
                <input
                  type="text"
                  value={config.departmentName}
                  onChange={(e) => setConfig({ ...config, departmentName: e.target.value })}
                  placeholder="เช่น กลุ่มงานรังสีเทคนิค, แผนกรังสีวิทยา"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จังหวัด / รหัสไปรษณีย์</label>
                <input
                  type="text"
                  value={config.province}
                  onChange={(e) => setConfig({ ...config, province: e.target.value })}
                  placeholder="เช่น จังหวัดตัวอย่าง 10000"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัสเอกสารสารบรรณ / เลขที่หนังสือ</label>
                <input
                  type="text"
                  value={config.documentIdPrefix}
                  onChange={(e) => setConfig({ ...config, documentIdPrefix: e.target.value })}
                  placeholder="เช่น สธ 0033.101/ หรือ สธ 0221/"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Signers */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> ข้อมูลผู้ลงนามอนุมัติเอกสาร
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chief */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">1. ผู้ตรวจสอบทางเทคนิค</span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล หัวหน้างานรังสี</label>
                  <input
                    type="text"
                    value={config.chiefName}
                    onChange={(e) => setConfig({ ...config, chiefName: e.target.value })}
                    placeholder="เช่น นายสมชาย รังสีดี"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={config.chiefPosition}
                    onChange={(e) => setConfig({ ...config, chiefPosition: e.target.value })}
                    placeholder="หัวหน้างานรังสีเทคนิค"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Director */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">2. ผู้อนุมัติและสั่งการ</span>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้อำนวยการโรงพยาบาล</label>
                  <input
                    type="text"
                    value={config.directorName}
                    onChange={(e) => setConfig({ ...config, directorName: e.target.value })}
                    placeholder="เช่น นายแพทย์สมศักดิ์ รักษาดี"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={config.directorPosition}
                    onChange={(e) => setConfig({ ...config, directorPosition: e.target.value })}
                    placeholder={`ผู้อำนวยการ${config.hospitalName || "โรงพยาบาล"}`}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Onboarding Tools for New Hospital */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
              เครื่องมือจัดการสำหรับโรงพยาบาลแห่งใหม่ / การสำรองข้อมูล
            </h4>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBlankPrompt(!showBlankPrompt)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> สลับเป็นแม่แบบโรงพยาบาลใหม่ (Blank Hospital Template)
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-600" /> ส่งออกไฟล์สำรอง (.json)
              </button>

              <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" /> นำเข้าไฟล์สำรอง
                <input type="file" accept=".json" onChange={handleImportFileChange} className="hidden" />
              </label>

              <button
                type="button"
                onClick={onResetToDemo}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูลตัวอย่าง (Demo Data)
              </button>
            </div>

            {/* Collapsible Blank Setup Box */}
            {showBlankPrompt && (
              <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-3 animate-slideDown">
                <p className="font-bold text-blue-900 text-xs">
                  สร้างฐานข้อมูลใหม่สำหรับโรงพยาบาลแห่งใหม่ (ระบบจะล้างรายชื่อและข้อมูลตัวอย่างออก)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อโรงพยาบาลแห่งใหม่ *</label>
                    <input
                      type="text"
                      placeholder="เช่น โรงพยาบาลสารภี, โรงพยาบาลฝาง"
                      value={newHospName}
                      onChange={(e) => setNewHospName(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">จังหวัดสังกัด *</label>
                    <input
                      type="text"
                      placeholder="เช่น จังหวัดเชียงใหม่ 50140"
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowBlankPrompt(false)}
                    className="px-3 py-1.5 text-slate-500 font-bold hover:text-slate-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateBlankHospital}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                  >
                    ยืนยันสร้างโรงพยาบาลใหม่
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              * ข้อมูลตั้งค่าทั้งหมดจะถูกบันทึกอย่างปลอดภัยบนเบราว์เซอร์ของอุปกรณ์นี้
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-900/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> บันทึกการตั้งค่า
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
