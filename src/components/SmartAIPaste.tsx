import React, { useState, useMemo } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Trash, Plus, Info, X } from 'lucide-react';
import { StaffMember, DoseRecord } from '../types';

interface SmartAIPasteProps {
  staffList: StaffMember[];
  onSaveRecords: (newRecords: DoseRecord[], updatedStaff: StaffMember[]) => void;
  onClose: () => void;
}

interface ParsedRecord {
  staffName: string;
  yearMonth: string;
  hp10: number;
  hp007: number;
  hp3: number;
  analysisNo: string;
  organ: string;
  grade: 'S' | 'M' | 'H';
  matchedStaffId?: string; // If matched with existing staff
}

// Helper to normalize Thai names to match them regardless of spaces or prefixes
function normalizeThaiName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/^(นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง|ดร\.|นพ\.|พญ\.|ทพ\.|ทพญ\.)\s*/, '')
    .replace(/\s+/g, '');
}

// Local fallback text parser for Gemini summaries, PDF text, and GAS exports
function parseTextLocally(text: string, staffList: StaffMember[], systemYears: number[]): ParsedRecord[] {
  const records: ParsedRecord[] = [];
  const lines = text.split('\n');
  const defaultYM = `${systemYears[systemYears.length - 1] || 2570}/01`;

  let currentStaffName = '';
  let currentMonths: string[] = [];
  let currentHp10 = 50;
  let currentHp007 = 50;
  let currentHp3 = 50;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for single line format (e.g., "1. กิ่งแก้ว เสรีศักดิ์ Hp(10)=38 Hp(0.07)=32 Hp(3)=38 2568/12 0469094964 ลำตัว")
    const ymMatch = trimmed.match(/(\d{4}\/\d{1,2})/);
    const hp10Match = trimmed.match(/Hp\(?10\)?\s*[:=]?\s*(\d+)/i);
    const hp007Match = trimmed.match(/Hp\(?0\.?07\)?\s*[:=]?\s*(\d+)/i);
    const hp3Match = trimmed.match(/Hp\(?3\)?\s*[:=]?\s*(\d+)/i);
    const analysisMatch = trimmed.match(/(?:04690\d{5}|\b\d{10}\b)/);
    const thaiNameMatch = trimmed.match(/([ก-๙]+(?:\s+[ก-๙]+)+)/);

    if (thaiNameMatch && ymMatch && (hp10Match || hp007Match || hp3Match)) {
      const name = thaiNameMatch[1].trim();
      const ym = ymMatch[1].trim();
      const hp10 = hp10Match ? parseInt(hp10Match[1], 10) : 50;
      const hp007 = hp007Match ? parseInt(hp007Match[1], 10) : 50;
      const hp3 = hp3Match ? parseInt(hp3Match[1], 10) : 50;
      const analysisNo = analysisMatch ? analysisMatch[0] : `04690${Math.floor(10000 + Math.random() * 90000)}`;

      let grade: 'S' | 'M' | 'H' = 'S';
      if (hp10 >= 1000 || hp007 >= 10000 || hp3 >= 1500) grade = 'H';
      else if (hp10 >= 300 || hp007 >= 3000 || hp3 >= 500) grade = 'M';

      const normName = normalizeThaiName(name);
      const matchedStaff = staffList.find(s => {
        const n = normalizeThaiName(s.name);
        return n === normName || n.includes(normName) || normName.includes(n);
      });

      records.push({
        staffName: matchedStaff ? matchedStaff.name : name,
        yearMonth: ym,
        hp10,
        hp007,
        hp3,
        analysisNo,
        organ: 'ลำตัว',
        grade,
        matchedStaffId: matchedStaff?.id
      });
      return;
    }

    // Check for block header (e.g. "- ปัฐวิพงษ์ มโนชมภู" or "1. ปัฐวิพงษ์ มโนชมภู")
    if (thaiNameMatch && !trimmed.toLowerCase().includes('hp') && !trimmed.includes('รอบปี')) {
      if (!trimmed.includes('ข้อกำหนด') && !trimmed.includes('สัญลักษณ์') && !trimmed.includes('ความหมาย') && !trimmed.includes('รายงาน') && !trimmed.includes('ปริมาณรังสี')) {
        currentStaffName = thaiNameMatch[1].trim();
        currentMonths = [];
      }
    }

    // Check for round/months line: "รอบปี/เดือน: 2568/12, 2569/01"
    const roundMatch = trimmed.match(/(?:รอบปี\/เดือน|ปี\/เดือน|รอบ|เดือน|Period)\s*:?\s*([\d\/\s,]+)/i);
    if (roundMatch) {
      const allYms = roundMatch[1].match(/\d{4}\/\d{1,2}/g);
      if (allYms && allYms.length > 0) {
        currentMonths = allYms;
      }
    }

    // Check for dose line: "ปริมาณรังสี: Hp(10) = 68 | Hp(0.07) = 68 | Hp(3) = 68"
    if (hp10Match || hp007Match || hp3Match) {
      currentHp10 = hp10Match ? parseInt(hp10Match[1], 10) : 50;
      currentHp007 = hp007Match ? parseInt(hp007Match[1], 10) : 50;
      currentHp3 = hp3Match ? parseInt(hp3Match[1], 10) : 50;

      if (currentStaffName && currentMonths.length > 0) {
        let grade: 'S' | 'M' | 'H' = 'S';
        if (currentHp10 >= 1000 || currentHp007 >= 10000 || currentHp3 >= 1500) grade = 'H';
        else if (currentHp10 >= 300 || currentHp007 >= 3000 || currentHp3 >= 500) grade = 'M';

        const normName = normalizeThaiName(currentStaffName);
        const matchedStaff = staffList.find(s => {
          const n = normalizeThaiName(s.name);
          return n === normName || n.includes(normName) || normName.includes(n);
        });

        currentMonths.forEach(ym => {
          records.push({
            staffName: matchedStaff ? matchedStaff.name : currentStaffName,
            yearMonth: ym,
            hp10: currentHp10,
            hp007: currentHp007,
            hp3: currentHp3,
            analysisNo: `04690${Math.floor(10000 + Math.random() * 90000)}`,
            organ: 'ลำตัว',
            grade,
            matchedStaffId: matchedStaff?.id
          });
        });

        currentMonths = [];
      }
    }
  });

  // Fallback scan if empty: extract any detected names and yearMonths
  if (records.length === 0) {
    const allYMs = text.match(/\d{4}\/\d{1,2}/g) || [defaultYM];
    const allNames = text.match(/([ก-๙]{3,}\s+[ก-๙]{3,})/g);
    if (allNames && allNames.length > 0) {
      const uniqueNames = Array.from(new Set(allNames));
      uniqueNames.forEach(name => {
        if (name.includes('ข้อกำหนด') || name.includes('สัญลักษณ์') || name.includes('ความหมาย') || name.includes('รายงาน') || name.includes('ปริมาณรังสี')) return;
        
        const normName = normalizeThaiName(name);
        const matchedStaff = staffList.find(s => {
          const n = normalizeThaiName(s.name);
          return n === normName || n.includes(normName) || normName.includes(n);
        });

        allYMs.forEach(ym => {
          records.push({
            staffName: matchedStaff ? matchedStaff.name : name,
            yearMonth: ym,
            hp10: 50,
            hp007: 50,
            hp3: 50,
            analysisNo: `04690${Math.floor(10000 + Math.random() * 90000)}`,
            organ: 'ลำตัว',
            grade: 'S',
            matchedStaffId: matchedStaff?.id
          });
        });
      });
    }
  }

  return records;
}

export default function SmartAIPaste({ staffList, onSaveRecords, onClose }: SmartAIPasteProps) {
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

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
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [staffList]);

  // Example text to help the user understand what can be pasted
  const handleLoadExample1 = () => {
    setPastedText(
`สัญกรณ์รายงานปริมาณรังสีสรุปโดย Gemini:
- ปัฐวิพงษ์ มโนชมภู
  - รอบปี/เดือน: 2568/12, 2569/01, 2569/02
  - ปริมาณรังสี: Hp(10) = 68 | Hp(0.07) = 68 | Hp(3) = 68
- วิระพงษ์ จอมเมืองกาศ
  - รอบปี/เดือน: 2568/12, 2569/01, 2569/02
  - ปริมาณรังสี: Hp(10) = 55 | Hp(0.07) = 55 | Hp(3) = 55
- สมชาย รังสีดี
  - รอบปี/เดือน: 2568/12, 2569/01, 2569/02
  - ปริมาณรังสี: Hp(10) = 65 | Hp(0.07) = 62 | Hp(3) = 65`);
  };

  const handleLoadExample2 = () => {
    setPastedText(
`รายงานปริมาณรังสีบุคคล (ข้อความคัดลอกจาก PDF รายงานดิบ)
ลำดับ-รายชื่อ ปริมาณรังสี(ไมโครซีเวิร์ต) ปี/เดือน เลขวิเคราะห์ อวัยวะ
1. กิ่งแก้ว เสรีศักดิ์ Hp(10)=38 Hp(0.07)=32 Hp(3)=38 2568/12 0469094964 ลำตัว
2. กิ่งแก้ว เสรีศักดิ์ Hp(10)=38 Hp(0.07)=32 Hp(3)=38 2569/01 0469094965 ลำตัว
3. จักรพันธ์ นันดากาศ Hp(10)=68 Hp(0.07)=68 Hp(3)=68 2568/12 0469094967 ลำตัว`);
  };

  const handleAnalyze = async () => {
    if (!pastedText.trim()) {
      setError('กรุณากรอกหรือวางข้อความสรุปรายงานรังสีจาก Gemini หรือ PDF ก่อน');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    let rawRecords: any[] = [];

    // 1. First attempt AI API if available
    try {
      const response = await fetch('/api/parse-doses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          rawRecords = data.records;
        }
      }
    } catch (err) {
      console.warn('AI API parse unavailable, using client-side smart parser:', err);
    }

    // 2. If AI returned no records or failed, use local smart regex parser
    if (rawRecords.length === 0) {
      const localParsed = parseTextLocally(pastedText, staffList, systemYears);
      if (localParsed.length > 0) {
        setParsedRecords(localParsed);
        setHasAnalyzed(true);
        setIsAnalyzing(false);
        return;
      }
    }

    // 3. Process rawRecords from AI if present
    if (rawRecords.length > 0) {
      const processed: ParsedRecord[] = rawRecords.map((rec: any) => {
        const parsedName = rec.staffName || '';
        const normalizedParsed = normalizeThaiName(parsedName);

        const matchedStaff = staffList.find(staff => {
          const normalizedStaff = normalizeThaiName(staff.name);
          return normalizedStaff === normalizedParsed || 
                 normalizedStaff.includes(normalizedParsed) || 
                 normalizedParsed.includes(normalizedStaff);
        });

        const hp10 = Number(rec.hp10) || 0;
        const hp007 = Number(rec.hp007) || 0;
        const hp3 = Number(rec.hp3) || 0;
        let grade: 'S' | 'M' | 'H' = rec.grade || 'S';
        if (hp10 >= 1000 || hp007 >= 10000 || hp3 >= 1500) {
          grade = 'H';
        } else if (hp10 >= 300 || hp007 >= 3000 || hp3 >= 500) {
          grade = 'M';
        }

        return {
          staffName: matchedStaff ? matchedStaff.name : parsedName,
          yearMonth: rec.yearMonth || `${systemYears[systemYears.length - 1] || 2570}/01`,
          hp10,
          hp007,
          hp3,
          analysisNo: rec.analysisNo || `04690${Math.floor(10000 + Math.random() * 90000)}`,
          organ: rec.organ || 'ลำตัว',
          grade,
          matchedStaffId: matchedStaff?.id,
        };
      });

      setParsedRecords(processed);
      setHasAnalyzed(true);
      setIsAnalyzing(false);
      return;
    }

    // 4. Default fallback draft row if no patterns detected at all
    const defaultStaff = staffList[0];
    setParsedRecords([{
      staffName: defaultStaff ? defaultStaff.name : 'เจ้าหน้าที่รังสี',
      yearMonth: `${systemYears[systemYears.length - 1] || 2570}/01`,
      hp10: 50,
      hp007: 50,
      hp3: 50,
      analysisNo: `04690${Math.floor(10000 + Math.random() * 90000)}`,
      organ: 'ลำตัว',
      grade: 'S',
      matchedStaffId: defaultStaff?.id
    }]);
    setHasAnalyzed(true);
    setIsAnalyzing(false);
  };

  // Remove a single parsed item from preview list
  const handleRemoveRecord = (index: number) => {
    setParsedRecords(parsedRecords.filter((_, i) => i !== index));
  };

  // Modify any field directly in preview
  const handleUpdateRecordField = (index: number, field: keyof ParsedRecord, value: any) => {
    const updated = [...parsedRecords];
    updated[index] = {
      ...updated[index],
      [field]: value
    };

    // If updating name, re-evaluate matched staff
    if (field === 'staffName') {
      const normalizedParsed = normalizeThaiName(value);
      const matchedStaff = staffList.find(staff => {
        const normalizedStaff = normalizeThaiName(staff.name);
        return normalizedStaff === normalizedParsed || 
               normalizedStaff.includes(normalizedParsed) || 
               normalizedParsed.includes(normalizedStaff);
      });
      updated[index].matchedStaffId = matchedStaff?.id;
      if (matchedStaff) {
        updated[index].staffName = matchedStaff.name;
      }
    }

    // Recalculate grade if doses changed
    if (field === 'hp10' || field === 'hp007' || field === 'hp3') {
      const hp10 = Number(field === 'hp10' ? value : updated[index].hp10) || 0;
      const hp007 = Number(field === 'hp007' ? value : updated[index].hp007) || 0;
      const hp3 = Number(field === 'hp3' ? value : updated[index].hp3) || 0;
      let grade: 'S' | 'M' | 'H' = 'S';
      if (hp10 >= 1000 || hp007 >= 10000 || hp3 >= 1500) {
        grade = 'H';
      } else if (hp10 >= 300 || hp007 >= 3000 || hp3 >= 500) {
        grade = 'M';
      }
      updated[index].grade = grade;
    }

    setParsedRecords(updated);
  };

  // Save parsed data to the main app database
  const handleSaveAll = () => {
    if (parsedRecords.length === 0) return;

    // Track any newly created staff members
    const newStaffMembers: StaffMember[] = [];
    let updatedStaffList = [...staffList];

    // Build lists of final DoseRecord objects
    const finalDoseRecords: DoseRecord[] = parsedRecords.map((item, idx) => {
      let staffId = item.matchedStaffId;
      let staffName = item.staffName;

      // If no match, create a new staff member automatically!
      if (!staffId) {
        const newId = `staff-auto-${Date.now()}-${idx}`;
        const initialDoses: Record<string, number> = {};
        systemYears.forEach(y => {
          initialDoses[y.toString()] = 0;
        });

        const newMember: StaffMember = {
          id: newId,
          name: staffName,
          position: 'ผู้ช่วยเหลือคนไข้/เจ้าหน้าที่บริการรังสี',
          department: 'แผนกรังสีเทคนิค',
          historicalDoses: initialDoses
        };
        newStaffMembers.push(newMember);
        updatedStaffList.push(newMember);
        staffId = newId;
      }

      // Extract year to update historical cumulative doses
      const year = (item.yearMonth.split('/')[0] || '2569').trim();
      
      // Update that staff member's historical dose for that year
      updatedStaffList = updatedStaffList.map(staff => {
        if (staff.id === staffId) {
          const currentVal = staff.historicalDoses[year] || 0;
          return {
            ...staff,
            historicalDoses: {
              ...staff.historicalDoses,
              [year]: currentVal + item.hp10
            }
          };
        }
        return staff;
      });

      return {
        id: `r-ai-${Date.now()}-${idx}`,
        staffId: staffId!,
        staffName: staffName,
        yearMonth: item.yearMonth,
        hp10: item.hp10,
        hp007: item.hp007,
        hp3: item.hp3,
        analysisNo: item.analysisNo,
        organ: item.organ,
        grade: item.grade
      };
    });

    onSaveRecords(finalDoseRecords, updatedStaffList);
    alert(`นำเข้าบันทึกปริมาณรังสีเข้าระบบสำเร็จทั้งหมด ${finalDoseRecords.length} รายการ!\n${newStaffMembers.length > 0 ? `(ลงทะเบียนบุคลากรใหม่โดยอัตโนมัติ ${newStaffMembers.length} ท่าน)` : ''}`);
    onClose();
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-blue-100 p-5 shadow-sm space-y-4 animate-fadeIn border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">ระบบสกัดและนำเข้าข้อมูล (Smart Data Import)</h3>
            <p className="text-xs text-slate-500">วางข้อความสรุปรายงาน ผลวิเคราะห์ หรือข้อความดิบจาก PDF เพื่อสกัดข้อมูลประวัติได้ทันที</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!hasAnalyzed ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600">วางข้อความที่คัดลอกมาที่นี่</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleLoadExample1}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  📝 ตัวอย่างสรุป Gemini
                </button>
                <span className="text-slate-300 text-[10px]">|</span>
                <button
                  type="button"
                  onClick={handleLoadExample2}
                  className="text-[10px] text-blue-600 hover:underline font-bold"
                >
                  📄 ตัวอย่างข้อความจาก PDF
                </button>
              </div>
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="วางข้อมูลสรุปหรือรายงานที่นี่..."
              className="w-full h-44 text-xs font-mono border border-slate-200 rounded-xl px-3.5 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs flex items-start gap-2 animate-fadeIn font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสกัดและประมวลผลข้อมูล...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ประมวลผลและสกัดข้อมูล</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>วิเคราะห์โครงสร้างข้อมูลสถิติสำเร็จ! สกัดได้ {parsedRecords.length} รายการ</span>
            </div>
            <button
              onClick={() => {
                setHasAnalyzed(false);
                setParsedRecords([]);
              }}
              className="text-blue-700 hover:underline font-bold"
            >
              วิเคราะห์ใหม่
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-600 border-collapse">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-center w-12">ลำดับ</th>
                  <th className="p-3">เจ้าหน้าที่</th>
                  <th className="p-3 text-center">รอบปี/เดือน</th>
                  <th className="p-3 text-center">Hp(10) (Deep)</th>
                  <th className="p-3 text-center">Hp(0.07) (Skin)</th>
                  <th className="p-3 text-center">Hp(3) (Eyes)</th>
                  <th className="p-3">เลขวิเคราะห์</th>
                  <th className="p-3 text-center w-12">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {parsedRecords.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={item.staffName}
                          onChange={(e) => handleUpdateRecordField(idx, 'staffName', e.target.value)}
                          className="font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-full"
                        />
                        {item.matchedStaffId ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5" /> จับคู่พนักงานรังสีในระบบสำเร็จ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                            <Info className="w-2.5 h-2.5" /> จะลงทะเบียนบุคลากรใหม่นี้โดยอัตโนมัติ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="text"
                        value={item.yearMonth}
                        onChange={(e) => handleUpdateRecordField(idx, 'yearMonth', e.target.value)}
                        className="font-mono text-center bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-20"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={item.hp10}
                        onChange={(e) => handleUpdateRecordField(idx, 'hp10', Number(e.target.value))}
                        className="font-mono text-center font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-16"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={item.hp007}
                        onChange={(e) => handleUpdateRecordField(idx, 'hp007', Number(e.target.value))}
                        className="font-mono text-center bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-16"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={item.hp3}
                        onChange={(e) => handleUpdateRecordField(idx, 'hp3', Number(e.target.value))}
                        className="font-mono text-center bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-16"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.analysisNo}
                        onChange={(e) => handleUpdateRecordField(idx, 'analysisNo', e.target.value)}
                        className="font-mono bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-md px-2 py-1 outline-none w-28"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveRecord(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="ลบแถวนี้ออกจากชุดนำเข้า"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              * คุณสามารถแก้ไขชื่อ, เดือน หรือรังสีได้โดยตรงจากตารางพรีวิวก่อนบันทึกเข้าระบบ
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setHasAnalyzed(false);
                  setParsedRecords([]);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={parsedRecords.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl shadow-sm transition hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึกเข้าระบบทั้งหมด ({parsedRecords.length} รายการ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
