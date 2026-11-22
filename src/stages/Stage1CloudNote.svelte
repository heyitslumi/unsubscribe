<script lang="ts">
  import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert, TrendingUp, Award, Flame } from '@lucide/svelte';
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
      vipProtection = false;
      onPenalty('CloudNote+ VIP Billing Protection Add-on', 9.99, 2);
      formError = 'Whoops! You left VIP Billing Protection ($9.99) checked. We billed it and unchecked it for you.';
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

<div class="min-h-full bg-[#f4f6fb] text-slate-900 flex flex-col justify-between relative overflow-hidden">
  <!-- Manipulative Live FOMO Ticker Strip -->
  <div class="bg-indigo-950 text-indigo-100 text-[11px] font-mono-num py-1.5 px-4 flex items-center justify-between border-b border-indigo-800">
    <div class="flex items-center gap-2 truncate">
      <Flame class="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span class="truncate">
        <strong>LIVE FOMO FEED:</strong> @founder_kyle just upgraded to Annual Ultra ($299/yr) • 1,429 users refused to cancel today
      </span>
    </div>
    <span class="hidden sm:inline text-amber-300 font-bold shrink-0 ml-2">99.4% RETENTION RATE</span>
  </div>

  <div class="p-4 sm:p-7 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
    <!-- Brand bar -->
    <div class="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3.5 mb-5 gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <Sparkles class="w-4 h-4" />
        </div>
        <span class="font-display font-extrabold text-lg tracking-tight text-slate-900">CloudNote+</span>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          #1 Guilt-Driven Workspace
        </span>
      </div>
      <div class="flex items-center gap-1.5 text-xs font-mono-num font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
        <TrendingUp class="w-3.5 h-3.5" />
        <span>$24.99/mo auto-debit armed</span>
      </div>
    </div>

    {#if step === 'hero'}
      <div class="bg-white border-2 border-indigo-200 rounded-2xl p-5 sm:p-6 shadow-xl relative">
        <!-- Obnoxious floating corner discount sticker -->
        <div class="hidden sm:flex items-center gap-1 absolute -top-3 right-5 bg-amber-400 text-slate-950 font-display font-extrabold text-[11px] px-3 py-1 rounded-full shadow border border-amber-500 rotate-2">
          <Award class="w-3.5 h-3.5" />
          <span>WAIT! SAVE 1.5% RIGHT NOW!</span>
        </div>

        <!-- Crying Cloud Mascot + Headline Split -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
          <!-- Custom SVG Weeping Cloud Mascot -->
          <div class="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-inner">
            <svg viewBox="0 0 88 88" class="w-16 h-16" aria-hidden="true">
              <!-- Cloud body -->
              <path
                d="M24 62 H66 A13 13 0 0 0 68 37 A19 19 0 0 0 32 32 A15 15 0 0 0 24 62 Z"
                fill="#4f46e5"
              />
              <!-- Puppy eyes -->
              <circle cx="38" cy="46" r="5" fill="#fff" />
              <circle cx="54" cy="46" r="5" fill="#fff" />
              <circle cx="38" cy="47" r="2.5" fill="#0f172a" />
              <circle cx="54" cy="47" r="2.5" fill="#0f172a" />
              <circle cx="37" cy="45.5" r="1" fill="#fff" />
              <circle cx="53" cy="45.5" r="1" fill="#fff" />
              <!-- Waterfall tears -->
              <path d="M36 52 Q35 62 37 68" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <path d="M56 52 Q57 62 55 68" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" fill="none" />
              <!-- Quivering frown -->
              <path d="M41 56 Q46 51 51 56" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none" />
            </svg>
          </div>

          <div>
            <div class="inline-block text-[10px] font-mono-num font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 mb-1">
              WARNING: PERMANENT SYNERGY LOSS
            </div>
            <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Wait! Don't Murder Your Productivity!
            </h1>
            <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1">
              If you cancel now, Nimbus the Cloud loses his bonus and your <strong class="text-slate-900">2 untitled grocery lists</strong> lose AI Quantum Sync forever.
            </p>
          </div>
        </div>

        <!-- Fake Damage Breakdown Box -->
        <div class="grid grid-cols-3 gap-2 mb-5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div>
            <div class="font-mono-num font-extrabold text-sm sm:text-base text-indigo-700">2</div>
            <div class="text-[10px] text-slate-500">Grocery Lists At Risk</div>
          </div>
          <div class="border-x border-slate-200">
            <div class="font-mono-num font-extrabold text-sm sm:text-base text-rose-600">-9,000%</div>
            <div class="text-[10px] text-slate-500">Projected Aura Loss</div>
          </div>
          <div>
            <div class="font-mono-num font-extrabold text-sm sm:text-base text-emerald-700">$0.37</div>
            <div class="text-[10px] text-slate-500">Fake Coupon Value</div>
          </div>
        </div>

        <!-- Giant visual traps with animated sheen -->
        <div class="space-y-2.5 mb-5">
          <button
            type="button"
            onclick={() => onPenalty('CloudNote+ Pro Ultra Upgrade', 19.0, 3)}
            class="bait-button w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-between cursor-pointer"
          >
            <span>PAUSE CANCELLATION &amp; UPGRADE TO ULTRA</span>
            <span class="text-xs bg-emerald-900/70 px-2.5 py-1 rounded-md font-mono-num">ONLY $19 TODAY</span>
          </button>

          <button
            type="button"
            onclick={() => onPenalty('Generous CEO Coffee Tip', 5.0, 2)}
            class="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-sm"
          >
            Keep My Plan Active &amp; Tip Our CEO ($5.00)
          </button>
        </div>

        <!-- Hidden inline cancel link inside fine print -->
        <p class="text-[11px] leading-relaxed text-slate-400 border-t border-slate-100 pt-3.5">
          By remaining on this screen for more than 90 seconds you celebrate recurring revenue. Alternatively, if you
          hate Nimbus and wish to abandon your workspace, you may
          <button
            type="button"
            onclick={() => {
              sfx.playClick();
              step = 'survey';
            }}
            class="underline decoration-slate-300 hover:text-slate-700 text-slate-400 font-normal cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            proceed to exit questionnaire
          </button>
          subject to mandatory retention verification.
        </p>
      </div>
    {:else}
      <div class="bg-white border-2 border-indigo-200 rounded-2xl p-5 sm:p-6 shadow-xl animate-pop-in">
        <div class="flex items-center gap-2 text-amber-800 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 text-xs font-semibold mb-4">
          <ShieldAlert class="w-4 h-4 shrink-0" />
          <span>TRIPLE-NEGATIVE TRAP: Our legal team wrote these checkboxes at 4am. Read every word!</span>
        </div>

        <h2 class="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mb-3.5">
          Confirm Your Departure Preferences
        </h2>

        <div class="space-y-2.5 mb-4">
          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={keepAutoRenew}
              onchange={() => sfx.playClick()}
              class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <span class="text-xs sm:text-sm text-slate-800 leading-snug">
              <strong>Keep auto-renewal enabled</strong> so I do NOT lose uninterrupted billing continuity.
              <span class="text-xs text-indigo-600 font-bold">(Recommended)</span>
            </span>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={vipProtection}
              onchange={() => sfx.playClick()}
              class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <span class="text-xs sm:text-sm text-slate-800 leading-snug">
              Also add <strong>VIP Billing Protection ($9.99/mo)</strong> in case I un-cancel later.
            </span>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={confirmForfeit}
              onchange={() => sfx.playClick()}
              class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <span class="text-xs sm:text-sm text-slate-800 leading-snug">
              I confirm I want to <strong>terminate my CloudNote+ trial</strong> and forfeit my imaginary founder badge.
            </span>
          </label>
        </div>

        {#if formError}
          <div class="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold mb-4">
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        {/if}

        <!-- Swapped visual hierarchy buttons -->
        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onclick={submitSurvey}
            class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Confirm Cancellation
          </button>

          <button
            type="button"
            onclick={() => onPenalty('CloudNote+ AI Credits Pack', 12.0, 2)}
            class="bait-button flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>Nevermind, Bill Me &amp; Add AI Credits ($12)</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
