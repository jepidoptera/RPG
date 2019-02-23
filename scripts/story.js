/*jshint esversion: 6 */
/*jshint multistr: true */
var storyLine = -1;
var yourCharacter = null;
var opponent = null;
var characters = [];
var sorcerorKing;
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

    // create the four basic characters
    initCharacters();
    // create the evil king
    var kingName =  randomName(9 + Math.round(Math.random())); // "Babadoligo";
    sorcerorKing = new character(kingName, 'images/goatman.jpg', 200, 10, 10, 8, 
    [deathstrike, whirlwind, armorOfSatan, lastGasp]);

    // // debug, go straight to the bossfight
    // yourCharacter = characters[0];
    // yourCharacter.manifest(0.333, 0.5);

    // storyLine = 8;
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

function initCharacters() {
    // create four characters≈≈
    characters = [
        new character('berserker', 'images/berserker.png', 100, 5, 0, 6, [bloodFrenzy]),
        new character('antimage', 'images/antimage.png', 50, 7, 5, 7, [nullField]),
        new character('shieldbearer', 'images/shieldbearer.png', 80, 9, 0, 5, [defend]),
        new character('monk', 'images/monk.png', 70, 0, 10, 4, [armorOfGod])
    ];
    // monk beats shieldbearer.
    // shieldbearer beats antimage.
    // antimage beats berserker.
    // berserker beats monk.
}

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
        characters[0].manifest(0.05, 0.05);
        characters[1].manifest(0.05, 0.95);
        characters[2].manifest(0.95, 0.05);
        characters[3].manifest(0.95, 0.95);
        // show character info on hover
        characters.forEach(element => {
            $(element.img)
            .addClass("highlight")
            .mouseover( () => {
                refreshStats($("#statsWindow"), element, "full");
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
        bannerMessage("");
        $("#opponentStats").hide();
        $("#statsWindow").hide();
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
        // characters.forEach(element => {
        //     if (element != yourCharacter) {
        //         element.move( -1, -1);
        //     }
        // });
        // boss fight
        setTimeout(() => {
            yourCharacter.special = [bloodFrenzy, armorOfGod, nullField, defend];
            characters.push(sorcerorKing);
            opponent = sorcerorKing;
            sorcerorKing.manifest(0.666, 0);
            sorcerorKing.move(0.666, 0.5, 5000);
            sorcerorKing.spin(-1800, 5000);
            refreshAllStats();
            fight();
            }, 3000);
        break;
    }
}

function chooseOpponent() {
    setupBackBench();
    bannerMessage("Choose your opponent:");
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
            $(".characterImg").off("mouseover mouseleave click");
            // reset remaining characters
            setupBackBench();
            // continue the story
            continueStory();
        })
        .addClass("highlight")
        .mouseover( () => {
            refreshStats($("#statsWindow"), element, "full");
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
    var turn = 0;
    var round = 0;

    // activate special abilities
    yourCharacter.useSpecial();
    opponent.useSpecial();

    // show stats for both characters
    $("#statsWindow").show().css({"top": "50%", "left": "20%", "display": "block", "transform": "translate(-50%, -50%)", "position": "absolute", "z-index": "9"});
    $("#opponentStats").show().css({"top": "50%", "left": "80%", "display": "block", "transform": "translate(-50%, -50%)", "position": "absolute", "z-index": "9"});
    refreshStats($("#statsWindow"), yourCharacter, "min-open");
    refreshStats($("#opponentStats"), opponent, "min");
    // clear highlighting
    $(".characterImg").removeClass("highlight");
    // set them against each other
    yourCharacter.active = true;
    opponent.active = true;
    yourCharacter.ai = false;
    var blocked = false;

    // fighting time
    yourTurn();

    var gameloop = setInterval(() => {
        // have the opponent bounce around
        if (!opponent.attacking()){
            if (opponent.y < 0.3){
                opponent.move(0.666, 0.75, opponent.speed * 2 / difficulty);
            }
            else {
                opponent.move(0.666, 0.25, opponent.speed * 2 / difficulty);
            }
        }
        // check if dead (either you or opponent)
        if (yourCharacter.dead) {
            clearInterval(gameloop);
            lose();
        }
        else if (opponent.dead) {
            // stop game loop
            clearInterval(gameloop);
            // victory
            win();
        }   
    }, opponent.speed * 1.9 / difficulty);
    // prepare to strike
    // use addeventListener instead of .on because it doesn't cause weird bug!
    document.addEventListener("keydown", attackKeys);

    function attackKeys (event) {
        // attack
        if (event.key == " ") {
            if (turn == 0) {
                // your turn - attack
                // select default special if none is selected
                // if (yourCharacter.activeSpecial == null) yourCharacter.selectSpecial(yourCharacter.special[0].id);
                yourCharacter.attack(opponent);
                turn = 1;
                compAttack();
                console.log("comp attacking");
                // allow (one) block attempt
                blocked = false;
            } 
            else if (opponent.attacking() && !blocked && opponent.strength > 0) {
                // opponent's turn - block/counterstrike
                blocked = true;
                if (opponent.attacking() > opponent.speed) {
                    // too quick - ineffective!
                    delay = now() + 400 * difficulty;
                    console.log(opponent.attacking(), opponent.speed);
                    yourCharacter.buffText("Too Early!", "white");
                    return;
                }
                console.log("counterattacking...");
                yourCharacter.counterAttack(opponent);
                // return to center
                setTimeout(() => {
                    yourCharacter.move(0.333, 0.5, yourCharacter.speed);
                }, 800);
            }
        }
        // cheats
        else if (event.key == "+") {
            yourCharacter.baseStrength += 6;
            refreshAllStats();
        }
        else if (event.key == "-") {
            yourCharacter.baseStrength -= 6;
            refreshAllStats();
        }
    }
    
    function compAttack() {
        // wait, then return attack
        var delay = yourCharacter.speed * 5 + opponent.speed * (3 + Math.random());
        setTimeout(() => {
            if (!opponent.dead){
                if (opponent.strength > 0){
                    bannerMessage("Prepare to defend!", "Tap space when your character flashes red for maximum " + 
                        ((yourCharacter.name == "shieldbearer") 
                        ? " blocking power." 
                        : " counter-attack damage."));
                }
                else if (!nullFieldActive || !opponent.activeSpecial.isMagic) {
                    bannerMessage("Wait for it...");
                }
                else if (opponent.activeSpecial == armorOfGod) {
                    bannerMessage(opponent.name + " can't heal!", "Null field is blocking his abilities.");
                }
            }
        }, delay - 2000);            
        setTimeout(() => {
            opponent.attack(yourCharacter);
        }, delay);
        // then your turn again
        setTimeout(() => {
            // change up special
            opponent.think();
            yourTurn ();
        }, delay + opponent.speed * 2 + 1000);
    }

    function yourTurn () {
        // your turn again
        round ++;
        if (opponent.dead) return;
        // if (round == 1 && yourCharacter.special.length > 1) {
        //     bannerMessage("<-- Choose your special ability", "You can change it again next round.");
        // }
        // else {
            UpdateBanner();
        // }
        // allow a new choice of special
        // if (yourCharacter.special.length > 1) yourCharacter.activeSpecial = null;
        refreshStats($("#statsWindow"), yourCharacter, "min-open");
        turn = 0;        
    }
    
    function win() {
        // cancel keydown
        document.removeEventListener("keydown", attackKeys);            
        // gain your opponents' abilities
        yourCharacter.special = yourCharacter.special.concat(opponent.special);
        // move along
        setTimeout(() => {
            continueStory();
        }, 2400);
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

function bannerMessage(message, subtext) {
    if (message != "" && message != undefined) 
        $("#banner").show().text(message);
    else
        $("#banner").hide();
    if (subtext != "" && subtext != undefined) 
        $("#subtext").show().text(subtext);    
    else
        $("#subtext").hide();
}

function UpdateBanner(){
    if (opponent.dead) return;
    if (yourCharacter.name == "monk" && yourCharacter.strength == 0) {
        if (nullFieldActive){
            bannerMessage("You can't heal!", "Null field is blocking your abilities.");
        }
        else bannerMessage("Press spacebar to heal!");
    }
    else if (yourCharacter.strength > 0) {
        bannerMessage("Press spacebar to attack!", "Time your attack for maximum damage.");    
    }
    else {
        bannerMessage("");
    }
}

function clickSpecial(special) {
    yourCharacter.selectSpecial(special);
    // do button select animation
    // highlight (only) that button
    $(".specialButton").removeClass("specialSelect");
    // $("#" + yourCharacter.activeSpecial.id).addClass("specialSelect");
    // and refresh your stats (close choices)
    setTimeout(() => {
        refreshStats($("#statsWindow"), yourCharacter, "min-closed");
        UpdateBanner();
    }, 500);
}

function refreshAllStats() {
    refreshStats ($("#statsWindow"), yourCharacter, "min");
    refreshStats ($("#opponentStats"), opponent, "min");    
}

function refreshStats ($div, character, style) {
    // get mods up to date
    character.useSpecial();
    var html = "HP: " +
    // show stats in blue when they're modified by magic
    ((character.hpMod > 0)
        ? '<span style="color: skyblue">' + character.hp + " / " + character.maxHp + "</span><br><br>"
        : character.hp + " / " + character.maxHp + "<br><br>"
    ) + "ATTACK: " +
    ((character.strengthMod > 0)
        ? '<span style="color: skyblue">' + character.strength + "</span><br><br>"
        : character.strength + "<br><br>"
    ) + "COUNTER-ATTACK: " +
    ((character.counterMod > 0)
        ? '<span style="color: skyblue">' + character.counter + "</span><br><br>"
        : character.counter + "<br><br>"
    );
    if (style.slice(0,3) == "min") {
        html +=
        // show an open menu of possible specials on your character's turn
        ((character == yourCharacter && 
        yourCharacter.special.length > 1 && 
        style.slice(4) == "open")
            // show all specials (collect them all!)
            // also, don't worry about what all this means, just know that it works
            ? character.special.map((special) => { 
                return '<div id="' + special.id + '" \
                class="specialButton" ' +
                // onclick="clickSpecial(\'' + special.id + '\')" \
                '>' + special.name + 
                ((special.isMagic) 
                    ? ((!nullFieldActive || nullFieldActive == character.name) 
                        ? " (magic)" 
                        : '<span style ="color: red"> (nullified!)</span>')
                    : ""
                ) + '</div>';}).join("<br>")
            : character.activeSpecial.name + ((!character.activeSpecial.isMagic) ? ""
                : ((!nullFieldActive || nullFieldActive == character.name) 
                    ? " (magic)" 
                    : '<span style ="color: red"> (nullified!)</span>')
                ) + 
        ("<br><br>") );

        $div
        .css ({"width": "150px"})
        .html(html)
        .show();
        // $("#" + yourCharacter.activeSpecial.id).addClass("specialSelect");
    }
    else {
        html =  "<h2>" + character.name.toUpperCase() + "</h2> <br>" + html +
        // explicitly show speed
        "SPEED: " + character.quickness + "<br><br>" +
        // these characters will only have one special
        "SPECIAL: " + character.special[0].name + ((character.special[0].isMagic)
        ? (!nullFieldActive ? " (magic)" : "<style ='color:red'>(nullified!)</style>")
        : "") +
        // full description
        "<br><hr>" + character.special[0].description;
        $div
        .css ({"width": "250px"})
        .html(html)
        .show();
        }
}

