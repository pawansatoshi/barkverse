(() => {
  'use strict';
  const VIDEO_SRC = 'https://www.youtube.com/embed/v2fX4cu7eRA?rel=0&playsinline=1';
  const getFrame = () => document.querySelector('#barkverseHeroVideo iframe');
  const stop = () => {
    const frame = getFrame();
    if (!frame) return;
    try { frame.src = 'about:blank'; } catch {}
    frame.dataset.barkverseStopped = '1';
  };
  const resume = () => {
    const frame = getFrame();
    if (frame && frame.dataset.barkverseStopped === '1') {
      frame.src = VIDEO_SRC;
      delete frame.dataset.barkverseStopped;
    }
  };
  const bind = () => {
    const enter = document.querySelector('#demoBtn');
    const edit = document.querySelector('#editDogBtn');
    if (enter && !enter.dataset.heroVideoBound) {
      enter.dataset.heroVideoBound = '1';
      enter.addEventListener('click', stop, { capture: true });
    }
    if (edit && !edit.dataset.heroVideoBound) {
      edit.dataset.heroVideoBound = '1';
      edit.addEventListener('click', () => setTimeout(resume, 0));
    }
  };
  bind();
  window.addEventListener('barkverse:languagechange', () => setTimeout(bind, 0));
  new MutationObserver(bind).observe(document.body, { childList: true, subtree: true });
})();
