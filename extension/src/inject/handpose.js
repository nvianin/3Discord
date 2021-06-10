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
video.style.userSelect = "none"
video.style.pointerEvents = "none"
video.zIndex = -100000;
document.body.appendChild(video);

video.style.right = 1 /* 000000 */ + "px"

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({
            video: true
        })
        .then(stream => {
            video.srcObject = stream
            console.info("CAMERA INITIALIZED")
            handposeEstimator = new HandPoseEstimator();
        })
        .catch(err => {
            console.error(err);
        })
} else {
    console.error("Camera intialization failed !")
}

class HandPoseEstimator {
    constructor() {

        this.active = true;

        this.onThumbsDown = () => {
            console.log("Thumbs DOWN")
            avatar.emoji_animation('thumbs_down')
            socket.emit('emoji_trigger', "thumbs_down");
        }
        this.onThumbsUp = () => {
            console.log("Thumbs UP")
            avatar.emoji_animation('thumbs_up')
            socket.emit('emoji_trigger', "thumbs_up");
        }
        this.onVictory = () => {
            console.log("Victory")
            avatar.emoji_animation('victory')
            socket.emit('emoji_trigger', "victory");
        }

        const runHandpose = async () => {
            const net = await handpose.load();
            // console.log("Handpose model loaded.");
            //  Loop and detect hands
            setInterval(() => {
                if (this.active) {
                    detect(net);
                }
            }, 1000);
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

                    switch (gesture.gestures[0].name) {
                        case "victory":
                            this.onVictory();
                            break;
                        case "thumbs_up":
                            if (gesture.poseData[0][2].toLowerCase().includes("up")) {
                                this.onThumbsUp();
                            } else if (gesture.poseData[0][2].toLowerCase().includes("down")) {
                                this.onThumbsDown();
                            }
                            break;
                    }

                    /* setEmoji(gesture.gestures[maxConfidence].name); */
                    /* console.log(gesture.gestures) */
                    /* for (let g of gesture.gestures) {
                        console.log(g)
                    } */
                    /* console.log(emoji); */
                }
            }

            // Draw mesh
            /* const ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
            drawHand(hand, ctx); */

        };

        runHandpose();
        let loaded = false;
    }

}