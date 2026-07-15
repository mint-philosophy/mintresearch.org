(function (root) {
  'use strict';

  var referenceViewport = Object.freeze({
    width: 2560,
    height: 1080,
    tickerHeight: 40,
    navigationHeight: 64,
    slideHeight: 976
  });

  function scaleForViewport(width, slideHeight, readabilityFloor) {
    var floor = Number.isFinite(readabilityFloor)
      ? Math.max(0, Math.min(1, readabilityFloor))
      : 0;
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(slideHeight) || slideHeight <= 0) {
      return 1;
    }

    var proportional = Math.min(
      1,
      width / referenceViewport.width,
      slideHeight / referenceViewport.slideHeight
    );
    var stepped = Math.floor((proportional + 1e-9) * 100) / 100;
    return Math.min(1, Math.max(floor, stepped));
  }

  function compensatedFontSize(sourceFontSize, scale, minimumRenderedSize) {
    if (!Number.isFinite(sourceFontSize) || sourceFontSize <= 0) return sourceFontSize;
    if (!Number.isFinite(scale) || scale <= 0) return sourceFontSize;
    if (!Number.isFinite(minimumRenderedSize) || minimumRenderedSize <= 0) return sourceFontSize;
    return Math.max(sourceFontSize, minimumRenderedSize / scale);
  }

  root.MintFdcFitMath = Object.freeze({
    referenceViewport: referenceViewport,
    scaleForViewport: scaleForViewport,
    compensatedFontSize: compensatedFontSize
  });
})(typeof window === 'undefined' ? globalThis : window);
