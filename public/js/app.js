/**********************************************************
 * Author: Thomas Neumann                                 *
 * Class:  CSCE 315                                       *
 * File:   app.js                                         *
 * Desc:   This file initiates the app as well as defines *
 *         the global variable gameplay and defines the   *
 *         class Blackjack                                *
 **********************************************************/



//global variable so we do not need to pass values everywhere
//gamePlay also holds all the constants for the functionality of the game
let app;

//when the window loads it will call this function
window.onload = (e) => {
    
    //creates the GamePlay object starts the game
    app = new GamePlay()
    app.playGame()

    //we will call this function since it will use the app variable
    initializeListeners()
}


//    _____                      _____  _             
//   / ____|                    |  __ \| |            
//  | |  __  __ _ _ __ ___   ___| |__) | | __ _ _   _ 
//  | | |_ |/ _` | '_ ` _ \ / _ \  ___/| |/ _` | | | |
//  | |__| | (_| | | | | | |  __/ |    | | (_| | |_| |
//   \_____|\__,_|_| |_| |_|\___|_|    |_|\__,_|\__, |
//                                               __/ |
//                                              |___/
class GamePlay{

    //the only value we need to make when the game starts is the blackjack object
    constructor(){
        this.blackjack = new Blackjack()
    }

    //this method is used for when we first start the game
    playGame(){
        this.blackjack.initialize()
    }

    //this method will return if the user has lost the game
    //I will be seeing the users wallet and bet are empty
    //we can't check if only their wallet is empty since they could do an all in bet
        //an all in bet will have no money in their wallet but all their money in the bet
    isGameOver(){
        return this.blackjack.user.userWallet.value == 0 && this.blackjack.user.userBet === 0
    }

    //this method is only called when the user has lost the game
    reset(){

        //re-initializes the blackjack object
        this.blackjack.initialize()
        
        // lets the user know the game has been reset
        addMessage("Game has been reset")
    }
}







