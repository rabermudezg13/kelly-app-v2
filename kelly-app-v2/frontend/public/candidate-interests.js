(() => {
  const state = { specialEd: false, para: false, loadedFor: null };

  const apiBase = () => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3026/api';
    return 'https://perceptive-nourishment-production-e92a.up.railway.app/api';
  };

  const sessionIdFromPath = () => {
    const match = window.location.pathname.match(/\/info-session\/(\d+)/);
    return match ? Number(match[1]) : null;
  };

  const saveInterests = async (sessionId) => {
    if (!sessionId) return;
    try {
      await fetch(`${apiBase()}/info-session-config/${sessionId}/interests`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          special_ed_head_start_interest: state.specialEd,
          paraprofessional_interest: state.para,
        }),
      });
    } catch (error) {
      console.error('Could not save candidate interests:', error);
    }
  };

  const loadInterests = async (sessionId) => {
    if (!sessionId || state.loadedFor === sessionId) return;
    state.loadedFor = sessionId;
    try {
      const response = await fetch(`${apiBase()}/info-session-config/${sessionId}/interests`);
      if (!response.ok) return;
      const data = await response.json();
      state.specialEd = !!data.special_ed_head_start_interest;
      state.para = !!data.paraprofessional_interest;
      syncButtons();
    } catch (error) {
      console.error('Could not load candidate interests:', error);
    }
  };

  const buttonClass = (active) =>
    `interest-choice rounded-lg border-2 px-5 py-2 font-semibold transition ${active ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-700'}`;

  const syncButtons = () => {
    document.querySelectorAll('[data-interest="special-ed"]').forEach((el) => {
      const yes = el.dataset.value === 'yes';
      el.className = buttonClass(yes === state.specialEd);
    });
    document.querySelectorAll('[data-interest="para"]').forEach((el) => {
      const yes = el.dataset.value === 'yes';
      el.className = buttonClass(yes === state.para);
    });
  };

  const injectInterestQuestions = () => {
    const section = document.querySelector('.questions-section');
    if (!section || section.querySelector('#candidate-interest-questions')) return;

    const submitButton = [...section.querySelectorAll('button')].find((b) =>
      /submit/i.test((b.textContent || '').trim())
    );
    if (!submitButton) return;

    const actions = submitButton.closest('.text-center') || submitButton.parentElement;
    if (!actions || !actions.parentElement) return;

    const box = document.createElement('div');
    box.id = 'candidate-interest-questions';
    box.className = 'mt-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 text-left';
    box.innerHTML = `
      <h3 class="mb-4 text-xl font-bold text-emerald-900">Additional Opportunities</h3>
      <div class="mb-5">
        <p class="mb-2 font-semibold text-gray-800">Are you interested in Special Education or the Head Start Program?</p>
        <div class="flex gap-3">
          <button type="button" data-interest="special-ed" data-value="yes">Yes</button>
          <button type="button" data-interest="special-ed" data-value="no">No</button>
        </div>
        <p class="mt-1 text-xs text-gray-500">Yes will set Job Title to ECE. Birth 3 in the recruiter row.</p>
      </div>
      <div>
        <p class="mb-2 font-semibold text-gray-800">Are you interested in working as a Paraprofessional?</p>
        <div class="flex gap-3">
          <button type="button" data-interest="para" data-value="yes">Yes</button>
          <button type="button" data-interest="para" data-value="no">No</button>
        </div>
        <p class="mt-1 text-xs text-gray-500">Yes will add Paraprofessional interested to Notes.</p>
      </div>`;

    actions.parentElement.insertBefore(box, actions);
    box.querySelectorAll('[data-interest="special-ed"]').forEach((button) => {
      button.addEventListener('click', () => {
        state.specialEd = button.dataset.value === 'yes';
        syncButtons();
      });
    });
    box.querySelectorAll('[data-interest="para"]').forEach((button) => {
      button.addEventListener('click', () => {
        state.para = button.dataset.value === 'yes';
        syncButtons();
      });
    });
    syncButtons();
    loadInterests(sessionIdFromPath());

    submitButton.addEventListener('click', () => saveInterests(sessionIdFromPath()), true);
  };

  const compactRecruiterRow = () => {
    const headings = [...document.querySelectorAll('h3')].filter((h) => (h.textContent || '').trim() === 'Row Generator');
    headings.forEach((heading) => {
      const container = heading.parentElement;
      if (!container || container.dataset.compactRow === 'true') return;
      const fields = container.querySelector('.space-y-3');
      if (!fields) return;

      container.dataset.compactRow = 'true';
      fields.classList.remove('space-y-3');
      fields.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-3', 'gap-3', 'items-start');

      [...fields.children].forEach((child) => {
        if (child.tagName === 'BUTTON' || child.querySelector('pre')) {
          child.classList.add('sm:col-span-2', 'xl:col-span-3');
        }
      });

      heading.classList.add('sticky', 'top-0', 'z-20', 'bg-white', 'py-2');
    });
  };

  const enhance = () => {
    injectInterestQuestions();
    compactRecruiterRow();
  };

  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', enhance);
  setTimeout(enhance, 500);
})();
