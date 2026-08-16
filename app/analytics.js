const barkSession = (() => {
  const key = 'barkverse-session-id';
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch { return `session-${Date.now()}`; }
})();

function barkEvent(type) {
  const number = (id) => Number(document.querySelector(id)?.textContent || 0);
  fetch('/api/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      type,
      sessionId: barkSession,
      eventId: `${barkSession}-${type}-${Date.now()}`,
      chaos: number('#chaos'),
      zoomies: number('#zoomies'),
      loyalty: number('#loyalty')
    })
  }).catch(() => {});
}

window.addEventListener('load', () => {
  document.querySelector('#demoBtn')?.addEventListener('click', () => barkEvent('discover'));
  document.querySelector('#caseBtn')?.addEventListener('click', () => barkEvent('investigation'));
  document.querySelector('#talkBtn')?.addEventListener('click', () => barkEvent('talk'));
  document.querySelector('#memoryBtn')?.addEventListener('click', () => barkEvent('memory'));
  document.querySelector('#pawprintBtn')?.addEventListener('click', () => barkEvent('pawprint'));
  document.querySelector('#observatoryBtn')?.addEventListener('click', () => barkEvent('observatory'));
});
