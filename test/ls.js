var hsi = require("../app.js").hsi;

hsi.ls('isos', function(err, files) {
    console.log(err);
    console.dir(files);
});

