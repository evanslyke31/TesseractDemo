var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: window.innerHeight }).appendTo(elem);
var uploading = false;

function getRgb(vgal) {
	if (vgal >= 1530)
		vgal = (vgal % 1530) + 1;
	if (vgal <= 0)
		return [vgal, 0, 0];
	else if (vgal <= 255)
		return [255, vgal, 0];
	else if (vgal <= 510)
		return [255 - (vgal - 255), 255, 0];
	else if (vgal <= 765)
		return [0, 255, vgal - 510];
	else if (vgal <= 1020)
		return [0, 255 - (vgal - 765), 255];
	else if (vgal <= 1275)
		return [vgal - 1020, 0, 255];
	else if (vgal <= 1531)
		return [255, 0, 255 - (vgal - 1275)];
	return [0, 0, 0];
}

function LerpSmooth1D(starting, ending, position, rate, halfSmooth, infinite) {
    if(infinite || position <= Math.PI * (halfSmooth ? .5 : 1)) {
        position += rate;
        return [((Math.sin(position + (1.5 * Math.PI))+1)*((ending-starting)/(halfSmooth ? 1 : 2)) + starting), position];
    }
    return [ending, position]
}

//fraction > 0; fraction = N
//0 <= fpos < fraction; fpos = N
function fractionalLine(x1,y1,x2,y2,fraction,fpos) {
    if(fraction <= 0 || fpos < 0 || fpos >= fraction)
        return [x1,y1,x2,y2];

    let dx = (x2 - x1)/fraction;
    let dy = (y2 - y1)/fraction;
    return [dx*fpos+x1,dy*fpos+y1,dx*(fpos+1)+x1,dy*(fpos+1)+y1];
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
        this.points = [];

        for(let i = 0; i < 16; i++) {
            let bin = [...(i >>> 0).toString(2)].map(b => (b==="1"?1:-1));
            let length = bin.length;
            for(let j = 0; j < 4-length; j++)
                bin = [-1,...bin];
            this.points.push(new Point(size*bin[0],size*bin[1],size*bin[2],size*bin[3],radius));
        }

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
            point.setMatrix(rotateZ(point.toMatrix(), -.002));
            point.setMatrix(rotateX(point.toMatrix(), -.005));
            //point.setMatrix(rotateZW(point.toMatrix(), -.003));
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
        this.pFactor = 0;
        this.radius = radius;

        this.circle = two.makeCircle(this.x, this.y, this.radius);
        //this.circle.fill = '#FF8000';
        //this.circle.stroke = 'orangered'; // Accepts all valid css color
        this.circle.linewidth = 0;
    }

    update() {
        //p = 2-(.007*this.w)
        let perspective = (2-(this.pFactor*this.w));
        this.circle.position.x = (this.x / perspective) + tesseract.x;
        this.circle.position.y = (this.y / perspective) + tesseract.y;
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
        // var u1,v1,u2,v2;
        // [u1,v1,u2,v2] = fractionalLine(this.node1.x,this.node1.y,this.node2.x,this.node2.y,10,5)
        // this.edge =two.makeLine(u1,v1,u2,v2);

        //this.edge = two.makeLine(node1.circle.position.x, node1.circle.position.y, node2.circle.position.x, node2.circle.position.y);
        // this.edge.stroke = '#F00';
        // this.edge.opacity = 1;
        // this.edge.linewidth = 2;
        this.lineFraction = 20;
        this.edges = [];
        for(let i = 0; i < this.lineFraction; i++) {
            var u1,v1,u2,v2;
            
            [u1,v1,u2,v2] = fractionalLine(this.node1.x,this.node1.y,this.node2.x,this.node2.y,this.lineFraction,i)
            this.edges.push(two.makeLine(u1,v1,u2,v2));
        }
        this.rgb = 0;
    }

    update() {
        // var u1,v1,u2,v2;
        // [u1,v1,u2,v2] = fractionalLine(this.node1.x,this.node1.y,this.node2.x,this.node2.y,10,6)
        // this.edge.vertices[0].set(u1+tesseract.x,v1+tesseract.y);
        // this.edge.vertices[1].set(u2+tesseract.x,v2+tesseract.y);

        for(let i = 0; i < this.lineFraction; i++) {
             var u1,v1,u2,v2;
            [u1,v1,u2,v2] = fractionalLine(this.node1.x,this.node1.y,this.node2.x,this.node2.y,this.lineFraction,i);
            this.edges[i].vertices[0].set(u1+tesseract.x,v1+tesseract.y);
            this.edges[i].vertices[1].set(u2+tesseract.x,v2+tesseract.y);
            this.edges[i].stroke = `rgb(${getRgb(this.rgb*((.1*i+1))).join(',')})`
        }
        this.rgb += 2;
        this.rgb %= 1530
        //this.edge.vertices[0].set(this.node1.circle.position.x, this.node1.circle.position.y);
        //this.edge.vertices[1].set(this.node2.circle.position.x, this.node2.circle.position.y);
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
var g2 = Math.PI/2;
var pFactorPos = 0;
var pPos = 0;

two.bind('update', function (frameCount) {
    tesseract.update();
    [test.position.x, g] = LerpSmooth1D(0, 300, g, .01, false, true);
    [test.position.y, g2] = LerpSmooth1D(0, 300, g2, .01, false, true);
    test.position.x += 250;
    test.position.y += 50;


    [pPos, pFactorPos] = LerpSmooth1D(0, .007, pFactorPos, .01, false, true);
    tesseract.points.forEach(point => point.pFactor = pPos);
}).play();

// function resizeCanvas() {
//     two.renderer.setSize(window.innerWidth, window.innerWidth / 1.5);
// }