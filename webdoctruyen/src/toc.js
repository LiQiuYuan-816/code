load('config.js');

function execute(url) {
    let res = fetch(url);
    if (!res.ok) return Response.error("Lỗi tải mục lục: " + res.status);
    let doc = res.html();

    let name = "";
    try {
        let h1 = doc.querySelector("h1");
        if (h1) name = h1.textContent || "";
    } catch(e) {}
    if (!name) {
        try {
            let nt = doc.querySelector(".novel-title");
            if (nt) name = nt.textContent || "";
        } catch(e) {}
    }
    name = name.trim() || "Truyện";

    let chapters = [];
    try {
        let links = doc.querySelectorAll("section li a");
        if (links && links.length > 0) {
            for (let i = 0; i < links.length; i++) {
                let a = links[i];
                let href = a.getAttribute("href") || "";
                let title = (a.textContent || "").trim();
                if (href && title) {
                    chapters.push({
                        name: title,
                        url: new URL(href, url).href
                    });
                }
            }
        }
    } catch(e) {}

    return Response.success({ name: name, chapters: chapters });
}