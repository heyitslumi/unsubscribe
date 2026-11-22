<script lang="ts">
  import { ShieldCheck, Check, Cpu, LockKeyhole } from '@lucide/svelte';
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
  let shuttleMsg = $state('Brake the ice shuttle inside the GREEN bracket (64%–86%)!');

  $effect(() => {
    if (subStage !== 'glider' || shuttleStopped) return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Slightly brisk ice glide
      let next = shuttlePos + shuttleDir * 78 * dt;
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
      if (selectedHuman.length === 3) {
        setTimeout(() => {
          subStage = 'glider';
        }, 220);
      }
    } else {
      wrongFlash = tile.id;
      onPenalty(`Buzzword Click ("${tile.label}")`, 5.0, 1);
      setTimeout(() => {
        if (wrongFlash === tile.id) wrongFlash = null;
      }, 450);
    }
  }

  function brakeShuttle() {
    sfx.playClick();
    if (shuttleStopped) {
      shuttleStopped = false;
      shuttleMsg = 'Brake the ice shuttle inside the GREEN bracket (64%–86%)!';
      return;
    }
    shuttleStopped = true;
    if (shuttlePos >= 64 && shuttlePos <= 86) {
      shuttleMsg = 'Humanity verified! Releasing billing lock...';
      setTimeout(() => onClear(), 240);
    } else {
      shuttleMsg = `Stopped at ${Math.round(shuttlePos)}% — missed the green zone! Tap Retry Shuttle.`;
    }
  }
</script>

<div class="min-h-[470px] h-full bg-slate-100 text-slate-900 p-5 sm:p-8 flex items-center justify-center">
  <div class="w-full max-w-lg bg-white border border-slate-300 rounded-2xl shadow-lg overflow-hidden">
    <!-- Captcha Header -->
    <div class="bg-teal-700 text-white px-5 py-4 flex items-center justify-between">
      <div>
        <div class="text-[11px] uppercase tracking-wider text-teal-100 font-mono-num">
          VerifyHuman™ Anti-Saving Shield • Step {subStage === 'grid' ? '1/2' : '2/2'}
        </div>
        <h2 class="font-display font-extrabold text-lg sm:text-xl mt-0.5">
          {#if subStage === 'grid'}
            Select all 3 squares with GENUINE HUMAN NEEDS
          {:else}
            Stop the Ice Shuttle inside the Green Zone
          {/if}
        </h2>
      </div>
      <ShieldCheck class="w-7 h-7 text-teal-200 shrink-0" />
    </div>

    {#if subStage === 'grid'}
      <div class="p-5">
        <p class="text-xs text-slate-600 mb-3.5">
          Bots love corporate buzzwords. Clicking a buzzword charges a <strong>$5 Consulting Fee</strong>.
        </p>

        <div class="grid grid-cols-3 gap-2.5 mb-4">
          {#each TILES as tile (tile.id)}
            {@const picked = selectedHuman.includes(tile.id)}
            {@const erred = wrongFlash === tile.id}
            <button
              type="button"
              onclick={() => clickTile(tile)}
              class="relative h-20 p-2 rounded-xl border text-xs font-bold leading-snug flex items-center justify-center text-center transition cursor-pointer {picked
                ? 'bg-teal-600 border-teal-700 text-white shadow-inner'
                : erred
                  ? 'bg-rose-600 border-rose-700 text-white animate-shake'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}"
            >
              {#if picked}
                <span class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-teal-700 flex items-center justify-center">
                  <Check class="w-3 h-3" />
                </span>
              {/if}
              <span>{tile.label}</span>
            </button>
          {/each}
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span class="font-mono-num">{selectedHuman.length} / 3 human needs found</span>
          <button
            type="button"
            onclick={() => onPenalty('VerifyHuman Captcha Bypass Pass', 11.0, 2)}
            class="text-teal-700 hover:underline font-semibold cursor-pointer"
          >
            Buy FastPass ($11.00)
          </button>
        </div>
      </div>
    {:else}
      <div class="p-6 space-y-5">
        <p class="text-xs sm:text-sm text-slate-700 font-medium">{shuttleMsg}</p>

        <!-- Ice Track -->
        <div class="relative h-12 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden">
          <!-- Green Target Zone 64%..86% -->
          <div
            style="left: 64%; width: 22%;"
            class="absolute inset-y-0 bg-emerald-500/30 border-x-2 border-emerald-600 flex items-center justify-center"
          >
            <span class="text-[10px] font-mono-num font-bold text-emerald-900 uppercase">Target</span>
          </div>

          <!-- Shuttle Marker -->
          <div
            style="left: {shuttlePos}%; transform: translateX(-50%);"
            class="absolute inset-y-1.5 w-5 rounded-lg bg-slate-900 shadow-md flex items-center justify-center text-white"
          >
            <LockKeyhole class="w-3 h-3" />
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch gap-2.5">
          <button
            type="button"
            onclick={brakeShuttle}
            class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer"
          >
            {shuttleStopped ? 'Retry Ice Shuttle' : 'BRAKE SHUTTLE NOW'}
          </button>

          <button
            type="button"
            onclick={() => onPenalty('Enterprise Captcha Concierge', 11.0, 2)}
            class="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Cpu class="w-3.5 h-3.5" />
            <span>Auto-Solve ($11)</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
