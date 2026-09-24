# FarnoSelf F Coin — connected Mini App

This version connects the F Coin Mini App to the existing FarnoSelf Python/Flask bot.

## Architecture
- Telegram Mini App frontend can be hosted on GitHub Pages.
- Existing bot remains the source of truth for the real Bot Coin wallet (`coin_wallets`).
- F Coin has its own server-side wallet (`fcoin_wallets`).
- Conversion is atomic: **1,000 F Coin = 1 Bot Coin**.
- Telegram `initData` is verified server-side with the bot token.
- Tap, daily bonus and conversion are server-authoritative.

## API
- `GET /api/fcoin/me`
- `POST /api/fcoin/tap`
- `POST /api/fcoin/daily`
- `POST /api/fcoin/convert`

The frontend sends `Telegram.WebApp.initData` in `X-Telegram-Init-Data`.

## Deploy frontend to GitHub Pages
1. Upload the contents of this folder to a GitHub repository.
2. Enable GitHub Pages for the repository.
3. Set `API` in `app.js` to the public URL of the Flask backend.
4. Set `FCOIN_WEBAPP_URL` in the backend environment to the GitHub Pages URL.

## Backend deployment
1. Replace the bot file with the patched `botself_v4_updated-1.py`.
2. Set `BOT_TOKEN`, `WEBHOOK_HOST`, and `FCOIN_WEBAPP_URL` as environment variables.
3. Keep the existing `selfbot.db` beside the Python app so the existing wallets remain intact.
4. Visit `/set_webhook` once after deployment.

## Important security action
The uploaded source contained a live Telegram bot token. It is intentionally not included in the patched source. **Rotate/revoke that token in BotFather before deploying this version**, then set the new token as `BOT_TOKEN` in the server environment.

Do not put the bot token in GitHub Pages, JavaScript, HTML, or CSS.
