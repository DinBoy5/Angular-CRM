import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { AuthService } from 'src/app/core/auth.service';
import { User } from 'src/app/core/type.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private router: Router, private loginApi: ApiService, private auth: AuthService) { }

  @ViewChild('myForm') formField!: NgForm

  registered = true
  errorStatus = false
  errorMsg = ""

  authStatus(value?: boolean): string {
    if (value) {
      return this.registered ? 'Sign Up' : 'Log In'
    }
    return this.registered ? 'Log In' : 'Sign Up'
  }

  authMode(): void {
    this.formField.reset()
    this.registered = !this.registered;
  }

  onSubmit(user: NgForm): void {
    if (this.registered) {
      this.loginApi.loginUser(user.value.userData).subscribe({
        next: ((data: User) => {
          if (data.token) {
            this.auth.setToken(data.token)
            this.auth.authenticated.next(this.auth.getToken())
            this.router.navigate(['customers'])
          }
        }),
        error: ((error) => {
          this.errorMsg = error.error
          user.reset(),
            this.errorStatus = true
          setTimeout(() => {
            this.errorStatus = false
          }, 2000);
        })
      })
    } else {
      this.loginApi.registerUser(user.value.userData).subscribe({
        next: (() => {
          user.reset()
          this.registered = true
        }),
        error: ((error) => {
          this.errorMsg = error.error
          user.reset(),
            this.errorStatus = true
          setTimeout(() => {
            this.errorStatus = false
          }, 2000);
        })
      })
    }

  }
}
