import { useState, type FormEvent } from "react";
import { reveal, type Blob } from "./crypto";
import blobs from "./data.enc.json";

export default function App() {
  const [password, setPassword] = useState("");
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await reveal(password, blobs as Blob[]);
    setName(result);
    setError(!result);
  }

  if (name) {
    return (
      <main>
        <p>Du ska ge en julklapp till:</p>
        <h1>{name}</h1>
        <button
          onClick={() => {
            setName(null);
            setPassword("");
          }}
        >
          Tillbaka
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Hemlig tomte</h1>
      <form onSubmit={submit}>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="lösenord"
          autoCapitalize="none"
          autoComplete="off"
        />
        <button type="submit">Öppna</button>
      </form>
      {error && <p>Fel lösenord, försök igen.</p>}
    </main>
  );
}
