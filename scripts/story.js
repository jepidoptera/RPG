/*jshint esversion: 6 */
/*jshint multistr: true */
var storyLine = -1;
var yourCharacter = null;
var opponent = null;
var characters = [];
var difficulty = 1;
var opponentsRemaing = 3;

$(document).ready(function() {
    // when the DOM is ready
    $("#statsWindow").hide();
    $("#banner").hide();
    $("#opponentStats").hide();
    var img = new Image();
    $(img).addClass('backgroundImg');
    // $(img).width = "100%"
    // $(img).height = "100%"

    // fade in background
    $(img)
    .hide()
    .attr('src', 'images/mountain.jpg')
    .fadeIn(3000);

    // add it to the page
    $('body').append($(img));

    // create four characters
    characters = [
        new character('berserker', 'images/berserker.png', 75, 4, 5, 6, [{"name": "Blood Frenzy", "description": "Each time this charcter attacks, his strength increases by 4.", "isMagic": true}]),
        new character('antimage', 'images/antimage.png', 50, 16, 5, 7, [{"name": "Null Field", "description": "Magical abilities don't work when fighting Anitmage.", "isMagic": false}]),
        new character('shieldbearer', 'images/shieldbearer.png', 100, 9, 0, 5, [{"name": "Defend", "description": "Can deflect damage with a well-timed shield block.", "isMagic": false}]),
        new character('monk', 'images/monk.png', 60, 0, 10, 4, [{"name": "Armor of God", "description": "Recovers 7 hp every round.", "isMagic": true}])
    ];

    // create the king
    var kingName =  randomName(9 + Math.round(Math.random())); // "Babadoligo";
    sorcerorKing = new character(kingName, 'images/death.jpg', 600, 10, 10, 4, {"name": "Armor of God (magic)", "description": "Recovers 7 hp every round."})

    // // debug, go straight to the fight
    // yourCharacter = characters[0];
    // // opponent = characters[2];

    // characters[0].position(0.25, 0.25);
    // characters[1].position(0.25, 0.75);
    // characters[2].position(0.75, 0.25);
    // characters[3].position(0.75, 0.75);

    // yourCharacter.move(0.333, 0.5);
    // // opponent.move(0.666, 0.5);

    // storyLine = 1;
    // continueStory();
    // return;

    // show welcome message after image fades in
    setTimeout(() => {
        msgBox ("Welcome", "You have been captured by the evil sorceror king " + sorcerorKing.name + " and transported to his infamous mountain fortress, where you will be forced to fight for his entertainment.  Your survival is unlikely, but possible if you choose wisely.",
        dialogButtons([ {
            text: "Ok",
            function: continueStory
        }]));
    }, 4000);
});

function continueStory(){
    // advance the storyline
    storyLine++;
    switch (storyLine){
    case 0: 
        $('.backgroundImg')
        .off ('load')
        .attr('src', 'images/walls.jpg');

            // show welcome message after image fades in
            setTimeout(() => {
                msgBox ("Select Character", "The first choice you must make is your own character.  Be advised that whichever you don't pick will become your opponents.  If you manage to defeat them, you will gain their abilities.",
                dialogButtons([{
                    text: "Ok",
                    function: continueStory
                }]));
            }, 1000);
        break;
    
    case 1:
    // choosing character screen    
        // move them to the four corners
        characters[0].position(0.05, 0.05);
        characters[1].position(0.05, 0.95);
        characters[2].position(0.95, 0.05);
        characters[3].position(0.95, 0.95);
        // show character info on hover
        characters.forEach(element => {
            $(element.img)
            .addClass("highlight")
            .mouseover( () => {
                refresh($("#statsWindow"), element);
            })
            .mouseleave(function() {
                $("#statsWindow").hide();
            })
            .on("click", function() {
                // choosing this character
                yourCharacter = element;
                element.move(0.333, 0.5);
                // clear stats
                $("#statsWindow").hide();
                // deactivate click functions
                $(".characterImg").off("click");
                // continue the story
                continueStory();
            });
        });
        break;
    
    case 2:
        // choosing opponet
        setTimeout(() => {
            msgBox ("Select Opponent", "Having drawn the short straw, you will have to fight first.  Your only consolation is that you get to choose your opponent...",
            dialogButtons([{
                text: "Ok",
                function: chooseOpponent
            }]));
        }, 1000);
        break;

    case 3:
        continueStory();
        break;

    case 4:
        // battle scene
        // fight will call continueStory() when it's over    
        fight();
        break;

    case 5:
        msgBox ("Victory!", "Your opponent is beaten.  \
        You have gained: <style='color: blue'>" + opponent.special[0].name + "</style>.  \
        King " + sorcerorKing.name + " is pleased.  \
        But now he demands you fight again!   \
        Who will you choose this time?",
        new dialogButtons([{
            text: "next",
            function: chooseOpponent()
        }]));
        break;

    case 6:
        fight();
        break;

    case 7:
        msgBox ("Victory!", "One more opponent remains...",
        new dialogButtons([{
            text: "next",
            function: () => {
                // default to whoever isn't dead yet
                characters.forEach((character) => {
                    if (character != yourCharacter && !character.dead) {
                        setOpponent(character);
                        fight();
                    }
                });
            }
        }]));
        break;

    case 8:
        // you win - boss??
        msgBox ("Survival!", "You have defeated your opponents and gained their powers.  But can you defeat king " + sorcerorKing.name + "?  Only then can you win your freedom!",
        new dialogButtons([{
            text: "let's try",
            function: continueStory
        }]));
        break;

    case 9:
        // boss fight
        break;
    }

}

function chooseOpponent() {
    setupBackBench();
    $("#banner").show().text("Choose your opponent:");
    // move stats window over a little and hide by default
    $("#statsWindow").css({"left": "70%", "z-index": "9"}).hide();
    // hide opponentStats
    $("#opponentStats").hide();
    $("#subtext").text("Choose wisely!");

    // next choice will give your opponent. 
    // set characters to move into fighting position when chosen
    // extra characters will fill in the back bench at calculated intervals
    characters.forEach((element) => {
        // can't fight yourself
        if (element == yourCharacter) return;
        // otherwise, establish a new click function
        element.img
        .on("click", () => {
            // choose this opponent
            setOpponent(element);
            opponentsRemaing -= 1;
            // deactivate mouse functions
            $(".characterImg").unbind("mouseover mouseleave click");
            // reset remaining characters
            setupBackBench();
            // continue the story
            continueStory();
        })
        .addClass("highlight")
        .mouseover( () => {
            refresh($("#statsWindow"), element);
        })
        .mouseleave(function() {
            $("#statsWindow").hide();
        });
    });
}

function setupBackBench() {
    // position remaining opponents on the right-hand side
    var y = 1 / (opponentsRemaing * 2);
    for (i = 0; i < characters.length; i++) {
        if (characters[i] != yourCharacter && 
            characters[i] != opponent && 
            !characters[i].dead) {
                characters[i].move(0.95, y);
                y += 1 / opponentsRemaing;
        }
    }
}
function setOpponent(character) {
    // chose this one
    opponent = character;
    character.move(0.666, 0.5);
}

function fight(){
    // activate special abilities
    yourCharacter.useSpecial();
    opponent.useSpecial();

    // show stats for both characters
    $("#statsWindow").show().css({"top": "50%", "left": "20%", "display": "block", "transform": "translate(-50%, -50%)", "position": "absolute", "z-index": "9"});
    $("#opponentStats").show().css({"top": "50%", "left": "80%", "display": "block", "transform": "translate(-50%, -50%)", "position": "absolute", "z-index": "9"});
    refresh($("#statsWindow"), yourCharacter, "min");
    refresh($("#opponentStats"), opponent, "min");
    // clear highlighting
    $(".characterImg").removeClass("highlight");
    // fighting time
    $("#banner").show().text("Press spacebar to attack!");
    $("#subtext").show().text("Time your attack for maximum damage.");

    // set them against each other
    yourCharacter.opponent = opponent;
    opponent.opponent = yourCharacter;
    yourCharacter.ai = false;
    var turn = 0;
    var blocked = false;

    // have the opponent bounce around
    var gameloop = setInterval(() => {
        if (!opponent.attacking()){
            if (opponent.y < 0.3){
                opponent.move(0.666, 0.75, opponent.speed * 2 / difficulty);
            }
            else {
                opponent.move(0.666, 0.25, opponent.speed * 2 / difficulty);
            }
        }
        // check if dead
        if (yourCharacter.dead) {
            clearInterval(gameloop);
            lose();
        }
        else if (opponent.dead) {
            // stop game loop
            clearInterval(gameloop);
            // take their abilities
            winBattle();
            // move along
            setTimeout(() => {
                continueStory();
            }, 2400);
        }   
    }, opponent.speed * 2 / difficulty);

    // prepare to strike
    $(document).on("keydown", function(event){
        // attack
        if (event.key == " ") {
            if (turn == 0) {
                // your turn - attack
                yourCharacter.attack(opponent);
                turn = 1;
                compAttack();
                // allow (one) block attempt
                blocked = false;
            } 
            else if (opponent.attacking() && !blocked) {
                // opponent's turn - block/counterstrike
                blocked = true;
                if (opponent.attacking() > opponent.speed) {
                    // too quick - ineffective!
                    delay = now() + 400 * difficulty;
                    console.log(opponent.attacking(), opponent.speed);
                    yourCharacter.buffText("Too Early!", "white");
                    return;
                }
                yourCharacter.counterAttack(opponent);
                // return to center
                setTimeout(() => {
                    yourCharacter.move(0.333, 0.5, yourCharacter.speed);
                }, 800);
            }
        }
        else if (event.keyCode == 38) {
            if (yourCharacter.y > 0.25) {
                
            }
        }
        else if (event.keyCode == 40) {

        }
    });

    function compAttack() {
        // wait, then return attack
        var delay = yourCharacter.speed * 5 + opponent.speed * (3 + Math.random());
        setTimeout(() => {
            if (!opponent.dead){
                $("#banner").show().text("Prepare to defend!");
                $("#subtext").show().text("Tap space at the moment of impact for maximum " + 
                    ((yourCharacter.name == "shieldbearer") 
                    ? " blocking power." 
                    : " counter-attack damage."));
            }
        }, delay - 2000);            
        setTimeout(() => {
            opponent.attack(yourCharacter);
        }, delay);
        // then your turn again
        setTimeout(() => {
            // your turn again
            $("#banner").show().text("Attack!");
            $("#subtext").show().text("Time your attack for maximum damage.");                
            turn = 0;
        }, delay + opponent.speed * 2 + 1000);
    }
}

function randomName(length) {
    // make up a random (pronounceable) name
    var consonants = "b c ch d f g h j k l m n p r s sh t v w x z".split(" ");
    var vowels = "a a e e i o u y".split(" ");
    var word = "";
    letterswitch = [true, false][Math.round(Math.random())];
    for (i = 0; i < length; i++){
        if (letterswitch) word += consonants [Math.floor(Math.random() * consonants.length)];
        else word += vowels [Math.floor(Math.random() * vowels.length)];
        letterswitch = !letterswitch;
    }
    // capitalize
    return word[0].toUpperCase() + word.slice(1);
}

function refreshStats() {
    refresh ($("#statsWindow"), yourCharacter, "min");
    refresh ($("#opponentStats"), opponent, "min");    
}

function refresh ($div, character, style) {
    if (style == "min") {
        $div
        .css ({"width": "150px"})
        .html(
            "HP: " + character.hp + " / " + character.maxHp + "<br><br>" +
            "ATTACK: " + character.strength + "<br><br>" +
            "COUNTER-ATTACK: " + character.counter + "<br><br>" +
            // show all specials (collect them all!)
            character.special.map((special) => {return special.name + ((special.isMagic)
                ? (!nullFieldActive ? " (magic)" : "<div style =\"color: red\">(nullified!)</div>")
                : "");}).join("<br><br>"))
        .show();
    }
    else {
        $div
        .css ({"width": "250px"})
        .html(
            "<h2>" + character.name.toUpperCase() + "</h2> <br>" +
            "HP: " + character.hp + "<br><br>" +
            "ATTACK: " + character.strength + "<br><br>" +
            "COUNTER-ATTACK: " + character.counter + "<br><br>" +
            "SPEED: " + character.quickness + "<br><br>" +
            // these characters will only have one special
            "SPECIAL: " + character.special[0].name + ((character.special[0].isMagic)
            ? (!nullFieldActive ? " (magic)" : "<style ='color:red'>(nullified!)</style>")
            : "") +
            "<br><hr>" + character.special[0].description)
        .show();
        }
}

function winBattle() {
    // gain your opponents' abilities
    yourCharacter.special = yourCharacter.special.concat(opponent.special);
    // deactivate key function
    $('document').off("keydown");
}

function lose() {
    msgBox("Tragedy", "You have died.  Your bones will line the cauldron for one of " + sorcerorKing.name + "'s evil spells.  Don't feel bad - your failure was expected and will not be remembered.",
    new dialogButtons([{
        text: "awww",
        function: () => {
            // fade to black
            $("body").children().fadeOut("slow");
        }
    }]));
}