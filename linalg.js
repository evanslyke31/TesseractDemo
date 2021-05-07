// #region Supporting Linear Alg

//https://www.desmos.com/calculator/c2wkore2bi
function LerpSmooth1D(x1, x2, p, rate, halfSmooth, infinite) {
    if(infinite || p <= Math.PI * (halfSmooth ? .5 : 1)) {
        p += rate;
        return [((Math.sin(p + (1.5 * Math.PI))+1)*((x2-x1)/(halfSmooth ? 1 : 2)) + x1), p];
    }
    return [x2, p]
}

//fraction > 0; fraction = N
//0 <= fpos < fraction; fpos = N
//https://www.desmos.com/calculator/tbxtssvtcn
function fractionalLine(x1,y1,x2,y2,f,p) {
    if(f <= 0 || p < 0 || p >= f)
        return [x1,y1,x2,y2];
    let dx = (x2 - x1)/f;
    let dy = (y2 - y1)/f;
    return [dx*p+x1,dy*p+y1,dx*(p+1)+x1,dy*(p+1)+y1];
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

// #endregion

// #region rotation 3D

function rotateX3(A, angle) {
    var rotMatrix = [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]];
    return matMul(rotMatrix, A);
}

function rotateY3(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]];
    return matMul(rotMatrix, A);
}

function rotateZ3(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]];
    return matMul(rotMatrix, A);
}
// #endregion

// #region rotation 4D

function rotateX4(A, angle) {
    var rotMatrix = [
        [1, 0, 0,0],
        [0, Math.cos(angle), -Math.sin(angle),0],
        [0, Math.sin(angle), Math.cos(angle),0],[0,0,0,1]];
    return matMul(rotMatrix, A);
}

function rotateY4(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), 0, Math.sin(angle),0],
        [0, 1, 0,0],
        [-Math.sin(angle), 0, Math.cos(angle),0],
        [0,0,0,1]];
    return matMul(rotMatrix, A);
}

function rotateZ4(A, angle) {
    var rotMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0], [0, 0, 0, 1]];
    return matMul(rotMatrix, A);
}

function rotateZW4(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateYW4(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), 0, -Math.sin(angle), 0],
        [0, 1, 0, 0],
        [Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateYZ4(A, angle) {
    var rotationMatrix = [
        [Math.cos(angle), 0, 0, -Math.sin(angle)],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [Math.sin(angle), 0, 0, Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXW4(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0, Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXZ4(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, Math.cos(angle), 0, -Math.sin(angle)],
        [0, 0, 1, 0],
        [0,  Math.sin(angle), 0, Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

function rotateXY4(A, angle) {
    var rotationMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, Math.cos(angle), -Math.sin(angle)],
        [0, 0, Math.sin(angle), Math.cos(angle)],
    ]
    return matMul(rotationMatrix, A);
}

// #endregion

// #region Projection
var project3 = (w) => [[w,0,0,0],[0,w,0,0],[0,0,w,0]];
var project4 = (z) => [[z,0,0],[0,z,0]];
//#endregion