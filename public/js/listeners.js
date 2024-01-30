/**********************************************************
 * Author: Thomas Neumann                                 *
 * Class:  CSCE 315                                       *
 * File:   listeners.js                                   *
 * Desc:   This file creates the event listeners as well  *
 *         as the functions that handle them. They will   *
 *         move cards, create messages, and reshuffle     *
 *         the deck if necessary                          *
 **********************************************************/


//we have these inside a function since they need to be created after the app object
function initializeListeners(){

    //these functions will handle user input with their buttons
    //most buttons map to a function in the Blackjack object
    document.getElementById("deal").addEventListener("click", () => {app.blackjack.deal()})
    document.getElementById("hit").addEventListener("click", () => {app.blackjack.hit()})
    document.getElementById("stay").addEventListener("click", () => {app.blackjack.dealDealer()})
    document.getElementById("incrementBet").addEventListener("click", () => {app.blackjack.setBet(app.blackjack.betIncrements)})
    document.getElementById("decrementBet").addEventListener("click", () => {app.blackjack.setBet(-1 * app.blackjack.betIncrements)})

    //reset will call the Gameplay object's reset method if the player gets game over
    //if the player does not have game over then we will call just the Blackjack's reset methods
    document.getElementById("reset").addEventListener("click", () => {
        if(app.isGameOver()){

            //this completely resets the game to its initial state beside the message we put in
            app.reset()
        }else{
            app.blackjack.reset()
        }
    })
}
