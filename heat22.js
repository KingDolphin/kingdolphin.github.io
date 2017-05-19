// 2D grid for materials
var u = [];

// Width & height of grid
var w = 50, h = 50;

// Delta-time, the shorter the slower and the more accurate
var dt = 1;

// Temperature of borders
var enviroTempTop = 0;
var enviroTempBot = 0;
var enviroTempRig = 0;
var enviroTempLef = 0;

// Use above temperatures or clamp temperatures
var useOutsideTemp = true;

// 0 or 1 for different temperature displays
var displayType = 1;

// Load canvas to draw stuff
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.insertBefore(canvas, document.body.childNodes[0]);
var ctx = canvas.getContext('2d');
canvas.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', resize, false);
var tempText = document.getElementById("temp");
var matText = document.getElementById("mat");

// Draw width & height of each cell
var cs = Math.min(canvas.width/w, (canvas.height*0.82)/h);
var cw = cs, ch = cs;

// Mouse position
var mx = -1, my = -1;

var interval;

start();

function start() {
    // Load air into grid (á = 1.9e-1)
    for (var x = 0; x < w; x++) {
        u[x] = [];
        for (var y = 0; y < h; y++)
            u[x][y] = new Material(1.9e-1, 0, x, y);
    }

    //
    // Random
    //
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++)
            u[x][y] = new Material(1.9e-1 * Math.random() + 1.9e-5, Math.random()*150, x, y);
    }

    //
    // Heater
    //
    // for (var x = 0; x < w; x++) {
    //     for (var y = 0; y < h; y++)
    //         u[x][y] = new Material(1.9e-1, 0, x, y);
    // }
    // u[w/2][h/2] = new Heater(200, w/2, h/2);

    //
    // House w/ Heater
    //
    // var hx = 20, hy = 20, hw = 10, hh = 10;
    // var houseTemp = 50;
    // var outsideTemp = 0;
    // for (var x = hx; x <= hx+hw; x++) {
    //     for (var y = hy; y <= hy+hh; y++) {
    //         if ((x === hx+hw || x === hx) && y <= hy+hh && y >= hy)
    //             u[x][y] = new Material(1.9e-5, houseTemp, x, y);
    //         else if ((y === hy+hh || y === hy) && x <= hx+hw && x >= hx)
    //             u[x][y] = new Material(1.9e-5, houseTemp, x, y);
    //         else if (x < hx+hw && x > hx && y < hy+hh && y > hy)
    //             u[x][y] = new Material(1.9e-1, 80, x, y);
    //     }
    // }
    // u[21][21] = new Heater(90, 21, 21);

    visualize();

    var time = 0;
    var frames = 0;

    clearInterval(interval);
    interval = setInterval(function() {
        time += dt;
        frames++;
        step();
        visualize();
    }, 50);
}


function step() {
    // Calculate the du/dt of each cell in the grid
    // and store the value into the 2D array 'ut'
    ut = [];
    for (var x = 0; x < w; x++) {
        ut[x] = [];
        for (var y = 0; y < h; y++)
            ut[x][y] = getUt(x, y);
    }

    // Heat each cell by the du/dt using Euler's
    // method which uses a linear approximation
    // of the actual value
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++)
            u[x][y].heat(ut[x][y] * dt);
    }

    // Update info box for temperature at mouse
    if (mx >= 0 && mx < w && my >= 0 && my < h) {
        var u0 = getTemp(mx, my);
        var á = u[mx][my].getThermalDiffusivity();
        tempText.innerHTML = "Temperature at Cursor: " + u0;
        matText.innerHTML = "Thermal diffusity at Cursor: " + á;
    }
}

function getUt(x, y) {
    // Store this heat and thermal diffusity
    var u0 = getTemp(x,y);
    var á = u[x][y].getThermalDiffusivity();

    // Sample surrounding heat
    var u1 = getTemp(x-1,y), á1 = getThermalDiffusivity(x-1,y);
    var u2 = getTemp(x+1,y), á2 = getThermalDiffusivity(x+1,y);
    var u3 = getTemp(x,y-1), á3 = getThermalDiffusivity(x,y-1);
    var u4 = getTemp(x,y+1), á4 = getThermalDiffusivity(x,y+1);

    // Calculate ratio of surrounding thermal diffusities
    var r1 = á1 / á;
    var r2 = á2 / á;
    var r3 = á3 / á;
    var r4 = á4 / á;

    // Calculate conduction (sum of surrounding heats - current heat)
    var conduction = (u1*r1 + u2*r2 + u3*r3 + u4*r4) / (r1+r2+r3+r4) - u0;

    return á * conduction;
}

function getThermalDiffusivity(x, y) {
    if (x >= w) return useOutsideTemp ? 1 : getThermalDiffusivity(w-1, y);
    if (x < 0)  return useOutsideTemp ? 1 : getThermalDiffusivity(0, y);
    if (y >= h) return useOutsideTemp ? 1 : getThermalDiffusivity(x, h-1);
    if (y < 0)  return useOutsideTemp ? 1 : getThermalDiffusivity(x, 0);
    return u[x][y].getThermalDiffusivity();
}

function getTemp(x, y) {
    if (x >= w) return useOutsideTemp ? enviroTempRig : getTemp(w-1, y);
    if (x < 0)  return useOutsideTemp ? enviroTempLef : getTemp(0, y);
    if (y >= h) return useOutsideTemp ? enviroTempBot : getTemp(x, h-1);
    if (y < 0)  return useOutsideTemp ? enviroTempTop : getTemp(x, 0);
    return u[x][y].getU();
}

function visualize() {
    ctx.lineWidth = 0;
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            ctx.fillStyle = getColor(u[x][y].getU());
            ctx.fillRect(x*cw, y*ch, cw, ch);
        }
    }
}

function getColor(u) {
    var value = Math.max(Math.min(u/100, 2), 0);
    var h = (1.0 - Math.min(value, 1)) *  250;
    var l = displayType == 0 ? 50 : value*50;
    return "hsl(" + h + ", 100%, " + l + "%)";
}

function onMouseMove(e) {
    var x = Math.floor((e.clientX - 9) / cw);
    var y = Math.floor((e.clientY - 9) / ch);
    mx = x;
    my = y;
}

function resize(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log(canvas.width + ", " + canvas.height);
    var cs = Math.min(canvas.width/w, (canvas.height*0.82)/h);
    cw = cs;
    ch = cs;
}
