/*jshint esversion: 6 */
var storyLine = -1;
var yourCharacter = null;
var opponent = null;
var characters = [];


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
        new character('berserker', 'images/berserker.png', 75, 4, 5, 6, {"name": "Blood Frenzy (magic)", "description": "Each time this charcter attacks, his strength increases by 4."}),
        new character('antimage', 'images/antimage.png', 50, 16, 5, 7, {"name": "Null Field", "description": "Magical abilities don't work when fighting Anitmage."}),
        new character('shieldbearer', 'images/shieldbearer.png', 100, 9, 0, 5, {"name": "Defend", "description": "Can deflect damage with a well-timed shield block."}),
        new character('monk', 'images/monk.png', 60, 0, 10, 4, {"name": "Armor of God (magic)", "description": "Recovers 7 hp every round."})
    ];

    continueStory();
    return;

    // show welcome message after image fades in
        setTimeout(() => {
        openDialog ("Welcome", "You have been captured by the evil sorceror king Bavedelios and transported to his infamous mountain fortress, where you will be forced to fight for his entertainment.  Your survival is unlikely, but possible if you choose wisely.",
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
                openDialog ("Select Character", "The first choice you must make is your own character.  Be advised that whichever you don't pick will become your opponents.  If you manage to defeat them, you will gain their abilities.",
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
            .mouseover( function(){
                $("#statsWindow")
                    .html(
                        "<h2>" + element.name.toUpperCase() + "</h2> <br>" +
                        "HP: " + element.hp + "<br><br>" +
                        "ATTACK: " + element.strength + "<br><br>" +
                        "COUNTER-attack: " + element.counter + "<br><br>" +
                        "SPECIAL: " + element.special.name + "<br><hr>" + element.special.description)
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
            openDialog ("Select Opponent", "Having drawn the short straw, you will have to fight first.  Your only consolation is that you get to choose your first opponent...",
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
        // clear stats
        $("#statsWindow").hide();
        // fighting time
        $("#banner").text("Press spacebar to attack!");
        
        // have the opponent bounce around
        setInterval(() => {
            if (opponent.y < 0.3){
                opponent.move(0.666, 0.75, opponent.speed)
            }
            else {
                opponent.move(0.666, 0.25, opponent.speed)
            }
        }, opponent.speed);
        // prepare to strike
        $(document).on("keydown", function(event){
            // attack
            yourCharacter.attack(opponent);
        });

        // character1 attacks
        // since this is human, wait for space key
        // character2 counter-attacks
        // character2 attacks (or uses special)
        // brief window during which human player can counter
        break;

    }
}

