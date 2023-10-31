import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Firestore, doc } from 'firebase/firestore';
import { map } from 'rxjs';
import { FireServiceService } from 'src/app/services/fire-service.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-managespots',
  templateUrl: './managespots.component.html',
  styleUrls: ['./managespots.component.css', '../../../assets/css/adminPages.css', '../../../assets/css/homePages.css']
})
export class ManagespotsComponent {
  isModalOpen = false;
  popups:any;
  placeName:any;
  city:any;
  category:any;
  status:any;
  description:any;
  photo:any;
  destList:any;

  batangasCities = [
    {name: 'Agoncillo'},
    {name: 'Alitagtag'},
    {name: 'Balayan'},
    {name: 'Balete'},
    {name: 'Batangas City'},
    {name: 'Bauan'},
    {name: 'Calaca'},
    {name: 'Calatagan'},
    {name: 'Cuenca'},
    {name: 'Ibaan'},
    {name: 'Laurel'},
    {name: 'Lemery'},
    {name: 'Lian'},
    {name: 'Lipa'},
    {name: 'Lobo'},
    {name: 'Mabini'},
    {name: 'Malvar'},
    {name: 'Mataasnakahoy'},
    {name: 'Nasugbu'},
    {name: 'Padre Garcia'},
    {name: 'Rosario'},
    {name: 'San Jose'},
    {name: 'San Juan'},
    {name: 'San Luis'},
    {name: 'San Nicolas'},
    {name: 'San Pascual'},
    {name: 'Santa Teresita'},
    {name: 'Santo Tomas'},
    {name: 'Taal'},
    {name: 'Talisay'},
    {name: 'Tanauan'},
    {name: 'Taysan'},
    {name: 'Tingloy'},
    {name: 'Tuy'},
  ]

  constructor(
    public fireService:FireServiceService,
    public router:Router,
    public firestore:AngularFirestore,
    public load:LoaderService){
      this.retrieveDestinations();
  }

  handleNavigationClick(event:any) {
    const targetId = event.target.getAttribute("data-section");
    if (targetId) {
        this.showSection(targetId);

        // Remove the "active" class from all navigation links
        this.navigationLinks.forEach((link:any) => {
            link.classList.remove("active");
        });

        // Add the "active" class to the clicked link
        event.target.classList.add("active");
    }
  }

  showSection(sectionId:any) {
    const sections = document.querySelectorAll(".content-section");
    
    sections.forEach((section) => {
      if(section instanceof HTMLElement){
        section.style.display = "none";
      }
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = "block";
    }

  }

  navigationLinks:any;
  zoomedImg:any;
  modal:any;
  photos:any;

  ngAfterViewInit(){
    this.showSection("blogs");
    this.navigationLinks[0].classList.add("active"); 
   }
  

  uploadData(){
    let tourismData = {
      tourismID:this.firestore.createId(),
      estName:this.placeName,
      city:this.city,
      category:this.category,
      desc:"No Description Yet",
      photo:"No Photo Yet"
    }
    let counter = 0;

    for(var key in this.destList){
      if(tourismData.estName.toUpperCase() === this.destList[key].estName.toUpperCase()){
        counter++;
        console.log(tourismData.estName.toUpperCase() + this.destList[key].estName.toUpperCase());
      }
    }
    
    if(counter == 0){
      this.fireService.saveTouristDestion(tourismData).then(
        res=>{
          alert("Successfully Added.");
          //updates the counter
          this.fireService.getDocumentCounter().then((doc)=>{
            if(doc){
              /* this.newNum = 1 + doc.tspots;
              let data = {
                recent_users:doc.recent_users,
                tspots : this.newNum,
                users:doc.users,
                posts:doc.posts
              } */
              doc.tspots++;
              
              this.fireService.updateCount(doc).catch(err => {console.error(err)});
            }
          });

          if(this.addM){
            this.resetAdd();
          }else{
            this.closeAdd();
            this.resetAdd();
          }
          
        }, err=>{
          alert(err.message);
          console.log(err);
        }
      );
    }else{
      console.log(counter);
      
      alert("The Name of the Place already exists.")
    }
    
    
  }

  resetAdd(){
    this.placeName = '';
    this.city = '';
    this.category = '';
    this.status = '';
    this.description = '';
  }

  addOne(){
    var addPopUp = document.querySelector("#addPopUp");
    (addPopUp as HTMLElement).style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  addM = false;

  addMany(){
    var addPopUp = document.querySelector("#addPopUp");
    (addPopUp as HTMLElement).style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.addM = true;
  }

  closeAdd(){
    var closeButtons = document.querySelector('.close');
    var viewPopUp = document.querySelector("#addPopUp");
    (viewPopUp as HTMLElement).style.display = 'none';
    document.body.style.overflow = 'auto';
    this.addM = false;
  }

  tspotView:any;
  viewSpot(data:any){
    var popups = document.querySelectorAll('.popup'); 
    var viewPopUp = document.querySelector("#viewPopUp");
    (viewPopUp as HTMLElement).style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.tspotView = data;
  }

  editData:any;
  editTspot(dest:any){
    var viewPopUp = document.querySelector("#editPopUp");
    (viewPopUp as HTMLElement).style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.editData = dest;
  }

  editTData(){
    this.load.openLoadingDialog();
    this.fireService.updateDocument("tourist_spots", this.editData.tourismID, this.editData).then(() => {
      this.load.closeLoadingDialog();
      alert("Updated Successfully");
      this.closeEdit();
    }).catch(err => {
      console.error(err);
    })
  }

  archiveTspot(data:any){
    this.load.openLoadingDialog();
    this.fireService.moveDocumentToNewCollection("tourist_spots", "archived_tourist_spots", data.tourismID);
  }

  closeEdit(){
    var closeButtons = document.querySelector('.close');
    var viewPopUp = document.querySelector("#editPopUp");
    (viewPopUp as HTMLElement).style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  closeView(){
    var closeButtons = document.querySelector('.close');
    var viewPopUp = document.querySelector("#viewPopUp");
    (viewPopUp as HTMLElement).style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  

  newNum:any;
  list:any;

  ngOnInit(){
    this.list = document.querySelectorAll(".navigation li");
    this.list[3].classList.add("hovered");
  }

  retrieveDestinations(){
    this.fireService.getAllTouristDestinations().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).subscribe(data => {
      this.destList = data;
    });

  }
}


