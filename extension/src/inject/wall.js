const wallMesh = null;
const doorMesh = null;
const windowMesh = null;

const meshes = [wallMesh, doorMesh, windowMesh];
const wallMat = null;

const walls = {}

class Wall {
    constructor(x, y, type = 0) {
        this.x = x;
        this.y = y;
        this.type = type; // 0 = wall, 1 = door, 2 = window

        this.mesh = new THREE.Mesh(meshes[this.type], wallMat);
        this.id = null;
    }
}