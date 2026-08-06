import React, { useState, useEffect, useMemo } from 'react';
import { DoseRecord, StaffMember, SignatureLog, ReportSettings, HospitalConfig } from '../types';
import { FileText, Printer, Download, Eye, FileSpreadsheet, Lock, HelpCircle, RefreshCw, Calendar, Award } from 'lucide-react';

const DEPARTMENTS = ["แผนกรังสีเทคนิค", "แผนกทันตกรรม", "แผนกผู้ช่วยเหลือคนไข้ งานเปล"];

interface OfficialReportProps {
  records: DoseRecord[];
  staff: StaffMember[];
  signatures: Record<string, SignatureLog>;
  settings: ReportSettings;
  hospitalConfig?: HospitalConfig;
  onUpdateSettings: (settings: ReportSettings) => void;
  onResetSettings: () => void;
}

export default function OfficialReport({
  records,
  staff,
  signatures,
  settings,
  hospitalConfig,
  onUpdateSettings,
  onResetSettings
}: OfficialReportProps) {
  const hName = hospitalConfig?.hospitalName || "";
  const hDept = hospitalConfig?.departmentName || "";
  const hProv = hospitalConfig?.province || "";
  const cName = hospitalConfig?.chiefName || "..................................................";
  const cPos = hospitalConfig?.chiefPosition || "หัวหน้างานรังสีเทคนิค";
  const dName = hospitalConfig?.directorName || "..................................................";
  const dPos = hospitalConfig?.directorPosition || (hName ? `ผู้อำนวยการ${hName}` : "ผู้อำนวยการโรงพยาบาล");

  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'fiveyear'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const systemYears = useMemo(() => {
    const defaultYears = [2563, 2564, 2565, 2566, 2567, 2568, 2569, 2570];
    const yearsSet = new Set<number>(defaultYears);
    staff.forEach(s => {
      Object.keys(s.historicalDoses).forEach(yr => {
        const yrVal = parseInt(yr, 10);
        if (!isNaN(yrVal)) {
          yearsSet.add(yrVal);
        }
      });
    });
    records.forEach(r => {
      const parts = r.yearMonth.split('/');
      if (parts[0]) {
        const yrVal = parseInt(parts[0], 10);
        if (!isNaN(yrVal)) {
          yearsSet.add(yrVal);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [staff, records]);

  const maxYear = systemYears[systemYears.length - 1] || 2570;

  const [selectedYear, setSelectedYear] = useState<number>(2570);
  const [fiveYearRange, setFiveYearRange] = useState<string>('');

  useEffect(() => {
    if (fiveYearRange === '') {
      setFiveYearRange(`${maxYear - 4}-${maxYear}`);
    }
  }, [maxYear]);

  useEffect(() => {
    if (selectedYear === 2569 && maxYear >= 2570) {
      setSelectedYear(maxYear);
    }
  }, [maxYear]);

  // Find unique months listed in records for advanced filtering
  const availableMonths = Array.from(new Set(records.map(r => r.yearMonth)))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a)); // Sort descending

  // Convert numbers to Thai numerals for official Thai government look
  const toThaiNumerals = (num: string | number): string => {
    const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return num.toString().replace(/[0-9]/g, (match) => thaiDigits[parseInt(match)]);
  };

  // Convert Gregorian/Buddhist year to gorgeous Thai month name label
  const formatMonthThai = (ym: string): string => {
    const [yr, mo] = ym.split('/');
    const thMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const mIdx = parseInt(mo, 10) - 1;
    return `${thMonths[mIdx]} ${yr}`;
  };

  // 1. Process Monthly Doses (with individual or quarterly range support)
  const monthlyDoses = staff.map((member) => {
    let sRecords = records.filter(r => r.staffId === member.id);
    if (selectedMonth === 'all') {
      // Default: last quarter of 2568 - 2569 (ธ.ค. 68 ถึง ก.พ. 69)
      sRecords = sRecords.filter(r => (r.yearMonth === "2568/12" || r.yearMonth === "2569/01" || r.yearMonth === "2569/02"));
    } else {
      sRecords = sRecords.filter(r => r.yearMonth === selectedMonth);
    }
    
    const hp10Sum = sRecords.reduce((sum, r) => sum + r.hp10, 0);
    const hp07Sum = sRecords.reduce((sum, r) => sum + r.hp007, 0);
    const hp3Sum = sRecords.reduce((sum, r) => sum + r.hp3, 0);
    
    return {
      member,
      records: sRecords,
      hp10Avg: sRecords.length ? Math.round(hp10Sum / sRecords.length) : 0,
      hp07Avg: sRecords.length ? Math.round(hp07Sum / sRecords.length) : 0,
      hp3Avg: sRecords.length ? Math.round(hp3Sum / sRecords.length) : 0,
      recordsCount: sRecords.length
    };
  });

  // 2. Process Yearly Doses (with dynamic annual accumulation or DB fallback)
  const yearlyDoses = staff.map((member) => {
    const sRecords = records.filter(r => r.staffId === member.id && r.yearMonth.startsWith(`${selectedYear}/`));
    
    let hp10 = sRecords.reduce((sum, r) => sum + r.hp10, 0);
    let hp07 = sRecords.reduce((sum, r) => sum + r.hp007, 0);
    let hp3 = sRecords.reduce((sum, r) => sum + r.hp3, 0);
    
    // If no monthly records are found in the system for this year, pull from historical pre-records
    if (hp10 === 0 && member.historicalDoses[selectedYear.toString()] !== undefined) {
      hp10 = member.historicalDoses[selectedYear.toString()] || 0;
    }
    
    return {
      member,
      hp10,
      hp07,
      hp3,
      recordsCount: sRecords.length
    };
  });

  // 3. Process 5-Year Accumulated Doses
  const fiveYearYears = useMemo(() => {
    if (!fiveYearRange) return [maxYear - 4, maxYear - 3, maxYear - 2, maxYear - 1, maxYear];
    const [start] = fiveYearRange.split('-').map(Number);
    return Array.from({ length: 5 }, (_, i) => start + i);
  }, [fiveYearRange, maxYear]);

  const fiveYearDoses = staff.map((member) => {
    const yearlyData = fiveYearYears.map(yr => {
      const sRecords = records.filter(r => r.staffId === member.id && r.yearMonth.startsWith(`${yr}/`));
      if (sRecords.length > 0) {
        return sRecords.reduce((sum, r) => sum + r.hp10, 0);
      }
      return member.historicalDoses[yr.toString()] || 0;
    });

    const sum = yearlyData.reduce((acc, v) => acc + v, 0);
    const activeYears = yearlyData.filter(v => v > 0).length || 1;
    const avg = Math.round(sum / activeYears);

    return {
      member,
      yearlyData,
      sum,
      avg
    };
  });

  // Automatically update settings.monthRangeText upon selection changes
  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    if (val === 'all') {
      onUpdateSettings({ ...settings, monthRangeText: "ธันวาคม 2568 ถึง กุมภาพันธ์ 2569" });
    } else {
      onUpdateSettings({ ...settings, monthRangeText: formatMonthThai(val) });
    }
  };

  const handleYearChange = (yr: number) => {
    setSelectedYear(yr);
    onUpdateSettings({ ...settings, monthRangeText: `ประจำปีงบประมาณ พ.ศ. ${yr}` });
  };

  const handleFiveYearChange = (range: '2563-2567' | '2564-2568' | '2565-2569') => {
    setFiveYearRange(range);
    const start = range === '2563-2567' ? '2563' : range === '2564-2568' ? '2564' : '2565';
    const end = range === '2563-2567' ? '2567' : range === '2564-2568' ? '2568' : '2569';
    onUpdateSettings({ ...settings, monthRangeText: `สถิติสะสมย้อนหลัง 5 ปี (พ.ศ. ${start} - ${end})` });
  };

  // Google PDF Generator & High-Fidelity standalone Print viewer
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("ไม่สามารถสร้างหน้าต่าง PDF ชั่วคราวได้ กรุณาปิดการบล็อกป๊อปอัป (Popup Blocker) ของเบราว์เซอร์");
      return;
    }

    const DEPARTMENTS = ["แผนกรังสีเทคนิค", "แผนกทันตกรรม", "แผนกผู้ช่วยเหลือคนไข้ งานเปล"];
    let reportTitle = "";
    let reportTableHTML = "";
    
    if (reportType === 'monthly') {
      const monthTitle = selectedMonth === 'all' ? settings.monthRangeText : formatMonthThai(selectedMonth);
      reportTitle = `ตารางรายงานปริมาณรังสีรอบล่าสุดประจำเดือน (${monthTitle})`;
      reportTableHTML = `
        <table class="w-full text-xs border-collapse border border-black text-black">
          <thead>
            <tr class="bg-gray-100 font-bold uppercase text-[10px]">
              <th class="border border-black p-1 text-center w-8">ลำดับ</th>
              <th class="border border-black p-1 text-left">ชื่อ-นามสกุล ผู้ได้รับรังสี</th>
              <th class="border border-black p-1 text-center w-24">ประเภทการวัด</th>
              <th class="border border-black p-1 text-center w-20">ปริมาณรังสีสะสม<br />(Hp(10) ไมโครซีเวิร์ต)</th>
              <th class="border border-black p-1 text-center w-20">ปริมาณผิวหนัง<br />(Hp(0.07) uSv)</th>
              <th class="border border-black p-1 text-center w-20">ปริมาณเลนส์ตา<br />(Hp(3) uSv)</th>
              <th class="border border-black p-1 text-center w-12">เกณฑ์</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let idx = 0;
              return DEPARTMENTS.map(dept => {
                const deptItems = monthlyDoses.filter(item => item.member.department === dept);
                if (deptItems.length === 0) return '';
                const deptHeader = `
                  <tr class="bg-gray-55 font-bold">
                    <td colspan="7" class="border border-black p-1 text-left text-[11px] text-slate-800 pl-2 bg-slate-50">${dept}</td>
                  </tr>
                `;
                const rows = deptItems.map(item => {
                  idx++;
                  return `
                    <tr class="text-xs">
                      <td class="border border-black p-1 text-center font-mono">${idx}</td>
                      <td class="border border-black p-1 font-medium">${item.member.name}</td>
                      <td class="border border-black p-1 text-center text-[10px]">ประจำตัว (ลำตัว)</td>
                      <td class="border border-black p-1 text-center font-mono font-bold">${item.hp10Avg > 0 ? item.hp10Avg : '-'}</td>
                      <td class="border border-black p-1 text-center font-mono">${item.hp07Avg > 0 ? item.hp07Avg : '-'}</td>
                      <td class="border border-black p-1 text-center font-mono">${item.hp3Avg > 0 ? item.hp3Avg : '-'}</td>
                      <td class="border border-black p-1 text-center font-bold text-[11px] text-teal-700">S</td>
                    </tr>
                  `;
                }).join('');
                return deptHeader + rows;
              }).join('');
            })()}
          </tbody>
        </table>
      `;
    } else if (reportType === 'yearly') {
      reportTitle = `ตารางรายงานสรุปปริมาณรังสีสะสมรายปี (ประจำปี พ.ศ. ${selectedYear})`;
      reportTableHTML = `
        <table class="w-full text-xs border-collapse border border-black text-black">
          <thead>
            <tr class="bg-gray-100 font-bold uppercase text-[10px]">
              <th class="border border-black p-1 text-center w-8">ลำดับ</th>
              <th class="border border-black p-1 text-left">ชื่อ-นามสกุล บุคลากร</th>
              <th class="border border-black p-1 text-left">ตำแหน่ง / ฝ่ายงาน</th>
              <th class="border border-black p-1 text-center w-28">สะสม Hp(10)<br />(uSv / ปี)</th>
              <th class="border border-black p-1 text-center w-24">สะสม Hp(0.07)<br />(uSv / ปี)</th>
              <th class="border border-black p-1 text-center w-24">สะสม Hp(3)<br />(uSv / ปี)</th>
              <th class="border border-black p-1 text-center w-16">ผลประเมิน</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let idx = 0;
              return DEPARTMENTS.map(dept => {
                const deptItems = yearlyDoses.filter(item => item.member.department === dept);
                if (deptItems.length === 0) return '';
                const deptHeader = `
                  <tr class="bg-gray-55 font-bold">
                    <td colspan="7" class="border border-black p-1 text-left text-[11px] text-slate-800 pl-2 bg-slate-50">${dept}</td>
                  </tr>
                `;
                const rows = deptItems.map(item => {
                  idx++;
                  return `
                    <tr class="text-xs">
                      <td class="border border-black p-1 text-center font-mono">${idx}</td>
                      <td class="border border-black p-1 font-medium">${item.member.name}</td>
                      <td class="border border-black p-1 text-[11px]">${item.member.position}</td>
                      <td class="border border-black p-1 text-center font-mono font-bold text-blue-900">${item.hp10 > 0 ? item.hp10 : '-'}</td>
                      <td class="border border-black p-1 text-center font-mono">${item.hp07 > 0 ? item.hp07 : '-'}</td>
                      <td class="border border-black p-1 text-center font-mono">${item.hp3 > 0 ? item.hp3 : '-'}</td>
                      <td class="border border-black p-1 text-center font-bold text-teal-700">S</td>
                    </tr>
                  `;
                }).join('');
                return deptHeader + rows;
              }).join('');
            })()}
          </tbody>
        </table>
      `;
    } else {
      // 5-Year
      reportTitle = `ตารางรายงานสรุปแนวโน้มการได้รับรังสีสะสมผู้ปฏิบัติงานสถิติย้อนหลัง 5 ปี (พ.ศ. ${fiveYearYears[0]} - ${fiveYearYears[4]})`;
      reportTableHTML = `
        <table class="w-full text-[10.5px] border-collapse border border-black text-black">
          <thead>
            <tr class="bg-gray-100 font-bold text-center">
              <th class="border border-black p-1 text-center w-8">ลำดับ</th>
              <th class="border border-black p-1 text-left">รายชื่อผู้เกี่ยวข้อง</th>
              ${fiveYearYears.map(y => `<th class="border border-black p-1 text-center w-12">ปี ${y}</th>`).join('')}
              <th class="border border-black p-1 text-center w-16 font-bold">รวมสะสม 5 ปี</th>
              <th class="border border-black p-1 text-center w-12">เฉลี่ยต่อปี</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let idx = 0;
              return DEPARTMENTS.map(dept => {
                const deptItems = fiveYearDoses.filter(item => item.member.department === dept);
                if (deptItems.length === 0) return '';
                const deptHeader = `
                  <tr class="bg-gray-55 font-bold">
                    <td colspan="${fiveYearYears.length + 4}" class="border border-black p-1 text-left text-[11px] text-slate-800 pl-2 bg-slate-50">${dept}</td>
                  </tr>
                `;
                const rows = deptItems.map(item => {
                  idx++;
                  return `
                    <tr class="text-xs">
                      <td class="border border-black p-1 text-center font-mono">${idx}</td>
                      <td class="border border-black p-1 font-medium">${item.member.name}</td>
                      ${item.yearlyData.map(val => `<td class="border border-black p-1 text-center font-mono">${val > 0 ? val : '-'}</td>`).join('')}
                      <td class="border border-black p-1 text-center font-mono font-bold text-blue-900">${item.sum > 0 ? item.sum : '-'}</td>
                      <td class="border border-black p-1 text-center font-mono text-slate-500">${item.avg > 0 ? item.avg : '-'}</td>
                    </tr>
                  `;
                }).join('');
                return deptHeader + rows;
              }).join('');
            })()}
          </tbody>
        </table>
      `;
    }

    const chiefSigned = signatures.radiology_chief?.isSigned;
    const chiefImg = signatures.radiology_chief?.signatureData;
    const directorSigned = signatures.hospital_director?.isSigned;
    const directorImg = signatures.hospital_director?.signatureData;

    const chiefSigContentHTML = chiefSigned 
      ? (signatures.radiology_chief.signType === 'handdrawn' && chiefImg
          ? `<img src="${chiefImg}" class="h-12 object-contain mix-blend-multiply opacity-90" />`
          : `<div class="py-1 px-3 border border-teal-500 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md uppercase tracking-wider relative">
               [ ลงนามระบบสารบรรณแล้ว ]
               <div class="text-[8px] font-mono font-normal opacity-75">${signatures.radiology_chief.verificationToken}</div>
             </div>`)
      : `<div class="h-11 w-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-medium">รอลงชื่อออนไลน์</div>`;

    const directorSigContentHTML = directorSigned 
      ? (signatures.hospital_director.signType === 'handdrawn' && directorImg
          ? `<img src="${directorImg}" class="h-12 object-contain mix-blend-multiply opacity-90" />`
          : `<div class="py-1 px-3 border border-teal-500 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md uppercase tracking-wider relative">
               [ อนุมัติ/สั่งการเรียบร้อย ]
               <div class="text-[8px] font-mono font-normal opacity-75">${signatures.hospital_director.verificationToken}</div>
             </div>`)
      : `<div class="h-11 w-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-[10px] text-gray-400 font-medium">รออนุมัติออนไลน์</div>`;

    const signaturesHTML = `
      <div class="grid grid-cols-2 gap-4 mt-12 text-sm pt-4">
        <!-- Technical review signature -->
        <div class="flex flex-col items-center text-center space-y-1.5 h-[130px] justify-end">
          <span class="text-[10px] text-gray-400">ตรวจสอบทางเทคนิคโดย:</span>
          <div class="relative flex flex-col items-center">
            ${chiefSigContentHTML}
            ${chiefSigned ? `
              <div class="absolute -top-3 w-16 h-16 border-2 border-dashed border-red-500/10 rounded-full flex items-center justify-center text-[7px] font-bold text-red-500/15 rotate-12 pointer-events-none select-none">
                E-VERIFIED
              </div>
            ` : ''}
          </div>
          <p class="font-bold border-b border-black pb-0.5 min-w-[180px] text-xs">( ${cName} )</p>
          <p class="text-xs text-slate-600">${cPos} ${hName}</p>
          ${chiefSigned ? `<p class="text-[8px] text-teal-600 font-mono">ID: ${signatures.radiology_chief.verificationToken?.slice(0, 13)}</p>` : ''}
        </div>

        <!-- Director's command signature -->
        <div class="flex flex-col items-center text-center space-y-1.5 h-[130px] justify-end">
          <span class="text-[10px] text-gray-400">ผู้อำนวยการอนุมัติและสั่งการ:</span>
          <div class="relative flex flex-col items-center">
            ${directorSigContentHTML}
            ${directorSigned ? `
              <div class="absolute -top-3 w-16 h-16 border-2 border-dashed border-red-500/10 rounded-full flex items-center justify-center text-[7px] font-bold text-red-500/15 -rotate-12 pointer-events-none select-none">
                APPROVED
              </div>
            ` : ''}
          </div>
          <p class="font-bold border-b border-black pb-0.5 min-w-[180px] text-xs">( ${dName} )</p>
          <p class="text-xs text-slate-600">${dPos}</p>
          ${directorSigned ? `<p class="text-[8px] text-teal-600 font-mono">ID: ${signatures.hospital_director.verificationToken?.slice(0, 13)}</p>` : ''}
        </div>
      </div>
    `;

    const dynamicFooter = `
      <div class="absolute bottom-5 left-[25mm] right-[25mm] border-t border-slate-200 pt-2 flex justify-between text-[8px] text-slate-400 font-mono">
        <span>เอกสารสารบรรณระบบสารสนเทศรังสีเทคนิค ${hName}</span>
        <span class="text-right">
          ${signatures.radiology_chief?.isSigned && signatures.hospital_director?.isSigned 
            ? `รับรองสมบูรณ์แบบดิจิทัล : ${signatures.hospital_director.verificationToken}`
            : "ร่างบันทึกข้อตกลง - รอรับรองลายมือชื่อ"}
        </span>
      </div>
    `;

    // High fidelity Thai government output paper page
    const paperHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>รายงานผลรังสีสะสมอย่างเป็นทางการ - ${hName}</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ["Inter", "Sarabun", "sans-serif"],
                  serif: ["Sarabun", "Georgia", "serif"]
                }
              }
            }
          }
        </script>
        <style>
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-page {
              padding: 0mm !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
          body {
            font-family: "Sarabun", sans-serif;
            background-color: #f1f5f9;
          }
          .print-page {
            width: 210mm;
            min-height: 297mm;
            padding: 24mm 22mm;
            margin: 15px auto;
            background: white;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            position: relative;
          }
        </style>
      </head>
      <body>
        <!-- Google Chrome/PDF Style Toolbar -->
        <div class="no-print bg-slate-900 border-b border-slate-800 text-white py-2 px-6 flex items-center justify-between shadow sticky top-0 z-50">
          <div class="flex items-center gap-2.5">
            <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M11.3 2c-3.8 0-6.8 3-6.8 6.8v3.6C2.3 12.8 1 14.8 1 17c0 2.8 2.2 5 5 5h12c2.8 0 5-2.2 5-5 0-2.2-1.3-4.2-3.5-4.6V8.8c0-3.8-3-6.8-6.8-6.8m0 2c2.7 0 4.8 2.1 4.8 4.8v4h-9.6v-4c0-2.7 2.1-4.8 4.8-4.8M6 16c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1m12 0c.6 0 1 .4 1 1v2c0 .6-.4 1-1 1s-1-.4-1-1v-2c0-.6.4-1 1-1z"/></svg>
            <div>
              <h1 class="text-xs font-bold leading-tight">โปรแกรมเปิดรายงาน PDF อัตโนมัติ (Google PDF Engine)</h1>
              <p class="text-[9px] text-slate-400">${hDept} ${hName} ${hProv}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 font-bold text-xs py-1.5 px-4 rounded-lg text-white flex items-center gap-1.5 shadow transition cursor-pointer">
              <span class="text-xs">&#128422;</span> สั่งพิมพ์ / บันทึกด้วย Google PDF
            </button>
            <button onclick="window.close()" class="bg-slate-700 hover:bg-slate-600 font-bold text-xs py-1.5 px-3 rounded-lg text-slate-350 transition cursor-pointer">
              ปิดหน้าจอนี้
            </button>
          </div>
        </div>

        <div class="print-page">
          <!-- Official Garuda Logo Layout -->
          <div class="w-full flex justify-between items-start mb-6">
            <div class="text-left text-sm w-1/3 text-black">
              <span class="font-bold">บันทึกข้อความ ที่ </span>${settings.documentId}
            </div>
            
            <div class="w-1/3 flex justify-center">
            </div>

            <div class="text-right leading-tight text-xs w-1/3 text-black space-y-0.5">
              <p class="font-bold">${hDept}</p>
              <p>${hName}</p>
              <p class="text-[9px]">${hProv}</p>
            </div>
          </div>

          <!-- Document Date -->
          <div class="w-full text-right mb-6 text-sm text-black">
            <span class="font-bold">วันที่ </span> ${settings.documentDate}
          </div>

          <!-- Header Titles -->
          <div class="text-sm space-y-3 mb-6 leading-relaxed text-black">
            <div>
              <span class="font-bold">เรื่อง </span> ${settings.subject}
            </div>
            <div>
              <span class="font-bold">เรียน </span> ${settings.attention}
            </div>
            <div>
              <span class="font-bold">สิ่งที่ส่งมาด้วย </span> รายงานปริมาณรังสีสะสมรายบุคคล เลขที่รายงาน ${settings.reportNo} จำนวน 1 ชุด
            </div>
          </div>

          <!-- Document Narrative -->
          <div class="text-sm leading-relaxed text-justify mb-5 indent-12 space-y-3 text-black">
            <p>
              ตามที่หน่วยงานของท่านได้ขอรับบริการตรวจวัดแผ่นรังสีชนิดโอเอสแอล (OSLN) ของเจ้าหน้าที่แผนกรังสีเทคนิค สำหรับรอบการวัดประจำช่วง 
              <span class="font-bold text-blue-900 border-b border-dotted border-blue-900 leading-none">${settings.monthRangeText}</span> นั้น 
              ทางห้องปฏิบัติการรังสีบุคคล กรมวิทยาศาสตร์การแพทย์ ได้ทำการประเมินค่าปริมาณรังสีเทียบเท่าในชั้นเนื้อเยื่อต่าง ๆ เรียบร้อยแล้ว
            </p>
            <p>
              ในการนี้ ทางกรมวิทยาศาสตร์การแพทย์ จึงใคร่ขอส่งผลการประเมินปริมาณได้รับรังสีเพื่อให้ท่านผู้บริหารรับทราบ และถือปฏิบัติเป็นเอกสารหลักฐานสำคัญประกอบมาตรฐานความปลอดภัยทางรังสี 
              โดยรายละเอียดสรุปรายงานผู้ปฏิบัติงานทั้งสิ้นจำนวน <span class="font-bold">${staff.length}</span> ท่าน แยกรายละเอียดความปลอดภัยดังตารางด้านล่างนี้:
            </p>
          </div>

          <!-- Table title -->
          <div class="text-center font-bold text-xs mb-2 text-black">
            ${reportTitle}
          </div>

          <!-- Table display -->
          ${reportTableHTML}

          <!-- Legal Disclaimer notes -->
          <div class="text-[10px] text-gray-500 space-y-1 leading-normal my-5 leading-tight">
            <p class="font-bold text-gray-700">หมายเหตุ / คำอธิบายความปลอดภัยตามมาตรฐานสากล:</p>
            <p>1. ทุกรายชื่ออยู่ในเกณฑ์ <span class="font-bold text-teal-700">S (Safe)</span> คือปลอดภัยสูงสุด (ปริมาณรังสียังผล Hp(10) สะสมไม่เกิน 20,000 ไมโครซีเวิร์ตต่อปีตามระเบียบคณะกรรมการนิวเคลียร์เพื่อสันติ)</p>
            <p>2. การลงนามนี้เป็นการรับรองผลทางวิชาการและงานสารบรรณร่วมกัน เพื่อนำเสนอรายงานและบันทึกประวัติความปลอดภัยในแฟ้มคุณภาพ${hName}</p>
          </div>

          <!-- Digital signature section -->
          ${signaturesHTML}

          <!-- Footer Footprint -->
          ${dynamicFooter}

        </div>

        <script>
          // Autoplay print preview 
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 550);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(paperHTML);
    printWindow.document.close();
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, signatures, records }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `รายงานรังสีสะสม_${hName.replace(/\s+/g, '_')}_${settings.documentId.replace(/\//g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Settings Panel & PDF Actions */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        
        {/* Type / Tabs Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> เครื่องมือจัดการออกรายงานวิชาการ
            </h3>
            <p className="text-sm text-slate-500">ปรับแต่งจดหมายและสลับประเภทรายงานเพื่อพิมพ์แบบฟอร์มอย่างเป็นทางการ</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="btn-report-type-monthly"
              onClick={() => {
                setReportType('monthly');
                if (selectedMonth === 'all') {
                  onUpdateSettings({ ...settings, monthRangeText: "ธันวาคม 2568 ถึง กุมภาพันธ์ 2569" });
                } else {
                  onUpdateSettings({ ...settings, monthRangeText: formatMonthThai(selectedMonth) });
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                reportType === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              รายเดือน
            </button>
            <button
              id="btn-report-type-yearly"
              onClick={() => {
                setReportType('yearly');
                onUpdateSettings({ ...settings, monthRangeText: `ประจำปีงบประมาณ พ.ศ. ${selectedYear}` });
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                reportType === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              รายปี
            </button>
            <button
              id="btn-report-type-fiveyear"
              onClick={() => {
                setReportType('fiveyear');
                const start = fiveYearRange === '2563-2567' ? '2563' : fiveYearRange === '2564-2568' ? '2564' : '2565';
                const end = fiveYearRange === '2563-2567' ? '2567' : fiveYearRange === '2564-2568' ? '2568' : '2569';
                onUpdateSettings({ ...settings, monthRangeText: `สถิติสะสมย้อนหลัง 5 ปี (พ.ศ. ${start} - ${end})` });
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                reportType === 'fiveyear'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              สะสม 5 ปี
            </button>
          </div>
        </div>

        {/* Dynamic Context Settings Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">เลขที่หนังสือรายงาน</label>
            <input
              id="input-document-id"
              type="text"
              value={settings.documentId}
              onChange={(e) => onUpdateSettings({ ...settings, documentId: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ลงวันที่ในหนังสือรายงาน</label>
            <input
              id="input-document-date"
              type="text"
              value={settings.documentDate}
              onChange={(e) => onUpdateSettings({ ...settings, documentDate: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">รหัสรายงานผลแลปจากกรมวิทย์ฯ</label>
            <input
              id="input-report-no"
              type="text"
              value={settings.reportNo}
              onChange={(e) => onUpdateSettings({ ...settings, reportNo: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">ช่วงรอบประเมิน (ข้อความจดหมายสอดคล้อง)</label>
            <input
              id="input-month-text"
              type="text"
              value={settings.monthRangeText}
              onChange={(e) => onUpdateSettings({ ...settings, monthRangeText: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Sub-Filters rendering of selected report type */}
          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex flex-col justify-center">
            {reportType === 'monthly' && (
              <div>
                <label className="text-[11px] font-bold text-blue-800 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> เลือกเดือน / รอบประเมิน:
                </label>
                <select
                  id="select-report-monthly-filter"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg p-1.5 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">ไตรมาสล่าสุด (ธ.ค. 68 - ก.พ. 69)</option>
                  {availableMonths.map(ym => (
                    <option key={ym} value={ym}>{formatMonthThai(ym)}</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'yearly' && (
              <div>
                <label className="text-[11px] font-bold text-blue-800 block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> ประเมินข้อมูลระดับปีงบประมาณ:
                </label>
                <select
                  id="select-report-yearly-filter"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg p-1.5 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  {systemYears.slice().reverse().map(yr => (
                    <option key={yr} value={yr}>ปี พ.ศ. {yr}</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'fiveyear' && (
              <div>
                <label className="text-[11px] font-bold text-blue-800 block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> เลือกช่วงสะสมสถิติ 5 ปี:
                </label>
                <select
                  id="select-report-fiveyear-filter"
                  value={fiveYearRange}
                  onChange={(e) => handleFiveYearChange(e.target.value)}
                  className="w-full text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg p-1.5 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={`${maxYear - 4}-${maxYear}`}>5 ปีล่าสุด (พ.ศ. {maxYear - 4} - {maxYear})</option>
                  <option value={`${maxYear - 5}-${maxYear - 1}`}>5 ปีก่อน (พ.ศ. {maxYear - 5} - {maxYear - 1})</option>
                  <option value={`${maxYear - 6}-${maxYear - 2}`}>5 ปีก่อนครึ่ง (พ.ศ. {maxYear - 6} - {maxYear - 2})</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-xs font-medium text-slate-600">
              {signatures.radiology_chief?.isSigned && signatures.hospital_director?.isSigned 
                ? "✓ ลงนามเสร็จสมบูรณ์ทั้งสองท่าน พร้อมออกไฟล์อย่างเป็นทางการ"
                : "⚠ รอตรวจและลงนามลายมือชื่อรับรองเพื่อปลดล็อกตราดิจิทัลเสร็จสมบูรณ์"}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-download-json-report"
              onClick={handleExportData}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> ดาวน์โหลดรายงาน (.json)
            </button>
            
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" /> เปิดและบันทึก PDF ด้วย Google PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Visual Simulator (A4 Aspect Ratio with scrollbar) */}
      <div className="flex justify-center select-none md:p-4 bg-slate-100 rounded-3xl border border-slate-200/50 shadow-inner overflow-x-auto">
        <div className="print-page w-[210mm] min-h-[297mm] bg-white text-black p-[25mm] shadow-xl border border-slate-250 shrink-0 font-serif relative">
          
          {/* Header watermark Preview Only sign */}
          <div className="no-print absolute top-3 right-3 text-[9px] text-slate-300 font-mono tracking-wider">
            PREVIEW ONLY (สลับประเภทเพื่อตรวจสอบ)
          </div>

          {/* Thai Government Official Emblem Header */}
          <div className="w-full flex justify-between items-start mb-6">
            <div className="text-left leading-relaxed text-sm w-1/3">
              <span className="font-bold">บันทึกข้อความ ที่ </span>{settings.documentId}
            </div>
            
            <div className="w-1/3 flex justify-center">
            </div>

            <div className="text-right leading-tight text-xs w-1/3 space-y-0.5">
              <p className="font-bold">{hDept}</p>
              <p>{hName}</p>
              <p className="text-[10px]">{hProv}</p>
            </div>
          </div>

          {/* Document Date */}
          <div className="w-full text-right mb-6 text-sm">
            <span className="font-bold">วันที่ </span> {settings.documentDate}
          </div>

          {/* Recipient Details */}
          <div className="text-sm space-y-3 mb-6 leading-relaxed">
            <div>
              <span className="font-bold">เรื่อง </span> {settings.subject}
            </div>
            <div>
              <span className="font-bold">เรียน </span> {settings.attention}
            </div>
            <div>
              <span className="font-bold">สิ่งที่ส่งมาด้วย </span> รายงานปริมาณรังสีสะสมรายบุคคล เลขที่รายงาน {settings.reportNo} จำนวน 1 ชุด
            </div>
          </div>

          {/* Narrative description */}
          <div className="text-sm leading-relaxed text-justify mb-5 indent-12 space-y-3">
            <p>
              ตามที่หน่วยงานของท่านได้ขอรับบริการตรวจวัดแผ่นรังสีชนิดโอเอสแอล (OSLN) ของเจ้าหน้าที่แผนกรังสีเทคนิค สำหรับรอบการวัดประจำช่วง{' '}
              <span className="font-bold text-blue-900 border-b border-dotted border-blue-900 leading-none">{settings.monthRangeText}</span> นั้น 
              ทางห้องปฏิบัติการรังสีบุคคล กรมวิทยาศาสตร์การแพทย์ ได้ทำการประเมินค่าปริมาณรังสีเทียบเท่าในชั้นเนื้อเยื่อต่าง ๆ เรียบร้อยแล้ว
            </p>
            <p>
              ในการนี้ ทางกรมวิทยาศาสตร์การแพทย์ จึงใคร่ขอส่งผลการประเมินปริมาณได้รับรังสีเพื่อให้ท่านผู้บริหารรับทราบ และถือปฏิบัติเป็นเอกสารหลักฐานสำคัญประกอบมาตรฐานความปลอดภัยทางรังสี 
              โดยรายละเอียดสรุปรายงานผู้ปฏิบัติงานทั้งสิ้นจำนวน <span className="font-bold">{staff.length}</span> ท่าน แยกรายละเอียดความปลอดภัยดังตารางด้านล่างนี้:
            </p>
          </div>

          {/* Realtime conditional rendering of simulator tables */}
          {reportType === 'monthly' && (
            <div className="mb-6 select-text">
              <div className="text-center font-bold text-xs mb-2">
                ตารางรายงานปริมาณรังสีรอบล่าสุดประจำเดือน ({selectedMonth === 'all' ? settings.monthRangeText : formatMonthThai(selectedMonth)})
              </div>
              <table className="w-full text-xs border-collapse border border-black select-text">
                <thead>
                  <tr className="bg-slate-50 uppercase text-[10px]">
                    <th className="border border-black p-1 text-center w-8">ลำดับ</th>
                    <th className="border border-black p-1 text-left">ชื่อ-นามสกุล ผู้ได้รับรังสี</th>
                    <th className="border border-black p-1 text-center w-24">ประเภทการวัด</th>
                    <th className="border border-black p-1 text-center w-20">ปริมาณรังสีสะสม<br />(Hp(10) ไมโครซีเวิร์ต)</th>
                    <th className="border border-black p-1 text-center w-20">ปริมาณผิวหนัง<br />(Hp(0.07) uSv)</th>
                    <th className="border border-black p-1 text-center w-20">ปริมาณเลนส์ตา<br />(Hp(3) uSv)</th>
                    <th className="border border-black p-1 text-center w-12">เกณฑ์</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let idx = 0;
                    return DEPARTMENTS.map(dept => {
                      const deptItems = monthlyDoses.filter(item => item.member.department === dept);
                      if (deptItems.length === 0) return null;
                      return (
                        <React.Fragment key={dept}>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-left text-[11px]">
                            <td colSpan={7} className="border border-black p-1 bg-slate-100/80 pl-2">
                              {dept}
                            </td>
                          </tr>
                          {deptItems.map(item => {
                            idx++;
                            return (
                              <tr key={item.member.id} className="hover:bg-slate-50 transition">
                                <td className="border border-black p-1 text-center font-mono">{idx}</td>
                                <td className="border border-black p-1 font-sans">{item.member.name}</td>
                                <td className="border border-black p-1 text-center text-[10px]">ประจำตัว (ลำตัว)</td>
                                <td className="border border-black p-1 text-center font-mono font-bold">
                                  {item.hp10Avg > 0 ? item.hp10Avg : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-mono">
                                  {item.hp07Avg > 0 ? item.hp07Avg : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-mono">
                                  {item.hp3Avg > 0 ? item.hp3Avg : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-bold font-sans text-[11px] text-teal-700">
                                  S <span className="text-[8px] font-normal text-slate-500">(Safe)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'yearly' && (
            <div className="mb-6 select-text">
              <div className="text-center font-bold text-xs mb-2">
                ตารางรายงานสรุปปริมาณรังสีสะสมรายปี (ประจำปี พ.ศ. {selectedYear})
              </div>
              <table className="w-full text-xs border-collapse border border-black select-text">
                <thead>
                  <tr className="bg-slate-50 uppercase text-[10px]">
                    <th className="border border-black p-1 text-center w-8">ลำดับ</th>
                    <th className="border border-black p-1 text-left">ชื่อ-นามสกุล บุคลากร</th>
                    <th className="border border-black p-1 text-left">ตำแหน่ง / ฝ่ายงาน</th>
                    <th className="border border-black p-1 text-center w-28">สะสม Hp(10)<br />(uSv / ปี)</th>
                    <th className="border border-black p-1 text-center w-24">สะสม Hp(0.07)<br />(uSv / ปี)</th>
                    <th className="border border-black p-1 text-center w-24">สะสม Hp(3)<br />(uSv / ปี)</th>
                    <th className="border border-black p-1 text-center w-16">ผลประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let idx = 0;
                    return DEPARTMENTS.map(dept => {
                      const deptItems = yearlyDoses.filter(item => item.member.department === dept);
                      if (deptItems.length === 0) return null;
                      return (
                        <React.Fragment key={dept}>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-left text-[11px]">
                            <td colSpan={7} className="border border-black p-1 bg-slate-100/80 pl-2">
                              {dept}
                            </td>
                          </tr>
                          {deptItems.map(item => {
                            idx++;
                            return (
                              <tr key={item.member.id} className="hover:bg-slate-50 transition">
                                <td className="border border-black p-1 text-center font-mono">{idx}</td>
                                <td className="border border-black p-1 font-sans">{item.member.name}</td>
                                <td className="border border-black p-1 text-[11px] font-sans">{item.member.position}</td>
                                <td className="border border-black p-1 text-center font-mono font-bold text-blue-900">
                                  {item.hp10 > 0 ? item.hp10 : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-mono">
                                  {item.hp07 > 0 ? item.hp07 : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-mono">
                                  {item.hp3 > 0 ? item.hp3 : '-'}
                                </td>
                                <td className="border border-black p-1 text-center font-bold font-sans text-teal-700">
                                  S <span className="text-[8px] font-normal text-slate-500">(Safe)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'fiveyear' && (
            <div className="mb-6 select-text">
              <div className="text-center font-bold text-xs mb-2">
                ตารางรายงานสรุปแนวโน้มการได้รับรังสีสะสมผู้ปฏิบัติงานสถิติย้อนหลัง 5 ปี (พ.ศ. {fiveYearYears[0]} - {fiveYearYears[4]})
              </div>
              <table className="w-full text-[10.5px] border-collapse border border-black select-text">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-black p-1 text-center w-8">ลำดับ</th>
                    <th className="border border-black p-1 text-left">รายชื่อผู้เกี่ยวข้อง</th>
                    {fiveYearYears.map(y => (
                      <th key={y} className="border border-black p-1 text-center w-12">ปี {y}</th>
                    ))}
                    <th className="border border-black p-1 text-center w-14 font-bold">รวมสะสม</th>
                    <th className="border border-black p-1 text-center w-12">เฉลี่ยต่อปี</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let idx = 0;
                    return DEPARTMENTS.map(dept => {
                      const deptItems = fiveYearDoses.filter(item => item.member.department === dept);
                      if (deptItems.length === 0) return null;
                      return (
                        <React.Fragment key={dept}>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-left text-[11px]">
                            <td colSpan={fiveYearYears.length + 4} className="border border-black p-1 bg-slate-100/80 pl-2">
                              {dept}
                            </td>
                          </tr>
                          {deptItems.map(item => {
                            idx++;
                            return (
                              <tr key={item.member.id} className="hover:bg-slate-50 font-sans text-xs">
                                <td className="border border-black p-1 text-center font-mono">{idx}</td>
                                <td className="border border-black p-1 font-medium">{item.member.name}</td>
                                {item.yearlyData.map((val, i) => (
                                  <td key={i} className="border border-black p-1 text-center font-mono">{val > 0 ? val : '-'}</td>
                                ))}
                                <td className="border border-black p-1 text-center font-mono font-bold text-blue-900">{item.sum > 0 ? item.sum : '-'}</td>
                                <td className="border border-black p-1 text-center font-mono text-slate-500">{item.avg > 0 ? item.avg : '-'}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* Legal Notes */}
          <div className="text-[10px] text-slate-500 space-y-1 leading-normal mb-8 leading-tight">
            <p className="font-bold">หมายเหตุ / คำอธิบายความปลอดภัยตามมาตรฐานสากล:</p>
            <p>1. ทุกรายชื่ออยู่ในเกณฑ์ <span className="font-bold text-teal-700">S (Safe)</span> คือปลอดภัยสูงสุด (ปริมาณรังสียังผล Hp(10) สะสมไม่เกิน 20,000 ไมโครซีเวิร์ตต่อปีตามระเบียบคณะกรรมการนิวเคลียร์เพื่อสันติ)</p>
            <p>2. การลงนามนี้เป็นการรับรองผลทางวิชาการและงานสารบรรณร่วมกัน เพื่อนำเสนอรายงานและบันทึกประวัติความปลอดภัยในแฟ้มคุณภาพ{hName}</p>
          </div>

          {/* Double Dynamic Signatures Layout */}
          <div className="grid grid-cols-2 gap-4 mt-12 text-sm pt-4">
            
            {/* Signature 1: Chief of Radiotechnology */}
            <div className="flex flex-col items-center text-center space-y-1.5 h-[130px] justify-end">
              <span className="text-[10px] text-slate-400 no-print">ตรวจสอบทางเทคนิคโดย:</span>
              
              {signatures.radiology_chief?.isSigned ? (
                <div className="relative flex flex-col items-center">
                  {signatures.radiology_chief.signType === 'handdrawn' && signatures.radiology_chief.signatureData ? (
                    <img
                      src={signatures.radiology_chief.signatureData}
                      alt="ลายเซ็น หัวหน้างานรังสีเทคนิค"
                      className="h-12 object-contain mix-blend-multiply opacity-90 cursor-default"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="py-1 px-3 border border-teal-500 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md uppercase tracking-wider relative">
                      [ ลงนามระบบสารบรรณแล้ว ]
                      <div className="text-[8px] font-mono font-normal opacity-75">{signatures.radiology_chief.verificationToken}</div>
                    </div>
                  )}
                  {/* Digital seal watermarked behind signature */}
                  <div className="absolute -top-3 w-16 h-16 border-2 border-dashed border-red-500/20 rounded-full flex items-center justify-center text-[7px] font-bold text-red-500/20 rotate-12 pointer-events-none select-none">
                    E-VERIFIED
                  </div>
                </div>
              ) : (
                <div className="no-print h-12 w-32 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  รอลงชื่อออนไลน์
                </div>
              )}
              
              <p className="font-bold border-b border-black pb-0.5 min-w-[180px] text-xs">
                ( {cName} )
              </p>
              <p className="text-xs text-slate-600">{cPos} {hName}</p>
              {signatures.radiology_chief?.isSigned && (
                <p className="text-[8px] text-teal-600 font-mono">ID: {signatures.radiology_chief.verificationToken?.slice(0, 13)}</p>
              )}
            </div>

            {/* Signature 2: Hospital Director */}
            <div className="flex flex-col items-center text-center space-y-1.5 h-[130px] justify-end">
              <span className="text-[10px] text-slate-400 no-print">ผู้อำนวยการอนุมัติและสั่งการ:</span>
              
              {signatures.hospital_director?.isSigned ? (
                <div className="relative flex flex-col items-center">
                  {signatures.hospital_director.signType === 'handdrawn' && signatures.hospital_director.signatureData ? (
                    <img
                      src={signatures.hospital_director.signatureData}
                      alt="ลายเซ็น ผู้อำนวยการ"
                      className="h-12 object-contain mix-blend-multiply opacity-90 cursor-default"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="py-1 px-3 border border-teal-500 bg-teal-50 text-teal-800 text-[10px] font-bold rounded-md uppercase tracking-wider relative">
                      [ อนุมัติ/สั่งการเรียบร้อย ]
                      <div className="text-[8px] font-mono font-normal opacity-75">{signatures.hospital_director.verificationToken}</div>
                    </div>
                  )}
                  <div className="absolute -top-3 w-16 h-16 border-2 border-dashed border-red-500/20 rounded-full flex items-center justify-center text-[7px] font-bold text-red-500/20 -rotate-12 pointer-events-none select-none">
                    APPROVED
                  </div>
                </div>
              ) : (
                <div className="no-print h-12 w-32 border border-dashed border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400 font-medium">
                  รออนุมัติออนไลน์
                </div>
              )}
              
              <p className="font-bold border-b border-black pb-0.5 min-w-[180px] text-xs">
                ( {dName} )
              </p>
              <p className="text-xs text-slate-600">{dPos}</p>
              {signatures.hospital_director?.isSigned && (
                <p className="text-[8px] text-teal-600 font-mono">ID: {signatures.hospital_director.verificationToken?.slice(0, 13)}</p>
              )}
            </div>

          </div>

          {/* Secure Audit Footprint at bottom of printed page */}
          <div className="absolute bottom-5 left-[25mm] right-[25mm] border-t border-slate-200 pt-2 flex justify-between text-[8px] text-slate-400 font-mono">
            <span>เอกสารสารบรรณระบบสารสนเทศรังสีเทคนิค {hName}</span>
            <span className="text-right">
              {signatures.radiology_chief?.isSigned && signatures.hospital_director?.isSigned 
                ? `รับรองสมบูรณ์แบบดิจิทัล : ${signatures.hospital_director.verificationToken}`
                : "ร่างบันทึกข้อตกลง - รอรับรองลายมือชื่อ"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
