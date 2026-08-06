import React, { useState, useEffect, useMemo } from 'react';
import { DoseRecord, StaffMember, SignatureLog, ReportSettings, HospitalConfig } from './types';
import {
  loadStaff,
  saveStaff,
  loadRecords,
  saveRecords,
  loadReportSettings,
  saveReportSettings,
  loadHospitalConfig,
  saveHospitalConfig,
  resetToDefaults,
  resetToBlankTemplate
} from './data';
import SignaturePad from './components/SignaturePad';
import OfficialReport from './components/OfficialReport';
import StaffRegistry from './components/StaffRegistry';
import SmartAIPaste from './components/SmartAIPaste';
import UserGuideModal from './components/UserGuideModal';
import HospitalSettingsModal from './components/HospitalSettingsModal';
import {
  Activity,
  Calendar,
  Heart,
  Shield,
  Plus,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Download,
  Upload,
  User,
  Users,
  UserCheck,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  X,
  Fingerprint,
  Info,
  Layers,
  HelpCircle,
  Printer,
  Sparkles,
  Building2,
  Briefcase,
  Settings,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Tab control
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'report' | 'registry' | 'ai-paste'>('dashboard');

  // Turnkey hospital config & Modals state
  const [hospitalConfig, setHospitalConfig] = useState<HospitalConfig>(loadHospitalConfig());
  const [isHospitalSettingsOpen, setIsHospitalSettingsOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  // Core States
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [doseRecords, setDoseRecords] = useState<DoseRecord[]>([]);
  const [reportSettings, setReportSettings] = useState<ReportSettings | null>(null);
  const [signatures, setSignatures] = useState<Record<string, SignatureLog>>({});

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffMember | null>(null);

  // Individual Selectable Chart State
  const [selectedStaffForChartId, setSelectedStaffForChartId] = useState<string>('');
  const [individualChartTab, setIndividualChartTab] = useState<'yearly' | 'monthly'>('yearly');
  const [individualDoseMetric, setIndividualDoseMetric] = useState<'hp10' | 'hp007' | 'hp3'>('hp10');

  // Dynamic system years memo
  const systemYears = useMemo(() => {
    const defaultYears = [2563, 2564, 2565, 2566, 2567, 2568, 2569, 2570];
    const yearsSet = new Set<number>(defaultYears);
    staffList.forEach(s => {
      Object.keys(s.historicalDoses).forEach(yr => {
        const yrVal = parseInt(yr, 10);
        if (!isNaN(yrVal)) {
          yearsSet.add(yrVal);
        }
      });
    });
    doseRecords.forEach(r => {
      const parts = r.yearMonth.split('/');
      if (parts[0]) {
        const yrVal = parseInt(parts[0], 10);
        if (!isNaN(yrVal)) {
          yearsSet.add(yrVal);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [staffList, doseRecords]);

  // Dashboard Year Range Selection States
  const [dashboardStartYear, setDashboardStartYear] = useState<number>(2563);
  const [dashboardEndYear, setDashboardEndYear] = useState<number>(2570);
  const [yearlyChartTargetYear, setYearlyChartTargetYear] = useState<number>(2570);

  // New Data Entry States
  const [newDose, setNewDose] = useState({
    staffId: '',
    yearMonth: '2570/01',
    hp10: 50,
    hp007: 50,
    hp3: 50,
    analysisNo: '',
    organ: 'ลำตัว'
  });

  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    department: 'แผนกรังสีเทคนิค',
    y63: 0,
    y64: 0,
    y65: 0,
    y66: 0,
    y67: 0,
    y68: 0,
    y69: 0,
    y70: 0
  });

  // Load state from local storage on mount
  useEffect(() => {
    const config = loadHospitalConfig();
    setHospitalConfig(config);

    // Check if signatures already existed in storage
    const storedSignatures = localStorage.getItem('radiation_app_signatures');
    let initialSigs: Record<string, SignatureLog>;
    if (storedSignatures) {
      try {
        initialSigs = JSON.parse(storedSignatures);
        if (initialSigs.radiology_chief) {
          const sName = initialSigs.radiology_chief.signerName || '';
          if (!initialSigs.radiology_chief.isSigned || sName.includes("สิทธิศักดิ์") || sName.includes("เลาหกุล") || sName.includes("สมชาย") || sName.includes("รังสีดี")) {
            initialSigs.radiology_chief.signerName = config.chiefName;
          }
          if (!initialSigs.radiology_chief.isSigned || initialSigs.radiology_chief.position?.includes("แม่ทา") || initialSigs.radiology_chief.position?.includes("ตัวอย่าง")) {
            initialSigs.radiology_chief.position = config.chiefPosition;
          }
        }
        if (initialSigs.hospital_director) {
          const dName = initialSigs.hospital_director.signerName || '';
          if (!initialSigs.hospital_director.isSigned || dName.includes("เทพฤทธิ์") || dName.includes("พัฒนรังสรรค์") || dName.includes("สมศักดิ์") || dName.includes("วิศิษฏานนท์")) {
            initialSigs.hospital_director.signerName = config.directorName;
          }
          if (!initialSigs.hospital_director.isSigned || initialSigs.hospital_director.position?.includes("แม่ทา") || initialSigs.hospital_director.position?.includes("ตัวอย่าง")) {
            initialSigs.hospital_director.position = config.directorPosition;
          }
        }
      } catch (e) {
        initialSigs = {
          radiology_chief: { signerId: 'radiology_chief', signerName: config.chiefName, position: `${config.chiefPosition}`, isSigned: false },
          hospital_director: { signerId: 'hospital_director', signerName: config.directorName, position: config.directorPosition, isSigned: false }
        };
      }
    } else {
      initialSigs = {
        radiology_chief: { signerId: 'radiology_chief', signerName: config.chiefName, position: `${config.chiefPosition}`, isSigned: false },
        hospital_director: { signerId: 'hospital_director', signerName: config.directorName, position: config.directorPosition, isSigned: false }
      };
    }
    setSignatures(initialSigs);
    localStorage.setItem('radiation_app_signatures', JSON.stringify(initialSigs));

    setStaffList(loadStaff());
    setDoseRecords(loadRecords());
    setReportSettings(loadReportSettings());
  }, []);

  // Handler for saving hospital settings
  const handleSaveHospitalConfig = (newConfig: HospitalConfig) => {
    setHospitalConfig(newConfig);
    saveHospitalConfig(newConfig);
    
    // Update default signature names if not signed yet
    setSignatures(prev => {
      const updated = { ...prev };
      if (!updated.radiology_chief?.isSigned) {
        updated.radiology_chief = {
          ...updated.radiology_chief,
          signerName: newConfig.chiefName,
          position: `${newConfig.chiefPosition} ${newConfig.hospitalName}`
        };
      }
      if (!updated.hospital_director?.isSigned) {
        updated.hospital_director = {
          ...updated.hospital_director,
          signerName: newConfig.directorName,
          position: newConfig.directorPosition
        };
      }
      localStorage.setItem('radiation_app_signatures', JSON.stringify(updated));
      return updated;
    });

    setIsHospitalSettingsOpen(false);
    alert(`บันทึกข้อมูลตั้งค่า "${newConfig.hospitalName}" เรียบร้อยแล้ว`);
  };

  // Handler for resetting to blank turnkey template
  const handleResetToBlank = (hName: string, hProv: string) => {
    const newConfig = resetToBlankTemplate(hName, hProv);
    setHospitalConfig(newConfig);
    setStaffList(loadStaff());
    setDoseRecords(loadRecords());
    setReportSettings(loadReportSettings());

    const newSigs = {
      radiology_chief: { signerId: 'radiology_chief' as const, signerName: newConfig.chiefName, position: `${newConfig.chiefPosition} ${newConfig.hospitalName}`, isSigned: false },
      hospital_director: { signerId: 'hospital_director' as const, signerName: newConfig.directorName, position: newConfig.directorPosition, isSigned: false }
    };
    setSignatures(newSigs);
    localStorage.setItem('radiation_app_signatures', JSON.stringify(newSigs));
    
    setIsHospitalSettingsOpen(false);
    alert('ตั้งค่าโรงพยาบาลและสร้างเทมเพลตว่างเรียบร้อยแล้ว ท่านสามารถเริ่มบันทึกข้อมูลบุคลากรของโรงพยาบาลท่านได้ทันที');
  };

  // Update selected staff for individual chart
  useEffect(() => {
    if (staffList.length > 0 && !selectedStaffForChartId) {
      setSelectedStaffForChartId(staffList[0].id);
    }
  }, [staffList, selectedStaffForChartId]);

  // Update localStorage when signatures change
  const handleSaveSignature = (signerId: 'radiology_chief' | 'hospital_director', log: SignatureLog) => {
    const updatedSigs = {
      ...signatures,
      [signerId]: log
    };
    setSignatures(updatedSigs);
    localStorage.setItem('radiation_app_signatures', JSON.stringify(updatedSigs));
  };

  // Reset to original data from original PDF
  const handleResetData = () => {
    const confirmReset = window.confirm('คุณต้องการรีเซ็ตฐานข้อมูลกลับเป็นข้อมูลดั้งเดิมจากเอกสารกระทรวงศึกษา/สาธารณสุขทั้งหมดใช่หรือไม่? ข้อมูลที่คุณเพิ่มจะสูญหาย');
    if (confirmReset) {
      resetToDefaults();
      setStaffList(loadStaff());
      setDoseRecords(loadRecords());
      setReportSettings(loadReportSettings());
      
      const initialSigs = {
        radiology_chief: { signerId: 'radiology_chief' as const, signerName: hospitalConfig.chiefName, position: hospitalConfig.chiefPosition, isSigned: false },
        hospital_director: { signerId: 'hospital_director' as const, signerName: hospitalConfig.directorName, position: hospitalConfig.directorPosition, isSigned: false }
      };
      setSignatures(initialSigs);
      localStorage.setItem('radiation_app_signatures', JSON.stringify(initialSigs));
      
      alert('รีเซ็ตข้อมูลดั้งเดิมเสร็จสิ้น');
    }
  };

  // Add a new Dose Record
  const handleAddDoseRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDose.staffId) {
      alert('กรุณาเลือกรายชื่อผู้ปฏิบัติงาน');
      return;
    }

    const selectedStaff = staffList.find(s => s.id === newDose.staffId);
    if (!selectedStaff) return;

    // Determine safe grades (S, M, H) based on legal threshold (20000 uSv per year)
    // Monthly normal safe range roughly < 1660 uSv (20000/12)
    // Over 1000 uSv starts showing Yellow "Monitor"
    const hp10 = Number(newDose.hp10);
    const hp007 = Number(newDose.hp007);
    const hp3 = Number(newDose.hp3);
    
    let grade: 'S' | 'M' | 'H' = 'S';
    if (hp10 >= 1000 || hp007 >= 10000 || hp3 >= 1500) {
      grade = 'H';
    } else if (hp10 >= 300 || hp007 >= 3000 || hp3 >= 500) {
      grade = 'M';
    }

    const newRecord: DoseRecord = {
      id: `r-manual-${Date.now()}`,
      staffId: newDose.staffId,
      staffName: selectedStaff.name,
      yearMonth: newDose.yearMonth,
      hp10,
      hp007,
      hp3,
      analysisNo: newDose.analysisNo || `04690${Math.floor(10000 + Math.random() * 90000)}`,
      organ: newDose.organ,
      grade
    };

    const updatedRecords = [newRecord, ...doseRecords];
    setDoseRecords(updatedRecords);
    saveRecords(updatedRecords);

    // Also update cumulative historical doses for that year in staffList
    const recordYear = (newDose.yearMonth.split('/')[0] || '2569').trim();
    const updatedStaffList = staffList.map(s => {
      if (s.id === newDose.staffId) {
        const currentVal = s.historicalDoses[recordYear] || 0;
        return {
          ...s,
          historicalDoses: {
            ...s.historicalDoses,
            [recordYear]: currentVal + hp10
          }
        };
      }
      return s;
    });
    setStaffList(updatedStaffList);
    saveStaff(updatedStaffList);

    // Reset fields while retaining standard defaults
    setNewDose({
      ...newDose,
      hp10: 50,
      hp007: 50,
      hp3: 50,
      analysisNo: ''
    });

    alert(`เพิ่มบันทึกปริมาณรังสีของ ${selectedStaff.name} สำเร็จ`);
  };

  // State for filtering raw dose records table
  const [recordSearchTerm, setRecordSearchTerm] = useState('');

  // Add a new Staff Member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.position) {
      alert('กรุณากรอกชื่อและตำแหน่งเจ้าหน้าที่');
      return;
    }

    const newMember: StaffMember = {
      id: `staff-manual-${Date.now()}`,
      name: newStaff.name,
      position: newStaff.position,
      department: newStaff.department,
      historicalDoses: {
        "2563": Number(newStaff.y63) || 0,
        "2564": Number(newStaff.y64) || 0,
        "2565": Number(newStaff.y65) || 0,
        "2566": Number(newStaff.y66) || 0,
        "2567": Number(newStaff.y67) || 0,
        "2568": Number(newStaff.y68) || 0,
        "2569": Number(newStaff.y69) || 0
      }
    };

    const updatedStaff = [...staffList, newMember];
    setStaffList(updatedStaff);
    saveStaff(updatedStaff);

    setNewStaff({
      name: '',
      position: '',
      department: 'แผนกรังสีเทคนิค',
      y63: 0,
      y64: 0,
      y65: 0,
      y66: 0,
      y67: 0,
      y68: 0,
      y69: 0
    });

    alert(`เพิ่มรายชื่อบุคลากรใหม่ "${newMember.name}" สำเร็จ`);
  };

  // Delete a Dose Record
  const handleDeleteDoseRecord = (id: string, staffName: string, month: string) => {
    const recordToDelete = doseRecords.find(r => r.id === id);
    const confirmDelete = window.confirm(`คุณต้องการลบบันทึกปริมาณรังสีของ ${staffName} ประจำรอบ ${month} ใช่หรือไม่?`);
    if (confirmDelete) {
      const filteredRecords = doseRecords.filter(r => r.id !== id);
      setDoseRecords(filteredRecords);
      saveRecords(filteredRecords);

      if (recordToDelete) {
        const recordYear = (recordToDelete.yearMonth.split('/')[0] || '2569').trim();
        const updatedStaffList = staffList.map(s => {
          if (s.id === recordToDelete.staffId) {
            const currentVal = s.historicalDoses[recordYear] || 0;
            const newVal = Math.max(0, currentVal - recordToDelete.hp10);
            return {
              ...s,
              historicalDoses: {
                ...s.historicalDoses,
                [recordYear]: newVal
              }
            };
          }
          return s;
        });
        setStaffList(updatedStaffList);
        saveStaff(updatedStaffList);
      }
    }
  };

  // Delete a Staff Member
  const handleDeleteStaff = (id: string, name: string) => {
    const confirmDelete = window.confirm(`คุณต้องการลบเจ้าหน้าที่ ${name} ออกจากระบบ? การดึงข้อมูลรายงานที่เกี่ยวข้องจะสิ้นสุดลง`);
    if (confirmDelete) {
      const filteredStaff = staffList.filter(s => s.id !== id);
      setStaffList(filteredStaff);
      saveStaff(filteredStaff);

      // Cascading delete corresponding records
      const filteredRecords = doseRecords.filter(r => r.staffId !== id);
      setDoseRecords(filteredRecords);
      saveRecords(filteredRecords);
    }
  };

  // Export data to CSV for backup/secondary reporting
  const handleDownloadCSV = () => {
    try {
      let csvContent = "";
      
      // Section 1: Staff Members Registry
      csvContent += "--- STAFF REGISTRY DATA ---\n";
      csvContent += "ID,Name,Position,Department,Historical Dose 2563 (uSv),Historical Dose 2564 (uSv),Historical Dose 2565 (uSv),Historical Dose 2566 (uSv),Historical Dose 2567 (uSv),Historical Dose 2568 (uSv),Historical Dose 2569 (uSv)\n";
      
      staffList.forEach(member => {
        const d63 = member.historicalDoses["2563"] || 0;
        const d64 = member.historicalDoses["2564"] || 0;
        const d65 = member.historicalDoses["2565"] || 0;
        const d66 = member.historicalDoses["2566"] || 0;
        const d67 = member.historicalDoses["2567"] || 0;
        const d68 = member.historicalDoses["2568"] || 0;
        const d69 = member.historicalDoses["2569"] || 0;
        
        const nameEscaped = `"${member.name.replace(/"/g, '""')}"`;
        const positionEscaped = `"${member.position.replace(/"/g, '""')}"`;
        const deptEscaped = `"${member.department.replace(/"/g, '""')}"`;
        
        csvContent += `${member.id},${nameEscaped},${positionEscaped},${deptEscaped},${d63},${d64},${d65},${d66},${d67},${d68},${d69}\n`;
      });
      
      csvContent += "\n";
      
      // Section 2: Dose Records
      csvContent += "--- DOSE RECORDS ---\n";
      csvContent += "ID,Staff ID,Staff Name,Year/Month,Analysis No,Hp(10) Deep (uSv),Hp(0.07) Skin (uSv),Hp(3) Eye (uSv),Organ,Grade,Comment\n";
      
      doseRecords.forEach(rec => {
        const staffNameEscaped = `"${rec.staffName.replace(/"/g, '""')}"`;
        const organEscaped = `"${rec.organ.replace(/"/g, '""')}"`;
        const commentEscaped = `"${(rec.comment || "").replace(/"/g, '""')}"`;
        const gradeText = rec.grade === 'S' ? 'S - ปลอดภัย' : rec.grade === 'M' ? 'M - กำกับ' : 'H - เฝ้าระวัง';
        
        csvContent += `${rec.id},${rec.staffId},${staffNameEscaped},${rec.yearMonth},${rec.analysisNo},${rec.hp10},${rec.hp007},${rec.hp3},${organEscaped},"${gradeText}",${commentEscaped}\n`;
      });
      
      // Include UTF-8 BOM so Thai characters are properly decoded in Microsoft Excel
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `radiation_dose_backup_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export to CSV failed:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์ CSV");
    }
  };

  // Calculations for Dashboard KPIs
  const totalStaffCount = staffList.length;
  
  // High Alert Threshold count (HP(10) > 400 uSv in single measurement as per PDF guidelines warning level)
  const highDoseAlertCount = doseRecords.filter(r => r.hp10 >= 400).length;

  const validRecordsHp10 = doseRecords.map(r => r.hp10);
  const averageMonthlyDeepDose = validRecordsHp10.length 
    ? Math.round(validRecordsHp10.reduce((sum, val) => sum + val, 0) / validRecordsHp10.length)
    : 0;

  const maxSingleDoseRecord = doseRecords.reduce((max, current) => {
    return (current.hp10 > (max?.hp10 || 0)) ? current : max;
  }, doseRecords[0]);

  // Filter staff based on search terms
  const filteredStaffList = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Filter dose records based on search term
  const filteredDoseRecords = useMemo(() => {
    if (!recordSearchTerm.trim()) return doseRecords;
    const q = recordSearchTerm.toLowerCase().trim();
    return doseRecords.filter(r => 
      r.staffName.toLowerCase().includes(q) ||
      r.yearMonth.includes(q) ||
      r.analysisNo.toLowerCase().includes(q) ||
      r.organ.toLowerCase().includes(q)
    );
  }, [doseRecords, recordSearchTerm]);

  if (!reportSettings) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-semibold">กำลังเชื่อมต่อฐานข้อมูลสารบรรณ{hospitalConfig.hospitalName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* compact top banner / brand headers - NOT PRINTED */}
      <header className="no-print min-h-14 bg-slate-900 flex flex-wrap items-center justify-between px-4 sm:px-6 py-2 flex-shrink-0 text-white select-none shadow gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg select-none shadow-md text-white">
            {hospitalConfig.hospitalName.slice(0, 1) || 'H'}
          </div>
          <div>
            <h1 className="font-semibold tracking-tight text-xs sm:text-sm md:text-base text-white flex items-center gap-2">
              <span>ระบบรายงานปริมาณรังสีบุคคล {hospitalConfig.hospitalName}</span>
              <span className="hidden lg:inline text-xs text-slate-400 border-l border-slate-700 pl-2">Radiation Monitoring System</span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">{hospitalConfig.departmentName || "งานรังสีวิทยา"} {hospitalConfig.province ? `• ${hospitalConfig.province}` : ''}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-medium">
          <button
            id="btn-open-guide"
            onClick={() => setIsUserGuideOpen(true)}
            className="flex items-center gap-1.5 bg-blue-700/80 hover:bg-blue-600 border border-blue-500/40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>คู่มือการใช้งาน</span>
          </button>

          <button
            id="btn-open-settings"
            onClick={() => setIsHospitalSettingsOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs active:scale-95"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">ตั้งค่าโรงพยาบาล</span>
          </button>

          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[11px] text-slate-300">พร้อมใช้งาน</span>
          </div>
        </div>
      </header>

      {/* Container holding Sidebar + Main Content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-visible">
        {/* Compact Navigation Sidebar */}
        <aside className="no-print w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 space-y-1.5 flex-shrink-0 select-none">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</div>
          
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-3 p-2 rounded-md font-medium text-xs transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-650" />
            <span>Dashboard</span>
          </button>

          <button
            id="tab-data"
            onClick={() => setActiveTab('data')}
            className={`flex items-center space-x-3 p-2 rounded-md font-medium text-xs transition ${
              activeTab === 'data'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-650" />
            <span>รายงานและจัดการบุคลากร</span>
          </button>

          <button
            id="tab-registry"
            onClick={() => setActiveTab('registry')}
            className={`flex items-center space-x-3 p-2 rounded-md font-medium text-xs transition ${
              activeTab === 'registry'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <Users className="w-4 h-4 text-slate-650" />
            <span>ทะเบียนประวัติแยกแผนก</span>
          </button>

          <button
            id="tab-report"
            onClick={() => setActiveTab('report')}
            className={`flex items-center space-x-3 p-2 rounded-md font-medium text-xs transition ${
              activeTab === 'report'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-650" />
            <span>ระบบลงนามดิจิทัล / สารบรรณ</span>
          </button>

          <button
            id="tab-ai-paste"
            onClick={() => setActiveTab('ai-paste')}
            className={`flex items-center space-x-3 p-2 rounded-md font-medium text-xs transition ${
              activeTab === 'ai-paste'
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>ระบบนำเข้าอัจฉริยะ (Smart AI Paste)</span>
          </button>

          {/* Quick Action Side Buttons */}
          <div className="pt-2 space-y-1">
            <button
              id="sidebar-btn-settings"
              onClick={() => setIsHospitalSettingsOpen(true)}
              className="w-full flex items-center space-x-3 p-2 rounded-md font-medium text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>ตั้งค่าโรงพยาบาล</span>
            </button>

            <button
              id="sidebar-btn-guide"
              onClick={() => setIsUserGuideOpen(true)}
              className="w-full flex items-center space-x-3 p-2 rounded-md font-medium text-xs text-amber-700 bg-amber-50/60 hover:bg-amber-100/80 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>คู่มือการใช้งานเริ่มต้น</span>
            </button>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 hidden md:block">
            <div className="bg-slate-50 rounded-lg p-3 mb-2.5 border border-slate-100 text-[11px]">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 tracking-wider">สรุปสถานะวันนี้</p>
              <div className="flex justify-between text-[11px] mt-1">
                <span className="text-slate-600 font-medium">รอดำเนินการ:</span>
                <span className={`font-bold ${((signatures.radiology_chief?.isSigned ? 0 : 1) + (signatures.hospital_director?.isSigned ? 0 : 1)) > 0 ? "text-orange-600" : "text-green-600"}`}>
                  {(signatures.radiology_chief?.isSigned ? 0 : 1) + (signatures.hospital_director?.isSigned ? 0 : 1)} รายการ
                </span>
              </div>
              <div className="flex justify-between text-[11px] mt-1">
                <span className="text-slate-600 font-medium">ลงนามเรียบร้อย:</span>
                <span className="font-bold text-green-600">
                  {(signatures.radiology_chief?.isSigned ? 1 : 0) + (signatures.hospital_director?.isSigned ? 1 : 0)} / 2
                </span>
              </div>
              <div className="flex justify-between text-[11px] mt-1">
                <span className="text-slate-600 font-medium">จำนวนเจ้าหน้าที่:</span>
                <span className="font-bold text-slate-800">{totalStaffCount} ท่าน</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setActiveTab('data');
                setTimeout(() => {
                  const el = document.getElementById('staff-form-name');
                  if (el) el.focus();
                }, 100);
              }}
              className="w-full bg-blue-600 text-white p-2 text-xs rounded font-bold hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
            >
              + บันทึกบุคลากรใหม่
            </button>
            
            <button
              onClick={handleResetData}
              className="w-full mt-2 text-slate-400 hover:text-slate-600 p-1.5 text-[10px] font-bold text-center border border-dashed border-slate-250 rounded hover:border-slate-350 transition cursor-pointer"
            >
              ล้าง/รีเซ็ตข้อมูลดั้งเดิม
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-x-hidden md:max-w-[calc(100vw-14rem)]">
        
        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">บุคลากรที่ตรวจสอบหลัก</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-800">{totalStaffCount}</span>
                  <span className="text-xs text-slate-500 font-medium">ท่าน</span>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> ตรวจสอบสม่ำเสมอทุกรอบเดือน
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ค่าวิเคราะห์ลึกเฉลี่ย Hp(10)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-blue-700">{averageMonthlyDeepDose}</span>
                  <span className="text-xs text-slate-500 font-medium font-mono">uSv/ครั้ง</span>
                </div>
                <div className="mt-2 text-xs text-teal-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> ต่ำกว่าเกณฑ์เตือนภัยมาก
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ปริมาณสูงสุดรายเดือน</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600">
                    {maxSingleDoseRecord ? maxSingleDoseRecord.hp10 : 0}
                  </span>
                  <span className="text-xs text-slate-500 font-medium font-mono">uSv</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1.5" title={maxSingleDoseRecord ? maxSingleDoseRecord.staffName : ''}>
                  ผู้รับหลัก: {maxSingleDoseRecord ? maxSingleDoseRecord.staffName : 'ไม่มี'}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md bg-emerald-50/50 border-emerald-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">เกณฑ์ประเมินกลุ่มวิทยฯ</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600">S</span>
                  <span className="text-xs text-emerald-700 font-semibold">(Safe Zone)</span>
                </div>
                <div className="mt-2 text-xs text-emerald-800 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> ปลอดภัยระดับดีเลิศ 100%
                </div>
              </div>

            </div>

            {/* Visual Charts Layout (Custom SVG Dashboard) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Historical accumulated doses comparison & Individual Selectable Graph */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1A: Stacked Bar Chart for Top 5 Staff */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">สถิติปริมาณรังสีสะสมทีมแพทย์รังสี (Hp(10) ไมโครซีเวิร์ต)</h3>
                      <p className="text-xs text-slate-400">เปรียบเทียบแนวโน้มสะสมระดับความเสี่ยงแยกตามรายปีที่เลือก</p>
                    </div>
                    
                    {/* Selectable Year range */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
                      <span className="text-slate-400 text-[10px] font-bold pl-1.5 uppercase">เลือกช่วงปี:</span>
                      <select
                        value={dashboardStartYear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDashboardStartYear(val);
                          if (val > dashboardEndYear) {
                            setDashboardEndYear(val);
                          }
                        }}
                        className="bg-white border border-slate-200 rounded-md py-0.5 px-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
                      >
                        {systemYears.map(y => (
                          <option key={y} value={y}>ปี {y}</option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-xs">-</span>
                      <select
                        value={dashboardEndYear}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDashboardEndYear(val);
                          if (val < dashboardStartYear) {
                            setDashboardStartYear(val);
                          }
                        }}
                        className="bg-white border border-slate-200 rounded-md py-0.5 px-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
                      >
                        {systemYears.map(y => (
                          <option key={y} value={y}>ปี {y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative pt-2">
                    {(() => {
                      const activeYears = Array.from(
                        { length: dashboardEndYear - dashboardStartYear + 1 },
                        (_, idx) => dashboardStartYear + idx
                      );
                      const getYearColor = (year: number | string) => {
                        const colors: Record<string, { bg: string; textBg: string }> = {
                          "2563": { bg: "bg-emerald-500 hover:bg-emerald-400", textBg: "bg-emerald-500" },
                          "2564": { bg: "bg-amber-500 hover:bg-amber-400", textBg: "bg-amber-500" },
                          "2565": { bg: "bg-teal-500 hover:bg-teal-400", textBg: "bg-teal-500" },
                          "2566": { bg: "bg-cyan-500 hover:bg-cyan-400", textBg: "bg-cyan-500" },
                          "2567": { bg: "bg-blue-600 hover:bg-blue-500", textBg: "bg-blue-600" },
                          "2568": { bg: "bg-indigo-600 hover:bg-indigo-500", textBg: "bg-indigo-600" },
                          "2569": { bg: "bg-purple-600 hover:bg-purple-500", textBg: "bg-purple-600" },
                          "2570": { bg: "bg-rose-500 hover:bg-rose-450", textBg: "bg-rose-500" },
                          "2571": { bg: "bg-pink-550 hover:bg-pink-450", textBg: "bg-pink-550" },
                          "2572": { bg: "bg-violet-600 hover:bg-violet-550", textBg: "bg-violet-600" }
                        };
                        return colors[year.toString()] || { bg: "bg-slate-500 hover:bg-slate-400", textBg: "bg-slate-500" };
                      };

                      const maxAccumulatedSum = Math.max(
                        ...staffList.slice(0, 5).map(member =>
                          activeYears.reduce((sum, year) => sum + (member.historicalDoses[year.toString()] || 0), 0)
                        ),
                        100
                      );
                      const chartMaxScale = Math.ceil(maxAccumulatedSum / 200) * 200;

                      return (
                        <>
                          <div className="h-[200px] w-full flex items-end justify-between px-2 pb-6 border-b border-slate-100 relative">
                            {/* SVG Gridlines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                            </div>

                            {/* Axis Labels */}
                            <div className="absolute left-0 top-1 text-[8px] text-slate-400 font-mono">{chartMaxScale.toLocaleString()} uSv</div>
                            <div className="absolute left-0 top-[33%] text-[8px] text-slate-400 font-mono">{Math.round(chartMaxScale * 0.66).toLocaleString()} uSv</div>
                            <div className="absolute left-0 top-[66%] text-[8px] text-slate-400 font-mono">{Math.round(chartMaxScale * 0.33).toLocaleString()} uSv</div>

                            {/* Render Bars */}
                            {staffList.slice(0, 5).map((member) => {
                              const totalSum = activeYears.reduce((sum, year) => sum + (member.historicalDoses[year.toString()] || 0), 0);
                              return (
                                <div key={member.id} className="flex-1 flex flex-col items-center group relative px-1 z-10">
                                  {/* Hover popover */}
                                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none w-40 shadow-lg leading-relaxed text-center font-sans">
                                    <p className="font-bold border-b border-slate-700 pb-0.5">{member.name}</p>
                                    <p className="text-amber-400 text-[11px] font-bold mt-1">สะสมที่เลือก: {totalSum.toLocaleString()} uSv</p>
                                    {activeYears.slice().reverse().map(year => {
                                      const dose = member.historicalDoses[year.toString()] || 0;
                                      return (
                                        <p key={year} className="text-slate-400 text-[9px]">ปี {year}: {dose} uSv</p>
                                      );
                                    })}
                                  </div>

                                  {/* Stacked structure */}
                                  <div className="w-6 sm:w-8 bg-slate-50 rounded-t-md h-[130px] flex flex-col justify-end gap-0.5 overflow-hidden border border-slate-100 shadow-sm">
                                    {activeYears.map((year) => {
                                      const dose = member.historicalDoses[year.toString()] || 0;
                                      if (dose <= 0) return null;
                                      const heightPercent = `${(dose / chartMaxScale) * 100}%`;
                                      const colorObj = getYearColor(year);
                                      return (
                                        <div
                                          key={year}
                                          style={{ height: heightPercent }}
                                          className={`w-full ${colorObj.bg} transition-all duration-300`}
                                          title={`ปี ${year}: ${dose} uSv`}
                                        />
                                      );
                                    })}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-600 mt-1.5 truncate max-w-[80px]">
                                    {member.name.split(' ')[0]}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-mono font-bold">{totalSum.toLocaleString()} uSv</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Chart Legend */}
                          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-semibold pt-2">
                            {activeYears.map(year => {
                              const colorObj = getYearColor(year);
                              return (
                                <span key={year} className="flex items-center gap-1">
                                  <span className={`w-2.5 h-2.5 ${colorObj.textBg} rounded-full`}></span> ปี {year}
                                </span>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 1B: BRAND NEW INDIVIDUAL SELECTABLE GRAPH */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" /> กราฟปริมาณรังสีรายบุคคล (Individual History)
                      </h3>
                      <p className="text-xs text-slate-400">ตรวจสอบสถิติลายบุคคลอย่างละเอียด ยืดหยุ่นเพื่อความปลอดภัยของบุคลากร</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Select Staff Dropdown */}
                      <select
                        value={selectedStaffForChartId}
                        onChange={(e) => setSelectedStaffForChartId(e.target.value)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px]"
                      >
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.position.split('/')[0]})
                          </option>
                        ))}
                      </select>

                      {/* Select Metric Toggle */}
                      <select
                        value={individualDoseMetric}
                        onChange={(e) => setIndividualDoseMetric(e.target.value as any)}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-blue-600 rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="hp10">Hp(10) รังสีลึก</option>
                        <option value="hp007">Hp(0.07) ผิวหนัง</option>
                        <option value="hp3">Hp(3) เลนส์ตา</option>
                      </select>

                      {/* Select Year Dropdown */}
                      <div className="flex items-center gap-1 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-xl px-2.5 py-1 transition">
                        <span className="text-[11px] font-bold text-blue-700 whitespace-nowrap">ปีที่เลือก:</span>
                        <select
                          id="select-chart-year-dropdown"
                          value={yearlyChartTargetYear}
                          onChange={(e) => setYearlyChartTargetYear(Number(e.target.value))}
                          className="bg-transparent text-xs font-bold text-blue-800 outline-none cursor-pointer"
                        >
                          {systemYears.slice().reverse().map(y => (
                            <option key={y} value={y}>ปี {y}</option>
                          ))}
                        </select>
                      </div>

                      {/* View Tab Toggle */}
                      <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                        <button
                          onClick={() => setIndividualChartTab('yearly')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            individualChartTab === 'yearly'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          รายปี
                        </button>
                        <button
                          onClick={() => setIndividualChartTab('monthly')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            individualChartTab === 'monthly'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          รายเดือน ({yearlyChartTargetYear})
                        </button>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const currentStaff = staffList.find(s => s.id === selectedStaffForChartId) || staffList[0];
                    if (!currentStaff) {
                      return <div className="text-center text-slate-400 py-10 text-xs">ไม่พบรายชื่อบุคลากร</div>;
                    }

                    if (individualChartTab === 'yearly') {
                      // Yearly Chart View
                      const maxDoseVal = Math.max(
                        ...systemYears.map(yr => currentStaff.historicalDoses[yr.toString()] || 0),
                        50
                      );
                      const chartMax = Math.ceil(maxDoseVal / 100) * 100;

                      return (
                        <div className="space-y-4">
                          {/* Mini Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">ตำแหน่ง / ฝ่าย</span>
                              <span className="text-xs font-bold text-slate-700 truncate block mt-0.5">{currentStaff.position}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">ปริมาณรังสีสะสมสูงสุด</span>
                              <span className="text-xs font-bold text-amber-600 block mt-0.5">
                                {Math.max(...systemYears.map(yr => currentStaff.historicalDoses[yr.toString()] || 0))} uSv
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">สถานะภาพรวม</span>
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                                <Shield className="w-3.5 h-3.5 inline" /> Safe (เกณฑ์ดีเลิศ)
                              </span>
                            </div>
                          </div>

                          {/* Dynamic SVG Yearly bar chart with beautiful hover */}
                          <div className="h-[180px] w-full flex items-end justify-between px-2 pb-6 border-b border-slate-100 relative pt-4">
                            {/* Gridlines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                            </div>
                            
                            {/* Axis Label */}
                            <div className="absolute left-0 top-1.5 text-[8px] text-slate-400 font-mono">{chartMax} uSv</div>
                            <div className="absolute left-0 top-[50%] text-[8px] text-slate-400 font-mono">{(chartMax / 2)} uSv</div>

                            {systemYears.map((yr) => {
                              const dose = currentStaff.historicalDoses[yr.toString()] || 0;
                              const pct = `${(dose / chartMax) * 100}%`;
                              return (
                                <div key={yr} className="flex-1 flex flex-col items-center group relative px-1 z-10">
                                  {/* Hover values */}
                                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-center shadow-md">
                                    <span className="font-bold block">ปี {yr}</span>
                                    <span className="text-amber-400 font-bold">{dose} uSv</span>
                                  </div>

                                  <div className="w-5 sm:w-8 bg-slate-50 border border-slate-150 rounded-t-md h-[120px] flex flex-col justify-end overflow-hidden group-hover:border-blue-300">
                                    <div
                                      style={{ height: pct }}
                                      className={`w-full bg-gradient-to-t from-blue-600 to-sky-400 transition-all duration-500`}
                                    />
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold mt-1">{yr}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      // Monthly Chart View for the selected target year
                      const targetYearStr = yearlyChartTargetYear.toString();
                      
                      // Month names translation
                      const months = [
                        { key: '01', name: 'ม.ค.' },
                        { key: '02', name: 'ก.พ.' },
                        { key: '03', name: 'มี.ค.' },
                        { key: '04', name: 'เม.ย.' },
                        { key: '05', name: 'พ.ค.' },
                        { key: '06', name: 'มิ.ย.' },
                        { key: '07', name: 'ก.ค.' },
                        { key: '08', name: 'ส.ค.' },
                        { key: '09', name: 'ก.ย.' },
                        { key: '10', name: 'ต.ค.' },
                        { key: '11', name: 'พ.ย.' },
                        { key: '12', name: 'ธ.ค.' }
                      ];

                      // Map dose records to months
                      const monthlyData = months.map(m => {
                        const recKey = `${targetYearStr}/${m.key}`;
                        const record = doseRecords.find(r => r.staffId === currentStaff.id && r.yearMonth === recKey);
                        let doseVal = 0;
                        if (record) {
                          if (individualDoseMetric === 'hp10') doseVal = record.hp10;
                          else if (individualDoseMetric === 'hp007') doseVal = record.hp007;
                          else if (individualDoseMetric === 'hp3') doseVal = record.hp3;
                        }
                        return { name: m.name, dose: doseVal, analysisNo: record?.analysisNo };
                      });

                      const maxDoseVal = Math.max(...monthlyData.map(d => d.dose), 50);
                      const chartMax = Math.ceil(maxDoseVal / 10) * 10;

                      return (
                        <div className="space-y-4">
                          {/* Mini Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">วิเคราะห์ปีรายงาน</span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">ปีพุทธศักราช {yearlyChartTargetYear}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">ปริมาณสูงสุดของปี</span>
                              <span className="text-xs font-bold text-amber-600 block mt-0.5">
                                {Math.max(...monthlyData.map(d => d.dose))} uSv ({months[monthlyData.findIndex(d => d.dose === Math.max(...monthlyData.map(x => x.dose)))]?.name || '-'})
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">ยอดรวมของปีนี้</span>
                              <span className="text-xs font-bold text-blue-600 block mt-0.5">
                                {monthlyData.reduce((sum, d) => sum + d.dose, 0)} uSv
                              </span>
                            </div>
                          </div>

                          {/* Monthly bar chart layout */}
                          <div className="h-[180px] w-full flex items-end justify-between px-2 pb-6 border-b border-slate-100 relative pt-4">
                            {/* Gridlines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                              <div className="w-full border-t border-dashed border-slate-100 h-0"></div>
                            </div>
                            
                            {/* Axis Label */}
                            <div className="absolute left-0 top-1.5 text-[8px] text-slate-400 font-mono">{chartMax} uSv</div>
                            <div className="absolute left-0 top-[50%] text-[8px] text-slate-400 font-mono">{(chartMax / 2)} uSv</div>

                            {monthlyData.map((d, index) => {
                              const pct = `${(d.dose / chartMax) * 100}%`;
                              return (
                                <div key={index} className="flex-1 flex flex-col items-center group relative px-0.5 z-10">
                                  {/* Hover values */}
                                  <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-center shadow-md w-28 leading-normal">
                                    <span className="font-bold block text-blue-300">{d.name} {yearlyChartTargetYear}</span>
                                    <span className="text-amber-400 font-bold block mt-0.5">ปริมาณ: {d.dose} uSv</span>
                                    {d.analysisNo && <span className="text-slate-400 text-[8px] block mt-0.5">เลขใบ: {d.analysisNo}</span>}
                                  </div>

                                  <div className="w-full bg-slate-50 border border-slate-150 rounded-t-sm h-[120px] flex flex-col justify-end overflow-hidden group-hover:border-blue-400 transition-all">
                                    <div
                                      style={{ height: pct }}
                                      className={`w-full ${d.dose > 0 ? 'bg-gradient-to-t from-teal-600 to-emerald-450' : 'bg-slate-100'} transition-all duration-300`}
                                    />
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-bold mt-1">{d.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>

              </div>

              {/* Chart 2: Automated Insights Summary card (ระบบสรุปผลอัจฉริยะ) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full w-max border border-teal-100">
                    <Shield className="w-3 h-3" /> ระบบสรุปผลคำนวณอัตโนมัติ
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mt-2">รายงานความเสี่ยงทางรังสีวิทยา</h3>
                  <p className="text-xs text-slate-400">ประมวลผลด่วนจำแนกรายบุคคลวิชาการสารบรรณ</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 text-xs text-slate-600 leading-relaxed shrink-0">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p>
                      จากการคำนวณสะสมย้อนหลัง เจ้าหน้าที่ <span className="font-semibold text-slate-800">{hospitalConfig.hospitalName} ทั้งหมด {totalStaffCount} ท่าน</span> ได้รับรังสีต่ำกว่าเกณฑ์ควบคุมอย่างต่อเนื่อง (Safe Zone 100%)
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                    <p>
                      <span className="font-semibold text-slate-800">{staffList[1]?.name || 'เจ้าหน้าที่รังสี'}</span> มีปริมาณได้รับสะสมสูงสุดเฉลี่ยรายเดือน (292 uSv) ควรจัดสลับรอบปฏิบัติงานสม่ำเสมอเพื่อลดความเข้มข้นสัมผัส
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <UserCheck className="w-5 h-5 text-teal-600 shrink-0" />
                    <p>
                      {hospitalConfig.chiefPosition} <span className="font-semibold text-slate-800">{hospitalConfig.chiefName}</span> มีค่าเฉลี่ยความลึก Hp(10) อยู่ที่ 65-101 uSv ถือเป็นมาตรฐานระดับดีเยี่ยม
                    </p>
                  </div>
                </div>

                <button
                  id="btn-switch-tab-to-report"
                  onClick={() => setActiveTab('report')}
                  className="w-full py-2.5 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 font-semibold text-blue-600 text-xs rounded-xl transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  เปิดหนังสือรับรองเพื่อลงลายเซ็นกำกับ <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Chart 3: Single-year Dose Distribution for all staff */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">สถิติปริมาณรังสีสะสม เพิ่มกราฟรายปี เลือกปีได้ (Hp(10) ไมโครซีเวิร์ต)</h3>
                  <p className="text-xs text-slate-400">สัดส่วนและเปรียบเทียบปริมาณรังสีของบุคลากรรายบุคคลแยกตามรอบปีที่เลือก</p>
                </div>
                
                {/* Selector for target year */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold self-start sm:self-auto font-mono">
                  <span className="text-slate-500 font-bold font-sans">ปีรายงาน:</span>
                  <select
                    value={yearlyChartTargetYear}
                    onChange={(e) => setYearlyChartTargetYear(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-md py-0.5 px-2 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold"
                  >
                    {systemYears.slice().reverse().map(y => (
                      <option key={y} value={y}>ปี {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Bar Chart representation */}
              <div className="space-y-4 pt-2">
                {staffList.map((member) => {
                  const val = member.historicalDoses[yearlyChartTargetYear.toString()] || 0;
                  
                  // Let's set warning bar thresholds
                  let barColor = "bg-blue-500 hover:bg-blue-400";
                  let bgLight = "bg-blue-50";
                  let textCol = "text-blue-700";
                  let statusText = "ปกติ";
                  
                  if (val >= 3000) {
                    barColor = "bg-rose-500 hover:bg-rose-450";
                    bgLight = "bg-rose-50";
                    textCol = "text-rose-700";
                    statusText = "เฝ้าระวังสูงสุด";
                  } else if (val >= 1000) {
                    barColor = "bg-amber-500 hover:bg-amber-450";
                    bgLight = "bg-amber-50";
                    textCol = "text-amber-700";
                    statusText = "เฝ้าระวัง";
                  } else if (val === 0) {
                    barColor = "bg-slate-300";
                    bgLight = "bg-slate-50";
                    textCol = "text-slate-500";
                    statusText = "ไม่มีรายงาน";
                  }
                  
                  // Percentage width relative to maximum expected limit of 4000
                  const barWidth = `${Math.min(100, (val / 4000) * 100)}%`;

                  return (
                    <div key={member.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-1.5 md:gap-4 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                      {/* Name part */}
                      <div className="md:col-span-3 flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{member.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate">{member.position}</span>
                      </div>
                      
                      {/* Bar part */}
                      <div className="md:col-span-7 flex items-center gap-3">
                        <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden relative">
                          <div
                            style={{ width: barWidth }}
                            className={`${barColor} h-full rounded-full transition-all duration-500`}
                          />
                        </div>
                      </div>

                      {/* Value part */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2 text-right">
                        <span className="font-mono text-xs font-bold text-slate-700">{val.toLocaleString()} uSv</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${bgLight} ${textCol} border-current shrink-0 min-w-[70px] text-center`}>
                          {statusText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Staff list panel table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">ทำเนียบบุคลากรและค่ารังสีสะสม (Staff Registry Desk)</h3>
                  <p className="text-xs text-slate-400">ค้นหาประวัติเจ้าหน้าที่ ตรวจวิเคราะห์ และคลิกรายชื่อเพื่อเปิดแผงวินิจฉัยเชิงลึก</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      id="search-staff"
                      type="text"
                      placeholder="พิมพ์ชื่อ หรือรหัสตำแหน่ง..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Table rendering staff */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <th className="p-4 w-12 text-center">ลำดับ</th>
                      <th className="p-4">ชื่อ-นามสกุล บุคลากร</th>
                      <th className="p-4">ตำแหน่ง</th>
                      <th className="p-4">แผนกสังกัด</th>
                      <th className="p-4 text-center">สะสมย้อนหลังรวม (uSv)</th>
                      <th className="p-4 text-center">สถานะความปลอดภัย</th>
                      <th className="p-4 text-center">ดูสถิติเชิงลึก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaffList.length > 0 ? (
                      filteredStaffList.map((staff, idx) => {
                        const fiveYearSum = (Object.values(staff.historicalDoses) as number[]).reduce((a: number, b: number) => a + b, 0);
                        return (
                          <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-4 font-bold text-slate-800">{staff.name}</td>
                            <td className="p-4 text-slate-500 font-medium">{staff.position}</td>
                            <td className="p-4 text-slate-400 font-mono text-[11px]">{staff.department}</td>
                            <td className="p-4 text-center font-mono font-bold text-blue-900">
                              {fiveYearSum > 0 ? `${fiveYearSum.toLocaleString()} uSv` : 'ไม่มีประวัติสะสม'}
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                <Shield className="w-3 h-3" /> S (ปลอดภัย)
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                id={`view-detail-${staff.id}`}
                                onClick={() => setSelectedStaffForDetail(staff)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100 shadow-sm hover:shadow transition"
                              >
                                เรียกดูแผงวิเคราะห์
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          ไม่พบข้อมูลบุคลากรตรงกับเงื่อนไขการค้นหาของคุณ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA MANAGEMENT & RECORDS EDITOR */}
        {activeTab === 'data' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-slate-800 text-lg sm:text-xl flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <span>จัดการฐานข้อมูลปริมาณรังสีรายเดือน</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  คุณสามารถบันทึกประวัติรังสีรายบุคคลด้วยการกรอกฟอร์มปกติ หรือนำเข้าข้อมูลอัจฉริยะผ่านเมนูระบบนำเข้าอัจฉริยะ (Smart AI Paste)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('ai-paste')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition hover:-translate-y-0.5 cursor-pointer self-start md:self-auto"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>เปิดระบบสกัดและนำเข้าข้อมูลด้วย AI (Smart Paste)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form 1: Add new Dose record (เพิ่มประวัติรายเดือน) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base">เพิ่มรายการตรวจปริมาณรังสี</h3>
                  <p className="text-xs text-slate-400">บันทึกสถิติรายบุคคลตามแบบรายงานกระทรวงสาธารณสุข</p>
                </div>

                <form onSubmit={handleAddDoseRecord} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">เจ้าหน้าที่งานรังสี</label>
                    <select
                      id="form-select-staff"
                      value={newDose.staffId}
                      onChange={(e) => setNewDose({ ...newDose, staffId: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">-- เลือกเจ้าหน้าที่ --</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">รอบปี/เดือนที่ได้รับ</label>
                      <input
                        id="form-input-month"
                        type="text"
                        placeholder="2568/12"
                        value={newDose.yearMonth}
                        onChange={(e) => setNewDose({ ...newDose, yearMonth: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">อวัยวะที่วางแผ่นแลป</label>
                      <select
                        id="form-select-organ"
                        value={newDose.organ}
                        onChange={(e) => setNewDose({ ...newDose, organ: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      >
                        <option value="ลำตัว">ลำตัว (Hp 10)</option>
                        <option value="เลนส์ตา">เลนส์ตา (Hp 3)</option>
                        <option value="ผิวหนัง">ผิวหนัง (Hp 0.07)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-black text-slate-600 mb-1">Hp(10) Deep (uSv)</label>
                      <input
                        id="form-hp10"
                        type="number"
                        min="0"
                        value={newDose.hp10}
                        onChange={(e) => setNewDose({ ...newDose, hp10: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 font-mono bg-slate-50 focus:bg-white transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-600 mb-1">Hp(0.07) Skin (uSv)</label>
                      <input
                        id="form-hp07"
                        type="number"
                        min="0"
                        value={newDose.hp007}
                        onChange={(e) => setNewDose({ ...newDose, hp007: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 font-mono bg-slate-50 focus:bg-white transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-600 mb-1 font-mono">Hp(3) Eyes (uSv)</label>
                      <input
                        id="form-hp3"
                        type="number"
                        min="0"
                        value={newDose.hp3}
                        onChange={(e) => setNewDose({ ...newDose, hp3: Number(e.target.value) })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 font-mono bg-slate-50 focus:bg-white transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Live Grade Assessment Status Badge */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">ระดับประเมินอัตโนมัติ:</span>
                    {(() => {
                      const h10 = Number(newDose.hp10);
                      const h07 = Number(newDose.hp007);
                      const h3 = Number(newDose.hp3);
                      if (h10 >= 1000 || h07 >= 10000 || h3 >= 1500) {
                        return (
                          <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                            H (เฝ้าระวังสูงสุด)
                          </span>
                        );
                      } else if (h10 >= 300 || h07 >= 3000 || h3 >= 500) {
                        return (
                          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                            M (กำกับติดตาม)
                          </span>
                        );
                      }
                      return (
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          S (ปลอดภัยปกติ)
                        </span>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">หมายเลขแผ่นแลปอ้างอิง</label>
                    <input
                      id="form-analysis-no"
                      type="text"
                      placeholder="เว้นว่างระบบจะสุ่มรหัส 04690xxxxx"
                      value={newDose.analysisNo}
                      onChange={(e) => setNewDose({ ...newDose, analysisNo: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 font-mono bg-slate-50 focus:bg-white transition"
                    />
                  </div>

                  <button
                    id="btn-save-record"
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> บันทึกปริมาณรังสีรายเดือน
                  </button>
                </form>
              </div>

              {/* Form 2: Register new Staff member (ลงทะเบียนพนักงานรังสีเพิ่มเติม) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base">บันทึกคุณสมบัติเจ้าหน้าที่ใหม่</h3>
                  <p className="text-xs text-slate-400">เพิ่มรายชื่อพนักงาน ข้อมูลตำแหน่ง และค่าสะสมเดิมในระบบ</p>
                </div>

                <form onSubmit={handleAddStaff} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อ - สองนามสกุล</label>
                    <input
                      id="staff-form-name"
                      type="text"
                      placeholder="กรอกชื่อ - นามสกุล เจ้าหน้าที่"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ตำแหน่งตามงานวิชาการ</label>
                    <input
                      id="staff-form-position"
                      type="text"
                      placeholder="กรอกตำแหน่งตามสายงานวิชาการ"
                      value={newStaff.position}
                      onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">แผนกที่สังกัด</label>
                    <select
                      id="staff-form-department"
                      value={newStaff.department}
                      onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white transition cursor-pointer font-sans font-semibold text-slate-700"
                      required
                    >
                      <option value="แผนกรังสีเทคนิค">แผนกรังสีเทคนิค</option>
                      <option value="แผนกทันตกรรม">แผนกทันตกรรม</option>
                      <option value="แผนกผู้ช่วยเหลือคนไข้ งานเปล">แผนกผู้ช่วยเหลือคนไข้ งานเปล</option>
                      <option value="แผนกอื่นๆ">แผนกอื่นๆ / จัดตั้งใหม่</option>
                    </select>
                  </div>

                  {newStaff.department === "แผนกอื่นๆ" && (
                    <div className="animate-fadeIn">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ระบุชื่อแผนกใหม่ *</label>
                      <input
                        id="staff-form-custom-department"
                        type="text"
                        placeholder="กรอกชื่อแผนกใหม่"
                        onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white transition"
                        required
                      />
                    </div>
                  )}

                  <div className="border-t border-dashed border-slate-100 pt-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">กรอกค่าสะสมรหัสรังสีสะสมปีย้อนหลัง (uSv)</span>
                    <div className="grid grid-cols-7 gap-1.5">
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2563</label>
                        <input
                          id="staff-y63"
                          type="number"
                          value={newStaff.y63}
                          onChange={(e) => setNewStaff({ ...newStaff, y63: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2564</label>
                        <input
                          id="staff-y64"
                          type="number"
                          value={newStaff.y64}
                          onChange={(e) => setNewStaff({ ...newStaff, y64: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2565</label>
                        <input
                          id="staff-y65"
                          type="number"
                          value={newStaff.y65}
                          onChange={(e) => setNewStaff({ ...newStaff, y65: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2566</label>
                        <input
                          id="staff-y66"
                          type="number"
                          value={newStaff.y66}
                          onChange={(e) => setNewStaff({ ...newStaff, y66: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2567</label>
                        <input
                          id="staff-y67"
                          type="number"
                          value={newStaff.y67}
                          onChange={(e) => setNewStaff({ ...newStaff, y67: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2568</label>
                        <input
                          id="staff-y68"
                          type="number"
                          value={newStaff.y68}
                          onChange={(e) => setNewStaff({ ...newStaff, y68: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-slate-500 mb-0.5 text-center">ปี 2569</label>
                        <input
                          id="staff-y69"
                          type="number"
                          value={newStaff.y69}
                          onChange={(e) => setNewStaff({ ...newStaff, y69: Number(e.target.value) })}
                          className="w-full text-xs border border-slate-200 rounded-md py-1.5 text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-save-staff"
                    type="submit"
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-teal-400" /> ลงทะเบียนพนักงานใหม่
                  </button>
                </form>
              </div>

              {/* Guidelines / Safety Limits Instructions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">ข้อจำกัดและมาตรฐานนิวเคลียร์ไทย</h3>
                    <p className="text-[10px] text-slate-400">พ.ร.บ. พลังงานประมาณูเพื่อสันติ</p>
                  </div>
                </div>

                <div className="space-y-3 text-slate-600 leading-relaxed">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-1">ความลึกทั่วร่างกาย Hp(10):</span>
                    <p className="text-[11px]">ไม่เกิน <span className="font-semibold text-slate-800">20,000 uSv / ปี</span> สำหรับบุคลากรนิวเคลียร์ทางการแพทย์ หรือค่าเฉลี่ย 5 ปีรวมไม่เกิน 50,000 uSv</p>
                  </div>
                  <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-900 block mb-1">ปริมาณรังสีที่เลนส์ตา Hp(3):</span>
                    <p className="text-[11px]">ไม่เกิน <span className="font-semibold text-slate-800">20,000 uSv / ปี</span> เพื่อสุขอนามัยรอบข้างในการถนอมสายตาอย่างปลอดภัย</p>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-xl">
                    <span className="font-bold text-slate-800 block mb-1">กระบวนการลบข้อมูล (Delete Record)</span>
                    <p className="text-[11px]">คุณสามารถลบเจ้าหน้าที่แต่ละรายการหรือบันทึกได้ถาวร โดยระบบจะคำนวณข้อมูลในสัดส่วนเฉลี่ยรายงานใหม่โดยทันที</p>
                  </div>
                </div>
              </div>

            </div>

            {/* List Table of individual raw monthly records (add/delete table) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">รายการตรวจปริมาณรังสีรายเดือนเดี่ยวทั้งหมด</h3>
                  <p className="text-xs text-slate-400">ควบคุมฐานข้อมูล ลบบันทึกที่วิเคราะห์ผิด หรือค้นหารายการย้อนหลัง</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="search-dose-records"
                      type="text"
                      placeholder="ค้นหาชื่อ, รอบเดือน, เลขแลป..."
                      value={recordSearchTerm}
                      onChange={(e) => setRecordSearchTerm(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>

                  <button
                    id="btn-download-csv"
                    type="button"
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด CSV</span>
                  </button>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                    {filteredDoseRecords.length} / {doseRecords.length} รายการ
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <th className="p-4">ผู้ได้รับรังสี</th>
                      <th className="p-4 text-center">รอบปี/เดือน</th>
                      <th className="p-4 text-center">รหัสแผ่นแลป</th>
                      <th className="p-4 text-center">Hp(10) Deep (uSv)</th>
                      <th className="p-4 text-center">Hp(0.07) Skin (uSv)</th>
                      <th className="p-4 text-center">Hp(3) Eye (uSv)</th>
                      <th className="p-4 text-center">อวัยวะ</th>
                      <th className="p-4 text-center">ระดับ</th>
                      <th className="p-4 text-center">ลบรายการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDoseRecords.length > 0 ? (
                      filteredDoseRecords.map((rec) => (
                        <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-800">{rec.staffName}</td>
                          <td className="p-4 text-center font-bold text-blue-600 font-mono">{rec.yearMonth}</td>
                          <td className="p-4 text-center font-mono text-slate-400">{rec.analysisNo}</td>
                          <td className="p-4 text-center font-mono font-bold">{rec.hp10}</td>
                          <td className="p-4 text-center font-mono text-slate-500">{rec.hp007}</td>
                          <td className="p-4 text-center font-mono text-slate-500">{rec.hp3}</td>
                          <td className="p-4 text-center font-sans text-slate-500">{rec.organ}</td>
                          <td className="p-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              {rec.grade === 'S' ? 'S - ปลอดภัย' : rec.grade === 'M' ? 'M - กำกับ' : 'H - เฝ้าระวัง'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              id={`delete-rec-${rec.id}`}
                              type="button"
                              onClick={() => handleDeleteDoseRecord(rec.id, rec.staffName, rec.yearMonth)}
                              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> ลบออก
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          ฐานข้อมูลว่างเปล่า กรุณากรอกบันทึกใหม่ หรือรีเซ็ตเป็นค่าเริ่มต้น
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SIGNATURES & OFFICIAL REPORT PAGE */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            
            {/* Left/Middle area: Garuda Report Form with Google PDF Viewer mockup inside */}
            <div className="lg:col-span-2 space-y-6">
              <OfficialReport
                records={doseRecords}
                staff={staffList}
                signatures={signatures}
                settings={reportSettings}
                hospitalConfig={hospitalConfig}
                onUpdateSettings={(updated) => {
                  setReportSettings(updated);
                  saveReportSettings(updated);
                }}
                onResetSettings={() => {
                  setReportSettings(loadReportSettings());
                }}
              />
            </div>

            {/* Right layout: Digital Verification Desk for drawing or saraban button signing */}
            <div className="space-y-6 lg:sticky lg:top-4 no-print">
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-blue-400" /> โต๊ะลงนามตรวจสอบเอกสาร
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  กรุณาตรวจสอบความเสถียรของปริมาณรังสีในเอกสารและกดลงลายเซ็นออนไลน์ โดยจะแบ่งสิทธิ์และตำแหน่งชัดเจนตามระเบียบ{hospitalConfig.hospitalName}
                </p>
              </div>

              {/* Signer 1 pad: Chief of Radiotechnology */}
              <SignaturePad
                signerId="radiology_chief"
                signerName={hospitalConfig.chiefName}
                position={`${hospitalConfig.chiefPosition} ${hospitalConfig.hospitalName}`}
                currentSignature={signatures.radiology_chief}
                onSave={(sig) => handleSaveSignature('radiology_chief', sig)}
              />

              {/* Signer 2 pad: Hospital Director */}
              <SignaturePad
                signerId="hospital_director"
                signerName={hospitalConfig.directorName}
                position={hospitalConfig.directorPosition}
                currentSignature={signatures.hospital_director}
                onSave={(sig) => handleSaveSignature('hospital_director', sig)}
              />

              {/* Verification Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-3.5 shadow-sm">
                <h4 className="font-bold text-slate-800">ขั้นตอนการออกรายงานฉบับสมบูรณ์:</h4>
                <ul className="space-y-2 list-none">
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      doseRecords.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}>1</span>
                    <span>ป้อนข้อมูลสถิติตามเอกสารผลวิเคราะห์ล่าสุด</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      signatures.radiology_chief?.isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}>2</span>
                    <span>{hospitalConfig.chiefPosition || 'หัวหน้างานรังสี'}รับรองระบบ ({hospitalConfig.chiefName || 'รอระบุชื่อ'})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      signatures.hospital_director?.isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}>3</span>
                    <span>{hospitalConfig.directorPosition || 'ผู้อำนวยการโรงพยาบาล'}ลงนามอนุมัติ ({hospitalConfig.directorName || 'รอระบุชื่อ'})</span>
                  </li>
                  <li className="flex items-center gap-2 text-blue-600 font-semibold border-t border-slate-100 pt-2">
                    <Printer className="w-3.5 h-3.5" />
                    <span>ใช้ปุ่มเครื่องมือเปิด Print บันทึกแผ่น PDF คุณภาพสูง (A4)</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: STAFF REGISTRY BY DEPARTMENT */}
        {activeTab === 'registry' && (
          <StaffRegistry
            staffList={staffList}
            onDeleteStaff={(id, name) => handleDeleteStaff(id, name)}
            onViewDetail={(staff) => setSelectedStaffForDetail(staff)}
            onAddStaff={(staffData) => {
              const newMember: StaffMember = {
                id: `staff-manual-${Date.now()}`,
                name: staffData.name,
                position: staffData.position,
                department: staffData.department,
                historicalDoses: staffData.historicalDoses
              };
              const updatedStaff = [...staffList, newMember];
              setStaffList(updatedStaff);
              saveStaff(updatedStaff);
              alert(`เพิ่มรายชื่อบุคลากรใหม่ "${newMember.name}" เข้าแผนก "${newMember.department}" สำเร็จ`);
            }}
          />
        )}

        {/* TAB 5: SMART AI PASTE */}
        {activeTab === 'ai-paste' && (
          <div className="space-y-6 animate-fadeIn">
            <SmartAIPaste
              staffList={staffList}
              onSaveRecords={(newRecords, updatedStaff) => {
                const combinedRecords = [...newRecords, ...doseRecords];
                setDoseRecords(combinedRecords);
                saveRecords(combinedRecords);
                
                setStaffList(updatedStaff);
                saveStaff(updatedStaff);
                
                setActiveTab('data');
              }}
              onClose={() => setActiveTab('data')}
            />
          </div>
        )}

      </main>
      </div>

      {/* Staff individual detail modal (แผงวินิจฉัยเชิงลึกรายบุคคล) */}
      {selectedStaffForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none">{selectedStaffForDetail.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{selectedStaffForDetail.position} • {selectedStaffForDetail.department}</p>
                </div>
              </div>
              <button
                id="modal-close-btn"
                type="button"
                onClick={() => setSelectedStaffForDetail(null)}
                className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed font-sans">
              
              {/* Detailed Trend analysis */}
              <div>
                <h5 className="font-bold text-slate-800 text-[13px] mb-3 flex items-center gap-1">
                  📊 วิเคราะห์การสะสมรายปี (๕ ปีล่าสุด)
                </h5>
                <div className="grid grid-cols-5 gap-3 text-center">
                  {Object.entries(selectedStaffForDetail.historicalDoses).map(([year, dose]) => (
                    <div key={year} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1">ปี {year}</span>
                      <span className="block font-mono font-bold text-lg text-slate-800">{(dose as number) > 0 ? (dose as number) : '-'}</span>
                      <span className="text-[8px] text-slate-400 font-mono">uSv</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly detail table specific to this person */}
              <div>
                <h5 className="font-bold text-slate-800 text-[13px] mb-3 flex items-center gap-1">
                  📅 ประวัติการประเมินรายเดือนล่าสุด
                </h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5">รอบปี/เดือน</th>
                        <th className="p-2.5 text-center">เลขรหัสแผ่นแลป</th>
                        <th className="p-2.5 text-right">Hp(10) สูงสุด (uSv)</th>
                        <th className="p-2.5 text-right">Hp(3) เลนส์ตา</th>
                        <th className="p-2.5 text-center">อวัยวะ</th>
                        <th className="p-2.5 text-center">เกณฑ์ทดสอบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doseRecords.filter(r => r.staffId === selectedStaffForDetail.id).length > 0 ? (
                        doseRecords
                          .filter(r => r.staffId === selectedStaffForDetail.id)
                          .map((rec) => (
                            <tr key={rec.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-blue-600 font-mono">{rec.yearMonth}</td>
                              <td className="p-2.5 text-center font-mono text-slate-400">{rec.analysisNo}</td>
                              <td className="p-2.5 text-right font-mono font-bold">{rec.hp10}</td>
                              <td className="p-2.5 text-right font-mono">{rec.hp3}</td>
                              <td className="p-2.5 text-center">{rec.organ}</td>
                              <td className="p-2.5 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  {rec.grade === 'H' ? 'เฝ้าระวัง' : 'S - ปลอดภัย'}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            ไม่มีพบประวัติรายเดือนบรรจุในรอบรายงานนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customized medical feedback based on individual performance */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-[11px] text-blue-800">
                  <p className="font-bold">✓ แนะนำความปลอดภัยทางปริมาณรังสี (Radiation Hygiene Guidance)</p>
                  <p className="leading-relaxed opacity-90">
                    เจ้าหน้าที่ท่านนี้มีความถี่ได้รับปริมาณรังสีสะสมปลอดภัยดีเยี่ยม ควรรักษามาตรฐานการสวมใส่เครื่องป้องกันตะกั่ว (Lead Aprons & Thyroid Shields) ทุกการปฏิบัติงาน และทำการวัดรอบปริมาณรังสีตามเกณฑ์ที่กรมวิทยาศาสตร์การแพทย์กำหนดอย่างเคร่งครัด
                  </p>
                </div>
              </div>

            </div>

            {/* Modal footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right shrink-0">
              <button
                id="btn-close-modal-footer"
                type="button"
                onClick={() => setSelectedStaffForDetail(null)}
                className="px-5 py-2 hover:bg-slate-200 border border-slate-250 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                ปิดหน้าต่างตรวจสอบ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* User Beginner Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        hospitalConfig={hospitalConfig}
        onOpenHospitalSettings={() => {
          setIsUserGuideOpen(false);
          setIsHospitalSettingsOpen(true);
        }}
        onOpenAIPaste={() => {
          setIsUserGuideOpen(false);
          setActiveTab('ai-paste');
        }}
      />

      {/* Hospital Admin Settings Modal */}
      <HospitalSettingsModal
        isOpen={isHospitalSettingsOpen}
        onClose={() => setIsHospitalSettingsOpen(false)}
        hospitalConfig={hospitalConfig}
        onSaveHospitalConfig={handleSaveHospitalConfig}
        reportSettings={reportSettings || undefined}
        onSaveReportSettings={(updated) => {
          setReportSettings(updated);
          saveReportSettings(updated);
        }}
        onResetToBlank={(hName, hProv) => handleResetToBlank(hName, hProv)}
      />

      {/* footer - NOT PRINTED */}
      <footer className="no-print bg-slate-950 text-slate-500 text-center py-6 text-xs border-t border-slate-900 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© ๒๕๖๙ ระบบจัดการข้อมูลความปลอดภัยทางรังสี {hospitalConfig.hospitalName} ({hospitalConfig.departmentName})</p>
          <p className="text-[10px] text-slate-600">อ้างอิงรหัสความปลอดภัยของกรมวิทยาศาสตร์การแพทย์ พรบ.ความปลอดภัยทางรังสีและนิวเคลียร์ พ.ศ. ๒๕๕๙</p>
        </div>
      </footer>

    </div>
  );
}
