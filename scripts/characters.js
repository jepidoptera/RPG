// character 0 : berserker: attack power increases each time. beats monk.
// character 1 : antimage : nullifies other characters' powers. beats berserker.
// character 2 : shieldbearer : shield
// character 4 : monk : heals

class character {
    constructor (name, img, maxHp, strength, counter, speed, special) {
        this.name = name;
        this.img = $('<div>')
        .append(
            $("<img>")
            .attr('src', img).css({
                "position": "absolute",
                "width": "100%"})
        )
        // .attr('src', img).css({
        //     "position": "absolute",
        //     "width": "10%"})
        .addClass('characterImg');
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
        this.paused = false;
    }

    attack(otherCharacter) {
        // delay ability of next attack
        if (this.attacking() > 0) return;
        this.nextAttack = now() + this.speed * 2;
        // animate? yes
        this.move(otherCharacter.x, this.y);
        // half a second     
        setTimeout(() => this.hit(otherCharacter), this.speed)
        // move back afterward and use special
        var self = this; var x = this.x; var y = this.y;
        setTimeout(() => {this.move(x, y, this.speed); this.useSpecial()}, this.speed);
    }

    attacking() {
        // currently in the middle of an attack?
        // returns > 0 if true
        return this.nextAttack - now();
    }

    hit(otherCharacter) {
        // the better your timing, the more damage you do
        var directness = 1 - Math.abs(this.y - otherCharacter.y);
        var damage = this.strength * directness;
        otherCharacter.hp -= damage;
        // tire? haven't iplemented this yet, or decided how to
        this.stamina -= 1;
        // computer controlled player will automatically counterattack
        if(otherCharacter.ai) setTimeout(() => {
            otherCharacter.counterAttack(this);
        }, otherCharacter.speed);
        this.pause(damage * 75);
        otherCharacter.pause(damage * 75);
        // show damage
        $(otherCharacter.img).append(
            $("<div class=hpPopup></div>")
            .text("-" + damage)
            .css({"top": "0px"})
            .animate({"top": "0%"}, 
                {"duration": 750, 
                "complete": function() {$(this).remove();}
            })
            .fadeOut(750)
        );        
    }

    counterAttack(otherCharacter) {
        var opponent = otherCharacter;
        setTimeout(() => {
            () =>{this.move(opponent.x, opponent.y, this.speed / 2);}
        }, this.speed); 
    }

    useSpecial(){
        switch (this.special) {
        case "Null Field":
            break;
        }
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

    move(x, y, interval) {
        var self = this;
        var paused = this.pauseRemaining();
        var destX = x * 100 + "%";
        var destY = y * 100 + "%";
        // come back when the pause is over
        if (paused > 0) {
            setTimeout(() => {
                this.move(x, y, interval);
            }, paused + 1);
            return;
        }
        this.img
        .stop(true, false)
        .animate({"left": destX, "top": destY},
            {"step": function(){
                // update coordinates
                self.x = parseInt($(this)[0].style.left) / 100;
                self.y = parseInt($(this)[0].style.top) / 100;
                // keep it within the screen bounds
                $(this).css({"transform": "translate(-" + 
                parseInt($(this)[0].style.left) + "%, -" + 
                parseInt($(this)[0].style.top) + "%)"
                });

            }, 
            "duration": interval,
            "complete": () =>{
                self.x = x;
                self.y = y;
            }}
        );
    }

    pause(miliseconds){
        this.img.pause();
        this.nextAttack += miliseconds;
        setTimeout(() => {
           this.img.resume(); 
        }, miliseconds);
        this.pausedAt = now();
        this.pausedFor = miliseconds;
    }

    pauseRemaining() {
        // how long will it be paused for, starting now?
        // will return 0 if not paused.
        return Math.max(0, this.pausedFor + this.pausedAt - now());
    }
}