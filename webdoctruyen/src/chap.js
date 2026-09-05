load('config.js');

function execute(url) {
    let res = fetch(url);
    if (!res.ok) return Response.error("⚠️ Lỗi tải chương: " + res.status);
    let doc = res.html();

    // ===== LẤY TIÊU ĐỀ CHƯƠNG =====
    let chapterTitle = "";
    try {
        let ms = doc.querySelector(".novel-meta span");
        if (ms) chapterTitle = (ms.textContent || "").trim();
    } catch(e) {}
    if (!chapterTitle) {
        try {
            let nt = doc.querySelector(".novel-title");
            if (nt) chapterTitle = (nt.textContent || "").trim();
        } catch(e) {}
    }
    if (!chapterTitle) chapterTitle = "Chương";

    // ===== LẤY NỘI DUNG CHỈ VĂN BẢN THUẦN TUÝ =====
    let contentParts = [];
    try {
        let contentEl = doc.querySelector(".chapter-content") || doc.querySelector("main .content") || doc.querySelector("main");
        if (contentEl) {
            let paragraphs = contentEl.querySelectorAll("p");
            if (paragraphs && paragraphs.length > 0) {
                for (let i = 0; i < paragraphs.length; i++) {
                    // === CHỈ LẤY textContent === BỎ HOÀN TOÀN định dạng, style, font ===
                    let text = (paragraphs[i].textContent || "").trim();
                    if (text) contentParts.push(text);
                }
            }
        }
    } catch(e) {}

    // Fallback: lấy văn bản trong <main>
    if (contentParts.length === 0) {
        try {
            let mainEl = doc.querySelector("main");
            if (mainEl) {
                // === CHỈ LẤY textContent thuần túy ===
                let allText = mainEl.textContent || "";
                // Xóa các phần điều hướng phụ lục
                allText = allText.replace(/📑 Mục lục[\s\S]*?⏭ Chương sau/g, "");
                allText = allText.replace(/📌 Kẹp sách[\s\S]*$/g, "");
                allText = allText.replace(/^\s+|\s+$/g, "");
                // Tách đoạn văn bản
                let arr = allText.split(/\n\s*\n/);
                for (let j = 0; j < arr.length; j++) {
                    let p = arr[j].trim();
                    if (p) contentParts.push(p);
                }
            }
        } catch(e) {}
    }

    // ===== TRẢ VỀ ĐỊNH DẠNG VĂN BẢN THUẦN TUÝ =====
    // Không có thẻ HTML, không có style/font → vBook tự hiển thị theo font mặc định
    let result = "### " + chapterTitle + "\n\n";
    if (contentParts.length > 0) {
        // === Chỉ nối văn bản bằng dấu xuống dòng === KHÔNG có định dạng HTML nào khác
        result = result + contentParts.join("\n\n");
    } else {
        result = result + "⚠️ Không trích xuất được nội dung chương.";
    }

    return Response.success(result);
}