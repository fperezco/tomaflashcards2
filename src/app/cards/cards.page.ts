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
  constructor(private sql: CompleteSqlService) { }

  ngOnInit() {
    this.cards = new Array();
    this.retrieveCards();
  }

  retrieveCards(){
    this.sql.openDB(globalVars.databaseName)
    .then( () => {
      this.sql.dbInstance.executeSql("SELECT * FROM cards_config")
      .then((r) => {
        if (r.rows.length > 0) {
          for (var i = 0; i < r.rows.length; i++) {
            this.cards.push(r.rows.item(i));
          }
        }
      })
      .catch(e => console.log("Error on select"+ e));
    });
  }
}
