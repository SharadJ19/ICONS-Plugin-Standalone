// src\app\core\services\providers\iconoir.provider.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IconProvider } from './icon-provider.interface';
import { Icon, IconApiResponse } from '../../models/icon.model';
import { GitHubApiResponse } from '../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class IconoirProviderService implements IconProvider {
  readonly name = 'ICONOIR';
  readonly displayName = 'Iconoir';
  readonly baseUrl = 'https://api.github.com/repos/SharadJ19/free-svg-icons/contents/iconoir-regular-icons';
  readonly iconPath = 'iconoir-regular-icons';

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
        console.error('Iconoir icons API error:', error);
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

        // Shuffle array for random selection
        const shuffled = this.shuffleArray([...svgFiles]);
        
        // Apply pagination
        const paginatedIcons = shuffled.slice(offset, offset + limit);
        
        return this.mapGitHubResponse(paginatedIcons, limit, offset, svgFiles.length);
      }),
      catchError((error) => {
        console.error('Iconoir random icons API error:', error);
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
           cleanName.replace(/-/g, ' ').includes(cleanQuery) ||
           cleanName.replace(/-/g, '').includes(cleanQuery);
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
        provider: 'ICONOIR',
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
    // Special handling for names with numbers
    const words = name.split('-');
    return words
      .map((word, index) => {
        // Handle numbers
        if (/^\d+$/.test(word)) {
          // If it's the last word and previous word might be related to it
          if (index === words.length - 1 && words.length > 1) {
            return word;
          }
          return word;
        }
        
        // Handle abbreviations (like "2d", "3d")
        if (word === '2d' || word === '3d') {
          return word.toUpperCase();
        }
        
        // Handle special words
        const specialWords: { [key: string]: string } = {
          'ai': 'AI',
          'css': 'CSS',
          'html': 'HTML',
          'json': 'JSON',
          'svg': 'SVG',
          'xml': 'XML',
          'ui': 'UI',
          'ux': 'UX',
          'api': 'API',
          'url': 'URL',
          'http': 'HTTP',
          'https': 'HTTPS',
          'db': 'DB',
          'sql': 'SQL',
          'nosql': 'NoSQL',
          'js': 'JS',
          'ts': 'TS',
          'php': 'PHP',
          'py': 'Python',
          'java': 'Java',
          'csharp': 'C#',
          'cpp': 'C++',
          'go': 'Go',
          'rust': 'Rust',
          'ios': 'iOS',
          'android': 'Android',
          'macos': 'macOS',
          'windows': 'Windows',
          'linux': 'Linux',
          'aws': 'AWS',
          'azure': 'Azure',
          'gcp': 'GCP',
        };
        
        return specialWords[word.toLowerCase()] || 
               word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}