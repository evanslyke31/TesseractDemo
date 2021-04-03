var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: window.innerHeight }).appendTo(elem);
var uploading = false;

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

function rotateX(A, angle) {
    var rotMatrix = [
        [1, 0, 0,0],
        [0, Math.cos(angle), -Math.sin(angle),0],
        [0, Math.sin(angle), Math.cos(angle),0],[0,0,0,1]];
    return matMul(rotMatrix, A);
}

function rotateY(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]];
    return matMul(rotMatrix, A);
}

function rotateZ(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0], [0, 0, 0, 1]];
    return matMul(rotMatrix, A);
}

function rotateZW(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateYW(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), 0, -Math.sin(angle), 0],
        [0, 1, 0, 0],
        [Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateYZ(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), 0, 0, -Math.sin(angle)],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [Math.sin(angle), 0, 0, Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXW(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0, Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXZ(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), 0, -Math.sin(angle)],
        [0, 0, 1, 0],
        [0,  Math.sin(angle), 0, Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXY(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, Math.cos(angle), -Math.sin(angle)],
        [0, 0, Math.sin(angle), Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

var projectionMatrix3D = (w) => [[w,0,0,0],[0,w,0,0],[0,0,w,0]];
var projectionMatrix2D = (z) => [[z,0,0],[0,z,0]];

class Tesseract {
    
    constructor(x, y, size, radius) {
        this.x = x;
        this.y = y;
        this.points = [
            new Point(size, size, size, size, radius),      //0  1111
            new Point(size, size, size, -size, radius),     //1  1110
            new Point(size, size, -size, size, radius),     //2  1101
            new Point(size, size, -size, -size, radius),    //3  1100
            new Point(size, -size, size, size, radius),     //4  1011
            new Point(size, -size, size, -size, radius),    //5  1010
            new Point(size, -size, -size, size, radius),    //6  1001
            new Point(size, -size, -size, -size, radius),   //7  1000
            new Point(-size, size, size, size, radius),     //8  0111
            new Point(-size, size, size, -size, radius),    //9  0110
            new Point(-size, size, -size, size, radius),    //10 0101
            new Point(-size, size, -size, -size, radius),   //11 0100
            new Point(-size, -size, size, size, radius),    //12 0011
            new Point(-size, -size, size, -size, radius),   //13 0010
            new Point(-size, -size, -size, size, radius),   //14 0001
            new Point(-size, -size, -size, -size, radius),  //15 0000
        ];
        this.lines = [];
        this.connect(15,7);
        this.connect(15,11);
        this.connect(15,13);
        this.connect(15,14);

        this.connect(7,3);
        this.connect(7,5);
        this.connect(7,6);

        this.connect(11,3);
        this.connect(11,9);
        this.connect(11,10);

        this.connect(13,5);
        this.connect(13,9);
        this.connect(13,12);

        this.connect(14,6);
        this.connect(14,10);
        this.connect(14,12);

        //-----------------------

        this.connect(0,8);
        this.connect(0,4);
        this.connect(0,2);
        this.connect(0,1);

        this.connect(8,12);
        this.connect(8,10);
        this.connect(8,9);

        this.connect(4,12);
        this.connect(4,6);
        this.connect(4,5);

        this.connect(2,10);
        this.connect(2,6);
        this.connect(2,3);

        this.connect(1,9);
        this.connect(1,5);
        this.connect(1,3);

        // this.lines = [new Line(this.points[15],this.points[0]),new Line(this.points[14],this.points[1]),new Line(this.points[13],this.points[2]),new Line(this.points[12],this.points[3]),new Line(this.points[11],this.points[4]),new Line(this.points[10],this.points[5]),new Line(this.points[9],this.points[6]),new Line(this.points[8],this.points[7])];
        // this.lines2 = [new Line(this.points[0],this.points[2]),new Line(this.points[15],this.points[13]),new Line(this.points[4],this.points[6]),new Line(this.points[11],this.points[9]),new Line(this.points[8],this.points[10]),new Line(this.points[7],this.points[5]),new Line(this.points[12],this.points[14]),new Line(this.points[3],this.points[1])];
        // this.lines3 = [new Line(this.points[0],this.points[8]),new Line(this.points[4],this.points[12]),new Line(this.points[6],this.points[14]),new Line(this.points[2],this.points[10]),new Line(this.points[7],this.points[15]),new Line(this.points[5],this.points[13]),new Line(this.points[3],this.points[11]),new Line(this.points[1],this.points[9])];
        // this.lines4 = [new Line(this.points[9],this.points[13]),new Line(this.points[10],this.points[14]),new Line(this.points[11],this.points[15]),new Line(this.points[8],this.points[12]),new Line(this.points[0],this.points[4]),new Line(this.points[1],this.points[5]),new Line(this.points[2],this.points[6]),new Line(this.points[3],this.points[7])];
        // this.lines.push(...this.lines2,...this.lines3, ...this.lines4);
    }

    connect(i,j) {
        this.lines.push(new Line(this.points[i],this.points[j]));
    }

    update() {
        this.points.forEach(point => {
            //point.setMatrix(rotateZ(point.toMatrix(), -.002));
            point.setMatrix(rotateX(point.toMatrix(), -.005));
            point.setMatrix(rotateZW(point.toMatrix(), -.003));
            //point.setMatrix(rotateYW(point.toMatrix(), .005));
            //point.setMatrix(rotateXW(point.toMatrix(), -.015));
            if(uploading) { 
                point.setMatrix(rotateXY(point.toMatrix(), .008));
                point.setMatrix(rotateYZ(point.toMatrix(), -.005));
            }
            //point.setMatrix(rotateXZ(point.toMatrix(), -.000001));
            point.update();
        });
        this.lines.forEach(line => {
            line.update();
        })
    }
}

class Point {
    constructor(x, y, z, w, radius) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.radius = radius;

        this.circle = two.makeCircle(this.x, this.y, this.radius);
        //this.circle.fill = '#FF8000';
        //this.circle.stroke = 'orangered'; // Accepts all valid css color
        this.circle.linewidth = 0;
    }

    update() {
        //var projected = this.toMatrix();//matMul(projectionMatrix3D(1/(2-this.w)),this.toMatrix());
        //var projected = matMul(projectionMatrix2D(1/(2-this.z),this.toMatrix()));
        this.circle.position.x = (this.x /(2-(.005*this.z)) + tesseract.x);
        this.circle.position.y = (this.y /(2-(.005*this.z)) + tesseract.y);
        //this.x = this.circle.translation.x;
        //this.y = this.circle.translation.y;
    }

    toMatrix() {
        return [[this.x], [this.y], [this.z], [this.w]];
    }

    setMatrix(array) {
        this.x = array[0][0];
        this.y = array[1][0];
        this.z = array[2][0];
        this.w = array[3][0];
    }
}

class Line {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.edge = two.makeLine(node1.circle.position.x, node1.circle.position.y, node2.circle.position.x, node2.circle.position.y);
        this.edge.stroke = '#F00';
        this.edge.opacity = 1;
        this.edge.linewidth = 2;
    }

    update() {
        this.edge.vertices[0].set(this.node1.circle.position.x, this.node1.circle.position.y);
        this.edge.vertices[1].set(this.node2.circle.position.x, this.node2.circle.position.y);
	}
}

var tesseract = new Tesseract(400,200,100, 3);
init();
function init() {
    tesseract.update();
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