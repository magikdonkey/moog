var CoreAnim = (function () {
    //= Animation [
    /// @offset     The width of each frame on the animation sheet
    /// @frames     The number of frames in the animation sheet
    /// @fps        The frames per second the animation should be played
    function Animation(imageLocation, offset, frames, fps) {
        this.image = new Image();
        this.image.src = imageLocation;

        this.frameDelay = Math.ceil(1000 / fps);

        this.frameIncrement = 1;
        this.currentFrame = 0;
        this.maxFrame = (frames - 1);
        this.finalFrame = this.maxFrame;

        this.offset = offset;

        this.runTime = this.frameDelay * frames;
    }

    Animation.prototype.playAnimation = function (startIndex, endIndex) {
        if (this.animationInterval)
            return;

        this.currentFrame = startIndex;
        this.finalFrame = endIndex;

        if (this.currentFrame > this.finalFrame)
            this.frameIncrement = -1;
        else
            this.frameIncrement = 1;

        var self = this;
        this.animationInterval = setInterval(function () {
            self.advanceFrame();
        }, this.frameDelay);
    }

    Animation.prototype.advanceFrame = function () {
        
        if (this.currentFrame == this.finalFrame || this.currentFrame < 0) {
            this.currentFrame = 0;
            clearInterval(this.animationInterval);
            this.animationInterval = 0;
        }

        this.currentFrame += this.frameIncrement;
    }

    Animation.prototype.setFrame = function (index) {
        this.currentFrame = Math.max(index, this.maxFrame);
    }

    Animation.prototype.maxFrame = function () {
        return this.maxFrame;
    }

    Animation.prototype.paint = function (ctx, x, y) {
        var calcOffset = Math.floor(this.offset * this.currentFrame);
        ctx.drawImage(this.image,
                      calcOffset, 0,                        //Source x,y
                      this.offset, this.image.height,       //Source size
                      x, y,                                 //Dest x,y
                      this.offset, this.image.height);      //Dest size
    }
    //= Animation ]

    //= [ Sprite
    function Sprite(imageLocation) {
        this.image = new Image();
        this.image.src = imageLocation;
    }

    Sprite.prototype.paint = function (ctx, x, y) {
        ctx.drawImage(this.image, x, y);
    }
    //= Sprite ]

    return {
        Animation: Animation,
        Sprite: Sprite
    };
}());