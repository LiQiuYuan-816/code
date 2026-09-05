load('config.js');

function execute(url) {
    try {
        let res = fetch(url);
        if (!res.ok) return Response.error("Lỗi tải trang: " + res.status);
        
        let doc = res.html();
        if (!doc) return Response.error("Không phân tích được HTML");

        // === BASE URL ===
        let baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
        let chapters = [];

        // ✅ Selector ĐÚNG chuẩn JSoup — KHÔNG có dấu ngoặc kép
        let links = doc.select("ul li a[href^=chapter/]");

        // Nếu không tìm thấy → thử selector rộng hơn
        if (links.size() === 0) {
            links = doc.select("a[href^=chapter/]");
        }

        // === Duyệt & Lọc ===
        for (let i = 0; i < links.size(); i++) {
            let a = links.get(i);
            let href = a.attr("href");
            let title = a.text().trim();

            if (href 
                && href.endsWith(".html")
                && title
                && !/Trước|Sau|Mục lục|Trang chủ|Tiếp theo/i.test(title)) {
                
                chapters.push({
                    name: title,
                    url: baseUrl + href
                });
            }
        }

        // === ✅ TRẢ VỀ ĐÚNG ĐỊNH DẠNG VBOOK ===
        if (chapters.length === 0) {
            return Response.error("Không tìm thấy chương nào");
        }
        
        // ⚠️ CHỈ trả về mảng trực tiếp — KHÔNG bọc thêm đối tượng!
        return Response.success(chapters);

    } catch (err) {
        return Response.error("Lỗi: " + err.message);
    }
}