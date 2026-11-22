<script lang="ts">
  import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert } from '@lucide/svelte';
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

<div class="min-h-full bg-[#f8fafc] text-slate-900 p-5 sm:p-8 flex flex-col justify-between">
  <div class="max-w-2xl mx-auto w-full">
    <!-- Brand bar -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <Sparkles class="w-4 h-4" />
        </div>
        <span class="font-display font-bold text-lg tracking-tight text-slate-900">CloudNote+</span>
        <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
          Pro Trial • Ends in 90s
        </span>
      </div>
      <span class="text-xs text-slate-500 font-mono-num">$24.99/mo auto-debit</span>
    </div>

    {#if step === 'hero'}
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-md">
        <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Wait! Don't Murder Your Productivity!
        </h1>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          If you leave now, your <strong class="text-slate-900">2 untitled grocery lists</strong> will lose AI
          Quantum Sync forever. 99.4% of founders stay subscribed forever!
        </p>

        <!-- Giant visual traps -->
        <div class="space-y-3 mb-6">
          <button
            type="button"
            onclick={() => onPenalty('CloudNote+ Pro Ultra Upgrade', 19.0, 3)}
            class="w-full py-4 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition text-white font-bold text-base shadow-md flex items-center justify-between cursor-pointer"
          >
            <span>PAUSE CANCELLATION &amp; UPGRADE TO ULTRA</span>
            <span class="text-xs bg-emerald-800/60 px-2.5 py-1 rounded-md font-mono-num">ONLY $19 TODAY</span>
          </button>

          <button
            type="button"
            onclick={() => onPenalty('Generous CEO Coffee Tip', 5.0, 2)}
            class="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-white font-semibold text-sm cursor-pointer"
          >
            Keep My Plan Active &amp; Tip Our CEO ($5.00)
          </button>
        </div>

        <!-- Hidden inline cancel link inside fine print -->
        <p class="text-[11px] leading-relaxed text-slate-400 border-t border-slate-100 pt-4">
          By remaining on this screen for more than 90 seconds you celebrate recurring revenue. Alternatively, if you
          dislike cloud synergy and wish to abandon your workspace, you may
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
      <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-md">
        <div class="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-medium mb-4">
          <ShieldAlert class="w-4 h-4 shrink-0" />
          <span>Read carefully! Our legal team crafted these checkboxes at 4am.</span>
        </div>

        <h2 class="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-4">
          Confirm Your Departure Preferences
        </h2>

        <div class="space-y-3.5 mb-5">
          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={keepAutoRenew}
              onchange={() => sfx.playClick()}
              class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <span class="text-sm text-slate-800 leading-snug">
              <strong>Keep auto-renewal enabled</strong> so I do NOT lose uninterrupted billing continuity.
              <span class="text-xs text-indigo-600 font-medium">(Recommended)</span>
            </span>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={vipProtection}
              onchange={() => sfx.playClick()}
              class="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer"
            />
            <span class="text-sm text-slate-800 leading-snug">
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
            <span class="text-sm text-slate-800 leading-snug">
              I confirm I want to <strong>terminate my CloudNote+ trial</strong> and forfeit my imaginary badge.
            </span>
          </label>
        </div>

        {#if formError}
          <div class="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3.5 py-2.5 text-xs font-medium mb-4">
            <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        {/if}

        <!-- Swapped visual hierarchy buttons -->
        <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onclick={submitSurvey}
            class="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            Confirm Cancellation
          </button>

          <button
            type="button"
            onclick={() => onPenalty('CloudNote+ AI Credits Pack', 12.0, 2)}
            class="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>Nevermind, Bill Me &amp; Add AI Credits ($12)</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
