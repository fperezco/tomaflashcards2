import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompleteSqlService } from '../services/complete-sql.service';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { CsvProcessorService } from '../services/csv-processor.service';
import { AlertController } from '@ionic/angular';

//run on emulador
// ionic cordova run android 
//run en mi movil
//ionic cordova run android --device


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss']
})
export class FolderPage implements OnInit {
  public folder: string;
  content: any;
  users: any;
  dbEngine: any;
  databaseName="tomaFlashCard3.db";
  currentTableName: any;

  constructor(private activatedRoute: ActivatedRoute,
    private sql: CompleteSqlService,
    private csvProcessor: CsvProcessorService,
    public alertController: AlertController
    ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.initializeEngine();
  }

    initializeEngine(){
      this.sql.openDB(this.databaseName)
      .then(() =>{
        console.log("database initialized, create config table..");
        this.sql.executeStatement('CREATE TABLE IF NOT EXISTS cards_config (id INTEGER PRIMARY KEY AUTOINCREMENT,  card_name TEXT, card_table TEXT, language_a TEXT, language_b TEXT,elements INTEGER DEFAULT 0,most_viewed INTEGER DEFAULT 0)');
      })
      .then(() => {
        console.log("tabla creada, insertamos...");
      })
      .catch(err => console.error(err));
    }

    /**
     * Method invoke when csv file is selected
     * @param ev 
     */
  fileSelected(ev) {
    let myFile = ev.target.files[0];
    let reader = new FileReader();

    reader.readAsText(myFile);
    reader.onload = (e) => {
      const fileContent: string = reader.result as string;
      console.log('fileContent:' + fileContent);
      const lines: string[] = fileContent.split('\n'); 
      console.log("lineassss");
      console.log(lines);
      
      this.createFlashCardTable(lines);
    };
  }


  /**
   * Recibe a csv file, line by line and creates the FlashCard Section
   * @param csvLines 
   */
  createFlashCardTable(csvLines){
    var index = 1;
    var arrayLength = csvLines.length;
    console.log("longitud:"+ arrayLength);
    for (var i = 0; i < arrayLength; i++) {
      console.log(i + ":" + csvLines[i]);
      this.processLine(i, csvLines[i], arrayLength);
    }
    this.presentAlert("Data Import","","Data importation successfull");

  }

  processLine(index, line,numberOfLines){
    if (index === 0){
      let title = this.csvProcessor.getTitleFromLine(line);
      this.createTable(title);
    }
    if (index === 1){
      let config : any;
      config = this.csvProcessor.getTableConfig(line);
      console.log(config);
      this.addToConfigTable(config,numberOfLines-3);
    }
    if (index > 2 ){
      let tupla : any;
      tupla = this.csvProcessor.getTupla(line);
      console.log("tupla");
      console.log(tupla);
      this.insertToTable(tupla);
    }
  }


  createTable(tableName){
    // columns are a fixed value
    console.log("creating table....");
    const statement = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(id INTEGER PRIMARY KEY AUTOINCREMENT, a_verb TEXT,a_mean TEXT, a_example TEXT, b_verb TEXT, b_mean TEXT, b_example TEXT,result INTEGER,viewed INTEGER DEFAULT 0)';
    console.log(statement);
    this.currentTableName = tableName;
    this.sql.executeStatement(statement);
  }

  addToConfigTable(config,numberOfLines){
    console.log("creating config table if does not exists....");

    let isExistsSentence = "SELECT * FROM cards_config WHERE card_name='"+config['cardName']+"'";

    this.sql.executeSQLStatement(isExistsSentence)
    .then((r) => {
      console.log(r);
      if (r.rows.length > 0) {
        //exists => update it
        const statement = "UPDATE cards_config SET card_table='"+config['tableName'] +"', language_a='"+config['languageA'] +"', language_b='"+config['languageB'] +"',elements="+numberOfLines +" WHERE card_name='"+config['cardName'] +"'";
        console.log(statement);
        this.sql.executeStatement(statement);
      }
      else {
        //insert it
        const statement = "INSERT INTO cards_config(card_name,card_table,language_a,language_b,elements,most_viewed) VALUES ('"+config['cardName'] +"','"+config['tableName'] +"','"+config['languageA'] +"','"+config['languageB'] +"',"+numberOfLines +","+config['most_viewed'] +")";
        console.log(statement);
        this.sql.executeStatement(statement);
      }
    })
    .catch(e => console.log("Error on select"+ e));

  }

  insertToTable(tupla:any){
    console.log("insert or update to table....");
    // if don't exists , insert it, update method to conserve previous ranks
    let isExistsSentence = "SELECT * FROM "+tupla['tableName'] + " WHERE a_verb='"+tupla['a_verb']+"'";
    
    this.sql.executeSQLStatement(isExistsSentence)
    .then((r) => {
      console.log(r);
      if (r.rows.length > 0) {
        //exists => update it
        const statement = "UPDATE "+tupla['tableName']+" SET a_mean='"+tupla['a_mean'] +"', a_example='"+tupla['a_example'] +"', b_verb='"+tupla['b_verb'] +"', b_mean='"+tupla['b_mean'] +"', b_example='"+tupla['b_example'] + "' WHERE a_verb='"+tupla['a_verb'] +"'";
        console.log(statement);
        this.sql.executeStatement(statement);
      }
      else {
        //insert it
        const statement = "INSERT INTO "+tupla['tableName']+"(a_verb,a_mean, a_example, b_verb, b_mean, b_example, result,viewed) VALUES ('"+tupla['a_verb'] +"','"+tupla['a_mean'] +"','"+tupla['a_example'] +"','"+tupla['b_verb'] +"','"+tupla['b_mean'] +"','"+tupla['b_example'] + "','"+tupla['result'] +"','"+tupla['viewed'] +"')";
        console.log(statement);
        this.sql.executeStatement(statement);
      }
    })
    .catch(e => console.log("Error on select"+ e));


  }


  async presentAlert(header,subHeader,message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
