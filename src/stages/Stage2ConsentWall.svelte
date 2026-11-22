<script lang="ts">
  import { Cookie, X, SlidersHorizontal, MessageSquare, Minus, ShieldCheck } from '@lucide/svelte';
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

  let cookieCleared = $state(false);
  let showPrefs = $state(false);
  let sw1 = $state(true);
  let sw2 = $state(true);
  let sw3 = $state(true);
  let synergyTriggered = $state(false);
  let prefsHint = $state('');

  let hydras = $state<HydraPopup[]>([]);
  let nextHydraId = $state(1);

  // Chad chat widget covering the bottom-right cancel button
  let chadMinimized = $state(false);
  let chadPos = $state({ x: 0, y: 0 });
  let draggingChad = $state(false);
  let dragStart = $state({ x: 0, y: 0 });

  function triggerHydra() {
    sfx.playSplit();
    if (hydras.length >= 4) return;
    const names = [
      'DreamTarget Ad Exchange',
      'Subconscious Pixel Co.',
      'RetargetHydra LLC',
      'ScrollVelocity Brokers',
    ];
    const p1: HydraPopup = {
      id: nextHydraId,
      partner: names[nextHydraId % names.length],
      offsetX: -36 + ((nextHydraId * 23) % 70),
      offsetY: -24 + ((nextHydraId * 19) % 55),
    };
    const p2: HydraPopup = {
      id: nextHydraId + 1,
      partner: names[(nextHydraId + 1) % names.length],
      offsetX: 28 - ((nextHydraId * 17) % 65),
      offsetY: 22 - ((nextHydraId * 13) % 45),
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
      x: Math.max(-260, Math.min(80, e.clientX - dragStart.x)),
      y: Math.max(-220, Math.min(60, e.clientY - dragStart.y)),
    };
  }

  function endChadDrag() {
    draggingChad = false;
  }
</script>

<div class="relative min-h-[470px] h-full bg-slate-100 text-slate-900 p-5 sm:p-8 overflow-hidden select-none">
  <!-- Underlying Subscription Portal -->
  <div class="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
      <div class="flex items-center gap-2">
        <ShieldCheck class="w-6 h-6 text-sky-600" />
        <span class="font-display font-bold text-lg">ConsentWall™ Data+</span>
      </div>
      <span class="font-mono-num text-xs bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full font-semibold">
        $19.99/mo Active
      </span>
    </div>

    <p class="text-sm text-slate-600 mb-6 leading-relaxed">
      Your behavioral telemetry is currently streaming to 428 third-party data brokers in real time. Manage your
      billing status below once privacy preferences are resolved.
    </p>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="font-bold text-sm text-slate-900">Data+ Monthly Recurring Plan</div>
        <div class="text-xs text-slate-500">Auto-renews at $19.99 when timer hits 00:00</div>
      </div>

      <button
        type="button"
        disabled={!cookieCleared}
        onclick={() => onClear()}
        class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs tracking-wide shadow-sm transition cursor-pointer"
      >
        TERMINATE DATA+ PLAN
      </button>
    </div>
  </div>

  <!-- Layer 2: Chad from Customer Success covering bottom-right -->
  {#if cookieCleared && !chadMinimized}
    <div
      style="transform: translate({chadPos.x}px, {chadPos.y}px);"
      class="absolute bottom-5 right-5 sm:right-12 w-72 sm:w-80 bg-white border-2 border-sky-600 rounded-2xl shadow-2xl z-20 overflow-hidden"
    >
      <div
        role="toolbar"
        tabindex="0"
        onpointerdown={startChadDrag}
        onpointermove={moveChadDrag}
        onpointerup={endChadDrag}
        class="bg-sky-600 text-white px-3.5 py-2.5 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <div class="flex items-center gap-2 text-xs font-bold">
          <MessageSquare class="w-4 h-4" />
          <span>Chad • Retention Bestie (Drag Me)</span>
        </div>
        <button
          type="button"
          title="Minimize Chad"
          onclick={(e) => {
            e.stopPropagation();
            sfx.playClick();
            chadMinimized = true;
          }}
          class="p-1 rounded hover:bg-sky-500 text-white cursor-pointer"
        >
          <Minus class="w-3.5 h-3.5" />
        </button>
      </div>
      <div class="p-4 space-y-3">
        <p class="text-xs text-slate-700 bg-slate-100 rounded-xl p-3 leading-relaxed">
          "Hey bestie!! I parked my chat window right over that scary red button so you don't accidentally save $19.99!"
        </p>
        <button
          type="button"
          onclick={() => onPenalty('Chad Annual Lock-In Special', 15.0, 2)}
          class="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
        >
          Thanks Chad! Lock Me In ($15 Fee)
        </button>
      </div>
    </div>
  {/if}

  <!-- Layer 1: Cookie Consent Wall -->
  {#if !cookieCleared}
    <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-30">
      <div class="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6">
        <!-- Fake X Hydra Trap -->
        <button
          type="button"
          aria-label="Close modal"
          onclick={triggerHydra}
          class="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 flex items-center justify-center cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-2.5 mb-2">
          <Cookie class="w-5 h-5 text-amber-600" />
          <h2 class="font-display font-extrabold text-lg sm:text-xl text-slate-900">
            We Value Your Privacy (428 Partners)
          </h2>
        </div>

        {#if !showPrefs}
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            Clicking the top-right <strong>×</strong> counts as enthusiastic interest and spawns partner popups! Choose
            how you want your soul monetized:
          </p>

          <div class="space-y-2.5">
            <button
              type="button"
              onclick={() => onPenalty('ConsentWall Ad-Free Gold Pass', 14.99, 2)}
              class="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm cursor-pointer shadow-sm"
            >
              Accept All &amp; Buy Ad-Free Gold ($14.99)
            </button>

            <button
              type="button"
              onclick={() => {
                sfx.playClick();
                showPrefs = true;
              }}
              class="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal class="w-3.5 h-3.5" />
              <span>Manage Granular Legitimate Interest</span>
            </button>
          </div>
        {:else}
          <p class="text-xs text-slate-500 mb-3">
            Disable all 3 trackers below ( and dismiss any Hydra partner popups ) to unlock the portal:
          </p>

          <div class="space-y-2 mb-4">
            {#each [
              { id: 1 as const, name: 'Subconscious Dream Ad Injection', val: sw1 },
              { id: 2 as const, name: 'Biometric Cursor Panic Telemetry', val: sw2 },
              { id: 3 as const, name: 'Auto-Renew Partner Brokerage', val: sw3 },
            ] as item}
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span class="text-xs font-semibold text-slate-800">{item.name}</span>
                <button
                  type="button"
                  onclick={() => toggleSwitch(item.id)}
                  class="px-3 py-1 rounded-full text-xs font-mono-num font-bold transition cursor-pointer {item.val
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-200 text-slate-600'}"
                >
                  {item.val ? 'ON' : 'OFF'}
                </button>
              </div>
            {/each}
          </div>

          {#if prefsHint}
            <p class="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              {prefsHint}
            </p>
          {/if}

          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={hydras.length > 0}
              onclick={savePreferences}
              class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
            >
              {hydras.length > 0 ? `Dismiss ${hydras.length} Hydra Popup(s) First` : 'Save Zero-Tracking & Unlock'}
            </button>
            <button
              type="button"
              onclick={() => onPenalty('1-Click Tracking Convenience Fee', 7.99, 2)}
              class="px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
            >
              Pay $7.99 To Skip
            </button>
          </div>
        {/if}
      </div>

      <!-- Hydra Child Modals -->
      {#each hydras as h (h.id)}
        <div
          style="transform: translate({h.offsetX}px, {h.offsetY}px);"
          class="absolute w-64 bg-amber-50 border-2 border-amber-500 rounded-xl shadow-2xl p-4 z-40"
        >
          <div class="text-xs font-extrabold text-amber-950 mb-1">HYDRA PARTNER #{h.id}</div>
          <p class="text-[11px] text-amber-900 mb-3">
            <strong>{h.partner}</strong> noticed you clicked "×"! Subscribe to our tracker feed?
          </p>
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              onclick={() => dismissHydra(h.id)}
              class="px-2.5 py-1.5 rounded-lg border border-amber-400 text-amber-900 hover:bg-amber-100 text-[11px] font-semibold cursor-pointer"
            >
              Decline Partner
            </button>
            <button
              type="button"
              onclick={() => {
                onPenalty(`${h.partner} Data Pass`, 4.0, 1);
                dismissHydra(h.id);
              }}
              class="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold cursor-pointer"
            >
              Accept ($4)
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
