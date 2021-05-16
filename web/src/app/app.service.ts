import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};


@Injectable()
export class AppService {
  constructor(private httpClient: HttpClient) { }
  baseUrl: string = 'http://localhost:8080/';

  save(blob: any,transcript: any,select_model:any): Observable<{}>{
    if(!transcript){
      return this.httpClient.post(this.baseUrl+'file', blob,{headers: new HttpHeaders({
           'Content-Type':  'application/json'
            }),
            params: new HttpParams().set('model', select_model)}).pipe(
        data => {return data;}
      );
    }else{
      var formdata = new FormData()
      formdata.append("audio",blob)
      formdata.append("text",transcript)
      return this.httpClient.post(this.baseUrl+'training',formdata).pipe(
        data => {return data;}
      );
    }
  }

  postFile(fileToUpload: File,transcript: any,select_model:any): Observable<{}> {

    const endpoint = this.baseUrl+'file';
    if(!transcript){
      return this.httpClient.post(endpoint, fileToUpload, {      headers: new HttpHeaders({
              'Content-Type':  'application/json'
            }),
            params: new HttpParams().set('model', select_model)}).pipe(
        data => {return data;}
      );
    }else{
      var formdata = new FormData()
      formdata.append("audio",fileToUpload)
      formdata.append("text",transcript)
      return this.httpClient.post(this.baseUrl+'training',formdata).pipe(
        data => {return data;}
      );
    }
  }

  getModelList(model_training:any): Observable<{}>{
    // console.log(this.httpClient.get(this.baseUrl+'model'));
    return this.httpClient.get(this.baseUrl+'model', {params: new HttpParams().set('model',model_training)});
  }

  downloadDataFile(inc_aud:any): any{
    return this.httpClient.get(this.baseUrl+'downloadData', { responseType:'arraybuffer',params: new HttpParams().set('inc_aud', inc_aud)});
 }

 uploadDataFile(dataToUpload:File): any{
   return this.httpClient.post(this.baseUrl+'uploadData',dataToUpload).pipe(
     data=>{return data;}
   )
 }

 uploadTraining(dataToUpload:File): any{
   return this.httpClient.post(this.baseUrl+'uploadTraining',dataToUpload).pipe(
     data=>{return data;}
   )
 }

 training_start(model: any): any{
   return this.httpClient.get(this.baseUrl+'model_training',{params: new HttpParams().set('model',model)})
 }

 downloadTrainingDetail(including_checkpoint:any,model:any):any{
   return this.httpClient.get(this.baseUrl+'downloadTraining', { responseType:'arraybuffer',params: new HttpParams().set('including_checkpoint', including_checkpoint).set('model',model)});
 }

 // getEventSource(url: string): EventSource{
 //   return new EventSource(url)
 // }
 //
 // getServerSentEvent(url: string): Observable<any> {
 //  return Observable.create(observer => {
 //    const eventSource = this.getEventSource(this.baseUrl+'model_training')
 //
 //    eventSource.onmessage = event => {
 //      this.zone.run(() => {
 //        if (event.data === 'eos') {
 //          var streamdata =<any>{}
 //          streamdata.close = true
 //          observer.next(streamdata)
 //          eventSource.close()
 //        } else {
 //          observer.next(event)
 //        }
 //      })
 //    }

}
