# Backend start karein

## Start (auto port)
Terminal mein:
```bash
cd c:\todaaapple\backend
node app.js
```
**Backend ab khud 4001, 4002, ... 4010 try karega** — pehla free port pe start ho jayega.  
Console mein dikhega: **"Backend running on http://localhost:XXXX"** (XXXX = port).

## Agar port 4001 nahi hai
Agar backend **4001** pe na chal kar **4002/4003/...** pe chale:
1. **Frontend** folder mein file banao: **`.env`**
2. Usme likho: **`REACT_APP_API_PORT=4003`** (jo port backend ne bataya)
3. Frontend **restart** karein: `npm start`

## Test
Browser mein (apne port pe):
- http://localhost:4001/health  → `{"ok":true}` (ya jo port dikha ho)
- http://localhost:4001/site-settings
- http://localhost:4001/carousel
