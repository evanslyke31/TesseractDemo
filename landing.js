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

function translate(A, deltax, deltay, deltaz) {
    var translateMatrix = [
        [1, 0, 0, deltax],
        [0, 1, 0, deltay],
        [0, 0, 1, deltaz],
        [0, 0, 0, 1]
    ];
    return matMul(translateMatrix, A.push([1]));
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
            point.setMatrix(rotatZ(point.toMatrix(), -.002));
            point.setMatrix(rotatY(point.toMatrix(), -.05));
            //point.setMatrix(rotatX(point.toMatrix(), -.002));
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
        this.circle.fill = '#FF8000';
        this.circle.stroke = 'orangered'; // Accepts all valid css color
        this.circle.linewidth = 1;
    }

    update() {
        this.circle.position.x = this.x + tesseract.x;
        this.circle.position.y = this.y + tesseract.y;
        //this.x = this.circle.translation.x;
        //this.y = this.circle.translation.y;
    }

    toMatrix() {
        return [[this.x], [this.y], [this.z]];
    }

    setMatrix(array) {
        this.x = array[0][0];
        this.y = array[1][0];
        this.z = array[2][0];
    }
}

var tesseract = new Tesseract(200,70,70, 3);
init();
function init() {
    // for (let i = 0; i < 120; i++)
    //     nodes.push(new Node());
    // nodes.forEach(node => node.findNeighbors());
    //var x = new Tesseract(5,3);
}
two.bind('update', function (frameCount) {
    tesseract.update();
    //x.points.forEach(point => point.update());
    //x.points.forEach(point => { point.update() });
//     // nodes.forEach(node => node.update());
//     // edges.forEach(edge => edge.update());
}).play();

// function resizeCanvas() {
//     two.renderer.setSize(window.innerWidth, window.innerWidth / 1.5);
// }