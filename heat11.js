var temp = [];
var w = 50;
var cw = 5;
var dt = 1;

var enviroTempRig = 0;
var enviroTempLef = 0;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

var hx = 40;
var houseTemp = 90;
var outsideTemp = 0;
for (var x = 0; x < hx; x++) {
    temp[x] = new Material(1.9e-1, outsideTemp, x);
}
temp[hx] = new Material(1.9e-5, houseTemp, x);
for (var x = hx+1; x < w; x++) {
    temp[x] = new Material(1.9e-1, houseTemp, x);
}

visualize();

setInterval(function() {
    step();

    visualize();
}, 100);

function step() {
    var ut = [];
    for (var x = 0; x < w; x++) {
        var á = temp[x].getThermalDiffusivity();
        var u = getTemp(x);
        var u1 = getTemp(x-1);
        var u2 = getTemp(x+1);
        var conduction = (u1 + u2) / 2.0 - u;
        ut[x] = á * conduction;
    }

    for (var x = 0; x < w; x++) {
        temp[x].heat(ut[x] * dt);
    }
}

var useOutsideTemp = false;

function getTemp(x) {
    if (x >= w)
        return useOutsideTemp ? enviroTempRig : getTemp(w-1);
    if (x < 0)
        return useOutsideTemp ? enviroTempLef : getTemp(0);
    return temp[x].getU();
}

function visualize() {
    ctx.lineWidth = 0;
    for (var x = 0; x < w; x++) {
        ctx.fillStyle = getColor(temp[x].getU());
        ctx.fillRect(x*cw, 0, cw, canvas.height);
    }
}

function print() {
    for (var x = 0; x < w; x++)
        console.log(dtemp[x]);
}

function getColor(temp) {
    var value = Math.min(temp/100, 2);
    var h = (1.0 - Math.min(value, 1)) *  250;
    var l = value*50;
    return "hsl(" + h + ", 100%, " + l + "%)";
}
