var debug = false;

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

    this.jumpSound = new Audio("jump.ogg");
    this.jumpSound.volume = 0.5;

    this.reset_part = function(part, x, y)
    {
        part.x = x;
        part.y = y;
        part.life = 1;
        part.size = Math.random() * 10;
        part.dx = (3.3 * Math.random()) - 3.3;
        part.dy = (Math.random() * -5);
        
        var shade =  155 + (Math.random() * 100);
        part.colour =  "rgb(" + shade + "," + shade + "," + shade + ")";
    }

    this.particles = [];
    for (var i = 0; i != 30; ++i)
    {
        var part = {};

        this.reset_part(part, -1000, -1000);

        this.particles.push(part)
    }
}

Player.prototype.update = function(rel)
{
    this.dy += (0.3 * rel);

    this.x += (this.dx * rel);
    this.y += (this.dy * rel);
    
    if (this.y + this.height > 0)
    {
        this.y = -this.height;
        this.dy *= (-0.3 * rel);
        this.dy = Math.max(this.dy, -50);
        this.jumping = false;
    }

    for (var part of this.particles)
    {
        part.x += (part.dx * rel);
        part.y += (part.dy * rel);
        part.dy += (0.01 * rel);
        part.life -= (0.01 * rel);
        part.life = Math.max(part.life, 0);
    }
    
    //this.x = Math.round(this.x);
    this.y_flat = Math.round(this.y);
}

Player.prototype.draw = function(ctx)
{
    ctx.save()
    ctx.translate(Math.round(this.x), Math.round(this.y));
    //ctx.fillStyle = this.jumping ? "rgb(0,0,255)" : "rgb(0,0,0)";
    //ctx.fillRect(-10, -10, 20, 20);
    //ctx.strokeRect(-10, -10, 20, 20);
    if (this.jumping)
        ctx.drawImage(this.image_boost, -10, -10);
    else
        ctx.drawImage(this.image, -10, -10);

    ctx.restore();

    for (var part of this.particles)
    {
        ctx.globalAlpha = part.life;
        ctx.fillStyle = part.colour;
        ctx.beginPath();
        ctx.arc(Math.round(part.x), Math.round(part.y), part.size * part.life, 0, 2 * Math.PI, false);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

Player.prototype.boost = function()
{
    this.power_boost(18);
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

// User input jump (capped)
Player.prototype.try_jump = function()
{
    if (this.jumping)
        return;

    this.jumpSound.play();
    for (var part of this.particles)
        this.reset_part(part, this.x, this.y);

    this.jump();
}

Player.prototype.setTarget = function(x, rel)
{
    var multi = this.jumping ? 0.05 : 0.05;
    if (this.x < x || this.x > x)
        this.dx = (x - this.x) * multi;// * rel;
    else
        this.dx = 0;
}

var World = function()
{
    this.width = 0;
    this.height = 0;

    this.image = new Image();
    this.image.src = "background.png";

}

World.prototype.draw = function(ctx)
{
    ctx.save();
    ctx.translate(0, 0);

    //ctx.fillStyle = "rgb(0,255,0)";
    //ctx.fillRect(0, -10, canvas.width, 1000);
    ctx.drawImage(this.image, 0, -443);

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

    this.dy = 0;
    // this.dy = Math.random() / 5;
    // var self = this;
    // setInterval(function() {
    //     self.dy *= -1;
    // }, Math.floor(Math.random() * 500) + 500);

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

    this.anim = new CoreAnim.Animation("pickup_special_anim.png", 20, 20, 15);
    this.anim.playAnimation(0, 19);
}

Pickup.prototype.mark_as_champion = function()
{
    this.chapion = true;
    this.image.src = "pickup_champion.png";

    this.anim = new CoreAnim.Animation("pickup_champion_anim.png", 50, 10, 4);
    this.anim.playAnimation(0, 9);
}

Pickup.prototype.set_pos = function(x, y)
{
    this.x = x;
    this.y = y;
}

Pickup.prototype.update = function()
{
    this.y += this.dy;
}

Pickup.prototype.draw = function(ctx)
{
    if (debug)
    {
        ctx.strokeStyle = "#FFF";
        ctx.strokeRect(this.x - 10, this.y -10, 20, 20);
        ctx.strokeStyle = "#000";
        ctx.strokeRect(this.x - 12, this.y -12, 24, 24);
    }

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

Stuff.prototype.update = function(rel)
{
    this.x += (this.dx * rel);
}

Stuff.prototype.draw = function(ctx)
{
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -10, -10);
    ctx.restore();
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
    var highscore = !Number.isNaN(localStorage.highscore) ? localStorage.highscore : 0;
    var maxSpeed = !Number.isNaN(localStorage.maxSpeed) ? localStorage.maxSpeed : 0;

    var prx = 0;
    var pry = 0;
    
    var prdy = 100;
    var prddy = 1;

    var hvari = 100;
    var hhvari = hvari / 2

    var explodes = new ItemPool(10, Explode);

    var status = { "message" : "" };


    // draw
    var offsetY = 0;
    var gradient = null;

    function init_player()
    {
        score = 0;
        player = new Player(world);
    }

    function clear_status()
    {
        status.message = "";
    }

    function show_status(message)
    {
        if (message == status.message)
            return;
        
        status.message = message;

        setTimeout(clear_status, 2000);
    }

    function relocate_pickup(pickup)
    {
        prdy -= (score / 10000);
        prdy = Math.min(prdy, 1280);

        prx += 0.1;
        pry -= prdy;

        var nx = 0;
        if (pickup.chapion || pickup.special)
            nx = 50 + (Math.random() * (world.width - 100)); 
        else
            nx = 50 + (Math.sin(prx) * ((world.width - 100) / 2)) + ((world.width - 100) / 2);

        pickup.set_pos(nx, pry)
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

    function update(rel)
    {
        explodes.update(rel);

        player.setTarget(mx, rel);
        player.update(rel);

        for (var i = 0; i != pickups.length; ++i)
        {
            var pickup = pickups[i];
            pickup.update(rel);

            if (collison(player, pickup))
            {
                var exp = explodes.get_next();
                var expX = pickup.x;
                var expY = pickup.y;

                relocate_pickup(pickup);

                if (pickup.chapion)
                {
                    score -= 1000;
                    exp.show(expX, expY, 100);
                    player.power_boost(50);
                }
                else if (pickup.special)
                {
                    score -= 100;
                    exp.show(expX, expY, 50);
                    player.power_boost(30);
                }
                else
                {
                    score -= 10;
                    exp.show(expX, expY, 20);
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
            stuff.update(rel);

            if (Math.abs(player.dy) < 5)
                continue;

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

        if (player.dy < maxSpeed && player.dy < -50)
        {
            show_status("Speed record! (" + Math.abs(player.dy).toFixed(0) + ")");
            maxSpeed = Math.min(maxSpeed, player.dy);
            localStorage.maxSpeed = maxSpeed;
        }

        draw();
    }

    function hheight()
    {
        return Math.floor(world.height / 2);
    }

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

        explodes.draw(ctx);

        for (var pickup of pickups)
            pickup.draw(ctx);

        ctx.translate(0, (offsetY - player.y_flat) + hheight());
        offsetY = player.y_flat - hheight();
        
        player.draw(ctx);

        //ctx.save();

        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        ctx.lineWidth = 2;
        ctx.font = '30px Arial'

        var ytextset = player.y_flat - hheight() + 30;
        ctx.textAlign = "left";
        ctx.strokeText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);
        ctx.fillText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);

        ctx.textAlign = "right"; 
        ctx.strokeText("Score\n" + Math.abs(score).toFixed(0), world.width - 10, ytextset);
        ctx.fillText("Score\n" + Math.abs(score).toFixed(0), world.width - 10, ytextset);

        if (debug)
        {
            ctx.textAlign = "center"; 
            ctx.strokeText(Math.abs(prdy).toFixed(2), world.width / 2, ytextset + 40);
            ctx.fillText(Math.abs(prdy).toFixed(2), world.width / 2, ytextset + 40);
        }
        
        ctx.textAlign = "center";
        ctx.font = '20px Arial'
        
        var val = player.dy;
        ctx.strokeText(Math.abs(val).toFixed(0) + " (" + Math.abs(maxSpeed).toFixed(0) + ")", world.width / 2, ytextset);
        ctx.fillText(Math.abs(val).toFixed(0) + " (" + Math.abs(maxSpeed).toFixed(0) + ")", world.width / 2, ytextset);

        if (status.message)
        {
            ctx.strokeText(status.message, world.width / 2, ytextset + world.height - 40);
            ctx.fillText(status.message, world.width / 2, ytextset + world.height - 40);
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

            canvas.addEventListener("mousedown", function()
            {
                player.try_jump();
            });

            window.addEventListener("mousemove", function(event)
            {
                mx = event.pageX - canvas.offsetLeft;
                my = event.pageY - canvas.offsetTop;
            });

            canvas.addEventListener("keydown", function(event)
            {
                if (event.key == " ")
                    player.try_jump();
                else if (event.key == "b")
                    player.y = -150000;
                else if (event.key == "c")
                    canvas.style.cursor = canvas.style.cursor == "none" ? "crosshair" : "none";
                else if (event.key == "r")
                {
                    if (event.altKey)
                    {
                        maxSpeed = 0;
                        localStorage.maxSpeed = 0;
                    }
                    
                    reset();
                }
                else if (event.key == "l")
                    player.dy = -120;
                else if (event.key == "v")
                {
                    console.log("player y  " + player.y);
                    console.log("player dy " + player.dy);
                    console.log("prdy      " + prdy);

                }
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

                //console.log(event);
            });

            init_player();
            init_pickups();
            init_stuff();

            show_status("Escape the planet");
        },
        start : function()
        {
            var fps = 120;
            var frameInterval = 1000 / fps;
            var relUpdate = 60 / fps;

            clearInterval(updateInterval);
            updateInterval = setInterval(function()
            {
                update(relUpdate);
            }, frameInterval);

            //clearInterval(drawInterval);
            //drawInterval = setInterval(draw, 7);

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
            //draw();
        }
    };
  
})();
  
