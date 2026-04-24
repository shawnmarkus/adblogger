const PKG_MAP: Record<string, string> = {
  "com.whatsapp": "WhatsApp",
  "com.instagram.android": "Instagram",
  "com.facebook.katana": "Facebook",
  "com.google.android.youtube": "YouTube",
  "com.android.chrome": "Chrome",
  "com.google.android.gm": "Gmail",
  "com.twitter.android": "X (Twitter)",
  "org.telegram.messenger": "Telegram",
  "com.snapchat.android": "Snapchat",
  "com.spotify.music": "Spotify",
  "com.zhiliaoapp.musically": "TikTok",
  network: "Raw Network (Kernel)",
  system: "Android OS",
  "com.android.vending": "Google Play Store",
  "com.google.android.gms": "Google Play Services",
};

const SYS_TAGS = new Set([
  "InetDiagMessage","ConnectivityService","ActivityManager","system_server",
  "nativeloader","BufferQueueConsumer","TaskViewThumbnail","RecentsTaskLoader",
  "msys","serviceDiscovery","CameraService","RecentsModel",
]);

export function getFriendlyAppName(pkg: string): string {
  if (!pkg) return "Unknown";
  if (PKG_MAP[pkg]) return PKG_MAP[pkg];
  if (SYS_TAGS.has(pkg)) return "OS: " + pkg;
  if (pkg.includes(".")) {
    const parts = pkg.split(".");
    const name = parts[parts.length - 1];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return pkg;
}

export function fmtBytes(b: number): string {
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + " MB";
  if (b > 1024) return (b / 1024).toFixed(1) + " KB";
  return b + " B";
}
