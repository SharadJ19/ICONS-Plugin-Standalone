// src\app\app.component.ts

import { Component, OnInit } from '@angular/core';
import { IconAggregatorService } from './core/services/icon-aggregator.service';
import { IconoirProviderService } from './core/services/providers/iconoir.provider.service';
import { BootstrapProviderService } from './core/services/providers/bootstrap.provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private iconAggregator: IconAggregatorService,
    private iconoirProvider: IconoirProviderService,
    private bootstrapProvider: BootstrapProviderService,
  ) {}

  ngOnInit(): void {
    this.iconAggregator.registerProviders([
      this.iconoirProvider,
      this.bootstrapProvider,
    ]);
  }
}
