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

// Draw width & height of each cell
var cs = Math.min(window.innerWidth/w, (window.innerHeight*0.9)/h);
var cw = cs, ch = cs;

// Load canvas to draw stuff
var canvas = document.getElementById("canvas");
var tempText = document.getElementById("temp");
var matText = document.getElementById("mat");
var menutop = document.getElementById("menutop");
canvas.width = cw*w;
canvas.height = ch*h;
canvas.style = "margin-top: " + menutop.offsetHeight + "px; left: 50%; width: " + cw*w + "; height: " + cw*h + "; margin-left: -" + (cw*w/2) + "px;";

document.body.insertBefore(canvas, document.body.childNodes[0]);
var ctx = canvas.getContext('2d');
canvas.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('resize', resize, false);

// Mouse position
var mx = -1, my = -1;

var interval;

function start() {
    // Load air into grid (a = 1.9e-1)
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
        var a = u[mx][my].getThermalDiffusivity();
        tempText.innerHTML = "Temperature at Cursor: " + u0;
        matText.innerHTML = "Thermal diffusity at Cursor: " + a;
    }
}

function getUt(x, y) {
    // Store this heat and thermal diffusity
    var u0 = getTemp(x,y);
    var a = u[x][y].getThermalDiffusivity();

    // Sample surrounding heat
    var u1 = getTemp(x-1,y), a1 = getThermalDiffusivity(x-1,y);
    var u2 = getTemp(x+1,y), a2 = getThermalDiffusivity(x+1,y);
    var u3 = getTemp(x,y-1), a3 = getThermalDiffusivity(x,y-1);
    var u4 = getTemp(x,y+1), a4 = getThermalDiffusivity(x,y+1);

    // Calculate ratio of surrounding thermal diffusities
    var r1 = a1 / a;
    var r2 = a2 / a;
    var r3 = a3 / a;
    var r4 = a4 / a;

    // Calculate conduction (sum of surrounding heats - current heat)
    var conduction = (u1*r1 + u2*r2 + u3*r3 + u4*r4) / (r1+r2+r3+r4) - u0;

    return a * conduction;
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
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) / cw);
    var y = Math.floor((e.clientY - rect.top) / ch);
    mx = x;
    my = y;
}

function timeChange() {
    dt = document.getElementById('timeSlider').value;
}

function resize(e) {
    var cs = Math.min(window.innerWidth/w, (window.innerHeight*0.9)/h);
    cw = cs;
    ch = cs;

    canvas.style = "margin-top: " + menutop.offsetHeight + "px; left: 50%; width: " + cw*w + "; height: " + cw*h + "; margin-left: -" + (cw*w/2) + "px;";
    canvas.width = cw*w;
    canvas.height = ch*h;
}
