export interface JapanesePatternInfo {
  id: 'seigaiha' | 'asanoha' | 'shippo' | 'yagasuri' | 'kikko' | 'custom' | 'none';
  name: string;
  japanese: string;
  meaning: string;
  backgroundSize: string;
}

export const JAPANESE_PATTERNS: JapanesePatternInfo[] = [
  {
    id: 'seigaiha',
    name: 'Sóng Biển Seigaiha',
    japanese: '青海波',
    meaning: 'Biểu tượng sóng đại dương bình yên, may mắn & thịnh vượng lâu dài',
    backgroundSize: '56px 28px',
  },
  {
    id: 'asanoha',
    name: 'Lá Gai Asanoha',
    japanese: '麻の葉',
    meaning: 'Hoa văn ngôi sao lục giác truyền thống, tượng trưng cho sức sống mạnh mẽ',
    backgroundSize: '44px 76px',
  },
  {
    id: 'shippo',
    name: 'Thất Bảo Shippo',
    japanese: '七宝',
    meaning: 'Vòng tròn đan xen vô tận, biểu trưng cho sự hòa hợp và gắn kết viên mãn',
    backgroundSize: '48px 48px',
  },
  {
    id: 'yagasuri',
    name: 'Cánh Cung Yagasuri',
    japanese: '矢絣',
    meaning: 'Họa tiết đuôi mũi tên cổ điển thời Edo, mang ý nghĩa quyết tâm và may mắn',
    backgroundSize: '40px 40px',
  },
  {
    id: 'kikko',
    name: 'Mai Rùa Kikko',
    japanese: '亀甲',
    meaning: 'Lục giác trường thọ Nhật Bản, tôn vinh sự bền vững và nghệ thuật thủ công',
    backgroundSize: '36px 62px',
  },
  {
    id: 'custom',
    name: 'Ảnh Nền Tùy Chỉnh (CDN)',
    japanese: 'カスタム背景',
    meaning: 'Sử dụng hình ảnh tải lên Cloudinary CDN hoặc link ảnh bất kỳ của nhà hàng',
    backgroundSize: 'cover',
  },
  {
    id: 'none',
    name: 'Nền Trơn Tối Giản',
    japanese: '無地',
    meaning: 'Chỉ sử dụng màu nền đơn sắc tối giản hiện đại',
    backgroundSize: 'auto',
  },
];

export const FOOTER_COLOR_PRESETS = [
  { id: '#0b0e14', name: 'Đen Than Sumi (Mặc định)', hex: '#0b0e14' },
  { id: '#0c2340', name: 'Xanh Đại Dương Ai-iro', hex: '#0c2340' },
  { id: '#3b0d14', name: 'Đỏ Rượu Sơn Mài Urushi', hex: '#3b0d14' },
  { id: '#2b1b12', name: 'Nâu Gỗ Tuyết Tùng Hinoki', hex: '#2b1b12' },
  { id: '#0d2922', name: 'Xanh Trà Đạo Matcha Trầm', hex: '#0d2922' },
  { id: '#241434', name: 'Tím Hoàng Gia Edo-Murasaki', hex: '#241434' },
];

export function getJapanesePatternDataUri(
  preset?: string,
  strokeOpacity = 0.16,
  strokeHex = '#d4a853',
): { backgroundImage?: string; backgroundSize?: string } {
  const alpha = Math.min(0.65, Math.max(0.03, strokeOpacity));
  const color = strokeHex;

  switch (preset) {
    case 'seigaiha': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="28" viewBox="0 0 56 28">
        <g fill="none" stroke="${color}" stroke-opacity="${alpha}" stroke-width="1">
          <circle cx="28" cy="28" r="26"/>
          <circle cx="28" cy="28" r="20"/>
          <circle cx="28" cy="28" r="14"/>
          <circle cx="28" cy="28" r="8"/>
          <circle cx="0" cy="14" r="26"/>
          <circle cx="0" cy="14" r="20"/>
          <circle cx="0" cy="14" r="14"/>
          <circle cx="0" cy="14" r="8"/>
          <circle cx="56" cy="14" r="26"/>
          <circle cx="56" cy="14" r="20"/>
          <circle cx="56" cy="14" r="14"/>
          <circle cx="56" cy="14" r="8"/>
          <circle cx="28" cy="0" r="26"/>
          <circle cx="28" cy="0" r="20"/>
          <circle cx="28" cy="0" r="14"/>
          <circle cx="28" cy="0" r="8"/>
        </g>
      </svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`,
        backgroundSize: '56px 28px',
      };
    }

    case 'asanoha': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="76" viewBox="0 0 44 76">
        <g fill="none" stroke="${color}" stroke-opacity="${alpha}" stroke-width="0.9">
          <path d="M22 0 L44 12.7 L44 38 L22 50.7 L0 38 L0 12.7 Z"/>
          <path d="M22 0 L22 50.7 M0 12.7 L44 38 M44 12.7 L0 38"/>
          <path d="M22 25.3 L44 12.7 M22 25.3 L44 38 M22 25.3 L0 12.7 M22 25.3 L0 38"/>
          <path d="M0 38 L22 50.7 L22 76 M44 38 L22 50.7 M22 50.7 L44 63.3 M22 50.7 L0 63.3"/>
          <path d="M0 63.3 L22 76 L44 63.3"/>
        </g>
      </svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`,
        backgroundSize: '44px 76px',
      };
    }

    case 'shippo': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <g fill="none" stroke="${color}" stroke-opacity="${alpha}" stroke-width="1">
          <circle cx="24" cy="24" r="24"/>
          <circle cx="0" cy="0" r="24"/>
          <circle cx="48" cy="0" r="24"/>
          <circle cx="0" cy="48" r="24"/>
          <circle cx="48" cy="48" r="24"/>
        </g>
      </svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`,
        backgroundSize: '48px 48px',
      };
    }

    case 'yagasuri': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <g fill="none" stroke="${color}" stroke-opacity="${alpha}" stroke-width="1">
          <path d="M0 10 L10 0 L20 10 L20 30 L10 20 L0 30 Z"/>
          <path d="M20 20 L30 30 L40 20 L40 40 L30 50 L20 40 Z"/>
          <path d="M20 0 L30 10 L40 0 M10 0 L10 40 M30 0 L30 40"/>
        </g>
      </svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`,
        backgroundSize: '40px 40px',
      };
    }

    case 'kikko': {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="62" viewBox="0 0 36 62">
        <g fill="none" stroke="${color}" stroke-opacity="${alpha}" stroke-width="0.9">
          <path d="M18 2 L34 11.5 L34 30.5 L18 40 L2 30.5 L2 11.5 Z"/>
          <path d="M18 7 L29.5 14 L29.5 28 L18 35 L6.5 28 L6.5 14 Z"/>
          <path d="M0 33 L16 42.5 L16 61.5 M36 33 L20 42.5 L20 61.5"/>
        </g>
      </svg>`;
      return {
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`,
        backgroundSize: '36px 62px',
      };
    }

    default:
      return {};
  }
}
