<script lang="ts">
  import { Dumbbell, Flame, HeartCrack, Activity, Trophy } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  const MAX_DODGES = 5;
  const EXCUSES = [
    'Cancel Membership',
    'Wait! Leg day is tomorrow!',
    'Your 1-day streak will cry!',
    'Think of your summer arc!',
    'Wheezing... cramping up...',
    'Okay fine... catch your breath...',
  ];

  let dodges = $state(0);
  let pos = $state({ x: 50, y: 54 });
  let pupil = $state({ x: 0, y: 0 });
  let arenaEl: HTMLDivElement | undefined = $state();
  let lastDodgeAt = $state(0);

  const exhausted = $derived(dodges >= MAX_DODGES);
  const buttonLabel = $derived(EXCUSES[Math.min(dodges, EXCUSES.length - 1)]);

  function fleeFrom(clientX: number, clientY: number) {
    if (exhausted || !arenaEl) return;
    const now = performance.now();
    if (now - lastDodgeAt < 210) return;

    const rect = arenaEl.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((clientY - rect.top) / rect.height) * 100;

    const dxEye = (relX - 50) / 50;
    const dyEye = (relY - 25) / 50;
    pupil = {
      x: Math.max(-4, Math.min(4, dxEye * 4)),
      y: Math.max(-3, Math.min(4, dyEye * 4)),
    };

    const dist = Math.hypot(relX - pos.x, relY - pos.y);
    if (dist < 25) {
      lastDodgeAt = now;
      dodges += 1;
      sfx.playDodge();

      // Bounded to safe middle band (y: 26%..72%) so it never overlaps top/bottom bait buttons on mobile
      const nextX = relX > 50 ? 22 + Math.random() * 22 : 56 + Math.random() * 22;
      const nextY = relY > 50 ? 28 + Math.random() * 18 : 54 + Math.random() * 18;
      pos = { x: nextX, y: nextY };
    }
  }

  function handleCancelClick(e: MouseEvent) {
    if (e.detail === 0 && !exhausted) {
      onClear('Keyboard Tab+Enter speedrun!');
      return;
    }
    if (!exhausted) {
      fleeFrom(e.clientX, e.clientY);
      return;
    }
    onClear();
  }
</script>

<!-- Full-bleed Peloton/Strava-style Fitness Telemetry Portal -->
<div class="min-h-full flex-1 bg-[#fff5f5] text-slate-900 p-4 sm:p-6 flex flex-col">
  <div class="max-w-3xl mx-auto w-full flex-1 flex flex-col">
    <!-- Top Brand + Telemetry Bar -->
    <div class="flex flex-wrap items-center justify-between border-b border-rose-200 pb-3 mb-4 gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center">
          <Dumbbell class="w-4 h-4" />
        </div>
        <span class="font-display font-extrabold text-lg text-slate-900">FitPulse AI Performance</span>
      </div>
      <div class="flex items-center gap-2 text-xs font-bold">
        <span class="hidden sm:inline-flex items-center gap-1 text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-md">
          <Activity class="w-3.5 h-3.5" />
          <span>VO2 Max: Couch Grade</span>
        </span>
        <span class="inline-flex items-center gap-1 text-orange-900 bg-orange-100 border border-orange-300 px-2.5 py-1 rounded-md">
          <Flame class="w-3.5 h-3.5" />
          <span>1-Day Streak At Risk</span>
        </span>
      </div>
    </div>

    <!-- Custom SVG Crying Kettlebell Mascot + Cardio Stamina Bar -->
    <div class="flex items-center gap-4 bg-white border border-rose-200 rounded-xl p-3.5 sm:p-4 mb-3.5 shadow-sm">
      <svg viewBox="0 0 88 88" class="w-16 h-16 shrink-0" aria-hidden="true">
        <path
          d="M28 30 C28 14, 60 14, 60 30"
          fill="none"
          stroke="#334155"
          stroke-width="8"
          stroke-linecap="round"
        />
        <circle cx="44" cy="52" r="27" fill="#be123c" />
        <circle cx="36" cy="42" r="6" fill="#fb7185" opacity="0.35" />
        <circle cx="35" cy="49" r="5.5" fill="#fff" />
        <circle cx="53" cy="49" r="5.5" fill="#fff" />
        <circle cx={35 + pupil.x} cy={49 + pupil.y} r="2.6" fill="#0f172a" />
        <circle cx={53 + pupil.x} cy={49 + pupil.y} r="2.6" fill="#0f172a" />
        {#if dodges > 0}
          <ellipse cx="32" cy={58 + dodges * 1.5} rx="2.6" ry={3.5 + dodges * 0.7} fill="#38bdf8" />
          <ellipse cx="56" cy={58 + dodges * 1.5} rx="2.6" ry={3.5 + dodges * 0.7} fill="#38bdf8" />
        {/if}
        <path d="M36 64 Q44 57 52 64" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      </svg>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-display font-extrabold text-base sm:text-lg text-slate-900">
            Pulsey is literally crying right now
          </h2>
          <span class="hidden sm:inline-flex items-center gap-1 text-xs font-mono-num text-rose-800 font-bold">
            <Trophy class="w-3.5 h-3.5" />
            <span>$39.00/mo</span>
          </span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed mt-0.5">
          Chase the cancel button until it runs out of cardio stamina ({MAX_DODGES - dodges} dodges left) — and don't
          click the protein upsells.
        </p>
        <div class="mt-2 flex items-center gap-2">
          <span class="text-xs font-mono-num font-bold text-rose-800">BUTTON STAMINA</span>
          <div class="flex-1 h-2.5 bg-rose-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-700 transition-all duration-200"
              style="width: {Math.max(0, ((MAX_DODGES - dodges) / MAX_DODGES) * 100)}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Chase Arena (with subtle gym court lines) -->
    <div
      bind:this={arenaEl}
      role="region"
      aria-label="Cancellation button arena"
      onpointermove={(e) => fleeFrom(e.clientX, e.clientY)}
      class="relative flex-1 min-h-[250px] bg-white border-2 border-rose-300 rounded-xl overflow-hidden shadow-inner p-4"
    >
      <!-- Tempting bait buttons (44px+ touch targets) -->
      <button
        type="button"
        onclick={() => onPenalty('FitPulse 5lb Whey Tub Upsell', 34.0, 2)}
        class="absolute top-3 left-3 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow cursor-pointer"
      >
        Stay &amp; Ship Protein Tub ($34)
      </button>

      <button
        type="button"
        onclick={() => onPenalty('Membership "Freeze" Fee', 9.99, 2)}
        class="absolute bottom-3 right-3 min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow cursor-pointer"
      >
        Pause Plan Instead ($9.99/mo)
      </button>

      <!-- The Fleeing Cancel Button (44px+ touch target) -->
      <button
        type="button"
        onpointerenter={(e) => fleeFrom(e.clientX, e.clientY)}
        onclick={handleCancelClick}
        style="left: {pos.x}%; top: {pos.y}%; transform: translate(-50%, -50%); transition: left 0.2s cubic-bezier(0.22, 1, 0.36, 1), top 0.2s cubic-bezier(0.22, 1, 0.36, 1);"
        class="absolute min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow-md flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 {exhausted
          ? 'bg-rose-700 hover:bg-rose-800 text-white ring-4 ring-rose-200'
          : 'bg-slate-900 text-white'}"
      >
        <HeartCrack class="w-4 h-4 shrink-0" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  </div>
</div>
