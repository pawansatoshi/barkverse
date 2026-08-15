(() => {
  const PROJECT_ID = 'a0031066837361c93d02ae2f139acc98';
  const DEVNET = 'solana:devnet';
  let appKit = null;
  let loading = null;
  let standardLoading = null;

  const base58 = (bytes) => {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let digits = [0];
    for (const byte of bytes) {
      let carry = byte;
      for (let i = 0; i < digits.length; i++) {
        const value = digits[i] * 256 + carry;
        digits[i] = value % 58;
        carry = Math.floor(value / 58);
      }
      while (carry) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
    }
    let result = '';
    for (const byte of bytes) { if (byte === 0) result += '1'; else break; }
    for (let i = digits.length - 1; i >= 0; i--) result += alphabet[digits[i]];
    return result;
  };

  const solanaStandardWallets = async () => {
    if (standardLoading) return standardLoading;
    standardLoading = (async () => {
      const { getWallets } = await import('https://esm.sh/@wallet-standard/app@1.1.1');
      const registry = getWallets();
      const read = () => registry.get().filter((wallet) => {
        const chains = Array.isArray(wallet?.chains) ? wallet.chains : [];
        const features = wallet?.features || {};
        const hasConnect = !!features['standard:connect']?.connect;
        const hasSend = !!features['solana:signAndSendTransaction']?.signAndSendTransaction;
        const hasSign = !!features['solana:signTransaction']?.signTransaction;
        return chains.some((chain) => String(chain).startsWith('solana:')) && hasConnect && (hasSend || hasSign);
      });
      let wallets = read();
      if (!wallets.length) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        wallets = read();
      }
      return { registry, wallets };
    })().finally(() => { standardLoading = null; });
    return standardLoading;
  };

  const chooseStandardWallet = (wallets) => {
    if (wallets.length === 1) return Promise.resolve(wallets[0]);
    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.id = 'barkverseWalletChooser';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,10,10,.62);display:flex;align-items:center;justify-content:center;padding:18px;font-family:system-ui,sans-serif';
      const card = document.createElement('div');
      card.style.cssText = 'width:min(430px,100%);background:#fffdf7;border-radius:22px;padding:22px;box-shadow:0 20px 70px rgba(0,0,0,.3)';
      const heading = document.createElement('h2'); heading.textContent = 'Choose your Solana wallet'; heading.style.cssText = 'margin:0 0 6px;font-size:22px';
      const sub = document.createElement('p'); sub.textContent = 'BARKVERSE uses Wallet Standard for secure wallet discovery.'; sub.style.cssText = 'margin:0 0 16px;color:#666;font-size:14px';
      const list = document.createElement('div'); list.style.cssText = 'display:grid;gap:9px';
      wallets.forEach((wallet) => {
        const btn = document.createElement('button'); btn.type = 'button';
        btn.style.cssText = 'display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border:1px solid #ddd5c7;border-radius:14px;background:#fff;font-size:16px;font-weight:700;text-align:left;cursor:pointer';
        if (wallet.icon) { const img = document.createElement('img'); img.src = String(wallet.icon); img.alt = ''; img.width = 30; img.height = 30; img.style.borderRadius = '8px'; btn.appendChild(img); }
        const label = document.createElement('span'); label.textContent = wallet.name || 'Solana wallet'; btn.appendChild(label);
        btn.addEventListener('click', () => { overlay.remove(); resolve(wallet); }); list.appendChild(btn);
      });
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Cancel'; cancel.style.cssText = 'width:100%;margin-top:12px;padding:11px;border:0;background:transparent;color:#666;font-weight:700;cursor:pointer'; cancel.addEventListener('click', () => { overlay.remove(); reject(new Error('Wallet connection cancelled.')); });
      card.append(heading, sub, list, cancel); overlay.appendChild(card); document.body.appendChild(overlay);
    });
  };

  async function connectWalletStandard() {
    const { wallets } = await solanaStandardWallets();
    if (!wallets.length) return null;
    const wallet = await chooseStandardWallet(wallets);
    const connectFeature = wallet.features['standard:connect'];
    const result = await connectFeature.connect();
    const account = result?.accounts?.find((item) => Array.from(item?.chains || []).includes(DEVNET)) || result?.accounts?.[0];
    if (!account) throw new Error(`${wallet.name} did not return a Solana account.`);
    if (!account.chains?.includes(DEVNET) && !account.chains?.some?.((chain) => String(chain).startsWith('solana:'))) {
      throw new Error(`${wallet.name} does not expose a Solana account compatible with BARKVERSE devnet.`);
    }

    const sendFeature = wallet.features['solana:signAndSendTransaction'];
    const signFeature = wallet.features['solana:signTransaction'];
    const provider = {
      publicKey: { toString: () => account.address },
      async connect() { return { publicKey: this.publicKey }; },
      async signAndSendTransaction(transaction) {
        const serialized = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
        if (sendFeature?.signAndSendTransaction) {
          const [output] = await sendFeature.signAndSendTransaction({ account, chain: DEVNET, transaction: new Uint8Array(serialized) });
          if (!output?.signature) throw new Error(`${wallet.name} did not return a transaction signature.`);
          return { signature: base58(output.signature) };
        }
        if (!signFeature?.signTransaction) throw new Error(`${wallet.name} cannot sign Solana transactions.`);
        const [output] = await signFeature.signTransaction({ account, chain: DEVNET, transaction: new Uint8Array(serialized) });
        if (!output?.signedTransaction) throw new Error(`${wallet.name} did not return a signed transaction.`);
        const { Connection } = await import('https://esm.sh/@solana/web3.js@1.98.4');
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const signature = await connection.sendRawTransaction(output.signedTransaction, { preflightCommitment: 'confirmed' });
        return { signature };
      }
    };
    return { wallet: provider, address: account.address, source: wallet.name || 'Wallet Standard' };
  }

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
        metadata: { name: 'BARKVERSE', description: 'The playful dog internet', url: window.location.origin, icons: [`${window.location.origin}/favicon.ico`] },
        features: { analytics: false }
      });
      return appKit;
    })().finally(() => { loading = null; });
    return loading;
  }

  async function connect() {
    try {
      const standard = await connectWalletStandard();
      if (standard) return standard;
    } catch (error) {
      if (String(error?.message || '').toLowerCase().includes('cancel')) throw error;
      console.warn('Wallet Standard connection failed; falling back to WalletConnect.', error);
    }

    const modal = await init();
    if (modal.getIsConnected?.() && modal.getWalletProvider?.()) return { wallet: modal.getWalletProvider(), address: modal.getAddress?.() || '', source: 'WalletConnect/Reown' };
    return new Promise((resolve, reject) => {
      let settled = false; let timer = null;
      const finish = (fn, value) => { if (settled) return; settled = true; if (timer) clearTimeout(timer); try { unsubscribe?.(); } catch {} fn(value); };
      const unsubscribe = modal.subscribeProvider?.((state) => {
        if (state?.isConnected && state?.provider && state?.address) finish(resolve, { wallet: state.provider, address: state.address, source: 'WalletConnect/Reown' });
        if (state?.error) finish(reject, new Error(String(state.error?.message || state.error)));
      });
      timer = setTimeout(() => finish(reject, new Error('Wallet connection timed out. Please try again.')), 90000);
      try { modal.open({ view: 'Connect', namespace: 'solana' }); } catch (error) { finish(reject, error); }
    });
  }

  window.barkverseWalletConnect = { connect, init, projectId: PROJECT_ID, devnet: DEVNET };
})();
