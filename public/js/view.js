/**********************************************************
 * Author: Thomas Neumann                                 *
 * Class:  CSCE 315                                       *
 * File:   view.js                                        *
 * Desc:   This file defines all the functions associated *
 *         the view and defines the Location class        *
 **********************************************************/


//this value is to make sure every card moved is place on top of other cards
let GlobalZCount = 0

//helper function to clear out the deck div when we start a new game
function resetDeckDiv(){

    //gets the deck div
    let deckDiv = document.getElementById("deck")

     //validates that card deck div exists
     if(deckDiv == null){
        console.error("Invalid Deck Id")
        return
    }

    //empties it of all its cards
    deckDiv.innerHTML = "";
}

//helper function to generate the cards divs
function generateCardDivs(cardDivId, cardSuit, deckLocationIn){

    //validates data
    if(typeof cardDivId != "string"){
        console.error("Invalid Card Id")
        return
    }
    if(!app.blackjack.suits.includes(cardSuit)){
        console.error("Invalid Card Suit")
        return
    }
    if(deckLocationIn.constructor.name != "Location"){
        console.error("Invalid Location")
        return
    }

    //gets a reference to the deck div
    let deckDiv = document.getElementById("deck")

    //validates that card deck div exists
    if(deckDiv == null){
        console.error("Invalid Deck Id")
        return
    }

    //creates div node and sets its id
    let cardNode = document.createElement("div")
    cardNode.id = cardDivId   //the id is also the unicode that will display the card, maybe not best practice but easy

    //adds the classes so css know to style them like cards and which color they will styled as
    //theoretically I could use the add and remove class functions here but I think that adds unneeded function calls inside a loop
    cardNode.classList.add("card")
    cardNode.classList.add("down")          //this is used to show the back or front of the card
    cardNode.classList.add(cardSuit) //this is used for the card's color

    //sets the individual styles for that card
    cardNode.style.zIndex     = "0"  //sets the z-index for later use
    cardNode.style.top        = deckLocationIn.y
    cardNode.style.left       = deckLocationIn.x                                    //the only reason I set the transition here is so I can control the times in javascript since I have to wait for the animations
    cardNode.style.transition = `transform ${app.blackjack.flipAnimationSpeed}ms ${app.blackjack.flipAnimationType}, 
                                 left      ${app.blackjack.moveAnimationSpeed}ms ${app.blackjack.moveAnimationType}, 
                                 top       ${app.blackjack.moveAnimationSpeed}ms ${app.blackjack.moveAnimationType}`
    
    //puts the unicode which is also the id in the innerHTML and appends it to the deckDiv
    cardNode.innerHTML = cardDivId
    deckDiv.append(cardNode)
}


//instead of showing and hiding the divs I will be moving them to different locations and always having them shown on screen

//helper function for moving the card to a specific location
//offset has a default value since we do not always want an offset
//async since it deals with the animation
async function moveCard(divId, locationToMoveTo, offset = 0){

    //validates inputs
    if(typeof divId != "string"){
        console.error("Invalid Div Id")
        return
    }
    if(locationToMoveTo.constructor.name != "Location"){
        console.error("Invalid Location")
        return
    }
    if(typeof offset != "number" || offset < 0){
        console.error("Invalid Value")
        return
    }

    //gets the card's associated div
    let cardDiv = document.getElementById(divId)

    //validates that card div exists
    if(cardDiv == null){
        console.error("Invalid Card Id")
        return
    }

    //moves the card to a specific spot and makes it go on top
    cardDiv.style.left   = `Calc(${locationToMoveTo.x} + ${offset}rem`
    cardDiv.style.top    = locationToMoveTo.y
    cardDiv.style.zIndex = GlobalZCount++

    if(locationToMoveTo.zRotate){
        cardDiv.style.transform = `rotateZ(${Math.floor(Math.random() * 50) / 100}turn)`
    }

    //waits for the animation to finished before ending the function
    await sleep(app.blackjack.moveAnimationSpeed)
}

//helper function for flipping the cards
//async since it deals with the animation
async function flipUp(divIdIn){

    if(typeof divIdIn != "string"){
        console.error("Invalid Div Id")
        return
    }

    //gets the card's associated div
    let cardDiv = document.getElementById(divIdIn)

    //validates that card div exists
    if(cardDiv == null){
        console.error("Invalid Card Id")
        return
    }

    if(!cardDiv.classList.contains("down")){
        return
    }

    //starts the flipping animation
    cardDiv.style.transform = "rotateY(90deg)" // this flips the card horizontally until it is no longer visible
    await sleep(app.blackjack.flipAnimationSpeed)   //it will wait for the animation to finish before moving on

    //removes the down class
    removeClass(cardDiv, "down")

    //flips the back down
    cardDiv.style.transform = "rotateY(0deg)"
    await sleep(app.blackjack.flipAnimationSpeed)  //it will wait for the animation to finish before moving on
}

//helper function for flipping the cards
//async since it deals with the animation
async function flipDown(divIdIn){

    //validates input
    if(typeof divIdIn != "string"){
        console.error("Invalid Div Id")
        return
    }

    //gets the card's associated div
    let cardDiv = document.getElementById(divIdIn)

    //validates that card div exists
    if(cardDiv == null){
        console.error("Invalid Card Id")
        return
    }

    if(cardDiv.classList.contains("down")){
        return
    }

    //starts the flipping animation
    cardDiv.style.transform = "rotateY(90deg)" // this flips the card horizontally until it is no longer visible
    await sleep(app.blackjack.flipAnimationSpeed)   //it will wait for the animation to finish before moving on

    //adds the down class
    addClass(cardDiv, "down")

    //flips the back down
    cardDiv.style.transform = "rotateY(0deg)"
    await sleep(app.blackjack.flipAnimationSpeed)  //it will wait for the animation to finish before moving on
}


//this function will remove a class from a specific element
function removeClass(element, className){

    //validates the inputs
    if(element.constructor.name != "HTMLDivElement"){
        console.error("Invalid Element")
        return
    }
    if(typeof className != "string" && element.classList.contains(className)){
        console.error("Invalid Class Name")
        return
    }

    //it will then remove the class
    element.classList.remove(className)
}

//this function will add a class to a specific element
function addClass(element, className){

    //validates the inputs
    if(element.constructor.name != "HTMLDivElement"){
        console.error("Invalid Element")
        return
    }
    if(typeof className != "string" && !element.classList.contains(className)){
        console.error("Invalid Class Name")
        return
    }

    //adds that class to the element
    element.classList.add(className)
}

//helper function to disable a button
function disableButton(buttonId){
    if(typeof buttonId != "string"){
        console.error("Invalid Button Id")
        return
    }

    let button = document.getElementById(buttonId)

    //validates that the button exists
    if(button == null){
        console.error("Invalid Button Id")
        return
    }

    //sets the button to disabled
    button.disabled = true
}

//helper function to enable a button
function enableButton(buttonId){
    let button = document.getElementById(buttonId)

    //validates that the button exists
    if(button == null){
        console.error("Invalid Button Id")
        return
    }

    //sets the button to enabled
    button.disabled = false
}

//function to clear the messages from the messageDiv
function clearMessage(){
    let messageDiv = document.getElementById("messageBox")

    //validates that the message div exists
    if(messageDiv == null){
        console.error("Invalid Message Id")
        return
    }

    //clears out the innerHTML of that div
    messageDiv.innerHTML = ""
}


//function to append a message to the messageDiv
function addMessage(messageIn){
    let messageDiv = document.getElementById("messageBox")

    //validates that the message div exists
    if(messageDiv == null){
        console.error("Invalid Message Id")
        return
    }

    //appends on a new paragraph with the inputted message inside
    messageDiv.innerHTML += `<p>${messageIn}</p>`
}

//function to display the wallets amount to the view
function showWalletAmount(walletAmount){

    //validates input
    if(typeof walletAmount != 'number'){
        console.error("Invalid wallet amount")
        return
    }

    let walletDiv = document.getElementById("wallet")
    
    //validates that the wallet div exists
    if(walletDiv == null){
        console.error("Invalid wallet div Id")
        return
    }

    //sets the value of the div
    walletDiv.innerHTML = `<pre>Wallet: $${(walletAmount + "   ").slice(0, 4)}</pre>`
}

function updateBetAmount(betAmount){

    //validates input
    if(typeof betAmount != 'number'){
        console.error("Invalid bet amount")
        return
    }

    let betDiv = document.getElementById("bet")
    
    //validates that the bet div exists
    if(betDiv == null){
        console.error("Invalid bet div Id")
        return
    }

    //sets the value of the div
    //I tried messing around with adding spaces for the extra missing digits so the buttons do not move around
    //the only issue with that is that my font is not monospace
    betDiv.innerHTML = `<pre>Bet: $${(betAmount + "   ").slice(0, 4)}</pre>`
}



//   _                     _   _             
//  | |                   | | (_)            
//  | |     ___   ___ __ _| |_ _  ___  _ __  
//  | |    / _ \ / __/ _` | __| |/ _ \| '_ \ 
//  | |___| (_) | (_| (_| | |_| | (_) | | | |
//  |______\___/ \___\__,_|\__|_|\___/|_| |_|
class Location{

    //this object only holds a location for placing the decks and hands
    //this object is theoretically not needed but is very helpful for validation of data
    //this object is in views since views is the only place where the the locations are actually used
    //location also has no use outside the views
    constructor(xIn = "", yIn = "", zRotateIn = false){

        //validates the inputs
        if(typeof xIn != "string"){
            console.error("Invalid X Location")
            return
        }
        if(typeof yIn != "string"){
            console.error("Invalid Y Location")
            return
        }
        if(typeof zRotateIn != "boolean"){
            console.error("Invalid zRotation")
            return
        }

        //stores the values
        this.x = xIn
        this.y = yIn
        this.zRotate = zRotateIn
    }
}

//helper function to be used in async functions so they can wait a certain amount of time for animations
//with out the view animations the sleep function is not need
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
