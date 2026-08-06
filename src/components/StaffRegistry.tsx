import React, { useState } from 'react';
import { StaffMember } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Trash2, 
  Building2, 
  Eye, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  Award, 
  Briefcase 
} from 'lucide-react';

interface StaffRegistryProps {
  staffList: StaffMember[];
  onDeleteStaff: (id: string, name: string) => void;
  onViewDetail: (staff: StaffMember) => void;
  onAddStaff: (staff: {
    name: string;
    position: string;
    department: string;
    historicalDoses: Record<string, number>;
  }) => void;
}

const DEPARTMENTS = ["แผนกรังสีเทคนิค", "แผนกทันตกรรม", "แผนกผู้ช่วยเหลือคนไข้ งานเปล"];

export default function StaffRegistry({
  staffList,
  onDeleteStaff,
  onViewDetail,
  onAddStaff
}: StaffRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const systemYears = React.useMemo(() => {
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

  // New Staff State
  const [newStaff, setNewStaff] = useState<{
    name: string;
    position: string;
    department: string;
    historicalDoses: Record<string, number>;
  }>({
    name: '',
    position: '',
    department: 'แผนกรังสีเทคนิค',
    historicalDoses: {}
  });

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.position.trim()) {
      alert('กรุณากรอกชื่อและตำแหน่งเจ้าหน้าที่ให้ครบถ้วน');
      return;
    }
    
    // Ensure all system years are represented in submitted data
    const finalDoses: Record<string, number> = {};
    systemYears.forEach(y => {
      finalDoses[y.toString()] = newStaff.historicalDoses[y.toString()] || 0;
    });

    onAddStaff({
      name: newStaff.name,
      position: newStaff.position,
      department: newStaff.department,
      historicalDoses: finalDoses
    });
    
    // Reset Form
    setNewStaff({
      name: '',
      position: '',
      department: newStaff.department, // retain selected department for convenience
      historicalDoses: {}
    });
    setShowAddForm(false);
  };

  const handleDoseChange = (year: number, val: number) => {
    setNewStaff(prev => ({
      ...prev,
      historicalDoses: {
        ...prev.historicalDoses,
        [year.toString()]: val
      }
    }));
  };

  // Filter staff
  const filteredStaff = staffList.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || member.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Group staff by department (dynamic key resolution)
  const departmentsInRegistry = Array.from(new Set([
    ...DEPARTMENTS,
    ...staffList.map(s => s.department)
  ])).filter(Boolean);

  // Stats
  const totalStaff = staffList.length;
  
  // Count how many are in "high alert" level (cumulative over 5000 uSv or single year > 2000 uSv)
  const alertStaffCount = staffList.filter(member => {
    const values = Object.values(member.historicalDoses) as number[];
    const hasHighYear = values.some(v => v >= 2000);
    const sum = values.reduce((a, b) => a + b, 0);
    return hasHighYear || sum >= 5000;
  }).length;

  const monitorStaffCount = staffList.filter(member => {
    const values = Object.values(member.historicalDoses) as number[];
    const hasMediumYear = values.some(v => v >= 800 && v < 2000);
    const sum = values.reduce((a, b) => a + b, 0);
    return (hasMediumYear || (sum >= 2000 && sum < 5000)) && !values.some(v => v >= 2000);
  }).length;

  const safeStaffCount = totalStaff - alertStaffCount - monitorStaffCount;

  // Department metadata for rendering
  const getDeptColor = (dept: string) => {
    switch(dept) {
      case "แผนกรังสีเทคนิค":
        return { bg: "bg-blue-50 border-blue-100 text-blue-700", dot: "bg-blue-500", raw: "blue" };
      case "แผนกทันตกรรม":
        return { bg: "bg-emerald-50 border-emerald-100 text-emerald-700", dot: "bg-emerald-500", raw: "emerald" };
      case "แผนกผู้ช่วยเหลือคนไข้ งานเปล":
        return { bg: "bg-purple-50 border-purple-100 text-purple-700", dot: "bg-purple-500", raw: "purple" };
      default:
        return { bg: "bg-slate-50 border-slate-200 text-slate-700", dot: "bg-slate-400", raw: "slate" };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Banner / Title Page */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-blue-600/30 text-blue-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
              ทำเนียบบุคลากรแยกแผนก
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">ทะเบียนประวัติเจ้าหน้าที่ผู้ปฏิบัติงานรังสี</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              สถิติเชิงลึก รายชื่อแยกตามหน่วยงานสังกัด ควบคุมความปลอดภัยปริมาณรังสีสะสม และลงทะเบียนเจ้าหน้าที่ปฏิบัติงานรังสีคนใหม่เข้าระบบ
            </p>
          </div>
          <button
            id="btn-toggle-add-staff-form"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/20 active:scale-[0.98] transition self-start md:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'ซ่อนฟอร์มลงทะเบียน' : 'ลงทะเบียนบุคลากรใหม่'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">เจ้าหน้าที่ทั้งหมด</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{totalStaff} <span className="text-xs font-normal text-slate-500">ท่าน</span></span>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ระดับปลอดภัย</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{safeStaffCount} <span className="text-xs font-normal text-slate-500">ท่าน</span></span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ระดับเฝ้าระวัง</span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">{monitorStaffCount} <span className="text-xs font-normal text-slate-500">ท่าน</span></span>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ระดับความเสี่ยงสูง</span>
            <span className={`text-2xl font-black ${alertStaffCount > 0 ? "text-rose-600" : "text-slate-400"} mt-1 block`}>
              {alertStaffCount} <span className="text-xs font-normal text-slate-500">ท่าน</span>
            </span>
          </div>
          <div className={`w-10 h-10 ${alertStaffCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"} rounded-xl flex items-center justify-center`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Embedded Registration Form (Collapsible) */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-slideDown">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-850 text-sm sm:text-base">ลงทะเบียนบุคลากรเข้าแผนกใหม่</h3>
                <p className="text-xs text-slate-400">กรอกประวัติเบื้องต้นและบันทึกสถิติรังสีสะสมย้อนหลัง</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold font-sans cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อ-นามสกุล บุคลากร *</label>
                <input
                  id="reg-staff-name"
                  type="text"
                  placeholder="เช่น นายธันวา กุมภาพันธ์"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ตำแหน่งทางวิชาการ/วิชาชีพ *</label>
                <input
                  id="reg-staff-position"
                  type="text"
                  placeholder="เช่น นักรังสีการแพทย์, ผู้ช่วยเหลือคนไข้"
                  value={newStaff.position}
                  onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">แผนกสังกัดงาน *</label>
                <select
                  id="reg-staff-dept"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition cursor-pointer"
                  required
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="แผนกอื่นๆ">แผนกอื่นๆ / จัดตั้งใหม่</option>
                </select>
              </div>
            </div>

            {newStaff.department === "แผนกอื่นๆ" && (
              <div className="animate-fadeIn">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อแผนกใหม่ที่ระบุเอง *</label>
                <input
                  id="reg-staff-custom-dept"
                  type="text"
                  placeholder="เช่น แผนกศัลยกรรมกระดูกและข้อ"
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
            )}

            <div className="border-t border-dashed border-slate-100 pt-3.5 space-y-2">
              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                บันทึกปริมาณรังสีสะสมประจำปี (หน่วย: uSv)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {systemYears.map((year) => {
                  const val = newStaff.historicalDoses[year.toString()] || 0;
                  return (
                    <div key={year}>
                      <label className="block text-[10px] text-slate-500 mb-1 text-center">ปี {year}</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={val || ""}
                        onChange={(e) => handleDoseChange(year, Number(e.target.value) || 0)}
                        className="w-full text-xs text-center border border-slate-200 rounded-xl py-1.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                ปิดฟอร์ม
              </button>
              <button
                id="btn-reg-staff-submit"
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-900/10 active:scale-[0.98] transition cursor-pointer"
              >
                บันทึกประวัติเจ้าหน้าที่ใหม่
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="search-registry"
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่งเจ้าหน้าที่..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto font-sans text-xs">
          <span className="text-slate-400 font-bold shrink-0">กรองตามแผนก:</span>
          <select
            id="filter-registry-dept"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full sm:w-48 text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="ALL">แสดงเจ้าหน้าที่ทุกแผนก</option>
            {departmentsInRegistry.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Department Lists */}
      <div className="space-y-6">
        {departmentsInRegistry.map(dept => {
          const deptStaff = filteredStaff.filter(s => s.department === dept);
          if (deptStaff.length === 0 && selectedDeptFilter !== 'ALL' && selectedDeptFilter === dept) {
            return (
              <div key={dept} className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                ไม่พบเจ้าหน้าที่ในแผนก "{dept}" ที่ตรงกับการค้นหา
              </div>
            );
          }
          if (deptStaff.length === 0) return null; // hide empty departments in "ALL" view

          const colors = getDeptColor(dept);

          return (
            <div key={dept} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-slate-300">
              {/* Department Section Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} border flex items-center justify-center`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-850 text-sm">{dept}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      จำนวนบุคลากรทั้งหมดในแผนก: {deptStaff.length} ท่าน
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${colors.bg} border`}>
                  {deptStaff.length} บุคลากร
                </span>
              </div>

              {/* Department Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-450 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100/80">
                      <th className="p-4 w-12 text-center">ลำดับ</th>
                      <th className="p-4">ข้อมูลเจ้าหน้าที่</th>
                      <th className="p-4">ตำแหน่ง</th>
                      <th className="p-4 text-center">แนวโน้มรังสีสะสม (พ.ศ. {systemYears[0]} - {systemYears[systemYears.length - 1]})</th>
                      <th className="p-4 text-center">สะสมรวมสุทธิ</th>
                      <th className="p-4 text-center">ระดับความเสี่ยง</th>
                      <th className="p-4 text-center">การจัดการหลัก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptStaff.map((staff, idx) => {
                      const doses = Object.values(staff.historicalDoses) as number[];
                      const sumDose = doses.reduce((a, b) => a + b, 0);
                      const maxYearlyDose = Math.max(...doses, 0);
                      
                      // Safety Status logic
                      let safetyStatus = { 
                        label: "S (ปลอดภัย)", 
                        color: "text-emerald-600 bg-emerald-50 border-emerald-100", 
                        dot: "bg-emerald-500",
                        tooltip: "ปริมาณรังสีปกติสะสมอยู่ในขอบเขตควบคุมตามกฎหมายกระทรวง"
                      };
                      if (maxYearlyDose >= 2000 || sumDose >= 5000) {
                        safetyStatus = { 
                          label: "H (ความเสี่ยงสูง)", 
                          color: "text-rose-600 bg-rose-50 border-rose-100", 
                          dot: "bg-rose-500",
                          tooltip: "ตรวจพบปริมาณรังสีสะสมสูงในรอบปีปฏิทิน เกินเกณฑ์แจ้งเตือน"
                        };
                      } else if (maxYearlyDose >= 800 || sumDose >= 2000) {
                        safetyStatus = { 
                          label: "M (เฝ้าระวัง)", 
                          color: "text-amber-600 bg-amber-50 border-amber-100", 
                          dot: "bg-amber-500",
                          tooltip: "ปริมาณรังสีสะสมปานกลาง แนะนำตรวจสอบวิธีการปฏิบัติงานร่วมด้วย"
                        };
                      }

                      return (
                        <tr key={staff.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                          {/* Row Index */}
                          <td className="p-4 text-center font-mono text-slate-400 font-semibold">{idx + 1}</td>
                          
                          {/* Name and Avatar */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-9 h-9 rounded-xl ${colors.bg} border flex items-center justify-center font-bold font-sans text-xs shrink-0 select-none`}>
                                {staff.name.slice(0, 4).replace(/^นาย|^นางสาว|^นาง/, '').trim().slice(0, 1) || "บ"}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{staff.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {staff.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700">{staff.position}</span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                                <Briefcase className="w-3 h-3 text-slate-350" /> {dept}
                              </span>
                            </div>
                          </td>

                          {/* Annual Dose Trend Bar charts */}
                          <td className="p-4">
                            <div className="flex items-end justify-center space-x-1.5 h-10 pt-2 shrink-0">
                              {systemYears.map((year) => {
                                const yrVal = staff.historicalDoses[year.toString()] || 0;
                                // Scale relative to 2000 uSv warning level limit
                                const barHeight = `${Math.max(4, Math.min(100, (yrVal / 2000) * 100))}%`;
                                let colorClass = "bg-blue-400/80 hover:bg-blue-500";
                                if (yrVal >= 2000) {
                                  colorClass = "bg-rose-500 hover:bg-rose-600";
                                } else if (yrVal >= 800) {
                                  colorClass = "bg-amber-400 hover:bg-amber-500";
                                } else if (yrVal === 0) {
                                  colorClass = "bg-slate-200/80";
                                }

                                return (
                                  <div key={year} className="group relative flex flex-col items-center flex-1 min-w-[12px] h-full cursor-help">
                                    {/* Bar element */}
                                    <div 
                                      style={{ height: barHeight }} 
                                      className={`w-full rounded-t-sm ${colorClass} transition-all duration-300`}
                                    />
                                    {/* Dynamic Year label (only show on hover) */}
                                    <div className="absolute bottom-full mb-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition duration-150 z-50 whitespace-nowrap font-mono pointer-events-none font-bold">
                                      {year}: {yrVal.toLocaleString()} uSv
                                    </div>
                                    <span className="text-[7px] text-slate-400 mt-1 scale-90 font-mono select-none font-bold">{year.toString().slice(2)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Sum of Doses */}
                          <td className="p-4 text-center font-mono font-black text-slate-800 text-xs sm:text-sm">
                            {sumDose > 0 ? `${sumDose.toLocaleString()} uSv` : <span className="text-slate-450 font-normal">ไม่มีบันทึก</span>}
                          </td>

                          {/* Safety Status */}
                          <td className="p-4 text-center">
                            <span 
                              title={safetyStatus.tooltip}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${safetyStatus.color} select-none shadow-sm cursor-help`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${safetyStatus.dot}`}></span>
                              {safetyStatus.label}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                id={`reg-view-detail-${staff.id}`}
                                onClick={() => onViewDetail(staff)}
                                title="ดูแผงวิเคราะห์สถิติประวัติสะสมอย่างละเอียด"
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 shadow-sm transition active:scale-[0.95] cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`reg-delete-staff-${staff.id}`}
                                onClick={() => onDeleteStaff(staff.id, staff.name)}
                                title="ลบรายชื่อบุคลากรออกจากระบบทะเบียนสารบรรณ"
                                className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-450 hover:text-red-600 rounded-lg border border-slate-200 hover:border-red-200 shadow-sm transition active:scale-[0.95] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">ไม่พบรายชื่อบุคลากรที่ต้องการค้นหา</h4>
          <p className="text-xs text-slate-450 mt-1">ลองเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรองแผนกเพื่อให้ครอบคลุมขอบเขตข้อมูลที่ต้องการ</p>
        </div>
      )}
    </div>
  );
}
