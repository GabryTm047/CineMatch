import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';

export interface PieChartSlice {
  readonly label: string;
  readonly value: number;
  readonly percentage: number;
  readonly color: string;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent {
  @Input({ required: true })
  data: PieChartSlice[] = [];

  readonly total = computed(() => this.data.reduce((sum, slice) => sum + slice.value, 0));

  readonly hasData = computed(() => this.total() > 0);

  readonly gradient = computed(() => {
    const totalValue = this.total();
    if (!totalValue) {
      return 'conic-gradient(#1f2937 0deg 360deg)';
    }

    let currentAngle = 0;
    const segments: string[] = [];

    for (const slice of this.data) {
      if (slice.value <= 0) {
        continue;
      }
      const sweep = (slice.value / totalValue) * 360;
      const endAngle = currentAngle + sweep;
      segments.push(`${slice.color} ${currentAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    }

    if (currentAngle < 360) {
      segments.push(`#1f2937 ${currentAngle}deg 360deg`);
    }

    return `conic-gradient(${segments.join(', ')})`;
  });

  trackSlice(index: number, slice: PieChartSlice): string {
    return slice.label;
  }
}
