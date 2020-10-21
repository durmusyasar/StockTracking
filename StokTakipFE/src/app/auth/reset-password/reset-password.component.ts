import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordFormGroup: FormGroup;
  onePasswordB = false;
  twoPasswordB = false;
  constructor(private formBuilder: FormBuilder) { }

  public get onePassword(): FormControl { return this.resetPasswordFormGroup.get('onePassword') as FormControl; }
  public get twoPassword(): FormControl { return this.resetPasswordFormGroup.get('twoPassword') as FormControl; }

  ngOnInit(): void {
    this.resetPasswordFormGroup = this.formBuilder.group({
      onePassword: new FormControl(null, Validators.required),
      twoPassword: new FormControl(null, Validators.required)
    });
  }

  toggleOnePassword(): void {
    this.onePasswordB = !this.onePasswordB;
  }

  toggleTwoPassword(): void {
    this.twoPasswordB = !this.twoPasswordB;
  }

  save(): void {
    this.resetPasswordFormGroup.markAllAsTouched();
    if (!this.resetPasswordFormGroup.valid){
      return;
    }
    const data = this.resetPasswordFormGroup.getRawValue();
  }

}
