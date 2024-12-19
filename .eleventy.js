module.exports = function(eleventyConfig) {
    // File extensions to passthrough copy
    eleventyConfig.setTemplateFormats([
        "png",
        "jpg",
        "jpeg",
        "mp4",
        "gif",
        "svg",
        "ico",
        "css",
        "js",
        "html",

        "njk",

        "webmanifest",
        "xml",
        "txt"
    ]);
    // eleventyConfig.addPassthroughCopy("src/scripts");
    eleventyConfig.addPassthroughCopy("src/CNAME");

};