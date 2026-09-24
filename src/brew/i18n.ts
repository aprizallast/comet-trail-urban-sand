import { Language } from './types.ts';

export interface TranslationDict {
  dbStatus: string;
  totalLaunches: string;
  trackedVol: string;
  ecosystemFdv: string;
  multiDevs: string;
  activeDexSub: string;
  volSub: string;
  mcapSub: string;
  multiDevsSub: string;
  tabRadar: string;
  tabCopilot: string;
  tabPicks: string;
  tabDevs: string;
  quickFilters: string;
  singleDev: string;
  alertAudioOn: string;
  alertAudioOff: string;
  trackContractBtn: string;
  trackCustomPh: string;
  searchPh: string;
  thRank: string;
  thToken: string;
  thPrice: string;
  thChange: string;
  thMcap: string;
  thMarketCap: string;
  thVol: string;
  thVolume24h: string;
  thLiq: string;
  thLiquidity: string;
  thDev: string;
  thScore: string;
  thActions: string;
  btnAnalyze: string;
  btnSwap: string;
  prevPage: string;
  nextPage: string;
  modalTitle: string;
  sec1Title: string;
  sec2Title: string;
  secPairTitle: string;
  sec3Title: string;
  sec4Title: string;
  sec5Title: string;
  newReleaseTitle: string;
  allTokens: string;
  newestReleases: string;
  withDexLiq: string;
  topGainers: string;
  topMcap: string;
  topVol: string;
  highestScore: string;
  serialDevRisk: string;
  copilotGreeting: string;
  copilotChip1: string;
  copilotChip2: string;
  copilotChip3: string;
  copilotChip4: string;
  copilotChip5: string;
  copilotChipPairScam: string;
  copilotInputPh: string;
  copilotSend: string;
  copilotTopPicksTitle: string;
  copilotRulesTitle: string;
  copilotRuleDev: string;
  copilotRuleLiq: string;
  copilotRuleOrder: string;
  copilotRuleSec: string;
  copilotRulePair: string;
  picksDesc: string;
  devClusterTitle: string;
  extremeSerial: string;
  repeatDev: string;
  liquidPairs: string;
  farmKing: string;
  liveOnline: string;
  totalVisitors: string;
  // Hall of Fame
  hofTitle: string;
  hofSubtitle: string;
  hofCritVol: string;
  hofCritChange: string;
  hofCritMcap: string;
  hofRank1Badge: string;
  hofRank2Badge: string;
  hofRank3Badge: string;
  hofInspectBtn: string;
  hofTradeBtn: string;
  hofPrice: string;
  hof24hChange: string;
  hofLiquidity: string;
  hofDev: string;
  hofAgentScore: string;
  // Marquee & Controls
  copyFactorySuccess: string;
  syncSuccess: string;
  syncing: string;
  syncBtn: string;
  copyBtn: string;
  // Pair Scam Audit Specific
  pairAuditTitle: string;
  pairAuditDesc: string;
  quoteAddressLabel: string;
  canonicalVerified: string;
  fakeQuoteWarning: string;
  customQuoteWarning: string;
  quoteTaxLabel: string;
  quoteHoneypotLabel: string;
}

export const I18N: Record<Language, TranslationDict> = {
  en: {
    dbStatus: '⚡ Supabase Connected',
    totalLaunches: 'Total Launchpad Tokens',
    trackedVol: 'Tracked 24h Volume',
    ecosystemFdv: 'Ecosystem FDV',
    multiDevs: 'Multi-Token Devs',
    activeDexSub: 'with DEX liquidity',
    volSub: 'PancakeSwap & BSC DEXs',
    mcapSub: 'Aggregate token valuation',
    multiDevsSub: 'Wallets launched >1 token (dump risk)',
    tabRadar: '📊 Token Radar & DEX Live',
    tabCopilot: '🤖 Copilot Terminal',
    tabPicks: '🏆 Hall of Fame & Top Picks',
    tabDevs: '🕵️ Dev Cluster Map',
    quickFilters: '⚡ Quick Filters:',
    singleDev: '🛡️ Single Dev (Focused)',
    alertAudioOn: '🔔 Alert Audio: ON',
    alertAudioOff: '🔕 Alert Audio: OFF',
    trackContractBtn: '+ Track Contract',
    trackCustomPh: 'Track custom BSC contract (enter 0x...)...',
    searchPh: 'Search token, symbol, contract, or dev in launches...',
    thRank: 'Rank / Token',
    thToken: 'Token',
    thPrice: 'Price (USD)',
    thChange: '24h Change',
    thMcap: 'Market Cap',
    thMarketCap: 'Market Cap',
    thVol: '24h Volume',
    thVolume24h: '24h Volume',
    thLiq: 'With DEX / Liq',
    thLiquidity: 'With DEX / Liquidity',
    thDev: 'Dev Cluster',
    thScore: 'Agent Score',
    thActions: 'Actions',
    btnAnalyze: 'Audit ↗',
    btnSwap: 'Trade ⚡',
    prevPage: '‹ Previous',
    nextPage: 'Next ›',
    modalTitle: 'Token Analysis & Dev Intel',
    sec1Title: '📊 MARKET METRICS & ORDER FLOW',
    sec2Title: '🤖 TACTICAL VERDICT & SECURITY AUDIT',
    secPairTitle: '🛡️ PAIR TOKEN & QUOTE SCAM AUDIT',
    sec3Title: '🕵️ DEVELOPER & TOP HOLDERS INTEL',
    sec4Title: '💰 PROFIT SIMULATOR (DYNAMIC ROI)',
    sec5Title: '📑 CONTRACT IDENTITY & VERIFICATION',
    newReleaseTitle: 'NEW TOKEN LAUNCH DETECTED!',
    allTokens: '🌐 All Tracked Tokens',
    newestReleases: '🆕 Newest Releases',
    withDexLiq: '💧 With DEX Liquidity',
    topGainers: '🚀 Top Gainers',
    topMcap: '🏆 Top MCap',
    topVol: '⚡ Top Volume',
    highestScore: '🤖 Highest Score',
    serialDevRisk: '🚨 Serial Dev Risk',
    copilotGreeting: 'Hello! I am Agent BREW Tactical Terminal.\nOperating deterministic intelligence analyzing 2,160+ token launches on brew.family (BNB Chain).\n\nSelect a tactical quick prompt below or type any token symbol (e.g. "BREW") or contract address (0x...) for instant audit, including Paired Quote Token (WBNB/USDT) scam verification!',
    copilotChip1: 'Top 3 High Conviction Picks',
    copilotChip2: 'Riskiest Serial Devs (>3 Tokens)',
    copilotChip3: 'Single-Dev Liquid Gems',
    copilotChip4: 'Top Volume Active Now',
    copilotChip5: '5 Freshest Launches',
    copilotChipPairScam: '🛡️ Pair Token & WBNB Scam Check',
    copilotInputPh: "Ask Agent BREW (e.g. 'top picks', 'safe dev gems', 'pair scam check', 'BREW')...",
    copilotSend: 'Send',
    copilotTopPicksTitle: '💎 HIGH CONVICTION PICKS',
    copilotRulesTitle: '⚙️ AGENT RULES ENGINE',
    copilotRuleDev: 'Dev Filtering: Deployers with >3 launches penalized for serial dump risk.',
    copilotRuleLiq: 'Liquidity Threshold: Liquidity >$1,000 WBNB receives high stability weighting.',
    copilotRuleOrder: 'Order Flow Radar: Real-time buyer accumulation vs seller pressure ratio.',
    copilotRuleSec: 'Security Scanner: Instant honeypot & buy/sell tax checks via GoPlus BSC Security.',
    copilotRulePair: 'Pair Scam Auditor: Automatic verification of Paired Quote Tokens (WBNB, USDT, USDC) against canonical BSC contracts to prevent fake-token liquidity traps.',
    picksDesc: 'Curated high-conviction token radar filtered by Agent BREW algorithms based on active DEX liquidity depth, buyer accumulation pressure, clean single-developer history, verified quote token contracts, and sustained 24h trading volume on BNB Chain.',
    devClusterTitle: 'Developer Wallet Clustering',
    extremeSerial: '🚨 Extreme Serial (≥5)',
    repeatDev: '⚠️ Repeat (3-4 launches)',
    liquidPairs: '💧 Active Liquidity Pools',
    farmKing: '👑 Farm King Record',
    liveOnline: 'online',
    totalVisitors: 'visits',
    hofTitle: 'Hall of Fame · Champions Podium',
    hofSubtitle: 'Real-time on-chain pinnacle rankings computed across 2,160+ BSC Brew launches',
    hofCritVol: '24H Volume',
    hofCritChange: '24H Gainers',
    hofCritMcap: 'Market Cap',
    hofRank1Badge: '👑 GRAND CHAMPION · #1',
    hofRank2Badge: '🥈 RUNNER-UP · #2',
    hofRank3Badge: '🥉 BRONZE · #3',
    hofInspectBtn: 'Deep Audit',
    hofTradeBtn: 'Trade DEX',
    hofPrice: 'Price',
    hof24hChange: '24h Change',
    hofLiquidity: 'Liquidity',
    hofDev: 'Dev',
    hofAgentScore: 'Agent Score',
    copyFactorySuccess: 'BrewFactory address copied to clipboard!',
    syncSuccess: 'Database synced successfully!',
    syncing: 'Syncing...',
    syncBtn: 'Sync Database',
    copyBtn: 'Copy Factory',
    pairAuditTitle: 'Pair Token & Quote Security Audit',
    pairAuditDesc: 'Verifies the paired quote contract (WBNB/USDT/USDC) against canonical BSC addresses to detect fake quote token scams.',
    quoteAddressLabel: 'Quote Contract (WBNB/Paired)',
    canonicalVerified: '✓ Canonical Verified BSC Contract',
    fakeQuoteWarning: '🚨 FAKE QUOTE TOKEN SCAM DETECTED!',
    customQuoteWarning: '⚠️ Custom Unverified Quote Contract',
    quoteTaxLabel: 'Quote Token Tax',
    quoteHoneypotLabel: 'Quote Honeypot Status'
  },
  id: {
    dbStatus: '⚡ Terhubung ke Supabase',
    totalLaunches: 'Total Token Launchpad',
    trackedVol: 'Volume 24 Jam Terpantau',
    ecosystemFdv: 'FDV Ekosistem',
    multiDevs: 'Dev Multi-Token',
    activeDexSub: 'dengan likuiditas DEX',
    volSub: 'PancakeSwap & DEX BSC',
    mcapSub: 'Agregat valuasi token',
    multiDevsSub: 'Dompet meluncurkan >1 token (risiko dump)',
    tabRadar: '📊 Radar Token & DEX Live',
    tabCopilot: '🤖 Terminal Copilot',
    tabPicks: '🏆 Hall of Fame & Pilihan Teratas',
    tabDevs: '🕵️ Peta Kluster Dev',
    quickFilters: '⚡ Filter Cepat:',
    singleDev: '🛡️ Dev Tunggal (Fokus)',
    alertAudioOn: '🔔 Audio Peringatan: AKTIF',
    alertAudioOff: '🔕 Audio Peringatan: NONAKTIF',
    trackContractBtn: '+ Pantau Kontrak',
    trackCustomPh: 'Pantau kontrak BSC custom (masukkan 0x...)...',
    searchPh: 'Cari token, simbol, kontrak, atau dev...',
    thRank: 'Peringkat / Token',
    thToken: 'Token',
    thPrice: 'Harga (USD)',
    thChange: 'Perubahan 24j',
    thMcap: 'Kapitalisasi Pasar',
    thMarketCap: 'Kapitalisasi Pasar',
    thVol: 'Volume 24j',
    thVolume24h: 'Volume 24j',
    thLiq: 'Likuiditas DEX',
    thLiquidity: 'Likuiditas DEX',
    thDev: 'Kluster Dev',
    thScore: 'Skor AI',
    thActions: 'Aksi',
    btnAnalyze: 'Audit ↗',
    btnSwap: 'Trade ⚡',
    prevPage: '‹ Sebelumnya',
    nextPage: 'Berikutnya ›',
    modalTitle: 'Analisis Mendalam Token & Intel Dev',
    sec1Title: '📊 METRIK PASAR & ALIRAN ORDER',
    sec2Title: '🤖 KEPUTUSAN TAKTIS & AUDIT KEAMANAN TOKEN',
    secPairTitle: '🛡️ AUDIT KEAMANAN PAIR & TOKEN SCAM (WBNB/QUOTE)',
    sec3Title: '🕵️ INTEL DEVELOPER & TOP 10 HOLDER',
    sec4Title: '💰 SIMULATOR KEUNTUNGAN (ROI DINAMIS)',
    sec5Title: '📑 IDENTITAS KONTRAK & VERIFIKASI ON-CHAIN',
    newReleaseTitle: 'TOKEN BARU DILUNCURKAN!',
    allTokens: '🌐 Semua Token',
    newestReleases: '🆕 Rilis Terbaru',
    withDexLiq: '💧 Likuiditas DEX',
    topGainers: '🚀 Top Kenaikan',
    topMcap: '🏆 Top Kapitalisasi Pasar',
    topVol: '⚡ Top Volume',
    highestScore: '🤖 Skor Tertinggi',
    serialDevRisk: '🚨 Risiko Serial Dev',
    copilotGreeting: 'Halo! Saya Terminal Taktis Agent BREW.\nMenjalankan analisis otomatis terhadap 2.160+ token di brew.family (BNB Chain).\n\nPilih prompt cepat di bawah atau masukkan simbol token (contoh: "BREW") atau alamat kontrak (0x...) untuk audit instan — termasuk deteksi pair scam & verifikasi alamat quote token (WBNB/USDT)!',
    copilotChip1: '3 Pilihan Keyakinan Tinggi Teratas',
    copilotChip2: 'Serial Dev Berisiko (>3 Token)',
    copilotChip3: 'Permata Dev Tunggal Likuid',
    copilotChip4: 'Volume Tertinggi Saat Ini',
    copilotChip5: '5 Peluncuran Paling Baru',
    copilotChipPairScam: '🛡️ Cek Pair Token Scam (WBNB)',
    copilotInputPh: "Tanya Agent BREW (contoh: 'cek pair scam', 'pilihan aman', 'BREW')...",
    copilotSend: 'Kirim',
    copilotTopPicksTitle: '💎 PILIHAN KEYAKINAN TINGGI',
    copilotRulesTitle: '⚙️ ATURAN MESIN ANALISIS',
    copilotRuleDev: 'Penyaringan Dev: Pembuat dengan >3 peluncuran dipenalti karena risiko serial dump.',
    copilotRuleLiq: 'Ambang Likuiditas: Likuiditas >$1.000 WBNB mendapat bobot stabilitas tinggi.',
    copilotRuleOrder: 'Radar Order Flow: Pemantauan rasio akumulasi pembeli vs tekanan penjual.',
    copilotRuleSec: 'Pemindai Keamanan: Audit honeypot & pajak jual/beli instan via GoPlus BSC Security.',
    copilotRulePair: 'Audit Pair Scam: Verifikasi otomatis token quote pasangan (WBNB, USDT, USDC) terhadap kontrak kanonikal resmi BSC guna mencegah penipuan likuiditas palsu.',
    picksDesc: 'Radar token terkurasi oleh algoritma Agent BREW berdasarkan kedalaman likuiditas DEX, akumulasi pembeli, riwayat pengembang bersih, verifikasi kontrak pair resmi, dan volume transaksi berkelanjutan di BNB Chain.',
    devClusterTitle: 'Kluster Dompet Developer',
    extremeSerial: '🚨 Serial Ekstrem (≥5)',
    repeatDev: '⚠️ Pengulang (3-4 kali)',
    liquidPairs: '💧 Pool Likuiditas Aktif',
    farmKing: '👑 Rekor Peluncur Terbanyak',
    liveOnline: 'online',
    totalVisitors: 'kunjungan',
    hofTitle: 'Hall of Fame · Podium Juara',
    hofSubtitle: 'Peringkat puncak on-chain dihitung secara real-time dari 2.160+ peluncuran BSC Brew',
    hofCritVol: 'Volume 24 Jam',
    hofCritChange: 'Top Kenaikan 24j',
    hofCritMcap: 'Kapitalisasi Pasar',
    hofRank1Badge: '👑 JUARA UTAMA · #1',
    hofRank2Badge: '🥈 JUARA KEDUA · #2',
    hofRank3Badge: '🥉 JUARA KETIGA · #3',
    hofInspectBtn: 'Audit Mendalam',
    hofTradeBtn: 'Trade DEX',
    hofPrice: 'Harga',
    hof24hChange: 'Perubahan 24j',
    hofLiquidity: 'Likuiditas',
    hofDev: 'Developer',
    hofAgentScore: 'Skor AI',
    copyFactorySuccess: 'Alamat BrewFactory berhasil disalin!',
    syncSuccess: 'Database berhasil disinkronkan!',
    syncing: 'Sinkronisasi...',
    syncBtn: 'Sinkron Database',
    copyBtn: 'Salin Factory',
    pairAuditTitle: 'Audit Keamanan Pair & Token Pasangan',
    pairAuditDesc: 'Memeriksa kontrak token quote (WBNB/USDT/USDC) terhadap alamat resmi BSC untuk mendeteksi penipuan token palsu.',
    quoteAddressLabel: 'Alamat Kontrak Quote (WBNB/Pasangan)',
    canonicalVerified: '✓ Kontrak Kanonikal Resmi BSC Terverifikasi',
    fakeQuoteWarning: '🚨 TERDETEKSI TOKEN QUOTE PALSU (SCAM)!',
    customQuoteWarning: '⚠️ Kontrak Token Quote Kustom Belum Terverifikasi',
    quoteTaxLabel: 'Pajak Token Quote',
    quoteHoneypotLabel: 'Status Honeypot Quote'
  },
  zh: {
    dbStatus: '⚡ Supabase 已连接',
    totalLaunches: '发射台代币总数',
    trackedVol: '24小时追踪交易量',
    ecosystemFdv: '生态总流通市值',
    multiDevs: '多币开发者',
    activeDexSub: '具有 DEX 流动性',
    volSub: 'PancakeSwap 及 BSC DEX',
    mcapSub: '代币综合估值',
    multiDevsSub: '发布超1个代币的钱包 (存在抛售风险)',
    tabRadar: '📊 代币雷达与实时 DEX',
    tabCopilot: '🤖 战术智能终端',
    tabPicks: '🏆 名人堂与榜首精选',
    tabDevs: '🕵️ 开发者关联图谱',
    quickFilters: '⚡ 快捷筛选:',
    singleDev: '🛡️ 单一开发者 (专注)',
    alertAudioOn: '🔔 提示音效: 开启',
    alertAudioOff: '🔕 提示音效: 关闭',
    trackContractBtn: '+ 追踪合约',
    trackCustomPh: '追踪自定义 BSC 合约 (输入 0x...)...',
    searchPh: '搜索代币、符号、合约或开发者地址...',
    thRank: '排名 / 代币',
    thToken: '代币',
    thPrice: '价格 (美元)',
    thChange: '24小时涨跌',
    thMcap: '市值',
    thMarketCap: '市值',
    thVol: '24小时交易量',
    thVolume24h: '24小时交易量',
    thLiq: '流动性',
    thLiquidity: '流动性',
    thDev: '开发者关联',
    thScore: 'AI 评分',
    thActions: '交易操作',
    btnAnalyze: '深度分析 ↗',
    btnSwap: '快速交易 ⚡',
    prevPage: '‹ 上一页',
    nextPage: '下一页 ›',
    modalTitle: '代币深度分析与开发者情报',
    sec1Title: '📊 市场指标与订单流',
    sec2Title: '🤖 AI 策略研判与安全审计',
    secPairTitle: '🛡️ 配对交易对与代币诈骗审计 (WBNB/Quote)',
    sec3Title: '🕵️ 开发者与前十持币者情报',
    sec4Title: '💰 利润模拟器 (动态收益率)',
    sec5Title: '📑 合约身份验证与区块数据',
    newReleaseTitle: '检测到新代币发射！',
    allTokens: '🌐 全部追踪代币',
    newestReleases: '🆕 最新发布',
    withDexLiq: '💧 具备 DEX 流动性',
    topGainers: '🚀 涨幅榜前列',
    topMcap: '🏆 市值榜首',
    topVol: '⚡ 交易量榜首',
    highestScore: '🤖 最高评分',
    serialDevRisk: '🚨 连环发币风险',
    copilotGreeting: '您好！我是 Agent BREW 战术智能终端。\n运行确定性算法，实时监控 brew.family (BNB Chain) 上的 2,160+ 代币发射。\n\n请点击下方快捷指令或输入代币符号 (如 "BREW")、合约地址 (0x...) 即可进行即时审计，包含交易对配对代币 (WBNB/USDT) 防伪审计！',
    copilotChip1: '前 3 高确信度精选',
    copilotChip2: '极高风险连环发币者 (>3代币)',
    copilotChip3: '单一开发者流动性代币',
    copilotChip4: '当前最高交易量代币',
    copilotChip5: '最新发布的 5 个代币',
    copilotChipPairScam: '🛡️ 交易对防伪与 WBNB 假币审计',
    copilotInputPh: '向 Agent BREW 提问 (如 "top picks", "安全代币", "交易对检查", "BREW")...',
    copilotSend: '发送',
    copilotTopPicksTitle: '💎 高确信度精选',
    copilotRulesTitle: '⚙️ 智能分析引擎规则',
    copilotRuleDev: '开发者过滤：发币超过3次的开发者会被扣分以防范连环抛售跑路风险。',
    copilotRuleLiq: '流动性阈值：资金池大于 $1,000 WBNB 将获得极高的稳定性权重。',
    copilotRuleOrder: '订单流雷达：实时买方累积与卖方抛压比率监测。',
    copilotRuleSec: '安全扫描：通过 GoPlus BSC 安全审计即时检查蜜罐及买卖滑点税。',
    copilotRulePair: '交易对防伪审计：自动对比配对资产合约 (WBNB, USDT, USDC) 是否为 BSC 官方规范合约，防止假币假流动性骗局。',
    picksDesc: '基于 DEX 深度流动性、买方累积压力、单一开发者信誉、官方规范配对代币认证以及 BNB 链上持续 24 小时交易量，由 Agent BREW 算法严格筛选的高确信度代币雷达。',
    devClusterTitle: '开发者钱包聚类图谱',
    extremeSerial: '🚨 极高频连环发币者 (≥5)',
    repeatDev: '⚠️ 重复发币者 (3-4次)',
    liquidPairs: '💧 活跃流动性池',
    farmKing: '👑 历史发币之王',
    liveOnline: '在线',
    totalVisitors: '访问',
    hofTitle: '名人堂 · 荣耀领奖台',
    hofSubtitle: '基于链上流动性池与 DEX 实盘数据实时计算出的殿堂级代币',
    hofCritVol: '24H 交易量',
    hofCritChange: '24H 涨幅榜',
    hofCritMcap: '市值总额',
    hofRank1Badge: '👑 殿堂冠军 · 第 1 名',
    hofRank2Badge: '🥈 亚军代币 · 第 2 名',
    hofRank3Badge: '🥉 季军代币 · 第 3 名',
    hofInspectBtn: '深度审计',
    hofTradeBtn: '立即交易',
    hofPrice: '单价',
    hof24hChange: '24H 涨跌',
    hofLiquidity: '流动性',
    hofDev: '开发者',
    hofAgentScore: '评分',
    copyFactorySuccess: 'BrewFactory 合约地址已复制到剪贴板！',
    syncSuccess: '数据库已成功同步！',
    syncing: '同步中...',
    syncBtn: '同步数据库',
    copyBtn: '复制合约',
    pairAuditTitle: '配对代币与交易对安全审计',
    pairAuditDesc: '自动核验配对代币 (WBNB/USDT/USDC) 是否为 BSC 官方正品合约，杜绝假币流动性骗局。',
    quoteAddressLabel: '配对代币合约 (WBNB/Quote)',
    canonicalVerified: '✓ 官方 BSC 规范合约认证通过',
    fakeQuoteWarning: '🚨 警报：检测到伪造配对代币 (假 WBNB 骗局)！',
    customQuoteWarning: '⚠️ 自定义未认证配对代币',
    quoteTaxLabel: '配对代币滑点税',
    quoteHoneypotLabel: '配对代币蜜罐检测'
  },
  ja: {
    dbStatus: '⚡ Supabase 接続中',
    totalLaunches: 'ローンチパッド総トークン数',
    trackedVol: '24時間追跡取引高',
    ecosystemFdv: 'エコシステム完全希薄化後時価総額',
    multiDevs: '複数トークン開発者',
    activeDexSub: 'DEX 流動性保有',
    volSub: 'PancakeSwap & BSC DEX',
    mcapSub: '集計トークン評価額',
    multiDevsSub: '2つ以上のトークンを発行したウォレット（ダンプリスク）',
    tabRadar: '📊 トークンレーダー & DEX ライブ',
    tabCopilot: '🤖 戦術コパイロット端末',
    tabPicks: '🏆 殿堂入りポディウム & 厳選銘柄',
    tabDevs: '🕵️ 開発者クラスターマップ',
    quickFilters: '⚡ クイックフィルター:',
    singleDev: '🛡️ 単一開発者 (専念型)',
    alertAudioOn: '🔔 アラート音声: ON',
    alertAudioOff: '🔕 アラート音声: OFF',
    trackContractBtn: '+ コントラクト追跡',
    trackCustomPh: 'カスタムBSCコントラクト追跡 (0x...を入力)...',
    searchPh: 'トークン名、シンボル、コントラクト、開発者アドレスを検索...',
    thRank: '順位 / トークン',
    thToken: 'トークン',
    thPrice: '価格 (USD)',
    thChange: '24時間変動率',
    thMcap: '時価総額',
    thMarketCap: '時価総額',
    thVol: '24時間取引高',
    thVolume24h: '24時間取引高',
    thLiq: '流動性',
    thLiquidity: '流動性',
    thDev: '開発者クラスター',
    thScore: 'AIスコア',
    thActions: 'アクション',
    btnAnalyze: '精密監査 ↗',
    btnSwap: 'スワップ ⚡',
    prevPage: '‹ 前へ',
    nextPage: '次へ ›',
    modalTitle: 'トークン詳細分析 & 開発者インテル',
    sec1Title: '📊 市場指標 & オーダーフロー',
    sec2Title: '🤖 戦術的判定 & セキュリティ監査',
    secPairTitle: '🛡️ ペアトークン & 偽装詐欺監査 (WBNB/Quote)',
    sec3Title: '🕵️ 開発者 & 大口保有者インテル',
    sec4Title: '💰 利益シミュレーター (動的ROI)',
    sec5Title: '📑 コントラクト検証 & ブロックデータ',
    newReleaseTitle: '新規トークンローンチ検知！',
    allTokens: '🌐 すべての追跡トークン',
    newestReleases: '🆕 最新リリース',
    withDexLiq: '💧 DEX 流動性あり',
    topGainers: '🚀 上昇率トップ',
    topMcap: '🏆 時価総額トップ',
    topVol: '⚡ 取引高トップ',
    highestScore: '🤖 最高AIスコア',
    serialDevRisk: '🚨 連続発行者リスク',
    copilotGreeting: 'こんにちは！Agent BREW 戦術ターミナルです。\nbrew.family (BNB Chain) 上の 2,160+ トークンをリアルタイム監査しています。\n\n下記のクイックプロンプトを選択するか、トークンシンボル (例: "BREW") やコントラクトアドレス (0x...) を入力して即時監査を開始してください（ペアトークン WBNB 偽装詐欺チェック対応）！',
    copilotChip1: '高確信トップ3厳選銘柄',
    copilotChip2: '最高リスク連続発行者 (>3トークン)',
    copilotChip3: '単一開発者・高流動性ジェム',
    copilotChip4: '現在最高取引高銘柄',
    copilotChip5: '最新5トークンローンチ',
    copilotChipPairScam: '🛡️ ペアトークン詐欺 (WBNB) 監査',
    copilotInputPh: "Agent BREW に質問 (例: 'top picks', 'ペア詐欺チェック', 'BREW')...",
    copilotSend: '送信',
    copilotTopPicksTitle: '💎 高確信厳選ピック',
    copilotRulesTitle: '⚙️ AIルールエンジン',
    copilotRuleDev: '開発者フィルタリング: 3回以上ローンチした開発者は連続売り抜けリスクとして減点。',
    copilotRuleLiq: '流動性しきい値: 流动性 $1,000 WBNB 超過で高い安定性加点。',
    copilotRuleOrder: 'オーダーフローレーダー: 買い手蓄積と売り圧力比率をリアルタイム監視。',
    copilotRuleSec: 'セキュリティスキャナー: GoPlus BSC Securityによるハニーポットおよび売買税の即時監査。',
    copilotRulePair: 'ペア詐欺監査: ペア相手となるQuoteトークン (WBNB, USDT, USDC) がBSC正規公式コントラクトであるかを自動照合し、偽装詐欺を防止。',
    picksDesc: 'DEXの深い流動性、買い手の蓄積圧力、クリーンな単一開発者の実績、正規公式ペア検証、およびBNB Chain上の持続的な24時間取引高に基づいてAgent BREWアルゴリズムが厳選した高確信トークンレーダー。',
    devClusterTitle: '開発者ウォレットクラスタリング',
    extremeSerial: '🚨 超高頻度連続発行者 (≥5)',
    repeatDev: '⚠️ 複数回発行者 (3-4回)',
    liquidPairs: '💧 アクティブ流動性プール',
    farmKing: '👑 歴代発行記録ホルダー',
    liveOnline: 'オンライン',
    totalVisitors: 'アクセス',
    hofTitle: '殿堂入り · チャンピオンポディウム',
    hofSubtitle: '2,160+ の BSC Brew ローンチからオンチェーン流動性とDEX取引でリアルタイム算出された最高峰トークン',
    hofCritVol: '24H 取引高',
    hofCritChange: '24H 上昇率',
    hofCritMcap: '時価総額',
    hofRank1Badge: '👑 グランドチャンピオン · 第1位',
    hofRank2Badge: '🥈 準優勝 · 第2位',
    hofRank3Badge: '🥉 第3位 · ブロンズ',
    hofInspectBtn: '精密監査',
    hofTradeBtn: 'DEX 取引',
    hofPrice: '現在価格',
    hof24hChange: '24H 変動率',
    hofLiquidity: '流動性',
    hofDev: '開発者',
    hofAgentScore: 'AIスコア',
    copyFactorySuccess: 'BrewFactory コントラクトアドレスをコピーしました！',
    syncSuccess: 'データベースの同期が完了しました！',
    syncing: '同期中...',
    syncBtn: 'データベース同期',
    copyBtn: 'コントラクト複製',
    pairAuditTitle: 'ペアトークン & クォート偽装監査',
    pairAuditDesc: 'ペア相手のクォートトークン (WBNB/USDT/USDC) をBSC正規コントラクトと照合し偽装詐欺を検知。',
    quoteAddressLabel: 'ペアトークンアドレス (WBNB/Quote)',
    canonicalVerified: '✓ BSC 正規公式コントラクト照合済み',
    fakeQuoteWarning: '🚨 偽装クォートトークン詐欺を検知！',
    customQuoteWarning: '⚠️ 未検証カスタムクォートコントラクト',
    quoteTaxLabel: 'ペアトークン売買税',
    quoteHoneypotLabel: 'ペアトークンハニーポット状況'
  }
};
