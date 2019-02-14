$(document).ready(function() {
    // when the DOM is ready
    var img = new Image();
    $(img).addClass('backgroundImg');
    // wrap our new image in jQuery, then:
    $(img) 
        // once the image has loaded, execute this code
        .on("load", function () {
            $(this).hide();
            $('body').append(this);

            // fade our image in to create a nice effect
            $(this).fadeIn(3000);

        // if there was an error loading the image, react accordingly
        })
        // *finally*, set the src attribute of the new image to our image
        .attr('src', 'images/mountain.jpg');
        
    // show welcome message after image fades in
        setTimeout(() => {
        openDialog ("Welcome", "You have been captured by the evil sorceror king Bavedelios and transported to his infamous mountain fortress, where you will be forced to fight for his entertainment.  Your survival is unlikely, but possible if you choose wisely.",
        dialogButtons([{
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
        .attr('src', 'images/gate.png');

            // show welcome message after image fades in
            setTimeout(() => {
                openDialog ("The first choice you must make is your own character.  Be advised that whichever you don't pick will become your opponents.",
                dialogButtons([{
                    text: "Ok",
                    function: continueStory
                }]))
            }, 1000);
        break;
    case 1:
        break;
    case 2:
        break;
    }
        
}