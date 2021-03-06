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

window.devicePixelRatio = 1;

const texLoader = new THREE.TextureLoader();
let ground_tex
texLoader.load(chrome.runtime.getURL('src/inject/assets/ground_tex.png'), texture => {
    console.log("TEXTURE LOADED");
    ground_tex = texture;
    ground_tex.repeat.x = 1000
    ground_tex.repeat.y = 1000
    ground_tex.wrapS = THREE.RepeatWrapping;
    ground_tex.wrapT = THREE.RepeatWrapping;
    console.log(ground_tex);
});
let wall_tex
texLoader.load(chrome.runtime.getURL('src/inject/assets/wall_tex.png'), texture => {
    console.log("TEXTURE LOADED");
    wall_tex = texture;
    wall_tex.repeat.x = 1
    wall_tex.repeat.y = 1
    wall_tex.wrapS = THREE.RepeatWrapping;
    wall_tex.wrapT = THREE.RepeatWrapping;
    console.log(wall_tex);
});

let scene, camera, renderer, composer;
let ground, groundShadingMat, groundShadingPlane;
/* let radio; */
let ambientLight, light, hemi, rectLight, sun;

const loader = new THREE.GLTFLoader();

let normalized_mouse = new THREE.Vector2();

const vertexShader = `
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `

const groundFS = `uniform vec3 colorA; 
      uniform vec3 colorB;
      uniform vec2 mousePos;
      uniform bool isEditingGround;
      varying vec3 vUv;

      float gridMake(vec3 uv, float res, float thick){
          return clamp(step((fract(uv.x * res + (thick / 2.))), thick) + step((fract(uv.y * res + (thick / 2.))), thick), 0., 1.);
      }

      void main() {
        //gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
        //vec2 mouse = vec2(mousePos.x - 1., 1. - mousePos.y - 1.);
        vec2 mouse = vec2(mousePos.x, mousePos.y);

        float res = 5.;
        //float grid = step((fract(vUv.x*res)), .0275) + step((fract(vUv.y*res)), .0275);
        float grid = gridMake(vUv, 5., .0275);
        grid = clamp(grid, 0.,1.);
        float width = .0725;
        //float construction_grid = step((fract(vUv.x*res+(width/2.))), width) + step((fract(vUv.y*res+(width/2.))), width);
        float construction_grid = gridMake(vUv, 5., .0725);

        vec3 gridColor = mix(vec3(0.), vec3(.95), 1.-grid);
        gridColor = mix(vec3(1.), vec3(1, 0.521, 0.039), construction_grid);

        float mouseGradient = distance (vUv.xy,mouse)*10.;
        if (isEditingGround){
            vec3 color = mix(gridColor, vec3(1. - grid), (mouseGradient));
            gl_FragColor = vec4(color, 1.-(color.x+color.y+color.z)/3.);
            //gl_FragColor = vec4(mouseGradient);
        } else {
            gl_FragColor = vec4(vec3(1.-grid), grid);
        }
      }`

const groundMat = new THREE.ShaderMaterial({
    uniforms: {
        mousePos: {
            value: new THREE.Vector2()
        },
        isEditingGround: {
            value: true
        }
    },
    vertexShader: vertexShader,
    fragmentShader: groundFS,
    transparent: true
})
groundShadingMat = new THREE.MeshStandardMaterial({
    color: "#ffffff"
});

let debugCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
    color: 0xff00aa
}));
debugCube.scale.set(.01, .01, .01)

let shadowRes = 2048;

let env_3d;

let fxaa, SAO, copyPass, renderPass;

setInterval(() => {
    try {
        if (stage.offsetHeight != document.getElementsByClassName("chat-3bRxxu")[0].offsetHeight ||
            stage.offsetWidth != document.getElementsByClassName("chat-3bRxxu")[0].offsetWidth) {
            stage.style.width = document.getElementsByClassName("chat-3bRxxu")[0].offsetWidth + "px"
            stage.style.height = document.getElementsByClassName("chat-3bRxxu")[0].offsetHeight + "px"
        }
    } catch (e) {
        console.log(e)
    }
}, 1000)

window.addEventListener('resize', () => {

    camera.aspect = stage.offsetWidth / stage.offsetHeight;
    camera.updateProjectionMatrix()

    renderer.setSize(stage.offsetWidth, stage.offsetHeight)
    composer.setSize(stage.offsetWidth, stage.offsetHeight)

    renderer.setPixelRatio(window.devicePixelRatio)
    composer.setPixelRatio(window.devicePixelRatio)

    const pixelRatio = renderer.getPixelRatio();
    fxaa.material.uniforms['resolution'].value.x = 1 / (stage.offsetWidth * pixelRatio)
    fxaa.material.uniforms['resolution'].value.y = 1 / (stage.offsetHeight * pixelRatio)

    SAO.setSize(stage.offsetWidth, stage.offsetHeight)
    copyPass.setSize(stage.offsetWidth, stage.offsetHeight)
    renderPass.setSize(stage.offsetWidth, stage.offsetHeight)
    fxaa.setSize(stage.offsetWidth, stage.offsetHeight)

    console.log("HAHAHAHAHA")
})

const onstage = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, stage.offsetWidth / stage.offsetHeight, 0.1, 1000);


    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(stage.offsetWidth, stage.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.logarithmicDepthBuffer = false;
    stage.appendChild(renderer.domElement);
    renderer.domElement.classList.add("renderer")

    composer = new THREE.EffectComposer(renderer);
    composer.setPixelRatio(window.devicePixelRatio)

    renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    SAO = new THREE.SAOPass(scene, camera, false, true);
    SAO.setSize(stage.offsetWidth, stage.offsetHeight);
    /* SAO.params.saoBlurRadius = 16;
    SAO.params.saoIntensity = .0023
    SAO.params.saoKernelRadius = 100;
    SAO.params.saoScale = 3; */

    SAO.params.saoBlurRadius = 16;
    SAO.params.saoIntensity = .0008
    SAO.params.saoKernelRadius = 50;
    SAO.params.saoBlurStdDev = 5;
    SAO.params.saoScale = 1;

    composer.addPass(SAO);

    fxaa = new THREE.ShaderPass(THREE.FXAAShader);
    copyPass = new THREE.ShaderPass(THREE.CopyShader);

    composer.addPass(copyPass)

    const pixelRatio = renderer.getPixelRatio();

    fxaa.material.uniforms['resolution'].value.x = 1 / (stage.offsetWidth * pixelRatio)
    fxaa.material.uniforms['resolution'].value.y = 1 / (stage.offsetHeight * pixelRatio)

    composer.addPass(fxaa)

    console.log("###########################")
    console.log("3D BACKGROUND INITIALIZED")
    console.log("###########################")

    ground = new THREE.Mesh(new THREE.PlaneGeometry(SETTINGS.grid_x, SETTINGS.grid_y, 1, 1), groundMat);
    groundShadingPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), groundShadingMat)
    groundShadingPlane.position.z = -.01;
    groundShadingPlane.receiveShadow = true;
    scene.add(groundShadingPlane);

    ambientLight = new THREE.AmbientLight(0xedf6ff, .6);
    ambientLight.castShadow = false;
    hemi = new THREE.HemisphereLight(0xffffbb, 0x080820, .3)
    hemi.castShadow = false;
    scene.add(ambientLight);
    scene.add(hemi);
    /* rectLight = new THREE.RectAreaLight(0xffffff, 5, 5, 5);
    rectLight.position.z = 5; */
    /* rectLight.castShadow = true; */
    /* scene.add(rectLight); */
    sun = new THREE.DirectionalLight(0xffffff, 1.);
    sun.position.set(2, 10, 10);
    sun.intensity = .5
    sun.shadow.normalBias = .01;
    sun.target = ground;
    sun.castShadow = true;

    sun.shadow.mapSize.set(1024, 1024)

    sun.shadow.mapSize.width = shadowRes;
    sun.shadow.mapSize.height = shadowRes;
    scene.add(sun)

    camera.position.z = 1
    camera.lookAt(ground.position)
    /* scene.add(ground); */

    /* scene.add(debugCube); */
    let url = chrome.runtime.getURL("src/inject/assets/Coop_Space_3.glb");
    console.log(url)

    /* loader.load(chrome.runtime.getURL("src/inject/assets/radio.glb"), gltf => {
        radio = gltf.scene;
        console.log(radio)

        radio.scale.set(.1, .1, .1)

        scene.add(radio)
    }) */



    loader.load(url, gltf => {
        for (var i = 0; i < 5; i++) {
            console.log("FUCKKKKK " + i)
        }
        let sc = .135;
        gltf.scene.scale.set(sc, sc, sc)
        gltf.scene.rotation.x = Math.PI / 2;
        gltf.scene.rotation.y = -Math.PI / 2
        scene.add(gltf.scene);

        radio = []

        for (let c of gltf.scene.getObjectByName("radio").children) {
            radio.push(c)
        }

        let materials = getMats()
        for (mat of materials) {
            /* console.log(mat); */
            switch (mat.name) {
                case "ground.001":
                    mat.map = ground_tex;
                    console.log(mat.map);
                    break;
                case "wall.001":
                    mat.map = wall_tex;
                    console.log(mat.map);
                    break;
            }
        }

        activateShadows(scene);

        console.log(gltf)
    }, error => {
        console.log(error)
    })
}

function activateShadows(object) {

    object.castShadow = true;
    object.receiveShadow = true;

    for (child of object.children) {
        activateShadows(child);
    }
}

const raycaster = new THREE.Raycaster();

function getMats() {
    const materials = new Set();

    scene.traverse(function (object) {

        if (object.material) materials.add(object.material);

    });
    return materials;
}