var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: window.innerWidth / 4 }).appendTo(elem);

function matMul(A, B) {
    if (A[0].length != B.length)
        return null;
    var X = new Array(A.length);
    for (var i = 0; i < A.length; i++) {
        X[i] = new Array(B[0].length);
        for (var j = 0; j < B[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < A[0].length; k++)
                sum += A[i][k] * B[k][j];
            X[i][j] = sum;
        }
    }
    return X;
}

function rotatX(A, angle) {
    var rotMatrix = [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]];
    return matMul(rotMatrix, A);
}

function rotatY(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]];
    return matMul(rotMatrix, A);
}

function rotatZ(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]];
    return matMul(rotMatrix, A);
}

class Tesseract {
    
    constructor(x, y, size, radius) {
        this.x = x;
        this.y = y;
        this.points = [
            new Point(-size, size, size, radius),
            new Point(-size, size, -size, radius),
            new Point(-size, -size, size, radius),
            new Point(-size, -size, -size, radius),
            new Point(size, size, size, radius),
            new Point(size, size, -size, radius),
            new Point(size, -size, size, radius),
            new Point(size, -size, -size, radius),
        ];
    }

    update() {
        this.points.forEach((point) => {
            //point.setMatrix(rotatZ(point.toMatrix(), -.002));
            point.setMatrix(rotatY(point.toMatrix(), -.001));
            point.setMatrix(rotatX(point.toMatrix(), -.002));
            //console.log();
            //.x = point.x + 60;
            //point.y = point.y + 40;
            //var g = point.toMatrix();
            //console.log(g);
            point.update();
        });
    }
}

class Point {
    constructor(x, y, z, radius) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = radius;
        this.circle = two.makeCircle(this.x, this.y, this.radius);
        console.log(this.circle);
        this.circle.fill = '#FF8000';
        this.circle.stroke = 'orangered'; // Accepts all valid css color
        this.circle.linewidth = 1;
    }

    update() {
        this.circle.position.x = this.x;
        this.circle.position.y = this.y;
        //this.x = this.circle.translation.x;
        //this.y = this.circle.translation.y;
    }

    toMatrix() {
        return [[this.x], [this.y], [this.z]];
    }

    setMatrix(array) {
        this.x = array[0];
        this.y = array[1];
        this.z = array[2];
    }
}

class Node {
    constructor() {
        this.node = two.makeCircle(Math.floor(Math.random() * two.width), Math.floor(Math.random() * two.height), 3);
        this.node.fill = '#fff';
        this.node.opacity = .5;
        this.node.noStroke();
        this.toNeighbor;
        this.neighborCount = Math.floor(Math.random() * 3 + 4);
        this.neighbors = [];
        this.xdelta = 0;
        this.ydelta = 0;
        this.isMoving = false;
        this.nextPoint = new Two.Vector();
        this.lerpFloat = 0.001;
        this.isLerpIncreasing = true;
        this.points = [];
        this.points.push(new Two.Vector(this.node.position.x, this.node.position.y));
        this.pointCount = Math.floor(Math.random() * 10 + 5);
        for (let i = 0; i < this.pointCount; i++) {
            this.points.push(new Two.Vector(this.node.position.x + (Math.random() * 200 - 100), this.node.position.y + (Math.random() * 200 - 100)));
        }

    }

    update() {
        if (!this.isMoving && Math.random() > .99) {
            this.isMoving = true;
            this.nextPoint = this.points[Math.floor(Math.random() * this.points.length)];
            /*if (this.node.position.x < 0)
                this.nextPoint.x = 50;
            else if (this.node.position.x > two.width)
                this.nextPoint.x = two.width - 50;
            if (this.node.position.y < 0)
                this.nextPoint.y = 50;
            else if (this.node.position.y > two.height)
                this.nextPoint.y = two.height - 50;*/
        } else if (this.isMoving) {
            this.node.translation.lerp(this.nextPoint, this.lerpFloat);
            if (this.isLerpIncreasing)
                this.lerpFloat += this.lerpFloat * .1;
            else
                this.lerpFloat -= this.lerpFloat * .9;
            if (this.lerpFloat > 0.5)
                this.isLerpIncreasing = false;
            if (!this.isLerpIncreasing && this.lerpFloat < 1) {
                this.isMoving = false;
                this.lerpFloat = 0.001;
                this.isLerpIncreasing = true;
            }

        }
    }

    findNeighbors() {
        for (let i = 0; i < this.neighborCount; i++) {
            if (!this.neighbors[i]) {
                let min = 99999;
                let nearest;
                nodes.forEach(nd => {
                    let dist = Math.sqrt(Math.pow(this.node.position.x - nd.node.position.x, 2) + Math.pow(this.node.position.y - nd.node.position.y, 2));
                    if (nd != this && !this.neighbors.find(n => n == nd) && dist < min) {
                        nearest = nd;
                        min = dist;
                    }
                });
                if (nearest) {
                    this.neighbors.push(nearest);
                    nearest.neighbors.push(this);
                    edges.push(new Edge(this.node, nearest.node));
                }
            }
        }
    }
}

class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.edge = two.makeLine(node1.position.x, node1.position.y, node2.position.x, node2.position.y);
        this.edge.stroke = '#ddd';
        this.edge.opacity = .3;
        this.edge.linewidth = 2;
    }

    update() {
        this.edge.vertices[0].set(this.node1.position.x, this.node1.position.y);
        this.edge.vertices[1].set(this.node2.position.x, this.node2.position.y);
    }
}

let nodes = [];
let edges = [];
var x = new Tesseract(200,70,70, 3);
console.log(x);
init();
function init() {
    // for (let i = 0; i < 120; i++)
    //     nodes.push(new Node());
    // nodes.forEach(node => node.findNeighbors());
    //var x = new Tesseract(5,3);
}
two.bind('update', function (frameCount) {
    x.update();
    //x.points.forEach(point => point.update());
    //x.points.forEach(point => { point.update() });
//     // nodes.forEach(node => node.update());
//     // edges.forEach(edge => edge.update());
}).play();

// function resizeCanvas() {
//     two.renderer.setSize(window.innerWidth, window.innerWidth / 1.5);
// }