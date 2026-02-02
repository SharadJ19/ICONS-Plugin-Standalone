import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QlPluginRoutingModule } from './ql-plugin-routing.module';
import { QlDefaultPluginComponent } from './ql-default-plugin/ql-default-plugin.component';


@NgModule({
  declarations: [
    QlDefaultPluginComponent
  ],
  imports: [
    CommonModule,
    QlPluginRoutingModule
  ]
})
export class QlPluginModule { }
