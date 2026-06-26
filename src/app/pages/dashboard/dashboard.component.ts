import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// --- Interfaces matching real API responses exactly ---

interface ServicesStats {
  down: number;
  atRisk: number;
}

interface DevicesStats {
  major: number;
  critical: number;
}

interface UsersStats {
  total: number;
  active: number;
}

interface ProblemRow {
  host: string;
  severity: string;
  problem: string;
  ticket: string;
  timeSnap: string;
  age: string;
}

// Matches real API: getApiProcessingTime
interface SlowApiResponse {
  moduleName: string;
  apiName: string;
  processingTimeMs: number;
  logTimestamp: string;
  thresholdMs: number;
  status: string;
  hostIpAddress: string;
}

// Matches real API: fetchReplicationDBData
interface ReplicationApiResponse {
  replicaHost: string;
  success: boolean;
  alarmId: string;
  serviceName: string;
  masterHost: string;
  latestMasterId: number;
  timestamp: string;
}

// Processed shape for UI display
interface ReplicationGroup {
  name: string;
  synced: boolean;
  masterHost: string;
  replicaHosts: string[];
}

// --- API Base URL (ready to use when VPN is available) ---
const BASE_URL = 'http://10.240.72.140:8180/monitoring-connector/api/intermediate';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  activeSidebar = 'dashboard';

  services: ServicesStats | null = null;
  devices: DevicesStats | null = null;
  users: UsersStats | null = null;
  problems: ProblemRow[] = [];
  slowApis: SlowApiResponse[] = [];
  replicationGroups: ReplicationGroup[] = [];

  isLoading = true;
  hasError = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  setActiveSidebar(item: string): void {
    this.activeSidebar = item;
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    // ================================================================
    // MOCK DATA — Exact same field names as real API responses.
    // When VPN access is granted, replace this entire setTimeout block
    // with the forkJoin block commented below it.
    // ================================================================
    setTimeout(() => {

      // Services (API not provided yet)
      this.services = { down: 2, atRisk: 1 };

      // Devices (API not provided yet)
      this.devices = { major: 2, critical: 0 };

      // Users — real API returns array of IDs, we count them
      // fetchTotalUsers & fetchActiveUsers
      this.users = { total: 1711, active: 240 };

      // Problems (API not provided yet)
      this.problems = [
        {
          host: '10.240.72.145',
          severity: 'Average',
          problem: 'High memory utilization',
          ticket: 'Raised',
          timeSnap: '2026-03-19   09:32:15',
          age: '2h 15m'
        },
        {
          host: '10.240.72.145',
          severity: 'High',
          problem: 'High Disk utilization',
          ticket: 'Raised',
          timeSnap: '2026-03-19   09:32:15',
          age: '2h 15m'
        }
      ];

      // Top Slow APIs — same fields as real API response
      const rawSlowApis: SlowApiResponse[] = [
        {
          moduleName: 'CFM-Mise (DJP)',
          apiName: 'linkStatus',
          processingTimeMs: 16347,
          logTimestamp: '2026-06-24 10:30:12',
          thresholdMs: 1000,
          status: 'down',
          hostIpAddress: '10.240.72.147'
        },
        {
          moduleName: 'CFM-Mise (Automation)',
          apiName: 'getCFS',
          processingTimeMs: 2085,
          logTimestamp: '2026-06-24 10:30:09',
          thresholdMs: 1000,
          status: 'down',
          hostIpAddress: '10.240.72.145'
        },
        {
          moduleName: 'CFM-Mise (DJP)',
          apiName: 'fetchSrPendencyStatus',
          processingTimeMs: 1259,
          logTimestamp: '2026-06-24 10:30:19',
          thresholdMs: 1000,
          status: 'down',
          hostIpAddress: '10.240.72.166'
        }
      ];
      this.slowApis = rawSlowApis;

      // DB Replication — same fields as real API response
      const rawReplication: ReplicationApiResponse[] = [
        {
          replicaHost: '10.240.72.160',
          success: true,
          alarmId: '10.240.72.160',
          serviceName: 'cfmprod_cp',
          masterHost: '10.240.72.159',
          latestMasterId: 395668371,
          timestamp: '2026-06-24 10:30:01'
        },
        {
          replicaHost: '10.240.72.197',
          success: true,
          alarmId: '10.240.72.197',
          serviceName: 'cfmprod_cp',
          masterHost: '10.240.72.159',
          latestMasterId: 395668371,
          timestamp: '2026-06-24 10:30:01'
        },
        {
          replicaHost: '10.240.72.193',
          success: false,
          alarmId: '10.240.72.193',
          serviceName: 'cfmprod_evm',
          masterHost: '10.240.72.180',
          latestMasterId: 14395098,
          timestamp: '2026-03-10 00:30:02'
        }
      ];
      this.replicationGroups = this.processReplicationData(rawReplication);

      this.isLoading = false;
    }, 1500);

    // ================================================================
    // REAL API — Uncomment this block and remove setTimeout above
    // once VPN access is available.
    // ================================================================
    // import { forkJoin } from 'rxjs'; // add this import at the top
    //
    // forkJoin({
    //   slowApis: this.http.get<SlowApiResponse[]>(`${BASE_URL}/getApiProcessingTime`),
    //   totalUsers: this.http.get<string[]>(`${BASE_URL}/fetchTotalUsers`),
    //   activeUsers: this.http.get<string[]>(`${BASE_URL}/fetchActiveUsers`),
    //   replication: this.http.get<ReplicationApiResponse[]>(`${BASE_URL}/fetchReplicationDBData`)
    // }).subscribe({
    //   next: (results) => {
    //     this.slowApis = results.slowApis;
    //     this.users = {
    //       total: results.totalUsers.length,
    //       active: results.activeUsers.length
    //     };
    //     this.replicationGroups = this.processReplicationData(results.replication);
    //     this.isLoading = false;
    //   },
    //   error: () => {
    //     this.hasError = true;
    //     this.isLoading = false;
    //   }
    // });
  }

  private processReplicationData(data: ReplicationApiResponse[]): ReplicationGroup[] {
    const groupMap: { [key: string]: ReplicationGroup } = {};

    data.forEach(item => {
      const key = item.serviceName.toUpperCase();

      if (!groupMap[key]) {
        groupMap[key] = {
          name: key,
          synced: true,
          masterHost: item.masterHost,
          replicaHosts: []
        };
      }

      groupMap[key].replicaHosts.push(item.replicaHost);

      if (!item.success) {
        groupMap[key].synced = false;
      }
    });

    return Object.values(groupMap);
  }

}