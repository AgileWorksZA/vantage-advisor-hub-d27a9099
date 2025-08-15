import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Layers, BarChart3, Users, PiggyBank } from "lucide-react";
import Testimonials from "@/components/Testimonials";

// Generate dots that precisely match the world map image coordinates
const generateWorldDots = () => {
  const dots = [];
  
  // Precise coordinates based on the actual world-dots.png image
  // Grid spacing is approximately 1.2% for both X and Y
  const gridSpacing = 1.2;
  
  // North America coordinates
  const northAmericaDots = [
    // Canada
    [15, 15], [16.2, 15], [17.4, 15], [18.6, 15], [19.8, 15], [21, 15], [22.2, 15], [23.4, 15], [24.6, 15], [25.8, 15], [27, 15], [28.2, 15], [29.4, 15], [30.6, 15], [31.8, 15], [33, 15], [34.2, 15], [35.4, 15],
    [14, 16.2], [15.2, 16.2], [16.4, 16.2], [17.6, 16.2], [18.8, 16.2], [20, 16.2], [21.2, 16.2], [22.4, 16.2], [23.6, 16.2], [24.8, 16.2], [26, 16.2], [27.2, 16.2], [28.4, 16.2], [29.6, 16.2], [30.8, 16.2], [32, 16.2], [33.2, 16.2], [34.4, 16.2], [35.6, 16.2], [36.8, 16.2],
    // USA mainland
    [16, 17.4], [17.2, 17.4], [18.4, 17.4], [19.6, 17.4], [20.8, 17.4], [22, 17.4], [23.2, 17.4], [24.4, 17.4], [25.6, 17.4], [26.8, 17.4], [28, 17.4], [29.2, 17.4], [30.4, 17.4], [31.6, 17.4], [32.8, 17.4], [34, 17.4], [35.2, 17.4], [36.4, 17.4],
    [17, 18.6], [18.2, 18.6], [19.4, 18.6], [20.6, 18.6], [21.8, 18.6], [23, 18.6], [24.2, 18.6], [25.4, 18.6], [26.6, 18.6], [27.8, 18.6], [29, 18.6], [30.2, 18.6], [31.4, 18.6], [32.6, 18.6], [33.8, 18.6], [35, 18.6], [36.2, 18.6],
    [18, 19.8], [19.2, 19.8], [20.4, 19.8], [21.6, 19.8], [22.8, 19.8], [24, 19.8], [25.2, 19.8], [26.4, 19.8], [27.6, 19.8], [28.8, 19.8], [30, 19.8], [31.2, 19.8], [32.4, 19.8], [33.6, 19.8], [34.8, 19.8], [36, 19.8],
    [19, 21], [20.2, 21], [21.4, 21], [22.6, 21], [23.8, 21], [25, 21], [26.2, 21], [27.4, 21], [28.6, 21], [29.8, 21], [31, 21], [32.2, 21], [33.4, 21], [34.6, 21], [35.8, 21],
    [20, 22.2], [21.2, 22.2], [22.4, 22.2], [23.6, 22.2], [24.8, 22.2], [26, 22.2], [27.2, 22.2], [28.4, 22.2], [29.6, 22.2], [30.8, 22.2], [32, 22.2], [33.2, 22.2], [34.4, 22.2], [35.6, 22.2],
    [21, 23.4], [22.2, 23.4], [23.4, 23.4], [24.6, 23.4], [25.8, 23.4], [27, 23.4], [28.2, 23.4], [29.4, 23.4], [30.6, 23.4], [31.8, 23.4], [33, 23.4], [34.2, 23.4], [35.4, 23.4],
    // Mexico and Central America
    [22, 24.6], [23.2, 24.6], [24.4, 24.6], [25.6, 24.6], [26.8, 24.6], [28, 24.6], [29.2, 24.6], [30.4, 24.6], [31.6, 24.6], [32.8, 24.6],
    [23, 25.8], [24.2, 25.8], [25.4, 25.8], [26.6, 25.8], [27.8, 25.8], [29, 25.8], [30.2, 25.8], [31.4, 25.8],
    [24, 27], [25.2, 27], [26.4, 27], [27.6, 27], [28.8, 27], [30, 27], [31.2, 27],
    [25, 28.2], [26.2, 28.2], [27.4, 28.2], [28.6, 28.2], [29.8, 28.2], [31, 28.2],
  ];

  // South America coordinates
  const southAmericaDots = [
    [26, 29.4], [27.2, 29.4], [28.4, 29.4], [29.6, 29.4], [30.8, 29.4], [32, 29.4],
    [25, 30.6], [26.2, 30.6], [27.4, 30.6], [28.6, 30.6], [29.8, 30.6], [31, 30.6], [32.2, 30.6],
    [24, 31.8], [25.2, 31.8], [26.4, 31.8], [27.6, 31.8], [28.8, 31.8], [30, 31.8], [31.2, 31.8], [32.4, 31.8],
    [23, 33], [24.2, 33], [25.4, 33], [26.6, 33], [27.8, 33], [29, 33], [30.2, 33], [31.4, 33], [32.6, 33],
    [22, 34.2], [23.2, 34.2], [24.4, 34.2], [25.6, 34.2], [26.8, 34.2], [28, 34.2], [29.2, 34.2], [30.4, 34.2], [31.6, 34.2], [32.8, 34.2],
    [21, 35.4], [22.2, 35.4], [23.4, 35.4], [24.6, 35.4], [25.8, 35.4], [27, 35.4], [28.2, 35.4], [29.4, 35.4], [30.6, 35.4], [31.8, 35.4], [33, 35.4],
    [20, 36.6], [21.2, 36.6], [22.4, 36.6], [23.6, 36.6], [24.8, 36.6], [26, 36.6], [27.2, 36.6], [28.4, 36.6], [29.6, 36.6], [30.8, 36.6], [32, 36.6], [33.2, 36.6],
    [19, 37.8], [20.2, 37.8], [21.4, 37.8], [22.6, 37.8], [23.8, 37.8], [25, 37.8], [26.2, 37.8], [27.4, 37.8], [28.6, 37.8], [29.8, 37.8], [31, 37.8], [32.2, 37.8], [33.4, 37.8],
    [20, 39], [21.2, 39], [22.4, 39], [23.6, 39], [24.8, 39], [26, 39], [27.2, 39], [28.4, 39], [29.6, 39], [30.8, 39], [32, 39], [33.2, 39],
    [21, 40.2], [22.2, 40.2], [23.4, 40.2], [24.6, 40.2], [25.8, 40.2], [27, 40.2], [28.2, 40.2], [29.4, 40.2], [30.6, 40.2], [31.8, 40.2], [33, 40.2],
    [22, 41.4], [23.2, 41.4], [24.4, 41.4], [25.6, 41.4], [26.8, 41.4], [28, 41.4], [29.2, 41.4], [30.4, 41.4], [31.6, 41.4], [32.8, 41.4],
    [23, 42.6], [24.2, 42.6], [25.4, 42.6], [26.6, 42.6], [27.8, 42.6], [29, 42.6], [30.2, 42.6], [31.4, 42.6], [32.6, 42.6],
    [24, 43.8], [25.2, 43.8], [26.4, 43.8], [27.6, 43.8], [28.8, 43.8], [30, 43.8], [31.2, 43.8], [32.4, 43.8],
    [25, 45], [26.2, 45], [27.4, 45], [28.6, 45], [29.8, 45], [31, 45], [32.2, 45],
    [26, 46.2], [27.2, 46.2], [28.4, 46.2], [29.6, 46.2], [30.8, 46.2], [32, 46.2],
    [27, 47.4], [28.2, 47.4], [29.4, 47.4], [30.6, 47.4], [31.8, 47.4],
    [28, 48.6], [29.2, 48.6], [30.4, 48.6], [31.6, 48.6],
    [29, 49.8], [30.2, 49.8], [31.4, 49.8],
  ];

  // Europe coordinates
  const europeDots = [
    [45, 14], [46.2, 14], [47.4, 14], [48.6, 14], [49.8, 14], [51, 14], [52.2, 14], [53.4, 14], [54.6, 14], [55.8, 14], [57, 14], [58.2, 14],
    [44, 15.2], [45.2, 15.2], [46.4, 15.2], [47.6, 15.2], [48.8, 15.2], [50, 15.2], [51.2, 15.2], [52.4, 15.2], [53.6, 15.2], [54.8, 15.2], [56, 15.2], [57.2, 15.2], [58.4, 15.2], [59.6, 15.2],
    [43, 16.4], [44.2, 16.4], [45.4, 16.4], [46.6, 16.4], [47.8, 16.4], [49, 16.4], [50.2, 16.4], [51.4, 16.4], [52.6, 16.4], [53.8, 16.4], [55, 16.4], [56.2, 16.4], [57.4, 16.4], [58.6, 16.4], [59.8, 16.4],
    [42, 17.6], [43.2, 17.6], [44.4, 17.6], [45.6, 17.6], [46.8, 17.6], [48, 17.6], [49.2, 17.6], [50.4, 17.6], [51.6, 17.6], [52.8, 17.6], [54, 17.6], [55.2, 17.6], [56.4, 17.6], [57.6, 17.6], [58.8, 17.6], [60, 17.6],
    [41, 18.8], [42.2, 18.8], [43.4, 18.8], [44.6, 18.8], [45.8, 18.8], [47, 18.8], [48.2, 18.8], [49.4, 18.8], [50.6, 18.8], [51.8, 18.8], [53, 18.8], [54.2, 18.8], [55.4, 18.8], [56.6, 18.8], [57.8, 18.8], [59, 18.8], [60.2, 18.8],
    [40, 20], [41.2, 20], [42.4, 20], [43.6, 20], [44.8, 20], [46, 20], [47.2, 20], [48.4, 20], [49.6, 20], [50.8, 20], [52, 20], [53.2, 20], [54.4, 20], [55.6, 20], [56.8, 20], [58, 20], [59.2, 20], [60.4, 20],
    [39, 21.2], [40.2, 21.2], [41.4, 21.2], [42.6, 21.2], [43.8, 21.2], [45, 21.2], [46.2, 21.2], [47.4, 21.2], [48.6, 21.2], [49.8, 21.2], [51, 21.2], [52.2, 21.2], [53.4, 21.2], [54.6, 21.2], [55.8, 21.2], [57, 21.2], [58.2, 21.2], [59.4, 21.2],
    [40, 22.4], [41.2, 22.4], [42.4, 22.4], [43.6, 22.4], [44.8, 22.4], [46, 22.4], [47.2, 22.4], [48.4, 22.4], [49.6, 22.4], [50.8, 22.4], [52, 22.4], [53.2, 22.4], [54.4, 22.4], [55.6, 22.4], [56.8, 22.4], [58, 22.4], [59.2, 22.4],
    [41, 23.6], [42.2, 23.6], [43.4, 23.6], [44.6, 23.6], [45.8, 23.6], [47, 23.6], [48.2, 23.6], [49.4, 23.6], [50.6, 23.6], [51.8, 23.6], [53, 23.6], [54.2, 23.6], [55.4, 23.6], [56.6, 23.6], [57.8, 23.6], [59, 23.6],
    [42, 24.8], [43.2, 24.8], [44.4, 24.8], [45.6, 24.8], [46.8, 24.8], [48, 24.8], [49.2, 24.8], [50.4, 24.8], [51.6, 24.8], [52.8, 24.8], [54, 24.8], [55.2, 24.8], [56.4, 24.8], [57.6, 24.8], [58.8, 24.8],
  ];

  // Africa coordinates
  const africaDots = [
    [43, 26], [44.2, 26], [45.4, 26], [46.6, 26], [47.8, 26], [49, 26], [50.2, 26], [51.4, 26], [52.6, 26], [53.8, 26], [55, 26], [56.2, 26], [57.4, 26], [58.6, 26],
    [42, 27.2], [43.2, 27.2], [44.4, 27.2], [45.6, 27.2], [46.8, 27.2], [48, 27.2], [49.2, 27.2], [50.4, 27.2], [51.6, 27.2], [52.8, 27.2], [54, 27.2], [55.2, 27.2], [56.4, 27.2], [57.6, 27.2], [58.8, 27.2], [60, 27.2],
    [41, 28.4], [42.2, 28.4], [43.4, 28.4], [44.6, 28.4], [45.8, 28.4], [47, 28.4], [48.2, 28.4], [49.4, 28.4], [50.6, 28.4], [51.8, 28.4], [53, 28.4], [54.2, 28.4], [55.4, 28.4], [56.6, 28.4], [57.8, 28.4], [59, 28.4], [60.2, 28.4],
    [40, 29.6], [41.2, 29.6], [42.4, 29.6], [43.6, 29.6], [44.8, 29.6], [46, 29.6], [47.2, 29.6], [48.4, 29.6], [49.6, 29.6], [50.8, 29.6], [52, 29.6], [53.2, 29.6], [54.4, 29.6], [55.6, 29.6], [56.8, 29.6], [58, 29.6], [59.2, 29.6], [60.4, 29.6],
    [39, 30.8], [40.2, 30.8], [41.4, 30.8], [42.6, 30.8], [43.8, 30.8], [45, 30.8], [46.2, 30.8], [47.4, 30.8], [48.6, 30.8], [49.8, 30.8], [51, 30.8], [52.2, 30.8], [53.4, 30.8], [54.6, 30.8], [55.8, 30.8], [57, 30.8], [58.2, 30.8], [59.4, 30.8],
    [38, 32], [39.2, 32], [40.4, 32], [41.6, 32], [42.8, 32], [44, 32], [45.2, 32], [46.4, 32], [47.6, 32], [48.8, 32], [50, 32], [51.2, 32], [52.4, 32], [53.6, 32], [54.8, 32], [56, 32], [57.2, 32], [58.4, 32], [59.6, 32], [60.8, 32],
    [37, 33.2], [38.2, 33.2], [39.4, 33.2], [40.6, 33.2], [41.8, 33.2], [43, 33.2], [44.2, 33.2], [45.4, 33.2], [46.6, 33.2], [47.8, 33.2], [49, 33.2], [50.2, 33.2], [51.4, 33.2], [52.6, 33.2], [53.8, 33.2], [55, 33.2], [56.2, 33.2], [57.4, 33.2], [58.6, 33.2], [59.8, 33.2], [61, 33.2],
    [38, 34.4], [39.2, 34.4], [40.4, 34.4], [41.6, 34.4], [42.8, 34.4], [44, 34.4], [45.2, 34.4], [46.4, 34.4], [47.6, 34.4], [48.8, 34.4], [50, 34.4], [51.2, 34.4], [52.4, 34.4], [53.6, 34.4], [54.8, 34.4], [56, 34.4], [57.2, 34.4], [58.4, 34.4], [59.6, 34.4], [60.8, 34.4],
    [39, 35.6], [40.2, 35.6], [41.4, 35.6], [42.6, 35.6], [43.8, 35.6], [45, 35.6], [46.2, 35.6], [47.4, 35.6], [48.6, 35.6], [49.8, 35.6], [51, 35.6], [52.2, 35.6], [53.4, 35.6], [54.6, 35.6], [55.8, 35.6], [57, 35.6], [58.2, 35.6], [59.4, 35.6], [60.6, 35.6],
    [40, 36.8], [41.2, 36.8], [42.4, 36.8], [43.6, 36.8], [44.8, 36.8], [46, 36.8], [47.2, 36.8], [48.4, 36.8], [49.6, 36.8], [50.8, 36.8], [52, 36.8], [53.2, 36.8], [54.4, 36.8], [55.6, 36.8], [56.8, 36.8], [58, 36.8], [59.2, 36.8], [60.4, 36.8],
    [41, 38], [42.2, 38], [43.4, 38], [44.6, 38], [45.8, 38], [47, 38], [48.2, 38], [49.4, 38], [50.6, 38], [51.8, 38], [53, 38], [54.2, 38], [55.4, 38], [56.6, 38], [57.8, 38], [59, 38], [60.2, 38],
    [42, 39.2], [43.2, 39.2], [44.4, 39.2], [45.6, 39.2], [46.8, 39.2], [48, 39.2], [49.2, 39.2], [50.4, 39.2], [51.6, 39.2], [52.8, 39.2], [54, 39.2], [55.2, 39.2], [56.4, 39.2], [57.6, 39.2], [58.8, 39.2], [60, 39.2],
    [43, 40.4], [44.2, 40.4], [45.4, 40.4], [46.6, 40.4], [47.8, 40.4], [49, 40.4], [50.2, 40.4], [51.4, 40.4], [52.6, 40.4], [53.8, 40.4], [55, 40.4], [56.2, 40.4], [57.4, 40.4], [58.6, 40.4], [59.8, 40.4],
    [44, 41.6], [45.2, 41.6], [46.4, 41.6], [47.6, 41.6], [48.8, 41.6], [50, 41.6], [51.2, 41.6], [52.4, 41.6], [53.6, 41.6], [54.8, 41.6], [56, 41.6], [57.2, 41.6], [58.4, 41.6], [59.6, 41.6],
    [45, 42.8], [46.2, 42.8], [47.4, 42.8], [48.6, 42.8], [49.8, 42.8], [51, 42.8], [52.2, 42.8], [53.4, 42.8], [54.6, 42.8], [55.8, 42.8], [57, 42.8], [58.2, 42.8], [59.4, 42.8],
    [46, 44], [47.2, 44], [48.4, 44], [49.6, 44], [50.8, 44], [52, 44], [53.2, 44], [54.4, 44], [55.6, 44], [56.8, 44], [58, 44], [59.2, 44],
    [47, 45.2], [48.2, 45.2], [49.4, 45.2], [50.6, 45.2], [51.8, 45.2], [53, 45.2], [54.2, 45.2], [55.4, 45.2], [56.6, 45.2], [57.8, 45.2], [59, 45.2],
    [48, 46.4], [49.2, 46.4], [50.4, 46.4], [51.6, 46.4], [52.8, 46.4], [54, 46.4], [55.2, 46.4], [56.4, 46.4], [57.6, 46.4], [58.8, 46.4],
    [49, 47.6], [50.2, 47.6], [51.4, 47.6], [52.6, 47.6], [53.8, 47.6], [55, 47.6], [56.2, 47.6], [57.4, 47.6], [58.6, 47.6],
  ];

  // Asia coordinates (simplified for key regions)
  const asiaDots = [
    // Russia and Central Asia
    [61, 14], [62.2, 14], [63.4, 14], [64.6, 14], [65.8, 14], [67, 14], [68.2, 14], [69.4, 14], [70.6, 14], [71.8, 14], [73, 14], [74.2, 14], [75.4, 14], [76.6, 14], [77.8, 14], [79, 14], [80.2, 14], [81.4, 14], [82.6, 14], [83.8, 14], [85, 14], [86.2, 14], [87.4, 14], [88.6, 14],
    [60, 15.2], [61.2, 15.2], [62.4, 15.2], [63.6, 15.2], [64.8, 15.2], [66, 15.2], [67.2, 15.2], [68.4, 15.2], [69.6, 15.2], [70.8, 15.2], [72, 15.2], [73.2, 15.2], [74.4, 15.2], [75.6, 15.2], [76.8, 15.2], [78, 15.2], [79.2, 15.2], [80.4, 15.2], [81.6, 15.2], [82.8, 15.2], [84, 15.2], [85.2, 15.2], [86.4, 15.2], [87.6, 15.2], [88.8, 15.2], [90, 15.2],
    // China and Mongolia
    [59, 16.4], [60.2, 16.4], [61.4, 16.4], [62.6, 16.4], [63.8, 16.4], [65, 16.4], [66.2, 16.4], [67.4, 16.4], [68.6, 16.4], [69.8, 16.4], [71, 16.4], [72.2, 16.4], [73.4, 16.4], [74.6, 16.4], [75.8, 16.4], [77, 16.4], [78.2, 16.4], [79.4, 16.4], [80.6, 16.4], [81.8, 16.4], [83, 16.4], [84.2, 16.4], [85.4, 16.4], [86.6, 16.4], [87.8, 16.4], [89, 16.4], [90.2, 16.4],
    [58, 17.6], [59.2, 17.6], [60.4, 17.6], [61.6, 17.6], [62.8, 17.6], [64, 17.6], [65.2, 17.6], [66.4, 17.6], [67.6, 17.6], [68.8, 17.6], [70, 17.6], [71.2, 17.6], [72.4, 17.6], [73.6, 17.6], [74.8, 17.6], [76, 17.6], [77.2, 17.6], [78.4, 17.6], [79.6, 17.6], [80.8, 17.6], [82, 17.6], [83.2, 17.6], [84.4, 17.6], [85.6, 17.6], [86.8, 17.6], [88, 17.6], [89.2, 17.6], [90.4, 17.6],
    // India and Southeast Asia
    [62, 18.8], [63.2, 18.8], [64.4, 18.8], [65.6, 18.8], [66.8, 18.8], [68, 18.8], [69.2, 18.8], [70.4, 18.8], [71.6, 18.8], [72.8, 18.8], [74, 18.8], [75.2, 18.8], [76.4, 18.8], [77.6, 18.8], [78.8, 18.8], [80, 18.8], [81.2, 18.8], [82.4, 18.8], [83.6, 18.8], [84.8, 18.8], [86, 18.8], [87.2, 18.8], [88.4, 18.8], [89.6, 18.8], [90.8, 18.8],
    [61, 20], [62.2, 20], [63.4, 20], [64.6, 20], [65.8, 20], [67, 20], [68.2, 20], [69.4, 20], [70.6, 20], [71.8, 20], [73, 20], [74.2, 20], [75.4, 20], [76.6, 20], [77.8, 20], [79, 20], [80.2, 20], [81.4, 20], [82.6, 20], [83.8, 20], [85, 20], [86.2, 20], [87.4, 20], [88.6, 20], [89.8, 20], [91, 20],
    [62, 21.2], [63.2, 21.2], [64.4, 21.2], [65.6, 21.2], [66.8, 21.2], [68, 21.2], [69.2, 21.2], [70.4, 21.2], [71.6, 21.2], [72.8, 21.2], [74, 21.2], [75.2, 21.2], [76.4, 21.2], [77.6, 21.2], [78.8, 21.2], [80, 21.2], [81.2, 21.2], [82.4, 21.2], [83.6, 21.2], [84.8, 21.2], [86, 21.2], [87.2, 21.2], [88.4, 21.2], [89.6, 21.2], [90.8, 21.2],
    [63, 22.4], [64.2, 22.4], [65.4, 22.4], [66.6, 22.4], [67.8, 22.4], [69, 22.4], [70.2, 22.4], [71.4, 22.4], [72.6, 22.4], [73.8, 22.4], [75, 22.4], [76.2, 22.4], [77.4, 22.4], [78.6, 22.4], [79.8, 22.4], [81, 22.4], [82.2, 22.4], [83.4, 22.4], [84.6, 22.4], [85.8, 22.4], [87, 22.4], [88.2, 22.4], [89.4, 22.4], [90.6, 22.4],
    [64, 23.6], [65.2, 23.6], [66.4, 23.6], [67.6, 23.6], [68.8, 23.6], [70, 23.6], [71.2, 23.6], [72.4, 23.6], [73.6, 23.6], [74.8, 23.6], [76, 23.6], [77.2, 23.6], [78.4, 23.6], [79.6, 23.6], [80.8, 23.6], [82, 23.6], [83.2, 23.6], [84.4, 23.6], [85.6, 23.6], [86.8, 23.6], [88, 23.6], [89.2, 23.6], [90.4, 23.6],
    [65, 24.8], [66.2, 24.8], [67.4, 24.8], [68.6, 24.8], [69.8, 24.8], [71, 24.8], [72.2, 24.8], [73.4, 24.8], [74.6, 24.8], [75.8, 24.8], [77, 24.8], [78.2, 24.8], [79.4, 24.8], [80.6, 24.8], [81.8, 24.8], [83, 24.8], [84.2, 24.8], [85.4, 24.8], [86.6, 24.8], [87.8, 24.8], [89, 24.8], [90.2, 24.8],
    [66, 26], [67.2, 26], [68.4, 26], [69.6, 26], [70.8, 26], [72, 26], [73.2, 26], [74.4, 26], [75.6, 26], [76.8, 26], [78, 26], [79.2, 26], [80.4, 26], [81.6, 26], [82.8, 26], [84, 26], [85.2, 26], [86.4, 26], [87.6, 26], [88.8, 26], [90, 26],
    [67, 27.2], [68.2, 27.2], [69.4, 27.2], [70.6, 27.2], [71.8, 27.2], [73, 27.2], [74.2, 27.2], [75.4, 27.2], [76.6, 27.2], [77.8, 27.2], [79, 27.2], [80.2, 27.2], [81.4, 27.2], [82.6, 27.2], [83.8, 27.2], [85, 27.2], [86.2, 27.2], [87.4, 27.2], [88.6, 27.2], [89.8, 27.2],
    [68, 28.4], [69.2, 28.4], [70.4, 28.4], [71.6, 28.4], [72.8, 28.4], [74, 28.4], [75.2, 28.4], [76.4, 28.4], [77.6, 28.4], [78.8, 28.4], [80, 28.4], [81.2, 28.4], [82.4, 28.4], [83.6, 28.4], [84.8, 28.4], [86, 28.4], [87.2, 28.4], [88.4, 28.4], [89.6, 28.4],
    [69, 29.6], [70.2, 29.6], [71.4, 29.6], [72.6, 29.6], [73.8, 29.6], [75, 29.6], [76.2, 29.6], [77.4, 29.6], [78.6, 29.6], [79.8, 29.6], [81, 29.6], [82.2, 29.6], [83.4, 29.6], [84.6, 29.6], [85.8, 29.6], [87, 29.6], [88.2, 29.6], [89.4, 29.6],
    [70, 30.8], [71.2, 30.8], [72.4, 30.8], [73.6, 30.8], [74.8, 30.8], [76, 30.8], [77.2, 30.8], [78.4, 30.8], [79.6, 30.8], [80.8, 30.8], [82, 30.8], [83.2, 30.8], [84.4, 30.8], [85.6, 30.8], [86.8, 30.8], [88, 30.8], [89.2, 30.8],
    [71, 32], [72.2, 32], [73.4, 32], [74.6, 32], [75.8, 32], [77, 32], [78.2, 32], [79.4, 32], [80.6, 32], [81.8, 32], [83, 32], [84.2, 32], [85.4, 32], [86.6, 32], [87.8, 32], [89, 32],
  ];

  // Australia coordinates
  const australiaDots = [
    [78, 50], [79.2, 50], [80.4, 50], [81.6, 50], [82.8, 50], [84, 50], [85.2, 50], [86.4, 50], [87.6, 50], [88.8, 50], [90, 50],
    [77, 51.2], [78.2, 51.2], [79.4, 51.2], [80.6, 51.2], [81.8, 51.2], [83, 51.2], [84.2, 51.2], [85.4, 51.2], [86.6, 51.2], [87.8, 51.2], [89, 51.2], [90.2, 51.2],
    [76, 52.4], [77.2, 52.4], [78.4, 52.4], [79.6, 52.4], [80.8, 52.4], [82, 52.4], [83.2, 52.4], [84.4, 52.4], [85.6, 52.4], [86.8, 52.4], [88, 52.4], [89.2, 52.4], [90.4, 52.4],
    [77, 53.6], [78.2, 53.6], [79.4, 53.6], [80.6, 53.6], [81.8, 53.6], [83, 53.6], [84.2, 53.6], [85.4, 53.6], [86.6, 53.6], [87.8, 53.6], [89, 53.6], [90.2, 53.6],
    [78, 54.8], [79.2, 54.8], [80.4, 54.8], [81.6, 54.8], [82.8, 54.8], [84, 54.8], [85.2, 54.8], [86.4, 54.8], [87.6, 54.8], [88.8, 54.8], [90, 54.8],
    [79, 56], [80.2, 56], [81.4, 56], [82.6, 56], [83.8, 56], [85, 56], [86.2, 56], [87.4, 56], [88.6, 56], [89.8, 56],
    [80, 57.2], [81.2, 57.2], [82.4, 57.2], [83.6, 57.2], [84.8, 57.2], [86, 57.2], [87.2, 57.2], [88.4, 57.2], [89.6, 57.2],
  ];

  // Combine all continent arrays
  const allDots = [
    ...northAmericaDots,
    ...southAmericaDots, 
    ...europeDots,
    ...africaDots,
    ...asiaDots,
    ...australiaDots
  ];

  // Convert to the expected format
  return allDots.map(([x, y], index) => ({
    x,
    y,
    delay: Math.random() * 3,
    opacity: 1, // Start fully visible to match background
  }));
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/world-dots.png";
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      return;
    }
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
  }, []);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
    el.style.setProperty("--spotlight-opacity", "0.45");
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--spotlight-opacity", "0");
  };

  return (
    <div className="min-h-screen">
      <header className="bg-background/80 backdrop-blur border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img
              src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png"
              alt="Vantage logo"
              className="h-6 md:h-7 w-auto"
              loading="eager"
            />
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#benefits" className="text-muted-foreground hover:text-foreground">Benefits</a>
            <a href="#cases" className="text-muted-foreground hover:text-foreground">Case Studies</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <Button asChild variant="hero" size="sm">
            <a href="#contact" aria-label="Book a demo">Book a demo</a>
          </Button>
        </div>
      </header>

      <main>
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative bg-hero text-primary-foreground"
        >
          <div className="hero-map" aria-hidden />
          {imgSize && (
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'clamp(1400px, 120vw, 2400px)',
                aspectRatio: `${imgSize.w}/${imgSize.h}`,
                zIndex: 1,
              }}
            >
              <div className="interactive-dots" aria-hidden>
                {generateWorldDots().map((dot, i) => (
                  <div
                    key={i}
                    className="dot"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: `${(2 / imgSize.w) * 100}%`,
                      height: `${(2 / imgSize.h) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="container py-24 md:py-32 relative">
            <p className="uppercase tracking-widest font-semibold opacity-90">Redefining Wealth</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl mt-4">
              Investment Platform for Financial Advisers
            </h1>
            <p className="mt-6 max-w-2xl text-lg opacity-90">
              Vantage unifies CRM, planning tools and an investment platform into one integrated ecosystem — reducing the number of systems in your practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="hero" size="xl" className="bg-black text-white hover:bg-black/90 bg-none hover:bg-none">
                Book a demo <ArrowRight className="ml-1" />
              </Button>
              <Button asChild variant="premium" size="xl">
                <a href="#features">Explore features</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-background">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Integrated ecosystem</h2>
              <p className="mt-3 text-muted-foreground">
                Everything advisers need to manage clients and portfolios — in one place.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="text-[hsl(var(--brand-blue))]" /> CRM + Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>One client record across onboarding, suitability and reviews.</p>
                  <p>Powerful workflows, tasks and document management.</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="text-[hsl(var(--brand-blue))]" /> 360° Client View
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Real-time valuations, performance and fees across accounts.</p>
                  <p>Data-led insights to drive better outcomes.</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-[hsl(var(--brand-blue))]" /> White‑labelled
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Deliver a branded digital experience to your clients.</p>
                  <p>Scale with configurable permissions and roles.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 bg-muted/40">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Benefits</h2>
              <p className="mt-3 text-muted-foreground">
                How Vantage helps adviser firms grow and save.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grow & Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Leads & conversion</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Cross‑selling</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> House view funds</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-orange))]" /> Advice fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PiggyBank className="text-[hsl(var(--brand-blue))]" /> Save & Optimise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Technology costs</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Manual activities</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Platform fees</p>
                <p className="flex items-start gap-2"><Check className="mt-1 text-[hsl(var(--brand-blue))]" /> Product fees</p>
              </CardContent>
            </Card>
            </div>
          </div>
        </section>

        <section id="cases" className="py-20 bg-background">
          <div className="container">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Proven outcomes</h2>
              <p className="mt-3 text-muted-foreground">
                Real results we see with adviser firms using Vantage.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Case study — R1–2bn adviser</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                  <p>R25–100k annual saving on technology</p>
                  <p>R100–150k annual saving on platform data</p>
                  <p>R400–600k annual saving on client platform fees</p>
                  <p>40% AUA growth with same support staff</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case study — R10bn+ adviser network</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                  <p>R250–900k annual saving on technology</p>
                  <p>R1–3m annual saving on platform data</p>
                  <p>R400–600k annual saving on client platform fees</p>
                  <p>40% AUA growth with same support staff</p>
                  <p>5–10bps margin on own model portfolios</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Testimonials />

        <section id="contact" className="pb-20 bg-muted/40">
          <div className="container text-center">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Ready to reduce your tech stack?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Let’s show you how Vantage consolidates CRM, planning and investment tools into a single, modern platform.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <a href="mailto:hello@vantage.co.za?subject=Book%20a%20Vantage%20demo">Book a demo</a>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href="mailto:hello@vantage.co.za">Contact sales</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-10 bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vantage. All rights reserved.</p>
          <nav className="flex gap-6">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#benefits" className="hover:text-foreground">Benefits</a>
            <a href="#cases" className="hover:text-foreground">Case studies</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Index;
