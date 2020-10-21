import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent implements OnInit {
  forgotPasswordFormGroup: FormGroup;
  matcher = new MyErrorStateMatcher();

  constructor(private formBuilder: FormBuilder) { }

  public get eposta(): FormControl { return this.forgotPasswordFormGroup.get('eposta') as FormControl; }


  ngOnInit(): void {
    this.forgotPasswordFormGroup = this.formBuilder.group({
      eposta: new FormControl(null, [
        Validators.required,
        Validators.email,
      ])
    });
  }


  public send(): void {
    this.forgotPasswordFormGroup.markAllAsTouched();
    if (!this.forgotPasswordFormGroup.valid){
      return;
    }
    const data = this.forgotPasswordFormGroup.getRawValue();
    console.log(data);
  }
}
