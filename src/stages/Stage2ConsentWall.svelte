<script lang="ts">
  import { Cookie, X, SlidersHorizontal, MessageSquare, Minus, ShieldCheck, Radio } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  interface HydraPopup {
    id: number;
    partner: string;
    offsetX: number;
    offsetY: number;
  }

  const BROKER_ROWS = [
    { id: 'BRK-01', name: 'NeuralBid AdExchange Ltd.', category: '3AM Remorse Profiling', cpm: '$4.80' },
    { id: 'BRK-02', name: 'CursorVelocity Telemetry Corp', category: 'Hesitation Biometrics', cpm: '$6.10' },
    { id: 'BRK-03', name: 'Subconscious DreamRetarget IO', category: 'Sleep-Deprived Upsells', cpm: '$9.40' },
    { id: 'BRK-04', name: 'ShadowProfile Syndicate', category: 'Cross-Device Guilt Graph', cpm: '$5.25' },
  ];

  const HYDRA_COORDS = [
    { x: -135, y: -95 },
    { x: 135, y: -85 },
    { x: -125, y: 90 },
    { x: 125, y: 95 },
  ];

  let cookieCleared = $state(false);
  let showPrefs = $state(false);
  let sw1 = $state(true);
  let sw2 = $state(true);
  let sw3 = $state(true);
  let synergyTriggered = $state(false);
  let prefsHint = $state('');

  let hydras = $state<HydraPopup[]>([]);
  let nextHydraId = $state(1);

  // Chad chat widget anchored directly over the TERMINATE DATA+ PLAN button
  let chadMinimized = $state(false);
  let chadPos = $state({ x: 0, y: 0 });
  let draggingChad = $state(false);
  let dragStart = $state({ x: 0, y: 0 });

  // Is Chad still blocking the button? (Moved less than 95px and not minimized)
  const chadBlocking = $derived(
    cookieCleared && !chadMinimized && Math.hypot(chadPos.x, chadPos.y) < 95
  );

  function triggerHydra() {
    sfx.playSplit();
    if (hydras.length >= 4) return;
    const names = [
      'DreamTarget Ad Exchange',
      'Subconscious Pixel Co.',
      'RetargetHydra LLC',
      'ScrollVelocity Brokers',
    ];
    const slot1 = HYDRA_COORDS[(nextHydraId - 1) % HYDRA_COORDS.length];
    const slot2 = HYDRA_COORDS[nextHydraId % HYDRA_COORDS.length];
    const p1: HydraPopup = {
      id: nextHydraId,
      partner: names[nextHydraId % names.length],
      offsetX: slot1.x,
      offsetY: slot1.y,
    };
    const p2: HydraPopup = {
      id: nextHydraId + 1,
      partner: names[(nextHydraId + 1) % names.length],
      offsetX: slot2.x,
      offsetY: slot2.y,
    };
    nextHydraId += 2;
    hydras = [...hydras, p1, p2].slice(0, 4);
  }

  function dismissHydra(id: number) {
    sfx.playClick();
    hydras = hydras.filter((h) => h.id !== id);
  }

  function toggleSwitch(which: 1 | 2 | 3) {
    sfx.playClick();
    if (which === 1) sw1 = !sw1;
    if (which === 2) {
      sw2 = !sw2;
      if (!sw2 && !synergyTriggered) {
        synergyTriggered = true;
        sw1 = true;
        prefsHint = 'Synergy Link™ turned Switch #1 back ON! Turn it off one more time.';
      }
    }
    if (which === 3) sw3 = !sw3;
  }

  function savePreferences() {
    sfx.playClick();
    if (sw1 || sw2 || sw3) {
      prefsHint = 'All 3 "Legitimate Interest" trackers are still enabled — turn all 3 OFF first!';
      return;
    }
    cookieCleared = true;
  }

  function startChadDrag(e: PointerEvent) {
    draggingChad = true;
    dragStart = { x: e.clientX - chadPos.x, y: e.clientY - chadPos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function moveChadDrag(e: PointerEvent) {
    if (!draggingChad) return;
    chadPos = {
      x: Math.max(-280, Math.min(90, e.clientX - dragStart.x)),
      y: Math.max(-240, Math.min(70, e.clientY - dragStart.y)),
    };
  }

  function endChadDrag() {
    draggingChad = false;
  }

  function handleChadKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sfx.playClick();
      chadMinimized = true;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      chadPos = { ...chadPos, x: chadPos.x - 120 };
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      chadPos = { ...chadPos, y: chadPos.y - 120 };
    }
  }
</script>

<!-- Full-Bleed Ad-Tech Broker Portal -->
<div class="relative min-h-full flex-1 bg-slate-100 text-slate-900 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between">
  <!-- Top Ad-Tech Header -->
  <div class="max-w-3xl mx-auto w-full space-y-4">
    <div class="flex flex-wrap items-center justify-between border-b border-slate-300 pb-3 gap-2">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-6 h-6 text-sky-700" />
        <span class="font-display font-extrabold text-lg text-slate-900">ConsentWall™ Data+ Exchange</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs font-mono-num bg-emerald-100 text-emerald-950 border border-emerald-300 px-2.5 py-1 rounded-md font-bold">
          <Radio class="w-3.5 h-3.5 text-emerald-700" />
          <span>428 BROKERS STREAMING</span>
        </span>
        <span class="font-mono-num text-xs bg-sky-900 text-white px-2.5 py-1 rounded-md font-bold">
          $19.99/mo
        </span>
      </div>
    </div>

    <!-- Live Data-Broker Telemetry Table (fills the page so it looks like a real ad-tech dashboard) -->
    <div class="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
      <div class="bg-slate-200/80 px-4 py-2 border-b border-slate-300 flex items-center justify-between text-xs font-mono-num font-bold text-slate-800">
        <span>ACTIVE REAL-TIME BIDDING PARTNERS (428)</span>
        <span class="text-rose-800">CONSENT LOCK: {cookieCleared ? 'UNLOCKED' : 'ACTIVE'}</span>
      </div>
      <div class="divide-y divide-slate-200 text-xs">
        {#each BROKER_ROWS as row (row.id)}
          <div class="px-4 py-2.5 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="font-mono-num text-slate-500 font-semibold">{row.id}</span>
              <span class="font-semibold text-slate-900 truncate">{row.name}</span>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="hidden sm:inline text-slate-600">{row.category}</span>
              <span class="font-mono-num font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">{row.cpm}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Subscription Termination Bar with Chad Anchored Directly Over the Button -->
    <div class="relative bg-white border-2 border-slate-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div>
        <div class="font-display font-extrabold text-base text-slate-900">Data+ Monthly Recurring Telemetry Plan</div>
        <div class="text-xs text-slate-600 mt-0.5">
          {chadBlocking
            ? 'Chad from Customer Success is physically parked over the termination button — drag or minimize him!'
            : 'Auto-renews at $19.99 when timer hits 00:00'}
        </div>
      </div>

      <button
        type="button"
        disabled={!cookieCleared || chadBlocking}
        onclick={() => onClear()}
        class="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-40 text-white font-bold text-xs tracking-wide shadow-sm cursor-pointer shrink-0"
      >
        TERMINATE DATA+ PLAN
      </button>

      <!-- Layer 2: Chad from Customer Success anchored directly on top of the Terminate button -->
      {#if cookieCleared && !chadMinimized}
        <div
          style="transform: translate({chadPos.x}px, {chadPos.y}px);"
          class="
            absolute -top-24 right-2 sm:right-3 w-72 sm:w-80
            bg-white border-2 border-sky-700 rounded-xl shadow-2xl z-20 overflow-hidden
          "
        >
          <div
            role="toolbar"
            aria-label="Draggable Chad chat header — drag away or press Escape to minimize"
            tabindex="0"
            onkeydown={handleChadKeydown}
            onpointerdown={startChadDrag}
            onpointermove={moveChadDrag}
            onpointerup={endChadDrag}
            class="bg-sky-800 text-white px-3 py-1.5 flex items-center justify-between cursor-grab active:cursor-grabbing touch-none"
          >
            <div class="flex items-center gap-2 text-xs font-bold">
              <MessageSquare class="w-4 h-4 shrink-0" />
              <span>Chad • Retention Bestie (Drag Me)</span>
            </div>
            <button
              type="button"
              title="Minimize Chad"
              aria-label="Minimize Chad chat window"
              onclick={(e) => {
                e.stopPropagation();
                sfx.playClick();
                chadMinimized = true;
              }}
              class="min-w-[44px] min-h-[44px] -my-1 -mr-2 flex items-center justify-center rounded-lg hover:bg-sky-700 text-white cursor-pointer"
            >
              <Minus class="w-4 h-4" />
            </button>
          </div>
          <div class="p-3.5 space-y-2.5">
            <p class="text-xs text-slate-800 bg-slate-100 rounded-lg p-2.5 leading-relaxed">
              "Hey bestie! I parked my chat window directly over that scary red button so you don't accidentally save $19.99!"
            </p>
            <button
              type="button"
              onclick={() => onPenalty('Chad Annual Lock-In Special', 15.0, 2)}
              class="w-full min-h-[44px] py-2.5 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs cursor-pointer"
            >
              Thanks Chad! Lock Me In ($15 Fee)
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Layer 1: Cookie Consent Wall -->
  {#if !cookieCleared}
    <div class="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] flex items-center justify-center p-4 z-30">
      <div class="relative w-full max-w-lg bg-white rounded-xl border-2 border-slate-300 shadow-2xl p-5 sm:p-6">
        <!-- Fake X Hydra Trap (44x44px hit target) -->
        <button
          type="button"
          aria-label="Close modal"
          onclick={triggerHydra}
          class="absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 flex items-center justify-center cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2.5 mb-2 pr-10">
          <Cookie class="w-5 h-5 text-amber-700 shrink-0" />
          <h2 class="font-display font-extrabold text-lg sm:text-xl text-slate-900">
            Privacy &amp; Telemetry Partners (428)
          </h2>
        </div>

        {#if !showPrefs}
          <p class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5">
            Clicking the top-right <strong>×</strong> counts as enthusiastic consent and spawns Hydra partner popups.
            Choose how you want your soul monetized:
          </p>

          <div class="space-y-2.5">
            <button
              type="button"
              onclick={() => onPenalty('ConsentWall Ad-Free Gold Pass', 14.99, 2)}
              class="w-full min-h-[44px] py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm cursor-pointer shadow-sm"
            >
              Accept All &amp; Buy Ad-Free Gold ($14.99)
            </button>

            <button
              type="button"
              onclick={() => {
                sfx.playClick();
                showPrefs = true;
              }}
              class="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5" />
              <span>Manage Granular Legitimate Interest</span>
            </button>
          </div>
        {:else}
          <p class="text-xs text-slate-600 mb-3">
            Disable all 3 trackers below (and dismiss any Hydra partner popups) to unlock the portal:
          </p>

          <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl mb-4 bg-slate-50">
            {#each [
              { id: 1 as const, name: 'Subconscious Dream Ad Injection', val: sw1 },
              { id: 2 as const, name: 'Biometric Cursor Panic Telemetry', val: sw2 },
              { id: 3 as const, name: 'Auto-Renew Partner Brokerage', val: sw3 },
            ] as item}
              <div class="flex items-center justify-between px-3 py-2">
                <span class="text-xs font-semibold text-slate-800 pr-2">{item.name}</span>
                <button
                  type="button"
                  onclick={() => toggleSwitch(item.id)}
                  class="min-w-[64px] min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-mono-num font-bold cursor-pointer {item.val
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-200 text-slate-800'}"
                >
                  {item.val ? 'ON' : 'OFF'}
                </button>
              </div>
            {/each}
          </div>

          {#if prefsHint}
            <p
              role="alert"
              aria-live="polite"
              class="text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-3"
            >
              {prefsHint}
            </p>
          {/if}

          <div class="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={hydras.length > 0}
              onclick={savePreferences}
              class="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
            >
              {hydras.length > 0 ? `Dismiss ${hydras.length} Hydra Popup(s) First` : 'Save Zero-Tracking & Unlock'}
            </button>
            <button
              type="button"
              onclick={() => onPenalty('1-Click Tracking Convenience Fee', 7.99, 2)}
              class="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
            >
              Pay $7.99 To Skip
            </button>
          </div>
        {/if}
      </div>

      <!-- Hydra Child Modals (fanned out into distinct quadrants) -->
      {#each hydras as h (h.id)}
        <div
          style="transform: translate({h.offsetX}px, {h.offsetY}px);"
          class="absolute w-64 bg-amber-50 border-2 border-amber-600 rounded-xl shadow-2xl p-4 z-40"
        >
          <div class="text-xs font-extrabold text-amber-950 mb-1">HYDRA PARTNER #{h.id}</div>
          <p class="text-xs text-amber-950 mb-3 leading-snug">
            <strong>{h.partner}</strong> noticed you clicked "×"! Subscribe to our tracker feed?
          </p>
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              onclick={() => dismissHydra(h.id)}
              class="min-h-[44px] px-3 py-2 rounded-lg border border-amber-500 text-amber-950 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
            >
              Decline
            </button>
            <button
              type="button"
              onclick={() => {
                onPenalty(`${h.partner} Data Pass`, 4.0, 1);
                dismissHydra(h.id);
              }}
              class="min-h-[44px] px-3 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer"
            >
              Accept ($4)
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
