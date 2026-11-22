<script lang="ts">
  import {
    Sparkles,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    TrendingUp,
    Award,
    Flame,
    FileText,
    Folder,
    Lock,
    Search,
  } from '@lucide/svelte';
  import { sfx } from '../lib/audio';

  let {
    onClear,
    onPenalty,
  }: {
    onClear: (note?: string) => void;
    onPenalty: (label: string, amount: number, timeSec?: number) => void;
  } = $props();

  let step = $state<'hero' | 'survey'>('hero');
  let keepAutoRenew = $state(true);
  let vipProtection = $state(true);
  let confirmForfeit = $state(false);
  let formError = $state('');

  function submitSurvey() {
    sfx.playClick();
    if (vipProtection) {
      onPenalty('CloudNote+ VIP Billing Protection Add-on', 9.99, 2);
      formError =
        'TRAP TRIGGERED ($9.99): Box #2 ("VIP Billing Protection") is STILL checked! Uncheck it manually before confirming.';
      return;
    }
    if (keepAutoRenew) {
      formError = 'Cancellation blocked: Box #1 ("Keep auto-renewal enabled") is still checked!';
      return;
    }
    if (!confirmForfeit) {
      formError = 'Please check Box #3 to confirm you are choosing financial responsibility.';
      return;
    }
    formError = '';
    onClear();
  }
</script>

<!-- Full-bleed Notion-style CloudNote+ Workspace with Guilt-Trip Intercept Modal -->
<div class="min-h-full flex-1 bg-[#f7f6f2] text-slate-900 flex flex-col relative overflow-hidden">
  <!-- Manipulative Live FOMO Ticker Strip -->
  <div class="bg-indigo-950 text-indigo-100 text-xs font-mono-num py-1.5 px-4 flex items-center justify-between border-b border-indigo-900 z-20">
    <div class="flex items-center gap-2 truncate">
      <Flame class="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span class="truncate">
        <strong>LIVE FOMO FEED:</strong> @founder_kyle just upgraded to Annual Ultra ($299/yr) • 1,429 users refused to cancel today
      </span>
    </div>
    <span class="hidden sm:inline text-amber-300 font-bold shrink-0 ml-2">99.4% RETENTION RATE</span>
  </div>

  <!-- Underlying Notion-style Document Workspace (gives the stage real app context) -->
  <div class="flex-1 flex min-h-[460px] relative">
    <!-- Left Workspace Sidebar (desktop) -->
    <div class="hidden md:flex w-56 bg-[#efede6] border-r border-stone-300 p-3.5 flex-col justify-between text-xs text-stone-700 select-none">
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-stone-300">
          <div class="flex items-center gap-2 font-display font-extrabold text-sm text-stone-900">
            <div class="w-6 h-6 rounded bg-indigo-700 text-white flex items-center justify-center">
              <Sparkles class="w-3.5 h-3.5" />
            </div>
            <span>CloudNote+</span>
          </div>
          <span class="font-mono-num text-xs px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 font-bold">PRO</span>
        </div>

        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded bg-stone-200/80 text-stone-600">
          <Search class="w-3.5 h-3.5" />
          <span>Search 2 notes...</span>
        </div>

        <div class="space-y-1">
          <div class="text-xs font-bold text-stone-600 px-1.5 py-1">PRIVATE DOCS (HOSTAGE)</div>
          <div class="flex items-center justify-between px-2 py-1.5 rounded bg-indigo-100/80 text-indigo-950 font-semibold">
            <span class="flex items-center gap-1.5 truncate">
              <FileText class="w-3.5 h-3.5 text-indigo-700 shrink-0" />
              <span class="truncate">Untitled Grocery List</span>
            </span>
            <Lock class="w-3 h-3 text-rose-700 shrink-0" />
          </div>
          <div class="flex items-center justify-between px-2 py-1.5 rounded hover:bg-stone-200/60 text-stone-800">
            <span class="flex items-center gap-1.5 truncate">
              <FileText class="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span class="truncate">Untitled Grocery List (2)</span>
            </span>
            <Lock class="w-3 h-3 text-rose-700 shrink-0" />
          </div>
          <div class="flex items-center gap-1.5 px-2 py-1.5 text-stone-600">
            <Folder class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">3AM Startup Ideas (Empty)</span>
          </div>
        </div>
      </div>

      <div class="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 space-y-1">
        <div class="font-mono-num font-bold text-xs flex items-center gap-1">
          <TrendingUp class="w-3.5 h-3.5" />
          <span>$24.99/mo Armed</span>
        </div>
        <div class="text-xs text-rose-900 leading-snug">
          Cancelling deletes AI Quantum Sync on your 2 grocery lists.
        </div>
      </div>
    </div>

    <!-- Main Document Editor Backdrop + Intercept Modal -->
    <div class="flex-1 p-3 sm:p-6 flex flex-col justify-center items-center relative bg-[#fbfaf7]">
      <!-- Faint background doc lines -->
      <div class="hidden sm:block absolute inset-x-8 top-4 pointer-events-none opacity-35 select-none">
        <div class="text-xs font-mono-num text-stone-500">Workspace / Private / Untitled Grocery List</div>
        <div class="font-display font-bold text-xl text-stone-400 mt-1">
          • oat milk • instant ramen • 5 SaaS subscriptions i don't need
        </div>
      </div>

      <!-- The Guilt-Trip Intercept Modal -->
      <div class="w-full max-w-xl bg-white border-2 border-indigo-300 rounded-xl p-4 sm:p-6 shadow-2xl relative z-10">
        {#if step === 'hero'}
          <div class="hidden sm:flex items-center gap-1 absolute -top-3 right-4 bg-amber-400 text-slate-950 font-display font-extrabold text-xs px-3 py-1 rounded-full shadow border border-amber-600">
            <Award class="w-3.5 h-3.5" />
            <span>WAIT! SAVE 1.5% RIGHT NOW</span>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 mb-4">
            <!-- Custom SVG Weeping Cloud Mascot -->
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 88 88" class="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
                <path
                  d="M24 62 H66 A13 13 0 0 0 68 37 A19 19 0 0 0 32 32 A15 15 0 0 0 24 62 Z"
                  fill="#4338ca"
                />
                <circle cx="38" cy="46" r="5" fill="#fff" />
                <circle cx="54" cy="46" r="5" fill="#fff" />
                <circle cx="38" cy="47" r="2.5" fill="#0f172a" />
                <circle cx="54" cy="47" r="2.5" fill="#0f172a" />
                <circle cx="37" cy="45.5" r="1" fill="#fff" />
                <circle cx="53" cy="45.5" r="1" fill="#fff" />
                <path d="M36 52 Q35 62 37 68" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" fill="none" />
                <path d="M56 52 Q57 62 55 68" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" fill="none" />
                <path d="M41 56 Q46 51 51 56" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" />
              </svg>
            </div>

            <div>
              <h1 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Wait! Don't Murder Your Productivity
              </h1>
              <p class="text-slate-700 text-xs sm:text-sm leading-relaxed mt-1">
                If you cancel now, Nimbus the Cloud loses his bonus and your <strong class="text-slate-900">2 untitled grocery lists</strong> lose AI Quantum Sync forever.
              </p>
            </div>
          </div>

          <!-- Compact Hostage Bar (single row, no nested cards) -->
          <div class="flex items-center justify-between px-3.5 py-2 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-mono-num text-indigo-950">
            <span><strong>2 Docs</strong> Held Hostage</span>
            <span>Aura Loss: <strong class="text-rose-800">-9,000%</strong></span>
            <span>Retention Offer: <strong class="text-emerald-800">$0.37 Off</strong></span>
          </div>

          <!-- Giant Visual Traps (WCAG AA compliant contrast) -->
          <div class="space-y-2.5 mb-4">
            <button
              type="button"
              onclick={() => onPenalty('CloudNote+ Pro Ultra Upgrade', 19.0, 3)}
              class="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-between gap-2 cursor-pointer"
            >
              <span>PAUSE CANCELLATION &amp; UPGRADE TO ULTRA</span>
              <span class="text-xs bg-emerald-950 px-2.5 py-1 rounded font-mono-num shrink-0">ONLY $19 TODAY</span>
            </button>

            <button
              type="button"
              onclick={() => onPenalty('Generous CEO Coffee Tip', 5.0, 2)}
              class="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-sm"
            >
              Keep My Plan Active &amp; Tip Our CEO ($5.00)
            </button>
          </div>

          <!-- Fine-Print Exit Link (accessible focus state + fits above mobile fold) -->
          <div class="text-xs leading-relaxed text-slate-500 border-t border-slate-200 pt-3 max-w-[62ch]">
            By remaining on this screen you celebrate recurring revenue. Alternatively, if you hate Nimbus and wish to
            abandon your workspace, you may
            <button
              type="button"
              onclick={() => {
                sfx.playClick();
                step = 'survey';
              }}
              class="inline-flex items-center min-h-[32px] px-1 underline decoration-slate-400 hover:text-slate-900 focus:text-slate-950 text-slate-600 font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
            >
              proceed to exit questionnaire
            </button>
            subject to mandatory retention verification.
          </div>
        {:else}
          <div class="animate-pop-in">
            <div class="flex items-center gap-2 text-amber-950 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-xs font-semibold mb-3.5">
              <ShieldAlert class="w-4 h-4 shrink-0" />
              <span>TRIPLE-NEGATIVE TRAP: Our legal team wrote these checkboxes at 4am. Read every word.</span>
            </div>

            <h2 class="font-display text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
              Confirm Your Departure Preferences
            </h2>

            <div class="divide-y divide-slate-200 border border-slate-200 rounded-xl mb-4 bg-slate-50/60">
              <label class="flex items-start gap-3 p-3 hover:bg-slate-100/80 cursor-pointer min-h-[48px]">
                <input
                  type="checkbox"
                  bind:checked={keepAutoRenew}
                  onchange={() => sfx.playClick()}
                  class="mt-0.5 w-5 h-5 accent-indigo-700 cursor-pointer shrink-0"
                />
                <span class="text-xs sm:text-sm text-slate-800 leading-snug">
                  <strong>Keep auto-renewal enabled</strong> so I do NOT lose uninterrupted billing continuity.
                  <span class="text-xs text-indigo-700 font-bold">(Recommended)</span>
                </span>
              </label>

              <label class="flex items-start gap-3 p-3 hover:bg-slate-100/80 cursor-pointer min-h-[48px]">
                <input
                  type="checkbox"
                  bind:checked={vipProtection}
                  onchange={() => sfx.playClick()}
                  class="mt-0.5 w-5 h-5 accent-indigo-700 cursor-pointer shrink-0"
                />
                <span class="text-xs sm:text-sm text-slate-800 leading-snug">
                  Also add <strong>VIP Billing Protection ($9.99/mo)</strong> in case I un-cancel later.
                </span>
              </label>

              <label class="flex items-start gap-3 p-3 hover:bg-slate-100/80 cursor-pointer min-h-[48px]">
                <input
                  type="checkbox"
                  bind:checked={confirmForfeit}
                  onchange={() => sfx.playClick()}
                  class="mt-0.5 w-5 h-5 accent-indigo-700 cursor-pointer shrink-0"
                />
                <span class="text-xs sm:text-sm text-slate-800 leading-snug">
                  I confirm I want to <strong>terminate my CloudNote+ trial</strong> and forfeit my founder badge.
                </span>
              </label>
            </div>

            {#if formError}
              <div
                role="alert"
                aria-live="polite"
                class="flex items-start gap-2 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold mb-3.5"
              >
                <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            {/if}

            <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onclick={submitSurvey}
                class="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-950 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Confirm Cancellation
              </button>

              <button
                type="button"
                onclick={() => onPenalty('CloudNote+ AI Credits Pack', 12.0, 2)}
                class="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 class="w-4 h-4 shrink-0" />
                <span>Nevermind, Bill Me &amp; Add AI Credits ($12)</span>
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
