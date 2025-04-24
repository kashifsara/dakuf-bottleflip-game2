import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './components/Button';
import { Card, CardContent } from './components/Card';

export default function BottleFlipGame() {
  const [flipping, setFlipping] = useState(false);
  const [landed, setLanded] = useState(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [intervalId, setIntervalId] = useState(null);
  const [wallet, setWallet] = useState({ bonus: 50, amount: 0, winnings: 0 });
  const [cashedOut, setCashedOut] = useState(false);
  const [failTimestamps, setFailTimestamps] = useState([]);
  const [flipAmount, setFlipAmount] = useState(10);
  const [rechargeAmount, setRechargeAmount] = useState(100);

  const totalWallet = wallet.bonus + wallet.amount;

  const startFlip = () => {
    if (totalWallet < flipAmount) return alert("Recharge your wallet to continue playing");

    if (wallet.bonus >= flipAmount) {
      setWallet(prev => ({ ...prev, bonus: prev.bonus - flipAmount }));
    } else {
      const remainder = flipAmount - wallet.bonus;
      setWallet(prev => ({ ...prev, bonus: 0, amount: prev.amount - remainder }));
    }

    setFlipping(true);
    setLanded(null);
    setMultiplier(1.0);
    setCashedOut(false);

    const now = Date.now();
    const recentFails = failTimestamps.filter(t => now - t < 10000);
    let failAt = 5000 + Math.random() * 3000;

    if (recentFails.length >= 3) {
      failAt = 70000;
    }

    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;

      if (elapsed >= failAt) {
        clearInterval(id);
        setFlipping(false);
        setLanded('fail');
        setFailTimestamps([...recentFails, Date.now()]);
        return;
      }

      const winChance = Math.random();
      if (winChance > 0.7) {
        clearInterval(id);
        setFlipping(false);
        setLanded('fail');
        setFailTimestamps([...recentFails, Date.now()]);
        return;
      }

      setMultiplier(prev => +(prev + 0.1).toFixed(2));
    }, 1000);

    setIntervalId(id);
  };

  const cashOut = () => {
    if (!flipping) return;
    clearInterval(intervalId);
    setFlipping(false);
    setCashedOut(true);
    setLanded('success');
    const earnings = +(flipAmount * 0.1 * multiplier).toFixed(2);
    setWallet(prev => ({ ...prev, winnings: prev.winnings + earnings, amount: prev.amount + earnings }));
  };

  const handleRecharge = () => {
    if (rechargeAmount < 100) return alert("Minimum recharge is ₹100");
    const upiId = "9953887662@ptyes";
    const name = "Dakuf Games";
    const note = "Dakuf Wallet Recharge";
    const url = `upi://pay?pa=${upiId}&pn=${name}&am=${rechargeAmount}&cu=INR&tn=${note}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <img src="/assets/dakuf-logo.png" alt="Dakuf Logo" className="w-48 mb-4" />
      <Card className="bg-gray-900 w-full max-w-md text-center">
        <CardContent>
          <h1 className="text-2xl font-bold mb-2">Dakuf: BottleFlip X</h1>
          <p className="mb-4">Flip the bottle. ₹{flipAmount} is used per flip. Cash out before it crashes!</p>

          <motion.img
            src="/assets/dakuf-bottle.png"
            alt="Dakuf Bottle"
            className="w-32 h-32 mx-auto mb-4"
            animate={flipping ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: flipping ? Infinity : 0, duration: 0.5, ease: 'linear' }}
          />

          <div className="text-xl font-mono mb-4">Multiplier: x{multiplier.toFixed(2)}</div>

          {flipping ? (
            <Button onClick={cashOut} className="bg-yellow-500 hover:bg-yellow-400 text-black">Cash Out</Button>
          ) : (
            <Button onClick={startFlip} className="bg-blue-600 hover:bg-blue-500">Start Flip</Button>
          )}

          <div className="flex justify-center items-center mt-4 gap-2">
            <label htmlFor="flipAmt" className="text-sm text-gray-400">Flip Amount:</label>
            <input
              id="flipAmt"
              type="number"
              min="10"
              max="100"
              step="10"
              value={flipAmount}
              onChange={e => setFlipAmount(Math.min(100, Math.max(10, Number(e.target.value))))}
              className="bg-gray-800 border border-gray-600 text-white px-2 py-1 w-24 text-center"
            />
          </div>

          {landed === 'success' && <p className="text-green-400 mt-4">You earned ₹{(flipAmount * 0.1 * multiplier).toFixed(2)}!</p>}
          {landed === 'fail' && <p className="text-red-500 mt-4">Oops! The bottle fell. Try again.</p>}
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-gray-400">
        <p>Wallet Balance: ₹{totalWallet} (Bonus ₹{wallet.bonus}, Recharge ₹{wallet.amount})</p>
        <p>Winnings: ₹{wallet.winnings}</p>
      </div>

      {totalWallet < flipAmount && (
        <div className="mt-4 text-red-400 font-semibold">Recharge your wallet to play again.</div>
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <input
          type="number"
          placeholder="Enter recharge amount"
          value={rechargeAmount}
          min={100}
          onChange={(e) => setRechargeAmount(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 border border-gray-700 rounded-md w-64 text-center"
        />
        <Button onClick={handleRecharge} className="bg-green-500 hover:bg-green-400 text-black w-64">
          Recharge via UPI (Min ₹100)
        </Button>
      </div>
    </div>
  );
}
