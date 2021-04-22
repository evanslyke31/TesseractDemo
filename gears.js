var elem = document.getElementById('gears-animation');
//var two = new Two({ width: 200, height: 200, autostart:true }).appendTo(elem);

var something = new Two.Path([
    new Two.Anchor(-13, -6.5, Two.Commands.move),
    new Two.Anchor(50, 0, 25, 25, 0, 0, Two.Commands.curve),
    new Two.Anchor(50, 25, 0, 0, 0, 0, Two.Commands.line),
    new Two.Anchor(100, 25, -25, 5, 0, 0, Two.Commands.curve),
    new Two.Anchor(100, 0, 0, 0, -25, 25, Two.Commands.line),
    new Two.Anchor(150, 0, 0, 0, 0, 50, Two.Commands.curve),
    new Two.Anchor(150, -25, 0, 0, 0, 0, Two.Commands.line),
    new Two.Anchor(150, -25, 0, 0, -25, 25, Two.Commands.line),
    new Two.Anchor(0, -25, 25, 25,0, 0, Two.Commands.curve),
    //new Two.Anchor(100, 0, 75, 75, 100, 100, Two.Commands.curve),
    //new Two.Anchor(100, 200, 0, 0, 0, 0, Two.Commands.line),
    //new Two.Anchor(200, 200, 0, 0, 0, 0, Two.Commands.line)
], true, false, true);
console.log(something);
something.position.x = 20;
something.position.y = 25;
something.fill = '#FFF';
something.stroke = '#FFF';
//two.add(something);

two.bind('update', function (frameCount, timeDelta) {
    //something.rotation = frameCount / 60;
});