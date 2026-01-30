// src\app\core\services\download.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  
  constructor(private http: HttpClient) {}

  async downloadIcon(icon: Icon): Promise<void> {
    try {
      // Fetch the SVG content
      const response = await fetch(icon.downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const svgContent = await response.text();
      
      // Create a blob URL
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = this.getFileName(icon);
      
      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      this.fallbackDownload(icon);
    }
  }

  private fallbackDownload(icon: Icon): void {
    const link = document.createElement('a');
    link.href = icon.downloadUrl;
    link.download = this.getFileName(icon);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getFileName(icon: Icon): string {
    // Clean up name and create filename
    const cleanName = icon.name
      .replace(/[^a-z0-9\s-]/gi, '') // Keep hyphens
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    const providerAbbr = icon.provider.toLowerCase().substring(0, 3);
    return `${cleanName}_${providerAbbr}.svg`;
  }

  // Method to get SVG content as string
  getSvgContent(icon: Icon): Observable<string> {
    return this.http.get(icon.downloadUrl, { 
      responseType: 'text',
      headers: {
        'Accept': 'image/svg+xml'
      }
    });
  }
}