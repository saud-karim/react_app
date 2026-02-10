# إعداد البيئة (Environment Setup)

## كيفية تغيير الـ Base URL

### الطريقة الأولى: تعديل ملف `.env.local`

1. افتح ملف `.env.local` في مجلد `react_app`
2. غير قيمة `EXPO_PUBLIC_API_BASE_URL`:

```bash
# للعمل على اللوكال:
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1

# للعمل على السيرفر:
EXPO_PUBLIC_API_BASE_URL=https://your-server.com/api/v1
```

3. احفظ الملف وأعد تشغيل التطبيق

### الطريقة الثانية: إنشاء ملف `.env.local` جديد

إذا لم يكن الملف موجود، أنشئ ملف جديد باسم `.env.local` في مجلد `react_app`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_APP_NAME=EDARA
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## أمثلة للاستخدام

### للتطوير المحلي:
```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### للسيرفر الحقيقي:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourcompany.com/api/v1
```

### لسيرفر تجريبي:
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000/api/v1
```

## ملاحظات مهمة

1. **لا تنس إعادة التشغيل**: بعد تغيير أي قيمة في ملف `.env.local`، يجب إعادة تشغيل التطبيق
2. **الأمان**: لا تضع معلومات حساسة في هذا الملف إذا كنت ستشاركه
3. **Git**: ملف `.env.local` مُستثنى من Git، لذا لن يتم رفعه للمستودع

## كيفية إعادة التشغيل

```bash
# أوقف التطبيق بـ Ctrl+C ثم:
npx expo start --clear --port 8082
```