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
  currentFace = '';
  currentCardConfig: any;
  constructor(private sql: CompleteSqlService) { }

  ngOnInit() {
    this.cardCollections = new Array();
    this.cards = new Array();
    this.retrieveCardsCollection();
  }

  submitForm() {
    console.log('review started');
    //this.loadSpecificCollection();
    this.loadCollectionCardConfigAndLoadCollection();
  }

  loadCollectionCardConfigAndLoadCollection(){
    // we must load card config before because we use mostviewed column to construct cards collection sentence
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      console.log("HEREEEE CARGANDO cards_config....... currentCardConfig");
      this.sql.executeSQLStatement("SELECT * FROM cards_config WHERE id = '" + this.cardCollectionSelected.id + "'")
      .then((r) => {
        console.log("RESULTADOOOOO => r = ");
        console.log(r);
        this.currentCardConfig = r.rows.item(0);
        this.loadSpecificCollection();
      })
      .catch(e =>{
        console.log("Error on select"+ e);
        console.log(e);
      } 
        );
    });


  }

  loadSpecificCollection(){

    let sentence = this.constructSentence();

    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement(sentence)
      .then((r) => {
        console.log(r);
        this.loadCardsAndSetInitialParameters(r);
        console.log(" tras el loadCardsAndSetInitialParameters currentCardConfig = ");
        console.log(this.currentCardConfig);
      })
      .catch(e => console.log('Error on select'+ e));
    });

  }

  loadCardsAndSetInitialParameters(r){
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
  }

  setInitialFace(){
   this.currentFace = this.cardOrder;
  }


/*   loadCardConfig(cardTableName){
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      console.log("HEREEEE CARGANDO cards_config....... currentCardConfig");
      this.sql.executeSQLStatement("SELECT * FROM cards_config WHERE card_table = '" + cardTableName + "'")
      .then((r) => {
        console.log("RESULTADOOOOO => r = ");
        console.log(r);
        this.currentCardConfig = r;
      })
      .catch(e =>{
        console.log("Error on select"+ e);
        console.log(e);
      } 
        );
    });
  } */


  constructSentence(){

    let sentence = 'SELECT * FROM ' + this.cardCollectionSelected.card_table;
    let difficulty = '';
    let viewed = '';
    let order = '';

    if (this.playMode != 1){
      order = 'ORDER BY ' + this.cardOrder;
    }
    // difficulty calculation
    if (this.diffMode != 0){
      if (this.diffMode == 1 ){
        difficulty = ' WHERE result between 1 and 1.5 ';
      }
      else if ( this.diffMode == 2){
        difficulty = ' WHERE result between 1.51 and 2.5 ';
      }
      else {
        difficulty = ' WHERE result between 2.51 and 3 ';
      }
    }

    console.log("antes de setear parametro card_config, currentCardConfig = ");
    console.log(this.currentCardConfig);
    // viewed calculation
    if (this.seenMode != 100){
      // get how many times has been seen the most viewed:
      const mostViewed = this.currentCardConfig.most_viewed; // equal max
      const veryViewed = mostViewed - mostViewed * 0.25; // between mostViewed and mostViewed -25%
      const mediumViewed = mostViewed - mostViewed * 0.75; // between veryViewed and lessViewed 75-25%

      if (this.seenMode == 0){
        viewed = ' viewed = 0';
      }
      else if ( this.seenMode == 25){
        viewed = ' viewed between 0 and ' + mediumViewed;
      }
      else if ( this.seenMode == 50 ){
        viewed = ' viewed between ' + mediumViewed + ' and ' + veryViewed;
      }
      else if( this.seenMode == 75) {
        viewed = ' viewed between ' + veryViewed + ' and ' + mostViewed;
      }
    }

    if(this.diffMode != 0){
      sentence = sentence + difficulty;
      if ( this.seenMode != 100){
        sentence = sentence + ' and' + viewed;
      }
    }
    else{
      if ( this.seenMode != 100){
        sentence = sentence + ' WHERE' + viewed;
      }
    }
    sentence = sentence + ' ' + order;
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

  retrieveCardsCollection(){
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement('SELECT * FROM cards_config')
      .then((r) => {
        console.log(r);
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            this.cardCollections.push(r.rows.item(i));
          }
        }
      })
      .catch(e => console.log('Error on select'+ e));
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
    
    this.currentCard.viewed = this.currentCard.viewed + 1;
    console.log("puntuation viene =" + puntuation + "currenctcarresult = "+ this.currentCard.result + "y currenctardview = " + this.currentCard.viewed);
    this.currentCard.result = (puntuation + this.currentCard.result) / this.currentCard.viewed;
    let sentence = 'UPDATE ' + this.cardCollectionSelected.card_table + ' SET result=' + this.currentCard.result +',viewed=' +  this.currentCard.viewed + ' WHERE id=' + this.currentCard.id;
    console.log(sentence);
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement(sentence)
      .then(() => {
        this.updateCollectionMostViewed(this.currentCard.viewed);
        this.setNextCard();
      })
      .catch(e => console.log('Error on select'+ e));
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

  updateCollectionMostViewed(viewed){
    console.log("update collectionmostviewed-- viewed =" + viewed +" currentcardconfig most viewed = " +this.currentCardConfig.most_viewed);
    if( viewed > this.currentCardConfig.most_viewed){

      let sentence = 'UPDATE cards_config SET most_viewed=' + viewed + ' WHERE card_table="' + this.cardCollectionSelected.card_table + '"';
      console.log(sentence);
      this.sql.openDB(globalVars.databaseName)
      .then( () => {
        this.sql.executeSQLStatement(sentence)
        .then(() => {
          console.log("card_config updated");
          this.currentCardConfig.most_viewed = viewed;
        })
        .catch(e => console.log('Error on select'+ e));
      });
    }
  }

}
