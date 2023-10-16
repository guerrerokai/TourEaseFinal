import { ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { FireServiceService } from '../services/fire-service.service';
import { Router } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';
import { TypesenseService } from '../services/typesense.service';
import { map } from 'rxjs';


@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css','../../assets/css/homePages.css']
})
export class NewPostComponent {
  
  @ViewChild(GoogleMap, { static: false }) addMap!: GoogleMap;

  openModal(){
    const modal = this.el.nativeElement.querySelector('#exampleModalCenter');
    this.renderer.setAttribute(modal, 'style', 'display: block');
  }

  
  markers:any;
  addMarker() {
    this.markers.push({
      position: this.center,
      label: {
        color: 'red',
        text: 'Marker label ' + (this.markers.length + 1),
      },
      title: 'Marker title ' + (this.markers.length + 1),
      options: { animation: google.maps.Animation.BOUNCE },
    });
  }

  isModalOpen = false;
  popups:any;
  center: google.maps.LatLngLiteral = {
    lat: 13.7565,
    lng: 121.0583
  };
  zoom = 10;
  display: any;

  moveMap(event: google.maps.MapMouseEvent) {

    if (event.latLng != null) this.center = (event.latLng.toJSON());

  }

  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  viewLoc(){
    var popups = document.querySelectorAll('.popup'); 
    var viewPopUp = document.querySelector("#viewPopUp");
    (viewPopUp as HTMLElement).style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  closeView(){
    var closeButtons = document.querySelector('.close');
    var viewPopUp = document.querySelector("#viewPopUp");
    (viewPopUp as HTMLElement).style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  post_title:any;
  tourist_spot:any;
  post_body:any;
  rating:any;
  day:any;
  month:any;
  year:any;
  time:any;
  currentUser:any;
  photo:any;
  tspot:any;
  search:any;
  searchResults:any;
  showResults:boolean = false;
  estNameList: string[] = []; 
  searchRaw:any;
  

  searchSpot(){
    this.showResults = true;
    this.estNameList = [];
    this.typesense.searchEst(this.search)
      .then((res) => {
        if(res){
          console.log(res);
          
          for(var k in res){
           this.estNameList.push(res[k].estName);
           
          }
        }else{
          console.log("undefined res")
        }
       
      })
      .catch((err:any) => {
        
      });
  }

  selectResult(result: string) {
    alert("clicked!");
    console.log(result);
    this.search = result; // Set the input value to the selected result
    this.showResults = false; // Hide the results
    // You can also perform additional actions based on the selected result.
  }

  loseFocus(){
    this.showResults = false;
  }

  gainFocus(){
    this.showResults = true;
  }
  

  //nested collections
  photos:any;
  comments:any;

  constructor(
    public fireService:FireServiceService,
    public router:Router,
    public typesense:TypesenseService,
    public changeDetector: ChangeDetectorRef,
    private renderer: Renderer2,
    private el:ElementRef
  ){

  }

  ngOnInit(){
    
  }

  
  ngAfterViewInit(){
    var addMap = document.getElementById("addMap");
    var addMarker = document.getElementById("mapMark");

    
    
    /* this.addMap!.googleMap!.addListener("drag", (e:any) => {
      var newCenter = this.addMap.getCenter()?.toJSON();
      console.log(newCenter);
      /* this.center = newCenter!; 
      

    }); */

  }

 /*  markerPosition:any;
  updateMarkerPosition(newLat: number, newLng: number) {
    this.markerPosition = { lat: newLat, lng: newLng };
    this.changeDetector.detectChanges(); // Trigger change detection
  } */
  

  savePost(){
    let postData = {
      title:this.post_title,
      location:this.tourist_spot,
      body:this.post_body,
      rating:this.rating,
      day:this.day,
      month: this.month,
      year: this.year,
      user: this.currentUser
    }
    this.fireService.savePost(postData).then(
      res=>{
        console.log(res);
        alert("Posted Successfully.");
      }, err=>{
        alert(err.message);
        console.log(err);
      }
    );
  }

  @ViewChild('textArea') textArea!: ElementRef;

  formatText(format: string) {
    const textarea: HTMLTextAreaElement = this.textArea.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    // Apply formatting based on 'format' parameter
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
    }

    // Replace the selected text with the formatted text
    this.post_body = this.post_body.slice(0, start) + formattedText + this.post_body.slice(end);
  }

 

  textHistory: string[] = []; // Store text history
  currentIndex: number = -1; // Current position in text history

  
  @HostListener('window:keydown.control.z', ['$event'])
  onCtrlZ(event: KeyboardEvent) {
    event.preventDefault(); // Prevent the default browser undo behavior
    this.undo();
  }

  undo() {
    if (this.currentIndex > 0) {
        // Decrement the currentIndex
        this.currentIndex--;

        // Set the text to the previous state in history
        this.post_body = this.textHistory[this.currentIndex];
      }
    }

    plainText: string = '';
    formattedText: string = '';


    // This method is called whenever the text changes
    onTextChanged() {
      // Update the text history with the current text
      this.textHistory.push(this.post_body);
      // Update the currentIndex to the latest history position
      this.currentIndex = this.textHistory.length - 1;
    }

}

export interface SearchResult {
  document: {
    estName: string;
    city:string
    // Add other properties if they exist
  };
  // Add other properties if they exist
}
