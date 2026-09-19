export interface PostFrontmatter {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  category: string;
  draft?: boolean;
  coverImage?: string;
  cover?: string;
  images?: string[];
  author?: string;
  categories?: string[];
  recommend?: number;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  category: string;
  readingTime: string;
  wordCount: number;
  content: string;
  toc: TOCItem[];
  draft?: boolean;
  coverImage?: string;
  recommend?: number;
}

export interface FriendItem {
  id: number | string;
  name: string;
  desc?: string;
  avatar?: string;
  link: string;
  order?: number;
  tags?: string[];
  framework?: string;
  deploy?: string;
}

export interface SocialLink {
  name: string;
  icon: 'github' | 'bilibili' | 'x' | 'email' | 'weibo' | 'juejin' | 'zhihu' | 'telegram' | 'discord' | 'weixin' | 'qq' | 'custom' | string;
  url: string;
  qr?: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  enabled?: boolean;
  isExternal?: boolean;
}

export interface FooterNavColumn {
  title: string;
  links: Array<{ label: string; href: string; isExternal?: boolean }>;
}

export interface TechStackItem {
  name: string;
  icon?: string;
  desc?: string;
}

export interface TechStackCategory {
  category: string;
  items: TechStackItem[];
}

export interface AboutProject {
  name: string;
  desc: string;
  url: string;
  homepage?: string;
  language?: string;
  stars?: number;
  role: 'author' | 'contributor';
  featured?: boolean;
  pushedAt?: string;
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  description: string;
  url: string;
  favicon?: string;
  keywords?: string[];
  analytics?: {
    gtmId?: string;
    gaId?: string;
    clarityId?: string;
  };
  author: {
    name: string;
    avatar: string;
    description: string;
    email: string;
    github: string;
    location?: string;
    statusBadge?: string;
    socials: SocialLink[];
  };
  home?: {
    hero?: {
      greeting?: string;
      highlightRole?: string;
      skillsPills?: string;
      quote?: string;
      showMetrics?: boolean;
      showSocials?: boolean;
      onlineStatus?: 'online' | 'busy' | 'away' | 'offline';
    };
    sections?: {
      postsLimit?: number;
      postsTitle?: string;
      diariesLimit?: number;
      diariesTitle?: string;
      saysLimit?: number;
      saysTitle?: string;
    };
  };
  about?: {
    identityTitle?: string;
    quote?: string;
    bio?: string;
    techStackTitle?: string;
    techStackDesc?: string;
    techCategories?: TechStackCategory[];
    awardsTitle?: string;
    awards?: string[];
    projectsTitle?: string;
    projects?: AboutProject[];
    designTitle?: string;
    designPhilosophy?: string;
  };
  announcement?: {
    enabled?: boolean;
    badge?: string;
    content: string;
    linkText?: string;
    linkUrl?: string;
  };
  postsPage?: {
    title?: string;
    subtitle?: string;
  };
  diariesPage?: {
    title?: string;
    subtitle?: string;
  };
  saysPage?: {
    title?: string;
    subtitle?: string;
    pageSize?: number;
  };
  archivesPage?: {
    title?: string;
    subtitle?: string;
  };
  friendsPage?: {
    title?: string;
    subtitle?: string;
    guideTitle?: string;
    guideText?: string;
    template?: {
      name?: string;
      desc?: string;
      url?: string;
      avatar?: string;
    };
  };
  header?: {
    navLinks?: NavLinkItem[];
    enableMegaMenu?: boolean;
    enableSearch?: boolean;
  };
  footer: {
    copyright: string;
    sinceYear: number;
    sinceDate?: string;
    customText: string;
    icp?: string;
    icpUrl?: string;
    motto?: string;
    navColumns?: FooterNavColumn[];
    showThemeToggle?: boolean;
    showRss?: boolean;
    showSitemap?: boolean;
  };
}

export interface Diary {
  slug: string;
  title: string;
  date: string;
  time?: string;
  weather?: string;
  mood?: string;
  location?: string;
  tags: string[];
  summary: string;
  content: string;
  readingTime: string;
  wordCount: number;
}

export interface RecordItem {
  id: number | string;
  content: string;
  likes?: number;
  mood?: string;
  location?: string;
  createTime: number | string;
  author?: string;
  contentType?: 'plain' | 'markdown';
  media?: RecordContentBlock[];
  comments?: RecordComment[];
  pinned?: boolean;
}

export interface RecordComment {
  id: string;
  content: string;
  author: string;
  createdAt: number;
  local?: boolean;
}

export type RecordContentBlock =
  | { type: 'image'; url: string; thumbnail?: string; alt?: string; width?: number; height?: number }
  | { type: 'video'; url: string; thumbnail?: string }
  | { type: 'link'; url: string; title?: string; description?: string; image?: string }
  | { type: 'music'; title: string; artist?: string; cover?: string; url: string }
  | { type: 'douban-book' | 'douban-movie'; title: string; cover?: string; description?: string; url?: string };

export interface SearchItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  slug: string;
  type: 'post' | 'diary';
  date: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
