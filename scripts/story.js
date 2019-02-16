$(document).ready(function() {
    // when the DOM is ready
    var img = new Image();
    $(img).addClass('backgroundImg');
    // $(img).width = "100%"
    // $(img).height = "100%"

    // fade in background
    $(img)
    .hide()
    .attr('src', 'images/walls.jpg')
    .fadeIn(3000);

    // add it to the page
    $('body').append($(img));

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
                }]))
            }, 1000);
        break;
    case 1:
    // choosing character screen    
    // create four characters
        characters = [
            new character('berserker', 'images/berserker.png', 75, 5, 5, {"name": "Bloodlust", "description": "Each time this charcter attacks, his strength increases by 5."}),
            new character('antimage', 'images/antimage.png', 50, 15, 5, {"name": "Nullify", "description": "Other characters' abilities don't work when fighting Anitmage."}),
            new character('shieldbearer', 'images/shieldbearer.png', 100, 10, 0, {"name": "Defend", "Description": "can deflect damage with a well-timed shield block."}),
            new character('monk', 'images/monk.png', 60, 0, 10, {"name": "Armor of God", "description": "Recovers 7 hp every round."})
        ];
        // move them to the four corners
        characters[0].position(0, 0);
        characters[1].position(0, 1);
        characters[2].position(1, 0);
        characters[3].position(1, 1);
        // show character info on hover
        characters.forEach(element => {
            $(element.img).on('mouseover', function(){
                $("#arenaWindow").html(
                    "<h2>" + element.name.toUpperCase() + "</h2> <br>" + "<br>" +
                    "hp: " + element.hp + "<br>" +
                    "attack: " + element.strength + "<br>" +
                    "counter-attack: " + element.counter + "<br>" +
                    "special: " + element.special.name + "<br>" + element.special.description)
            })
        });
        break;
    case 2:
        break;
    }
        
}