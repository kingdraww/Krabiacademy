/**
 * LocalStorage Anahtarları İçin Ön Ek
 * Tüm ilerleme verilerinin 'krypto_progress_' ile başlamasını sağlar.
 */
const PROGRESS_KEY_PREFIX = 'krypto_progress_';
const NOTES_KEY_PREFIX = 'krypto_notes_';

// =======================================================
// 1. İLERLEME TAKİBİ FONKSİYONLARI (COMPLETION STATUS)
// =======================================================

/**
 * Belirli bir dersin ilerleme durumunu LocalStorage'dan okur.
 * * @param {string} lessonSlug - Dersin benzersiz adı (örn: blockchain-nedir).
 * @returns {string|null} Kaydedilmiş durum ('completed') veya bulunamazsa null.
 */
function getLessonState(lessonSlug) {
    if (typeof(Storage) === "undefined") {
        console.warn("Tarayıcı LocalStorage'ı desteklemiyor. İlerleme kaydedilemeyecek.");
        return null;
    }
    
    try {
        const key = PROGRESS_KEY_PREFIX + lessonSlug;
        return localStorage.getItem(key);
    } catch (e) {
        console.error("Ders durumu okunurken hata oluştu:", e);
        return null;
    }
}

/**
 * Belirli bir dersin ilerleme durumunu LocalStorage'a kaydeder.
 * * @param {string} lessonSlug - Dersin benzersiz adı (örn: private-key-guvenligi).
 * @param {string} status - Kaydedilecek durum (örn: 'completed').
 */
function setLessonState(lessonSlug, status) {
    if (typeof(Storage) === "undefined") {
        console.warn("Tarayıcı LocalStorage'ı desteklemiyor. İlerleme kaydedilemeyecek.");
        return;
    }

    try {
        const key = PROGRESS_KEY_PREFIX + lessonSlug;
        localStorage.setItem(key, status);
        // console.log(`İlerleme kaydedildi: ${key} = ${status}`);
    } catch (e) {
        console.error("Ders durumu kaydedilirken hata oluştu:", e);
    }
}

// =======================================================
// 2. KULLANICI NOTLARI FONKSİYONLARI (USER NOTES)
// =======================================================

/**
 * Belirli bir ders için kullanıcı notlarını LocalStorage'a kaydeder.
 * * @param {string} lessonSlug - Dersin benzersiz adı.
 * @param {string} notes - Kaydedilecek not içeriği.
 */
function saveNote(lessonSlug, notes) {
    if (typeof(Storage) === "undefined") {
        console.warn("Tarayıcı LocalStorage'ı desteklemiyor. Not kaydedilemeyecek.");
        return;
    }

    try {
        const key = NOTES_KEY_PREFIX + lessonSlug;
        localStorage.setItem(key, notes);
        // console.log(`Not kaydedildi: ${key}`);
    } catch (e) {
        console.error("Not kaydedilirken hata oluştu:", e);
    }
}

/**
 * Belirli bir ders için kullanıcı notlarını LocalStorage'dan okur.
 * * @param {string} lessonSlug - Dersin benzersiz adı.
 * @returns {string|null} Kaydedilmiş not içeriği veya bulunamazsa null.
 */
function loadNote(lessonSlug) {
    if (typeof(Storage) === "undefined") {
        return null;
    }

    try {
        const key = NOTES_KEY_PREFIX + lessonSlug;
        return localStorage.getItem(key);
    } catch (e) {
        console.error("Not okunurken hata oluştu:", e);
        return null;
    }
}

// =======================================================
// 3. DIŞARIYA AKTARIM (Diğer JS dosyaları için)
// =======================================================

// Bu fonksiyonları window objesine ekleyerek main.js'ten erişilebilir kılın
window.getLessonState = getLessonState;
window.setLessonState = setLessonState;
window.saveNote = saveNote;
window.loadNote = loadNote;
