// character 0 : berserker: attack power increases each time. beats monk.
// character 1 : antimage : nullifies other characters' powers. beats berserker.
// character 2 : shieldbearer : shield
// character 4 : monk : heals

class character {
    constructor (name, img, maxHp, strength, counter, speed, special) {
        this.name = name;
        this.img = $('<img>').attr('src', img).css({
            "position": "absolute",
            "width": "10%"
        }).addClass('characterImg');
        this.maxHp = maxHp;
        this.hp = this.maxHp;
        this.strength = strength;
        this.counter = counter;
        this.speed = parseInt(2400 / speed);
        this.special = special;
        this.x = 0;
        this.y = 0;
        this.dead = false;
        this.ai = true;
    }

    attack(otherCharacter) {
        // animate? yes
        this.move(otherCharacter.x, this.y);
        // half a second
        setTimeout(this.hit(otherCharacter), this.speed)
        // move back afterward
        var me = this; var x = this.x; var y = this.y;
        setTimeout(() => {me.move(x, y, me.speed)}, this.speed);
    }

    hit(otherCharacter) {
        // the better your timing, the more damage you do
        var directness = 1 - Math.abs(this.y - otherCharacter.y);
        otherCharacter.hp -= this.strength * directness;
        // tire? haven't iplemented this yet, or decided how to
        this.stamina -= 1;
        // computer controlled player will automatically counterattack
        if(otherCharacter.ai) otherCharacter.counterAttack(this);
    }

    counterAttack(otherCharacter) {
        this.move(otherCharacter.x, this.y, this.speed);
    }

    position(x, y) {
        this.x = x;
        this.y = y;
        this.img.css({
            "left": x * 100 + "%",
            "top": y * 100 + "%",
            // in this way the outer borders will always stay within the window
            "transform": "translate(-" + x * 100 + "%, -" + y * 100 + "%)"
        });
        $("#mainWindow").append(this.img);
    }

    move(x, y) {
        // 500 ms by default
        this.move(x, y, 500);
    }

    move(x, y, interval) {
        this.img.animate({"left": x * 100 + "%", "top": y * 100 + "%"},
            {"step": function(){
                $(this).css({"transform": "translate(-" + 
                parseInt($(this)[0].style.left) + "%, -" + 
                parseInt($(this)[0].style.top) + "%)"
                });
            }, 
            "duration": interval,
            "complete": () =>{
                this.x = x;
                this.y = y;
            }}
        );
    }
}

function fight(char1, char2) {
    while (char1.hp > 0 && char2.hp > 0) {
    }
}