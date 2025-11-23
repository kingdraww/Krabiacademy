// =======================================================
// 1. İLERLEME TAKİBİ VE LİSTE GÜNCELLEMESİ
// =======================================================

/**
 * Ana sayfadaki ilerleme çubuğunu ve modül listesini LocalStorage verilerine göre günceller.
 */
function updateProgressDisplay() {
    // Toplam ders sayısını al
    const totalLessonCountEl = document.getElementById('total-lesson-count');
    if (!totalLessonCountEl) return;
    
    const totalLessons = parseInt(totalLessonCountEl.value, 10);
    let completedLessons = 0;

    // Modül ilerleme listesini güncelle
    const moduleItems = document.querySelectorAll('.module-progress-item');
    moduleItems.forEach(item => {
        const slug = item.getAttribute('data-module-slug');
        const moduleTotal = parseInt(item.getAttribute('data-total-lessons'), 10);
        let moduleCompleted = 0;
        
        // Modüldeki tüm ders slug'larını (benzersiz isimlerini) al
        const lessonSlugs = Array.from(item.querySelectorAll('.lesson-slugs li')).map(li => li.getAttribute('data-lesson-slug'));

        // LocalStorage'ı kontrol et (getLessonState fonksiyonu localstorage-tracker.js'den gelir)
        lessonSlugs.forEach(lessonSlug => {
            if (getLessonState(lessonSlug) === 'completed') {
                moduleCompleted++;
            }
        });

        // Genel sayımı güncelle
        completedLessons += moduleCompleted;

        // Modül çubuğunu güncelle
        const percent = moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0;
        const fillEl = item.querySelector('.progress-fill-module');
        const completedCountEl = item.querySelector('.completed-count');
        
        if (fillEl) fillEl.style.width = `${percent}%`;
        if (completedCountEl) completedCountEl.textContent = moduleCompleted;
    });

    // Ana Sayfadaki ders listesini güncelle (☐ -> ✅)
    const lessonStatusElements = document.querySelectorAll('.lesson-status');
    lessonStatusElements.forEach(el => {
        const slug = el.getAttribute('data-lesson-slug');
        if (getLessonState(slug) === 'completed') {
            el.textContent = '✅';
            el.classList.add('completed');
        } else {
            el.textContent = '☐';
            el.classList.remove('completed');
        }
    });

    // Genel İlerleme Çubuğunu ve Özeti Güncelle
    const overallPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    const overallBar = document.getElementById('overall-progress-bar');
    const overallPercentEl = document.getElementById('overall-progress-percent');
    const completionSummaryEl = document.getElementById('completion-summary');

    if (overallBar) overallBar.querySelector('.progress-fill').style.width = `${overallPercent.toFixed(1)}%`;
    if (overallPercentEl) overallPercentEl.textContent = `${overallPercent.toFixed(1)}%`;
    if (completionSummaryEl) completionSummaryEl.textContent = `Tamamlanan: ${completedLessons} / Toplam: ${totalLessons}`;

    // Header'daki özeti güncelle
    const headerSummaryEl = document.getElementById('header-progress-summary');
    if (headerSummaryEl) headerSummaryEl.textContent = `İlerleme: %${overallPercent.toFixed(0)}`;
}

/**
 * Bir dersin tamamlandığını işaretler ve ilerlemeyi günceller.
 * @param {string} slug - Dersin benzersiz adı (slug).
 */
function markAsComplete(slug) {
    // setLessonState fonksiyonu localstorage-tracker.js'den gelir
    setLessonState(slug, 'completed');
    alert('Ders tamamlandı olarak işaretlendi! İlerlemeniz kaydedildi.');
    
    // İlerleme gösterimini yeniden yükle
    updateProgressDisplay();
}

// =======================================================
// 2. KULLANICI NOTLARI YÖNETİMİ
// =======================================================

/**
 * Belirli bir ders için notları LocalStorage'a kaydeder.
 */
function handleNoteSave(button) {
    const slug = button.getAttribute('data-lesson-slug');
    const notesArea = document.getElementById(`user-notes-${slug}`);
    const statusEl = button.nextElementSibling; // Hemen sonraki durum etiketi

    if (notesArea && slug) {
        // saveNote fonksiyonu localstorage-tracker.js'den gelir
        saveNote(slug, notesArea.value);
        
        statusEl.textContent = 'Notlar kaydedildi! (' + new Date().toLocaleTimeString() + ')';
        statusEl.style.color = 'var(--color-secondary)';
    }
}

/**
 * Belirli bir ders için notları LocalStorage'dan yükler.
 * @param {string} slug - Dersin benzersiz adı (slug).
 */
function loadLessonState(slug) {
    // Notları yükle
    const notesArea = document.getElementById(`user-notes-${slug}`);
    if (notesArea) {
        // loadNote fonksiyonu localstorage-tracker.js'den gelir
        const savedNotes = loadNote(slug);
        if (savedNotes) {
            notesArea.value = savedNotes;
        }
    }

    // Tamamlanma butonunu kontrol et
    const completeButton = document.getElementById('mark-as-complete');
    if (completeButton) {
        if (getLessonState(slug) === 'completed') {
            completeButton.textContent = '✅ Bu ders tamamlandı!';
            completeButton.disabled = true;
        } else {
            completeButton.addEventListener('click', () => markAsComplete(slug));
        }
    }
}


// =======================================================
// 3. ETKİLEŞİMLİ SÖZLÜK (GLOSSARY)
// =======================================================

let glossaryData = [];

/**
 * Sözlük verilerini çeker ve makale içeriğini tarayarak tooltip'leri oluşturur.
 */
async function initGlossary() {
    try {
        // _data/glossary.yml dosyasını çek
        const response = await fetch('/_data/glossary.yml');
        if (!response.ok) {
            console.error('Sözlük verisi yüklenemedi. Dosya yolunu kontrol edin.');
            return;
        }
        
        // YAML'yi parse etmek için harici bir kütüphane gerekebilir
        // Basit bir örnek için, YML yerine JSON kullanmanız önerilir.
        // Şimdilik, verinin çekildiğini ve parse edildiğini varsayalım.
        // Gerçek bir Jekyll projesinde bu genellikle ya bir plugin ile ya da JSON'a çevrilerek yapılır.
        
        // Örnek: Eğer glossary.yml içeriğini statik olarak JSON'a çevirmişsek:
        // const response = await fetch('/assets/data/glossary.json');
        // glossaryData = await response.json();

        // Basitlik için sadece HTML manipülasyonu yapalım
        
        // Makale içeriğini al
        const articleContent = document.querySelector('.article-content');
        if (!articleContent) return;
        
        // Not: Gerçekte bu veriyi çekmek ve metin içinde bulup değiştirmek karmaşıktır.
        // Bu örnekte, JS'nin çalışacağı varsayılarak bir uyarı bırakılmıştır.
        console.warn('Sözlük özelliği için gerçek bir fetch/parse işlemi (YAML/JSON) gereklidir.');

    } catch (error) {
        console.error('Sözlük yüklenirken hata oluştu:', error);
    }
}


// =======================================================
// 4. STATİK QUIZ KONTROL MANTIĞI
// =======================================================

/**
 * Quiz cevaplarını kontrol eder, geri bildirim sağlar ve skoru günceller.
 * @param {HTMLFormElement} form - Kontrol edilecek quiz formu.
 */
function checkQuiz(form) {
    let score = 0;
    const questions = form.querySelectorAll('.quiz-question-block');
    const totalQuestions = questions.length;

    questions.forEach((qBlock, index) => {
        const feedbackEl = document.getElementById(`feedback-q${index + 1}`);
        const selectedOption = form.querySelector(`input[name="q${index + 1}"]:checked`);
        const correctAnswer = qBlock.getAttribute('data-correct-answer');
        
        // Geri bildirimi temizle
        feedbackEl.className = 'question-feedback-area';
        feedbackEl.textContent = '';

        if (selectedOption) {
            if (selectedOption.value === correctAnswer) {
                score++;
                feedbackEl.textContent = '✅ Doğru!';
                feedbackEl.classList.add('feedback-correct');
            } else {
                feedbackEl.textContent = `❌ Yanlış. Doğru cevap: ${correctAnswer.toUpperCase()}`;
                feedbackEl.classList.add('feedback-wrong');
            }
        } else {
            feedbackEl.textContent = 'Lütfen bir seçim yapın.';
        }
    });

    // Özeti göster
    const summary = form.querySelector('.quiz-summary');
    const scoreEl = form.querySelector('#quiz-score');
    const messageEl = form.querySelector('#quiz-message');
    const checkButton = form.querySelector('.check-quiz-button');
    const resetButton = form.querySelector('.reset-quiz-button');
    
    if (scoreEl) scoreEl.textContent = score;
    if (summary) summary.style.display = 'block';

    if (score === totalQuestions) {
        if (messageEl) messageEl.textContent = 'Mükemmel! Tüm soruları doğru bildiniz.';
        if (checkButton) checkButton.style.display = 'none';
        // Quiz tamamlandığında dersi otomatik işaretleme opsiyonu eklenebilir.
        // markAsComplete(form.getAttribute('data-quiz-id'));
    } else {
        if (messageEl) messageEl.textContent = 'Tekrar denemek için Yeniden Dene butonunu kullanın.';
        if (resetButton) resetButton.style.display = 'inline-block';
    }
}

/**
 * Quiz'deki tüm cevapları sıfırlar ve formu başlangıç durumuna döndürür.
 * @param {HTMLFormElement} form - Sıfırlanacak quiz formu.
 */
function resetQuiz(form) {
    form.reset();
    
    // Geri bildirimleri temizle
    form.querySelectorAll('.question-feedback-area').forEach(el => {
        el.className = 'question-feedback-area';
        el.textContent = '';
    });
    
    // Özeti gizle ve butonları ayarla
    form.querySelector('.quiz-summary').style.display = 'none';
    form.querySelector('.check-quiz-button').style.display = 'inline-block';
    form.querySelector('.reset-quiz-button').style.display = 'none';
}


// =======================================================
// 5. GLOBAL OLAY YÖNETİMİ
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. İlerleme Takibini Başlat
    updateProgressDisplay(); 

    // 2. Not Kaydetme Olaylarını Atama
    document.querySelectorAll('.save-notes-button').forEach(button => {
        button.addEventListener('click', () => handleNoteSave(button));
    });

    // 3. Mobil Navigasyonu Yönetme
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mainNav.style.display = isExpanded ? 'none' : 'block';
        });
    }

    // Not: Makale sayfaları için loadLessonState ve initGlossary 
    // fonksiyonları, article.html içinde özel olarak çağrılmaktadır.
});

// Gerekli fonksiyonları global olarak erişilebilir kıl
window.updateProgressDisplay = updateProgressDisplay;
window.markAsComplete = markAsComplete;
window.checkQuiz = checkQuiz;
window.resetQuiz = resetQuiz;
// window.initGlossary = initGlossary; // Sözlük için
// window.loadLessonState = loadLessonState; // Notlar için
