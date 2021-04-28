const wallMesh = new THREE.BoxGeometry(.2, .05, .2);
const doorMesh = null;
const windowMesh = null;

const meshes = [wallMesh, doorMesh, windowMesh];
const wallMat = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb
});

const walls = []
const wallMeshes = []

class Wall {
    constructor(x, y, vert = 0, type = 0) {
        this.x = x;
        this.y = y;
        this.type = type; // 0 = wall, 1 = door, 2 = window
        this.vertical = vert;

        this.mesh = new THREE.Mesh(meshes[this.type], wallMat);
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        if (!this.vertical) {
            this.mesh.rotation.z = Math.PI / 2;
        }
        this.id = null;

        walls.push(this);
        wallMeshes.push(this.mesh);
        scene.add(this.mesh)
    }
}