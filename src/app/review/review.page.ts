import { Component, OnInit } from '@angular/core';
import { CompleteSqlService } from '../services/complete-sql.service';
import * as globalVars from '../config/config';
import { isBuffer } from 'util';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {

  cardCollections: any;
  cardCollectionSelected: any;
  cardOrder: any;
  playMode: any;
  diffMode: any;
  seenMode: any;
  reviewStarted = false;
  cards: any;
  currentCard: any;
  currentCardIndex: number;
  currentFace = "";
  constructor(private sql: CompleteSqlService) { }

  ngOnInit() {
    this.cardCollections = new Array();
    this.cards = new Array();
    this.retrieveCardsCollection();
  }

  submitForm() {
    console.log("review started");
    this.loadSpecificCollection();
  }

  loadSpecificCollection(){

    let sentence = this.constructSentence();

    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement(sentence)
      .then((r) => {
        console.log(r);
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            this.cards.push(r.rows.item(i));
          }
        }
  
        if(this.playMode == 1){
          this.shuffleArray(this.cards);
        }

        this.currentCard = this.cards[0];
        this.currentCardIndex = 0;
        this.reviewStarted = true;

        this.setInitialFace();

      })
      .catch(e => console.log("Error on select"+ e));
    });

  }

  setInitialFace(){
   this.currentFace = this.cardOrder;
  }

  constructSentence(){
    let sentence = "";
    let order = "";
    if (this.playMode != 1){
      order = "ORDER BY " + this.cardOrder;
    }
    if (this.diffMode != 0){
      sentence = "SELECT * FROM "+ this.cardCollectionSelected.card_table + " WHERE result=" + this.diffMode + " and viewed <=" + this.seenMode;
    }
    else{
      sentence = "SELECT * FROM "+ this.cardCollectionSelected.card_table +" WHERE viewed <=" + this.seenMode;
    }

    sentence = sentence + " " + order;
    return sentence;
  }
  

  shuffleArray(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }

/*
SELECT * FROM ?  WHERE result=? order by ?; [this.cardCollectionSelected.card_table,this.diffMode,this.cardOrder]
SELECT * FROM ?  WHERE result=? order by RANDOM [this.cardCollectionSelected.card_table,this.diffMode]

$scope.login = function(firstname,lastname) {
     $cordovaSQLite.execute(db,"SELECT firstname, lastname FROM people where firstname=? and lastname=?",[firstname,lastname]).then(function(res) {
          if(res.rows.length >0)
            window.location="login.html";
        }, function (err) {
          console.error(err);
        });
      }

*/

  retrieveCardsCollection(){
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement("SELECT * FROM cards_config")
      .then((r) => {
        console.log(r);
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            this.cardCollections.push(r.rows.item(i));
          }
        }
      })
      .catch(e => console.log("Error on select"+ e));
    });
  }

  flipCard(){
    if(this.currentFace === 'a_verb'){
      this.currentFace = 'b_verb';
    }
    else {
      this.currentFace = 'a_verb';
    }
  }

  nextCardAndSetPuntuation(puntuation){
    this.savePuntuationAndNextCard(puntuation);
  }

  savePuntuationAndNextCard(puntuation){

    let viewed = this.currentCard.viewed + 1;
    let sentence = "UPDATE "+ this.cardCollectionSelected.card_table + " SET result="+puntuation+",viewed="+viewed+" WHERE id="+this.currentCard.id;
    console.log(sentence);
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement(sentence)
      .then(() => {
        this.setNextCard();
      })
      .catch(e => console.log("Error on select"+ e));
    });
  }


  setNextCard(){
    if(this.currentCardIndex + 1 >= this.cards.length){
      this.currentCardIndex = 0;
    }
    else{
      this.currentCardIndex++;
    }
    this.currentCard = this.cards[this.currentCardIndex];
    this.currentFace = this.cardOrder;
  }

}
