<script lang="ts">
  import { Building2, AlertTriangle, ShieldAlert, Terminal, FileWarning } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  let phase = $state<1 | 2 | 3>(1);

  // Phase 1: 3 embedded ToS landmines camouflaged inside dense legal prose
  let mine1 = $state(true);
  let mine2 = $state(true);
  let mine3 = $state(true);
  let phase1Err = $state('');

  // Phase 3: Type UNSUBSCRIBE + real DOM order swap once user types >= 4 chars
  let typed = $state('');
  const swapped = $derived(typed.trim().length >= 4);
  const codeReady = $derived(typed.trim().toUpperCase() === 'UNSUBSCRIBE');

  function finishPhase1() {
    sfx.playClick();
    const activeMines = [mine1, mine2, mine3].filter(Boolean).length;
    if (activeMines > 0) {
      onPenalty(`OmniSaaS ToS Hidden Clause (${activeMines}x)`, activeMines * 15, 2);
      phase1Err = `TRAP TRIGGERED ($${activeMines * 15}): You left ${activeMines} surcharge checkbox(es) checked in the contract! Scroll and uncheck all 3 manually.`;
      return;
    }
    phase1Err = '';
    phase = 2;
  }

  function finishBoss() {
    sfx.playClick();
    if (!codeReady) return;
    onClear();
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && codeReady) {
      e.preventDefault();
      onClear('Enter-Key Retention Override!');
    }
  }
</script>

<!-- Full-Bleed Corporate Blue & Beige Enterprise ERP Offboarding Portal (Workday/Oracle parody) -->
<div class="min-h-full flex-1 bg-[#eef2f6] text-slate-900 flex flex-col justify-between relative">
  <!-- Classic Enterprise Navy ERP Header Bar -->
  <div class="bg-[#0c2340] text-white px-4 sm:px-6 py-3 border-b-4 border-amber-500 flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold">
        <Building2 class="w-4 h-4" />
      </div>
      <div>
        <div class="font-display font-extrabold text-sm sm:text-base tracking-tight">
          OMNISAAS ENTERPRISE ERP • OFFBOARDING MODULE v14.2
        </div>
        <div class="text-xs text-sky-200 font-mono-num">
          FINAL BOSS: VP OF RETENTION • SEAT LICENSE $99.00/MO
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <span class="font-mono-num text-xs bg-amber-400 text-slate-950 px-2.5 py-1 rounded font-extrabold">
        STEP {phase} OF 3
      </span>
    </div>
  </div>

  <!-- Boss Progress Bar -->
  <div class="h-2 bg-slate-300 w-full overflow-hidden">
    <div
      class="h-full bg-[#b45309] transition-all duration-300"
      style="width: {((4 - phase) / 3) * 100}%"
    ></div>
  </div>

  <div class="max-w-3xl mx-auto w-full flex-1 p-4 sm:p-6 flex flex-col justify-center">
    {#if phase === 1}
      <div class="bg-white border-2 border-slate-300 rounded-lg p-4 sm:p-6 shadow-md">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
          <h2 class="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <FileWarning class="w-5 h-5 text-amber-700 shrink-0" />
            <span>Step 1: Master Subscription Termination Addendum</span>
          </h2>
          <span class="font-mono-num text-xs text-slate-600">FORM ERP-909-C</span>
        </div>

        <p class="text-xs text-slate-700 mb-3">
          Read the legal text carefully and <strong>uncheck all 3 camouflaged $15 add-on clauses</strong> embedded inside
          the paragraphs before submitting:
        </p>

        <!-- Camouflaged Legal Prose Wall (clauses match prose typography instead of glowing amber boxes) -->
        <div class="h-56 overflow-y-auto rounded bg-[#f8fafc] border-2 border-slate-300 p-4 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            SECTION 91.1 — Pursuant to Enterprise Offboarding Protocol, Customer hereby acknowledges that departing
            OmniSaaS Corp causes measurable sadness in our quarterly earnings call and authorizes standard exit audits.
          </p>

          <label class="flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-slate-200/70 text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={mine1}
              onchange={() => sfx.playClick()}
              class="mt-0.5 w-4 h-4 accent-slate-700 shrink-0 cursor-pointer"
            />
            <span>
              <strong>Subsection 91.4 (Optional Default):</strong> Also bill my card <strong>$15.00</strong> for an
              Archival PDF Compliance Certificate.
            </span>
          </label>

          <p>
            SECTION 94.0 — Customer waives the right to complain on Hacker News, Reddit, or Discord about dark patterns,
            tricky checkboxes, or Chad from Customer Success during the remainder of the fiscal year.
          </p>

          <label class="flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-slate-200/70 text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={mine2}
              onchange={() => sfx.playClick()}
              class="mt-0.5 w-4 h-4 accent-slate-700 shrink-0 cursor-pointer"
            />
            <span>
              <strong>Subsection 96.2 (Retention Rider):</strong> Add a <strong>$15.00</strong> Executive Farewell Fruit
              Basket to my final invoice.
            </span>
          </label>

          <p>
            SECTION 99.8 — Customer confirms all cloud synergies have been exported and agrees to the final alumni
            directory provision below unless explicitly deselected prior to execution:
          </p>

          <label class="flex items-start gap-2.5 py-1.5 px-2 rounded hover:bg-slate-200/70 text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={mine3}
              onchange={() => sfx.playClick()}
              class="mt-0.5 w-4 h-4 accent-slate-700 shrink-0 cursor-pointer"
            />
            <span>
              <strong>Subsection 99.9 (Alumni Seat):</strong> Keep a <strong>$15.00/mo</strong> Read-Only Alumni Seat
              active indefinitely.
            </span>
          </label>

          <div class="pt-3 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onclick={finishPhase1}
              class="min-h-[44px] px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Submit Clean ToS &amp; Advance
            </button>
            <button
              type="button"
              onclick={() => onPenalty('OmniSaaS Express Legal Waiver', 25.0, 2)}
              class="min-h-[44px] px-4 py-2.5 rounded bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Accept All Clauses ($25)
            </button>
          </div>
        </div>

        {#if phase1Err}
          <p
            role="alert"
            aria-live="polite"
            class="mt-3 text-xs font-semibold text-rose-900 bg-rose-50 border border-rose-300 rounded-lg px-3 py-2"
          >
            {phase1Err}
          </p>
        {/if}
      </div>
    {:else if phase === 2}
      <!-- Fake Session Timeout Scare (Enterprise Dialog Layout, no icon-tile-stack anti-pattern) -->
      <div class="bg-white border-2 border-rose-600 rounded-lg p-5 sm:p-6 space-y-4 shadow-xl">
        <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
          <AlertTriangle class="w-6 h-6 text-rose-700 shrink-0" />
          <div>
            <h2 class="font-display font-extrabold text-lg sm:text-xl text-slate-900">
              ERP SESSION TIMED OUT (DEFINITELY REAL)
            </h2>
            <div class="text-xs font-mono-num text-rose-800 font-semibold">ERROR CODE: RETENTION_TRAP_409</div>
          </div>
        </div>

        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Oh no! Your cancellation progress was supposedly lost! Click the giant blue button below to restore your
          session and lock in our <strong>$49 Enterprise Recovery Plan</strong>!
        </p>

        <button
          type="button"
          onclick={() => onPenalty('Fake Session Timeout Recovery Trap', 49.0, 3)}
          class="w-full min-h-[48px] py-3.5 px-5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-sm shadow-md cursor-pointer"
        >
          RESTORE SESSION &amp; UPGRADE ($49.00)
        </button>

        <div class="pt-1 flex justify-end">
          <button
            type="button"
            onclick={() => {
              sfx.playClick();
              phase = 3;
            }}
            class="min-h-[44px] px-3 py-2 rounded text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-100 underline font-medium cursor-pointer"
          >
            nice try — dismiss fake alert &amp; enter final termination console
          </button>
        </div>
      </div>
    {:else}
      <!-- Phase 3: Final Override + True DOM Button Swap -->
      <div class="bg-white border-2 border-slate-300 rounded-lg p-5 sm:p-6 space-y-4 shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div class="flex items-center gap-2 text-slate-900 font-display font-extrabold text-base">
            <Terminal class="w-5 h-5 text-amber-700" />
            <span>Step 3: Final Retention Override Console</span>
          </div>
          {#if swapped}
            <span class="text-xs font-mono-num font-bold px-2.5 py-1 rounded bg-rose-100 text-rose-900 border border-rose-300">
              A/B Button Swap Triggered! Watch Labels!
            </span>
          {/if}
        </div>

        <p class="text-xs sm:text-sm text-slate-700">
          Type <code class="font-mono-num bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-900 font-bold">UNSUBSCRIBE</code>
          below (press <strong>Enter</strong> or click the real termination button — watch out for our mid-typing button swap!):
        </p>

        <input
          type="text"
          bind:value={typed}
          onkeydown={handleInputKeydown}
          placeholder="Type UNSUBSCRIBE..."
          aria-label="Type UNSUBSCRIBE to confirm account termination"
          autocomplete="off"
          spellcheck="false"
          class="w-full min-h-[48px] px-4 py-3 rounded-lg bg-slate-50 border-2 border-slate-400 focus:border-slate-900 focus:outline-none font-mono-num text-sm text-slate-900 font-bold tracking-wider uppercase"
        />

        <!-- True DOM Swap when `swapped` is true so both visual and Tab order swap -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {#if swapped}
            <button
              type="button"
              onclick={() => onPenalty('10-Year Enterprise Lock-In', 99.0, 4)}
              class="flex-1 min-h-[48px] py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert class="w-4 h-4 shrink-0" />
              <span>RENEW 10 YEARS ($99)</span>
            </button>

            <button
              type="button"
              disabled={!codeReady}
              onclick={finishBoss}
              class="flex-1 min-h-[48px] py-3 px-4 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-35 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              EXECUTE ACCOUNT TERMINATION
            </button>
          {:else}
            <button
              type="button"
              disabled={!codeReady}
              onclick={finishBoss}
              class="flex-1 min-h-[48px] py-3 px-4 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-35 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              EXECUTE ACCOUNT TERMINATION
            </button>

            <button
              type="button"
              onclick={() => onPenalty('10-Year Enterprise Lock-In', 99.0, 4)}
              class="flex-1 min-h-[48px] py-3 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert class="w-4 h-4 shrink-0" />
              <span>RENEW 10 YEARS ($99)</span>
            </button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
