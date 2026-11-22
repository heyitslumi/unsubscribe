<script lang="ts">
  import { ShieldCheck, Check, Cpu, LockKeyhole, Lock } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  interface Tile {
    id: number;
    label: string;
    isHuman: boolean;
  }

  const TILES: Tile[] = [
    { id: 1, label: 'AI Blockchain Pivot', isHuman: false },
    { id: 2, label: '8 Hours of Sleep', isHuman: true },
    { id: 3, label: 'Q4 Synergy Matrix', isHuman: false },
    { id: 4, label: 'Transparent Pricing', isHuman: true },
    { id: 5, label: 'Mandatory Fun Zoom', isHuman: false },
    { id: 6, label: 'Contact Sales Tier', isHuman: false },
    { id: 7, label: '10x Thought Leader', isHuman: false },
    { id: 8, label: 'Working Cancel Button', isHuman: true },
    { id: 9, label: 'Web4 Loyalty NFT', isHuman: false },
  ];

  let subStage = $state<'grid' | 'glider'>('grid');
  let selectedHuman = $state<number[]>([]);
  let wrongFlash = $state<number | null>(null);

  // Part B: Enterprise Ice Glider shuttle (64%..86% target zone)
  let shuttlePos = $state(12);
  let shuttleDir = $state(1);
  let shuttleStopped = $state(false);
  let shuttleMsg = $state('Brake the ice shuttle inside the GREEN bracket (64%–86%) — or press SPACE!');

  $effect(() => {
    if (subStage !== 'glider' || shuttleStopped) return;
    let raf = 0;
    let last = performance.now();
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduceMotion ? 42 : 76;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let next = shuttlePos + shuttleDir * speed * dt;
      if (next >= 96) {
        next = 96;
        shuttleDir = -1;
      } else if (next <= 4) {
        next = 4;
        shuttleDir = 1;
      }
      shuttlePos = next;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  });

  function clickTile(tile: Tile) {
    if (tile.isHuman) {
      sfx.playClick();
      if (!selectedHuman.includes(tile.id)) {
        selectedHuman = [...selectedHuman, tile.id];
      }
      // Instant transition — zero dead clock delay for speedrunners
      if (selectedHuman.length === 3) {
        subStage = 'glider';
      }
    } else {
      wrongFlash = tile.id;
      onPenalty(`Buzzword Click ("${tile.label}")`, 5.0, 1);
      setTimeout(() => {
        if (wrongFlash === tile.id) wrongFlash = null;
      }, 420);
    }
  }

  function brakeShuttle() {
    sfx.playClick();
    if (shuttleStopped) {
      shuttleStopped = false;
      shuttleMsg = 'Brake the ice shuttle inside the GREEN bracket (64%–86%) — or press SPACE!';
      return;
    }
    shuttleStopped = true;
    if (shuttlePos >= 64 && shuttlePos <= 86) {
      shuttleMsg = 'Humanity verified! Releasing billing lock...';
      onClear();
    } else {
      shuttleMsg = `Stopped at ${Math.round(shuttlePos)}% — missed the green zone! Tap Retry or press SPACE.`;
    }
  }

  function handleWindowKeydown(e: KeyboardEvent) {
    if (subStage === 'glider' && (e.key === ' ' || e.key === 'Enter')) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'BUTTON') return; // let native button click handle it
      e.preventDefault();
      brakeShuttle();
    }
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<!-- Industrial Security Gate Backdrop + Brutalist Sharp-Cornered Captcha Box -->
<div class="min-h-full flex-1 bg-[#e2e8f0] text-slate-900 p-4 sm:p-7 flex flex-col justify-between relative">
  <!-- Underlying Locked Billing Form Context -->
  <div class="max-w-3xl mx-auto w-full bg-white border border-slate-300 rounded-md p-3.5 mb-3 flex items-center justify-between text-xs text-slate-700 shadow-xs">
    <div class="flex items-center gap-2 font-mono-num">
      <Lock class="w-4 h-4 text-teal-800 shrink-0" />
      <span><strong>GATEWAY CHALLENGE:</strong> Billing cancellation paused by VerifyHuman™ Bot-Shield v9.4</span>
    </div>
    <span class="font-mono-num font-bold text-rose-800 shrink-0">$29.50/mo Pending</span>
  </div>

  <!-- Sharp-Cornered reCAPTCHA / Arkose Parody Widget -->
  <div class="my-auto w-full max-w-lg mx-auto bg-white border-2 border-slate-400 rounded-sm shadow-xl overflow-hidden">
    <!-- Captcha Header -->
    <div class="bg-[#0f766e] text-white px-5 py-4 flex items-center justify-between border-b-2 border-teal-950">
      <div>
        <div class="text-xs font-mono-num text-teal-100 font-semibold">
          VerifyHuman™ Anti-Saving Shield • Step {subStage === 'grid' ? '1/2' : '2/2'}
        </div>
        <h2 class="font-display font-extrabold text-lg sm:text-xl mt-0.5">
          {#if subStage === 'grid'}
            Select 3 squares with genuine human needs
          {:else}
            Stop the Ice Shuttle in the Green Zone
          {/if}
        </h2>
      </div>
      <ShieldCheck class="w-7 h-7 text-teal-100 shrink-0" />
    </div>

    {#if subStage === 'grid'}
      <div class="p-4 sm:p-5">
        <p class="text-xs text-slate-700 mb-3">
          Bots love corporate buzzwords. Clicking a buzzword charges a <strong>$5 Consulting Fee</strong>.
        </p>

        <!-- Industrial 2px-gap Captcha Tile Grid -->
        <div class="grid grid-cols-3 gap-1.5 bg-slate-300 p-1.5 border border-slate-400 mb-4">
          {#each TILES as tile (tile.id)}
            {@const picked = selectedHuman.includes(tile.id)}
            {@const erred = wrongFlash === tile.id}
            <button
              type="button"
              onclick={() => clickTile(tile)}
              class="relative h-20 p-2 rounded-xs border text-xs font-bold leading-snug flex items-center justify-center text-center cursor-pointer {picked
                ? 'bg-teal-800 border-teal-950 text-white shadow-inner'
                : erred
                  ? 'bg-rose-700 border-rose-900 text-white animate-shake'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'}"
            >
              {#if picked}
                <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-xs bg-white text-teal-900 flex items-center justify-center">
                  <Check class="w-3 h-3" />
                </span>
              {/if}
              <span>{tile.label}</span>
            </button>
          {/each}
        </div>

        <div class="flex items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-200">
          <span class="font-mono-num font-bold">{selectedHuman.length} / 3 human needs verified</span>
          <button
            type="button"
            onclick={() => onPenalty('VerifyHuman Captcha Bypass Pass', 11.0, 2)}
            class="min-h-[44px] px-3 py-2 rounded bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-900 font-bold cursor-pointer"
          >
            Buy FastPass ($11.00)
          </button>
        </div>
      </div>
    {:else}
      <div class="p-5 sm:p-6 space-y-4">
        <p role="status" aria-live="polite" class="text-xs sm:text-sm text-slate-800 font-semibold">
          {shuttleMsg}
        </p>

        <!-- Ice Track -->
        <div class="relative h-12 rounded-xs bg-slate-200 border-2 border-slate-400 overflow-hidden">
          <!-- Green Target Zone 64%..86% -->
          <div
            style="left: 64%; width: 22%;"
            class="absolute inset-y-0 bg-emerald-500/35 border-x-2 border-emerald-700 flex items-center justify-center"
          >
            <span class="text-xs font-mono-num font-extrabold text-emerald-950 uppercase">Target</span>
          </div>

          <!-- Shuttle Marker -->
          <div
            style="left: {shuttlePos}%; transform: translateX(-50%);"
            class="absolute inset-y-1 w-6 rounded-xs bg-slate-900 shadow-md flex items-center justify-center text-white"
          >
            <LockKeyhole class="w-3.5 h-3.5" />
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            type="button"
            onclick={brakeShuttle}
            class="flex-1 min-h-[44px] py-3 px-4 rounded-xs bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer"
          >
            {shuttleStopped ? 'Retry Ice Shuttle (SPACE)' : 'BRAKE SHUTTLE NOW (SPACE)'}
          </button>

          <button
            type="button"
            onclick={() => onPenalty('Enterprise Captcha Concierge', 11.0, 2)}
            class="min-h-[44px] py-3 px-4 rounded-xs bg-[#0f766e] hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Cpu class="w-4 h-4" />
            <span>Auto-Solve ($11)</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
