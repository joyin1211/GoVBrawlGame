//some USEFULL functions and classes that js doesn't have lol

function resize(arr, newSize, neutral) {
    while (newSize > arr.length) {
        arr.push(neutral);
    }
    arr.length = newSize;
    return arr;
}

class Queue {
    constructor() {
        this.elements = {};
        this.begin = 0;
        this.end = 0;
    }

    push(element) {
        this.elements[this.end] = element;
        this.end++;
    }

    length() {
        return this.end - this.begin;
    }

    isEmpty() {
        return this.length() <= 0;
    }

    pop() {
        const item = this.elements[this.begin];
        delete this.elements[this];
        this.begin++;
        return item;
    }

    front() {
        return this.elements[this.begin];
    }

    back() {
        return this.elemets[this.end];
    }
}

//canvas info

var canvas = document.getElementById('aboba');
canvas.addEventListener('click', tableClick);
var canvasLeft = canvas.offsetLeft + canvas.clientLeft;
var canvasTop = canvas.offsetTop + canvas.clientTop;
var canvasHeight = canvas.height;
var canvasWidth = canvas.width;
var ctx = canvas.getContext('2d');

var step = 0, snmCount = 0;

console.log(canvasLeft, canvasTop);

const FIELD_SIZE = 15;

const cellSize = canvasHeight / (FIELD_SIZE + 1);
const pdx = 0, pdy = 0;

//actual game

dsu = new Array();
dsuEdges = new Array();
table = new Array();

console.log("js govno");

dsu = resize(dsu, FIELD_SIZE * FIELD_SIZE, null); // x and y
dsuEdges = resize(dsuEdges, FIELD_SIZE * FIELD_SIZE, null); // u, v - indexes in dsu

function getVtxByXY(x, y, id) {
    for (let i = 0; i < dsu[id].length; i++) {
        if (dsu[id][i].x == x && dsu[id][i].y == y) {
            return i;
        }
    }
    return -1;
}

function uniteDsu(u, v) {
    if (dsu[u].length < dsu[v].length) {
        [u, v] = [v, u];
    }
    var oldLength = dsu[u].length;
    for (let vtxV = 0; vtxV < dsu[v].length; vtxV++) {
        var curVtx = dsu[v][vtxV];
        dsu[u].push(curVtx);
        table[curVtx.x][curVtx.y].dsu = u;
    }
    for (let edgeVId = 0; edgeVId < dsuEdges[v].length; edgeVId++) {
        var curEdge = dsuEdges[v][edgeVId];
        dsuEdges[u].push({ u: curEdge.u + oldLength, v: curEdge.v + oldLength });
    }
    dsu[v] = [];
    dsuEdges[v] = [];
}

//dead cell = purple/pink cross(крестик)
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = "alive"; //alive, dead
        this.color = "white";
    }
    draw() {
        if (this.color == "white") {
            return;
        }
        let cx = getCoorsByXY(this.x, this.y).x;
        let cy = getCoorsByXY(this.x, this.y).y;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.moveTo(cx - Math.floor(cellSize / 4), cy - Math.floor(cellSize / 4));
        ctx.lineTo(cx + Math.floor(cellSize / 4), cy + Math.floor(cellSize / 4));
        ctx.moveTo(cx + Math.floor(cellSize / 4), cy - Math.floor(cellSize / 4));
        ctx.lineTo(cx - Math.floor(cellSize / 4), cy + Math.floor(cellSize / 4));
        ctx.closePath();
        ctx.stroke();

    }
}

class Point {
    constructor(x, y, color, dsunum) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = "alive"; //alive, border, dead
        this.dsu = dsunum;
    }
    draw() {
        let cx = getCoorsByXY(this.x, this.y).x;
        let cy = getCoorsByXY(this.x, this.y).y;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(cx, cy, cellSize / 4, 0, Math.PI * 2, 0);
        ctx.fill();
    }
}

function startGame() {
    scoreBlock = document.getElementById('scorePrint');
    scoreBlock.textContent = `Blue Score: 0; Red Score: 0`;
    stepBlock = document.getElementById('stepPrint');
    stepBlock.textContent = 'Blue turn!';
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    table = [];
    for (let i = 0; i < FIELD_SIZE; i++) {
        row = new Array();
        for (let j = 0; j < FIELD_SIZE; j++) {
            row.push(new Cell(i, j));
        }
        table.push(row);
    }

    dsu = resize(dsu, FIELD_SIZE * FIELD_SIZE, null); // x and y
    dsuEdges = resize(dsuEdges, FIELD_SIZE * FIELD_SIZE, null); // u, v - indexes in dsu

    step = 0;
    snmCount = 0;


    //table[FIELD_SIZE - 1][FIELD_SIZE - 1] = new Point(FIELD_SIZE - 1, FIELD_SIZE - 1, "blue");
    //table[1][3] = new Point(1, 3, "blue");
    drawField();
}

function getNeighbours(x, y) {
    nb = new Array();
    if (x > 0 && y > 0) {
        if (table[x - 1][y].color != table[x][y - 1].color ||
            table[x - 1][y].color == "white" ||
            table[x][y - 1].color == "white") {
            nb.push({ x: x - 1, y: y - 1 });
        }
    }
    if (x > 0) {
        nb.push({ x: x - 1, y: y });
    }
    if (x > 0 && y < FIELD_SIZE - 1) {
        if (table[x - 1][y].color != table[x][y + 1].color ||
            table[x - 1][y].color == "white" ||
            table[x][y + 1].color == "white") {
            nb.push({ x: x - 1, y: y + 1 });
        }
    }
    if (y > 0) {
        nb.push({ x: x, y: y - 1 });
    }
    if (x < FIELD_SIZE - 1 && y > 0) {
        if (table[x + 1][y].color != table[x][y - 1].color ||
            table[x + 1][y].color == "white" ||
            table[x][y - 1].color == "white") {
            nb.push({ x: x + 1, y: y - 1 });
        }
    }
    if (x < FIELD_SIZE - 1) {
        nb.push({ x: x + 1, y: y });
    }
    if (x < FIELD_SIZE - 1 && y < FIELD_SIZE - 1) {
        if (table[x + 1][y].color != table[x][y + 1].color ||
            table[x + 1][y].color == "white" ||
            table[x][y + 1].color == "white") {
            nb.push({ x: x + 1, y: y + 1 });
        }
    }
    if (y < FIELD_SIZE - 1) {
        nb.push({ x: x, y: y + 1 });
    }
    nbs = new Array();
    for (let i = 0; i < nb.length; i++) {
        curNb = table[nb[i].x][nb[i].y];
        if (curNb.type != "dead" && curNb.constructor.name == "Point" &&
            curNb.color == table[x][y].color
        ) {
            nbs.push(nb[i]);
        }
    }
    return nbs;
}

function drawGuys(x1, y1, x2, y2) {
    var cx1 = getCoorsByXY(x1, y1).x;
    var cy1 = getCoorsByXY(x1, y1).y;
    var cx2 = getCoorsByXY(x2, y2).x;
    var cy2 = getCoorsByXY(x2, y2).y;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = table[x][y].color;
    ctx.moveTo(cx1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.closePath();
    ctx.stroke();
}

function makeGraphList(edges) {
    grList = new Array();
    grList = resize(grList, edges.length + 1, null);
    for (let i = 0; i < edges.length; i++) {
        if (grList[edges[i].u] == null) {
            grList[edges[i].u] = new Array();
        }
        if (grList[edges[i].v] == null) {
            grList[edges[i].v] = new Array();
        }
        grList[edges[i].u].push(edges[i].v);
        grList[edges[i].v].push(edges[i].u);
    }
    return grList;
}

function findDead(vertexes) {
    dead = new Array();
    if (vertexes.length == 0) {
        return dead;
    }
    for (let x = 0; x < FIELD_SIZE; x++) {
        for (let y = 0; y < FIELD_SIZE; y++) {
            var exists1 = 0, exists2 = 0, exists3 = 0, exists4 = 0;
            for (let vtxid = 0; vtxid < vertexes.length; vtxid++) {
                if (vertexes[vtxid].x == x && vertexes[vtxid].y < y) {
                    exists1 = 1;
                }
                if (vertexes[vtxid].x == x && vertexes[vtxid].y > y) {
                    exists2 = 1;
                }
                if (vertexes[vtxid].x < x && vertexes[vtxid].y == y) {
                    exists3 = 1;
                }
                if (vertexes[vtxid].x > x && vertexes[vtxid].y == y) {
                    exists4 = 1;
                }
            }
            if (exists1 + exists2 + exists3 + exists4 == 4 &&
                (table[x][y].type != "border" || (table[x][y].type == "border" &&
                    table[x][y].color != table[vertexes[0].x][vertexes[0].y].color))) {
                dead.push({ x: x, y: y });
            }
        }
    }
    return dead;
}

function makeNeighbours(x, y) {
    nbList = getNeighbours(x, y);
    for (let i = 0; i < nbList.length; i++) {
        drawGuys(x, y, nbList[i].x, nbList[i].y);
    }
    //do all cycles - same dsu
    for (let ni = 0; ni < nbList.length; ni++) {
        for (let nj = ni + 1; nj < nbList.length; nj++) {
            var vtxi = nbList[ni];
            var vtxj = nbList[nj];
            var dsuBfsId = table[vtxi.x][vtxi.y].dsu;
            if (table[vtxi.x][vtxi.y].dsu == table[vtxj.x][vtxj.y].dsu) {
                //
                //bfs Begins
                //
                curEdges = dsuEdges[dsuBfsId]; //u,v indexes in dsu[...]
                graph = makeGraphList(curEdges);

                bfsQ = new Queue();
                bfsParents = new Array();
                bfsParents = resize(bfsParents, graph.length, -1);
                var u = getVtxByXY(vtxi.x, vtxi.y, dsuBfsId);
                var v = getVtxByXY(vtxj.x, vtxj.y, dsuBfsId);
                bfsQ.push(u);
                bfsParents[u] = u;
                console.log(graph);
                while (!bfsQ.isEmpty()) {
                    var curVtx = bfsQ.pop();
                    for (let bfsI = 0; bfsI < graph[curVtx].length; bfsI++) {
                        if (graph[curVtx][bfsI] == v) {
                            bfsParents[graph[curVtx][bfsI]] = curVtx;
                        } else if (bfsParents[graph[curVtx][bfsI]] == -1) {
                            bfsQ.push(graph[curVtx][bfsI]);
                            bfsParents[graph[curVtx][bfsI]] = curVtx;
                        }
                    }
                }
                path = new Array();
                var pathVtx = v;
                while (pathVtx != u) {
                    path.push(dsu[dsuBfsId][pathVtx]);
                    pathVtx = bfsParents[pathVtx];
                }
                path.push(dsu[dsuBfsId][u]);
                path.push({ x: x, y: y });
                //
                // BFS ENDED!!! DONT USE U AND V ANYMORE, ONLY COORDINATES
                //
                for (let elemId = 0; elemId < path.length; elemId++) {
                    var elem = path[elemId];
                    table[elem.x][elem.y].type = "border";
                }
                deadCells = findDead(path);
                console.log(deadCells);
                for (let dCellid = 0; dCellid < deadCells.length; dCellid++) {
                    var dCell = deadCells[dCellid];
                    table[dCell.x][dCell.y].type = "dead";
                    if (table[x][y].color == "red") {
                        table[dCell.x][dCell.y].color = "pink";
                    } else {
                        table[dCell.x][dCell.y].color = "purple";
                    }
                    console.log(deadCells);
                    table[dCell.x][dCell.y].draw();
                }
            }
        }
    }

    //uniting all the neighbours' dsu-s

    for (let ni = 0; ni < nbList.length; ni++) {
        for (let nj = ni + 1; nj < nbList.length; nj++) {
            var vtxi = nbList[ni];
            var vtxj = nbList[nj];
            console.log(ni, nj);
            var dsuBfsI = table[vtxi.x][vtxi.y].dsu;
            var dsuBfsJ = table[vtxj.x][vtxj.y].dsu;
            if (dsuBfsI != dsuBfsJ) {
                uniteDsu(dsuBfsI, dsuBfsJ);
            }
        }
    }

    //add new vtx and new edges to dsu/dsuEdges

    if (nbList.length == 0) {
        return;
    }
    var frstVtx = nbList[0];
    var dsuId = table[frstVtx.x][frstVtx.y].dsu;
    var newId = dsu[dsuId].length;
    uniteDsu(dsuId, table[x][y].dsu);
    for (let ni = 0; ni < nbList.length; ni++) {
        var curNb = nbList[ni];
        var curVtx = getVtxByXY(curNb.x, curNb.y, dsuId);
        dsuEdges[dsuId].push({ u: curVtx, v: newId });
    }
    console.log(dsu);

}

//returns top left coors of a square
function getCoorsByXY(x, y) {
    return { x: pdx + (x + 1) * cellSize, y: pdy + (y + 1) * cellSize };
}

function getXYByCoors(cx, cy) {
    if (cx < cellSize / 2 || cy < cellSize / 2 || cx > canvasWidth - cellSize / 2 || cy > canvasHeight - cellSize / 2) {
        return { x: null, y: null };
    }
    return { x: Math.floor((cx - cellSize / 2) / cellSize), y: Math.floor((cy - cellSize / 2) / cellSize) };
}

function getMousePos(event) {
    return { x: event.pageX - canvasLeft, y: event.pageY - canvasTop };
}

function calculateScore() {
    var blueScore = 0;
    var redScore = 0;
    var flag = 1;
    for (let x = 0; x < FIELD_SIZE; x++) {
        for (let y = 0; y < FIELD_SIZE; y++) {
            if (table[x][y].color == "blue" || table[x][y].color == "purple") {
                blueScore++;
            }
            if (table[x][y].color == "red" || table[x][y].color == "pink") {
                redScore++;
            }
        }
    }
    if (redScore + blueScore >= FIELD_SIZE * FIELD_SIZE) {
        flag = -1;
    }
    for (let dsuid = 0; dsuid < FIELD_SIZE * FIELD_SIZE; dsuid++) {
        if(dsuEdges[dsuid] == null ||
            dsuEdges[dsuid].length == 0) {
                continue;
            }
        for (let edgeId = 0; edgeId < dsuEdges[dsuid].length; edgeId++) {
            var edge = dsuEdges[dsuid][edgeId];
            var colorU = table[dsu[dsuid][edge.u].x][dsu[dsuid][edge.u].y].color;
            if (colorU == "blue" || colorU == "purple") {
                blueScore++;
            }
            if (colorU == "red" || colorU == "pink") {
                redScore++;
            }
        }
    }
    return [blueScore, redScore, flag];
}

function tableClick(event) {
    var cx = getMousePos(event).x;
    var cy = getMousePos(event).y;
    x = getXYByCoors(cx, cy).x;
    y = getXYByCoors(cx, cy).y;
    if (x == null && y == null) {
        console.log("obosralsya");
        return;
    }
    console.log(x, y);
    var curColor = "blue";
    if (step % 2 == 1) {
        curColor = "red";
    }
    if (table[x][y].constructor.name == "Cell" && table[x][y].type != "dead") {
        table[x][y] = new Point(x, y, curColor, snmCount);
        table[x][y].draw();
        dsu[snmCount] = new Array();
        dsuEdges[snmCount] = new Array();
        dsu[snmCount].push({ x: x, y: y });
        snmCount += 1;
        step += 1;
        step %= 2;
    } else {
        console.log("Fuck off!!!");
        return;
    }
    var blueScore, redScore, flag;
    makeNeighbours(x, y);
    [blueScore, redScore, flag] = calculateScore();
    console.log(blueScore, redScore, flag);
    scoreBlock = document.getElementById('scorePrint');
    scoreBlock.textContent = `Blue Score: ${blueScore} ; Red Score: ${redScore} `;
    stepBlock = document.getElementById('stepPrint');
    if(flag == 1) {
        if (step % 2 == 0) {
            stepBlock.textContent = "Blue turn!";
        } else {
            stepBlock.textContent = "Red turn!";
        }
    } else {
        if(blueScore > redScore) {
            stepBlock.textContent = "Blue wins!";
        }
        if(redScore > blueScore) {
            stepBlock.textContent = "Red wins!";
        }
        if(blueScore == redScore) {
            stepBlock.textContent = "Draw!";
        }
    }
}


function drawField() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    for (let i = 1; i < FIELD_SIZE + 1; i++) {
        ctx.beginPath();
        ctx.moveTo(pdx, pdy + cellSize * i);
        ctx.lineTo(pdx + (FIELD_SIZE + 1) * cellSize, pdy + cellSize * i);
        ctx.closePath();
        ctx.stroke();
    }
    for (let i = 1; i < FIELD_SIZE + 1; i++) {
        ctx.beginPath();
        ctx.moveTo(pdx + cellSize * i, pdy);
        ctx.lineTo(pdx + cellSize * i, pdy + cellSize * (FIELD_SIZE + 1));
        ctx.closePath();
        ctx.stroke();
    }
    //table[FIELD_SIZE - 1][FIELD_SIZE - 1].draw();
    //table[1][3].draw();

    /*

    А это гипербола

    var curbd = 200;

    for (let i = 0; i < N + 1; i++) {
        ctx.beginPath();
        ctx.moveTo(curbd + cellSize * i, curbd);
        ctx.lineTo(curbd + cellSize * N, curbd + cellSize * i);
        ctx.closePath();
        ctx.stroke();
    }
    */
}

startGame();

/*
ctx.beginPath();
ctx.lineTo(105,25);
ctx.moveTo(25,25);
    ctx.lineTo(25,105);
    ctx.fill();

    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(125,125);
    ctx.lineTo(125,45);
    ctx.lineTo(45,125);
    ctx.closePath();
    ctx.stroke();*/