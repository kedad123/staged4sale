# Quote calculator

Sample tool inside the admin demo. There is no backend. Prices and saved quotes stay in the browser. The client page only reads the quote that was copied into the link.

## Pages

| Page | Path |
|---|---|
| Quote builder | `/admin/quote-builder.html` |
| Price list | `/admin/price-list.html` |
| Client quote | `/quote/#…` |
| Existing quote pipeline | `/admin/quotes.html` (unchanged) |

The builder is not at `/admin/quotes/` because `admin/quotes.html` is already the sample pipeline. A folder with that name would fight that file, and the admin nav uses relative links that assume every screen sits in `/admin/`.

The sidebar Office group links Quote builder and Price list under the existing Quotes item. On a narrow screen they are under More. Public pages do not link here. None of these pages load Google Analytics.

`/quote/` sends `noindex, nofollow`, is omitted from `sitemap.xml`, and is disallowed in `robots.txt`.

## Price list

The seed object is `admin/quote-catalog.js`. A later backend can replace that object with the same shape. Until then, the editor writes the whole object to `localStorage` key `s4s-admin-quote-catalog-v1`.

Saved quotes use `s4s-admin-saved-quotes-v1`. A saved quote stores the choices (package, quantities, names). Opening it prices those choices with the list currently in that browser. A copied link is different: it freezes the line items from the moment it was copied.

Reset on the price list deletes the saved list in that browser and loads the seed again.

`mediaIncluded`, included months, included rooms, and pieces per room describe what the package price already covers. They are not added on top of it. Rental extension is a percent of the package price only, not of extra rooms or add-ons. The percent is rounded to the nearest cent.

A dollar discount cannot exceed a positive subtotal. A percent discount is also limited to the subtotal. A custom line may be negative; that is a credit. A zero custom amount is left off the quote.

Items flagged Placeholder were not in the draft fixed list. The flag shows in the admin. It is not printed on the client quote. The whole list is still a sample until the real rates replace it, which the banners on the builder and the price list say.

## Draft fixed rates, and the placeholders

From the draft fixed list, still labeled sample:

- Consultation, $250
- Full-Service Staging, $3,000 for 3 rooms, with a $500 media package and 2 months of rental included. Each room includes up to 5 pieces of furniture plus accessories.
- Rental extension, 20% of the package price per extra month ($600 on Full-Service Staging)

Placeholders, marked in the editor:

| Item | Seed |
|---|---|
| Additional room | $750 per room |
| Extra furniture piece | $100 |
| Extra accent piece | $25 |
| Stairs / long carry | $350 |
| Occupied home | $500 |
| Patio set | $400 |
| Rush booking | $300 |
| Minimal (accessories only) | $1,800, with 1 month of rental included |

## Share link and PDF

Copy link writes `/quote/#` plus the quote. The fragment is JSON with short keys. It is compressed with deflate-raw and base64url when that is shorter, and plain base64url JSON otherwise (`z…` or `j…`). The fragment is not sent to the server and is not part of the Referer header. Anyone with the link can read it, and anyone can edit the fragment. It is not a signed document.

Download PDF opens the browser print dialog with a letter-size stylesheet. Choose Save as PDF. The browser may add its own date and URL unless headers and footers are turned off.

## Left out on purpose

No client names, agent names, or street addresses from the mailbox review are in this repo. The builder’s name suggestions are the made-up people already in `admin/sample-data.js`.
