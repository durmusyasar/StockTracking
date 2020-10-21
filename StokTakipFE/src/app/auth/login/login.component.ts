import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  fieldTextType = false;
  returnUrl: string;
  loginFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private backendService: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  public get accountName(): FormControl { return this.loginFormGroup.get('accountName') as FormControl; }
  public get password(): FormControl { return this.loginFormGroup.get('password') as FormControl; }

  ngOnInit(): void {
    this.loginFormGroup = this.formBuilder.group({
      accountName: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });
    this.backendService.logout();
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  login(): void {
    this.loginFormGroup.markAllAsTouched();
    if (!this.loginFormGroup.valid) {
      return;
    }
    this.spinner.show();
    const data = this.loginFormGroup.getRawValue();
    this.backendService.login(data.accountName, data.password)
      .pipe(first())
      .subscribe(res => {
        if (res.error.code === 0) {
          this.router.navigate([this.returnUrl]);
          this.spinner.hide();
        } else {
          this.spinner.hide();
          Swal.fire({
            title: res.error.message,
            confirmButtonText: 'Kapat',
            confirmButtonColor: '#d33',
            icon: 'error'
          });
        }
      }, err => {
        this.spinner.hide();
        Swal.fire({
          title: err,
          confirmButtonText: 'Kapat',
          confirmButtonColor: '#d33',
          icon: 'error'
        });
      });
  }
}
