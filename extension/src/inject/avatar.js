class Avatar {
    constructor(x = 0, y = 0, name, client = false) {
        this.dom = document.createElement("div");
        this.dom.classList.add("custom_video");
        this.name = name;
        this.dom.id = name
        this.client = client;

        this.object = new THREE.Mesh(new THREE.BoxGeometry, new THREE.MeshBasicMaterial({
            color: 0xffff00
        }))
        this.object.scale.set(.01, .01, .01);
        this.object.position.set(x, y, 0);
        this.object.name = this.name + " impostor"

        this.profile_picture;

        let profilePics = fetchUsers();
        console.log(profilePics[this.name]);
        if (profilePics[this.name]) {
            this.profile_picture = profilePics[this.name];
            /* let picture = document.createElement('img');
            picture.src = this.profile_picture;
            this.dom.appendChild(picture); */
            this.dom.style.backgroundImage = `url(${this.profile_picture})`;
            console.log(this.dom.style.backgroundImage)
        } else {
            this.profilePicGetter = setInterval(() => {
                profilePics = fetchUsers()
                console.log("failed to get profile pic for " + this.name)
                console.log(profilePics)
                if (profilePics[this.name]) {
                    this.profile_picture = profilePics[this.name];
                    this.dom.style.backgroundImage = `url(${this.profile_picture})`;
                    clearInterval(this.profilePicGetter);
                }
            }, 200);
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

        this.position = new THREE.Vector3(x, y, 0);
        this.acceleration = new THREE.Vector3();

        if (stage) {
            stage.appendChild(this.dom);
        } else {
            this.stageAppendingInterval = setInterval(() => {
                if (stage) {
                    stage.appendChild(this.dom);
                    clearInterval(this.stageAppendingInterval);
                }
                console.log("trying append avatar")
            })
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
        /*         console.log(this.object.position) */


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
            if (camera) {
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
    }

    kill() {
        this.object.geometry.dispose();
        this.object.material.dispose();
        scene.remove(this.object)
        this.dom.parentNode.removeChild(this.dom);

        this.killed = true;
    }
}