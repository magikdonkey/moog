var Explode = function()
{
    this.x = -1000;
    this.y = -1000;

    this.particles = [];
    for (var i = 0; i != 100; ++i)
    {
        this.particles.push({
            "x" : this.x,
            "y" : this.y,
            "dx" : 0,
            "dy" : 0,
            "life" : 100
        });
    }

    this.sound = new Audio("explode.ogg");
}

function explode_colour()
{
    return "rgb(255, " + (Math.random() * 255) + ", 0)";
}

function explode_smoke_colour()
{
    var shade =  Math.random() * 100;
    return "rgb(" + shade + "," + shade + "," + shade + ")";
}

Explode.prototype.show = function(x, y, scale)
{
    this.x = x;
    this.y = y;

    this.sound.volume = (scale / 100);
    this.sound.playbackRate = (this.special || this.chapion) ? 0.5 : 1;
    this.sound.play();

    for (var part of this.particles)
    {
        part.x = x;
        part.y = y;
        part.life = 1;
        part.size = Math.random() * scale;
        part.dx = (3.3 * Math.random()) - 3.3;
        part.dy = (Math.random() * -5) - 10;
        part.colour = explode_colour();
    }
}

Explode.prototype.update = function(rel)
{
    for (var part of this.particles)
    {
        part.x += (part.dx * rel);
        part.y += (part.dy * rel);
        part.dy += 0.2;
        part.life -= 0.01;
        part.life = Math.max(0, part.life);

        if (part.life < (0.3 + 0.5 * Math.random())) // && Math.random() < (0.1 * rel))
            part.colour = explode_smoke_colour();
    }
}

Explode.prototype.draw = function(ctx)
{
    //ctx.save();
    //ctx.translate(this.x, this.y);
    //ctx.strokeRect(this.x, this.y, 100, 100);
    
    for (var part of this.particles)
    {
        if (part.life < 0.001)
            continue;

        ctx.globalAlpha = part.life;
        ctx.fillStyle = part.colour;
        //ctx.fillRect(part.x, part.y, part.life * 15, part.life * 15);

        //ctx.fillRect(Math.round(part.x), Math.round(part.y), 15 * part.life * part.life, 15 * part.life * part.life);

        ctx.beginPath();
        ctx.arc(Math.round(part.x), Math.round(part.y), (part.size / 10) + part.size * part.life, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    //ctx.restore();
}
