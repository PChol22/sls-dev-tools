const contrib = require("blessed-contrib");

class DurationBarChart {
  constructor(application, cloudwatchLogs, isInGridLayout, layout) {
    this.application = application;
    this.cloudwatchLogs = cloudwatchLogs;
    this.isInGridLayout = isInGridLayout;
    this.layout = layout;
    this.chart = this.generateChart();
  }

  generateChart() {
    const durationBarChartOptions = {
      barWidth: 6,
      label: "Lambda Duration (ms) (most recent)",
      barSpacing: 6,
      xOffset: 2,
      maxHeight: 9,
    };
    if (this.isInGridLayout) {
      return this.application.layoutGrid.set(
        4,
        6,
        4,
        3,
        contrib.bar,
        durationBarChartOptions
      );
    }
    const durationBarChart = contrib.bar(durationBarChartOptions);
    if (this.layout) {
      this.layout.append(durationBarChart);
    }
    return durationBarChart;
  }

  setBarChartDataFromEvents(events) {
    const regex = /RequestId:(\s)*(\w|-)*(\s)*Duration:(\s)*(\d|\.)*(\s)*ms/gm;
    let matches = [];
    events.forEach((event) => {
      const match = event.message.match(regex);
      if (match) {
        matches = matches.concat(match);
      }
    });
    const splits = [];
    if (matches !== null) {
      for (let i = 0; i < matches.length; i++) {
        // Split report into fields using tabs (or 4 spaces)
        splits.push(matches[i].split(/\t|\s\s\s\s/));
      }
      this.chart.setData({
        titles: ["1", "2", "3", "4", "5"],
        // Extract numerical value from field by splitting on spaces, and taking second value
        data: splits.map((s) => s[1].split(" ")[1]).slice(-5),
      });
    }
  }

  async updateData() {
    this.setBarChartDataFromEvents(this.application.events);
  }
}

module.exports = {
  DurationBarChart,
};
