import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Konfigurasi URL API Backend Flask
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

/* =====================================================================
   DATA — kode pertanyaan Q1–Q31 sesuai Tabel_Pertanyaan_Karir_Draft_ML.docx
   Payload `answers` tetap kompatibel dengan backend / model ML nantinya.
   ===================================================================== */
const PRODI_OPTIONS = [
  { value: 'Informatika', icon: 'code', color: '#3d63ff', desc: 'Fokus pada perangkat lunak, algoritma, dan kecerdasan buatan.' },
  { value: 'Sistem Informasi', icon: 'flow', color: '#ff6b57', desc: 'Fokus pada sistem bisnis, data organisasi, dan tata kelola TI.' },
  { value: 'Teknik Komputer', icon: 'chip', color: '#19c79f', desc: 'Fokus pada perangkat keras, jaringan, dan sistem tertanam.' }
];

const SCALES = {
  kesesuaian: {
    left: 'Sangat Tidak Sesuai',
    right: 'Sangat Sesuai',
    labels: ['Sangat Tidak Sesuai', 'Tidak Sesuai', 'Cukup Sesuai', 'Sesuai', 'Sangat Sesuai']
  },
  ketertarikan: {
    left: 'Sangat Tidak Tertarik',
    right: 'Sangat Tertarik',
    labels: ['Sangat Tidak Tertarik', 'Tidak Tertarik', 'Biasa Saja', 'Tertarik', 'Sangat Tertarik']
  }
};

const QUESTION_GROUPS = [
  {
    id: 'karakteristik-pribadi',
    title: 'Karakteristik Pribadi',
    short: 'Karakter',
    subtitle: 'Pernyataan tentang sikap, komunikasi, ketelitian, dan caramu bekerja sama sehari-hari.',
    scaleType: 'kesesuaian',
    g1: '#ff8a6b',
    g2: '#ff5a4d',
    questions: [
      { code: 'Q2', question: 'Saya nyaman menyampaikan pendapat atau berbicara di depan orang lain.' },
      { code: 'Q3', question: 'Saya senang mengatur tugas dan memastikan kegiatan berjalan sesuai rencana.' },
      { code: 'Q4', question: 'Saya senang membantu orang lain atau ikut dalam kegiatan sosial.' },
      { code: 'Q5', question: 'Saya biasanya memikirkan penyebab masalah sebelum mencari solusinya.' },
      { code: 'Q6', question: 'Saya senang membuat sesuatu yang kreatif atau mengembangkan ide baru.' },
      { code: 'Q7', question: 'Saya teliti dan memperhatikan detail ketika mengerjakan sesuatu.' },
      { code: 'Q8', question: 'Saya nyaman bekerja sama dengan orang yang memiliki pendapat berbeda.' }
    ]
  },
  {
    id: 'minat-aktivitas-teknologi',
    title: 'Minat terhadap Aktivitas Teknologi',
    short: 'Minat Teknologi',
    subtitle: 'Seberapa tertarik kamu pada aktivitas di bidang data, perangkat lunak, desain, keamanan, perangkat keras, dan sistem informasi.',
    scaleType: 'ketertarikan',
    g1: '#9a7dff',
    g2: '#6a4cf0',
    questions: [
      { code: 'Q9', question: 'Mencari pola dari sekumpulan data untuk menemukan informasi yang berguna.' },
      { code: 'Q10', question: 'Menggunakan angka dan hasil perhitungan untuk membantu menjawab suatu masalah.' },
      { code: 'Q11', question: 'Membuat grafik atau tampilan visual agar informasi lebih mudah dipahami.' },
      { code: 'Q12', question: 'Membuat program yang dapat belajar dari contoh data untuk membantu memperkirakan suatu hasil.' },
      { code: 'Q13', question: 'Mencoba berbagai cara agar program dapat memberikan hasil yang lebih tepat.' },
      { code: 'Q14', question: 'Membuat aplikasi atau program yang dapat digunakan orang lain.' },
      { code: 'Q15', question: 'Mencari dan memperbaiki kesalahan pada aplikasi atau program.' },
      { code: 'Q16', question: 'Mendesain tampilan aplikasi agar menarik dan mudah digunakan.' },
      { code: 'Q17', question: 'Memahami kebutuhan orang yang akan menggunakan aplikasi sebelum merancangnya.' },
      { code: 'Q18', question: 'Membuat contoh tampilan aplikasi dan mencoba apakah pengguna mudah memahaminya.' },
      { code: 'Q19', question: 'Mencari kelemahan yang dapat dimanfaatkan orang untuk menyerang sistem komputer.' },
      { code: 'Q20', question: 'Mencari cara untuk melindungi akun, data, dan sistem dari ancaman digital.' },
      { code: 'Q21', question: 'Memahami bagaimana komputer dan perangkat lain saling terhubung serta memperbaiki masalah koneksinya.' },
      { code: 'Q22', question: 'Membuat perangkat yang menggunakan sensor untuk membaca keadaan sekitar, seperti suhu atau gerakan.' },
      { code: 'Q23', question: 'Menggabungkan komponen elektronik dan program agar suatu perangkat dapat bekerja sesuai fungsinya.' },
      { code: 'Q24', question: 'Membuat program yang berjalan langsung di dalam perangkat elektronik, bukan hanya di komputer atau ponsel.' },
      { code: 'Q25', question: 'Mempelajari cara merancang bagian elektronik kecil yang menjadi komponen utama perangkat, seperti chip pada komputer.' },
      { code: 'Q26', question: 'Memahami cara kerja suatu perusahaan dan mencari cara agar proses kerjanya terbantu oleh sistem komputer.' },
      { code: 'Q27', question: 'Memeriksa apakah penggunaan sistem komputer dan pengelolaan data sudah aman serta mengikuti aturan yang berlaku.' }
    ]
  },
  {
    id: 'cara-belajar-dan-problem-solving',
    title: 'Cara Belajar dan Problem Solving',
    short: 'Cara Belajar',
    subtitle: 'Pendekatanmu dalam menganalisis persoalan, belajar mandiri, dan menjelaskan solusi.',
    scaleType: 'kesesuaian',
    g1: '#2fd9ae',
    g2: '#0fa883',
    questions: [
      { code: 'Q28', question: 'Saya senang menyelesaikan masalah yang membutuhkan pemikiran logis.' },
      { code: 'Q29', question: 'Saya senang mencoba dan mempelajari hal baru secara mandiri.' },
      { code: 'Q30', question: 'Saya senang memahami suatu informasi lalu menjelaskannya kembali kepada orang lain.' },
      { code: 'Q31', question: 'Saya tertarik menggunakan teknologi untuk membantu menyelesaikan masalah sehari-hari.' }
    ]
  }
];

/* Urutan alur: Q1 (prodi) lalu Q2–Q31 */
const FLOW = [{ code: 'Q1', type: 'prodi' }];
QUESTION_GROUPS.forEach((g, gi) =>
  g.questions.forEach((q, qi) =>
    FLOW.push({
      code: q.code,
      type: 'scale',
      text: q.question,
      group: g,
      gi,
      firstInGroup: qi === 0
    })
  )
);
const TOTAL = FLOW.length;

/* 11 Bidang karir */
const CAREER_ORDER = ['ds', 'ai', 'da', 'cy', 'io', 'em', 'ch', 'se', 'en', 'au', 'ux'];
const CAREERS = {
  ds: {
    name: 'Data Scientist',
    short: 'Data Scientist',
    color: '#8b6bff',
    p1: '#b6a2ff',
    p2: '#6d4df2',
    tagline: 'Menyuka data, mencari pola, berpikir analitis, dan memahami informasi dari angka.',
    desc: 'Data Scientist menggali data dalam jumlah besar untuk menemukan pola, membangun model statistik, dan mengubah temuan menjadi wawasan yang membantu pengambilan keputusan.',
    comps: [
      'Statistik, probabilitas, dan analisis kuantitatif',
      'Pemrograman analitis (Python, R, SQL)',
      'Eksplorasi data dan pengenalan pola',
      'Menyampaikan temuan data secara jelas kepada pemangku kepentingan'
    ],
    advice: [
      'Perdalam statistik, probabilitas, dan Python atau SQL.',
      'Kerjakan proyek dataset nyata dari eksplorasi sampai evaluasi.',
      'Latih menjelaskan hasil analisis dengan bahasa sederhana.'
    ],
    roles: [
      ['Data Scientist', 'Menganalisis data kompleks dan membangun model untuk menjawab masalah organisasi.'],
      ['Research Analyst', 'Meneliti tren dan pola dari data untuk mendukung strategi.'],
      ['Quantitative Analyst', 'Menggunakan model matematis dan statistik untuk menilai peluang dan risiko.']
    ]
  },
  ai: {
    name: 'AI / Machine Learning Engineer',
    short: 'AI / ML Engineer',
    color: '#e056c8',
    p1: '#f5a3e6',
    p2: '#b92fa0',
    tagline: 'Membuat program yang belajar dari data, mencoba pendekatan berbeda, dan memecahkan masalah.',
    desc: 'AI/Machine Learning Engineer merancang, melatih, dan menyempurnakan model yang dapat belajar dari contoh data, lalu memasangnya agar bisa dipakai di aplikasi nyata.',
    comps: [
      'Dasar machine learning dan deep learning',
      'Pemrograman Python dan framework seperti PyTorch atau TensorFlow',
      'Menyiapkan data dan mengevaluasi model',
      'Bereksperimen dengan banyak pendekatan sampai hasil lebih tepat'
    ],
    advice: [
      'Kuasai Python, aljabar linear, dan dasar machine learning.',
      'Ulangi eksperimen model dan catat hasil tiap percobaan.',
      'Pelajari cara men-deploy model menjadi layanan sederhana.'
    ],
    roles: [
      ['Machine Learning Engineer', 'Melatih dan mengoptimalkan model prediktif untuk produk digital.'],
      ['AI Engineer', 'Mengintegrasikan model cerdas ke dalam aplikasi dan layanan.'],
      ['NLP / Computer Vision Engineer', 'Mengembangkan sistem yang memahami teks atau gambar.']
    ]
  },
  da: {
    name: 'Data Analyst',
    short: 'Data Analyst',
    color: '#84cc16',
    p1: '#d4f08a',
    p2: '#5fa00b',
    tagline: 'Menyukai pengolahan data, pencarian informasi, dan penggunaan hasil analisis untuk menjawab pertanyaan.',
    desc: 'Data Analyst mengolah dan membersihkan data, mencari informasi penting di dalamnya, lalu menyajikannya dalam grafik dan laporan agar mudah dipahami dan dipakai mengambil keputusan.',
    comps: [
      'SQL, spreadsheet, dan pengolahan data',
      'Visualisasi data dan dashboard',
      'Membersihkan dan menyusun data',
      'Menjelaskan hasil analisis kepada orang lain'
    ],
    advice: [
      'Biasakan SQL dan alat dashboard seperti Power BI atau Looker Studio.',
      'Buat portofolio dashboard dari dataset publik.',
      'Latih bercerita dengan data, bukan hanya menampilkan angka.'
    ],
    roles: [
      ['Data Analyst', 'Mengolah data dan menjawab pertanyaan bisnis lewat analisis.'],
      ['Business Intelligence Analyst', 'Membangun dashboard yang membantu pimpinan memantau kinerja.'],
      ['Reporting Specialist', 'Menyusun laporan berkala yang akurat dan mudah dibaca.']
    ]
  },
  cy: {
    name: 'Cybersecurity Analyst',
    short: 'Cybersecurity',
    color: '#5b54e8',
    p1: '#9d99ff',
    p2: '#3b34b8',
    tagline: 'Menemukan kelemahan sistem dan melindungi informasi dari ancaman digital.',
    desc: 'Cybersecurity Analyst memantau dan menguji sistem untuk menemukan kelemahan, lalu memperkuat perlindungan akun, data, dan jaringan dari serangan digital.',
    comps: [
      'Dasar jaringan: TCP/IP, routing, dan firewall',
      'Identifikasi kerentanan dan penetration testing secara etis',
      'Monitoring, analisis log, dan respons insiden',
      'Pemahaman enkripsi dan manajemen hak akses'
    ],
    advice: [
      'Pelajari dasar jaringan dan Linux, lalu berlatih di lab atau CTF yang legal.',
      'Pertimbangkan sertifikasi dasar seperti CompTIA Security+ atau CCNA.',
      'Biasakan menulis laporan temuan yang jelas dan rapi.'
    ],
    roles: [
      ['Security Analyst', 'Memantau ancaman, menganalisis log, dan menindaklanjuti insiden keamanan.'],
      ['Penetration Tester', 'Menguji sistem secara etis untuk menemukan celah sebelum dimanfaatkan penyerang.'],
      ['Network Security Engineer', 'Mengamankan dan menjaga stabilitas infrastruktur jaringan.']
    ]
  },
  io: {
    name: 'IoT Developer / Engineer',
    short: 'IoT Developer',
    color: '#2fd39a',
    p1: '#9af0cb',
    p2: '#10a37f',
    tagline: 'Tertarik pada sensor, perangkat elektronik, dan menggabungkan komponen dengan program.',
    desc: 'IoT Developer/Engineer menghubungkan sensor dan perangkat elektronik ke jaringan, lalu menulis program agar data dapat dibaca, dikirim, dan dimanfaatkan.',
    comps: [
      'Pemrograman mikrokontroler dan perangkat berbasis sensor',
      'Dasar rangkaian elektronik',
      'Protokol komunikasi seperti MQTT, I2C, dan SPI',
      'Mengirim data perangkat ke cloud atau dashboard'
    ],
    advice: [
      'Mulai proyek kecil dengan Arduino atau ESP32, misalnya monitor suhu ruangan.',
      'Pelajari cara mengirim data sensor ke cloud atau dashboard.',
      'Dokumentasikan skema rangkaian dan kode supaya proyekmu bisa ditiru.'
    ],
    roles: [
      ['IoT Developer', 'Menghubungkan sensor dan perangkat ke jaringan serta platform data.'],
      ['IoT Solutions Engineer', 'Merancang solusi perangkat terhubung untuk kebutuhan nyata.'],
      ['Smart Device Engineer', 'Mengembangkan perangkat pintar untuk rumah, industri, atau pertanian.']
    ]
  },
  em: {
    name: 'Embedded Systems Engineer',
    short: 'Embedded Systems',
    color: '#14b8a6',
    p1: '#8ff0e1',
    p2: '#0b8f82',
    tagline: 'Tertarik memahami komponen elektronik dan membuat program yang mengendalikan fungsi perangkat elektronik.',
    desc: 'Embedded Systems Engineer menulis program yang berjalan langsung di dalam perangkat elektronik dan memastikan perangkat keras serta perangkat lunaknya bekerja sama dengan andal.',
    comps: [
      'Pemrograman C/C++ untuk mikrokontroler',
      'Dasar rangkaian dan komponen elektronik',
      'Debugging perangkat keras dan perangkat lunak',
      'Ketelitian dalam membaca datasheet'
    ],
    advice: [
      'Perdalam C/C++ dan arsitektur mikrokontroler.',
      'Bangun proyek yang mengendalikan motor, sensor, atau layar.',
      'Biasakan membaca datasheet dan skema rangkaian.'
    ],
    roles: [
      ['Embedded Engineer', 'Menulis program yang berjalan langsung di dalam perangkat elektronik.'],
      ['Firmware Engineer', 'Mengembangkan dan memperbarui perangkat lunak tingkat rendah pada perangkat.'],
      ['Hardware Test Engineer', 'Menguji agar perangkat bekerja sesuai fungsinya.']
    ]
  },
  ch: {
    name: 'Chip Design Engineer',
    short: 'Chip Design',
    color: '#64748b',
    p1: '#aab6c8',
    p2: '#3a4658',
    tagline: 'Tertarik memahami komponen elektronik, rangkaian digital, dan cara kerja chip.',
    desc: 'Chip Design Engineer merancang rangkaian digital yang menjadi otak perangkat, mulai dari logika dasar, simulasi, hingga verifikasi agar chip bekerja benar.',
    comps: [
      'Logika digital dan arsitektur komputer',
      'Bahasa deskripsi perangkat keras seperti Verilog atau VHDL',
      'Simulasi dan verifikasi rancangan',
      'Ketelitian tinggi pada detail rangkaian'
    ],
    advice: [
      'Kuasai logika digital dan arsitektur komputer.',
      'Coba Verilog atau VHDL dengan simulator dan FPGA sederhana.',
      'Latih ketelitian lewat proyek verifikasi kecil.'
    ],
    roles: [
      ['Digital Design Engineer', 'Merancang rangkaian digital dengan bahasa deskripsi perangkat keras.'],
      ['Verification Engineer', 'Menguji rancangan chip lewat simulasi sebelum diproduksi.'],
      ['FPGA Engineer', 'Mengimplementasikan rancangan pada perangkat FPGA.']
    ]
  },
  se: {
    name: 'Application Developer',
    short: 'App Developer',
    color: '#38bdf8',
    p1: '#9be0ff',
    p2: '#2f8fe8',
    tagline: 'Tertarik membuat aplikasi, menulis program, dan memperbaiki kesalahan.',
    desc: 'Application Developer membuat aplikasi mulai dari analisis kebutuhan, penulisan kode, pengujian, hingga pemeliharaan agar aplikasi berjalan andal dan mudah dikembangkan.',
    comps: [
      'Pemrograman serta struktur data dan algoritma',
      'Perancangan arsitektur aplikasi dan basis data',
      'Debugging, pengujian, dan penjaminan kualitas',
      'Kolaborasi tim dengan version control dan praktik agile'
    ],
    advice: [
      'Dalami satu bahasa pemrograman sampai nyaman, lalu pelajari framework web atau mobile.',
      'Bangun dan publikasikan proyek aplikasi lengkap di GitHub beserta dokumentasinya.',
      'Ikut kerja tim atau open source untuk melatih kolaborasi.'
    ],
    roles: [
      ['Frontend / Backend Developer', 'Membangun tampilan dan logika sisi server untuk aplikasi web yang cepat dan stabil.'],
      ['Mobile App Developer', 'Mengembangkan aplikasi Android atau iOS yang nyaman dipakai.'],
      ['Software Tester / QA', 'Menguji aplikasi agar bebas kesalahan sebelum dirilis.']
    ]
  },
  en: {
    name: 'ERP Analyst / Consultant',
    short: 'ERP Analyst',
    color: '#ffb524',
    p1: '#ffdc82',
    p2: '#ff9a1f',
    tagline: 'Tertarik memahami kebutuhan bisnis dan mencari cara agar sistem membantu pekerjaan perusahaan.',
    desc: 'ERP Analyst/Consultant memahami proses kerja perusahaan, lalu menyesuaikan dan mengimplementasikan sistem terintegrasi agar pekerjaan lebih efisien.',
    comps: [
      'Analisis proses bisnis dan kebutuhan sistem',
      'Pemahaman ERP dan integrasi antar sistem',
      'Komunikasi dan pengelolaan pemangku kepentingan',
      'Mengatur tugas dan jadwal implementasi'
    ],
    advice: [
      'Pelajari pemodelan proses bisnis (BPMN) dan dasar-dasar ERP.',
      'Coba studi kasus implementasi sistem seperti Odoo atau SAP.',
      'Latih presentasi dan penulisan dokumen kebutuhan yang rapi.'
    ],
    roles: [
      ['ERP Analyst', 'Menerjemahkan kebutuhan bisnis menjadi konfigurasi sistem ERP.'],
      ['Business / System Analyst', 'Menyusun spesifikasi sistem yang jelas bagi tim pengembang.'],
      ['IT Consultant', 'Mendampingi organisasi memilih dan menerapkan solusi teknologi.']
    ]
  },
  au: {
    name: 'IT Auditor',
    short: 'IT Auditor',
    color: '#ef4444',
    p1: '#fca5a5',
    p2: '#b91c1c',
    tagline: 'Teliti, tertarik pada keamanan dan risiko, serta memeriksa apakah sistem digunakan sesuai aturan.',
    desc: 'IT Auditor memeriksa apakah sistem komputer dan pengelolaan data sudah aman, andal, dan sesuai aturan, lalu menyusun temuan serta rekomendasi perbaikan.',
    comps: [
      'Kerangka tata kelola dan audit TI (COBIT, ISO 27001)',
      'Penilaian risiko dan pengendalian internal',
      'Ketelitian dalam memeriksa bukti dan dokumen',
      'Menulis laporan temuan yang jelas'
    ],
    advice: [
      'Kenali COBIT dan ISO 27001 lewat studi kasus audit sederhana.',
      'Latih ketelitian memeriksa dokumen dan bukti.',
      'Asah penulisan laporan temuan dan rekomendasi.'
    ],
    roles: [
      ['IT Auditor', 'Menilai apakah pengelolaan sistem dan data sudah aman serta sesuai aturan.'],
      ['Risk & Compliance Analyst', 'Mengidentifikasi risiko teknologi dan memastikan kepatuhan.'],
      ['IT Governance Specialist', 'Menyelaraskan penggunaan teknologi dengan kebijakan organisasi.']
    ]
  },
  ux: {
    name: 'UI/UX Designer',
    short: 'UI/UX Designer',
    color: '#ff7a59',
    p1: '#ffc0aa',
    p2: '#ff6b57',
    tagline: 'Kreatif, tertarik memahami kebutuhan pengguna, merancang tampilan, dan menguji kemudahan penggunaan.',
    desc: 'UI/UX Designer memahami kebutuhan pengguna, merancang alur dan tampilan, membuat prototipe, lalu menguji apakah rancangan mudah dipahami dan nyaman digunakan.',
    comps: [
      'Riset pengguna: wawancara, survei, dan usability testing',
      'Perancangan wireframe, prototipe, dan design system',
      'Penerapan visual, warna, dan tipografi yang konsisten',
      'Komunikasi ide desain kepada developer dan tim'
    ],
    advice: [
      'Pelajari Figma dan prinsip dasar UX seperti hierarki visual dan aksesibilitas.',
      'Susun studi kasus yang menunjukkan masalah, proses, dan hasil.',
      'Uji desainmu ke beberapa orang dan catat masukannya.'
    ],
    roles: [
      ['UI Designer', 'Merancang antarmuka yang rapi, konsisten, dan enak dilihat di berbagai ukuran layar.'],
      ['UX Researcher', 'Menggali kebutuhan dan perilaku pengguna lewat riset.'],
      ['Product Designer', 'Merancang pengalaman produk dari ide sampai tampilan akhir.']
    ]
  }
};

/* ---------------------------------------------------------------------
   MOCK SCORING — hanya pratinjau antarmuka.
   Ganti isi computeResult() dengan panggilan ke backend / model ML nantinya.
   --------------------------------------------------------------------- */
const FIELD_ITEMS = {
  ds: ['Q9', 'Q10', 'Q5', 'Q28', 'Q12'],
  ai: ['Q12', 'Q13', 'Q28', 'Q29'],
  da: ['Q9', 'Q10', 'Q11', 'Q30'],
  cy: ['Q19', 'Q20', 'Q21', 'Q7'],
  io: ['Q22', 'Q23', 'Q21', 'Q31'],
  em: ['Q23', 'Q24', 'Q15', 'Q7'],
  ch: ['Q25', 'Q23', 'Q7', 'Q28'],
  se: ['Q14', 'Q15', 'Q29', 'Q28'],
  en: ['Q26', 'Q3', 'Q30', 'Q2'],
  au: ['Q27', 'Q7', 'Q3', 'Q20'],
  ux: ['Q16', 'Q17', 'Q18', 'Q6', 'Q8']
};

const PRODI_BIAS = {
  'Informatika': { ds: 0.2, ai: 0.2, se: 0.2 },
  'Sistem Informasi': { en: 0.2, da: 0.15, au: 0.15, ux: 0.15 },
  'Teknik Komputer': { io: 0.2, em: 0.2, ch: 0.2, cy: 0.15 }
};

function computeResult(answers) {
  const bias = PRODI_BIAS[answers.Q1] || {};
  const scores = CAREER_ORDER.map((k) => {
    const vals = FIELD_ITEMS[k].map((c) => answers[c] || 3);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { key: k, s: avg + (bias[k] || 0) };
  });
  const exps = scores.map((x) => Math.exp(1.2 * x.s));
  const sum = exps.reduce((a, b) => a + b, 0);
  const ranked = scores
    .map((x, i) => ({ key: x.key, pct: +((exps[i] / sum) * 100).toFixed(1) }))
    .sort((a, b) => b.pct - a.pct);
  const groups = QUESTION_GROUPS.map((g) => {
    const vals = g.questions.map((q) => answers[q.code]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { g, avg, pct: Math.round((avg / 5) * 100) };
  });
  return { ranked, groups };
}

/* =====================================================================
   UTIL & SVG HELPERS
   ===================================================================== */
const INK = '#1d2250';
const TONES = { 1: '#ff5470', 2: '#ffa27a', 3: '#c9cfe8', 4: '#7fdcb0', 5: '#19c79f' };
const SIZES = { 1: 'm-xl', 2: 'm-lg', 3: 'm-md', 4: 'm-lg', 5: 'm-xl' };

function mix(hex, to, t) {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const f = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return '#' + [16, 8, 0].map((s) => f(s).toString(16).padStart(2, '0')).join('');
}
const lighten = (h, t) => mix(h, '#ffffff', t);
const darken = (h, t) => mix(h, '#000000', t);

const ICONS = {
  back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  fwd: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>',
  flow: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="8.5" y="14" width="7" height="7" rx="1.5"/><path d="M6.5 10v2h11v-2M12 12v2"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  star: '<polygon points="12 2 15.1 8.6 22 9.3 16.8 14 18.2 21 12 17.5 5.8 21 7.2 14 2 9.3 8.9 8.6"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>'
};

function Icon({ name, size = 20, fill = 'none' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }}
    />
  );
}

function Wave() {
  return (
    <svg className="wave" viewBox="0 0 400 36" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 20 C70 42 120 2 200 18 S330 38 400 10 V36 H0Z" />
    </svg>
  );
}

const CHAR_MAIN = {
  guide: '#ffc23d',
  ds: '#8b6bff',
  ai: '#e056c8',
  da: '#84cc16',
  cy: '#5b54e8',
  io: '#2fd39a',
  em: '#14b8a6',
  ch: '#64748b',
  se: '#38bdf8',
  en: '#ffb524',
  au: '#ef4444',
  ux: '#ff7a59'
};
const CHAR_NAME = {
  guide: 'Kiko, maskot panduan',
  ds: 'Maskot Data Scientist',
  ai: 'Maskot AI dan Machine Learning',
  da: 'Maskot Data Analyst',
  cy: 'Maskot Cybersecurity',
  io: 'Maskot IoT',
  em: 'Maskot Embedded Systems',
  ch: 'Maskot Chip Design',
  se: 'Maskot Application Developer',
  en: 'Maskot ERP Analyst',
  au: 'Maskot IT Auditor',
  ux: 'Maskot UI/UX Designer'
};

function characterSVGString(key) {
  const main = CHAR_MAIN[key];
  const dark = darken(main, 0.22);
  const light = lighten(main, 0.55);
  let accessories = '';
  const armL = `<ellipse cx="40" cy="142" rx="12" ry="19" transform="rotate(14 40 142)" fill="${dark}"/>`;
  const armR = `<ellipse cx="160" cy="142" rx="12" ry="19" transform="rotate(-14 160 142)" fill="${dark}"/>`;
  let arms = armL + armR;

  switch (key) {
    case 'guide':
      arms =
        armL +
        `<ellipse cx="166" cy="112" rx="12" ry="20" transform="rotate(-38 166 112)" fill="${dark}"/><circle cx="178" cy="92" r="9" fill="${dark}"/>`;
      accessories = `
        <path d="M100 24 L164 47 L100 68 L36 47Z" fill="#3b5bdb" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M70 60 V76 Q100 90 130 76 V60 L100 72Z" fill="#2a47b8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M152 50 V80" stroke="#ff6b57" stroke-width="3.5" stroke-linecap="round"/><circle cx="152" cy="84" r="6" fill="#ff6b57" stroke="${INK}" stroke-width="2.5"/>
        <path d="M22 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff" opacity=".9"/>`;
      break;
    case 'ds':
      accessories = `
        <path d="M100 54 V32" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="27" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
        <g fill="none" stroke="${INK}" stroke-width="3.5"><circle cx="79" cy="110" r="19"/><circle cx="121" cy="110" r="19"/><path d="M98 108 Q100 105 102 108"/></g>
        <g transform="rotate(-6 146 168)"><rect x="118" y="142" width="58" height="50" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/>
          <rect x="127" y="168" width="8" height="16" rx="2" fill="#8b6bff"/><rect x="141" y="158" width="8" height="26" rx="2" fill="#ffb524"/><rect x="155" y="150" width="8" height="34" rx="2" fill="#2fd39a"/></g>
        <path d="M26 64 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#ffd23f"/>
        <path d="M176 70 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff" opacity=".85"/>`;
      break;
    case 'se':
      accessories = `
        <path d="M50 104 A50 50 0 0 1 150 104" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
        <rect x="40" y="96" width="16" height="32" rx="8" fill="#ff6b57" stroke="${INK}" stroke-width="3"/>
        <rect x="144" y="96" width="16" height="32" rx="8" fill="#ff6b57" stroke="${INK}" stroke-width="3"/>
        <g><rect x="62" y="150" width="76" height="44" rx="8" fill="${INK}"/><rect x="68" y="155" width="64" height="34" rx="4" fill="#5eead4"/>
          <text x="100" y="179" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="19" fill="${INK}">&lt;/&gt;</text></g>
        <text x="22" y="64" font-family="Fredoka, sans-serif" font-weight="700" font-size="22" fill="#fff" opacity=".9">{ }</text>`;
      break;
    case 'ux':
      accessories = `
        <ellipse cx="98" cy="58" rx="46" ry="17" transform="rotate(-8 98 58)" fill="#3b5bdb" stroke="${INK}" stroke-width="3"/>
        <path d="M70 54 Q84 46 100 48" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".45"/>
        <circle cx="116" cy="40" r="5.5" fill="#3b5bdb" stroke="${INK}" stroke-width="3"/>
        <g transform="rotate(-12 52 164)"><path d="M28 164 C28 140 62 138 74 152 C84 164 70 170 62 170 C54 170 56 180 62 184 C46 192 28 184 28 164Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="40" cy="156" r="5" fill="#ff5470"/><circle cx="53" cy="150" r="5" fill="#ffd23f"/><circle cx="66" cy="155" r="5" fill="#2fd39a"/><circle cx="43" cy="170" r="5" fill="#38bdf8"/></g>
        <g transform="rotate(26 152 150)"><rect x="146" y="118" width="13" height="58" rx="3" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
          <path d="M146 176 L152.5 193 L159 176Z" fill="#ffe2c2" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="146" y="118" width="13" height="11" rx="3" fill="#ff6b8b" stroke="${INK}" stroke-width="3"/></g>
        <g transform="rotate(6 168 36)"><rect x="140" y="12" width="54" height="42" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>
          <rect x="146" y="18" width="42" height="7" rx="3" fill="#cfd8ff"/><rect x="146" y="30" width="18" height="18" rx="3" fill="#ffd2c6"/><rect x="168" y="31" width="20" height="4" rx="2" fill="#cfd8ff"/><rect x="168" y="40" width="14" height="4" rx="2" fill="#cfd8ff"/></g>
        <path d="M178 40 l0 22 l6 -5 l5 11 l5 -2 l-5 -11 l8 0z" fill="${INK}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
      break;
    case 'cy':
      accessories = `
        <path d="M36 114 C34 36 166 36 164 114 C152 84 128 78 100 78 C72 78 48 84 36 114Z" fill="${darken(main, 0.38)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M62 66 Q100 50 138 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".25"/>
        <path d="M100 140 L127 150 V169 Q127 185 100 196 Q73 185 73 169 V150Z" fill="#22d3ee" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <rect x="92" y="162" width="16" height="12" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
        <path d="M95 162 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
        <g fill="none" stroke="#22d3ee" stroke-width="4.5" stroke-linecap="round"><path d="M156 38 Q174 24 192 38"/><path d="M163 49 Q174 40 185 49"/></g><circle cx="174" cy="59" r="4" fill="#22d3ee"/>
        <text x="16" y="74" font-family="monospace" font-weight="700" font-size="15" fill="#22d3ee">0110</text>`;
      break;
    case 'io':
      accessories = `
        <path d="M80 56 Q72 36 58 30" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="55" cy="28" r="6.5" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
        <path d="M120 56 Q128 36 142 30" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="145" cy="28" r="6.5" fill="#ff6b57" stroke="${INK}" stroke-width="3"/>
        <g stroke="${INK}" stroke-width="3.5" stroke-linecap="round"><path d="M82 150v-7M100 150v-7M118 150v-7M82 192v7M100 192v7M118 192v7M64 162h6M64 180h6M130 162h6M130 180h6"/></g>
        <rect x="70" y="150" width="60" height="42" rx="7" fill="${INK}"/><rect x="79" y="158" width="42" height="26" rx="4" fill="#ffd23f"/>
        <text x="100" y="177" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="${INK}">IoT</text>
        <g fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"><path d="M160 94 Q176 84 188 96"/><path d="M164 108 Q174 100 182 110"/></g><circle cx="172" cy="122" r="3.5" fill="#fff"/>`;
      break;
    case 'ai':
      accessories = `
        <g stroke="${INK}" stroke-width="3" stroke-linecap="round"><path d="M70 36 L100 24 L130 36 M100 24 V50"/></g>
        <circle cx="70" cy="36" r="7" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><circle cx="100" cy="24" r="8" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="130" cy="36" r="7" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
        <g stroke="${INK}" stroke-width="2.5"><path d="M82 160 L118 152 M82 160 L118 172 M82 182 L118 172 M82 182 L118 192 M82 160 L118 192"/></g>
        <g fill="#fff" stroke="${INK}" stroke-width="3"><circle cx="82" cy="160" r="6"/><circle cx="82" cy="182" r="6"/><circle cx="118" cy="152" r="6"/><circle cx="118" cy="172" r="6"/><circle cx="118" cy="192" r="6"/></g>
        <path d="M24 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#fff" opacity=".9"/>`;
      break;
    case 'da':
      accessories = `
        <path d="M52 62 Q100 38 148 62" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <rect x="60" y="146" width="72" height="48" rx="8" fill="#fff" stroke="${INK}" stroke-width="3"/>
        <rect x="60" y="146" width="72" height="12" rx="6" fill="#5fa00b" stroke="${INK}" stroke-width="3"/>
        <g stroke="#c9cfe8" stroke-width="2.5"><path d="M60 170 H132 M60 182 H132 M84 158 V194 M108 158 V194"/></g>
        <circle cx="152" cy="142" r="17" fill="rgba(255,255,255,.55)" stroke="${INK}" stroke-width="4"/>
        <path d="M164 154 L180 172" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
        <g transform="translate(30 70)"><circle r="14" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><path d="M0 0 V-14 A14 14 0 0 1 13 4Z" fill="#ff6b57" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g>`;
      break;
    case 'em':
      accessories = `
        <path d="M100 54 V34" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="100" cy="28" r="8" fill="#ff5470" stroke="${INK}" stroke-width="3"/><path d="M86 18 l-5 -5 M114 18 l5 -5" stroke="#ff5470" stroke-width="3.5" stroke-linecap="round"/>
        <rect x="58" y="146" width="76" height="48" rx="7" fill="#0b6b60" stroke="${INK}" stroke-width="3"/>
        <path d="M66 160 H84 V172 M126 158 H108 V176 M66 184 H92 M126 186 H112" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
        <rect x="82" y="158" width="28" height="22" rx="3" fill="${INK}"/><text x="96" y="173" text-anchor="middle" font-family="monospace" font-weight="700" font-size="10" fill="#8ff0e1">MCU</text>
        <g transform="rotate(30 158 140)"><rect x="152" y="104" width="13" height="50" rx="4" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><rect x="154" y="152" width="9" height="22" rx="2" fill="#c9cfe8" stroke="${INK}" stroke-width="3"/></g>`;
      break;
    case 'ch':
      accessories = `
        <g fill="#a5f3fc" fill-opacity=".4" stroke="${INK}" stroke-width="3.5"><circle cx="79" cy="110" r="20"/><circle cx="121" cy="110" r="20"/></g>
        <path d="M99 108 H101" stroke="${INK}" stroke-width="4"/><path d="M44 106 Q40 110 44 118 M156 106 Q160 110 156 118" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <g stroke="#e8c15a" stroke-width="4" stroke-linecap="round"><path d="M72 146v-7M86 146v-7M100 146v-7M114 146v-7M128 146v-7M72 194v7M86 194v7M100 194v7M114 194v7M128 194v7M60 158h-7M60 170h-7M60 182h-7M140 158h7M140 170h7M140 182h7"/></g>
        <rect x="60" y="146" width="80" height="48" rx="6" fill="#2a3342" stroke="${INK}" stroke-width="3"/>
        <rect x="72" y="154" width="56" height="32" rx="3" fill="#aab6c8"/>
        <g stroke="#2a3342" stroke-width="2"><path d="M86 154 V186 M100 154 V186 M114 154 V186 M72 165 H128 M72 175 H128"/></g>
        <text x="22" y="64" font-family="monospace" font-weight="700" font-size="14" fill="#fff" opacity=".85">1010</text>`;
      break;
    case 'au':
      accessories = `
        <path d="M48 88 Q100 48 152 88 L152 98 Q100 66 48 98Z" fill="#1f8a4c" fill-opacity=".85" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        <g transform="rotate(-6 88 168)"><rect x="58" y="142" width="60" height="52" rx="6" fill="#fff" stroke="${INK}" stroke-width="3"/><rect x="58" y="142" width="10" height="52" rx="4" fill="#b91c1c" stroke="${INK}" stroke-width="3"/>
          <path d="M76 156 H110 M76 166 H110 M76 176 H98" stroke="#c9cfe8" stroke-width="3" stroke-linecap="round"/><circle cx="104" cy="182" r="8" fill="none" stroke="#12b886" stroke-width="3"/><path d="M100 182 l3 3 5-6" stroke="#12b886" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
        <circle cx="150" cy="150" r="17" fill="rgba(255,255,255,.55)" stroke="${INK}" stroke-width="4"/><path d="M162 162 L178 180" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
        <path d="M163 40 l-12 6 v10 q0 10 12 16 q12 -6 12 -16 V46Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".9"/>`;
      break;
    case 'en':
      accessories = `
        <path d="M100 52 q-8 -16 6 -18 q10 3 2 14" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <rect x="94" y="150" width="12" height="9" rx="2" fill="#1f3a8a"/><path d="M94 159 H106 L110 184 L100 193 L90 184Z" fill="#1f3a8a"/>
        <g transform="translate(34 66)"><circle r="13" fill="none" stroke="#1f3a8a" stroke-width="7" stroke-dasharray="5 4.2"/><circle r="9" fill="#1f3a8a"/><circle r="4" fill="#ffd23f"/></g>
        <g transform="rotate(8 148 168)"><rect x="124" y="138" width="46" height="58" rx="7" fill="#fff" stroke="${INK}" stroke-width="3"/>
          <rect x="135" y="131" width="24" height="13" rx="4" fill="#ff6b57" stroke="${INK}" stroke-width="3"/>
          <path d="M131 158 l4 4 8-8" stroke="#12b886" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="148" y="156" width="15" height="4" rx="2" fill="#cfd8ff"/>
          <path d="M131 177 l4 4 8-8" stroke="#12b886" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="148" y="175" width="15" height="4" rx="2" fill="#cfd8ff"/></g>`;
      break;
    default:
      break;
  }

  return `<ellipse cx="100" cy="210" rx="54" ry="7" fill="rgba(20,24,58,.16)"/>
    <ellipse cx="76" cy="198" rx="17" ry="10" fill="${dark}"/><ellipse cx="124" cy="198" rx="17" ry="10" fill="${dark}"/>
    <rect x="42" y="52" width="116" height="148" rx="58" fill="${main}"/>
    <ellipse cx="100" cy="163" rx="36" ry="28" fill="${light}" opacity=".55"/>
    <path d="M62 86 Q66 70 82 66" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".4"/>
    ${arms}
    <circle cx="79" cy="110" r="15" fill="#fff"/><circle cx="121" cy="110" r="15" fill="#fff"/>
    <circle cx="81" cy="112" r="8.5" fill="${INK}"/><circle cx="123" cy="112" r="8.5" fill="${INK}"/>
    <circle cx="84.5" cy="108.5" r="3" fill="#fff"/><circle cx="126.5" cy="108.5" r="3" fill="#fff"/>
    <ellipse cx="59" cy="134" rx="8" ry="5" fill="#ff7f9d" opacity=".55"/><ellipse cx="141" cy="134" rx="8" ry="5" fill="#ff7f9d" opacity=".55"/>
    <path d="M91 132 Q100 149 109 132 Z" fill="#6b1d3f"/><path d="M95 140 Q100 145 105 140 Q100 137 95 140Z" fill="#ff8fa8"/>
    ${accessories}`;
}

function Character({ charKey }) {
  return (
    <svg
      className="char"
      viewBox="0 0 200 220"
      role="img"
      aria-label={CHAR_NAME[charKey]}
      dangerouslySetInnerHTML={{ __html: characterSVGString(charKey) }}
    />
  );
}

function marbleInnerString(v) {
  const c = TONES[v];
  const eye = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="3.7" fill="${INK}"/><circle cx="${x + 1.3}" cy="${y - 1.5}" r="1.35" fill="#fff"/>`;
  const st = `fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"`;
  const blush = `<ellipse cx="12" cy="35" rx="4.4" ry="2.7" fill="#ff6f95" opacity=".6"/><ellipse cx="44" cy="35" rx="4.4" ry="2.7" fill="#ff6f95" opacity=".6"/>`;
  const faces = {
    1: `<path d="M14 22 L24 27 L14 32" ${st}/><path d="M42 22 L32 27 L42 32" ${st}/><path d="M22 43 Q25 39 28 43 Q31 39 34 43" ${st}/><path d="M40 9 l6 6 M46 9 l-6 6" stroke="#c81e45" stroke-width="2.6" stroke-linecap="round"/>`,
    2: `<path d="M13 22 L22 19 M43 22 L34 19" ${st} stroke-width="2.4"/>${eye(19, 28)}${eye(37, 28)}<path d="M23 42 Q28 37 33 42" ${st}/><path d="M16 35 q-2.6 3.8 0 5.6 q2.6 -1.8 0 -5.6z" fill="#8fd8ff" stroke="${INK}" stroke-width="1.2"/>`,
    3: `${eye(19, 27)}${eye(37, 27)}<path d="M24 40 H32" ${st}/><path d="M45 12 q-3 4.5 0 6.8 q3 -2.3 0 -6.8z" fill="#bfe6ff" stroke="${INK}" stroke-width="1.2"/>`,
    4: `${eye(19, 27)}${eye(37, 27)}<path d="M21 37 Q28 45 35 37" ${st}/>`,
    5: `<path d="M14 29 Q19 21 24 29 M32 29 Q37 21 42 29" ${st}/><path d="M19 36 Q28 52 37 36Z" fill="${INK}"/><path d="M24 43 Q28 47 32 43 Q28 40.5 24 43Z" fill="#ff8fa8"/><path d="M8 11 l1.7 3.6 3.6 1.7 -3.6 1.7 -1.7 3.6 -1.7 -3.6 -3.6 -1.7 3.6 -1.7z" fill="#fff"/><path d="M47 9 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2z" fill="#ffd23f"/>`
  };
  return `<circle cx="28" cy="28" r="26" fill="${c}"/><path d="M12 16 Q16 9 24 8" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/>${blush}${faces[v]}`;
}

function MarbleFace({ value }) {
  return (
    <svg
      viewBox="0 0 56 56"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: marbleInnerString(value) }}
    />
  );
}

function stepOf(code) {
  if (code === 'Q1') return 0;
  if (code === 'submit') return QUESTION_GROUPS.length;
  return 1 + QUESTION_GROUPS.findIndex((g) => g.questions.some((q) => q.code === code));
}

function App() {
  const [view, setView] = useState('welcome');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [viewKey, setViewKey] = useState(null);
  const [hotMini, setHotMini] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [coinPop, setCoinPop] = useState(false);
  const [bubbleBump, setBubbleBump] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toastTimerRef = useRef(null);
  const prevDoneRef = useRef(0);
  const prevBubbleRef = useRef('');

  const isAnswered = (code, ansObj = answers) => {
    const v = ansObj[code];
    return code === 'Q1' ? Boolean(v) : typeof v === 'number';
  };

  const doneCount = FLOW.filter((q) => isAnswered(q.code)).length;
  const leftCount = TOTAL - doneCount;
  const pct = Math.round((doneCount / TOTAL) * 100);

  const bubbleMsg =
    doneCount === 0
      ? 'Yuk mulai dari prodi kamu!'
      : doneCount === TOTAL
      ? 'Yeay, tinggal kirim!'
      : pct >= 50
      ? 'Setengah jalan, keren!'
      : 'Semangat, lanjut terus!';

  useEffect(() => {
    if (view === 'form' && doneCount !== prevDoneRef.current) {
      prevDoneRef.current = doneCount;
      setCoinPop(false);
      const t = setTimeout(() => setCoinPop(true), 10);
      return () => clearTimeout(t);
    }
  }, [doneCount, view]);

  useEffect(() => {
    if (view === 'form' && bubbleMsg !== prevBubbleRef.current) {
      prevBubbleRef.current = bubbleMsg;
      setBubbleBump(false);
      const t = setTimeout(() => setBubbleBump(true), 10);
      return () => clearTimeout(t);
    }
  }, [bubbleMsg, view]);

  // Efek animasi teks pesan saat layar loading aktif
  useEffect(() => {
    if (view !== 'loading') return;
    setLoadingIdx(0);
    const iv = setInterval(() => {
      setLoadingIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 800);
    return () => clearInterval(iv);
  }, [view]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2400);
  };

  const scrollToCard = (code, currentStep = step) => {
    const targetStep = stepOf(code);
    if (targetStep !== currentStep) {
      setStep(targetStep);
      setTimeout(() => {
        const el = document.getElementById(code === 'submit' ? 'submit-card' : 'card-' + code);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    } else {
      const el = document.getElementById(code === 'submit' ? 'submit-card' : 'card-' + code);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePickAnswer = (code, val) => {
    const wasAnswered = isAnswered(code);
    setAnswers((prev) => ({ ...prev, [code]: val }));
    setErrors((prev) => {
      if (!prev[code]) return prev;
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });

    if (!wasAnswered) {
      const i = FLOW.findIndex((q) => q.code === code);
      const nxt = FLOW[i + 1];
      setTimeout(() => {
        if (nxt && stepOf(nxt.code) === step) {
          scrollToCard(nxt.code, step);
        } else {
          const n = document.querySelector('.stepnav, #submit-card');
          if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 380);
    }
  };

  const handleNextStep = () => {
    const un = FLOW.filter((q) => stepOf(q.code) === step && !isAnswered(q.code));
    if (un.length > 0) {
      setErrors((prev) => {
        const nextErr = { ...prev };
        un.forEach((q) => {
          nextErr[q.code] = true;
        });
        return nextErr;
      });
      showToast(`Masih ada ${un.length} pertanyaan belum dijawab`);
      scrollToCard(un[0].code, step);
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const handleSubmitForm = async () => {
    const un = FLOW.filter((q) => !isAnswered(q.code));
    if (un.length > 0) {
      const nextErr = {};
      un.forEach((q) => {
        nextErr[q.code] = true;
      });
      setErrors(nextErr);
      showToast(`Masih ada ${un.length} pertanyaan belum dijawab`);
      scrollToCard(un[0].code, step);
      return;
    }

    // Persiapan payload data jawaban Q1 - Q31 untuk endpoint backend /predict
    const payload = {
      Q1: answers.Q1,
      ...Object.fromEntries(
        Array.from({ length: 30 }, (_, i) => [
          `Q${i + 2}`,
          Number(answers[`Q${i + 2}`])
        ])
      )
    };

    setIsSubmitting(true);
    setApiError(null);
    setView('loading');
    window.scrollTo({ top: 0 });

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server merespons kode status ${response.status}`);
      }

      // Format peringkat karir dari respons model Machine Learning
      const ranked = (data.probabilities || []).map((item) => ({
        key: item.key,
        career_field: item.career_field,
        pct: item.percentage
      }));

      // Ringkasan skor per kelompok kategori pertanyaan (untuk ringcards)
      const groups = QUESTION_GROUPS.map((g) => {
        const vals = g.questions.map((q) => answers[q.code]);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        const pct = Math.round(((avg - 1) / 4) * 100);
        return { g, avg, pct };
      });

      // Selalu gunakan peringkat #1 (persentase tertinggi) sebagai tampilan awal hasil
      const topKey = (ranked.length > 0 ? ranked[0].key : data.prediction_key) || 'ds';

      setResult({
        ranked,
        groups,
        prediction: data.prediction,
        prediction_key: topKey,
        probabilities: data.probabilities,
        input: data.input
      });
      setViewKey(topKey);

      // Transisi halus ke layar hasil setelah animasi loading
      setTimeout(() => {
        setView('result');
        window.scrollTo({ top: 0 });
        setIsSubmitting(false);
      }, 1200);

    } catch (err) {
      console.error('Prediction API Error:', err);
      setIsSubmitting(false);
      setView('form');
      const errorMsg = err.message || 'Gagal terhubung ke server backend (port 5000).';
      showToast(errorMsg);
      setApiError(errorMsg);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setErrors({});
    setResult(null);
    setApiError(null);
    setIsSubmitting(false);
    setStep(0);
    setView('welcome');
    window.scrollTo({ top: 0 });
  };

  const handleReset = () => {
    if (window.confirm('Kosongkan semua jawaban?')) {
      setAnswers({});
      setErrors({});
      setStep(0);
      window.scrollTo({ top: 0 });
    }
  };

  const dotColor = (code) => {
    if (!isAnswered(code)) return null;
    return code === 'Q1' ? '#3d63ff' : TONES[answers[code]];
  };

  const STEPS = 1 + QUESTION_GROUPS.length;
  const isLastStep = step === STEPS - 1;
  const loadingMessages = [
    'Kiko membaca jawabanmu…',
    'Menghitung kecocokan bidang…',
    'Hampir selesai, siap-siap ya!'
  ];

  return (
    <>
      <main
        id="app"
        className={`app ${view === 'result' ? 'is-wide' : ''}`}
        aria-live="polite"
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') return;
          const m = e.target.closest('.mini');
          if (!m) setHotMini(null);
        }}
      >
        {/* ================= VIEW 1: WELCOME ================= */}
        {view === 'welcome' && (
          <>
            <header className="hero hero--tall">
              <div className="topbar">
                <div className="brand">
                  <span className="brand__logo">
                    <Icon name="compass" size={22} />
                  </span>
                  <span>CareerPath</span>
                </div>
              </div>
              <div className="welcome__stage">
                <span className="float f1">
                  <Icon name="code" size={26} />
                </span>
                <span className="float f2">
                  <Icon name="pen" size={26} />
                </span>
                <span className="float f3">
                  <Icon name="shield" size={26} />
                </span>
                <span className="float f4">
                  <Icon name="chart" size={26} />
                </span>
                <div className="char-bob">
                  <Character charKey="guide" />
                </div>
              </div>
              <h1 className="welcome__title">
                Temukan karir teknologi yang paling cocok buat kamu!
              </h1>
              <p className="welcome__sub">
                Jawab 31 pernyataan singkat. Kiko akan membantu memetakan bidang karir yang selaras dengan prodi, kepribadian, dan minatmu.
              </p>
              <Wave />
            </header>
            <section className="sheet">
              <div className="facts">
                <span className="fact">
                  <Icon name="list" size={16} /> 31 pertanyaan
                </span>
                <span className="fact">
                  <Icon name="clock" size={16} /> ± 5 menit
                </span>
                <span className="fact">
                  <Icon name="heart" size={16} /> Tanpa jawaban salah
                </span>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--block btn--lg"
                onClick={() => {
                  setStep(0);
                  setView('form');
                  window.scrollTo({ top: 0 });
                }}
              >
                Mulai Petualangan <Icon name="fwd" size={20} />
              </button>
              <h2 className="sec-title">11 bidang karir</h2>
              <div className="carousel">
                {CAREER_ORDER.map((k) => (
                  <div
                    key={k}
                    className={`mini ${hotMini === k ? 'is-hot' : ''}`}
                    style={{ '--p1': CAREERS[k].p1, '--p2': CAREERS[k].p2 }}
                    onPointerDown={(e) => {
                      if (e.pointerType !== 'mouse') setHotMini(k);
                    }}
                  >
                    <div className="mini__art">
                      <Character charKey={k} />
                    </div>
                    <b>{CAREERS[k].short}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ================= VIEW 2: FORM ================= */}
        {view === 'form' && (
          <>
            <div className="stickybar">
              <div className="topbar">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Kembali"
                  onClick={() => {
                    if (step > 0) {
                      setStep((s) => s - 1);
                      window.scrollTo({ top: 0 });
                    } else {
                      setView('welcome');
                      window.scrollTo({ top: 0 });
                    }
                  }}
                >
                  <Icon name="back" size={22} />
                </button>
                <div className="topbar__center">
                  <small>
                    <span id="pcount">
                      {doneCount} dari {TOTAL} terjawab
                    </span>
                    <span id="ppct">{pct}%</span>
                  </small>
                  <div
                    className="pbar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={TOTAL}
                    aria-valuenow={doneCount}
                  >
                    <i id="pfill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className={`coin ${coinPop ? 'pop' : ''}`} id="coin">
                  <Icon name="star" size={18} fill="currentColor" />
                  <b id="coin-n">{doneCount}</b>
                </div>
              </div>
            </div>

            <header className="hero hero--form">
              <div className="hero__body">
                <div className="hero__text">
                  <span className="chip">Asesmen · {TOTAL} pernyataan</span>
                  <h1>Ceritakan dirimu, ya!</h1>
                  <div className={`bubble ${bubbleBump ? 'bump' : ''}`} id="bubble">
                    {bubbleMsg}
                  </div>
                </div>
                <div className="hero__mascot char-bob">
                  <Character charKey="guide" />
                </div>
              </div>
              <Wave />
            </header>

            <section className="sheet form">
              {step === 0 && (
                <article
                  className={`qcard ${isAnswered('Q1') ? 'is-done' : ''} ${
                    errors.Q1 && !isAnswered('Q1') ? 'is-err' : ''
                  }`}
                  id="card-Q1"
                  data-code="Q1"
                >
                  <div className="qhead">
                    <p className="qtext">Apa program studi kamu?</p>
                    <span
                      className={`qstate ${
                        isAnswered('Q1') ? 'ok' : errors.Q1 ? 'bad' : ''
                      }`}
                      id="state-Q1"
                    >
                      {isAnswered('Q1') ? (
                        <Icon name="check" size={14} />
                      ) : errors.Q1 ? (
                        'Belum dijawab'
                      ) : null}
                    </span>
                  </div>
                  <div className="tiles" role="radiogroup" aria-label="Program studi">
                    {PRODI_OPTIONS.map((p) => {
                      const on = answers.Q1 === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          className={`tile ${on ? 'is-on' : ''}`}
                          role="radio"
                          aria-checked={on}
                          onClick={() => handlePickAnswer('Q1', p.value)}
                          style={{
                            '--c': p.color,
                            '--tint': lighten(p.color, 0.86)
                          }}
                        >
                          <span className="tile__ico">
                            <Icon name={p.icon} size={26} />
                          </span>
                          <span className="tile__txt">
                            <b>{p.value}</b>
                            <span>{p.desc}</span>
                          </span>
                          <span className="tile__radio">
                            <Icon name="check" size={14} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              )}

              {QUESTION_GROUPS.map((g, gi) => {
                if (gi !== step - 1) return null;
                const sc = SCALES[g.scaleType];
                const groupAnsweredCount = g.questions.filter((q) =>
                  isAnswered(q.code)
                ).length;
                const groupDone = groupAnsweredCount === g.questions.length;

                return (
                  <section key={g.id} className="gsec" id={`group-${g.id}`}>
                    <div className="ghead" style={{ '--g1': g.g1, '--g2': g.g2 }}>
                      <div className="ghead__txt">
                        <span className="chip">
                          Bagian {gi + 1} dari {QUESTION_GROUPS.length}
                        </span>
                        <h2>{g.title}</h2>
                        <p>{g.subtitle}</p>
                        <span
                          className={`gpill ${groupDone ? 'is-done' : ''}`}
                          id={`gpill-${g.id}`}
                        >
                          {groupDone
                            ? 'Selesai ✓'
                            : `${groupAnsweredCount} / ${g.questions.length} terjawab`}
                        </span>
                      </div>
                      <div className="char-bob">
                        <Character charKey="guide" />
                      </div>
                    </div>

                    <div className="legend" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <div key={v}>
                          <span
                            className="marble mini"
                            style={{
                              '--c': TONES[v],
                              '--sh': darken(TONES[v], 0.22)
                            }}
                          >
                            <MarbleFace value={v} />
                          </span>
                          <small>{sc.labels[v - 1]}</small>
                        </div>
                      ))}
                    </div>

                    {g.questions.map((q) => {
                      const ans = isAnswered(q.code);
                      const err = Boolean(errors[q.code]) && !ans;
                      const val = answers[q.code];

                      return (
                        <article
                          key={q.code}
                          className={`qcard ${ans ? 'is-done' : ''} ${
                            err ? 'is-err' : ''
                          }`}
                          id={`card-${q.code}`}
                          data-code={q.code}
                        >
                          <div className="qhead">
                            <p className="qtext">{q.question}</p>
                            <span
                              className={`qstate ${ans ? 'ok' : err ? 'bad' : ''}`}
                              id={`state-${q.code}`}
                            >
                              {ans ? (
                                <Icon name="check" size={14} />
                              ) : err ? (
                                'Belum dijawab'
                              ) : null}
                            </span>
                          </div>

                          <div className="marbles" role="radiogroup">
                            {[1, 2, 3, 4, 5].map((v) => {
                              const on = val === v;
                              return (
                                <button
                                  key={v}
                                  type="button"
                                  className={`marble ${SIZES[v]} ${
                                    on ? 'is-on' : ''
                                  }`}
                                  role="radio"
                                  aria-checked={on}
                                  aria-label={sc.labels[v - 1]}
                                  onClick={() => handlePickAnswer(q.code, v)}
                                  style={{
                                    '--c': TONES[v],
                                    '--sh': darken(TONES[v], 0.22)
                                  }}
                                >
                                  <MarbleFace value={v} />
                                </button>
                              );
                            })}
                          </div>

                          <div className="poles">
                            <span>{sc.left}</span>
                            <span>{sc.right}</span>
                          </div>

                          <div className="picked" id={`picked-${q.code}`}>
                            {typeof val === 'number' ? (
                              <span
                                className="pill-picked"
                                style={{ '--c': TONES[val] }}
                              >
                                {sc.labels[val - 1]}
                              </span>
                            ) : (
                              <span className="pill-empty">
                                Ketuk salah satu wajah
                              </span>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </section>
                );
              })}

              <div className="stepnav">
                {step > 0 && (
                  <button
                    type="button"
                    className="btn btn--ghost btn--lg"
                    onClick={() => {
                      setStep((s) => s - 1);
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    <Icon name="back" size={20} /> Kembali
                  </button>
                )}
                {!isLastStep && (
                  <button
                    type="button"
                    className="btn btn--primary btn--lg"
                    onClick={handleNextStep}
                  >
                    Lanjut <Icon name="fwd" size={20} />
                  </button>
                )}
              </div>

              {isLastStep && (
                <section className="submit" id="submit-card">
                  <div className="submit__top">
                    <b id="sub-title">Jar jawabanmu</b>
                    <span id="sub-sum">
                      {leftCount === 0
                        ? 'Semua terjawab 🎉'
                        : `${doneCount} dari ${TOTAL} · ${leftCount} belum`}
                    </span>
                  </div>
                  <div className="jar__dots">
                    {FLOW.map((q, i) => {
                      const col = dotColor(q.code);
                      return (
                        <button
                          key={q.code}
                          type="button"
                          className={`dot ${col ? 'is-done' : ''}`}
                          style={col ? { '--c': col } : undefined}
                          aria-label={`Pergi ke pertanyaan ${i + 1}`}
                          onClick={() => scrollToCard(q.code, step)}
                        />
                      );
                    })}
                  </div>
                  <p className="jar__hint">
                    Setiap bulatan = satu jawaban. Ketuk untuk lompat ke pertanyaannya.
                  </p>
                  {apiError && (
                    <div style={{ background: '#fee2e2', border: '1px solid #f87171', borderRadius: '16px', padding: '12px 16px', color: '#991b1b', fontSize: '.85rem', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="info" size={18} />
                      <span>{apiError}</span>
                    </div>
                  )}
                  <div className="stack" style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn btn--primary btn--lg"
                      onClick={handleSubmitForm}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Memproses Prediksi ML...' : 'Lihat Hasil Analisis'}{' '}
                      <Icon name="fwd" size={20} />
                    </button>
                    {doneCount > 0 && (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        id="reset-btn"
                        onClick={handleReset}
                      >
                        Kosongkan Jawaban
                      </button>
                    )}
                  </div>
                </section>
              )}
            </section>
          </>
        )}

        {/* ================= VIEW 3: LOADING ================= */}
        {view === 'loading' && (
          <div className="loading">
            <div className="char-bob">
              <Character charKey="guide" />
            </div>
            <h2 id="lmsg">{loadingMessages[loadingIdx]}</h2>
            <div className="dots3">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}

        {/* ================= VIEW 4: RESULT ================= */}
        {view === 'result' && result && viewKey && (() => {
          const { ranked, groups } = result;
          const C = CAREERS[viewKey];
          const rank = ranked.findIndex((r) => r.key === viewKey);
          const matchPct = ranked[rank].pct;
          const isTop = rank === 0;
          const tint = lighten(C.color, 0.86);

          return (
            <>
              <header className="hero hero--tall">
                <div className="topbar">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Tinjau jawaban"
                    onClick={() => {
                      setStep(QUESTION_GROUPS.length);
                      setView('form');
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    <Icon name="back" size={22} />
                  </button>
                  <div className="topbar__center" style={{ textAlign: 'center' }}>
                    <span className="brand" style={{ justifyContent: 'center' }}>
                      Hasil Karirmu
                    </span>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Ulangi tes"
                    onClick={handleRetake}
                  >
                    <Icon name="refresh" size={20} />
                  </button>
                </div>
                <div className="rhero">
                  <div className="panel" style={{ '--p1': C.p1, '--p2': C.p2 }}>
                    <span className="ribbon">
                      {isTop ? 'Rekomendasi Utama' : `Peringkat #${rank + 1}`}
                    </span>
                    <Character charKey={viewKey} />
                  </div>
                  <div className="rhero__text">
                    <div className="rhero__eyebrow">
                      {isTop ? 'Karir yang paling cocok buatmu' : 'Kamu sedang melihat'}
                    </div>
                    <h1>{C.short}</h1>
                    <p className="sub">{C.tagline}</p>
                  </div>
                </div>
                <Wave />
              </header>

              <section className="sheet">
                <div className="nameblock">
                  <div className="pills">
                    <span className="pill pill--sun">
                      <Icon name="star" size={14} fill="currentColor" /> {matchPct}% cocok
                    </span>
                    <span className="pill">
                      <Icon name="compass" size={14} /> {answers.Q1}
                    </span>
                  </div>
                  <h2 className="cname">{C.name}</h2>
                  <div className="desc" style={{ '--tint': tint }}>
                    <b>Tentang bidang ini</b>
                    {C.desc}
                  </div>
                </div>

                <div className="simnote" style={{ background: '#eef4ff', borderColor: '#cddafe', color: '#1e3a8a' }}>
                  <Icon name="check" size={18} />
                  <span>
                    <strong>Prediksi Model Machine Learning.</strong> Rekomendasi bidang karir dihitung langsung oleh model klasifikasi Support Vector Machine (SVM) terlatih berdasarkan jawaban kuesionermu.
                  </span>
                </div>

                <div className="grid2">
                  <div className="box" style={{ '--c': C.color }}>
                    <h3>Kompetensi kunci</h3>
                    {C.comps.map((t, idx) => (
                      <div key={idx} className="check">
                        <b>
                          <Icon name="check" size={14} />
                        </b>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="box">
                    <h3>Ringkasan jawabanmu</h3>
                    {groups.map(({ g, avg, pct: p }) => {
                      const R = 26;
                      const L = 2 * Math.PI * R;
                      return (
                        <div key={g.id} className="ringcard">
                          <div className="ring">
                            <svg width="62" height="62" viewBox="0 0 62 62">
                              <circle
                                cx="31"
                                cy="31"
                                r={R}
                                fill="none"
                                stroke="#e8ecfb"
                                strokeWidth="9"
                              />
                              <circle
                                cx="31"
                                cy="31"
                                r={R}
                                fill="none"
                                stroke={g.g2}
                                strokeWidth="9"
                                strokeLinecap="round"
                                strokeDasharray={`${((L * p) / 100).toFixed(1)} ${L.toFixed(1)}`}
                              />
                            </svg>
                            <span>{p}%</span>
                          </div>
                          <div>
                            <b>{g.title}</b>
                            <small>
                              Rata-rata {avg.toFixed(2)} / 5.00 · {g.questions.length} pernyataan
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h2 className="sec-title">Saran pengembangan diri</h2>
                <div className="row3">
                  {C.advice.map((t, i) => (
                    <div
                      key={i}
                      className="step"
                      style={{ '--c': C.color, '--tint': tint }}
                    >
                      <i>{i + 1}</i>
                      <p>{t}</p>
                    </div>
                  ))}
                </div>

                <h2 className="sec-title">Peran profesi terkait</h2>
                <div className="row3">
                  {C.roles.map(([t, d]) => (
                    <div key={t} className="role" style={{ '--c': C.color }}>
                      <b>{t}</b>
                      <p>{d}</p>
                    </div>
                  ))}
                </div>

                <h2 className="sec-title">Peringkat kesesuaian karir lainnya</h2>
                <div className="carousel">
                  {ranked.map((r, idx) => {
                    const k = r.key;
                    if (!CAREERS[k]) return null;
                    const isSelected = viewKey === k;
                    return (
                      <div
                        key={k}
                        className={`mini ${isSelected ? 'is-hot' : ''}`}
                        style={{ '--p1': CAREERS[k].p1, '--p2': CAREERS[k].p2 }}
                        onClick={() => {
                          setViewKey(k);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="mini__art">
                          <Character charKey={k} />
                        </div>
                        <b>{CAREERS[k].short}</b>
                        <small
                          style={{
                            display: 'block',
                            fontSize: '.75rem',
                            fontWeight: 700,
                            color: isSelected ? '#fff' : '#4b5563',
                            marginTop: '4px'
                          }}
                        >
                          #{idx + 1} · {r.pct}%
                        </small>
                      </div>
                    );
                  })}
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => {
                      setStep(QUESTION_GROUPS.length);
                      setView('form');
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    Tinjau Jawaban
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleRetake}
                  >
                    <Icon name="refresh" size={18} /> Ulangi Tes dari Awal
                  </button>
                </div>
              </section>
            </>
          );
        })()}
      </main>

      <div id="toast" className={`toast ${toastVisible ? 'show' : ''}`} role="status">
        {toastMsg}
      </div>
    </>
  );
}

export default App;
