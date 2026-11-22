<script lang="ts">
  import { Dumbbell, Flame, HeartCrack } from '@lucide/svelte';
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
    'Think of your summer arc!!',
    'Wheezing... cramping up...',
    'Okay fine... catch your breath...',
  ];

  let dodges = $state(0);
  let pos = $state({ x: 50, y: 68 }); // percentage inside arena
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

    // Update mascot eye tracking
    const dxEye = (relX - 50) / 50;
    const dyEye = (relY - 25) / 50;
    pupil = {
      x: Math.max(-4, Math.min(4, dxEye * 4)),
      y: Math.max(-3, Math.min(4, dyEye * 4)),
    };

    const dist = Math.hypot(relX - pos.x, relY - pos.y);
    if (dist < 24) {
      lastDodgeAt = now;
      dodges += 1;
      sfx.playDodge();

      // Jump to opposite quadrant bounded cleanly inside arena
      const nextX = relX > 50 ? 18 + Math.random() * 24 : 58 + Math.random() * 24;
      const nextY = relY > 52 ? 22 + Math.random() * 22 : 60 + Math.random() * 22;
      pos = { x: nextX, y: nextY };
    }
  }

  function handleCancelClick(e: MouseEvent) {
    // Keyboard activation (detail === 0) rewards accessibility speedrunners!
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

<div class="min-h-[470px] h-full bg-[#fff8f6] text-slate-900 p-5 sm:p-7 flex flex-col">
  <div class="max-w-2xl mx-auto w-full flex-1 flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center justify-between border-b border-rose-200/80 pb-3.5 mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
          <Dumbbell class="w-4 h-4" />
        </div>
        <span class="font-display font-extrabold text-lg text-slate-900">FitPulse AI</span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
        <Flame class="w-3.5 h-3.5" />
        <span>1-Day Couch Streak</span>
      </div>
    </div>

    <!-- Custom SVG Crying Kettlebell Mascot + Guilt Copy -->
    <div class="flex items-center gap-4 bg-white border border-rose-200 rounded-2xl p-4 mb-4 shadow-sm">
      <svg viewBox="0 0 88 88" class="w-16 h-16 shrink-0" aria-hidden="true">
        <!-- Kettlebell handle -->
        <path
          d="M28 30 C28 14, 60 14, 60 30"
          fill="none"
          stroke="#334155"
          stroke-width="8"
          stroke-linecap="round"
        />
        <!-- Kettlebell body -->
        <circle cx="44" cy="52" r="27" fill="#e11d48" />
        <circle cx="36" cy="42" r="6" fill="#fb7185" opacity="0.35" />
        <!-- Eyes -->
        <circle cx="35" cy="49" r="5.5" fill="#fff" />
        <circle cx="53" cy="49" r="5.5" fill="#fff" />
        <circle cx={35 + pupil.x} cy={49 + pupil.y} r="2.6" fill="#0f172a" />
        <circle cx={53 + pupil.x} cy={49 + pupil.y} r="2.6" fill="#0f172a" />
        <!-- Giant cartoon tears scaling with dodges -->
        {#if dodges > 0}
          <ellipse cx="32" cy={58 + dodges * 1.5} rx="2.6" ry={3.5 + dodges * 0.7} fill="#38bdf8" />
          <ellipse cx="56" cy={58 + dodges * 1.5} rx="2.6" ry={3.5 + dodges * 0.7} fill="#38bdf8" />
        {/if}
        <!-- Sad quivering mouth -->
        <path d="M36 64 Q44 57 52 64" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      </svg>

      <div class="flex-1">
        <h2 class="font-display font-extrabold text-base sm:text-lg text-slate-900">
          Pulsey is literally crying right now.
        </h2>
        <p class="text-xs text-slate-600 leading-relaxed mt-0.5">
          Chase the cancel button until it runs out of cardio stamina ({MAX_DODGES - dodges} dodges left) — or don't
          click our overpriced protein traps!
        </p>
        <!-- Stamina meter -->
        <div class="mt-2 flex items-center gap-2">
          <span class="text-[11px] font-mono-num font-semibold text-rose-700">BUTTON STAMINA</span>
          <div class="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-rose-600 transition-all duration-200"
              style="width: {Math.max(0, ((MAX_DODGES - dodges) / MAX_DODGES) * 100)}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Chase Arena -->
    <div
      bind:this={arenaEl}
      role="region"
      aria-label="Cancellation button arena"
      onpointermove={(e) => fleeFrom(e.clientX, e.clientY)}
      class="relative flex-1 min-h-[240px] bg-white border-2 border-dashed border-rose-200 rounded-2xl overflow-hidden shadow-inner p-4"
    >
      <!-- Tempting bait buttons scattered in arena -->
      <button
        type="button"
        onclick={() => onPenalty('FitPulse 5lb Whey Tub Upsell', 34.0, 2)}
        class="absolute top-4 left-4 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow cursor-pointer"
      >
        Stay &amp; Ship Protein Tub ($34)
      </button>

      <button
        type="button"
        onclick={() => onPenalty('Membership "Freeze" Fee', 9.99, 2)}
        class="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
      >
        Pause Plan Instead ($9.99/mo)
      </button>

      <!-- The Fleeing Cancel Button -->
      <button
        type="button"
        onpointerenter={(e) => fleeFrom(e.clientX, e.clientY)}
        onclick={handleCancelClick}
        style="left: {pos.x}%; top: {pos.y}%; transform: translate(-50%, -50%); transition: left 0.22s cubic-bezier(0.22, 1, 0.36, 1), top 0.22s cubic-bezier(0.22, 1, 0.36, 1);"
        class="absolute px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap shadow-md flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 {exhausted
          ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-200'
          : 'bg-slate-900 text-white'}"
      >
        <HeartCrack class="w-3.5 h-3.5" />
        <span>{buttonLabel}</span>
      </button>
    </div>
  </div>
</div>
