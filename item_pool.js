var ItemPool = function(size, type)
{
    this.index = 0;
    this.items = [];

    for (var i = 0; i != size; ++i)
        this.items.push(new type()); 
}

ItemPool.prototype.add = function(item)
{
    this.items.push(item)
}

ItemPool.prototype.get_next = function()
{
    var item = this.items[this.index];
    this.index += 1;
    if (this.index >= this.items.length)
        this.index = 0;
    return item;
}

ItemPool.prototype.update = function()
{
    for (var item of this.items)
        item.update();
}

ItemPool.prototype.draw = function(ctx)
{
    for (var item of this.items)
        item.draw(ctx);
}