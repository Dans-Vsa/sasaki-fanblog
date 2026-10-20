/* Non-text data: images, video IDs, links. All visible text lives in /i18n/*.json. */

export const IMG = 'assets/img/';

export const VIDEOS = [
  { id: 'X8QT4C95p4Y', thumb: 'yt-X8QT4C95p4Y-1280.webp', thumbSm: 'yt-X8QT4C95p4Y-800.webp' }, // Sasaki special PV (avex pictures)
  { id: 'xDsN2cmAlhQ', thumb: 'yt-xDsN2cmAlhQ-800.webp', thumbSm: 'yt-xDsN2cmAlhQ-800.webp' },   // 17-26 trailer (avex pictures)
];

// Character art from the official anime site. Order matches i18n "chars".
export const CHARS = {
  sasaki: { img: 'chara-sasaki.webp', bg: 'chara-sasaki-bg.webp', icon: 'icon-sasaki.webp', jp: '佐々木くん', cv: ['熊谷俊輝', 'Toshiki Kumagai'], cvEn: 'Stephen Fu' },
  kawaguchi: { img: 'chara-kawaguchi.webp', bg: 'chara-kawaguchi-bg.webp', icon: 'icon-kawaguchi.webp', jp: '川口千恵子', cv: ['安済知佳', 'Chika Anzai'], cvEn: 'Brittany Cox' },
  kuwano: { img: 'chara-kuwano.webp', bg: 'chara-kuwano-bg.webp', icon: 'icon-kuwano.webp', jp: '桑野', cv: ['岡野陽一', 'Yoichi Okano'], cvEn: 'Cory Yee' },
};

// Covers: src null = placeholder the owner fills in manually (see README).
export const COVERS = [
  { src: 'cover-1721-760.webp', sm: 'cover-1721-400.webp', w: 760, h: 1197 },
  { src: 'cover-2226-400.webp', sm: 'cover-2226-400.webp', w: 400, h: 630 },
  { src: null, w: 400, h: 600 },
];

// Scene strip: official anime press stills (animatetimes interview, © 17-26 committee).
// Short manga panel excerpts can replace them later: put a WebP in assets/img/panels/ and change src.
export const PANELS = [
  { src: 'panels/scene-1.webp' },
  { src: 'panels/scene-2.webp' },
  { src: 'panels/scene-3.webp' },
  { src: 'panels/scene-4.webp' },
  { src: 'panels/scene-5.webp' },
];

// Anime gallery. Order matches i18n "anime.gallery".
export const GALLERY = [
  { src: 'kv-1080.webp', sm: 'kv-640.webp', w: 1080, h: 1519 },
  { src: 'yt-X8QT4C95p4Y-1280.webp', sm: 'yt-X8QT4C95p4Y-800.webp', w: 1280, h: 720 },
  { src: 'chara-sasaki.webp', w: 825, h: 1100, contain: true },
  { src: 'chara-kawaguchi.webp', w: 825, h: 1100, contain: true },
  { src: 'chara-kuwano.webp', w: 825, h: 1100, contain: true },
  { src: 'anime-kv-1200.webp', w: 1200, h: 840 },
];

export const LINKS = {
  jumpPlus: 'https://shonenjumpplus.com/episode/17107094912077655847',
  viz: 'https://www.viz.com/read/manga/tatsuki-fujimoto-before-chainsaw-man/product/7330',
  shueisha: 'https://www.shueisha.co.jp/books/items/contents.html?jdcn=08X10000000016963500',
  official: 'https://fujimototatsuki17-26.com/story/sasaki/',
  prime: 'https://www.primevideo.com/', // title page differs per region; search "Tatsuki Fujimoto 17-26"
};

// Fujimoto network (cross-project). Order matches i18n "world.cards".
export const WORLD = [
  { url: 'https://dans-vsa.github.io/fujimoto-archive/', img: 'cover-1721-400.webp', tone: '#0f1012', mark: 'FA' },
  { url: 'https://dans-vsa.github.io/before-chainsaw-man-fanblog/17-21/#sasaki', img: 'cover-1721-400.webp', tone: '#f66a2a', mark: '17' },
  { url: 'https://dans-vsa.github.io/niwatori-fanblog/', img: null, tone: '#fffaf0', mark: 'ニワ' },
  { url: 'https://dans-vsa.github.io/goodbye-eri-fanblog/', img: null, tone: '#0a0a0a', mark: 'REC' },
];
