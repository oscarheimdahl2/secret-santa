import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { reveal, type Blob, type Result } from "./crypto";
import blobs from "./data.enc.json";

const SPARKLES = ["✨", "⭐", "🎅🏻", "🎁", "❄️"];

const nameDelay = 1.6;

function Sparkles({ seed }: { seed: string }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        emoji: SPARKLES[i % SPARKLES.length],
        x: 4 + Math.random() * 92,
        y: 4 + Math.random() * 92,
        delay: nameDelay + Math.random() * 2,
        size: 14 + Math.random() * 18,
        pause: Math.random() * 2.5,
      })),
    [seed],
  );

  return (
    <div className="sparkle-layer" aria-hidden>
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="sparkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            delay: s.delay,
            duration: 2.2,
            repeat: Infinity,
            repeatDelay: s.pause,
          }}
        >
          {s.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function Reveal({ result, onBack }: { result: Result; onBack: () => void }) {
  const letters = useMemo(() => Array.from(result.to), [result.to]);

  return (
    <motion.div
      className="card reveal"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.h2
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Hej {result.from}! 👋
      </motion.h2>
      <motion.p
        className="small"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Du ska ge en julklapp till…
      </motion.p>

      <h1 className="name" aria-label={result.to}>
        {letters.map((l, i) => (
          <motion.span
            key={i}
            style={{ display: "inline-block", whiteSpace: "pre" }}
            initial={{ y: 40, opacity: 0, scale: 0.3, rotate: -20 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              delay: nameDelay + i * 0.16,
              type: "spring",
              stiffness: 320,
              damping: 12,
            }}
          >
            {l}
          </motion.span>
        ))}
      </h1>
    </motion.div>
  );
}

export default function App() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(false);
    const r = await reveal(password, blobs as Blob[]);
    setBusy(false);
    if (r) {
      setResult(r);
    } else {
      setError(true);
      setShake((n) => n + 1);
    }
  }

  return (
    <main>
      <div className="stars" aria-hidden />
      {result && <Sparkles key={result.to} seed={result.to} />}
      <AnimatePresence mode="wait">
        {result ? (
          <Reveal
            key="reveal"
            result={result}
            onBack={() => {
              setResult(null);
              setPassword("");
            }}
          />
        ) : (
          <motion.form
            key="form"
            className="card"
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="gift"
              animate={{ rotate: [0, -12, 12, -9, 9, -5, 5, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.5 }}
            >
              🎁
            </motion.div>
            <h1>Hemlig tomte</h1>
            <p className="small">
              Skriv ditt lösenord för att öppna din julklapp
            </p>
            <motion.input
              key={shake}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="lösenord"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={error}
              animate={error ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.45 }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  className="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Hoppsan! Det där är inte rätt lösenord 🎅
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={busy}
            >
              {busy ? "Öppnar…" : "Öppna"}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </main>
  );
}
