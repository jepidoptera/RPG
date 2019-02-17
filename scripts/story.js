/*jshint esversion: 6 */

$(document).ready(function() {
    // when the DOM is ready
    $("#statsWindow").hide();
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

var storyLine = -1;
var yourCharacter = null;
var opponent = null;

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
    // create four characters
        characters = [
            new character('berserker', 'images/berserker.png', 75, 5, 5, {"name": "Blood Frenzy (magic)", "description": "Each time this charcter attacks, his strength increases by 5."}),
            new character('antimage', 'images/antimage.png', 50, 15, 5, {"name": "Null Field", "description": "Magical abilities don't work when fighting Anitmage."}),
            new character('shieldbearer', 'images/shieldbearer.png', 100, 10, 0, {"name": "Defend", "description": "can deflect damage with a well-timed shield block."}),
            new character('monk', 'images/monk.png', 60, 0, 10, {"name": "Armor of God (magic)", "description": "Recovers 7 hp every round."})
        ];
        // move them to the four corners
        characters[0].position(0.05, 0);
        characters[1].position(0, 1);
        characters[2].position(1, 0);
        characters[3].position(1, 1);
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
                var y = 0;
                for (i = 0; i < characters.length; i++) {
                    if (characters[i] != yourCharacter) {
                        characters[i].move(1, y);
                        y += 0.5;
                    }
                }
                // continue the story
                continueStory();
            });
        });
        break;
    
    case 2:
        // choosing opponet
        //

        // move stats window over a little
        $("#statsWindow").css({"right": "0", "top": "0", "transform": "translate(0, 0)"});
        
        // deactivate click functions
        $(".characterImg").off("click");
        // deactivate hover for chosen character
        $(yourCharacter.img).unbind("mouseover mouseleave click");

        // next choice will give your opponent. 
        // set characters to move opposite yours when chosen
        // extra characters will fill in the back bench at intervals of 0.25y and 0.75y
        $(".characterImg").on("click", function() {
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
            // continue the story
            continueStory();
        });
        break;
    }
}

