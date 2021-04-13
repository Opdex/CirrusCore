import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'setup-component',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})
export class SetupComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService) {}

  ngOnInit(): void {

  }

  public onCreateClicked(): void {
    this.router.navigate(['setup/create']);
  }

  public onRecoverClicked(): void {
    this.router.navigate(['setup/recover']);
  }

  public onBackClicked(): void {
    this.router.navigate(['login']);
  }
}
