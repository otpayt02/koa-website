const fs = require("fs");
const vm = require("vm");
const t = fs.readFileSync(process.argv[2], "utf8");
const blocks = [...t.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let ok = true;
blocks.forEach((code, i) => {
  try { new vm.Script(code, { filename: "block" + i + ".js" }); console.log("block", i, "OK, chars", code.length); }
  catch (e) {
    ok = false;
    console.log("block", i, "ERROR:", e.message);
    // locate the failing line
    const m = String(e.stack).match(/block\d\.js:(\d+):(\d+)/);
    if (m) {
      const ln = parseInt(m[1], 10);
      const lines = code.split("\n");
      for (let k = Math.max(0, ln - 2); k < Math.min(lines.length, ln + 2); k++)
        console.log((k + 1 === ln ? ">> " : "   ") + (k + 1) + ": " + lines[k].slice(0, 160));
    }
  }
});
process.exit(ok ? 0 : 1);
