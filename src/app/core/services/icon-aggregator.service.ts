// src\app\core\services\icon-aggregator.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IconProvider } from './providers/icon-provider.interface';
import { IconApiResponse } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class IconAggregatorService {
  private providers = new Map<string, IconProvider>();
  private activeProvider: IconProvider;

  constructor() {
    this.activeProvider = null as any;
  }

  registerProviders(providers: IconProvider[]): void {
    providers.forEach((provider) => {
      this.providers.set(provider.name, provider);
    });

    // Set ICONOIR as default if available
    if (this.providers.has('ICONOIR')) {
      this.activeProvider = this.providers.get('ICONOIR')!;
    }
  }

  setActiveProvider(name: string): void {
    const provider = this.providers.get(name);
    if (provider) {
      this.activeProvider = provider;
    }
  }

  getActiveProvider(): IconProvider {
    return this.activeProvider;
  }

  getAvailableProviders(): Array<{ name: string; displayName: string }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      displayName: p.displayName,
    }));
  }

  search(
    query: string,
    limit: number = 10,
    offset: number = 0,
  ): Observable<IconApiResponse> {
    if (!this.activeProvider) {
      throw new Error('No active provider selected');
    }
    return this.activeProvider.search(query, limit, offset);
  }

  getRandom(
    limit: number = 10,
    offset: number = 0,
  ): Observable<IconApiResponse> {
    if (!this.activeProvider) {
      throw new Error('No active provider selected');
    }
    return this.activeProvider.getRandom(limit, offset);
  }
}