# فرنو الکترونیک — مینی‌اپ تلگرام

## ساختار پوشه‌ها

```
farno-miniapp/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   └── app.js
├── images/
│   └── circuits/
│       ├── cheshmak555.jpg
│       ├── felasher555.jpg
│       ├── felasher547.jpg
│       ├── cheshmak2q.jpg
│       ├── dozdgirleyzeri.jpg
│       └── hoshdardahandeatash.jpg
└── README.md
```

## عکس‌های مدار (حتماً با همین اسم‌ها آپلود کن)

این فایل‌ها رو از سرور PythonAnywhere بردار و داخل پوشه `images/circuits/` بذار:

| اسم فایل در گیت‌هاب              | توضیح                          |
|----------------------------------|--------------------------------|
| `cheshmak555.jpg`                | چشمک‌زن با آیسی ۵۵۵           |
| `felasher555.jpg`                | فلاشر با آیسی ۵۵۵             |
| `felasher547.jpg`                | فلاشر با BC547                |
| `cheshmak2q.jpg`                 | چشمک‌زن با دو ترانزیستور      |
| `dozdgirleyzeri.jpg`             | دزدگیر لیزری                  |
| `hoshdardahandeatash.jpg`        | هشداردهنده آتش                |

## مراحل راه‌اندازی (کاملاً رایگان با گیت‌هاب)

### ۱. ساخت ریپازیتوری
1. برو https://github.com/new
2. اسم بذار مثلاً `farno-miniapp`
3. Public انتخاب کن
4. Create repository

### ۲. آپلود فایل‌ها
- همه فایل‌های بالا رو آپلود کن (می‌تونی از GitHub Desktop یا مستقیم Drag & Drop استفاده کنی)
- عکس‌های مدار رو هم حتماً داخل `images/circuits/` بذار

### ۳. فعال کردن GitHub Pages
1. برو به Settings ریپازیتوری
2. از منوی سمت چپ Pages رو بزن
3. Source رو روی `Deploy from a branch` بذار
4. Branch رو `main` و پوشه `/ (root)` انتخاب کن
5. Save کن
6. چند دقیقه صبر کن تا آدرس آماده بشه:
   `https://YOUR_USERNAME.github.io/farno-miniapp/`

### ۴. اتصال به ربات (BotFather)
1. برو پیش @BotFather
2. `/mybots` → رباتت رو انتخاب کن
3. **Bot Settings** → **Menu Button** → **Configure menu button**
4. آدرس مینی‌اپ رو بفرست (همون آدرس GitHub Pages)
5. متن دکمه رو مثلاً بذار: `⚡ منوی اصلی`

یا از طریق **Configure Mini App** هم می‌تونی ست کنی.

### ۵. (اختیاری ولی پیشنهادی) دریافت سفارش مستقیم در ربات

برای اینکه سفارش‌ها مستقیم به ربات برسه، این کد رو به فایل رباتت اضافه کن:

```python
@bot.message_handler(content_types=['web_app_data'])
def handle_webapp_data(message):
    try:
        import json
        data = json.loads(message.web_app_data.data)
        if data.get("type") == "order":
            text = f"📦 سفارش جدید از مینی‌اپ\n\n"
            text += f"👤 نام: {data.get('name')}\n"
            text += f"📱 شماره: {data.get('phone')}\n"
            if data.get('note'):
                text += f"📝 توضیحات: {data.get('note')}\n"
            text += "\n━━━━━━━━━━━━\n"
            for i, item in enumerate(data.get('items', []), 1):
                text += f"\n{i}. {item.get('product')}\n"
                text += f"   مقدار: {item.get('value')}\n"
                text += f"   تعداد: {item.get('count')}\n"

            bot.send_message(ADMIN, text)
            bot.send_message(ADMIN2, text)
            bot.send_message(message.chat.id, "✅ سفارشت ثبت شد و به پشتیبانی ارسال گردید.")
    except Exception as e:
        print("web_app_data error:", e)
```

اگر این هندلر رو نذاری، مینی‌اپ سفارش رو به صورت پیام آماده به پشتیبانی (@nvdrl) باز می‌کنه.

## نکات مهم

- مینی‌اپ کاملاً استاتیکه و روی گیت‌هاب رایگان کار می‌کنه
- سبد خرید با localStorage ذخیره می‌شه
- بعداً می‌تونی جلوی هر قطعه قیمت اضافه کنی (تو فایل `js/data.js` و `js/app.js`)
- اگر عکس‌ها لود نشدن، اسم فایل‌ها رو دقیق چک کن (حساس به حروف بزرگ/کوچک)
