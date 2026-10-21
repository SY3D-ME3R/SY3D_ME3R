# SY3D_ME3R — MEER_xD

Mishu-MD-Mini archive ka customized WhatsApp bot. Bot name **MEER_xD**, owner **SYED MEER**, aur owner contact **+923118456830** hai.

## Customizations

- Plain aur stylized bot/developer branding replace ki gayi hai.
- Owner authentication aur `wa.me` links ke liye number `923118456830` use hota hai; contact display mein `+923118456830` hai.
- Hard-coded newsletter JIDs `120363429164571310@newsletter` se replace ki gayi hain.
- Menu ke 15 purane video links remove karke exactly ye 3 source URLs rakhe gaye hain:
  - https://pin.it/5qov9tWJW
  - https://pin.it/55G088qwt
  - https://pin.it/7J2rWXitc
- Pinterest short links direct MP4 nahi hote. Menu project ke existing Pinterest resolver API se video URL resolve karta hai. Resolution fail ho ya pin mein video na ho, to video skip hoti hai aur menu continue karta hai.
- Original `main.js` duplicate anti-call import aur `settings.js` misplaced closing brace fix kiye gaye hain.

## Setup aur security

`.env.example` ko `.env` mein copy karke apna `GITHUB_TOKEN` set karein. Token source files ya GitHub commits mein save na karein. Session-storage repository ka default `SY3D-ME3R/SY3D_ME3R` hai; `GITHUB_REPO` environment variable se doosri private repository select ki ja sakti hai. Runtime session storage isi repository ki `sessions/` directory use kar sakta hai.

Original package Node.js 20.x specify karta hai. Dependencies install karne ke liye `npm install` aur start karne ke liye `npm start` use hota hai.

## Verification

Tamam 71 JavaScript files syntax check pass karti hain. Bot ko WhatsApp se connect nahi kiya gaya; full dependency/runtime, pairing, aur live Pinterest playback test nahi hua. External APIs aur obfuscated `lib/system.js` original project ka hissa hain aur full security audit nahi kiya gaya.

Original project ka MIT license aur copyright attribution `LICENSE` mein preserve hai.
