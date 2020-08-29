import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FolderPageRoutingModule } from './folder-routing.module';

import { FolderPage } from './folder.page';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
//import { File } from '@ionic-native/file';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FolderPageRoutingModule
  ],
  declarations: [FolderPage],
})
export class FolderPageModule {

  constructor() { }



  //fileTransfer: FileTransferObject = this.transfer.create();
  
  // full example
/*   upload() {
    let options: FileUploadOptions = {
       fileKey: 'file',
       fileName: 'name.jpg',
       headers: {}
    };
  
    this.fileTransfer.upload('<file path>', '<api endpoint>', options)
     .then((data) => {
       console.log("file uploaded");
     }, (err) => {
       console.log("error uploading file");
     });
  } */
}
