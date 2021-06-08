const tf = require("@tensorflow/tfjs-core");
const tf_backend = require("@tensorflow/tfjs-backend-webgl");
const handpose = require("@tensorflow-models/handpose");
const {
    drawHand
} = require("./utilities")
const fp = require("fingerpose");

let v = document.createElement('video')
v.autoplay = true;
v.id = "self_webcam"

document.body.appendChild(v);

v.style.right = 1000000 + "px"

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
            video: true
        })
        .then(stream => {
            vid.srcObject = stream
        })
        .catch(err => {
            console.log(err);
        })
}

class HandposeEstimator {
    constructor() {



    }
}