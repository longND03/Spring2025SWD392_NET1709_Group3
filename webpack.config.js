const path = require('path');

module.exports = {
    // ... các cấu hình khác ...
    resolve: {
        fallback: {
            "zlib": require.resolve("browserify-zlib"),
            "stream": require.resolve("stream-browserify"),
            "url": require.resolve("url/"),
            "path": require.resolve("path-browserify"),
            "assert": require.resolve("assert/"),
            "util": require.resolve("util/"),
            "crypto": require.resolve("crypto-browserify"),
            "process": require.resolve("process/browser"),
            "os": require.resolve("os-browserify/browser"),
        }
    },
    // ... các cấu hình khác ...
}; 