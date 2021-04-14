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

    ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), groundMat);

    camera.position.z = 1
    camera.lookAt(ground.position)
    scene.add(ground);
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
            gl_FragColor = vec4(mix(gridColor, vec3(1. - grid), (mouseGradient)), 1.);
            //gl_FragColor = vec4(mouseGradient);
        } else {
            gl_FragColor = vec4(vec3(1.-grid), 1.);
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
    fragmentShader: groundFS
})

const raycaster = new THREE.Raycaster();
const normalized_mouse = new THREE.Vector2();

window.onmousemove = e => {
    normalized_mouse.x = (e.clientX / stage.offsetWidth) * 2 - 1;
    normalized_mouse.y = (e.clientY / stage.offsetHeight) * 2 - 1;

}