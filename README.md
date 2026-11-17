# RTB Transportation LLC — Website

Static website for **RTB Transportation LLC** — dump truck hauling, material delivery, dirt import/export and lot cleanup in Reno, Sparks, Sun Valley & Fernley, NV.

- Phone: (775) 440-8545
- Instagram: [@rtb.transportation](https://www.instagram.com/rtb.transportation/)
- USDOT #4466117

## Structure

```
index.html      — all page sections
styles.css      — theme (chrome blue / black from the RTB logo)
script.js       — nav, animations, estimate form
assets/img      — logo, truck photo, flyers, video posters
assets/video    — compressed job-site reels + hero loop
vercel.json     — caching headers
```

## Deploy (Vercel)

Import this repo in Vercel → Framework preset **Other** → no build command → output directory `./`.

## Estimate form

By default, submitting the form opens a pre-filled text message to (775) 440-8545 (with a "Copy Details" option on desktop).
To have requests emailed instead, set `FORM_ENDPOINT` at the top of `script.js`:

- **Formspree:** `const FORM_ENDPOINT = "https://formspree.io/f/XXXXXXX";`
- **Web3Forms:** `const FORM_ENDPOINT = "https://api.web3forms.com/submit";` and `const WEB3FORMS_KEY = "your-key";`

Built by [Nexora Digital](https://www.nexoradigital.live).
