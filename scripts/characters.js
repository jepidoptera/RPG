// jshint esversion: 6

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
        // base stats
        this.baseMaxHp = maxHp;
        this.baseHp = maxHp;
        this.baseStrength = strength;
        this.baseCounter = counter;
        // for stats window
        this.quickness = speed;
        // for actual delay between actions
        this.baseSpeed = parseInt(2400 / speed);
        // modifiers
        this.hpMod = 0;
        this.strengthMod = 0;
        this.counterMod = 0;
        this.speedMod = 1;
        this.special = special;
        this.activeSpecial = special[0];
        this.x = 0;
        this.y = 0;
        this.dead = false;
        this.active = false;
        this.ai = true;
        this.paused = false;
    }

    get maxHp() {return this.baseMaxHp + this.hpMod;}
    get hp() {return this.baseHp + this.hpMod;}
    get strength() {return this.baseStrength + this.strengthMod;}
    get counter() {return this.baseCounter + this.counterMod;}
    get speed() {return this.baseSpeed / this.speedMod;}

    attack(otherCharacter) {
        // don't do this if dead
        if (this.dead) return;
        // delay possibility of next attack
        if (this.attacking()) return;
        this.nextAttack = now() + this.speed * 2;
        // animate? yes
        if (this.strength > 0) {
            this.move(otherCharacter.x + 0.1 * Math.sign(this.x - otherCharacter.x), this.y, this.speed);
            setTimeout(() => {this.hit(otherCharacter);}, this.speed);
        }
        // console.log(otherCharacter.x + 0.1 * Math.sign(this.x - otherCharacter.x));
        // half a second     
        // move back afterward and use special
        var x = this.x; var y = this.y;
        setTimeout(() => {
            this.move(x, y, this.speed); 
            // activate special
            this.useSpecial();
        }, this.speed);
    }

    attacking() {
        // currently in the middle of an attack?
        // returns > 0 if true, 0 if false
        return Math.max(0, this.nextAttack - now());
    }

    hit(otherCharacter) {
        // the better your timing, the more damage you do
        var skill = 1 - Math.abs(this.y - otherCharacter.y) * 2;
        console.log("attack skill: " + skill);
        this.damage = Math.ceil(this.strength * skill);
        // computer controlled player will automatically counterattack
        if(otherCharacter.ai) setTimeout(() => {
            otherCharacter.counterAttack(this);
        }, Math.random() * (this.speed / difficulty));
        // freeze to show damage
        this.pause(Math.min(1000, this.damage * 75));
        // turn defender's border briefly red
        otherCharacter.img.css({"border": "4px solid red"});
        setTimeout(() => {
            otherCharacter.img.css({"border": "1px solid black"});
        }, 100);
        // otherCharacter.pause(this.damage * 75);
        // pause, then show damage (give other character a chance to defend)
        setTimeout(() => {
            this.hurt(otherCharacter);
        }, Math.min(1000, this.damage * 75));
    }

    counterAttack(otherCharacter) {
        var timeRemaining = otherCharacter.attacking();
        var skill = Math.max(0, timeRemaining / otherCharacter.speed);

        // don't do this if you're dead
        if (this.dead) return;

        // let the human character know how they did
        if (!this.ai) {
            if (skill < 0.5){
                this.buffText("weak!", "white");
            }
            else if (skill < 0.8){
                this.buffText("slightly late!", "white");
            }
            else if (skill < 0.95){
                // good, but not quite perfect
                this.buffText("excellent!", "white");
            }
            else {
                skill = 1;
                this.buffText("perfect!", "white");
            }
        }

        // shieldbearer blocks instead of counterattack
        // if (this.special.map((special) => {return special.name;}).indexOf("Defend") >= 0) {
        if (this.activeSpecial.name == "Defend") {
            console.log("block skill: " + skill);
            // prevent damage
            console.log(otherCharacter.damage + " -> " + Math.floor(otherCharacter.damage * (1 - skill)));
            otherCharacter.damage = Math.floor(otherCharacter.damage * (1 - skill));
            // defensive border
            this.img.css({"border": skill * skill * 20 + "px solid white"});
            this.img.delay(500).css({"border": "1px solid black"});
        }
        // normal counterattack
        console.log("counter skill: " + skill);
        // adjust damage
        this.damage = Math.ceil(this.counter * skill);
        console.log("damage: " + this.damage);
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

    hurt(otherCharacter) {
        otherCharacter.baseHp -= this.damage;
        otherCharacter.buffText("-" + this.damage, "red");
        if (otherCharacter.hp + otherCharacter.hpMod <= 0) {
            otherCharacter.die();
        }
    }

    die() {
        this.dead = true;
        this.damage = 0;
        // spin and drop off the screen
        this.img
            .stop(true, false)
            .animate({"top": "150%"}, {"duration": 1000});
        this.spin(360, 1000);
    }

    useSpecial(){
        // check null field first, because it affects everything else
        checkNullField();
        // clear stat mods
        this.strengthMod = 0;
        this.hpMod = 0;
        this.counterMod = 0;
        this.speedMod = 1;
        // apply effects
        if (!nullFieldActive || !this.activeSpecial.isMagic) {
            // if it hasn't been nullified, do the thing
            switch (this.activeSpecial) {
            case armorOfGod:
                // can't heal and attack both
                this.strengthMod = -this.baseStrength;
                // only activates once per turn    
                if (!this.attacking()) return;
                var heal = Math.min(7, this.maxHp - this.hp);
                console.log("healed " + heal);
                this.baseHp += heal;
                if (heal > 0) this.buffText("+" + heal, "green");
                return;
            case bloodFrenzy:
                // only activates once per turn    
                if (!this.attacking()) return;
                this.baseStrength += 4;
                setTimeout(() => {this.buffText("+4 attack", "blue");}, 2000);
                return;
            case defend:
                // nothing here, this is activated on counterattack
                return;
            case armorOfSatan:
                this.counterMod = 99; break;
            case deathstrike:
                this.strengthMod = 99; break;
            case whirlwind:
                this.speedMod = 2; break;
            case lastGasp:
                this.hpMod = 100; break;

            }
        }
        // });
    }

    selectSpecial (specialId) {
        // activate the special with the given name (if a string was passed)
        if (typeof(specialId) == "string")
            yourCharacter.activeSpecial = yourCharacter.special[
            yourCharacter.special.map((special) => {return special.id;}).indexOf(specialId)
        ];
        else // the other option is just to pass a reference to the special itself
            yourCharacter.activeSpecial = specialId;

        // refresh opponent stats (in case they were affected)
        refreshStats($("#opponentStats"), opponent, "min");
        // highlight (only) that button
        $(".specialButton").removeClass("specialSelect");
        $("#" + yourCharacter.activeSpecial.id).addClass("specialSelect");
        // and refresh your stats (close choices)
        setTimeout(() => {
            refreshStats($("#statsWindow"), yourCharacter, "min-closed");
            if (yourCharacter.activeSpecial.name == "Armor of God") {
                bannerMessage("Press spacebar to heal!");
            }
            else {
                bannerMessage("Press spacebar to attack!", "Time your attack for maximum damage.");    
            }
        }, 500);
    }

    buffText(text, color) {
        if (color == undefined) color = "red";
        $(this.img).append(
            $("<div class=popUp></div>")
            .text(text)
            .animate({"top": "-50%"}, 
                {"duration": 750, 
                "complete": function() {$(this).remove();}
            })
            .css({"color": color})
            .fadeOut(750)
        );        
        refreshAllStats();
    }

    manifest(x, y) {
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
        if (this.dead) {
            // can't move when dead
            return;
        }
        // come back when the pause is over
        else if (paused > 0) {
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

    spin(angle, duration) {
        // border won't rotate properly, so hide it
        var border = this.img.css('border');
        this.img.css({'border': 0});
        this.img.children().rotate({angle: 0, center: ["50%", "50%"], animateTo: angle, "duration": duration});
        setTimeout(() => {
            this.img.css({'border': border});
        }, duration);
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

var armorOfGod = {
    name: "Armor of God", 
    description: "Recovers 7 hp every round.", 
    isMagic: true,
    id: "armorofgod"
};

var bloodFrenzy = {
    name: "Blood Frenzy", 
    description: "Each time this charcter attacks, his strength increases by 4.", 
    isMagic: true,
    id: "bloodfrenzy"
};

var nullField = {
    name: "Null Field", 
    description: "Magical abilities don't work when fighting Anitmage.", 
    isMagic: false,
    id: "nullfield"
};

var defend = {
    name: "Defend", 
    description: "Can deflect damage with a well-timed shield block.", 
    isMagic: false,
    id: "defend"
};

var armorOfSatan = {
    name: "Armor of Satan (+99 counterattack)", 
    description: "+99 counterattack.", 
    isMagic: true,
    id: "armorofsatan"
};

var deathstrike = {
    name: "Death Strike (+99 attack)", 
    description: "+99 attack.", 
    isMagic: true,
    id: "deathstrike"
};

var whirlwind = {
    name: "Whirlwind (Double Speed)", 
    description: "Double speed.", 
    isMagic: true,
    id: "whirlwind"
};

var lastGasp = {
    name: "Last Gasp", 
    description: "+100 hp.", 
    isMagic: false,
    id: "lastgasp"
};

// create four characters≈≈
characters = [
    new character('berserker', 'images/berserker.png', 75, 4, 5, 6, [bloodFrenzy]),
    new character('antimage', 'images/antimage.png', 50, 16, 5, 7, [nullField]),
    new character('shieldbearer', 'images/shieldbearer.png', 100, 9, 0, 5, [defend]),
    new character('monk', 'images/monk.png', 60, 0, 10, 4, [armorOfGod])
];

function checkNullField() {
    // does anyone, anywhere, have a null field on?
    nullFieldActive = false;
    characters.forEach((character) => {
        if (!character.dead && character.active) {
            if (character.activeSpecial == nullField) {
                nullFieldActive = true;
            }
        }
    });
}
