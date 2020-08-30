import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvProcessorService {

  tableCommonName: any;
  tableStructureName: any;
  languageA: any;
  languageB: any;
  constructor() { }

  /**
   * Extract title from csv line like PHRASAL VERBS;;;;;;;
   * @param line 
   */
  getTitleFromLine(line){
    var res = line.split(';');
    this.tableCommonName = res[0];
    this.tableStructureName = res[0].replace(" ", "_");
    return this.tableStructureName;
  }

  /**
   * Extract language configs from english;;;español;;;;
   * @param line 
   */
  getTableConfig(line){
    var res = line.split(';;;');
    this.languageA = res[0];
    this.languageB = res[1];
    let config = {};
    config['cardName'] = this.tableCommonName;
    config['tableName'] = this.tableStructureName;
    config['languageA'] = this.languageA;
    config['languageB'] = this.languageB;
    config['most_viewed'] = 0;
    return config;
  }

  getTupla(line){
    var res = line.split(';');
    let tupla = {};
    tupla['tableName'] = this.tableStructureName;
    tupla['a_verb'] = res[0];
    tupla['a_mean'] = res[1];
    tupla['a_example'] = res[2];
    tupla['b_verb'] = res[3];
    tupla['b_mean'] = res[4];
    tupla['b_example'] = res[5];
    tupla['result'] = 0;
    tupla['viewed'] = 0;
    return tupla;
  }
}
