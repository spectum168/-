import { StaffMember, DoseRecord, ReportSettings, HospitalConfig } from './types';

export const INITIAL_HOSPITAL_CONFIG: HospitalConfig = {
  hospitalName: "",
  hospitalCode: "HOSP-01",
  province: "",
  departmentName: "",
  documentIdPrefix: "",
  logoUrl: "",
  chiefName: "",
  chiefPosition: "",
  directorName: "",
  directorPosition: ""
};

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "นายสมชาย รังสีดี",
    position: "หัวหน้างานรังสีเทคนิค (Chief of Radiotechnology)",
    department: "แผนกรังสีเทคนิค",
    historicalDoses: { "2563": 516, "2564": 530, "2565": 773, "2566": 1035, "2567": 1189, "2568": 1245, "2569": 130 }
  },
  {
    id: "staff-2",
    name: "นายธีรภัทร ใจดี",
    position: "พนักงานการแพทย์และรังสี",
    department: "แผนกรังสีเทคนิค",
    historicalDoses: { "2563": 595, "2564": 1233, "2565": 2172, "2566": 2927, "2567": 3808, "2568": 3512, "2569": 584 }
  },
  {
    id: "staff-3",
    name: "นายเจษฎา มั่นคง",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 537, "2567": 679, "2568": 710, "2569": 164 }
  },
  {
    id: "staff-4",
    name: "นายทนงศักดิ์ รักชาติ",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 675, "2567": 934, "2568": 895, "2569": 104 }
  },
  {
    id: "staff-5",
    name: "นายวีระพงษ์ สุขใจ",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 639, "2567": 806, "2568": 820, "2569": 110 }
  },
  {
    id: "staff-6",
    name: "นางสาวภาวดี รักษ์ไทย",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 363, "2564": 353, "2565": 461, "2566": 715, "2567": 811, "2568": 785, "2569": 90 }
  },
  {
    id: "staff-7",
    name: "นางสาวกิ่งแก้ว มงคล",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 280, "2564": 310, "2565": 305, "2566": 0, "2567": 0, "2568": 150, "2569": 76 }
  },
  {
    id: "staff-8",
    name: "นายจักรพันธ์ สุขสวัสดิ์",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 410, "2564": 420, "2565": 440, "2566": 0, "2567": 0, "2568": 210, "2569": 136 }
  },
  {
    id: "staff-9",
    name: "นายปัฐวีพงษ์ เจริญ",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 180, "2569": 136 }
  },
  {
    id: "staff-10",
    name: "นายอัครเดช รัตนมณี",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกผู้ช่วยเหลือคนไข้ งานเปล",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 140, "2569": 136 }
  },
  {
    id: "staff-11",
    name: "นางณาตยา ศรีสุข",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 0, "2569": 0 }
  },
  {
    id: "staff-12",
    name: "นางสาวเกษณี มงคลสุข",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 0, "2569": 0 }
  },
  {
    id: "staff-13",
    name: "นางสาวพรนิภา ดีเลิศ",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 0, "2569": 0 }
  },
  {
    id: "staff-14",
    name: "นางสาวรจรีย์ มั่นคง",
    position: "ผู้ช่วยเหลือคนไข้",
    department: "แผนกทันตกรรม",
    historicalDoses: { "2563": 0, "2564": 0, "2565": 0, "2566": 0, "2567": 0, "2568": 0, "2569": 0 }
  }
];

export const INITIAL_RECORDS: DoseRecord[] = [
  // สมชาย รังสีดี (staff-1)
  { id: "r-1", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2568/12", hp10: 65, hp007: 62, hp3: 65, analysisNo: "0469094985", organ: "ลำตัว", grade: "S" },
  { id: "r-2", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2569/01", hp10: 65, hp007: 62, hp3: 65, analysisNo: "0469094986", organ: "ลำตัว", grade: "S" },
  { id: "r-3", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2569/02", hp10: 65, hp007: 62, hp3: 65, analysisNo: "0469094987", organ: "ลำตัว", grade: "S" },
  { id: "r-4", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2568/06", hp10: 101, hp007: 101, hp3: 101, analysisNo: "0468345827", organ: "ลำตัว", grade: "S" },
  { id: "r-5", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2568/07", hp10: 101, hp007: 101, hp3: 101, analysisNo: "0468345828", organ: "ลำตัว", grade: "S" },
  { id: "r-6", staffId: "staff-1", staffName: "นายสมชาย รังสีดี", yearMonth: "2568/08", hp10: 101, hp007: 101, hp3: 101, analysisNo: "0468345829", organ: "ลำตัว", grade: "S" },

  // ธีรภัทร ใจดี (staff-2)
  { id: "r-7", staffId: "staff-2", staffName: "นายธีรภัทร ใจดี", yearMonth: "2568/12", hp10: 292, hp007: 298, hp3: 302, analysisNo: "0469094976", organ: "ลำตัว", grade: "S" },
  { id: "r-8", staffId: "staff-2", staffName: "นายธีรภัทร ใจดี", yearMonth: "2569/01", hp10: 292, hp007: 298, hp3: 302, analysisNo: "0469094977", organ: "ลำตัว", grade: "S" },
  { id: "r-9", staffId: "staff-2", staffName: "นายธีรภัทร ใจดี", yearMonth: "2569/02", hp10: 292, hp007: 298, hp3: 302, analysisNo: "0469094978", organ: "ลำตัว", grade: "S" },

  // เจษฎา มั่นคง (staff-3)
  { id: "r-10", staffId: "staff-3", staffName: "นายเจษฎา มั่นคง", yearMonth: "2568/12", hp10: 82, hp007: 82, hp3: 82, analysisNo: "0469094970", organ: "ลำตัว", grade: "S" },
  { id: "r-11", staffId: "staff-3", staffName: "นายเจษฎา มั่นคง", yearMonth: "2569/01", hp10: 82, hp007: 82, hp3: 82, analysisNo: "0469094971", organ: "ลำตัว", grade: "S" },
  { id: "r-12", staffId: "staff-3", staffName: "นายเจษฎา มั่นคง", yearMonth: "2569/02", hp10: 82, hp007: 82, hp3: 82, analysisNo: "0469094972", organ: "ลำตัว", grade: "S" },

  // ทนงศักดิ์ รักชาติ (staff-4)
  { id: "r-13", staffId: "staff-4", staffName: "นายทนงศักดิ์ รักชาติ", yearMonth: "2568/12", hp10: 52, hp007: 52, hp3: 52, analysisNo: "0469094973", organ: "ลำตัว", grade: "S" },
  { id: "r-14", staffId: "staff-4", staffName: "นายทนงศักดิ์ รักชาติ", yearMonth: "2569/01", hp10: 52, hp007: 52, hp3: 52, analysisNo: "0469094974", organ: "ลำตัว", grade: "S" },
  { id: "r-15", staffId: "staff-4", staffName: "นายทนงศักดิ์ รักชาติ", yearMonth: "2569/02", hp10: 52, hp007: 52, hp3: 52, analysisNo: "0469094975", organ: "ลำตัว", grade: "S" },

  // วีระพงษ์ สุขใจ (staff-5)
  { id: "r-16", staffId: "staff-5", staffName: "นายวีระพงษ์ สุขใจ", yearMonth: "2568/12", hp10: 55, hp007: 55, hp3: 55, analysisNo: "0469094982", organ: "ลำตัว", grade: "S" },
  { id: "r-17", staffId: "staff-5", staffName: "นายวีระพงษ์ สุขใจ", yearMonth: "2569/01", hp10: 55, hp007: 55, hp3: 55, analysisNo: "0469094983", organ: "ลำตัว", grade: "S" },
  { id: "r-18", staffId: "staff-5", staffName: "นายวีระพงษ์ สุขใจ", yearMonth: "2569/02", hp10: 55, hp007: 55, hp3: 55, analysisNo: "0469094984", organ: "ลำตัว", grade: "S" },

  // ภาวดี รักษ์ไทย (staff-6)
  { id: "r-19", staffId: "staff-6", staffName: "นางสาวภาวดี รักษ์ไทย", yearMonth: "2568/06", hp10: 47, hp007: 47, hp3: 47, analysisNo: "0468201645", organ: "ลำตัว", grade: "S" },
  { id: "r-20", staffId: "staff-6", staffName: "นางสาวภาวดี รักษ์ไทย", yearMonth: "2568/07", hp10: 47, hp007: 47, hp3: 47, analysisNo: "0468201646", organ: "ลำตัว", grade: "S" },
  { id: "r-21", staffId: "staff-6", staffName: "นางสาวภาวดี รักษ์ไทย", yearMonth: "2568/08", hp10: 47, hp007: 47, hp3: 47, analysisNo: "0468201647", organ: "ลำตัว", grade: "S" },

  // กิ่งแก้ว มงคล (staff-7)
  { id: "r-22", staffId: "staff-7", staffName: "นางสาวกิ่งแก้ว มงคล", yearMonth: "2568/12", hp10: 38, hp007: 32, hp3: 38, analysisNo: "0469094964", organ: "ลำตัว", grade: "S" },
  { id: "r-23", staffId: "staff-7", staffName: "นางสาวกิ่งแก้ว มงคล", yearMonth: "2569/01", hp10: 38, hp007: 32, hp3: 38, analysisNo: "0469094965", organ: "ลำตัว", grade: "S" },
  { id: "r-24", staffId: "staff-7", staffName: "นางสาวกิ่งแก้ว มงคล", yearMonth: "2569/02", hp10: 38, hp007: 32, hp3: 38, analysisNo: "0469094966", organ: "ลำตัว", grade: "S" },

  // จักรพันธ์ สุขสวัสดิ์ (staff-8)
  { id: "r-25", staffId: "staff-8", staffName: "นายจักรพันธ์ สุขสวัสดิ์", yearMonth: "2568/12", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094967", organ: "ลำตัว", grade: "S" },
  { id: "r-26", staffId: "staff-8", staffName: "นายจักรพันธ์ สุขสวัสดิ์", yearMonth: "2569/01", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094968", organ: "ลำตัว", grade: "S" },
  { id: "r-27", staffId: "staff-8", staffName: "นายจักรพันธ์ สุขสวัสดิ์", yearMonth: "2569/02", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094969", organ: "ลำตัว", grade: "S" },

  // ปัฐวีพงษ์ เจริญ (staff-9)
  { id: "r-28", staffId: "staff-9", staffName: "นายปัฐวีพงษ์ เจริญ", yearMonth: "2568/12", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094979", organ: "ลำตัว", grade: "S" },
  { id: "r-29", staffId: "staff-9", staffName: "นายปัฐวีพงษ์ เจริญ", yearMonth: "2569/01", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094980", organ: "ลำตัว", grade: "S" },
  { id: "r-30", staffId: "staff-9", staffName: "นายปัฐวีพงษ์ เจริญ", yearMonth: "2569/02", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094981", organ: "ลำตัว", grade: "S" },

  // อัครเดช รัตนมณี (staff-10)
  { id: "r-31", staffId: "staff-10", staffName: "นายอัครเดช รัตนมณี", yearMonth: "2568/12", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094988", organ: "ลำตัว", grade: "S" },
  { id: "r-32", staffId: "staff-10", staffName: "นายอัครเดช รัตนมณี", yearMonth: "2569/01", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094989", organ: "ลำตัว", grade: "S" },
  { id: "r-33", staffId: "staff-10", staffName: "นายอัครเดช รัตนมณี", yearMonth: "2569/02", hp10: 68, hp007: 68, hp3: 68, analysisNo: "0469094990", organ: "ลำตัว", grade: "S" }
];

export const INITIAL_REPORT_SETTINGS: ReportSettings = {
  documentId: "สธ 0033.101/",
  documentDate: "2 เมษายน 2569",
  subject: "รายงานผลการประเมินการได้รับปริมาณรังสีสะสมของผู้ปฏิบัติงานทางรังสี",
  attention: "ผู้อำนวยการโรงพยาบาลตัวอย่าง",
  reportNo: "2569WS126-101364",
  monthRangeText: "ธันวาคม 2568 ถึง กุมภาพันธ์ 2569"
};

const STORAGE_KEYS = {
  STAFF: 'radiation_app_staff_members',
  RECORDS: 'radiation_app_dose_records',
  SETTINGS: 'radiation_app_report_settings',
  SIGNATURES: 'radiation_app_signatures',
  HOSPITAL: 'radiation_app_hospital_config'
};

export function loadHospitalConfig(): HospitalConfig {
  const stored = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(INITIAL_HOSPITAL_CONFIG));
    return INITIAL_HOSPITAL_CONFIG;
  }
  try {
    const parsed = JSON.parse(stored);
    // Sanitize any lingering legacy sample names from input fields
    if (parsed.chiefName && (
      parsed.chiefName.includes("สิทธิศักดิ์") || 
      parsed.chiefName.includes("เลาหกุล") || 
      parsed.chiefName.includes("สมชาย") || 
      parsed.chiefName.includes("รังสีดี") || 
      parsed.chiefName.includes("นาย/นางสาว")
    )) {
      parsed.chiefName = "";
    }
    if (parsed.directorName && (
      parsed.directorName.includes("เทพฤทธิ์") || 
      parsed.directorName.includes("พัฒนรังสรรค์") || 
      parsed.directorName.includes("วิศิษฏานนท์") || 
      parsed.directorName.includes("สมศักดิ์") || 
      parsed.directorName.includes("รักษาดี") || 
      parsed.directorName.includes("นายแพทย์/แพทย์หญิง")
    )) {
      parsed.directorName = "";
    }
    if (parsed.hospitalName && (
      parsed.hospitalName.includes("แม่ทา") || 
      parsed.hospitalName.includes("ตัวอย่าง") || 
      parsed.hospitalName.includes("โรงพยาบาลใหม่")
    )) {
      parsed.hospitalName = "";
    }
    if (parsed.province && (
      parsed.province.includes("ลำพูน") || 
      parsed.province.includes("แม่ทา") || 
      parsed.province.includes("ตัวอย่าง")
    )) {
      parsed.province = "";
    }
    if (parsed.directorPosition && (
      parsed.directorPosition.includes("แม่ทา") || 
      parsed.directorPosition.includes("ตัวอย่าง")
    )) {
      parsed.directorPosition = "";
    }
    if (parsed.chiefPosition && (
      parsed.chiefPosition.includes("ตัวอย่าง")
    )) {
      parsed.chiefPosition = "";
    }
    const cleanConfig = { ...INITIAL_HOSPITAL_CONFIG, ...parsed };
    localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(cleanConfig));
    return cleanConfig;
  } catch (e) {
    return INITIAL_HOSPITAL_CONFIG;
  }
}

export function saveHospitalConfig(config: HospitalConfig) {
  localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(config));
}

export function loadStaff(): StaffMember[] {
  const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
  let list: StaffMember[];
  if (!stored) {
    list = INITIAL_STAFF;
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    return list;
  }
  
  try {
    list = JSON.parse(stored);
    // Dynamic migration: Ensure correct positions, names, departments, plus years 2568-2569 are synchronized
    let modified = false;
    list = list.map(member => {
      const defaultMember = INITIAL_STAFF.find(m => m.id === member.id);
      if (defaultMember) {
        if (
          member.position !== defaultMember.position || 
          member.name !== defaultMember.name || 
          member.department !== defaultMember.department ||
          !member.historicalDoses["2568"] ||
          !member.historicalDoses["2569"]
        ) {
          modified = true;
          return {
            ...member,
            name: defaultMember.name,
            position: defaultMember.position,
            department: defaultMember.department,
            historicalDoses: {
              ...defaultMember.historicalDoses,
              ...member.historicalDoses,
              "2568": defaultMember.historicalDoses["2568"],
              "2569": defaultMember.historicalDoses["2569"]
            }
          };
        }
      }
      return member;
    });

    // Automatically append any newly introduced default staff members
    INITIAL_STAFF.forEach(defaultMember => {
      if (!list.some(m => m.id === defaultMember.id)) {
        list.push(defaultMember);
        modified = true;
      }
    });
    
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    }
    return list;
  } catch (e) {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  }
}

export function saveStaff(staff: StaffMember[]) {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
}

export function loadRecords(): DoseRecord[] {
  const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
    return INITIAL_RECORDS;
  }
  return JSON.parse(stored);
}

export function saveRecords(records: DoseRecord[]) {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function loadReportSettings(): ReportSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_REPORT_SETTINGS));
    return INITIAL_REPORT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (parsed.attention && (parsed.attention.includes("แม่ทา") || parsed.attention.includes("ตัวอย่าง"))) {
      parsed.attention = "ผู้อำนวยการโรงพยาบาล";
    }
    const cleanSettings = { ...INITIAL_REPORT_SETTINGS, ...parsed };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(cleanSettings));
    return cleanSettings;
  } catch (e) {
    return INITIAL_REPORT_SETTINGS;
  }
}

export function saveReportSettings(settings: ReportSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_REPORT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(INITIAL_HOSPITAL_CONFIG));
  localStorage.removeItem(STORAGE_KEYS.SIGNATURES);
}

export function resetToBlankTemplate(newHospitalName: string, newProvince: string): HospitalConfig {
  const blankConfig: HospitalConfig = {
    hospitalName: newHospitalName || "",
    hospitalCode: "HOSP-01",
    province: newProvince || "",
    departmentName: "",
    documentIdPrefix: "",
    logoUrl: "",
    chiefName: "",
    chiefPosition: "",
    directorName: "",
    directorPosition: ""
  };

  const blankSettings: ReportSettings = {
    documentId: "สธ 0001.01/",
    documentDate: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    subject: "รายงานผลการประเมินการได้รับปริมาณรังสีสะสมของผู้ปฏิบัติงานทางรังสี",
    attention: `ผู้อำนวยการ${newHospitalName || "โรงพยาบาล"}`,
    reportNo: "2569WS-00001",
    monthRangeText: "ประจำรอบปีงบประมาณปัจจุบัน"
  };

  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(blankSettings));
  localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(blankConfig));
  localStorage.removeItem(STORAGE_KEYS.SIGNATURES);

  return blankConfig;
}
