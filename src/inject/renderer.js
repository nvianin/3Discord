if (stage) {
    onstage()
} else {
    let findStage = setInterval(() => {
        if (stage) {
            clearInterval(findStage)
            console.log("found stage from renderer")
            onstage()
        }
    }, 200)
}

let scene, camera, renderer;
let ground;

const onstage = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, stage.offsetWidth / stage.offsetHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(stage.offsetWidth, stage.offsetHeight);
    stage.appendChild(renderer.domElement);
    renderer.domElement.classList.add("renderer")

    console.log("###########################")
    console.log("3D BACKGROUND INITIALIZED")
    console.log("###########################")

    ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({
        color: 0x0000ff
    }));

    camera.position.z = 1
    camera.lookAt(ground.position)
    scene.add(ground);
}