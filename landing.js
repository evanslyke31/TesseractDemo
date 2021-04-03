var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: window.innerHeight }).appendTo(elem);
var uploading = false;

function LerpSmooth1D(starting, ending, position, rate, halfSmooth, infinite) {
    if(infinite || position <= Math.PI * (halfSmooth ? .5 : 1)) {
        position += rate;
        return [((Math.sin(position + (1.5 * Math.PI))+1)*((ending-starting)/(halfSmooth ? 1 : 2)) + starting), position];
    }
    return [ending, position]
}

function RGBToHex(r,g,b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  }

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
        this.smoothingPos = 0;
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

        //Hard coded Convex hull
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
                [this.rotationRate, this.smoothingPos] = LerpSmooth1D(0, .008, this.smoothingPos,.001,false,false);
                point.setMatrix(rotateXY(point.toMatrix(), this.rotationRate));
                //point.setMatrix(rotateYZ(point.toMatrix(), -.005));
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
        this.circle.position.x = (this.x /(1-(.002*this.z)) + tesseract.x);
        this.circle.position.y = (this.y /(1-(.002*this.z)) + tesseract.y);
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

var tesseract;
var test = two.makeCircle(20, 20, 4);
test.fill = '#FF8000';
init();
function init() {
    tesseract = new Tesseract(400,200,100, 3);
}
var g = 0;
two.bind('update', function (frameCount) {
    tesseract.update();
    [test.position.x, g] = LerpSmooth1D(200, 500, g, .01, true, true);
}).play();

// function resizeCanvas() {
//     two.renderer.setSize(window.innerWidth, window.innerWidth / 1.5);
// }