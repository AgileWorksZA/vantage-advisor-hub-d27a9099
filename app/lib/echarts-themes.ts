// Custom ECharts themes matching the Vantage design system
// All colors use HSL format consistent with index.css

export const lightTheme = {
  color: [
    'hsl(180, 70%, 45%)',   // Brand teal
    'hsl(45, 93%, 47%)',    // Brand yellow/gold
    'hsl(210, 70%, 50%)',   // Brand blue
    'hsl(142, 76%, 36%)',   // Success green
    'hsl(280, 65%, 50%)',   // Purple
    'hsl(0, 70%, 50%)',     // Red
    'hsl(18, 86%, 56%)',    // Brand orange
    'hsl(24, 92%, 62%)',    // Brand peach
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: 'hsl(222.2, 84%, 4.9%)',
    fontFamily: 'Manrope, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  title: {
    textStyle: {
      color: 'hsl(222.2, 84%, 4.9%)',
    },
  },
  line: {
    itemStyle: {
      borderWidth: 2,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 6,
    symbol: 'circle',
    smooth: true,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderRadius: [4, 4, 0, 0],
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: 'hsl(214.3, 31.8%, 91.4%)',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'hsl(215.4, 16.3%, 46.9%)',
      fontSize: 10,
    },
    splitLine: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'hsl(215.4, 16.3%, 46.9%)',
      fontSize: 10,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'hsl(214.3, 31.8%, 91.4%)',
        type: 'dashed',
      },
    },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'hsl(214.3, 31.8%, 91.4%)',
    borderWidth: 1,
    textStyle: {
      color: 'hsl(222.2, 84%, 4.9%)',
      fontSize: 12,
    },
    extraCssText: 'backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border-radius: 8px;',
  },
  legend: {
    textStyle: {
      color: 'hsl(215.4, 16.3%, 46.9%)',
      fontSize: 11,
    },
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  dataZoom: {
    backgroundColor: 'transparent',
    dataBackgroundColor: 'hsl(214.3, 31.8%, 91.4%)',
    fillerColor: 'hsla(180, 70%, 45%, 0.2)',
    handleColor: 'hsl(180, 70%, 45%)',
    handleSize: '100%',
    textStyle: {
      color: 'hsl(215.4, 16.3%, 46.9%)',
    },
  },
};

export const darkTheme = {
  color: [
    'hsl(180, 70%, 50%)',   // Brand teal (slightly brighter for dark mode)
    'hsl(45, 93%, 52%)',    // Brand yellow/gold
    'hsl(210, 70%, 55%)',   // Brand blue
    'hsl(142, 76%, 42%)',   // Success green
    'hsl(280, 65%, 55%)',   // Purple
    'hsl(0, 70%, 55%)',     // Red
    'hsl(18, 86%, 60%)',    // Brand orange
    'hsl(24, 92%, 65%)',    // Brand peach
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: 'hsl(210, 40%, 98%)',
    fontFamily: 'Manrope, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  title: {
    textStyle: {
      color: 'hsl(210, 40%, 98%)',
    },
  },
  line: {
    itemStyle: {
      borderWidth: 2,
    },
    lineStyle: {
      width: 2,
    },
    symbolSize: 6,
    symbol: 'circle',
    smooth: true,
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderRadius: [4, 4, 0, 0],
    },
  },
  pie: {
    itemStyle: {
      borderWidth: 0,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: 'hsl(217.2, 32.6%, 17.5%)',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'hsl(215, 20.2%, 65.1%)',
      fontSize: 10,
    },
    splitLine: {
      show: false,
    },
  },
  valueAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'hsl(215, 20.2%, 65.1%)',
      fontSize: 10,
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'hsl(217.2, 32.6%, 17.5%)',
        type: 'dashed',
      },
    },
  },
  tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    textStyle: {
      color: 'hsl(210, 40%, 98%)',
      fontSize: 12,
    },
    extraCssText: 'backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); border-radius: 8px;',
  },
  legend: {
    textStyle: {
      color: 'hsl(215, 20.2%, 65.1%)',
      fontSize: 11,
    },
    icon: 'roundRect',
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 16,
  },
  dataZoom: {
    backgroundColor: 'transparent',
    dataBackgroundColor: 'hsl(217.2, 32.6%, 17.5%)',
    fillerColor: 'hsla(180, 70%, 50%, 0.3)',
    handleColor: 'hsl(180, 70%, 50%)',
    handleSize: '100%',
    textStyle: {
      color: 'hsl(215, 20.2%, 65.1%)',
    },
  },
};
