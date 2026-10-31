/* Run with: node admin/quote-math.test.js
   Checks the quote totals and the share-link round trip. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const store = {};
global.localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};
global.window = global;

function load(file) {
  const code = fs.readFileSync(path.join(__dirname, file), "utf8");
  eval(code);
}

load("quote-catalog.js");
load("quote-engine.js");

const catalog = QuoteCatalog.defaults();
const contact = {
  business: "Staged4Sale",
  phone: "(760) 583-2500",
  phoneTel: "+17605832500",
  email: "sales@staged4sale.com",
  tagline: "Home staging · North County San Diego"
};

function draft(overrides) {
  const base = QuoteEngine.blankDraft(catalog);
  base.quoteNumber = "S4S-TEST-0001";
  base.date = "2026-10-31";
  base.clientName = "Elena Brooks";
  base.clientEmail = "elena.brooks@example.com";
  base.agentName = "Maya Chen";
  base.address = "742 Sample Olive Street, San Marcos, CA";
  base.notes = "Sample quote for the demo.";
  return Object.assign(base, overrides || {});
}

function cents(result) {
  assert.strictEqual(result.error, "");
  return result.model.total;
}

const sample = draft({
  packageId: "full-service",
  qty: { "extra-room": 1, "extra-month": 1, "extra-furniture": 0, "extra-accent": 0 },
  addons: { stairs: false, occupied: false, patio: true, rush: false },
  customLines: [{ name: "Artwork install", amount: 150 }],
  discountMode: "percent",
  discountValue: 10
});
const sampleResult = QuoteEngine.compute(sample, catalog, contact);
assert.deepStrictEqual(sampleResult.model.lines.map((line) => line.amount), [
  300000, 75000, 60000, 40000, 15000
]);
assert.strictEqual(sampleResult.model.subtotal, 490000);
assert.strictEqual(sampleResult.model.discount, 49000);
assert.strictEqual(sampleResult.model.total, 441000);
assert.strictEqual(sampleResult.model.discountLabel, "Discount (10%)");
assert.strictEqual(sampleResult.placeholderUsed, true);
assert.ok(sampleResult.model.included.some((line) => line.indexOf("$500.00") !== -1));
assert.ok(sampleResult.model.included.some((line) => line.indexOf("2 months") !== -1));
assert.strictEqual(sampleResult.model.until, "2026-11-30");
assert.ok(!JSON.stringify(sampleResult.model).includes("Placeholder"));

const extension = QuoteEngine.compute(draft({
  packageId: "full-service",
  qty: { "extra-month": 1 }
}), catalog, contact);
assert.strictEqual(extension.model.lines[1].amount, 60000);
assert.ok(extension.model.lines[1].detail.indexOf("20% of Full-Service Staging") !== -1);

const odd = QuoteCatalog.defaults();
odd.packages.forEach((pkg) => { if (pkg.id === "full-service") pkg.price = 2999; });
const oddResult = QuoteEngine.compute(draft({
  packageId: "full-service",
  qty: { "extra-month": 1 }
}), odd, contact);
assert.strictEqual(oddResult.model.lines[0].amount, 299900);
assert.strictEqual(oddResult.model.lines[1].amount, 59980);
assert.strictEqual(oddResult.model.total, 359880);

const amountOff = QuoteEngine.compute(draft({
  packageId: "full-service",
  discountMode: "amount",
  discountValue: 250
}), catalog, contact);
assert.strictEqual(amountOff.model.total, 275000);
assert.strictEqual(amountOff.discountCapped, false);

const capped = QuoteEngine.compute(draft({
  packageId: "full-service",
  discountMode: "amount",
  discountValue: 5000
}), catalog, contact);
assert.strictEqual(capped.model.total, 0);
assert.strictEqual(capped.model.discount, 300000);
assert.strictEqual(capped.discountCapped, true);

const accents = QuoteEngine.compute(draft({
  packageId: "full-service",
  qty: { "extra-accent": 2, "extra-furniture": 1 }
}), catalog, contact);
assert.strictEqual(cents(accents), 300000 + 10000 + 5000);

const minimal = QuoteEngine.compute(draft({
  packageId: "minimal",
  addons: { occupied: true }
}), catalog, contact);
assert.strictEqual(minimal.model.total, 230000);
assert.strictEqual(minimal.placeholderUsed, true);

const consult = QuoteEngine.compute(draft({ packageId: "consultation" }), catalog, contact);
assert.strictEqual(consult.model.total, 25000);
assert.strictEqual(consult.placeholderUsed, false);
assert.strictEqual(consult.model.lines.length, 1);

const credit = QuoteEngine.compute(draft({
  packageId: "full-service",
  customLines: [{ name: "Inventory credit", amount: -100 }]
}), catalog, contact);
assert.strictEqual(credit.model.total, 290000);

const noPackage = QuoteEngine.compute(draft({ packageId: "" }), catalog, contact);
assert.strictEqual(noPackage.error, "no-package");
const missing = QuoteEngine.compute(draft({ packageId: "gone" }), catalog, contact);
assert.strictEqual(missing.error, "missing-package");

const fullPkg = catalog.packages.filter((pkg) => pkg.id === "full-service")[0];
const month = catalog.quantityItems.filter((item) => item.id === "extra-month")[0];
assert.strictEqual(
  QuoteEngine.unitHint(month, fullPkg),
  "$600.00 per month · 20% of Full-Service Staging"
);

(async function roundTrip() {
  const hash = await QuoteEngine.encodeHash(sampleResult.model);
  assert.ok(hash.charAt(0) === "z" || hash.charAt(0) === "j");
  assert.ok(hash.length < 4000, "hash length " + hash.length);
  const back = await QuoteEngine.decodeHash("#" + hash);
  assert.strictEqual(back.total, 441000);
  assert.strictEqual(back.client, "Elena Brooks");
  assert.strictEqual(back.address, "742 Sample Olive Street, San Marcos, CA");
  assert.strictEqual(back.lines.length, 5);
  assert.strictEqual(back.notes, "Sample quote for the demo.");
  assert.strictEqual(back.mail, "sales@staged4sale.com");
  assert.strictEqual(await QuoteEngine.decodeHash(""), null);
  assert.strictEqual(await QuoteEngine.decodeHash("#not-a-quote"), null);

  const edited = QuoteCatalog.defaults();
  edited.packages[0].price = 275;
  assert.strictEqual(QuoteCatalog.save(edited), true);
  const loaded = QuoteCatalog.load();
  assert.strictEqual(loaded.packages[0].price, 275);
  const reset = QuoteCatalog.reset();
  assert.strictEqual(reset.packages[0].price, 250);
  assert.strictEqual(QuoteCatalog.load().packages[0].price, 250);
  console.log("quote math ok, link length " + hash.length);
})().catch(function (error) {
  console.error(error);
  process.exit(1);
});
