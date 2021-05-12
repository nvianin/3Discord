const wallMesh = new THREE.BoxGeometry(.2, .05, .2);
const doorMesh = null;
const windowMesh = null;

/* const meshes = [wallMesh, doorMesh, windowMesh]; */
const wallMat = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb
});
const wallMeshInstanced = new THREE.InstancedMesh(wallMesh, wallMat, 1024);
wallMeshInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
wallMeshInstanced.castShadow = true;
wallMeshInstanced.receiveShadow = true;


const walls = []
const wallMeshes = []
let lastWallId = 0;

class Wall {
    constructor(x, y, vert = 0, type = 0) {
        this.x = x;
        this.y = y;
        this.type = type; // 0 = wall, 1 = door, 2 = window
        this.vertical = vert;

        /* this.x = this.x - (this.x % (SETTINGS.grid_x / 100));
        this.y = this.y - (this.y % (SETTINGS.grid_y / 100)); */
        this.x = Math.round(this.x * 10) / 10
        this.y = Math.round(this.y * 10) / 10

        console.log("Created wall at " + this.x + "," + this.y)

        this.mesh = wallMeshInstanced;
        this.mesh.castShadow = true;
        this.id = lastWallId;
        lastWallId++;
        let matrix = new THREE.Matrix4();
        /* matrix.makeRotationFromEuler(new Euler(0, 0, 90)); */

        /* this.mesh = new THREE.Mesh(meshes[this.type], wallMat); */
        /* this.mesh.position.x = this.x;
        this.mesh.position.y = this.y; */
        /* this.mesh */
        if (!this.vertical) {
            matrix.makeRotationFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
            /* this.mesh.rotation.z = Math.PI / 2; */
        }
        matrix.setPosition(this.x, this.y, 0);
        this.mesh.setMatrixAt(this.id, matrix);

        walls.push(this);
        wallMeshes.push(this.mesh);
        scene.add(this.mesh)

        this.mesh.instanceMatrix.needsUpdate = true;

    }
}