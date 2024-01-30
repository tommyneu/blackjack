/***************************************************
 * Author: Thomas Neumann                          *
 * Class:  CSCE 315                                *
 * File:   models.js                               *
 * Desc:   This file creates the Card, Card_Deck,  *
 *         and Hand classes                        *
 ***************************************************/



//    _____              _ 
//   / ____|            | |
//  | |     __ _ _ __ __| |
//  | |    / _` | '__/ _` |
//  | |___| (_| | | | (_| |
//   \_____\__,_|_|  \__,_|
class Card{

    //when the card is created it will store the values inputted
    constructor(suitIn, valueIn, divIdIn){

        //validates the input data 
        if(!app.blackjack.suits.includes(suitIn)){
            console.error("Invalid Suit")
            return
        }
        if(typeof valueIn != "number" || valueIn < 0 || valueIn > app.blackjack.maxCardsPerSuit){  //this valueIn will be a number 0-12 from the modulus of maxCardsPerSuit
            console.error("Invalid Value")
            return
        }
        if(typeof divIdIn != "string"){
            console.error("Invalid divId")
            return
        }

        //I'm using Object.defineProperty since this allows me to make the property writable false
        // this will effectively make these properties a const value

        //stores the suits, rank, and divId
        Object.defineProperty(this, 'suit',  {value: suitIn})
        Object.defineProperty(this, 'rank',  {value: valueIn > 9 ? app.blackjack.faceCardRank : (valueIn+1) }) //using the value of the card it will calculate the rank
        Object.defineProperty(this, 'divId', {value: divIdIn }) //stores the id of the div associated with that card so we do not need to recalculate it every time
                                                                //each card has a div that will never be removed from the dom
    }

    //helper functions to flip the cards up or down
    //actual animations and such are handled in the view folder
    async flipCardUp(){
        await flipUp(this.divId)
    }
    async flipCardDown(){
        await flipDown(this.divId)
    }

    //taking a location the card div is moved to that location
    //offset is not needed with the decks but in the hands of the user the offset is needed to see all the cards
    async moveCardToLocation(locationIn, offsetIn = 0){

        //validates inputs
        if(locationIn.constructor.name != "Location"){
            console.error("Invalid Location")
            return
        }
        if(typeof offsetIn != "number" || offsetIn < 0){
            console.error("Invalid Offset")
            return
        }

        //calls the moveCard function in the view
        moveCard(this.divId, locationIn, offsetIn)
    }

    //this function is called when we make the card
    //we also need a location to move the div to
    generateDiv(locationIn){

        //validates inputs
        if(locationIn.constructor.name != "Location"){
            console.error("Invalid Location")
            return
        }

        //calls the function in views
        generateCardDivs(this.divId, this.suit, locationIn)
    }
}



//    _____              _   _____            _    
//   / ____|            | | |  __ \          | |   
//  | |     __ _ _ __ __| | | |  | | ___  ___| | __
//  | |    / _` | '__/ _` | | |  | |/ _ \/ __| |/ /
//  | |___| (_| | | | (_| | | |__| |  __/ (__|   < 
//   \_____\__,_|_|  \__,_| |_____/ \___|\___|_|\_\
class Card_Deck{

    //when the card deck is created all it needs is the cards array
    //we do not need to store the deckSize since the only spot we would use it in is initiation of the deck which we only do for the draw deck
    //we also do not need the cardsleft since we can get that from the length of the cards array
        //since we have two card_decks, one for draw and one for discard the cards objects themselves are moved between decks
    constructor(locationIn){

        //validates inputs
        if(locationIn.constructor.name != "Location"){
            console.error("Invalid Location")
            return
        }

        this.cards = []
        this.location = locationIn  //we store this here since we need to know where to move the cards to
    }

    //private method for getting an index of a random card
    //this is only used in shuffle but theoretically could be used in drawCard as well
    #randomCardIndex(){
        return Math.floor(Math.random() * this.cards.length)
    }

    //private method for swapping two cards places in the deck
    //this is only used in shuffle
    #swapCards(indexA, indexB){
        let tempCard = this.cards[indexA]
        this.cards[indexA] = this.cards[indexB]
        this.cards[indexB] = tempCard
    }

    //private method for generating the unicode value for a standard card deck
    #getCardUnicode(suit, value){

        //unicode's order for cards
        let unicodeSuitOrder = ["Spades", "Hearts", "Diamonds", "Clubs"]

        //validates the suit and number
        if(!unicodeSuitOrder.includes(suit)){
            console.error("Invalid Card Suit")
            return ""
        }
        if(typeof value != "number" || value < 0 || value > 13){ //we will only use the Ace-King cards excluding the knight cards
            console.error("Invalid Card Value")
            return ""
        }

        //gets the hex values for the unicode string
        let unicode1 = (unicodeSuitOrder.indexOf(suit) + 10).toString(16)
        let unicode2 = (value + 1).toString(16)

        //we need to convert the knights to kings
        if(unicode2 == "c"){ //the c value is the knight
            unicode2 = "e"   //the e value is the king
        }

        //returns the unicode value of that card
        return "&#x1F0" + unicode1 + unicode2 + ";"
    }

    //method for filling the card deck with card objects
    //since we have two card_deck objects one for draw and one for discard we do not want to fill both with cards
    //this method is called whenever we start a game or we reset after a game over
    initialize(){

        //we will clear out any cards from the previous game
        this.cards = [];

        //loops through the deck size and pushes the card object into this.cards
        for(let i = 0; i < app.blackjack.deckSize; i++){
            //gets the suit, value, and cardDivId
            let suit      = app.blackjack.suits[i % app.blackjack.suits.length]  //uses values stores in app.blackjack so they are easy to find
            let value     = i % app.blackjack.maxCardsPerSuit
            let cardDivId = this.#getCardUnicode(suit, value)

            //creates a card object and pushes it into the cards array
            //also it will generate the divs and put them in the correct location
            this.cards[i] = new Card(suit, value, cardDivId)
            this.cards[i].generateDiv(this.location)
        }
    }

    //shuffle can be called on the deck by itself like when we first start the game
    //or shuffle can be called with the discard deck as a parameter
    async shuffle(discardDeckIn){

        //checks if discardDeckIn is defined and that is is a Card_Deck object
        if(discardDeckIn?.constructor.name == "Card_Deck"){

            //this will loop through the cards in the discard deck and move them back to the deck location
            for(const discardedCard of discardDeckIn.cards){
                discardedCard.moveCardToLocation(this.location)
                discardedCard.flipCardDown()
                await sleep(app.blackjack.nextCardAnimationSpeed)   //we do not wait for the whole animation but instead a short time between cards
            }
            
            //it will add the cards from the discard deck and it will also empty the discard deck
            this.cards = this.cards.concat(discardDeckIn.cards)
            discardDeckIn.cards = []

            //waits for the final move animation to finish
            await sleep(app.blackjack.moveAnimationSpeed)
        }
        
        
        //loops through the cards and randomizes them
        for(let i = 0; i < this.cards.length; i++){
            let randomCardIndex = this.#randomCardIndex()
            this.#swapCards(i, randomCardIndex)
        }
    }

    //returns and removes the top card from the deck
    //theoretically could use the #randomCardIndex
    dealCard(){
        return this.cards.shift()
    }


    //this adds a card to the bottom of the deck
    //this is needed since we have two card_deck objects and the discard deck will used this when getting cards from the user's hand
    async addCard(cardIn){
        
        //validates that it is a card
        if(cardIn.constructor.name != "Card"){
            console.error("Invalid Card")
            return
        }

        //pushes the card to the bottom of the deck
        //also will move the card to the correct location
        this.cards.push(cardIn)
        await cardIn.moveCardToLocation(this.location)
    }
}



//   _    _                 _ 
//  | |  | |               | |
//  | |__| | __ _ _ __   __| |
//  |  __  |/ _` | '_ \ / _` |
//  | |  | | (_| | | | | (_| |
//  |_|  |_|\__,_|_| |_|\__,_|
class Hand{

    //when the hand object is created we do not need any cards in it and the score of the hand will be 0
    constructor(locationIn){

        //validates input
        if(locationIn.constructor.name != "Location"){
            console.error("Invalid Location")
            return
        }


        this.cards = []
        this.score = 0
        this.location = locationIn // we store this here since I am assuming we will have multiple hands
    }


    //when we deal a card to the user we will add that card to the users hand
    //we are also going to calculate the score the users hand every time they get a card since that is the only time the user will get a different score
    async addCard(cardIn, cardDirection = "up"){

        //validates cardIn is a card
        if(cardIn.constructor.name != "Card"){
            console.error("Invalid Card")
            return
        }

        //validate card direction
        if(typeof cardDirection != "string" || !["up", "down"].includes(cardDirection)){
            console.error("Invalid Card Direction")
            return
        }

        //pushes the card and re calculates score
        this.cards.push(cardIn)
        this.calcScore()

        if(cardDirection == "up"){
            //it will flip and move the card at the same time but we want to wait for both animations to finish before continuing
            await Promise.all([cardIn.moveCardToLocation(this.location, this.cards.length*2),
                cardIn.flipCardUp()])
        }

        if(cardDirection == "down"){
            //it will flip and move the card at the same time but we want to wait for both animations to finish before continuing
            await Promise.all([cardIn.moveCardToLocation(this.location, this.cards.length*2),
                cardIn.flipCardDown()])
        }
    }

    //this method is only really called for the dealer
    async flipAllCardsUp(){

        //loops through all the cards and flips them all up
        for(const singleCard of this.cards){
            await singleCard.flipCardUp()
        }
    }


    //calcScore does not need any input since all the data we need is in the cards array
    calcScore(){

        //running total is the temporary total as we loop through cards and aces
        let runningTotal = 0
        let aceCount     = 0   //we store the number of aces for later


        //loops through the hand's cards and adds their ranks to the running total
        //if the card is an ace (i.e. rank of 1 or aceRank) then we will increment the ace count
        for(const singleCard of this.cards){
            if(singleCard.rank == app.blackjack.aceRank){
                aceCount++
            }
            runningTotal += singleCard.rank
        }

        //we need to check if any of the aces can exist in the state of rank 11 (aceRank+aceRankDifference)
        //since we already added 1 (aceRank) we just need to add 10 (aceRankDifference)
        //we will loop if there are any aces and if we add that ace to the runningTotal it will not go over the bustThreshold
        while(aceCount > 0 && runningTotal + app.blackjack.aceRankDifference <= app.blackjack.bustThreshold){
            runningTotal += app.blackjack.aceRankDifference
            aceCount--
        }

        //we will then set the score of the runningTotal
        this.score = runningTotal
    }

    //clears out the cards array and sets the score to 0
    //we will also return a copy of the cards array to put into the discard pile
    async reset(discardDeckIn){

        if(discardDeckIn.constructor.name != "Card_Deck"){
            console.error("Invalid Card Deck")
            return
        }

        for (const singleCard of this.cards) {
            discardDeckIn.addCard(singleCard)
            await sleep(app.blackjack.nextCardAnimationSpeed)
        }

        //resets the values
        this.cards = []
        this.score = 0

        //waits for the final card to finish moving
        await sleep(app.blackjack.moveAnimationSpeed)
    }
}

//  __          __   _ _      _   
//  \ \        / /  | | |    | |  
//   \ \  /\  / /_ _| | | ___| |_ 
//    \ \/  \/ / _` | | |/ _ \ __|
//     \  /\  / (_| | | |  __/ |_ 
//      \/  \/ \__,_|_|_|\___|\__|
class Wallet{

    //when creating the wallet all we need in the value which will start at 0
    constructor(){
        this.value = 0
    }

    //we do not need set, get, add, and decrement since we can just use the dot notation
}


//   _    _               
//  | |  | |              
//  | |  | |___  ___ _ __ 
//  | |  | / __|/ _ \ '__|
//  | |__| \__ \  __/ |   
//   \____/|___/\___|_|   
class User{

    //when creating a user we have an empty hand and wallet as well as $0 as a bet
    constructor(userHandLocation){

        //validate input
        if(userHandLocation.constructor.name != "Location"){
            console.error("Invalid User Hand Location")
            return
        }

        //sets values and create new objects for the corresponding values
        this.userHand = new Hand(userHandLocation)
        this.userBet = 0
        this.userWallet = new Wallet()
    }

    //this is used when we first make the user and anytime we reset the game after a game over
    initialize(){
        
        //we set the the wallet amount and we clear out the hand and bet
        this.userWallet.value = 1000
        this.userHand.cards = []     //we do not use the Hand reset function since we do not want the animation
        this.userHand.score = 0
        this.userBet = 0
    }
}



//   ____  _            _           _            _    
//  |  _ \| |          | |         | |          | |   
//  | |_) | | __ _  ___| | __      | | __ _  ___| | __
//  |  _ <| |/ _` |/ __| |/ /  _   | |/ _` |/ __| |/ /
//  | |_) | | (_| | (__|   <  | |__| | (_| | (__|   < 
//  |____/|_|\__,_|\___|_|\_\  \____/ \__,_|\___|_|\_\
class Blackjack{

    //when created makes all the variables to play the game of blackjack
    constructor(){

        //I'm using Object.defineProperty since this allows me to make the property writable false
        // this will effectively make these properties a const value

        //location of the card deck, user's hand, and discard pile
        Object.defineProperty(this, 'deckLocation',       {value: new Location("5rem",                "10rem")})
        Object.defineProperty(this, 'discardLocation',    {value: new Location("Calc(100vw - 15rem)", "10rem", true)})
        Object.defineProperty(this, 'userHandLocation',   {value: new Location("30vw",                "35rem")})
        Object.defineProperty(this, 'dealerHandLocation', {value: new Location("30vw",                "15rem")})

        //speed in milliseconds for the animations
        Object.defineProperty(this, 'flipAnimationSpeed',     {value: '250'}) //this animation is done twice per flip, best if less than half move speed
        Object.defineProperty(this, 'moveAnimationSpeed',     {value: '750'})
        Object.defineProperty(this, 'nextCardAnimationSpeed', {value: '10'})

        Object.defineProperty(this, 'flipAnimationType', {value: "linear"})
        Object.defineProperty(this, 'moveAnimationType', {value: "ease"})    //this looks weird if it is not ease
        
        //constant variables for cards
        //be careful changing maxCardsPerSuit value since we are using the modulus if maxCardsPerSuit % suits.length == 0 then you will get duplicate cards that have the same id
        Object.defineProperty(this, 'maxCardsPerSuit', {value: 13})
        Object.defineProperty(this, 'faceCardRank',    {value: 10})
        Object.defineProperty(this, 'suits',           {value: ["Hearts",    //These need to be the same as the getCardUnicode suits
                                                                "Spades",
                                                                "Clubs",
                                                                "Diamonds"]})
        
        //sets values for the gameplay
        Object.defineProperty(this, 'deckSize',           {value: this.maxCardsPerSuit * this.suits.length})
        Object.defineProperty(this, 'reShuffleThreshold', {value: 16})
        Object.defineProperty(this, 'bustThreshold',      {value: 21})
        Object.defineProperty(this, 'dealerHitLimit',     {value: 16})
        Object.defineProperty(this, 'minBetAmount',       {value: 100})
        Object.defineProperty(this, 'betIncrements',      {value: 100})
        
        //sets the values for the aces and the difference between the high and low values
            //if we wanted this to work on multiple cards we would need to make these arrays and in the calcScore method we would use .includes and .indexOf
        Object.defineProperty(this, 'aceRank',           {value: 1})
        Object.defineProperty(this, 'aceRankDifference', {value: 10})
        
        //creates the decks, user, and dealer for the game
        Object.defineProperty(this, 'drawDeck',    {value: new Card_Deck(this.deckLocation)})
        Object.defineProperty(this, 'discardDeck', {value: new Card_Deck(this.discardLocation)})
        Object.defineProperty(this, 'user',        {value: new User(this.userHandLocation)})
        Object.defineProperty(this, 'dealer',      {value: new Hand(this.dealerHandLocation)})
    }

    //this method is called whenever we start the game or on a reset after a game over
    initialize(){

        //we will disable all the buttons while the animations for the cards are going
        this.#disableAllButtons()

        //we need to clear out the card deck div to make sure we do not have duplicate cards
        resetDeckDiv()

        //we will reinitialize the card deck and reshuffle it
        this.drawDeck.initialize()
        this.drawDeck.shuffle()

        //we will reinitialize the user
        //we will then show the new amounts for the user bet and wallet
        this.user.initialize()
        this.#showUsersMoney()

        //and we will clear out any cards in the discard deck or the dealer's hand
        this.discardDeck.cards = [];
        this.dealer.cards = [];

        //we will also clear out any messages from the previous game
        clearMessage()

        //we wil only re-enable the increment and decrement bet after a initializing the board
        enableButton("incrementBet")
        enableButton("decrementBet")
    }

    //this method is called whenever the user hit's the deal button
    async deal(){

        //validate that the user and the dealer does not have cards in their hand before dealing
        if(this.user.userHand.cards.length > 0 || this.dealer.cards.length > 0){
            console.error("Can not deal with cards already in hand")
            return
        }

        //we will disable all the buttons while the animations for the cards are going
        this.#disableAllButtons()

        //we will check for a reshuffle and wait for that animation
        await this.#checkForReshuffle()

        //we will then deal the dealer first with a face up and face down card
        //we do not wait for these animations to finish but we will wait for the first half of the card flip animation before users cards are dealt
        this.dealer.addCard(this.drawDeck.dealCard(), "up")
        this.dealer.addCard(this.drawDeck.dealCard(), "down")
        await sleep(this.flipAnimationSpeed)

        //we will then wait for the users cards to finish moving to their location before continuing
        await Promise.all([this.user.userHand.addCard(this.drawDeck.dealCard(), "up"),
                           this.user.userHand.addCard(this.drawDeck.dealCard(), "up")])

        
        //once it has calculated the score it will display it for the user
        this.#showScores()

        //this is the logic for a natural blackjack which is achieved if the user gets blackjack at the deal
        //user will win if the dealer does not have blackjack
        if(this.user.userHand.score == this.bustThreshold){

            //clears out previous score output and adds the message of their blackjack 
            clearMessage()
            addMessage("You have Blackjack")

            //waits for the dealers cards to flip and we will re-output the user and dealer's score
            await this.dealer.flipAllCardsUp()
            this.#showScores(true)
            addMessage("You have Blackjack")   //the message from before will be deleted using the showScore() method so we will re add it in
 
            //checks to see who won the round and handles bets
            this.#checkForHigherScore()

            //enables the reset button
            enableButton("reset")

            //returns since we do not want to re-enable the hit and stay buttons since the round is over
            return
        }

        //the only buttons to be enabled after dealing is the hit and stay buttons
        enableButton("hit")
        enableButton("stay")
    }

    //this method is called when the user clicks the hit button
    //since we do not wait for any animations in-case the user clicks rapidly we do not need this function to be async
    hit(){

        //validates that the user has not busted before trying to add a card to it
        if(this.#didUserBust()){
            console.error("Can not add cards to a busted hand")
            return
        }

        //we do not want to disable all the buttons since the user may want to rapid fire click the hit button
        disableButton("reset")
        disableButton("deal")
        disableButton("incrementBet")
        disableButton("decrementBet")

        //adds a card to the users hand
        this.user.userHand.addCard(this.drawDeck.dealCard(), "up")

        //once it has calculated the score it will display it for the user
        this.#showScores()

        //checks if the user busted and will call the dealDealer function if they did
        if(this.#didUserBust()){
            this.dealDealer()
        }
    }

    //this function is called when the user clicks the stay button or
        //when the user clicks the hit button and they bust
    async dealDealer(){

        //we will disable all buttons since the user should have no input while the process goes on
        this.#disableAllButtons()

        //flips all the cards up and shows the user and dealer's score
        this.dealer.flipAllCardsUp()
        this.#showScores(true)

        //while the dealer's score is under or equal to the dealerHitLimit
            //we will continue adding cards and reshowing the scores
        while(this.dealer.score <= this.dealerHitLimit){
            await this.dealer.addCard(this.drawDeck.dealCard(), "up")
            this.#showScores(true)
        }

        //we will then check to see who won, handle the money, and show the new wallet and bet
        this.#checkForRoundWinner()

        //we will then check to see if the user has lost the game and display the game over message if they have
        if(app.isGameOver()){
            addMessage("Game Over")
        }
        
        //after this we will re-enable the reset button
        enableButton("reset")
    }

    //This method is called whe the user clicks the reset button and there is no game over yet
    async reset(){

        //validates that the user does not currently have a bet, which would mean they are in a round, before resetting the hands
        if(this.user.userBet != 0){
            console.error("Can not reset mid round")
            return
        }

        //we will disable all the buttons while the animation goes on
        this.#disableAllButtons()

        //clears messages from the previous round
        clearMessage()

        //we will reset the user and dealer's hands at the same time
        await Promise.all([this.user.userHand.reset(this.discardDeck), 
                           this.dealer.reset(this.discardDeck)])

        //we wil only re-enable the increment and decrement bet after a reset
        enableButton("incrementBet")
        enableButton("decrementBet")
    }

    //private method for checking and reshuffling the deck if necessary
    async #checkForReshuffle(){
        
        //it will check if the number of cards in the deck are less than the reshuffle threshold
        // and it will check if there are any cards in the discard pile
        if(this.drawDeck.cards.length < this.reShuffleThreshold && this.discardDeck.cards.length > 0){

            //lets the user know the deck is being reshuffled
            clearMessage()
            addMessage(`Reshuffling...`)

            //this will move the cards out of the discard deck and shuffle the order of the draw deck
            //await since there is a animation that plays when moving the cards
            await this.drawDeck.shuffle(this.discardDeck)

            //clears the reshuffle message
            clearMessage()
        }
    }

    //private method for checking who won the round
    //this is a separate function since it seems messier to add it to the dealDealer method
    #checkForRoundWinner(){

        //checks to see if the user busted but not the dealer
        if(this.#didUserBust() && !this.#didDealerBust()){

            //outputs a custom message and handles the bet with the #userLoseRound
            addMessage("You busted but the dealer didn't")
            this.#userLoseRound()
            return
        }

        //checks to see if the dealer busted but not the user
        if(!this.#didUserBust() && this.#didDealerBust()){

            //outputs a custom message and handles the bet with the #userWinRound
            addMessage("The dealer busted but you didn't")
            this.#userWinRound()
            return
        }

        //check to see if neither the user or the dealer busted
        if(!this.#didUserBust() && !this.#didDealerBust()){

            //since neither player busted we need to check who has the higher score
            this.#checkForHigherScore()
            return
        }

        //if we get to this point then both the user and the dealer busted
        addMessage("You Both Busted")
        
        //according to black jack rules online if both the user and dealer bust the user loses their money still
        this.#userLoseRound()
    }

    //private method for checking to see who has the higher score
    //this method is separate from #checkForRoundWinner because it seemed messy to have them together
    #checkForHigherScore(){
        //every thing in this method is assuming the user and the dealer did not bust
        
        //checks to see if the user has higher score
        if(this.user.userHand.score > this.dealer.score){

            //outputs a custom message and handles the bet with the #userWinRound
            addMessage("You win this round")
            this.#userWinRound()
            return
        }

        //checks to see if the dealer has a higher score
        if(this.user.userHand.score < this.dealer.score){

            //outputs a custom message and handles the bet with the #userLoseRound
            addMessage("You lost this round")
            this.#userLoseRound()
            return
        }


        //if we get here then we know the dealer and user have the same score
        addMessage("You Tied")
        this.#userTieRound()
    }

    //private method to seeing if the user busted
    #didUserBust(){
        return (this.user.userHand.score > this.bustThreshold)
    }

    //private method to see if the dealer has busted
    #didDealerBust(){
        return (this.dealer.score > this.bustThreshold)
    }

    //private method for when the user wins the round
    #userWinRound(){
        
        //tells the player how much they won, puts the money back into their wallet, and resets their bet to 0
        addMessage(`You win $${this.user.userBet}`)
        this.user.userWallet.value += this.user.userBet * 2
        this.user.userBet = 0

        //this will also show their new wallet and bet amounts 
        this.#showUsersMoney()
    }

    //private method for when the user ties the round
    #userTieRound(){

        //lets the player know they didn't lose or gain money, puts the money back into their wallet, and resets their bet to 0
        addMessage("It's a push, no money gained or lost")
        this.user.userWallet.value += this.user.userBet
        this.user.userBet = 0

        //this will also show their new wallet and bet amounts 
        this.#showUsersMoney()
    }

    //private method for when the user loses the round
    #userLoseRound(){

        //tells the player how much they lost, puts the money back into their wallet, and resets their bet to 0
        addMessage(`You lost $${this.user.userBet}`)
        this.user.userBet = 0

        //this will also show their new wallet and bet amounts 
        this.#showUsersMoney()
    }

    //private method for updating the view on the users wallet and bet
    #showUsersMoney(){

        //calls the view functions
        showWalletAmount(this.user.userWallet.value)
        updateBetAmount(this.user.userBet)
    }

    //private method for disabling all the buttons on the screen
    #disableAllButtons(){
        disableButton("incrementBet")
        disableButton("decrementBet")
        disableButton("deal")
        disableButton("hit")
        disableButton("stay")
        disableButton("reset")
    }
    
    //private method for showing the user and dealer score
    //it wont show the dealer score unless we input true
    #showScores(dealer = false){

        //validates input
        if(typeof dealer != "boolean"){
            console.error("Invalid Dealer Bool")
            return
        }

        //clears any messages and outputs the users score
        clearMessage()
        addMessage(`You have: ${this.user.userHand.score}`)

        //if we want the dealer's score too we will add that message
        if(dealer){
            addMessage(`Dealer has: ${this.dealer.score}`)
        }
    }

    //this sets the users bet, this method is called when the user clicks the increment and decrement bet buttons
    //I have this as an increment since we will be changing the wallet and bet amount and it is easier to calculate the values this way
    setBet(increment){

        //validate the inputs
        if(typeof increment != "number"){
            console.error("Invalid Increment Value")
            return
        }

        //validates that the user does not have any cards in their hand before changing the bet
        //this is assuming that the user can't change their bet mid round but if that feature was wanted we could get rid of this
        if(this.user.userHand.cards.length > 0){
            console.error("Can not add to bet mid round")
            return
        }

        //if the value of their wallet or their bet ever could go negative with that increment we will let the user know
        if(this.user.userBet + increment < 0 || this.user.userWallet.value - increment < 0){
            clearMessage()
            addMessage(`You can not bet that`)
            return
        }else{
            
            //we will clear the message after that if they can use that increment
            clearMessage()
        }

        //we will adjust their wallet and bet
        this.user.userWallet.value -= increment
        this.user.userBet += increment

        //we will disable the deal button if their bet is less than the minimum bet amount
        if(this.user.userBet < this.minBetAmount){
            disableButton("deal")
        }else{
            enableButton("deal")
        }

        //we will also update their money outputs
        this.#showUsersMoney()
    }
}

