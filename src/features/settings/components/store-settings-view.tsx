'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Form,
  Input,
  Switch,
  Button,
  SushiButton,
  App,
  Storefront,
  CheckCircle,
  WarningCircle,
  Trash,
  ResponsiveModalDrawer,
  Tabs,
} from '@/components/ui';
import {
  PhoneCall,
  FloppyDisk,
  Images,
  Plus,
  UploadSimple,
  Spinner,
  ArrowCounterClockwise,
  LinkSimple,
  PencilSimple,
  SquaresFour,
  Newspaper,
  BookOpenText,
  Palette,
  DotsSixVertical,
} from '@phosphor-icons/react';
import { useStoreConfig, useUpdateStoreConfig } from '../hooks/use-settings';
import {
  HeroBannerItem,
  CuratedCategoryItem,
  CulinaryNewsItem,
  BrandStoryConfig,
  FooterConfig,
} from '../types';
import {
  JAPANESE_PATTERNS,
  FOOTER_COLOR_PRESETS,
  getJapanesePatternDataUri,
} from '../utils/japanese-patterns';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { useTranslation } from '@/lib/i18n';

const VIETNAM_PHONE_REGEX =
  /^(0|\+84)[35789]\d{8}$|^1[89]00\d{4,6}$|^(02\d{1,2})\d{7,8}$/;

const DEFAULT_HERO_BANNERS: HeroBannerItem[] = [
  {
    id: 'authentic-sushi',
    imageUrl:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Hương vị tinh tế của',
    highlightTitle: 'Ẩm thực Sushi Nhật Bản',
    description:
      'Thưởng thức nghệ thuật sushi tươi ngon từ nguồn hải sản cao cấp nhập khẩu chính gốc. Trải nghiệm chất lượng và tinh hoa ẩm thực truyền thống xứ sở Phù Tang.',
    kanjiWatermark: '伝統 江戸 寿司',
    isActive: true,
  },
  {
    id: 'premium-sashimi',
    imageUrl:
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Tuyệt tác tươi ngon từ',
    highlightTitle: 'Sashimi Hải Sản Thượng Hạng',
    description:
      'Cá hồi Na Uy béo ngậy, cá ngừ đại dương và sò điệp Hokkaido được tuyển chọn mới mỗi ngày, cắt lát tinh tế giữ trọn vị ngọt nguyên bản từ đại dương.',
    kanjiWatermark: '新鮮 極上 刺身',
    isActive: true,
  },
  {
    id: 'artisan-nigiri',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Tâm huyết nghệ nhân trong',
    highlightTitle: 'Từng Tuyệt Phẩm Nigiri',
    description:
      'Sự kết hợp hài hòa giữa hạt gạo Nhật dẻo thơm trộn giấm ủ truyền thống cùng kỹ nghệ nắm sushi chuẩn mực của các đầu bếp lành nghề.',
    kanjiWatermark: '職人 匠技 握り',
    isActive: true,
  },
  {
    id: 'signature-combo',
    imageUrl:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=1920&q=85',
    leadTitle: 'Trọn vẹn bữa tiệc cùng',
    highlightTitle: 'Khay Combo Tươi Lạnh Tận Nơi',
    description:
      'Bài trí cân đối theo triết lý ngũ sắc Nhật Bản, đóng hộp giữ lạnh chuyên dụng giúp mỗi phần ăn giao đến tay bạn luôn tươi ngon như thưởng thức tại quầy.',
    kanjiWatermark: '彩り 特選 盛合',
    isActive: true,
  },
];

const DEFAULT_CURATED_CATEGORIES: CuratedCategoryItem[] = [
  {
    id: 'sashimi',
    title: 'SASHIMI',
    japanese: '刺身',
    desc: 'Cá hồi Na Uy, cá ngừ đại dương và sò điệp tươi ngon chuẩn lát cắt tinh tế.',
    imageUrl:
      'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'sashimi',
    isActive: true,
  },
  {
    id: 'sushi',
    title: 'SUSHI NIGIRI',
    japanese: '握り寿司',
    desc: 'Hạt cơm dẻo hòa quyện giấm ủ kết hợp tinh tế cùng hải sản tươi cao cấp.',
    imageUrl:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'nigiri',
    isActive: true,
  },
  {
    id: 'combo',
    title: 'SET COMBO & ROLL',
    japanese: '盛り合わせ',
    desc: 'Hộp sushi cuộn Maki và Nigiri phong phú, lựa chọn trọn vẹn cho bữa ăn tiện lợi.',
    imageUrl:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'roll',
    isActive: true,
  },
  {
    id: 'grilled',
    title: 'MÓN NƯỚNG & KHAI VỊ',
    japanese: '焼き物・前菜',
    desc: 'Lươn nướng sốt Kabayaki óng ánh, cá hồi áp chảo cùng các món khai vị hấp dẫn.',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'entrée',
    isActive: true,
  },
  {
    id: 'rice-noodle',
    title: 'CƠM & MÌ NHẬT',
    japanese: '丼・麺類',
    desc: 'Cơm bát Donburi ấm nóng, mì Udon cùng Ramen nước dùng hầm thanh ngọt tự nhiên.',
    imageUrl:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'cơm',
    isActive: true,
  },
  {
    id: 'dessert',
    title: 'ĐỒ UỐNG & TRÁNG MIỆNG',
    japanese: '甘味・お飲み物',
    desc: 'Trà xanh gạo rang Genmaicha, kem Matcha Hokkaido cùng bánh Mochi thanh ngọt.',
    imageUrl:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    targetCategory: 'uống',
    isActive: true,
  },
];

const DEFAULT_CULINARY_NEWS: CulinaryNewsItem[] = [
  {
    id: '1',
    title: 'Bí mật vị Umami: Chìa khoá tạo nên hương vị sushi trọn vẹn',
    date: '16.10.2026',
    tag: 'Văn hoá ẩm thực',
    imageUrl:
      'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    summary:
      'Khám phá sự phối hợp tinh tế giữa tảo bẹ Kombu, cá ngừ bào Katsuobushi và nước tương lên men truyền thống.',
    isActive: true,
  },
  {
    id: '2',
    title: 'Sanma & Cá thu dao Nhật Bản: Tinh hoa hải sản mùa thu',
    date: '17.09.2026',
    tag: 'Mùa nguyên liệu',
    imageUrl:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    summary:
      'Mùa cá béo nhất trong năm được tuyển chọn trực tiếp và phục vụ trong các set sashimi đặc biệt của tháng.',
    isActive: true,
  },
  {
    id: '3',
    title: 'Ưu đãi đặt trước Take Away: Tiết kiệm 15% cho đơn hàng online',
    date: '14.08.2026',
    tag: 'Khuyến mãi',
    imageUrl:
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=800&q=80',
    summary:
      'Đặt trước tiện lợi trên website, không chờ đợi tại quầy và nhận ngay ưu đãi đặc quyền cho thành viên.',
    isActive: true,
  },
];

const DEFAULT_BRAND_STORY: BrandStoryConfig = {
  cardBadge: 'TRIẾT LÝ ẨM THỰC • 料理哲学',
  cardTitle: 'Hương vị chuẩn Nhật từ nguyên liệu tươi sống chọn lọc',
  cardQuote: '“Trải nghiệm trọn vẹn chất lượng Nhật Bản cùng Hanbi Sushi.”',
  cardSignature: 'HANBI SUSHI • ARTISAN CRAFT',
  cardKanji: '匠',
  storyLabel: 'CHUYỆN NGHỀ & TÂM HUYẾT',
  storyHeading: 'Gìn giữ trọn vẹn tinh hoa ẩm thực truyền thống Nhật Bản',
  storyParagraph1:
    'Với mong muốn mang văn hoá sushi đích thực đến gần hơn với thực khách Việt, Hanbi Sushi chăm chút từ những hạt cơm dẻo vị giấm lên men thanh tao đến từng lát cá hồi, cá ngừ tươi được sơ chế chuẩn kỹ thuật sashimi mỗi ngày.',
  storyParagraph2:
    'Mỗi phần sushi mang về (Take Away) đều tuân theo quy trình đóng hộp lạnh khép kín, giữ trọn độ tươi ngon và kết cấu chuẩn vị như thưởng thức tại quầy nghệ nhân.',
  pillars: [
    {
      title: 'Nguyên vật liệu hải sản tươi sống cao cấp',
      description:
        'Cá hồi Na Uy, cá ngừ đại dương nhập mới hàng ngày, gạo Nhật dẻo thơm hòa quyện cùng giấm ủ truyền thống.',
    },
    {
      title: 'Bảo quản chuẩn nhiệt độ cho đơn Take Away',
      description:
        'Quy trình giữ lạnh chuyên dụng và khay hộp chuyên biệt bảo vệ cấu trúc hạt cơm cùng độ béo ngọt của cá.',
    },
    {
      title: 'Trải nghiệm vị giác hài hòa theo triết lý Nhật',
      description:
        'Mỗi hộp sushi bài trí cân đối theo triết lý ngũ sắc, đem lại bữa ăn tinh tế, dinh dưỡng và ngon miệng.',
    },
  ],
  craftTiles: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80',
      caption: 'Khay Maki Roll tổng hợp',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80',
      caption: 'Set Nigiri hải sản đá đen',
    },
  ],
};

const DEFAULT_FOOTER_CONFIG: Required<FooterConfig> = {
  patternPreset: 'seigaiha',
  customBgImageUrl: '',
  bgColor: '#0b0e14',
  overlayOpacity: 82,
  patternOpacity: 16,
  brandDescription:
    'Hệ thống sushi tươi ngon chuẩn vị Nhật Bản. Đặt trực tuyến, đóng hộp giữ lạnh chuyên dụng và giao hàng tận nơi nhanh chóng tại TP.HCM.',
  openingDays: 'Thứ Hai - Chủ Nhật',
  openingHours: '10:00 - 22:00 hàng ngày',
  closingNote: '(Nhận đơn giao hàng đến 21:30)',
  addressNote: 'Giao hàng tận nơi tại các chi nhánh khu vực TP. Hồ Chí Minh',
  copyrightText: '© 2026 HANBI SUSHI Platform. All rights reserved.',
};

type BrandStoryBlockKey = 'card' | 'story' | 'pillars' | 'tiles';
type FooterBlockKey = 'background' | 'content';

type UploadTarget = {
  section: 'banner' | 'category' | 'news' | 'storyTile' | 'footerBg';
  id: string;
};

export function StoreSettingsView() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customBanners, setCustomBanners] = useState<HeroBannerItem[] | null>(
    null,
  );
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const [customBrandStory, setCustomBrandStory] =
    useState<BrandStoryConfig | null>(null);
  const [editingStoryBlock, setEditingStoryBlock] =
    useState<BrandStoryBlockKey | null>(null);

  const [customCategories, setCustomCategories] = useState<
    CuratedCategoryItem[] | null
  >(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const [customNews, setCustomNews] = useState<CulinaryNewsItem[] | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Drag and Drop state
  const [draggedBannerIdx, setDraggedBannerIdx] = useState<number | null>(null);
  const [dragOverBannerIdx, setDragOverBannerIdx] = useState<number | null>(null);

  const [draggedCatIdx, setDraggedCatIdx] = useState<number | null>(null);
  const [dragOverCatIdx, setDragOverCatIdx] = useState<number | null>(null);

  const [draggedNewsIdx, setDraggedNewsIdx] = useState<number | null>(null);
  const [dragOverNewsIdx, setDragOverNewsIdx] = useState<number | null>(null);

  const [customFooter, setCustomFooter] = useState<FooterConfig | null>(null);
  const [editingFooterBlock, setEditingFooterBlock] =
    useState<FooterBlockKey | null>(null);

  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(
    null,
  );
  const [targetUpload, setTargetUpload] = useState<UploadTarget | null>(null);

  const { data: config, isLoading } = useStoreConfig();
  const updateMutation = useUpdateStoreConfig();

  const banners: HeroBannerItem[] =
    customBanners !== null
      ? customBanners
      : Array.isArray(config?.heroBanners) && config.heroBanners.length > 0
        ? config.heroBanners
        : DEFAULT_HERO_BANNERS;

  const brandStory: BrandStoryConfig =
    customBrandStory !== null
      ? customBrandStory
      : config?.brandStory &&
          typeof config.brandStory === 'object' &&
          Array.isArray(config.brandStory.pillars)
        ? {
            ...DEFAULT_BRAND_STORY,
            ...config.brandStory,
            pillars:
              config.brandStory.pillars.length > 0
                ? config.brandStory.pillars
                : DEFAULT_BRAND_STORY.pillars,
            craftTiles:
              Array.isArray(config.brandStory.craftTiles) &&
              config.brandStory.craftTiles.length > 0
                ? config.brandStory.craftTiles
                : DEFAULT_BRAND_STORY.craftTiles,
          }
        : DEFAULT_BRAND_STORY;

  const categories: CuratedCategoryItem[] =
    customCategories !== null
      ? customCategories
      : Array.isArray(config?.curatedCategories) &&
          config.curatedCategories.length > 0
        ? config.curatedCategories
        : DEFAULT_CURATED_CATEGORIES;

  const newsList: CulinaryNewsItem[] =
    customNews !== null
      ? customNews
      : Array.isArray(config?.culinaryNews) && config.culinaryNews.length > 0
        ? config.culinaryNews
        : DEFAULT_CULINARY_NEWS;

  const footerConfig: Required<FooterConfig> =
    customFooter !== null
      ? { ...DEFAULT_FOOTER_CONFIG, ...customFooter }
      : config?.footerConfig && typeof config.footerConfig === 'object'
        ? {
            patternPreset:
              config.footerConfig.patternPreset ||
              DEFAULT_FOOTER_CONFIG.patternPreset,
            customBgImageUrl:
              config.footerConfig.customBgImageUrl ??
              DEFAULT_FOOTER_CONFIG.customBgImageUrl,
            bgColor:
              config.footerConfig.bgColor || DEFAULT_FOOTER_CONFIG.bgColor,
            overlayOpacity:
              typeof config.footerConfig.overlayOpacity === 'number'
                ? config.footerConfig.overlayOpacity
                : DEFAULT_FOOTER_CONFIG.overlayOpacity,
            patternOpacity:
              typeof config.footerConfig.patternOpacity === 'number'
                ? config.footerConfig.patternOpacity
                : DEFAULT_FOOTER_CONFIG.patternOpacity,
            brandDescription:
              config.footerConfig.brandDescription ||
              DEFAULT_FOOTER_CONFIG.brandDescription,
            openingDays:
              config.footerConfig.openingDays ||
              DEFAULT_FOOTER_CONFIG.openingDays,
            openingHours:
              config.footerConfig.openingHours ||
              DEFAULT_FOOTER_CONFIG.openingHours,
            closingNote:
              config.footerConfig.closingNote ||
              DEFAULT_FOOTER_CONFIG.closingNote,
            addressNote:
              config.footerConfig.addressNote ||
              DEFAULT_FOOTER_CONFIG.addressNote,
            copyrightText:
              config.footerConfig.copyrightText ||
              DEFAULT_FOOTER_CONFIG.copyrightText,
          }
        : DEFAULT_FOOTER_CONFIG;

  // Watch values for live preview
  const isOrderingEnabled = Form.useWatch('customerOrderingEnabled', form);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        customerOrderingEnabled: config.customerOrderingEnabled ?? true,
        contactPhone: config.contactPhone || '',
      });
    }
  }, [config, form]);

  // ================= HANDLERS: BANNER TRANG CHỦ =================
  const handleBannerChange = (
    id: string,
    field: keyof HeroBannerItem,
    value: string | boolean,
  ) => {
    setCustomBanners(
      banners.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddBanner = () => {
    if (banners.length >= 10) {
      message.warning('Tối đa 10 slide banner trên trang chủ!');
      return;
    }
    const newId = `banner-${Date.now()}`;
    setCustomBanners([
      ...banners,
      {
        id: newId,
        imageUrl: '',
        leadTitle: 'Khám phá hương vị mới',
        highlightTitle: 'Tinh Hoa Ẩm Thực Nhật Bản',
        description:
          'Thưởng thức các món sushi và sashimi tươi ngon được chế biến từ nguyên liệu tuyển chọn hàng ngày.',
        kanjiWatermark: '伝統 江戸 寿司',
        isActive: true,
      },
    ]);
    setEditingBannerId(newId);
  };

  const handleRemoveBanner = (id: string) => {
    setCustomBanners(banners.filter((item) => item.id !== id));
    if (editingBannerId === id) {
      setEditingBannerId(null);
    }
  };

  const handleReorderBanners = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...banners];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCustomBanners(next);
  };

  const handleRestoreDefaultBanners = () => {
    setCustomBanners(DEFAULT_HERO_BANNERS);
    message.info('Đã nạp bộ 4 Banner mặc định. Nhấn "Lưu cấu hình" để áp dụng!');
  };

  // ================= HANDLERS: TRIẾT LÝ & CÂU CHUYỆN THƯƠNG HIỆU =================
  const handleBrandStoryFieldChange = (
    field: keyof Omit<BrandStoryConfig, 'pillars' | 'craftTiles'>,
    value: string,
  ) => {
    setCustomBrandStory({
      ...brandStory,
      [field]: value,
    });
  };

  const handlePillarChange = (
    idx: number,
    field: 'title' | 'description',
    value: string,
  ) => {
    const nextPillars = [...brandStory.pillars];
    nextPillars[idx] = { ...nextPillars[idx], [field]: value };
    setCustomBrandStory({
      ...brandStory,
      pillars: nextPillars,
    });
  };

  const handleTileChange = (
    idx: number,
    field: 'imageUrl' | 'caption',
    value: string,
  ) => {
    const nextTiles = [...brandStory.craftTiles];
    nextTiles[idx] = { ...nextTiles[idx], [field]: value };
    setCustomBrandStory({
      ...brandStory,
      craftTiles: nextTiles,
    });
  };

  const handleRestoreDefaultBrandStory = () => {
    setCustomBrandStory(DEFAULT_BRAND_STORY);
    message.info(
      'Đã nạp nội dung Triết lý & Câu chuyện thương hiệu mặc định. Nhấn "Lưu cấu hình" để áp dụng!',
    );
  };

  // ================= HANDLERS: THỰC ĐƠN ĐẶC SẮC =================
  const handleCategoryChange = (
    id: string,
    field: keyof CuratedCategoryItem,
    value: string | boolean,
  ) => {
    setCustomCategories(
      categories.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddCategory = () => {
    if (categories.length >= 12) {
      message.warning('Tối đa 12 danh mục thực đơn đặc sắc trên trang chủ!');
      return;
    }
    const newId = `cat-${Date.now()}`;
    setCustomCategories([
      ...categories,
      {
        id: newId,
        title: 'DANH MỤC MỚI',
        japanese: '新メニュー',
        desc: 'Mô tả ngắn gọn về các món ăn nổi bật trong danh mục này.',
        imageUrl: '',
        targetCategory: '',
        isActive: true,
      },
    ]);
    setEditingCategoryId(newId);
  };

  const handleRemoveCategory = (id: string) => {
    setCustomCategories(categories.filter((item) => item.id !== id));
    if (editingCategoryId === id) {
      setEditingCategoryId(null);
    }
  };

  const handleReorderCategories = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...categories];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCustomCategories(next);
  };

  const handleRestoreDefaultCategories = () => {
    setCustomCategories(DEFAULT_CURATED_CATEGORIES);
    message.info(
      'Đã nạp bộ 6 Thực đơn đặc sắc mặc định. Nhấn "Lưu cấu hình" để áp dụng!',
    );
  };

  // ================= HANDLERS: TIN TỨC & KHUYẾN MÃI =================
  const handleNewsChange = (
    id: string,
    field: keyof CulinaryNewsItem,
    value: string | boolean,
  ) => {
    setCustomNews(
      newsList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddNews = () => {
    if (newsList.length >= 12) {
      message.warning('Tối đa 12 bài viết tin tức & khuyến mãi trên trang chủ!');
      return;
    }
    const newId = `news-${Date.now()}`;
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}.${today.getFullYear()}`;

    setCustomNews([
      ...newsList,
      {
        id: newId,
        title: 'Chương trình ưu đãi & ẩm thực mới',
        date: formattedDate,
        tag: 'Khuyến mãi',
        imageUrl: '',
        summary:
          'Chi tiết chương trình ưu đãi hấp dẫn dành cho thực khách đặt món trực tuyến tại Hanbi Sushi.',
        isActive: true,
      },
    ]);
    setEditingNewsId(newId);
  };

  const handleRemoveNews = (id: string) => {
    setCustomNews(newsList.filter((item) => item.id !== id));
    if (editingNewsId === id) {
      setEditingNewsId(null);
    }
  };

  const handleReorderNews = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...newsList];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCustomNews(next);
  };

  const handleRestoreDefaultNews = () => {
    setCustomNews(DEFAULT_CULINARY_NEWS);
    message.info(
      'Đã nạp bộ 3 bài Tin tức & Khuyến mãi mặc định. Nhấn "Lưu cấu hình" để áp dụng!',
    );
  };

  // ================= HANDLERS: MOBILE TOUCH / POINTER DRAG & DROP =================
  const startPointerDrag = (
    e: React.PointerEvent<HTMLDivElement>,
    listType: 'banner' | 'category' | 'news',
    startIndex: number,
  ) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();

    const handleEl = e.currentTarget;
    handleEl.setPointerCapture(e.pointerId);

    let currentIndex = startIndex;

    if (listType === 'banner') {
      setDraggedBannerIdx(startIndex);
      setDragOverBannerIdx(startIndex);
    } else if (listType === 'category') {
      setDraggedCatIdx(startIndex);
      setDragOverCatIdx(startIndex);
    } else {
      setDraggedNewsIdx(startIndex);
      setDragOverNewsIdx(startIndex);
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const targetEl = document.elementFromPoint(
        moveEvent.clientX,
        moveEvent.clientY,
      );
      const itemEl = targetEl?.closest(
        `[data-dnd-list="${listType}"]`,
      ) as HTMLElement | null;

      if (!itemEl) return;
      const hoverIndex = Number(itemEl.getAttribute('data-dnd-index'));
      if (Number.isNaN(hoverIndex) || hoverIndex === currentIndex) return;

      if (listType === 'banner') {
        setCustomBanners((prev) => {
          const list = [...(prev ?? banners)];
          const [moved] = list.splice(currentIndex, 1);
          list.splice(hoverIndex, 0, moved);
          return list;
        });
        setDraggedBannerIdx(hoverIndex);
        setDragOverBannerIdx(hoverIndex);
      } else if (listType === 'category') {
        setCustomCategories((prev) => {
          const list = [...(prev ?? categories)];
          const [moved] = list.splice(currentIndex, 1);
          list.splice(hoverIndex, 0, moved);
          return list;
        });
        setDraggedCatIdx(hoverIndex);
        setDragOverCatIdx(hoverIndex);
      } else {
        setCustomNews((prev) => {
          const list = [...(prev ?? newsList)];
          const [moved] = list.splice(currentIndex, 1);
          list.splice(hoverIndex, 0, moved);
          return list;
        });
        setDraggedNewsIdx(hoverIndex);
        setDragOverNewsIdx(hoverIndex);
      }

      currentIndex = hoverIndex;
    };

    const cleanup = () => {
      handleEl.removeEventListener('pointermove', handlePointerMove);
      handleEl.removeEventListener('pointerup', cleanup);
      handleEl.removeEventListener('pointercancel', cleanup);
      try {
        if (handleEl.hasPointerCapture(e.pointerId)) {
          handleEl.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore if already released
      }

      setDraggedBannerIdx(null);
      setDragOverBannerIdx(null);
      setDraggedCatIdx(null);
      setDragOverCatIdx(null);
      setDraggedNewsIdx(null);
      setDragOverNewsIdx(null);
    };

    handleEl.addEventListener('pointermove', handlePointerMove);
    handleEl.addEventListener('pointerup', cleanup);
    handleEl.addEventListener('pointercancel', cleanup);
  };

  // ================= HANDLERS: CHÂN TRANG (FOOTER & HOA VĂN NHẬT BẢN) =================
  const handleFooterFieldChange = <K extends keyof FooterConfig>(
    field: K,
    value: FooterConfig[K],
  ) => {
    setCustomFooter({
      ...footerConfig,
      [field]: value,
    });
  };

  const handleRestoreDefaultFooter = () => {
    setCustomFooter(DEFAULT_FOOTER_CONFIG);
    message.info(
      'Đã nạp cấu hình Chân trang & Hoa văn sóng biển Nhật Bản (Seigaiha) mặc định. Nhấn "Lưu cấu hình" để áp dụng!',
    );
  };

  // ================= HANDLERS: CLOUDINARY CDN UPLOAD DÙNG CHUNG =================
  const triggerUpload = (
    section: 'banner' | 'category' | 'news' | 'storyTile' | 'footerBg',
    id: string,
  ) => {
    setTargetUpload({ section, id });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = targetUpload;
    if (!file || !target) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Dung lượng ảnh tối đa cho phép là 5MB!');
      return;
    }

    try {
      setUploadingTarget(target);
      const res = await catalogApi.uploadImage(file);
      if (target.section === 'banner') {
        handleBannerChange(target.id, 'imageUrl', res.url);
      } else if (target.section === 'category') {
        handleCategoryChange(target.id, 'imageUrl', res.url);
      } else if (target.section === 'news') {
        handleNewsChange(target.id, 'imageUrl', res.url);
      } else if (target.section === 'storyTile') {
        const tileIndex = Number(target.id);
        if (!Number.isNaN(tileIndex)) {
          handleTileChange(tileIndex, 'imageUrl', res.url);
        }
      } else if (target.section === 'footerBg') {
        setCustomFooter({
          ...footerConfig,
          patternPreset: 'custom',
          customBgImageUrl: res.url,
        });
      }
      message.success('Đã tải ảnh lên Cloudinary CDN thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải ảnh lên CDN thất bại';
      message.error(msg);
    } finally {
      setUploadingTarget(null);
      setTargetUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (values: {
    customerOrderingEnabled: boolean;
    contactPhone: string;
  }) => {
    const invalidBanner = banners.find((b) => !b.imageUrl || !b.imageUrl.trim());
    if (invalidBanner) {
      setEditingBannerId(invalidBanner.id);
      message.error(
        'Vui lòng tải ảnh lên CDN hoặc nhập đường dẫn URL ảnh cho Slide Banner!',
      );
      return;
    }

    const invalidStoryTile = brandStory.craftTiles.find(
      (t) => !t.imageUrl?.trim() || !t.caption?.trim(),
    );
    if (invalidStoryTile) {
      setEditingStoryBlock('tiles');
      message.error(
        'Vui lòng cung cấp đủ 2 bức ảnh CDN và chú thích trong phần Câu chuyện thương hiệu!',
      );
      return;
    }

    const invalidCat = categories.find(
      (c) => !c.title?.trim() || !c.imageUrl?.trim(),
    );
    if (invalidCat) {
      setEditingCategoryId(invalidCat.id);
      message.error(
        'Vui lòng nhập đầy đủ Tên danh mục và Hình ảnh CDN cho mục Thực đơn đặc sắc!',
      );
      return;
    }

    const invalidNews = newsList.find(
      (n) => !n.title?.trim() || !n.imageUrl?.trim(),
    );
    if (invalidNews) {
      setEditingNewsId(invalidNews.id);
      message.error(
        'Vui lòng nhập đầy đủ Tiêu đề và Hình ảnh CDN cho bài Tin tức & Khuyến mãi!',
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        customerOrderingEnabled: values.customerOrderingEnabled,
        contactPhone: values.contactPhone?.trim(),
        heroBanners: banners.map((b) => ({
          ...b,
          imageUrl: b.imageUrl.trim(),
          leadTitle: b.leadTitle?.trim() || '',
          highlightTitle: b.highlightTitle?.trim() || '',
          description: b.description?.trim() || '',
          kanjiWatermark: b.kanjiWatermark?.trim() || '',
          isActive: b.isActive ?? true,
        })),
        brandStory: {
          cardBadge: brandStory.cardBadge?.trim() || '',
          cardTitle: brandStory.cardTitle?.trim() || '',
          cardQuote: brandStory.cardQuote?.trim() || '',
          cardSignature: brandStory.cardSignature?.trim() || '',
          cardKanji: brandStory.cardKanji?.trim() || '',
          storyLabel: brandStory.storyLabel?.trim() || '',
          storyHeading: brandStory.storyHeading?.trim() || '',
          storyParagraph1: brandStory.storyParagraph1?.trim() || '',
          storyParagraph2: brandStory.storyParagraph2?.trim() || '',
          pillars: brandStory.pillars.map((p) => ({
            title: p.title?.trim() || '',
            description: p.description?.trim() || '',
          })),
          craftTiles: brandStory.craftTiles.map((t) => ({
            imageUrl: t.imageUrl?.trim() || '',
            caption: t.caption?.trim() || '',
          })),
        },
        curatedCategories: categories.map((c) => ({
          ...c,
          title: c.title.trim(),
          japanese: c.japanese?.trim() || '',
          desc: c.desc?.trim() || '',
          imageUrl: c.imageUrl.trim(),
          targetCategory: c.targetCategory?.trim() || '',
          isActive: c.isActive ?? true,
        })),
        culinaryNews: newsList.map((n) => ({
          ...n,
          title: n.title.trim(),
          date: n.date?.trim() || '',
          tag: n.tag?.trim() || 'Tin tức',
          imageUrl: n.imageUrl.trim(),
          summary: n.summary?.trim() || '',
          isActive: n.isActive ?? true,
        })),
        footerConfig: {
          patternPreset: footerConfig.patternPreset?.trim() || 'seigaiha',
          customBgImageUrl: footerConfig.customBgImageUrl?.trim() || '',
          bgColor: footerConfig.bgColor?.trim() || '#0b0e14',
          overlayOpacity: footerConfig.overlayOpacity ?? 82,
          patternOpacity: footerConfig.patternOpacity ?? 16,
          brandDescription: footerConfig.brandDescription?.trim() || '',
          openingDays: footerConfig.openingDays?.trim() || '',
          openingHours: footerConfig.openingHours?.trim() || '',
          closingNote: footerConfig.closingNote?.trim() || '',
          addressNote: footerConfig.addressNote?.trim() || '',
          copyrightText: footerConfig.copyrightText?.trim() || '',
        },
      });
      message.success('Cập nhật cấu hình cửa hàng & Giao diện trang chủ thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại';
      message.error(msg);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        hidden
        aria-hidden="true"
        tabIndex={-1}
        style={{
          display: 'none',
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={isLoading}
        initialValues={{
          customerOrderingEnabled: true,
          contactPhone: '',
        }}
      >
        <div className="space-y-4">
          <Tabs
            defaultActiveKey="operations"
            items={[
              {
                key: 'operations',
                label: (
                  <span className="flex items-center gap-2 font-medium">
                    <Storefront size={16} />
                    <span>{t('storeSettingsPage.tabOperations')}</span>
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    {/* Card 1: Trạng thái đặt hàng Storefront */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
                        <div className="flex items-center gap-2">
                          <Storefront size={18} className="text-sushi-gold" />
                          <span className="font-semibold text-sm text-sushi-text">
                            {t('storeSettingsPage.storefrontSectionTitle')}
                          </span>
                        </div>

                        {isOrderingEnabled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            <CheckCircle size={13} weight="fill" />
                            {t('storeSettingsPage.statusReceiving')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                            <WarningCircle size={13} weight="fill" />
                            {t('storeSettingsPage.statusCallOnly')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-900/60 border border-sushi-border/60">
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="text-sm font-semibold text-sushi-text">
                            {t('storeSettingsPage.allowOnlineOrderingTitle')}
                          </div>
                          <p className="text-xs text-sushi-text-muted leading-relaxed">
                            {isOrderingEnabled
                              ? t('storeSettingsPage.allowOnlineOrderingOnDesc')
                              : t('storeSettingsPage.allowOnlineOrderingOffDesc')}
                          </p>
                        </div>

                        <Form.Item
                          name="customerOrderingEnabled"
                          valuePropName="checked"
                          className="mb-0 shrink-0"
                        >
                          <Switch
                            checkedChildren={t('paymentSettingsPage.switchOn')}
                            unCheckedChildren={t('paymentSettingsPage.switchOff')}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    {/* Card 2: Hotline nhận đơn */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between pb-3 border-b border-sushi-border/60">
                        <div className="flex items-center gap-2">
                          <PhoneCall size={18} className="text-sushi-gold" />
                          <span className="font-semibold text-sm text-sushi-text">
                            {t('storeSettingsPage.hotlineSectionTitle')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Form.Item
                          name="contactPhone"
                          label={
                            <span className="font-medium text-xs sm:text-sm text-sushi-text">
                              {t('storeSettingsPage.hotlineLabel')}
                            </span>
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng nhập số điện thoại hotline',
                            },
                            {
                              pattern: VIETNAM_PHONE_REGEX,
                              message:
                                'Số điện thoại không hợp lệ (hỗ trợ số di động 10 số, đầu số 1800/1900 hoặc số cố định)',
                            },
                          ]}
                          className="mb-1"
                        >
                          <Input
                            size="large"
                            placeholder={t('storeSettingsPage.hotlinePlaceholder')}
                            prefix={
                              <PhoneCall
                                size={18}
                                className="text-sushi-text-muted mr-1"
                              />
                            }
                            className="w-full sm:max-w-md h-11 rounded-xl bg-zinc-900/80 border-sushi-border text-sushi-text"
                          />
                        </Form.Item>
                        <p className="text-2xs sm:text-xs text-sushi-text-muted leading-relaxed">
                          {t('storeSettingsPage.hotlineHint')}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'homepage-cms',
                label: (
                  <span className="flex items-center gap-2 font-medium">
                    <Images size={16} />
                    <span>{t('storeSettingsPage.tabHomepageCms')}</span>
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-1">
                    {/* Card 3: Quản lý Banner Trang Chủ */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
                        <div className="flex items-start gap-2.5">
                          <Images
                            size={18}
                            className="text-sushi-gold shrink-0 mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-sm text-sushi-text block">
                              {t('storeSettingsPage.heroBannersTitle')}
                            </span>
                            <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                              {t('storeSettingsPage.heroBannersDesc')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            size="small"
                            onClick={handleRestoreDefaultBanners}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                          >
                            <ArrowCounterClockwise size={13} />
                            <span>{t('storeSettingsPage.restoreDefaultBtn')}</span>
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={handleAddBanner}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg text-2xs flex items-center gap-1"
                          >
                            <Plus size={13} weight="bold" />
                            <span>{t('storeSettingsPage.addSlideBtn')}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {banners.map((banner, index) => {
                          const isSlideActive = banner.isActive !== false;
                          const isEditingThis = editingBannerId === banner.id;
                          const isDragging = draggedBannerIdx === index;
                          const isDragOver = dragOverBannerIdx === index;

                          return (
                            <div
                              key={banner.id}
                              data-dnd-list="banner"
                              data-dnd-index={index}
                              draggable
                              onDragStart={(e) => {
                                setDraggedBannerIdx(index);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(index));
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverBannerIdx !== index) {
                                  setDragOverBannerIdx(index);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverBannerIdx === index) {
                                  setDragOverBannerIdx(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedBannerIdx !== null && draggedBannerIdx !== index) {
                                  handleReorderBanners(draggedBannerIdx, index);
                                }
                                setDraggedBannerIdx(null);
                                setDragOverBannerIdx(null);
                              }}
                              onDragEnd={() => {
                                setDraggedBannerIdx(null);
                                setDragOverBannerIdx(null);
                              }}
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isDragging
                                  ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/60 scale-[1.01] z-10 relative'
                                  : isDragOver
                                    ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/50'
                                    : isEditingThis
                                      ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                      : isSlideActive
                                        ? 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700'
                                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-65'
                              }`}
                            >
                              <div
                                onClick={() => setEditingBannerId(banner.id)}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                  {/* Tay nắm kéo thả (Hỗ trợ cả Touch Mobile & Mouse Desktop) */}
                                  <div
                                    title="Chạm giữ và kéo để thay đổi thứ tự hiển thị"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) =>
                                      startPointerDrag(e, 'banner', index)
                                    }
                                    style={{ touchAction: 'none' }}
                                    className="p-2 -ml-1.5 rounded-lg cursor-grab active:cursor-grabbing text-zinc-400 hover:text-sushi-gold active:text-sushi-gold hover:bg-white/5 active:bg-sushi-gold/15 transition-colors shrink-0 touch-none select-none"
                                  >
                                    <DotsSixVertical size={20} weight="bold" />
                                  </div>

                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                    Slide #{index + 1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center flex-wrap gap-1.5">
                                      <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1">
                                        {banner.highlightTitle ||
                                          'Chưa đặt tiêu đề'}
                                      </span>
                                      {!banner.imageUrl?.trim() && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                          Chưa có ảnh
                                        </span>
                                      )}
                                    </div>
                                    {banner.leadTitle && (
                                      <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                        {banner.leadTitle}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Switch
                                      size="small"
                                      checked={isSlideActive}
                                      onChange={(checked) =>
                                        handleBannerChange(
                                          banner.id,
                                          'isActive',
                                          checked,
                                        )
                                      }
                                      checkedChildren={t('storeSettingsPage.switchOn')}
                                      unCheckedChildren={t('storeSettingsPage.switchOff')}
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        setEditingBannerId(banner.id)
                                      }
                                      className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                    >
                                      <PencilSimple size={13} />
                                      <span>{t('storeSettingsPage.editBtn')}</span>
                                    </Button>
                                    {banners.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveBanner(banner.id)
                                        }
                                        title="Xóa slide này"
                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                      >
                                        <Trash size={15} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 3.5: Quản lý Triết Lý & Câu Chuyện Thương Hiệu (Brand Story & CDN) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
                        <div className="flex items-start gap-2.5">
                          <BookOpenText
                            size={18}
                            className="text-sushi-gold shrink-0 mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-sm text-sushi-text block">
                              {t('storeSettingsPage.brandStoryTitle')}
                            </span>
                            <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                              {t('storeSettingsPage.brandStoryDesc')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            size="small"
                            onClick={handleRestoreDefaultBrandStory}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                          >
                            <ArrowCounterClockwise size={13} />
                            <span>{t('storeSettingsPage.restoreDefaultBtn')}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {(
                          [
                            {
                              key: 'card' as const,
                              badge: 'Phần #1',
                              title: t('storeSettingsPage.brandStoryPart1Title'),
                              subtitle:
                                brandStory.cardTitle ||
                                'Hương vị chuẩn Nhật từ nguyên liệu tươi sống chọn lọc',
                            },
                            {
                              key: 'story' as const,
                              badge: 'Phần #2',
                              title: 'Câu Chuyện Nghề & Tâm Huyết',
                              subtitle:
                                brandStory.storyHeading ||
                                'Gìn giữ trọn vẹn tinh hoa ẩm thực truyền thống Nhật Bản',
                            },
                            {
                              key: 'pillars' as const,
                              badge: 'Phần #3',
                              title: '3 Giá Trị Cốt Lõi (1 - 2 - 3)',
                              subtitle: brandStory.pillars
                                .map((p, i) => `${i + 1}. ${p.title}`)
                                .join(' • '),
                            },
                            {
                              key: 'tiles' as const,
                              badge: 'Phần #4',
                              title: '2 Ảnh Món Ăn Nghệ Thuật (Cloudinary CDN)',
                              subtitle: brandStory.craftTiles
                                .map((t) => t.caption)
                                .join(' & '),
                            },
                          ] as const
                        ).map((block) => {
                          const isEditingThis = editingStoryBlock === block.key;
                          return (
                            <div
                              key={block.key}
                              onClick={() => setEditingStoryBlock(block.key)}
                              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                                isEditingThis
                                  ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                  : 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700 hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                  {block.badge}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1 block">
                                    {block.title}
                                  </span>
                                  <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                    {block.subtitle}
                                  </span>
                                </div>
                              </div>

                              <div
                                className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    setEditingStoryBlock(block.key)
                                  }
                                  className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                >
                                  <PencilSimple size={13} />
                                  <span>{t('storeSettingsPage.editBtn')}</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 4: Quản lý Thực Đơn Đặc Sắc */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
                        <div className="flex items-start gap-2.5">
                          <SquaresFour
                            size={18}
                            className="text-sushi-gold shrink-0 mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-sm text-sushi-text block">
                              {t('storeSettingsPage.curatedCategoriesTitle')}
                            </span>
                            <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                              Tùy chỉnh hình ảnh CDN, tên danh mục, chữ Nhật trang trí và từ khóa lọc chuyển tới trang Thực đơn.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            size="small"
                            onClick={handleRestoreDefaultCategories}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                          >
                            <ArrowCounterClockwise size={13} />
                            <span>{t('storeSettingsPage.restoreDefaultBtn')}</span>
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={handleAddCategory}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg text-2xs flex items-center gap-1"
                          >
                            <Plus size={13} weight="bold" />
                            <span>{t('storeSettingsPage.addCategoryBtn')}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {categories.map((cat, index) => {
                          const isItemActive = cat.isActive !== false;
                          const isEditingThis = editingCategoryId === cat.id;
                          const isDragging = draggedCatIdx === index;
                          const isDragOver = dragOverCatIdx === index;

                          return (
                            <div
                              key={cat.id}
                              data-dnd-list="category"
                              data-dnd-index={index}
                              draggable
                              onDragStart={(e) => {
                                setDraggedCatIdx(index);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(index));
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverCatIdx !== index) {
                                  setDragOverCatIdx(index);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverCatIdx === index) {
                                  setDragOverCatIdx(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedCatIdx !== null && draggedCatIdx !== index) {
                                  handleReorderCategories(draggedCatIdx, index);
                                }
                                setDraggedCatIdx(null);
                                setDragOverCatIdx(null);
                              }}
                              onDragEnd={() => {
                                setDraggedCatIdx(null);
                                setDragOverCatIdx(null);
                              }}
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isDragging
                                  ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/60 scale-[1.01] z-10 relative'
                                  : isDragOver
                                    ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/50'
                                    : isEditingThis
                                      ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                      : isItemActive
                                        ? 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700'
                                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-65'
                              }`}
                            >
                              <div
                                onClick={() => setEditingCategoryId(cat.id)}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                  {/* Tay nắm kéo thả (Hỗ trợ cả Touch Mobile & Mouse Desktop) */}
                                  <div
                                    title="Chạm giữ và kéo để thay đổi thứ tự hiển thị"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) =>
                                      startPointerDrag(e, 'category', index)
                                    }
                                    style={{ touchAction: 'none' }}
                                    className="p-2 -ml-1.5 rounded-lg cursor-grab active:cursor-grabbing text-zinc-400 hover:text-sushi-gold active:text-sushi-gold hover:bg-white/5 active:bg-sushi-gold/15 transition-colors shrink-0 touch-none select-none"
                                  >
                                    <DotsSixVertical size={20} weight="bold" />
                                  </div>

                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                    Mục #{index + 1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center flex-wrap gap-1.5">
                                      <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1">
                                        {cat.title || 'Chưa đặt tên danh mục'}
                                      </span>
                                      {cat.japanese && (
                                        <span className="text-2xs text-sushi-gold/80 font-serif shrink-0">
                                          ({cat.japanese})
                                        </span>
                                      )}
                                      {!cat.imageUrl?.trim() && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                          Chưa có ảnh
                                        </span>
                                      )}
                                    </div>
                                    {cat.desc && (
                                      <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                        {cat.desc}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Switch
                                      size="small"
                                      checked={isItemActive}
                                      onChange={(checked) =>
                                        handleCategoryChange(
                                          cat.id,
                                          'isActive',
                                          checked,
                                        )
                                      }
                                      checkedChildren={t('storeSettingsPage.switchOn')}
                                      unCheckedChildren={t('storeSettingsPage.switchOff')}
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        setEditingCategoryId(cat.id)
                                      }
                                      className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                    >
                                      <PencilSimple size={13} />
                                      <span>{t('storeSettingsPage.editBtn')}</span>
                                    </Button>
                                    {categories.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveCategory(cat.id)
                                        }
                                        title="Xóa danh mục này"
                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                      >
                                        <Trash size={15} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 5: Quản lý Tin Tức & Khuyến Mãi */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
                        <div className="flex items-start gap-2.5">
                          <Newspaper
                            size={18}
                            className="text-sushi-gold shrink-0 mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-sm text-sushi-text block">
                              {t('storeSettingsPage.culinaryNewsTitle')}
                            </span>
                            <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                              Cập nhật các chương trình ưu đãi, món mới theo mùa và câu chuyện ẩm thực trên trang chủ.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <Button
                            size="small"
                            onClick={handleRestoreDefaultNews}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                          >
                            <ArrowCounterClockwise size={13} />
                            <span>{t('storeSettingsPage.restoreDefaultBtn')}</span>
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            onClick={handleAddNews}
                            className="flex-1 sm:flex-initial justify-center h-8 rounded-lg text-2xs flex items-center gap-1"
                          >
                            <Plus size={13} weight="bold" />
                            <span>{t('storeSettingsPage.addNewsBtn')}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {newsList.map((post, index) => {
                          const isItemActive = post.isActive !== false;
                          const isEditingThis = editingNewsId === post.id;
                          const isDragging = draggedNewsIdx === index;
                          const isDragOver = dragOverNewsIdx === index;

                          return (
                            <div
                              key={post.id}
                              data-dnd-list="news"
                              data-dnd-index={index}
                              draggable
                              onDragStart={(e) => {
                                setDraggedNewsIdx(index);
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', String(index));
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (dragOverNewsIdx !== index) {
                                  setDragOverNewsIdx(index);
                                }
                              }}
                              onDragLeave={() => {
                                if (dragOverNewsIdx === index) {
                                  setDragOverNewsIdx(null);
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (draggedNewsIdx !== null && draggedNewsIdx !== index) {
                                  handleReorderNews(draggedNewsIdx, index);
                                }
                                setDraggedNewsIdx(null);
                                setDragOverNewsIdx(null);
                              }}
                              onDragEnd={() => {
                                setDraggedNewsIdx(null);
                                setDragOverNewsIdx(null);
                              }}
                              className={`rounded-xl border transition-all overflow-hidden ${
                                isDragging
                                  ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/60 scale-[1.01] z-10 relative'
                                  : isDragOver
                                    ? 'border-sushi-gold bg-sushi-gold/10 shadow-lg ring-2 ring-sushi-gold/50'
                                    : isEditingThis
                                      ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                      : isItemActive
                                        ? 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700'
                                        : 'bg-zinc-950/40 border-zinc-800/60 opacity-65'
                              }`}
                            >
                              <div
                                onClick={() => setEditingNewsId(post.id)}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                                  {/* Tay nắm kéo thả (Hỗ trợ cả Touch Mobile & Mouse Desktop) */}
                                  <div
                                    title="Chạm giữ và kéo để thay đổi thứ tự hiển thị"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) =>
                                      startPointerDrag(e, 'news', index)
                                    }
                                    style={{ touchAction: 'none' }}
                                    className="p-2 -ml-1.5 rounded-lg cursor-grab active:cursor-grabbing text-zinc-400 hover:text-sushi-gold active:text-sushi-gold hover:bg-white/5 active:bg-sushi-gold/15 transition-colors shrink-0 touch-none select-none"
                                  >
                                    <DotsSixVertical size={20} weight="bold" />
                                  </div>

                                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                    Bài #{index + 1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center flex-wrap gap-1.5">
                                      <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1">
                                        {post.title ||
                                          'Chưa đặt tiêu đề bài viết'}
                                      </span>
                                      {post.tag && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-sushi-text-muted border border-zinc-700 shrink-0">
                                          {post.tag}
                                        </span>
                                      )}
                                      {!post.imageUrl?.trim() && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                          Chưa có ảnh
                                        </span>
                                      )}
                                    </div>
                                    {post.date && (
                                      <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                        Ngày đăng: {post.date}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div
                                  className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Switch
                                      size="small"
                                      checked={isItemActive}
                                      onChange={(checked) =>
                                        handleNewsChange(
                                          post.id,
                                          'isActive',
                                          checked,
                                        )
                                      }
                                      checkedChildren={t('storeSettingsPage.switchOn')}
                                      unCheckedChildren={t('storeSettingsPage.switchOff')}
                                    />
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="small"
                                      onClick={() => setEditingNewsId(post.id)}
                                      className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                    >
                                      <PencilSimple size={13} />
                                      <span>{t('storeSettingsPage.editBtn')}</span>
                                    </Button>
                                    {newsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveNews(post.id)
                                        }
                                        title="Xóa bài viết này"
                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                                      >
                                        <Trash size={15} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card 6: Quản lý {t('storeSettingsPage.footerSettingsTitle')} */}
                    {(() => {
                      const activePatternInfo =
                        JAPANESE_PATTERNS.find(
                          (p) => p.id === footerConfig.patternPreset,
                        ) || JAPANESE_PATTERNS[0];
                      const previewPatternStyle =
                        footerConfig.patternPreset !== 'none' &&
                        footerConfig.patternPreset !== 'custom'
                          ? getJapanesePatternDataUri(
                              footerConfig.patternPreset,
                              (footerConfig.patternOpacity ?? 16) / 100,
                              '#d4a853',
                            )
                          : {};

                      return (
                        <div className="p-4 sm:p-5 rounded-2xl bg-sushi-card border border-sushi-border/80 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-sushi-border/60">
                            <div className="flex items-start gap-2.5">
                              <Palette
                                size={18}
                                className="text-sushi-gold shrink-0 mt-0.5"
                              />
                              <div>
                                <span className="font-semibold text-sm text-sushi-text block">
                                  Chân Trang & Hoa Văn Nhật Bản (Footer Background & Content)
                                </span>
                                <span className="text-2xs text-sushi-text-muted leading-relaxed block mt-0.5">
                                  {t('storeSettingsPage.footerSettingsDesc')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                              <Button
                                size="small"
                                onClick={handleRestoreDefaultFooter}
                                className="flex-1 sm:flex-initial justify-center h-8 rounded-lg border-sushi-border text-sushi-text-muted hover:text-white text-2xs flex items-center gap-1"
                              >
                                <ArrowCounterClockwise size={13} />
                                <span>{t('storeSettingsPage.restoreDefaultBtn')}</span>
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            {/* Mục 1: Hoa văn & Màu nền Footer */}
                            <div
                              onClick={() =>
                                setEditingFooterBlock('background')
                              }
                              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                                editingFooterBlock === 'background'
                                  ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                  : 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700 hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                  Nền #1
                                </span>

                                <div
                                  className="relative w-12 h-8 rounded-md overflow-hidden border border-sushi-gold/40 shrink-0 flex items-center justify-center"
                                  style={{
                                    backgroundColor: footerConfig.bgColor,
                                    ...(previewPatternStyle.backgroundImage
                                      ? {
                                          backgroundImage:
                                            previewPatternStyle.backgroundImage,
                                          backgroundSize: '28px 14px',
                                        }
                                      : {}),
                                  }}
                                >
                                  <span className="text-[10px] font-bold text-sushi-gold drop-shadow">
                                    {activePatternInfo.japanese.slice(0, 2)}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1">
                                      Hoa Văn & Màu Nền Chân Trang ({activePatternInfo.name})
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sushi-gold/10 text-sushi-gold border border-sushi-gold/25 shrink-0">
                                      {activePatternInfo.japanese}
                                    </span>
                                  </div>
                                  <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                    Màu nền: {footerConfig.bgColor} • Độ nét hoa văn: {footerConfig.patternOpacity}%
                                  </span>
                                </div>
                              </div>

                              <div
                                className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    setEditingFooterBlock('background')
                                  }
                                  className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                >
                                  <PencilSimple size={13} />
                                  <span>Chọn hoa văn</span>
                                </Button>
                              </div>
                            </div>

                            {/* Mục 2: Nội dung & Giờ phục vụ trên Footer */}
                            <div
                              onClick={() => setEditingFooterBlock('content')}
                              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-3.5 py-3 rounded-xl border transition-all cursor-pointer select-none ${
                                editingFooterBlock === 'content'
                                  ? 'bg-zinc-900/80 border-sushi-gold/50 shadow-md ring-1 ring-sushi-gold/30'
                                  : 'bg-zinc-900/50 border-sushi-border/70 hover:border-zinc-700 hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 shrink-0">
                                  Nội dung #2
                                </span>

                                <div className="min-w-0 flex-1">
                                  <span className="text-xs sm:text-sm font-semibold text-sushi-text line-clamp-1 block">
                                    Thông Tin Giới Thiệu, Giờ Phục Vụ & Bản Quyền
                                  </span>
                                  <span className="text-2xs text-sushi-text-muted line-clamp-1 block mt-0.5">
                                    {footerConfig.openingDays} ({footerConfig.openingHours}) • {footerConfig.addressNote}
                                  </span>
                                </div>
                              </div>

                              <div
                                className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t border-zinc-800/70 sm:border-t-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    setEditingFooterBlock('content')
                                  }
                                  className="rounded-lg text-2xs flex items-center gap-1 px-2.5 border-zinc-700 text-sushi-text-muted hover:text-white hover:border-sushi-gold/60"
                                >
                                  <PencilSimple size={13} />
                                  <span>{t('storeSettingsPage.editBtn')}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ),
              },
            ]}
          />

          {/* Popup / Bottom Sheet Chi tiết Banner */}
          {(() => {
            const activeBanner = banners.find((b) => b.id === editingBannerId);
            if (!activeBanner) return null;

            const activeIndex = banners.findIndex(
              (b) => b.id === editingBannerId,
            );
            const isUploadingThis =
              uploadingTarget?.section === 'banner' &&
              uploadingTarget?.id === activeBanner.id;
            const isBannerUrlValid =
              activeBanner.imageUrl.startsWith('/') ||
              activeBanner.imageUrl.startsWith('http://') ||
              activeBanner.imageUrl.startsWith('https://');

            return (
              <ResponsiveModalDrawer
                open={!!editingBannerId}
                onClose={() => setEditingBannerId(null)}
                width={780}
                title={
                  <div className="flex items-center gap-2">
                    <Images size={18} className="text-sushi-gold shrink-0" />
                    <span>Chi Tiết Slide Banner</span>
                    <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 ml-1">
                      Slide #{activeIndex + 1}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
                        {isBannerUrlValid ? (
                          <Image
                            src={activeBanner.imageUrl}
                            alt={
                              activeBanner.highlightTitle ||
                              `Banner ${activeIndex + 1}`
                            }
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <Images size={28} className="text-zinc-600 mx-auto" />
                            <p className="text-2xs text-zinc-500">
                              Chưa có ảnh Banner
                            </p>
                          </div>
                        )}
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 text-sushi-gold">
                            <Spinner size={22} className="animate-spin" />
                            <span className="text-2xs font-medium">
                              Đang tải lên CDN...
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => triggerUpload('banner', activeBanner.id)}
                        disabled={isUploadingThis}
                        className="w-full h-9 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <UploadSimple size={15} />
                        <span>Tải ảnh từ máy lên Cloudinary CDN</span>
                      </Button>

                      <div className="space-y-1">
                        <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                          <LinkSimple size={12} />
                          <span>Hoặc dán trực tiếp URL ảnh CDN:</span>
                        </span>
                        <Input
                          size="middle"
                          value={activeBanner.imageUrl}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'imageUrl',
                              e.target.value,
                            )
                          }
                          placeholder="https://res.cloudinary.com/... hoặc link ảnh CDN"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Dòng tiêu đề phụ (trên)
                          </label>
                          <Input
                            value={activeBanner.leadTitle || ''}
                            onChange={(e) =>
                              handleBannerChange(
                                activeBanner.id,
                                'leadTitle',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Hương vị tinh tế của"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Tiêu đề chính nổi bật
                          </label>
                          <Input
                            value={activeBanner.highlightTitle || ''}
                            onChange={(e) =>
                              handleBannerChange(
                                activeBanner.id,
                                'highlightTitle',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Ẩm thực Sushi Nhật Bản"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Mô tả chi tiết (có thể để trống nếu ảnh đã có chữ)
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={activeBanner.description || ''}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'description',
                              e.target.value,
                            )
                          }
                          placeholder="Nhập đoạn mô tả ngắn hiển thị bên dưới tiêu đề..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Chữ Kanji thư pháp trang trí góc phải (cách nhau bởi dấu cách)
                        </label>
                        <Input
                          value={activeBanner.kanjiWatermark || ''}
                          onChange={(e) =>
                            handleBannerChange(
                              activeBanner.id,
                              'kanjiWatermark',
                              e.target.value,
                            )
                          }
                          placeholder="VD: 伝統 江戸 寿司"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text sm:max-w-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setEditingBannerId(null)}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              </ResponsiveModalDrawer>
            );
          })()}

          {/* Popup / Bottom Sheet Chi tiết Triết Lý & Câu Chuyện Thương Hiệu */}
          {(() => {
            if (!editingStoryBlock) return null;

            const blockTitles: Record<BrandStoryBlockKey, string> = {
              card: 'Thẻ Đỏ Điểm Nhấn (Triết Lý Ẩm Thực)',
              story: 'Câu Chuyện Nghề & Tâm Huyết',
              pillars: '3 Giá Trị Cốt Lõi (1 - 2 - 3)',
              tiles: '2 Ảnh Món Ăn Nghệ Thuật (Cloudinary CDN)',
            };

            return (
              <ResponsiveModalDrawer
                open={!!editingStoryBlock}
                onClose={() => setEditingStoryBlock(null)}
                width={740}
                title={
                  <div className="flex items-center gap-2">
                    <BookOpenText
                      size={18}
                      className="text-sushi-gold shrink-0"
                    />
                    <span>{blockTitles[editingStoryBlock]}</span>
                  </div>
                }
              >
                <div className="space-y-4">
                  {editingStoryBlock === 'card' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Nhãn huy hiệu trên thẻ đỏ
                          </label>
                          <Input
                            value={brandStory.cardBadge || ''}
                            onChange={(e) =>
                              handleBrandStoryFieldChange(
                                'cardBadge',
                                e.target.value,
                              )
                            }
                            placeholder="VD: TRIẾT LÝ ẨM THỰC • 料理哲学"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Chữ Kanji chìm góc phải
                          </label>
                          <Input
                            value={brandStory.cardKanji || ''}
                            onChange={(e) =>
                              handleBrandStoryFieldChange(
                                'cardKanji',
                                e.target.value,
                              )
                            }
                            placeholder="VD: 匠"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Tiêu đề chính trên thẻ đỏ
                        </label>
                        <Input
                          value={brandStory.cardTitle || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'cardTitle',
                              e.target.value,
                            )
                          }
                          placeholder="VD: Hương vị chuẩn Nhật từ nguyên liệu tươi sống chọn lọc"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Câu trích dẫn (Quote in nghiêng)
                        </label>
                        <Input
                          value={brandStory.cardQuote || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'cardQuote',
                              e.target.value,
                            )
                          }
                          placeholder="VD: “Trải nghiệm trọn vẹn chất lượng Nhật Bản cùng Hanbi Sushi.”"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Chữ ký thương hiệu dưới đáy thẻ
                        </label>
                        <Input
                          value={brandStory.cardSignature || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'cardSignature',
                              e.target.value,
                            )
                          }
                          placeholder="VD: HANBI SUSHI • ARTISAN CRAFT"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>
                  )}

                  {editingStoryBlock === 'story' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Nhãn đề mục nhỏ
                        </label>
                        <Input
                          value={brandStory.storyLabel || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'storyLabel',
                              e.target.value,
                            )
                          }
                          placeholder="VD: CHUYỆN NGHỀ & TÂM HUYẾT"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Tiêu đề câu chuyện thương hiệu
                        </label>
                        <Input
                          value={brandStory.storyHeading || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'storyHeading',
                              e.target.value,
                            )
                          }
                          placeholder="VD: Gìn giữ trọn vẹn tinh hoa ẩm thực truyền thống Nhật Bản"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Đoạn giới thiệu 1 (đoạn chính)
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={brandStory.storyParagraph1 || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'storyParagraph1',
                              e.target.value,
                            )
                          }
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Đoạn giới thiệu 2 (đoạn bổ trợ)
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={brandStory.storyParagraph2 || ''}
                          onChange={(e) =>
                            handleBrandStoryFieldChange(
                              'storyParagraph2',
                              e.target.value,
                            )
                          }
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>
                  )}

                  {editingStoryBlock === 'pillars' && (
                    <div className="space-y-3.5">
                      {brandStory.pillars.map((pillar, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-5 items-center justify-center rounded-full bg-sushi-gold/15 text-sushi-gold text-2xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-sushi-text">
                              Giá trị cốt lõi #{idx + 1}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-2xs text-sushi-text-muted block">
                              Tiêu đề
                            </label>
                            <Input
                              value={pillar.title}
                              onChange={(e) =>
                                handlePillarChange(idx, 'title', e.target.value)
                              }
                              className="rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-2xs text-sushi-text-muted block">
                              Mô tả chi tiết
                            </label>
                            <Input.TextArea
                              rows={2}
                              value={pillar.description}
                              onChange={(e) =>
                                handlePillarChange(
                                  idx,
                                  'description',
                                  e.target.value,
                                )
                              }
                              className="rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editingStoryBlock === 'tiles' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {brandStory.craftTiles.map((tile, idx) => {
                        const isUploadingThis =
                          uploadingTarget?.section === 'storyTile' &&
                          uploadingTarget?.id === String(idx);
                        const isUrlValid =
                          tile.imageUrl.startsWith('/') ||
                          tile.imageUrl.startsWith('http://') ||
                          tile.imageUrl.startsWith('https://');

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2.5"
                          >
                            <span className="text-xs font-semibold text-sushi-gold block">
                              Ảnh nghệ thuật #{idx + 1}
                            </span>

                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
                              {isUrlValid ? (
                                <Image
                                  src={tile.imageUrl}
                                  alt={tile.caption || `Craft Tile ${idx + 1}`}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <div className="text-center p-4 space-y-1">
                                  <Images
                                    size={26}
                                    className="text-zinc-600 mx-auto"
                                  />
                                  <p className="text-2xs text-zinc-500">
                                    Chưa có ảnh
                                  </p>
                                </div>
                              )}
                              {isUploadingThis && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 text-sushi-gold">
                                  <Spinner
                                    size={22}
                                    className="animate-spin"
                                  />
                                  <span className="text-2xs font-medium">
                                    Đang tải lên CDN...
                                  </span>
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() =>
                                triggerUpload('storyTile', String(idx))
                              }
                              disabled={isUploadingThis}
                              className="w-full h-9 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                            >
                              <UploadSimple size={15} />
                              <span>Tải ảnh lên Cloudinary CDN</span>
                            </Button>

                            <div className="space-y-1">
                              <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                                <LinkSimple size={12} />
                                <span>URL ảnh CDN:</span>
                              </span>
                              <Input
                                value={tile.imageUrl}
                                onChange={(e) =>
                                  handleTileChange(
                                    idx,
                                    'imageUrl',
                                    e.target.value,
                                  )
                                }
                                placeholder="https://res.cloudinary.com/..."
                                className="rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-2xs text-sushi-text-muted block">
                                Chú thích hiển thị trên góc ảnh
                              </label>
                              <Input
                                value={tile.caption}
                                onChange={(e) =>
                                  handleTileChange(
                                    idx,
                                    'caption',
                                    e.target.value,
                                  )
                                }
                                placeholder="VD: Khay Maki Roll tổng hợp"
                                className="rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setEditingStoryBlock(null)}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              </ResponsiveModalDrawer>
            );
          })()}

          {/* Popup / Bottom Sheet Chi tiết Thực Đơn Đặc Sắc */}
          {(() => {
            const activeCat = categories.find(
              (c) => c.id === editingCategoryId,
            );
            if (!activeCat) return null;

            const activeIndex = categories.findIndex(
              (c) => c.id === editingCategoryId,
            );
            const isUploadingThis =
              uploadingTarget?.section === 'category' &&
              uploadingTarget?.id === activeCat.id;
            const isUrlValid =
              activeCat.imageUrl.startsWith('/') ||
              activeCat.imageUrl.startsWith('http://') ||
              activeCat.imageUrl.startsWith('https://');

            return (
              <ResponsiveModalDrawer
                open={!!editingCategoryId}
                onClose={() => setEditingCategoryId(null)}
                width={760}
                title={
                  <div className="flex items-center gap-2">
                    <SquaresFour
                      size={18}
                      className="text-sushi-gold shrink-0"
                    />
                    <span>Chi Tiết Thực Đơn Đặc Sắc</span>
                    <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 ml-1">
                      Mục #{activeIndex + 1}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
                        {isUrlValid ? (
                          <Image
                            src={activeCat.imageUrl}
                            alt={
                              activeCat.title || `Category ${activeIndex + 1}`
                            }
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <Images size={28} className="text-zinc-600 mx-auto" />
                            <p className="text-2xs text-zinc-500">{t('storeSettingsPage.noImageTag')}</p>
                          </div>
                        )}
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 text-sushi-gold">
                            <Spinner size={22} className="animate-spin" />
                            <span className="text-2xs font-medium">
                              Đang tải lên CDN...
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => triggerUpload('category', activeCat.id)}
                        disabled={isUploadingThis}
                        className="w-full h-9 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <UploadSimple size={15} />
                        <span>Tải ảnh từ máy lên Cloudinary CDN</span>
                      </Button>

                      <div className="space-y-1">
                        <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                          <LinkSimple size={12} />
                          <span>Hoặc dán trực tiếp URL ảnh CDN:</span>
                        </span>
                        <Input
                          size="middle"
                          value={activeCat.imageUrl}
                          onChange={(e) =>
                            handleCategoryChange(
                              activeCat.id,
                              'imageUrl',
                              e.target.value,
                            )
                          }
                          placeholder="https://res.cloudinary.com/..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Tên danh mục nổi bật *
                          </label>
                          <Input
                            value={activeCat.title || ''}
                            onChange={(e) =>
                              handleCategoryChange(
                                activeCat.id,
                                'title',
                                e.target.value,
                              )
                            }
                            placeholder="VD: SASHIMI"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Tên tiếng Nhật (trang trí)
                          </label>
                          <Input
                            value={activeCat.japanese || ''}
                            onChange={(e) =>
                              handleCategoryChange(
                                activeCat.id,
                                'japanese',
                                e.target.value,
                              )
                            }
                            placeholder="VD: 刺身"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Mô tả ngắn gọn
                        </label>
                        <Input.TextArea
                          rows={2}
                          value={activeCat.desc || ''}
                          onChange={(e) =>
                            handleCategoryChange(
                              activeCat.id,
                              'desc',
                              e.target.value,
                            )
                          }
                          placeholder="VD: Cá hồi Na Uy, cá ngừ đại dương và sò điệp tươi ngon..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Từ khóa lọc khi khách bấm vào (chuyển sang /menu?category=...)
                        </label>
                        <Input
                          value={activeCat.targetCategory || ''}
                          onChange={(e) =>
                            handleCategoryChange(
                              activeCat.id,
                              'targetCategory',
                              e.target.value,
                            )
                          }
                          placeholder="VD: sashimi, nigiri, roll, cơm, uống..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text sm:max-w-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setEditingCategoryId(null)}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              </ResponsiveModalDrawer>
            );
          })()}

          {/* Popup / Bottom Sheet Chi tiết Tin Tức & Khuyến Mãi */}
          {(() => {
            const activeNews = newsList.find((n) => n.id === editingNewsId);
            if (!activeNews) return null;

            const activeIndex = newsList.findIndex(
              (n) => n.id === editingNewsId,
            );
            const isUploadingThis =
              uploadingTarget?.section === 'news' &&
              uploadingTarget?.id === activeNews.id;
            const isUrlValid =
              activeNews.imageUrl.startsWith('/') ||
              activeNews.imageUrl.startsWith('http://') ||
              activeNews.imageUrl.startsWith('https://');

            return (
              <ResponsiveModalDrawer
                open={!!editingNewsId}
                onClose={() => setEditingNewsId(null)}
                width={760}
                title={
                  <div className="flex items-center gap-2">
                    <Newspaper
                      size={18}
                      className="text-sushi-gold shrink-0"
                    />
                    <span>Chi Tiết Tin Tức & Khuyến Mãi</span>
                    <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-sushi-gold/15 text-sushi-gold border border-sushi-gold/30 ml-1">
                      Bài #{activeIndex + 1}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 flex items-center justify-center">
                        {isUrlValid ? (
                          <Image
                            src={activeNews.imageUrl}
                            alt={
                              activeNews.title || `News ${activeIndex + 1}`
                            }
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-1">
                            <Images size={28} className="text-zinc-600 mx-auto" />
                            <p className="text-2xs text-zinc-500">{t('storeSettingsPage.noImageTag')}</p>
                          </div>
                        )}
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 text-sushi-gold">
                            <Spinner size={22} className="animate-spin" />
                            <span className="text-2xs font-medium">
                              Đang tải lên CDN...
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => triggerUpload('news', activeNews.id)}
                        disabled={isUploadingThis}
                        className="w-full h-9 rounded-xl border-sushi-border text-sushi-text hover:text-white flex items-center justify-center gap-1.5 text-xs font-medium"
                      >
                        <UploadSimple size={15} />
                        <span>Tải ảnh từ máy lên Cloudinary CDN</span>
                      </Button>

                      <div className="space-y-1">
                        <span className="text-2xs text-sushi-text-muted flex items-center gap-1">
                          <LinkSimple size={12} />
                          <span>Hoặc dán trực tiếp URL ảnh CDN:</span>
                        </span>
                        <Input
                          size="middle"
                          value={activeNews.imageUrl}
                          onChange={(e) =>
                            handleNewsChange(
                              activeNews.id,
                              'imageUrl',
                              e.target.value,
                            )
                          }
                          placeholder="https://res.cloudinary.com/..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-7 space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Tiêu đề bài viết / Chương trình ưu đãi *
                        </label>
                        <Input
                          value={activeNews.title || ''}
                          onChange={(e) =>
                            handleNewsChange(
                              activeNews.id,
                              'title',
                              e.target.value,
                            )
                          }
                          placeholder="VD: Ưu đãi đặt trước Take Away: Tiết kiệm 15%"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Nhãn phân loại (Tag)
                          </label>
                          <Input
                            value={activeNews.tag || ''}
                            onChange={(e) =>
                              handleNewsChange(
                                activeNews.id,
                                'tag',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Khuyến mãi, Món mới, Văn hoá..."
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Ngày đăng
                          </label>
                          <Input
                            value={activeNews.date || ''}
                            onChange={(e) =>
                              handleNewsChange(
                                activeNews.id,
                                'date',
                                e.target.value,
                              )
                            }
                            placeholder="VD: 21.11.2026"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Tóm tắt nội dung
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={activeNews.summary || ''}
                          onChange={(e) =>
                            handleNewsChange(
                              activeNews.id,
                              'summary',
                              e.target.value,
                            )
                          }
                          placeholder="Nhập đoạn tóm tắt hiển thị trên thẻ bài viết..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setEditingNewsId(null)}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              </ResponsiveModalDrawer>
            );
          })()}

          {/* Popup / Bottom Sheet Chi tiết Chân Trang & Hoa Văn Nhật Bản */}
          {(() => {
            if (!editingFooterBlock) return null;

            const isUploadingFooterBg =
              uploadingTarget?.section === 'footerBg';
            const isCustomUrlValid =
              footerConfig.customBgImageUrl.startsWith('/') ||
              footerConfig.customBgImageUrl.startsWith('http://') ||
              footerConfig.customBgImageUrl.startsWith('https://');

            const livePatternStyle =
              footerConfig.patternPreset !== 'none' &&
              footerConfig.patternPreset !== 'custom'
                ? getJapanesePatternDataUri(
                    footerConfig.patternPreset,
                    (footerConfig.patternOpacity ?? 16) / 100,
                    '#d4a853',
                  )
                : {};

            return (
              <ResponsiveModalDrawer
                open={!!editingFooterBlock}
                onClose={() => setEditingFooterBlock(null)}
                width={780}
                title={
                  <div className="flex items-center gap-2">
                    <Palette size={18} className="text-sushi-gold shrink-0" />
                    <span>
                      {editingFooterBlock === 'background'
                        ? 'Hoa Văn Truyền Thống Nhật Bản & Màu Nền Footer'
                        : 'Nội Dung Chân Trang & Thời Gian Phục Vụ'}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  {editingFooterBlock === 'background' && (
                    <div className="space-y-4">
                      {/* Khung Live Preview Chân Trang */}
                      <div className="space-y-1.5">
                        <label className="text-2xs font-semibold uppercase tracking-wider text-sushi-gold block">
                          Xem trước trực tiếp nền Footer (Live Preview)
                        </label>
                        <div
                          className="relative rounded-xl border border-amber-500/30 p-4 sm:p-5 overflow-hidden shadow-inner"
                          style={{
                            backgroundColor: footerConfig.bgColor,
                            ...(livePatternStyle.backgroundImage
                              ? {
                                  backgroundImage:
                                    livePatternStyle.backgroundImage,
                                  backgroundSize:
                                    livePatternStyle.backgroundSize,
                                }
                              : {}),
                          }}
                        >
                          {footerConfig.patternPreset === 'custom' &&
                            isCustomUrlValid && (
                              <>
                                <div
                                  className="pointer-events-none absolute inset-0 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url("${footerConfig.customBgImageUrl}")`,
                                  }}
                                />
                                <div
                                  className="pointer-events-none absolute inset-0"
                                  style={{
                                    backgroundColor: footerConfig.bgColor,
                                    opacity:
                                      (footerConfig.overlayOpacity ?? 82) / 100,
                                  }}
                                />
                              </>
                            )}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-black/25" />

                          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1 max-w-md">
                              <div className="text-sm font-bold tracking-wider text-amber-400">
                                HANBI SUSHI • 伝統江戸寿司
                              </div>
                              <p className="text-2xs text-zinc-300 line-clamp-2 leading-relaxed">
                                {footerConfig.brandDescription}
                              </p>
                            </div>
                            <div className="text-2xs text-zinc-300 space-y-0.5 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                              <div className="font-semibold text-white">
                                {footerConfig.openingDays}
                              </div>
                              <div>{footerConfig.openingHours}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chọn Họa tiết Hoa văn Nhật Bản (Wagara) */}
                      <div className="space-y-2">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Chọn họa tiết hoa văn Nhật Bản truyền thống (Wagara Pattern)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {JAPANESE_PATTERNS.map((pat) => {
                            const isSelected =
                              footerConfig.patternPreset === pat.id;
                            const thumbPattern =
                              pat.id !== 'none' && pat.id !== 'custom'
                                ? getJapanesePatternDataUri(
                                    pat.id,
                                    0.32,
                                    '#d4a853',
                                  )
                                : {};

                            return (
                              <button
                                key={pat.id}
                                type="button"
                                onClick={() =>
                                  handleFooterFieldChange(
                                    'patternPreset',
                                    pat.id,
                                  )
                                }
                                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-sushi-gold/10 border-sushi-gold ring-1 ring-sushi-gold/40'
                                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                <div
                                  className="w-12 h-12 rounded-lg border border-amber-500/30 shrink-0 flex items-center justify-center overflow-hidden"
                                  style={{
                                    backgroundColor: footerConfig.bgColor,
                                    ...(thumbPattern.backgroundImage
                                      ? {
                                          backgroundImage:
                                            thumbPattern.backgroundImage,
                                          backgroundSize:
                                            pat.id === 'seigaiha'
                                              ? '36px 18px'
                                              : '28px 28px',
                                        }
                                      : {}),
                                  }}
                                >
                                  <span className="text-2xs font-bold text-amber-400/90 drop-shadow">
                                    {pat.japanese.slice(0, 2)}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-semibold text-sushi-text truncate">
                                      {pat.name}
                                    </span>
                                    <span className="text-[10px] font-medium text-sushi-gold shrink-0">
                                      {pat.japanese}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-sushi-text-muted line-clamp-2 mt-0.5 leading-snug">
                                    {pat.meaning}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Chọn Tông Màu Nền & Độ Nét Hoa Văn */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-2">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Tông màu nền chủ đạo (Japanese Dark Lacquer)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {FOOTER_COLOR_PRESETS.map((preset) => {
                              const isColorActive =
                                footerConfig.bgColor.toLowerCase() ===
                                preset.hex.toLowerCase();
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() =>
                                    handleFooterFieldChange(
                                      'bgColor',
                                      preset.hex,
                                    )
                                  }
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-2xs transition-all cursor-pointer ${
                                    isColorActive
                                      ? 'border-sushi-gold bg-sushi-gold/15 text-white font-semibold'
                                      : 'border-zinc-800 bg-zinc-900/80 text-sushi-text-muted hover:text-white'
                                  }`}
                                >
                                  <span
                                    className="size-3.5 rounded-full border border-white/25 shrink-0"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span>{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-2xs text-sushi-text-muted">
                              Hoặc chọn màu / mã Hex:
                            </span>
                            <input
                              type="color"
                              value={
                                /^#[0-9a-fA-F]{6}$/.test(footerConfig.bgColor)
                                  ? footerConfig.bgColor
                                  : '#0b0e14'
                              }
                              onChange={(e) =>
                                handleFooterFieldChange(
                                  'bgColor',
                                  e.target.value,
                                )
                              }
                              className="h-8 w-10 rounded-lg border border-zinc-700 bg-zinc-950 p-0.5 cursor-pointer"
                              title="Bảng chọn màu tự do"
                            />
                            <Input
                              value={footerConfig.bgColor}
                              onChange={(e) =>
                                handleFooterFieldChange(
                                  'bgColor',
                                  e.target.value,
                                )
                              }
                              placeholder="#0b0e14"
                              className="w-28 h-8 rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text font-mono"
                            />
                          </div>
                        </div>

                        {footerConfig.patternPreset !== 'none' &&
                          footerConfig.patternPreset !== 'custom' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-2xs font-medium text-sushi-text-muted">
                                  Độ sắc nét hoa văn vàng kim
                                </label>
                                <span className="text-xs font-bold text-sushi-gold">
                                  {footerConfig.patternOpacity}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min={6}
                                max={45}
                                step={1}
                                value={footerConfig.patternOpacity}
                                onChange={(e) =>
                                  handleFooterFieldChange(
                                    'patternOpacity',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-full accent-amber-500 cursor-pointer"
                              />
                              <div className="flex justify-between text-[10px] text-sushi-text-muted">
                                <span>Chìm tinh tế (8%)</span>
                                <span>Mặc định (16%)</span>
                                <span>Rõ nét (35%+)</span>
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Nếu chọn Ảnh Nền Tùy Chỉnh CDN */}
                      {footerConfig.patternPreset === 'custom' && (
                        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-sushi-gold">
                              Tải ảnh nền Footer lên Cloudinary CDN
                            </span>
                            <Button
                              size="small"
                              onClick={() =>
                                triggerUpload('footerBg', 'footer')
                              }
                              disabled={isUploadingFooterBg}
                              className="h-8 rounded-lg border-sushi-border text-sushi-text hover:text-white flex items-center gap-1.5 text-2xs"
                            >
                              <UploadSimple size={14} />
                              <span>
                                {isUploadingFooterBg
                                  ? 'Đang tải lên CDN...'
                                  : 'Chọn ảnh từ máy'}
                              </span>
                            </Button>
                          </div>

                          <Input
                            value={footerConfig.customBgImageUrl}
                            onChange={(e) =>
                              handleFooterFieldChange(
                                'customBgImageUrl',
                                e.target.value,
                              )
                            }
                            placeholder="https://res.cloudinary.com/... hoặc URL ảnh nền"
                            className="rounded-lg bg-zinc-950 border-zinc-700 text-xs text-sushi-text"
                          />

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-2xs text-sushi-text-muted">
                                Độ tối lớp phủ bảo vệ chữ (Overlay Opacity)
                              </span>
                              <span className="text-xs font-bold text-sushi-gold">
                                {footerConfig.overlayOpacity}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={30}
                              max={95}
                              step={1}
                              value={footerConfig.overlayOpacity}
                              onChange={(e) =>
                                handleFooterFieldChange(
                                  'overlayOpacity',
                                  Number(e.target.value),
                                )
                              }
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {editingFooterBlock === 'content' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Đoạn giới thiệu thương hiệu (dưới Logo Hanbi Sushi)
                        </label>
                        <Input.TextArea
                          rows={3}
                          value={footerConfig.brandDescription}
                          onChange={(e) =>
                            handleFooterFieldChange(
                              'brandDescription',
                              e.target.value,
                            )
                          }
                          placeholder="Nhập mô tả ngắn dưới logo ở chân trang..."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Ngày mở cửa
                          </label>
                          <Input
                            value={footerConfig.openingDays}
                            onChange={(e) =>
                              handleFooterFieldChange(
                                'openingDays',
                                e.target.value,
                              )
                            }
                            placeholder="VD: Thứ Hai - Chủ Nhật"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Khung giờ phục vụ
                          </label>
                          <Input
                            value={footerConfig.openingHours}
                            onChange={(e) =>
                              handleFooterFieldChange(
                                'openingHours',
                                e.target.value,
                              )
                            }
                            placeholder="VD: 10:00 - 22:00 hàng ngày"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-2xs font-medium text-sushi-text-muted block">
                            Ghi chú nhận đơn cuối ngày
                          </label>
                          <Input
                            value={footerConfig.closingNote}
                            onChange={(e) =>
                              handleFooterFieldChange(
                                'closingNote',
                                e.target.value,
                              )
                            }
                            placeholder="VD: (Nhận đơn giao hàng đến 21:30)"
                            className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Thông tin khu vực / Chi nhánh giao hàng
                        </label>
                        <Input
                          value={footerConfig.addressNote}
                          onChange={(e) =>
                            handleFooterFieldChange(
                              'addressNote',
                              e.target.value,
                            )
                          }
                          placeholder="VD: Giao hàng tận nơi tại các chi nhánh khu vực TP. Hồ Chí Minh"
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-2xs font-medium text-sushi-text-muted block">
                          Dòng bản quyền (Copyright dưới đáy trang)
                        </label>
                        <Input
                          value={footerConfig.copyrightText}
                          onChange={(e) =>
                            handleFooterFieldChange(
                              'copyrightText',
                              e.target.value,
                            )
                          }
                          placeholder="VD: © 2026 HANBI SUSHI Platform. All rights reserved."
                          className="rounded-lg bg-zinc-900/90 border-zinc-700 text-xs text-sushi-text"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => setEditingFooterBlock(null)}
                      className="px-5 rounded-lg text-xs font-medium"
                    >
                      Xong
                    </Button>
                  </div>
                </div>
              </ResponsiveModalDrawer>
            );
          })()}

          {/* Save Button */}
          <div className="pt-2">
            <SushiButton
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateMutation.isPending}
              icon={<FloppyDisk size={18} weight="bold" />}
              className="w-full sm:w-auto h-12 sm:h-11 px-8 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {t('storeSettingsPage.saveBtn')}
            </SushiButton>
          </div>
        </div>
      </Form>
    </div>
  );
}
