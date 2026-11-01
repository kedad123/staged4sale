/* Run with: node admin/quote-math.test.js */
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
  eval(fs.readFileSync(path.join(__dirname, file), "utf8"));
}

load("quote-catalog.js");
load("zip-centroids.js");
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
  base.date = "2026-11-01";
  base.clientName = "Elena Brooks";
  base.clientEmail = "elena.brooks@example.com";
  return Object.assign(base, overrides || {});
}

function textOf(result) {
  const model = result.model || result;
  return JSON.stringify({
    included: model.included,
    terms: model.terms,
    sections: model.sections,
    notes: model.notes,
    lines: model.lines
  });
}

function forbidden(model) {
  return /\bmonths?\b|\bmonthly\b|\brental\b|\bextensions?\b|\bweeks?\b/i.test(textOf(model));
}

const consultOnly = QuoteEngine.compute(draft({
  consultationOn: true,
  packageId: "",
  mediaOn: false
}), catalog, contact);
assert.strictEqual(consultOnly.model.total, 25000);
assert.strictEqual(consultOnly.model.documentTitle, "Quote");
assert.strictEqual(consultOnly.model.sections.length, 1);
assert.strictEqual(consultOnly.model.sections[0].title, "Consultation");
assert.strictEqual(forbidden(consultOnly), false, textOf(consultOnly));

const partial = QuoteEngine.compute(draft({
  packageId: "partial",
  qty: { "extra-room": 1 },
  extensionWeeks: 2,
  zip: "92024",
  sqft: 3000,
  mediaOn: true,
  mediaWaive: true,
  address: "100 Sample Coast Highway, Encinitas, CA"
}), catalog, contact);
assert.strictEqual(partial.model.sections.filter((s) => s.id === "staging")[0].subtotal, 200000 + 50000 + 30000);
assert.strictEqual(partial.model.sections.filter((s) => s.id === "media")[0].subtotal, 5000);
assert.strictEqual(partial.model.miles, 13);
assert.ok(!partial.model.sections.some((s) => s.id === "travel"));
assert.strictEqual(partial.model.total, 285000);
assert.ok(partial.model.lines.some(function (line) {
  return line.name === "Extension" && line.amount === 30000;
}));
assert.ok(textOf(partial).indexOf("Media package waived") !== -1);

const full = QuoteEngine.compute(draft({
  consultationOn: true,
  packageId: "full-service",
  mediaOn: true,
  mediaWaive: false
}), catalog, contact);
assert.strictEqual(full.model.sections.filter((s) => s.id === "consultation")[0].subtotal, 25000);
assert.strictEqual(full.model.sections.filter((s) => s.id === "staging")[0].subtotal, 300000 - 25000);
assert.strictEqual(full.model.sections.filter((s) => s.id === "media")[0].subtotal, 50000);
assert.strictEqual(full.model.total, 350000);
assert.ok(full.model.lines.some((line) => line.name === "Consultation credit" && line.amount === -25000));

const waivedCredit = QuoteEngine.compute(draft({
  consultationOn: true,
  packageId: "full-service",
  waiveCredit: true
}), catalog, contact);
assert.ok(!waivedCredit.model.lines.some((line) => line.name === "Consultation credit"));
assert.strictEqual(waivedCredit.model.total, 25000 + 300000);

const occupied = QuoteEngine.compute(draft({
  packageId: "occupied",
  qty: { "furniture-rental": 1 }
}), catalog, contact);
assert.strictEqual(occupied.model.total, 200000);
assert.ok(!occupied.model.lines.some((line) => line.name === "Extension"));
assert.ok(textOf(occupied).indexOf("rented room") !== -1);
assert.ok(!occupied.model.lines.some((line) => line.name === "Additional room"));

const occupiedPlain = QuoteEngine.compute(draft({ packageId: "occupied" }), catalog, contact);
assert.strictEqual(occupiedPlain.model.total, 150000);
assert.strictEqual(/\bextensions?\b|\bweeks?\b|\bmonths?\b/i.test(textOf(occupiedPlain)), false);

const occupiedWeeks = QuoteEngine.compute(draft({
  packageId: "occupied",
  qty: { "furniture-rental": 2 },
  extensionWeeks: 1
}), catalog, contact);
assert.strictEqual(occupiedWeeks.model.lines.filter((line) => line.name === "Extension")[0].amount, 10000);

const trip = QuoteEngine.mileage(catalog, "92024", "");
assert.strictEqual(trip.calculated, 13);
assert.strictEqual(trip.surcharge, 0);
const far = QuoteEngine.mileage(catalog, "92651", "");
assert.strictEqual(far.calculated, 42);
assert.strictEqual(far.surcharge, 11000);

assert.ok(!catalog.addons.some((item) => item.id === "occupied"));
assert.ok(!catalog.packages.some((item) => item.id === "budget" || item.id === "minimal"));

(async function roundTrip() {
  const hash = await QuoteEngine.encodeHash(partial.model);
  const back = await QuoteEngine.decodeHash("#" + hash);
  assert.strictEqual(back.total, 285000);
  assert.strictEqual(back.sections.length, partial.model.sections.length);
  assert.strictEqual(back.zip, "92024");
  console.log("quote math ok");
})().catch(function (error) {
  console.error(error);
  process.exit(1);
});
