import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// ตรวจสอบการกำหนดฟอนต์
pdfMake.vfs = {
  ...pdfFonts.pdfMake.vfs,
  'fonts/NotoSansThai-Regular.ttf': require('./fonts/NotoSansThai-Regular.ttf'),
  'fonts/NotoSansThai-Bold.ttf': require('./fonts/NotoSansThai-Bold.ttf'),
  'fonts/NotoSansThai-Italic.ttf': require('./fonts/NotoSansThai-Italic.ttf'),
  'fonts/NotoSansThai-BoldItalic.ttf': require('./fonts/NotoSansThai-BoldItalic.ttf')
};

pdfMake.fonts = {
  NotoSansThai: {
    normal: 'fonts/NotoSansThai-Regular.ttf',
    bold: 'fonts/NotoSansThai-Bold.ttf',
    italics: 'fonts/NotoSansThai-Italic.ttf',
    bolditalics: 'fonts/NotoSansThai-BoldItalic.ttf'
  }
};

export default pdfMake;
