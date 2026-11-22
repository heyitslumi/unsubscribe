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
    Award,
    Flame,
    Zap,
    Wifi,
    BatteryWarning,
    StickyNote,
    BellRing,
    Eye,
  } from '@lucide/svelte';
  import { INITIAL_TIME_SEC, TRIALS } from './lib/trials';
  import type { BurstParticle, ChargeEntry, GamePhase, ToastItem } from './lib/types';
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

  // Progressive disclosure for 3AM Sticky Note hints (unmasked on click or after a trap misclick)
  let hintRevealedForStage = $state<Record<number, boolean>>({});

  // Trauma-based camera shake & hitstop (from game-feel skill)
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
    hintRevealedForStage = {};
    copied = false;
    clearBanner = null;
    phase = 'playing';
  }

  function revealCurrentHint() {
    sfx.playClick();
    hintRevealedForStage = { ...hintRevealedForStage, [stageIdx]: true };
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
    phase = 'timeout';
  }

  function handlePenalty(label: string, amount: number, timeSec = 2) {
    sfx.playScam();
    addTrauma(0.65);
    triggerHitStop(55);
    spawnParticles('scam', `+$${amount.toFixed(2)}`);

    // Automatically reveal the 3AM sticky note hint when a player hits a trap
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

<!-- 3:14 AM Panic OS Desktop Shell -->
<div class="min-h-screen w-full desktop-wallpaper text-slate-100 flex flex-col justify-between overflow-x-hidden">
  <!-- Top OS Status & Arcade Threat Bar -->
  <header class="w-full bg-slate-950/95 border-b border-slate-800 px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3 z-30">
    <div class="flex items-center gap-2.5">
      <span class="px-2.5 py-1 rounded bg-rose-700 text-white font-display font-extrabold text-xs tracking-tight">
        UNSUBSCRIBE OS
      </span>
      <span class="hidden md:inline text-xs text-slate-300 font-mono-num">
        session: 03:14:09_AM • virtual-card •••• 4049
      </span>
    </div>

    <!-- Full-Width Arcade Countdown Meter -->
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
    </div>

    <div class="flex items-center gap-2 sm:gap-3 text-xs font-mono-num text-slate-200">
      <div class="hidden sm:flex items-center gap-1.5 text-amber-300">
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

  <!-- Main Desktop Workspace (Browser + Live Bank Sidecar) -->
  <div class="flex-1 w-full max-w-[1380px] mx-auto px-2.5 sm:px-5 py-2.5 sm:py-4 flex flex-col lg:flex-row items-stretch gap-4">
    <!-- Left/Main: Hostile SaaS Browser Window -->
    <div
      style="transform: translate3d({shakeOffset.x}px, {shakeOffset.y}px, 0) rotate({shakeOffset.rot}deg);"
      class="flex-1 min-w-0 rounded-xl border border-slate-700 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col relative"
    >
      <!-- Browser Tab Strip (hidden scrollbar + WCAG contrast) -->
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

      <!-- Browser URL Bar + Boss Encounter Sub-Banner -->
      <div class="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Reload page"
          aria-label="Reload simulated browser page"
          onclick={() => {
            if (phase === 'playing') {
              pushToast('hint', 'Tracking Pixels Intensified', 'Use Restart (R) in the top bar if you want a fresh run.');
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

        <!-- Compact Mobile HUD Pills + Mobile Hint Button (always visible on <1024px) -->
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

      <!-- Mobile Sticky Note Banner when revealed on small screens -->
      {#if phase === 'playing' && currentHintRevealed}
        <div class="lg:hidden bg-amber-200 text-slate-950 px-3.5 py-2 border-b border-amber-400 text-xs font-medium flex items-start gap-2">
          <StickyNote class="w-4 h-4 shrink-0 mt-0.5 text-amber-900" />
          <span><strong>3AM Note:</strong> {stageHintText}</span>
        </div>
      {/if}

      <!-- Main Stage Viewport -->
      <main class="relative flex-1 min-h-[490px] flex flex-col">
        <!-- Burst Particles Overlay -->
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

        <!-- Bottom-Docked Rubber-Stamp Stage Clear Flash (never occludes top stage headers) -->
        {#if clearBanner}
          <div class="absolute inset-x-0 bottom-5 z-40 flex justify-center pointer-events-none">
            <div class="animate-stamp px-5 py-2 rounded-lg border-2 border-emerald-300 bg-emerald-950/95 text-emerald-200 font-display font-extrabold text-base sm:text-lg shadow-2xl">
              ✓ {clearBanner}
            </div>
          </div>
        {/if}

        <!-- Bottom-Left Floating Toast Stack (never collides with top-right stage badges) -->
        {#if toasts.length > 0}
          <div
            role="status"
            aria-live="polite"
            class="absolute bottom-3 left-3 z-50 space-y-2 pointer-events-none max-w-xs"
          >
            {#each toasts as toast (toast.id)}
              <div
                class="animate-pop-in px-3.5 py-2.5 rounded-xl border shadow-xl text-xs backdrop-blur-md flex items-start gap-2 {toast.kind ===
                'scam'
                  ? 'bg-rose-950/95 border-rose-500 text-rose-100'
                  : toast.kind === 'clear' || toast.kind === 'achievement'
                    ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                    : 'bg-slate-900/95 border-slate-700 text-slate-100'}"
              >
                {#if toast.kind === 'scam'}
                  <AlertOctagon class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                {:else}
                  <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {/if}
                <div>
                  <div class="font-bold">{toast.title}</div>
                  <div class="opacity-90">{toast.detail}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if phase === 'intro'}
          <div class="flex-1 bg-[#0b0e16] p-4 sm:p-8 flex flex-col justify-center relative overflow-hidden">
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
                  guilt-trip modals, Hydra cookie walls, fleeing buttons, and corporate captchas before your virtual
                  debit card gets drained.
                </p>
              </div>

              <!-- Clean Ledger Table of All 5 Pending Auto-Debits (no nested-cards, zero text truncation, fits above 390x844 mobile fold) -->
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
          <div class="flex-1 bg-[#0b0e16] p-4 sm:p-8 flex items-center justify-center">
            <div class="w-full max-w-lg space-y-5">
              <!-- Serrated Thermal Paper Statement with Direct Ink Stamp -->
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

                  <!-- Rubber-Stamped Grade Directly on Paper -->
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

    <!-- Right Desktop Sidecar: Arcade Telemetry, Virtual Credit Card, Live Feed & Physical Post-it -->
    <aside class="w-full lg:w-80 shrink-0 flex flex-col gap-3">
      <!-- Big Arcade Countdown Module -->
      <div class="rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl">
        <div class="flex items-center justify-between text-xs font-mono-num text-slate-300 mb-1">
          <span class="flex items-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-amber-400" />
            <span>RENEWAL COUNTDOWN</span>
          </span>
          <span class="text-emerald-400 font-bold">{clearedStages.length}/5 CLEARED</span>
        </div>

        <div
          class="font-mono-num font-extrabold text-3xl sm:text-4xl tracking-tight {timeLeft <= 15 && phase === 'playing'
            ? 'text-rose-400'
            : timeLeft <= 35 && phase === 'playing'
              ? 'text-amber-300'
              : 'text-white'}"
        >
          {formatClock(timeLeft)}
        </div>

        <!-- Stage pips -->
        <div class="grid grid-cols-5 gap-1.5 mt-3">
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

      <!-- Virtual Credit Card Widget -->
      <div class="relative rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl overflow-hidden">
        <div class="flex items-center justify-between text-xs text-slate-300 mb-3">
          <span class="font-display font-bold text-white flex items-center gap-1.5">
            <CreditCard class="w-4 h-4 text-rose-400" />
            <span>LUMI VIRTUAL DEBIT</span>
          </span>
          <span class="font-mono-num text-xs text-slate-300">•••• 4049</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          <div>
            <div class="text-xs font-mono-num text-slate-300">DAMAGE BILLED</div>
            <div class="relative font-mono-num font-extrabold text-xl {totalWasted > 0 ? 'text-rose-400' : 'text-slate-100'}">
              ${totalWasted.toFixed(2)}
              {#if floatingBill}
                <span class="absolute -top-5 left-0 text-xs font-extrabold text-rose-400 animate-float-up pointer-events-none">
                  {floatingBill}
                </span>
              {/if}
            </div>
          </div>
          <div>
            <div class="text-xs font-mono-num text-slate-300">MONTHLY SAVED</div>
            <div class="font-mono-num font-extrabold text-xl text-emerald-400">
              ${totalSaved.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <!-- Live Bank SMS / Activity Ledger (logs both blocked renewals and penalty charges!) -->
      <div class="flex-1 min-h-[130px] rounded-xl border border-slate-800 bg-slate-900/95 p-3.5 flex flex-col">
        <div class="flex items-center justify-between text-xs font-mono-num text-slate-300 pb-2 mb-2 border-b border-slate-800">
          <span class="flex items-center gap-1.5">
            <Flame class="w-3.5 h-3.5 text-rose-400" />
            <span>LIVE CARD LEDGER</span>
          </span>
          <span>{charges.length} EVENTS</span>
        </div>

        {#if charges.length === 0}
          <div class="flex-1 flex items-center justify-center text-center text-xs text-slate-300 py-4 leading-relaxed">
            Card armed. Terminate all 5 trials before 00:00.0 without clicking upsell traps.
          </div>
        {:else}
          <div class="space-y-1.5 overflow-y-auto max-h-36 pr-1 font-mono-num text-xs">
            {#each [...charges].reverse() as c (c.id)}
              {#if c.kind === 'saved'}
                <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-200">
                  <span class="truncate">✓ {c.label}</span>
                  <span class="font-bold text-emerald-300 shrink-0">-${c.amount.toFixed(2)}/mo</span>
                </div>
              {:else}
                <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200">
                  <span class="truncate">✕ {c.label}</span>
                  <span class="font-bold text-rose-300 shrink-0">+${c.amount.toFixed(2)}</span>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>

      <!-- Physical Sharp-Cornered Paper Post-it Note with Progressive Disclosure -->
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
            "Future me: NEVER click shiny green buttons. Inspect the fine print, and press <strong>R</strong> if you need a fast reset."
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
    </aside>
  </div>
</div>
