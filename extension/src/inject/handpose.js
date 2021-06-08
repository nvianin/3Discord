const tf = require("@tensorflow/tfjs-core");
const tf_backend = require("@tensorflow/tfjs-backend-webgl");
const handpose = require("@tensorflow-models/handpose");
const {
    drawHand
} = require("./utilities")
const fp = require("fingerpose");

let video = document.createElement('video')
video.autoplay = true;
video.id = "self_webcam"

document.body.appendChild(video);

video.style.right = 1000000 + "px"

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

class HandPoseEstimator {
    constructor() {

        const runHandpose = async () => {
            const net = await handpose.load();
            // console.log("Handpose model loaded.");
            //  Loop and detect hands
            setInterval(() => {
                detect(net);
            }, 100);
        };

        const detect = async (net) => {


            // Make Detections
            const hand = await net.estimateHands(video);
            // console.log(hand);

            if (hand.length > 0) {
                const GE = new fp.GestureEstimator([
                    fp.Gestures.VictoryGesture,
                    fp.Gestures.ThumbsUpGesture,
                    // fp.Gestures.RaisedHandGesture,
                ]);

                const gesture = await GE.estimate(hand[0].landmarks, 8);
                // console.log(gesture);
                if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
                    const confidence = gesture.gestures.map(
                        (prediction) => prediction.confidence
                    );
                    const maxConfidence = confidence.indexOf(
                        Math.max.apply(null, confidence)
                    );
                    /* setEmoji(gesture.gestures[maxConfidence].name); */
                    /* console.log(gesture.gestures) */
                    for (g of gesture.gestures) {
                        console.log(g)
                    }
                    /* console.log(emoji); */
                }
            }

            // Draw mesh
            const ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
            drawHand(hand, ctx);

        };

        runHandpose();
        let loaded = false;
    }

}