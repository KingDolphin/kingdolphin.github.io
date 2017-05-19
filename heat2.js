var temp = [];
var dtemp = [];
var conductions = [];
var w = 50, h = 50;
var cw = 5, ch = 5;
var dt = 1;

var enviroTempTop = 0;
var enviroTempBot = 0;
var enviroTempRig = 0;
var enviroTempLef = 0;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.insertBefore(canvas, document.body.childNodes[0]);
var ctx = canvas.getContext('2d');

for (var x = 0; x < w; x++) {
    temp[x] = [];
    dtemp[x] = [];
    conductions[x] = [];
    for (var y = 0; y < h; y++) {
        temp[x][y] = Math.random()*150;
        dtemp[x][y] = 0;
        conductions[x][y] = 0;
    }
}

visualize();

setInterval(function() {
    step();

    visualize();
}, 50);

function step() {
    var newDtemp = [];
    for (var x = 0; x < w; x++) {
        newDtemp[x] = [];
        for (var y = 0; y < h; y++) {
            var á = 1.9e-1;
            var u = temp[x][y];
            var u1 = (x - 1 >= 0 ? temp[x-1][y] : enviroTempLef);
            var u2 = (x + 1 <  w ? temp[x+1][y] : enviroTempRig);
            var u3 = (y - 1 >= 0 ? temp[x][y-1] : enviroTempTop);
            var u4 = (y + 1 <  h ? temp[x][y+1] : enviroTempBot);
            conductions[x][y] = (u1 + u2 + u3 + u4) / 4 - u;
            newDtemp[x][y] = á * (conductions[x][y]);
        }
    }

    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            dtemp[x][y] = newDtemp[x][y];
            temp[x][y] += dtemp[x][y] * dt;
        }
    }
}

function visualize() {
    ctx.lineWidth = 0;
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            ctx.fillStyle = getColor(temp[x][y]);
            ctx.fillRect(x*cw, y*ch, cw, ch);
        }
    }
}

function getColor(temp) {
    var value = Math.max(Math.min(temp/100, 2), 0);
    var h = (1.0 - Math.min(value, 1)) *  250;
    var l = value*50;
    return "hsl(" + h + ", 100%, " + l + "%)";
}
