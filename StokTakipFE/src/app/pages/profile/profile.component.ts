import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

import { BackendService } from 'src/app/services/backend.service';
import { ApiProfileDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileDefinitionResponse';
import { ApiCompanyDefinitionResponse } from 'src/app/services/serviceClasses/ApiCompanyDefinitionResponse';
import { ActivatedRoute } from '@angular/router';
import { ApiProfileAccountDefinitionResponse } from 'src/app/services/serviceClasses/ApiProfileAccountDefinitionResponse';
import { authorityLevel } from 'src/app/services/serviceClasses/authorityLevel';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  showPasswordIcon = false;
  showPasswordIcon2 = false;
  saveUserEnabled = false;
  userEdit: string;
  userAuthority: string;
  imageSrc = '';
  defaultImageSrc = '../../../assets/images/users/default.jpg';
  authorityLevel = authorityLevel;

  profileInformation: ApiProfileDefinitionResponse;
  profileAccountInformation: ApiProfileAccountDefinitionResponse;
  userCompany: ApiCompanyDefinitionResponse[];
  userCompanyName: string;

  userFormGroup: FormGroup;

  constructor(
    private fromBuilder: FormBuilder,
    public backendService: BackendService,
    private activatedRoute: ActivatedRoute
  ) { }

  public get objectSid(): FormControl { return this.userFormGroup.get('objectSid') as FormControl; }
  public get displayName(): FormControl { return this.userFormGroup.get('displayName') as FormControl; }
  public get mobile(): FormControl { return this.userFormGroup.get('mobile') as FormControl; }
  public get telephoneNumber(): FormControl { return this.userFormGroup.get('telephoneNumber') as FormControl; }
  public get ipPhone(): FormControl { return this.userFormGroup.get('ipPhone') as FormControl; }
  public get userPrincipalName(): FormControl { return this.userFormGroup.get('userPrincipalName') as FormControl; }
  public get thumbnailPhoto(): FormControl { return this.userFormGroup.get('thumbnailPhoto') as FormControl; }
  public get userPhoto(): FormControl { return this.userFormGroup.get('userPhoto') as FormControl; }
  public get deleted(): FormControl { return this.userFormGroup.get('deleted') as FormControl; }
  public get password(): FormControl { return this.userFormGroup.get('password') as FormControl; }
  public get passwordTry(): FormControl { return this.userFormGroup.get('passwordTry') as FormControl; }

  public get birtOfDate(): FormControl { return this.userFormGroup.get('birtOfDate') as FormControl; }
  public get genus(): FormControl { return this.userFormGroup.get('genus') as FormControl; }
  public get about(): FormControl { return this.userFormGroup.get('about') as FormControl; }
  public get linkedinAccount(): FormControl { return this.userFormGroup.get('linkedinAccount') as FormControl; }
  public get googleAccount(): FormControl { return this.userFormGroup.get('googleAccount') as FormControl; }
  public get facebookAccount(): FormControl { return this.userFormGroup.get('facebookAccount') as FormControl; }
  public get twitterAccount(): FormControl { return this.userFormGroup.get('twitterAccount') as FormControl; }
  public get instagramAccount(): FormControl { return this.userFormGroup.get('instagramAccount') as FormControl; }
  public get bloggerAccount(): FormControl { return this.userFormGroup.get('bloggerAccount') as FormControl; }
  public get youtubeAccount(): FormControl { return this.userFormGroup.get('youtubeAccount') as FormControl; }

  public ngOnInit(): void {
    this.initUserForm();
    this.getUserProfile();
  }

  public initUserForm(): void {
    this.userFormGroup = this.fromBuilder.group({
      objectSid: new FormControl(null),
      displayName: new FormControl(null),
      password: new FormControl(null),
      passwordTry: new FormControl(null),
      mobile: new FormControl(null),
      telephoneNumber: new FormControl(null),
      ipPhone: new FormControl(null),
      userPrincipalName: new FormControl(null),
      thumbnailPhoto: new FormControl(null),
      userPhoto: new FormControl(null),
      birtOfDate: new FormControl(null),
      genus: new FormControl(null),
      about: new FormControl(null),
      deleted: new FormControl(false),
      linkedinAccount: new FormControl(null),
      googleAccount: new FormControl(null),
      facebookAccount: new FormControl(null),
      twitterAccount: new FormControl(null),
      instagramAccount: new FormControl(null),
      bloggerAccount: new FormControl(null),
      youtubeAccount: new FormControl(null),
    });

  }

  public getUserProfile(): void {
    this.activatedRoute.params.subscribe(params => {
      this.userEdit = params.accountName.toString();
      this.backendService.getUserProfile(params.accountName)
        .subscribe(res => {
          if (res.error.code === 0) {
            this.profileInformation = res.data;
            this.objectSid.setValue(this.profileInformation.objectSid);
            if (this.profileInformation.userPhoto !== null) {
              this.imageSrc = this.profileInformation.userPhoto;
            } else {
              // tslint:disable-next-line:no-construct
              const photo = new String('data:image/jpeg;base64,');
              this.imageSrc = this.profileInformation.thumbnailPhoto === null ?
                this.defaultImageSrc : photo.concat(this.profileInformation.thumbnailPhoto);
            }
            this.userAuthority = this.authorityLevel.toString(this.profileInformation.authorityLevel);
            if (this.userAuthority === undefined){
              if (this.profileInformation.authorityLevel === 3){
                this.userAuthority = 'Kullanıcı - Depo Görevlisi';
              }
              if (this.profileInformation.authorityLevel === -2147483647){
                this.userAuthority = 'Yönetici - Kullanıcı';
              }
              if (this.profileInformation.authorityLevel === -2147483645){
                this.userAuthority = 'Yönetici - Depo Görevlisi';
              }
            }
            this.profileInformation.department =
              this.profileInformation.department === 'Unassigned' || this.profileInformation.department === null ?
                'Atanmamış' : this.profileInformation.department;
            this.backendService.getUserAccountProfile(this.profileInformation.objectSid)
              .subscribe(ua => {
                if (ua.error.code === 0) {
                  this.profileAccountInformation = ua.data[0];
                } else {
                  Swal.fire({
                    title: ua.error.message,
                    confirmButtonText: 'Kapat',
                    confirmButtonColor: '#d33',
                    icon: 'error'
                  });
                }
              }, err => {
                Swal.fire({
                  title: err,
                  confirmButtonText: 'Kapat',
                  confirmButtonColor: '#d33',
                  icon: 'error'
                });
              });
            this.backendService.getCompanies()
              .subscribe(userCompanyId => {
                if (userCompanyId.error.code === 0) {
                  this.userCompany = userCompanyId.data;
                  // this.userCompanyName = this.userCompany.filter(r => r.id === this.profileInformation.companyId)[0].name;
                } else {
                  Swal.fire({
                    title: userCompanyId.error.message,
                    confirmButtonText: 'Kapat',
                    confirmButtonColor: '#d33',
                    icon: 'error'
                  });
                }
              }, err => {
                Swal.fire({
                  title: err,
                  confirmButtonText: 'Kapat',
                  confirmButtonColor: '#d33',
                  icon: 'error'
                });
              });
            this.setProfileValue();
          } else {
            Swal.fire({
              title: res.error.message,
              confirmButtonText: 'Kapat',
              confirmButtonColor: '#d33',
              icon: 'error'
            });
          }
        }, err => {
          Swal.fire({
            title: err,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        });
    });
  }

  public showPassword(): void {
    this.showPasswordIcon = !this.showPasswordIcon;
  }

  public showPassword2(): void {
    this.showPasswordIcon2 = !this.showPasswordIcon2;
  }

  public setProfileValue(): void {
    this.displayName.setValue(this.profileInformation.displayName);
    this.password.setValue(this.profileInformation.password);
    this.passwordTry.setValue(this.profileInformation.password);
    this.birtOfDate.setValue(this.profileInformation.birtOfDate);
    if (this.profileInformation.genus !== null) {
      this.profileInformation.genus === false ? this.genus.setValue(0) : this.genus.setValue(1);
    }
    this.mobile.setValue(this.profileInformation.mobile);
    this.telephoneNumber.setValue(this.profileInformation.telephoneNumber);
    this.userPrincipalName.setValue(this.profileInformation.userPrincipalName);
    this.about.setValue(this.profileInformation.about);
    this.facebookAccount.setValue(this.profileAccountInformation?.facebookAccount);
    this.linkedinAccount.setValue(this.profileAccountInformation?.linkedinAccount);
    this.googleAccount.setValue(this.profileAccountInformation?.googleAccount);
    this.twitterAccount.setValue(this.profileAccountInformation?.twitterAccount);
    this.instagramAccount.setValue(this.profileAccountInformation?.instagramAccount);
    this.bloggerAccount.setValue(this.profileAccountInformation?.bloggerAccount);
    this.youtubeAccount.setValue(this.profileAccountInformation?.youtubeAccount);
  }

  public saveProfile(): void {
    if (!this.userFormGroup.valid) {
      return;
    }
    this.saveUserEnabled = true;
    const data = this.userFormGroup.getRawValue();
    data.objectSid = this.objectSid.value;
    data.birtOfDate = this.birtOfDate.value;
    data.userPhoto = this.userPhoto.value;
    if (this.imageSrc !== this.defaultImageSrc) {
      data.userPhoto = this.imageSrc;
      data.userPrincipalName = this.profileInformation.userPrincipalName;
    }
    if (data.password === data.passwordTry) {
      this.backendService.saveUserProfile(data)
        .subscribe(res => {
          if (res.error.code === 0) {
            this.saveUserEnabled = false;
            this.getUserProfile();
            Swal.fire({
              title: 'Kayıt Başarılı',
              position: 'center',
              timer: 1200,
              icon: 'success',
              showConfirmButton: false
            });
          } else {
            this.saveUserEnabled = false;
            Swal.fire({
              title: res.error.message,
              confirmButtonText: 'Kapat',
              confirmButtonColor: '#d33',
              icon: 'error'
            });
          }
        }, err => {
          this.saveUserEnabled = false;
          Swal.fire({
            title: err,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        });
    } else {
      this.saveUserEnabled = false;
      Swal.fire({
        title: 'Şifreler Uyuşmuyor !',
        confirmButtonText: 'Kapat',
        confirmButtonColor: '#d33',
        icon: 'error'
      });
    }
  }

  public handleInputChange(e): void {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      alert('Desteklenmeyen Format');
      return;
    }

    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);

  }

  public _handleReaderLoaded(e): void {
    const reader = e.target;
    this.imageSrc = reader.result;
    this.saveProfile();
  }
}
