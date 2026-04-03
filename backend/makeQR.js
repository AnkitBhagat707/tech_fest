const QRCode = require("qrcode");

const url = "http://172.20.10.10:8000"; 

QRCode.toFile("demoQR.png", url, function (err) {
    if (err) throw err;
    console.log("QR Code generated");
});