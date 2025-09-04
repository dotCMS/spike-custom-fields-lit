import { css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { DotCustomFieldBase } from '../base-wc';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  thumbnailSmall: string;
  thumbnailLarge: string;
  url: string;
}

@customElement('dot-youtube-search')
export class DotYoutubeSearch extends DotCustomFieldBase {
  @property({ type: String })
  apiKey: string = 'AIzaSyCxY1REi_queaJ3o_-CuaYMHjSnFhd1GQ8';

  @property({ type: String })
  channelId: string = '';

  @property({ type: Number })
  maxResults: number = 10;

  @state()
  private searchTerm: string = '';

  @state()
  private videos: YouTubeVideo[] = [];

  @state()
  private isLoading: boolean = false;

  @state()
  private showResults: boolean = false;

  @state()
  private selectedVideo: YouTubeVideo | null = null;

  static styles = css`
    :host {
      display: block;
      font-family: Arial, Helvetica, sans-serif;
    }

    .search-container {
      margin-bottom: 20px;
    }

    .search-input {
      width: 400px;
      padding: 8px;
      margin-right: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .search-button {
      padding: 8px 16px;
      background-color: #007cba;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .search-button:hover {
      background-color: #005a87;
    }

    .search-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .video-preview {
      width: 640px;
      height: 380px;
      overflow: hidden;
      border: 1px solid #efefef;
      margin: 30px 0;
      padding: 0;
    }

    .video-preview iframe {
      border: 0;
      width: 100%;
      height: 100%;
    }

    .results-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ffffff;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
    }

    .results-header {
      padding: 20px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fafafa;
    }

    .results-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: #e0e0e0;
      color: #333;
    }

    .results-content {
      padding: 0;
      width: 530px;
      height: 400px;
      overflow-x: hidden;
      overflow-y: auto;
      background: #ffffff;
    }

    .results-content::-webkit-scrollbar {
      width: 8px;
    }

    .results-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .results-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .results-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    .results-list {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 18px;
      background: #ffffff;
    }

    .video-item {
      position: relative;
      display: block;
      list-style: none;
      padding: 15px 15px 15px 150px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      background: #ffffff;
      transition: background-color 0.2s ease;
    }

    .video-item:hover {
      background: #f0f8ff;
      border-left: 3px solid #007cba;
    }

    .video-item:last-child {
      border-bottom: none;
    }

    .video-thumbnail {
      display: block;
      position: absolute;
      left: 15px;
      top: 15px;
      width: 120px;
      height: 90px;
      background-size: cover;
      background-position: center;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .video-item b {
      color: #333;
      font-weight: 600;
    }

    .video-item br + b {
      color: #666;
      font-weight: 500;
    }

    .loading {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 14px;
      background: #fafafa;
      border-radius: 8px;
      margin: 20px;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      backdrop-filter: blur(2px);
    }
  `;

  render() {
    return html`
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          .value=${this.searchTerm}
          @input=${this.handleSearchInput}
          placeholder="Search for Videos on YouTube"
          ?disabled=${this.isLoading}
        />
        <button
          class="search-button"
          @click=${this.searchClicked}
          ?disabled=${this.isLoading}
        >
          ${this.isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      ${this.selectedVideo ? this.renderVideoPreview() : ''}

      ${this.showResults ? this.renderResultsDialog() : ''}
    `;
  }

  private renderVideoPreview() {
    if (!this.selectedVideo) return '';
    
    // Ensure we have a proper YouTube URL and convert to embed format
    let embedUrl = this.selectedVideo.url;
    
    // If it's a watch URL, convert to embed
    if (embedUrl.includes('watch?v=')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    }
    
    // Ensure it uses https
    if (embedUrl.startsWith('http://')) {
      embedUrl = embedUrl.replace('http://', 'https://');
    }
    
    // Add rel=0 parameter to reduce related videos
    embedUrl += embedUrl.includes('?') ? '&rel=0' : '?rel=0';

    return html`
      <div class="video-preview">
        <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
      </div>
    `;
  }

  private renderResultsDialog() {
    return html`
      <div class="overlay" @click=${this.closeResults}></div>
      <div class="results-dialog">
        <div class="results-header">
          <h3>YouTube Search Results</h3>
          <button class="close-button" @click=${this.closeResults}>&times;</button>
        </div>
        <div class="results-content">
          ${this.isLoading ? this.renderLoading() : this.renderVideoList()}
        </div>
      </div>
    `;
  }

  private renderLoading() {
    return html`<div class="loading">Loading YouTube videos...</div>`;
  }

  private renderVideoList() {
    if (this.videos.length === 0) {
      return html`<div class="loading">No videos found</div>`;
    }

    return html`
      <ul class="results-list">
        ${this.videos.map(video => html`
          <li class="video-item" @click=${() => this.selectVideo(video)}>
            <span 
              class="video-thumbnail"
              style="background-image: url(${video.thumbnailSmall})"
            ></span>
            <b>${video.title}</b><br>
            <b>Author: </b>${video.channelTitle}<br>
            <b>Length: </b>${video.duration}<br>
            <b>Published: </b>${video.publishedAt}
          </li>
        `)}
      </ul>
    `;
  }

  private handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  private async searchClicked() {
    if (this.searchTerm.length < 1) {
      alert('Please Enter Search Term');
      return;
    }

    if (!this.apiKey) {
      alert('YouTube API key is required');
      return;
    }

    this.isLoading = true;
    this.showResults = true;

    try {
      await this.loadYouTubeAPI();
      const videos = await this.searchVideos(this.searchTerm);
      this.videos = videos;
    } catch (error) {
      console.error('Error searching videos:', error);
      alert('Error searching videos. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  private loadYouTubeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if gapi is already loaded
      if (window.gapi) {
        this.initializeYouTubeAPI().then(resolve).catch(reject);
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
        // Wait for existing script to load
        const checkGapi = () => {
          if (window.gapi) {
            this.initializeYouTubeAPI().then(resolve).catch(reject);
          } else {
            setTimeout(checkGapi, 100);
          }
        };
        checkGapi();
        return;
      }

      // Load the Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.initializeYouTubeAPI().then(resolve).catch(reject);
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  private initializeYouTubeAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.gapi) {
        reject(new Error('Google API not loaded'));
        return;
      }

      // Load the client library
      window.gapi.load('client', () => {
        // Initialize the client with API key and discovery docs
        window.gapi.client.init({
          'apiKey': this.apiKey,
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
        }).then(() => {
          resolve();
        }).catch((error: any) => {
          reject(new Error('Failed to initialize YouTube API: ' + error.message));
        });
      });
    });
  }

  private async searchVideos(query: string): Promise<YouTubeVideo[]> {
    return new Promise((resolve, reject) => {
      const searchRequest = window.gapi.client.youtube.search.list({
        q: query,
        part: 'id,snippet',
        maxResults: this.maxResults,
        channelId: this.channelId || undefined
      });

      searchRequest.execute((response: any) => {
        if (response.error) {
          reject(new Error(response.error.message));
          return;
        }

        const videos = response.items || [];
        const videoIds = videos.map((video: any) => video.id.videoId).join(',');

        if (!videoIds) {
          resolve([]);
          return;
        }

        const listRequest = window.gapi.client.youtube.videos.list({
          id: videoIds,
          part: 'snippet,contentDetails'
        });

        listRequest.execute((listResponse: any) => {
          if (listResponse.error) {
            reject(new Error(listResponse.error.message));
            return;
          }

          const processedVideos = (listResponse.items || []).map((video: any) => ({
            id: video.id || '',
            title: video.snippet?.title || 'Sin título',
            channelTitle: video.snippet?.channelTitle || 'Canal desconocido',
            publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : 'Fecha desconocida',
            duration: this.convertTime(video.contentDetails?.duration),
            thumbnailSmall: video.snippet?.thumbnails?.default?.url || '',
            thumbnailLarge: video.snippet?.thumbnails?.high?.url || '',
            url: `https://www.youtube.com/watch?v=${video.id}`
          }));

          resolve(processedVideos);
        });
      });
    });
  }

  private convertTime(timeD: string | undefined): string {
    if (!timeD || typeof timeD !== 'string') {
      return '0:00';
    }
    return timeD.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '');
  }

  private selectVideo(video: YouTubeVideo) {
    this.selectedVideo = video;
    this.closeResults();
    this.populateFields(video);
  }

  private populateFields(video: YouTubeVideo) {
    this.setAllValues({
      title: video.title,
      author: video.channelTitle,
      id: video.id,
      length: video.duration,
      thumbnailSmall: video.thumbnailSmall,
      thumbnailLarge: video.thumbnailLarge,
      published: video.publishedAt,
      url: video.url
    });
    
    // Clear search term
    this.searchTerm = '';
  }

  private closeResults() {
    this.showResults = false;
    this.videos = [];
  }

  getValue() {
    return this.getValueByField('url') || '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dot-youtube-search': DotYoutubeSearch
  }

  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        youtube: {
          search: {
            list: (params: any) => any;
          };
          videos: {
            list: (params: any) => any;
          };
        };
      };
    };
  }
}
