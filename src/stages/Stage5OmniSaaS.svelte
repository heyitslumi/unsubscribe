<script lang="ts">
  import { Skull, AlertTriangle, ShieldAlert, Terminal } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  let phase = $state<1 | 2 | 3>(1);

  // Phase 1: 3 embedded ToS landmines
  let mine1 = $state(true);
  let mine2 = $state(true);
  let mine3 = $state(true);
  let phase1Err = $state('');

  // Phase 3: Type UNSUBSCRIBE + swapped A/B buttons once user starts typing
  let typed = $state('');
  const swapped = $derived(typed.trim().length >= 4);
  const codeReady = $derived(typed.trim().toUpperCase() === 'UNSUBSCRIBE');

  function finishPhase1() {
    sfx.playClick();
    const activeMines = [mine1, mine2, mine3].filter(Boolean).length;
    if (activeMines > 0) {
      onPenalty(`OmniSaaS ToS Hidden Clause (${activeMines}x)`, activeMines * 15, 2);
      mine1 = false;
      mine2 = false;
      mine3 = false;
      phase1Err = `Billed $${activeMines * 15} for hidden clauses you left checked! Clauses cleared — click again to advance.`;
      return;
    }
    phase = 2;
  }

  function finishBoss() {
    sfx.playClick();
    if (!codeReady) return;
    onClear('Defeated the VP of Retention!');
  }
</script>

<div class="min-h-[470px] h-full bg-slate-950 text-slate-100 p-5 sm:p-7 flex flex-col justify-between relative">
  <div class="max-w-2xl mx-auto w-full space-y-4">
    <!-- Boss Health Header -->
    <div class="bg-slate-900 border border-amber-500/40 rounded-2xl p-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <Skull class="w-5 h-5 text-amber-400" />
          <span class="font-display font-extrabold text-base sm:text-lg text-white">
            FINAL BOSS: VP OF RETENTION
          </span>
        </div>
        <span class="font-mono-num text-xs text-amber-300 font-bold">PHASE {phase} / 3</span>
      </div>
      <div class="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-amber-500 transition-all duration-300"
          style="width: {((4 - phase) / 3) * 100}%"
        ></div>
      </div>
    </div>

    {#if phase === 1}
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 class="font-display font-bold text-base text-amber-300 mb-1">
          Phase 1: The Terms-of-Service Minefield
        </h3>
        <p class="text-xs text-slate-400 mb-3">
          Scroll down and <strong>uncheck all 3 hidden $15 add-on landmines</strong> buried inside our legal wall before
          continuing!
        </p>

        <div class="h-52 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3 text-xs text-slate-400 leading-relaxed">
          <p>
            SECTION 91.1 — Pursuant to Enterprise Offboarding Protocol, Customer hereby acknowledges that leaving
            OmniSaaS Corp causes measurable sadness in our quarterly earnings call.
          </p>

          <label class="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 cursor-pointer">
            <input type="checkbox" bind:checked={mine1} onchange={() => sfx.playClick()} class="accent-amber-400" />
            <span class="font-semibold">Clause 91.4: Bill me $15 for Archival PDF Export</span>
          </label>

          <p>
            SECTION 94.0 — Customer waives the right to complain on Hacker News, Reddit, or group chats about dark
            patterns, tricky checkboxes, or Chad from Customer Success.
          </p>

          <label class="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 cursor-pointer">
            <input type="checkbox" bind:checked={mine2} onchange={() => sfx.playClick()} class="accent-amber-400" />
            <span class="font-semibold">Clause 96.2: Add $15 Executive Farewell Fruit Basket</span>
          </label>

          <p>
            SECTION 99.8 — Almost at the bottom! Just one more totally optional mandatory enterprise surcharge tucked
            right before the button:
          </p>

          <label class="flex items-center gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 cursor-pointer">
            <input type="checkbox" bind:checked={mine3} onchange={() => sfx.playClick()} class="accent-amber-400" />
            <span class="font-semibold">Clause 99.9: Keep $15/mo "Alumni Seat" Active</span>
          </label>

          <div class="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onclick={finishPhase1}
              class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs cursor-pointer"
            >
              Submit Clean ToS &amp; Advance
            </button>
            <button
              type="button"
              onclick={() => onPenalty('OmniSaaS Express Legal Waiver', 25.0, 2)}
              class="px-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Accept All Clauses ($25)
            </button>
          </div>
        </div>

        {#if phase1Err}
          <p class="mt-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg px-3 py-2">
            {phase1Err}
          </p>
        {/if}
      </div>
    {:else if phase === 2}
      <!-- Fake Session Timeout Scare -->
      <div class="bg-slate-900 border-2 border-rose-500/70 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <h3 class="font-display font-extrabold text-xl text-white">
          SESSION TIMED OUT (DEFINITELY REAL)
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Oh no! Your cancellation progress was lost! Click the giant glowing button below to restore your session and
          lock in our <strong>$49 Enterprise Recovery Plan</strong>!
        </p>

        <button
          type="button"
          onclick={() => onPenalty('Fake Session Timeout Recovery Trap', 49.0, 3)}
          class="w-full py-3.5 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm shadow-lg cursor-pointer"
        >
          RESTORE SESSION &amp; UPGRADE ($49.00)
        </button>

        <div class="pt-2">
          <button
            type="button"
            onclick={() => {
              sfx.playClick();
              phase = 3;
            }}
            class="text-[11px] text-slate-500 hover:text-slate-200 underline cursor-pointer"
          >
            nice try — dismiss fake alert &amp; enter final termination console
          </button>
        </div>
      </div>
    {:else}
      <!-- Phase 3: Final Override + Button Position Swap -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Terminal class="w-4 h-4" />
            <span>Phase 3: Final Retention Override</span>
          </div>
          {#if swapped}
            <span class="text-[11px] font-mono-num px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              A/B Button Swap Triggered! Watch Labels!
            </span>
          {/if}
        </div>

        <p class="text-xs text-slate-300">
          Type <code class="font-mono-num bg-slate-950 px-2 py-0.5 rounded text-amber-300 font-bold">UNSUBSCRIBE</code>
          below, then click the real termination button (watch out — our Retention AI swaps button order mid-typing!):
        </p>

        <input
          type="text"
          bind:value={typed}
          placeholder="Type UNSUBSCRIBE..."
          autocomplete="off"
          spellcheck="false"
          class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none font-mono-num text-sm text-white tracking-wider uppercase"
        />

        <div class="flex {swapped ? 'flex-row-reverse' : 'flex-row'} items-center gap-3 pt-1">
          <button
            type="button"
            disabled={!codeReady}
            onclick={finishBoss}
            class="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-35 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            EXECUTE ACCOUNT TERMINATION
          </button>

          <button
            type="button"
            onclick={() => onPenalty('10-Year Enterprise Lock-In', 99.0, 4)}
            class="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert class="w-4 h-4 shrink-0" />
            <span>RENEW 10 YEARS ($99)</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
