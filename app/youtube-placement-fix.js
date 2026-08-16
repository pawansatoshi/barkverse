(() => {
  'use strict';
  const CHANNEL = 'https://youtube.com/@PawanSatoshi';
  const place = () => {
    const video = document.querySelector('#barkverseHeroVideo');
    const link = document.querySelector('#barkverseYoutubeLink');
    if (!video || !link) return;
    link.href = CHANNEL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Visit Pawan Satoshi YouTube channel');
    link.title = 'Pawan Satoshi YouTube channel';
    link.innerHTML = '<span class="bv-yt-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.6 3.9-6.6 3.9Z"/></svg></span><span class="bv-yt-name">Pawan Satoshi</span><span class="bv-yt-action">YouTube channel ↗</span>';
    if (link.parentElement !== video) video.appendChild(link);
    link.style.cssText = '';
  };
  const styles = () => {
    if (document.querySelector('#barkverseYoutubePlacementStyles')) return;
    const style = document.createElement('style');
    style.id = 'barkverseYoutubePlacementStyles';
    style.textContent = `
      #barkverseHeroVideo #barkverseYoutubeLink{position:relative;right:auto;bottom:auto;z-index:2;width:auto;height:auto;min-height:48px;margin:10px 2px 2px;padding:8px 12px;display:flex;align-items:center;justify-content:flex-start;gap:10px;border:1px solid var(--line,#e5dccb);border-radius:14px;background:#fff;color:#191919;text-decoration:none;box-shadow:none;transition:transform .2s ease,box-shadow .2s ease}
      #barkverseHeroVideo #barkverseYoutubeLink:hover,#barkverseHeroVideo #barkverseYoutubeLink:focus-visible{transform:translateY(-1px);box-shadow:0 8px 22px #00000012;outline:none}
      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-icon{width:34px;height:34px;display:grid;place-items:center;flex:none;border-radius:10px;background:#191919}
      #barkverseHeroVideo #barkverseYoutubeLink svg{width:19px;height:19px;fill:#ff3030}
      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-name{font-size:12px;font-weight:900;letter-spacing:.01em}
      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-action{margin-left:auto;font-size:10px;color:var(--muted,#777);font-weight:800}
      @media(max-width:720px){#barkverseHeroVideo #barkverseYoutubeLink{margin-top:8px;padding:8px 10px;min-height:44px}.bv-yt-icon{width:30px!important;height:30px!important}.bv-yt-action{font-size:9px!important}}
    `;
    document.head.appendChild(style);
  };
  const run = () => { styles(); place(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true}); else run();
  window.addEventListener('barkverse:languagechange', () => setTimeout(run, 0));
  new MutationObserver(() => { if (!document.querySelector('#barkverseHeroVideo #barkverseYoutubeLink')) run(); }).observe(document.body, {childList:true,subtree:true});
})();
