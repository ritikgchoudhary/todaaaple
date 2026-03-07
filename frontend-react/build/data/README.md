# Static Data (Home Page – No Backend)

Home page ka **saara content** isi folder ke JSON files se aata hai. Carousel, logo, notice, category lists, games, providers — sab **static**; koi backend API call nahi.

## Files overview

| File | Purpose |
|------|--------|
| `site.json` | Logo URL, APK download URL, notice text, carousel image URLs |
| `home-category-games.json` | Section-wise lists: Sports, Casino, Crash, Slot, Lottery, Cards (order = display order) |
| `providers.json` | Slot category ke liye provider filter list |
| `sports.json` | Sports category games (catalog) |
| `casino.json` | Live Casino games |
| `crash.json` | Crash games |
| `slot.json` | Slot games |
| `lottery.json` | Lottery games |
| `cards.json` | Card games |

**Path:** `frontend/public/data/` — build ke baad `/data/*.json` se serve hota hai.

---

## site.json

```json
{
  "logoUrl": "https://example.com/logo.png",
  "apkDownloadUrl": "https://example.com/app.apk",
  "notice": "Welcome! Win Big Daily.",
  "carousel": ["https://example.com/banner1.jpg", "https://example.com/banner2.jpg"]
}
```

- **logoUrl** – Header logo (khali = default logo).
- **apkDownloadUrl** – Download button link.
- **notice** – Top notice text.
- **carousel** – Array of image URLs (banner carousel).

---

## home-category-games.json

Har section (Sports, Casino, Crash, Slot, Lottery, Cards) ke liye order list. Item: `{ "key", "name", "charImg", "logoImg" }`. Agar array khali hai to fallback (default list ya catalog games) use hota hai.

```json
{
  "sports": [{ "key": "9wickets", "name": "9WICKETS", "charImg": "https://...", "logoImg": "https://..." }],
  "casino": [],
  "crash": [],
  "slot": [],
  "lottery": [],
  "cards": []
}
```

---

## providers.json

Slot category sidebar filter. Array of `{ "brand_id", "brand_title", "brand_img" ya "brand_img_cdn", "status": 1 }`. Khali array = koi provider filter nahi.

```json
[
  { "brand_id": 49, "brand_title": "JILI", "brand_img": "https://...", "status": 1 }
]
```

---

## Game catalog (category-wise)

Har category ke liye ek file — games list jo grid/catalog mein use hoti hai.

---

## Format

Har file mein **`games`** naam ka array hona chahiye. Har item ek game object hai.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Unique game key (e.g. `9wickets`, `aviator`) — launch ke liye use hota hai |
| `name` | string | Display name (home page par dikhega) |
| `category` | string | Same as file: `sports` \| `casino` \| `crash` \| `slot` \| `lottery` \| `cards` |
| `type` | string | `grid` (normal tile) ya `featured` (bada/featured card) |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID — nahi diya to auto-generate ho jata hai |
| `logoUrl` | string | Logo image URL (tile par chota logo) |
| `charImageUrl` | string | Card / background image URL (tile ki main image) |
| `backgroundUrl` | string | Extra background URL |
| `softapiGameUid` | string | iGaming launch ke liye — agar game launch API use karti hai |
| `provider` | number | Slot category mein filter ke liye (optional) |

---

## Example: `sports.json`

```json
{
  "games": [
    {
      "id": "sports-1",
      "key": "9wickets",
      "name": "9WICKETS",
      "category": "sports",
      "type": "grid",
      "logoUrl": "https://example.com/logo.png",
      "charImageUrl": "https://example.com/card.png",
      "backgroundUrl": "",
      "softapiGameUid": "9wickets"
    },
    {
      "key": "saba-sports",
      "name": "SABA Sports",
      "category": "sports",
      "type": "grid",
      "charImageUrl": "https://example.com/saba.png"
    }
  ]
}
```

## Example: empty category (`lottery.json`)

```json
{
  "games": []
}
```

Agar koi file **missing** hai ya **invalid** hai, us category ke liye empty list use hoti hai — site crash nahi hoti.

---

## Summary

- Jo games aap in JSON files mein add karoge, wahi home page par category ke hisaab se dikhenge.
- Edit karke save karo → frontend rebuild / refresh karo → changes dikh jayenge.
