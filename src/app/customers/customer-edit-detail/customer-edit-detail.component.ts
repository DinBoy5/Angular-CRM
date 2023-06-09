import { Component, OnInit } from '@angular/core';
import { ValidationService } from 'src/app/core/validation.service';
import { Person, Title } from 'src/app/core/type.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ApiService } from 'src/app/core/api.service';
import { HelperService } from 'src/app/core/helper.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'customer-edit-detail',
  templateUrl: './customer-edit-detail.component.html',
  styles: [`.disabled-input {background-color: #343a40; color: #fff;}`],
  providers: [ValidationService]
})
export class CustomerEditDetailComponent implements OnInit {

  editTitle: Title = {
    name: 'Edit Customer',
    class: 'bi bi-pencil-fill'
  }
  viewTitle: Title = {
    name: 'View Customer',
    class: 'bi bi-info-circle-fill'
  }

  themeColor = false;
  editMode?: boolean
  id!: string
  customer!: Person

  constructor(public editForm: ValidationService, private router: Router, private route: ActivatedRoute,
    private customerApi: ApiService, private customerInfo: HelperService) { }

  fields: Array<string> = ['first_name', 'last_name', 'email', 'phone', 'address']

  ngOnInit(): void {
    this.themeColor = this.customerInfo.themeCapture
    this.customerInfo.themeMode.subscribe(theme => this.themeColor = theme)
    this.editMode = this.router.url.includes('edit')
    this.editForm.customerForm
    this.route.params.subscribe(
      (params: Params) => {
        this.id = (params['id']);
        if (this.router.url.includes('edit')) {
          this.customer = this.customerApi.getCustomerEdit(this.id).subscribe({
            next: (data: Person) => {
              this.customer = data,
                this.fields.forEach((field) => {
                  this.setFormValue(field, this.customer[field] as Person)
                })
            },
            error: () => this.router.navigate(['not-found'])
          })
        } else {
          this.customerInfo.customerID.next(this.id)
          this.customer = this.customerApi.getCustomer(this.id).subscribe({
            next: (data: Person) => this.customer = data,
            error: () => this.router.navigate(['not-found'])
          })
        }
      })
  }

  onInputClass(theme: boolean): string {
    return this.customerInfo.onInputClass(theme)
  }

  setFormValue(field: string, value: any) {
    this.editForm.customerForm.get(field)!.setValue(value)
  }

  getError(field: string): FormControl {
    return this.editForm.customerForm.get(field) as FormControl;
  }

  onSubmit() {
    this.customerApi.editCustomer(this.id, this.editForm.customerForm.value).subscribe({
      next: (data: Person) => {
        this.customerInfo.editCustomer.next(data),
          this.customerInfo.addCustomer.next(false)
        Swal.fire({
          icon: 'success',
          title: `${data['email']} has been updated`,
          showConfirmButton: false,
          timer: 1500
        })
        this.router.navigate([''])
      },
      error: (error) => {
        let errorMsg: string = error.error[0].message ? error.error[0].message : error.error
        if (errorMsg.includes('E11000 duplicate key')) errorMsg = 'Email already exist'
        Swal.fire({
          icon: 'error',
          title: errorMsg
        })
      }
    })
  }

  onCancel() {
    this.router.navigate(['/'])
    this.customerInfo.addCustomer.next(false)
  }
}
