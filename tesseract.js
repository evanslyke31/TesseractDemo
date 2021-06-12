var elem = document.getElementById('draw-animation');
var two = new Two({ width: window.innerWidth, height: 500 }).appendTo(elem);
var uploading = false;
var failed = false;
var uploadComplete = false;

function getRgb(vgal) {
    if(failed)
        return [255,0,0];
    if(uploadComplete)
        return [0,255,0];
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

class Tesseract {
    
    constructor(x, y, size, radius) {
        this.x = x;
        this.y = y;
        this.smoothingPos = 0;
        this.points = [];
        this.xyFactor = .5;
        this.xyFactorPos = 0;
        this.rotateX = 0;
        this.rotateY = 0;

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
       
        if(this.xyFactor > 0)
            [this.xyFactor, this.xyFactorPos] = LerpSmooth1D(.5, .007, this.xyFactorPos, .023, false, false)
        this.points.forEach(point => {   
            if(this.rotateX !== 0) {
                point.setMatrix(rotateY4(point.toMatrix(),-this.rotateX*.005 || 0));    
            }
            if(this.rotateY !== 0) {
                point.setMatrix(rotateX4(point.toMatrix(), this.rotateY*.005 || 0)); 
            }
            point.setMatrix(rotateZW4(point.toMatrix(), -.003));
            point.setMatrix(rotateYW4(point.toMatrix(), this.xyFactor));
            if(uploading) { 
                [this.rotationRate, this.smoothingPos] = LerpSmooth1D(0, .1, this.smoothingPos,.001,false,false);
                point.setMatrix(rotateXY4(point.toMatrix(), this.rotationRate));
            }
            point.update();
        });
        this.rotateX = 0;
        this.rotateY = 0;
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
        this.circle.opacity = 0;
        this.circle.linewidth = 0;
    }

    update() {
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
        this.lineFraction = 10;
        this.edges = [];
        let perspective = (2-(2*this.node1.w));
        for(let i = 0; i < this.lineFraction; i++) {
            var u1,v1,u2,v2;
            [u1,v1,u2,v2] = fractionalLine(this.node1.x,this.node1.y,this.node2.x,this.node2.y,this.lineFraction,i)
            var line = two.makeLine(u1,v1,u2,v2);
            line.linewidth = lineThickness;
            this.edges.push(line);
        }
        this.rgb = Math.random() * 1530;
        this.increasing = 1;
    }

    update() {

        for(let i = 0; i < this.lineFraction; i++) {
             var u1,v1,u2,v2;
             let perspective = (1.5-(this.node1.pFactor*this.node1.w));
             let perspective1 = (1.5-(this.node2.pFactor*this.node2.w));
            [u1,v1,u2,v2] = fractionalLine(this.node1.x/perspective,this.node1.y/perspective,this.node2.x/perspective1,this.node2.y/perspective1,this.lineFraction,i);
            this.edges[i].vertices[0].set(u1+tesseract.x,v1+tesseract.y);
            this.edges[i].vertices[1].set(u2+tesseract.x,v2+tesseract.y);
            this.edges[i].stroke = `rgb(${getRgb(this.rgb+((15*(i+1)))).join(',')})`
            this.edges[i].linewidth = lineThickness;
        }
        if(!uploadComplete) {
            if(this.rgb % 1530 > 1250)
                this.increasing = -1;
            if(this.rgb % 1530 < 700)
                this.increasing = 1;
            this.rgb += colorRate * this.increasing;
        }
        else if(uploadComplete && this.rgb % 1530 < 530 || this.rgb % 1530 > 600)
            this.rgb += colorRate;
	}
}

var tesseract;
init();
function init() {
    console.log(window.innerWidth/2);
    tesseract = new Tesseract(window.innerWidth/2,250,1, 6);
    
}
var pFactorPos = 0;
var pPos = 0;
var currentSize = 1;
var colorRate = 10;
var colorRatePos = 0;
var lineThickness = .5;

var currentX, currentY, newX, newY = 0;

two.bind('update', function (frameCount) {
    if(currentSize < 150) {
        tesseract.points.forEach(point => {
            var m = point.toMatrix()
            for(let i = 0; i < m.length; i++)
                m[i][0] *= 1.05;
            point.setMatrix(m);
        });
        currentSize *= 1.05;
    }
    if(lineThickness < 3)
        lineThickness += .025

    tesseract.update();

    if(uploading && colorRate < 50)
    [colorRate, colorRatePos] = LerpSmooth1D(10, 50, colorRatePos, .01, true, false);

    var changed = false;
    var deltaX, deltaY = 0;
    if(newX !== currentX) {
        deltaX = newX - currentX;
        currentX = newX;
        changed = true;
    }
    if(newY !== currentY) {
        deltaY = newY - currentY;
        currentY = newY;
        changed = true;
    }
    if(changed) {
        tesseract.rotateX = deltaX;
        tesseract.rotateY = deltaY;
        changed = false;
    }

    [pPos, pFactorPos] = LerpSmooth1D(0, .0022, pFactorPos, .01, false, !uploading);
    tesseract.points.forEach(point => point.pFactor = pPos);
}).play();

document.addEventListener("dragover", function(e) {
    [newX,newY] = [e.pageX, e.pageY];
  }, false);

// function resizeCanvas() {
//     two.renderer.setSize(window.innerWidth, window.innerWidth / 1.5);
// }