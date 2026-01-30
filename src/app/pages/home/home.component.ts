// src\app\pages\home\home.component.ts

import { Component, OnInit } from '@angular/core';
import { Icon } from '../../core/models/icon.model';
import { IconAggregatorService } from '../../core/services/icon-aggregator.service';
import { DownloadService } from '../../core/services/download.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  icons: Icon[] = [];
  searchQuery = '';
  isLoading = false;
  currentProvider = 'Iconoir';

  private offset = 0;
  private readonly limit = 10;
  public hasMore = true;
  public currentMode: 'search' | 'random' = 'random';
  private totalIcons = 0;

  constructor(
    private iconAggregator: IconAggregatorService,
    private downloadService: DownloadService,
  ) {}

  ngOnInit(): void {
    this.loadRandomIcons();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.currentMode = 'search';
      this.offset = 0;
      this.icons = [];
      this.hasMore = true;
      this.loadSearchResults();
    }
  }

  onRandom(): void {
    this.currentMode = 'random';
    this.searchQuery = '';
    this.offset = 0;
    this.icons = [];
    this.hasMore = true;
    this.loadRandomIcons();
  }

  onLoadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.offset += this.limit;
      if (this.currentMode === 'search') {
        this.loadSearchResults();
      } else {
        this.loadRandomIcons();
      }
    }
  }

  onProviderChange(providerName: string): void {
    this.currentProvider = providerName;
    this.offset = 0;
    this.icons = [];
    this.hasMore = true;

    // Update the display name
    const providers = this.iconAggregator.getAvailableProviders();
    const provider = providers.find((p) => p.name === providerName);
    this.currentProvider = provider?.displayName || providerName;

    if (this.currentMode === 'search' && this.searchQuery.trim()) {
      this.loadSearchResults();
    } else {
      this.loadRandomIcons();
    }
  }

  onDownload(icon: Icon): void {
    this.downloadService
      .downloadIcon(icon)
      .then(() => {
        console.log(`Downloaded: ${icon.name}`);
      })
      .catch((error) => {
        console.error('Download failed:', error);
      });
  }

  private loadSearchResults(): void {
    if (!this.searchQuery.trim()) {
      this.onRandom();
      return;
    }

    this.isLoading = true;
    this.iconAggregator
      .search(this.searchQuery, this.limit, this.offset)
      .subscribe({
        next: (response) => {
          this.icons = [...this.icons, ...response.data];
          this.totalIcons = response.pagination.total;
          this.hasMore = response.pagination.hasNext;
          this.isLoading = false;

          // If no results, show message
          if (this.icons.length === 0) {
            console.log('No icons found for search:', this.searchQuery);
          }
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isLoading = false;
          this.hasMore = false;
        },
      });
  }

  private loadRandomIcons(): void {
    this.isLoading = true;
    this.iconAggregator.getRandom(this.limit, this.offset).subscribe({
      next: (response) => {
        this.icons = [...this.icons, ...response.data];
        this.totalIcons = response.pagination.total;
        this.hasMore = response.pagination.hasNext;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Random icons error:', error);
        this.isLoading = false;
        this.hasMore = false;
      },
    });
  }

  getResultCountText(): string {
    if (this.isLoading) return 'Loading...';
    if (this.icons.length === 0) return 'No icons found';

    const totalText = this.totalIcons > 0 ? ` of ${this.totalIcons}` : '';
    return `Showing ${this.icons.length}${totalText} icons`;
  }
}
