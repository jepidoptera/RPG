// jshint esversion: 6
var armorOfGod = {
    name: "Armor of God", 
    description: "Recovers 7 hp every round.", 
    isMagic: true,
    id: "armorofgod"
};

var bloodFrenzy = {
    name: "Blood Frenzy", 
    description: "Culumative +5 attack per round. +5 counterattack.", 
    isMagic: true,
    id: "bloodfrenzy"
};

var nullField = {
    name: "Null Field", 
    description: "+9 attack.  Magical abilities don't work when fighting Anitmage.", 
    isMagic: true,
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
    description: "+50 hp.", 
    isMagic: false,
    id: "lastgasp"
};

function checkNullField() {
    // does anyone, anywhere, have a null field on?
    nullFieldActive = false;
    characters.forEach((character) => {
        if (!character.dead && character.active) {
            if (character.activeSpecial == nullField) {
                // attribute the field to this character
                nullFieldActive = character.name;
            }
        }
    });
}

Object.defineProperty(character.prototype, "useSpecial", {
    value: function useSpecial() {
    // check null field first, because it affects everything else
    checkNullField();
    // clear stat mods
    this.strengthMod = 0;
    this.hpMod = 0;
    this.counterMod = 0;
    this.speedMod = 1;
    // apply effects
    if (!nullFieldActive || !this.activeSpecial.isMagic || nullFieldActive == this.name) {
        // if it hasn't been nullified, do the thing
        switch (this.activeSpecial) {
        case nullField:
            strengthMod = 9;
            break;
        case armorOfGod:
            // can't heal and attack both
            this.strengthMod = -this.baseStrength;
            // only activates once per turn    
            if (this.usedSpecial || !this.attacking()) break;
            this.usedSpecial = true;
            var heal = Math.min(7, this.maxHp - this.hp);
            console.log("healed " + heal);
            this.baseHp += heal;
            if (heal > 0) {
                // note:
                // has to be a timeout here, because bufftext calls refreshstats,
                // which calls usespecial, and that would keep happening until the monk regained full hp
                setTimeout(() => {
                    this.buffText("+" + heal, "green");
                }, 500);
            }
            break; 
        case bloodFrenzy:
            // counterattack boost
            this.counterMod = 5;
            // only activates once per turn    
            if (this.usedSpecial || !this.attacking()) break;
            this.usedSpecial = true;
            this.baseStrength += 5;
            setTimeout(() => {this.buffText("+5 attack", "blue");}, 2000);
            break;
        case defend:
            // nothing here, this is activated on counterattack
            break;
        case armorOfSatan:
            this.counterMod = 99; break;
        case deathstrike:
            this.strengthMod = 99; break;
        case whirlwind:
            this.speedMod = 2; break;
        case lastGasp:
            this.hpMod = 50; break;
        }
    }
    }
});
