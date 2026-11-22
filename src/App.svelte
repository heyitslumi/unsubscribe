<script lang="ts">
  import {
    Lock,
    RotateCw,
    Volume2,
    VolumeX,
    Clock,
    CreditCard,
    CheckCircle2,
    AlertOctagon,
    Play,
    Copy,
    Check,
    RotateCcw,
    Receipt,
    Flame,
    Zap,
    Wifi,
    BatteryWarning,
    StickyNote,
    BellRing,
    Eye,
    Terminal,
    MessageSquare,
    Globe,
    Minus,
    X,
    ShieldAlert,
    Sparkles,
    Send,
    FolderOpen,
  } from '@lucide/svelte';
  import { INITIAL_TIME_SEC, TRIALS } from './lib/trials';
  import type {
    BurstParticle,
    ChargeEntry,
    ChatBubble,
    DesktopWindowState,
    GamePhase,
    SpamPopup,
    ToastItem,
    WindowId,
  } from './lib/types';
  import { sfx } from './lib/audio';

  import Stage1CloudNote from './stages/Stage1CloudNote.svelte';
  import Stage2ConsentWall from './stages/Stage2ConsentWall.svelte';
  import Stage3FitPulse from './stages/Stage3FitPulse.svelte';
  import Stage4VerifyHuman from './stages/Stage4VerifyHuman.svelte';
  import Stage5OmniSaaS from './stages/Stage5OmniSaaS.svelte';

  let phase = $state<GamePhase>('intro');
  let stageIdx = $state(0);
  let timeLeft = $state(INITIAL_TIME_SEC);
  let charges = $state<ChargeEntry[]>([]);
  let clearedStages = $state<number[]>([]);
  let bonusNotes = $state<string[]>([]);
  let toasts = $state<ToastItem[]>([]);
  let particles = $state<BurstParticle[]>([]);
  let muted = $state(false);
  let copied = $state(false);
  let floatingBill = $state<string | null>(null);
  let clearBanner = $state<string | null>(null);

  // Desktop Window Manager State
  let topZ = $state(30);
  let activeWin = $state<WindowId>('browser');
  let windows = $state<Record<WindowId, DesktopWindowState>>({
    browser: { id: 'browser', title: 'HostileWeb Browser', open: true, minimized: false, z: 20, x: 0, y: 0 },
    bank: { id: 'bank', title: 'LumiGuard Virtual Debit', open: true, minimized: false, z: 21, x: 0, y: 0 },
    chat: { id: 'chat', title: 'RetentionCord DM (LIVE)', open: true, minimized: false, z: 22, x: 0, y: 0 },
    terminal: { id: 'terminal', title: 'root@lumi-pc:~ (kill-cli)', open: false, minimized: false, z: 25, x: 0, y: 0 },
    sticky: { id: 'sticky', title: '3am_passwords.txt', open: true, minimized: false, z: 23, x: 0, y: 0 },
  });

  // Draggable floating window tracking
  let draggingWin = $state<WindowId | null>(null);
  let dragOrigin = $state({ x: 0, y: 0 });

  // Live RetentionCord DM Messages
  let chatMessages = $state<ChatBubble[]>([
    {
      id: 'm0',
      sender: 'LumiBank Fraud Bot',
      handle: '@fraud_shield',
      avatarBg: 'bg-rose-700',
      text: 'ALERT: 5 free trials ($212.48/mo) set to auto-debit card •••• 4049 in 90 seconds.',
      time: '03:14',
    },
    {
      id: 'm1',
      sender: 'Chad (Retention VP)',
      handle: '@chad_closes',
      avatarBg: 'bg-sky-700',
      text: 'hey bestie! saw you hovering near the cancel settings... dont do anything rash',
      time: '03:14',
    },
  ]);
  let unreadChat = $state(0);

  // Terminal Shell Command Runner
  let termInput = $state('');
  let termLogs = $state<string[]>([
    'UNSUBSCRIBE OS v3.14-cachyos (tty1)',
    'Type "help" for emergency anti-dark-pattern commands.',
  ]);
  let freezeUsed = $state(false);

  // Intrusive OS Spam Popups
  let spamPopups = $state<SpamPopup[]>([]);
  let nextSpamId = $state(1);

  // Progressive disclosure for 3AM Sticky Note hints
  let hintRevealedForStage = $state<Record<number, boolean>>({});

  // Trauma-based camera shake & hitstop
  let trauma = $state(0);
  let shakeOffset = $state({ x: 0, y: 0, rot: 0 });
  let hitStopUntil = $state(0);
  let lastTickSecond = $state(999);

  const currentTrial = $derived(TRIALS[stageIdx] ?? TRIALS[0]);
  const scamCharges = $derived(charges.filter((c) => c.kind === 'scam'));
  const totalWasted = $derived(scamCharges.reduce((sum, c) => sum + c.amount, 0));
  const totalSaved = $derived(
    TRIALS.filter((t) => clearedStages.includes(t.id)).reduce((sum, t) => sum + t.renewalCost, 0)
  );
  const timerPct = $derived(Math.max(0, Math.min(100, (timeLeft / INITIAL_TIME_SEC) * 100)));
  const currentHintRevealed = $derived(Boolean(hintRevealedForStage[stageIdx]));

  const stageHintText = $derived.by(() => {
    if (stageIdx === 0) {
      return 'CloudNote+ hides the exit link in the gray footer. On the survey, uncheck Boxes #1 and #2 and check Box #3.';
    }
    if (stageIdx === 1) {
      return 'Skip the × button! Open Granular Interest, turn all 3 switches OFF (Switch #2 relights #1!), then drag or minimize Chad.';
    }
    if (stageIdx === 2) {
      return 'Chase the cancel button 5 times to exhaust its stamina — or press Tab + Enter for an instant accessibility speedrun!';
    }
    if (stageIdx === 3) {
      return 'Pick the 3 genuine human needs (8 Hours of Sleep, Transparent Pricing, Working Cancel Button), then press SPACE in the green zone.';
    }
    return 'Scroll the ToS to uncheck all 3 camouflaged $15 clauses, dismiss the fake timeout link, and watch the A/B button swap when typing UNSUBSCRIBE!';
  });

  const rankInfo = $derived.by(() => {
    if (phase === 'timeout') {
      return {
        grade: 'F',
        title: 'VC EXIT LIQUIDITY',
        color: 'text-rose-300 border-rose-500/60 bg-rose-950/60',
        stampColor: 'border-rose-700 text-rose-700',
        blurb: 'The clock hit 00:00 and every remaining free trial auto-renewed on your card.',
      };
    }
    if (totalWasted === 0 && timeLeft >= 35) {
      return {
        grade: 'S+',
        title: 'DARK-PATTERN EXORCIST',
        color: 'text-emerald-200 border-emerald-400/60 bg-emerald-950/60',
        stampColor: 'border-emerald-700 text-emerald-800',
        blurb: '$0.00 wasted with time to spare. SaaS growth hackers tell campfire horror stories about you.',
      };
    }
    if (totalWasted === 0) {
      return {
        grade: 'S',
        title: 'IMMUNE TO MARKETING',
        color: 'text-emerald-200 border-emerald-400/50 bg-emerald-950/50',
        stampColor: 'border-emerald-700 text-emerald-800',
        blurb: 'Not a single cent surrendered to dark patterns.',
      };
    }
    if (totalWasted <= 25) {
      return {
        grade: 'A',
        title: 'MOSTLY UNSCAMMED',
        color: 'text-sky-200 border-sky-400/50 bg-sky-950/50',
        stampColor: 'border-sky-700 text-sky-800',
        blurb: 'You escaped all 5 trials with only minor psychological and financial bruising.',
      };
    }
    if (totalWasted <= 75) {
      return {
        grade: 'B',
        title: 'VALUED Q4 REVENUE',
        color: 'text-amber-200 border-amber-400/50 bg-amber-950/50',
        stampColor: 'border-amber-700 text-amber-800',
        blurb: 'You cancelled eventually, right after funding the CEO’s espresso machine.',
      };
    }
    return {
      grade: 'C',
      title: 'CLICKER OF SHINY BUTTONS',
      color: 'text-orange-200 border-orange-400/50 bg-orange-950/50',
      stampColor: 'border-orange-700 text-orange-800',
      blurb: 'Every green button was pressed. Your bank called to ask if you are okay.',
    };
  });

  function focusWindow(id: WindowId) {
    topZ += 1;
    activeWin = id;
    windows[id].open = true;
    windows[id].minimized = false;
    windows[id].z = topZ;
    if (id === 'chat') unreadChat = 0;
  }

  function toggleWindowDock(id: WindowId) {
    sfx.playClick();
    const w = windows[id];
    if (!w.open || w.minimized) {
      focusWindow(id);
    } else if (activeWin === id) {
      w.minimized = true;
    } else {
      focusWindow(id);
    }
  }

  function minimizeWindow(id: WindowId) {
    sfx.playClick();
    windows[id].minimized = true;
  }

  function startWinDrag(id: WindowId, e: PointerEvent) {
    focusWindow(id);
    draggingWin = id;
    dragOrigin = { x: e.clientX - windows[id].x, y: e.clientY - windows[id].y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function moveWinDrag(id: WindowId, e: PointerEvent) {
    if (draggingWin !== id) return;
    windows[id].x = Math.max(-420, Math.min(420, e.clientX - dragOrigin.x));
    windows[id].y = Math.max(-220, Math.min(320, e.clientY - dragOrigin.y));
  }

  function endWinDrag() {
    draggingWin = null;
  }

  function pushChat(sender: string, handle: string, avatarBg: string, text: string) {
    chatMessages = [
      ...chatMessages.slice(-7),
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        handle,
        avatarBg,
        text,
        time: '03:14',
      },
    ];
    if (windows.chat.minimized || !windows.chat.open) {
      unreadChat += 1;
    }
  }

  function spawnSpamAd() {
    if (spamPopups.length >= 2) return;
    sfx.playSplit();
    const ads = [
      {
        title: 'HOT SINGLE VCs IN YOUR AREA',
        body: '3 pre-seed investors want to fund your accidental SaaS subscriptions!',
        cta: 'Accept Term Sheet ($14)',
        fee: 14.0,
      },
      {
        title: 'SYSTEM WARNING: TOO MUCH SAVING',
        body: 'Unusual fiscal responsibility detected on card •••• 4049!',
        cta: 'Pay Convenience Tax ($9)',
        fee: 9.0,
      },
    ];
    const template = ads[nextSpamId % ads.length];
    spamPopups = [
      ...spamPopups,
      {
        id: nextSpamId,
        ...template,
        x: 16 + ((nextSpamId * 37) % 36),
        y: 18 + ((nextSpamId * 29) % 34),
      },
    ];
    nextSpamId += 1;
  }

  function closeSpamAd(id: number) {
    sfx.playClick();
    spamPopups = spamPopups.filter((p) => p.id !== id);
  }

  function runTerminalCmd(e: SubmitEvent) {
    e.preventDefault();
    sfx.playClick();
    const raw = termInput.trim();
    if (!raw) return;
    termInput = '';
    const cmd = raw.toLowerCase();
    termLogs = [...termLogs, `$ ${raw}`];

    if (cmd === 'help') {
      termLogs = [
        ...termLogs,
        'Commands: status | hint | killallchad | killads | freeze (+8s once) | clear',
      ];
    } else if (cmd === 'status') {
      termLogs = [
        ...termLogs,
        `Active Boss: ${currentTrial.brand} ($${currentTrial.renewalCost.toFixed(2)}/mo) | Damage: $${totalWasted.toFixed(2)}`,
      ];
    } else if (cmd === 'hint') {
      revealCurrentHint();
      termLogs = [...termLogs, `[HINT UNLOCKED]: ${stageHintText}`];
    } else if (cmd === 'killallchad' || cmd === 'pkill chad') {
      spamPopups = [];
      termLogs = [...termLogs, 'Killed 428 tracking daemons & purged popup overlays.'];
      pushChat('Chad (Retention VP)', '@chad_closes', 'bg-sky-700', 'bro did you just run pkill on my retention popups?? rude');
    } else if (cmd === 'killads') {
      spamPopups = [];
      termLogs = [...termLogs, 'Ad popups terminated.'];
    } else if (cmd === 'freeze' || cmd === 'overclock') {
      if (freezeUsed) {
        termLogs = [...termLogs, 'Error: Bank clock freeze already used this run!'];
      } else {
        freezeUsed = true;
        timeLeft = Math.min(INITIAL_TIME_SEC, timeLeft + 8);
        termLogs = [...termLogs, 'Injected +8.0s NTP clock skew into LumiBank auto-renew timer!'];
        pushToast('achievement', 'CLI Clock Skew!', '+8.0s added via terminal');
        bonusNotes = [...bonusNotes, 'Terminal NTP Clock Skew (+8s)'];
      }
    } else if (cmd === 'clear') {
      termLogs = [];
    } else {
      termLogs = [...termLogs, `fish: unknown command "${raw}". Try "help".`];
    }
  }

  function addTrauma(amount: number) {
    trauma = Math.min(1, trauma + amount);
  }

  function triggerHitStop(ms: number) {
    hitStopUntil = Math.max(hitStopUntil, performance.now() + ms);
  }

  function spawnParticles(kind: 'scam' | 'clear', labelText: string) {
    const count = kind === 'clear' ? 10 : 7;
    const batch: BurstParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 55 + Math.random() * 85;
      const tx = `${Math.round(Math.cos(angle) * dist)}px`;
      const ty = `${Math.round(Math.sin(angle) * dist - 25)}px`;
      const rot = `${Math.round((Math.random() - 0.5) * 50)}deg`;
      batch.push({
        id: `${Date.now()}-${i}-${Math.random()}`,
        x: 42 + Math.random() * 16,
        y: 38 + Math.random() * 16,
        tx,
        ty,
        rot,
        text: i === 0 ? labelText : kind === 'clear' ? 'SAVED!' : 'BILLED!',
        color: kind === 'clear' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white',
      });
    }
    particles = [...particles, ...batch];
    setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      particles = particles.filter((p) => !ids.has(p.id));
    }, 740);
  }

  // Main countdown + real-time trauma shake loop
  $effect(() => {
    let last = performance.now();
    let raf = 0;
    let t = 0;

    const tick = (now: number) => {
      const realDt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (trauma > 0) {
        trauma = Math.max(0, trauma - 1.85 * realDt);
        const shake = trauma * trauma;
        t += realDt * 34;
        shakeOffset = {
          x: 11 * shake * Math.sin(t * 1.7),
          y: 7 * shake * Math.sin(t * 2.3),
          rot: 0.9 * shake * Math.sin(t * 1.1),
        };
      } else if (shakeOffset.x !== 0 || shakeOffset.y !== 0) {
        shakeOffset = { x: 0, y: 0, rot: 0 };
      }

      if (phase === 'playing' && now >= hitStopUntil) {
        const next = Math.max(0, timeLeft - realDt);
        timeLeft = next;

        const secFloor = Math.ceil(next);
        if (secFloor <= 12 && secFloor > 0 && secFloor !== lastTickSecond) {
          lastTickSecond = secFloor;
          sfx.playUrgentTick();
        }

        if (next <= 0) {
          triggerTimeout();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  function pushToast(kind: ToastItem['kind'], title: string, detail: string) {
    const id = `${Date.now()}-${Math.random()}`;
    toasts = [...toasts.slice(-2), { id, kind, title, detail }];
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
    }, 2400);
  }

  function startGame() {
    sfx.playClick();
    stageIdx = 0;
    timeLeft = INITIAL_TIME_SEC;
    lastTickSecond = 999;
    charges = [];
    clearedStages = [];
    bonusNotes = [];
    toasts = [];
    particles = [];
    spamPopups = [];
    hintRevealedForStage = {};
    freezeUsed = false;
    copied = false;
    clearBanner = null;
    focusWindow('browser');
    pushChat(
      'Nimbus (CloudNote+)',
      '@nimbus_ai',
      'bg-indigo-700',
      'please dont delete our 2 untitled grocery lists!! i have a cloud family to feed'
    );
    phase = 'playing';
  }

  function revealCurrentHint() {
    sfx.playClick();
    hintRevealedForStage = { ...hintRevealedForStage, [stageIdx]: true };
    windows.sticky.open = true;
    windows.sticky.minimized = false;
  }

  function triggerTimeout() {
    sfx.playFail();
    addTrauma(0.95);
    const uncancelled: ChargeEntry[] = TRIALS.filter((t) => !clearedStages.includes(t.id)).map((t) => ({
      id: `renew-${t.id}`,
      kind: 'scam',
      stageBrand: t.brand,
      label: `${t.brand} Auto-Renewal Triggered`,
      amount: t.renewalCost,
    }));
    charges = [...charges, ...uncancelled];
    pushChat('LumiBank Fraud Bot', '@fraud_shield', 'bg-rose-700', '00:00.0 REACHED — Auto-renewals processed.');
    phase = 'timeout';
  }

  function handlePenalty(label: string, amount: number, timeSec = 2) {
    sfx.playScam();
    addTrauma(0.65);
    triggerHitStop(55);
    spawnParticles('scam', `+$${amount.toFixed(2)}`);

    hintRevealedForStage = { ...hintRevealedForStage, [stageIdx]: true };

    charges = [
      ...charges,
      {
        id: `${Date.now()}-${Math.random()}`,
        kind: 'scam',
        stageBrand: currentTrial.brand,
        label,
        amount,
        timePenaltySec: timeSec,
      },
    ];
    timeLeft = Math.max(0, timeLeft - timeSec);
    floatingBill = `+$${amount.toFixed(2)}`;
    pushToast('scam', `CARD CHARGED $${amount.toFixed(2)}`, `${label} (-${timeSec}s)`);
    pushChat(
      'Chad (Retention VP)',
      '@chad_closes',
      'bg-sky-700',
      `CHA-CHING! +$${amount.toFixed(2)} billed for "${label}"! Q4 bonus secured`
    );

    setTimeout(() => {
      floatingBill = null;
    }, 900);
  }

  function handleStageClear(note?: string) {
    sfx.playStageClear();
    addTrauma(0.45);
    triggerHitStop(70);
    spawnParticles('clear', `-$${currentTrial.renewalCost.toFixed(2)}/mo`);

    clearedStages = [...clearedStages, currentTrial.id];
    charges = [
      ...charges,
      {
        id: `saved-${currentTrial.id}-${Date.now()}`,
        kind: 'saved',
        stageBrand: currentTrial.brand,
        label: `${currentTrial.brand} Auto-Debit Blocked`,
        amount: currentTrial.renewalCost,
      },
    ];

    clearBanner = `${currentTrial.brand.toUpperCase()} TERMINATED`;
    setTimeout(() => {
      clearBanner = null;
    }, 750);

    if (note) {
      bonusNotes = [...bonusNotes, note];
      pushToast('achievement', 'STYLE BONUS!', note);
    } else {
      pushToast('clear', `${currentTrial.brand} Cancelled`, `$${currentTrial.renewalCost.toFixed(2)}/mo dodged`);
    }

    const reactions: Record<number, [string, string, string, string]> = {
      0: ['Chad (Retention VP)', '@chad_closes', 'bg-sky-700', 'Wait you actually read the 4am triple-negative checkboxes?! Deploying 428 cookie brokers...'],
      1: ['Pulsey (FitPulse AI)', '@pulsey_coach', 'bg-rose-700', 'YOU MINIMIZED CHAD?! Good luck catching my cancel button on leg day!!'],
      2: ['VerifyHuman Bot-Shield', '@captcha_corp', 'bg-teal-700', 'Abnormal cancellation velocity detected. Launching corporate buzzword grid.'],
      3: ['VP of Retention (OmniSaaS)', '@vp_retention', 'bg-amber-700', 'Impressive. Now survive my Enterprise ERP offboarding contract.'],
      4: ['LumiBank Fraud Bot', '@fraud_shield', 'bg-emerald-700', 'ALL 5 AUTO-DEBITS TERMINATED. Generating thermal statement receipt.'],
    };
    const r = reactions[stageIdx];
    if (r) pushChat(r[0], r[1], r[2], r[3]);

    if (stageIdx + 1 >= TRIALS.length) {
      setTimeout(() => {
        sfx.playVictory();
        phase = 'victory';
      }, 280);
    } else {
      stageIdx += 1;
    }
  }

  function toggleMute() {
    muted = !muted;
    sfx.muted = muted;
    if (!muted) sfx.playClick();
  }

  function formatClock(sec: number): string {
    const clamped = Math.max(0, sec);
    const m = Math.floor(clamped / 60);
    const s = Math.floor(clamped % 60);
    const tenths = Math.floor((clamped % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${tenths}`;
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (phase === 'intro' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      startGame();
    } else if ((e.key === 'r' || e.key === 'R') && phase !== 'intro') {
      e.preventDefault();
      startGame();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
    } else if ((e.key === 'h' || e.key === 'H') && phase === 'playing') {
      e.preventDefault();
      revealCurrentHint();
    } else if (e.key === '`') {
      e.preventDefault();
      toggleWindowDock('terminal');
    }
  }

  async function copyReceipt() {
    sfx.playClick();
    const statusLine =
      phase === 'victory'
        ? `CLEARED 5/5 (${formatClock(timeLeft)} left)`
        : `TIMED OUT (${clearedStages.length}/5 cancelled)`;
    const text = [
      `🧾 UNSUBSCRIBE — DARK-PATTERN BOSS RUSH`,
      `Rank: [${rankInfo.grade}] ${rankInfo.title}`,
      `Status: ${statusLine}`,
      `Dark-Pattern Damage: $${totalWasted.toFixed(2)}`,
      `Monthly Charges Dodged: $${totalSaved.toFixed(2)}/mo`,
      `Traps Triggered: ${scamCharges.length}`,
      bonusNotes.length ? `Style Bonus: ${bonusNotes.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      copied = false;
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<!-- 3:14 AM Interactive Desktop OS Environment -->
<div class="min-h-screen w-full desktop-wallpaper text-slate-100 flex flex-col justify-between overflow-x-hidden select-none">
  <!-- Top OS System Bar -->
  <header class="w-full bg-slate-950/95 border-b border-slate-800 px-3 sm:px-5 py-1.5 flex items-center justify-between gap-3 z-40">
    <div class="flex items-center gap-2.5">
      <span class="px-2.5 py-1 rounded bg-rose-700 text-white font-display font-extrabold text-xs tracking-tight">
        UNSUBSCRIBE OS
      </span>
      <span class="hidden md:inline text-xs text-slate-300 font-mono-num">
        lumi@arch-pc • 03:14:09_AM • card •••• 4049
      </span>
    </div>

    <!-- Top System Auto-Renew Countdown Bar -->
    <div class="flex-1 max-w-md mx-2 hidden sm:flex items-center gap-2.5">
      <span class="text-xs font-mono-num uppercase text-slate-300 shrink-0">AUTO-RENEW</span>
      <div class="flex-1 h-2.5 bg-slate-900 rounded-full border border-slate-700 overflow-hidden p-0.5">
        <div
          class="h-full rounded-full transition-colors duration-200 {timeLeft <= 15
            ? 'bg-rose-500'
            : timeLeft <= 35
              ? 'bg-amber-400'
              : 'bg-emerald-400'}"
          style="width: {timerPct}%;"
        ></div>
      </div>
      <span class="font-mono-num font-extrabold text-xs text-white shrink-0">{formatClock(timeLeft)}</span>
    </div>

    <div class="flex items-center gap-2 text-xs font-mono-num text-slate-200">
      <div class="hidden sm:flex items-center gap-1 text-amber-300">
        <BatteryWarning class="w-4 h-4" />
        <span>4%</span>
      </div>
      <div class="hidden sm:flex items-center gap-1 text-emerald-300">
        <Wifi class="w-4 h-4" />
        <span>5G</span>
      </div>

      {#if phase !== 'intro'}
        <button
          type="button"
          onclick={startGame}
          title="Quick Restart Run (Hotkey: R)"
          class="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-num font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restart (R)</span>
        </button>
      {/if}

      <button
        type="button"
        onclick={toggleMute}
        aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        title="Toggle Audio (Hotkey: M)"
        class="min-w-[44px] min-h-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center justify-center"
      >
        {#if muted}
          <VolumeX class="w-4 h-4 text-rose-400" />
        {:else}
          <Volume2 class="w-4 h-4 text-emerald-400" />
        {/if}
      </button>
    </div>
  </header>

  <!-- Main Desktop Surface with Desktop Shortcut Icons, App Windows & Floating Terminal/Popups -->
  <div class="relative flex-1 w-full max-w-[1440px] mx-auto px-2.5 sm:px-4 py-2.5 flex flex-col lg:flex-row items-stretch gap-3">
    <!-- Left Desktop Shortcut Column (Authentic OS Desktop Icons on XL screens) -->
    <div class="hidden xl:flex w-24 shrink-0 flex-col items-center gap-3 pt-2">
      <button
        type="button"
        onclick={() => focusWindow('browser')}
        class="w-20 p-2 rounded-xl hover:bg-slate-800/70 flex flex-col items-center gap-1 text-center cursor-pointer group"
      >
        <div class="w-11 h-11 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-md">
          <Globe class="w-6 h-6" />
        </div>
        <span class="text-xs font-medium text-slate-200 leading-tight">Browser.app</span>
      </button>

      <button
        type="button"
        onclick={() => focusWindow('terminal')}
        class="w-20 p-2 rounded-xl hover:bg-slate-800/70 flex flex-col items-center gap-1 text-center cursor-pointer"
      >
        <div class="w-11 h-11 rounded-xl bg-slate-800 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-md">
          <Terminal class="w-6 h-6" />
        </div>
        <span class="text-xs font-medium text-slate-200 leading-tight">kill-cli.sh</span>
      </button>

      <button
        type="button"
        onclick={() => focusWindow('sticky')}
        class="w-20 p-2 rounded-xl hover:bg-slate-800/70 flex flex-col items-center gap-1 text-center cursor-pointer"
      >
        <div class="w-11 h-11 rounded-xl bg-amber-300 text-stone-950 flex items-center justify-center shadow-md">
          <StickyNote class="w-6 h-6" />
        </div>
        <span class="text-xs font-medium text-slate-200 leading-tight">3am_hints.txt</span>
      </button>

      <button
        type="button"
        onclick={spawnSpamAd}
        class="w-20 p-2 rounded-xl hover:bg-slate-800/70 flex flex-col items-center gap-1 text-center cursor-pointer"
      >
        <div class="w-11 h-11 rounded-xl bg-rose-800 text-amber-300 flex items-center justify-center shadow-md">
          <FolderOpen class="w-6 h-6" />
        </div>
        <span class="text-xs font-medium text-slate-200 leading-tight">free_ram.exe</span>
      </button>
    </div>

    <!-- Center: HostileWeb Browser Window -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      onpointerdown={() => focusWindow('browser')}
      style="transform: translate3d({shakeOffset.x}px, {shakeOffset.y}px, 0) rotate({shakeOffset.rot}deg);"
      class="flex-1 min-w-0 rounded-xl border {activeWin === 'browser'
        ? 'border-slate-600'
        : 'border-slate-800'} bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col relative"
    >
      <!-- Browser Window Title & Tab Strip -->
      <div class="no-scrollbar bg-[#11141d] border-b border-slate-800 px-3 pt-2 flex items-center gap-1.5 overflow-x-auto">
        <div class="flex items-center gap-1.5 pr-2 shrink-0" aria-hidden="true">
          <span class="w-3 h-3 rounded-full bg-rose-500"></span>
          <span class="w-3 h-3 rounded-full bg-amber-400"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
        </div>

        {#each TRIALS as t, idx (t.id)}
          {@const isDone = clearedStages.includes(t.id)}
          {@const isActive = phase === 'playing' && stageIdx === t.id}
          <div
            class="px-3 py-1.5 rounded-t-lg text-xs flex items-center gap-2 shrink-0 border-t border-x transition-colors {isActive
              ? 'bg-slate-800 border-slate-600 text-white font-bold'
              : isDone
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300 line-through'
                : 'bg-slate-900/70 border-transparent text-slate-300'}"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              style="background: {isDone ? '#10b981' : t.accent};"
            ></span>
            <span class="font-mono-num text-xs text-slate-300">{idx + 1}/5</span>
            <span class="max-w-[115px] truncate">{t.brand}</span>
          </div>
        {/each}
      </div>

      <!-- Browser URL Bar -->
      <div class="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Reload page"
          aria-label="Reload simulated browser page"
          onclick={() => {
            if (phase === 'playing') {
              spawnSpamAd();
              pushToast('hint', 'Pop-Up Blocker Bypassed!', 'Refreshing spawned an adware window!');
            }
          }}
          class="min-w-[44px] min-h-[44px] rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer"
        >
          <RotateCw class="w-4 h-4" />
        </button>

        <div class="flex-1 min-w-[170px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
          <Lock class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span class="font-mono-num text-slate-200 truncate">
            {#if phase === 'intro'}
              about://3am-free-trial-regret
            {:else if phase === 'playing'}
              {currentTrial.url}
            {:else}
              bank://statement/itemized-damage-report
            {/if}
          </span>
        </div>

        {#if phase === 'playing'}
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono-num text-xs font-bold">
            <Zap class="w-3.5 h-3.5" />
            <span>{currentTrial.bossTitle}</span>
          </div>
        {/if}

        <!-- Compact Mobile HUD Pills -->
        <div class="flex lg:hidden items-center gap-1.5 ml-auto">
          <div
            class="px-2.5 py-1.5 rounded-lg border font-mono-num text-xs font-bold flex items-center gap-1 {timeLeft <= 15 &&
            phase === 'playing'
              ? 'bg-rose-950 border-rose-500 text-rose-200'
              : 'bg-slate-950 border-slate-800 text-slate-200'}"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>{formatClock(timeLeft)}</span>
          </div>
          <div class="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono-num text-xs font-bold text-rose-300">
            ${totalWasted.toFixed(2)}
          </div>
          {#if phase === 'playing'}
            <button
              type="button"
              onclick={revealCurrentHint}
              class="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-amber-300 text-slate-950 font-display font-extrabold text-xs flex items-center gap-1 cursor-pointer"
            >
              <StickyNote class="w-3.5 h-3.5" />
              <span>Hint</span>
            </button>
          {/if}
        </div>
      </div>

      <!-- Mobile Sticky Note Banner when revealed -->
      {#if phase === 'playing' && currentHintRevealed}
        <div class="lg:hidden bg-amber-200 text-slate-950 px-3.5 py-2 border-b border-amber-400 text-xs font-medium flex items-start gap-2">
          <StickyNote class="w-4 h-4 shrink-0 mt-0.5 text-amber-900" />
          <span><strong>3AM Note:</strong> {stageHintText}</span>
        </div>
      {/if}

      <!-- Main Stage Viewport -->
      <main class="relative flex-1 min-h-[480px] flex flex-col">
        {#if particles.length > 0}
          <div class="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {#each particles as p (p.id)}
              <div
                style="left: {p.x}%; top: {p.y}%; --tx: {p.tx}; --ty: {p.ty}; --rot: {p.rot};"
                class="animate-particle absolute px-2.5 py-1 rounded-lg font-mono-num font-extrabold text-xs shadow-lg {p.color}"
              >
                {p.text}
              </div>
            {/each}
          </div>
        {/if}

        {#if phase === 'intro'}
          <div class="flex-1 bg-[#0b0e16] p-4 sm:p-7 flex flex-col justify-center relative overflow-hidden">
            <div class="max-w-2xl mx-auto w-full space-y-4">
              <div class="bg-amber-500/10 border border-amber-400/40 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 text-amber-200 text-xs font-mono-num font-bold">
                  <BellRing class="w-4 h-4 shrink-0 text-amber-400" />
                  <span>BANK ALERT: 5 FREE TRIALS AUTO-RENEW IN 90.0s</span>
                </div>
                <span class="font-mono-num text-xs font-extrabold text-rose-300 shrink-0">$212.48 AT RISK</span>
              </div>

              <div class="space-y-1.5">
                <h1 class="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                  UNSUBSCRIBE
                </h1>
                <p class="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-[64ch]">
                  At 3:14 AM you started <strong class="text-white">5 sketchy SaaS free trials</strong>. Fight through
                  guilt-trip modals, Hydra cookie walls, fleeing buttons, and corporate captchas—or open the
                  <strong class="text-emerald-300">kill-cli.sh terminal (`~`)</strong> from the desktop dock for
                  emergency hacks.
                </p>
              </div>

              <!-- Clean Ledger Table of All 5 Pending Auto-Debits -->
              <div class="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/75 overflow-hidden">
                {#each TRIALS as t, idx (t.id)}
                  <div class="px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span
                        class="font-mono-num font-bold px-2 py-0.5 rounded text-white shrink-0"
                        style="background: {t.accent};"
                      >
                        #{idx + 1}
                      </span>
                      <div class="min-w-0">
                        <span class="font-display font-bold text-white">{t.brand}</span>
                        <span class="hidden sm:inline text-slate-300"> — {t.tagline}</span>
                      </div>
                    </div>
                    <span class="font-mono-num font-bold text-rose-300 shrink-0">${t.renewalCost.toFixed(2)}/mo</span>
                  </div>
                {/each}
              </div>

              <div class="pt-1">
                <button
                  type="button"
                  onclick={startGame}
                  class="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-extrabold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Play class="w-5 h-5 fill-current" />
                  <span>START CANCELLING (90.0s)</span>
                </button>
              </div>
            </div>
          </div>
        {:else if phase === 'playing'}
          {#if stageIdx === 0}
            <Stage1CloudNote onClear={handleStageClear} onPenalty={handlePenalty} />
          {:else if stageIdx === 1}
            <Stage2ConsentWall onClear={handleStageClear} onPenalty={handlePenalty} />
          {:else if stageIdx === 2}
            <Stage3FitPulse onClear={handleStageClear} onPenalty={handlePenalty} />
          {:else if stageIdx === 3}
            <Stage4VerifyHuman onClear={handleStageClear} onPenalty={handlePenalty} />
          {:else}
            <Stage5OmniSaaS onClear={handleStageClear} onPenalty={handlePenalty} />
          {/if}
        {:else}
          <!-- Victory / Timeout Serrated Thermal Paper Receipt Screen -->
          <div class="flex-1 bg-[#0b0e16] p-4 sm:p-7 flex items-center justify-center">
            <div class="w-full max-w-lg space-y-5">
              <div class="thermal-paper px-5 sm:px-6 py-6 font-mono-num text-xs space-y-3.5">
                <div class="flex items-start justify-between border-b-2 border-slate-900 pb-3 gap-3">
                  <div>
                    <div class="flex items-center gap-1.5 font-extrabold text-sm text-slate-950">
                      <Receipt class="w-4 h-4 text-slate-800" />
                      <span>LUMI VIRTUAL BANK • STATEMENT</span>
                    </div>
                    <div class="text-xs text-slate-700 mt-0.5">
                      ACCT •••• 4049 • {formatClock(timeLeft)} REMAINING
                    </div>
                  </div>

                  <div
                    class="animate-stamp shrink-0 px-3 py-1 border-2 rounded-xs font-display font-extrabold text-xl tracking-tight {rankInfo.stampColor}"
                  >
                    {rankInfo.grade}
                  </div>
                </div>

                <div class="bg-slate-200/70 px-3 py-2 border border-slate-300 text-slate-900">
                  <div class="font-display font-extrabold text-sm">{rankInfo.title}</div>
                  <div class="text-xs text-slate-700 font-sans mt-0.5 leading-snug">{rankInfo.blurb}</div>
                </div>

                <div class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {#each TRIALS as t (t.id)}
                    {@const ok = clearedStages.includes(t.id)}
                    <div class="flex items-center justify-between">
                      <span class={ok ? 'text-slate-700 line-through' : 'text-rose-800 font-bold'}>
                        {t.brand} Trial
                      </span>
                      <span class={ok ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                        {ok ? `CANCELLED (-$${t.renewalCost.toFixed(2)})` : `RENEWED (+$${t.renewalCost.toFixed(2)})`}
                      </span>
                    </div>
                  {/each}

                  {#if scamCharges.filter((c) => !c.id.startsWith('renew-')).length > 0}
                    <div class="border-t border-dashed border-slate-400 my-2 pt-2 text-xs text-slate-700 font-bold uppercase">
                      Dark-Pattern Traps Triggered
                    </div>
                    {#each scamCharges.filter((c) => !c.id.startsWith('renew-')) as c (c.id)}
                      <div class="flex items-center justify-between text-rose-800">
                        <span class="truncate pr-3">{c.label}</span>
                        <span class="font-bold shrink-0">+${c.amount.toFixed(2)}</span>
                      </div>
                    {/each}
                  {/if}

                  {#if bonusNotes.length > 0}
                    <div class="border-t border-dashed border-slate-400 my-2 pt-2 text-xs text-emerald-900 font-bold uppercase">
                      Style Bonuses Earned
                    </div>
                    {#each bonusNotes as note}
                      <div class="flex items-center justify-between text-emerald-800 font-bold">
                        <span>★ {note}</span>
                        <span>STYLE</span>
                      </div>
                    {/each}
                  {/if}
                </div>

                <div class="border-t-2 border-slate-900 pt-3 space-y-1">
                  <div class="flex items-center justify-between text-xs text-slate-700">
                    <span>MONTHLY RECURRING SAVED</span>
                    <span class="font-bold text-emerald-800">${totalSaved.toFixed(2)}/mo</span>
                  </div>
                  <div class="flex items-center justify-between text-sm font-extrabold text-slate-950">
                    <span>TOTAL DARK-PATTERN DAMAGE</span>
                    <span class={totalWasted === 0 ? 'text-emerald-800' : 'text-rose-800'}>
                      ${totalWasted.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-stretch gap-3 pt-1">
                <button
                  type="button"
                  onclick={copyReceipt}
                  class="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {#if copied}
                    <Check class="w-4 h-4 text-emerald-400" />
                    <span>Copied Receipt!</span>
                  {:else}
                    <Copy class="w-4 h-4" />
                    <span>Copy Score Receipt</span>
                  {/if}
                </button>

                <button
                  type="button"
                  onclick={startGame}
                  class="flex-1 min-h-[48px] py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>Play Again (Hotkey: R)</span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      </main>
    </div>

    <!-- Right Desktop App Column: Multi-Window OS Stack (Bank App + RetentionCord Live DM + 3AM Post-it) -->
    <aside class="w-full lg:w-80 shrink-0 flex flex-col gap-2.5">
      <!-- Non-Occluding Status Notification Strip -->
      {#if clearBanner || toasts.length > 0}
        <div role="status" aria-live="polite" class="space-y-1.5">
          {#if clearBanner}
            <div class="animate-stamp px-3.5 py-1.5 rounded-lg border-2 border-emerald-400 bg-emerald-950 text-emerald-200 font-display font-extrabold text-xs tracking-wide shadow-lg text-center">
              ✓ {clearBanner}
            </div>
          {/if}
          {#each toasts.slice(-1) as toast (toast.id)}
            <div
              class="animate-pop-in px-3 py-2 rounded-xl border shadow-lg text-xs flex items-start gap-2 {toast.kind ===
              'scam'
                ? 'bg-rose-950 border-rose-500 text-rose-100'
                : toast.kind === 'clear' || toast.kind === 'achievement'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-100'
                  : 'bg-slate-900 border-slate-700 text-slate-100'}"
            >
              {#if toast.kind === 'scam'}
                <AlertOctagon class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              {:else}
                <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              {/if}
              <div class="min-w-0">
                <div class="font-bold truncate">{toast.title}</div>
                <div class="opacity-90 truncate">{toast.detail}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- OS Window 2: LumiGuard Virtual Debit & Countdown App -->
      {#if windows.bank.open && !windows.bank.minimized}
        <div class="rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
          <div class="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span class="font-mono-num font-bold text-slate-200 flex items-center gap-1.5">
              <CreditCard class="w-3.5 h-3.5 text-rose-400" />
              <span>LumiBank_Guard.app</span>
            </span>
            <span class="font-mono-num text-emerald-400 font-bold">{clearedStages.length}/5 KILLED</span>
          </div>

          <div class="p-3.5 space-y-3">
            <div class="flex items-baseline justify-between">
              <div>
                <div class="text-xs font-mono-num text-slate-300">RENEWAL TIMER</div>
                <div
                  class="font-mono-num font-extrabold text-2xl sm:text-3xl tracking-tight {timeLeft <= 15 &&
                  phase === 'playing'
                    ? 'text-rose-400'
                    : timeLeft <= 35 && phase === 'playing'
                      ? 'text-amber-300'
                      : 'text-white'}"
                >
                  {formatClock(timeLeft)}
                </div>
              </div>

              <div class="text-right">
                <div class="text-xs font-mono-num text-slate-300">DAMAGE BILLED</div>
                <div class="relative font-mono-num font-extrabold text-xl {totalWasted > 0 ? 'text-rose-400' : 'text-emerald-400'}">
                  ${totalWasted.toFixed(2)}
                  {#if floatingBill}
                    <span class="absolute -top-5 right-0 text-xs font-extrabold text-rose-400 animate-float-up pointer-events-none">
                      {floatingBill}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Stage pips -->
            <div class="grid grid-cols-5 gap-1.5">
              {#each TRIALS as t (t.id)}
                {@const done = clearedStages.includes(t.id)}
                {@const active = phase === 'playing' && stageIdx === t.id}
                <div
                  class="h-2 rounded-full transition-colors {done
                    ? 'bg-emerald-400'
                    : active
                      ? 'bg-amber-400'
                      : 'bg-slate-800'}"
                  title={t.brand}
                ></div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- OS Window 3: RetentionCord Live DM (Founders & Bots messaging you in real time!) -->
      {#if windows.chat.open && !windows.chat.minimized}
        <div class="flex-1 min-h-[160px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden flex flex-col">
          <div class="bg-[#181b26] px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span class="font-mono-num font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5 text-indigo-400" />
              <span>RetentionCord • #dm-lumi</span>
            </span>
            <span class="px-1.5 py-0.5 rounded bg-rose-700 text-white font-mono-num text-xs font-bold">
              LIVE
            </span>
          </div>

          <div class="p-3 space-y-2 overflow-y-auto max-h-44 flex-1 text-xs">
            {#each chatMessages.slice(-4) as msg (msg.id)}
              <div class="flex items-start gap-2 bg-slate-950/70 border border-slate-800/90 rounded-lg p-2">
                <div class="w-6 h-6 rounded-md {msg.avatarBg} text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {msg.sender[0]}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-slate-200 truncate">{msg.sender}</span>
                    <span class="font-mono-num text-xs text-slate-400 shrink-0">{msg.time}</span>
                  </div>
                  <p class="text-slate-300 leading-snug mt-0.5">{msg.text}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- OS Window 4: Physical Sharp-Cornered Paper Post-it Note -->
      {#if windows.sticky.open && !windows.sticky.minimized}
        <div class="sticky-note-paper p-3.5 -rotate-1">
          <div class="flex items-center justify-between gap-1.5 font-display font-extrabold text-xs uppercase tracking-wide text-stone-900 mb-1.5">
            <span class="flex items-center gap-1.5">
              <StickyNote class="w-3.5 h-3.5" />
              <span>3AM STICKY NOTE</span>
            </span>
            {#if phase === 'playing'}
              <span class="font-mono-num text-xs text-stone-700">BOSS {stageIdx + 1}/5</span>
            {/if}
          </div>

          {#if phase === 'intro'}
            <p class="text-xs text-stone-900 leading-snug">
              "Future me: NEVER click shiny green buttons. Open <strong>kill-cli.sh (`~`)</strong> in the bottom dock to run <code class="font-mono-num font-bold">freeze</code> for +8s!"
            </p>
          {:else if phase === 'playing'}
            {#if currentHintRevealed}
              <p class="text-xs text-stone-900 leading-snug font-medium">
                "{stageHintText}"
              </p>
            {:else}
              <div class="space-y-2">
                <p class="text-xs text-stone-800 leading-snug">
                  Spoiler folded so you can solve <strong>{currentTrial.brand}</strong> yourself first.
                </p>
                <button
                  type="button"
                  onclick={revealCurrentHint}
                  class="w-full min-h-[44px] px-3 py-2 rounded bg-amber-300/90 hover:bg-amber-400/90 border border-amber-600/40 text-stone-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Peek 3AM Spoiler Hint (H)</span>
                </button>
              </div>
            {/if}
          {:else}
            <p class="text-xs text-stone-900 leading-snug">
              {totalWasted === 0
                ? '"Flawless zero-damage run! Copy the thermal receipt and flex it in Discord."'
                : `"We lost $${totalWasted.toFixed(2)} to dark patterns. Press R to run it back for the S+ stamp."`}
            </p>
          {/if}
        </div>
      {/if}
    </aside>

    <!-- Draggable Floating OS Window: kill-cli.sh Terminal Emulator -->
    {#if windows.terminal.open && !windows.terminal.minimized}
      <div
        style="z-index: {windows.terminal.z}; transform: translate({windows.terminal.x}px, {windows.terminal.y}px);"
        class="fixed bottom-16 left-4 sm:left-16 w-[340px] sm:w-[420px] rounded-xl border-2 border-emerald-500/70 bg-slate-950/95 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div
          role="toolbar"
          aria-label="Draggable terminal window titlebar"
          tabindex="0"
          onpointerdown={(e) => startWinDrag('terminal', e)}
          onpointermove={(e) => moveWinDrag('terminal', e)}
          onpointerup={endWinDrag}
          class="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing touch-none"
        >
          <div class="flex items-center gap-2 text-xs font-mono-num font-bold text-emerald-400">
            <Terminal class="w-3.5 h-3.5" />
            <span>root@lumi-pc:~ (kill-cli.sh)</span>
          </div>
          <button
            type="button"
            aria-label="Minimize terminal window"
            onclick={() => minimizeWindow('terminal')}
            class="min-w-[44px] min-h-[44px] -my-1 -mr-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
          >
            <Minus class="w-4 h-4" />
          </button>
        </div>

        <div class="p-3 font-mono-num text-xs space-y-1.5 max-h-44 overflow-y-auto text-slate-200">
          {#each termLogs as line}
            <div class={line.startsWith('$') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{line}</div>
          {/each}
        </div>

        <form onsubmit={runTerminalCmd} class="border-t border-slate-800 bg-slate-900/90 px-3 py-1.5 flex items-center gap-2">
          <span class="font-mono-num text-xs font-bold text-emerald-400">$</span>
          <input
            type="text"
            bind:value={termInput}
            placeholder="freeze | hint | killallchad | help"
            aria-label="Terminal command input"
            class="flex-1 min-h-[36px] bg-transparent text-xs font-mono-num text-white focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Run command"
            class="min-w-[44px] min-h-[44px] -my-1 -mr-2 flex items-center justify-center text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    {/if}

    <!-- Intrusive OS Adware Popups -->
    {#each spamPopups as sp (sp.id)}
      <div
        style="left: {sp.x}%; top: {sp.y}%; z-index: 60;"
        class="fixed w-72 bg-amber-50 text-slate-950 border-2 border-rose-600 rounded-xl shadow-2xl overflow-hidden animate-pop-in"
      >
        <div class="bg-rose-700 text-white px-3 py-1.5 flex items-center justify-between text-xs font-bold">
          <span class="flex items-center gap-1.5 truncate">
            <Sparkles class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{sp.title}</span>
          </span>
          <button
            type="button"
            aria-label="Close ad popup"
            onclick={() => closeSpamAd(sp.id)}
            class="min-w-[44px] min-h-[44px] -my-1 -mr-2 flex items-center justify-center hover:bg-rose-800 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        <div class="p-3.5 space-y-2.5 text-xs">
          <p class="text-slate-800 leading-snug">{sp.body}</p>
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              onclick={() => closeSpamAd(sp.id)}
              class="min-h-[44px] px-3 py-2 rounded-lg border border-slate-400 text-slate-800 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onclick={() => {
                handlePenalty(sp.title, sp.fee, 2);
                closeSpamAd(sp.id);
              }}
              class="min-h-[44px] px-3 py-2 rounded-lg bg-rose-700 text-white font-bold cursor-pointer"
            >
              {sp.cta}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Bottom OS Taskbar / App Dock -->
  <footer class="w-full bg-slate-950/95 border-t border-slate-800 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-2 z-40">
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onclick={() => toggleWindowDock('browser')}
        class="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 {activeWin ===
          'browser' && !windows.browser.minimized
          ? 'bg-slate-800 text-white border border-slate-600'
          : 'bg-slate-900 text-slate-300 hover:bg-slate-800/70 border border-slate-800'}"
      >
        <Globe class="w-4 h-4 text-indigo-400" />
        <span>HostileWeb ({clearedStages.length}/5)</span>
      </button>

      <button
        type="button"
        onclick={() => toggleWindowDock('terminal')}
        class="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-mono-num font-bold flex items-center gap-2 cursor-pointer shrink-0 {windows
          .terminal.open && !windows.terminal.minimized
          ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/60'
          : 'bg-slate-900 text-slate-300 hover:bg-slate-800/70 border border-slate-800'}"
      >
        <Terminal class="w-4 h-4 text-emerald-400" />
        <span>kill-cli.sh (`~`)</span>
        {#if !freezeUsed}
          <span class="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-xs">+8s READY</span>
        {/if}
      </button>

      <button
        type="button"
        onclick={() => toggleWindowDock('chat')}
        class="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 {windows
          .chat.open && !windows.chat.minimized
          ? 'bg-slate-800 text-white border border-slate-600'
          : 'bg-slate-900 text-slate-300 hover:bg-slate-800/70 border border-slate-800'}"
      >
        <MessageSquare class="w-4 h-4 text-sky-400" />
        <span>RetentionCord</span>
        {#if unreadChat > 0}
          <span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-mono-num text-xs font-bold">
            {unreadChat}
          </span>
        {/if}
      </button>

      <button
        type="button"
        onclick={() => toggleWindowDock('sticky')}
        class="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 {windows
          .sticky.open && !windows.sticky.minimized
          ? 'bg-amber-300 text-stone-950 font-bold'
          : 'bg-slate-900 text-slate-300 hover:bg-slate-800/70 border border-slate-800'}"
      >
        <StickyNote class="w-4 h-4" />
        <span>3AM Notes (H)</span>
      </button>
    </div>

    <div class="hidden md:flex items-center gap-3 font-mono-num text-xs text-slate-300 shrink-0">
      <span>SAVED: <strong class="text-emerald-400">${totalSaved.toFixed(2)}/mo</strong></span>
      <span>•</span>
      <span>03:14 AM</span>
    </div>
  </footer>
</div>
