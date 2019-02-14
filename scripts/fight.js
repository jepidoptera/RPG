// character 0 : berserker: attack power increases each time
// character 1 : antimage : nullifies other characters' powers
// character 2 : knight : shield
// character 4 : cleric : heals

class character {
    constructor (img, maxHp, attack, counter, special) {
        this.img = $('img').attr('src', img);
        this.maxHp = maxHp;
        this.attack = attack;
        this.counter = counter;
        this.special = special
    }
}