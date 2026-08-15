const game = { active: false, score: 0, endsAt: 0, timer: null };
const box = document.querySelector('#barkcadeBox');
const start = document.querySelector('#barkcadeStart');
const score = document.querySelector('#barkcadeScore');
const status = document.querySelector('#barkcadeStatus');

function renderTreat() {
  if (!box || !game.active) return;
  const treat = document.createElement('button');
  treat.className = 'treat';
  treat.textContent = ['🦴','🍪','🥓','🧀'][Math.floor(Math.random()*4)];
  treat.style.left = `${8 + Math.random()*76}%`;
  treat.style.top = `${12 + Math.random()*70}%`;
  treat.addEventListener('click', () => {
    game.score += 1;
    score.textContent = game.score;
    treat.remove();
    renderTreat();
  }, { once: true });
  box.appendChild(treat);
}

start?.addEventListener('click', () => {
  if (game.active) return;
  game.active = true; game.score = 0; game.endsAt = Date.now() + 10000;
  score.textContent = '0'; status.textContent = '10 seconds. Catch everything. GO!';
  document.querySelectorAll('.treat').forEach((node) => node.remove());
  for (let i=0;i<4;i++) renderTreat();
  game.timer = setInterval(() => {
    const remaining = Math.max(0, game.endsAt - Date.now());
    status.textContent = `${(remaining/1000).toFixed(1)}s · treats caught: ${game.score}`;
    if (!remaining) {
      clearInterval(game.timer); game.active = false;
      document.querySelectorAll('.treat').forEach((node) => node.remove());
      status.textContent = `TIME! ${game.score} treats. ${game.score >= 12 ? 'Certified zoomie champion.' : 'The dog demands a rematch.'}`;
    }
  }, 100);
});
