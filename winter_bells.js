var debug = false;

var ItemPool = function()
{
    this.index = 0;
    this.items = [];
}

ItemPool.prototype.add = function(item)
{
    this.items.push(item)
}

ItemPool.prototype.get_next = function()
{
    var item = this.items[this.index];
    this.index += 1;
    if (this.index > this.items.length)
        this.index = 0;
    return item;
}

var Player = function(world)
{
    this.x = 0;
    this.y = 0;

    this.width = 20;
    this.height = 20;

    this.dx = 0;
    this.dy = 0;

    this.world = world;

    this.jumping = false;

    this.image = new Image();
    this.image.src = "player.png";

    this.image_boost = new Image();
    this.image_boost.src = "player_boost.png";

    //TODO anim.js ify
}

Player.prototype.update = function()
{
    this.dy += 0.3;

    this.x += this.dx;
    this.y += this.dy;
    

    if (this.y + this.height > 0)
    {
        this.y = -this.height;
        this.dy *= -0.3;
        this.jumping = false;
    }
}

Player.prototype.draw = function(ctx)
{
    ctx.save()
    ctx.translate(this.x, this.y);
    //ctx.fillStyle = this.jumping ? "rgb(0,0,255)" : "rgb(0,0,0)";
    //ctx.fillRect(-10, -10, 20, 20);
    //ctx.strokeRect(-10, -10, 20, 20);
    if (this.jumping)
        ctx.drawImage(this.image_boost, -10, -10);
    else
        ctx.drawImage(this.image, -10, -10);

    ctx.restore();
}

Player.prototype.boost = function()
{
    //this.dy = Math.min(-16, this.dy);
    //this.dy -= 2;
    this.power_boost(18); //16);
}

Player.prototype.power_boost = function(val)
{
    this.dy = Math.min(-val, this.dy);
    this.dy -= 2;
}

Player.prototype.jump = function()
{
    this.boost();
    this.jumping = true;
}

Player.prototype.try_jump = function()
{
    if (this.jumping)
        return;

        
    //new Audio("jump.mp3").play();

    this.jump();
}

Player.prototype.setTarget = function(x)
{
    var multi = this.jumping ? 0.05 : 0.05;
    if (this.x < x || this.x > x)
        this.dx = (x - this.x) * multi;
    else
        this.dx = 0;
}

var World = function()
{
    this.width = 0;
    this.height = 0;

}

World.prototype.draw = function(ctx)
{
    ctx.save();
    ctx.translate(0, 0);

    ctx.fillStyle = "rgb(0,255,0)";
    ctx.fillRect(0, -10, canvas.width, 1000);

    // ctx.fillStyle = "rgb(0,0,0)";
    // var offset = 0;
    // for (var i = 0; i < 1000; ++i)
    // {
    //     ctx.fillText("- " + Math.abs(-100 * i), 10, offset)
    //     offset -= 100;
    // }

    ctx.restore();
}

var Pickup = function(x, y)
{
    this.x = x;
    this.y = y;

    this.width = 20;
    this.height = 20;

    this.special = false;
    this.chapion = false;

    this.image = new Image();
    this.image.src = "pickup.png";
}

Pickup.prototype.mark_as_special = function()
{
    this.special = true;
    this.image.src = "pickup_special.png";

    this.anim = new CoreAnim.Animation("pickup_special_anim.png", 20, 5, 4);
    this.anim.playAnimation(0, 4);
}

Pickup.prototype.mark_as_champion = function()
{
    this.chapion = true;
    this.image.src = "pickup_champion.png";

    this.anim = new CoreAnim.Animation("pickup_champion_anim.png", 50, 10, 4);
    this.anim.playAnimation(0, 9);
}

Pickup.prototype.draw = function(ctx)
{
    if (debug)
        ctx.strokeRect(this.x - 10, this.y -10, 20, 20);

    if (this.special)
    {
        this.anim.paint(ctx, this.x - 10, this.y - 10);
        return;
    }
        
    if (this.chapion)
    {
        this.anim.paint(ctx, this.x - 25, this.y - 25);
        return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -10, -10);
    ctx.restore();
}

var Stuff = function(type)
{
    this.x = -1000;
    this.y = -1000;

    this.dx = 0;

    this.image = new Image();
    this.set_type(type);
}

Stuff.prototype.set_type = function(type)
{
    this.type = type;
    switch (type)
    {
        case 0:
            var id = Math.floor(Math.random() * 3) + 1;
            this.image.src = "cloud_" + id + ".png";
            this.dx = (Math.random() - 0.5);
            break;
        case 1:
            var id = Math.floor(Math.random() * 3) + 1;
            this.image.src = "star_" + id + ".png";
            this.dx = 0;
            break;
    } 
}

Stuff.prototype.update = function()
{
    this.x += this.dx;
}

Stuff.prototype.draw = function(ctx)
{
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -10, -10);
    ctx.restore();
}


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

Explode.prototype.reset = function(x, y, scale)
{
    this.x = x;
    this.y = y;

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

Explode.prototype.update = function()
{
    for (var part of this.particles)
    {
        part.x += part.dx;
        part.y += part.dy;
        part.dy += 0.2;
        part.life -= 0.01;
        part.life = Math.max(0, part.life);

        if (part.life < 0.9 && Math.random() < 0.1)
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
        ctx.globalAlpha = part.life;
        ctx.fillStyle = part.colour;
        //ctx.fillRect(part.x, part.y, part.life * 15, part.life * 15);

        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * part.life, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    //ctx.restore();
}

function collison(bodyA, bodyB)
{
    var AminX = bodyA.x;
    var AminY = bodyA.y;
    var AmaxX = bodyA.x + bodyA.width;
    var AmaxY = bodyA.y + bodyA.height;

    var BminX = bodyB.x;
    var BminY = bodyB.y;
    var BmaxX = bodyB.x + bodyB.width;
    var BmaxY = bodyB.y + bodyB.height;

    if (AmaxX < BminX ||
        AmaxY < BminY ||
        AminX > BmaxX ||
        AminY > BmaxY) {
        return false;
    }

    return true;
}

var WinterBellsGame = (function() {
    var canvas = null;
    var ctx = null;

    var updateInterval = null;
    var drawInterval = null;

    var player = null;
    var world = null;

    var pickups = [];
    var stuffs = [];

    var mx = 0;
    var my = 0;
    
    var score = 0;
    var highscore = localStorage.highscore;

    function init_player()
    {
        player = new Player(world);
    }

    var prx = 0;
    var pry = 0;
    
    var prdy = 100;
    var prddy = 1;

    var hvari = 100;
    var hhvari = hvari / 2

    var explodeIndex = 0;
    var explodes = [];
    for (var i = 0; i != 10; ++i)
        explodes.push(new Explode(0,0));
    
    function next_explode()
    {
        var next = explodes[explodeIndex];
        explodeIndex += 1;
        if (explodeIndex > explodes.length)
            explodeIndex = 0;

        return next;
    }

    function relocate_pickup(pickup)
    {
        //prddy += 0.001;
        //prdy += prddy;
        //prdy = Math.min(prdy, 1500);

        prdy -= (score / 10000);
        prdy = Math.min(prdy, 1280);

        prx += 0.1;

        if (pickup.chapion || pickup.special)
        {
            pry -= prdy;

            pickup.x = 50 + (Math.random() * (world.width - 100)); 
            pickup.y = pry;
        }
        else
        {
            pry -= prdy;

            pickup.x = 50 + (Math.sin(prx) * ((world.width - 100) / 2)) + ((world.width - 100) / 2); // + ((Math.random() * hvari) - hhvari);
            pickup.y = pry;
        }
    }

    function init_pickups(count)
    {
        count = count || 100;

        prx = 0;
        pry = 0;
    
        prdy = 100;
        prddy = 1;
    
        hvari = 100;
        hhvari = hvari / 2

        pickups = [];
        for (var i = 0; i < count; ++i)
        {
            var pickup = new Pickup(-100, -100);
            
            if (debug)
            {
                if (i % 10 == 0)
                    pickup.mark_as_champion();
                else if (i % 5 == 0)
                    pickup.mark_as_special();
            }
            else
            {
                if (i % 10 == 0)
                    pickup.mark_as_special();
            }
                
            relocate_pickup(pickup);
            pickups.push(pickup);
        }

        pickups[count - 1].mark_as_champion();
    }

    function init_stuff(count)
    {
        count = count || 10;
        stuffs = [];
        for (var i = 0; i < count; ++i)
        {
            var stuff = new Stuff(0);
            stuff.x = Math.random() * world.width;
            stuff.y = player.y - (Math.random() * world.height) - world.height;

            stuffs.push(stuff);
        }

    }

    function update()
    {
        for (var explode of explodes)
            explode.update();

        player.setTarget(mx);
        player.update();

        for (var i = 0; i != pickups.length; ++i)
        {
            var pickup = pickups[i];

            if (collison(player, pickup))
            {
                var exp = next_explode();
                exp.reset(pickup.x, pickup.y, (pickup.chapion || pickup.special) ? 50 : 20);

                relocate_pickup(pickup);

                if (pickup.chapion)
                {
                    score -= 1000;
                    var aud = new Audio("explode.m4a");
                    aud.volume = 1;
                    aud.play();
              
                    player.power_boost(50);
                }
                else if (pickup.special)
                {
                    score -= 100;
                    var aud = new Audio("explode.m4a");
                    aud.volume = 0.5;
                    aud.play();
                    player.power_boost(30);
                }
                else
                {
                    score -= 10;
                    //var aud = new Audio("dong3.ogg");
                    var aud = new Audio("explode.m4a");
                    aud.volume = 0.2;
                    aud.play();
                    player.boost();
                }

                player.jumping = false;
            }

            if (pickup.y > (player.y + world.height))
            {
                relocate_pickup(pickup);
            }
        }

        for (var i = 0; i != stuffs.length; ++i)
        {
            var stuff = stuffs[i];
            stuff.update();

            if (player.dy < 0)
            {
                if (stuff.y > (player.y + world.height))
                {
                    stuff.x = Math.random() * world.width;
                    stuff.y = player.y - world.height - (Math.random() * world.height);

                    // TODO sattellite / populate in reverse?
                    if (stuff.type != 1 && player.y < -150000 && Math.random() < 0.5)
                        stuff.set_type(1);
                }
            }
            else
            {
                if (stuff.y < (player.y - world.height) || stuff.y > (player.y + world.height))
                {
                    stuff.x = Math.random() * world.width;
                    stuff.y = player.y + world.height + (Math.random() * world.height);

                    if (stuff.type == 1 && player.y > -150000)
                        stuff.set_type(0);
                }
            }
        }

        highscore = Math.min(highscore, score);
        localStorage.highscore = highscore;

        draw();
    }

    function hheight()
    {
        return Math.floor(world.height / 2);
    }

    var offsetY = 0;
    var gradient = null;

    function draw()
    {
        ctx.clearRect(0, offsetY, world.width, world.height);

        // to do skip stuff not in view..
        
        if (!gradient)
        {
            gradient = ctx.createLinearGradient(world.width/2, -200000, world.width/2, 0);
            
            gradient.addColorStop(0, 'rgb(0, 0, 0)');
            gradient.addColorStop(0.16, 'rgb(3, 38, 58)');
            gradient.addColorStop(0.32, 'rgb(8, 83, 127)');
            gradient.addColorStop(0.48, 'rgb(12, 116, 178)');
            gradient.addColorStop(0.82, 'rgb(49, 159, 224)');
            gradient.addColorStop(1, 'rgb(232, 240, 255)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, offsetY, world.width, world.height);
        // -
    
        for (var stuff of stuffs)
            stuff.draw(ctx);
        
        world.draw(ctx);

        for (var explode of explodes)
        explode.draw(ctx);

        for (var pickup of pickups)
            pickup.draw(ctx);

        player.draw(ctx);

        ctx.translate(0, (offsetY - player.y) + hheight());
        offsetY = player.y - hheight();

        
        //ctx.save();

        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        ctx.lineWidth = 2;
        ctx.font = '30px Arial'

        var ytextset = player.y - hheight() + 30;
        ctx.textAlign = "left";
        ctx.strokeText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);
        ctx.fillText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);

        ctx.textAlign = "right"; 
        ctx.strokeText("Score\n" + Math.abs(score).toFixed(0), world.width - 10, ytextset);
        ctx.fillText("Score\n" + Math.abs(score).toFixed(0), world.width - 10, ytextset);

        if (debug)
        {
            ctx.textAlign = "center"; 
            ctx.strokeText(Math.abs(prdy).toFixed(0), world.width / 2, ytextset);
            ctx.fillText(Math.abs(prdy).toFixed(0), world.width / 2, ytextset);
        }

        //ctx.restore();
    }

    var running = true;
    
    return {
        init : function(canvasIn)
        {
            canvas = canvasIn;
            ctx = canvas.getContext('2d');

            world = new World();
            world.width = canvas.width;
            world.height = canvas.height;

            var jumpSound = new Audio("jump.m4a");
            jumpSound.volume = 0.5;

            canvas.addEventListener("mousedown", function()
            {
                if (!player.jumping)
                    jumpSound.play();
                player.try_jump();
            });

            canvas.addEventListener("mousemove", function(event)
            {
                mx = event.pageX - canvas.offsetLeft;
                my = event.pageY - canvas.offsetTop;
            });

            canvas.addEventListener("keydown", function(event)
            {
                if (event.key == " ")
                    player.boost();
                else if (event.key == "b")
                    player.y = -150000;
                else if (event.key == "c")
                    canvas.style.cursor = canvas.style.cursor == "none" ? "crosshair" : "none";
                else if (event.key == "r")
                    reset();
                else if (event.key == "d")
                {
                    highscore = 0;
                    debug = !debug;
                }
                else if (event.key == "p")
                {
                    if (running)
                        stop();
                    else
                        start();
                }

                console.log(event);
            });

            init_player();
            init_pickups();
            init_stuff();
        },
        start : function()
        {
            clearInterval(updateInterval);
            updateInterval = setInterval(update, 18);

            //clearInterval(drawInterval);
            //drawInterval = setInterval(draw, 18);

            running = true;
        },

        stop : function()
        {
            running = false;
            clearInterval(updateInterval);
            //clearInterval(drawInterval);
        },

        reset : function()
        {
            init_player();
            init_pickups();
            init_stuff();
            draw();
        }
    };
  
})();
  
