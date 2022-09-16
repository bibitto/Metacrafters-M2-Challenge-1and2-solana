const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const DEMO_FROM_SECRET_KEY = new Uint8Array([
  48, 156, 40, 204, 94, 187, 222, 148, 136, 179, 102, 229, 116, 71, 28, 40, 239, 108, 222, 94, 1,
  145, 49, 177, 56, 21, 85, 56, 126, 127, 108, 210, 141, 211, 109, 23, 232, 111, 98, 247, 229, 142,
  68, 140, 87, 156, 123, 238, 199, 191, 214, 63, 182, 47, 81, 92, 12, 135, 20, 166, 99, 15, 143,
  209,
]);

// Get Keypair from Secret Key
const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
const to = Keypair.generate();

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const getWalletBalance = async (keyPair) => {
  const walletBalance = await connection.getBalance(new PublicKey(keyPair?.publicKey));
  const fixedWalletBalance = parseInt(walletBalance / LAMPORTS_PER_SOL);
  return fixedWalletBalance;
};

const airDropSol = async (keyPair) => {
  try {
    const airdropValue = 2 * LAMPORTS_PER_SOL;
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(keyPair?.publicKey),
      airdropValue
    );
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature,
    });
    console.log('Airdrop completed for the Sender account');
  } catch (error) {
    console.log(error);
  }
};

const transferSol = async (sender, receiver) => {
  try {
    const walletBalance = await getWalletBalance(sender);
    const sendValue = (walletBalance * LAMPORTS_PER_SOL) / 2;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender?.publicKey,
        toPubkey: receiver?.publicKey,
        lamports: sendValue,
      })
    );
    // Sign transaction
    await sendAndConfirmTransaction(connection, transaction, [sender]);
    console.log(`from sender, ${sendValue / LAMPORTS_PER_SOL} SOL send to receiver`);
  } catch (error) {
    console.log(error);
  }
};

const logFromAndToWalletBalances = async () => {
  const fromWalletBalance = await getWalletBalance(from);
  const toWalletBalance = await getWalletBalance(to);

  console.log("sender's wallet balance: ", fromWalletBalance);
  console.log("receiver's wallet balance: ", toWalletBalance);
};

const main = async () => {
  await logFromAndToWalletBalances();
  await airDropSol(from);
  await logFromAndToWalletBalances();
  await transferSol(from, to);
  await logFromAndToWalletBalances();
};
main();
