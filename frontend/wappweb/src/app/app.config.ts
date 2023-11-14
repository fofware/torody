import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { apiInterceptor } from './interceptors/api.interceptor';
import { tokenInterceptor } from './interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    importProvidersFrom(BrowserModule, NgbModule, BrowserAnimationsModule,
       //SocketIoModule.forRoot(config)
       ),
    provideAnimations(),
    provideHttpClient(withInterceptors([apiInterceptor,tokenInterceptor])),
  ]
};
