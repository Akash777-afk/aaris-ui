import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Shape of data we expect from the API
interface ServicesData {
  down: number;
  atRisk: number;
}

@Component({
  selector: 'app-services-card',
  templateUrl: './services-card.component.html',
  styleUrls: ['./services-card.component.scss']
})
export class ServicesCardComponent implements OnInit {

  // These three variables control what the template shows
  data: ServicesData | null = null;
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.data = null;

    // ── MOCK: simulating an API call with a timer ──────────────────────
    // Replace this block with the real API call below when your backend is ready
    setTimeout(() => {
      const success = true; // set to false to test error state

      if (success) {
        this.data = { down: 2, atRisk: 1 };
        this.isLoading = false;
      } else {
        this.hasError = true;
        this.isLoading = false;
      }
    }, 1500);

    // ── REAL API (uncomment when backend is ready) ─────────────────────
    // this.http.get<ServicesData>('https://your-api.com/api/services/status')
    //   .subscribe({
    //     next: (result) => {
    //       this.data = result;
    //       this.isLoading = false;
    //     },
    //     error: () => {
    //       this.hasError = true;
    //       this.isLoading = false;
    //     }
    //   });
  }
}