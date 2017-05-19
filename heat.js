var temp = [];
var dtemp = [];
var conductions = [];
var w = 50;
var cw = 5;
var dt = 1;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');

for (var x = 0; x < w; x++) {
    temp[x] = 0;//Math.random()*100;
    dtemp[x] = 0;
    conductions[x] = 0;
}

temp[w/2] = 500;

visualize();
// print();
//
// step();
// print();
setInterval(function() {
    step();

    visualize();
    // console.log("ASD");
}, 100);

function step() {
    for (var x = 0; x < w; x++) {
        var á = 1.9e-1;
        var u = temp[x];
        var u1 = (x - 1 >= 0 ? temp[x-1] : 0);
        var u2 = (x + 1 <  w ? temp[x+1] : 0);
        conductions[x] = (u1 + u2) / 2 - u;
        dtemp[x] = á * (conductions[x]);
    }

    for (var x = 0; x < w; x++) {
        temp[x] += dtemp[x] * dt;
    }
}

function visualize() {
    ctx.lineWidth = 0;
    for (var x = 0; x < w; x++) {
        ctx.fillStyle = getColor(temp[x]);
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
