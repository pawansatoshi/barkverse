(() => {
  const PROJECT_ID = 'a0031066837361c93d02ae2f139acc98';
  const DEVNET = 'solana:devnet';
  let appKit = null;
  let loading = null;

  async function init() {
    if (appKit) return appKit;
    if (loading) return loading;
    loading = (async () => {
      const [{ createAppKit }, { SolanaAdapter }, networks] = await Promise.all([
        import('https://esm.sh/@reown/appkit@1.7.8'),
        import('https://esm.sh/@reown/appkit-adapter-solana@1.7.8'),
        import('https://esm.sh/@reown/appkit/networks@1.7.8')
      ]);
      const solanaAdapter = new SolanaAdapter({ registerWalletStandard: true });
      appKit = createAppKit({
        adapters: [solanaAdapter],
        networks: [networks.solana, networks.solanaTestnet, networks.solanaDevnet],
        defaultNetwork: networks.solanaDevnet,
        projectId: PROJECT_ID,
        metadata: {
          name: 'BARKVERSE',
          description: 'The playful dog internet',
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`]
        },
        features: { analytics: false }
      });
      return appKit;
    })().finally(() => { loading = null; });
    return loading;
  }

  async function connect() {
    const modal = await init();
    if (modal.getIsConnected?.() && modal.getWalletProvider?.()) {
      return { provider: modal.getWalletProvider(), address: modal.getAddress?.() || '', source: 'WalletConnect/Reown' };
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      let timer = null;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        try { unsubscribe?.(); } catch {}
        fn(value);
      };
      const unsubscribe = modal.subscribeProvider?.((state) => {
        if (state?.isConnected && state?.provider && state?.address) {
          finish(resolve, { provider: state.provider, address: state.address, source: 'WalletConnect/Reown' });
        }
        if (state?.error) finish(reject, new Error(String(state.error?.message || state.error)));
      });
      timer = setTimeout(() => finish(reject, new Error('Wallet connection timed out. Please try again.')), 90000);
      try { modal.open({ view: 'Connect', namespace: 'solana' }); }
      catch (error) { finish(reject, error); }
    });
  }

  window.barkverseWalletConnect = { connect, init, projectId: PROJECT_ID, devnet: DEVNET };
})();
