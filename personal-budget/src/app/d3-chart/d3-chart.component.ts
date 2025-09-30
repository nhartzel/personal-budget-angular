import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import * as d3 from 'd3'

@Component({
  selector: 'pb-d3-chart',
  templateUrl: './d3-chart.component.html',
  styleUrls: ['./d3-chart.component.scss']
})
export class D3ChartComponent implements OnInit {

  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;
  private svg: any;
  private pie: any;
  private arc: any;
  private outerArc: any;
  private color: any;
  private radius: number;
  private key: (d: any) => any;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.setupChart();
    
    this.dataService.getBudgetData().subscribe((res: any) => {
      const formattedData = res.myBudget.map((item: any) => {
        return { label: item.title, value: item.budget };
      });

      this.change(formattedData);
    });
  }

  setupChart(): void {
    const element = this.chartContainer.nativeElement;
    const width = 960;
    const height = 450;
    this.radius = Math.min(width, height) / 2;

    this.pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value;
      });

    this.arc = d3.svg.arc()
      .outerRadius(this.radius * 0.8)
      .innerRadius(this.radius * 0.4);

    this.outerArc = d3.svg.arc()
      .innerRadius(this.radius * 0.9)
      .outerRadius(this.radius * 0.9);

    this.svg = d3.select(element).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    this.svg.append("g").attr("class", "slices");
    this.svg.append("g").attr("class", "labels");
    this.svg.append("g").attr("class", "lines");

    this.svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    this.key = (d: any) => d.data.label;

    this.color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    }

  change(data: any[]): void {
    const slice = this.svg.select(".slices").selectAll("path.slice")
      .data(this.pie(data), this.key);

    slice.enter()
      .insert("path")
      .style("fill", (d: any) => this.color(d.data.label))
      .attr("class", "slice");

    slice
      .transition().duration(1000)
      .attrTween("d", (d: any) => {
        // @ts-ignore
        this._current = this._current || d;
        // @ts-ignore
        const interpolate = d3.interpolate(this._current, d);
        // @ts-ignore
        this._current = interpolate(0);
        return (t: any) => this.arc(interpolate(t));
      });

    slice.exit().remove();

    /* ------- TEXT LABELS -------*/
    const text = this.svg.select(".labels").selectAll("text")
      .data(this.pie(data), this.key);

    text.enter()
      .append("text")
      .attr("dy", ".35em")
      .text((d: any) => d.data.label);

    const midAngle = (d: any) => d.startAngle + (d.endAngle - d.startAngle) / 2;

    text.transition().duration(1000)
      .attrTween("transform", (d: any) => {
        // @ts-ignore
        this._current = this._current || d;
        // @ts-ignore
        const interpolate = d3.interpolate(this._current, d);
        // @ts-ignore
        this._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = this.outerArc.centroid(d2);
          pos[0] = this.radius * (midAngle(d2) < Math.PI ? 1 : -1);
          return `translate(${pos})`;
        };
      })
      .styleTween("text-anchor", (d: any) => {
        // @ts-ignore
        this._current = this._current || d;
        // @ts-ignore
        const interpolate = d3.interpolate(this._current, d);
        // @ts-ignore
        this._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          return midAngle(d2) < Math.PI ? "start" : "end";
        };
      });

    text.exit().remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/
    const polyline = this.svg.select(".lines").selectAll("polyline")
      .data(this.pie(data), this.key);

    polyline.enter().append("polyline");

    polyline.transition().duration(1000)
      .attrTween("points", (d: any) => {
        // @ts-ignore
        this._current = this._current || d;
        // @ts-ignore
        const interpolate = d3.interpolate(this._current, d);
        // @ts-ignore
        this._current = interpolate(0);
        return (t: any) => {
          const d2 = interpolate(t);
          const pos = this.outerArc.centroid(d2);
          pos[0] = this.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
          return [this.arc.centroid(d2), this.outerArc.centroid(d2), pos] as any;
        };
      });

    polyline.exit().remove();
  }

  }