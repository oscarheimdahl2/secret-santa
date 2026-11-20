// Usage: npm run generate
// Reads pairs.json (gifter -> receiver), writes src/data.json (password -> receiver)
// and passwords.txt (hand these out, keep private!).
import { readFileSync, writeFileSync } from "node:fs";

const WORDS = [
  "pepparkaka", "lussekatt", "julgran", "tomte", "snoflinga", "glogg",
  "klementin", "kanelbulle", "skridsko", "pulka", "nisse", "granris",
  "hjortron", "paketband", "julstjarna", "ljuslykta", "ren", "knackebrod",
  "vantar", "pomerans", "saffran", "polkagris", "nougat", "marsipan",
  "adventsljus", "snogubbe", "lingon", "julkula", "mandel", "rimfrost",
];

const pairs = JSON.parse(readFileSync("pairs.json", "utf8"));
const givers = Object.keys(pairs);

// --- validate: one complete loop, nobody gives to themselves ---
const receivers = Object.values(pairs);
if (new Set(receivers).size !== receivers.length) throw new Error("A receiver appears twice.");
for (const g of givers) {
  if (pairs[g] === g) throw new Error(`${g} gives to themselves.`);
  if (!givers.includes(pairs[g])) throw new Error(`${pairs[g]} receives but never gives.`);
}
let seen = 0;
let cur = givers[0];
do {
  cur = pairs[cur];
  seen++;
} while (cur !== givers[0] && seen <= givers.length);
if (seen !== givers.length) throw new Error(`Not a single loop (loop length ${seen} of ${givers.length}).`);

// --- unique passwords: [christmas word][two digits] ---
const used = new Set();
const newPassword = () => {
  let pw;
  do {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const digits = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    pw = word + digits;
  } while (used.has(pw));
  used.add(pw);
  return pw;
};

const data = {};
const lines = [];
for (const giver of givers) {
  const pw = newPassword();
  data[pw] = pairs[giver];
  lines.push(`${giver}: ${pw}`);
}

writeFileSync("src/data.json", JSON.stringify(data, null, 2) + "\n");
writeFileSync("passwords.txt", lines.join("\n") + "\n");
console.log(`Done! ${givers.length} passwords in passwords.txt:\n\n` + lines.join("\n"));
