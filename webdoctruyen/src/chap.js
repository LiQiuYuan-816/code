load('config.js');
function execute() {
    let chapUrl = arguments[0] || "";
    if (!chapUrl) return Response.error("⚠️ Không có link chương");

    let res = fetch(chapUrl);
    if (!res.ok) return Response.error("⚠️ Không tải được chương: " + res.status);

    let html = res.html().toString();

    // === LẤY ĐÚNG KHỐI NỘI DUNG ===
    // Lấy nội dung trong <div class="content chapter-content"> và dừng trước <!-- ===== NAV DƯỚI ===== -->
    let contentMatch = html.match(
        /class=["']content chapter-content["'][^>]*>([\s\S]*?)<!--\s*=====\s*NAV DƯỚI\s*=====\s*-->/i
    );
    if (!contentMatch || !contentMatch[1]) {
        return Response.error("⚠️ Không tìm thấy nội dung chương");
    }
    let rawContent = contentMatch[1];

    // === LỌC HTML → VĂN BẢN ===
    let text = rawContent
        .replace(/<script[\s\S]*?<\/script>/gi, " ")     // Bỏ script
        .replace(/<style[\s\S]*?<\/style>/gi, " ")       // Bỏ style
        .replace(/<br\s*\/?>/gi, "\n")                   // <br> → xuống dòng
        .replace(/<\/p>/gi, "\n\n")                      // </p> → 2 dòng
        .replace(/<[^>]+>/g, "")                         // Bỏ tất cả thẻ HTML còn lại
        .replace(/&nbsp;/g, " ")                         // Thay khoảng trắng
        .replace(/\u3000/g, " ")                         // Khoảng rộng Nhật/Việt
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")                      // Gom nhiều dòng trống
        .trim();

    // === TIÊU ĐỀ CHƯƠNG ===
    let chapterTitle = "";
    // Cách 1: Lấy từ thẻ <span> trong .novel-meta
    let titleFromHtml = html.match(/<div class=["']novel-meta["'][^>]*>\s*<span>([\s\S]*?)<\/span>/i);
    if (titleFromHtml) chapterTitle = titleFromHtml[1].trim();
    // Cách 2: Lấy từ URL nếu không tìm thấy
    if (!chapterTitle) {
        let nameFromUrl = chapUrl.match(/chapter\/([^\/]+\.html)/i);
        if (nameFromUrl) chapterTitle = nameFromUrl[1].replace(".html", "");
        else chapterTitle = "Chương";
    }

    return Response.success("### " + chapterTitle + "\n\n" + text);
}