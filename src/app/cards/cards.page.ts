import { Component, OnInit } from '@angular/core';
import * as globalVars from '../config/config';
import { CompleteSqlService } from '../services/complete-sql.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.page.html',
  styleUrls: ['./cards.page.scss'],
})
export class CardsPage implements OnInit {

  cards: any;
  cardsConfigSta: any;
  cardsCollections: any;
  currentCardCollection: any;
  constructor(private sql: CompleteSqlService) { }

  ngOnInit() {
    this.cards = new Array();
    this.cardsCollections = new Array();
    this.cardsConfigSta = new Array();
    //this.retrieveCards();
    this.calculateCollectionStatisticsAndAdd2();
  }

  retrieveCards(){
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      //this.sql.dbInstance.executeSql("SELECT * FROM cards_config")
      this.sql.executeSQLStatement("SELECT * FROM cards_config")
      .then((r) => {
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            console.log(r);
          }
        }
      })
      .catch(e =>{
        console.log("Error on select"+ e);
        console.log(e);
      } 
        );
    });
  }


  calculateCollectionStatisticsAndAdd2(){
    //retrieve call configs
    let cardConfigItem: any;
    cardConfigItem = new Array();
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.executeSQLStatement("SELECT * FROM cards_config")
      .then((r) => {
        console.log(r);
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            console.log(r);
            // for every card config, analize and get statistics from cards
            //this.cardsCollections.push(r.rows.item(i));
            console.log("COLLECTION---------------------------------------------------------------------------------------------");
            console.log(r.rows.item(i));
            this.currentCardCollection = r.rows.item(i);
            this.initializeStatisticsAttributes();

            this.sql.openDB(globalVars.databaseName)
            .then( () => {
              this.sql.executeSQLStatement("SELECT * FROM '"+this.currentCardCollection.card_table +"'")
              .then((r) => {
                if (r.rows.length > 0) {
                  for (var i = 0; i < r.rows.length; i++) {
                    let card = r.rows.item(i);
                    //console.log("antes de ir a las cards, currentCardCollection => ");
                    //console.log(this.currentCardCollection);
                    this.analyzeCardAndUpdateStatistics(card);
                  }
                  console.log("card configgggggggggg---------------");
                  console.log(this.currentCardCollection);
                  this.cardsCollections.push(this.currentCardCollection);
                }
              })
              .catch(e =>{
                console.log("Error on select"+ e);
                console.log(e);
              } 
                );
            });
        }
      }})
      .catch(e => console.log('Error on select' + e));
    });
  }

  initializeStatisticsAttributes(){
    this.currentCardCollection.unknown = 0;
    this.currentCardCollection.easy = 0;
    this.currentCardCollection.medium = 0;
    this.currentCardCollection.hard = 0;

    this.currentCardCollection.lessViewed = 0;
    this.currentCardCollection.mediumViewed = 0;
    this.currentCardCollection.veryViewed = 0;
    this.currentCardCollection.notViewed = 0;
  }

  analyzeCardAndUpdateStatistics(card){

    // calculate parameters difficulty groups and seen groups
    const mostViewed =  this.currentCardCollection.most_viewed; // equal max
    const veryViewed = mostViewed - mostViewed * 0.25; // between mostViewed and mostViewed -25%
    const mediumViewed = mostViewed - mostViewed * 0.75; // between veryViewed and lessViewed 75-25%

    console.log("este card result = "+ card.result);
    if (card.result == 0) {
      this.currentCardCollection.unknown++;
    }
    else if (card.result > 0 && card.result <= 1.5) {
      this.currentCardCollection.easy++;
    }
    else if (card.result > 1.5 && card.result <= 2.5){
      this.currentCardCollection.medium++;
    }
    else {
      this.currentCardCollection.hard++;
    }

    if (card.viewed == 0){
      this.currentCardCollection.notViewed++;
    }
    else if (card.viewed >= veryViewed){
      this.currentCardCollection.veryViewed++;
    }
    else if ( card.viewed < veryViewed && card.viewed >= mediumViewed) {
      this.currentCardCollection.mediumViewed++;
    }
    else if( card.viewed < mediumViewed && card.viewed > 0){
      this.currentCardCollection.lessViewed++;
    }
  }

}
