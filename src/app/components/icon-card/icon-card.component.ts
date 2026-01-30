// src\app\components\icon-card\icon-card.component.ts

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Icon } from '../../core/models/icon.model';
import { DownloadService } from '../../core/services/download.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon-card',
  templateUrl: './icon-card.component.html',
  styleUrls: ['./icon-card.component.css'],
})
export class IconCardComponent implements OnInit {
  @Input() icon!: Icon;
  @Output() download = new EventEmitter<Icon>();

  svgContent: SafeHtml = '';

  constructor(
    private downloadService: DownloadService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadSvg();
  }

  onDownload(): void {
    this.download.emit(this.icon);
  }

  private loadSvg(): void {
    this.downloadService.getSvgContent(this.icon).subscribe({
      next: (content) => {
        // Sanitize the SVG content
        const cleanContent = this.sanitizeSvg(content);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(cleanContent);
      },
      error: () => {
        // Fallback SVG
        const fallbackSvg = `
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>`;
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(fallbackSvg);
      },
    });
  }

  private sanitizeSvg(content: string): string {
    // Remove any script tags and other potentially dangerous content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .replace(/href="javascript:/gi, 'href="#') // Remove javascript: links
      .replace(/xlink:href="javascript:/gi, 'xlink:href="#'); // Remove xlink javascript
  }
}
