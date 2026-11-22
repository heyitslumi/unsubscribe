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
  } from '@lucide/svelte';
  import { INITIAL_TIME_SEC, TRIALS } from './lib/trials';
  import type { ChargeEntry, GamePhase, ToastItem } from './lib/types';
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
  let shaking = $state(false);
  let muted = $state(false);
  let copied = $state(false);
  let floatingBill = $state<string | null>(null);

  const currentTrial = $derived(TRIALS[stageIdx] ?? TRIALS[0]);
  const totalWasted = $derived(charges.reduce((sum, c) => sum + c.amount, 0));

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

  // Main countdown loop during gameplay
  $effect(() => {
    if (phase !== 'playing') return;
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = Math.max(0, timeLeft - dt);
      timeLeft = next;

      if (next <= 0) {
        triggerTimeout();
        return;
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
    }, 2800);
  }

  function startGame() {
    sfx.playClick();
    stageIdx = 0;
    timeLeft = INITIAL_TIME_SEC;
    charges = [];
    clearedStages = [];
    bonusNotes = [];
    toasts = [];
    copied = false;
    phase = 'playing';
  }

  function triggerTimeout() {
    sfx.playFail();
    // Charge all uncancelled trials!
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
    shaking = true;
    pushToast('scam', `Charged $${amount.toFixed(2)}!`, `${label} (-${timeSec}s)`);

    setTimeout(() => {
      shaking = false;
    }, 380);
    setTimeout(() => {
      floatingBill = null;
    }, 900);
  }

  function handleStageClear(note?: string) {
    sfx.playStageClear();
    clearedStages = [...clearedStages, currentTrial.id];
    if (note) {
      bonusNotes = [...bonusNotes, note];
      pushToast('achievement', 'Bonus Style!', note);
    } else {
      pushToast('clear', `${currentTrial.brand} Cancelled!`, `$${currentTrial.renewalCost.toFixed(2)}/mo dodged`);
    }

    if (stageIdx + 1 >= TRIALS.length) {
      setTimeout(() => {
        sfx.playVictory();
        phase = 'victory';
      }, 260);
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

<div class="min-h-screen w-full bg-[#0b0c10] text-slate-100 flex flex-col items-center justify-center p-2.5 sm:p-5">
  <!-- Outer Fake Browser Frame -->
  <div
    class="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_24px_70px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col {shaking
      ? 'animate-shake'
      : ''}"
  >
    <!-- Browser Tab Strip -->
    <div class="bg-[#12151e] border-b border-slate-800 px-3 pt-2.5 flex items-center gap-2 overflow-x-auto">
      <div class="flex items-center gap-1.5 pr-2 shrink-0" aria-hidden="true">
        <span class="w-3 h-3 rounded-full bg-rose-500/85"></span>
        <span class="w-3 h-3 rounded-full bg-amber-400/85"></span>
        <span class="w-3 h-3 rounded-full bg-emerald-500/85"></span>
      </div>

      {#each TRIALS as t (t.id)}
        {@const isDone = clearedStages.includes(t.id)}
        {@const isActive = phase === 'playing' && stageIdx === t.id}
        <div
          class="px-3 py-1.5 rounded-t-xl text-xs flex items-center gap-2 shrink-0 border-t border-x transition {isActive
            ? 'bg-slate-800 border-slate-700 text-white font-semibold'
            : isDone
              ? 'bg-slate-900/50 border-transparent text-emerald-400/80 line-through'
              : 'bg-slate-900/40 border-transparent text-slate-500'}"
        >
          <span class="w-2 h-2 rounded-full shrink-0" style="background: {isDone ? '#10b981' : t.accent};"></span>
          <span class="max-w-[125px] truncate">{t.brand}</span>
        </div>
      {/each}

      <div class="ml-auto pl-2 pb-1.5 shrink-0">
        <button
          type="button"
          onclick={toggleMute}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
        >
          {#if muted}
            <VolumeX class="w-4 h-4" />
          {:else}
            <Volume2 class="w-4 h-4" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Browser URL Bar + Persistent Game HUD -->
    <div class="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2.5">
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

      <!-- Shady URL Omnibox -->
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

      <!-- HUD Stats -->
      <div class="flex items-center gap-2 ml-auto">
        <div
          class="px-2.5 py-1 rounded-lg border font-mono-num text-xs font-bold flex items-center gap-1.5 {timeLeft <= 15 &&
          phase === 'playing'
            ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
            : timeLeft <= 35 && phase === 'playing'
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-200'}"
        >
          <Clock class="w-3.5 h-3.5" />
          <span>{formatClock(timeLeft)}</span>
        </div>

        <div class="relative px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono-num text-xs font-bold flex items-center gap-1.5">
          <CreditCard class="w-3.5 h-3.5 text-rose-400" />
          <span class={totalWasted > 0 ? 'text-rose-400' : 'text-emerald-400'}>
            ${totalWasted.toFixed(2)}
          </span>
          {#if floatingBill}
            <span class="absolute -top-5 right-0 text-xs font-extrabold text-rose-400 animate-float-up pointer-events-none">
              {floatingBill}
            </span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Main Viewport -->
    <main class="relative flex-1 min-h-[480px] flex flex-col">
      <!-- Floating Toast Stack -->
      {#if toasts.length > 0}
        <div class="absolute top-3 right-3 z-50 space-y-2 pointer-events-none max-w-xs">
          {#each toasts as toast (toast.id)}
            <div
              class="px-3.5 py-2.5 rounded-xl border shadow-xl text-xs backdrop-blur-md flex items-start gap-2 {toast.kind ===
              'scam'
                ? 'bg-rose-950/90 border-rose-500 text-rose-100'
                : toast.kind === 'clear' || toast.kind === 'achievement'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
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
        <div class="flex-1 bg-[#0e1117] p-6 sm:p-10 flex flex-col justify-center">
          <div class="max-w-xl mx-auto w-full space-y-6">
            <div class="space-y-3">
              <h1 class="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">
                UNSUBSCRIBE
              </h1>
              <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
                At 3:14 AM you started <strong class="text-white">5 sketchy SaaS free trials</strong> during a burst of
                delusional productivity. All five auto-renew in <strong class="text-amber-300 font-mono-num">90 seconds</strong>
                for <strong class="text-rose-400 font-mono-num">$212.48</strong>.
              </p>
            </div>

            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2.5">
              {#each TRIALS as t, idx (t.id)}
                <div class="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-slate-800/70 last:border-none">
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono-num text-xs text-slate-500">{idx + 1}.</span>
                    <span class="font-semibold text-slate-100">{t.brand}</span>
                    <span class="hidden sm:inline text-xs text-slate-500">— {t.tagline}</span>
                  </div>
                  <span class="font-mono-num text-slate-300 font-semibold">${t.renewalCost.toFixed(2)}/mo</span>
                </div>
              {/each}
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onclick={startGame}
                class="flex-1 py-4 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] transition text-white font-display font-extrabold text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
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
        <div class="flex-1 bg-[#0e1117] p-5 sm:p-8 flex items-center justify-center">
          <div class="w-full max-w-lg space-y-5">
            <!-- Rank Stamp Banner -->
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

            <!-- Paper Receipt -->
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

            <!-- Action Buttons -->
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
</div>
