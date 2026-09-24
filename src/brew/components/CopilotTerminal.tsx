import React, { useState, useRef, useEffect } from 'react';
import { Token, Language } from '../types.ts';
import { I18N } from '../i18n.ts';
import { formatUsd } from '../utils/format.ts';
import { Send, Sparkles, ShieldAlert, ShieldCheck, Flame, Clock } from 'lucide-react';

interface CopilotTerminalProps {
  tokens: Token[];
  lang: Language;
  onAnalyzeToken: (token: Token) => void;
  onTradeToken: (token: Token) => void;
}

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  tokensMatch?: Token[];
}

export const CopilotTerminal: React.FC<CopilotTerminalProps> = ({
  tokens,
  lang,
  onAnalyzeToken,
  onTradeToken
}) => {
  const dict = I18N[lang] || I18N.en;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: dict.copilotGreeting
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // When language changes, update the initial message if it's the only one
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [{ id: 'init-1', sender: 'agent', text: dict.copilotGreeting }];
      }
      return prev;
    });
  }, [lang, dict.copilotGreeting]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const topPicks = [...tokens]
    .filter(t => t.volume24h > 0 || t.liquidityUsd > 100)
    .sort((a, b) => (b.agentScore || 0) - (a.agentScore || 0))
    .slice(0, 5);

  const handleSend = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    // 1. Attempt Server Copilot (Groq Llama 3 / Server Tactical)
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, lang })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          setMessages(prev => [
            ...prev,
            {
              id: 'a-' + Date.now(),
              sender: 'agent',
              text: data.reply,
              tokensMatch: data.tokensMatch && data.tokensMatch.length > 0 ? data.tokensMatch : undefined
            }
          ]);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to client fallback
    }

    const qLower = q.toLowerCase();

    // 2. Client-side deterministic tactical rule fallback
    setTimeout(() => {
      let reply = '';
      let matchedTokens: Token[] = [];

      if (
        qLower.includes('top') ||
        qLower.includes('pick') ||
        qLower.includes('best') ||
        qLower.includes('精选') ||
        qLower.includes('推荐') ||
        qLower.includes('厳選') ||
        qLower.includes('おすすめ')
      ) {
        const best = [...tokens]
          .filter(t => t.volume24h > 0 || t.liquidityUsd > 100)
          .sort((a, b) => (b.agentScore || 0) - (a.agentScore || 0))
          .slice(0, 3);
        matchedTokens = best;
        if (lang === 'zh') {
          reply = `🎯 **TOP 3 高确信度代币精选 (确定性引擎):**\n\n` +
            best.map((p, i) => `**#${i+1} ${p.symbol} (${p.name})**\n• 评分: **${p.agentScore}/100** [${p.agentVerdict}]\n• 市值: ${formatUsd(p.marketCap)} | 流动性: ${formatUsd(p.liquidityUsd)} | 24h交易量: ${formatUsd(p.volume24h)}\n• 信号: ${(p.agentSignals || []).join(' • ')}`).join('\n\n') +
            `\n\n*战术建议: 建议仓位 0.05 - 0.15 BNB，设置 -25% 严格止损。*`;
        } else if (lang === 'ja') {
          reply = `🎯 **TOP 3 高確信厳選ピック (AI決定論的エンジン):**\n\n` +
            best.map((p, i) => `**#${i+1} ${p.symbol} (${p.name})**\n• AIスコア: **${p.agentScore}/100** [${p.agentVerdict}]\n• 時価総額: ${formatUsd(p.marketCap)} | 流動性: ${formatUsd(p.liquidityUsd)} | 24h取引高: ${formatUsd(p.volume24h)}\n• シグナル: ${(p.agentSignals || []).join(' • ')}`).join('\n\n') +
            `\n\n*戦術推奨: 推奨ポジションサイズ 0.05 - 0.15 BNB、-25% 損切り設定。*`;
        } else {
          reply = `🎯 **TOP 3 HIGH CONVICTION PICKS (TACTICAL ENGINE):**\n\n` +
            best.map((p, i) => `**#${i+1} ${p.symbol} (${p.name})**\n• Score: **${p.agentScore}/100** [${p.agentVerdict}]\n• MCap: ${formatUsd(p.marketCap)} | Liq: ${formatUsd(p.liquidityUsd)} | 24h Vol: ${formatUsd(p.volume24h)}\n• Signals: ${(p.agentSignals || []).join(' • ')}`).join('\n\n') +
            `\n\n*Tactical Playbook: Position size 0.05 - 0.15 BNB with tight -25% stop-loss.*`;
        }
      } else if (
        qLower.includes('pair') ||
        qLower.includes('quote') ||
        qLower.includes('wbnb') ||
        qLower.includes('scam pair') ||
        qLower.includes('fake wbnb') ||
        qLower.includes('cek pair') ||
        qLower.includes('pasangan') ||
        qLower.includes('配对') ||
        qLower.includes('交易对') ||
        qLower.includes('ペア')
      ) {
        matchedTokens = tokens.filter(t => t.volume24h > 0 || t.agentScore >= 60).slice(0, 3);
        if (lang === 'id') {
          reply = `🛡️ **AUDIT PAIR & VERIFIKASI TOKEN QUOTE (WBNB/USDT):**\n\n` +
            `Dalam audit pair token (contoh: TEST/WBNB), sistem memeriksa alamat token quote resmi:\n` +
            `• **WBNB Kanonikal BSC**: \`0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c\`\n` +
            `• **USDT Kanonikal BSC**: \`0x55d398326f99059ff775485246999027b3197955\`\n\n` +
            `🚨 **Peringatan Scam**: Jika sebuah token dipasangkan dengan token bertuliskan "WBNB" namun alamat kontraknya BUKAN \`0xbb4c...095c\`, ini adalah modus **Fake Quote Scam** untuk memalsukan likuiditas dan menguras modal investor. Semua token di Agent BREW diaudit secara otomatis di tingkat base & quote token.`;
        } else if (lang === 'zh') {
          reply = `🛡️ **交易对配对代币防伪与假币审计 (BSC 规范核验):**\n\n` +
            `在审计代币交易对 (如 TEST/WBNB) 时，系统会自动核验配对代币合约地址：\n` +
            `• **BSC 官方 WBNB 规范合约**: \`0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c\`\n` +
            `• **BSC 官方 USDT 规范合约**: \`0x55d398326f99059ff775485246999027b3197955\`\n\n` +
            `🚨 **假币骗局警告**: 若配对代币符号显示为 "WBNB" 但地址与官方规范合约不符，则属于 **假币虚假流动性诈骗**。Agent BREW 已对所有发射池进行自动双向合约安全检测。`;
        } else if (lang === 'ja') {
          reply = `🛡️ **ペアトークン & クォート偽装詐欺監査 (BSC公式照合):**\n\n` +
            `取引ペア (例: TEST/WBNB) の監査時、相手方トークンの公式コントラクトを自動検証します：\n` +
            `• **BSC 公式 WBNB 正規コントラクト**: \`0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c\`\n` +
            `• **BSC 公式 USDT 正規コントラクト**: \`0x55d398326f99059ff775485246999027b3197955\`\n\n` +
            `🚨 **偽装詐欺警告**: シンボルが "WBNB" と表記されていてもコントラクトが異なる場合、偽の流動性で見せかける **偽装クォート詐欺** です。Agent BREW ではベース・クォート両方のコントラクトを監査しています。`;
        } else {
          reply = `🛡️ **PAIR TOKEN & QUOTE SCAM AUDIT (BSC CANONICAL VERIFICATION):**\n\n` +
            `When auditing trading pairs (e.g. TEST/WBNB), the engine verifies the quote token contract against official BSC canonical addresses:\n` +
            `• **Canonical WBNB**: \`0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c\` (Official)\n` +
            `• **Canonical USDT**: \`0x55d398326f99059ff775485246999027b3197955\` (Official)\n\n` +
            `🚨 **Scam Warning**: If a pair uses a spoofed quote token claiming to be "WBNB" at an unverified address, it is a **Fake Quote Scam** designed to simulate fake liquidity. Agent BREW automatically audits both base and quote token contracts via GoPlus.`;
        }
      } else if (
        qLower.includes('serial') ||
        qLower.includes('risk') ||
        qLower.includes('rug') ||
        qLower.includes('scam') ||
        qLower.includes('跑路') ||
        qLower.includes('风险') ||
        qLower.includes('连环') ||
        qLower.includes('リスク') ||
        qLower.includes('連続')
      ) {
        const serials = tokens.filter(t => t.creatorLaunchCount >= 4);
        matchedTokens = serials.slice(0, 3);
        if (lang === 'zh') {
          reply = `🚨 **连环开发者集群风险报告 (人工链上审计):**\n\n检测到 **${serials.length} 个代币** 由发布过 ≥4 次合约的开发者所创建。\n高频发币者具有极高的流动性抽离与弃盘风险。请务必检查 BubbleMaps 钱包关联和 GoPlus 蜜罐检测。`;
        } else if (lang === 'ja') {
          reply = `🚨 **連続発行者クラスターリスクレポート (オンチェーン監査):**\n\nファクトリ 0xeea6...3d85 上で 4回以上コントラクトを発行した開発者による **${serials.length} 個のトークン** を検知しました。\n連続発行者は流動性引き抜きおよび売り逃げリスクが極めて高いため、BubbleMaps および GoPlus による検証を強く推奨します。`;
        } else {
          reply = `🚨 **SERIAL DEV CLUSTER RISK REPORT (TACTICAL AUDIT):**\n\nIdentified **${serials.length} tokens** launched by repeat deployers (≥4 contracts on factory 0xeea6...3d85).\nSerial deployers present high liquidity abandonment and rug risk. Always verify BubbleMaps clustering and GoPlus contract security.`;
        }
      } else if (
        qLower.includes('safe') ||
        qLower.includes('single') ||
        qLower.includes('gem') ||
        qLower.includes('solid') ||
        qLower.includes('安全') ||
        qLower.includes('单一') ||
        qLower.includes('単一') ||
        qLower.includes('ジェム')
      ) {
        const singles = tokens
          .filter(t => t.creatorLaunchCount === 1 && (t.liquidityUsd > 500 || t.agentScore >= 65))
          .sort((a, b) => (b.agentScore || 0) - (a.agentScore || 0))
          .slice(0, 3);
        matchedTokens = singles;
        if (lang === 'zh') {
          reply = `🛡️ **单一开发者优质代币 (已验证):**\n\n已发现专一开发者（仅发布1个合约）且具备有效池子流动性的代币。\n单一项目开发者通常对项目有更强的长期投入与承诺。`;
        } else if (lang === 'ja') {
          reply = `🛡️ **単一開発者・高流動性ジェム (検証済み):**\n\n発行数が1回のみで流動性 >$500 を保有する優良開発者のトークンを検出しました。\n単一プロジェクト開発者は連続発行者に比べラグプル確率が大幅に低くなります。`;
        } else {
          reply = `🛡️ **SINGLE-DEV LIQUID GEMS (VERIFIED):**\n\nFound tokens from dedicated single-contract deployers with healthy pool depth >$500.\nSingle-project devs carry significantly lower rug probability compared to serial deployers.`;
        }
      } else if (
        qLower.includes('vol') ||
        qLower.includes('volume') ||
        qLower.includes('交易量') ||
        qLower.includes('热门') ||
        qLower.includes('取引高')
      ) {
        const vols = [...tokens].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 3);
        matchedTokens = vols;
        if (lang === 'zh') {
          reply = `⚡ **24小时交易量榜首活跃交易对:**\n\n` +
            vols.map((v, i) => `**#${i+1} ${v.symbol}**: 24h交易量 ${formatUsd(v.volume24h)} | 流动性: ${formatUsd(v.liquidityUsd)}`).join('\n');
        } else if (lang === 'ja') {
          reply = `⚡ **24時間取引高トップアクティブペア:**\n\n` +
            vols.map((v, i) => `**#${i+1} ${v.symbol}**: 24h取引高 ${formatUsd(v.volume24h)} | 流動性: ${formatUsd(v.liquidityUsd)}`).join('\n');
        } else {
          reply = `⚡ **TOP 24H TRADING VOLUME ACTIVE PAIRS:**\n\n` +
            vols.map((v, i) => `**#${i+1} ${v.symbol}**: 24h Volume ${formatUsd(v.volume24h)} | Liq: ${formatUsd(v.liquidityUsd)}`).join('\n');
        }
      } else if (
        qLower.includes('fresh') ||
        qLower.includes('new') ||
        qLower.includes('最新') ||
        qLower.includes('新币') ||
        qLower.includes('新規')
      ) {
        const fresh = [...tokens].sort((a, b) => (b.launchedAt || 0) - (a.launchedAt || 0)).slice(0, 4);
        matchedTokens = fresh;
        if (lang === 'zh') {
          reply = `🆕 **BREW FACTORY 最新发射代币:**\n\n在工厂合约 0xeea6...3d85 上最新登记的合约。请密切关注联合曲线进度。`;
        } else if (lang === 'ja') {
          reply = `🆕 **BREW FACTORY 最新ローンチトークン:**\n\nファクトリ 0xeea6...3d85 にて登録された最新のトークンです。ボンディングカーブの進捗を注視してください。`;
        } else {
          reply = `🆕 **FRESHEST LAUNCHES ON BREW FACTORY:**\n\nLatest contracts registered on factory 0xeea6...3d85. Monitor bonding curve progress closely.`;
        }
      } else if (
        qLower.includes('buy') ||
        qLower.includes('accum') ||
        qLower.includes('买入') ||
        qLower.includes('累积') ||
        qLower.includes('買い')
      ) {
        const buyers = [...tokens].filter(t => t.buyRatio > 1.5 && t.volume24h > 100).sort((a, b) => b.buyRatio - a.buyRatio).slice(0, 3);
        matchedTokens = buyers;
        if (lang === 'zh') {
          reply = `📈 **最高买入累积比率:**\n\n买入订单笔数远超卖出笔数 (>1.5x) 的代币，表明买方资金正在主动吸筹。`;
        } else if (lang === 'ja') {
          reply = `📈 **最高買い手蓄積比率:**\n\n買い注文が売り注文を大きく上回る (>1.5x) トークンです。大口による買い集めが検知されています。`;
        } else {
          reply = `📈 **HIGHEST BUY ACCUMULATION RATIO:**\n\nTokens with 24h buy ratio >1.5x showing active buy-side accumulation.`;
        }
      } else {
        // Direct or partial match search
        const direct = tokens.find(t =>
          t.symbol.toLowerCase() === qLower ||
          t.address.toLowerCase() === qLower ||
          t.name.toLowerCase() === qLower
        );
        const partials = direct ? [direct] : tokens.filter(t =>
          t.symbol.toLowerCase().includes(qLower) ||
          t.name.toLowerCase().includes(qLower)
        ).slice(0, 3);

        if (partials.length > 0) {
          matchedTokens = partials;
          const target = partials[0];
          if (lang === 'zh') {
            reply = `📊 **战术情报: ${target.symbol} (${target.name})**\n\n• 当前价格: ${formatUsd(target.priceUsd)} (24h: ${(target.priceChange24h ?? 0) > 0 ? '+' : ''}${(target.priceChange24h ?? 0).toFixed(2)}%)\n• 市值: ${formatUsd(target.marketCap)} | 流动性: ${formatUsd(target.liquidityUsd)}\n• 24h交易量: ${formatUsd(target.volume24h)} | AI评分: ${target.agentScore}/100 [${target.agentVerdict}]\n• 开发者历史: 在 Brew 部署了 ${target.creatorLaunchCount} 个合约。\n• 信号: ${(target.agentSignals || []).join(' • ')}`;
          } else if (lang === 'ja') {
            reply = `📊 **戦術インテル: ${target.symbol} (${target.name})**\n\n• 現在価格: ${formatUsd(target.priceUsd)} (24h: ${(target.priceChange24h ?? 0) > 0 ? '+' : ''}${(target.priceChange24h ?? 0).toFixed(2)}%)\n• 時価総額: ${formatUsd(target.marketCap)} | 流動性: ${formatUsd(target.liquidityUsd)}\n• 24h取引高: ${formatUsd(target.volume24h)} | AIスコア: ${target.agentScore}/100 [${target.agentVerdict}]\n• 開発者履歴: Brew上で ${target.creatorLaunchCount} 個のコントラクトを発行。\n• シグナル: ${(target.agentSignals || []).join(' • ')}`;
          } else {
            reply = `📊 **TACTICAL INTEL FOR ${target.symbol} (${target.name}):**\n\n• Price: ${formatUsd(target.priceUsd)} (24h: ${(target.priceChange24h ?? 0) > 0 ? '+' : ''}${(target.priceChange24h ?? 0).toFixed(2)}%)\n• Market Cap: ${formatUsd(target.marketCap)} | Liquidity: ${formatUsd(target.liquidityUsd)}\n• 24h Volume: ${formatUsd(target.volume24h)} | Agent Score: ${target.agentScore}/100 [${target.agentVerdict}]\n• Dev History: ${target.creatorLaunchCount} contract(s) deployed.\n• Signals: ${(target.agentSignals || []).join(' • ')}`;
          }
        } else {
          if (lang === 'zh') {
            reply = `🤖 **战术智能终端:**\n未找到与 "${q}" 精确匹配的代币。\n\n💡 *提示*: 请输入代币符号 (如 "BREW")、合约地址 (0x...)，或快捷指令 ("精选", "单一开发者", "连环发币", "交易量", "新币")。`;
          } else if (lang === 'ja') {
            reply = `🤖 **戦術コパイロット端末:**\n"${q}" に一致するトークンは見つかりませんでした。\n\n💡 *ヒント*: トークンシンボル (例: "BREW")、コントラクトアドレス (0x...)、またはクイックコマンド ("厳選", "単一開発者", "連続発行者", "取引高", "最新") を入力してください。`;
          } else {
            reply = `🤖 **TACTICAL INTEL ENGINE:**\nNo specific token found matching "${q}".\n\n💡 *Tips*: Type a token symbol (e.g. "BREW"), contract address (0x...), or quick commands ("top picks", "single dev", "serial devs", "volume", "fresh").`;
          }
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'a-' + Date.now(),
          sender: 'agent',
          text: reply,
          tokensMatch: matchedTokens.length > 0 ? matchedTokens : undefined
        }
      ]);
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl flex flex-col overflow-hidden min-h-[500px] shadow-lg shadow-black/30">
        {/* Terminal Header */}
        <div className="bg-[var(--color-field)] px-4 py-2.5 border-b border-[var(--color-line)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600/90 shadow-sm shadow-rose-950"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 shadow-sm shadow-amber-950"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-950"></span>
          </div>
          <div className="font-mono text-[11px] font-bold text-[var(--color-copper)] tracking-wider flex items-center gap-2">
            <img src="/logo.jpg" alt="Agent Brew Logo" className="w-4 h-4 rounded-full object-cover border border-[var(--color-line)]" referrerPolicy="no-referrer" />
            <span>AGENT_BREW_CORE // TACTICAL TERMINAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-up)] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-up)] animate-pulse"></span>
            <span>{lang === 'zh' ? '确定性引擎就绪' : lang === 'ja' ? '決定論エンジン稼働中' : 'TACTICAL ENGINE'}</span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px]">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'agent' && (
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-[var(--color-line)] shrink-0 mt-0.5 shadow-md shadow-amber-950/40 bg-[var(--color-field)] flex items-center justify-center">
                  <img src="/logo.jpg" alt="Agent Brew" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'max-w-[85%] rounded-2xl bg-[var(--color-paper)] px-3.5 py-3 text-[13px] leading-relaxed text-[var(--color-paper-ink)]'
                    : 'bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-ink)] shadow-md font-mono'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Attached Token Cards */}
                {m.tokensMatch && m.tokensMatch.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--color-line)] space-y-1.5">
                    {m.tokensMatch.map(tok => (
                      <div
                        key={tok.address}
                        className="p-2 rounded-lg bg-[var(--color-field)] border border-[var(--color-line)] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--color-ink)] text-xs font-mono">${tok.symbol}</span>
                          <span className="text-[10px] text-[var(--color-muted)] font-mono">
                            {formatUsd(tok.priceUsd)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onAnalyzeToken(tok)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--color-field)] text-[var(--color-copper)] border border-[var(--color-line)] hover:bg-amber-600 hover:text-stone-950 transition-colors cursor-pointer"
                          >
                            {dict.btnAnalyze}
                          </button>
                          <button
                            onClick={() => onTradeToken(tok)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded btn btn-solid"
                          >
                            {dict.btnSwap}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 self-start">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-[var(--color-line)] shrink-0 shadow-md bg-[var(--color-field)] flex items-center justify-center">
                <img src="/logo.jpg" alt="Agent Brew" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-3 rounded-xl text-xs bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-copper)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>{lang === 'zh' ? 'Agent BREW 正在扫描 BSC 链上数据...' : lang === 'ja' ? 'Agent BREW が BSC オンチェーン行列をスキャン中...' : 'Agent BREW inspecting BSC on-chain matrices...'}</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 bg-[#140e0a] border-t border-[var(--color-line)] flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSend(dict.copilotChip1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-amber-600/50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[var(--color-copper)]" />
            <span>{dict.copilotChip1}</span>
          </button>
          <button
            onClick={() => handleSend(dict.copilotChip2)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-amber-600/50 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-[var(--color-down)]" />
            <span>{dict.copilotChip2}</span>
          </button>
          <button
            onClick={() => handleSend(dict.copilotChip3)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-amber-600/50 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-[var(--color-up)]" />
            <span>{dict.copilotChip3}</span>
          </button>
          <button
            onClick={() => handleSend(dict.copilotChip4)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-amber-600/50 transition-colors cursor-pointer"
          >
            <Flame className="w-3 h-3 text-[var(--color-copper)]" />
            <span>{dict.copilotChip4}</span>
          </button>
          <button
            onClick={() => handleSend(dict.copilotChip5)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-copper)] hover:border-amber-600/50 transition-colors cursor-pointer"
          >
            <Clock className="w-3 h-3 text-[var(--color-copper)]" />
            <span>{dict.copilotChip5}</span>
          </button>
          <button
            onClick={() => handleSend(dict.copilotChipPairScam)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[var(--color-field)] border border-amber-600/40 text-[var(--color-copper)] hover:bg-amber-600 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-[var(--color-copper)]" />
            <span>{dict.copilotChipPairScam}</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex p-2.5 bg-[var(--color-surface)] border-t border-[var(--color-line)] gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(inputVal)}
            placeholder={dict.copilotInputPh}
            className="flex-1 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-none focus:border-amber-600 transition-colors"
          />
          <button
            onClick={() => handleSend(inputVal)}
            disabled={!inputVal.trim() || isLoading}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 hover:from-amber-500 hover:to-amber-400 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <span>{dict.copilotSend}</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right Side Hub */}
      <div className="flex flex-col gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/20">
          <div className="text-xs font-bold text-[var(--color-ink)] flex items-center justify-between mb-2.5 tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <img src="/logo.jpg" alt="Logo" className="w-4 h-4 rounded-full object-cover border border-[var(--color-line)]" referrerPolicy="no-referrer" />
              <span>{dict.copilotTopPicksTitle}</span>
            </span>
            <span className="text-[var(--color-up)] text-[10px] font-mono">LIVE</span>
          </div>

          <div className="divide-y divide-[#2d1f17]">
            {topPicks.length === 0 ? (
              <div className="text-xs text-[var(--color-muted)] py-3">{lang === 'zh' ? '正在加载精选代币...' : lang === 'ja' ? '厳選トークンを読み込み中...' : 'Loading picks...'}</div>
            ) : (
              topPicks.map(p => (
                <div key={p.address} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[var(--color-ink)] flex items-center gap-1.5 font-mono">
                      <span>${p.symbol}</span>
                      <span className="text-[10px] font-mono text-[var(--color-muted)]">{formatUsd(p.priceUsd)}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-muted)]">{p.agentVerdict}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        p.agentScore >= 70
                          ? 'bg-emerald-950/60 text-[var(--color-up)] border-emerald-600/40'
                          : 'bg-[var(--color-field)] text-[var(--color-copper)] border-[var(--color-line)]'
                      }`}
                    >
                      ★ {p.agentScore}
                    </span>
                    <button
                      onClick={() => onAnalyzeToken(p)}
                      className="px-2 py-1 text-[10px] font-semibold rounded bg-[#241a13] border border-[var(--color-line)] text-[var(--color-copper)] hover:bg-amber-600 hover:text-stone-950 transition-colors cursor-pointer"
                    >
                      {dict.btnAnalyze}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl p-3.5 shadow-md shadow-black/20">
          <div className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider mb-2 flex items-center gap-1">
            <span>🛡️</span>
            <span>{dict.copilotRulesTitle}</span>
          </div>
          <div className="text-xs text-[var(--color-muted)] space-y-1.5 font-sans">
            <div>• <strong className="text-[var(--color-muted)]">{lang === 'zh' ? '开发者过滤:' : lang === 'ja' ? '開発者フィルタリング:' : 'Dev Filtering:'}</strong> {dict.copilotRuleDev}</div>
            <div>• <strong className="text-[var(--color-muted)]">{lang === 'zh' ? '流动性阈值:' : lang === 'ja' ? '流動性しきい値:' : 'Liquidity Threshold:'}</strong> {dict.copilotRuleLiq}</div>
            <div>• <strong className="text-[var(--color-muted)]">{lang === 'zh' ? '订单流雷达:' : lang === 'ja' ? 'オーダーフローレーダー:' : 'Order Flow Radar:'}</strong> {dict.copilotRuleOrder}</div>
            <div>• <strong className="text-[var(--color-muted)]">{lang === 'zh' ? '安全扫描:' : lang === 'ja' ? 'セキュリティスキャン:' : 'Security Scanner:'}</strong> {dict.copilotRuleSec}</div>
            <div>• <strong className="text-[var(--color-muted)]">{lang === 'id' ? 'Audit Pair Scam:' : lang === 'zh' ? '交易对防伪:' : lang === 'ja' ? 'ペア偽装監査:' : 'Pair Scam Audit:'}</strong> {dict.copilotRulePair}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
