import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {
  imageSrc: string;

  constructor(
    private router: Router,
    public backendService: BackendService
  ) { }

  ngOnInit(): void {
    if (this.backendService.currentUser() !== null) {
      if (this.backendService.currentUser().thumbnailPhoto !== null) {
        const search = this.backendService.currentUser().thumbnailPhoto.search('data:image/jpeg;base64');
        if (search === 0) {
          this.imageSrc = this.backendService?.currentUser().thumbnailPhoto;
        } else {
          // tslint:disable-next-line:no-construct
          const photo = new String('data:image/jpeg;base64,');
          this.imageSrc = photo.concat(this.backendService?.currentUser().thumbnailPhoto);
        }
      } else {
        this.imageSrc = '../../../assets/images/users/default.jpg';
      }
    }
  }

  logout(): void {
    this.backendService.logout();
    this.router.navigate(['/login']);
    this.imageSrc = '';
  }

}
