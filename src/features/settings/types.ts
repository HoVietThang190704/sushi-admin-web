export interface PaymentConfig {
  id: string;
  key: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrImageUrl?: string | null;
  transferSyntax?: string | null;
  note?: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface UpdatePaymentConfigInput {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrImageUrl?: string;
  transferSyntax?: string;
  note?: string;
  isActive?: boolean;
}

export interface HeroBannerItem {
  id: string;
  imageUrl: string;
  leadTitle?: string;
  highlightTitle?: string;
  description?: string;
  kanjiWatermark?: string;
  isActive?: boolean;
}

export interface CuratedCategoryItem {
  id: string;
  title: string;
  japanese?: string;
  desc?: string;
  imageUrl: string;
  targetCategory?: string;
  isActive?: boolean;
}

export interface CulinaryNewsItem {
  id: string;
  title: string;
  date?: string;
  tag?: string;
  imageUrl: string;
  summary?: string;
  isActive?: boolean;
}

export interface BrandStoryPillar {
  title: string;
  description: string;
}

export interface BrandStoryTile {
  imageUrl: string;
  caption: string;
}

export interface BrandStoryConfig {
  cardBadge?: string;
  cardTitle?: string;
  cardQuote?: string;
  cardSignature?: string;
  cardKanji?: string;
  storyLabel?: string;
  storyHeading?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  pillars: BrandStoryPillar[];
  craftTiles: BrandStoryTile[];
}

export type JapanesePatternPreset =
  | 'seigaiha'
  | 'asanoha'
  | 'shippo'
  | 'yagasuri'
  | 'kikko'
  | 'custom'
  | 'none';

export interface FooterConfig {
  patternPreset?: JapanesePatternPreset | string;
  customBgImageUrl?: string;
  bgColor?: string;
  overlayOpacity?: number;
  patternOpacity?: number;
  brandDescription?: string;
  openingDays?: string;
  openingHours?: string;
  closingNote?: string;
  addressNote?: string;
  copyrightText?: string;
}

export interface StoreConfig {
  id: string;
  key: string;
  customerOrderingEnabled: boolean;
  contactPhone: string;
  heroBanners?: HeroBannerItem[] | null;
  brandStory?: BrandStoryConfig | null;
  curatedCategories?: CuratedCategoryItem[] | null;
  culinaryNews?: CulinaryNewsItem[] | null;
  footerConfig?: FooterConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStoreConfigInput {
  customerOrderingEnabled?: boolean;
  contactPhone?: string;
  heroBanners?: HeroBannerItem[];
  brandStory?: BrandStoryConfig;
  curatedCategories?: CuratedCategoryItem[];
  culinaryNews?: CulinaryNewsItem[];
  footerConfig?: FooterConfig;
}
