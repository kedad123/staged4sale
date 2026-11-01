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

The seed object is `admin/quote-catalog.js`. A later backend can replace that object with the same shape. Until then, the editor writes the whole object to `localStorage` key `s4s-admin-quote-catalog-v4`.

Saved quotes use `s4s-admin-saved-quotes-v1`. A saved quote stores the choices (package, quantities, names). Opening it prices those choices with the list currently in that browser. A copied link is different: it freezes the line items from the moment it was copied.

Reset on the price list deletes the saved list in that browser and loads the seed again.

A quote is three optional sections. Each has its own subtotal. The quote total is the sum, after any whole-quote discount.

The quote type list is one choice: no staging, consultation only, Partial Staging, Full-Service Staging, or Occupied Styling & Accessories. Basic Media Package is a checkbox at the bottom of that list and can be added to any choice. Waive media fee appears only when that box is checked.

Under the choice, the consultation fee is Charge, Waive fee, or Credit toward staging. Credit is available only with a staging package and adds a -$250 credit line. Charge adds the $250 consultation line. Waive fee leaves the consultation off a staging quote. On consultation only, Waive fee shows the $250 and a matching credit. A consultation-only quote does not mention rental, extensions, weeks, or months.

Listing media is the Basic Media Package, $500 for homes up to 2,500 sq ft, plus $0.10 per sq ft above that. Waive shows the $500 line and a matching credit. The size surcharge is still charged when the home is over 2,500 sq ft.

After a line is on the quote, its price can be edited for that quote. The price list defaults stay as they are. The miles field shows the calculated miles, and that number can be edited directly.

Travel is $5 per mile after 20 miles from Oceanside, once per visit, for any section that needs a visit. It is not part of an extension.

Distance is estimated in the browser. `admin/zip-centroids.js` holds U.S. Census Bureau 2024 ZCTA internal points for ZIP codes that touch San Diego, Orange, or Riverside County (2020 ZCTA-to-county relationship file). Census publications are public domain. The origin is the ZIP 92054 centroid (Oceanside). Miles are straight-line haversine distance times a road factor of 1.2, rounded to a whole mile. The rate, free miles, origin ZIP, origin name, and road factor are editable. A ZIP outside the table does not guess a distance. Tawni can type miles instead. No map service and no API key are used.

Additional room is one $500 item for vacant and occupied quotes. It counts toward extension rooms. A patio set is $250 and counts as half a room, which is $25 per week and $100 per month.

Vacant extension rooms are the package rooms plus added rooms, including half a room for a patio set. After the included days, the rate is $200 per room per month, billed in prepaid one-week blocks at $50 per room per week. The quote shows both rates. The week count is what gets charged.

Occupied Styling & Accessories has no extension of its own. Extensions apply only to added rooms on that job, at that same $200 / $50 rate, after the included 60 days. If there are no added rooms, the quote does not mention an extension.

Extensions do not include media, consultation, or travel.

Staging terms, including the weekly rental sentence, are printed only when a staging package is selected and an extension applies. A consultation-only or media-only quote uses a short set of terms with none of that language.

A dollar discount cannot exceed a positive subtotal. A percent discount is also limited to the subtotal. A custom line may be negative; that is a credit. A zero custom amount is left off the quote.

Items flagged Placeholder were not in the draft fixed list. The flag shows in the admin. It is not printed on the client quote. The whole list is still a sample until the real rates replace it, which the banners on the builder and the price list say.

## Draft fixed rates, and the placeholders

From the draft fixed list, still labeled sample:

- Consultation, $250 for 1 hour, with a $250 credit against staging when it is on the same quote or previously paid
- Partial Staging, $2,000, 2 rooms, 30 days. Full styling by an ASPM Master Stager. The client picks the rooms.
- Full-Service Staging, $3,000, 3 rooms plus kitchen and bath accents, 60 days. Includes consultation, furniture selection, accessories, and styling. Media is not included.
- Occupied Styling & Accessories, $1,500. Living, dining, and primary bedroom plus kitchen and bath accents, using the owner's furniture. Accessories stay 60 days. Delivery and pickup are included. Moving furniture is not included. No extension unless furniture is rented.
- Additional room, $500, vacant or occupied. Counts toward extension rooms.
- Extension, $200 per room per month, billed at $50 per room per week. On an occupied job only added rooms count, after 60 days.
- Patio set, $250, counts as half a room ($25 per week, $100 per month)
- Basic Media Package, $500 up to 2,500 sq ft, then $0.10 per sq ft
- Travel, $5 per mile after 20 miles from Oceanside (ZIP 92054)

Room note, shown on staging quotes and the price list: "A room includes up to 5 pieces of furniture. Great rooms and other large rooms may count as two or more rooms."

Placeholders, marked in the editor:

| Item | Seed |
|---|---|
| Extra furniture piece | $100 |
| Extra accent piece | $25 |
| Access fee | $350 |
| Patio set | $400 |
| Rush booking | $300 |

## Share link and PDF

Copy link writes `/quote/#` plus the quote. The fragment is JSON with short keys. It is compressed with deflate-raw and base64url when that is shorter, and plain base64url JSON otherwise (`z…` or `j…`). The fragment is not sent to the server and is not part of the Referer header. Anyone with the link can read it, and anyone can edit the fragment. It is not a signed document.

Download PDF opens the browser print dialog with a letter-size stylesheet. Choose Save as PDF. The browser may add its own date and URL unless headers and footers are turned off.

## Left out on purpose

No client names, agent names, or street addresses from the mailbox review are in this repo. The builder’s name suggestions are the made-up people already in `admin/sample-data.js`.
