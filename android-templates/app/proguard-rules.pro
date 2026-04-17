# SITA OS — ProGuard rules for release minification.

# Keep Capacitor + plugin entry points
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }

# Keep AndroidX
-keep class androidx.** { *; }
-dontwarn androidx.**

# Keep WebView JS-bridge interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Firebase Messaging service (active only when google-services.json present)
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Strip noisy logs in release
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
}
