(() => {
  const button = document.querySelector('#pawprintBtn');
  const output = document.querySelector('#pawprintOutput');
  if (!button) return;

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

  const feeAndVerify = async (walletInfo, memoryText, dogName) => {
    const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('https://esm.sh/@solana/web3.js@1.98.4');
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const publicKeyValue = walletInfo.address || walletInfo.wallet?.publicKey?.toString?.();
    if (!publicKeyValue) throw new Error('Wallet public key unavailable. Reconnect the wallet and try again.');
    const publicKey = new PublicKey(publicKeyValue);
    const balance = await connection.getBalance(publicKey, 'confirmed');
    if (balance <= 0) throw new Error('This wallet has 0 SOL on Solana devnet. Switch the wallet to Devnet and request free devnet SOL before signing. No transaction was sent.');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const memoryTitle = (document.querySelector('#memoryOutput strong')?.textContent || 'Memory').slice(0, 160);
    const payload = `BARKVERSE|${dogName.slice(0, 40)}|${memoryTitle}|${Date.now()}`.slice(0, 500);
    const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    const transaction = new Transaction({ recentBlockhash: blockhash, feePayer: publicKey }).add(new TransactionInstruction({ programId: memoProgram, keys: [], data: new TextEncoder().encode(payload) }));
    let feeInfo = await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed');
    if (feeInfo?.value == null) {
      await new Promise(resolve => setTimeout(resolve, 350));
      feeInfo = await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed');
    }
    const estimatedLamports = feeInfo?.value;
    if (!Number.isInteger(estimatedLamports) || estimatedLamports <= 0) throw new Error('Solana returned no valid network-fee estimate. The transaction was NOT signed. Please retry in a moment.');
    if (balance < estimatedLamports) throw new Error(`Insufficient devnet SOL. Required network fee is ${(estimatedLamports / 1e9).toFixed(9)} SOL; wallet balance is ${(balance / 1e9).toFixed(9)} SOL. No transaction was sent.`);
    if (output) output.textContent = `🐾 ${walletInfo.source}: real devnet network fee ${(estimatedLamports / 1e9).toFixed(9)} SOL. Waiting for wallet approval…`;
    const sent = await walletInfo.wallet.signAndSendTransaction(transaction);
    const signature = typeof sent === 'string' ? sent : sent?.signature;
    if (!signature) throw new Error('Wallet did not return a transaction signature. No success state was recorded.');
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
    const tx = await connection.getTransaction(signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
    if (!tx) throw new Error('Transaction was confirmed but its details are not available yet. Please verify it on Solana Explorer.');
    if (tx.meta?.err) throw new Error(`Solana reported a failed transaction: ${JSON.stringify(tx.meta.err)}`);
    const actualLamports = Number(tx.meta?.fee);
    if (!Number.isFinite(actualLamports) || actualLamports <= 0) throw new Error('Confirmed transaction returned an invalid network fee. The proof was not marked successful.');
    if (output) output.innerHTML = `🐾 Pawprint preserved on Solana devnet · actual network fee ${(actualLamports / 1e9).toFixed(9)} SOL · <a href="https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=devnet" target="_blank" rel="noopener noreferrer">View transaction →</a>`;
  };

  document.addEventListener('click', async (event) => {
    if (event.target !== button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const memoryText = document.querySelector('#memoryOutput')?.textContent?.trim();
    const dogName = document.querySelector('#dogName')?.textContent?.trim() || 'DOG';
    if (!memoryText) { if (output) output.textContent = 'Create a memory first, then preserve its Pawprint.'; return; }
    button.disabled = true;
    if (output) output.textContent = 'Opening the secure Solana wallet chooser and checking the real devnet fee…';
    try {
      if (!window.barkverseWalletConnect?.connect) await import('/app/wallet-connect.js');
      const walletInfo = await window.barkverseWalletConnect.connect();
      await feeAndVerify(walletInfo, memoryText, dogName);
    } catch (error) {
      if (output) output.textContent = `Pawprint not preserved: ${String(error?.message || error)} No success state was recorded.`;
    } finally { button.disabled = false; }
  }, true);
})();
