import { Component , OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as RecordRTC from 'recordrtc';
import { AppService } from './app.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  fileToUpload: File = null;
  private record;
  recording = false;
  public url;
  private error;
  response;
  isloader = false;
  text: string = "";
  model_training = false;
  private transcript = "";
  model_list: any = [];
  select_model;
  inc_aud = false;
  checkinclude = false;

  constructor(private domSanitizer: DomSanitizer, private appService: AppService) {
  }
  ngOnInit(){
    // Making the HTTP Request
    //request the model list that are saved on the server
    this.appService.getModelList(this.model_training).subscribe(
      result =>{
          this.response = result;
          this.model_list = this.response.username;
          this.select_model = this.model_list[0]
      }
    );
  }

  audioinclude(){
    this.inc_aud = !this.inc_aud;
  }

  checking_detail_include(){
    this.checkinclude = !this.checkinclude;
  }



  model_change(e){
    this.select_model = e.target.value;
    console.log(e.target.value)
  }

  training_change(){
    this.model_training = !this.model_training
    // console.log(this.model_training)
    this.appService.getModelList(this.model_training).subscribe(
      result =>{
          this.response = result;
          this.model_list = this.response.username;
          this.select_model = this.model_list[0]
      }
    );

  }

  record_transcript(trans:any){
    this.transcript = trans;
    console.log(this.transcript);
  }



  sanitize(url:string){
      return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  initiateRecording() {

      this.recording = true;
      let mediaConstraints = {
          video: false,
          audio: true
      };
      navigator.mediaDevices
          .getUserMedia(mediaConstraints)
          .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  successCallback(stream) {
      var options = {
          mimeType: "audio/wav",
          numberOfAudioChannels: 1
      };
      //Start Actuall Recording
      var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
      this.record = new StereoAudioRecorder(stream, options);
      this.record.record();
  }
  errorCallback(error) {
      this.error = 'Can not play audio in your browser';
  }


  processRecording(blob) {
    this.url = URL.createObjectURL(blob);
    this.isloader=true;

    if(!this.model_training){
      this.appService.save(blob,"",this.select_model).subscribe(result => {
        this.response = result;
        console.log('s ',this.response.username);
        this.text = this.response.username;
        this.isloader = false;
      });
    }else{
      this.appService.save(blob,this.transcript,this.select_model).subscribe(result => {
        this.response = result;
        console.log('s ',this.response.username);
        this.text = this.response.username;
        this.isloader = false;
      });
    }
  }
  stopRecording() {
      this.recording = false;
      this.record.stop(this.processRecording.bind(this));
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    this.uploadFileToActivity()
  }

  uploadFileToActivity() {
    this.isloader=true;
    if(!this.model_training){
      this.appService.postFile(this.fileToUpload,"",this.select_model).subscribe(result => {
          this.response = result;
          console.log('s ',this.response.username);
          this.text = this.response.username;
          this.isloader = false;
        });
    }else{
      this.appService.postFile(this.fileToUpload,this.transcript,this.select_model).subscribe(result => {
          this.response = result;
          console.log('s ',this.response.username);
          this.text = this.response.username;
          this.isloader = false;
        });
    }
  }

  downLoadFile(data: any, type: string) {
    var blob = new Blob([data], { type: type.toString() });
    var url = window.URL.createObjectURL(blob);
    var pwa = window.open(url);
    if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
        alert('Please disable your Pop-up blocker and try again.');
    }
  }


  downloadData(){
        //this.fileService.downloadFile().subscribe(response => {
      this.isloader= true
      this.appService.downloadDataFile(this.inc_aud).subscribe((response: any) => { //when you use stricter type checking
        this.downLoadFile(response, 'application/zip');

    }), (error: any) => console.log('Error downloading the file'), //when you use stricter type checking
                 () => console.info('File downloaded successfully');
      this.isloader = false
  }


  downloadtraining(){
        //this.fileService.downloadFile().subscribe(response => {
      this.isloader= true
      this.appService.downloadTrainingDetail(this.checkinclude,this.select_model).subscribe((response: any) => { //when you use stricter type checking
        this.downLoadFile(response, 'application/zip');

    }), (error: any) => console.log('Error downloading the file'), //when you use stricter type checking
                 () => console.info('File downloaded successfully');
      this.isloader = false
  }

  handleDataInput(files: FileList) {
    this.fileToUpload = files.item(0);
    this.uploadData()
  }
  uploadData(){
    this.isloader=true;
    this.appService.uploadDataFile(this.fileToUpload).subscribe(result => {
        this.response = result;
        console.log('s ',this.response.username);
        this.text = this.response.username;
        this.isloader = false;
    });
  }
  training_click(){
    this.isloader = true

    this.text = 'training onging'
    this.appService.training_start(this.select_model).subscribe(result => {
        this.response = result;
        this.text = this.response.username
        this.isloader = false
    })
  }

  handleTrainingInput(files: FileList){
    this.fileToUpload = files.item(0);
    this.uploadTrainingSpecification()
  }
  uploadTrainingSpecification(){
    this.isloader=true;
    this.appService.uploadTraining(this.fileToUpload).subscribe(result => {
        this.response = result;
        console.log('s ',this.response.username);
        this.text = this.response.username;
        this.isloader = false;
    });
  }





}
