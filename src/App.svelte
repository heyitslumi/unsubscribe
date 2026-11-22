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

  // Trauma-based camera shake & hitstop (from game-feel skill)
  let trauma = $state(0);
  let shakeOffset = $state({ x: 0, y: 0, rot: 0 });
  let hitStopUntil = $state(0);
  let lastTickSecond = $state(999);

  const currentTrial = $derived(TRIALS[stageIdx] ?? TRIALS[0]);
  const totalWasted = $derived(charges.reduce((sum, c) => sum + c.amount, 0));
  const totalSaved = $derived(
    TRIALS.filter((t) => clearedStages.includes(t.id)).reduce((sum, t) => sum + t.renewalCost, 0)
  );
  const timerPct = $derived(Math.max(0, Math.min(100, (timeLeft / INITIAL_TIME_SEC) * 100)));

  const rankInfo = $derived.by(() => {
    if (phase === 'timeout') {
      return {
        grade: 'F',
        title: 'VC EXIT LIQUIDITY',
        color: 'text-rose-400 border-rose-500/50 bg-rose-500/10',
        blurb: 'The clock hit 00:00 and every remaining free trial auto-renewed on your card.',
      };
    }
    if (totalWasted === 0 && timeLeft >= 35) {
      return {
        grade: 'S+',
        title: 'DARK-PATTERN EXORCIST',
        color: 'text-emerald-300 border-emerald-400/60 bg-emerald-500/15',
        blurb: '$0.00 wasted with time to spare. SaaS growth hackers tell campfire horror stories about you.',
      };
    }
    if (totalWasted === 0) {
      return {
        grade: 'S',
        title: 'IMMUNE TO MARKETING',
        color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/10',
        blurb: 'Not a single cent surrendered to dark patterns.',
      };
    }
    if (totalWasted <= 25) {
      return {
        grade: 'A',
        title: 'MOSTLY UNSCAMMED',
        color: 'text-sky-300 border-sky-400/50 bg-sky-500/10',
        blurb: 'You escaped all 5 trials with only minor psychological and financial bruising.',
      };
    }
    if (totalWasted <= 75) {
      return {
        grade: 'B',
        title: 'VALUED Q4 REVENUE',
        color: 'text-amber-300 border-amber-400/50 bg-amber-500/10',
        blurb: 'You cancelled eventually, right after funding the CEO’s espresso machine.',
      };
    }
    return {
      grade: 'C',
      title: 'CLICKER OF SHINY BUTTONS',
      color: 'text-orange-300 border-orange-400/50 bg-orange-500/10',
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

  // Main countdown + real-time trauma shake loop (game-feel pattern: shake decays in real time, timer respects hitstop)
  $effect(() => {
    let last = performance.now();
    let raf = 0;
    let t = 0;

    const tick = (now: number) => {
      const realDt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // 1. Real-time trauma decay (summed sines at unrelated frequencies, never static random buzz)
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

      // 2. Game timer (paused briefly during hit-stop impacts)
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
    }, 2900);
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
    copied = false;
    clearBanner = null;
    phase = 'playing';
  }

  function triggerTimeout() {
    sfx.playFail();
    addTrauma(0.95);
    const uncancelled = TRIALS.filter((t) => !clearedStages.includes(t.id)).map((t) => ({
      id: `renew-${t.id}`,
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

    charges = [
      ...charges,
      {
        id: `${Date.now()}-${Math.random()}`,
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
    addTrauma(0.5);
    triggerHitStop(75);
    spawnParticles('clear', `-$${currentTrial.renewalCost.toFixed(2)}/mo`);

    clearedStages = [...clearedStages, currentTrial.id];
    clearBanner = `${currentTrial.brand.toUpperCase()} TERMINATED!`;
    setTimeout(() => {
      clearBanner = null;
    }, 820);

    if (note) {
      bonusNotes = [...bonusNotes, note];
      pushToast('achievement', 'STYLE BONUS!', note);
    } else {
      pushToast('clear', `${currentTrial.brand} Cancelled!`, `$${currentTrial.renewalCost.toFixed(2)}/mo saved`);
    }

    if (stageIdx + 1 >= TRIALS.length) {
      setTimeout(() => {
        sfx.playVictory();
        phase = 'victory';
      }, 340);
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
      `Traps Triggered: ${charges.length}`,
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

<!-- 3:14 AM Panic OS Desktop Shell -->
<div class="min-h-screen w-full desktop-wallpaper text-slate-100 flex flex-col justify-between overflow-x-hidden">
  <!-- Top OS Status & Arcade Threat Bar -->
  <header class="w-full bg-slate-950/90 border-b border-slate-800/90 backdrop-blur-md px-3 sm:px-6 py-2 flex items-center justify-between gap-3 z-30">
    <div class="flex items-center gap-2.5">
      <span class="px-2 py-0.5 rounded bg-rose-600 text-white font-display font-extrabold text-xs tracking-tight">
        UNSUBSCRIBE OS
      </span>
      <span class="hidden md:inline text-xs text-slate-400 font-mono-num">
        session: 03:14:09_AM • virtual-card •••• 4049
      </span>
    </div>

    <!-- Full-Width Arcade Countdown Meter -->
    <div class="flex-1 max-w-md mx-2 hidden sm:flex items-center gap-2.5">
      <span class="text-[11px] font-mono-num uppercase text-slate-400 shrink-0">AUTO-RENEW</span>
      <div class="flex-1 h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
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

    <div class="flex items-center gap-3 text-xs font-mono-num text-slate-300">
      <div class="hidden sm:flex items-center gap-1.5 text-amber-400">
        <BatteryWarning class="w-3.5 h-3.5" />
        <span>4%</span>
      </div>
      <div class="hidden sm:flex items-center gap-1 text-emerald-400">
        <Wifi class="w-3.5 h-3.5" />
        <span>5G</span>
      </div>
      <button
        type="button"
        onclick={toggleMute}
        aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center gap-1"
      >
        {#if muted}
          <VolumeX class="w-3.5 h-3.5 text-rose-400" />
        {:else}
          <Volume2 class="w-3.5 h-3.5 text-emerald-400" />
        {/if}
      </button>
    </div>
  </header>

  <!-- Main Desktop Workspace (Browser + Live Bank Sidecar) -->
  <div class="flex-1 w-full max-w-[1380px] mx-auto px-2.5 sm:px-5 py-3 sm:py-4 flex flex-col lg:flex-row items-stretch gap-4">
    <!-- Left/Main: Hostile SaaS Browser Window -->
    <div
      style="transform: translate3d({shakeOffset.x}px, {shakeOffset.y}px, 0) rotate({shakeOffset.rot}deg);"
      class="flex-1 min-w-0 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col relative"
    >
      <!-- Browser Tab Strip -->
      <div class="bg-[#11141d] border-b border-slate-800 px-3 pt-2.5 flex items-center gap-1.5 overflow-x-auto">
        <div class="flex items-center gap-1.5 pr-2 shrink-0" aria-hidden="true">
          <span class="w-3 h-3 rounded-full bg-rose-500"></span>
          <span class="w-3 h-3 rounded-full bg-amber-400"></span>
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
        </div>

        {#each TRIALS as t, idx (t.id)}
          {@const isDone = clearedStages.includes(t.id)}
          {@const isActive = phase === 'playing' && stageIdx === t.id}
          <div
            class="px-3 py-1.5 rounded-t-xl text-xs flex items-center gap-2 shrink-0 border-t border-x transition-colors {isActive
              ? 'bg-slate-800 border-slate-600 text-white font-bold'
              : isDone
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400 line-through'
                : 'bg-slate-900/50 border-transparent text-slate-500'}"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              style="background: {isDone ? '#10b981' : t.accent};"
            ></span>
            <span class="font-mono-num text-[10px] opacity-65">{idx + 1}/5</span>
            <span class="max-w-[115px] truncate">{t.brand}</span>
          </div>
        {/each}
      </div>

      <!-- Browser URL Bar + Boss Encounter Sub-Banner -->
      <div class="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Reload page"
          onclick={() => {
            if (phase === 'playing') {
              pushToast('hint', 'Nice try!', 'Refreshing only makes our tracking pixels stronger.');
            }
          }}
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <RotateCw class="w-3.5 h-3.5" />
        </button>

        <div class="flex-1 min-w-[180px] bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
          <Lock class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span class="font-mono-num text-slate-300 truncate">
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
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-num text-[11px] font-bold">
            <Zap class="w-3.5 h-3.5" />
            <span>{currentTrial.bossTitle}</span>
          </div>
        {/if}

        <!-- Compact Mobile HUD Pills (always visible on small screens) -->
        <div class="flex lg:hidden items-center gap-2 ml-auto">
          <div
            class="px-2.5 py-1 rounded-lg border font-mono-num text-xs font-bold flex items-center gap-1 {timeLeft <= 15 &&
            phase === 'playing'
              ? 'bg-rose-950 border-rose-500 text-rose-300'
              : 'bg-slate-950 border-slate-800 text-slate-200'}"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>{formatClock(timeLeft)}</span>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono-num text-xs font-bold text-rose-400">
            ${totalWasted.toFixed(2)}
          </div>
        </div>
      </div>

      <!-- Main Stage Viewport -->
      <main class="relative flex-1 min-h-[500px] flex flex-col">
        <!-- Burst Particles Overlay (game-feel) -->
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

        <!-- Rubber-Stamp Stage Clear Flash -->
        {#if clearBanner}
          <div class="absolute inset-x-0 top-14 z-40 flex justify-center pointer-events-none">
            <div class="animate-stamp px-5 py-2 rounded-xl border-2 border-emerald-400 bg-emerald-950/95 text-emerald-300 font-display font-extrabold text-lg sm:text-xl shadow-2xl">
              ✓ {clearBanner}
            </div>
          </div>
        {/if}

        <!-- Floating Toast Stack -->
        {#if toasts.length > 0}
          <div class="absolute top-3 right-3 z-50 space-y-2 pointer-events-none max-w-xs">
            {#each toasts as toast (toast.id)}
              <div
                class="animate-pop-in px-3.5 py-2.5 rounded-xl border shadow-xl text-xs backdrop-blur-md flex items-start gap-2 {toast.kind ===
                'scam'
                  ? 'bg-rose-950/95 border-rose-500 text-rose-100'
                  : toast.kind === 'clear' || toast.kind === 'achievement'
                    ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100'
                    : 'bg-slate-900/95 border-slate-700 text-slate-200'}"
              >
                {#if toast.kind === 'scam'}
                  <AlertOctagon class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                {:else}
                  <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {/if}
                <div>
                  <div class="font-bold">{toast.title}</div>
                  <div class="opacity-85">{toast.detail}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if phase === 'intro'}
          <div class="flex-1 bg-[#0b0e16] p-5 sm:p-9 flex flex-col justify-center relative overflow-hidden">
            <!-- Hazard top callout -->
            <div class="max-w-2xl mx-auto w-full space-y-5">
              <div class="hazard-stripes border border-amber-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-amber-300 text-xs font-mono-num font-bold">
                  <BellRing class="w-4 h-4 shrink-0" />
                  <span>BANK ALERT: 5 FREE TRIALS EXPIRE IN 90.0 SECONDS</span>
                </div>
                <span class="font-mono-num text-xs font-extrabold text-rose-400">$212.48 AT RISK</span>
              </div>

              <div class="space-y-2">
                <h1 class="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.02]">
                  UNSUBSCRIBE
                </h1>
                <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
                  A <strong class="text-white">dark-pattern boss rush</strong>. At 3:14 AM you signed up for 5 sketchy
                  SaaS free trials. Fight through guilt-trip mascots, Hydra cookie walls, fleeing buttons, and corporate
                  captchas before your virtual card gets drained.
                </p>
              </div>

              <!-- 5 Boss Dossier Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {#each TRIALS as t, idx (t.id)}
                  <div class="bg-slate-900/95 border border-slate-800 rounded-xl p-3 flex sm:flex-col justify-between gap-2">
                    <div class="flex items-center sm:items-start justify-between gap-1.5">
                      <span
                        class="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded text-white"
                        style="background: {t.accent};"
                      >
                        BOSS {idx + 1}
                      </span>
                      <span class="font-mono-num text-xs font-extrabold text-rose-400">
                        ${t.renewalCost.toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <div class="font-display font-bold text-xs text-white truncate">{t.brand}</div>
                      <div class="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{t.tagline}</div>
                    </div>
                  </div>
                {/each}
              </div>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onclick={startGame}
                  class="bait-button flex-1 py-4 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-extrabold text-base sm:text-lg shadow-[0_10px_30px_rgba(225,29,72,0.45)] flex items-center justify-center gap-2.5 cursor-pointer"
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
          <!-- Victory / Timeout Thermal Receipt Screen -->
          <div class="flex-1 bg-[#0b0e16] p-5 sm:p-8 flex items-center justify-center">
            <div class="w-full max-w-lg space-y-5">
              <div class="rounded-2xl border p-5 flex items-center justify-between gap-4 {rankInfo.color}">
                <div>
                  <div class="flex items-center gap-2 text-xs font-mono-num uppercase opacity-85 mb-1">
                    <Award class="w-4 h-4" />
                    <span>{phase === 'victory' ? 'All 5 Trials Terminated' : 'Auto-Renewal Struck'}</span>
                  </div>
                  <h2 class="font-display text-2xl font-extrabold tracking-tight">{rankInfo.title}</h2>
                  <p class="text-xs opacity-90 mt-1 leading-relaxed">{rankInfo.blurb}</p>
                </div>
                <div class="animate-stamp shrink-0 w-16 h-16 rounded-2xl border-2 border-current flex items-center justify-center font-display font-extrabold text-3xl">
                  {rankInfo.grade}
                </div>
              </div>

              <div class="bg-[#faf8f2] text-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl font-mono-num text-xs space-y-3">
                <div class="flex items-center justify-between border-b border-dashed border-slate-300 pb-3">
                  <div class="flex items-center gap-2 font-bold text-sm">
                    <Receipt class="w-4 h-4 text-slate-700" />
                    <span>CARD STATEMENT SUMMARY</span>
                  </div>
                  <span class="text-slate-500">{formatClock(timeLeft)} LEFT</span>
                </div>

                <div class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {#each TRIALS as t (t.id)}
                    {@const ok = clearedStages.includes(t.id)}
                    <div class="flex items-center justify-between">
                      <span class={ok ? 'text-slate-600 line-through' : 'text-rose-700 font-bold'}>
                        {t.brand} Trial
                      </span>
                      <span class={ok ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {ok ? 'CANCELLED ($0.00)' : `RENEWED ($${t.renewalCost.toFixed(2)})`}
                      </span>
                    </div>
                  {/each}

                  {#if charges.filter((c) => !c.id.startsWith('renew-')).length > 0}
                    <div class="border-t border-dashed border-slate-300 my-2 pt-2 text-[11px] text-slate-500 uppercase">
                      Dark-Pattern Traps Clicked
                    </div>
                    {#each charges.filter((c) => !c.id.startsWith('renew-')) as c (c.id)}
                      <div class="flex items-center justify-between text-rose-700">
                        <span class="truncate pr-3">{c.label}</span>
                        <span class="font-bold shrink-0">+${c.amount.toFixed(2)}</span>
                      </div>
                    {/each}
                  {/if}
                </div>

                <div class="border-t-2 border-slate-900 pt-3 flex items-center justify-between text-sm font-extrabold">
                  <span>TOTAL BILLED</span>
                  <span class={totalWasted === 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    ${totalWasted.toFixed(2)}
                  </span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  type="button"
                  onclick={copyReceipt}
                  class="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
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
                  class="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw class="w-4 h-4" />
                  <span>Play Again (Go for S+)</span>
                </button>
              </div>
            </div>
          </div>
        {/if}
      </main>
    </div>

    <!-- Right Desktop Sidecar: Arcade Telemetry, Virtual Credit Card, Live Feed & Sticky Note -->
    <aside class="w-full lg:w-80 shrink-0 flex flex-col gap-3">
      <!-- Big Arcade Countdown Module -->
      <div class="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl">
        <div class="flex items-center justify-between text-[11px] font-mono-num text-slate-400 mb-1">
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
      <div class="relative rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 shadow-xl overflow-hidden">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span class="font-display font-bold text-slate-200 flex items-center gap-1.5">
            <CreditCard class="w-4 h-4 text-rose-400" />
            <span>LUMI VIRTUAL DEBIT</span>
          </span>
          <span class="font-mono-num text-[11px]">•••• 4049</span>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          <div>
            <div class="text-[10px] font-mono-num text-slate-400 uppercase">DARK-PATTERN DAMAGE</div>
            <div class="relative font-mono-num font-extrabold text-xl {totalWasted > 0 ? 'text-rose-400' : 'text-slate-200'}">
              ${totalWasted.toFixed(2)}
              {#if floatingBill}
                <span class="absolute -top-5 left-0 text-xs font-extrabold text-rose-400 animate-float-up pointer-events-none">
                  {floatingBill}
                </span>
              {/if}
            </div>
          </div>
          <div>
            <div class="text-[10px] font-mono-num text-slate-400 uppercase">MONTHLY SAVED</div>
            <div class="font-mono-num font-extrabold text-xl text-emerald-400">
              ${totalSaved.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <!-- Live Bank SMS / Charge Feed -->
      <div class="flex-1 min-h-[130px] rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col">
        <div class="flex items-center justify-between text-[11px] font-mono-num text-slate-400 pb-2 mb-2 border-b border-slate-800">
          <span class="flex items-center gap-1.5">
            <Flame class="w-3.5 h-3.5 text-rose-400" />
            <span>LIVE TRANSACTION LOG</span>
          </span>
          <span>{charges.length} EVENTS</span>
        </div>

        {#if charges.length === 0}
          <div class="flex-1 flex items-center justify-center text-center text-xs text-slate-500 py-4">
            No dark-pattern charges yet. Keep your cursor away from shiny green buttons!
          </div>
        {:else}
          <div class="space-y-1.5 overflow-y-auto max-h-36 pr-1 font-mono-num text-xs">
            {#each [...charges].reverse() as c (c.id)}
              <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-200">
                <span class="truncate">{c.label}</span>
                <span class="font-bold text-rose-400 shrink-0">+${c.amount.toFixed(2)}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Diegetic Yellow Sticky Note -->
      <div class="rounded-2xl bg-amber-200 text-slate-900 p-3.5 shadow-lg border border-amber-300 -rotate-[0.6deg]">
        <div class="flex items-center gap-1.5 font-display font-extrabold text-xs uppercase tracking-wide text-amber-950 mb-1">
          <StickyNote class="w-3.5 h-3.5" />
          <span>3AM STICKY NOTE TO SELF</span>
        </div>
        <p class="text-xs text-amber-950/90 leading-snug">
          {#if phase === 'intro'}
            "NEVER click big green buttons. Read the tiny gray fine print and watch out for Chad from Customer Success."
          {:else if stageIdx === 0}
            "CloudNote+ hides the exit link in the tiny gray footer. Uncheck Boxes #1 and #2 on the survey!"
          {:else if stageIdx === 1}
            "Don't click the ×! Open Granular Interest, turn all 3 switches OFF (watch Switch #1 relight!), then drag Chad out of the way."
          {:else if stageIdx === 2}
            "Chase the fleeing button 5 times to tire it out — or press Tab + Enter for an instant accessibility speedrun!"
          {:else if stageIdx === 3}
            "Pick actual human needs (Sleep, Transparent Pricing, Working Cancel Button), then brake the shuttle in the green zone."
          {:else}
            "Scroll the ToS to uncheck all 3 $15 landmines, ignore the fake timeout button, and watch the A/B button swap when typing UNSUBSCRIBE!"
          {/if}
        </p>
      </div>
    </aside>
  </div>
</div>
