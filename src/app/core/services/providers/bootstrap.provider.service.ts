// src\app\core\services\providers\bootstrap.provider.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IconProvider } from './icon-provider.interface';
import { Icon, IconApiResponse } from '../../models/icon.model';
import { GitHubApiResponse } from '../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BootstrapProviderService implements IconProvider {
  readonly name = 'BOOTSTRAP';
  readonly displayName = 'Bootstrap';
  readonly baseUrl = 'https://api.github.com/repos/SharadJ19/free-svg-icons/contents/bootstrap-icons';
  readonly iconPath = 'bootstrap-icons';

  private readonly GITHUB_TOKEN = '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';

  constructor(private http: HttpClient) {}

  search(
    query: string,
    limit: number = 10,
    offset: number = 0,
  ): Observable<IconApiResponse> {
    const headers = new HttpHeaders({
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    });

    return this.http.get<GitHubApiResponse[]>(this.baseUrl, { headers }).pipe(
      map((response) => {
        // Filter icons based on search query
        const filteredIcons = response.filter(item => 
          item.type === 'file' && 
          item.name.endsWith('.svg') &&
          this.matchesSearch(item.name, query)
        );

        // Apply pagination
        const paginatedIcons = filteredIcons.slice(offset, offset + limit);
        
        return this.mapGitHubResponse(paginatedIcons, limit, offset, filteredIcons.length);
      }),
      catchError((error) => {
        console.error('Bootstrap icons API error:', error);
        return of({
          data: [],
          pagination: { total: 0, count: 0, offset, hasNext: false }
        });
      })
    );
  }

  getRandom(
    limit: number = 10,
    offset: number = 0,
  ): Observable<IconApiResponse> {
    const headers = new HttpHeaders({
      'Authorization': `token ${this.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    });

    return this.http.get<GitHubApiResponse[]>(this.baseUrl, { headers }).pipe(
      map((response) => {
        // Get only SVG files
        const svgFiles = response.filter(item => 
          item.type === 'file' && item.name.endsWith('.svg')
        );

        // Shuffle array for random selection (Fisher-Yates shuffle)
        const shuffled = this.shuffleArray([...svgFiles]);
        
        // Apply pagination
        const paginatedIcons = shuffled.slice(offset, offset + limit);
        
        return this.mapGitHubResponse(paginatedIcons, limit, offset, svgFiles.length);
      }),
      catchError((error) => {
        console.error('Bootstrap random icons API error:', error);
        return of({
          data: [],
          pagination: { total: 0, count: 0, offset, hasNext: false }
        });
      })
    );
  }

  private matchesSearch(fileName: string, query: string): boolean {
    if (!query.trim()) return true;
    
    const cleanName = fileName.replace('.svg', '').toLowerCase();
    const cleanQuery = query.toLowerCase().trim();
    
    // Check if query matches any part of the name
    return cleanName.includes(cleanQuery) || 
           cleanName.replace(/-/g, ' ').includes(cleanQuery);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private mapGitHubResponse(
    items: GitHubApiResponse[],
    limit: number,
    offset: number,
    total: number
  ): IconApiResponse {
    return {
      data: items.map((item) => ({
        id: item.sha,
        name: item.name.replace('.svg', ''),
        displayName: this.formatIconName(item.name.replace('.svg', '')),
        url: item.download_url,
        downloadUrl: item.download_url,
        provider: 'BOOTSTRAP',
        size: item.size,
        path: item.path,
      })),
      pagination: {
        total,
        count: items.length,
        offset,
        hasNext: offset + items.length < total,
      },
    };
  }

  private formatIconName(name: string): string {
    return name
      .split('-')
      .map(word => {
        // Handle special cases
        if (word === '2' || word === '3') return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}