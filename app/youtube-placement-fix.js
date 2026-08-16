(() => {
  'use strict';

  const CHANNEL = 'https://youtube.com/@PawanSatoshi';
  const CARD_ID = 'barkverseYoutubeLink';

  const createChannelCard = () => {
    const card = document.createElement('a');
    card.id = CARD_ID;
    card.href = CHANNEL;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', 'Visit Pawan Satoshi YouTube channel');
    card.title = 'Pawan Satoshi YouTube channel';
    card.innerHTML = `
      <span class="bv-yt-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.6 3.9-6.6 3.9-6.6Z"/>
        </svg>
      </span>
      <span class="bv-yt-copy">
        <strong>Pawan Satoshi</strong>
        <small>YouTube channel ↗</small>
      </span>
    `;
    return card;
  };

  const place = () => {
    const video = document.querySelector('#barkverseHeroVideo');
    const frame = video?.querySelector('.bv-video-frame');
    const old = document.querySelector(`#${CARD_ID}`);
    if (!video || !frame) return;

    // Always remove the legacy/floating version first.
    if (old) old.remove();

    const card = createChannelCard();
    const videoCard = video.querySelector('.bv-video-card');
    (videoCard || video).appendChild(card);
  };

  const styles = () => {
    if (document.querySelector('#barkverseYoutubePlacementStyles')) return;
    const style = document.createElement('style');
    style.id = 'barkverseYoutubePlacementStyles';
    style.textContent = `
      /* Creator channel belongs in the dedicated white gap BELOW the video, never over it. */
      #barkverseHeroVideo .bv-video-card > #barkverseYoutubeLink,
      #barkverseHeroVideo > #barkverseYoutubeLink{
        position:relative!important;
        inset:auto!important;
        z-index:3!important;
        box-sizing:border-box!important;
        width:100%!important;
        min-height:54px!important;
        height:54px!important;
        margin:10px 0 0!important;
        padding:8px 12px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:11px!important;
        overflow:hidden!important;
        border:1px solid var(--line,#e5dccb)!important;
        border-radius:14px!important;
        background:#fff!important;
        color:#191919!important;
        text-decoration:none!important;
        box-shadow:0 5px 18px #0000000b!important;
        opacity:1!important;
        visibility:visible!important;
        transform:none!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-icon{
        position:relative!important;
        flex:0 0 36px!important;
        width:36px!important;
        height:36px!important;
        display:grid!important;
        place-items:center!important;
        border-radius:10px!important;
        background:#191919!important;
        color:#fff!important;
        opacity:1!important;
        visibility:visible!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-icon svg{
        display:block!important;
        width:20px!important;
        height:20px!important;
        fill:#ff3030!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-copy{
        min-width:0!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:2px!important;
        color:#191919!important;
        opacity:1!important;
        visibility:visible!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-copy strong{
        display:block!important;
        margin:0!important;
        color:#191919!important;
        font-size:13px!important;
        line-height:1.15!important;
        font-weight:900!important;
        letter-spacing:.01em!important;
        opacity:1!important;
        visibility:visible!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-copy small{
        display:block!important;
        margin:0!important;
        color:var(--muted,#777)!important;
        font-size:10px!important;
        line-height:1.2!important;
        font-weight:800!important;
        opacity:1!important;
        visibility:visible!important;
      }

      #barkverseHeroVideo #barkverseYoutubeLink:hover,
      #barkverseHeroVideo #barkverseYoutubeLink:focus-visible{
        transform:translateY(-1px)!important;
        box-shadow:0 9px 24px #00000015!important;
        outline:none!important;
      }

      @media(max-width:720px){
        #barkverseHeroVideo .bv-video-card > #barkverseYoutubeLink,
        #barkverseHeroVideo > #barkverseYoutubeLink{
          min-height:52px!important;
          height:52px!important;
          margin-top:8px!important;
          padding:7px 10px!important;
          border-radius:13px!important;
        }
        #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-icon{
          flex-basis:34px!important;
          width:34px!important;
          height:34px!important;
          border-radius:9px!important;
        }
        #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-copy strong{font-size:12px!important}
        #barkverseHeroVideo #barkverseYoutubeLink .bv-yt-copy small{font-size:9px!important}
      }
    `;
    document.head.appendChild(style);
  };

  const run = () => { styles(); place(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, {once:true});
  } else {
    run();
  }

  window.addEventListener('barkverse:languagechange', () => setTimeout(run, 0));
  new MutationObserver(() => {
    if (!document.querySelector('#barkverseHeroVideo #barkverseYoutubeLink')) run();
  }).observe(document.body, {childList:true, subtree:true});
})();
