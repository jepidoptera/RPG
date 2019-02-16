// character 0 : berserker: attack power increases each time. beats monk.
// character 1 : antimage : nullifies other characters' powers. beats berserker.
// character 2 : shieldbearer : shield
// character 4 : monk : heals

class character {
    constructor (name, img, maxHp, strength, counter, special) {
        this.name = name;
        this.img = $('<img>').attr('src', img).css({
            "position": "absolute",
            "width": "10%"
        }).addClass('characterImg');
        this.maxHp = maxHp;
        this.hp = this.maxHp;
        this.strength = strength;
        this.counter = counter;
        this.special = special;
        this.x = 0;
        this.y = 0;
    }

    attack(otherCharacter) {
        // animate?
        otherCharacter.hp -= this.strength;
        this.stamina -= 1;
        otherCharacter.counterAttack(this);
    }

    counterAttack(otherCharacter) {
        otherCharacter.hp -= this.counter;
    }

    position(x, y) {
        this.x = x;
        this.y = y;
        this.img.css({
            "left": x * 100 + "%",
            "top": y * 100 + "%",
            // in this way the outer borders will always stay within the window
            "transform": "translate(-" + x * 100 + "%, -" + y * 100 + "%)"
        })
        $("#mainWindow").append(this.img);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.img.animate({"left": x * 100 + "%", "top": y * 100 + "%"})
    }
}