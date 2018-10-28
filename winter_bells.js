
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
    this.dy = Math.min(-16, this.dy);
    this.dy -= 2;
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

    this.jump();
}

Player.prototype.setTarget = function(x)
{
    if (this.x < x || this.x > x)
        this.dx = (x - this.x) * 0.03;
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
}

Pickup.prototype.mark_as_champion = function()
{
    this.chapion = true;
    this.image.src = "pickup_champion.png";
}

Pickup.prototype.draw = function(ctx)
{
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.drawImage(this.image, -10, -10);

    ctx.restore();
}

var Stuff = function(type)
{
    this.x = -1000;
    this.y = -1000;

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
            break;
        case 1:
        var id = Math.floor(Math.random() * 3) + 1;
            this.image.src = "star_" + id + ".png";
            break;
    } 
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

    var elemLeft = null;
    var elemTop = null;
    var elemBottom = null;

    var updateInterval = null;
    var drawInterval = null;

    var player = null;
    var world = null;

    var pickups = [];
    var stuffs = [];

    var mx = 0;
    var my = 0;
    

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

    function relocate_pickup(pickup)
    {
        prddy += 0.001;
        prdy += prddy;
        prdy = Math.min(prdy, 1500);

        prx += 0.1;

        if (Math.random() > 0.5)
        {
            pry -= prdy;

            pickup.x = 50 + Math.abs(Math.sin(prx) * (world.width - 100)) + ((Math.random() * hvari) - hhvari);
            pickup.y = pry;
        }
        else
        {
            pry -= (prdy / 2)
            pickup.x = 50 + Math.abs(Math.cos(prx) * (world.width - 100)) + ((Math.random() * hvari) - hhvari);
            pickup.y = pry;
        }
    }

    function init_pickups(count)
    {
        count = count || 100;
        pickups = [];
        for (var i = 0; i < count; ++i)
        {
            var pickup = new Pickup(-100, -100); //new Pickup(Math.random() * world.width, world.height + offsetY + i * -100)
            
            if (i % 10 == 0)
                pickup.mark_as_special();
                
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
        player.setTarget(mx);
        player.update();

        for (var i = 0; i != pickups.length; ++i)
        {
            var pickup = pickups[i];

            if (collison(player, pickup))
            {
                relocate_pickup(pickup);

                if (pickup.chapion)
                    player.power_boost(50);
                else if (pickup.special)
                    player.power_boost(30);
                else
                    player.boost();

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

            if (stuff.y > (player.y + world.height))
            {
                stuff.x = Math.random() * world.width;
                stuff.y = player.y - world.height - (Math.random() * world.height);

                if (this.type != 1 && player.y < -150000 && Math.random() < 0.5)
                {
                    stuff.set_type(1);
                }
            }

            
        }

        highscore = Math.min(highscore, player.y);
        localStorage.highscore = highscore;
    }

    function hheight()
    {
        return world.height / 2;
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
        
        world.draw(ctx);
        for (var stuff of stuffs)
            stuff.draw(ctx);

        for (var pickup of pickups)
            pickup.draw(ctx);

        player.draw(ctx);

        ctx.translate(0, (offsetY - player.y) + hheight());
        offsetY = player.y - hheight();

        ctx.save();

        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        ctx.lineWidth = 2;
        ctx.font = '30px Arial'

        var ytextset = player.y - hheight() + 30;
        ctx.textAlign = "left";
        ctx.strokeText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);
        ctx.fillText("High Score\n" + Math.abs(highscore).toFixed(0), 10, ytextset);

        ctx.textAlign = "right"; 
        ctx.strokeText("Height\n" + Math.abs(player.y).toFixed(0), world.width - 10, ytextset);
        ctx.fillText("Height\n" + Math.abs(player.y).toFixed(0), world.width - 10, ytextset);
        //ctx.fillText("offsetY = " + prdy.toFixed(0), 10, player.y - hheight() + 30);

        ctx.textAlign = "center"; 
        ctx.strokeText(Math.abs(prdy).toFixed(0), world.width / 2, ytextset);
        ctx.fillText(Math.abs(prdy).toFixed(0), world.width / 2, ytextset);
        
        ctx.restore();
    }
    
    return {
        init : function(canvasIn)
        {
            canvas = canvasIn;
            ctx = canvas.getContext('2d');

            elemLeft = canvas.offsetLeft;
            elemTop = canvas.offsetTop;
            elemBottom = canvas.height;

            world = new World();
            world.width = canvas.width;
            world.height = canvas.height;

            canvas.addEventListener("mousedown", function()
            {
                player.try_jump();
            });

            canvas.addEventListener("mousemove", function(event)
            {
                mx = event.pageX - elemLeft;
                //var my = event.pageY - elemTop;
            });

            canvas.addEventListener("keydown", function(event)
            {
                if (event.key == " ")
                    player.boost();
                else if (event.key == "b")
                    player.y = -150000;

                //console.log(event);
            });

            init_player();
            init_pickups();
            init_stuff();
        },
        start : function()
        {
            clearInterval(updateInterval);
            updateInterval = setInterval(update, 18);

            clearInterval(drawInterval);
            drawInterval = setInterval(draw, 18);
        },

        stop : function()
        {
            clearInterval(updateInterval);
            clearInterval(drawInterval);
        },

        reset : function()
        {
            init_player();
            init_pickups();
            init_stuff();
            highscore = 0;
            draw();
        }
    };
  
})();
  
