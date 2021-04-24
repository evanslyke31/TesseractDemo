var elem = document.getElementById('nodes');
var two = new Two({ width: window.innerWidth, height: window.innerWidth / 4 }).appendTo(elem);

class Node {
    constructor() {
        this.node = two.makeCircle(Math.floor(Math.random() * two.width), Math.floor(Math.random() * two.height), 3);
        this.node.fill = '#ccc';
        this.node.opacity = .5;
        this.node.noStroke();
        this.toNeighbor;
        this.neighborCount = Math.floor(Math.random() * 4 + 5);
        this.neighbors = [];
        this.xdelta = 0;
        this.ydelta = 0;
        this.isMoving = false;
        this.nextPoint = new Two.Vector();
        this.lerpFloat = 0.001;
        this.isLerpIncreasing = true;
        this.points = [];
        this.points.push(new Two.Vector(this.node.position.x, this.node.position.y));
        this.pointCount = Math.floor(Math.random() * 4 + 1);
        for (let i = 0; i < this.pointCount; i++) {
            let randX = this.node.position.x + (Math.random() * 100 - 50);
            let randY = this.node.position.y + (Math.random() * 100 - 50);
            randX = randX > two.width ? two.width : randX;
            randX = randX < 0 ? 0 : randX;
            randY = randY > two.height ? two.height : randY;
            randY = randY < 0 ? 0 : randY;
            this.points.push(new Two.Vector(randX, randY));
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
        } else if(this.isMoving) {
            this.node.translation.lerp(this.nextPoint, this.lerpFloat);
            if (this.isLerpIncreasing)
                this.lerpFloat += this.lerpFloat * .1;
            else
                this.lerpFloat -= this.lerpFloat * .9;
            if (this.lerpFloat > 0.5)
                this.isLerpIncreasing = false;
            if (!this.isLerpIncreasing  && this.lerpFloat < 1) {
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
        this.edge.opacity = .05;
        this.edge.linewidth = 2;
    }

    update() {
        this.edge.vertices[0].set(this.node1.position.x, this.node1.position.y);
        this.edge.vertices[1].set(this.node2.position.x, this.node2.position.y);
	}
}

let nodes = [];
let edges = [];
init();
function init() {
    for (let i = 0; i < two.width * .05; i++)
        nodes.push(new Node());
    nodes.forEach(node => node.findNeighbors());
}

two.bind('update', function (frameCount) {
    nodes.forEach(node => node.update());
    edges.forEach(edge => edge.update());
}).play();

function resizeCanvas() {
    two.renderer.setSize(window.innerWidth, window.innerWidth / 5);
}