import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { ReactiveFormsModule} from '@angular/forms';
import { VerifyComponent } from './verify/verify.component';
import { LoginComponent } from './login/login.component';
import { ArchwizardModule } from 'ng2-archwizard';
import { PendingPageComponent } from './pending-page/pending-page.component';
import { SignupComponent } from './signup/signup.component';
import { InvitationComponent } from './invitation/invitation.component';

@NgModule({
  declarations: [
    LandingComponent,
    FrontpageComponent,
    VerifyComponent,
    LoginComponent,
    PendingPageComponent,
    SignupComponent,
    InvitationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArchwizardModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
