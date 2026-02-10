# تعليمات عمل APK للتطبيق

## المشكلة:
الـ APK مطلعش لأن مفيش Android SDK مثبت على الجهاز.

## الحلول المتاحة:

### الحل الأول: تثبيت Android Studio (الأفضل)
1. حمل Android Studio من: https://developer.android.com/studio
2. ثبته وافتح Android Studio
3. اذهب إلى SDK Manager وثبت:
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android API Level 33 أو أحدث
4. اضبط متغير البيئة ANDROID_HOME:
   ```
   ANDROID_HOME=C:\Users\[YourUsername]\AppData\Local\Android\Sdk
   ```
5. أضف للـ PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

### الحل الثاني: استخدام EAS Build (أسهل)
1. اعمل حساب مجاني على: https://expo.dev
2. شغل الأوامر:
   ```bash
   npx expo login
   eas build --platform android --profile preview
   ```

### الحل الثالث: استخدام Expo Application Services
1. ادخل على: https://expo.dev/accounts/[username]/projects/edara-app/builds
2. اضغط "Create Build"
3. اختر Android
4. اختر APK
5. انتظر البناء (5-15 دقيقة)
6. حمل الـ APK

## بعد تثبيت Android SDK:
```bash
# تأكد إن كل حاجة شغالة:
adb version

# اعمل الـ APK:
npx expo run:android --variant release
```

## ملاحظات:
- الـ APK هيكون في: `android/app/build/outputs/apk/release/`
- حجم الـ APK متوقع: 50-80 MB
- Push notifications هتشتغل في الـ APK (مش زي Expo Go)