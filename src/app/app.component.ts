// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { ProviderRegistryService } from './core/services/providers/provider-registry.service';
import { IconoirProviderService } from './core/services/providers/iconoir.provider.service';
import { BootstrapProviderService } from './core/services/providers/bootstrap.provider.service';
import { EnvironmentService } from './core/services/environment.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Icons Aggregator';

  constructor(
    private providerRegistry: ProviderRegistryService,
    private iconoirProvider: IconoirProviderService,
    private bootstrapProvider: BootstrapProviderService,
    private environment: EnvironmentService
  ) {}

  ngOnInit(): void {
    this.registerProviders();
    this.checkToken();
  }

  private registerProviders(): void {
    this.providerRegistry.registerProvider(
      'ICONOIR',
      'Iconoir',
      this.iconoirProvider
    );
    
    this.providerRegistry.registerProvider(
      'BOOTSTRAP',
      'Bootstrap',
      this.bootstrapProvider
    );
    
    const defaultProvider = this.environment.uiConfig.defaultProvider;
    this.providerRegistry.setActiveProvider(defaultProvider);
  }

  private checkToken(): void {
    if (!this.environment.githubToken && !this.environment.production) {
      console.warn(
        '⚠️ GitHub token not found. API requests may be rate limited.\n' +
        'Set token in localStorage: localStorage.setItem("github_token", "your_token_here")'
      );
    }
  }
}