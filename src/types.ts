export interface HospitalConfig {
  hospitalName: string;         // e.g., "โรงพยาบาลตัวอย่าง", "โรงพยาบาลทั่วไป"
  hospitalCode: string;         // e.g., "HOSP-01"
  province: string;             // e.g., "จังหวัดตัวอย่าง 10000"
  departmentName: string;       // e.g., "กลุ่มงานรังสีเทคนิค"
  documentIdPrefix: string;     // e.g., "สธ 0033.101/"
  logoUrl?: string;             // Optional custom logo URL
  chiefName: string;            // e.g., "นายสมชาย รังสีดี"
  chiefPosition: string;        // e.g., "หัวหน้างานรังสีเทคนิค"
  directorName: string;         // e.g., "นายแพทย์สมศักดิ์ รักษาดี"
  directorPosition: string;     // e.g., "ผู้อำนวยการโรงพยาบาลตัวอย่าง"
}

export interface DoseRecord {
  id: string;
  staffId: string;
  staffName: string;
  yearMonth: string; // e.g., "2568/12", "2569/01", "2569/02"
  hp10: number;      // Hp(10) Deep dose equivalent (micro-Sieverts)
  hp007: number;     // Hp(0.07) Shallow dose equivalent
  hp3: number;       // Hp(3) Lens dose equivalent
  analysisNo: string; // e.g., "0468345827"
  organ: string;      // Body area, e.g., "ลำตัว"
  grade: 'S' | 'M' | 'H'; // 'S' = Safe, 'M' = Monitor, 'H' = High
  comment?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  historicalDoses: { [year: string]: number }; // Annual Hp(10) doses for years e.g., 2563, 2564, 2565, 2566, 2567
}

export interface SignatureLog {
  signerId: 'radiology_chief' | 'hospital_director';
  signerName: string;
  position: string;
  isSigned: boolean;
  signedAt?: string;
  signType?: 'handdrawn' | 'saraban_auth'; // handdrawn = canvas, saraban_auth = quick secure click
  signatureData?: string; // canvas Base64 image
  verificationToken?: string; // secure audit hash
  signerIPAndAgent?: string; // browser metadata for tracking
}

export interface ReportSettings {
  documentId: string;      // e.g., "ลพ 0033.302/" or "สธ ๐๖๐๕/๒๕๖๙"
  documentDate: string;    // e.g., "2 เมษายน 2569"
  subject: string;         // e.g., "รายงานผลการประเมินการได้รับปริมาณรังสีสะสมของผู้ปฏิบัติงาน"
  attention: string;       // e.g., "ผู้อำนวยการโรงพยาบาล..."
  reportNo: string;        // e.g., "2569WS126-101364"
  monthRangeText: string;   // e.g., "ธันวาคม 2568 ถึง กุมภาพันธ์ 2569"
}
