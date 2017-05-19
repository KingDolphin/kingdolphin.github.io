class Material {
    constructor(á, u0, x, y, z) {
        this.á = á;
        this.u = u0;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    heat(u) {
        this.u += u;
    }
    getThermalDiffusivity() {
        return this.á;
    }
    getU() {
        return this.u;
    }
    print() {
        console.log("Material : " + this.u + ", " + this.á);
    }
};

class Heater extends Material {
    constructor(u0, x, y, z) {
        super(1, u0, x, y, z);
    }
    heat(u) {
    }
    print() {
        console.log("Heater : " + this.u + ", " + this.á);
    }
}
