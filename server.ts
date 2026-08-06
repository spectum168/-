import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
} catch (err) {
  console.error("Failed to initialize Gemini:", err);
}

// API endpoint for parsing dose records
app.post('/api/parse-doses', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'กรุณากรอกข้อความที่ต้องการวิเคราะห์' });
  }

  if (!process.env.GEMINI_API_KEY || !ai) {
    return res.status(500).json({ 
      error: 'ไม่พบคีย์ระบบวิเคราะห์ AI (GEMINI_API_KEY is not configured on the server).' 
    });
  }

  try {
    const prompt = `คุณคือผู้ช่วยจัดการข้อมูลด้านรังสีทางการแพทย์และการบันทึกประวัติการรับปริมาณรังสีสะสมของโรงพยาบาลแม่ทา
กรุณาวิเคราะห์ข้อความรายงานปริมาณรังสีบุคคลที่ผู้ใช้ส่งมา ซึ่งอาจจะเป็นข้อความดิบจากการคัดลอกจากรายงาน PDF, หรือข้อความสรุปจากแชทบอท (เช่น "รอบปี/เดือน: 2568/12, 2569/01", "ปริมาณรังสี: Hp(10) = 292 | Hp(0.07) = 298 | Hp(3) = 302") แล้วสกัดออกมาเป็นรายการออบเจกต์ JSON

กฎการสกัดข้อมูล:
1. หากในข้อความระบุชื่อ เช่น "ธีรพล เตจ๊ะเสาร์" หรือ "นายธีรพล เตจ๊ะเสาร์" ให้สกัดชื่อเต็มออกมาในฟิลด์ staffName โดยตัดคำนำหน้าออกก็ได้หรือใส่ไว้ทั้งหมดก็ได้ (เช่น "นายธีรพล เตจ๊ะเสาร์" หรือ "ธีรพล เตจ๊ะเสาร์")
2. หากในข้อความหนึ่งรายชื่อ มี "รอบปี/เดือน" ระบุมากกว่าหนึ่งเดือน (เช่น 2568/12, 2569/01, 2569/02) คู่กับปริมาณรังสีชุดเดียวกัน ให้สร้างเรคคอร์ดแยกกันสำหรับแต่ละเดือน เช่น:
   - เรคคอร์ดที่ 1: ชื่อ ธีรพล เตจ๊ะเสาร์, เดือน 2568/12, Hp(10)=292, Hp(0.07)=298, Hp(3)=302
   - เรคคอร์ดที่ 2: ชื่อ ธีรพล เตจ๊ะเสาร์, เดือน 2569/01, Hp(10)=292, Hp(0.07)=298, Hp(3)=302
   - เรคคอร์ดที่ 3: ชื่อ ธีรพล เตจ๊ะเสาร์, เดือน 2569/02, Hp(10)=292, Hp(0.07)=298, Hp(3)=302
3. ข้อมูลปริมาณรังสีสะสม:
   - hp10 คาดการณ์จากคำว่า Hp(10) หรือ Hp 10 หรือ Deep dose
   - hp007 คาดการณ์จากคำว่า Hp(0.07) หรือ Hp 0.07 หรือ Shallow dose
   - hp3 คาดการณ์จากคำว่า Hp(3) หรือ Hp 3 หรือ Lens dose
   - หากในข้อความดิบไม่มีค่าสะสมระบุชัดเจน ให้ใส่ค่าเริ่มต้นเป็น 0 หรือปล่อยว่าง
4. ฟิลด์ที่สำคัญต้องส่งกลับมาประกอบด้วย:
   - staffName: ชื่อผู้รับรังสี (string)
   - yearMonth: ปีและเดือนในรูปแบบ พ.ศ. สี่หลักตามด้วยเครื่องหมายทับและเดือนสองหลัก เช่น "2569/01", "2568/12"
   - hp10: ปริมาณรังสีสะสม Hp(10) (ตัวเลขจำนวนเต็ม หรือ 0)
   - hp007: ปริมาณรังสีสะสม Hp(0.07) (ตัวเลขจำนวนเต็ม หรือ 0)
   - hp3: ปริมาณรังสีสะสม Hp(3) (ตัวเลขจำนวนเต็ม หรือ 0)
   - analysisNo: เลขวิเคราะห์ หากระบุ (เช่น "0469094976") หากไม่มีให้สร้างค่าว่างหรือสุ่มตัวเลข 10 หลัก
   - organ: อวัยวะที่ได้รับ ปกติให้ใส่ "ลำตัว"
   - grade: ระดับความเสี่ยงจากระดับรังสีต่อเดือนของรายการนั้น โดยประเมินดังนี้:
     * หาก hp10 >= 1000 หรือ hp007 >= 10000 หรือ hp3 >= 1500 ให้ใช้เกรด "H" (High)
     * หาก hp10 >= 300 หรือ hp007 >= 3000 หรือ hp3 >= 500 ให้ใช้เกรด "M" (Monitor)
     * นอกเหนือจากนั้นให้ใช้เกรด "S" (Safe)

ข้อความที่ต้องการให้วิเคราะห์:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            records: {
              type: Type.ARRAY,
              description: "รายการปริมาณรังสีสะสมที่สกัดออกมาได้ทั้งหมด",
              items: {
                type: Type.OBJECT,
                properties: {
                  staffName: { type: Type.STRING, description: "ชื่อผู้รับรังสี" },
                  yearMonth: { type: Type.STRING, description: "ปีและเดือน พ.ศ. เช่น 2569/01" },
                  hp10: { type: Type.INTEGER, description: "ปริมาณรังสี Hp(10) (uSv)" },
                  hp007: { type: Type.INTEGER, description: "ปริมาณรังสี Hp(0.07) (uSv)" },
                  hp3: { type: Type.INTEGER, description: "ปริมาณรังสี Hp(3) (uSv)" },
                  analysisNo: { type: Type.STRING, description: "เลขวิเคราะห์" },
                  organ: { type: Type.STRING, description: "อวัยวะที่ติดตั้งเครื่องวัด (ค่าเริ่มต้น 'ลำตัว')" },
                  grade: { type: Type.STRING, description: "ระบุ S, M, หรือ H" }
                },
                required: ["staffName", "yearMonth", "hp10", "hp007", "hp3"]
              }
            }
          },
          required: ["records"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedJson = JSON.parse(resultText);
    res.json(parsedJson);
  } catch (error: any) {
    console.error("AI parse error:", error);
    res.status(500).json({ error: error.message || "เกิดข้อผิดพลาดในการประมวลผลข้อมูลด้วย AI" });
  }
});

// Vite / static file middleware setup
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();
