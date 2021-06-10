let fuckingloader = new THREE.GLTFLoader();
/* let texLoader = new THREE.TextureLoader(); */

let portraitObject
fuckingloader.load(chrome.runtime.getURL('src/inject/assets/portrait.glb'), gltf => {
    gltf.scene.children[0].children[0].castShadow = true;
    gltf.scene.children[0].children[0].receiveShadow = true;
    gltf.scene.children[0].children[1].castShadow = true;
    gltf.scene.children[0].children[1].receiveShadow = true;

    portraitObject = gltf.scene.children[0];
    console.log(gltf.scene)
})

let thumbs_up = "👍";
let thumbs_down = "👎"
let victory = "✌️"

class Avatar {
    constructor(x = 0, y = 0, name, client = false) {
        /* this.dom = document.createElement("div");
        this.dom.classList.add("custom_video"); */
        this.name = name;
        /* this.dom.id = name */
        this.client = client;
        this.id = null;
        this.killed = false;
        this.video = null;

        this.object = portraitObject.clone()
        this.object.rotation.x = Math.PI / 2;
        this.object.rotation.y = -Math.PI / 2 - .2
        /* this.position.z = .1; */
        this.object.scale.set(.075, .075, .075);
        this.video_material = new THREE.MeshBasicMaterial();
        this.video_material.name = this.name + " video";
        this.object.children[1].material = this.video_material;

        this.animationIsPlaying = false;

        /* if (this.object.children[1].attributes) {
            this.object.pictureUV = this.object.children[1].attributes.uv2
            this.object.videoUV = this.object.children[1].attributes.uv;
        } else {
            this.attributesCallback = setInterval(() => {
                if (this.object.children[1].attributes) {
                    this.object.pictureUV = this.object.children[1].attributes.uv2
                    this.object.videoUV = this.object.children[1].attributes.uv;
                    clearInterval(this.attributesCallback)
                }
            }, 200)
        } */


        /* this.object.position.set(x, y, 0);
        this.object.name = this.name + " impostor" */

        this.profile_picture;

        let profilePics = fetchUsers();
        console.log(profilePics[this.name]);
        if (profilePics[this.name]) {
            console.log("FUCKING GOT PP")
            this.profile_picture = profilePics[this.name];
            //let picture = document.createElement('img');
            //picture.src = this.profile_picture;
            //this.dom.appendChild(picture);
            /* this.dom.style.backgroundImage = `url(${this.profile_picture})`; */
            let pp = texLoader.load(this.profile_picture);
            this.object.children[1].material = new THREE.MeshBasicMaterial({
                map: pp
            });
            /* this.object.children[1].geometry.attributes.uv = this.object.pictureUV */

            /* console.log(this.dom.style.backgroundImage) */
        } else {
            this.profilePicGetter = setInterval(() => {
                profilePics = fetchUsers()
                console.log("failed to get profile pic for " + this.name)
                console.log(profilePics)
                if (profilePics[this.name]) {
                    this.profile_picture = profilePics[this.name];
                    let pp = texLoader.load(this.profile_picture);
                    this.object.children[1].material = new THREE.MeshBasicMaterial({
                        map: pp
                    });
                    /* this.object.children[1].geometry.attributes.uv = this.object.pictureUV */
                    debugCube.material = this.object.children[1].material

                    /* this.dom.style.backgroundImage = `url(${this.profile_picture})`; */
                    clearInterval(this.profilePicGetter);
                }
            }, 1000);
        }


        if (scene) {
            scene.add(this.object);
        } else {
            this.sceneAddInterval = setInterval(() => {
                if (scene) {
                    scene.add(this.object);
                    clearInterval(this.sceneAddInterval);
                }
                console.log("trying add avatar to scene")
            }, 200)
        }

        this.position = new THREE.Vector3(x, y, 0.1);
        this.acceleration = new THREE.Vector3();

        if (stage) {
            /* stage.appendChild(this.dom); */
        } else {
            this.stageAppendingInterval = setInterval(() => {
                if (stage) {
                    /* stage.appendChild(this.dom); */
                    clearInterval(this.stageAppendingInterval);
                }
                console.log("trying append avatar")
            }, 200)
        }
        /*  if (client) {
             if (camera) {
                 camera.parent = this.object;
             } else {
                 this.cameraParentingInterval = setInterval(() => {
                     if (camera) {
                         camera.parent = this.object;
                         clearInterval(this.cameraParentingInterval);
                     }
                     console.log("trying camera parenting")
                 }, 200)
             }
         } */

        avatars.push(this);
    }

    addForce(force) {
        this.acceleration.add(force);
    }

    update() {
        this.position.add(this.acceleration);
        this.acceleration.multiplyScalar(.9);
        /* if (frameCount % 100 == 0) console.log(this.name) */


        if (this.client) {
            let fuckyou = new THREE.Vector3();
            try {
                camera.position.x = this.position.x;
                camera.position.y = this.position.y;
                camera.getWorldPosition(fuckyou);
            } catch {}
            /* console.log(this.object.position); */
        }
        this.object.position.copy(this.position);

        try {
            if (camera && false) {
                let screenspace_position = this.object.position.clone();
                screenspace_position.project(camera);

                screenspace_position.x = (screenspace_position.x * stage.offsetWidth / 2) + stage.offsetWidth / 2;
                screenspace_position.y = -(screenspace_position.y * stage.offsetHeight / 2) + stage.offsetHeight / 2;

                this.dom.style.left = screenspace_position.x + "px";
                this.dom.style.top = screenspace_position.y + "px";

                /* if (frameCount % 10 == 0) console.log(screenspace_position); */
            }

        } catch (e) {
            console.log(e)
        }

        if (this.video_texture) {
            /* let ctx = this.video_canvas.getContext('2d');
            ctx.fillStyle = "white"
            ctx.rect(0, 0, 10000, 10000);
            ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
            this.video_texture.needsUpdate = true; */
        }
    }

    kill() {
        console.log(this.name + " was killed with id " + this.id)
        /* this.object.geometry.dispose(); */
        this.object.children[1].material.dispose();
        scene.remove(this.object)
        console.log(this.dom);
        /* this.dom.parentNode.removeChild(this.dom) */

        this.killed = true;
    }

    initVideo() {
        console.log("trying to init video");
        /* try { */
        /* this.initVideo() */
        if (this.video && this.video.videoHeight != 0) {
            console.log("initting video");

            this.object.children[1].material = new THREE.MeshBasicMaterial({
                map: new THREE.VideoTexture(this.video)
            });
            /* this.object.children[1].geometry.attributes.uv = this.object.videoUV */
            /* this.object.children[1].material = new THREE.MeshBasicMaterial({
                color: 0xff0000
            }) */

            /* this.object.material.color = new THREE.Color(0xff00ff) */
            /* this.object.material = new THREE.MeshBasicMaterial({
                map: this.video_texture
            }); */

            /*                 scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
                                map: new THREE.VideoTexture(this.video)
                            }))) */

        } else {
            console.log("setting init video timeout");
            setTimeout(this.initVideo, 500);
        }
        /* } catch (e) {
            setTimeout(this.initVideo, 200);
            console.log(e);
        } */
    }
    emoji_animation(emoji) {
        let img
        switch (emoji) {
            case "thumbs_up":
                img = thumbs_up
                break;
            case "thumbs_down":
                img = thumbs_down
                break;
            case "victory":
                img = victory
                break;
        }
        if (img != undefined) {
            let div = document.createElement('div');
            div.classList.add("emoji_animation");
            div.innerText = img;
            div.style.zIndex = 10000
            div.style.position = "absolute"
            div.style.right = "100px"
            div.style.top = "100px"
            div.style.width = "20px"
            div.style.textAlign = "left"
            let div2 = div.cloneNode();
            div2.innerText = img;
            div2.style.textAlign = "right"
            div.style.transform = "scaleX(-1)"
            document.body.appendChild(div);
            document.body.appendChild(div2);
            setTimeout(() => {
                div.style.fontSize = "20pt"
                div2.style.fontSize = "20pt"
            }, 50)
            setTimeout(() => {
                div.style.fontSize = "0pt"
                div2.style.fontSize = "0pt"
            }, 2000)
            setTimeout(() => {
                clearInterval(this.updateLoop)
                document.body.removeChild(div);
                document.body.removeChild(div2);
            }, 3000)

            this.updateLoop = setInterval(() => {
                let screenspace_position = this.object.position.clone();
                camera.updateMatrixWorld()
                screenspace_position.project(camera);

                let x = (screenspace_position.x * stage.offsetWidth / 2) + stage.offsetWidth / 2 + stage.offsetLeft + 70;
                let y = -(screenspace_position.y * stage.offsetHeight / 2) + stage.offsetHeight / 2;

                div.style.left = x - 35 + "px"
                div.style.top = y + "px"

                div2.style.left = x + 35 + "px";
                div2.style.top = y + "px"

                /* console.log(div.style.right, div.style.top) */
            }, 50)

        } else {
            console.error("  " + emoji + " is not a valid emoji.")
        }
    }
}

window.addEventListener('click', () => {
    avatar.emoji_animation("victory")
})