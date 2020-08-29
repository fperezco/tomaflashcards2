import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { Platform } from "@ionic/angular";
import { browserDBInstance } from "./browser";

declare var window: any;
const SQL_DB_NAME = "database.db";

@Injectable({
  providedIn: "root",
})
export class CompleteSqlService {
  dbInstance: any;
  plataforma:any

  constructor(public sqlite: SQLite, private platform: Platform) {
    //this.init();
    console.log("constructor invocado plaform => ", platform);

    if (!platform.is("cordova")){
      console.log("constructor no es cordova");
    }
    else {
      console.log("constrcutor es cordova");
    }

  }

  executeStatement(statement){
    console.log("!!!!!!execute statement!!!!!" + statement);
    console.log("dbinstance = ");
    console.log(this.dbInstance);
   /// this.dbInstance.executeSql(statement,[]);
   this.dbInstance.executeSql(statement, [])
   .then(() => {
     console.log('statement executes successfull');
   })
   .catch(e => console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ERROR executing statement:"+ e));
  }


  initializeWebEngine(databaseName){
    return new Promise(function (resolve, reject) {
      console.log("es cordova");
      let db = window.openDatabase(databaseName, "1.0", "DEV", 5 * 1024 * 1024);
      //this.dbInstance = browserDBInstance(db);
      resolve(browserDBInstance(db));
    });
  }

  initializeMobileEngine(databaseName){
    return new Promise(function (resolve, reject) {
      console.log("es android!!");
      let sqllite = new SQLite();

        sqllite.create({
          name: databaseName,
          location: "default",
        })
        .then((db: SQLiteObject) => {
          console.log("sqlite object resolved")
          resolve(db);
        })
        .catch((e) => {
          console.log("ERRORK" + e);
          reject(e);
        }
        );
   });
  }

  openDB(databaseName) {

    if (!this.platform.is("cordova")) {
      return this.initializeWebEngine(databaseName).then((response) => {
        this.dbInstance = response;
      });
    }
    else{
      return this.initializeMobileEngine(databaseName).then((response) => {
        this.dbInstance = response;
      });
    }
}

}
