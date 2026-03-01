import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Desteklediğimiz diller
const SUPPORTED_LOCALES = ["tr", "en", "ar", "ku", "fr", "nl"];
const DEFAULT_LOCALE = "tr";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // NEXT_LOCALE adında bir çerez var mı kontrol et
    const localeCookie = request.cookies.get("NEXT_LOCALE");

    // Eğer kullanıcı siteye İLK KEZ giriyorsa (çerezi yoksa)
    if (!localeCookie) {
        // Tarayıcısının dilini öğren
        const acceptLanguage = request.headers.get("accept-language");
        let detectedLocale = DEFAULT_LOCALE;

        if (acceptLanguage) {
            // Tarayıcı dilini bizim desteklediğimiz dillerle eşleştir
            const browserLangs = acceptLanguage.split(",").map(lang => lang.split("-")[0].trim());
            const match = browserLangs.find(lang => SUPPORTED_LOCALES.includes(lang));

            if (match) {
                detectedLocale = match;
            }
        }

        // Bulunan dili kullanıcıya Cookie olarak kaydet
        response.cookies.set("NEXT_LOCALE", detectedLocale, {
            path: "/",
            maxAge: 31536000, // 1 Yıl
            sameSite: "lax",
        });
    }

    return response;
}

// Bu dosyanın hangi sayfalarda çalışacağını belirliyoruz (Görsellerde falan çalışmasın diye)
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo|icons).*)"],
};