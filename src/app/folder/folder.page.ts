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
        this.sql.executeStatement('CREATE TABLE IF NOT EXISTS cards_config (id INTEGER PRIMARY KEY AUTOINCREMENT,  card_name TEXT, card_table TEXT, language_a TEXT, language_b TEXT)');
      })
      .then(() => {
        console.log("tabla creada, insertamos");
      })
      .then(() => {
        console.log("insercion completada");
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
      this.processLine(i, csvLines[i]);
    }

    this.presentAlert("Data Import","","Data importation successfull");

  }

  processLine(index, line){
    if (index === 0){
      let title = this.csvProcessor.getTitleFromLine(line);
      this.createTable(title);
    }
    if (index === 1){
      let config : any;
      config = this.csvProcessor.getTableConfig(line);
      console.log(config);
      this.addToConfigTable(config);
    }
    if (index > 2 ){
      let tupla : any;
      tupla = this.csvProcessor.getTupla(line);
      console.log("tupla");
      console.log(tupla);
      this.insertToTable(tupla);

    }
  }

  createTable(title){
    // columns are a fixed value
    console.log("creating table....");
    const statement = 'CREATE TABLE IF NOT EXISTS ' + title + '(id INTEGER PRIMARY KEY AUTOINCREMENT, a_verb TEXT,a_mean TEXT, a_example TEXT, b_verb TEXT, b_mean TEXT, b_example TEXT,result INTEGER)';
    console.log(statement);
    this.sql.executeStatement(statement);
  }

  addToConfigTable(config){
    console.log("creating config table....");
    const statement = "INSERT INTO cards_config(card_name,card_table,language_a,language_b) VALUES ('"+config['cardName'] +"','"+config['tableName'] +"','"+config['languageA'] +"','"+config['languageB'] +"')";
    console.log(statement);
    this.sql.executeStatement(statement);
  }

  insertToTable(tupla:any){
    console.log("insert to table....");
    // if don't exists , insert it, update method to conserve previous ranks
    

    const statement = "INSERT INTO "+tupla['tableName']+"(a_verb,a_mean, a_example, b_verb, b_mean, b_example, result) VALUES ('"+tupla['a_verb'] +"','"+tupla['a_mean'] +"','"+tupla['a_example'] +"','"+tupla['b_verb'] +"','"+tupla['b_mean'] +"','"+tupla['b_example'] + "','"+tupla['result'] +"')";
    console.log(statement);
    this.sql.executeStatement(statement);
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
