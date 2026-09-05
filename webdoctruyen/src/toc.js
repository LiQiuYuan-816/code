load('config.js');

function execute() {
    try {
        let pageUrl = arguments[0] || "";
        if (!pageUrl) return Response.error("⚠️ Không có link truyện");

        let res = fetch(pageUrl);
        if (!res.ok) return Response.error("⚠️ Không tải được trang: " + res.status);

        let html = res.text().toString(); // Dùng .text() đảm bảo tương thích

        // === TÊN TRUYỆN ===
        let name = "Truyện";
        let nameMatch = html.match(/class=["']novel-title["'][^>]*>([\s\S]*?)<\/h1>/i);
        if (nameMatch) {
            name = nameMatch[1].replace(/<[^>]+>/g, "").trim() || "Truyện";
        }

        // === BASE URL ===
        // VD: https://liqiuyuan-816.github.io/web-doc-truyen/stories/ten-truyen/
        let baseUrl = pageUrl.substring(0, pageUrl.lastIndexOf("/") + 1);

        // === LẤY DANH SÁCH CHƯƠNG ===
        // Khớp đúng dạng: <li><a href="chapter/ten.html">Tên chương</a></li>
        let chapters = [];
        let liPattern = /<li>\s*<a\s+href=["'](chapter\/[^"']+\.html)["']>([\s\S]*?)<\/a>\s*<\/li>/gi;
        let liMatch;

        while ((liMatch = liPattern.exec(html)) !== null) {
            let chapHref = liMatch[1];
            let chapTitle = liMatch[2].replace(/<[^>]+>/g, "").trim();

            // Bỏ các link điều hướng không phải chương
            if (chapTitle && !/Trước|Sau|Mục lục|Trang chủ|Tiếp theo/i.test(chapTitle)) {
                let chapUrl = baseUrl + chapHref;
                chapters.push({
                    name: chapTitle,
                    url: chapUrl
                });
            }
        }

        // Kiểm tra kết quả
        if (chapters.length === 0) {
            return Response.error("⚠️ Không tìm thấy danh sách chương dạng chapter/*.html");
        }

        return Response.success({
            name: name,
            baseUrl: baseUrl,
            totalChapters: chapters.length,
            chapters: chapters
        });

    } catch (err) {
        return Response.error("⚠️ Lỗi xử lý: " + err.message);
    }
}