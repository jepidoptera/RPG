/*jshint esversion: 6 */
var storyLine = -1;
var yourCharacter = null;
var opponent = null;
var characters = [];
var difficulty = 1;

$(document).ready(function() {
    // when the DOM is ready
    $("#statsWindow").hide();
    $("#banner").hide();
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
        new character('berserker', 'images/berserker.png', 75, 4, 5, 6, {"name": "Blood Frenzy", "description": "Each time this charcter attacks, his strength increases by 4.", "isMagic": true}),
        new character('antimage', 'images/antimage.png', 50, 16, 5, 7, {"name": "Null Field", "description": "Magical abilities don't work when fighting Anitmage.", "isMagic": true}),
        new character('shieldbearer', 'images/shieldbearer.png', 100, 9, 0, 5, {"name": "Defend", "description": "Can deflect damage with a well-timed shield block.", "isMagic": false}),
        new character('monk', 'images/monk.png', 60, 0, 10, 4, {"name": "Armor of God", "description": "Recovers 7 hp every round.", "isMagic": true})
    ];

    // create the king
    var kingName =  randomName(9 + Math.round(Math.random())); // "Babadoligo";
    sorcerorKing = new character(kingName, 'images/death.jpg', 600, 10, 10, 4, {"name": "Armor of God (magic)", "description": "Recovers 7 hp every round."})

    // debug, go straight to the fight
    yourCharacter = characters[2];
    opponent = characters[0];

    characters[0].position(0.25, 0.25);
    characters[1].position(0.25, 0.75);
    characters[2].position(0.75, 0.25);
    characters[3].position(0.75, 0.75);

    yourCharacter.move(0.333, 0.5);
    opponent.move(0.666, 0.5);

    storyLine = 3;
    continueStory();
    return;

    // show welcome message after image fades in
    setTimeout(() => {
        msgBox ("Welcome", "You have been captured by the evil sorceror king " + sorcerorKing.name + " and transported to his infamous mountain fortress, where you will be forced to fight for his entertainment.  Your survival is unlikely, but possible if you choose wisely.",
        dialogButtons([ {
            text: "Ok",
            function: continueStory
        }]))
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
            .mouseover( function(){
                $("#statsWindow")
                    .html(
                        "<h2>" + element.name.toUpperCase() + "</h2> <br>" +
                        "HP: " + element.hp + "<br><br>" +
                        "ATTACK: " + element.strength + "<br><br>" +
                        "COUNTER-attack: " + element.counter + "<br><br>" +
                        "SPEED: " + element.quickness + "<br><br>" +
                        "SPECIAL: " + element.special.name + (element.special.isMagic) ? " (magic)" : "" +
                        "<br><hr>" + element.special.description)
                    .show();
                })
            .mouseleave(function() {
                $("#statsWindow").hide();
            })
            .on("click", function() {
                // choosing this character
                yourCharacter = element;
                element.move(0.333, 0.5);
                var y = 0.05;
                for (i = 0; i < characters.length; i++) {
                    if (characters[i] != yourCharacter) {
                        characters[i].move(0.95, y);
                        y += 0.45;
                    }
                }
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
            msgBox ("Select Opponent", "Having drawn the short straw, you will have to fight first.  Your only consolation is that you get to choose your first opponent...",
            dialogButtons([{
                text: "Ok",
                function: continueStory
            }]));
        }, 1000);
        break;

    case 3:
        $("#banner").show().text("Choose your opponent:");
        // move stats window over a little
        $("#statsWindow").css({"right": "0", "transform": "translate(0, -50%)"});
        
        // next choice will give your opponent. 
        // set characters to move opposite yours when chosen
        // extra characters will fill in the back bench at intervals of 0.25y and 0.75y
        characters.forEach(function(element){
            // can't fight yourself
            if (element == yourCharacter) return;
            // otherwise, establish a new click function
            element.img
            .on("click", function() {
                // choosing this character
                opponent = element;
                element.move(0.666, 0.5);
                var y = 0.25;
                for (i = 0; i < characters.length; i++) {
                    if (characters[i] != yourCharacter &&
                        characters[i] != opponent) {
                        characters[i].move(1, y);
                        y += 0.5;
                    }
                }
                // deactivate mouse functions
                $(".characterImg").unbind("mouseover mouseleave click");
                // continue the story
                continueStory();
            });
        })
        break;

    case 4:

    // battle scene
    // fight() will call continueStory() when it's over    
    fight();
        break;

    case 5:
        // you win - boss??
        msgBox ("Survival!", "You have defeated your opponents and gained their powers.  But can you defeat king")
        break;
    }

}

function fight(){
    // clear stats
    $("#statsWindow").hide();
    // clear highlighting
    $(".characterImg").removeClass("highlight")
    // fighting time
    $("#banner").show().text("Press spacebar to attack!");
    $("#subtext").show().text("Time your attack for maximum damage.");
    
    // set them against each other
    yourCharacter.opponent = opponent;
    opponent.opponent = yourCharacter;
    yourCharacter.ai = false;
    var turn = 0;
    var delay = 0;

    // have the opponent bounce around
    setInterval(() => {
        if (!opponent.attacking()){
            if (opponent.y < 0.3){
                opponent.move(0.666, 0.75, opponent.speed * 2 / difficulty)
            }
            else {
                opponent.move(0.666, 0.25, opponent.speed * 2 / difficulty)
            }
        }
    }, opponent.speed * 2 / difficulty);
 
    // prepare to strike
    $(document).on("keydown", function(event){
        // attack
        if (event.key = " ") {
            if (turn == 0) {
                // your turn - attack
                yourCharacter.attack(opponent);
                turn = 1;
                compAttack();
            } 
            else if (opponent.attacking) {
                // opponent's turn - block/counterstrike
                if (opponent.attacking() > opponent.speed) {
                    // to quick - penalty delay!
                    // delay = now() + 200 * difficulty;
                    console.log(opponent.attacking(), opponent.speed)
                    yourCharacter.buffText("Too Early!", "white");
                    return;
                }
                if (delay > now()) return;
                yourCharacter.counterAttack(opponent);
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
        var delay = yourCharacter.speed * 3 + opponent.speed * (5 + Math.random());
        setTimeout(() => {
            $("#banner").show().text("Prepare to defend!");
            $("#subtext").show().text("Tap space at the moment of impact for maximum " + 
                ((yourCharacter.name == "shieldbearer") 
                ? " blocking power." 
                : " counter-attack damage."));
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

