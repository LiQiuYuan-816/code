load('config.js');
function execute() {
    return Response.success([{
        title: "Danh mục truyện",
        input: BASE_URL + "index.html",
        script: "homelist.js"
    }]);
}