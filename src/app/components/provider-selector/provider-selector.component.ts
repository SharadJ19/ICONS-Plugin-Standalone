// src\app\components\provider-selector\provider-selector.component.ts

import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { IconAggregatorService } from '../../core/services/icon-aggregator.service';

@Component({
  selector: 'app-provider-selector',
  templateUrl: './provider-selector.component.html',
  styleUrls: ['./provider-selector.component.css']
})

export class ProviderSelectorComponent implements OnInit {
  providers: Array<{ name: string; displayName: string }> = [];
  selectedProvider = 'ICONOIR';
  selectedDisplayName = 'Iconoir';
  isDropdownOpen = false;

  @Output() providerChange = new EventEmitter<string>();

  constructor(private iconAggregator: IconAggregatorService) {}

  ngOnInit(): void {
    this.providers = this.iconAggregator.getAvailableProviders();
    this.updateDisplayName();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectProvider(providerName: string): void {
    this.selectedProvider = providerName;
    this.updateDisplayName();
    this.isDropdownOpen = false;
    this.iconAggregator.setActiveProvider(providerName);
    this.providerChange.emit(providerName);
  }

  private updateDisplayName(): void {
    const provider = this.providers.find(
      (p) => p.name === this.selectedProvider,
    );
    this.selectedDisplayName = provider?.displayName || this.selectedProvider;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.provider-selector')) {
      this.isDropdownOpen = false;
    }
  }
}
