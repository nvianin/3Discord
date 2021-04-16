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
let ground, groundShadingMat, groundShadingPlane;
let ambientLight, light, hemi, rectLight, sun;
const normalized_mouse = new THREE.Vector2();

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

    ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), groundMat);
    groundShadingPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), groundShadingMat)
    groundShadingPlane.position.z = -.01;

    ambientLight = new THREE.AmbientLight(0x404040);
    /* hemi = new THREE.HemisphereLight(0xffffbb, 0x080820, 1) */
    scene.add(ambientLight);
    /* scene.add(hemi); */
    rectLight = new THREE.RectAreaLight(0xffffff, 5, 5, 5);
    rectLight.position.z = 5;
    scene.add(rectLight);
    sun = new THREE.DirectionalLight(0xffffff, .5);
    scene.add(sun)

    camera.position.z = 1
    camera.lookAt(ground.position)
    scene.add(ground);
    scene.add(groundShadingPlane)
}

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
        vec2 mouse = vec2(mousePos.x - .5, 1. - mousePos.y - 1.);

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

const raycaster = new THREE.Raycaster();