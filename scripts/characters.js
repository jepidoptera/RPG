// character 0 : berserker: attack power increases each time. beats monk.
// character 1 : antimage : nullifies other characters' powers. beats berserker.
// character 2 : shieldbearer : shield
// character 4 : monk : heals

var nullFieldActive = false;

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
        // for stats window
        this.quickness = speed;
        // for actual delay between actions
        this.speed = parseInt(2400 / speed);
        this.special = special;
        this.x = 0;
        this.y = 0;
        this.dead = false;
        this.ai = true;
        this.paused = false;
    }

    attack(otherCharacter) {
        // delay possibility of next attack
        if (this.attacking()) return;
        this.nextAttack = now() + this.speed * 2;
        // animate? yes
        if (this.strength > 0) {
            this.move(otherCharacter.x + 0.1 * Math.sign(this.x - otherCharacter.x), this.y, this.speed);
            setTimeout(() => {this.hit(otherCharacter)}, this.speed);
        }
        // console.log(otherCharacter.x + 0.1 * Math.sign(this.x - otherCharacter.x));
        // half a second     
        // move back afterward and use special
        var x = this.x; var y = this.y;
        setTimeout(() => {this.move(x, y, this.speed); this.useSpecial()}, this.speed);
    }

    attacking() {
        // currently in the middle of an attack?
        // returns > 0 if true, 0 if false
        return Math.max(0, this.nextAttack - now());
    }

    hit(otherCharacter) {
        // the better your timing, the more damage you do
        var skill = 1 - Math.abs(this.y - otherCharacter.y) * 2;
        this.damage = Math.ceil(this.strength * skill);
        // computer controlled player will automatically counterattack
        if(otherCharacter.ai) setTimeout(() => {
            otherCharacter.counterAttack(this);
        }, otherCharacter.speed);
        // other character's special activates
        otherCharacter.special;
        // freeze to show damage
        this.pause(this.damage * 75);
        // turn defender's border briefly red
        otherCharacter.img.css({"border": "4px solid red"});
        setTimeout(() => {
            otherCharacter.img.css({"border": "2px solid black"});
        }, 100);
        // otherCharacter.pause(this.damage * 75);
        // pause, then show damage (give other character a chance to defend)
        setTimeout(() => {
            this.hurt(otherCharacter);
        }, this.damage * 75);
    }

    counterAttack(otherCharacter) {
        // shieldbearer blocks instead of counterattack
        if (this.special.name == "Defend") {
            this.block(otherCharacter);
            return;
        }
        // caculate skill (timing)
        var skill = Math.max(0, otherCharacter.speed / 
            (otherCharacter.attacking() + (otherCharacter.attacking() - otherCharacter.speed) * difficulty));
        console.log("counter skill: " + skill);
        // adjust damage
        this.damage = Math.ceil(this.counter * skill);
        // set up animations
        var x = this.x; var y = this.y;
        this.move(x + (0.1 * Math.sign(x - 0.5)), otherCharacter.y, this.speed / 4);
        setTimeout(() => {
            this.move(x , otherCharacter.y, this.speed / 4);
        }, this.speed / 4); 
        setTimeout(() => {
            this.hurt(otherCharacter);
        }, this.speed / 2);
    }

    block(otherCharacter) {
        var timeRemaining = otherCharacter.attacking();
        var skill = Math.max(0, timeRemaining / otherCharacter.speed);
        console.log("block skill: " + skill);

        otherCharacter.damage = Math.floor(otherCharacter.damage * (1 - skill));
        this.img.animate({"border": skill * skill * 20 + "px solid white"});

        // let them know how they did
        if (skill < 0.5){
            this.buffText("weak!", "white");
        }
        else if (skill < 0.75){
            this.buffText("slightly late!", "white");
        }
        else if (otherCharacter.damage > 0){
            // good, but not quite perfect
            this.buffText("excellent!", "white");
        }
        else {
            console.log("perfect: " + otherCharacter.damage)
            this.buffText("perfect!", "white");
        }
        // prevent damage
    }

    hurt(otherCharacter) {
        otherCharacter.buffText("-" + this.damage, "red");
        otherCharacter.hp -= this.damage;
        if (otherCharacter.hp <= 0) {
            otherCharacter.die();
        }
    }

    die() {

    }

    useSpecial(){
        // null field cancels magical effects
        if (nullFieldActive && this.special.isMagic) return;
        // otherwise, do the thing
        switch (this.special.name) {
        case "Null Field":
            nullFieldActive = true;
            break;
        case "Armor of God":
            // only once per turn    
            if (!this.attacking()) return;
            if (this.hp < this.maxHp) this.buffText("+" + Math.min(7, this.maxHp - this.hp), "green");
            this.hp = Math.min(this.maxHp, this.hp + 7);
            break;
        case "Blood Frenzy":
            // only once per turn    
            if (!this.attacking()) return;
            this.strength += 4;
            setTimeout(() => {this.buffText("+4", "blue");}, this.speed);
            break;
        case "Defend":
            break;
        }
    }

    buffText(text, color) {
        if (color == undefined) color = "red";
        $(this.img).append(
            $("<div class=hpPopup></div>")
            .text(text)
            .animate({"top": "-50%"}, 
                {"duration": 750, 
                "complete": function() {$(this).remove();}
            })
            .css({"color": color})
            .fadeOut(750)
        );        
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
        // this.nextAttack += miliseconds;
        setTimeout(() => {
           this.img.resume(); 
        }, miliseconds);
        this.pausedAt = now();
        this.pausedFor = miliseconds;
        // console.log("paused (" + miliseconds + ")");
    }

    pauseRemaining() {
        // how long will it be paused for, starting now?
        // will return 0 if not paused.
        return Math.max(0, this.pausedFor + this.pausedAt - now());
    }
}