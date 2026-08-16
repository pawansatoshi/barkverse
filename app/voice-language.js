(() => {
  try {
    if (!window.speechSynthesis || window.speechSynthesis.__barkverseLanguagePatched) return;
    const nativeSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance) => {
      try { utterance.lang = window.BARKVERSE_I18N?.getVoiceLocale?.() || document.documentElement.lang || 'en-US'; } catch {}
      nativeSpeak(utterance);
    };
    window.speechSynthesis.__barkverseLanguagePatched = true;
  } catch {}
})();
